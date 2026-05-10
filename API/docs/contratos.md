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

### GET /users/me-session
Obtiene usuario autenticado desde sesión (cookie HttpOnly).

**Headers:**
- Cookie: geoterra_session_token=...

**Response 200:**
```json
{
  "data": {
    "user_id": "...",
    "email": "...",
    "name": "...",
    "role": "admin",
    "is_admin": true
  },
  "meta": null,
  "errors": []
}
```

**Response 401:**
```json
{
  "data": null,
  "meta": null,
  "errors": [{"code": "MISSING_AUTH_TOKEN", "message": "..."}]
}
```

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
  - `region` (int, requerido): ID de la región.
  - `email` (string, requerido, email válido).
  - `owner_contact_number` (string, opcional): número de teléfono del propietario.
  - `owner_name` (string, requerido): nombre del propietario/solicitante.
  - `temperature_sensation` (ENUM, requerido): percepción térmica subjetiva. Valores permitidos:
    - `Muy frío`
    - `Frío`
    - `Templado`
    - `Cálido`
    - `Muy Caliente`
    - `caliente`
  - `bubbles` (boolean, opcional, por defecto `false`): indica si hay burbujeo presente.
  - `details` (string, opcional): detalles adicionales.
  - `current_usage` (string, opcional): uso actual del terreno.
  - `latitude` (number, requerido, -90 a 90): coordenada de latitud.
  - `longitude` (number, requerido, -180 a 180): coordenada de longitud.
  - `state` (ENUM, opcional): estado actual de la solicitud. Valores permitidos:
    - `Registrada` (estado por defecto para nuevas solicitudes)
    - `En revisión`
    - `Verificación de campo`
    - `Análisis en laboratorio`
    - `Aprobada`
    - `Rechazada`
    - `Archivada`
- **Respuesta (201)**:
  - `data`: `{ "message": "Analysis request created successfully" }`.
  - `meta`: `{}`.
- **Errores y resolución**:
  - `MISSING_FIELD_*` (422): completar campos obligatorios.
  - `INVALID_FIELD_email` (422): formato de email inválido.
  - `INVALID_FIELD_temperature_sensation` (422): valor no permitido para temperature_sensation.
  - `INVALID_FIELD_state` (422): valor no permitido para state si se proporciona.
  - `INVALID_JSON` (400): JSON mal formado.
  - `INTERNAL_ERROR` (500): error de transacción/ID.
  - `MISSING_AUTH_TOKEN` / `INVALID_TOKEN` (401): autenticación requerida.
- **Consideraciones**:
  - El `name` interno se genera automáticamente con prefijo `SOLI-`.
  - `temperature_sensation` es obligatorio en el envío del cliente.

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
- **Propósito**: crear manifestación registrada con atributos físicos y químicos.
- **Body (JSON)**:
  - `name` (string, requerido, único): nombre descriptivo de la manifestación.
  - `region_id` (int, requerido): ID de la región.
  - `latitude` (number, requerido, -90 a 90): coordenada de latitud.
  - `longitude` (number, requerido, -180 a 180): coordenada de longitud.
  - `description` (string, opcional): descripción detallada.

#### Atributos Físicos - Mediciones In Situ (Opcional)
  - `temperature` (decimal, 8 decimales, °C): temperatura del agua en campo.
    - Rango permitido: 0 a 250°C
    - Restricción: No puede ser negativo.
    - Observación: Alta entalpía comienza en 150°C.
  - `field_pH` (decimal, 8 decimales): nivel de acidez/alcalinidad in situ.
    - Rango permitido: 0 a 14
    - Rango típico: 2 a 11
    - Restricción: Fuera del rango 0-14 no es posible químicamente.
  - `field_conductivity` (decimal, 8 decimales, µS/cm): sales disueltas in situ.
    - Rango permitido: ≥ 0
    - Rango típico: 50 a 200,000 µS/cm
    - Observación: Aguas termales suelen ser altas en conductividad.

#### Atributos Físicos - Mediciones en Laboratorio (Opcional)
  - `lab_pH` (decimal, 8 decimales): nivel de acidez/alcalinidad en laboratorio.
    - Rango permitido: 0 a 14
    - Rango típico: 2 a 11
  - `lab_conductivity` (decimal, 8 decimales, µS/cm): sales disueltas en laboratorio.
    - Rango permitido: ≥ 0
    - Rango típico: 50 a 200,000 µS/cm

