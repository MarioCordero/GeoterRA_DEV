#!/bin/bash
echo "Content-Type: text/plain; charset=utf-8"
echo ""

# Script de despliegue GeoterRA - Servidor reforesta01
set -e

REPO_DIR="/home/proyecto/GeoterRA_DEV"

echo "🚀 Iniciando actualización en $(date)"

cd "$REPO_DIR"

echo "📦 Trayendo cambios de Git (main)..."
# config.js se regenera en cada despliegue; descartar la versión modificada
# localmente para que el pull no genere conflictos.
git checkout -- website/dist/config.js 2>/dev/null || true
git checkout main
git pull origin main

# 🔑 Generar config de runtime a partir de /home/proyecto/.env (fuera del repo)
ENV_FILE="/home/proyecto/.env"
CONFIG_JS="$REPO_DIR/website/dist/config.js"

if [ -f "$ENV_FILE" ]; then
  API_KEY=$(grep -m1 '^VITE_API_KEY=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '\r\n"' | sed 's/\\/\\\\/g')
  if [ -n "$API_KEY" ]; then
    printf 'window.__APP_CONFIG__ = { API_KEY: "%s" };\n' "$API_KEY" > "$CONFIG_JS"
    echo "🔑 config.js generado desde $ENV_FILE"
  else
    echo "⚠️  VITE_API_KEY no encontrada en $ENV_FILE"
  fi
else
  echo "⚠️  No existe $ENV_FILE; el frontend no tendrá API key"
fi

echo "✨ Actualización completada con éxito."