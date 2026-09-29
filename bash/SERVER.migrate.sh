#!/bin/bash
# ==============================================================================
# SCRIPT DE MIGRACIÓN Y CONTROL DE ESTADO DE BASE DE DATOS - GeoterRA
# ==============================================================================
# Rutas de instalación en el servidor:
#   - En el servidor web (CGI): /usr/lib/cgi-bin/SERVER.migrate.sh (o /var/www/cgi-bin/)
#
# Uso:
#   1. Consultar estado (GET):
#      curl -k https://163.178.171.105/cgi-bin/SERVER.migrate.sh
#
#   2. Actualizar Git (pull) y Ejecutar migraciones pendientes (POST):
#      curl -k -X POST -H 'X-Auth-Token: GeoterRA2026(!"#*' https://163.178.171.105/cgi-bin/SERVER.migrate.sh
# ==============================================================================

echo "Content-Type: text/plain; charset=utf-8"
echo ""

set -e

# ------------------------------------------------------------------------------
# 1. Parámetros y Directorios
# ------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Si no encuentra database/ en la ruta relativa (ej. ejecutado desde CGI)
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

# Asegurar que existan la base de datos y la tabla schema_migrations
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
# 2. Modo Consulta de Estado (GET)
# ------------------------------------------------------------------------------
if [ "$REQUEST_METHOD" == "GET" ] || [ "$1" == "--status" ]; then
    echo "📊 ========================================================"
    echo "   GEOTERRA - ESTADO ACTUAL DE LA BASE DE DATOS"
    echo "============================================================"
    echo "🗄️ Base de datos:  $DB_NAME"
    echo "📂 Migraciones:    $MIGRATIONS_DIR"
    echo ""

    # Obtener el último esquema aplicado
    LAST_MIGRATION=$("$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" -sN -e "
        SELECT CONCAT(\`migration_name\`, ' (Lote ', \`batch\`, ' | ', \`applied_at\`, ')')
        FROM \`schema_migrations\`
        ORDER BY \`migration_id\` DESC LIMIT 1;
    ")

    TOTAL_APPLIED=$("$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" -sN -e "
        SELECT COUNT(*) FROM \`schema_migrations\`;
    ")

    if [ -z "$LAST_MIGRATION" ]; then
        echo "📌 Último esquema aplicado: (Ninguno registrado en schema_migrations)"
    else
        echo "📌 Último esquema aplicado: $LAST_MIGRATION"
    fi
    echo "📋 Total migraciones en BD: $TOTAL_APPLIED"
    echo ""

    # Contar migraciones pendientes en disco
    APPLIED_LIST=$("$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" -sN -e "
        SELECT \`migration_name\` FROM \`schema_migrations\`;
    ")

    shopt -s nullglob
    MIGRATION_FILES=("$MIGRATIONS_DIR"/*.sql)
    shopt -u nullglob

    PENDING_COUNT=0
    for FILE_PATH in "${MIGRATION_FILES[@]}"; do
        M_NAME="$(basename "$FILE_PATH")"
        if ! echo "$APPLIED_LIST" | grep -qx "$M_NAME"; then
            PENDING_COUNT=$((PENDING_COUNT + 1))
            echo "   ⏳ Pendiente por aplicar: $M_NAME"
        fi
    done

    if [ $PENDING_COUNT -eq 0 ]; then
        echo "✨ Base de datos 100% al día. No hay migraciones pendientes."
    else
        echo ""
        echo "⚠️ Hay $PENDING_COUNT migración(es) pendiente(s). Ejecuta con POST para sincronizar Git y aplicarlas."
    fi
    echo "============================================================"

    unset MYSQL_PWD
    exit 0
fi

# ------------------------------------------------------------------------------
# 3. Validación de Seguridad (POST + Token)
# ------------------------------------------------------------------------------
EXPECTED_TOKEN='GeoterRA2026(!"#*'

if [ -n "$REQUEST_METHOD" ]; then
    if [ "$REQUEST_METHOD" != "POST" ]; then
        echo "Status: 405 Method Not Allowed"
        echo "❌ Error 405: Método no permitido. Utilice POST para migrar o GET para consultar."
        exit 1
    fi

    CLIENT_TOKEN="$HTTP_X_AUTH_TOKEN"
    if [ "$CLIENT_TOKEN" != "$EXPECTED_TOKEN" ]; then
        echo "Status: 401 Unauthorized"
        echo "⛔ Error 401: Token de seguridad inválido o no proporcionado."
        exit 1
    fi
fi

# ------------------------------------------------------------------------------
# 4. Control de Concurrencia (Lockfile)
# ------------------------------------------------------------------------------
LOCK_FILE="/tmp/geoterra_migrate.lock"
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
    echo "⚠️ Ya existe una migración de base de datos en progreso. Intente de nuevo más tarde."
    exit 1
fi

echo "🗄️ ========================================================"
echo "   GEOTERRA - MOTOR DE MIGRACIÓN DE BASE DE DATOS (SERVER)"
echo "============================================================"
echo "📂 Directorio de migraciones: $MIGRATIONS_DIR"
echo "🗄️ Base de datos objetivo:    $DB_NAME (Host: $DB_HOST)"

# ------------------------------------------------------------------------------
# 5. Sincronización Automática con Git (Pull de main antes de migrar)
# ------------------------------------------------------------------------------
echo ""
echo "📦 Trayendo últimos cambios de Git (rama main)..."
if [ -d "$PROJECT_ROOT/.git" ]; then
    cd "$PROJECT_ROOT"
    git config --global --add safe.directory "$PROJECT_ROOT" 2>/dev/null || true
    git checkout main 2>&1 || true
    PULL_OUTPUT=$(git pull origin main 2>&1 || true)
    echo "   $PULL_OUTPUT"
else
    echo "⚠️ Advertencia: No se detectó repositorio Git en $PROJECT_ROOT."
fi

# ------------------------------------------------------------------------------
# 6. Respaldo Preventivo Obligatorio
# ------------------------------------------------------------------------------
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${DB_DIR}/GeoterRA_[server]_${TIMESTAMP}.sql"

echo ""
echo "💾 Generando respaldo preventivo en: $(basename "$BACKUP_FILE")..."
if "$DUMP_BIN" --routines --triggers -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
    BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo "✅ Respaldo creado exitosamente ($BACKUP_SIZE)."
else
    echo "⚠️ Advertencia: No se pudo generar respaldo previo (la base de datos podría estar vacía)."
fi

# ------------------------------------------------------------------------------
# 7. Obtener Migraciones ya Aplicadas y Calcular Próximo Lote (Batch)
# ------------------------------------------------------------------------------
APPLIED_MIGRATIONS=$("$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" -sN -e "
    SELECT \`migration_name\` FROM \`schema_migrations\`;
")

NEXT_BATCH=$("$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" -sN -e "
    SELECT IFNULL(MAX(\`batch\`), 0) + 1 FROM \`schema_migrations\`;
")

# ------------------------------------------------------------------------------
# 8. Ejecución de Migraciones Pendientes
# ------------------------------------------------------------------------------
shopt -s nullglob
MIGRATION_FILES=("$MIGRATIONS_DIR"/*.sql)
shopt -u nullglob

if [ ${#MIGRATION_FILES[@]} -eq 0 ]; then
    echo "ℹ️ No se encontraron archivos .sql en $MIGRATIONS_DIR."
    unset MYSQL_PWD
    exit 0
fi

IFS=$'\n' SORTED_FILES=($(sort <<<"${MIGRATION_FILES[*]}"))
unset IFS

COUNT_APPLIED=0
COUNT_SKIPPED=0

echo ""
echo "🔍 Analizando migraciones..."

for FILE_PATH in "${SORTED_FILES[@]}"; do
    MIGRATION_NAME="$(basename "$FILE_PATH")"

    if echo "$APPLIED_MIGRATIONS" | grep -qx "$MIGRATION_NAME"; then
        COUNT_SKIPPED=$((COUNT_SKIPPED + 1))
        continue
    fi

    echo "🚀 Aplicando: $MIGRATION_NAME (Lote $NEXT_BATCH)..."

    set +e
    ERR_OUTPUT=$("$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" < "$FILE_PATH" 2>&1)
    EXIT_CODE=$?
    set -e

    if [ $EXIT_CODE -eq 0 ]; then
        "$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" -e "
            INSERT INTO \`schema_migrations\` (\`migration_name\`, \`batch\`, \`applied_at\`)
            VALUES ('$MIGRATION_NAME', $NEXT_BATCH, NOW());
        "
        echo "   ✅ Completada con éxito."
        COUNT_APPLIED=$((COUNT_APPLIED + 1))
    else
        echo "❌ ERROR al ejecutar $MIGRATION_NAME:"
        echo "$ERR_OUTPUT"
        echo ""
        echo "⛔ Proceso de migración abortado."
        unset MYSQL_PWD
        exit 1
    fi
done

# ------------------------------------------------------------------------------
# 9. Resumen Final
# ------------------------------------------------------------------------------
LAST_APPLIED_NOW=$("$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" -sN -e "
    SELECT \`migration_name\` FROM \`schema_migrations\` ORDER BY \`migration_id\` DESC LIMIT 1;
")

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
echo "📌 lastSchemaApplied: $LAST_APPLIED_NOW"
echo "============================================================"

unset MYSQL_PWD