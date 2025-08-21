#!/bin/bash

# Set DATABASE to first argument or empty string if not provided
DATABASE="${1:-}"

# Optional: Show usage if help is requested
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  echo "Usage: $0 [database_name]"
  echo "Example: $0 test"
  echo "If no database is specified, DATABASE will be empty"
  exit 0
fi

# Run the docker command with the specified database
docker compose run --rm --user $(id -u):$(id -g) -e DATABASE="$DATABASE" migrate