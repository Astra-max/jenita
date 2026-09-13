package tasks

import (
	"errors"
	"strings"
	"time"
)

type Service interface {
	ListTasks(userID, date string) ([]Task, error)
	GetTask(id, userID string) (*Task, error)
	CreateTask(userID string, req *CreateTaskRequest) (*Task, error)
	UpdateTask(id, userID string, req *UpdateTaskRequest) (*Task, error)
	DeleteTask(id, userID string) error
	UpdateStatus(id, userID, status string) error
	SnoozeTask(id, userID string, minutes int) (*Task, error)
	GetStats(userID, date string) (*TaskStats, error)

	// Helper for voice agent / tool calling
	FindAndUpdateByVoice(userID, taskIdentifier, newTime, newDate, newTitle string) (*Task, error)
	ConfirmByVoice(userID, taskIdentifier string) (*Task, error)
}

type taskService struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &taskService{repo: repo}
}

func (s *taskService) ListTasks(userID, date string) ([]Task, error) {
	return s.repo.List(userID, date)
}

func (s *taskService) GetTask(id, userID string) (*Task, error) {
	return s.repo.GetByID(id, userID)
}

func (s *taskService) CreateTask(userID string, req *CreateTaskRequest) (*Task, error) {
	if strings.TrimSpace(req.Title) == "" {
		return nil, errors.New("title cannot be empty")
	}
	if strings.TrimSpace(req.Time) == "" {
		return nil, errors.New("time cannot be empty")
	}

	dueDate := req.DueDate
	if dueDate == "" {
		dueDate = time.Now().Format("2006-01-02")
	}

	meta := req.Meta
	if meta == "" {
		meta = "General"
	}

	task := &Task{
		UserID:     userID,
		Title:      req.Title,
		Time:       req.Time,
		DueDate:    dueDate,
		Meta:       meta,
		Status:     "pending",
		Priority:   req.Priority,
		Recurrence: req.Recurrence,
	}

	if err := s.repo.Create(task); err != nil {
		return nil, err
	}

	return task, nil
}

func (s *taskService) UpdateTask(id, userID string, req *UpdateTaskRequest) (*Task, error) {
	task, err := s.repo.GetByID(id, userID)
	if err != nil {
		return nil, err
	}

	if req.Title != nil {
		task.Title = *req.Title
	}
	if req.Time != nil {
		task.Time = *req.Time
	}
	if req.DueDate != nil {
		task.DueDate = *req.DueDate
	}
	if req.Meta != nil {
		task.Meta = *req.Meta
	}
	if req.Status != nil {
		task.Status = *req.Status
	}
	if req.Priority != nil {
		task.Priority = *req.Priority
	}
	if req.Recurrence != nil {
		task.Recurrence = *req.Recurrence
	}

	if err := s.repo.Update(task); err != nil {
		return nil, err
	}

	return task, nil
}

func (s *taskService) DeleteTask(id, userID string) error {
	return s.repo.Delete(id, userID)
}

func (s *taskService) UpdateStatus(id, userID, status string) error {
	status = strings.ToLower(strings.TrimSpace(status))
	if status != "pending" && status != "confirmed" && status != "done" {
		return errors.New("invalid status: must be pending, confirmed, or done")
	}
	return s.repo.UpdateStatus(id, userID, status)
}

func (s *taskService) SnoozeTask(id, userID string, minutes int) (*Task, error) {
	return s.repo.Snooze(id, userID, minutes)
}

func (s *taskService) GetStats(userID, date string) (*TaskStats, error) {
	return s.repo.GetStats(userID, date)
}

// FindAndUpdateByVoice handles conversational references like "Client sync" or "that meeting"
func (s *taskService) FindAndUpdateByVoice(userID, taskIdentifier, newTime, newDate, newTitle string) (*Task, error) {
	today := time.Now().Format("2006-01-02")
	tasks, err := s.repo.List(userID, today)
	if err != nil {
		return nil, err
	}

	var target *Task
	cleanIdent := strings.ToLower(strings.TrimSpace(taskIdentifier))

	for i := range tasks {
		t := &tasks[i]
		if t.ID == taskIdentifier || strings.Contains(strings.ToLower(t.Title), cleanIdent) {
			target = t
			break
		}
	}

	// Fallback to first unconfirmed task if identifier is generic like "that" or "current"
	if target == nil && len(tasks) > 0 {
		for i := range tasks {
			if tasks[i].Status != "done" {
				target = &tasks[i]
				break
			}
		}
	}

	if target == nil {
		return nil, errors.New("could not find matching task to update")
	}

	if newTime != "" {
		target.Time = newTime
	}
	if newDate != "" {
		target.DueDate = newDate
	}
	if newTitle != "" {
		target.Title = newTitle
	}

	if err := s.repo.Update(target); err != nil {
		return nil, err
	}

	return target, nil
}

func (s *taskService) ConfirmByVoice(userID, taskIdentifier string) (*Task, error) {
	today := time.Now().Format("2006-01-02")
	tasks, err := s.repo.List(userID, today)
	if err != nil {
		return nil, err
	}

	var target *Task
	cleanIdent := strings.ToLower(strings.TrimSpace(taskIdentifier))

	for i := range tasks {
		t := &tasks[i]
		if t.ID == taskIdentifier || (cleanIdent != "" && strings.Contains(strings.ToLower(t.Title), cleanIdent)) {
			target = t
			break
		}
	}

	// If no exact match, grab the earliest pending/unconfirmed task
	if target == nil {
		for i := range tasks {
			if tasks[i].Status == "pending" {
				target = &tasks[i]
				break
			}
		}
	}

	if target == nil && len(tasks) > 0 {
		target = &tasks[0]
	}

	if target == nil {
		return nil, errors.New("no pending task found to confirm")
	}

	target.Status = "confirmed"
	if err := s.repo.UpdateStatus(target.ID, userID, "confirmed"); err != nil {
		return nil, err
	}

	return target, nil
}
