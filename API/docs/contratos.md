# Documentación de Endpoints (Contratos y Errores)

Este documento describe de forma detallada los contratos de cada endpoint: autenticación requerida, cuerpo de la petición, estructura de la respuesta, códigos de error tipados y recomendaciones para resolverlos. Complementa la arquitectura general en [docs/arquitectura.md](arquitectura.md) y la guía de errores en [docs/errores.md](errores.md).

Todos los endpoints usan el mismo sobre de respuesta definido en [src/Http/Response.php](../src/Http/Response.php):

- `data`: objeto o `null`.
- `meta`: objeto o `null`.
- `errors`: arreglo de `{ code, message }` (vacío en éxito).

Las referencias a códigos de error corresponden a [src/Http/ErrorType.php](../src/Http/ErrorType.php).

---

## Autenticación

### POST /auth/register
- **Auth**: no requiere.
- **Propósito**: crear una cuenta de usuario.
- **Body (JSON)**:
  - `name` (string, requerido): nombre.
  - `lastname` (string, requerido): apellido.
  - `email` (string, requerido, formato email válido, único).
  - `phone_number` (string, opcional, 8–15 dígitos).
  - `password` (string, requerido, min 8 caracteres).
- **Respuesta (201)**:
  - `data`: `{ "user_id": string }`.
  - `meta`: `{ "new_user": true }`.
- **Errores y resolución**:
  - `MISSING_FIELD_*` (422): falta un campo. Corregir payload.
  - `INVALID_EMAIL` (422): formato inválido. Enviar email válido.
  - `WEAK_PASSWORD` (422): política mínima no cumplida. Ajustar contraseña.
  - `EMAIL_ALREADY_IN_USE` (409): correo ya existe. Usar otro.
  - `INVALID_JSON` (400): revisar `Content-Type` y JSON.
  - `INTERNAL_ERROR` (500): revisar logs.
- **Consideraciones**:
  - El usuario se crea con rol `user` y `is_active=1`.

### POST /auth/login
- **Auth**: no requiere.
- **Propósito**: autenticar y obtener credenciales.
- **Body (JSON)**:
  - `email` (string, requerido, formato válido).
  - `password` (string, requerido, min 8).
- **Respuesta (200)**:
  - `data`: `{ "access_token", "refresh_token", "access_expires_at", "refresh_expires_at" }`.
  - `meta`: `{ "token_type": "Bearer" }`.
- **Errores y resolución**:
  - `MISSING_FIELD_*` / `INVALID_EMAIL` / `WEAK_PASSWORD` (422/400): validar en cliente.
  - `INVALID_CREDENTIALS` (401): credenciales incorrectas.
  - `INVALID_JSON` (400): payload inválido.
  - `INTERNAL_ERROR` (500): revisar logs.
- **Consideraciones**:
  - Tokens opacos; el servidor almacena hashes.
  - `access_expires_at` ~ 15 min; `refresh_expires_at` ~ 30 días.

### POST /auth/refresh
- **Auth**: no por `Authorization`; requiere `refresh_token` en body.
- **Propósito**: rotar refresh y emitir nuevo access.
- **Body (JSON)**:
  - `refresh_token` (string, requerido).
- **Respuesta (200)**:
  - `data`: `{ "access_token", "refresh_token", "access_expires_at", "refresh_expires_at" }`.
  - `meta`: `{ "rotated": true }`.
- **Errores y resolución**:
  - `MISSING_FIELD_refresh_token` (400): incluir token.
  - `INVALID_TOKEN` (401): refresh inválido/expirado. Reautenticar.
  - `INVALID_JSON` (400), `INTERNAL_ERROR` (500).
- **Consideraciones**:
  - Rotación invalida el refresh previo.
  - Detectar reuso fraudulento → invalidar sesión.

### POST /auth/logout
- **Auth**: requerido (`Authorization: Bearer <access_token>`).
- **Propósito**: revocar sesión actual.
- **Headers**:
  - `Authorization: Bearer <access_token>`.
- **Respuesta (200)**:
  - `data`: `{ "logged_out": true }`.
- **Errores y resolución**:
  - `MISSING_AUTH_TOKEN` (401): enviar header.
  - `INVALID_TOKEN` (401): token inválido/expirado.
  - `INTERNAL_ERROR` (500).
- **Consideraciones**:
  - Revoca access/refresh asociados al usuario.

