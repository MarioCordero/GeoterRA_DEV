# Especificación de Códigos de Error (API)

Este documento describe el modelo de errores de la API: cómo funcionan los códigos de error, su estructura, cómo se incluyen en las respuestas del servidor y el proceso para añadir nuevos códigos.

````markdown
# Guía de Códigos de Error (API)

Esta guía documenta los códigos de error actuales, cómo se serializan en las respuestas, recomendaciones para solucionarlos y cómo añadir nuevos códigos de manera consistente con la implementación existente.

## Componentes clave

- ErrorType: Clase de valor que centraliza códigos y mensajes de error. Se serializa como `{ code, message }`. Ver [src/Http/ErrorType.php](../src/Http/ErrorType.php).
- Response: Utilidad para respuestas JSON uniformes (`success` y `error`). Ver [src/Http/Response.php](../src/Http/Response.php).

## Formato de respuesta

Todas las respuestas comparten el mismo sobre:

- `data`: Objeto o `null`. En errores es `null`.
- `meta`: Objeto o `null`. Metadatos opcionales.
- `errors`: Arreglo de objetos `{ code, message }`. Vacío en respuestas exitosas.

Ejemplo de éxito:

```json
{
  "data": { "user_id": 123 },
  "meta": { "new_user": true },
  "errors": []
}
```

Ejemplo de error:

```json
{
  "data": null,
  "meta": null,
  "errors": [
    { "code": "INVALID_JSON", "message": "Malformed or invalid JSON payload" }
  ]
}
```

## Catálogo de códigos actuales

Nota: Algunos códigos son “dinámicos” y embeben el nombre del campo o recurso en el propio `code`.

1. INVALID_JSON
   - Cuándo: El cuerpo no es JSON válido o está malformado.
   - Solución: Enviar JSON válido y cabecera `Content-Type: application/json`. Validar/serializar correctamente en el cliente.
   - HTTP recomendado: 400 (Bad Request).

2. VALIDATION_{field}
   - Cuándo: Validación de un campo específico falla. El `code` incluye el nombre del campo; el `message` explica el motivo.
   - Solución: Corregir el campo (formato, longitud, rango). Validar en cliente y servidor.
   - HTTP recomendado: 422 (Unprocessable Entity) o 400 según criterio.

3. MISSING_FIELD_{field}
   - Cuándo: Falta un campo requerido en el payload.
   - Solución: Incluir el campo requerido y reintentar.
   - HTTP recomendado: 400 (Bad Request) o 422.

4. INVALID_EMAIL
   - Cuándo: El formato de email no es válido.
   - Solución: Usar un email con formato correcto (RFC5322 razonable).
   - HTTP recomendado: 422.

5. EMAIL_ALREADY_IN_USE
   - Cuándo: El email ya existe en la base de datos.
   - Solución: Usar otro email; en servidor, asegurar constraints únicas y manejo de duplicados.
   - HTTP recomendado: 409 (Conflict).

6. WEAK_PASSWORD
   - Cuándo: La contraseña no cumple la política de seguridad.
   - Solución: Cumplir requisitos (p.ej., longitud mínima, mezcla de tipos de caracteres).
   - HTTP recomendado: 422.

7. INVALID_CREDENTIALS
   - Cuándo: Email o contraseña incorrectos en login.
   - Solución: Verificar credenciales. No exponer detalles de cuál campo falló.
   - HTTP recomendado: 401 (Unauthorized).

8. MISSING_AUTH_TOKEN
   - Cuándo: No se envía token en la cabecera `Authorization`.
   - Solución: Enviar `Authorization: Bearer <token>`.
   - HTTP recomendado: 401 (Unauthorized).

9. INVALID_TOKEN
   - Cuándo: Token inválido o expirado.
   - Solución: Renovar token o iniciar sesión de nuevo; verificar firma/expiración.
   - HTTP recomendado: 401 (Unauthorized).

10. UNAUTHORIZED_ACCESS
    - Cuándo: El usuario no está autenticado o carece de permisos básicos.
    - Solución: Autenticarse o adquirir permisos necesarios.
    - HTTP recomendado: 401 (Unauthorized).

11. FORBIDDEN_ACCESS
    - Cuándo: El usuario autenticado intenta acceder a un recurso sin permisos suficientes (autenticado pero sin autorización específica).
    - Solución: Ajustar roles/permisos, aplicar controles RBAC/ABAC.
    - HTTP recomendado: 403 (Forbidden).

12. NOT_FOUND_{Resource}
    - Cuándo: No se encontró el recurso solicitado (p.ej., `NOT_FOUND_User`).
    - Solución: Verificar identificadores, existencia del recurso y visibilidad.
    - HTTP recomendado: 404 (Not Found).

13. CONFLICT_ERROR
    - Cuándo: Conflicto de estado (duplicados, violación de unicidad, condiciones de carrera).
    - Solución: Resolver el conflicto (usar valores únicos, reintentos idempotentes, manejo de versiones).
    - HTTP recomendado: 409 (Conflict).

