# GeoterRA Database - Schema Documentation

Documentación completa de la estructura de base de datos de GeoterRA, incluyendo tablas modernas y legacy.

---

## 📋 Tabla de Contenidos

1. [Instalación](#instalación)
2. [Estado de las Tablas](#estado-de-las-tablas)
3. [Tablas Modernas (Refactorizado)](#tablas-modernas-refactorizado)
4. [Tablas Legacy](#tablas-legacy)
5. [Relaciones](#relaciones)
6. [Diagrama ER](#diagrama-er)

---

## Instalación

### Requisitos

- **Linux**: LAMP (Apache, MySQL/MariaDB, PHP)
  - `apache2`, `mysql-server`, `mysql-client`, `phpmyadmin`
  
- **Windows**: XAMPP (https://www.apachefriends.org/)

### Pasos de Instalación

1. Acceder a PHPMyAdmin: `http://localhost/phpmyadmin/`
2. Crear base de datos: `GeoterRA` o `GeoterRa` (según el SQL)
3. Importar archivo SQL:
   - **Para desarrollo moderno**: `GeoterRa-refact.sql` ✅
   - **Para referencia legacy**: `GeoterRA.sql` (no recomendado)

### Crear Usuario (Opcional)

```sql
sudo mysql -u root -p

CREATE USER 'geouser'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON GeoterRa.* TO 'geouser'@'%';
FLUSH PRIVILEGES;
```

---

## Estado de las Tablas

### 📊 Resumen

| Categoría | Tablas | Estado |
|-----------|--------|--------|
| **Modernas** | `users`, `analysis_requests`, `registered_geothermal_manifestations`, `access_tokens`, `refresh_tokens` | ✅ Activas |
| **Legacy** | `reg_usr`, `solicitudes`, `puntos_estudiados` | ⚠️ Mantenidas (sin borrar) |

---

## Tablas Modernas (Refactorizado)

<dd>

### 1. **users**

Tabla principal de usuarios del sistema. Propósito: Autenticación y gestión de usuarios.

**Campos:**

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| `user_id` | CHAR(26) | ❌ | ID único (ULID) |
| `first_name` | VARCHAR(100) | ❌ | Nombre del usuario |
| `last_name` | VARCHAR(100) | ❌ | Apellido del usuario |
| `email` | VARCHAR(255) | ❌ | Email (único) |
| `phone_number` | VARCHAR(20) | ✅ | Teléfono (opcional) |
| `password_hash` | VARCHAR(255) | ❌ | Hash bcrypt de contraseña |
| `role` | ENUM('admin','user','moderator') | ❌ | Rol del usuario (default: 'user') |
| `is_active` | TINYINT(1) | ❌ | ¿Usuario activo? (default: 1) |
| `is_verified` | TINYINT(1) | ❌ | ¿Email verificado? (default: 0) |
| `failed_login_attempts` | INT(11) | ❌ | Intentos fallidos (default: 0) |
| `last_login_at` | DATETIME | ✅ | Último login |
| `password_changed_at` | DATETIME | ✅ | Último cambio de contraseña |
| `created_at` | DATETIME | ❌ | Fecha creación (AUTO) |
| `updated_at` | DATETIME | ✅ | Última actualización (AUTO) |
| `deleted_at` | DATETIME | ✅ | Soft delete |
| `deleted_by` | CHAR(26) | ✅ | ID del usuario que borró |

**Índices:**

```sql
PRIMARY KEY (user_id)
UNIQUE KEY (email)
KEY (idx_email)
KEY (idx_role)
FOREIGN KEY (deleted_by) → users(user_id)
```

</dd>

---

### 2. **access_tokens**

> Tokens de acceso corta duración para sesiones activas.
>
> **Campos:**
>
> | Campo | Tipo | Nullable | Descripción |
> |-------|------|----------|-------------|
> | `user_id` | CHAR(26) | ❌ | FK → users |
> | `token_hash` | CHAR(64) | ❌ | Hash SHA256 del token |
> | `expires_at` | TIMESTAMP | ❌ | Expiración (típico: 1 hora) |
> | `revoked_at` | TIMESTAMP | ✅ | Revocación (logout) |
> | `created_at` | TIMESTAMP | ❌ | Fecha creación |
> | `updated_at` | DATETIME | ❌ | Última actualización |
>
> **Relación:**
> - 1 Usuario → 1 Access Token (uno activo por vez)
>
> **Flujo:**
> ```
> 1. Usuario hace login
> 2. Se crea access_token con expiración
> 3. Token retornado al cliente
> 4. Cliente incluye en header: Authorization: Bearer <token>
> 5. Al logout: token marcado como revoked_at = NOW()
> ```

---

### 3. **refresh_tokens**

> Tokens de refresco larga duración para renovar access_tokens expirados.
>
> **Campos:**
>
> | Campo | Tipo | Nullable | Descripción |
> |-------|------|----------|-------------|
> | `user_id` | CHAR(26) | ❌ | FK → users |
> | `token_hash` | VARCHAR(255) | ❌ | Hash del refresh token |
> | `expires_at` | DATETIME | ❌ | Expiración (típico: 30 días) |
> | `revoked_at` | DATETIME | ✅ | Revocación manual |
> | `created_at` | TIMESTAMP | ❌ | Fecha creación |
> | `updated_at` | DATETIME | ✅ | Última actualización |
>
> **Flujo:**
> ```
> 1. Cliente tiene access_token expirado
> 2. Envía refresh_token al endpoint /refresh
> 3. Si válido: genera nuevo access_token
> 4. Cliente puede continuar trabajando
> ```

---

### 4. **analysis_requests**

> Solicitudes de análisis geotérmico realizadas por usuarios.
>
> **Campos:**
>
> | Campo | Tipo | Nullable | Descripción |
> |-------|------|----------|-------------|
> | `id` | CHAR(26) | ❌ | ID único (ULID) |
> | `name` | VARCHAR(255) | ❌ | Nombre (auto-generado: SOLI-XXXXX) |
> | `region` | ENUM(...) | ✅ | Región costarricense |
> | `email` | VARCHAR(255) | ❌ | Email de contacto |
> | `owner_contact_number` | VARCHAR(50) | ✅ | Teléfono propietario |
> | `owner_name` | VARCHAR(255) | ❌ | Nombre propietario |
> | `temperature_sensation` | VARCHAR(50) | ✅ | Sensación: hot, warm, cold |
> | `bubbles` | TINYINT(1) | ✅ | ¿Hay burbujas? |
> | `details` | TEXT | ✅ | Detalles adicionales |
> | `current_usage` | VARCHAR(255) | ✅ | Uso actual de la fuente |
> | `latitude` | DECIMAL(10,7) | ✅ | Latitud (-90 a 90) |
> | `longitude` | DECIMAL(10,7) | ✅ | Longitud (-180 a 180) |
> | `state` | ENUM('Pendiente','En revisión','Analizada','Eliminada') | ❌ | Estado (default: 'Pendiente') |
> | `created_at` | DATETIME | ❌ | Fecha creación |
> | `created_by` | CHAR(26) | ❌ | FK → users (creador) |
> | `modified_at` | DATETIME | ✅ | Última modificación |
> | `deleted_at` | DATETIME | ✅ | Soft delete |
>
> **Relaciones:**
> ```
> 1 Usuario → N Solicitudes de Análisis
> ```
>
> **Estados posibles:**
> - **Pendiente**: Recién creada
> - **En revisión**: Siendo analizada
> - **Analizada**: Completada
> - **Eliminada**: Soft delete

---

### 5. **registered_geothermal_manifestations**

> Manifestaciones geotérmicas registradas en el sistema con análisis químico.
>
> **Campos principales:**
>
> | Campo | Tipo | Nullable | Descripción |
> |-------|------|----------|-------------|
> | `id` | CHAR(26) | ❌ | ID único (ULID) |
> | `name` | VARCHAR(255) | ❌ | Nombre (auto-generado: RGM-XXXXX) |
> | `region` | ENUM(...) | ❌ | Región costarricense |
> | `latitude` | DECIMAL(10,7) | ❌ | Latitud |
> | `longitude` | DECIMAL(10,7) | ❌ | Longitud |
> | `description` | TEXT | ✅ | Descripción |
> | `temperature` | DECIMAL(6,2) | ✅ | Temperatura °C |
> | `field_pH` | DECIMAL(4,2) | ✅ | pH de campo |
> | `field_conductivity` | DECIMAL(10,2) | ✅ | Conductividad campo (µS/cm) |
> | `lab_pH` | DECIMAL(4,2) | ✅ | pH laboratorio |
> | `lab_conductivity` | DECIMAL(10,2) | ✅ | Conductividad lab (µS/cm) |
>
> **Elementos químicos (mg/L):**
>
> | Campo | Tipo | Descripción |
> |-------|------|-------------|
> | `cl` | DECIMAL(10,4) | Cloro |
> | `ca` | DECIMAL(10,4) | Calcio |
> | `hco3` | DECIMAL(10,4) | Bicarbonato |
> | `so4` | DECIMAL(10,4) | Sulfato |
> | `fe` | DECIMAL(10,4) | Hierro |
> | `si` | DECIMAL(10,4) | Sílice |
> | `b` | DECIMAL(10,4) | Boro |
> | `li` | DECIMAL(10,4) | Litio |
> | `f` | DECIMAL(10,4) | Flúor |
> | `na` | DECIMAL(10,4) | Sodio |
> | `k` | DECIMAL(10,4) | Potasio |
> | `mg` | DECIMAL(10,4) | Magnesio |
>
> **Auditoría:**
>
> | Campo | Tipo | Descripción |
> |-------|------|-------------|
> | `created_at` | TIMESTAMP | Fecha creación |
> | `created_by` | CHAR(26) | FK → users |
> | `modified_at` | TIMESTAMP | Última modificación |
> | `modified_by` | CHAR(26) | FK → users |
> | `deleted_at` | DATETIME | Soft delete |
> | `deleted_by` | CHAR(26) | FK → users |
>
> **Relaciones:**
> ```
> 1 Usuario → N Manifestaciones Registradas
> ```

</dd>

---

## Tablas Legacy

<dd>

⚠️ **IMPORTANTE**: Estas tablas mantienen datos históricos. No se borrarán de momento pero no se usan en la API moderna.

### 1. **reg_usr** (Legacy)

> Tabla antigua de usuarios. Substituta por `users`.
>
> **Problemas:**
> - ❌ Contraseñas en plain text (inseguro)
> - ❌ No tiene ULID
> - ❌ No tiene timestamps de auditoría
> - ❌ No tiene soft delete
>
> **Migración:**
> ```
> reg_usr → users (manual requerido)
> ```

---

### 2. **solicitudes** (Legacy)

> Tabla antigua de solicitudes de análisis. Substituta por `analysis_requests`.
>
> **Problemas:**
> - ❌ Estructura menos normalizada
> - ❌ Campos en español (dificulta mantenimiento)
> - ❌ No tiene control de auditoría completo

---

### 3. **puntos_estudiados** (Legacy)

> Tabla antigua de manifestaciones geotermales. Substituta por `registered_geothermal_manifestations`.
>
> **Problemas:**
> - ❌ Nombres de columnas inconsistentes (MG+, Ca+)
> - ❌ Tipos de datos mixtos (varchar para números)
> - ❌ Sin control de auditoría

</dd>

---

## Relaciones

### Diagrama de relaciones (moderno):

```
┌─────────────────────────────────────────┐
│            users                        │
│  (user_id PK, email UNIQUE)             │
└────────────┬────────────────────────────┘
             │
             ├──→ access_tokens (1:1)
             │    - Token de sesión corta
             │    - Expira cada 1 hora
             │
             ├──→ refresh_tokens (1:1)
             │    - Token para renovar sesión
             │    - Expira cada 30 días
             │
             ├──→ analysis_requests (1:N)
             │    - Solicitudes de análisis
             │    - created_by → user_id
             │
             └──→ registered_geothermal_manifestations (1:N)
                  - Manifestaciones registradas
                  - created_by → user_id
                  - modified_by → user_id (opcional)
                  - deleted_by → user_id (opcional)
```

### Foreign Keys:

| Tabla | Columna | Referencias | Acción |
|-------|---------|-------------|--------|
| access_tokens | user_id | users(user_id) | CASCADE |
| refresh_tokens | user_id | users(user_id) | CASCADE |
| analysis_requests | created_by | users(user_id) | CASCADE |
| registered_geothermal_manifestations | created_by | users(user_id) | CASCADE |
| registered_geothermal_manifestations | modified_by | users(user_id) | CASCADE |
| registered_geothermal_manifestations | deleted_by | users(user_id) | CASCADE |
| users | deleted_by | users(user_id) | NO ACTION |

---

## Diagrama ER

```
USERS
├── id (ULID)
├── email (UNIQUE)
├── password_hash (bcrypt)
├── role (admin, user, moderator)
├── timestamps (created, updated, deleted)
│
├─── ACCESS_TOKENS
│    ├── user_id (FK)
│    ├── token_hash (UNIQUE)
│    ├── expires_at
│    └── revoked_at (NULL = activo)
│
├─── REFRESH_TOKENS
│    ├── user_id (FK)
│    ├── token_hash (UNIQUE)
│    ├── expires_at
│    └── revoked_at (NULL = activo)
│
├─── ANALYSIS_REQUESTS
│    ├── id (ULID)
│    ├── name (auto-generated)
│    ├── region
│    ├── owner details
│    ├── location (lat/lng)
│    ├── state
│    ├── created_by (FK)
│    └── timestamps
│
└─── REGISTERED_GEOTHERMAL_MANIFESTATIONS
     ├── id (ULID)
     ├── name (auto-generated)
     ├── region
     ├── location (lat/lng)
     ├── temperature & pH
     ├── chemical elements (22 campos)
     ├── created_by (FK)
     ├── modified_by (FK)
     ├── deleted_by (FK)
     └── timestamps
```

---

## Consideraciones Importantes

✅ **Soft Deletes**: Todas las tablas modernas usan soft delete (deleted_at, deleted_by)
✅ **Auditoría Completa**: Cada tabla rastreada created_by, modified_by, deleted_by
✅ **ULIDs**: Se usa ULID (26 caracteres) en lugar de UUIDs para mejor rendimiento
✅ **Tipos de Datos**: DECIMAL para coordenadas y valores químicos (precisión)
✅ **Enums**: Región y estados limitados a valores específicos
✅ **Constraints**: Foreign keys con ON DELETE CASCADE para integridad

---

## Archivos SQL

- **GeoterRa-refact.sql** ✅ ACTUAL - Estructura moderna, tablas normalizadas
- **GeoterRA.sql** ⚠️ LEGACY - Estructura antigua (referencia, no usar)

---

## Conexión desde API

```php
// En config/database.php
$pdo = new PDO(
  'mysql:host=localhost;dbname=GeoterRa;charset=utf8mb4',
  'geouser',
  'secure_password'
);
```

---

## Scripts Útiles

### Verificar estructura:
```sql
SHOW TABLES;
DESCRIBE users;
SHOW KEYS FROM users;
```

### Ver relaciones:
```sql
SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'GeoterRa' AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### Estadísticas:
```sql
SELECT table_name, table_rows FROM information_schema.tables
WHERE table_schema = 'GeoterRa';
```