# 🗄️ GeoterRA - Base de Datos & Migraciones (Docker)

Guía para la inicialización, gestión y ejecución de migraciones de la base de datos de desarrollo mediante Docker. Este entorno replica de forma idéntica el motor de base de datos y control de esquemas que opera en el servidor de producción (`SERVER.migrate.sh`).

---

## 📋 Requisitos Previos

1. **Docker Engine**: Docker instalado y con el servicio activo.
   ```bash
   # Verificar estado de Docker
   docker info
   ```
2. **Permisos de usuario**: Su usuario de Linux debe pertenecer al grupo `docker` para ejecutar comandos sin `sudo`:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```
3. **Herramientas de red (opcional)**: `curl` para la comparación con el servidor de producción.

---

## 🐳 Especificaciones del Contenedor

| Parámetro | Valor por Defecto | Variable de Entorno | Descripción |
| :--- | :--- | :--- | :--- |
| **Nombre Contenedor** | `geoterra-mariadb` | `CONTAINER_NAME` | Nombre identificador en Docker |
| **Imagen** | `mariadb:11.8` | `GEOTERRA_DB_IMAGE` | Versión oficial estandarizada |
| **Base de Datos** | `GeoterRA` | `DB_NAME` | Base de datos principal |
| **Usuario** | `mario` | `DB_USER` | Usuario con privilegios completos |
| **Contraseña Usuario**| `2003` | `DB_PASS` | Contraseña configurada en `API/config/config.ini` |
| **Contraseña Root** | `2003` | `DB_ROOT_PASS` | Acceso administrativo interno |
| **Puerto Host** | `3307` | `DB_PORT` | Mapeo al puerto `3306` del contenedor (estándar para Docker) |
| **Volumen** | `geoterra_mariadb_data` | `VOLUME_NAME` | Persistencia de datos en `/var/lib/mysql` |
| **Charset / Collate** | `utf8mb4` / `utf8mb4_general_ci` | - | Codificación estándar del proyecto |

---

## 🚀 Uso Rápido con `DOCKER.migrate.sh`

El script [`bash/DOCKER.migrate.sh`](../bash/DOCKER.migrate.sh) automatiza el ciclo de vida del contenedor y la aplicación secuencial de migraciones ubicadas en [`database/migrations/`](./migrations).

### 1. Aplicar Migraciones Pendientes
Si el contenedor se encuentra apagado, el script lo levantará automáticamente, verificará que esté listo para aceptar conexiones y aplicará en lote únicamente los archivos `.sql` nuevos:
```bash
./bash/DOCKER.migrate.sh
```

### 2. Consultar Estado de Migraciones
Muestra el último esquema aplicado, el total de migraciones registradas y la lista de scripts pendientes:
```bash
./bash/DOCKER.migrate.sh --status
```

### 3. Comparar con Producción
Consulta el estado de su base de datos local en Docker y, en paralelo, consulta el script CGI en producción (`SERVER.migrate.sh`) vía HTTPS para confirmar la sincronización:
```bash
./bash/DOCKER.migrate.sh --compare-prod
```
*(Equivalente a consultar manualmente: `curl -k https://163.178.171.105/cgi-bin/SERVER.migrate.sh`)*.

### 4. Generar Respaldo Manual
Genera un volcado SQL preventivo de la base de datos actual dentro del directorio `database/`:
```bash
./bash/DOCKER.migrate.sh --backup
```

---

## 🛠️ Control del Ciclo de Vida del Contenedor

Puede gestionar el contenedor sin necesidad de interactuar directamente con comandos complejos de Docker:

```bash
# Iniciar contenedor sin ejecutar migraciones
./bash/DOCKER.migrate.sh --start

# Detener el contenedor
./bash/DOCKER.migrate.sh --stop

# Reiniciar el contenedor
./bash/DOCKER.migrate.sh --restart

# Eliminar el contenedor (los datos del volumen se conservan)
./bash/DOCKER.migrate.sh --down
```

---

## 📂 Estructura de Migraciones y Versionado

Las migraciones se encuentran en [`database/migrations/`](./migrations) y siguen el formato numérico incremental:

```text
database/migrations/
├── 001_initial_schema.sql
├── 002_initial_catalogs.sql
├── 003_add_field_trips_and_comments.sql
├── 004_add_visibility_to_georeports_and_tests.sql
├── 005_remove_scheduled_date_and_is_active_from_field_trips.sql
└── 006_add_name_to_tests_and_reports.sql
```

### Tabla de Control (`schema_migrations`)
Cada migración aplicada se registra en la tabla interna `schema_migrations`:
* `migration_name`: Nombre exacto del archivo SQL (ej. `006_add_name_to_tests_and_reports.sql`).
* `batch`: Número incremental del lote de ejecución.
* `applied_at`: Marca temporal de aplicación.

---

## 🔌 Conexión desde el Backend PHP (API)

Para conectar la API local al contenedor Docker, asegúrese de que [`API/config/config.ini`](../API/config/config.ini) contenga los parámetros correspondientes (estándar en puerto `3307`):

```ini
[database]
host = 127.0.0.1
port = 3307
name = GeoterRA
user = mario
pass = 2003
```