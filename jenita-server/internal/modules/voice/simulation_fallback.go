package voice

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"jenita-server/internal/modules/tasks"
)

// HandleSimulationSession provides a fallback assistant when GEMINI_API_KEY is not configured
func HandleSimulationSession(clientConn *websocket.Conn, userID string, taskService tasks.Service) {
	log.Printf("[VoiceSimulation] Started smart simulation session for user %s", userID)

	// Send initial greeting
	greeting := map[string]interface{}{
		"type":    "transcript",
		"speaker": "jenita",
		"text":    "Hello Sarah! I'm Jenita. You can speak or type to check your agenda, reschedule tasks, or confirm reminders.",
	}
	_ = clientConn.WriteJSON(greeting)

	for {
		messageType, p, err := clientConn.ReadMessage()
		if err != nil {
			log.Printf("[VoiceSimulation] Client disconnected: %v", err)
			return
		}

		if messageType == websocket.TextMessage {
			var clientMsg map[string]interface{}
			if err := json.Unmarshal(p, &clientMsg); err != nil {
				continue
			}

			// Handle text or audio transcript
			text, _ := clientMsg["text"].(string)
			if text == "" {
				// Check for simulated audio or ping
				if action, ok := clientMsg["action"].(string); ok && action == "ping" {
					_ = clientConn.WriteJSON(map[string]string{"type": "pong"})
					continue
				}
				continue
			}

			// Echo user text
			_ = clientConn.WriteJSON(map[string]interface{}{
				"type":    "transcript",
				"speaker": "user",
				"text":    text,
			})

			// Process conversational intent
			replyText, toolResult := processConversationalIntent(userID, text, taskService)

			if toolResult != nil {
				_ = clientConn.WriteJSON(map[string]interface{}{
					"type":   "tool_call_executed",
					"result": toolResult,
				})
			}

			time.Sleep(200 * time.Millisecond) // Natural conversational pause
			_ = clientConn.WriteJSON(map[string]interface{}{
				"type":    "transcript",
				"speaker": "jenita",
				"text":    replyText,
			})
		}
	}
}

func processConversationalIntent(userID, input string, taskService tasks.Service) (string, *ToolResult) {
	lower := strings.ToLower(input)

	// Confirm reminder intent
	if strings.Contains(lower, "confirm") || strings.Contains(lower, "done") || strings.Contains(lower, "got it") {
		call := ToolCall{
			ID:   "sim_confirm",
			Name: "confirm_reminder",
			Args: map[string]interface{}{},
		}
		res := ExecuteTool(userID, call, taskService)
		return fmt.Sprintf("Confirmed! I have marked your reminder as confirmed."), &res
	}

	// Snooze intent
	if strings.Contains(lower, "snooze") {
		call := ToolCall{
			ID:   "sim_snooze",
			Name: "snooze_reminder",
			Args: map[string]interface{}{"minutes": 15.0},
		}
		res := ExecuteTool(userID, call, taskService)
		return fmt.Sprintf("Sure thing, I've snoozed that reminder for 15 minutes."), &res
	}

	// Reschedule / Move / Push intent
	if strings.Contains(lower, "push") || strings.Contains(lower, "move") || strings.Contains(lower, "reschedule") {
		newTime := "5:00 PM"
		if strings.Contains(lower, "3") {
			newTime = "3:00 PM"
		} else if strings.Contains(lower, "4") {
			newTime = "4:30 PM"
		} else if strings.Contains(lower, "2") {
			newTime = "2:00 PM"
		}

		target := "Client sync"
		if strings.Contains(lower, "deep work") {
			target = "Deep work"
		} else if strings.Contains(lower, "stand-up") || strings.Contains(lower, "standup") {
			target = "Team stand-up"
		}

		call := ToolCall{
			ID:   "sim_update",
			Name: "update_task",
			Args: map[string]interface{}{
				"task_identifier": target,
				"time":            newTime,
			},
		}
		res := ExecuteTool(userID, call, taskService)
		return fmt.Sprintf("Done! I've rescheduled '%s' to %s for you.", target, newTime), &res
	}

	// Schedule / Add / Create intent
	if strings.Contains(lower, "add") || strings.Contains(lower, "schedule") || strings.Contains(lower, "set a reminder") {
		title := "Quick Sync"
		timeVal := "3:00 PM"
		if strings.Contains(lower, "call") {
			title = "Call Mom"
		} else if strings.Contains(lower, "review") {
			title = "Q4 Plan Review"
		}

		call := ToolCall{
			ID:   "sim_create",
			Name: "create_task",
			Args: map[string]interface{}{
				"title": title,
				"time":  timeVal,
				"meta":  "Voice Scheduled",
			},
		}
		res := ExecuteTool(userID, call, taskService)
		return fmt.Sprintf("Added '%s' to your agenda for %s.", title, timeVal), &res
	}

	// Agenda inquiry
	if strings.Contains(lower, "agenda") || strings.Contains(lower, "plate") || strings.Contains(lower, "what's next") || strings.Contains(lower, "schedule") {
		today := time.Now().Format("2006-01-02")
		tasks, _ := taskService.ListTasks(userID, today)
		var pendingTitles []string
		for _, t := range tasks {
			if t.Status != "done" {
				pendingTitles = append(pendingTitles, fmt.Sprintf("%s at %s", t.Title, t.Time))
			}
		}
		if len(pendingTitles) == 0 {
			return "You have cleared all scheduled tasks for today! Great job.", nil
		}
		return fmt.Sprintf("Here is what's coming up today: %s.", strings.Join(pendingTitles, ", ")), nil
	}

	return "I heard you! I can adjust your schedule, snooze a reminder, or add a new event whenever you need.", nil
}
