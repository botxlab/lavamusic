# Builder stage
FROM oven/bun:alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# Runtime stage
FROM oven/bun:alpine

WORKDIR /app

COPY --from=builder --chown=bun:bun /app/dist ./dist
COPY --from=builder --chown=bun:bun /app/locales ./locales
COPY --from=builder --chown=bun:bun /app/package.prod.json ./package.json
COPY --from=builder --chown=bun:bun /app/drizzle ./drizzle
COPY --from=builder --chown=bun:bun /app/drizzle.config.ts /app/drizzle.config.sqlite.ts ./
COPY --from=builder --chown=bun:bun /app/src/env.ts ./src/env.ts
COPY --from=builder --chown=bun:bun /app/src/database/schemas.ts /app/src/database/schemas.sqlite.ts ./src/database/

RUN apk add --no-cache su-exec &&\
  bun install --production --frozen-lockfile &&\
  # pglite.wasm & pglite.data symlink from /app/dist
  PGLITE_PKG="node_modules/@electric-sql/pglite/dist" &&\
  rm "$PGLITE_PKG/pglite.wasm" &&\
  rm "$PGLITE_PKG/pglite.data" &&\
  ln -s /app/dist/pglite.wasm "$PGLITE_PKG/pglite.wasm" &&\
  ln -s /app/dist/pglite.data "$PGLITE_PKG/pglite.data" &&\
  # Cleanup
  bunx clean-modules "**/*.d.ts" "**/@types/**" "**/*.map" "**/test/**" "**/tests/**" -y &&\
  rm -rf ~/.bun /tmp /var/cache/apk /lib/apk/db\
  /app/node_modules/@esbuild* /app/node_modules/.bin/esbuild /app/node_modules/@libsql/linux-arm64-gnu

COPY --chown=bun:bun entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

RUN mkdir -p /app/lavamusic-pgdata && chown -R bun:bun /app/lavamusic-pgdata

ENTRYPOINT [ "./entrypoint.sh" ]

CMD ["bun", "run", "start"]

# Metadata labels
LABEL \
  maintainer="appujet <sdipedit@gmail.com>" \
  org.opencontainers.image.title="LavaMusic" \
  org.opencontainers.image.description="LavaMusic - Advanced Music Bot" \
  org.opencontainers.image.source="https://github.com/bongodevs/lavamusic" \
  org.opencontainers.image.licenses="MIT"
