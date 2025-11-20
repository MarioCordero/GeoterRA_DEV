# 🛡️ Issue #5: Middleware & Security Implementation

## 📋 Overview
Implement comprehensive middleware system and security measures to protect the API endpoints and ensure secure data handling.

## 🎯 Objectives
- Create middleware system for request processing
- Implement authentication and authorization middleware
- Add CORS handling and rate limiting
- Establish comprehensive security measures
- Create logging and monitoring systems

## 📂 Files to Create

### **Middleware Classes** (`/API/src/Middleware/`)
1. **AuthMiddleware.php** - Authentication verification
2. **CorsMiddleware.php** - CORS handling (migrate from `cors.inc.php`)
3. **RateLimitMiddleware.php** - API rate limiting
4. **ValidationMiddleware.php** - Input validation
5. **LoggingMiddleware.php** - Request/response logging
6. **SecurityHeadersMiddleware.php** - Security headers

### **Core Updates** (`/API/src/Core/`)
- Update **Router.php** to support middleware pipeline
- Update **Controller.php** with security helpers
- Create **Logger.php** for structured logging

## 🔍 Detailed Tasks

### ✅ Task 1: Authentication Middleware
**File**: `/API/src/Middleware/AuthMiddleware.php`

#### **Methods to Implement**:
- [ ] `handle($request, $next)` - Main middleware handler
- [ ] `checkToken($token)` - Validate session token
- [ ] `checkPermissions($user, $resource)` - Check user permissions
- [ ] `extractToken($request)` - Extract token from request headers
- [ ] `handleUnauthorized()` - Handle unauthorized access

#### **Requirements**:
- [ ] Validate session tokens from headers or cookies
- [ ] Check token expiration and validity
- [ ] Load user data for authenticated requests
- [ ] Handle different authentication methods (token, session)
- [ ] Log authentication attempts and failures

### ✅ Task 2: CORS Middleware
**File**: `/API/src/Middleware/CorsMiddleware.php`

#### **Methods to Implement**:
- [ ] `handle($request, $next)` - Process CORS headers
- [ ] `setCorsHeaders()` - Set appropriate CORS headers
- [ ] `handlePreflightRequest()` - Handle OPTIONS requests
- [ ] `validateOrigin($origin)` - Validate request origin

#### **Migration Source**:
- CORS logic from `cors.inc.php`

#### **Requirements**:
- [ ] Support multiple allowed origins
- [ ] Handle preflight OPTIONS requests
- [ ] Set appropriate CORS headers
- [ ] Include credentials support
- [ ] Validate and restrict origins

### ✅ Task 3: Rate Limiting Middleware
**File**: `/API/src/Middleware/RateLimitMiddleware.php`

#### **Methods to Implement**:
- [ ] `handle($request, $next)` - Check and enforce rate limits
- [ ] `checkLimit($identifier)` - Check current request count
- [ ] `incrementCount($identifier)` - Increment request counter
- [ ] `getRateLimit($endpoint, $user)` - Get rate limit for endpoint/user
- [ ] `handleLimitExceeded()` - Handle rate limit exceeded

#### **Requirements**:
- [ ] Implement different rate limits per endpoint
- [ ] Support user-based and IP-based limiting
- [ ] Use Redis/Memcached for distributed rate limiting
- [ ] Include rate limit headers in responses
- [ ] Log rate limit violations

### ✅ Task 4: Validation Middleware
**File**: `/API/src/Middleware/ValidationMiddleware.php`

#### **Methods to Implement**:
- [ ] `handle($request, $next)` - Validate request data
- [ ] `validateInput($data, $rules)` - Validate input against rules
- [ ] `sanitizeInput($data)` - Sanitize input data
- [ ] `formatValidationErrors($errors)` - Format validation error responses

#### **Requirements**:
- [ ] Support various validation rules
- [ ] Sanitize input to prevent XSS
- [ ] Handle file upload validation
- [ ] Return structured validation errors
- [ ] Log validation failures

### ✅ Task 5: Logging Middleware
**File**: `/API/src/Middleware/LoggingMiddleware.php`

#### **Methods to Implement**:
- [ ] `handle($request, $next)` - Log request/response
- [ ] `logRequest($request)` - Log incoming request details
- [ ] `logResponse($response)` - Log outgoing response details
- [ ] `logError($error)` - Log errors and exceptions
- [ ] `formatLogEntry($data)` - Format log entries

