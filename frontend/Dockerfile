# =============================================================================
# Development stage for React + Vite application
# =============================================================================
FROM node:22-alpine AS development

# Install system dependencies and security tools
RUN apk add --no-cache \
    git \
    curl \
    dumb-init \
    tini \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reactuser -u 1001 -G nodejs

# Set working directory with proper permissions
WORKDIR /app
RUN chown -R reactuser:nodejs /app

# Switch to non-root user
USER reactuser

# Copy package files for optimal layer caching
COPY --chown=reactuser:nodejs package*.json ./

# Install dependencies with npm ci for faster, deterministic builds
RUN npm ci --only=production && \
    npm ci --only=development && \
    npm cache clean --force

# Copy source code (when not using volume mounting)
COPY --chown=reactuser:nodejs . .

# Expose ports for development server and React DevTools
EXPOSE 3000
EXPOSE 8097

# Health check for development
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["tini", "--"]

# Run development server with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# =============================================================================
# Build stage for production assets
# =============================================================================
FROM node:22-alpine AS build

# Install build dependencies
RUN apk add --no-cache \
    git \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S builduser -u 1001 -G nodejs

# Set working directory
WORKDIR /app
RUN chown -R builduser:nodejs /app

# Switch to non-root user
USER builduser

# Copy package files for layer caching
COPY --chown=builduser:nodejs package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --include=dev && \
    npm cache clean --force

# Copy source code
COPY --chown=builduser:nodejs . .

# Build the application with optimizations
ENV NODE_ENV=production
RUN npm run build && \
    ls -la dist/ && \
    du -sh dist/

# =============================================================================
# Production runtime stage with nginx
# =============================================================================
FROM nginx:1.25-alpine AS production

# Install runtime dependencies and security tools
RUN apk add --no-cache \
    dumb-init \
    tini \
    curl \
    && rm -rf /var/cache/apk/*

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user

# Create necessary directories and set permissions
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp \
             /var/log/nginx \
             /var/run && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html \
                                   /var/cache/nginx \
                                   /var/log/nginx \
                                   /var/run \
                                   /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /var/log/nginx

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 80

# Health check for production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["tini", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]