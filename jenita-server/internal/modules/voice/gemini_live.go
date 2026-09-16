package voice

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"jenita-server/internal/config"
	"jenita-server/internal/modules/tasks"
)

type GeminiLiveBridge struct {
	cfg         *config.Config
	taskService tasks.Service
	clientConn  *websocket.Conn
	userID      string
	reconnectMgr *ReconnectManager
	upstreamConn *websocket.Conn
	mu          sync.Mutex
	ctx         context.Context
	cancel      context.CancelFunc
}

func NewGeminiLiveBridge(
	cfg *config.Config,
	taskService tasks.Service,
	clientConn *websocket.Conn,
	userID string,
) *GeminiLiveBridge {
	ctx, cancel := context.WithCancel(context.Background())

	bridge := &GeminiLiveBridge{
		cfg:         cfg,
		taskService: taskService,
		clientConn:  clientConn,
		userID:      userID,
		ctx:         ctx,
		cancel:      cancel,
	}

	retryPolicy := DefaultRetryPolicy(cfg.MaxReconnectRetries)
	bridge.reconnectMgr = NewReconnectManager(retryPolicy, func(sn StatusNotification) {
		bridge.sendToClient(sn)
	})

	return bridge
}

func (b *GeminiLiveBridge) Start() {
	defer b.Close()

	if b.cfg.GeminiAPIKey == "" {
		log.Println("[GeminiLive] No GEMINI_API_KEY set. Starting in smart simulation mode.")
		b.reconnectMgr.SetState(StateConnected, "Connected to Jenita Assistant (Simulation Mode)")
		HandleSimulationSession(b.clientConn, b.userID, b.taskService)
		return
	}

	// Start pump from browser client to upstream Gemini Live
	clientMsgChan := make(chan []byte, 100)
	go b.readFromClient(clientMsgChan)

	// Outer loop manages session reconnection with exponential backoff
	err := b.reconnectMgr.ExecuteWithRetry(b.ctx, func() error {
		return b.connectAndStream(clientMsgChan)
	})

	if err != nil {
		log.Printf("[GeminiLive] Upstream connection terminated: %v", err)
		// If upstream fails due to model or invalid payload issues, fall back to simulation mode
		if strings.Contains(err.Error(), "model") || strings.Contains(err.Error(), "Invalid JSON payload") || strings.Contains(err.Error(), "Invalid JSON") {
			log.Println("[GeminiLive] Falling back to simulation mode due to upstream incompatibility")
			b.reconnectMgr.SetState(StateConnected, "Connected to Jenita Assistant (Simulation Mode)")
			HandleSimulationSession(b.clientConn, b.userID, b.taskService)
		}
	}
}

func (b *GeminiLiveBridge) connectAndStream(clientMsgChan <-chan []byte) error {
	b.reconnectMgr.SetState(StateConnecting, "Establishing connection to Google Gemini Live API...")

	geminiURL := url.URL{
	Scheme:   "wss",
	Host:     "generativelanguage.googleapis.com",
	Path:     "/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent",
	RawQuery: "key=" + b.cfg.GeminiAPIKey,
}

	dialer := websocket.DefaultDialer
	dialer.HandshakeTimeout = 10 * time.Second

	conn, resp, err := dialer.DialContext(b.ctx, geminiURL.String(), http.Header{})
	if err != nil {
		status := "unknown"
		if resp != nil {
			status = resp.Status
		}
		return fmt.Errorf("dial to Gemini Live failed (status %s): %w", status, err)
	}

	b.mu.Lock()
	b.upstreamConn = conn
	b.mu.Unlock()

	defer func() {
		b.mu.Lock()
		if b.upstreamConn != nil {
			_ = b.upstreamConn.Close()
			b.upstreamConn = nil
		}
		b.mu.Unlock()
	}()

	// 1. Send initial setup configuration
	if err := b.sendGeminiSetup(conn); err != nil {
		return fmt.Errorf("failed to send setup message to Gemini: %w", err)
	}

	b.reconnectMgr.SetState(StateConnected, "Connected to Google Gemini Live API (Audio Streaming Ready)")
	log.Println("[GeminiLive] Connected and setup successfully sent!")

	// 2. Start two concurrent streams: client->upstream, upstream->client
	upstreamErrCh := make(chan error, 2)

	// Stream: Upstream Gemini -> Client & Tool Dispatcher
	go func() {
		upstreamErrCh <- b.pipeUpstreamToClient(conn)
	}()

	// Stream: Client Msg Buffer -> Upstream Gemini
	go func() {
		upstreamErrCh <- b.pipeClientToUpstream(conn, clientMsgChan)
	}()

	// Wait until either stream encounters an error or context is done
	select {
	case <-b.ctx.Done():
		return nil
	case err := <-upstreamErrCh:
		if err != nil {
			log.Printf("[GeminiLive] Upstream stream error: %v", err)
			return err
		}
		return nil
	}
}

