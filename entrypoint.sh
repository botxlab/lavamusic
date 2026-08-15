#!/bin/sh
set -e

echo "🔄 Synchronizing SQLite schema..."

bun run db:push:sqlite

echo "✅ Database is ready"
echo "🎵 Starting Lavamusic..."

exec "$@"
