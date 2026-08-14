#!/bin/sh
set -e

echo "🔒 Fixing permissions for /app..."
chown -R bun:bun /app

echo "🚀 Starting Lavamusic container..."

if echo "$DATABASE_URL" | grep -qE "^sqlite:|file:.*\.db$|file:.*\.sqlite$|\.db$|\.sqlite$"; then
  echo "📂 Detected SQLite database configuration."
  echo "🔄 Synchronizing SQLite schema..."

  bun run db:push:sqlite
else
  echo "🐘 Detected PostgreSQL / PGLite configuration."
  echo "🔄 Synchronizing PostgreSQL schema..."

  bun run db:push
fi

echo "✅ Database is ready"
echo "🎵 Starting Lavamusic..."

exec "$@"
