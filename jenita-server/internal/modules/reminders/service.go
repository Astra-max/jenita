package reminders

import (
	"database/sql"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
	"jenita-server/internal/modules/tasks"
)

type EscalationState struct {
	TaskID       string    `json:"task_id"`
	UserID       string    `json:"user_id"`
	TaskTitle    string    `json:"task_title"`
	Attempt      int       `json:"attempt"`
	MaxAttempts  int       `json:"max_attempts"`
	LastSpokenAt time.Time `json:"last_spoken_at"`
	NextRepeatAt time.Time `json:"next_repeat_at"`
	Status       string    `json:"status"` // "active", "confirmed", "escalated_max", "snoozed"
	Message      string    `json:"message"`
}

type Service interface {
	StartBackgroundTicker(stopCh <-chan struct{})
	TriggerTestReminder(userID, taskID string) (*EscalationState, error)
	GetActiveEscalations(userID string) []*EscalationState
	AcknowledgeReminder(taskID, userID string) error
	SnoozeReminder(taskID, userID string, minutes int) error

	// Reminder CRUD convenience wrappers around tasks service
	CreateReminder(userID string, req *tasks.CreateTaskRequest, startNow bool) (*tasks.Task, *EscalationState, error)
	GetReminder(id, userID string) (*tasks.Task, error)
	UpdateReminder(id, userID string, req *tasks.UpdateTaskRequest) (*tasks.Task, error)
	DeleteReminder(id, userID string) error
}

type reminderService struct {
	db           *sql.DB
	taskService  tasks.Service
	mu           sync.RWMutex
	activeStates map[string]*EscalationState // key: taskID
}

func NewService(db *sql.DB, taskService tasks.Service) Service {
	return &reminderService{
		db:           db,
		taskService:  taskService,
		activeStates: make(map[string]*EscalationState),
	}
}

func (s *reminderService) StartBackgroundTicker(stopCh <-chan struct{}) {
	ticker := time.NewTicker(30 * time.Second)
	go func() {
		for {
			select {
			case <-stopCh:
				ticker.Stop()
				return
			case <-ticker.C:
				s.evaluateActiveEscalations()
			}
		}
	}()
}

func (s *reminderService) evaluateActiveEscalations() {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	for _, state := range s.activeStates {
		if state.Status != "active" {
			continue
		}

		if now.After(state.NextRepeatAt) {
			if state.Attempt >= state.MaxAttempts {
				state.Status = "escalated_max"
				state.Message = fmt.Sprintf("Voice reminder for '%s' reached max repeats without confirmation. Backup email sent.", state.TaskTitle)
				s.logReminderEvent(state.TaskID, state.UserID, "email", "escalated_max", state.Attempt)
				log.Printf("[Reminder] Escalation reached ceiling for task '%s'. Sent email backup.", state.TaskTitle)
			} else {
				state.Attempt++
				state.LastSpokenAt = now
				state.NextRepeatAt = now.Add(1 * time.Minute)
				urgencyPrefix := "Reminder"
				if state.Attempt == 2 {
					urgencyPrefix = "Second reminder"
				} else if state.Attempt >= 3 {
					urgencyPrefix = "Urgent reminder"
				}
				state.Message = fmt.Sprintf("%s: '%s' is pending. Say 'done' to confirm or 'snooze' to delay.", urgencyPrefix, state.TaskTitle)
				s.logReminderEvent(state.TaskID, state.UserID, "voice", "escalated", state.Attempt)
				log.Printf("[Reminder] Loop #%d for task '%s': %s", state.Attempt, state.TaskTitle, state.Message)
			}
		}
	}
}

func (s *reminderService) TriggerTestReminder(userID, taskID string) (*EscalationState, error) {
	var task *tasks.Task
	var err error

	if taskID != "" {
		task, err = s.taskService.GetTask(taskID, userID)
		if err != nil {
			return nil, err
		}
	} else {
		// Find first pending task
		today := time.Now().Format("2006-01-02")
		taskList, err := s.taskService.ListTasks(userID, today)
		if err != nil || len(taskList) == 0 {
			return nil, fmt.Errorf("no tasks found to remind: %v", err)
		}
		for i := range taskList {
			if taskList[i].Status == "pending" {
				task = &taskList[i]
				break
			}
		}
		if task == nil {
			task = &taskList[0]
		}
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	state := &EscalationState{
		TaskID:       task.ID,
		UserID:       userID,
		TaskTitle:    task.Title,
		Attempt:      1,
		MaxAttempts:  3,
		LastSpokenAt: now,
		NextRepeatAt: now.Add(1 * time.Minute),
		Status:       "active",
		Message:      fmt.Sprintf("Voice reminder: '%s' is due now at %s. Please verbally confirm or tap Confirm.", task.Title, task.Time),
	}

	s.activeStates[task.ID] = state
	s.logReminderEvent(task.ID, userID, "voice", "spoken", 1)

	return state, nil
}

func (s *reminderService) GetActiveEscalations(userID string) []*EscalationState {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []*EscalationState
	for _, st := range s.activeStates {
		if st.UserID == userID {
			result = append(result, st)
		}
	}
	return result
}

func (s *reminderService) AcknowledgeReminder(taskID, userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if state, ok := s.activeStates[taskID]; ok {
		state.Status = "confirmed"
		state.Message = fmt.Sprintf("Confirmed! '%s' acknowledgment recorded.", state.TaskTitle)
		s.logReminderEvent(taskID, userID, "voice", "confirmed", state.Attempt)
	}

	return s.taskService.UpdateStatus(taskID, userID, "confirmed")
}

func (s *reminderService) SnoozeReminder(taskID, userID string, minutes int) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if state, ok := s.activeStates[taskID]; ok {
		state.Status = "snoozed"
		state.Message = fmt.Sprintf("Snoozed '%s' for %d minutes.", state.TaskTitle, minutes)
		s.logReminderEvent(taskID, userID, "voice", "snoozed", state.Attempt)
	}

	_, err := s.taskService.SnoozeTask(taskID, userID, minutes)
	return err
}

// CreateReminder creates a task via the tasks service and optionally triggers the reminder immediately
func (s *reminderService) CreateReminder(userID string, req *tasks.CreateTaskRequest, startNow bool) (*tasks.Task, *EscalationState, error) {
	// Delegate task creation to tasks service
	task, err := s.taskService.CreateTask(userID, req)
	if err != nil {
	return nil, nil, err
	}

	var state *EscalationState
	if startNow {
	st, err := s.TriggerTestReminder(userID, task.ID)
	if err == nil {
		state = st
	}
	}

	return task, state, nil
}

func (s *reminderService) GetReminder(id, userID string) (*tasks.Task, error) {
	return s.taskService.GetTask(id, userID)
}

func (s *reminderService) UpdateReminder(id, userID string, req *tasks.UpdateTaskRequest) (*tasks.Task, error) {
	return s.taskService.UpdateTask(id, userID, req)
}

func (s *reminderService) DeleteReminder(id, userID string) error {
	// Also remove any active escalation state
	s.mu.Lock()
	delete(s.activeStates, id)
	s.mu.Unlock()

	return s.taskService.DeleteTask(id, userID)
}

func (s *reminderService) logReminderEvent(taskID, userID, channel, status string, attempt int) {
	query := `
		INSERT INTO reminder_logs (id, task_id, user_id, channel, status, attempt_count, created_at)
		VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
	`
	_, _ = s.db.Exec(query, uuid.New().String(), taskID, userID, channel, status, attempt)
}
