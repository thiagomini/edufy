echo "Setting up Edufy development environment (Docker)..."

echo "🛠️ Starting Docker container for Database"

docker compose up postgres --wait -d

chmod +x scripts/migrate.sh

echo "🔄 Running migrations..."
./scripts/migrate.sh

echo "✅ Migrations completed successfully."

echo "🚀 Starting the application..."

docker compose up app-prod