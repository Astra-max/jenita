package tasks

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
	tasksGroup := rg.Group("/tasks", authMiddleware)
	{
		tasksGroup.GET("", h.List)
		tasksGroup.POST("", h.Create)
		tasksGroup.GET("/stats", h.Stats)
		tasksGroup.GET("/:id", h.Get)
		tasksGroup.PUT("/:id", h.Update)
		tasksGroup.DELETE("/:id", h.Delete)
		tasksGroup.PATCH("/:id/status", h.UpdateStatus)
		tasksGroup.PATCH("/:id/snooze", h.Snooze)
	}
}

func (h *Handler) List(c *gin.Context) {
	userID := c.GetString("userID")
	date := c.Query("date")

	tasks, err := h.service.ListTasks(userID, date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

func (h *Handler) Get(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	task, err := h.service.GetTask(id, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, task)
}

func (h *Handler) Create(c *gin.Context) {
	userID := c.GetString("userID")
	var req CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	task, err := h.service.CreateTask(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, task)
}

func (h *Handler) Update(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	var req UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	task, err := h.service.UpdateTask(id, userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, task)
}

func (h *Handler) Delete(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	if err := h.service.DeleteTask(id, userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}

func (h *Handler) UpdateStatus(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	var req UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	if err := h.service.UpdateStatus(id, userID, req.Status); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated successfully", "status": req.Status})
}

func (h *Handler) Snooze(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	var req SnoozeRequest
	_ = c.ShouldBindJSON(&req) // Optional body, default 15 mins if 0

	task, err := h.service.SnoozeTask(id, userID, req.Minutes)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, task)
}

func (h *Handler) Stats(c *gin.Context) {
	userID := c.GetString("userID")
	date := c.Query("date")

	stats, err := h.service.GetStats(userID, date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}
