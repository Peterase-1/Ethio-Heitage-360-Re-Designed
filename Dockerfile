# Use the official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy all server files
COPY server/ .

# Create necessary directories
RUN mkdir -p logs uploads tmp

# Set proper permissions
RUN chown -R node:node /app
USER node

# Expose the port
EXPOSE 10000

# Environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:10000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "server.js"]
