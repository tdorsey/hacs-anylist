# Multi-stage Dockerfile for HACS Anylist TypeScript Conversion
# Uses Node.js Alpine images for optimal performance and security

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ git

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Build the TypeScript application
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS production

# Install security updates
RUN apk upgrade --no-cache && \
    apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy production dependencies from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

# Copy additional files needed at runtime
COPY --chown=nextjs:nodejs custom_components ./custom_components
COPY --chown=nextjs:nodejs custom_sentences ./custom_sentences
COPY --chown=nextjs:nodejs hacs.json ./
COPY --chown=nextjs:nodejs README.md ./

# Switch to non-root user
USER nextjs

# Expose port (assuming the TypeScript version will run a web server)
EXPOSE 3000

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node --version || exit 1

# Use dumb-init as PID 1 to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default command
CMD ["node", "dist/index.js"]

# Stage 3: Development runtime
FROM node:20-alpine AS development

# Install development tools
RUN apk add --no-cache python3 make g++ git curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Install global development dependencies
RUN npm install -g nodemon ts-node typescript

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci && npm cache clean --force

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port for development server
EXPOSE 3000
EXPOSE 9229

# Development command with hot reload
CMD ["npm", "run", "dev"]