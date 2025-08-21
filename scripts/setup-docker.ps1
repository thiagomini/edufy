Write-Host "Setting up Edufy development environment (Docker)..."

Write-Host "Starting Docker container for Database"
docker compose up postgres --wait -d

Write-Host "Running migrations..."
& .\scripts\migrate.ps1

Write-Host "Migrations completed successfully."

Write-Host "Starting the application..."
docker compose up app-prod