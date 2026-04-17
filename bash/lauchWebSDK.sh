#!/bin/bash

# Crear directorio de logs si no existe
mkdir -p API/logs
clear

# 1. Abrir Node en una PESTAÑA NUEVA de Konsole
# --new-tab: Abre la pestaña
# --workdir: Define el directorio de trabajo
# -e: Ejecuta el comando (usamos bash -c para que la pestaña no se cierre si falla)
konsole --new-tab --workdir "$(pwd)/website" -e bash -c "npm run dev; exec bash" &

# 2. Levantar PHP en la PESTAÑA ACTUAL
echo "Levantando PHP en localhost:8000..."
php -S localhost:8000 -t API/public/ 2>&1 | tee API/logs/system.log