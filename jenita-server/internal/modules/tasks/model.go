package tasks

import "time"

type Task struct {
	ID         string    `json:"id"`
	UserID     string    `json:"user_id"`
	Title      string    `json:"title"`
	Time       string    `json:"time"`
	DueDate    string    `json:"due_date"`
	Meta       string    `json:"meta"`
	Status     string    `json:"status"` // "pending" | "confirmed" | "done"
	Priority   string    `json:"priority"`
	Recurrence string    `json:"recurrence"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type CreateTaskRequest struct {
	Title      string `json:"title" binding:"required"`
	Time       string `json:"time" binding:"required"`
	DueDate    string `json:"due_date"`
	Meta       string `json:"meta"`
	Priority   string `json:"priority"`
	Recurrence string `json:"recurrence"`
}

type UpdateTaskRequest struct {
	Title      *string `json:"title"`
	Time       *string `json:"time"`
	DueDate    *string `json:"due_date"`
	Meta       *string `json:"meta"`
	Status     *string `json:"status"`
	Priority   *string `json:"priority"`
	Recurrence *string `json:"recurrence"`
}

type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

type SnoozeRequest struct {
	Minutes int `json:"minutes"`
}

type TaskStats struct {
	CompletedCount    int    `json:"completed_count"`
	TotalCount        int    `json:"total_count"`
	FocusHoursLeft    string `json:"focus_hours_left"`
	NextReminderTitle string `json:"next_reminder_title"`
	NextReminderTime  string `json:"next_reminder_time"`
}
