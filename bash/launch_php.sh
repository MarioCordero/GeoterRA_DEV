#!/usr/bin/env bash
# ==============================================================================
# SCRIPT DE ARRANQUE DEL BACKEND (PHP DEV SERVER) - GeoterRA
# ==============================================================================
# 1. Asegura que el contenedor de base de datos en Docker esté levantado
#    (sin aplicar migraciones, únicamente garantizando el servicio activo).
# 2. Inicia el servidor de desarrollo PHP en http://localhost:8000.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🐘 ========================================================"
echo "   GEOTERRA - INICIANDO BACKEND PHP & BASE DE DATOS"
echo "============================================================"

# 1. Levantar el contenedor Docker si no está activo (sin ejecutar migraciones)
if [ -f "$SCRIPT_DIR/DOCKER.migrate.sh" ]; then
    echo "🐳 Verificando estado de la base de datos en Docker..."
    "$SCRIPT_DIR/DOCKER.migrate.sh" --start
fi

# 2. Arrancar el servidor web integrado de PHP
echo ""
echo "🚀 Servidor PHP escuchando en http://localhost:8000"
echo "   (Presione Ctrl+C para detener el servidor)"
echo "============================================================"
echo ""

cd "$PROJECT_ROOT"
exec php -S localhost:8000 -t API/public/
