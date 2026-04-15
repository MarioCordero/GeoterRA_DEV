# Backend - GeoterRA API Documentation

**Language**: PHP 8.1+  
**Architecture**: RESTful API with Layered Architecture  
**Database**: MySQL / MariaDB  
**Entry Point**: `/API/public/index.php`

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Layers](#architecture--layers)
3. [Session & Cookie Management](#session--cookie-management)
4. [Multi-Platform Authentication](#multi-platform-authentication)
5. [Request/Response Flow](#requestresponse-flow)
6. [All Endpoints Documentation](#all-endpoints-documentation)
7. [Core Components](#core-components)
8. [Authentication & Authorization](#authentication--authorization)
9. [Error Handling](#error-handling)
10. [Security Measures](#security-measures)
11. [Database Configuration](#database-configuration)

---

## Overview

The GeoterRA API is a **RESTful backend** built with **PHP 8.1**, organized into **three architectural layers**:

- **Controller Layer**: HTTP request handlers and response formatting
- **Service Layer**: Business logic and domain operations
- **Repository Layer**: Data persistence and database access

**Key Technologies**:
- PHP 8.1+ with strict types and DTOs
- MySQL/MariaDB for data persistence
- PDO for database abstraction
- Custom JWT-like token system using binary tokens
- HTTP-only cookies for session management

---

## Architecture & Layers

### Layered Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│   HTTP Request (POST /auth/login)                   │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│   public/index.php (Bootstrap & Routing)            │
│   - CORS configuration                              │
│   - Autoloader registration                         │
│   - Session validation                              │
│   - Request parsing                                 │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│   SimpleRouter (Route Matching & Dispatch)          │
│   - Matches request method + path to route          │
│   - Instantiates appropriate controller             │
│   - Passes parameters                               │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│   CONTROLLER LAYER                                  │
│   - AuthController::login()                         │
│   - UserController::show()                          │
│   - AnalysisRequestController::store()              │
│   ↓ Parses request & validates DTO                  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│   SERVICE LAYER (Business Logic)                    │
│   - AuthService (login, register, token refresh)    │
│   - UserService (CRUD user operations)              │
│   - AnalysisRequestService (manifestions logic)     │
│   - PermissionService (role-based access)           │
│   ↓ Performs business operations                    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│   REPOSITORY LAYER (Data Access)                    │
│   - AuthRepository (token storage/retrieval)        │
│   - UserRepository (user queries)                   │
│   - AnalysisRequestRepository (request queries)     │
│   ↓ Executes SQL queries                            │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│   MySQL Database                                    │
│   - users table                                      │
│   - access_tokens table                             │
│   - refresh_tokens table                            │
│   - analysis_requests table                         │
│   - regions table                                   │
│   - manifestations table                            │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│   Response::success() or Response::error()          │
│   - JSON formatted response                         │
│   - HTTP status code                                │
│   - Set HTTP-only cookie (if needed)                │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│   HTTP Response (200 OK, 401 Unauthorized, etc)     │
└─────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. Controller Layer (`src/Controllers/`)

**Responsibility**: Handle HTTP requests and format responses

**Key Classes**:
- `AuthController` - Authentication endpoints (login, logout, refresh)
- `UserController` - User management (register, profile, delete)
- `AnalysisRequestController` - Analysis request CRUD + admin operations
- `RegionController` - Region management
- `MaintenanceController` - System administration endpoints

**What Controllers Do**:
1. Parse incoming JSON request body
2. Create and validate DTOs
3. Delegate business logic to Services
4. Format and send JSON responses
5. Handle exceptions and map them to HTTP status codes

**Example** (`AuthController::login`):
```php
public function login(): void {
    // 1. Parse JSON body
    $data = Request::parseJsonRequest();
    
    // 2. Create DTO and validate
    $dto = LoginUserDTO::fromArray($data);
    
    // 3. Call service
    $result = $this->authService->login($dto);
    
    // 4. Set cookie
    setcookie('geoterra_session_token', $result['data']['access_token'], [...]);
    
    // 5. Send response
    Response::success($result['data'], $result['meta'], 200);
}
```

#### 2. Service Layer (`src/Services/`)

**Responsibility**: Implement business logic and domain operations

**Key Classes**:
- `AuthService` - Login, token generation, token refresh, logout
- `UserService` - User registration, profile updates, account deletion
- `AnalysisRequestService` - Create, update, delete analysis requests
- `PermissionService` - Role-based access control (RBAC)
- `PasswordService` - Password hashing and verification
- `RegionService` - Region operations
- `RegisteredManifestationService` - Manifestation operations
- `MaintenanceService` - System administration

**What Services Do**:
1. Validate business rules
2. Orchestrate Repository operations
3. Handle token generation and validation
4. Implement permission checks
5. Throw `ApiException` on business rule violations

**Example** (`AuthService::login`):
```php
public function login(LoginUserDTO $dto): array {
    // 1. Validate DTO
    $dto->validate();
    
    // 2. Query repository
    $user = $this->userRepository->findByEmail($dto->email);
    
    // 3. Verify password
    if (!$user || !PasswordService::verify($dto->password, $user['password_hash'])) {
        throw new ApiException(ErrorType::invalidCredentials(), 401);
    }
    
    // 4. Generate tokens
    $accessToken = bin2hex(random_bytes(32));
    $refreshToken = bin2hex(random_bytes(64));
    
    // 5. Store tokens in database
    $this->authRepository->upsertAccessToken($userId, $accessToken, 3600 + 1800);
    $this->authRepository->upsertRefreshToken($userId, $refreshToken, 3600 * 24 * 30);
    
    // 6. Return formatted response
    return [
        'data' => ['access_token' => $accessToken, 'refresh_token' => $refreshToken, ...],
        'meta' => ['token_type' => 'Bearer', 'expires_in' => 5400]
    ];
}
```

#### 3. Repository Layer (`src/Repositories/`)

**Responsibility**: Handle all database queries and data persistence

**Key Classes**:
- `AuthRepository` - Token storage, retrieval, and validation
- `UserRepository` - User queries (find by email, by ID, create)
- `AnalysisRequestRepository` - Analysis request persistence
- `RegionRepository` - Region persistence
- `RegisteredManifestationRepository` - Manifestation persistence

**What Repositories Do**:
1. Execute prepared SQL statements
2. Return raw database results
3. Handle database transactions
4. Never contain business logic

**Example** (`UserRepository::findByEmail`):
```php
public function findByEmail(string $email): ?array {
    $stmt = $this->db->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    return $stmt->fetch() ?: null;
}
```

---

## Session & Cookie Management

### Session Architecture

GeoterRA uses **HTTP-only cookies with JWT-like tokens** for session management:

```
┌─────────────────────────────────────────────────┐
│  User Logs In (POST /auth/login)                │
│  - Email & password sent                        │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  AuthService::login()                           │
│  - Verifies credentials                         │
│  - Generates 2 tokens:                          │
│    - ACCESS_TOKEN (32 bytes hex, expires 5400s)│
│    - REFRESH_TOKEN (64 bytes hex, expires 30d) │
│  - Stores both in database                      │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  AuthController::login()                        │
│  - Sets HTTP-only cookie:                       │
│    name: 'geoterra_session_token'               │
│    value: access_token (32 bytes)               │
│    expires: timestamp (5400 seconds)            │
│    httponly: true                               │
│    secure: false (local), true (production)     │
│    samesite: Lax                                │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  Browser receives cookie                        │
│  - Automatically sent with all requests to same │
│    domain and path                              │
└─────────────────────────────────────────────────┘
```

### Cookie Details

**Cookie Name**: `geoterra_session_token`

**Cookie Attributes**:
```php
setcookie('geoterra_session_token', $accessToken, [
    'expires' => time() + 5400,        // 1.5 hours
    'path' => '/',                      // Available to entire API
    'domain' => '',                     // Current domain only
    'secure' => false,                  // true in production
    'httponly' => true,                 // Not accessible to JavaScript
    'samesite' => 'Lax'                 // CSRF protection
]);
```

**Security Features**:
- **HTTP-only**: Cannot be accessed by malicious JavaScript
- **Lax SameSite**: Protection against CSRF attacks
- **Automatic Sending**: Browser includes cookie in all requests automatically
- **Short-lived**: Expires in 1.5 hours

### Session Validation Flow

Every request goes through session validation in `config/session.php`:

```
┌─────────────────────────────────────────────────┐
│  Request arrives (any endpoint)                 │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  public/index.php calls:                        │
│  validateSessionToken($db)                      │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  Extract token from $_COOKIE:                   │
│  $token = $_COOKIE['geoterra_session_token']    │
│  (Browser automatically included it)            │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│  AuthService::validateAccessToken($token)       │
│  - Query database for token                     │
│  - Check if expired                             │
│  - Verify token is not revoked                  │
└─────────────────────────────────────────────────┘
                       ↓
          ┌────────────┴────────────┐              
          ↓                         ↓              
    ┌──────────────┐        ┌──────────────┐      
    │ Valid Token  │        │ Invalid/Exp. │      
    └──────────────┘        └──────────────┘      
          ↓                         ↓              
    ┌──────────────┐        ┌──────────────┐      
    │ Load user    │        │ Set user=null│      
    │ from DB      │        │ (skip login) │      
    └──────────────┘        └──────────────┘      
          ↓                         ↓              
    ┌──────────────────────────────────────┐      
    │ Request::setUser($userArray) or null │      
    │ (Make user available to controller)  │      
    └──────────────────────────────────────┘      
          ↓
┌─────────────────────────────────────────────────┐
│  Controller can access user via:                │
│  $user = Request::getUser()                     │
│  (null if not authenticated)                    │
└─────────────────────────────────────────────────┘
```

**Code** (`config/session.php`):
```php
function validateSessionToken(PDO $db): void {
    // 1. Extract token from cookie
    $sessionToken = $_COOKIE['geoterra_session_token'] ?? null;
    if (!$sessionToken) {
        return; // No token, user is anonymous
    }

    try {
        // 2. Validate and decode token
        $authService = new AuthService($db);
        $tokenData = $authService->validateAccessToken($sessionToken);
        if (!$tokenData || !isset($tokenData['user_id'])) {
            return; // Invalid token
        }

        // 3. Load user from database
        $userRepository = new UserRepository($db);
        $user = $userRepository->findById($tokenData['user_id']);
        if (!$user) {
            return; // User not found
        }

        // 4. Make user available to controllers
        \Http\Request::setUser($user);
        
    } catch (\Exception $e) {
        // Token validation failed, user remains anonymous
        error_log('Session validation error: ' . $e->getMessage());
    }
}
```

### Token Refresh Flow

When access token expires (after 1.5 hours):

```
┌──────────────────────────────────────────┐
│  Access token expires                    │
│  Next request with expired token fails   │
│  Frontend receives 401                   │
└──────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────┐
│  POST /auth/refresh                      │
│  Body: { "refresh_token": "..." }        │
│  (refresh_token is stored locally)       │
└──────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────┐
│  AuthService::refreshTokens()            │
│  - Validate refresh token from DB        │
│  - Delete old tokens                     │
│  - Generate new ACCESS_TOKEN             │
│  - Generate new REFRESH_TOKEN            │
│  - Store both in DB                      │
└──────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────┐
│  AuthController::refresh()               │
│  - Set new cookie with new access token  │
│  - Return new refresh token in response  │
└──────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────┐
│  Frontend receives response               │
│  - Stores new refresh token locally      │
│  - Browser automatically uses new cookie │
└──────────────────────────────────────────┘
```

### Logout Flow

```
┌──────────────────────────────────────────┐
│  POST /auth/logout (authenticated)       │
└──────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────┐
│  AuthService::logout()                   │
│  - Revoke access token from DB           │
│  - Revoke refresh token from DB          │
│  - Clear session                         │
└──────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────┐
│  AuthController::logout()                │
│  - Delete HTTP-only cookie by:           │
│    - Setting expires to past date        │
│  - Return success response               │
└──────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────┐
│  Browser deletes cookie                  │
│  - No token sent with future requests    │
└──────────────────────────────────────────┘
```

---

## Multi-Platform Authentication

### Overview

GeoterRA API supports **two authentication methods** simultaneously based on client type:

- **Web Browsers**: HTTP-only cookies (session-based, automatic)
- **Mobile Apps** (Kotlin, iOS): Bearer tokens in `Authorization` header (stateless, manual)

The system automatically detects the client platform and applies the appropriate authentication method. **No breaking changes to web clients** - they continue to work with cookies as before.

### Client Detection

The API detects client platform using the `ClientDetector` utility (`Http/ClientDetector.php`):

```php
class ClientDetector {
    public const PLATFORM_WEB = 'web';
    public const PLATFORM_MOBILE_ANDROID = 'mobile_android';
    public const PLATFORM_MOBILE_IOS = 'mobile_ios';
    
    public function getPlatform(): string { ... }
    public function isMobileApp(): bool { ... }
    public function isWebBrowser(): bool { ... }
}
```

**Detection Priority**:
1. Check for custom Kotlin app headers: `X-App-Platform`, `X-App-Name`, `X-App-Version`
2. Check `User-Agent` for iOS patterns (iPad, iPhone, iPod)
3. Check `User-Agent` for Android patterns
4. Check `User-Agent` for generic mobile patterns
5. Check `User-Agent` for browser patterns (Chrome, Firefox, Safari, Edge)
6. Default to `PLATFORM_UNKNOWN`

### Web Browser Authentication (Cookie-Based)

**Flow Diagram**:
```
┌──────────────┐
│ Browser      │
│ Login        │
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│ POST /auth/login                     │
│ (Cookie-based browser detected)      │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ validate credentials                 │
│ generate access & refresh tokens     │
│ save to database                     │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Set HTTP-only cookie:                │
│ geoterra_session_token=<token>       │
│ (secure=false for HTTP/localhost)    │
│ (secure=true for HTTPS/production)   │
│ (httponly=true)                      │
│ (samesite=Lax)                       │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Return response (minimal tokens)     │
│ {                                    │
│   "authentication_method": "cookie", │
│   "access_token": "...",             │
│   "expires_in": 5400                 │
│ }                                    │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Browser stores cookie automatically  │
│ (in  secure storage)                 │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Subsequent requests include cookie   │
│ automatically (same-origin)          │
└──────────────────────────────────────┘
```

**Browser Login Response**:
```json
{
  "data": {
    "access_token": "a1b2c3d4...",
    "user_id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "usr",
    "is_admin": false,
    "authentication_method": "cookie"
  },
  "meta": {
    "token_type": "Cookie",
    "expires_in": 5400,
    "message": "Session token set in HTTP-only cookie"
  },
  "errors": []
}
```

**Key Differences from Mobile**:
- No `refresh_token` in response body (only stored securely in database)
- `authentication_method` is `"cookie"`
- Cookie automatically sent by browser
- Client doesn't need to manually manage tokens

### Mobile App Authentication (Bearer Token)

**Flow Diagram**:
```
┌──────────────┐
│ Mobile App   │
│ (Kotlin)     │
│ Login        │
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│ POST /auth/login                     │
│ Headers:                             │
│   X-App-Platform: android-kotlin     │
│   X-App-Name: GeoterRA               │
│   X-App-Version: 1.0.0               │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ validate credentials                 │
│ generate access & refresh tokens     │
│ save to database                     │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Return tokens in response body:      │
│ {                                    │
│   "access_token": "...",             │
│   "refresh_token": "...",            │
│   "authentication_method":           │
│       "bearer_token"                 │
│ }                                    │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Mobile app stores tokens in secure   │
│ local storage (Keystore/Keychain)    │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Subsequent requests include token in │
│ Authorization header:                │
│ Authorization: Bearer <access_token> │
└──────────────────────────────────────┘
```

**Mobile Login Response**:
```json
{
  "data": {
    "access_token": "a1b2c3d4...",
    "refresh_token": "x1y2z3a4...",
    "user_id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "usr",
    "is_admin": false,
    "authentication_method": "bearer_token"
  },
  "meta": {
    "token_type": "Bearer",
    "expires_in": 5400,
    "refresh_expires_in": 2592000,
    "message": "Use access_token in Authorization header: \"Bearer <token>\""
  },
  "errors": []
}
```

**Key Differences from Browser**:
- Both `access_token` and `refresh_token` in response body
- Mobile app must store tokens securely locally
- `authentication_method` is `"bearer_token"`
- Token sent manually in `Authorization` header
- Client responsible for token management

### Kotlin Mobile App Implementation Example

```kotlin
// Configure Ktor HTTP client with custom headers for platform detection
val httpClient = HttpClient(CIO) {
    install(Auth) {
        bearer {
            // Automatically add Bearer token to all requests
            loadTokens {
                val accessToken = tokenManager.getAccessToken()
                if (accessToken != null) {
                    BearerTokens(accessToken, "")
                } else null
            }
            
            refreshTokens {
                // When token expires, use refresh_token to get new one
                try {
                    val refreshToken = tokenManager.getRefreshToken()
                    val response = client.post("auth/refresh") {
                        setBody(mapOf("refresh_token" to refreshToken))
                    }.body<RefreshResponse>()
                    
                    tokenManager.saveTokens(
                        response.data.access_token,
                        response.data.refresh_token
                    )
                    BearerTokens(response.data.access_token, "")
                } catch (e: Exception) {
                    // Refresh failed, trigger logout
                    authEventBus.emit(AuthEvent.Unauthorized)
                    null
                }
            }
        }
    }
    
    defaultRequest {
        // Custom headers for platform detection
        header("X-App-Platform", "android-kotlin")
        header("X-App-Name", "GeoterRA")
        header("X-App-Version", "1.0.0")
        url(NetworkConfig.BASE_URL)
    }
}

// Login
suspend fun login(email: String, password: String) {
    val response = httpClient.post("auth/login") {
        setBody(mapOf("email" to email, "password" to password))
    }.body<LoginResponse>()
    
    // Automatically add tokens to Authorization header in subsequent requests
    tokenManager.saveTokens(
        response.data.access_token,
        response.data.refresh_token
    )
}

// Authenticated request - token automatically added
suspend fun getUserProfile() {
    val response = httpClient.get("users/me")  // Bearer token automatically included
    return response.body<UserProfile>()
}
```

### Dual Authentication in Authentication Endpoints

All authentication endpoints include platform detection:

#### Login Endpoint

```php
public function login(): void {
    $clientDetector = new ClientDetector();
    
    if ($clientDetector->isMobileApp()) {
        $this->loginMobileClient($result);  // Bearer tokens in response
    } else {
        $this->loginWebClient($result);     // Cookie set, minimal response
    }
}
```

#### Refresh Endpoint

- **Web Browser**: Validates cookie is still valid (no refresh needed)
- **Mobile App**: Rotates tokens using refresh_token from request body

#### Logout Endpoint

- **Web Browser**: Deletes HTTP-only cookie
- **Mobile App**: No cookie to delete (client discards tokens)
- **Both**: Revoke tokens in database

### Session Validation (config/session.php)

Every request runs through dual-path session validation:

```php
function validateSessionToken(PDO $db): void {
    $clientDetector = new ClientDetector();
    
    if ($clientDetector->isMobileApp()) {
        validateMobileAppToken($db);        // Check Authorization header
    } else {
        validateBrowserCookie($db);         // Check cookie
    }
}
```

**Browser Path** (`validateBrowserCookie`):
1. Extract token from `$_COOKIE['geoterra_session_token']`
2. Validate token in database
3. Load user from database
4. Attach user to request context

**Mobile Path** (`validateMobileAppToken`):
1. Extract token from `Authorization: Bearer <token>` header
2. Validate token in database
3. Load user from database
4. Attach user to request context

Both paths result in `Request::getUser()` being available to controllers, so **controller code is identical** regardless of platform.

### Request Class Bearer Token Support

The `Http\Request` class now supports bearer token extraction:

```php
// Extract Bearer token from Authorization header
$token = Request::getBearerToken();  // Returns token or null

// Check if request has Bearer token
if (Request::hasBearerToken()) {
    // Token present in Authorization header
}

// Check if user is authenticated (works for both methods)
if (Request::isAuthenticated()) {
    // User was authenticated via cookie or bearer token
    $user = Request::getUser();
}
```

### Testing Multi-Platform Authentication

Three test scripts are provided in `API/tests/`:

1. **test_browser_auth.sh** - Tests web browser cookie-based flow
   ```bash
   bash test_browser_auth.sh http://localhost:8000
   ```

2. **test_mobile_auth.sh** - Tests mobile app bearer token flow
   ```bash
   bash test_mobile_auth.sh http://localhost:8000
   ```

3. **test_auth_comparison.sh** - Shows differences between methods
   ```bash
   bash test_auth_comparison.sh http://localhost:8000
   ```

### Backward Compatibility

✅ **Existing web clients work without any changes**:
- Cookies still work as before
- Same response format
- Same endpoints
- No migration needed

✅ **New mobile clients supported alongside web clients**:
- Same API endpoints
- Automatic platform detection
- No separate API version needed
- Can evolve independently

### Security Comparison

| Aspect | Browser (Cookie) | Mobile (Bearer) |
|--------|------------------|-----------------|
| Token Storage | HTTP-only cookie | Secure local storage |
| Token Transmission | Automatic | Authorization header |
| XSS Protection | ✅ HTTP-only flag | ✅ Native app |
| CSRF Protection | ✅ SameSite=Lax | ✅ N/A (stateless) |
| Token Leakage Risk | Low | Medium (requires secure storage) |
| Token Expiration | 1.5 hours | 1.5 hours |
| Refresh Handling | Automatic | Manual (with auto-retry) |

### Bug Fixes Included

This implementation also fixes a critical bug in the logout flow:

**Fixed** (`Repositories/AuthRepository::findAccessTokenWithoutValidation`):
```php
// BEFORE (bug):
WHERE token = :token

// AFTER (fixed):
WHERE token_hash = hash('sha256', :token)
```

Tokens are stored as SHA-256 hashes in the database, not plaintext. The logout fallback was querying the wrong field, making it non-functional.

---

## Request/Response Flow

### Request Flow (Step-by-Step)

1. **CORS Headers** (`config/cors.php`)
   - Sets Access-Control headers for cross-origin requests
   - Allows credentials (cookies) in cross-origin requests

2. **Initialization** (`config/init.php`)
   - Sets error reporting
   - Sets timezone

3. **Autoloader** (`public/index.php`)
   ```php
   spl_autoload_register(function (string $class): void {
       $baseDir = __DIR__ . '/../src/';
       $file = $baseDir . str_replace('\\', '/', $class) . '.php';
       if (file_exists($file)) {
           require_once $file;
       }
   });
   ```

4. **Error Handler** (`Core/ErrorHandler.php`)
   - Catches all PHP errors and exceptions
   - Logs to `/tmp/debug_api.log`
   - Returns JSON error response

5. **Database Connection** (`config/database.php`)
   - Loads credentials from `config/config.ini`
   - Creates PDO connection
   - Throwable errors on connection failure

6. **Session Validation** (`config/session.php`)
   - Validates token from `geoterra_session_token` cookie
   - Loads user into `Request::$user`
   - User available to controllers

7. **Request Parsing** (`Http/RequestParser.php`)
   - Extracts request path from `$_SERVER['PATH_INFO']`
   - Extracts HTTP method from `$_SERVER['REQUEST_METHOD']`

8. **Routing** (`Router/SimpleRouter.php`)
   - Matches request method + path against route definitions
   - Converts route patterns to regex: `/users/{id}` → `/users/(?P<id>[^/]+)`
   - Extracts route parameters (if any)
   - Instantiates controller class: `new \Controllers\UserController($pdo)`
   - Calls controller action with parameters

9. **Controller Execution**
   - Parses JSON body: `Request::parseJsonRequest()`
   - Creates DTO: `LoginUserDTO::fromArray($data)`
   - Calls service method
   - Handles exceptions
   - Calls `Response::success()` or `Response::error()`

10. **Response Sending** (`Http/Response.php`)
    ```php
    // Success response
    Response::success(
        ['user_id' => 123, 'email' => 'user@example.com'],  // data
        ['token_type' => 'Bearer', 'expires_in' => 5400],   // meta
        200                                                   // status
    );
    
    // Returns JSON:
    {
        "data": {"user_id": 123, "email": "user@example.com"},
        "meta": {"token_type": "Bearer", "expires_in": 5400},
        "errors": []
    }
    ```

### Response Format

All responses follow a consistent JSON structure:

```json
{
    "data": null,
    "meta": null,
    "errors": []
}
```

**Success Response** (200 OK):
```json
{
    "data": {
        "access_token": "a1b2c3d4e5f6...",
        "refresh_token": "x9y8z7w6v5u4...",
        "user_id": "user_123",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "usr"
    },
    "meta": {
        "token_type": "Bearer",
        "expires_in": 5400
    },
    "errors": []
}
```

**Error Response** (401 Unauthorized):
```json
{
    "data": null,
    "meta": null,
    "errors": [
        {
            "code": "INVALID_CREDENTIALS",
            "message": "El correo electrónico o la contraseña son incorrectos"
        }
    ]
}
```

---

## All Endpoints Documentation

### Authentication Endpoints

#### 1. POST `/auth/login`

**Purpose**: Authenticate a user and obtain session token

**Authentication**: Not required (public endpoint)

**Request Body**:
```json
{
    "email": "user@example.com",
    "password": "SecurePassword123!"
}
```

**Success Response** (200 OK):
```json
{
    "data": {
        "access_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
        "refresh_token": "x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "name": "John Doe",
        "is_admin": false,
        "role": "usr"
    },
    "meta": {
        "token_type": "Bearer",
        "expires_in": 5400
    },
    "errors": []
}
```
**Side Effect**: Sets HTTP-only cookie `geoterra_session_token` with access token

**Error Cases**:
- `400`: Missing email or password field
- `400`: Invalid email format
- `400`: Password too short (< 8 chars)
- `401`: Invalid email or password (wrong credentials)

**Code Path**: `Controllers/AuthController::login()` → `Services/AuthService::login()` → `Repositories/AuthRepository` + `UserRepository`

---

#### 2. POST `/auth/refresh`

**Purpose**: Refresh expired access token using refresh token

**Authentication**: Not required (uses refresh_token from body)

**Request Body**:
```json
{
    "refresh_token": "x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9"
}
```

**Success Response** (200 OK):
```json
{
    "data": {
        "access_token": "new_access_token_32_bytes_hex",
        "refresh_token": "new_refresh_token_64_bytes_hex",
        "user_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "meta": {
        "token_type": "Bearer",
        "expires_in": 5400
    },
    "errors": []
}
```
**Side Effect**: Sets new HTTP-only cookie with new access token

**Error Cases**:
- `400`: Missing refresh_token field
- `401`: Invalid or expired refresh token
- `401`: Refresh token not found in database

**Code Path**: `Controllers/AuthController::refresh()` → `Services/AuthService::refreshTokens()` → `Repositories/AuthRepository` + `UserRepository`

---

#### 3. POST `/auth/logout`

**Purpose**: Revoke current session and logout user

**Authentication**: Required (cookie)

**Request Body**: None (empty or omitted)

**Success Response** (200 OK):
```json
{
    "data": {
        "logged_out": true
    },
    "meta": null,
    "errors": []
}
```
**Side Effect**: 
- Deletes HTTP-only cookie by setting expires to past date
- Revokes token from database

**Error Cases**:
- `401`: Not authenticated (no valid token in cookie)

**Code Path**: `Controllers/AuthController::logout()` → `Services/AuthService::logout()` → `Repositories/AuthRepository`

---

### User Management Endpoints

#### 4. POST `/users/register`

**Purpose**: Create new user account

**Authentication**: Not required (public endpoint)

**Request Body**:
```json
{
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "name": "Jane Smith",
    "phone_number": "+1234567890",
    "first_name": "Jane",
    "last_name": "Smith"
}
```

**Success Response** (201 Created):
```json
{
    "data": {
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "email": "newuser@example.com",
        "name": "Jane Smith",
        "role": "usr"
    },
    "meta": {
        "message": "User registered successfully"
    },
    "errors": []
}
```

**Error Cases**:
- `400`: Missing required fields (email, password, name)
- `400`: Invalid email format
- `400`: Weak password (< 8 chars, no uppercase, no lowercase, no numbers, no special chars)
- `409`: Email already registered

**Validation Rules**:
- Email: Valid format, unique in database
- Password: Min 8 chars, uppercase, lowercase, number, special character
- Name: Non-empty string

**Code Path**: `Controllers/UserController::register()` → `Services/UserService::registerUser()` → `Repositories/UserRepository` + `AuthRepository`

---

#### 5. GET `/users/me`

**Purpose**: Get authenticated user's profile information

**Authentication**: Required (cookie with valid access token)

**Request Body**: None

**Success Response** (200 OK):
```json
{
    "data": {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "name": "John Doe",
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "+1234567890",
        "role": "usr",
        "is_admin": false,
        "is_active": true,
        "created_at": "2024-01-15T10:30:00Z"
    },
    "meta": null,
    "errors": []
}
```

**Error Cases**:
- `401`: Not authenticated (no valid token or expired token)
- `404`: User not found in database (token references deleted user)

**Code Path**: `Controllers/UserController::show()` → `Services/UserService::getCurrentUser()` → `Repositories/UserRepository`

---

#### 6. GET `/users/me/session`

**Purpose**: Get authenticated user from session cookie (validates via session middleware)

**Authentication**: Required (cookie)

**Request Body**: None

**Success Response** (200 OK):
```json
{
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "role": "usr",
        "email": "user@example.com",
        "is_active": true,
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "+1234567890"
    },
    "meta": null,
    "errors": []
}
```

**Error Cases**:
- `401`: Not authenticated (no valid token in cookie)

**Difference from `/users/me`**:
- This endpoint validates user via session middleware (`config/session.php`)
- `/users/me` validates via access token claims in the JWT-like token
- This returns only essential user info to avoid exposing sensitive data

**Code Path**: `Controllers/UserController::showSession()` → Uses `Request::getUser()`

---

#### 7. PUT `/users/me`

**Purpose**: Update authenticated user's profile information

**Authentication**: Required (cookie)

**Request Body** (all fields optional):
```json
{
    "name": "Jane Doe",
    "email": "newemail@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "phone_number": "+9876543210"
}
```

**Success Response** (200 OK):
```json
{
    "data": {
        "message": "User profile updated successfully"
    },
    "meta": null,
    "errors": []
}
```

**Error Cases**:
- `401`: Not authenticated
- `400`: Invalid email format (if email changed)
- `409`: New email already registered by another user
- `500`: Update failed (database error)

**Notes**:
- Only provided fields are updated (partial update)
- Cannot update password through this endpoint
- Cannot update role/admin status through this endpoint

**Code Path**: `Controllers/UserController::update()` → `Services/UserService::updateUser()` → `Repositories/UserRepository`

---

#### 8. DELETE `/users/me`

**Purpose**: Delete authenticated user's account permanently

**Authentication**: Required (cookie)

**Request Body**: None

**Success Response** (200 OK):
```json
{
    "data": {
        "message": "User account deleted successfully"
    },
    "meta": null,
    "errors": []
}
```

**Error Cases**:
- `401`: Not authenticated
- `500`: Deletion failed (database error)

**Important Notes**:
- This action is **irreversible**
- Deletes all user data from system
- User's analysis requests are also deleted
- After deletion, user's tokens become invalid

**Code Path**: `Controllers/UserController::delete()` → `Services/UserService::deleteCurrentUser()` → `Repositories/UserRepository`

---

### Analysis Request Endpoints

#### 9. POST `/analysis-request`

**Purpose**: Create new analysis request

**Authentication**: Required (cookie)

**Request Body**:
```json
{
    "region_id": "region_123",
    "manifestation_type": "earthquake",
    "description": "Analysis required for geological survey",
    "location": "Latitude: -35.2, Longitude: -148.3"
}
```

**Success Response** (201 Created):
```json
{
    "data": {
        "id": "req_550e8400-e29b-41d4-a716-446655440002",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "region_id": "region_123",
        "manifestation_type": "earthquake",
        "description": "Analysis required for geological survey",
        "status": "pending",
        "created_at": "2024-01-15T10:30:00Z"
    },
    "meta": null,
    "errors": []
}
```

**Error Cases**:
- `400`: Missing required fields
- `401`: Not authenticated
- `404`: Region doesn't exist

**Code Path**: `Controllers/AnalysisRequestController::store()` → `Services/AnalysisRequestService::createRequest()` → `Repositories/AnalysisRequestRepository`

---

#### 10. GET `/analysis-request`

**Purpose**: Get current user's analysis requests

**Authentication**: Required (cookie)

**Request Parameters**: None

**Success Response** (200 OK):
```json
{
    "data": [
        {
            "id": "req_550e8400",
            "user_id": "550e8400",
            "region_id": "region_123",
            "manifestation_type": "earthquake",
            "status": "pending",
            "created_at": "2024-01-15T10:30:00Z"
        }
    ],
    "meta": {
        "count": 1,
        "total": 5
    },
    "errors": []
}
```

**Error Cases**:
- `401`: Not authenticated

**Code Path**: `Controllers/AnalysisRequestController::index()` → `Services/AnalysisRequestService::getUserRequests()` → `Repositories/AnalysisRequestRepository`

---

#### 11. PUT `/analysis-request/{id}`

**Purpose**: Update user's own analysis request

**Authentication**: Required (cookie)

**URL Parameters**: `{id}` - analysis request ID

**Request Body**:
```json
{
    "description": "Updated description",
    "status": "in_progress"
}
```

**Success Response** (200 OK):
```json
{
    "data": {
        "message": "Analysis request updated successfully",
        "id": "req_550e8400"
    },
    "meta": null,
    "errors": []
}
```

**Error Cases**:
- `401`: Not authenticated
- `403`: User doesn't own this request
- `404`: Request not found

**Code Path**: `Controllers/AnalysisRequestController::update()` → `Services/AnalysisRequestService::updateRequest()` → `Repositories/AnalysisRequestRepository`

---

#### 12. DELETE `/analysis-request/{id}`

**Purpose**: Delete user's own analysis request

**Authentication**: Required (cookie)

**URL Parameters**: `{id}` - analysis request ID

**Request Body**: None

**Success Response** (200 OK):
```json
{
    "data": {
        "message": "Analysis request deleted successfully"
    },
    "meta": null,
    "errors": []
}
```

**Error Cases**:
- `401`: Not authenticated
- `403`: User doesn't own this request
- `404`: Request not found

**Code Path**: `Controllers/AnalysisRequestController::delete()` → `Services/AnalysisRequestService::deleteRequest()` → `Repositories/AnalysisRequestRepository`

---

### Admin Endpoints (Role: admin)

#### 13. GET `/admin/analysis-requests`

**Purpose**: Get all analysis requests (admin only)

**Authentication**: Required (admin role)

**Request Parameters**: None

**Success Response** (200 OK):
```json
{
    "data": [
        {
            "id": "req_1",
            "user_id": "user_550e8400",
            "user_email": "user@example.com",
            "region_id": "region_123",
            "manifestation_type": "earthquake",
            "status": "pending",
            "created_at": "2024-01-15T10:30:00Z"
        }
    ],
    "meta": {
        "count": 10,
        "total": 145
    },
    "errors": []
}
```

**Error Cases**:
- `401`: Not authenticated
- `403`: Not an admin

**Code Path**: `Controllers/AnalysisRequestController::adminIndex()` → `Services/AnalysisRequestService::getAllRequests()` → `Repositories/AnalysisRequestRepository`

---

#### 14. PUT `/admin/analysis-request/{id}`

**Purpose**: Update any analysis request (admin only)

**Authentication**: Required (admin role)

**URL Parameters**: `{id}` - analysis request ID

**Request Body**:
```json
{
    "status": "approved",
    "admin_notes": "Approved by admin"
}
```

**Success Response** (200 OK):
```json
{
    "data": {
        "message": "Analysis request updated by admin",
        "id": "req_1"
    },
    "meta": null,
    "errors": []
}
```

**Error Cases**:
- `401`: Not authenticated
- `403`: Not an admin
- `404`: Request not found

**Code Path**: `Controllers/AnalysisRequestController::adminUpdate()` → `Services/AnalysisRequestService::adminUpdateRequest()` → `Repositories/AnalysisRequestRepository`

---

#### 15. DELETE `/admin/analysis-request/{id}`

**Purpose**: Delete any analysis request (admin only)

**Authentication**: Required (admin role)

**URL Parameters**: `{id}` - analysis request ID

**Request Body**: None

**Success Response** (200 OK):
```json
{
    "data": {
        "message": "Analysis request deleted by admin"
    },
    "meta": null,
    "errors": []
}
```

**Error Cases**:
- `401`: Not authenticated
- `403`: Not an admin
- `404`: Request not found

**Code Path**: `Controllers/AnalysisRequestController::adminDelete()` → `Services/AnalysisRequestService::adminDeleteRequest()` → `Repositories/AnalysisRequestRepository`

---

### Region Endpoints

#### 16. GET `/regions`

**Purpose**: Get all regions (public)

**Authentication**: Not required

**Success Response** (200 OK):
```json
{
    "data": [
        {
            "id": "region_123",
            "name": "Atacama Region",
            "latitude": "-22.5",
            "longitude": "-68.2",
            "description": "Driest region in the world",
            "created_at": "2024-01-10T10:30:00Z"
        }
    ],
    "meta": {
        "count": 15
    },
    "errors": []
}
```

**Code Path**: `Controllers/RegionController::index()` → `Services/RegionService::getAllRegions()` → `Repositories/RegionRepository`

---

#### 17. GET `/regions/{id}`

**Purpose**: Get specific region details

**Authentication**: Not required

**URL Parameters**: `{id}` - region ID

**Success Response** (200 OK):
```json
{
    "data": {
        "id": "region_123",
        "name": "Atacama Region",
        "latitude": "-22.5",
        "longitude": "-68.2",
        "description": "Driest region in the world",
        "manifestations_count": 45
    },
    "meta": null,
    "errors": []
}
```

**Error Cases**:
- `404`: Region not found

**Code Path**: `Controllers/RegionController::show()` → `Services/RegionService::getRegion()` → `Repositories/RegionRepository`

---

#### 18. POST `/regions`

**Purpose**: Create new region (admin only)

**Authentication**: Required (admin role)

**Request Body**:
```json
{
    "name": "New Region",
    "latitude": "-35.5",
    "longitude": "-71.2",
    "description": "Description of the region"
}
```

**Success Response** (201 Created):
```json
{
    "data": {
        "id": "region_new",
        "name": "New Region",
        "latitude": "-35.5",
        "longitude": "-71.2"
    },
    "meta": null,
    "errors": []
}
```

**Error Cases**:
- `401`: Not authenticated
- `403`: Not an admin
- `400`: Missing required fields

**Code Path**: `Controllers/RegionController::store()` → `Services/RegionService::createRegion()` → `Repositories/RegionRepository`

---

#### 19. PUT `/regions/{id}`

**Purpose**: Update region (admin only)

**Authentication**: Required (admin role)

**URL Parameters**: `{id}` - region ID

**Request Body** (all fields optional):
```json
{
    "name": "Updated Region Name",
    "description": "Updated description"
}
```

**Success Response** (200 OK):
```json
{
    "data": {
        "message": "Region updated successfully"
    },
    "meta": null,
    "errors": []
}
```

**Error Cases**:
- `401`: Not authenticated
- `403`: Not an admin
- `404`: Region not found

**Code Path**: `Controllers/RegionController::update()` → `Services/RegionService::updateRegion()` → `Repositories/RegionRepository`

---

#### 20. DELETE `/regions/{id}`

**Purpose**: Delete region (admin only)

**Authentication**: Required (admin role)

**URL Parameters**: `{id}` - region ID

**Request Body**: None

**Success Response** (200 OK):
```json
{
    "data": {
        "message": "Region deleted successfully"
    },
    "meta": null,
    "errors": []
}
```

**Error Cases**:
- `401`: Not authenticated
- `403`: Not an admin
- `404`: Region not found

**Code Path**: `Controllers/RegionController::delete()` → `Services/RegionService::deleteRegion()` → `Repositories/RegionRepository`

---

### Maintenance Endpoints (Admin only)

#### 21. GET `/maintenance/system/logs`

**Purpose**: Get system logs (admin only)

**Authentication**: Required (admin role)

**Success Response** (200 OK):
```json
{
    "data": {
        "logs": [
            "[2024-01-15 10:30:00] User login: user@example.com",
            "[2024-01-15 10:35:22] Analysis request created: req_1",
            "[2024-01-15 10:40:15] Token refreshed for user_123"
        ]
    },
    "meta": {
        "file": "/tmp/debug_api.log",
        "lines": 3
    },
    "errors": []
}
```

**Code Path**: `Controllers/MaintenanceController::getSystemLogs()` → `Services/MaintenanceService::getSystemLogs()`

---

#### 22. GET `/maintenance/dashboard`

**Purpose**: Get system dashboard info (admin only)

**Authentication**: Required (admin role)

**Success Response** (200 OK):
```json
{
    "data": {
        "total_users": 42,
        "active_sessions": 15,
        "total_analysis_requests": 156,
        "pending_requests": 23,
        "total_regions": 15,
        "database_size_mb": 5.2,
        "server_uptime_hours": 720,
        "last_backup": "2024-01-15T08:00:00Z"
    },
    "meta": null,
    "errors": []
}
```

**Code Path**: `Controllers/MaintenanceController::getDashboardInfo()` → `Services/MaintenanceService::getDashboardInfo()`

---

#### 23. GET `/maintenance/users`

**Purpose**: Get all users in system (admin only)

**Authentication**: Required (admin role)

**Success Response** (200 OK):
```json
{
    "data": [
        {
            "user_id": "user_123",
            "email": "user@example.com",
            "name": "John Doe",
            "role": "usr",
            "is_active": true,
            "created_at": "2024-01-01T10:30:00Z",
            "last_login": "2024-01-15T10:30:00Z"
        }
    ],
    "meta": {
        "total": 42
    },
    "errors": []
}
```

**Code Path**: `Controllers/MaintenanceController::showAllUsers()` → `Services/MaintenanceService::getAllUsers()`

---

#### 24. GET `/maintenance/database/tables`

**Purpose**: Get database table information (admin only)

**Authentication**: Required (admin role)

**Success Response** (200 OK):
```json
{
    "data": {
        "tables": [
            {
                "name": "users",
                "rows": 42,
                "size_mb": 0.5
            },
            {
                "name": "analysis_requests",
                "rows": 156,
                "size_mb": 1.2
            },
            {
                "name": "regions",
                "rows": 15,
                "size_mb": 0.1
            }
        ]
    },
    "meta": {
        "total_tables": 6,
        "total_size_mb": 5.2
    },
    "errors": []
}
```

**Code Path**: `Controllers/MaintenanceController::getAllDatabaseTables()` → `Services/MaintenanceService::getDatabaseTableInfo()`

---

## Core Components

### DTOs (Data Transfer Objects)

DTOs are simple classes that transfer data between layers with built-in validation.

**Key DTOs**:
- `LoginUserDTO` - Login request validation
- `RegisterUserDTO` - Registration request validation
- `UpdateUserDTO` - User profile update validation
- `AnalysisRequestDTO` - Analysis request validation
- `RegionDTO` - Region data transfer

**Example** (`LoginUserDTO.php`):
```php
final class LoginUserDTO {
    public function __construct(
        public string $email,
        public string $password
    ) {}

    public static function fromArray(array $data): self {
        return new self(
            trim((string) ($data['email'] ?? '')),
            (string) ($data['password'] ?? '')
        );
    }

    public function validate(): void {
        if ($this->email === '') {
            throw new ApiException(ErrorType::missingField('email'));
        }
        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            throw new ApiException(ErrorType::invalidEmail());
        }
        if ($this->password === '') {
            throw new ApiException(ErrorType::missingField('password'));
        }
        if (strlen($this->password) < 8) {
            throw new ApiException(ErrorType::weakPassword());
        }
    }
}
```

### Request/Response Utilities

**Request** (`Http/Request.php`):
```php
// Parse JSON body from request
$data = Request::parseJsonRequest();

// Set authenticated user (called by session.php)
Request::setUser($userArray);

// Get authenticated user in controller
$user = Request::getUser();
```

**Response** (`Http/Response.php`):
```php
// Send success response
Response::success(
    ['user_id' => 123],           // data
    ['token_type' => 'Bearer'],   // meta
    200                           // status
);

// Send error response
Response::error(
    ErrorType::invalidCredentials(),
    401
);
```

### Error Types

**ErrorType** (`Http/ErrorType.php`) provides standardized error codes:
- `INVALID_JSON` - Malformed JSON request
- `INVALID_FIELD` - Field value doesn't meet requirements
- `MISSING_FIELD` - Required field is missing
- `INVALID_EMAIL` - Email format invalid
- `EMAIL_ALREADY_IN_USE` - Email already registered
- `WEAK_PASSWORD` - Password doesn't meet security requirements
- `INVALID_CREDENTIALS` - Wrong email/password
- `UNAUTHORIZED` - Action requires authentication
- `FORBIDDEN` - User lacks permissions
- `NOT_FOUND` - Resource doesn't exist
- `INTERNAL_ERROR` - Server error

---

## Authentication & Authorization

### Authentication Methods

1. **HTTP-only Cookie** (Session-based)
   - Token stored in `geoterra_session_token` cookie
   - Automatically sent by browser with each request
   - Validated in `config/session.php` before routing
   - Used for user context in controllers

2. **Bearer Token** (Optional, for API clients)
   - Access token sent in `Authorization: Bearer <token>` header
   - Can be used instead of cookie for non-browser clients
   - Not yet implemented in current codebase (future enhancement)

### Authorization (Role-Based Access Control)

Users have roles that determine what they can access:

- **usr** (default) - Regular user, can manage own profile and requests
- **admin** - Administrator, full system access

**Permission Checks** (`Services/PermissionService.php`):
```php
// Check if user is admin
if ($user['role'] !== 'admin') {
    throw new ApiException(ErrorType::forbidden('Admin access required'), 403);
}

// Check if user owns resource
if ($resourceUserId !== $currentUserId) {
    throw new ApiException(ErrorType::forbidden('Cannot access other user\'s resources'), 403);
}
```

**Protected Endpoints Summary**:
- `/admin/*` - Admin only
- `/users/me*` - Authenticated users only
- `/analysis-request` - Authenticated users only (can only access own requests)
- `/auth/logout` - Authenticated users only

---

## Error Handling

### Error Handler

The `Core/ErrorHandler.php` catches all PHP errors and exceptions:

```php
class ErrorHandler {
    public static function register(): void {
        set_error_handler([self::class, 'handleError']);
        set_exception_handler([self::class, 'handleException']);
    }
}
```

### API Exception

`Http/ApiException.php` allows services to throw domain-specific exceptions:

```php
throw new ApiException(
    ErrorType::invalidCredentials(),
    401
);
```

### Controller Exception Handling

All controllers follow this pattern:

```php
try {
    // Business logic
    $result = $this->authService->login($dto);
    Response::success($result['data'], $result['meta'], 200);
} catch (ApiException $e) {
    // Known business error
    Response::error($e->getError(), $e->getCode());
} catch (\Throwable $e) {
    // Unexpected error
    Response::error(ErrorType::internal($e->getMessage()), 500);
}
```

### Error Response Format

```json
{
    "data": null,
    "meta": null,
    "errors": [
        {
            "code": "INVALID_EMAIL",
            "message": "El formato del correo electrónico no es válido"
        }
    ]
}
```

---

## Security Measures

### 1. Password Security

- **Hashing**: Passwords hashed with `PASSWORD_BCRYPT` algorithm
- **Verification**: Constant-time comparison prevents timing attacks
- **Requirements**: Min 8 chars, uppercase, lowercase, number, special char

```php
// Hashing
$hash = password_hash($password, PASSWORD_BCRYPT);

// Verification
PasswordService::verify($password, $hash);
```

### 2. Token Security

- **Generation**: 32 bytes (256 bits) for access tokens, 64 bytes for refresh tokens
- **Format**: Hex-encoded binary data
- **Storage**: Tokens stored in database with expiration timestamps
- **Rotation**: Tokens rotated on refresh, old tokens invalidated

### 3. Cookie Security

| Attribute  | Value     | Purpose |
|-----------|-----------|---------|
| `httponly` | `true`    | Prevent XSS attacks (JavaScript cannot access) |
| `samesite` | `Lax`     | Prevent CSRF attacks |
| `secure`   | `false` (local), `true` (production) | Only send over HTTPS |
| `path`     | `/`       | Available to entire API |
| `expires`  | 5400s     | Automatic cleanup after 1.5 hours |

### 4. CORS Security

- **Access-Control-Allow-Credentials**: `true` (allow cookies)
- **Access-Control-Allow-Origin**: Specific domain (not `*`)
- **Access-Control-Allow-Methods**: Only necessary HTTP methods
- **Access-Control-Allow-Headers**: Specific headers only

### 5. Input Validation

- **Email**: Validated with `FILTER_VALIDATE_EMAIL`
- **DTOs**: All user input validated through DTO `validate()` method
- **SQL Injection**: PDO prepared statements prevent SQL injection
- **Type Validation**: PHP 8.1 strict types prevent type confusion

### 6. Rate Limiting

- Not implemented yet (future enhancement)
- Consider adding middleware to prevent brute force attacks

### 7. Secrets Management

- Database credentials in `config/config.ini` (git-ignored)
- Environment-specific configuration via `APP_ENV` variable
- Production config separate from development

---

## Database Configuration

### Configuration File

**Location**: `/API/config/config.ini` (git-ignored for security)

**Format**:
```ini
[database]
host = localhost
port = 3306
name = GeoterRA
user = mario
pass = 2003
charset = utf8mb4
```

### Connection Details

- **Type**: MySQL / MariaDB
- **DSN**: `mysql:host={host};port={port};dbname={name};charset=utf8mb4`
- **PDO Configuration**:
  - `ERRMODE_EXCEPTION` - Throw exceptions on errors
  - `DEFAULT_FETCH_MODE_ASSOC` - Return rows as associative arrays
  - `EMULATE_PREPARES` - false (use native prepared statements)

### Environment Support

```php
// Development: ./API/config/config.ini
// Production: /config.ini (outside web root)
$configPath = $env === 'production'
    ? realpath(__DIR__ . '/../../../') . '/config.ini'
    : __DIR__ . '/config.ini';
```

### Required Tables

- **users** - User accounts and profiles
- **access_tokens** - Current access tokens (short-lived)
- **refresh_tokens** - Refresh tokens for long-term sessions
- **analysis_requests** - Geological analysis requests
- **regions** - Geographic regions
- **registered_manifestations** - Recorded geological events

---

## Development Workflow

### 1. Local Setup

```bash
# Copy database config
cp API/config/config.example.ini API/config/config.ini

# Update config with local database credentials
# Edit: API/config/config.ini

# Ensure database exists
# CREATE DATABASE GeoterRA;
```

### 2. Adding New Endpoint

1. **Define Route** in `config/routes.php`:
```php
['method' => 'POST', 'path' => '/items', 'controller' => 'ItemController', 'action' => 'store']
```

2. **Create DTO** in `src/DTO/ItemDTO.php`:
```php
final class ItemDTO {
    public function __construct(public string $name) {}
    public function validate(): void { /* validation */ }
}
```

3. **Create Repository** in `src/Repositories/ItemRepository.php`:
```php
class ItemRepository {
    public function create(string $name): array { /* DB query */ }
}
```

4. **Create Service** in `src/Services/ItemService.php`:
```php
class ItemService {
    public function createItem(ItemDTO $dto): array { /* Business logic */ }
}
```

5. **Create Controller** in `src/Controllers/ItemController.php`:
```php
class ItemController {
    public function store(): void {
        $dto = ItemDTO::fromArray(Request::parseJsonRequest());
        $result = $this->itemService->createItem($dto);
        Response::success($result, null, 201);
    }
}
```

### 3. Testing Endpoints

Use provided shell scripts in `tests/`:
```bash
bash API/tests/register_endpoint_test.sh
bash API/tests/test_token_refresh.sh
bash API/tests/test_users_me.sh
```

Or use curl:
```bash
# Login
curl -X POST http://localhost/API/public/index.php/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123!"}'

# Get profile (cookie automatically sent)
curl -X GET http://localhost/API/public/index.php/users/me \
  -b "geoterra_session_token=<token_from_login>"
```

---

## Debugging

### Error Logging

Errors logged to `/tmp/debug_api.log`:

```bash
# View logs
tail -f /tmp/debug_api.log

# Example log entries
[2024-01-15 10:30:45] [ERROR] Invalid email format in login
[2024-01-15 10:31:22] [EXCEPTION] PDOException: SQLSTATE[28000]
```

### Session Debugging

Session validation logs detailed information:

```
🔵 [Session] Client connected: IP=127.0.0.1, UserAgent=Mozilla/5.0...
🔵 [Session] Client connected: Token is valid for user_id: user_123
```

### Common Issues

**Issue**: "No token in cookie"
- **Cause**: User not authenticated
- **Solution**: Login first via `/auth/login`

**Issue**: "Token expired"
- **Cause**: Access token expired (> 1.5 hours old)
- **Solution**: Refresh token via `/auth/refresh`

**Issue**: "User not found"
- **Cause**: Token references deleted user
- **Solution**: User account was deleted, login with different account

---

## Performance Considerations

1. **Database Queries**: Use indexes on frequently queried columns (email, user_id, token)
2. **Token Storage**: Consider Redis for faster token lookups (future enhancement)
3. **Caching**: Implement caching for regions (rarely change)
4. **Connection Pooling**: Use connection pooling for production (currently single connection)

---

## Future Enhancements

1. **Rate Limiting**: Prevent brute force attacks
2. **API Keys**: Support API key authentication for integrations
3. **OAuth2**: Social login integration
4. **WebSockets**: Real-time notifications
5. **Response Pagination**: Add pagination for large result sets
6. **Request Logging**: Audit trail for all API requests
7. **Two-Factor Authentication**: Enhanced security
8. **GraphQL**: Alternative to REST API
