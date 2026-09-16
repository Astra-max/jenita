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

  const requestMicPermission = useCallback(async () => {
    if (typeof window === "undefined") return false;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone API is not available in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      stream.getTracks().forEach((track) => track.stop());
      localStorage.setItem(CONSENT_KEY, "granted");
      return true;
    } catch (error) {
      localStorage.setItem(CONSENT_KEY, "denied");
      console.error("Microphone permission denied:", error);
      toast.error("Microphone permission is required to use Jenita by voice.");
      return false;
    }
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
  const captureContextRef = useRef<AudioContext | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectRef = useRef<(() => void) | null>(null);
  const shouldKeepConnectedRef = useRef(false);

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

  const playPcmChunk = useCallback((base64Data: string) => {
    try {
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

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

  const speakText = useCallback((text: string) => {
    if (typeof window === "undefined" || !text || !text.trim()) return;
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.lang = "en-US";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.warn("Speech synthesis unavailable:", error);
    }
  }, []);

  const connect = useCallback(() => {
    return new Promise<WebSocket | null>((resolve) => {
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        resolve(wsRef.current);
        return;
      }

      shouldKeepConnectedRef.current = true;
      setStatus("connecting");
      setStatusMessage("Connecting to Jenita voice server...");

      try {
        const ws = new WebSocket(getWebSocketURL());
        wsRef.current = ws;

        ws.onopen = () => {
          setStatus("connected");
          setReconnectAttempt(0);
          setStatusMessage("Voice session live and listening");
          resolve(ws);
        };

        ws.onmessage = (event) => {
          (async () => {
            try {
              let raw: unknown = event.data;
              if (raw instanceof Blob) {
                raw = await raw.text();
              } else if (raw instanceof ArrayBuffer) {
                raw = new TextDecoder().decode(new Uint8Array(raw));
              }

              const msg = typeof raw === "string" ? JSON.parse(raw) : raw;

              if (msg && typeof msg === "object" && "type" in msg) {
                const typed = msg as Record<string, any>;

                if (typed.type === "connection_status") {
                  if (typed.status === "reconnecting") {
                    setStatus("reconnecting");
                    setReconnectAttempt(typed.attempt || 1);
                    setMaxAttempts(typed.max_attempts || 5);
                    setStatusMessage(typed.message || "Upstream Gemini Live reconnecting with exponential backoff...");
                  } else if (typed.status === "connected") {
                    setStatus("connected");
                    setStatusMessage(typed.message || "Connected to voice assistant");
                  } else if (typed.status === "error") {
                    setStatus("error");
                    setStatusMessage(typed.message || "Connection error");
                  }
                  return;
                }

                if (typed.type === "tool_call_executed") {
                  const toolMsg = typed.result?.message || `Executed ${typed.tool}`;
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: Math.random().toString(),
                      speaker: "system",
                      text: `⚡ ${toolMsg}`,
                      toolCall: { name: typed.tool, result: typed.result },
                      timestamp: Date.now(),
                    },
                  ]);
                  toast.success(toolMsg);
                  if (onTaskUpdated) onTaskUpdated();
                  return;
                }

                if (typed.type === "transcript") {
                  const text = String(typed.text || "");
                  if (typed.speaker === "jenita" && text) speakText(text);
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: Math.random().toString(),
                      speaker: typed.speaker,
                      text,
                      timestamp: Date.now(),
                    },
                  ]);
                  return;
                }
              }

              if (msg && typeof msg === "object" && "serverContent" in msg) {
                const typed = msg as Record<string, any>;
                for (const part of typed.serverContent?.modelTurn?.parts || []) {
                  if (part.inlineData?.data) {
                    playPcmChunk(part.inlineData.data);
                  }
                  if (part.text) {
                    speakText(part.text);
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
          })();
        };

        ws.onerror = () => {
          // handled by onclose
        };

        ws.onclose = (event) => {
          if (!shouldKeepConnectedRef.current) {
            setStatus("disconnected");
            setStatusMessage("Voice session ended");
            resolve(null);
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
        resolve(null);
      }
    });
  }, [onTaskUpdated, playPcmChunk, speakText]);

  useEffect(() => {
    reconnectRef.current = () => {
      connect().catch(() => undefined);
    };
  }, [connect]);

  const stopMic = useCallback(() => {
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }
    if (captureContextRef.current) {
      captureContextRef.current.close();
      captureContextRef.current = null;
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

  const sendText = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Voice assistant is not connected. Connecting now...");
      connect().then(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              speaker: "user",
              text: trimmed,
              timestamp: Date.now(),
            },
          ]);
          wsRef.current.send(JSON.stringify({
            clientContent: {
              turns: [{ role: "user", parts: [{ text: trimmed }] }],
              turnComplete: true,
            },
          }));
        }
      });
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        speaker: "user",
        text: trimmed,
        timestamp: Date.now(),
      },
    ]);

    wsRef.current.send(JSON.stringify({
      clientContent: {
        turns: [{ role: "user", parts: [{ text: trimmed }] }],
        turnComplete: true,
      },
    }));
  }, [connect]);

  const startMic = useCallback(async () => {
    const consentGranted = hasVoiceConsent() || (await requestMicPermission());
    if (!consentGranted) {
      toast.error("Please allow microphone access to use Jenita by voice.");
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setStatusMessage("Opening voice connection before microphone activation...");
      const connected = await connect();
      if (!connected || connected.readyState !== WebSocket.OPEN) {
        toast.error("Voice connection is not ready yet. Please try again.");
        return;
      }
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
      captureContextRef.current = captureCtx;
      await captureCtx.resume();
      const micSource = captureCtx.createMediaStreamSource(stream);
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

        const avg = sum / inputData.length;
        setAudioLevel(Math.min(100, Math.round(avg * 400)));

        const bytes = new Uint8Array(pcm16.buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = window.btoa(binary);

        wsRef.current.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: base64Audio }],
          },
        }));
      };

      micSource.connect(processor);
      processor.connect(captureCtx.destination);
      setIsMicActive(true);
      toast.success("Microphone active — speak to Jenita");
    } catch (err: unknown) {
      toast.error("Microphone access denied or unavailable");
      console.error("Mic error:", err);
    }
  }, [connect, getAudioContext, hasVoiceConsent, requestMicPermission]);

  const toggleMic = useCallback(async () => {
    if (isMicActive) {
      stopMic();
      return;
    }

    const consentGranted = await requestMicPermission();
    if (!consentGranted) {
      return;
    }

    if (status !== "connected") {
      await connect();
    }
    await startMic();
  }, [connect, isMicActive, requestMicPermission, startMic, status, stopMic]);

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
