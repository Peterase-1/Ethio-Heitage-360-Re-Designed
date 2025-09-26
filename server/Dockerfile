# ==============================================
# EthioHeritage360 Backend Dockerfile
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
RUN npm ci --only=development

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=development

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start development server with hot reload
CMD ["npm", "run", "dev"]

# ==============================================
# Production Build Stage
# ==============================================
FROM base AS build

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# ==============================================
# Production Stage
# ==============================================
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ethioheritage -u 1001

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy production dependencies and built app
COPY --from=build --chown=ethioheritage:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=ethioheritage:nodejs /app .

# Create logs directory
RUN mkdir -p logs && chown ethioheritage:nodejs logs

# Switch to non-root user
USER ethioheritage

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start production server
CMD ["npm", "start"]
