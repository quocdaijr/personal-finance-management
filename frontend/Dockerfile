# =============================================================================
# Multi-stage Dockerfile for React + Vite application
# Optimized for React 19, Vite 6.1.1, and modern development workflows
# =============================================================================

# =============================================================================
# Development stage - Optimized for hot reload and development workflow
# =============================================================================
FROM node:22-alpine AS development

# Install system dependencies and security tools
RUN apk add --no-cache \
    git \
    curl \
    tini \
    dumb-init \
    ca-certificates \
    && rm -rf /var/cache/apk/* \
    && update-ca-certificates

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reactuser -u 1001 -G nodejs

# Set working directory with proper permissions
WORKDIR /app
RUN chown -R reactuser:nodejs /app

# Switch to non-root user early for security
USER reactuser

# Copy package files for optimal layer caching
COPY --chown=reactuser:nodejs package*.json ./

# Install dependencies with optimized strategy
# Use npm ci for faster, deterministic builds
RUN npm ci --prefer-offline --no-audit --no-fund && \
    npm cache clean --force

# Copy source code (when not using volume mounting)
COPY --chown=reactuser:nodejs . .

# Expose ports for development server and React DevTools
EXPOSE 3000 8097

# Health check optimized for Vite dev server
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Use tini for proper signal handling and zombie process reaping
ENTRYPOINT ["tini", "--"]

# Run development server with optimized Vite settings
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# =============================================================================
# Build stage - Optimized for production asset compilation
# =============================================================================
FROM node:22-alpine AS build

# Install build dependencies including native compilation tools
RUN apk add --no-cache \
    git \
    curl \
    python3 \
    make \
    g++ \
    ca-certificates \
    && rm -rf /var/cache/apk/* \
    && update-ca-certificates

# Create non-root user for build process
RUN addgroup -g 1001 -S nodejs && \
    adduser -S builduser -u 1001 -G nodejs

# Set working directory with proper permissions
WORKDIR /app
RUN chown -R builduser:nodejs /app

# Switch to non-root user for security
USER builduser

# Copy package files for optimal layer caching
COPY --chown=builduser:nodejs package*.json ./

# Install all dependencies including devDependencies for build
# Use npm ci for deterministic builds
RUN npm ci --include=dev --prefer-offline --no-audit --no-fund && \
    npm cache clean --force

# Copy source code for build
COPY --chown=builduser:nodejs . .

# Set production environment and build optimizations
ENV NODE_ENV=production
ENV VITE_BUILD_TARGET=production

# Build the application with Vite optimizations
RUN npm run build && \
    echo "Build completed successfully" && \
    ls -la dist/ && \
    du -sh dist/ && \
    echo "Build artifacts ready for production"

# =============================================================================
# Production runtime stage - Optimized nginx serving with security
# =============================================================================
FROM nginx:1.25-alpine AS production

# Install runtime dependencies and security tools
RUN apk add --no-cache \
    tini \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/* \
    && update-ca-certificates

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing and optimization
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user for enhanced security
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user

# Create necessary directories with proper permissions
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp \
             /var/log/nginx \
             /var/run \
             /tmp/nginx && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html \
                                   /var/cache/nginx \
                                   /var/log/nginx \
                                   /var/run \
                                   /tmp/nginx \
                                   /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /var/log/nginx && \
    chmod -R 755 /tmp/nginx

# Switch to non-root user for security
USER nginx-user

# Expose standard HTTP port
EXPOSE 80

# Health check optimized for production SPA
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:80/health || curl -f http://localhost:80/ || exit 1

# Use tini for proper signal handling and process management
ENTRYPOINT ["tini", "--"]

# Start nginx with optimized configuration
CMD ["nginx", "-g", "daemon off;"]

# =============================================================================
# Development-optimized stage for volume mounting
# =============================================================================
FROM development AS development-volume

# This stage is optimized for volume mounting in development
# It skips copying source code since it will be mounted as a volume
# Copy only package files and install dependencies
COPY --chown=reactuser:nodejs package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund && \
    npm cache clean --force

# Create placeholder directories for volume mounting
RUN mkdir -p src public && \
    chown -R reactuser:nodejs src public

# Use tini for proper signal handling
ENTRYPOINT ["tini", "--"]

# Start development server optimized for volume mounting
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]