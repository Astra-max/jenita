package voice

import (
	"context"
	"fmt"
	"log"
	"math"
	"math/rand"
	"sync"
	"time"
)

type ConnectionState string

const (
	StateConnecting   ConnectionState = "connecting"
	StateConnected    ConnectionState = "connected"
	StateReconnecting ConnectionState = "reconnecting"
	StateDisconnected ConnectionState = "disconnected"
	StateError        ConnectionState = "error"
)

type StatusNotification struct {
	Type        string          `json:"type"` // "connection_status"
	Status      ConnectionState `json:"status"`
	Attempt     int             `json:"attempt,omitempty"`
	MaxAttempts int             `json:"max_attempts,omitempty"`
	DelayMs     int64           `json:"delay_ms,omitempty"`
	Message     string          `json:"message,omitempty"`
	Timestamp   int64           `json:"timestamp"`
}

type RetryPolicy struct {
	InitialInterval time.Duration
	MaxInterval     time.Duration
	Multiplier      float64
	MaxRetries      int
	JitterFraction  float64
}

func DefaultRetryPolicy(maxRetries int) RetryPolicy {
	if maxRetries <= 0 {
		maxRetries = 5
	}
	return RetryPolicy{
		InitialInterval: 1 * time.Second,
		MaxInterval:     20 * time.Second,
		Multiplier:      2.0,
		MaxRetries:      maxRetries,
		JitterFraction:  0.25,
	}
}

func (p *RetryPolicy) ComputeBackoff(attempt int) time.Duration {
	if attempt <= 0 {
		return p.InitialInterval
	}

	backoff := float64(p.InitialInterval) * math.Pow(p.Multiplier, float64(attempt-1))
	if backoff > float64(p.MaxInterval) {
		backoff = float64(p.MaxInterval)
	}

	// Add random jitter
	jitter := (rand.Float64()*2 - 1) * p.JitterFraction * backoff
	duration := time.Duration(backoff + jitter)
	if duration < p.InitialInterval {
		duration = p.InitialInterval
	}
	return duration
}

type ReconnectManager struct {
	policy      RetryPolicy
	state       ConnectionState
	attempt     int
	mu          sync.RWMutex
	onStatus    func(StatusNotification)
	cancelFunc  context.CancelFunc
}

func NewReconnectManager(policy RetryPolicy, onStatus func(StatusNotification)) *ReconnectManager {
	return &ReconnectManager{
		policy:   policy,
		state:    StateDisconnected,
		onStatus: onStatus,
	}
}

func (rm *ReconnectManager) SetState(s ConnectionState, msg string) {
	rm.mu.Lock()
	defer rm.mu.Unlock()
	rm.state = s
	if s == StateConnected {
		rm.attempt = 0
	}

	if rm.onStatus != nil {
		rm.onStatus(StatusNotification{
			Type:        "connection_status",
			Status:      s,
			Attempt:     rm.attempt,
			MaxAttempts: rm.policy.MaxRetries,
			Message:     msg,
			Timestamp:   time.Now().UnixMilli(),
		})
	}
}

func (rm *ReconnectManager) GetState() ConnectionState {
	rm.mu.RLock()
	defer rm.mu.RUnlock()
	return rm.state
}

// ExecuteWithRetry attempts an operation until it succeeds, context is cancelled, or max retries exceeded
func (rm *ReconnectManager) ExecuteWithRetry(ctx context.Context, op func() error) error {
	rm.mu.Lock()
	rm.attempt = 0
	rm.mu.Unlock()

	for {
		select {
		case <-ctx.Done():
			rm.SetState(StateDisconnected, "Session ended by client")
			return ctx.Err()
		default:
		}

		err := op()
		if err == nil {
			rm.SetState(StateConnected, "Connected to Gemini Live voice stream")
			return nil
		}

		rm.mu.Lock()
		rm.attempt++
		attempt := rm.attempt
		max := rm.policy.MaxRetries
		rm.mu.Unlock()

		if attempt > max {
			msg := fmt.Sprintf("Failed to connect after %d attempts: %v", max, err)
			log.Printf("[ReconnectManager] %s", msg)
			rm.SetState(StateError, msg)
			return fmt.Errorf("max reconnect attempts reached: %w", err)
		}

		delay := rm.policy.ComputeBackoff(attempt)
		msg := fmt.Sprintf("Disconnected from Gemini Live (%v). Retrying in %v (Attempt %d/%d)...", err, delay.Round(time.Millisecond), attempt, max)
		log.Printf("[ReconnectManager] %s", msg)

		if rm.onStatus != nil {
			rm.onStatus(StatusNotification{
				Type:        "connection_status",
				Status:      StateReconnecting,
				Attempt:     attempt,
				MaxAttempts: max,
				DelayMs:     delay.Milliseconds(),
				Message:     msg,
				Timestamp:   time.Now().UnixMilli(),
			})
		}

		select {
		case <-ctx.Done():
			rm.SetState(StateDisconnected, "Session cancelled during backoff")
			return ctx.Err()
		case <-time.After(delay):
		}
	}
}