---

## Usuarios

### GET /users/me
- **Auth**: requerido (`Authorization: Bearer <access_token>`).
- **Propósito**: obtener perfil del usuario autenticado.
- **Respuesta (200)**:
  - `data`: `{ "user_id", "first_name", "last_name", "email", "phone_number", "role", "is_active", "is_verified", "created_at" }`.
  - `meta`: `null`.
- **Errores y resolución**:
  - `MISSING_AUTH_TOKEN` / `INVALID_TOKEN` (401): validar sesión.
  - `NOT_FOUND` (404, recurso User): no existe. Ver datos o sesión.
  - `INTERNAL_ERROR` (500).

### PUT /users/me
- **Auth**: requerido.
- **Propósito**: actualizar perfil del usuario.
- **Body (JSON)**:
  - `name` (string, requerido).
  - `lastname` (string, requerido).
  - `email` (string, requerido, formato válido).
  - `phone_number` (string, opcional, 8–15 dígitos).
- **Respuesta (200)**:
  - `data`: `{ "message": "User profile updated successfully" }`.
- **Errores y resolución**:
  - `MISSING_FIELD_*` / `INVALID_EMAIL` / `INVALID_FIELD_phone_number` (422): corregir payload.
  - `USER_UPDATE_FAILED` (500): error persistencia; reintentar y revisar servidor.
  - `MISSING_AUTH_TOKEN` / `INVALID_TOKEN` (401).

### DELETE /users/me
- **Auth**: requerido.
- **Propósito**: eliminar (soft-delete) la cuenta del usuario.
- **Respuesta (200)**:
  - `data`: `{ "message": "User account deleted successfully" }`.
- **Errores y resolución**:
  - `USER_DELETE_FAILED` (500): no se pudo eliminar; revisar DB/estado.
  - `MISSING_AUTH_TOKEN` / `INVALID_TOKEN` (401).

---

## Solicitudes de Análisis

Recurso: `analysis-request` (ULID en path para operaciones sobre entidad).

### POST /analysis-request
- **Auth**: requerido.
- **Propósito**: crear una solicitud de análisis.
- **Body (JSON)**:
  - `region` (string, requerido).
  - `email` (string, requerido, formato válido).
  - `owner_contact_number` (string, opcional).
  - `owner_name` (string, requerido).
  - `temperature_sensation` (string, opcional).
  - `bubbles` (boolean, opcional, por defecto `false`).
  - `details` (string, opcional).
  - `current_usage` (string, opcional).
  - `latitude` (number, requerido).
  - `longitude` (number, requerido).
- **Respuesta (201)**:
  - `data`: `{ "message": "Analysis request created successfully" }`.
  - `meta`: `{}`.
- **Errores y resolución**:
  - `MISSING_FIELD_*` (422): completar campos.
  - `INVALID_FIELD_email` (422): formato.
  - `INVALID_JSON` (400).
  - `INTERNAL_ERROR` (500): transacción/ID.
  - `MISSING_AUTH_TOKEN` / `INVALID_TOKEN` (401).
- **Consideraciones**:
  - El `name` interno se genera automáticamente con prefijo `SOLI-`.

### GET /analysis-request
- **Auth**: requerido.
- **Propósito**: listar solicitudes del usuario autenticado.
- **Respuesta (200)**:
  - `data`: lista de objetos con campos:
    - `name`, `region`, `email`, `owner_name`, `owner_contact_number`, `current_usage`, `temperature_sensation`, `bubbles`, `details`, `latitude`, `longitude`, `state`, `created_at`.
- **Errores y resolución**:
  - `MISSING_AUTH_TOKEN` / `INVALID_TOKEN` (401).
  - `INTERNAL_ERROR` (500).

### PUT /analysis-request/{id}
- **Auth**: requerido.
- **Path Param**: `id` (ULID, `[0-9A-HJKMNP-TV-Z]{26}`).
- **Propósito**: actualizar la solicitud del propio usuario.
- **Body (JSON)**: mismo contrato que `POST /analysis-request`.
- **Respuesta (200)**:
  - `data`: `{ "message": "Analysis request updated successfully" }`.
- **Errores y resolución**:
  - `ANALYSIS_REQUEST_NOT_FOUND` (404): verificar `id` y propiedad.
  - `ANALYSIS_REQUEST_UPDATE_FAILED` (500): persistencia; revisar servidor.
  - Validaciones del DTO (422), `INVALID_JSON` (400), auth (401).

