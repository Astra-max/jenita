package preferences

type Service interface {
	GetPreferences(userID string) (*UserPreferences, error)
	UpdatePreferences(userID string, req *UpdatePreferencesRequest) (*UserPreferences, error)
}

type preferenceService struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &preferenceService{repo: repo}
}

func (s *preferenceService) GetPreferences(userID string) (*UserPreferences, error) {
	return s.repo.GetByUserID(userID)
}

func (s *preferenceService) UpdatePreferences(userID string, req *UpdatePreferencesRequest) (*UserPreferences, error) {
	current, err := s.repo.GetByUserID(userID)
	if err != nil {
		return nil, err
	}

	if req.QuietHoursStart != nil {
		current.QuietHoursStart = *req.QuietHoursStart
	}
	if req.QuietHoursEnd != nil {
		current.QuietHoursEnd = *req.QuietHoursEnd
	}
	if req.VoicePersona != nil {
		current.VoicePersona = *req.VoicePersona
	}
	if req.MaxEscalationRepeats != nil {
		current.MaxEscalationRepeats = *req.MaxEscalationRepeats
	}
	if req.EmailBackup != nil {
		current.EmailBackup = *req.EmailBackup
	}

	if err := s.repo.Upsert(current); err != nil {
		return nil, err
	}

	return current, nil
}
