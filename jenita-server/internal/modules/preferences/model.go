package preferences

import "time"

type UserPreferences struct {
	ID                   string    `json:"id"`
	UserID               string    `json:"user_id"`
	QuietHoursStart      string    `json:"quiet_hours_start"`
	QuietHoursEnd        string    `json:"quiet_hours_end"`
	VoicePersona         string    `json:"voice_persona"`
	MaxEscalationRepeats int       `json:"max_escalation_repeats"`
	EmailBackup          bool      `json:"email_backup"`
	CreatedAt            time.Time `json:"created_at"`
}

type UpdatePreferencesRequest struct {
	QuietHoursStart      *string `json:"quiet_hours_start"`
	QuietHoursEnd        *string `json:"quiet_hours_end"`
	VoicePersona         *string `json:"voice_persona"`
	MaxEscalationRepeats *int    `json:"max_escalation_repeats"`
	EmailBackup          *bool   `json:"email_backup"`
}
