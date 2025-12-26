package logger

import (
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/sirupsen/logrus"
)

// Logger is a wrapper around logrus.Logger with custom configuration
type Logger struct {
	*logrus.Logger
}

// Config holds logger configuration
type Config struct {
	Level       string // debug, info, warn, error
	Format      string // json, text
	Output      string // stdout, file, both
	FilePath    string // log file path (if output is file or both)
	Environment string // development, production
}

var (
	// DefaultLogger is the default logger instance
	DefaultLogger *Logger
)

// Init initializes the logger with given configuration
func Init(config Config) *Logger {
	logger := logrus.New()

	// Set log level
	level, err := logrus.ParseLevel(config.Level)
	if err != nil {
		level = logrus.InfoLevel
	}
	logger.SetLevel(level)

	// Set log format
	if config.Format == "json" || config.Environment == "production" {
		logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: time.RFC3339,
			FieldMap: logrus.FieldMap{
				logrus.FieldKeyTime:  "timestamp",
				logrus.FieldKeyLevel: "level",
				logrus.FieldKeyMsg:   "message",
			},
		})
	} else {
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp:   true,
			TimestampFormat: "2006-01-02 15:04:05",
			ForceColors:     true,
		})
	}

	// Set output
	switch config.Output {
	case "file":
		file := setupLogFile(config.FilePath)
		logger.SetOutput(file)
	case "both":
		file := setupLogFile(config.FilePath)
		logger.SetOutput(io.MultiWriter(os.Stdout, file))
	default:
		logger.SetOutput(os.Stdout)
	}

	// Add hooks for production
	if config.Environment == "production" {
		// Could add hooks here for error reporting services (e.g., Sentry)
	}

	DefaultLogger = &Logger{logger}
	return DefaultLogger
}

// setupLogFile creates and opens log file
func setupLogFile(filePath string) *os.File {
	if filePath == "" {
		filePath = "logs/app.log"
	}

	// Create logs directory if it doesn't exist
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		logrus.Warnf("Failed to create log directory: %v", err)
		return os.Stdout
	}

	// Open log file
	file, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		logrus.Warnf("Failed to open log file: %v", err)
		return os.Stdout
	}

	return file
}

// GetLogger returns the default logger instance
func GetLogger() *Logger {
	if DefaultLogger == nil {
		// Initialize with default config if not already initialized
		Init(Config{
			Level:       "info",
			Format:      "text",
			Output:      "stdout",
			Environment: "development",
		})
	}
	return DefaultLogger
}

// WithFields creates a new logger entry with fields
func WithFields(fields logrus.Fields) *logrus.Entry {
	return GetLogger().WithFields(fields)
}

// WithField creates a new logger entry with a single field
func WithField(key string, value interface{}) *logrus.Entry {
	return GetLogger().WithField(key, value)
}

// WithError creates a new logger entry with an error field
func WithError(err error) *logrus.Entry {
	return GetLogger().WithError(err)
}

// Debug logs a debug message
func Debug(args ...interface{}) {
	GetLogger().Debug(args...)
}

// Debugf logs a formatted debug message
func Debugf(format string, args ...interface{}) {
	GetLogger().Debugf(format, args...)
}

// Info logs an info message
func Info(args ...interface{}) {
	GetLogger().Info(args...)
}

// Infof logs a formatted info message
func Infof(format string, args ...interface{}) {
	GetLogger().Infof(format, args...)
}

// Warn logs a warning message
func Warn(args ...interface{}) {
	GetLogger().Warn(args...)
}

// Warnf logs a formatted warning message
func Warnf(format string, args ...interface{}) {
	GetLogger().Warnf(format, args...)
}

// Error logs an error message
func Error(args ...interface{}) {
	GetLogger().Error(args...)
}

// Errorf logs a formatted error message
func Errorf(format string, args ...interface{}) {
	GetLogger().Errorf(format, args...)
}

// Fatal logs a fatal message and exits
func Fatal(args ...interface{}) {
	GetLogger().Fatal(args...)
}

// Fatalf logs a formatted fatal message and exits
func Fatalf(format string, args ...interface{}) {
	GetLogger().Fatalf(format, args...)
}

// Panic logs a panic message and panics
func Panic(args ...interface{}) {
	GetLogger().Panic(args...)
}

// Panicf logs a formatted panic message and panics
func Panicf(format string, args ...interface{}) {
	GetLogger().Panicf(format, args...)
}
