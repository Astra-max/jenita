package reminders

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
	remGroup := rg.Group("/reminders", authMiddleware)
	{
		remGroup.POST("/trigger-test", h.TriggerTest)
		remGroup.GET("/active", h.Active)
		remGroup.POST("/:id/confirm", h.Confirm)
		remGroup.POST("/:id/snooze", h.Snooze)
	}
}

type TriggerTestRequest struct {
	TaskID string `json:"task_id"`
}

func (h *Handler) TriggerTest(c *gin.Context) {
	userID := c.GetString("userID")
	var req TriggerTestRequest
	_ = c.ShouldBindJSON(&req)

	state, err := h.service.TriggerTestReminder(userID, req.TaskID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, state)
}

func (h *Handler) Active(c *gin.Context) {
	userID := c.GetString("userID")
	states := h.service.GetActiveEscalations(userID)
	c.JSON(http.StatusOK, states)
}

func (h *Handler) Confirm(c *gin.Context) {
	userID := c.GetString("userID")
	taskID := c.Param("id")

	if err := h.service.AcknowledgeReminder(taskID, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reminder confirmed and acknowledged"})
}

type SnoozeReq struct {
	Minutes int `json:"minutes"`
}

func (h *Handler) Snooze(c *gin.Context) {
	userID := c.GetString("userID")
	taskID := c.Param("id")
	var req SnoozeReq
	_ = c.ShouldBindJSON(&req)
	if req.Minutes <= 0 {
		req.Minutes = 15
	}

	if err := h.service.SnoozeReminder(taskID, userID, req.Minutes); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reminder snoozed"})
}
