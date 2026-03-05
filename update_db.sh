#!/bin/bash
# Configuración de la base de datos
DB_USER="root"
DB_PASS="g3ot3rR4"
DB_NAME="GeoterRA"
SQL_FILE="/home/proyecto/GeoterRA_DEV/database/GeoterRA.sql" # Ruta al archivo nuevo

echo "🗄️ Iniciando actualización de Base de Datos..."

# 1. (Opcional) Hacer un respaldo de la actual por si algo sale mal
echo "💾 Respaldando base de datos actual..."
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME > "${DB_NAME}_backup_$(date +%F).sql"

# 2. Eliminar y volver a crear la base de datos
echo "🗑️ Eliminando y recreando la base de datos..."
mysql -u$DB_USER -p$DB_PASS -e "DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME;"

# 3. Cargar la nueva base de datos
echo "📤 Cargando nueva estructura/datos desde $SQL_FILE..."
if [ -f "$SQL_FILE" ]; then
    mysql -u$DB_USER -p$DB_PASS $DB_NAME < "$SQL_FILE"
    echo "✅ Base de datos actualizada con éxito."
else
    echo "❌ Error: El archivo SQL no existe en la ruta especificada."
    exit 1
fi
