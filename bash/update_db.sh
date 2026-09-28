#!/bin/bash
# ==============================================================================
# SCRIPT DE ACTUALIZACIÓN DE BASE DE DATOS - GeoterRA
# ==============================================================================
# Rutas de instalación en el servidor:
#   - En el repositorio: /home/proyecto/GeoterRA_DEV/bash/update_db.sh
#   - En el servidor web (CGI): /var/www/cgi-bin/update_db.sh (o /usr/lib/cgi-bin/update_db.sh)
#
# Para desplegar en CGI-BIN:
#   sudo cp /home/proyecto/GeoterRA_DEV/bash/update_db.sh /var/www/cgi-bin/update_db.sh
#   sudo chmod +x /var/www/cgi-bin/update_db.sh
#
# Ejemplo de invocación con curl:
#   curl -X POST -H 'X-Auth-Token: GeoterRA2026(!"#*' https://tu-servidor.com/cgi-bin/update_db.sh
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Cabeceras HTTP para CGI
# ------------------------------------------------------------------------------
echo "Content-Type: text/plain; charset=utf-8"

# ------------------------------------------------------------------------------
# 2. Validación de Seguridad (Token y Método HTTP)
# ------------------------------------------------------------------------------
EXPECTED_TOKEN='GeoterRA2026(!"#*'

# Si se invoca a través de un servidor web (CGI)
if [ -n "$REQUEST_METHOD" ]; then
    # Validar que sea método POST
    if [ "$REQUEST_METHOD" != "POST" ]; then
        echo "Status: 405 Method Not Allowed"
        echo ""
        echo "❌ Error 405: Método no permitido. Debe utilizar POST."
        exit 1
    fi

    # Validar Token de autenticación (Header HTTP: X-Auth-Token -> $HTTP_X_AUTH_TOKEN)
    CLIENT_TOKEN="$HTTP_X_AUTH_TOKEN"
    if [ "$CLIENT_TOKEN" != "$EXPECTED_TOKEN" ]; then
        echo "Status: 401 Unauthorized"
        echo ""
        echo "⛔ Error 401: No autorizado. Token de seguridad inválido o no proporcionado."
        exit 1
    fi
fi

echo ""
set -e

# ------------------------------------------------------------------------------
# 3. Control de Concurrencia (Lockfile)
# ------------------------------------------------------------------------------
LOCK_FILE="/tmp/geoterra_update_db.lock"
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
    echo "⚠️ Ya existe una actualización de base de datos en progreso. Intente de nuevo más tarde."
    exit 1
fi

# ------------------------------------------------------------------------------
# 4. Parámetros y Directorios
# ------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Si no encuentra database/ en la ruta relativa (ej. ejecutado desde /var/www/cgi-bin)
if [ ! -d "$PROJECT_ROOT/database" ] && [ -d "/home/proyecto/GeoterRA_DEV/database" ]; then
    PROJECT_ROOT="/home/proyecto/GeoterRA_DEV"
fi

DB_DIR="$PROJECT_ROOT/database"
DB_USER="root"
DB_PASS="g3ot3rR4"
DB_NAME="GeoterRA"

# Archivo de esquema a cargar (por defecto GeoterRA_schema.sql)
SQL_FILE="${1:-$DB_DIR/GeoterRA_schema.sql}"

# Nombre del archivo de respaldo con timestamp
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${DB_DIR}/GeoterRA_[server]_${TIMESTAMP}.sql"

echo "🗄️ Iniciando actualización de Base de Datos ($DB_NAME)..."
echo "📂 Directorio de base de datos: $DB_DIR"
echo "📄 Archivo de esquema a importar: $SQL_FILE"

# Validar que el archivo de esquema exista antes de tocar la base de datos
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: El archivo de esquema no existe en: $SQL_FILE"
    exit 1
fi

# ------------------------------------------------------------------------------
# 5. Respaldo obligatorio de la base actual
# ------------------------------------------------------------------------------
echo "💾 Creando respaldo de la base de datos actual en $BACKUP_FILE..."
if mysqldump --routines --triggers -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"; then
    echo "✅ Respaldo generado con éxito ($(ls -lh "$BACKUP_FILE" | awk '{print $5}'))."
else
    echo "❌ Error al generar el respaldo. Operación cancelada para proteger los datos."
    exit 1
fi

# ------------------------------------------------------------------------------
# 6. Eliminar y volver a crear la base de datos limpia
# ------------------------------------------------------------------------------
echo "🗑️ Eliminando y recreando la base de datos '$DB_NAME'..."
mysql -u"$DB_USER" -p"$DB_PASS" -e "DROP DATABASE IF EXISTS \`$DB_NAME\`; CREATE DATABASE \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# ------------------------------------------------------------------------------
# 7. Cargar el nuevo esquema
# ------------------------------------------------------------------------------
echo "📤 Cargando nuevo esquema desde $(basename "$SQL_FILE")..."
mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE"

echo "✅ Base de datos recreada y nuevo esquema aplicado con éxito."