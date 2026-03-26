#!/bin/bash
# Deploy SpellBound to home server
# Run this on the server, or use SSH to execute remotely

set -e

IMAGE="ghcr.io/benslaughter/spellbound:latest"

echo "Pulling latest image..."
docker pull "$IMAGE"

echo "Stopping current container..."
docker compose down || true

echo "Starting new container..."
docker compose up -d

echo "Cleaning old images..."
docker image prune -f

echo "SpellBound deployed! Access at http://localhost:3003"
