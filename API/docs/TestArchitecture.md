## Testing Architecture

### Test Organization by Platform

```
API/tests/
├── Unit/
│   ├── Services/              # Shared core services
│   │   ├── AuthServiceTest.php        # Auth flow (shared)
│   │   ├── UserServiceTest.php        # User management
│   │   ├── PasswordServiceTest.php    # Password hashing (shared)
│   │   ├── PermissionServiceTest.php  # Role-based permissions (shared)
│   │   ├── RegionServiceTest.php      # Regions (shared)
│   │   └── Web/                       # WEB-SPECIFIC
│   │       ├── AuthControllerWebTest.php
│   │       └── CookieSessionTest.php
│   │
│   ├── DTO/                  # Shared DTOs
│   │   ├── RegisterUserDTOTest.php    # User registration
│   │   ├── LoginUserDTOTest.php       # Login credentials
│   │   ├── UpdateUserDTOTest.php      # User updates
│   │   └── ...                        # Other shared DTOs
│   │
│   ├── Repositories/         # Shared data access
│   │   ├── UserRepositoryTest.php
│   │   ├── AuthRepositoryTest.php
│   │   └── ...
│   │
│   ├── Http/                 # HTTP utilities
│   │   ├── ErrorTypeTest.php
│   │   └── ClientDetectorTest.php     # Platform detection
│   │
│   └── Platform/
│       ├── Web/              # WEB STACK TESTS
│       │   ├── AuthWeb.php            # Cookie auth flow
│       │   ├── SessionManagement.php  # Session lifecycle
│       │   ├── CookieHandling.php     # Cookie operations
│       │   └── BrowserRequests.php    # Browser scenarios
│       │
│       └── Mobile/           # MOBILE STACK TESTS
│           ├── AuthMobile.php         # Bearer token flow
│           ├── TokenRefresh.php       # Token rotation
│           ├── AuthorizationHeader.php # Bearer header handling
│           └── MobileRequests.php     # Mobile app scenarios
│
├── TestCase.php              # Base test class
├── bootstrap.php             # Test initialization
└── Fixtures/
    ├── database_schema.sql
    └── ...
```

### Test Coverage by Stack

#### Web Stack (Primary - 85%+ Coverage)
- **Authentication**: Cookie-based sessions
- **Tests**: 150+ tests
- **Focus Areas**:
  - HTTP-only cookie creation
  - Session token validation
  - Cookie expiry handling
  - CSRF protection
  - Browser request flows
  - Logout (cookie deletion)

#### Mobile Stack (Secondary - 75%+ Coverage)
- **Authentication**: Bearer tokens
- **Tests**: 50+ tests
- **Focus Areas**:
  - Bearer token generation
  - Authorization header parsing
  - Token refresh & rotation
  - Mobile request flows
  - Logout (token revocation)

### Shared Components (Both Stacks)
- User registration & management
- Password hashing & verification
- Role-based permissions
- DTOs and validation
- Database repositories
- Error handling

### Command Mapping

| Command | Scope | Tests | Focus |
|---------|-------|-------|-------|
| `composer run test:web` | Web stack only | ~150 | Cookies, sessions, browsers |
| `composer run test:mobile` | Mobile stack only | ~50 | Tokens, bearers, mobile |
| `composer test` | All tests | ~200 | Complete coverage |
| `composer run test:dto` | DTO validation | ~50 | Both platforms |
| `composer run test:services` | Service logic | ~80 | Both platforms |

### Extending Tests

**Adding a new web scenario**:
```php
// File: tests/Unit/Platform/Web/NewScenarioTest.php
namespace Tests\Unit\Platform\Web;

use Tests\TestCase;

class NewScenarioTest extends TestCase
{
    public function testWebSpecificBehavior(): void
    {
        // Test cookie-based flows
    }
}
```

**Adding a new mobile scenario**:
```php
// File: tests/Unit/Platform/Mobile/NewScenarioTest.php
namespace Tests\Unit\Platform\Mobile;

use Tests\TestCase;

class NewScenarioTest extends TestCase
{
    public function testMobileSpecificBehavior(): void
    {
        // Test bearer token flows
    }
}
```