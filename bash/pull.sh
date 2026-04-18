#!/bin/bash
echo "Content-Type: text/plain; charset=utf-8"
echo ""

# Script de despliegue GeoterRA - Servidor reforesta01
set -e

REPO_DIR="/home/proyecto/GeoterRA_DEV"

echo "🚀 Iniciando actualización en $(date)"

cd "$REPO_DIR"

echo "📦 Trayendo cambios de Git (main)..."
git checkout main
git pull origin main

echo "Updating execution script in cgi-bin..."
sudo cp /home/proyecto/GeoterRA_DEV/pull.sh /var/www/cgi-bin/pull.sh
sudo chmod +x /var/www/cgi-bin/pull.sh

echo "✨ Despliegue completado con éxito."