#!/bin/bash
set -e

echo "🔍 Checking if database needs initialization..."

# Si la base de datos no existe, correr migraciones
if [ ! -f /data/production.db ]; then
  echo "📦 Database not found. Running migrations..."
  npx prisma migrate deploy
  echo "✅ Database initialized successfully!"
else
  echo "✅ Database already exists. Checking for pending migrations..."
  npx prisma migrate deploy
fi

echo "🚀 Starting application..."
