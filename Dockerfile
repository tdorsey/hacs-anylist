# Multi-stage Dockerfile for HACS AnyList - Production Environment
# This Dockerfile creates an optimized production image with minimal attack surface
# and is designed to support the TypeScript conversion project.
#
# Related to TypeScript conversion issue: #1

# Base Node.js image with Alpine Linux for minimal size
FROM node:18-alpine AS base
LABEL maintainer="HACS AnyList Team"
LABEL description="HACS AnyList Production Container"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Install only production system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S hacs -u 1001 -G nodejs

# Dependencies stage - install and cache dependencies
FROM base AS dependencies

# Copy package files for dependency installation
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --frozen-lockfile && \
    npm cache clean --force

# Build stage - compile TypeScript and prepare application
FROM base AS builder

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install ALL dependencies (needed for build)
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Build the application (compile TypeScript)
RUN npm run build && \
    npm prune --omit=dev

# Production stage - final optimized image
FROM base AS production

# Set production environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--enable-source-maps"

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=hacs:nodejs /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=hacs:nodejs /app/dist ./dist
COPY --from=builder --chown=hacs:nodejs /app/package*.json ./

# Copy other necessary files
COPY --chown=hacs:nodejs config/ ./config/
COPY --chown=hacs:nodejs scripts/ ./scripts/

# Create necessary directories
RUN mkdir -p /app/logs /app/tmp && \
    chown -R hacs:nodejs /app/logs /app/tmp

# Switch to non-root user
USER hacs

# Expose application port
EXPOSE 3000

# Health check for production
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]

# Metadata labels for the image
LABEL org.opencontainers.image.title="HACS AnyList"
LABEL org.opencontainers.image.description="Home Assistant Custom Component for AnyList integration"
LABEL org.opencontainers.image.vendor="HACS AnyList Team"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/tdorsey/hacs-anylist"