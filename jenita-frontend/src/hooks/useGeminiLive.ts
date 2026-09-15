"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getWebSocketURL } from "@/lib/api";
import { toast } from "react-hot-toast";

export type LiveConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export interface TranscriptMessage {
  id: string;
  speaker: "user" | "jenita" | "system";
  text: string;
  toolCall?: {
    name: string;
    result?: unknown;
  };
  timestamp: number;
}

interface UseGeminiLiveOptions {
  onTaskUpdated?: () => void;
}

export function useGeminiLive({ onTaskUpdated }: UseGeminiLiveOptions = {}) {
  const CONSENT_KEY = "jenita_voice_consent";

  const hasVoiceConsent = useCallback(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(CONSENT_KEY) === "granted";
  }, []);

  const [status, setStatus] = useState<LiveConnectionStatus>("disconnected");
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [statusMessage, setStatusMessage] = useState("");
  const [isMicActive, setIsMicActive] = useState(false);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectRef = useRef<(() => void) | null>(null);
  const shouldKeepConnectedRef = useRef(false);

  // Initialize or resume audio playback context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const BrowserWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
      const AudioCtx = window.AudioContext || BrowserWindow.webkitAudioContext;
      if (!AudioCtx) {
        throw new Error("Web Audio API is not available in this browser");
      }
      audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Play queued PCM 24kHz audio chunks from Gemini
  const playPcmChunk = useCallback((base64Data: string) => {
    try {
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert 16-bit PCM to float [-1.0, 1.0]
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const ctx = getAudioContext();
      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      const startTime = Math.max(now, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;
    } catch (e) {
      console.warn("Audio decode error:", e);
    }
  }, [getAudioContext]);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    shouldKeepConnectedRef.current = true;
    setStatus("connecting");
    setStatusMessage("Connecting to Jenita voice server...");

    try {
      const url = getWebSocketURL();
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        setReconnectAttempt(0);
        setStatusMessage("Voice session live and listening");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "connection_status") {
            if (msg.status === "reconnecting") {
              setStatus("reconnecting");
              setReconnectAttempt(msg.attempt || 1);
              setMaxAttempts(msg.max_attempts || 5);
              setStatusMessage(msg.message || "Upstream Gemini Live reconnecting with exponential backoff...");
            } else if (msg.status === "connected") {
              setStatus("connected");
              setStatusMessage(msg.message || "Connected to voice assistant");
            } else if (msg.status === "error") {
              setStatus("error");
              setStatusMessage(msg.message || "Connection error");
            }
            return;
          }

          if (msg.type === "tool_call_executed") {
            const toolMsg = msg.result?.message || `Executed ${msg.tool}`;
            setMessages((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                speaker: "system",
                text: `⚡ ${toolMsg}`,
                toolCall: { name: msg.tool, result: msg.result },
                timestamp: Date.now(),
              },
            ]);
            toast.success(toolMsg);
            if (onTaskUpdated) onTaskUpdated();
            return;
          }

          if (msg.type === "transcript") {
            setMessages((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                speaker: msg.speaker,
                text: msg.text,
                timestamp: Date.now(),
              },
            ]);
            return;
          }

          if (msg.serverContent?.modelTurn?.parts) {
            for (const part of msg.serverContent.modelTurn.parts) {
              if (part.inlineData?.data) {
                playPcmChunk(part.inlineData.data);
              }
              if (part.text) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Math.random().toString(),
                    speaker: "jenita",
                    text: part.text,
                    timestamp: Date.now(),
                  },
                ]);
              }
            }
          }
        } catch (err) {
          console.error("Error handling WS message:", err);
        }
      };

      ws.onerror = () => {
        // ws.onclose will trigger next
      };

      ws.onclose = (event) => {
        if (!shouldKeepConnectedRef.current) {
          setStatus("disconnected");
          setStatusMessage("Voice session ended");
          return;
        }

        setStatus("reconnecting");
        setReconnectAttempt((prev) => {
          const next = prev + 1;
          if (next <= 5) {
            const delay = Math.min(1000 * Math.pow(2, next - 1), 16000);
            setStatusMessage(`Disconnected (${event.reason || "Connection dropped"}). Retrying in ${(delay / 1000).toFixed(0)}s (Attempt ${next}/5)...`);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectRef.current?.();
            }, delay);
          } else {
            setStatus("error");
            setStatusMessage("Connection lost. Please tap Reconnect to restart.");
          }
          return next;
        });
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to initialize WebSocket";
      setStatus("error");
      setStatusMessage(message);
    }
  }, [onTaskUpdated, playPcmChunk]);

  useEffect(() => {
    reconnectRef.current = connect;
  }, [connect]);

  const stopMic = useCallback(() => {
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    setIsMicActive(false);
    setAudioLevel(0);
  }, []);

  const disconnect = useCallback(() => {
    shouldKeepConnectedRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopMic();
    setStatus("disconnected");
    setStatusMessage("Disconnected");
    setReconnectAttempt(0);
  }, [stopMic]);

  // Send typed text prompt to voice agent
  const sendText = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Voice assistant is not connected. Connecting now...");
      connect();
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        speaker: "user",
        text,
        timestamp: Date.now(),
      },
    ]);

    const payload = {
      clientContent: {
        turns: [
          {
            role: "user",
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      },
      text,
    };

    wsRef.current.send(JSON.stringify(payload));
  }, [connect]);

  // Start microphone streaming (PCM 16kHz)
  const startMic = useCallback(async () => {
    if (!hasVoiceConsent()) {
      toast.error("Please approve voice consent before using the microphone.");
      return;
    }

    try {
      getAudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      const BrowserWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
      const AudioCtx = window.AudioContext || BrowserWindow.webkitAudioContext;
      if (!AudioCtx) {
        throw new Error("Web Audio API is not available in this browser");
      }
      const captureCtx = new AudioCtx({ sampleRate: 16000 });
      const micSource = captureCtx.createMediaStreamSource(stream);

      // ScriptProcessor for real-time PCM chunk extraction
      const processor = captureCtx.createScriptProcessor(4096, 1, 1);
      processorNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          sum += Math.abs(s);
        }

        // Calculate audio visualizer level (0 - 100)
        const avg = sum / inputData.length;
        setAudioLevel(Math.min(100, Math.round(avg * 400)));

        // Base64 encode PCM 16-bit
        const bytes = new Uint8Array(pcm16.buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = window.btoa(binary);

        // Stream real-time input to Gemini Live
        const audioMsg = {
          realtimeInput: {
            mediaChunks: [
              {
                mimeType: "audio/pcm;rate=16000",
                data: base64Audio,
              },
            ],
          },
        };
        wsRef.current.send(JSON.stringify(audioMsg));
      };

      micSource.connect(processor);
      processor.connect(captureCtx.destination);
      setIsMicActive(true);
      toast.success("Microphone active — speak to Jenita");
    } catch (err: unknown) {
      toast.error("Microphone access denied or unavailable");
      console.error("Mic error:", err);
    }
  }, [getAudioContext, hasVoiceConsent]);

  // Toggle mic
  const toggleMic = useCallback(() => {
    if (isMicActive) {
      stopMic();
    } else {
      if (status !== "connected") {
        connect();
      }
      startMic();
    }
  }, [isMicActive, status, connect, startMic, stopMic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldKeepConnectedRef.current = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
      stopMic();
    };
  }, [stopMic]);

  return {
    status,
    reconnectAttempt,
    maxAttempts,
    statusMessage,
    isMicActive,
    audioLevel,
    messages,
    connect,
    disconnect,
    toggleMic,
    sendText,
  };
}