#### **Requirements**:
- [ ] Log all API requests and responses
- [ ] Include performance metrics (response time)
- [ ] Log security events and errors
- [ ] Support structured logging (JSON)
- [ ] Rotate log files automatically

### ✅ Task 6: Security Headers Middleware
**File**: `/API/src/Middleware/SecurityHeadersMiddleware.php`

#### **Methods to Implement**:
- [ ] `handle($request, $next)` - Add security headers
- [ ] `setSecurityHeaders()` - Set all security headers
- [ ] `setCSPHeader()` - Set Content Security Policy
- [ ] `setHSTSHeader()` - Set HTTP Strict Transport Security

#### **Requirements**:
- [ ] Add comprehensive security headers
- [ ] Implement Content Security Policy
- [ ] Add HSTS for HTTPS enforcement
- [ ] Include XSS and clickjacking protection
- [ ] Set referrer policy

## 🔧 Core Infrastructure Updates

### ✅ Task 7: Router Middleware Support
**Update File**: `/API/src/Core/Router.php`

#### **Enhancements to Add**:
- [ ] Middleware pipeline support
- [ ] Route-specific middleware attachment
- [ ] Global middleware registration
- [ ] Middleware execution order
- [ ] Error handling within middleware

### ✅ Task 8: Logger Implementation
**New File**: `/API/src/Core/Logger.php`

#### **Methods to Implement**:
- [ ] `log($level, $message, $context)` - Generic logging method
- [ ] `error($message, $context)` - Log error messages
- [ ] `warning($message, $context)` - Log warning messages
- [ ] `info($message, $context)` - Log info messages
- [ ] `debug($message, $context)` - Log debug messages

#### **Requirements**:
- [ ] Support multiple log levels
- [ ] Write to different log files (error, access, security)
- [ ] Include contextual information
- [ ] Support log rotation
- [ ] Thread-safe logging

## 🛡️ Security Measures Implementation

### **SQL Injection Prevention**
- [ ] Enforce prepared statements exclusively
- [ ] Add query logging and monitoring
- [ ] Implement database input validation
- [ ] Use parameterized queries only

### **XSS Protection**
- [ ] Sanitize all input data
- [ ] Implement output encoding
- [ ] Set appropriate Content-Type headers
- [ ] Add CSP headers

### **CSRF Protection**
- [ ] Implement CSRF token system
- [ ] Validate tokens on state-changing operations
- [ ] Use SameSite cookie attributes
- [ ] Add referer validation

### **Session Security**
- [ ] Implement secure session token generation
- [ ] Add session token rotation
- [ ] Set secure cookie attributes
- [ ] Implement IP address validation
- [ ] Add session timeout handling

### **Password Security**
- [ ] Use bcrypt/Argon2 for password hashing
- [ ] Implement password complexity requirements
- [ ] Add account lockout after failed attempts
- [ ] Include password breach checking

## 📊 Middleware Configuration

### **Global Middleware Pipeline**
```php
[
    'SecurityHeadersMiddleware',
    'CorsMiddleware',
    'LoggingMiddleware',
    'RateLimitMiddleware',
    'ValidationMiddleware'
]
```

### **Protected Route Middleware**
```php
[
    'AuthMiddleware',
    'PermissionMiddleware'
]
```

### **Admin Route Middleware**
```php
[
    'AuthMiddleware',
    'AdminMiddleware',
    'AuditMiddleware'
]
```

## 🔐 Rate Limiting Configuration

### **Rate Limit Rules**
- **Anonymous users**: 60 requests/hour
- **Authenticated users**: 300 requests/hour
- **Admin users**: 1000 requests/hour
- **Login endpoint**: 5 requests/minute
- **Registration endpoint**: 3 requests/hour
- **File upload**: 10 requests/hour

### **Implementation**
- [ ] Use sliding window algorithm
- [ ] Store counters in Redis/Memcached
- [ ] Include burst allowance
- [ ] Add whitelist for trusted IPs

## 🧪 Testing Requirements

### **Unit Tests** (`/API/tests/Unit/`)
- [ ] `Middleware/AuthMiddlewareTest.php`
- [ ] `Middleware/CorsMiddlewareTest.php`
- [ ] `Middleware/RateLimitMiddlewareTest.php`
- [ ] `Middleware/ValidationMiddlewareTest.php`
- [ ] `Core/LoggerTest.php`

