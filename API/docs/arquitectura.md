# Arquitectura de la API

Este documento describe la arquitectura, convenciones y flujos principales de la API. Está pensada como guía práctica para desarrollar, depurar y extender nuevos endpoints de forma consistente y segura.

## Visión General

Arquitectura en capas (inspirada en Clean/Hexagonal ligera):

```
HTTP Request
   ↓
Controller (Orquestación HTTP)
   ↓
Service (Lógica de negocio / aplicación)
   ↓
Repository (Persistencia con PDO)
   ↓
Database
```

Capas transversales:
- DTOs → Normalización + validación de entrada
- AuthService → Autenticación basada en sesiones/token
- Response → Contrato de salida HTTP uniforme
- ErrorType / ApiException → Modelo de error tipado y consistente

### RESTful: Convenciones y Diseño

La API sigue principios REST sencillos y explícitos:

- Recursos en plural y con kebab-case: `analysis-requests`, `registered-manifestations`, `users`, `sessions`.
- Rutas por recurso y método:
  - `GET /recurso` → listar (paginado/filtrado)
  - `GET /recurso/{id}` → obtener detalle
  - `POST /recurso` → crear
  - `PUT /recurso/{id}` → reemplazar/actualizar total (idempotente)
  - `PATCH /recurso/{id}` → actualizar parcial (idempotente en intentos)
  - `DELETE /recurso/{id}` → eliminar (idempotente)
- Filtros y paginación vía query params comunes:
  - `?page=1&limit=50` (paginación)
  - `?sort=campo:asc|desc` (orden)
  - `?filter[campo]=valor` (filtros simples por campo)
- Códigos HTTP típicos:
  - 200 éxito (lecturas), 201 creado (POST), 204 sin contenido (DELETE/PUT sin cuerpo)
  - 400 petición inválida (sintaxis), 401 no autenticado, 403 prohibido
  - 404 no encontrado, 409 conflicto, 422 validación, 500 error interno
- Idempotencia: `PUT`, `PATCH` y `DELETE` deben tolerar reintentos sin efectos colaterales adicionales.
- Metadatos: el campo `meta` de `Response` puede incluir `page`, `limit`, `total`, etc.
- Versionado: actualmente no se versiona en la URL; ante cambios incompatibles se evaluará `Accept`/`Content-Type` o prefijos `/v1`.

## Convenciones por Capa

### Controllers
- Son invocables (`__invoke`) o exponen métodos explícitos (`index`, `store`, etc.).
- No contienen lógica de negocio.
- Responsables de:
  - Extraer headers (p. ej., `Authorization`).
  - Normalizar token (`Bearer ...`).
  - Delegar autenticación a `AuthService` cuando aplica.
  - Parsear/validar cuerpo JSON a través de DTOs.
  - Invocar Services.
  - Traducir excepciones a `Response` estandarizada.

Ejemplo real: ver `RegisteredManifestationController` con `store()`/`index()`.

```php
// src/Controllers/RegisteredManifestationController.php (extracto)
$headers = getallheaders();
$token = trim(str_replace('Bearer ', '', $headers['Authorization'] ?? ''));
$session = $this->authService->validateToken($token);
$body = json_decode(file_get_contents('php://input'), true);
$dto = RegisteredManifestationDTO::fromArray($body);
$this->service->create($dto, (int)$session['user_id']);
Response::success(data: ['id' => $dto->id], status: 201);
```

### Services
- Contienen la lógica de negocio y orquestan múltiples `Repository` si es necesario.
- Deciden qué datos se devuelven y qué excepciones de dominio lanzar (`ApiException`).
- Nunca acceden directamente a `$_POST`, `$_GET`, headers, etc.
- No generan respuestas HTTP.

Ejemplo real: `RegisteredManifestationService::create()` valida DTO y delega persistencia.

```php
// src/Services/RegisteredManifestationService.php (extracto)
$dto->validate();
$created = $this->repository->create($dto, $userId);
if (!$created) {
  throw new ApiException(ErrorType::manifestationCreateFailed());
}
```

