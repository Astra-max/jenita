package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                string
	DatabasePath        string
	JWTSecret           string
	GeminiAPIKey        string
	GeminiModel         string
	VoiceName           string
	MaxReconnectRetries int
	Environment         string
}

func Load() *Config {
	// Try loading .env file if it exists, ignore error if missing
	if err := godotenv.Load(); err != nil {
		// Log informative message without failing
		log.Println("[Config] No .env file found, reading from system environment variables")
	}

	maxRetries, err := strconv.Atoi(getEnv("MAX_RECONNECT_RETRIES", "5"))
	if err != nil {
		maxRetries = 5
	}

	return &Config{
		Port:                getEnv("PORT", "8080"),
		DatabasePath:        getEnv("DATABASE_PATH", "./jenita.db"),
		JWTSecret:           getEnv("JWT_SECRET", "jenita-voice-secret-key-development-2026"),
		GeminiAPIKey:        getEnv("GEMINI_API_KEY", ""),
		GeminiModel: getEnv("GEMINI_MODEL", "models/gemini-2.5-flash-native-audio-latest"),
		VoiceName:           getEnv("VOICE_NAME", "Aoede"),
		MaxReconnectRetries: maxRetries,
		Environment:         getEnv("ENVIRONMENT", "development"),
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