14. INTERNAL_ERROR
    - Cuándo: Error inesperado en servidor.
    - Solución: Revisar logs, ocultar detalles a cliente; retornar mensaje genérico y corregir causa raíz.
    - HTTP recomendado: 500 (Internal Server Error).

15. Genérico: from(code, message)
    - Uso: Crear un error ad-hoc cuando no existe fábrica específica.
    - Ejemplo: `ErrorType::from('RATE_LIMITED', 'Too many requests')`.
    - HTTP recomendado: según el caso (p.ej., 429 para rate limit).

## Uso en el código

Controladores (patrones reales):

```php
// JSON inválido (Login/Register)
Response::error(ErrorType::invalidJson(), 400);

// Validación de DTO (mensaje proveniente de excepción)
Response::error(ErrorType::from('BAD_REQUEST', $e->getMessage()), 422);

// Token faltante o inválido (UserController)
Response::error(ErrorType::missingAuthToken(), 401);
Response::error(ErrorType::invalidToken(), 401);

// No encontrado
Response::error(ErrorType::notFound('User'), 404);

// Credenciales inválidas
Response::error(ErrorType::invalidCredentials(), 401);

// Error interno
Response::error(ErrorType::internal($e->getMessage()), 500);
```

DTOs (propagan validaciones como excepciones con mensaje estándar):

```php
// Ejemplo: RegisterUserDTO
throw new \RuntimeException(
  ErrorType::missingField('firstName')->jsonSerialize()['message']
);
// El controlador captura y responde con el HTTP status apropiado.
```

Servicios (negocio):

```php
// Email duplicado
throw new \RuntimeException(
  ErrorType::emailAlreadyInUse()->jsonSerialize()['message']
);

// Recurso no encontrado
throw new \RuntimeException(
  ErrorType::notFound('User')->jsonSerialize()['message']
);
```

Response (comportamiento con strings):

- Si pasas strings en `Response::error([...])`, se transforman a `ErrorType::from('BAD_REQUEST', <string>)`.
- Preferir pasar instancias de `ErrorType` para mantener consistencia y tipado.

## Mapeo HTTP recomendado

- `INVALID_JSON` → 400
- `VALIDATION_{field}` / `MISSING_FIELD_{field}` → 422 (o 400)
- `BAD_REQUEST` (vía `from`) → 400/422
- `INVALID_CREDENTIALS`, `MISSING_AUTH_TOKEN`, `INVALID_TOKEN`, `UNAUTHORIZED_ACCESS` → 401
- `FORBIDDEN_ACCESS` → 403
- `NOT_FOUND_{Resource}` → 404
- `CONFLICT_ERROR` → 409
- `INTERNAL_ERROR` → 500

## Añadir un nuevo código de error

1) Nomenclatura y mensaje
   - Usa MAYÚSCULAS con `_` (p.ej., `RATE_LIMITED`). Mensaje claro y no sensible.

2) Agregar fábrica en ErrorType

```php
// src/Http/ErrorType.php
public static function rateLimited(string $message = 'Too many requests'): self
{
  return new self('RATE_LIMITED', $message);
}
```

3) Usar en controladores/servicios con el status adecuado

```php
Response::error(ErrorType::rateLimited(), 429);
```

4) Opción rápida con `from` (si no quieres tocar la clase aún)

```php
Response::error(ErrorType::from('RATE_LIMITED', 'Too many requests'), 429);
```

5) Pruebas y documentación
   - Verifica `code`, `message` y `HTTP status`. Actualiza esta guía.

## Nota sobre BAD_REQUEST

- `Response::error` convierte strings a `ErrorType::from('BAD_REQUEST', ...)` automáticamente.
- Para mantener consistencia, puedes:
  - Usar explícitamente `ErrorType::from('BAD_REQUEST', $mensaje)` en validaciones genéricas, o
  - Añadir una fábrica helper opcional en `ErrorType`:

```php
public static function badRequest(string $message = 'Bad request'): self
{
  return new self('BAD_REQUEST', $message);
}
```

## Referencias

- ErrorType: [src/Http/ErrorType.php](../src/Http/ErrorType.php)
- Response: [src/Http/Response.php](../src/Http/Response.php)
- Controladores: [src/Controllers/LoginController.php](../src/Controllers/LoginController.php), [src/Controllers/RegisterController.php](../src/Controllers/RegisterController.php), [src/Controllers/UserController.php](../src/Controllers/UserController.php)
- Servicios/DTOs: [src/Services/UserService.php](../src/Services/UserService.php), [src/Services/AuthService.php](../src/Services/AuthService.php), [src/DTO/RegisterUserDTO.php](../src/DTO/RegisterUserDTO.php), [src/DTO/LoginUserDTO.php](../src/DTO/LoginUserDTO.php)

````
