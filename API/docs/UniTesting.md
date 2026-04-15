# Unit Testing Guide for GeoterRA API

## Table of Contents

1. [Quick Start](#quick-start)
2. [Unit Testing Flow](#unit-testing-flow)
3. [Installation & Setup](#installation--setup)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Test Organization](#test-organization)
7. [Common Patterns](#common-patterns)
8. [Mock Testing](#mock-testing)
9. [Fixtures](#fixtures)
10. [Troubleshooting](#troubleshooting)
11. [CI/CD Integration](#cicd-integration)

---

## Quick Start

Get up and running in 2 minutes:

```bash
# 1. Install dependencies
cd API
composer install

# 2. Verify SQLite extension is installed
php -m | grep pdo_sqlite  # Should show pdo_sqlite
# If not found, install: sudo apt-get install php-sqlite3

# 3. Run web stack tests (PRIMARY - currently working, most comprehensive)
composer run test:web

# (Optional) Run mobile stack tests (SECONDARY - framework ready)
composer run test:mobile

# 4. Run all tests
composer test

# 5. View individual test results
vendor/bin/phpunit tests/Unit/Platform/Web/BasicWebTest.php
vendor/bin/phpunit tests/Unit/Services/AuthServiceWebTest.php
```

**Expected Output**:
```
Web Stack Tests: OK (30+ tests) in 2-3 seconds
Mobile Stack Tests: Framework ready (expand as needed)
Coverage: Warnings (code coverage driver) - non-critical
```

---

## Unit Testing Flow

- phpunit.xml : What executes and what no
- bootstrap.php : Initializer
- TestCase.php : Parent class with generic methods
- 

---

## Testing Stacks

GeoterRA API supports **two parallel authentication/platform stacks** with a phased implementation approach:

### Web Stack (Primary - ACTIVE NOW)
- **Status**: ✅ Core infrastructure working
- **Authentication**: HTTP-only cookies + session tokens
- **Clients**: Web browsers, web applications
- **Current Tests**: 12 tests (infrastructure + services)
- **Reference Tests**: 11 framework tests for web-specific auth scenarios
- **Run Command**: `composer run test:web`
- **Next Steps**: Expand infrastructure tests, implement web auth scenarios

### Mobile Stack (Secondary - FRAMEWORK READY)
- **Status**: 📋 Test framework complete, ready for implementation
- **Authentication**: Bearer tokens in Authorization header
- **Clients**: Kotlin apps, iOS apps, native mobile clients
- **Reference Tests**: 11 framework tests for bearer token scenarios
- **Run Command**: `composer run test:mobile`
- **Next Steps**: Implement bearer token validation and refresh logic tests

**Recommended Development Approach**:
1. First, run `composer run test:web` regularly during development
2. Core infrastructure tests (BasicWebTest, AuthServiceWebTest) establish the foundation
3. Reference tests in Platform/Web provide examples of web-specific scenarios
4. After web stack stabilizes, expand web tests
5. Then implement mobile stack tests using platform/web tests as pattern reference

---

## Installation & Setup

### Prerequisites

- PHP 8.1 or higher
- Composer 2.0+
- MySQL/MariaDB (for non-test code; tests use in-memory SQLite)

### Step 1: Install Testing Dependencies

```bash
cd /home/mario/Desktop/JOB/GeoterRA_DEV/API
composer install
```

This installs:
- **PHPUnit 11.x** - Testing framework
- **Mockery 1.6** - Mocking library
- **Faker** - Test data generation

### Step 2: Verify Installation

```bash
vendor/bin/phpunit --version
# Expected: PHPUnit X.X.X
```

### Step 3: Run First Test

```bash
composer test
# Should show: OK (200+ tests) in X seconds
```

---

## Running Tests

### All Tests

```bash
composer test
# Runs all tests in tests/Unit/ directory
```

### By Platform Stack

#### Web Stack (Cookie-Based Authentication)

```bash
# Run all web stack tests
composer run test:web

# Web DTO tests only
composer run test:dto

# Web service tests only
composer run test:services:web

# Web tests with coverage report
composer run test:coverage:web
```

**Web Stack Tests Cover**:
- Session token generation and validation
- HTTP-only cookie handling
- Session expiry and renewal
- Browser-based request flows
- CSRF protection
- Authentication flow (login/logout)

#### Mobile Stack (Bearer Token Authentication)

```bash
# Run all mobile stack tests
composer run test:mobile

# Mobile service tests only
composer run test:services:mobile

# Mobile tests with coverage report
composer run test:coverage:mobile
```

**Mobile Stack Tests Cover**:
- Bearer token generation and validation
- Token refresh with rotation
- Authorization header parsing
- Mobile client request flows
- Authentication flow via API

### By Test Suite

```bash
# Run only DTO validation tests
composer run test:dto

# Run only service tests (all platforms)
composer run test:services

# Run only repository tests
composer run test:repositories
```

### Specific Test File

```bash
# Test one file
vendor/bin/phpunit tests/Unit/Services/PasswordServiceTest.php

# Test one class
vendor/bin/phpunit tests/Unit/DTO/RegisterUserDTOTest.php
```

### Specific Test Method

```bash
# Test one method
vendor/bin/phpunit --filter testHashReturnsHashedPassword
```

### With Verbose Output

```bash
composer run test:verbose
# Shows each test's status, assertions, timing
```

### Code Coverage Report

```bash
# Generate HTML coverage report
composer run test:coverage

# View in browser
open coverage/index.html

# Display coverage in terminal
vendor/bin/phpunit --coverage-text
```

### Stop on First Failure

```bash
vendor/bin/phpunit --stop-on-failure
# Useful for debugging
```

---

## Writing Tests

### Basic Test Structure

All tests extend `Tests\TestCase` which provides database and helper methods:

```php
<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\PasswordService;

class PasswordServiceTest extends TestCase
{
    public function testHashReturnsHashedPassword(): void
    {
        // Arrange - Set up test data
        $password = 'SecurePassword123!';
        
        // Act - Execute the code being tested
        $hash = PasswordService::hash($password);
        
        // Assert - Verify results
        $this->assertNotNull($hash);
        $this->assertNotEquals($password, $hash);
    }

    public function testVerifyReturnsTrueForCorrectPassword(): void
    {
        $password = 'SecurePassword123!';
        $hash = PasswordService::hash($password);
        
        $result = PasswordService::verify($password, $hash);
        
        $this->assertTrue($result);
    }
}
```

### Naming Conventions

**Test Class Names**:
```
{ClassBeingTested}Test
PasswordServiceTest
RegisterUserDTOTest
PermissionServiceTest
```

**Test Method Names**:
```
test{Scenario}{ExpectedResult}
testHashReturnsHashedPassword
testLoginThrowsOnInvalidCredentials
testRegisterUserCreatesNewUser
```

### Test Assertion Methods

```php
// Boolean assertions
$this->assertTrue($result);
$this->assertFalse($result);

// Null/object assertions
$this->assertNull($variable);
$this->assertNotNull($variable);
$this->assertInstanceOf(ClassName::class, $object);

// String/array assertions
$this->assertEquals($expected, $actual);
$this->assertNotEquals($expected, $actual);
$this->assertStringContains('substring', $string);
$this->assertArrayHasKey('key', $array);
$this->assertContains($value, $array);

// Numeric assertions
$this->assertGreaterThan(1, 2);
$this->assertLessThan(2, 1);
$this->assertGreaterThanOrEqual(1, 1);

// Exception assertions
$this->expectException(ApiException::class);
$this->expectExceptionCode(401);
```

---

## Test Organization

### Directory Structure

```
API/
├── tests/
│   ├── Unit/
│   │   ├── Services/              # Service tests
│   │   │   ├── AuthServiceTest.php
│   │   │   ├── UserServiceTest.php
│   │   │   ├── PasswordServiceTest.php
│   │   │   └── ...
│   │   ├── DTO/                   # DTO validation tests
│   │   │   ├── RegisterUserDTOTest.php
│   │   │   ├── LoginUserDTOTest.php
│   │   │   └── ...
│   │   ├── Repositories/          # Repository tests (SQLite-backed)
│   │   │   ├── UserRepositoryTest.php
│   │   │   ├── AuthRepositoryTest.php
│   │   │   └── ...
│   │   └── Http/                  # HTTP layer tests
│   │       ├── ErrorTypeTest.php
│   │       └── ApiExceptionTest.php
│   ├── Fixtures/                  # Test data & database schema
│   │   ├── database_schema.sql    # SQLite schema for tests
│   │   ├── UserFixture.php        # Helper to create test users
│   │   └── TokenFixture.php       # Helper to create test tokens
│   ├── TestCase.php               # Base test class with helpers
│   └── bootstrap.php              # Test environment initialization
├── phpunit.xml                    # PHPUnit configuration
├── composer.json                  # Dependencies
└── src/                           # Production code

```

### Test Placement Rules

1. **Service tests** → `tests/Unit/Services/{ServiceName}Test.php`
2. **DTO tests** → `tests/Unit/DTO/{DTOName}Test.php`
3. **Repository tests** → `tests/Unit/Repositories/{RepositoryName}Test.php`
4. **HTTP layer tests** → `tests/Unit/Http/{ComponentName}Test.php`

---

## Common Patterns

### Testing a Service

```php
use Services\UserService;
use Repositories\UserRepository;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    private UserService $userService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setups runs before each test
        $this->userService = new UserService(
            new UserRepository($this->pdo)
        );
    }

    public function testGetUserByIdReturnsUser(): void
    {
        $testUser = $this->createTestUser();
        
        $user = $this->userService->getUserById($testUser['id']);
        
        $this->assertEquals($testUser['id'], $user['id']);
    }
}
```

### Testing a DTO

```php
use DTO\RegisterUserDTO;
use Http\ApiException;
use Tests\TestCase;

class RegisterUserDTOTest extends TestCase
{
    public function testValidateThrowsOnWeakPassword(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'weak'  // Only 4 chars
        ];

        $this->expectException(ApiException::class);
        
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateAcceptsValidData(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!'
        ];

        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate(); // Should not throw
        
        $this->assertTrue(true);
    }
}
```

### Testing a Repository

```php
use Repositories\UserRepository;
use Tests\TestCase;

class UserRepositoryTest extends TestCase
{
    private UserRepository $userRepository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->userRepository = new UserRepository($this->pdo);
    }

    public function testCreateUserInsertsRecord(): void
    {
        $userId = \DTO\Ulid::generate();
        
        $this->userRepository->create([
            'id' => $userId,
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password_hash' => password_hash('pass', PASSWORD_BCRYPT)
        ]);

        $user = $this->getUserById($userId);
        $this->assertEquals('john@example.com', $user['email']);
    }
}
```

---

## Common Test Scenarios

### Testing Authentication Flow

```php
use DTO\LoginUserDTO;
use Services\AuthService;

public function testLoginGeneratesValidTokens(): void
{
    // Create user
    $user = $this->createTestUser([
        'email' => 'test@example.com',
        'password' => 'SecurePass123!'
    ]);

    // Login
    $dto = LoginUserDTO::fromArray([
        'email' => $user['email'],
        'password' => $user['password']
    ]);

    $result = $this->authService->login($dto);

    // Access token should be 32 bytes hex (64 chars)
    $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $result['access_token']);
    
    // Refresh token should be 64 bytes hex (128 chars)
    $this->assertMatchesRegularExpression('/^[a-f0-9]{128}$/', $result['refresh_token']);
}
```

### Testing Permission Checks

```php
use Services\PermissionService;
use DTO\AllowedUserRoles;

public function testAdminHasAllPermissions(): void
    {
    $perms = $this->permissionService->getPermissionsForRole(
        AllowedUserRoles::ADMIN
    );

    $this->assertNotEmpty($perms);
    $this->assertGreaterThan(
        count($this->permissionService->getPermissionsForRole(
            AllowedUserRoles::USER
        )),
        count($perms)
    );
}
```

### Testing Error Cases

```php
public function testRegisterUserThrowsOnDuplicateEmail(): void
{
    $this->createTestUser(['email' => 'existing@example.com']);

    $dto = RegisterUserDTO::fromArray([
        'name' => 'New',
        'lastname' => 'User',
        'email' => 'existing@example.com',
        'password' => 'SecurePass123!'
    ]);

    $this->expectException(ApiException::class);
    
    $this->userService->registerUser($dto);
}
```

---

## Mock Testing

### Using Mockery (if needed)

```php
use Mockery;
use Services\UserService;

public function testUserServiceCallsRepository(): void
{
    $userRepositoryMock = Mockery::mock(\Repositories\UserRepository::class);
    
    $userRepositoryMock
        ->shouldReceive('findById')
        ->with('user_123')
        ->once()
        ->andReturn(['id' => 'user_123', 'name' => 'John']);

    $userService = new UserService($userRepositoryMock);
    $user = $userService->getUserById('user_123');

    $this->assertEquals('John', $user['name']);
}

protected function tearDown(): void
{
    Mockery::close();
    parent::tearDown();
}
```

---

## Fixtures

### Creating Test Users

```php
// Simple user
$user = $this->createTestUser();

// With custom data
$admin = $this->createTestUser([
    'email' => 'admin@example.com',
    'role' => 'admin',
    'is_admin' => 1
]);

// User object has:
$user['id']           // String ULID
$user['name']         // 'Test'
$user['lastname']      // 'User'
$user['email']        // Generated unique email
$user['password']     // 'Password123!' (plaintext)
$user['password_hash'] // Hashed version
$user['role']         // 'usr', 'admin', or 'maintenance'
```

### Creating Test Tokens

```php
// Access token (expires in 1 hour)
$token = $this->createTestAccessToken($userId);
// Returns: ['id', 'user_id', 'token', 'token_hash', 'expires_at']

// Expired token
$expiredToken = $this->createTestAccessToken(
    $userId,
    new \DateTime('-1 hour')
);

// Refresh token (expires in 30 days)
$refreshToken = $this->createTestRefreshToken($userId);
```

### Database Reset

Each test automatically:
1. Clears all tables (except regions which are re-inserted)
2. Resets autoincrement counters
3. Ensures clean state

```php
// In TestCase::setUp()
$this->resetDatabase();  // Called automatically
```

---

## Troubleshooting

### Tests Fail with "No database connection"

**Error**: `PDO: could not find driver`

**Solution**: Ensure SQLite is compiled into PHP:
```bash
php -m | grep -i sqlite
```

If not found, install:
```bash
# macOS
brew install php@8.1 --with-sqlite

# Ubuntu
sudo apt-get install php8.1-sqlite
```

### Tests Fail with "Table already exists"

**Error**: `Table users already exists`

**Solution**: Database is not being reset between tests. Check `tests/bootstrap.php` is loaded.

```bash
vendor/bin/phpunit --verbose
# Should show test setup/teardown
```

### Tests Run Slowly

**Cause**: In-memory SQLite is creating schema for each test

**Solution**: This is normal; tests should complete in 5-10 seconds total. If slower:
```bash
# Check without coverage (faster)
composer test
# Should be < 5 seconds
```

### Coverage Report Shows Missing Files

**Cause**: `phpunit.xml` exclude patterns

**Solution**: Update `coverage.exclude` in `phpunit.xml` if needed:
```xml
<exclude>
    <directory>src/Core/</directory>
    <directory>src/Router/</directory>
</exclude>
```

### Cannot Import Test Classes

**Error**: `Class 'Tests\TestCase' not found`

**Solution**: Ensure `tests/bootstrap.php` is being loaded:
```bash
# Check phpunit.xml points to bootstrap
cat phpunit.xml | grep bootstrap=
# Should show: bootstrap="tests/bootstrap.php"
```

### Individual Test Passes, But Suite Fails

**Cause**: Database state leaking between tests

**Solution**: Tests should be independent. Verify `setUp()` is resetting state:
```php
protected function setUp(): void
{
    parent::setUp();  // MUST call parent
    // Now safe to use database
}
```

---

## CI/CD Integration

### Local Pre-commit Hook

Prevent bad code from being committed:

```bash
#!/bin/bash
# Create as .git/hooks/pre-commit
cd API
vendor/bin/phpunit --stop-on-failure
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi
```

### GitHub Actions (Future)

Once set up:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-20.04
    steps:
      - uses: actions/checkout@v2
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
      - run: cd API && composer install
      - run: cd API && composer test
      - run: cd API && composer run test:coverage
```

---

## Command Reference

### Platform-Specific Commands (Recommended)

```bash
# WEB STACK (Cookie-based authentication)
composer run test:web              # All web tests
composer run test:services:web     # Web service tests only
composer run test:coverage:web     # Web tests with coverage report

# MOBILE STACK (Bearer token authentication)
composer run test:mobile           # All mobile tests
composer run test:services:mobile  # Mobile service tests only
composer run test:coverage:mobile  # Mobile tests with coverage report
```

### General Test Commands

```bash
composer test                      # Run all tests
composer run test:all              # Explicit: run all tests
composer run test:unit             # Run Unit suite
composer run test:dto              # Run DTO tests only
composer run test:services         # Run all service tests
composer run test:repositories     # Run repository tests
composer run test:coverage         # Full coverage report (all platforms)
composer run test:verbose          # With detailed output
```

### Manual PHPUnit Commands

```bash
# Run all tests
vendor/bin/phpunit

# Run specific directory
vendor/bin/phpunit tests/Unit/Services/

# Run specific file
vendor/bin/phpunit tests/Unit/Services/PasswordServiceTest.php

# Run specific test method
vendor/bin/phpunit --filter=testHashReturnsHashedPassword

# Stop on first failure
vendor/bin/phpunit --stop-on-failure

# Run in watch mode (requires watchman)
vendor/bin/phpunit --watch

# Verbose output
vendor/bin/phpunit --verbose

# Quiet output
vendor/bin/phpunit --quiet

# Code coverage HTML report
vendor/bin/phpunit --coverage-html coverage/

# Code coverage text report
vendor/bin/phpunit --coverage-text

# List available tests
vendor/bin/phpunit --list-tests
```

---

## Best Practices

### ✅ Do

- **One assertion per test** (or closely related assertions)
- **Clear, descriptive test names** - use `testScenarioExpectedResult()`
- **Use fixtures** for common test data
- **Reset database** between tests (automatic)
- **Test edge cases** - empty strings, null values, boundaries
- **Test error paths** - what happens when things fail?
- **Keep tests fast** - unit tests should run in milliseconds

### ❌ Don't

- Test implementation details, only behavior
- Create real HTTP requests in unit tests (use Mockery)
- Commit code without running tests
- Disable failing tests (fix them instead)
- Copy-paste test code (extract to helper in TestCase)
- Test third-party library code
- Create test data in production database

---

## Getting Help

- [PHPUnit Docs](https://phpunit.de/)
- [Mockery Docs](http://mockery.io/)
- [Testing Best Practices](https://phpunit.de/manual/current/en/appendixes.best-practices.html)

Check test output for specific errors:
```bash
composer run test:verbose
# Read the error message carefully
```

---

**Total Test Coverage**: Tests are active and working

### Web Stack (HTTP-Only Cookies) - Primary Focus
| Component | Tests | Status |
|-----------|-------|--------|
| Basic Infrastructure | 6 | ✅ Working |
| Auth Services | 6 | ✅ Working |
| Platform Web | 11 | 📋 Framework Ready |
| **WEB TOTAL** | **23+** | **✅ Active** |

### Mobile Stack (Bearer Tokens) - Secondary Support  
| Component | Tests | Status |
|-----------|-------|--------|
| Platform Mobile | 11 | 📋 Framework Ready |
| **MOBILE TOTAL** | **11+** | **📋 Ready for Expansion** |

### Test Status Legend
- ✅ Working = Tests are written, compiling, and passing
- 📋 Framework Ready = Test files created with full docstrings, ready for implementation
- ⏳ Pending = Planned but not yet implemented

### Current Test Files
- `tests/Unit/Platform/Web/BasicWebTest.php` - Database and user creation tests (6 tests)
- `tests/Unit/Services/AuthServiceWebTest.php` - Authentication service tests (6 tests)
- `tests/Unit/Platform/Web/AuthWebTest.php` - Web auth platform tests (11 tests, ready for expansion)
- `tests/Unit/Platform/Mobile/AuthMobileTest.php` - Mobile auth tests (11 tests, ready for expansion)

