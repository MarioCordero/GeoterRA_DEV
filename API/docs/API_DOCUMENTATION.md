# GeoterRA API — Documentación de Referencia

**Versión:** 1.0  
**Base URL:** `https://<host>/api`  
**Content-Type:** `application/json; charset=UTF-8`

---

## Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Formato de Respuesta](#formato-de-respuesta)
3. [Códigos de Error](#códigos-de-error)
4. [Roles de Usuario](#roles-de-usuario)
5. [Endpoints](#endpoints)
   - [Auth](#1-auth)
   - [Users](#2-users)
   - [Investigation Requests](#3-investigation-requests-solicitudes-de-investigación)
   - [Provinces](#4-provinces-provincias)
   - [Cantons](#5-cantons-cantones)
   - [Districts](#6-districts-distritos)
   - [Geomanifestations](#7-geomanifestations-geomanifestaciones)
   - [In-Situ Tests](#8-in-situ-tests-pruebas-in-situ)
   - [In-Lab Tests](#9-in-lab-tests-pruebas-de-laboratorio)
   - [Georeports](#10-georeports-georeportes)
   - [Maintenance](#11-maintenance-mantenimiento)

---

## Autenticación

La API usa un esquema dual según la plataforma del cliente:

| Plataforma | Mecanismo | Detalle |
|------------|-----------|---------|
| **Web** | Cookie HTTP-only | `geoterra_session_token` — se establece automáticamente en login |
| **Mobile** | Bearer Token | Header `Authorization: Bearer <access_token>` |

La plataforma se determina por el header `X-API-Key` enviado en cada request. Un API key inválido o ausente retorna `403 Forbidden`.

### Token Refresh

Cuando el access token expira, se puede renovar usando el refresh token a través del endpoint `POST /auth/refresh`.

> **Nota:** Los endpoints marcados con 🔒 requieren autenticación. Los marcados con 🔑 requieren rol de admin o maintenance.

---

## Formato de Respuesta

Todas las respuestas siguen una estructura uniforme:

### Respuesta exitosa (2xx)

```json
{
  "data": { /* payload */ },
  "meta": { /* metadata opcional: paginación, token_type, etc. */ },
  "errors": []
}
```

### Respuesta de error (4xx / 5xx)

```json
{
  "data": null,
  "meta": null,
  "errors": [
    {
      "code": "ERROR_CODE",
      "message": "Descripción legible del error"
    }
  ]
}
```

---

## Códigos de Error

| Código | HTTP Status | Descripción |
|--------|-------------|-------------|
| `INVALID_JSON` | 400 | Body JSON malformado |
| `MISSING_FIELD` | 400 | Campo obligatorio ausente |
| `INVALID_FIELD` | 400 | Valor de campo inválido |
| `INVALID_EMAIL` | 422 | Formato de email incorrecto |
| `WEAK_PASSWORD` | 422 | Contraseña no cumple requisitos de seguridad |
| `EMAIL_ALREADY_IN_USE` | 422 | Email ya registrado |
| `INVALID_CREDENTIALS` | 401 | Email o contraseña incorrectos |
| `MISSING_AUTH_TOKEN` | 401 | Token de autorización no proporcionado |
| `INVALID_ACCESS_TOKEN` | 401 | Access token inválido o expirado |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token inválido o expirado |
| `UNKNOWN_TOKEN` | 401 | Token no reconocido |
| `SESSION_ALREADY_REVOKED` | 401 | Sesión ya revocada |
| `UNAUTHORIZED` | 401 | No autorizado |
| `FORBIDDEN_ACCESS` | 403 | Acceso prohibido (rol insuficiente) |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `CONFLICT_ERROR` | 409 | Conflicto (ej. dato duplicado) |
| `VALIDATION_ERROR` | 422 | Error de validación genérico |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |

---

## Roles de Usuario

| Rol | Valor | Descripción |
|-----|-------|-------------|
| Administrador | `admin` | Acceso completo al sistema |
| Mantenimiento | `maintenance` | Acceso a panel de mantenimiento |
| Investigador de Campo | `fieldInvestigator` | Gestión de pruebas y manifestaciones |
| Investigador | `investigator` | Acceso a datos de investigación |
| Usuario | `user` | Acceso básico, crea solicitudes |

---

## Endpoints

---

### 1. Auth

Autenticación, manejo de sesiones y renovación de tokens.

---

#### `POST /auth/login`

Autentica un usuario y retorna credenciales de sesión.

**Auth:** ❌ No requerida

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `email` | `string` | ✅ | Email registrado |
| `password` | `string` | ✅ | Contraseña (mín. 8 caracteres) |

**Ejemplo de Request:**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "SecurePass123!"
}
```

**Response (200) — Web:**

```json
{
  "data": {
    "user_id": "01HXYZ...",
    "message": "Session set via HTTP-only cookie"
  },
  "meta": {
    "token_type": "Cookie",
    "expires_in": 5400,
    "message": "Session set via HTTP-only cookie"
  },
  "errors": []
}
```

**Response (200) — Mobile:**

```json
{
  "data": {
    "access_token": "a1b2c3d4e5f6...",
    "refresh_token": "f6e5d4c3b2a1...",
    "user_id": "01HXYZ..."
  },
  "meta": {
    "token_type": "Bearer",
    "expires_in": 5400
  },
  "errors": []
}
```

**Errores posibles:** `INVALID_JSON`, `MISSING_FIELD`, `INVALID_EMAIL`, `INVALID_CREDENTIALS`

---

#### `POST /auth/refresh`

Renueva los tokens de acceso usando un refresh token.

**Auth:** ❌ No requerida (el refresh token se envía en el body)

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `refresh_token` | `string` | ✅ | Refresh token obtenido en login |

**Ejemplo de Request:**

```json
{
  "refresh_token": "f6e5d4c3b2a1..."
}
```

**Response (200) — Web:**

```json
{
  "data": {
    "user_id": "01HXYZ...",
    "message": "Session renewed"
  },
  "meta": {
    "token_type": "Cookie",
    "expires_in": 300
  },
  "errors": []
}
```

**Response (200) — Mobile:**

```json
{
  "data": {
    "access_token": "nuevo_access_token...",
    "refresh_token": "nuevo_refresh_token...",
    "user_id": "01HXYZ..."
  },
  "meta": {
    "token_type": "Bearer",
    "expires_in": 300
  },
  "errors": []
}
```

**Errores posibles:** `MISSING_FIELD`, `INVALID_REFRESH_TOKEN`

---

#### `POST /auth/logout`

Cierra la sesión activa del usuario.

**Auth:** 🔒 Requerida

**Request Body:** Ninguno

**Response (200):**

```json
{
  "data": { "logged_out": true },
  "meta": null,
  "errors": []
}
```

**Errores posibles:** `MISSING_AUTH_TOKEN`, `INVALID_ACCESS_TOKEN`, `LOGOUT_FAILED`

---

### 2. Users

Gestión de cuentas de usuario.

---

#### `POST /users/register`

Crea una nueva cuenta de usuario.

**Auth:** ❌ No requerida

**Request Body:**

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `first_name` | `string` | ✅ | No vacío | Nombre del usuario |
| `last_name` | `string` | ✅ | No vacío | Apellido del usuario |
| `email` | `string` | ✅ | Email válido, único | Correo electrónico |
| `phone_number` | `string` | ❌ | 8-15 dígitos | Número telefónico |
| `password` | `string` | ✅ | Mín. 8 chars, mayúsculas, minúsculas, números, caracter especial | Contraseña |

**Ejemplo de Request:**

```json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@ejemplo.com",
  "phone_number": "87654321",
  "password": "SecurePass123!"
}
```

**Response (201):**

```json
{
  "data": {
    "user_id": "01HXYZ...",
    "access_token": "a1b2c3...",
    "refresh_token": "d4e5f6..."
  },
  "meta": {
    "new_session": true,
    "expires_in": 5400
  },
  "errors": []
}
```

**Errores posibles:** `MISSING_FIELD`, `INVALID_EMAIL`, `EMAIL_ALREADY_IN_USE`, `WEAK_PASSWORD`, `INVALID_FIELD`

---

#### `GET /users/me`

Retorna los datos del usuario autenticado.

**Auth:** 🔒 Requerida

**Response (200):**

```json
{
  "data": {
    "user_id": "01HXYZ...",
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@ejemplo.com",
    "phone_number": "87654321",
    "role": "user",
    "is_deleted": false,
    "is_verified": true,
    "created_at": "2026-01-20 14:30:00"
  },
  "meta": null,
  "errors": []
}
```

---

#### `PUT /users/me`

Actualiza el perfil del usuario autenticado.

**Auth:** 🔒 Requerida

**Request Body:**

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `first_name` | `string` | ✅ | No vacío | Nombre |
| `last_name` | `string` | ✅ | No vacío | Apellido |
| `email` | `string` | ✅ | Email válido | Correo electrónico |
| `phone_number` | `string\|null` | ❌ | 8-15 dígitos | Teléfono |
| `current_password` | `string\|null` | ⚠️ | Requerido si se cambia contraseña | Contraseña actual |
| `password` | `string\|null` | ❌ | Mín. 8 chars | Nueva contraseña |

**Ejemplo de Request:**

```json
{
  "first_name": "Juan Carlos",
  "last_name": "Pérez López",
  "email": "juan.carlos@ejemplo.com",
  "phone_number": "88887777"
}
```

**Response (200):**

```json
{
  "data": { "message": "User profile updated successfully" },
  "meta": null,
  "errors": []
}
```

---

#### `DELETE /users/me`

Realiza un soft-delete de la cuenta del usuario autenticado.

**Auth:** 🔒 Requerida

**Request Body:** Ninguno

**Response (200):**

```json
{
  "data": { "message": "User account deleted successfully" },
  "meta": null,
  "errors": []
}
```

---

#### `POST /users/restore`

Restaura una cuenta eliminada (soft-deleted).

**Auth:** ❌ No requerida

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `email` | `string` | ✅ | Email de la cuenta a restaurar |

**Ejemplo de Request:**

```json
{
  "email": "juan@ejemplo.com"
}
```

**Response (200):**

```json
{
  "data": { "message": "Account restored successfully. You can now log in." },
  "meta": null,
  "errors": []
}
```

---

#### `GET /users/me/session`

Retorna los datos de sesión del usuario autenticado.

**Auth:** 🔒 Requerida

**Response (200):**

```json
{
  "data": {
    "user_id": "01HXYZ...",
    "role": "user",
    "email": "juan@ejemplo.com"
  },
  "meta": null,
  "errors": []
}
```

---

#### `PUT /admin/users/{id}/role`

Actualiza el rol de un usuario. Solo administradores.

**Auth:** 🔑 Admin

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ID del usuario a modificar |

**Request Body:**

| Campo | Tipo | Requerido | Valores permitidos | Descripción |
|-------|------|-----------|-------------------|-------------|
| `role` | `string` | ✅ | `admin`, `maintenance`, `fieldInvestigator`, `investigator`, `user` | Nuevo rol |

**Ejemplo de Request:**

```json
{
  "role": "maintenance"
}
```

**Response (200):**

```json
{
  "data": { "message": "User role updated successfully" },
  "meta": null,
  "errors": []
}
```

**Errores posibles:** `MISSING_FIELD`, `VALIDATION_ERROR`, `FORBIDDEN_ACCESS`

---

### 3. Investigation Requests (Solicitudes de Investigación)

CRUD de solicitudes de análisis de manifestaciones geotermales.

---

#### `POST /analysis-requests`

Crea una nueva solicitud de investigación para el usuario autenticado.

**Auth:** 🔒 Requerida

**Request Body:**

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `province_snit_code` | `integer` | ✅ | > 0 | Código SNIT de la provincia |
| `canton_snit_code` | `integer` | ✅ | > 0 | Código SNIT del cantón |
| `district_snit_code` | `integer` | ✅ | > 0 | Código SNIT del distrito |
| `current_usage` | `string` | ✅ | Enum | Uso actual del terreno |
| `temperature_sensation` | `string` | ✅ | Enum | Sensación térmica percibida |
| `owner_name` | `string` | ❌ | — | Nombre del propietario |
| `owner_phone_number` | `string` | ❌ | 8 dígitos o formato `1234-5678` | Teléfono del propietario |
| `owner_email` | `string` | ❌ | Email válido | Email del propietario |
| `bubbles` | `boolean` | ❌ | Default: `false` | Presencia de burbujas de gas |
| `details` | `string` | ❌ | — | Detalles adicionales |
| `exact_address` | `string` | ❌ | — | Dirección exacta |
| `latitude` | `float` | ❌ | -90 a 90 | Latitud |
| `longitude` | `float` | ❌ | -180 a 180 | Longitud |
| `relation_with_owner` | `string` | ❌ | Enum | Relación con el propietario |

**Valores de Enum:**

| Campo | Valores permitidos |
|-------|-------------------|
| `current_usage` | `Residencial`, `Comercial`, `Turístico`, `Conservación`, `Ganadería`, `Otro` |
| `temperature_sensation` | `Hirviendo`, `Muy Caliente`, `Caliente`, `Templado`, `Natural`, `Sin Especificar` |
| `relation_with_owner` | `Familiar`, `Empleado`, `Socio`, `Conocido`, `Titular` |

**Ejemplo de Request:**

```json
{
  "province_snit_code": 1,
  "canton_snit_code": 101,
  "district_snit_code": 10101,
  "current_usage": "Turístico",
  "temperature_sensation": "Caliente",
  "owner_name": "María López",
  "owner_phone_number": "88881234",
  "bubbles": true,
  "details": "Fuente termal en zona rural con acceso vehicular",
  "latitude": 10.4567,
  "longitude": -84.1234,
  "relation_with_owner": "Familiar"
}
```

**Response (201):**

```json
{
  "data": {
    "id": "01HXYZ...",
    "message": "Investigation request created successfully"
  },
  "meta": null,
  "errors": []
}
```

---

#### `GET /analysis-requests`

Retorna todas las solicitudes del usuario autenticado (incluye estado actual).

**Auth:** 🔒 Requerida

**Response (200):**

```json
{
  "data": [
    {
      "id": "01HXYZ...",
      "province_snit_code": 1,
      "canton_snit_code": 101,
      "district_snit_code": 10101,
      "current_usage": "Turístico",
      "temperature_sensation": "Caliente",
      "bubbles": true,
      "latitude": 10.4567,
      "longitude": -84.1234,
      "current_state": "Pendiente",
      "created_at": "2026-01-30 10:30:00"
    }
  ],
  "meta": null,
  "errors": []
}
```

---

#### `GET /analysis-requests/{id}`

Retorna una solicitud específica del usuario autenticado.

**Auth:** 🔒 Requerida

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ID de la solicitud |

**Response (200):**

```json
{
  "data": {
    "id": "01HXYZ...",
    "province_snit_code": 1,
    "canton_snit_code": 101,
    "district_snit_code": 10101,
    "current_usage": "Turístico",
    "temperature_sensation": "Caliente",
    "owner_name": "María López",
    "bubbles": true,
    "details": "Fuente termal en zona rural",
    "latitude": 10.4567,
    "longitude": -84.1234,
    "current_state": "Pendiente",
    "created_at": "2026-01-30 10:30:00"
  },
  "meta": null,
  "errors": []
}
```

---

#### `PUT /analysis-requests/{id}`

Actualiza una solicitud existente. Solo permitido si el estado actual es `Pendiente` y pertenece al usuario.

**Auth:** 🔒 Requerida

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ID de la solicitud |

**Request Body:** Mismos campos que `POST /analysis-requests` (todos opcionales para update).

**Response (201):**

```json
{
  "data": {
    "message": "Investigation request updated successfully"
  },
  "meta": null,
  "errors": []
}
```

**Errores posibles:** `ANALYSIS_REQUEST_NOT_FOUND`, `ANALYSIS_REQUEST_FORBIDDEN`, `ANALYSIS_REQUEST_UPDATE_FAILED`

---

#### `DELETE /analysis-requests/{id}`

Elimina una solicitud del usuario autenticado.

**Auth:** 🔒 Requerida

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ID de la solicitud |

**Response (200):**

```json
{
  "data": { "message": "Analysis request deleted successfully" },
  "meta": null,
  "errors": []
}
```

---

#### `GET /analysis-requests/{id}/states`

Retorna el historial de estados de una solicitud del usuario.

**Auth:** 🔒 Requerida

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ID de la solicitud |

**Response (200):**

```json
{
  "data": [
    {
      "state": "Pendiente",
      "description": "",
      "created_at": "2026-01-30 10:30:00"
    },
    {
      "state": "Aprobada",
      "description": "Aprobada por el comité técnico",
      "created_at": "2026-02-05 14:00:00"
    }
  ],
  "meta": null,
  "errors": []
}
```

---

#### `GET /admin/analysis-requests`

Retorna todas las solicitudes del sistema. Solo admin.

**Auth:** 🔑 Admin

**Response (200):** Array de solicitudes con información del usuario solicitante.

---

#### `GET /admin/analysis-requests/{id}`

Retorna cualquier solicitud por ID. Solo admin.

**Auth:** 🔑 Admin

---

#### `GET /admin/analysis-requests/{id}/states`

Retorna el historial de estados de cualquier solicitud. Solo admin.

**Auth:** 🔑 Admin

---

#### `POST /admin/analysis-requests/{id}/states`

Añade un nuevo estado a una solicitud. Solo admin.

**Auth:** 🔑 Admin

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `state` | `string` | ✅ | Nuevo estado de la solicitud |
| `description` | `string` | ❌ | Descripción o justificación del cambio |

**Ejemplo de Request:**

```json
{
  "state": "Aprobada",
  "description": "Aprobada tras revisión técnica del equipo"
}
```

**Response (200):**

```json
{
  "data": { "message": "State added successfully" },
  "meta": null,
  "errors": []
}
```

---

### 4. Provinces (Provincias)

Gestión de la división territorial a nivel de provincia.

---

#### `GET /provinces`

Retorna todas las provincias del sistema.

**Auth:** ❌ No requerida (público)

**Response (200):**

```json
{
  "data": [
    {
      "province_id": "01HXYZ...",
      "province_snit_code": 1,
      "province_name": "San José",
      "created_by": "01HABC...",
      "created_at": "2026-01-01 00:00:00"
    }
  ],
  "meta": null,
  "errors": []
}
```

---

#### `GET /admin/provinces/{id}`

Retorna una provincia por su ULID.

**Auth:** 🔑 Admin

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ULID de la provincia |

---

#### `GET /admin/provinces/snit/{code}`

Retorna una provincia por su código SNIT.

**Auth:** 🔑 Admin

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `code` | `integer` | Código SNIT de la provincia |

---

#### `POST /admin/provinces`

Crea una nueva provincia.

**Auth:** 🔑 Admin

**Request Body:**

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `province_snit_code` | `integer` | ✅ | > 0 | Código SNIT |
| `province_name` | `string` | ✅ | Máx. 55 chars | Nombre de la provincia |

**Ejemplo de Request:**

```json
{
  "province_snit_code": 1,
  "province_name": "San José"
}
```

**Response (201):**

```json
{
  "data": { "success": true },
  "meta": null,
  "errors": []
}
```

---

#### `PUT /admin/provinces/{id}`

Actualiza una provincia existente.

**Auth:** 🔑 Admin

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ULID de la provincia |

**Request Body:** Mismos campos que `POST`.

**Response (200):**

```json
{
  "data": { "updated": true },
  "meta": null,
  "errors": []
}
```

---

#### `DELETE /admin/provinces/{id}`

Elimina una provincia. **Cascadea a cantones y distritos asociados.**

**Auth:** 🔑 Admin

**Response (200):**

```json
{
  "data": { "deleted": true },
  "meta": null,
  "errors": []
}
```

---

### 5. Cantons (Cantones)

Gestión de cantones vinculados a una provincia.

---

#### `GET /cantons`

Retorna todos los cantones. Opcionalmente filtrado por provincia.

**Auth:** ❌ No requerida (público)

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `province_snit_code` | `integer` | ❌ | Filtra cantones por código SNIT de provincia |

**Ejemplo:** `GET /cantons?province_snit_code=1`

**Response (200):**

```json
{
  "data": [
    {
      "canton_id": "01HXYZ...",
      "province_snit_code": 1,
      "canton_snit_code": 101,
      "canton_name": "Central",
      "created_by": "01HABC...",
      "created_at": "2026-01-01 00:00:00"
    }
  ],
  "meta": null,
  "errors": []
}
```

---

#### `GET /admin/cantons/{id}`

Retorna un cantón por su ULID.

**Auth:** 🔑 Admin

---

#### `GET /admin/cantons/snit/{code}`

Retorna un cantón por su código SNIT.

**Auth:** 🔑 Admin

---

#### `POST /admin/cantons`

Crea un nuevo cantón.

**Auth:** 🔑 Admin

**Request Body:**

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `province_snit_code` | `integer` | ✅ | > 0 | Código SNIT de la provincia padre |
| `canton_snit_code` | `integer` | ✅ | > 0 | Código SNIT del cantón |
| `canton_name` | `string` | ✅ | Máx. 55 chars | Nombre del cantón |

**Ejemplo de Request:**

```json
{
  "province_snit_code": 1,
  "canton_snit_code": 101,
  "canton_name": "Central"
}
```

**Response (201):**

```json
{
  "data": { "success": true },
  "meta": null,
  "errors": []
}
```

---

#### `PUT /admin/cantons/{id}`

Actualiza un cantón existente.

**Auth:** 🔑 Admin

---

#### `DELETE /admin/cantons/{id}`

Elimina un cantón. **Cascadea a distritos asociados.**

**Auth:** 🔑 Admin

**Response (200):**

```json
{
  "data": { "deleted": true },
  "meta": null,
  "errors": []
}
```

---

### 6. Districts (Distritos)

Gestión de distritos vinculados a un cantón.

---

#### `GET /districts`

Retorna todos los distritos. Opcionalmente filtrado por cantón.

**Auth:** ❌ No requerida (público)

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `canton_snit_code` | `integer` | ❌ | Filtra distritos por código SNIT de cantón |

**Ejemplo:** `GET /districts?canton_snit_code=101`

**Response (200):**

```json
{
  "data": [
    {
      "district_id": "01HXYZ...",
      "canton_snit_code": 101,
      "district_snit_code": 10101,
      "district_name": "Carmen",
      "created_by": "01HABC...",
      "created_at": "2026-01-01 00:00:00"
    }
  ],
  "meta": null,
  "errors": []
}
```

---

#### `GET /admin/districts/{id}`

Retorna un distrito por su ULID.

**Auth:** 🔑 Admin

---

#### `GET /admin/districts/snit/{code}`

Retorna un distrito por su código SNIT.

**Auth:** 🔑 Admin

---

#### `POST /admin/districts`

Crea un nuevo distrito.

**Auth:** 🔑 Admin

**Request Body:**

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `canton_snit_code` | `integer` | ✅ | > 0 | Código SNIT del cantón padre |
| `district_snit_code` | `integer` | ✅ | > 0 | Código SNIT del distrito |
| `district_name` | `string` | ✅ | Máx. 55 chars | Nombre del distrito |

**Ejemplo de Request:**

```json
{
  "canton_snit_code": 101,
  "district_snit_code": 10101,
  "district_name": "Carmen"
}
```

**Response (201):**

```json
{
  "data": { "success": true },
  "meta": null,
  "errors": []
}
```

---

#### `PUT /admin/districts/{id}`

Actualiza un distrito existente.

**Auth:** 🔑 Admin

---

#### `DELETE /admin/districts/{id}`

Elimina un distrito.

**Auth:** 🔑 Admin

**Response (200):**

```json
{
  "data": { "deleted": true },
  "meta": null,
  "errors": []
}
```

---

### 7. Geomanifestations (Geomanifestaciones)

Gestión de manifestaciones geotermales registradas.

---

#### `GET /geomanifestations` — Listado público

Retorna manifestaciones visibles con paginación y filtros. Datos enriquecidos con información territorial.

**Auth:** ❌ No requerida (público)

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | `integer` | ❌ | Página (default: `1`) |
| `limit` | `integer` | ❌ | Resultados por página (default: `20`) |
| `province_snit_code` | `integer` | ❌ | Filtrar por provincia |
| `canton_snit_code` | `integer` | ❌ | Filtrar por cantón |
| `district_snit_code` | `integer` | ❌ | Filtrar por distrito |
| `temp_min` | `float` | ❌ | Temperatura mínima (°C) |
| `temp_max` | `float` | ❌ | Temperatura máxima (°C) |
| `show_all` | `boolean` | ❌ | `1` para mostrar todas (incluyendo ocultas) |

**Ejemplo:** `GET /geomanifestations?page=1&limit=10&province_snit_code=1&temp_min=40`

**Response (200):**

```json
{
  "data": {
    "items": [
      {
        "id": "01HXYZ...",
        "name": "Fuente Termal Norte",
        "latitude": 10.4567,
        "longitude": -84.1234,
        "province_name": "Guanacaste",
        "canton_name": "Liberia",
        "district_name": "Cañas Dulces",
        "temperature": 65.5,
        "description": "Fuente con actividad constante"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "total_pages": 5
    }
  },
  "meta": null,
  "errors": []
}
```

---

#### `GET /geomanifestations/{id}` — Detalle público

Retorna una manifestación específica con datos enriquecidos.

**Auth:** ❌ No requerida (público)

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ID de la manifestación |

---

#### `GET /admin/geomanifestations`

Retorna todas las manifestaciones (incluyendo ocultas) con paginación. Soporta filtros territoriales.

**Auth:** 🔑 Admin

**Query Parameters:** Igual que `GET /geomanifestations` (excepto `show_all`, ya que siempre muestra todas).

---

#### `GET /admin/geomanifestations/{id}`

Retorna una manifestación por ID (incluyendo ocultas).

**Auth:** 🔑 Admin

---

#### `POST /admin/geomanifestations`

Crea una nueva manifestación geotermal.

**Auth:** 🔑 Admin

**Request Body:**

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `name` | `string` | ✅ | Máx. 255 chars | Nombre de la manifestación |
| `latitude` | `float` | ✅ | -90 a 90 | Latitud |
| `longitude` | `float` | ✅ | -180 a 180 | Longitud |
| `province_snit_code` | `integer` | ❌ | > 0 | Código SNIT de provincia |
| `canton_snit_code` | `integer` | ❌ | > 0 | Código SNIT de cantón |
| `district_snit_code` | `integer` | ❌ | > 0 | Código SNIT de distrito |
| `description` | `string` | ❌ | — | Descripción |
| `current_georeport_id` | `string` | ❌ | — | ID del georeporte actual |
| `visibility` | `boolean` | ❌ | Default: `false` | Visible al público |

**Ejemplo de Request:**

```json
{
  "name": "Fuente Termal Rincón de la Vieja",
  "latitude": 10.7654,
  "longitude": -85.3421,
  "province_snit_code": 5,
  "canton_snit_code": 501,
  "district_snit_code": 50103,
  "description": "Fuente termal con alta actividad volcánica",
  "visibility": true
}
```

**Response (201):**

```json
{
  "data": {
    "id": "01HXYZ...",
    "message": "Geomanifestation created successfully"
  },
  "meta": null,
  "errors": []
}
```

---

#### `PUT /admin/geomanifestations/{id}`

Actualiza una manifestación existente.

**Auth:** 🔑 Admin

**Request Body:** Mismos campos que `POST` (todos opcionales para update parcial).

**Response (200):**

```json
{
  "data": { "message": "Geomanifestation updated successfully" },
  "meta": null,
  "errors": []
}
```

---

#### `DELETE /admin/geomanifestations/{id}`

Elimina permanentemente una manifestación.

**Auth:** 🔑 Admin

**Response (200):**

```json
{
  "data": { "deleted": true },
  "meta": null,
  "errors": []
}
```

---

#### `PATCH /admin/geomanifestations/{id}/visibility`

Cambia la visibilidad pública de una manifestación.

**Auth:** 🔑 Admin

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `visibility` | `boolean` | ✅ | `true` para visible, `false` para oculta |

**Ejemplo de Request:**

```json
{
  "visibility": true
}
```

**Response (200):**

```json
{
  "data": { "message": "Visibility updated", "visibility": true },
  "meta": null,
  "errors": []
}
```

---

### 8. In-Situ Tests (Pruebas In-Situ)

Gestión de pruebas realizadas en campo sobre manifestaciones geotermales.

---

#### `GET /admin/insitu-tests`

Retorna todas las pruebas in-situ de una manifestación.

**Auth:** 🔑 Admin

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `geomanifestation_id` | `string` | ✅ | ID de la manifestación |

**Ejemplo de Request:**

```json
{
  "geomanifestation_id": "01HXYZ..."
}
```

---

#### `GET /admin/insitu-tests/{id}`

Retorna una prueba in-situ específica.

**Auth:** 🔑 Admin

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ID de la prueba |

---

#### `POST /admin/insitu-tests`

Crea una nueva prueba in-situ.

**Auth:** 🔑 Admin

**Request Body:**

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `geomanifestation_id` | `string` | ✅ | No vacío | ID de la manifestación |
| `temperature` | `float` | ❌ | 0-200 | Temperatura en °C |
| `conductivity` | `float` | ❌ | ≥ 0 | Conductividad eléctrica (µS/cm) |
| `ph` | `float` | ❌ | 0-14 | Valor de pH |
| `description` | `string` | ❌ | — | Notas adicionales |

**Ejemplo de Request:**

```json
{
  "geomanifestation_id": "01HXYZ...",
  "temperature": 72.5,
  "conductivity": 1850.0,
  "ph": 6.8,
  "description": "Medición tomada a las 10:00 AM, clima despejado"
}
```

**Response (201):**

```json
{
  "data": {
    "id": "01HABC...",
    "message": "In-situ test created successfully"
  },
  "meta": null,
  "errors": []
}
```

---

#### `PUT /admin/insitu-tests/{id}`

Actualiza una prueba in-situ existente.

**Auth:** 🔑 Admin

**Request Body:** Mismos campos opcionales que `POST` (excepto `geomanifestation_id`).

---

#### `DELETE /admin/insitu-tests/{id}`

Elimina una prueba in-situ.

**Auth:** 🔑 Admin

**Response (200):**

```json
{
  "data": { "deleted": true },
  "meta": null,
  "errors": []
}
```

---

### 9. In-Lab Tests (Pruebas de Laboratorio)

Gestión de análisis de laboratorio con datos geoquímicos detallados.

---

#### `GET /admin/inlab-tests`

Retorna todas las pruebas de laboratorio de una manifestación.

**Auth:** 🔑 Admin

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `geomanifestation_id` | `string` | ✅ | ID de la manifestación |

---

#### `GET /admin/inlab-tests/{id}`

Retorna una prueba de laboratorio específica.

**Auth:** 🔑 Admin

---

#### `POST /admin/inlab-tests`

Crea una nueva prueba de laboratorio.

**Auth:** 🔑 Admin

**Request Body:**

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `geomanifestation_id` | `string` | ✅ | No vacío | ID de la manifestación |
| `ph` | `float` | ❌ | 0-14 | Valor de pH |
| `conductivity` | `float` | ❌ | ≥ 0 | Conductividad (µS/cm) |
| `cl` | `float` | ❌ | ≥ 0 | Cloruro (mg/L) |
| `ca` | `float` | ❌ | ≥ 0 | Calcio (mg/L) |
| `hco3` | `float` | ❌ | ≥ 0 | Bicarbonato (mg/L) |
| `so4` | `float` | ❌ | ≥ 0 | Sulfato (mg/L) |
| `fe` | `float` | ❌ | ≥ 0 | Hierro (mg/L) |
| `si` | `float` | ❌ | ≥ 0 | Sílice (mg/L) |
| `b` | `float` | ❌ | ≥ 0 | Boro (mg/L) |
| `li` | `float` | ❌ | ≥ 0 | Litio (mg/L) |
| `f` | `float` | ❌ | ≥ 0 | Fluoruro (mg/L) |
| `na` | `float` | ❌ | ≥ 0 | Sodio (mg/L) |
| `k` | `float` | ❌ | ≥ 0 | Potasio (mg/L) |
| `mg` | `float` | ❌ | ≥ 0 | Magnesio (mg/L) |
| `description` | `string` | ❌ | — | Notas adicionales |

**Ejemplo de Request:**

```json
{
  "geomanifestation_id": "01HXYZ...",
  "ph": 6.7,
  "conductivity": 1800.0,
  "cl": 45.0,
  "ca": 120.0,
  "hco3": 850.0,
  "so4": 15.0,
  "fe": 0.5,
  "si": 85.0,
  "b": 2.5,
  "li": 0.8,
  "f": 1.2,
  "na": 280.0,
  "k": 25.0,
  "mg": 18.0,
  "description": "Análisis realizado en laboratorio UCR"
}
```

**Response (201):**

```json
{
  "data": {
    "id": "01HDEF...",
    "message": "In-lab test created successfully"
  },
  "meta": null,
  "errors": []
}
```

---

#### `PUT /admin/inlab-tests/{id}`

Actualiza una prueba de laboratorio existente.

**Auth:** 🔑 Admin

---

#### `DELETE /admin/inlab-tests/{id}`

Elimina una prueba de laboratorio.

**Auth:** 🔑 Admin

**Response (200):**

```json
{
  "data": { "deleted": true },
  "meta": null,
  "errors": []
}
```

---

### 10. Georeports (Georeportes)

Gestión de reportes geotermales que agrupan una manifestación con sus pruebas in-situ y de laboratorio.

---

#### `GET /georeports` — Reporte actual (público)

Retorna el georeporte vigente de una manifestación.

**Auth:** ❌ No requerida (público)

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `geomanifestation_id` | `string` | ✅ | ID de la manifestación |

**Ejemplo de Request:**

```json
{
  "geomanifestation_id": "01HXYZ..."
}
```

**Response (200):**

```json
{
  "data": {
    "id": "01HGHI...",
    "geomanifestation_id": "01HXYZ...",
    "insitu_test_id": "01HABC...",
    "inlab_test_id": "01HDEF...",
    "details": "Reporte actualizado Q1 2026",
    "is_current": true,
    "created_at": "2026-03-01 08:00:00"
  },
  "meta": null,
  "errors": []
}
```

---

#### `GET /admin/georeports`

Retorna todos los georeportes de una manifestación (historial completo).

**Auth:** 🔑 Admin

**Request Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `geomanifestation_id` | `string` | ✅ | ID de la manifestación |

---

#### `GET /admin/georeports/{id}`

Retorna un georeporte específico.

**Auth:** 🔑 Admin

---

#### `POST /admin/georeports`

Crea un nuevo georeporte. Opcionalmente lo establece como el reporte vigente.

**Auth:** 🔑 Admin

**Request Body:**

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `geomanifestation_id` | `string` | ✅ | No vacío | ID de la manifestación |
| `insitu_test_id` | `string` | ✅ | No vacío | ID de la prueba in-situ |
| `inlab_test_id` | `string` | ✅ | No vacío | ID de la prueba de laboratorio |
| `details` | `string` | ❌ | Máx. 500 chars | Notas adicionales |
| `set_as_current` | `boolean` | ❌ | Default: `true` | Establecer como reporte vigente |

**Ejemplo de Request:**

```json
{
  "geomanifestation_id": "01HXYZ...",
  "insitu_test_id": "01HABC...",
  "inlab_test_id": "01HDEF...",
  "details": "Reporte trimestral Q2 2026",
  "set_as_current": true
}
```

**Response (201):**

```json
{
  "data": {
    "id": "01HGHI...",
    "message": "Georeport created successfully"
  },
  "meta": null,
  "errors": []
}
```

---

#### `PUT /admin/georeports/{id}`

Actualiza un georeporte. Opcionalmente lo establece como vigente.

**Auth:** 🔑 Admin

**Request Body:** Mismos campos que `POST`. El campo `set_as_current` tiene default `false` en update.

---

#### `DELETE /admin/georeports/{id}`

Elimina un georeporte. Si era el vigente, la referencia se limpia.

**Auth:** 🔑 Admin

**Response (200):**

```json
{
  "data": { "deleted": true },
  "meta": null,
  "errors": []
}
```

---

### 11. Maintenance (Mantenimiento)

Endpoints de administración del sistema. Requieren rol de **maintenance** o **admin**.

---

#### `GET /maintenance/dashboard`

Retorna información del dashboard administrativo (métricas del sistema).

**Auth:** 🔑 Admin / Maintenance

**Response (200):**

```json
{
  "data": {
    "total_users": 150,
    "total_requests": 45,
    "total_manifestations": 120,
    "active_sessions": 23
  },
  "meta": null,
  "errors": []
}
```

---

#### `GET /maintenance/users`

Retorna todos los usuarios registrados con sus datos y roles.

**Auth:** 🔑 Admin / Maintenance

**Response (200):**

```json
{
  "data": [
    {
      "user_id": "01HXYZ...",
      "first_name": "Juan",
      "last_name": "Pérez",
      "email": "juan@ejemplo.com",
      "role": "user",
      "is_deleted": false,
      "created_at": "2026-01-20 14:30:00"
    }
  ],
  "meta": { "total": 150 },
  "errors": []
}
```

---

#### `PUT /maintenance/users/{id}`

Actualiza el rol de un usuario.

**Auth:** 🔑 Admin / Maintenance

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ID del usuario |

**Request Body:**

| Campo | Tipo | Requerido | Valores permitidos |
|-------|------|-----------|-------------------|
| `role` | `string` | ✅ | `admin`, `maintenance`, `fieldInvestigator`, `investigator`, `user` |

---

#### `GET /maintenance/system/logs`

Retorna los logs del sistema.

**Auth:** 🔑 Admin / Maintenance

**Response (200):**

```json
{
  "data": {
    "logs": [
      "[2026-07-21 10:30:00] INFO: User login successful",
      "[2026-07-21 10:31:00] ERROR: Database connection timeout"
    ]
  },
  "meta": null,
  "errors": []
}
```

---

#### `GET /maintenance/database/tables`

Retorna información de todas las tablas de la base de datos.

**Auth:** 🔑 Admin / Maintenance

**Response (200):**

```json
{
  "data": [
    {
      "table_name": "users",
      "row_count": 150,
      "size": "2.5 MB"
    }
  ],
  "meta": null,
  "errors": []
}
```

---

## Resumen de Endpoints

| # | Método | Endpoint | Auth | Descripción |
|---|--------|----------|------|-------------|
| 1 | `POST` | `/auth/login` | ❌ | Iniciar sesión |
| 2 | `POST` | `/auth/refresh` | ❌ | Renovar tokens |
| 3 | `POST` | `/auth/logout` | 🔒 | Cerrar sesión |
| 4 | `POST` | `/users/register` | ❌ | Registrar usuario |
| 5 | `GET` | `/users/me` | 🔒 | Obtener perfil |
| 6 | `PUT` | `/users/me` | 🔒 | Actualizar perfil |
| 7 | `DELETE` | `/users/me` | 🔒 | Eliminar cuenta |
| 8 | `POST` | `/users/restore` | ❌ | Restaurar cuenta |
| 9 | `GET` | `/users/me/session` | 🔒 | Datos de sesión |
| 10 | `PUT` | `/admin/users/{id}/role` | 🔑 | Cambiar rol de usuario |
| 11 | `POST` | `/analysis-requests` | 🔒 | Crear solicitud |
| 12 | `GET` | `/analysis-requests` | 🔒 | Listar solicitudes propias |
| 13 | `GET` | `/analysis-requests/{id}` | 🔒 | Ver solicitud |
| 14 | `PUT` | `/analysis-requests/{id}` | 🔒 | Actualizar solicitud |
| 15 | `DELETE` | `/analysis-requests/{id}` | 🔒 | Eliminar solicitud |
| 16 | `GET` | `/analysis-requests/{id}/states` | 🔒 | Historial de estados |
| 17 | `GET` | `/admin/analysis-requests` | 🔑 | Todas las solicitudes |
| 18 | `GET` | `/admin/analysis-requests/{id}` | 🔑 | Ver solicitud (admin) |
| 19 | `GET` | `/admin/analysis-requests/{id}/states` | 🔑 | Estados (admin) |
| 20 | `POST` | `/admin/analysis-requests/{id}/states` | 🔑 | Agregar estado |
| 21 | `GET` | `/provinces` | ❌ | Listar provincias |
| 22 | `GET` | `/admin/provinces/{id}` | 🔑 | Ver provincia |
| 23 | `GET` | `/admin/provinces/snit/{code}` | 🔑 | Provincia por SNIT |
| 24 | `POST` | `/admin/provinces` | 🔑 | Crear provincia |
| 25 | `PUT` | `/admin/provinces/{id}` | 🔑 | Actualizar provincia |
| 26 | `DELETE` | `/admin/provinces/{id}` | 🔑 | Eliminar provincia |
| 27 | `GET` | `/cantons` | ❌ | Listar cantones |
| 28 | `GET` | `/admin/cantons/{id}` | 🔑 | Ver cantón |
| 29 | `GET` | `/admin/cantons/snit/{code}` | 🔑 | Cantón por SNIT |
| 30 | `POST` | `/admin/cantons` | 🔑 | Crear cantón |
| 31 | `PUT` | `/admin/cantons/{id}` | 🔑 | Actualizar cantón |
| 32 | `DELETE` | `/admin/cantons/{id}` | 🔑 | Eliminar cantón |
| 33 | `GET` | `/districts` | ❌ | Listar distritos |
| 34 | `GET` | `/admin/districts/{id}` | 🔑 | Ver distrito |
| 35 | `GET` | `/admin/districts/snit/{code}` | 🔑 | Distrito por SNIT |
| 36 | `POST` | `/admin/districts` | 🔑 | Crear distrito |
| 37 | `PUT` | `/admin/districts/{id}` | 🔑 | Actualizar distrito |
| 38 | `DELETE` | `/admin/districts/{id}` | 🔑 | Eliminar distrito |
| 39 | `GET` | `/geomanifestations` | ❌ | Listar manifestaciones (público) |
| 40 | `GET` | `/geomanifestations/{id}` | ❌ | Ver manifestación (público) |
| 41 | `GET` | `/admin/geomanifestations` | 🔑 | Listar todas (admin) |
| 42 | `GET` | `/admin/geomanifestations/{id}` | 🔑 | Ver manifestación (admin) |
| 43 | `POST` | `/admin/geomanifestations` | 🔑 | Crear manifestación |
| 44 | `PUT` | `/admin/geomanifestations/{id}` | 🔑 | Actualizar manifestación |
| 45 | `DELETE` | `/admin/geomanifestations/{id}` | 🔑 | Eliminar manifestación |
| 46 | `PATCH` | `/admin/geomanifestations/{id}/visibility` | 🔑 | Cambiar visibilidad |
| 47 | `GET` | `/admin/insitu-tests` | 🔑 | Listar pruebas in-situ |
| 48 | `GET` | `/admin/insitu-tests/{id}` | 🔑 | Ver prueba in-situ |
| 49 | `POST` | `/admin/insitu-tests` | 🔑 | Crear prueba in-situ |
| 50 | `PUT` | `/admin/insitu-tests/{id}` | 🔑 | Actualizar prueba in-situ |
| 51 | `DELETE` | `/admin/insitu-tests/{id}` | 🔑 | Eliminar prueba in-situ |
| 52 | `GET` | `/admin/inlab-tests` | 🔑 | Listar pruebas lab |
| 53 | `GET` | `/admin/inlab-tests/{id}` | 🔑 | Ver prueba lab |
| 54 | `POST` | `/admin/inlab-tests` | 🔑 | Crear prueba lab |
| 55 | `PUT` | `/admin/inlab-tests/{id}` | 🔑 | Actualizar prueba lab |
| 56 | `DELETE` | `/admin/inlab-tests/{id}` | 🔑 | Eliminar prueba lab |
| 57 | `GET` | `/georeports` | ❌ | Reporte vigente (público) |
| 58 | `GET` | `/admin/georeports` | 🔑 | Listar georeportes |
| 59 | `GET` | `/admin/georeports/{id}` | 🔑 | Ver georeporte |
| 60 | `POST` | `/admin/georeports` | 🔑 | Crear georeporte |
| 61 | `PUT` | `/admin/georeports/{id}` | 🔑 | Actualizar georeporte |
| 62 | `DELETE` | `/admin/georeports/{id}` | 🔑 | Eliminar georeporte |
| 63 | `GET` | `/maintenance/dashboard` | 🔑 | Dashboard del sistema |
| 64 | `GET` | `/maintenance/users` | 🔑 | Listar todos los usuarios |
| 65 | `PUT` | `/maintenance/users/{id}` | 🔑 | Cambiar rol de usuario |
| 66 | `GET` | `/maintenance/system/logs` | 🔑 | Logs del sistema |
| 67 | `GET` | `/maintenance/database/tables` | 🔑 | Info de tablas BD |

---

**Leyenda:**
- ❌ = Sin autenticación requerida
- 🔒 = Requiere usuario autenticado
- 🔑 = Requiere rol de admin o maintenance