### Repositories
- Capa exclusiva de acceso a datos vía PDO.
- SQL explícito, sin lógica de negocio.
- Devuelven `array|null`, `bool` o IDs primitivos.
- No lanzan excepciones HTTP (pueden retornar `false` o `null`).

Ejemplo real: inserción con prepared statements.

```php
// src/Repositories/RegisteredManifestationRepository.php (extracto)
$sql = 'INSERT INTO registered_geothermal_manifestations (...) VALUES (...)';
$stmt = $this->db->prepare($sql);
return $stmt->execute([/* bindings */]);
```

### DTOs
- Normalizan datos de entrada (`fromArray(array $data): self`).
- Validan reglas sintácticas/semánticas básicas (`validate()`), lanzando `ApiException` con `ErrorType` adecuado (principalmente 422/400 según caso).
- Evitan validaciones duplicadas y controllers inflados.

Ejemplo real: `RegisteredManifestationDTO` normaliza y valida ID, región y coordenadas.

```php
// src/DTO/RegisteredManifestationDTO.php (extracto)
public static function fromArray(array $data): self { /* ... */ }
public function validate(): void {
  if (trim($this->id) === '') {
    throw new ApiException(ErrorType::validation('id', 'ID is required'));
  }
  if ($this->latitude < -90 || $this->latitude > 90) {
    throw new ApiException(ErrorType::validation('latitude', 'Invalid latitude value'));
  }
  // ...
}
```

## Manejo de Errores

Modelo de error tipado y centralizado:
- `ErrorType` define errores semánticos reutilizables (`invalidJson`, `validation`, `missingAuthToken`, `invalidToken`, `notFound`, `internal`, etc.).
- `ApiException` encapsula un `ErrorType` y el código HTTP con el que se propagará.
- `Response::error()` estandariza la salida JSON de errores.

Formato de error (estándar):

```json
{
  "errors": [
    { "code": "ERROR_CODE", "message": "Human readable message" }
  ],
  "data": null,
  "meta": null
}
```

Ejemplos:
```php
throw new ApiException(ErrorType::invalidCredentials());
Response::error(ErrorType::missingAuthToken(), 401);
Response::error([ErrorType::validation('latitude','Invalid latitude value')], 422);
```

## Contrato de Respuesta

Todas las respuestas siguen el contrato común definido en `Http/Response.php`:

- Éxito:
```json
{
  "errors": [],
  "data": { /* payload */ },
  "meta": { /* opcional */ }
}
```

- Error:
```json
{
  "errors": [ /* lista de ErrorType */ ],
  "data": null,
  "meta": null
}
```

Notas:
- `Response::success()` y `Response::error()` fijan `Content-Type: application/json` y el `http_response_code`.
- `errors` es una lista (vacía en éxito), no `null`, para consistencia cliente.

## Autenticación

- Basada en sesiones persistidas en base de datos.
- Token (hash/valor) asociado a `user_id` con expiración.
- `AuthService` centraliza la validación y la creación de sesión en login.
- Los controllers no validan tokens por su cuenta, delegan a `AuthService`.

### Modelo de Sesión con Access/Refresh Tokens

Se utilizan dos tokens opacos (no-JWT) gestionados por `AuthService` y persistidos (en hash) en la base de datos:

- Access Token: vida corta (p. ej., 10–30 minutos). Se envía en `Authorization: Bearer <access_token>` y habilita acceso a endpoints protegidos.
- Refresh Token: vida más larga (p. ej., 7–30 días). Solo para obtener nuevos `access_token` sin credenciales completas.

Flujos principales:

1) Login
  - Credenciales → `AuthService` crea sesión y retorna `access_token` + `refresh_token`.
  - Se recomienda almacenar el refresh token en almacenamiento seguro del cliente.

2) Acceso a recursos
  - En cada request autenticado: `Authorization: Bearer <access_token>`.
  - `AuthService::validateToken()` verifica expiración/validez y retorna contexto de sesión (`user_id`, etc.).

3) Refresh
  - Cuando expira el `access_token`, el cliente invoca el endpoint de refresh con `Authorization: Bearer <refresh_token>`.
  - `AuthService` valida el refresh token y rota: emite nuevo `access_token` y opcionalmente un nuevo `refresh_token`, invalidando el anterior.
  - Reutilización fraudulenta de refresh token debe invalidar la sesión asociada y responder 401.

