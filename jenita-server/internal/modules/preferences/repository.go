package preferences

import (
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
)

type Repository interface {
	GetByUserID(userID string) (*UserPreferences, error)
	Upsert(prefs *UserPreferences) error
}

type sqliteRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &sqliteRepository{db: db}
}

func (r *sqliteRepository) GetByUserID(userID string) (*UserPreferences, error) {
	query := `
		SELECT id, user_id, quiet_hours_start, quiet_hours_end, voice_persona, max_escalation_repeats, email_backup, created_at
		FROM preferences
		WHERE user_id = ?
	`
	row := r.db.QueryRow(query, userID)

	var p UserPreferences
	var emailBackupInt int
	var createdAtStr string
	err := row.Scan(
		&p.ID, &p.UserID, &p.QuietHoursStart, &p.QuietHoursEnd,
		&p.VoicePersona, &p.MaxEscalationRepeats, &emailBackupInt, &createdAtStr,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// Return default preferences
			return &UserPreferences{
				ID:                   uuid.New().String(),
				UserID:               userID,
				QuietHoursStart:      "22:00",
				QuietHoursEnd:        "07:00",
				VoicePersona:         "Aoede",
				MaxEscalationRepeats: 3,
				EmailBackup:          true,
				CreatedAt:            time.Now().UTC(),
			}, nil
		}
		return nil, err
	}

	p.EmailBackup = emailBackupInt == 1
	p.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
	return &p, nil
}

func (r *sqliteRepository) Upsert(p *UserPreferences) error {
	emailBackupInt := 0
	if p.EmailBackup {
		emailBackupInt = 1
	}

	query := `
		INSERT INTO preferences (id, user_id, quiet_hours_start, quiet_hours_end, voice_persona, max_escalation_repeats, email_backup, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(user_id) DO UPDATE SET
			quiet_hours_start = excluded.quiet_hours_start,
			quiet_hours_end = excluded.quiet_hours_end,
			voice_persona = excluded.voice_persona,
			max_escalation_repeats = excluded.max_escalation_repeats,
			email_backup = excluded.email_backup
	`
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	if p.CreatedAt.IsZero() {
		p.CreatedAt = time.Now().UTC()
	}

	_, err := r.db.Exec(
		query,
		p.ID, p.UserID, p.QuietHoursStart, p.QuietHoursEnd,
		p.VoicePersona, p.MaxEscalationRepeats, emailBackupInt, p.CreatedAt,
	)
	return err
}
