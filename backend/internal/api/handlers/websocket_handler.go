package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	ws "github.com/quocdaijr/finance-management-backend/internal/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from localhost for development
		// In production, implement proper origin checking
		return true
	},
}

// WebSocketHandler handles WebSocket connection upgrades
type WebSocketHandler struct {
	hub *ws.Hub
}

// NewWebSocketHandler creates a new WebSocket handler
func NewWebSocketHandler(hub *ws.Hub) *WebSocketHandler {
	return &WebSocketHandler{
		hub: hub,
	}
}

// HandleConnection upgrades HTTP connection to WebSocket
func (h *WebSocketHandler) HandleConnection(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID, ok := userIDInterface.(uint)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// Create new client
	client := ws.NewClient(conn, userID, h.hub)

	// Register client with hub
	h.hub.Register <- client

	// Start client's read and write pumps
	go client.WritePump()
	go client.ReadPump()

	log.Printf("WebSocket connection established for user %d", userID)
}

// GetConnectionStats returns WebSocket connection statistics
func (h *WebSocketHandler) GetConnectionStats(c *gin.Context) {
	stats := gin.H{
		"total_connections": h.hub.GetTotalConnectionCount(),
		"connected_users":   len(h.hub.GetConnectedUsers()),
	}

	c.JSON(http.StatusOK, stats)
}

// GetHub returns the hub instance (used by other handlers to broadcast messages)
func (h *WebSocketHandler) GetHub() *ws.Hub {
	return h.hub
}
