package auth

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Repository interface {
	CreateUser(user *User) error
	GetUserByEmail(email string) (*User, error)
	GetUserByID(id string) (*User, error)
}

type sqliteRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &sqliteRepository{db: db}
}

func (r *sqliteRepository) CreateUser(u *User) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	u.CreatedAt = time.Now().UTC()

	query := `
		INSERT INTO users (id, email, password_hash, full_name, created_at)
		VALUES (?, ?, ?, ?, ?)
	`
	_, err := r.db.Exec(query, u.ID, u.Email, u.PasswordHash, u.FullName, u.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	// Create default preferences for the new user
	prefQuery := `
		INSERT INTO preferences (id, user_id, quiet_hours_start, quiet_hours_end, voice_persona, max_escalation_repeats, email_backup)
		VALUES (?, ?, '22:00', '07:00', 'Aoede', 3, 1)
	`
	_, _ = r.db.Exec(prefQuery, uuid.New().String(), u.ID)

	return nil
}

func (r *sqliteRepository) GetUserByEmail(email string) (*User, error) {
	query := `SELECT id, email, password_hash, full_name, created_at FROM users WHERE email = ?`
	row := r.db.QueryRow(query, email)

	var u User
	var createdAtStr string
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &createdAtStr)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	u.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
	return &u, nil
}

func (r *sqliteRepository) GetUserByID(id string) (*User, error) {
	query := `SELECT id, email, password_hash, full_name, created_at FROM users WHERE id = ?`
	row := r.db.QueryRow(query, id)

	var u User
	var createdAtStr string
	err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &createdAtStr)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	u.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
	return &u, nil
}