func (b *GeminiLiveBridge) sendGeminiSetup(conn *websocket.Conn) error {
	setupPayload := map[string]interface{}{
		"setup": map[string]interface{}{
			"model": b.cfg.GeminiModel,
			"generationConfig": map[string]interface{}{
				"responseModalities": []string{"TEXT", "AUDIO"},
				"speechConfig": map[string]interface{}{
					"voiceConfig": map[string]interface{}{
						"prebuiltVoiceConfig": map[string]interface{}{
							"voiceName": b.cfg.VoiceName,
						},
					},
				},
			},
			"systemInstruction": map[string]interface{}{
				"parts": []map[string]interface{}{
					{
						"text": "You are Jenita, an intelligent voice day planner and reminder assistant that speaks out loud. " +
							"You speak naturally, concisely, and warmly. When speaking reminders, announce the task clearly and prompt for confirmation. " +
							"When the user says 'done', 'confirmed', or 'got it', execute the confirm_reminder tool. " +
							"When the user asks to push or reschedule, execute the update_task tool. " +
							"When the user asks to add or schedule, execute the create_task tool. " +
							"When the user says 'snooze', execute the snooze_reminder tool. " +
							"Always use tools to update schedule state directly, then briefly state what you did.",
					},
				},
			},
			"tools": GetGeminiToolDeclarations(),
		},
	}

	return conn.WriteJSON(setupPayload)
}

func (b *GeminiLiveBridge) pipeUpstreamToClient(conn *websocket.Conn) error {
	for {
		select {
		case <-b.ctx.Done():
			return nil
		default:
		}

		messageType, data, err := conn.ReadMessage()
		if err != nil {
			return fmt.Errorf("reading from Gemini failed: %w", err)
		}

		if messageType == websocket.TextMessage {
			var geminiMsg map[string]interface{}
			if err := json.Unmarshal(data, &geminiMsg); err != nil {
				// Forward raw if unparseable
				_ = b.clientConn.WriteMessage(messageType, data)
				continue
			}

			// Check for Tool Calls
			if toolCallObj, ok := geminiMsg["toolCall"].(map[string]interface{}); ok {
				go b.handleToolCall(conn, toolCallObj)
			}

			// Forward audio chunks and messages to the browser client
			b.mu.Lock()
			_ = b.clientConn.WriteMessage(messageType, data)
			b.mu.Unlock()
		} else {
			b.mu.Lock()
			_ = b.clientConn.WriteMessage(messageType, data)
			b.mu.Unlock()
		}
	}
}

func (b *GeminiLiveBridge) handleToolCall(conn *websocket.Conn, toolCallObj map[string]interface{}) {
	rawCalls, ok := toolCallObj["functionCalls"].([]interface{})
	if !ok {
		return
	}

	for _, raw := range rawCalls {
		callMap, ok := raw.(map[string]interface{})
		if !ok {
			continue
		}

		callID, _ := callMap["id"].(string)
		name, _ := callMap["name"].(string)
		args, _ := callMap["args"].(map[string]interface{})

		toolCall := ToolCall{
			ID:   callID,
			Name: name,
			Args: args,
		}

		// Execute against SQLite database via TaskService
		result := ExecuteTool(b.userID, toolCall, b.taskService)

		// Send tool response back to Gemini Live
		respJSON := FormatToolResponseJSON(callID, result)
		b.mu.Lock()
		_ = conn.WriteMessage(websocket.TextMessage, respJSON)
		b.mu.Unlock()

		// Also notify client frontend
		b.sendToClient(map[string]interface{}{
			"type":   "tool_call_executed",
			"tool":   name,
			"result": result,
		})
	}
}

func (b *GeminiLiveBridge) pipeClientToUpstream(conn *websocket.Conn, clientMsgChan <-chan []byte) error {
	for {
		select {
		case <-b.ctx.Done():
			return nil
		case msgData, ok := <-clientMsgChan:
			if !ok {
				return nil
			}
			b.mu.Lock()
			err := conn.WriteMessage(websocket.TextMessage, msgData)
			b.mu.Unlock()
			if err != nil {
				return fmt.Errorf("writing to Gemini failed: %w", err)
			}
		}
	}
}

func (b *GeminiLiveBridge) readFromClient(clientMsgChan chan<- []byte) {
	defer close(clientMsgChan)

	for {
		select {
		case <-b.ctx.Done():
			return
		default:
		}

		_, data, err := b.clientConn.ReadMessage()
		if err != nil {
			log.Printf("[GeminiLive] Client disconnected: %v", err)
			b.cancel()
			return
		}

		// Non-blocking write to channel
		select {
		case clientMsgChan <- data:
		default:
			log.Println("[GeminiLive] Warning: Client message buffer full, dropping frame")
		}
	}
}

func (b *GeminiLiveBridge) sendToClient(v interface{}) {
	b.mu.Lock()
	defer b.mu.Unlock()
	_ = b.clientConn.WriteJSON(v)
}

func (b *GeminiLiveBridge) Close() {
	b.cancel()
	b.mu.Lock()
	if b.upstreamConn != nil {
		_ = b.upstreamConn.Close()
		b.upstreamConn = nil
	}
	_ = b.clientConn.Close()
	b.mu.Unlock()
}