4) Logout / Revocación
  - Invalida la(s) sesión(es) activas del usuario y revoca tokens asociados.

Seguridad y prácticas:

- Persistir tokens en hash en BD; nunca almacenar el valor en claro.
- Forzar TLS (HTTPS) en cliente/servidor.
- Evitar enviar tokens en body; usar exclusivamente el header `Authorization`.
- Opcional: asociar sesión a `user-agent`/IP para señales adicionales.
- Manejo de errores estándar: `missingAuthToken`, `invalidToken`, y, si corresponde, `tokenExpired` (422/401 según caso de negocio).

Flujo típico:
```
Authorization: Bearer <token>
           ↓
AuthService::validateToken(token)
           ↓
Sesión válida → `user_id` disponible para el Service
```

Ejemplo real de login y validación: ver `Services/AuthService.php`.

## Router / public/index.php

`public/index.php` actúa como:
- Front Controller
- Router manual explícito
- “Dependency Injector” manual (instanciación de dependencias)

Características importantes:
- Sin frameworks, autoloader PSR-4 simple.
- Instanciación explícita de Repository → Service → Controller.
- Manejo de rutas por método + path.
- Fallback 404 tipado mediante `Response::error(ErrorType::notFound(...))`.

Ejemplo (extracto real):

```php
if ($method === 'POST' && $path === '/analysis-request') {
  $repository = new AnalysisRequestRepository($db);
  $service = new AnalysisRequestService($repository, $db);
  $authService = new AuthService(new UserRepository($db));
  $controller = new AnalysisRequestController($service, $authService);
  $controller();
  return;
}
```

### Convenciones RESTful en el Router

- Cada ruta combina verbo HTTP + path de recurso.
- Paths usan kebab-case y plural cuando aplica: `/registered-manifestations`, `/analysis-requests`, `/users/me`.
- Autenticación obligatoria se maneja en el Controller delegando a `AuthService`.
- Rutas de mantenimiento de sesión (login/refresh/logout) existen pero sus contratos se documentan por separado.

## Agregar un Nuevo Endpoint

1) Declarar la ruta en `public/index.php` con método y path.
2) Instanciar dependencias necesarias:
   - `Repository`(s)
   - `Service`
   - `AuthService` (si requiere autenticación)
   - `Controller`
3) En el `Controller`, parsear JSON (o usar `Http/Request::json()`), construir DTO, validar y delegar a `Service`.
4) Responder con `Response::success()` o mapear errores con `Response::error()`.

Plantilla rápida de wiring en `index.php`:

```php
if ($method === 'POST' && $path === '/my-endpoint') {
  $repository = new MyRepository($db);
  $service = new MyService($repository);
  $authService = new AuthService(new UserRepository($db)); // si aplica
  $controller = new MyController($service, $authService);
  $controller->store(); // o __invoke
  return;
}
```

### Pasos: desde un Service existente

1) Identificar el `Service` que ya expone la lógica requerida.
2) Crear/actualizar el `Controller` para el recurso:
  - Extraer headers y token (`Authorization: Bearer ...`).
  - Parsear body JSON → `DTO::fromArray()`.
  - `DTO->validate()` y delegar al `Service`.
  - Traducir resultado a `Response::success()`; capturar `ApiException` y responder `Response::error()`.
3) Wire en `public/index.php` la nueva ruta/método al Controller.
4) Añadir pruebas (scripts en `tests/`) para los casos de éxito y error.
5) Documentar en el MD de contratos/errores específico (separado de este documento).

### Pasos: desde la creación de una tabla (nuevo módulo)

1) Modelo de datos
  - Diseñar la tabla (DDL) con claves primarias, índices y restricciones.
  - Ejecutar el SQL en el entorno (no hay sistema de migraciones integrado; conservar el DDL en documentación/operativa).

2) Repository
  - Crear `src/Repositories/NuevoRecursoRepository.php`.
  - Implementar métodos CRUD con PDO y SQL parametrizado (`prepare`/`execute`).

