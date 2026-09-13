package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"jenita-server/internal/config"
	"jenita-server/internal/modules/auth"
	"jenita-server/internal/modules/preferences"
	"jenita-server/internal/modules/reminders"
	"jenita-server/internal/modules/tasks"
	"jenita-server/internal/modules/voice"
	"jenita-server/internal/platform/database"
	"jenita-server/internal/platform/middleware"
)

func main() {
	log.Println("==================================================")
	log.Println(" Starting Jenita AI Planner & Voice Server (Go)   ")
	log.Println("==================================================")

	cfg := config.Load()

	// 1. Initialize SQLite Database
	db, err := database.New(cfg.DatabasePath)
	if err != nil {
		log.Fatalf("[Server] Fatal error initializing database: %v", err)
	}
	defer db.Close()
	log.Printf("[Server] SQLite connected at %s", cfg.DatabasePath)

	// 2. Initialize Repositories (Modular Monolith)
	authRepo := auth.NewRepository(db)
	tasksRepo := tasks.NewRepository(db)
	prefRepo := preferences.NewRepository(db)

	// 3. Initialize Services
	authService := auth.NewService(authRepo, cfg.JWTSecret)
	taskService := tasks.NewService(tasksRepo)
	prefService := preferences.NewService(prefRepo)
	reminderService := reminders.NewService(db, taskService)

	// Start background reminder worker
	stopCh := make(chan struct{})
	defer close(stopCh)
	reminderService.StartBackgroundTicker(stopCh)
	log.Println("[Server] Background reminder escalation engine started")

	// 4. Initialize Handlers
	authHandler := auth.NewHandler(authService)
	tasksHandler := tasks.NewHandler(taskService)
	prefHandler := preferences.NewHandler(prefService)
	reminderHandler := reminders.NewHandler(reminderService)
	voiceHandler := voice.NewHandler(cfg, taskService)

	// 5. Setup Gin Router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"app":       "Jenita AI Day Planner & Voice Assistant",
			"version":   "1.0.0",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
			"voice_api": func() string {
				if cfg.GeminiAPIKey != "" {
					return "gemini-live-active"
				}
				return "simulation-fallback"
			}(),
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	authMiddleware := middleware.RequireAuth(cfg.JWTSecret)

	authHandler.RegisterRoutes(v1, authMiddleware)
	tasksHandler.RegisterRoutes(v1, authMiddleware)
	prefHandler.RegisterRoutes(v1, authMiddleware)
	reminderHandler.RegisterRoutes(v1, authMiddleware)
	voiceHandler.RegisterRoutes(v1)

	// 6. Graceful Server Start
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      router,
		ReadTimeout:  60 * time.Second,
		WriteTimeout: 60 * time.Second,
	}

	go func() {
		log.Printf("[Server] HTTP and WebSocket listening on http://localhost:%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[Server] Listen and serve error: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("[Server] Shutting down server gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("[Server] Server forced to shutdown: %v", err)
	}

	log.Println("[Server] Server exited successfully.")
}
