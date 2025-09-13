 # Start from the official Golang image as the builder
FROM golang:1.24-alpine

WORKDIR /app

# Install development dependencies
RUN apk add --no-cache \
    git \
    curl \
    make \
    gcc \
    libc-dev

# Copy only go.mod first for better caching
COPY go.mod ./
RUN go mod download

# Install development tools
RUN go install github.com/air-verse/air@latest \
    && go install github.com/go-delve/delve/cmd/dlv@latest

COPY .air.toml ./

# No need to COPY . . as we'll use volume mounting
EXPOSE 8080
# Expose delve debugger port
EXPOSE 2345

# Run the application using air for hot reload
CMD ["air", "-c", ".air.toml"]