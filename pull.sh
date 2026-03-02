#!/bin/bash
# Script de despliegue GeoterRA - Servidor reforesta01

# Salir inmediatamente si un comando falla
set -e

REPO_DIR="/home/proyecto/GeoterRA_DEV"
CONFIG_SOURCE="/home/proyecto/config.ini"
CONFIG_DEST="$REPO_DIR/API/config/config.ini"

echo "🚀 Iniciando actualización en $(date)"

# 1. Entrar al directorio del proyecto
cd "$REPO_DIR"

# 2. Actualizar desde Git
echo "📦 Trayendo cambios de Git (main)..."
git checkout main
git pull origin main

# 3. Sincronizar configuración (.ini)
echo "⚙️ Configurando variables de entorno..."

if [ -f "$CONFIG_SOURCE" ]; then
    # Nos aseguramos de que la carpeta exista (por si acaso)
    mkdir -p "$REPO_DIR/API/config"
    
    # Copiamos el archivo del home al repo
    cp "$CONFIG_SOURCE" "$CONFIG_DEST"
    
    # Ajustamos permisos para que PHP pueda leerlo pero no cualquiera
    chmod 644 "$CONFIG_DEST"
    
    echo "✅ Archivo config.ini sincronizado correctamente en API/config/"
else
    echo "❌ ERROR: No se encontró el archivo maestro $CONFIG_SOURCE"
    exit 1
fi

# 4. (Opcional) Si usas Composer en el servidor, descomenta la siguiente línea:
# composer install --no-dev --optimize-autoloader

echo "✨ Despliegue completado con éxito."
