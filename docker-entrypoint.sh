#!/bin/sh
set -e

# Apply any pending schema migrations against the configured DATABASE_URL
# before the server starts. Safe to run every boot — a no-op when the
# database is already up to date.
echo "Running database migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma

# Optionally seed reference/demo data. OFF by default so a real deployment
# never wipes live data — set SEED_ON_START=true only for a fresh pilot DB.
if [ "$SEED_ON_START" = "true" ]; then
  echo "SEED_ON_START=true — seeding database..."
  npx tsx prisma/seed.ts
fi

exec "$@"
