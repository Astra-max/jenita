package voice

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"jenita-server/internal/config"
	"jenita-server/internal/modules/tasks"
	"jenita-server/internal/platform/middleware"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024 * 32,
	WriteBufferSize: 1024 * 32,
	CheckOrigin: func(r *http.Request) bool {
		// Allow local development and cross-origin frontend
		return true
	},
}

type Handler struct {
	cfg         *config.Config
	taskService tasks.Service
}

func NewHandler(cfg *config.Config, taskService tasks.Service) *Handler {
	return &Handler{
		cfg:         cfg,
		taskService: taskService,
	}
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup) {
	rg.GET("/ws/live", h.HandleLiveWebSocket)
}

func (h *Handler) HandleLiveWebSocket(c *gin.Context) {
	// Extract user ID from JWT token or context
	userID := "user_demo_sarah_001" // Default to demo user for testing

	tokenStr := c.Query("token")
	if tokenStr == "" {
		tokenStr = c.GetHeader("Authorization")
	}

	if tokenStr != "" {
		if claims, err := middleware.ValidateToken(tokenStr, h.cfg.JWTSecret); err == nil {
			userID = claims.UserID
		}
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[VoiceHandler] WebSocket upgrade error: %v", err)
		return
	}

	log.Printf("[VoiceHandler] Upgraded client WebSocket for user %s", userID)

	bridge := NewGeminiLiveBridge(h.cfg, h.taskService, conn, userID)
	go bridge.Start()
}