#### Atributos Químicos - Análisis Laboratorio (Opcional)
  Los siguientes elementos químicos se miden en muestras de laboratorio. Todos son decimales con 8 decimales de precisión (mg/L o similar unidad):
  - `cl` (Cloruros): restricción ≥ 0
  - `ca` (Calcio): restricción ≥ 0
  - `hco3` (Bicarbonatos): restricción ≥ 0
  - `so4` (Sulfatos): restricción ≥ 0
  - `fe` (Hierro): restricción ≥ 0
  - `si` (Sílice): restricción ≥ 0
  - `b` (Boro): restricción ≥ 0
  - `li` (Litio): restricción ≥ 0
  - `f` (Fluoruro): restricción ≥ 0
  - `na` (Sodio): restricción ≥ 0
  - `k` (Potasio): restricción ≥ 0
  - `mg` (Magnesio): restricción ≥ 0

- **Respuesta (201)**:
  - `data`: `{ "success": true }`.
- **Errores y resolución**:
  - `MISSING_FIELD_*` (422): campos requeridos incompletos.
  - `INVALID_FIELD_latitude|longitude` (422): rangos inválidos (-90 a 90, -180 a 180).
  - `INVALID_FIELD_temperature` (422): temperatura fuera rango 0-250°C.
  - `INVALID_FIELD_field_pH` (422): pH fuera rango 0-14.
  - `INVALID_FIELD_field_conductivity` (422): conductividad negativa.
  - `INVALID_FIELD_lab_pH` (422): pH fuera rango 0-14.
  - `INVALID_FIELD_lab_conductivity` (422): conductividad negativa.
  - `INVALID_FIELD_*` (422): elemento químico negativo (Cl, Ca, HCO3, SO4, Fe, Si, B, Li, F, Na, K, Mg).
  - `CONFLICT_ERROR` (409): `name` duplicado.
  - `MANIFESTATION_CREATE_FAILED` (500): error de persistencia.
  - `FORBIDDEN_ACCESS` (403): rol insuficiente (admin requerido).
  - Auth (401): autenticación requerida.

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

## Mantenimiento y Administración de Usuarios

Endpoints administrativos para gestión del sistema.

### PUT /maintenance/users/{id}
- **Auth**: requerido; rol `maintenance`.
- **Propósito**: actualizar el rol de un usuario.
- **Path Param**: `id` (ULID, identificador del usuario a actualizar, `[0-9A-HJKMNP-TV-Z]{26}`).
- **Body (JSON)**:
  - `role` (string, requerido): rol a asignar. Valores permitidos: `admin`, `maintenance`, `user`.
- **Respuesta (200)**:
  ```json
  {
    "data": {
      "user_id": "<ULID>",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone_number": "555-1234",
      "role": "admin",
      "is_active": 1,
      "is_verified": 1,
      "created_at": "2026-04-24 10:30:00"
    },
    "meta": null,
    "errors": []
  }
  ```
- **Errores y resolución**:
  - `FORBIDDEN_ACCESS` (403): usuario no posee rol `maintenance` o no tiene permiso `ASSIGN_ROLES`.
  - `MISSING_FIELD_id` (400): `id` faltante en ruta.
  - `MISSING_FIELD_role` (422): campo `role` faltante en payload.
  - `INVALID_FIELD_role` (422): valor de `role` inválido. Usar: `admin`, `maintenance`, `user`.
  - `NOT_FOUND` (404): usuario con `id` especificado no existe.
  - `USER_UPDATE_FAILED` (500): error en persistencia; revisar logs del servidor.
  - `MISSING_AUTH_TOKEN` / `INVALID_TOKEN` (401): token inválido o expirado.
- **Consideraciones**:
  - Solo usuarios con rol `maintenance` pueden ejecutar este endpoint.
  - No hay restricciones sobre qué roles pueden asignarse (un usuario `maintenance` puede promover a otro a `admin`).
  - La actualización de rol es inmediata y no requiere confirmación.
  - El timestamp `updated_at` en la base de datos se actualiza automáticamente.

---

## Notas Generales

- **Autorización**: los endpoints protegidos requieren `Authorization: Bearer <access_token>`; para refresh usar body con `refresh_token`.
- **Idempotencia**: `PUT`/`DELETE` toleran reintentos; duplicados retornan 409 o no-op con 200/204 según caso.
- **Validación**: los DTO aplican reglas sintácticas y de dominio. Corregir payload según mensajes.
- **ULID**: identificadores de 26 caracteres `[0-9A-HJKMNP-TV-Z]{26}`.
- **Paginación/Meta**: cuando aplica, `meta` puede incluir detalles de paginación; ver arquitectura.
- **Errores**: ver catálogo y guías en [docs/errores.md](errores.md).
