# Stage 1: Build
FROM oven/bun:alpine AS builder

WORKDIR /opt/lavamusic

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files first for better layer caching
COPY package.json bun.lock ./

# Install dependencies using bun
RUN bun install --frozen-lockfile --verbose

# Copy remaining source files
COPY . .

# Build
RUN bun run build

# Stage 2: Production image
FROM oven/bun:alpine

ENV NODE_ENV=production \
    PORT=80 \
    TZ=UTC

WORKDIR /opt/lavamusic

# Install pnpm and runtime dependencies
RUN apk add --no-cache --virtual .runtime-deps \
    openssl \
    ca-certificates \
    tzdata \
    curl

# Copy package files for production dependencies
COPY --from=builder --chown=bun:bun /opt/lavamusic/package.json /opt/lavamusic/bun.lock ./

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Copy built files from builder
COPY --from=builder --chown=bun:bun /opt/lavamusic/dist ./dist
COPY --from=builder --chown=bun:bun /opt/lavamusic/locales ./locales

# Setup entrypoint
COPY --chown=bun:bun entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Create non-root user and set permissions
RUN chown -R bun:bun /opt/lavamusic
USER bun

# Metadata labels
LABEL maintainer="appujet <sdipedit@gmail.com>" \
      org.opencontainers.image.title="LavaMusic" \
      org.opencontainers.image.description="LavaMusic - Advanced Music Bot" \
      org.opencontainers.image.source="https://github.com/botxlab/lavamusic" \
      org.opencontainers.image.licenses="MIT"

ENTRYPOINT ["./entrypoint.sh"]
CMD ["bun", "dist/index.js"]
