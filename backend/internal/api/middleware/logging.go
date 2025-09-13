package middleware

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// LoggingMiddleware logs all requests and responses
func LoggingMiddleware() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format(time.RFC1123),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	})
}

// RequestResponseLogger logs detailed request and response information
func RequestResponseLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Log request
		var requestBody []byte
		if c.Request.Body != nil {
			requestBody, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
		}

		log.Printf("Request: %s %s - Body: %s", c.Request.Method, c.Request.URL.Path, string(requestBody))

		// Capture response
		writer := &responseWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = writer

		// Process request
		c.Next()

		// Log response
		log.Printf("Response: %d - Body: %s", writer.Status(), writer.body.String())
	}
}

type responseWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (r responseWriter) Write(b []byte) (int, error) {
	r.body.Write(b)
	return r.ResponseWriter.Write(b)
}
