#!/usr/bin/env bash
# ==============================================================================
# SCRIPT DE MIGRACIÓN Y CONTROL DE BASE DE DATOS EN DOCKER - GeoterRA
# ==============================================================================
# Actúa como el motor de producción (SERVER.migrate.sh), pero orquestando un
# contenedor MariaDB local persistente mediante Docker.
#
# Uso:
#   1. Aplicar migraciones pendientes (por defecto):
#      ./bash/DOCKER.migrate.sh
#
#   2. Consultar estado local de migraciones:
#      ./bash/DOCKER.migrate.sh --status
#
#   3. Comparar estado local (Docker) vs Producción (CGI cURL):
#      ./bash/DOCKER.migrate.sh --compare-prod
#
#   4. Generar respaldo preventivo manual:
#      ./bash/DOCKER.migrate.sh --backup
#
#   5. Detener / Iniciar / Reiniciar contenedor:
#      ./bash/DOCKER.migrate.sh --stop
#      ./bash/DOCKER.migrate.sh --start
#      ./bash/DOCKER.migrate.sh --restart
#
# Variables de entorno opcionales:
#   DB_PORT=3306          (Puerto en el host, cambiar a 3307 si el 3306 está ocupado)
#   DB_NAME=GeoterRA
#   DB_USER=mario
#   DB_PASS=2003
#   CONTAINER_NAME=geoterra-mariadb
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# 1. Rutas y Parámetros
# ------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_DIR="$PROJECT_ROOT/database"
MIGRATIONS_DIR="$DB_DIR/migrations"

CONTAINER_NAME="${CONTAINER_NAME:-geoterra-mariadb}"
VOLUME_NAME="${VOLUME_NAME:-geoterra_mariadb_data}"
IMAGE="${GEOTERRA_DB_IMAGE:-mariadb:11.8}"

DB_HOST_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-GeoterRA}"
DB_USER="${DB_USER:-mario}"
DB_PASS="${DB_PASS:-2003}"
DB_ROOT_PASS="${DB_ROOT_PASS:-2003}"

PROD_URL="https://163.178.171.105/cgi-bin/SERVER.migrate.sh"
PROD_TOKEN='GeoterRA2026(!"#*'

# ------------------------------------------------------------------------------
# 2. Funciones Auxiliares
# ------------------------------------------------------------------------------
die() {
    echo "❌ Error: $*" >&2
    exit 1
}

mdb_root() {
    docker exec -i -e MYSQL_PWD="$DB_ROOT_PASS" "$CONTAINER_NAME" mariadb -uroot "$@"
}

mdb_dump() {
    docker exec -i -e MYSQL_PWD="$DB_ROOT_PASS" "$CONTAINER_NAME" mariadb-dump -uroot "$@"
}

ensure_docker() {
    command -v docker >/dev/null 2>&1 \
        || die "Docker no está instalado en este sistema."
    docker info >/dev/null 2>&1 \
        || die "No se puede comunicar con el daemon de Docker. ¿Está activo el servicio?"
}

is_port_in_use() {
    local port="$1"
    if command -v ss >/dev/null 2>&1; then
        ss -tuln | grep -qE "(:|\\.)${port}\\b"
    elif command -v lsof >/dev/null 2>&1; then
        lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    else
        return 1
    fi
}

start_container() {
    ensure_docker

    local container_status
    container_status="$(docker inspect -f '{{.State.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "not_found")"

    if [ "$container_status" == "running" ]; then
        return 0
    fi

    if [ "$container_status" == "exited" ] || [ "$container_status" == "created" ]; then
        echo "🔄 Iniciando contenedor existente '$CONTAINER_NAME'..."
        docker start "$CONTAINER_NAME" >/dev/null
    else
        echo "🐳 Creando contenedor '$CONTAINER_NAME' con imagen $IMAGE..."

        if is_port_in_use "$DB_HOST_PORT"; then
            echo "⚠️ Advertencia: El puerto $DB_HOST_PORT ya está en uso en el host (posible MariaDB nativo)."
            echo "   Si falla la vinculación del puerto, intenta ejecutar con otro puerto:"
            echo "   DB_PORT=3307 $0 $*"
            echo ""
        fi

        docker run -d \
            --name "$CONTAINER_NAME" \
            -v "$VOLUME_NAME:/var/lib/mysql" \
            -e MARIADB_ROOT_PASSWORD="$DB_ROOT_PASS" \
            -e MARIADB_DATABASE="$DB_NAME" \
            -e MARIADB_USER="$DB_USER" \
            -e MARIADB_PASSWORD="$DB_PASS" \
            -p "${DB_HOST_PORT}:3306" \
            "$IMAGE" \
            --character-set-server=utf8mb4 \
            --collation-server=utf8mb4_general_ci >/dev/null
    fi

    echo "⏳ Esperando a que MariaDB esté listo para recibir conexiones..."
    local ready=0
    for _ in $(seq 1 45); do
        if mdb_root -e "SELECT 1" >/dev/null 2>&1; then
            ready=1
            break
        fi
        sleep 1
    done

    if [ $ready -eq 0 ]; then
        echo "❌ MariaDB no respondió a tiempo. Logs del contenedor:"
        docker logs --tail 25 "$CONTAINER_NAME"
        die "Tiempo de espera agotado al iniciar MariaDB."
    fi

    # Garantizar permisos del usuario sobre la base de datos
    mdb_root -e "
        GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'%';
        FLUSH PRIVILEGES;
    " >/dev/null 2>&1 || true
}

