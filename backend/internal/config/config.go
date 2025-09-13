package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost           string
	DBUser           string
	DBPassword       string
	DBName           string
	DBPort           string
	DBSSLMode        string
	UseSQLite        bool
	JWTSecret        string
	JWTRefreshSecret string
	JWTExpiryHours   int
	AppName          string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	jwtExpiryHours, _ := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "24"))

	useSQLite := getEnv("USE_SQLITE", "false") == "true"

	return &Config{
		DBHost:           getEnv("DB_HOST", "localhost"),
		DBUser:           getEnv("DB_USER", "postgres"),
		DBPassword:       getEnv("DB_PASSWORD", "postgres"),
		DBName:           getEnv("DB_NAME", "finance-management"),
		DBPort:           getEnv("DB_PORT", "5432"),
		DBSSLMode:        getEnv("DB_SSLMODE", "disable"),
		UseSQLite:        useSQLite,
		JWTSecret:        getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		JWTRefreshSecret: getEnv("JWT_REFRESH_SECRET", "your-refresh-secret-change-in-production"),
		JWTExpiryHours:   jwtExpiryHours,
		AppName:          getEnv("APP_NAME", "Finance Management"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