### DELETE /analysis-request/{id}
- **Auth**: requerido.
- **Path Param**: `id` (ULID).
- **Propósito**: eliminar la solicitud del propio usuario.
- **Respuesta (200)**:
  - `data`: `{ "message": "Analysis request deleted successfully" }`.
- **Errores y resolución**:
  - `ANALYSIS_REQUEST_NOT_FOUND` (404).
  - `ANALYSIS_REQUEST_DELETE_FAILED` (500).
  - Auth (401).

---

## Manifestaciones Geotérmicas Registradas

Recurso: `registered-manifestations`.

### POST /registered-manifestations
- **Auth**: requerido; rol `admin`.
- **Propósito**: crear manifestación registrada.
- **Body (JSON)**:
  - `name` (string, requerido, único por recurso).
  - `region` (string, requerido; ver [AllowedRegions](../src/DTO/AllowedRegions.php)).
  - `latitude` (number, requerido, -90..90).
  - `longitude` (number, requerido, -180..180).
  - Opcionales: `description`, `temperature`, `field_pH`, `field_conductivity`, `lab_pH`, `lab_conductivity`, `cl`, `ca`, `hco3`, `so4`, `fe`, `si`, `b`, `li`, `f`, `na`, `k`, `mg`.
- **Respuesta (201)**:
  - `data`: `{ "success": true }`.
- **Errores y resolución**:
  - `MISSING_FIELD_*` (422): campos requeridos.
  - `INVALID_REGION` (422): ver lista permitida; usar `all` para todo.
  - `INVALID_FIELD_latitude|longitude` (422): rangos.
  - `CONFLICT_ERROR` (409): `namvdfctfgyre` duplicado.
  - `MANIFESTATION_CREATE_FAILED` (500): persistencia.
  - `FORBIDDEN_ACCESS` (403): rol insuficiente.
  - Auth (401).

### GET /registered-manifestations?region={region}
- **Auth**: requerido.
- **Propósito**: listar por región.
- **Query**:
  - `region` (string, requerido; valores en [AllowedRegions](../src/DTO/AllowedRegions.php)).
- **Respuesta (200)**:
  - `data`: lista con campos: `id`, `region`, `latitude`, `longitude`, `description`, parámetros químicos y `created_at`, `created_by`, `modified_at`, `modified_by`.
- **Errores y resolución**:
  - `INVALID_REGION` (422): ajustar valor.
  - Auth (401), `INTERNAL_ERROR` (500).

### PUT /registered-manifestations/{id}
- **Auth**: requerido; rol `admin`.
- **Path Param**: `id` (ULID).
- **Body (JSON)**: igual a `POST`.
- **Respuesta (200)**:
  - `data`: `{ "id": string }`, `meta`: `{ "updated": true }`.
- **Errores y resolución**:
  - `NOT_FOUND` (404, recurso Registered manifestation): verificar `id`.
  - `MANIFESTATION_UPDATE_FAILED` (500).
  - `FORBIDDEN_ACCESS` (403), Auth (401), validaciones (422).

### DELETE /registered-manifestations/{id}
- **Auth**: requerido; rol `admin`.
- **Path Param**: `id` (ULID).
- **Respuesta (200)**:
  - `data`: `null`, `meta`: `{ "deleted": true }`.
- **Errores y resolución**:
  - `NOT_FOUND` (404).
  - `MANIFESTATION_DELETE_FAILED` (500).
  - `FORBIDDEN_ACCESS` (403), Auth (401).

---

## Notas Generales

- **Autorización**: los endpoints protegidos requieren `Authorization: Bearer <access_token>`; para refresh usar body con `refresh_token`.
- **Idempotencia**: `PUT`/`DELETE` toleran reintentos; duplicados retornan 409 o no-op con 200/204 según caso.
- **Validación**: los DTO aplican reglas sintácticas y de dominio. Corregir payload según mensajes.
- **ULID**: identificadores de 26 caracteres `[0-9A-HJKMNP-TV-Z]{26}`.
- **Paginación/Meta**: cuando aplica, `meta` puede incluir detalles de paginación; ver arquitectura.
- **Errores**: ver catálogo y guías en [docs/errores.md](errores.md).
