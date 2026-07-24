#!/bin/bash

# Configuración de la Base de Datos Local
DB_HOST="localhost"
DB_NAME="GeoterRA"
DB_USER="mario"
DB_PASS="2003"

# Directorio y rutas de archivos
DB_DIR="/home/mario/Desktop/JOB/GeoterRA_DEV/database"
SQL_FILE="${DB_DIR}/GeoterRA.sql"

# Crear timestamp y definir nombre del archivo de respaldo
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${DB_DIR}/${DB_NAME}_[local]_${TIMESTAMP}.sql"

# Usar mariadb / mariadb-dump si están disponibles para evitar mensajes de deprecación
MYSQL_BIN=$(command -v mariadb || command -v mysql)
DUMP_BIN=$(command -v mariadb-dump || command -v mysqldump)

# Exportar contraseña temporalmente
export MYSQL_PWD="$DB_PASS"

echo "🗄️ Iniciando actualización de la Base de Datos Local ($DB_NAME)..."

# 1. Asegurar que existe el directorio de destino
mkdir -p "$DB_DIR"

# 2. Verificar que existe el archivo SQL a restaurar
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: El archivo de origen '$SQL_FILE' no existe."
    unset MYSQL_PWD
    exit 1
fi

# 3. Hacer respaldo de la base de datos local actual
echo "💾 Creando respaldo local en: $BACKUP_FILE"
if "$DUMP_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
    echo "✅ Respaldo creado correctamente."
else
    echo "⚠️ Advertencia: No se pudo hacer el respaldo (la base de datos podría no existir aún)."
fi

# 4. Eliminar y recrear la base de datos
echo "🗑️ Recreando base de datos '$DB_NAME'..."
"$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" -e "DROP DATABASE IF EXISTS \`$DB_NAME\`; CREATE DATABASE \`$DB_NAME\`;"

# 5. Cargar el archivo SQL limpiando nombres de base de datos definidos estáticamente (geoterra) y definers
echo "📤 Importando '$SQL_FILE' en la base de datos local..."
if sed -E 's/`geoterra`\.//g; s/DEFINER=`[^`]+`@`[^`]+`/DEFINER=CURRENT_USER/g' "$SQL_FILE" | "$MYSQL_BIN" -h"$DB_HOST" -u"$DB_USER" "$DB_NAME"; then
    echo "✅ ¡Base de datos local actualizada con éxito!"
else
    echo "❌ Error al importar la base de datos."
    unset MYSQL_PWD
    exit 1
fi

# Limpiar variable de entorno
unset MYSQL_PWD