ensure_schema_table() {
    mdb_root -e "
        CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
    "
    mdb_root "$DB_NAME" -e "
        CREATE TABLE IF NOT EXISTS \`schema_migrations\` (
          \`migration_id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          \`migration_name\` VARCHAR(191) NOT NULL,
          \`batch\` INT UNSIGNED NOT NULL DEFAULT 1,
          \`applied_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY \`unique_migration_name\` (\`migration_name\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    "
}

# ------------------------------------------------------------------------------
# 3. Acciones de Administración del Contenedor
# ------------------------------------------------------------------------------
ACTION="${1:-}"

if [ "$ACTION" == "--stop" ]; then
    ensure_docker
    echo "🛑 Deteniendo contenedor '$CONTAINER_NAME'..."
    docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || echo "ℹ️ El contenedor no estaba en ejecución."
    exit 0
fi

if [ "$ACTION" == "--start" ]; then
    start_container
    echo "✅ Contenedor '$CONTAINER_NAME' listo en puerto $DB_HOST_PORT."
    exit 0
fi

if [ "$ACTION" == "--restart" ]; then
    ensure_docker
    echo "🔄 Reiniciando contenedor '$CONTAINER_NAME'..."
    docker restart "$CONTAINER_NAME" >/dev/null 2>&1 || start_container
    exit 0
fi

if [ "$ACTION" == "--down" ]; then
    ensure_docker
    echo "🗑️ Eliminando contenedor '$CONTAINER_NAME' (el volumen '$VOLUME_NAME' se conserva)..."
    docker rm -fv "$CONTAINER_NAME" >/dev/null 2>&1 || echo "ℹ️ No se encontró el contenedor."
    exit 0
fi

if [ "$ACTION" == "--help" ] || [ "$ACTION" == "-h" ]; then
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  (sin args)       Inicia Docker (si está apagado) y aplica migraciones pendientes"
    echo "  --status         Muestra el estado actual de las migraciones en la base Docker"
    echo "  --compare-prod   Compara el estado local vs producción (mediante cURL a SERVER.migrate.sh)"
    echo "  --backup         Crea un respaldo SQL de la base de datos local en database/"
    echo "  --start          Solo levanta el contenedor de base de datos"
    echo "  --stop           Detiene el contenedor Docker"
    echo "  --restart        Reinicia el contenedor Docker"
    echo "  --down           Elimina el contenedor (mantiene volumen con los datos)"
    echo "  --help           Muestra esta ayuda"
    exit 0
fi

# ------------------------------------------------------------------------------
# 4. Asegurar Contenedor y Tablas
# ------------------------------------------------------------------------------
start_container
ensure_schema_table

# ------------------------------------------------------------------------------
# 5. Modo Consulta de Estado (--status)
# ------------------------------------------------------------------------------
if [ "$ACTION" == "--status" ]; then
    echo "📊 ========================================================"
    echo "   GEOTERRA (DOCKER) - ESTADO ACTUAL DE LA BASE DE DATOS"
    echo "============================================================"
    echo "🐳 Contenedor:    $CONTAINER_NAME (Puerto: $DB_HOST_PORT)"
    echo "🗄️ Base de datos:  $DB_NAME"
    echo "📂 Migraciones:    $MIGRATIONS_DIR"
    echo ""

    LAST_MIGRATION=$(mdb_root "$DB_NAME" -sN -e "
        SELECT CONCAT(\`migration_name\`, ' (Lote ', \`batch\`, ' | ', \`applied_at\`, ')')
        FROM \`schema_migrations\`
        ORDER BY \`migration_id\` DESC LIMIT 1;
    ")

    TOTAL_APPLIED=$(mdb_root "$DB_NAME" -sN -e "
        SELECT COUNT(*) FROM \`schema_migrations\`;
    ")

    if [ -z "$LAST_MIGRATION" ]; then
        echo "📌 Último esquema aplicado: (Ninguno registrado en schema_migrations)"
    else
        echo "📌 Último esquema aplicado: $LAST_MIGRATION"
    fi
    echo "📋 Total migraciones en BD: $TOTAL_APPLIED"
    echo ""

    APPLIED_LIST=$(mdb_root "$DB_NAME" -sN -e "
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
        echo "⚠️ Hay $PENDING_COUNT migración(es) pendiente(s). Ejecuta '$0' sin argumentos para aplicarlas."
    fi
    echo "============================================================"
    exit 0
fi

# ------------------------------------------------------------------------------
# 6. Modo Comparar con Producción (--compare-prod)
# ------------------------------------------------------------------------------
if [ "$ACTION" == "--compare-prod" ]; then
    echo "🔎 [1/2] Consultando estado en base local (Docker)..."
    "$0" --status
    echo ""
    echo "🌐 [2/2] Consultando estado en Producción ($PROD_URL)..."
    curl -k -s "$PROD_URL" || echo "⚠️ No se pudo conectar con el servidor de producción."
    echo ""
    exit 0
fi

# ------------------------------------------------------------------------------
# 7. Modo Respaldo Preventivo (--backup o automático antes de migrar)
# ------------------------------------------------------------------------------
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${DB_DIR}/${DB_NAME}_[docker]_${TIMESTAMP}.sql"

create_backup() {
    echo "💾 Generando respaldo preventivo en $(basename "$BACKUP_FILE")..."
    if mdb_dump --routines --triggers "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
        local b_size
        b_size=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
        echo "✅ Respaldo creado exitosamente ($b_size)."
    else
        echo "ℹ️ No se pudo generar respaldo previo (la base de datos podría estar vacía aún)."
        rm -f "$BACKUP_FILE"
    fi
}

if [ "$ACTION" == "--backup" ]; then
    create_backup
    exit 0
fi

# ------------------------------------------------------------------------------
# 8. Modo Ejecución de Migraciones Pendientes
# ------------------------------------------------------------------------------
echo "🗄️ ========================================================"
echo "   GEOTERRA (DOCKER) - MOTOR DE MIGRACIÓN DE BASE DE DATOS"
echo "============================================================"
echo "🐳 Contenedor:                $CONTAINER_NAME (Puerto: $DB_HOST_PORT)"
echo "📂 Directorio de migraciones: $MIGRATIONS_DIR"
echo "🗄️ Base de datos objetivo:    $DB_NAME"
echo ""

APPLIED_MIGRATIONS=$(mdb_root "$DB_NAME" -sN -e "
    SELECT \`migration_name\` FROM \`schema_migrations\`;
")

NEXT_BATCH=$(mdb_root "$DB_NAME" -sN -e "
    SELECT IFNULL(MAX(\`batch\`), 0) + 1 FROM \`schema_migrations\`;
")

shopt -s nullglob
MIGRATION_FILES=("$MIGRATIONS_DIR"/*.sql)
shopt -u nullglob

if [ ${#MIGRATION_FILES[@]} -eq 0 ]; then
    echo "ℹ️ No se encontraron archivos .sql en $MIGRATIONS_DIR."
    exit 0
fi

IFS=$'\n' SORTED_FILES=($(sort <<<"${MIGRATION_FILES[*]}"))
unset IFS

PENDING_FILES=()
for FILE_PATH in "${SORTED_FILES[@]}"; do
    M_NAME="$(basename "$FILE_PATH")"
    if ! echo "$APPLIED_MIGRATIONS" | grep -qx "$M_NAME"; then
        PENDING_FILES+=("$FILE_PATH")
    fi
done

if [ ${#PENDING_FILES[@]} -eq 0 ]; then
    LAST_APPLIED_NOW=$(mdb_root "$DB_NAME" -sN -e "
        SELECT \`migration_name\` FROM \`schema_migrations\` ORDER BY \`migration_id\` DESC LIMIT 1;
    ")
    echo "✨ Base de datos 100% al día. No hay migraciones pendientes (${#SORTED_FILES[@]} ya aplicadas)."
    echo "📌 lastSchemaApplied: $LAST_APPLIED_NOW"
    echo "============================================================"
    exit 0
fi

# Solo respaldar si realmente hay migraciones pendientes por aplicar
create_backup
echo ""

COUNT_APPLIED=0
COUNT_SKIPPED=$((${#SORTED_FILES[@]} - ${#PENDING_FILES[@]}))

echo "🔍 Aplicando ${#PENDING_FILES[@]} migración(es) pendiente(s)..."

for FILE_PATH in "${PENDING_FILES[@]}"; do
    MIGRATION_NAME="$(basename "$FILE_PATH")"

    echo "🚀 Aplicando: $MIGRATION_NAME (Lote $NEXT_BATCH)..."

    set +e
    ERR_OUTPUT=$(docker exec -i -e MYSQL_PWD="$DB_ROOT_PASS" "$CONTAINER_NAME" mariadb -uroot --default-character-set=utf8mb4 "$DB_NAME" < "$FILE_PATH" 2>&1)
    EXIT_CODE=$?
    set -e

    if [ $EXIT_CODE -eq 0 ]; then
        mdb_root "$DB_NAME" -e "
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
        exit 1
    fi
done

LAST_APPLIED_NOW=$(mdb_root "$DB_NAME" -sN -e "
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
