# ==============================================
# EthioHeritage360 Frontend Dockerfile
# ==============================================

# Use Node.js 18 LTS as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# ==============================================
# Development Stage
# ==============================================
FROM base AS development

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start development server
CMD ["npm", "start"]

# ==============================================
# Build Stage
# ==============================================
FROM base AS build

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# ==============================================
# Production Stage with Nginx
# ==============================================
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S ethioheritage && \
    adduser -S ethioheritage -u 1001

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built React app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy environment configuration script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Change ownership of nginx directories
RUN chown -R ethioheritage:ethioheritage /var/cache/nginx && \
    chown -R ethioheritage:ethioheritage /var/log/nginx && \
    chown -R ethioheritage:ethioheritage /etc/nginx/conf.d && \
    chown -R ethioheritage:ethioheritage /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown -R ethioheritage:ethioheritage /var/run/nginx.pid

# Switch to non-root user
USER ethioheritage

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start Nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
