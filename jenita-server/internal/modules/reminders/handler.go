package reminders

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"jenita-server/internal/modules/tasks"
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
		// Create a reminder (creates a task and optionally triggers the reminder immediately)
		remGroup.POST("", h.CreateReminder)
		remGroup.POST("/trigger-test", h.TriggerTest)
		remGroup.GET("/active", h.Active)
		remGroup.POST("/:id/confirm", h.Confirm)
		remGroup.POST("/:id/snooze", h.Snooze)
		remGroup.DELETE("/:id", h.DeleteReminder)
		remGroup.PUT("/:id", h.UpdateReminder)
		remGroup.GET("/:id", h.GetReminder)
	}
}

// CreateReminderRequest mirrors tasks.CreateTaskRequest
type CreateReminderRequest struct {
	Title      string `json:"title" binding:"required"`
	Time       string `json:"time" binding:"required"`
	DueDate    string `json:"due_date"`
	Meta       string `json:"meta"`
	Priority   string `json:"priority"`
	Recurrence string `json:"recurrence"`
}

func (h *Handler) CreateReminder(c *gin.Context) {
	userID := c.GetString("userID")
	var req CreateReminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	// map to tasks.CreateTaskRequest
	ct := &tasks.CreateTaskRequest{
		Title:      req.Title,
		Time:       req.Time,
		DueDate:    req.DueDate,
		Meta:       req.Meta,
		Priority:   req.Priority,
		Recurrence: req.Recurrence,
	}

	startNow := c.Query("start_now") == "true"

	task, state, err := h.service.CreateReminder(userID, ct, startNow)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp := gin.H{"task": task}
	if state != nil {
		resp["reminder_state"] = state
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) GetReminder(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	task, err := h.service.GetReminder(id, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, task)
}

func (h *Handler) UpdateReminder(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	var req tasks.UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	task, err := h.service.UpdateReminder(id, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, task)
}

func (h *Handler) DeleteReminder(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	if err := h.service.DeleteReminder(id, userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reminder (task) deleted successfully"})
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
