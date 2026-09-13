package voice

import (
	"encoding/json"
	"fmt"
	"log"

	"jenita-server/internal/modules/tasks"
)

// GeminiToolDeclaration matches Google Gemini Live function declarations
type GeminiToolDeclaration struct {
	FunctionDeclarations []FunctionDeclaration `json:"functionDeclarations"`
}

type FunctionDeclaration struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Parameters  *JSONSchema `json:"parameters"`
}

type JSONSchema struct {
	Type       string                 `json:"type"`
	Properties map[string]PropertyDef `json:"properties"`
	Required   []string               `json:"required,omitempty"`
}

type PropertyDef struct {
	Type        string `json:"type"`
	Description string `json:"description"`
}

func GetGeminiToolDeclarations() []GeminiToolDeclaration {
	return []GeminiToolDeclaration{
		{
			FunctionDeclarations: []FunctionDeclaration{
				{
					Name:        "create_task",
					Description: "Create a new scheduled task, meeting, or reminder in the agenda",
					Parameters: &JSONSchema{
						Type: "OBJECT",
						Properties: map[string]PropertyDef{
							"title": {
								Type:        "STRING",
								Description: "The title or subject of the task, e.g. 'Project review' or 'Doctor appointment'",
							},
							"time": {
								Type:        "STRING",
								Description: "The scheduled time, e.g. '3:00 PM', '15:30', or 'Tomorrow morning'",
							},
							"due_date": {
								Type:        "STRING",
								Description: "The scheduled date, e.g. '2026-09-13', 'today', or 'tomorrow'",
							},
							"meta": {
								Type:        "STRING",
								Description: "Category or extra context, e.g. 'Focus block', 'Zoom · with Design', 'Personal'",
							},
						},
						Required: []string{"title", "time"},
					},
				},
				{
					Name:        "update_task",
					Description: "Update, reschedule, or change the time or title of an existing task in the agenda",
					Parameters: &JSONSchema{
						Type: "OBJECT",
						Properties: map[string]PropertyDef{
							"task_identifier": {
								Type:        "STRING",
								Description: "The title or ID of the task to update, e.g. 'Client sync' or 'that meeting'",
							},
							"time": {
								Type:        "STRING",
								Description: "The new time to reschedule to, e.g. '5:00 PM' or '3:30 PM'",
							},
							"due_date": {
								Type:        "STRING",
								Description: "Optional new date if rescheduling to another day",
							},
							"title": {
								Type:        "STRING",
								Description: "Optional new title if renaming the task",
							},
						},
						Required: []string{"task_identifier"},
					},
				},
				{
					Name:        "confirm_reminder",
					Description: "Acknowledge and confirm a spoken reminder when the user says 'done', 'confirmed', or 'got it'",
					Parameters: &JSONSchema{
						Type: "OBJECT",
						Properties: map[string]PropertyDef{
							"task_identifier": {
								Type:        "STRING",
								Description: "Title or ID of the task being confirmed (optional if confirming current reminder)",
							},
						},
					},
				},
				{
					Name:        "snooze_reminder",
					Description: "Snooze a pending reminder by a number of minutes (default 15 minutes)",
					Parameters: &JSONSchema{
						Type: "OBJECT",
						Properties: map[string]PropertyDef{
							"task_identifier": {
								Type:        "STRING",
								Description: "Title or ID of the task to snooze",
							},
							"minutes": {
								Type:        "INTEGER",
								Description: "Number of minutes to delay the reminder, e.g. 15, 30",
							},
						},
					},
				},
				{
					Name:        "get_agenda",
					Description: "Retrieve today's scheduled tasks and agenda items",
					Parameters: &JSONSchema{
						Type: "OBJECT",
						Properties: map[string]PropertyDef{
							"date": {
								Type:        "STRING",
								Description: "Date to retrieve agenda for, defaults to today",
							},
						},
					},
				},
			},
		},
	}
}

