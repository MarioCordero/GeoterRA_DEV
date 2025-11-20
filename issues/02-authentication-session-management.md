# 🔐 Issue #2: Authentication & Session Management

## 📋 Overview
Refactor the authentication and session management system into proper MVC structure with improved security and maintainability.

## 🎯 Objectives
- Migrate authentication logic to AuthController
- Implement secure session management
- Create user management system
- Establish proper security practices

## 📂 Files to Migrate & Create

### **Current Files to Migrate**
- `login.inc.php` → `AuthController@login`
- `register.inc.php` + `register_cont.php` → `AuthController@register`
- `logout.php` → `AuthController@logout`
- `check_session.php` → `SessionController@checkSession`
- `user_info.php` → `UserController@getUserInfo`
- `login_model.inc.php` + `register_model.inc.php` → `User.php` model
- `session_token_test.php` + `test_session.php` → Session management logic

### **New Files to Create**

#### **Controllers** (`/API/src/Controllers/`)
1. **AuthController.php**
2. **SessionController.php**
3. **UserController.php**

#### **Models** (`/API/src/Models/`)
1. **User.php**
2. **Session.php**

## 🔍 Detailed Tasks

### ✅ Task 1: AuthController Implementation
**File**: `/API/src/Controllers/AuthController.php`

#### **Methods to Implement**:
- [ ] `login()` - User authentication
- [ ] `register()` - User registration
- [ ] `logout()` - User logout
- [ ] `validateCredentials()` - Credential validation helper

#### **Migration Sources**:
- Login logic from `login.inc.php`
- Registration logic from `register.inc.php` and `register_cont.php`
- Logout logic from `logout.php`

#### **Requirements**:
- [ ] Implement proper password hashing (bcrypt/Argon2)
- [ ] Add input validation and sanitization
- [ ] Include rate limiting for login attempts
- [ ] Generate secure session tokens
- [ ] Add CSRF protection

### ✅ Task 2: SessionController Implementation
**File**: `/API/src/Controllers/SessionController.php`

#### **Methods to Implement**:
- [ ] `checkSession()` - Validate active session
- [ ] `refreshToken()` - Refresh session token
- [ ] `validateToken()` - Token validation
- [ ] `destroySession()` - Session cleanup

#### **Migration Sources**:
- Session checking logic from `check_session.php`
- Token testing logic from `session_token_test.php`
- Session validation from `test_session.php`

#### **Requirements**:
- [ ] Implement secure token generation
- [ ] Add session timeout handling
- [ ] Include session hijacking prevention
- [ ] Add token rotation mechanism

### ✅ Task 3: UserController Implementation
**File**: `/API/src/Controllers/UserController.php`

#### **Methods to Implement**:
- [ ] `getUserInfo()` - Get user profile information
- [ ] `updateProfile()` - Update user profile
- [ ] `changePassword()` - Password change functionality
- [ ] `deleteAccount()` - Account deletion

#### **Migration Sources**:
- User info logic from `user_info.php`

#### **Requirements**:
- [ ] Ensure proper authentication checks
- [ ] Add input validation for profile updates
- [ ] Implement password change security
- [ ] Include audit logging

### ✅ Task 4: User Model Implementation
**File**: `/API/src/Models/User.php`

#### **Methods to Implement**:
- [ ] `authenticate($email, $password)` - User authentication
- [ ] `create($userData)` - Create new user
- [ ] `findById($id)` - Find user by ID
- [ ] `findByEmail($email)` - Find user by email
- [ ] `updateProfile($id, $data)` - Update user profile
- [ ] `changePassword($id, $newPassword)` - Change password
- [ ] `delete($id)` - Delete user account

#### **Migration Sources**:
- Authentication logic from `login_model.inc.php`
- Registration logic from `register_model.inc.php`

#### **Requirements**:
- [ ] Use prepared statements for all queries
- [ ] Implement proper password hashing
- [ ] Add email uniqueness validation
- [ ] Include user status management (active/inactive)

### ✅ Task 5: Session Model Implementation
**File**: `/API/src/Models/Session.php`

#### **Methods to Implement**:
- [ ] `create($userId, $token)` - Create new session
- [ ] `validate($token)` - Validate session token
- [ ] `refresh($token)` - Refresh session
- [ ] `destroy($token)` - Delete session
- [ ] `cleanup()` - Remove expired sessions
- [ ] `getUserByToken($token)` - Get user by session token

