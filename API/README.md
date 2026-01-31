# GeoterRA API - `src/` Directory Structure Documentation

Documentación completa de la arquitectura y endpoints de la carpeta `API/src` siguiendo principios de **Clean Code** y **arquitectura en capas**.

---

## 📋 Table of Contents

1. [Estructura General](#estructura-general)
2. [Requisitos](#requisitos)
3. [Arquitectura en Capas](#arquitectura-en-capas)
4. [Endpoints Disponibles](#endpoints-disponibles)
5. [Repositorios](#repositorios)
6. [Servicios](#servicios)
7. [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
8. [Manejo de Errores](#manejo-de-errores)

---

## Estructura General

```
API/
├── config/               # Archivos de configuración (OBLIGATORIO SE REQUIERE DE "config.ini")
├── Controllers/          # Capa de presentación - Manejo de requests/responses (Endpoints)
├── DTO/                  # Objetos de transferencia de datos
├── Http/                 # Utilidades HTTP (Response, Request, Errores)
├── legacy/               # Código viejo (Borrar después)
├── public/               # No sé aún
├── Repositories/         # Capa de persistencia - Acceso a datos
├── Services/             # Capa de lógica de negocio
├── tests/                # No sé aún
└── DTO/
```

---

## Requisitos

<dd> 

Para el correcto funcionamiento de la API de GeoterRA, el entorno debe cumplir con los siguientes requerimientos técnicos y de configuración:

### 🛠 Entorno de Ejecución 
* **PHP 8.1+**: Necesario para el soporte de tipos estrictos, DTOs y funcionalidades modernas utilizadas en la arquitectura.
* **Servidor Web**: Apache (con `mod_rewrite` habilitado para el manejo de rutas) o Nginx.
* **Base de Datos**: MySQL / MariaDB.
* **Composer**: Requerido para la gestión de dependencias y el autoloader de clases.

### 📦 Extensiones de PHP

* `pdo_mysql`: Para la comunicación con el motor de base de datos.
* `json`: Fundamental para el procesamiento de los bodies de las peticiones y las respuestas.
* `mbstring`: Para el manejo correcto de strings en las validaciones.

### ⚙️ Archivo de Configuración (Obligatorio)

La aplicación **requiere estrictamente** de un archivo `config.ini` ubicado en el directorio `config/`. Este archivo contiene las credenciales sensibles y parámetros de conexión.

**Formato de `config/config.ini`:**

```ini
[database]
host = localhost
name = GeoterRA
user = mario
pass = 2003

```

> **Nota:** Por seguridad, este archivo está incluido en el `.gitignore` para evitar subir credenciales al repositorio.

</dd>



## Arquitectura en Capas

<dd>

GeoterRA API sigue una arquitectura **en tres capas**:

```
┌──────────────────────────────────────────┐
│  Controllers (HTTP Handlers)             │ ← Reciben requests
├──────────────────────────────────────────┤
│  Services (Business Logic)               │ ← Lógica de negocio
├──────────────────────────────────────────┤
│  Repositories (Data Access)              │ ← Acceso a BD
├──────────────────────────────────────────┤
│  DTO + Http Utilities                    │ ← Validación y manejo
└──────────────────────────────────────────┘
```


</dd>

## Endpoints Disponibles

<dd>

### 1. **AuthController** - `/auth`
> 
> Maneja autenticación y sesiones de usuarios.
>
>  | Método | Endpoint | Descripción | Auth |
>  |--------|----------|-------------|------|
>  | **POST** | `/register` | Registra un nuevo usuario | ❌ |
>  | **POST** | `/login` | Autentica usuario y retorna token | ❌ |
>  | **POST** | `/logout` | Revoca la sesión activa | ✅ |
>
>  #### Request/Response Examples:
>
>  **POST /register**
>  ```json
>  {
>    "name": "Juan",
>    "lastname": "Pérez",
>    "email": "juan@example.com",
>    "phone_number": "1234567890",
>    "password": "SecurePassword123"
>  }
>  ```
>  Response (201):
>  ```json
>  {
>    "data": {
>      "user_id": 1,
>      "email": "juan@example.com",
>      "token": "abc123token",
>      "expires_at": "2026-02-13 10:30:00"
>    },
>    "meta": { "new_session": true },
>    "errors": []
>  }
>  ```
>
>  **POST /login**
>  ```json
>  {
>    "email": "juan@example.com",
>    "password": "SecurePassword123"
>  }
>  ```
>  Response (200):
>  ```json
>  {
>    "data": {
>      "user_id": 1,
>      "token": "abc123token",
>      "expires_at": "2026-02-13 10:30:00"
>    },
>    "meta": { "new_session": false },
>    "errors": []
>  }
>  ```
>
>  **POST /logout**
>  ```
>  Headers:
>  Authorization: Bearer abc123token
>  ```
>  Response (200):
>  ```json
>  {
>    "data": { "logged_out": true },
>    "meta": null,
>    "errors": []
>  }
>  ```
>

---

### 2. **UserController** - `/users`

>Gestiona información del usuario autenticado.
>
>| Método | Endpoint | Descripción | Auth |
>|--------|----------|-------------|------|
>| **GET** | `/users/me` | Retorna datos del usuario autenticado | ✅ |
>
>#### Request/Response Example:
>
>**GET /users/me**
>```
>Headers:
>Authorization: Bearer abc123token
>```
>Response (200):
>```json
>{
>  "data": {
>    "user_id": 1,
>    "first_name": "Juan",
>    "last_name": "Pérez",
>    "email": "juan@example.com",
>    "phone_number": "1234567890",
>    "role": "user",
>    "is_active": true,
>    "is_verified": true,
>    "created_at": "2026-01-20 14:30:00"
>  },
>  "meta": null,
>  "errors": []
>}
>```

---

### 3. **AnalysisRequestController** - `/analysis-request`

>Gestiona solicitudes de análisis de manifestaciones geotermales.
>
>| Método | Endpoint | Descripción | Auth |
>|--------|----------|-------------|------|
>| **POST** | `/analysis-request` | Crea una nueva solicitud de análisis | ✅ |
>| **GET** | `/analysis-request` | Obtiene análisis del usuario actual | ✅ |
>| **PUT** | `/analysis-request/{id}` | Actualiza un análisis existente | ✅ |
>| **DELETE** | `/analysis-request/{id}` | Elimina un análisis | ✅ |
>
>#### Request/Response Examples:
>
>**POST /analysis-request**
>```json
>{
>  "name": "Análisis Termo 1",
>  "region": "norte",
>  "email": "contact@example.com",
>  "owner_contact_number": "1234567890",
>  "owner_name": "Juan Pérez",
>  "temperature_sensation": "hot",
>  "bubbles": true,
>  "details": "Manifestación con actividad volcánica",
>  "current_usage": "None",
>  "latitude": -31.2467,
>  "longitude": -64.4283
>}
>```
>Response (201):
>```json
>{
>  "data": { "message": "Analysis request created successfully" },
>  "meta": null,
>  "errors": []
>}
>```
>
>**GET /analysis-request**
>```
>Headers:
>Authorization: Bearer abc123token
>```
>Response (200):
>```json
>{
>  "data": [
>    {
>      "id": 1,
>      "name": "AR-001",
>      "region": "norte",
>      "email": "contact@example.com",
>      "latitude": -31.2467,
>      "longitude": -64.4283,
>      "created_at": "2026-01-30 10:30:00"
>    }
>  ],
>  "meta": null,
>  "errors": []
>}
>```
>
>**PUT /analysis-request/{id}**
>```json
>{
>  "temperature_sensation": "very_hot",
>  "details": "Updated details"
>}
>```
>Response (200):
>```json
>{
>  "data": { "message": "Analysis request updated successfully" },
>  "meta": null,
>  "errors": []
>}
>```
>
>**DELETE /analysis-request/{id}**
>```
>Headers:
>Authorization: Bearer abc123token
>```
>Response (200):
>```json
>{
>  "data": { "message": "Analysis request deleted successfully" },
>  "meta": null,
>  "errors": []
>}
>```
>
>---

### 4. **RegisteredManifestationController** - `/registered-manifestations`

>Gestiona manifestaciones geotermales registradas en el sistema.
>
>| Método | Endpoint | Descripción | Auth |
>|--------|----------|-------------|------|
>| **PUT** | `/registered-manifestations` | Registra una nueva manifestación | ✅ |
>| **GET** | `/registered-manifestations?region={region}` | Obtiene manifestaciones por región | ✅ |
>
>#### Request/Response Examples:
>
>**PUT /registered-manifestations**
>```json
>{
>  "id": "MANI-NORTE-001",
>  "region": "norte",
>  "latitude": -31.2467,
>  "longitude": -64.4283,
>  "description": "Fuente termal con aguas bicarbonatadas",
>  "temperature": 48.5,
>  "field_pH": 6.8,
>  "field_conductivity": 1200,
>  "lab_pH": 6.7,
>  "lab_conductivity": 1180,
>  "cl": 45.0,
>  "ca": 120.0,
>  "hco3": 850.0,
>  "so4": 15.0,
>  "fe": 0.5,
>  "si": 85.0,
>  "b": 2.5,
>  "li": 0.8,
>  "f": 1.2,
>  "na": 280.0,
>  "k": 25.0,
>  "mg": 18.0
>}
>```
>Response (201):
>```json
>{
>  "data": { "id": "MANI-NORTE-001" },
>  "meta": null,
>  "errors": []
>}
>```
>
>**GET /registered-manifestations?region=norte**
>```
>Headers:
>Authorization: Bearer abc123token
>```
>Response (200):
>```json
>{
>  "data": [
>    {
>      "id": "MANI-NORTE-001",
>      "region": "norte",
>      "latitude": -31.2467,
>      "longitude": -64.4283,
>      "description": "Fuente termal",
>      "temperature": 48.5,
>      "created_at": "2026-01-15 09:00:00"
>    }
>  ],
>  "meta": null,
>  "errors": []
>}
>```

</dd>

## Repositorios

<dd>

Los repositorios implementan la **capa de persistencia** y encapsulan toda interacción con la base de datos.

### 1. **UserRepository**

>Gestiona operaciones CRUD de usuarios y sesiones.
>
>**Métodos principales:**
>
>| Método | Descripción | Retorna |
>|--------|-------------|---------|
>| `emailExists(string $email)` | Verifica si un email está registrado | `bool` |
>| `create(...)` | Crea un nuevo usuario | `int` (user_id) |
>| `findByEmail(string $email)` | Busca usuario por email | `?array` |
>| `findById(int $userId)` | Busca usuario por ID | `?array` |
>| `createSession(...)` | Crea una sesión de usuario | `void` |
>| `revokeSessionByToken(string $token)` | Revoca una sesión activa | `bool` |
>| `findActiveSessionByUserId(int $userId)` | Obtiene sesión activa del usuario | `?array` |
>| `findSessionByToken(string $token)` | Busca sesión por token | `?array` |
>
>**Flujo típico de uso:**
>
>```
>AuthService → UserRepository → Base de Datos
>```

---

### 2. **AnalysisRequestRepository**
>
>Gestiona solicitudes de análisis de manifestaciones.
>
>**Métodos principales:**
>
>| Método | Descripción | Retorna |
>|--------|-------------|---------|
>| `create(AnalysisRequestDTO $dto, int $userId)` | Crea nueva solicitud | `int` (request_id) |
>| `findAllByUser(int $userId)` | Obtiene análisis del usuario | `array` |
>| `findById(int $id)` | Busca análisis por ID | `?array` |
>| `update(int $id, AnalysisRequestDTO $dto)` | Actualiza análisis | `void` |
>| `delete(int $id)` | Elimina análisis | `bool` |
>
---

### 3. **RegisteredManifestationRepository**

>Gestiona manifestaciones geotermales registradas.
>
>**Métodos principales:**
>
>| Método | Descripción | Retorna |
>|--------|-------------|---------|
>| `existsById(string $id)` | Verifica existencia de manifestación | `bool` |
>| `create(RegisteredManifestationDTO $dto, int $userId)` | Registra nueva manifestación | `bool` |
>| `getAllByRegion(string $region)` | Obtiene manifestaciones por región | `array` |
>| `findById(string $id)` | Busca manifestación por ID | `?array` |


</dd>

## Servicios

<dd>

Los servicios implementan la **lógica de negocio** y coordinan entre Controllers y Repositories.

### 1. **AuthService**

>Maneja autenticación y gestión de sesiones.
>
>**Métodos principales:**
>
>```php
>public function login(LoginUserDTO $dto): array
>public function logout(string $token): void
>public function validateToken(string $token): ?array
>```
>
>**Flujo de Login:**
>1. Recibe `LoginUserDTO` con email y password
>2. Busca usuario en repositorio
>3. Verifica contraseña con `PasswordService`
>4. Crea o retorna sesión existente
>5. Retorna token con expiración

---

### 2. **UserService**

>Gestiona operaciones de usuarios.
>
>**Métodos principales:**
>
>```php
>public function register(RegisterUserDTO $dto): array
>public function getUserById(int $userId): array
>```
>
>**Flujo de Registro:**
>1. Valida que email no exista
>2. Hash contraseña con `PasswordService`
>3. Crea usuario en repositorio
>4. Genera sesión
>5. Retorna token

---

### 3. **AnalysisRequestService**

>Gestiona solicitudes de análisis.
>
>**Métodos principales:**
>
>```php
>public function create(AnalysisRequestDTO $dto, int $userId): void
>public function getAllByUser(int $userId): array
>public function update(int $id, AnalysisRequestDTO $dto, int $userId): void
>public function delete(int $id, int $userId): void
>```

---

### 4. **RegisteredManifestationService**

>Gestiona manifestaciones registradas.
>
>**Métodos principales:**
>
>```php
>public function create(RegisteredManifestationDTO $dto, int $userId): void
>public function getAllByRegion(string $region): array
>```

---

### 5. **PasswordService**

>Utilidad estática para hash y verificación de contraseñas.
>
>```php
>public static function hash(string $password): string
>public static function verify(string $password, string $hash): bool
>```

</dd>

## DTOs (Data Transfer Objects)

<dd>

Los DTOs validan y encapsulan los datos transferidos entre capas.

### 1. **LoginUserDTO**

>Estructura:
>```php
>public string $email          // Email del usuario
>public string $password       // Contraseña (mínimo 8 caracteres)
>```
>
>Validaciones:
>- ✅ Email no vacío y válido
>- ✅ Password no vacío y mínimo 8 caracteres

---

### 2. **RegisterUserDTO**

>Estructura:
>```php
>public string $firstName      // Nombre del usuario
>public string $lastName       // Apellido del usuario
>public string $email          // Email (único)
>public ?string $phoneNumber   // Número de teléfono (opcional)
>public string $password       // Contraseña (mínimo 8 caracteres)
>```
>
>Validaciones:
>- ✅ Todos los campos requeridos
>- ✅ Email válido y no registrado
>- ✅ Password mínimo 8 caracteres

---

### 3. **AnalysisRequestDTO**

>Estructura:
>```php
>public string $name                    // Nombre del análisis
>public string $region                  // Región (norte, centro, sur, etc.)
>public string $email                   // Email de contacto
>public string $ownerContactNumber      // Teléfono del propietario
>public string $ownerName               // Nombre del propietario
>public string $temperatureSensation    // hot, warm, cold
>public bool $bubbles                   // ¿Hay burbujas?
>public string $details                 // Detalles adicionales
>public string $currentUsage            // Uso actual de la fuente
>public float $latitude                 // Latitud (-90 a 90)
>public float $longitude                // Longitud (-180 a 180)
>```

---

### 4. **RegisteredManifestationDTO**

>Estructura:
>```php
>public string $id                      // ID único de manifestación
>public string $region                  // Región
>public float $latitude                 // Latitud
>public float $longitude                // Longitud
>public string $description             // Descripción
>public float $temperature              // Temperatura en °C
>public float $fieldPH                  // pH de campo
>public float $fieldConductivity        // Conductividad de campo
>public float $labPH                    // pH de laboratorio
>public float $labConductivity          // Conductividad de laboratorio
>public float $cl, $ca, $hco3, $so4     // Iones en mg/L
>public float $fe, $si, $b, $li, $f     // Oligoelementos
>public float $na, $k, $mg              // Cationes principales
>```

---

### 5. **AllowedRegions**

>Enum de regiones permitidas:
>```php
>const REGIONS = ['norte', 'centro', 'sur', 'patagonia'];
>
>public static function isValid(string $region): bool
>```

</dd>

## Manejo de Errores

<dd>

El sistema utiliza **ErrorType** y **ApiException** para manejo consistente de errores.

### Clase ErrorType

>Define tipos de error estandarizados:
>
>```php
>public static function missingField(string $field): ErrorType
>public static function invalidEmail(): ErrorType
>public static function weakPassword(): ErrorType
>public static function emailAlreadyInUse(): ErrorType
>public static function invalidCredentials(): ErrorType
>public static function missingAuthToken(): ErrorType
>public static function invalidToken(): ErrorType
>public static function invalidJson(): ErrorType
>public static function invalidRegion(string $region): ErrorType
>public static function internal(string $message): ErrorType
>```

### Clase ApiException

>```php
>throw new ApiException(
>  ErrorType::emailAlreadyInUse(),
>  422  // HTTP status code
>);
>```

### Response Format

>**Success (2xx):**
>```json
>{
>  "data": { /* payload */ },
>  "meta": null,
>  "errors": []
>}
>```
>
>**Error (4xx/5xx):**
>```json
>{
>  "data": null,
>  "meta": null,
>  "errors": [
>    {
>      "type": "INVALID_EMAIL",
>      "message": "El formato de email no es válido"
>    }
>  ]
>}
>```

</dd>

## Flujo Completo de Ejemplo: Registro de Usuario

<dd>

```
1. POST /register
   ↓
2. AuthController::register()
   ├─ Parsea JSON request
   ├─ Crea RegisterUserDTO
   ├─ Valida DTO (throws si hay error)
   ↓
3. UserService::register()
   ├─ Verifica email no existe (UserRepository::emailExists)
   ├─ Hash password (PasswordService::hash)
   ├─ Crea usuario (UserRepository::create) → user_id
   ├─ Crea sesión (UserRepository::createSession) → token
   ↓
4. Response::success()
   ↓
5. Retorna 201 + datos usuario + token
```

</dd>

## Mejores Prácticas Aplicadas

<dd>

- ✅ **Separación de responsabilidades** - Cada clase tiene una única responsabilidad
- ✅ **Dependency Injection** - Inyección de dependencias en constructores
- ✅ **DTOs para validación** - Validación centralizada en DTOs
- ✅ **Manejo de errores consistente** - ErrorType + ApiException
- ✅ **Type hints** - Uso de tipos escalares y de retorno
- ✅ **Nombres descriptivos** - Métodos y variables auto-documentadas
- ✅ **Documentación inline** - Comentarios en métodos clave
- ✅ **Transacciones** - Manejo seguro de datos en BD

</dd>

## Notas Importantes

<dd>

- ⚠️ **Autenticación**: Todos los endpoints excepto `/register` y `/login` requieren token en header `Authorization: Bearer <token>`
- ⚠️ **Validación**: Los DTOs validan antes de llegar a Services
- ⚠️ **Errores**: Siempre lanzar `ApiException` desde servicios para manejo consistente
- ⚠️ **Base de Datos**: Los repositorios son la única forma de acceder a datos

</dd>