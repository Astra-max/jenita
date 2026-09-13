package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	_ "modernc.org/sqlite"
)

func New(dbPath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite database at %s: %w", dbPath, err)
	}

	// Optimize SQLite performance & concurrency with WAL mode
	if _, err := db.Exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;"); err != nil {
		log.Printf("[DB] Warning: PRAGMA journal_mode=WAL failed: %v", err)
	}

	if err := migrateSchema(db); err != nil {
		return nil, fmt.Errorf("failed to run database migrations: %w", err)
	}

	if err := seedDemoData(db); err != nil {
		log.Printf("[DB] Seed error: %v", err)
	}

	return db, nil
}

func migrateSchema(db *sql.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		full_name TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS tasks (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		title TEXT NOT NULL,
		time TEXT NOT NULL,
		due_date TEXT NOT NULL,
		meta TEXT NOT NULL DEFAULT '',
		status TEXT NOT NULL DEFAULT 'pending',
		priority TEXT NOT NULL DEFAULT 'normal',
		recurrence TEXT DEFAULT 'none',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS preferences (
		id TEXT PRIMARY KEY,
		user_id TEXT UNIQUE NOT NULL,
		quiet_hours_start TEXT DEFAULT '22:00',
		quiet_hours_end TEXT DEFAULT '07:00',
		voice_persona TEXT DEFAULT 'Aoede',
		max_escalation_repeats INTEGER DEFAULT 3,
		email_backup INTEGER DEFAULT 1,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS reminder_logs (
		id TEXT PRIMARY KEY,
		task_id TEXT NOT NULL,
		user_id TEXT NOT NULL,
		channel TEXT NOT NULL,
		status TEXT NOT NULL,
		attempt_count INTEGER DEFAULT 1,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);
	`
	_, err := db.Exec(schema)
	return err
}

func seedDemoData(db *sql.DB) error {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users WHERE email = 'demo@jenita.ai'").Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil // Already seeded
	}

	log.Println("[DB] Seeding demo user and initial tasks...")
	demoUserID := "user_demo_sarah_001"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("jenitademo123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = db.Exec(`
		INSERT INTO users (id, email, password_hash, full_name, created_at)
		VALUES (?, 'demo@jenita.ai', ?, 'Sarah Connor', CURRENT_TIMESTAMP)
	`, demoUserID, string(hashedPassword))
	if err != nil {
		return err
	}

	_, err = db.Exec(`
		INSERT INTO preferences (id, user_id, quiet_hours_start, quiet_hours_end, voice_persona, max_escalation_repeats, email_backup)
		VALUES (?, ?, '22:00', '07:00', 'Aoede', 3, 1)
	`, uuid.New().String(), demoUserID)
	if err != nil {
		return err
	}

	today := time.Now().Format("2006-01-02")
	initialTasks := []struct {
		Title    string
		Time     string
		Meta     string
		Status   string
		Priority string
	}{
		{"Team stand-up", "9:00 AM", "Meet · 15 min", "done", "normal"},
		{"Project review", "10:30 AM", "Zoom · with Design", "confirmed", "high"},
		{"Lunch with Sarah", "12:00 PM", "Personal", "confirmed", "normal"},
		{"Deep work: Q4 roadmap", "2:00 PM", "Focus block · 2 hrs", "pending", "urgent"},
		{"Client sync", "4:30 PM", "Call · Acme Co.", "pending", "high"},
	}

	for _, t := range initialTasks {
		taskID := uuid.New().String()
		_, err = db.Exec(`
			INSERT INTO tasks (id, user_id, title, time, due_date, meta, status, priority, recurrence, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'none', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`, taskID, demoUserID, t.Title, t.Time, today, t.Meta, t.Status, t.Priority)
		if err != nil {
			log.Printf("[DB] Error inserting seed task %s: %v", t.Title, err)
		}
	}

	log.Println("[DB] Demo user and initial agenda tasks successfully seeded!")
	return nil
}
