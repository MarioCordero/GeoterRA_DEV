#!/bin/bash
# ==============================================================================
# SCRIPT DE MIGRACIÓN DE BASE DE DATOS (INCREMENTAL) - GeoterRA
# ==============================================================================
# Rutas de instalación en el servidor:
#   - En el servidor web (CGI): /var/www/cgi-bin/migrate.sh (o /usr/lib/cgi-bin/migrate.sh)
#
# Para desplegar en CGI-BIN:
#   sudo chmod +x /var/www/cgi-bin/migrate.sh
#
# Invocación remota con curl (ejemplo):
#   curl -X POST -H 'X-Auth-Token: GeoterRA2026(!"#*' https://tu-servidor.com/cgi-bin/migrate.sh
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
LOCK_FILE="/tmp/geoterra_migrate.lock"
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
    echo "⚠️ Ya existe una migración de base de datos en progreso. Intente de nuevo más tarde."
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
MIGRATIONS_DIR="$DB_DIR/migrations"

DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-g3ot3rR4}"
DB_NAME="${DB_NAME:-GeoterRA}"

MYSQL_BIN=$(command -v mariadb || command -v mysql)
DUMP_BIN=$(command -v mariadb-dump || command -v mysqldump)

export MYSQL_PWD="$DB_PASS"

echo "🗄️ ========================================================"
echo "   GEOTERRA - MOTOR DE MIGRACIÓN DE BASE DE DATOS (SERVER)"
echo "============================================================"
echo "📂 Directorio de migraciones: $MIGRATIONS_DIR"
echo "🗄️ Base de datos objetivo:    $DB_NAME (Host: $DB_HOST)"

# ------------------------------------------------------------------------------
# 5. Verificación de Directorio de Migraciones
# ------------------------------------------------------------------------------
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Error: Directorio de migraciones no encontrado: $MIGRATIONS_DIR"
    unset MYSQL_PWD
    exit 1
fi

# ------------------------------------------------------------------------------
# 6. Inicializar Base de Datos y Tabla schema_migrations si no existen
# ------------------------------------------------------------------------------
"$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" -e "
    CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
"

"$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" -e "
    CREATE TABLE IF NOT EXISTS \`schema_migrations\` (
      \`migration_id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      \`migration_name\` VARCHAR(191) NOT NULL,
      \`batch\` INT UNSIGNED NOT NULL DEFAULT 1,
      \`applied_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY \`unique_migration_name\` (\`migration_name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
"

# ------------------------------------------------------------------------------
# 7. Respaldo Preventivo Obligatorio de la Base de Datos
# ------------------------------------------------------------------------------
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${DB_DIR}/GeoterRA_[server]_${TIMESTAMP}.sql"

echo "💾 Generando respaldo preventivo en: $(basename "$BACKUP_FILE")..."
if "$DUMP_BIN" --routines --triggers -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
    BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo "✅ Respaldo creado exitosamente ($BACKUP_SIZE)."
else
    echo "⚠️ Advertencia: No se pudo generar respaldo previo (la base de datos podría estar vacía)."
fi

# ------------------------------------------------------------------------------
# 8. Obtener Migraciones ya Aplicadas y Calcular Próximo Lote (Batch)
# ------------------------------------------------------------------------------
APPLIED_MIGRATIONS=$("$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" -sN -e "
    SELECT \`migration_name\` FROM \`schema_migrations\`;
")

NEXT_BATCH=$("$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" -sN -e "
    SELECT IFNULL(MAX(\`batch\`), 0) + 1 FROM \`schema_migrations\`;
")

# ------------------------------------------------------------------------------
# 9. Ejecución de Migraciones Pendientes
# ------------------------------------------------------------------------------
shopt -s nullglob
MIGRATION_FILES=("$MIGRATIONS_DIR"/*.sql)
shopt -u nullglob

if [ ${#MIGRATION_FILES[@]} -eq 0 ]; then
    echo "ℹ️ No se encontraron archivos .sql en $MIGRATIONS_DIR."
    unset MYSQL_PWD
    exit 0
fi

# Ordenar archivos alfabéticamente
IFS=$'\n' SORTED_FILES=($(sort <<<"${MIGRATION_FILES[*]}"))
unset IFS

COUNT_APPLIED=0
COUNT_SKIPPED=0

echo ""
echo "🔍 Analizando migraciones..."

for FILE_PATH in "${SORTED_FILES[@]}"; do
    MIGRATION_NAME="$(basename "$FILE_PATH")"

    # Comprobar si ya fue aplicada
    if echo "$APPLIED_MIGRATIONS" | grep -qx "$MIGRATION_NAME"; then
        COUNT_SKIPPED=$((COUNT_SKIPPED + 1))
        continue
    fi

    echo "🚀 Aplicando: $MIGRATION_NAME (Lote $NEXT_BATCH)..."

    # Ejecutar la migración
    if "$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" < "$FILE_PATH"; then
        # Registrar migración exitosa
        "$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" -e "
            INSERT INTO \`schema_migrations\` (\`migration_name\`, \`batch\`, \`applied_at\`)
            VALUES ('$MIGRATION_NAME', $NEXT_BATCH, NOW());
        "
        echo "   ✅ Completada con éxito."
        COUNT_APPLIED=$((COUNT_APPLIED + 1))
    else
        echo "❌ ERROR: Falló la migración $MIGRATION_NAME. El proceso ha sido abortado."
        unset MYSQL_PWD
        exit 1
    fi
done

# ------------------------------------------------------------------------------
# 10. Resumen Final
# ------------------------------------------------------------------------------
echo ""
echo "============================================================"
if [ $COUNT_APPLIED -eq 0 ]; then
    echo "✨ Base de datos al día. No hay migraciones pendientes ($COUNT_SKIPPED ya aplicadas)."
else
    echo "🎉 Proceso de migración finalizado exitosamente."
    echo "   - Migraciones aplicadas en este lote: $COUNT_APPLIED"
    echo "   - Migraciones previas omitidas:        $COUNT_SKIPPED"
    echo "   - Número de Lote (Batch):              $NEXT_BATCH"
fi
echo "============================================================"

unset MYSQL_PWD