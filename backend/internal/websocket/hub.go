package websocket

import (
	"log"
	"sync"
)

// Hub maintains the set of active clients and broadcasts messages to them
type Hub struct {
	// Registered clients mapped by user ID
	clients map[uint]map[*Client]bool

	// Inbound messages from the clients
	Broadcast chan *BroadcastMessage

	// Register requests from the clients
	Register chan *Client

	// Unregister requests from clients
	Unregister chan *Client

	// Mutex for thread-safe operations
	mu sync.RWMutex
}

// BroadcastMessage represents a message to be broadcast to specific users
type BroadcastMessage struct {
	// User IDs to send the message to (empty means broadcast to all)
	UserIDs []uint

	// Message type
	Type string

	// Message payload
	Payload interface{}
}

// NewHub creates a new Hub instance
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[uint]map[*Client]bool),
		Broadcast:  make(chan *BroadcastMessage, 256),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.registerClient(client)

		case client := <-h.Unregister:
			h.unregisterClient(client)

		case message := <-h.Broadcast:
			h.broadcastMessage(message)
		}
	}
}

// registerClient registers a new client
func (h *Hub) registerClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.clients[client.userID] == nil {
		h.clients[client.userID] = make(map[*Client]bool)
	}
	h.clients[client.userID][client] = true

	log.Printf("Client registered for user %d. Total clients for user: %d",
		client.userID, len(h.clients[client.userID]))
}

// unregisterClient unregisters a client
func (h *Hub) unregisterClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if clients, ok := h.clients[client.userID]; ok {
		if _, exists := clients[client]; exists {
			delete(clients, client)
			close(client.send)

			log.Printf("Client unregistered for user %d. Remaining clients: %d",
				client.userID, len(h.clients[client.userID]))

			// Remove user entry if no more clients
			if len(clients) == 0 {
				delete(h.clients, client.userID)
			}
		}
	}
}

// broadcastMessage broadcasts a message to specified users or all users
func (h *Hub) broadcastMessage(msg *BroadcastMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	// If no specific users, broadcast to all
	if len(msg.UserIDs) == 0 {
		for _, clients := range h.clients {
			for client := range clients {
				client.SendMessage(msg.Type, msg.Payload)
			}
		}
		log.Printf("Broadcasted message type '%s' to all users", msg.Type)
		return
	}

	// Broadcast to specific users
	for _, userID := range msg.UserIDs {
		if clients, ok := h.clients[userID]; ok {
			for client := range clients {
				client.SendMessage(msg.Type, msg.Payload)
			}
			log.Printf("Broadcasted message type '%s' to user %d (%d clients)",
				msg.Type, userID, len(clients))
		}
	}
}

// BroadcastToUser sends a message to all connections of a specific user
func (h *Hub) BroadcastToUser(userID uint, msgType string, payload interface{}) {
	msg := &BroadcastMessage{
		UserIDs: []uint{userID},
		Type:    msgType,
		Payload: payload,
	}

	select {
	case h.Broadcast <- msg:
	default:
		log.Printf("Warning: Broadcast channel full, message dropped for user %d", userID)
	}
}

// BroadcastToUsers sends a message to multiple users
func (h *Hub) BroadcastToUsers(userIDs []uint, msgType string, payload interface{}) {
	msg := &BroadcastMessage{
		UserIDs: userIDs,
		Type:    msgType,
		Payload: payload,
	}

	select {
	case h.Broadcast <- msg:
	default:
		log.Printf("Warning: Broadcast channel full, message dropped")
	}
}

// BroadcastToAll sends a message to all connected users
func (h *Hub) BroadcastToAll(msgType string, payload interface{}) {
	msg := &BroadcastMessage{
		UserIDs: []uint{}, // Empty means all users
		Type:    msgType,
		Payload: payload,
	}

	select {
	case h.Broadcast <- msg:
	default:
		log.Printf("Warning: Broadcast channel full, message dropped")
	}
}

// GetConnectedUsers returns a list of user IDs with active connections
func (h *Hub) GetConnectedUsers() []uint {
	h.mu.RLock()
	defer h.mu.RUnlock()

	users := make([]uint, 0, len(h.clients))
	for userID := range h.clients {
		users = append(users, userID)
	}
	return users
}

// GetUserConnectionCount returns the number of active connections for a user
func (h *Hub) GetUserConnectionCount(userID uint) int {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if clients, ok := h.clients[userID]; ok {
		return len(clients)
	}
	return 0
}

// GetTotalConnectionCount returns the total number of active connections
func (h *Hub) GetTotalConnectionCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()

	count := 0
	for _, clients := range h.clients {
		count += len(clients)
	}
	return count
}