### **Integration Tests** (`/API/tests/Integration/`)
- [ ] `MiddlewarePipelineTest.php`
- [ ] `SecurityTest.php`
- [ ] `RateLimitingTest.php`

### **Test Cases to Cover**:
- [ ] Authentication middleware with valid/invalid tokens
- [ ] CORS handling for different origins
- [ ] Rate limiting enforcement
- [ ] Input validation and sanitization
- [ ] Security headers presence
- [ ] Logging functionality
- [ ] Middleware execution order

## 📝 Configuration Files

### **Security Configuration** (`/API/config/security.php`)
```php
<?php
return [
    'session' => [
        'lifetime' => 3600, // 1 hour
        'rotation_interval' => 1800, // 30 minutes
        'secure' => true,
        'httponly' => true,
        'samesite' => 'strict'
    ],
    'rate_limits' => [
        'default' => 60,
        'authenticated' => 300,
        'admin' => 1000,
        'login' => 5,
        'register' => 3
    ],
    'cors' => [
        'allowed_origins' => ['https://yourdomain.com'],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
        'allowed_headers' => ['Content-Type', 'Authorization'],
        'allow_credentials' => true
    ]
];
```

### **Logging Configuration** (`/API/config/logging.php`)
```php
<?php
return [
    'default_channel' => 'file',
    'channels' => [
        'file' => [
            'driver' => 'file',
            'path' => __DIR__ . '/../logs/api.log',
            'level' => 'info'
        ],
        'error' => [
            'driver' => 'file',
            'path' => __DIR__ . '/../logs/error.log',
            'level' => 'error'
        ],
        'security' => [
            'driver' => 'file',
            'path' => __DIR__ . '/../logs/security.log',
            'level' => 'warning'
        ]
    ],
    'rotation' => [
        'enabled' => true,
        'max_files' => 7,
        'max_size' => '10MB'
    ]
];
```

## 🚀 Performance Considerations

### **Middleware Performance**
- [ ] Minimize middleware execution time
- [ ] Use caching for repeated validations
- [ ] Optimize database queries in middleware
- [ ] Implement early exits where possible

### **Rate Limiting Performance**
- [ ] Use in-memory storage (Redis) for counters
- [ ] Implement efficient sliding window algorithm
- [ ] Batch counter updates where possible
- [ ] Add monitoring for rate limit performance

### **Logging Performance**
- [ ] Use asynchronous logging where possible
- [ ] Implement log buffering
- [ ] Optimize log format for parsing
- [ ] Monitor log file sizes

## 🔄 Implementation Strategy

### **Phase 1: Core Middleware**
1. Implement basic middleware infrastructure
2. Create authentication middleware
3. Add CORS middleware
4. Set up logging system

### **Phase 2: Security Features**
1. Implement rate limiting
2. Add input validation middleware
3. Set up security headers
4. Add comprehensive logging

### **Phase 3: Testing & Integration**
1. Create comprehensive test suite
2. Test middleware pipeline
3. Security testing
4. Performance testing

### **Phase 4: Monitoring & Optimization**
1. Set up monitoring dashboards
2. Optimize performance bottlenecks
3. Fine-tune rate limits
4. Add alerting systems

## 📝 Documentation Requirements
- [ ] Middleware configuration documentation
- [ ] Security implementation guide
- [ ] Rate limiting policies
- [ ] Logging and monitoring setup

## ⚠️ Migration Notes
- **Backward Compatibility** - Ensure existing endpoints continue working
- **Performance Impact** - Monitor middleware performance impact
- **Security Testing** - Comprehensive security audit required
- **Configuration** - Environment-specific configurations needed

## 🔗 Dependencies
- **Requires**: Issue #1 (Core Infrastructure) for Router updates
- **Requires**: Issue #2 (Authentication) for AuthMiddleware
- **Integrates with**: All other issues for security protection

## 📅 Estimated Time
**3-4 days**

## ✅ Definition of Done
- [ ] All middleware classes implemented and functional
- [ ] Security measures properly configured
- [ ] Rate limiting system operational
- [ ] Comprehensive logging in place
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Documentation complete
- [ ] Performance optimized

## 🚨 Blockers & Risks
- Middleware could impact API performance
- Rate limiting configuration needs careful tuning
- Security measures might break existing integrations
- Logging could consume significant disk space

---
**Previous Issue**: [#4 Request Management System](./04-request-management-system.md)
**Next Issue**: [#6 Testing & Quality Assurance](./06-testing-quality-assurance.md)