3) DTO
  - Crear `src/DTO/NuevoRecursoDTO.php` con `fromArray(array $data): self` y `validate(): void`.

4) Service
  - Crear `src/Services/NuevoRecursoService.php` que orquesta reglas de negocio y llama al Repository.

5) Controller
  - Crear `src/Controllers/NuevoRecursoController.php` con métodos `index`/`store`/`update`/`destroy` o `__invoke`.
  - Manejar autenticación vía `AuthService` si aplica.

6) Router
  - Declarar rutas en `public/index.php` según verbos HTTP y paths RESTful.

7) Errores y contratos
  - Añadir métodos en `Http\ErrorType` para casos semánticos del nuevo módulo.
  - Documentar contratos de request/response en el MD dedicado (no en este archivo).

8) Pruebas
  - Añadir scripts en `tests/` que cubran creación, listado, actualización, borrado y errores.

9) Observabilidad
  - Usar el log de depuración en `/tmp/debug_api.log` cuando sea útil durante el desarrollo.

## Convenciones y Utilidades

- Namespaces y autoload: `src/` como base; `namespace` corresponde con la ruta relativa.
- JSON request: preferir `Http/Request::json()` para parseo seguro.
- Validación en DTOs: `fromArray()` + `validate()` para mantener Controllers delgados.
- Respuestas: usar exclusivamente `Http\Response`.
- Errores: crear métodos en `Http\ErrorType` para cada caso semántico reutilizable.
- Seguridad: tokens en header `Authorization: Bearer <token>`, no en query/body.
- Logging: hay un log de depuración a `/tmp/debug_api.log` configurado en `public/index.php`.

## Ejemplo Integrado: Registered Manifestations

- Endpoint: `PUT /registered-manifestations` (crear) y `GET /registered-manifestations` (listar del usuario autenticado).
- Flujo `store()`:
  1. Extraer y validar token via `AuthService`.
  2. Parsear JSON → `RegisteredManifestationDTO::fromArray()`.
  3. `DTO->validate()` para reglas básicas (ID, región, lat/lon, etc.).
  4. `Service->create()` delega a `Repository->create()`.
  5. Responder `201` con `{ data: { id }, errors: [] }`.

- Persistencia: `RegisteredManifestationRepository::create()` usa prepared statements con PDO.

## Endpoints Existentes (enunciados)

Este documento no detalla contratos/respuestas/errores por endpoint. Se enumeran módulos presentes y sus endpoints principales para referencia:

- `analysis-requests`: creación y lectura de solicitudes de análisis.
- `registered-manifestations`: creación y listado de manifestaciones geotérmicas del usuario.
- `users`: lectura de información del usuario autenticado (`/users/me`).
- `auth`: login, refresh y logout.

La especificación detallada de contratos (request/response), tipos y errores se trabajará en un MD dedicado.

## Estándares de Código

- `declare(strict_types=1);` en todos los archivos PHP.
- Tipado en propiedades, parámetros y retornos cuando sea posible.
- Sin lógica de negocio en Controllers o Repositories.
- Evitar acceso directo a superglobales fuera de la capa HTTP o utilidades.
- SQL parametrizado siempre (evita inyección).

## Errores Comunes y Soluciones

- `INVALID_JSON`: el body no es JSON válido → revisar `Content-Type` y payload.
- `MISSING_AUTH_TOKEN` / `INVALID_TOKEN`: falta o es inválido el token → verificar header `Authorization`.
- `*_VALIDATION`: algún campo no cumple regla → revisar DTO y datos enviados.
- `NOT_FOUND_*`: ruta o recurso no existe → confirmar wiring en `public/index.php`.

## Roadmap / Extensión

- Añadir nuevos `ErrorType` específicos para cada módulo.
- Extender `Request` con helpers (query, headers normalizados).
- Middleware ligero (opcional) para autenticación antes de Controllers.
- Documentar esquemas de tablas relevantes para cada `Repository`.

---

Con esta guía, cualquier contribución nueva debería alinearse con las prácticas existentes, reducir la duplicación de lógica, y mantener las respuestas y errores consistentes para clientes móviles/web.