#!/usr/bin/env bash
# =============================================================================
# GeoterRA API - Tests sobre una base de datos efímera en Docker
# =============================================================================
# Levanta un contenedor MariaDB desechable, le aplica TODAS las migraciones de
# database/migrations/ (en orden, con el cliente `mariadb` real) y ejecuta los
# tests contra él. Al terminar (bien, con error o con Ctrl+C) el contenedor se
# destruye. Los datos viven en tmpfs: no queda nada en disco ni en el host.
#
# Uso (desde API/):
#   bash tests/run-tests.sh                        # todo, en paralelo (paratest)
#   bash tests/run-tests.sh tests/Unit/DTO/        # los argumentos van al runner
#   TEST_RUNNER=phpunit bash tests/run-tests.sh    # secuencial con phpunit
#   composer test                                  # equivale al primero
#
# Variables opcionales:
#   TEST_RUNNER              paratest (default) | phpunit
#   TEST_PROCS               procesos de paratest (default: nº de CPUs)
#   GEOTERRA_TEST_DB_IMAGE   imagen de la BD (default: mariadb:11.8)
#
# Si el script muere por un kill -9 el contenedor puede quedar huérfano:
#   docker rm -fv $(docker ps -aq --filter label=geoterra.test-db=1)
# =============================================================================
set -euo pipefail

API_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_DIR="$API_DIR/../database/migrations"

IMAGE="${GEOTERRA_TEST_DB_IMAGE:-mariadb:11.8}"
RUNNER="${TEST_RUNNER:-paratest}"
PROCS="${TEST_PROCS:-$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)}"
DB_ROOT_PASS="geoterra_test"          # contenedor efímero, solo en 127.0.0.1
CONTAINER="geoterra-test-db-$$"
CONTAINER_CREATED=0

die() { echo "✗ $*" >&2; exit 1; }

cleanup() {
  if (( CONTAINER_CREATED )); then
    echo "🧹 Destruyendo contenedor $CONTAINER..."
    docker rm -fv "$CONTAINER" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# ---- Validaciones previas ---------------------------------------------------
[[ "$RUNNER" == "paratest" || "$RUNNER" == "phpunit" ]] \
  || die "TEST_RUNNER debe ser 'paratest' o 'phpunit' (recibido: '$RUNNER')."

command -v docker >/dev/null 2>&1 \
  || die "Docker no está instalado. En Arch: sudo pacman -S docker && sudo systemctl enable --now docker"

docker info >/dev/null 2>&1 \
  || die "No se puede hablar con el daemon de Docker. ¿Está corriendo (systemctl start docker) y tu usuario en el grupo 'docker'?"

[[ -x "$API_DIR/vendor/bin/$RUNNER" ]] \
  || die "Falta vendor/bin/$RUNNER. Ejecuta: composer install (en API/)"

[[ -d "$MIGRATIONS_DIR" ]] || die "No existe el directorio de migraciones: $MIGRATIONS_DIR"

mapfile -t MIGRATIONS < <(find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' | LC_ALL=C sort)
(( ${#MIGRATIONS[@]} > 0 )) || die "No hay archivos .sql en $MIGRATIONS_DIR"

# ---- Contenedor -------------------------------------------------------------
echo "🐳 Levantando $IMAGE (efímero, datos en tmpfs)..."
# Se marca antes de crear: si `docker run` falla a medias, el trap igual limpia.
CONTAINER_CREATED=1
docker run -d \
  --name "$CONTAINER" \
  --label geoterra.test-db=1 \
  --tmpfs /var/lib/mysql \
  -e MARIADB_ROOT_PASSWORD="$DB_ROOT_PASS" \
  -p 127.0.0.1::3306 \
  "$IMAGE" \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_general_ci \
  --innodb-flush-log-at-trx-commit=0 \
  --max-connections=300 >/dev/null

# Cliente mariadb dentro del contenedor (la clave va por env, no por argv).
mdb() { docker exec -i -e MYSQL_PWD="$DB_ROOT_PASS" "$CONTAINER" mariadb -uroot "$@"; }

HOST_PORT="$(docker port "$CONTAINER" 3306/tcp | head -n1 | sed 's/.*://')"
[[ -n "$HOST_PORT" ]] || die "No se pudo determinar el puerto publicado del contenedor."

# Durante la inicialización de la imagen el servidor temporal NO escucha por TCP;
# conectar por 127.0.0.1 solo funciona cuando ya terminó y arrancó el definitivo.
echo "⏳ Esperando a MariaDB..."
ready=0
for _ in $(seq 1 90); do
  if [[ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null || echo false)" != "true" ]]; then
    docker logs "$CONTAINER" 2>&1 | tail -n 30 >&2
    die "El contenedor de MariaDB se detuvo durante el arranque."
  fi
  if mdb -h127.0.0.1 -e 'SELECT 1' </dev/null >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done
(( ready )) || { docker logs "$CONTAINER" 2>&1 | tail -n 30 >&2; die "MariaDB no estuvo lista a tiempo."; }

# ---- Migraciones ------------------------------------------------------------
# Una base para ejecución secuencial y, con paratest, una por worker
# (paratest exporta TEST_TOKEN=1..N): los tests hacen DELETE de todas las tablas
# y no pueden compartir base entre procesos.
DBS=("GeoterRA_test")
if [[ "$RUNNER" == "paratest" ]]; then
  for ((i = 1; i <= PROCS; i++)); do DBS+=("GeoterRA_test_$i"); done
fi

echo "📜 Aplicando ${#MIGRATIONS[@]} migración(es) en ${#DBS[@]} base(s):"
for f in "${MIGRATIONS[@]}"; do echo "     - $(basename "$f")"; done

load_database() {
  local db="$1" file
  mdb -e "CREATE DATABASE \`$db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci" </dev/null
  for file in "${MIGRATIONS[@]}"; do
    # El cliente aborta en el primer error SQL (no usamos --force).
    if ! mdb --default-character-set=utf8mb4 "$db" < "$file"; then
      echo "✗ Falló la migración $(basename "$file") sobre $db" >&2
      return 1
    fi
  done
}

pids=()
for db in "${DBS[@]}"; do
  load_database "$db" &
  pids+=("$!")
done
failed=0
for pid in "${pids[@]}"; do
  wait "$pid" || failed=1
done
(( failed == 0 )) || die "Alguna migración falló; no se ejecutan los tests."
echo "✅ Migraciones aplicadas."

# ---- Tests ------------------------------------------------------------------
export DB_HOST="127.0.0.1"
export DB_PORT="$HOST_PORT"
export DB_USER="root"
export DB_PASS="$DB_ROOT_PASS"
export GEOTERRA_TEST_DB_READY=1

# Si no se pasó ninguna opción de cobertura ni --no-coverage, agregamos --no-coverage
# por defecto para evitar error "No code coverage driver available" (por phpunit.xml)
has_coverage_flag=0
for arg in "$@"; do
  if [[ "$arg" == --coverage* || "$arg" == "--no-coverage" ]]; then
    has_coverage_flag=1
    break
  fi
done

test_args=("$@")
if (( ! has_coverage_flag )); then
  test_args+=("--no-coverage")
fi

cd "$API_DIR"
set +e
if [[ "$RUNNER" == "paratest" ]]; then
  vendor/bin/paratest -p "$PROCS" "${test_args[@]}"
else
  vendor/bin/phpunit "${test_args[@]}"
fi
rc=$?
set -e
exit "$rc"
