# Frontend Docker Configuration

This document explains the Docker setup for the React frontend application with Vite.

## Multi-Stage Dockerfile

The Dockerfile uses a multi-stage build approach:

### Stage 1: Development
- **Base**: Node.js 22 Alpine
- **User**: Non-root `node` user for security
- **Features**: Hot reload, file watching, React DevTools support
- **Ports**: 3000 (dev server), 8097 (React DevTools)

### Stage 2: Build
- **Purpose**: Compile TypeScript and build production assets
- **Output**: Optimized static files in `/dist`

### Stage 3: Production
- **Base**: Nginx Alpine
- **Features**: Optimized static file serving, security headers, gzip compression
- **User**: Non-root `nextjs` user
- **Port**: 80

## Key Features

### Security Improvements
- ✅ Non-root user execution
- ✅ Proper file permissions
- ✅ Security headers in nginx
- ✅ Signal handling with dumb-init

### Performance Optimizations
- ✅ Layer caching with separate package.json copy
- ✅ npm ci for faster, reliable installs
- ✅ Gzip compression in production
- ✅ Static asset caching
- ✅ Code splitting (vendor, MUI chunks)

### Development Experience
- ✅ Hot Module Replacement (HMR)
- ✅ File watching with polling (Docker-compatible)
- ✅ React DevTools support
- ✅ Volume mounting for live code changes

## Usage

### Development
```bash
# Using docker-compose (recommended)
docker-compose -f docker-compose.local.yml up frontend

# Or build manually
docker build --target development -t finance-frontend-dev ./frontend
docker run -p 3000:3000 -p 8097:8097 -v $(pwd)/frontend:/home/node/app finance-frontend-dev
```

### Production
```bash
# Using docker-compose
docker-compose -f docker-compose.prod.yml up frontend

# Or build manually
docker build --target production -t finance-frontend-prod ./frontend
docker run -p 80:80 finance-frontend-prod
```

## Environment Variables

### Development
- `NODE_ENV=development`
- `CHOKIDAR_USEPOLLING=true` - Enables file watching in Docker

### Production
- `NODE_ENV=production`
- No additional environment variables needed

## Vite Configuration

The `vite.config.ts` has been optimized for Docker:

- **Host binding**: `0.0.0.0` for external access
- **File watching**: Polling enabled for Docker compatibility
- **HMR port**: 8097 for React DevTools
- **Build optimization**: Code splitting and chunk optimization

## Nginx Configuration

Production uses a custom nginx configuration with:

- **SPA routing**: Fallback to index.html for client-side routing
- **Static caching**: 1-year cache for assets
- **Security headers**: XSS protection, content type sniffing prevention
- **Gzip compression**: Optimized for web assets
- **Health check**: `/health` endpoint

## Troubleshooting

### Hot Reload Not Working
- Ensure `CHOKIDAR_USEPOLLING=true` is set
- Check volume mounting is correct
- Verify ports 3000 and 8097 are exposed

### Build Failures
- Clear Docker cache: `docker system prune`
- Check .dockerignore excludes unnecessary files
- Verify Node.js version compatibility

### Permission Issues
- Ensure proper user permissions in Dockerfile
- Check volume mount permissions on host

## Best Practices

1. **Use multi-stage builds** for smaller production images
2. **Run as non-root user** for security
3. **Use .dockerignore** to exclude unnecessary files
4. **Enable file watching polling** for Docker development
5. **Implement proper signal handling** with dumb-init
6. **Cache dependencies** with separate package.json copy
7. **Optimize nginx** for static file serving
