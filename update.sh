#!/bin/bash
# SpellBound Update & Deploy Script
# Run this on your server to deploy or update SpellBound
#
# First time: ./update.sh
# Updates:    ./update.sh

set -e

IMAGE="ghcr.io/benslaughter/spellbound:latest"
DIR="$HOME/spellbound"

echo "=== SpellBound Deploy ==="

# Create directory if needed
mkdir -p "$DIR"
cd "$DIR"

# Create docker-compose.yml
cat > docker-compose.yml << 'COMPOSE'
services:
  spellbound:
    image: ghcr.io/benslaughter/spellbound:latest
    container_name: spellbound
    restart: unless-stopped
    ports:
      - "3003:3000"
    volumes:
      - spellbound-data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3000

volumes:
  spellbound-data:
COMPOSE

echo "Pulling latest image..."
docker pull "$IMAGE"

echo "Stopping current container..."
docker compose down 2>/dev/null || true

echo "Starting new container..."
docker compose up -d

echo "Cleaning old images..."
docker image prune -f

echo ""
echo "=== SpellBound deployed! ==="
echo "Access at http://localhost:3003"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f        # View logs"
echo "  docker compose restart         # Restart"
echo "  docker compose down            # Stop"
echo "  docker cp spellbound:/app/data/spellbound.db ./backup.db  # Backup DB"
