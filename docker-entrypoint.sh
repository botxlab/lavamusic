#!/bin/sh
set -e

# Auto-select Prisma schema based on DATABASE_URL prefix
if [ -n "$DATABASE_URL" ]; then
    case "$DATABASE_URL" in
        postgresql://*|postgres://*)
            echo "Detected PostgreSQL database, copying PostgreSQL schema..."
            cp prisma/example.postgresql.schema.prisma prisma/schema.prisma
            ;;
        mongodb://*|mongodb+srv://*)
            echo "Detected MongoDB database, copying MongoDB schema..."
            cp prisma/example.mongodb.schema.prisma prisma/schema.prisma
            ;;
        *)
            echo "Unknown DATABASE_URL prefix, using default SQLite schema..."
            ;;
    esac
else
    echo "DATABASE_URL not set, using default SQLite schema..."
fi

# Generate Prisma client
npx prisma generate

# Apply database migrations
npx prisma db push

# Execute command
exec "$@"
