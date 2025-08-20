#!/bin/bash
# Script para actualizar el servidor desde main
cd /home/proyecto/GeoterRA_DEV

# Traer los últimos cambios de main
git checkout main
git pull origin main