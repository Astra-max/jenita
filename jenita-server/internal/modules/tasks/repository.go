package tasks

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Repository interface {
	List(userID, date string) ([]Task, error)
	GetByID(id, userID string) (*Task, error)
	Create(task *Task) error
	Update(task *Task) error
	Delete(id, userID string) error
	UpdateStatus(id, userID, status string) error
	Snooze(id, userID string, minutes int) (*Task, error)
	GetStats(userID, date string) (*TaskStats, error)
}

type sqliteRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &sqliteRepository{db: db}
}

func (r *sqliteRepository) List(userID, date string) ([]Task, error) {
	query := `
		SELECT id, user_id, title, time, due_date, meta, status, priority, recurrence, created_at, updated_at
		FROM tasks
		WHERE user_id = ?
	`
	args := []interface{}{userID}

	if date != "" {
		query += ` AND due_date = ?`
		args = append(args, date)
	}

	query += ` ORDER BY due_date ASC, time ASC`

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query tasks: %w", err)
	}
	defer rows.Close()

	var tasks []Task
	for rows.Next() {
		var t Task
		var createdAtStr, updatedAtStr string
		err := rows.Scan(
			&t.ID, &t.UserID, &t.Title, &t.Time, &t.DueDate,
			&t.Meta, &t.Status, &t.Priority, &t.Recurrence,
			&createdAtStr, &updatedAtStr,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan task: %w", err)
		}
		t.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
		t.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)
		tasks = append(tasks, t)
	}

	if tasks == nil {
		tasks = []Task{}
	}

	return tasks, nil
}

func (r *sqliteRepository) GetByID(id, userID string) (*Task, error) {
	query := `
		SELECT id, user_id, title, time, due_date, meta, status, priority, recurrence, created_at, updated_at
		FROM tasks
		WHERE id = ? AND user_id = ?
	`
	row := r.db.QueryRow(query, id, userID)

	var t Task
	var createdAtStr, updatedAtStr string
	err := row.Scan(
		&t.ID, &t.UserID, &t.Title, &t.Time, &t.DueDate,
		&t.Meta, &t.Status, &t.Priority, &t.Recurrence,
		&createdAtStr, &updatedAtStr,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("task not found")
		}
		return nil, err
	}

	t.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
	t.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)
	return &t, nil
}

func (r *sqliteRepository) Create(t *Task) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}
	now := time.Now().UTC()
	t.CreatedAt = now
	t.UpdatedAt = now

	if t.DueDate == "" {
		t.DueDate = now.Format("2006-01-02")
	}
	if t.Status == "" {
		t.Status = "pending"
	}
	if t.Priority == "" {
		t.Priority = "normal"
	}
	if t.Recurrence == "" {
		t.Recurrence = "none"
	}

	query := `
		INSERT INTO tasks (id, user_id, title, time, due_date, meta, status, priority, recurrence, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err := r.db.Exec(
		query,
		t.ID, t.UserID, t.Title, t.Time, t.DueDate,
		t.Meta, t.Status, t.Priority, t.Recurrence,
		t.CreatedAt, t.UpdatedAt,
	)
	return err
}

func (r *sqliteRepository) Update(t *Task) error {
	t.UpdatedAt = time.Now().UTC()
	query := `
		UPDATE tasks
		SET title = ?, time = ?, due_date = ?, meta = ?, status = ?, priority = ?, recurrence = ?, updated_at = ?
		WHERE id = ? AND user_id = ?
	`
	res, err := r.db.Exec(
		query,
		t.Title, t.Time, t.DueDate, t.Meta, t.Status, t.Priority, t.Recurrence, t.UpdatedAt,
		t.ID, t.UserID,
	)
	if err != nil {
		return err
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return errors.New("task not found or not modified")
	}
	return nil
}

func (r *sqliteRepository) Delete(id, userID string) error {
	query := `DELETE FROM tasks WHERE id = ? AND user_id = ?`
	res, err := r.db.Exec(query, id, userID)
	if err != nil {
		return err
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return errors.New("task not found")
	}
	return nil
}

func (r *sqliteRepository) UpdateStatus(id, userID, status string) error {
	query := `UPDATE tasks SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?`
	res, err := r.db.Exec(query, status, time.Now().UTC(), id, userID)
	if err != nil {
		return err
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return errors.New("task not found")
	}
	return nil
}

func (r *sqliteRepository) Snooze(id, userID string, minutes int) (*Task, error) {
	task, err := r.GetByID(id, userID)
	if err != nil {
		return nil, err
	}

	if minutes <= 0 {
		minutes = 15
	}

	// Try parsing task.Time
	formats := []string{"3:04 PM", "15:04", "3:04PM", "3 PM"}
	var parsedTime time.Time
	var parsedFormat string
	for _, f := range formats {
		if pt, err := time.Parse(f, task.Time); err == nil {
			parsedTime = pt
			parsedFormat = f
			break
		}
	}

	if !parsedTime.IsZero() {
		newTime := parsedTime.Add(time.Duration(minutes) * time.Minute)
		task.Time = newTime.Format(parsedFormat)
	} else {
		// Default fallback if time is informal e.g. "Afternoon"
		task.Time = fmt.Sprintf("%s (+%dm)", task.Time, minutes)
	}

	task.Status = "pending"
	task.UpdatedAt = time.Now().UTC()

	query := `UPDATE tasks SET time = ?, status = 'pending', updated_at = ? WHERE id = ? AND user_id = ?`
	_, err = r.db.Exec(query, task.Time, task.UpdatedAt, id, userID)
	if err != nil {
		return nil, err
	}

	return task, nil
}

func (r *sqliteRepository) GetStats(userID, date string) (*TaskStats, error) {
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}

	var total, completed int
	err := r.db.QueryRow(`
		SELECT COUNT(*), COUNT(CASE WHEN status = 'done' THEN 1 END)
		FROM tasks
		WHERE user_id = ? AND due_date = ?
	`, userID, date).Scan(&total, &completed)
	if err != nil {
		return nil, err
	}

	// Calculate remaining focus time based on focus tasks or general pending tasks
	var focusMinutes int
	focusRows, err := r.db.Query(`
		SELECT meta FROM tasks
		WHERE user_id = ? AND due_date = ? AND status != 'done'
	`, userID, date)
	if err == nil {
		defer focusRows.Close()
		for focusRows.Next() {
			var meta string
			if err := focusRows.Scan(&meta); err == nil {
				// Estimate focus time: if contains "hrs" or "min", or default 45m per pending task
				focusMinutes += 45
			}
		}
	}

	focusHours := float64(focusMinutes) / 60.0
	if focusHours == 0 && total == completed {
		focusHours = 0.0
	} else if focusHours == 0 {
		focusHours = 2.5
	}

	// Find next pending or confirmed reminder
	var nextTitle, nextTime string
	err = r.db.QueryRow(`
		SELECT title, time FROM tasks
		WHERE user_id = ? AND due_date = ? AND status != 'done'
		ORDER BY time ASC
		LIMIT 1
	`, userID, date).Scan(&nextTitle, &nextTime)
	if err != nil {
		nextTitle = "All tasks completed!"
		nextTime = "None"
	}

	return &TaskStats{
		CompletedCount:    completed,
		TotalCount:        total,
		FocusHoursLeft:    fmt.Sprintf("%.1f hrs", focusHours),
		NextReminderTitle: nextTitle,
		NextReminderTime:  nextTime,
	}, nil
}
