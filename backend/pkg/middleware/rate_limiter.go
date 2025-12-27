package middleware

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/quocdaijr/finance-management-backend/internal/infrastructure"
)

// RateLimiterConfig represents rate limiter configuration
type RateLimiterConfig struct {
	RequestsPerMinute int
	RedisClient       *infrastructure.RedisClient
}

// RateLimiter provides distributed rate limiting with Redis or in-memory fallback
type RateLimiter struct {
	config         RateLimiterConfig
	redisAvailable bool
	// In-memory fallback
	memoryStore map[string]*rateLimitEntry
	mu          sync.RWMutex
}

type rateLimitEntry struct {
	count      int
	resetTime  time.Time
	lastAccess time.Time
}

// NewRateLimiter creates a new rate limiter middleware
func NewRateLimiter(config RateLimiterConfig) gin.HandlerFunc {
	limiter := &RateLimiter{
		config:         config,
		redisAvailable: config.RedisClient != nil,
		memoryStore:    make(map[string]*rateLimitEntry),
	}

	// Start cleanup goroutine for in-memory store
	if !limiter.redisAvailable {
		go limiter.cleanupMemoryStore()
	}

	return func(c *gin.Context) {
		identifier := getIdentifier(c)

		// Check rate limit
		allowed, remaining, resetTime, err := limiter.checkRateLimit(c.Request.Context(), identifier)
		if err != nil {
			// On error, allow the request but log the error
			c.Next()
			return
		}

		// Set rate limit headers
		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", limiter.config.RequestsPerMinute))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", resetTime.Unix()))

		if !allowed {
			retryAfter := int(time.Until(resetTime).Seconds())
			c.Header("Retry-After", fmt.Sprintf("%d", retryAfter))

			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":       "Rate limit exceeded",
				"retry_after": retryAfter,
			})
			return
		}

		c.Next()
	}
}

// checkRateLimit checks if the request should be allowed
func (rl *RateLimiter) checkRateLimit(ctx context.Context, identifier string) (allowed bool, remaining int, resetTime time.Time, err error) {
	if rl.redisAvailable {
		return rl.checkRedisRateLimit(ctx, identifier)
	}
	return rl.checkMemoryRateLimit(identifier)
}

// checkRedisRateLimit uses Redis for distributed rate limiting
func (rl *RateLimiter) checkRedisRateLimit(ctx context.Context, identifier string) (bool, int, time.Time, error) {
	key := fmt.Sprintf("rate_limit:%s", identifier)
	window := 1 * time.Minute

	// Increment counter with expiry
	count, err := rl.config.RedisClient.IncrWithExpiry(ctx, key, window)
	if err != nil {
		return false, 0, time.Time{}, fmt.Errorf("redis incr failed: %w", err)
	}

	// Get TTL for reset time
	ttl, err := rl.config.RedisClient.TTL(ctx, key)
	if err != nil {
		ttl = window
	}

	resetTime := time.Now().Add(ttl)
	remaining := rl.config.RequestsPerMinute - int(count)
	if remaining < 0 {
		remaining = 0
	}

	allowed := count <= int64(rl.config.RequestsPerMinute)

	return allowed, remaining, resetTime, nil
}

// checkMemoryRateLimit uses in-memory store for rate limiting
func (rl *RateLimiter) checkMemoryRateLimit(identifier string) (bool, int, time.Time, error) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	entry, exists := rl.memoryStore[identifier]

	// Create new entry if doesn't exist or window has expired
	if !exists || now.After(entry.resetTime) {
		resetTime := now.Add(1 * time.Minute)
		rl.memoryStore[identifier] = &rateLimitEntry{
			count:      1,
			resetTime:  resetTime,
			lastAccess: now,
		}
		remaining := rl.config.RequestsPerMinute - 1
		return true, remaining, resetTime, nil
	}

	// Increment counter
	entry.count++
	entry.lastAccess = now

	remaining := rl.config.RequestsPerMinute - entry.count
	if remaining < 0 {
		remaining = 0
	}

	allowed := entry.count <= rl.config.RequestsPerMinute

	return allowed, remaining, entry.resetTime, nil
}

// cleanupMemoryStore periodically removes expired entries
func (rl *RateLimiter) cleanupMemoryStore() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for key, entry := range rl.memoryStore {
			// Remove entries that haven't been accessed in 10 minutes
			if now.Sub(entry.lastAccess) > 10*time.Minute {
				delete(rl.memoryStore, key)
			}
		}
		rl.mu.Unlock()
	}
}

// getIdentifier returns a unique identifier for rate limiting
func getIdentifier(c *gin.Context) string {
	// Use user ID if authenticated
	if userID, exists := c.Get("user_id"); exists {
		return fmt.Sprintf("user:%d", userID)
	}
	// Otherwise use IP address
	return fmt.Sprintf("ip:%s", c.ClientIP())
}

// DifferentRatesForAuth creates different rate limiters for authenticated and unauthenticated users
func DifferentRatesForAuth(redisClient *infrastructure.RedisClient) (gin.HandlerFunc, gin.HandlerFunc) {
	// Public endpoints: 20 requests per minute
	publicLimiter := NewRateLimiter(RateLimiterConfig{
		RequestsPerMinute: 20,
		RedisClient:       redisClient,
	})

	// Authenticated endpoints: 100 requests per minute
	authLimiter := NewRateLimiter(RateLimiterConfig{
		RequestsPerMinute: 100,
		RedisClient:       redisClient,
	})

	return publicLimiter, authLimiter
}
