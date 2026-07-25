# ==============================================================================
# Stage 1: Build & Dependency Packaging
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci --only=production

# ==============================================================================
# Stage 2: Production Runtime
# ==============================================================================
FROM node:20-alpine AS runtime

# OCI Standard Metadata Labels
LABEL org.opencontainers.image.title="Real-Time Operations Dashboard"
LABEL org.opencontainers.image.description="Live operational telemetry and incident timeline tracking server with bidirectional WebSocket event streaming."
LABEL org.opencontainers.image.source="https://github.com/Borino88/realtime-operations-dashboard"
LABEL org.opencontainers.image.url="https://fattahi.xyz"
LABEL org.opencontainers.image.documentation="https://github.com/Borino88/realtime-operations-dashboard#readme"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.authors="Mahdi Fattahi <a.borino88@gmail.com>"

# Create unprivileged non-root runtime user and group
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -s /bin/sh -D appuser

WORKDIR /app

# Copy production node_modules from builder
COPY --from=builder /build/node_modules ./node_modules
COPY package.json ./
COPY server/ ./server/
COPY public/ ./public/

# Set ownership to unprivileged user
RUN chown -R appuser:appgroup /app

# Switch to non-root runtime user
USER appuser

# Health check endpoint verification
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/status').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

EXPOSE 3000

# Execute server as non-root user
CMD ["node", "server/index.js"]