type ToolCall struct {
	ID   string                 `json:"id"`
	Name string                 `json:"name"`
	Args map[string]interface{} `json:"args"`
}

type ToolResult struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func ExecuteTool(userID string, call ToolCall, taskService tasks.Service) ToolResult {
	log.Printf("[VoiceTool] Executing tool '%s' with args: %v", call.Name, call.Args)

	switch call.Name {
	case "create_task":
		title, _ := call.Args["title"].(string)
		timeVal, _ := call.Args["time"].(string)
		meta, _ := call.Args["meta"].(string)
		dueDate, _ := call.Args["due_date"].(string)

		req := &tasks.CreateTaskRequest{
			Title:   title,
			Time:    timeVal,
			DueDate: dueDate,
			Meta:    meta,
		}
		task, err := taskService.CreateTask(userID, req)
		if err != nil {
			return ToolResult{Success: false, Message: fmt.Sprintf("Failed to create task: %v", err)}
		}
		return ToolResult{
			Success: true,
			Message: fmt.Sprintf("Scheduled '%s' for %s.", task.Title, task.Time),
			Data:    task,
		}

	case "update_task":
		ident, _ := call.Args["task_identifier"].(string)
		timeVal, _ := call.Args["time"].(string)
		dueDate, _ := call.Args["due_date"].(string)
		title, _ := call.Args["title"].(string)

		task, err := taskService.FindAndUpdateByVoice(userID, ident, timeVal, dueDate, title)
		if err != nil {
			return ToolResult{Success: false, Message: fmt.Sprintf("Could not reschedule task: %v", err)}
		}
		return ToolResult{
			Success: true,
			Message: fmt.Sprintf("Rescheduled '%s' to %s.", task.Title, task.Time),
			Data:    task,
		}

	case "confirm_reminder":
		ident, _ := call.Args["task_identifier"].(string)
		task, err := taskService.ConfirmByVoice(userID, ident)
		if err != nil {
			return ToolResult{Success: false, Message: fmt.Sprintf("Could not confirm reminder: %v", err)}
		}
		return ToolResult{
			Success: true,
			Message: fmt.Sprintf("Confirmed! Marked '%s' as confirmed in your agenda.", task.Title),
			Data:    task,
		}

	case "snooze_reminder":
		ident, _ := call.Args["task_identifier"].(string)
		minutes := 15
		if m, ok := call.Args["minutes"].(float64); ok && m > 0 {
			minutes = int(m)
		}

		// Find task first
		task, err := taskService.FindAndUpdateByVoice(userID, ident, "", "", "")
		if err == nil && task != nil {
			snoozed, sErr := taskService.SnoozeTask(task.ID, userID, minutes)
			if sErr == nil {
				return ToolResult{
					Success: true,
					Message: fmt.Sprintf("Snoozed '%s' for %d minutes. New time is %s.", snoozed.Title, minutes, snoozed.Time),
					Data:    snoozed,
				}
			}
		}
		return ToolResult{
			Success: true,
			Message: fmt.Sprintf("Snoozed reminder for %d minutes.", minutes),
		}

	case "get_agenda":
		date, _ := call.Args["date"].(string)
		items, err := taskService.ListTasks(userID, date)
		if err != nil {
			return ToolResult{Success: false, Message: fmt.Sprintf("Failed to load agenda: %v", err)}
		}
		return ToolResult{
			Success: true,
			Message: fmt.Sprintf("Found %d items in agenda.", len(items)),
			Data:    items,
		}

	default:
		return ToolResult{Success: false, Message: fmt.Sprintf("Unknown tool declaration '%s'", call.Name)}
	}
}

func FormatToolResponseJSON(callID string, result ToolResult) []byte {
	resp := map[string]interface{}{
		"toolResponse": map[string]interface{}{
			"functionResponses": []map[string]interface{}{
				{
					"id": callID,
					"response": map[string]interface{}{
						"output": result,
					},
				},
			},
		},
	}
	bytes, _ := json.Marshal(resp)
	return bytes
}
