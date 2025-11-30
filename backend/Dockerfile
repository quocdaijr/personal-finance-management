# Start from the official Golang image as the builder
FROM golang:1.23-alpine

WORKDIR /app

# Install development dependencies
RUN apk add --no-cache \
    git \
    curl \
    make \
    gcc \
    libc-dev

# Copy go.mod and go.sum first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Install development tools
RUN go install github.com/air-verse/air@v1.52.3 \
    && go install github.com/go-delve/delve/cmd/dlv@latest

# Copy all source code
COPY . .

EXPOSE 8080
# Expose delve debugger port
EXPOSE 2345

# Run the application using air for hot reload
CMD ["air", "-c", ".air.toml"]