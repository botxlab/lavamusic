#!/bin/sh

# Run database migrations
echo "Running database initialization..."
bun run generate
bun run push

# Start the application
echo "Starting LavaMusic..."
exec "$@"
