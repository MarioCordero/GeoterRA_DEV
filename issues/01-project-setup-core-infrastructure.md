# 🚀 Issue #1: Project Setup & Core Infrastructure

## 📋 Overview
Set up the foundational structure for the MVC refactoring, including Composer configuration and core infrastructure classes.

## 🎯 Objectives
- Initialize Composer project with proper autoloading
- Create base classes for MVC architecture
- Set up configuration management system
- Establish security headers and URL rewriting

## 📂 Files to Create

### **Phase 1.1: Initialize Composer Project**
**Location**: `/API/`

#### **composer.json**
```json
{
    "name": "geoterra/api",
    "description": "GeoterRA API with MVC architecture",
    "type": "project",
    "require": {
        "php": ">=7.4",
        "ext-pdo": "*",
        "ext-json": "*"
    },
    "require-dev": {
        "phpunit/phpunit": "^9.0",
        "squizlabs/php_codesniffer": "^3.6"
    },
    "autoload": {
        "psr-4": {
            "GeoterRA\\": "src/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "GeoterRA\\Tests\\": "tests/"
        }
    }
}
```

#### **.htaccess**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

### **Phase 1.2: Core Classes**
**Location**: `/API/src/Core/`

#### **Files to Create**:
1. **Database.php** - Database connection singleton (migrate from `dbhandler.inc.php`)
2. **Controller.php** - Base controller with common functionality
3. **Model.php** - Base model with CRUD operations
4. **Response.php** - Standardized API response handler
5. **Router.php** - URL routing system with middleware support
6. **Validator.php** - Input validation utilities
7. **Middleware.php** - Base middleware class

### **Phase 1.3: Configuration Files**
**Location**: `/API/config/`

#### **Files to Create**:
1. **database.php** - Database configuration (migrate from `dbhandler.inc.php`)
2. **cors.php** - CORS configuration (migrate from `cors.inc.php`)
3. **session.php** - Session configuration (migrate from `conf_sess.inc.php`)
4. **app.php** - General application settings

## 🔍 Detailed Tasks

### ✅ Task 1: Composer Setup
- [ ] Create `composer.json` with PSR-4 autoloading
- [ ] Set up development dependencies (PHPUnit, PHP CodeSniffer)
- [ ] Run `composer install` to initialize project
- [ ] Create `.gitignore` for `vendor/` directory

### ✅ Task 2: URL Rewriting & Security
- [ ] Create `.htaccess` with URL rewriting rules
- [ ] Add security headers for XSS, CSRF, and clickjacking protection
- [ ] Test URL rewriting works correctly

### ✅ Task 3: Database Core Class
- [ ] Create `src/Core/Database.php`
- [ ] Implement singleton pattern for connection management
- [ ] Migrate database connection logic from `dbhandler.inc.php`
- [ ] Add PDO prepared statement helpers
- [ ] Implement connection pooling if needed

### ✅ Task 4: Base Controller Class
- [ ] Create `src/Core/Controller.php`
- [ ] Add request data retrieval methods
- [ ] Implement response formatting helpers
- [ ] Add authentication check methods
- [ ] Include error handling utilities

### ✅ Task 5: Base Model Class
- [ ] Create `src/Core/Model.php`
- [ ] Add database connection access
- [ ] Implement common CRUD operation methods
- [ ] Add data validation helpers
- [ ] Include query builder utilities

### ✅ Task 6: Response Handler
- [ ] Create `src/Core/Response.php`
- [ ] Implement standardized JSON response formats
- [ ] Add error code mapping
- [ ] Include success/failure response templates
- [ ] Add HTTP status code handling

### ✅ Task 7: Router System
- [ ] Create `src/Core/Router.php`
- [ ] Implement URL parsing and route matching
- [ ] Add support for HTTP methods (GET, POST, PUT, DELETE)
- [ ] Include middleware pipeline support
- [ ] Add parameter extraction for dynamic routes

### ✅ Task 8: Input Validator
- [ ] Create `src/Core/Validator.php`
- [ ] Add common validation rules (email, phone, required, etc.)
- [ ] Implement sanitization methods
- [ ] Add custom validation rule support
- [ ] Include error message formatting

### ✅ Task 9: Middleware Base
- [ ] Create `src/Core/Middleware.php`
- [ ] Define middleware interface
- [ ] Add execution pipeline methods
- [ ] Include context passing utilities

### ✅ Task 10: Configuration Management
- [ ] Create configuration files in `/API/config/`
- [ ] Migrate database settings from `dbhandler.inc.php`
- [ ] Migrate CORS settings from `cors.inc.php`
- [ ] Migrate session settings from `conf_sess.inc.php`
- [ ] Add environment-based configuration loading

## 🧪 Testing Requirements
- [ ] Test Composer autoloading works correctly
- [ ] Verify URL rewriting functions properly
- [ ] Test database connection establishment
- [ ] Validate configuration loading
- [ ] Test base classes can be extended properly

## 📝 Documentation
- [ ] Document PSR-4 namespace structure
- [ ] Create setup instructions for development environment
- [ ] Document configuration options
- [ ] Add code examples for extending base classes

## ⚠️ Migration Notes
- **DO NOT DELETE** old files yet - keep them for reference
- Ensure new Database class maintains same connection parameters
- Test compatibility with existing database queries
- Verify CORS headers work the same as before

## 🔗 Dependencies
- None (this is the foundation for all other issues)

## 📅 Estimated Time
**2-3 days**

## ✅ Definition of Done
- [ ] All core classes created and functional
- [ ] Composer autoloading working
- [ ] Configuration system operational
- [ ] URL rewriting and security headers active
- [ ] Database connection class successfully connects
- [ ] All tests pass
- [ ] Documentation complete

## 🚨 Blockers & Risks
- Database connection parameters must be preserved exactly
- CORS configuration must maintain existing functionality
- URL rewrite rules could affect existing endpoints during transition

---
**Next Issue**: [#2 Authentication & Session Management](./02-authentication-session-management.md)
