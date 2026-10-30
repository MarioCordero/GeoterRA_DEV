#!/bin/bash
echo "Content-Type: text/plain; charset=utf-8"
echo ""

# Script de despliegue GeoterRA - Servidor reforesta01
set -e

REPO_DIR="/home/proyecto/GeoterRA_DEV"

echo "🚀 Iniciando actualización en $(date)"

cd "$REPO_DIR"

echo "📦 Trayendo cambios de Git (main)..."
# Descartar cambios locales y forzar sincronización limpia con origin/main
git fetch origin main
git checkout main
git reset --hard origin/main

# 🔑 Generar config de runtime a partir de /home/proyecto/.env o /home/proyecto/api-keys.php
ENV_FILE="/home/proyecto/.env"
API_KEYS_PHP="/home/proyecto/api-keys.php"
CONFIG_JS="$REPO_DIR/website/dist/config.js"

API_KEY=""

# 1. Intentar leer desde .env
if [ -f "$ENV_FILE" ]; then
  API_KEY=$(grep -m1 '^VITE_API_KEY=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '\r\n"' | sed 's/\\/\\\\/g')
fi

# 2. Fallback: extraer clave 'web' de api-keys.php si no se encontró en .env
if [ -z "$API_KEY" ] && [ -f "$API_KEYS_PHP" ] && command -v php >/dev/null 2>&1; then
  API_KEY=$(php -r '$k = @include "'"$API_KEYS_PHP"'"; if (is_array($k)) { echo array_search("web", $k) ?: ""; }' 2>/dev/null || true)
fi

# 3. Validar e inyectar en config.js
if [ -n "$API_KEY" ]; then
  mkdir -p "$(dirname "$CONFIG_JS")"
  printf 'window.__APP_CONFIG__ = { API_KEY: "%s" };\n' "$API_KEY" > "$CONFIG_JS"
  chmod 664 "$CONFIG_JS" 2>/dev/null || chmod 644 "$CONFIG_JS" 2>/dev/null || true
  echo "🔑 config.js generado exitosamente con API Key."
else
  echo "❌ ERROR CRÍTICO: No se encontró la API Key en $ENV_FILE ni en $API_KEYS_PHP."
  echo "❌ No se modificó config.js para evitar romper el frontend."
  exit 1
fi

echo "✨ Actualización completada con éxito."