#### **Requirements**:
- [ ] Generate cryptographically secure tokens
- [ ] Implement session expiration
- [ ] Add IP address validation
- [ ] Include user agent checking
- [ ] Store session metadata

## 🛣️ API Endpoints

### **Authentication Endpoints**
- `POST /api/auth/login` → `AuthController@login`
- `POST /api/auth/register` → `AuthController@register`
- `POST /api/auth/logout` → `AuthController@logout`

### **Session Endpoints**
- `GET /api/session/check` → `SessionController@checkSession`
- `POST /api/session/refresh` → `SessionController@refreshToken`

### **User Endpoints**
- `GET /api/user/info` → `UserController@getUserInfo`
- `PUT /api/user/profile` → `UserController@updateProfile`
- `PUT /api/user/password` → `UserController@changePassword`

## 🔒 Security Requirements

### **Authentication Security**
- [ ] Implement password complexity requirements
- [ ] Add account lockout after failed attempts
- [ ] Use secure password hashing (bcrypt with cost 12+)
- [ ] Implement CSRF token validation
- [ ] Add rate limiting on login endpoint

### **Session Security**
- [ ] Generate cryptographically secure session tokens
- [ ] Implement session token rotation
- [ ] Add session timeout (idle and absolute)
- [ ] Validate IP address consistency
- [ ] Check user agent consistency
- [ ] Store session data securely

### **General Security**
- [ ] Sanitize all input data
- [ ] Use prepared statements exclusively
- [ ] Implement proper error handling (no information leakage)
- [ ] Add security headers
- [ ] Log security events

## 🧪 Testing Requirements

### **Unit Tests** (`/API/tests/Unit/`)
- [ ] `Models/UserTest.php` - Test user model methods
- [ ] `Models/SessionTest.php` - Test session model methods

### **Integration Tests** (`/API/tests/Integration/`)
- [ ] `AuthControllerTest.php` - Test authentication endpoints
- [ ] `SessionControllerTest.php` - Test session endpoints
- [ ] `UserControllerTest.php` - Test user endpoints

### **Test Cases to Cover**:
- [ ] Valid login/registration scenarios
- [ ] Invalid credential handling
- [ ] Session token validation
- [ ] Session expiration
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Password security

## 📊 Database Schema Requirements

### **Users Table** (if modifications needed)
```sql
-- Ensure these columns exist with proper constraints
- id (PRIMARY KEY)
- email (UNIQUE, NOT NULL)
- password_hash (NOT NULL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- status (ENUM: active, inactive, suspended)
- last_login (TIMESTAMP)
```

### **Sessions Table** (create if doesn't exist)
```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔄 Migration Strategy

### **Phase 1: Create New Components**
1. Create controllers and models
2. Implement authentication logic
3. Set up session management
4. Add security measures

### **Phase 2: Parallel Testing**
1. Test new endpoints alongside old ones
2. Verify functionality matches exactly
3. Test security improvements
4. Performance comparison

### **Phase 3: Frontend Migration**
1. Update frontend to use new endpoints
2. Test thoroughly in staging
3. Monitor for issues

### **Phase 4: Cleanup**
1. Remove old authentication files
2. Update documentation
3. Deploy to production

## 📝 Documentation Requirements
- [ ] API endpoint documentation with examples
- [ ] Authentication flow diagrams
- [ ] Security implementation details
- [ ] Migration guide for frontend developers

## ⚠️ Migration Notes
- **Preserve existing user accounts** - ensure password hashes remain compatible
- **Session compatibility** - existing sessions should continue working during transition
- **Database changes** - run migration scripts carefully
- **Security testing** - thorough security audit required

## 🔗 Dependencies
- **Requires**: Issue #1 (Core Infrastructure) to be completed
- **Blocks**: Issues #3, #4, #5 (need authentication for protected endpoints)

## 📅 Estimated Time
**4-5 days**

## ✅ Definition of Done
- [ ] All authentication endpoints working and secure
- [ ] Session management properly implemented
- [ ] User management system functional
- [ ] All security measures in place
- [ ] Comprehensive tests passing
- [ ] Documentation complete
- [ ] Migration guide ready

## 🚨 Blockers & Risks
- Existing user passwords must remain accessible
- Session tokens must maintain compatibility during transition
- Database schema changes could affect existing data
- Security changes might break frontend integration

---
**Previous Issue**: [#1 Project Setup & Core Infrastructure](./01-project-setup-core-infrastructure.md)
**Next Issue**: [#3 Map & Data Management](./03-map-data-management.md)
