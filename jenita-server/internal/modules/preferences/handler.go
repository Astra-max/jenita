package preferences

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup, authMiddleware gin.HandlerFunc) {
	prefGroup := rg.Group("/preferences", authMiddleware)
	{
		prefGroup.GET("", h.Get)
		prefGroup.PUT("", h.Update)
	}
}

func (h *Handler) Get(c *gin.Context) {
	userID := c.GetString("userID")

	prefs, err := h.service.GetPreferences(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, prefs)
}

func (h *Handler) Update(c *gin.Context) {
	userID := c.GetString("userID")

	var req UpdatePreferencesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	prefs, err := h.service.UpdatePreferences(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, prefs)
}
