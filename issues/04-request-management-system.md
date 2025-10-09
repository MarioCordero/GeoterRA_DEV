# 📋 Issue #4: Request Management System

## 📋 Overview
Refactor the request management system into proper MVC structure with improved CRUD operations, status tracking, and user management.

## 🎯 Objectives
- Migrate request logic to RequestController
- Create robust Request model with full lifecycle management
- Implement proper status tracking and workflow
- Add comprehensive request management features

## 📂 Files to Migrate & Create

### **Current Files to Migrate**
- `request.inc.php` + `request_cont.php` → `RequestController@createRequest`
- `get_request.inc.php` + `get_request_cont.php` → `RequestController@getRequest`
- `get_all_requests.inc.php` → `RequestController@getAllRequests`
- `delete_request.inc.php` → `RequestController@deleteRequest`
- `request_model.inc.php` + `get_request_model.inc.php` → `Request.php` model

### **New Files to Create**

#### **Controllers** (`/API/src/Controllers/`)
1. **RequestController.php**

#### **Models** (`/API/src/Models/`)
1. **Request.php**

## 🔍 Detailed Tasks

### ✅ Task 1: RequestController Implementation
**File**: `/API/src/Controllers/RequestController.php`

#### **Methods to Implement**:
- [ ] `createRequest()` - Submit new geothermal analysis request
- [ ] `getAllRequests()` - Get requests (with filtering and pagination)
- [ ] `getRequest($id)` - Get single request by ID
- [ ] `updateRequest($id)` - Update request data
- [ ] `deleteRequest($id)` - Delete request
- [ ] `updateRequestStatus($id, $status)` - Change request status
- [ ] `getUserRequests($userId)` - Get requests by user
- [ ] `getRequestsByStatus($status)` - Get requests by status
- [ ] `approveRequest($id)` - Approve request (admin only)
- [ ] `rejectRequest($id, $reason)` - Reject request (admin only)

#### **Migration Sources**:
- Request creation from `request.inc.php` and `request_cont.php`
- Single request retrieval from `get_request.inc.php` and `get_request_cont.php`
- Multiple requests from `get_all_requests.inc.php`
- Request deletion from `delete_request.inc.php`

#### **Requirements**:
- [ ] Implement proper authentication checks
- [ ] Add input validation and sanitization
- [ ] Include file upload handling for photos
- [ ] Add GPS coordinate validation
- [ ] Implement request workflow management
- [ ] Add audit logging for status changes

### ✅ Task 2: Request Model Implementation
**File**: `/API/src/Models/Request.php`

#### **Methods to Implement**:
- [ ] `create($requestData)` - Create new request
- [ ] `getAll($filters = [], $pagination = [])` - Get all requests with filters
- [ ] `getById($id)` - Get request by ID
- [ ] `getByUser($userId)` - Get requests by user ID
- [ ] `getByStatus($status)` - Get requests by status
- [ ] `update($id, $data)` - Update request data
- [ ] `updateStatus($id, $status, $reason = null)` - Update request status
- [ ] `delete($id)` - Delete request
- [ ] `getStatistics()` - Get request statistics
- [ ] `getRecentRequests($limit)` - Get recent requests
- [ ] `searchRequests($criteria)` - Search requests

#### **Migration Sources**:
- Request data logic from `request_model.inc.php`
- Request retrieval from `get_request_model.inc.php`

#### **Requirements**:
- [ ] Use prepared statements for all queries
- [ ] Implement proper data validation
- [ ] Add status transition validation
- [ ] Include user permission checking
- [ ] Add comprehensive logging

## 🛣️ API Endpoints

### **Request Management Endpoints**
- `POST /api/requests` → `RequestController@createRequest`
- `GET /api/requests` → `RequestController@getAllRequests`
  - Query params: `status`, `user_id`, `limit`, `offset`, `date_from`, `date_to`
- `GET /api/requests/{id}` → `RequestController@getRequest`
- `PUT /api/requests/{id}` → `RequestController@updateRequest`
- `DELETE /api/requests/{id}` → `RequestController@deleteRequest`

### **User-Specific Endpoints**
- `GET /api/user/requests` → `RequestController@getUserRequests`

### **Admin-Only Endpoints**
- `PUT /api/requests/{id}/status` → `RequestController@updateRequestStatus`
- `POST /api/requests/{id}/approve` → `RequestController@approveRequest`
- `POST /api/requests/{id}/reject` → `RequestController@rejectRequest`
- `GET /api/admin/requests/statistics` → `RequestController@getStatistics`

## 📊 Request Data Structure

### **Request Data Model**
```php
[
    'id' => int,
    'user_id' => int,
    'point_name' => string,
    'latitude' => float,
    'longitude' => float,
    'contact_number' => string,
    'date_submitted' => date,
    'thermal_sensation' => enum('hot', 'warm', 'cold'),
    'owner' => string|null,
    'current_use' => string|null,
    'bubbling' => boolean,
    'directions' => text|null,
    'photo_path' => string|null,
    'status' => enum('pending', 'in_review', 'approved', 'rejected', 'completed'),
    'admin_notes' => text|null,
    'rejection_reason' => text|null,
    'approved_by' => int|null,
    'approved_at' => datetime|null,
    'created_at' => datetime,
    'updated_at' => datetime
]
```

### **Request Status Workflow**
```
pending → in_review → approved → completed
    ↓         ↓
  rejected  rejected
```

## 🔄 Request Workflow Management

### **Status Transitions**
- [ ] **pending** → **in_review** (when admin starts reviewing)
- [ ] **in_review** → **approved** (when request is approved)
- [ ] **in_review** → **rejected** (when request is rejected)
- [ ] **approved** → **completed** (when analysis is complete and point is added)
- [ ] **pending/in_review** → **rejected** (can be rejected at any stage)

### **Validation Rules**
- [ ] Only admins can change status to 'in_review', 'approved', or 'rejected'
- [ ] Users can only create requests (status = 'pending')
- [ ] Rejected requests cannot be modified
- [ ] Completed requests are read-only

### **Notifications** (Future enhancement)
- [ ] Email user when status changes
- [ ] Notify admins of new requests
- [ ] Send reminder for pending reviews

## 📤 File Upload Handling

### **Photo Upload Requirements**
- [ ] Support common image formats (JPEG, PNG, GIF)
- [ ] Maximum file size validation (e.g., 5MB)
- [ ] Image compression and optimization
- [ ] Secure file storage with unique naming
- [ ] EXIF data extraction for GPS coordinates
- [ ] Malware scanning for uploaded files

### **GPS Coordinate Extraction**
- [ ] Extract GPS coordinates from photo EXIF data
- [ ] Validate extracted coordinates
- [ ] Use as fallback if manual coordinates not provided
- [ ] Handle cases where EXIF data is missing

## 🧪 Testing Requirements

### **Unit Tests** (`/API/tests/Unit/`)
- [ ] `Models/RequestTest.php` - Test request model methods

### **Integration Tests** (`/API/tests/Integration/`)
- [ ] `RequestControllerTest.php` - Test request controller endpoints

### **Test Cases to Cover**:
- [ ] Request creation with valid data
- [ ] Request creation with invalid data
- [ ] Status transition validation
- [ ] User permission checking
- [ ] File upload handling
- [ ] GPS coordinate validation
- [ ] Pagination and filtering
- [ ] Admin-only operations

## 📊 Database Schema Requirements

### **Requests Table**
```sql
CREATE TABLE requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    point_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_number VARCHAR(20) NOT NULL,
    date_submitted DATE NOT NULL,
    thermal_sensation ENUM('hot', 'warm', 'cold') NOT NULL,
    owner VARCHAR(255),
    current_use TEXT,
    bubbling BOOLEAN DEFAULT FALSE,
    directions TEXT,
    photo_path VARCHAR(500),
    status ENUM('pending', 'in_review', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    admin_notes TEXT,
    rejection_reason TEXT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_date_submitted (date_submitted),
    INDEX idx_coordinates (latitude, longitude),
    INDEX idx_approved_by (approved_by),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### **Request Status History Table** (for audit trail)
```sql
CREATE TABLE request_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    old_status ENUM('pending', 'in_review', 'approved', 'rejected', 'completed'),
    new_status ENUM('pending', 'in_review', 'approved', 'rejected', 'completed') NOT NULL,
    changed_by INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_request_id (request_id),
    INDEX idx_changed_by (changed_by),
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT
);
```

## 🔒 Security & Permissions

### **Access Control**
- [ ] Users can only see their own requests
- [ ] Admins can see all requests
- [ ] Users can only create and update their pending requests
- [ ] Only admins can change request status
- [ ] Only admins can approve/reject requests

### **Data Validation**
- [ ] Validate GPS coordinates are within Costa Rica
- [ ] Validate phone number format
- [ ] Sanitize all text inputs
- [ ] Validate file uploads thoroughly
- [ ] Check file size and type restrictions

### **Audit Logging**
- [ ] Log all status changes
- [ ] Track who made changes and when
- [ ] Record IP addresses for sensitive operations
- [ ] Log file upload activities

## 🚀 Performance Optimizations

### **Database Optimizations**
- [ ] Add proper indexes for frequently queried columns
- [ ] Optimize JOIN queries with users table
- [ ] Implement query caching for statistics
- [ ] Add database connection pooling

### **Caching Strategy**
- [ ] Cache request statistics
- [ ] Cache user request counts
- [ ] Implement cache invalidation on status changes

### **File Handling**
- [ ] Implement efficient file storage
- [ ] Add CDN support for image serving
- [ ] Optimize image compression
- [ ] Implement background processing for large files

## 🔄 Migration Strategy

### **Phase 1: Core Implementation**
1. Create Request model with all CRUD operations
2. Implement RequestController with all endpoints
3. Add proper validation and security
4. Test basic functionality

### **Phase 2: Advanced Features**
1. Implement status workflow management
2. Add file upload handling
3. Create admin approval system
4. Add audit logging

### **Phase 3: Testing & Optimization**
1. Create comprehensive test suite
2. Performance testing with large datasets
3. Security testing
4. File upload testing

### **Phase 4: Frontend Integration**
1. Update frontend to use new endpoints
2. Test request submission flow
3. Test admin approval workflow
4. Monitor performance

## 📝 Documentation Requirements
- [ ] API endpoint documentation with examples
- [ ] Request workflow documentation
- [ ] File upload guidelines
- [ ] Admin interface documentation

## ⚠️ Migration Notes
- **Data Preservation** - Ensure all existing requests are migrated correctly
- **Status Mapping** - Map old status values to new enum values
- **File Paths** - Update file paths to new storage structure
- **User Permissions** - Verify user access rights are preserved

## 🔗 Dependencies
- **Requires**: Issue #1 (Core Infrastructure) to be completed
- **Requires**: Issue #2 (Authentication) for user management
- **Optional**: Issue #3 (Map Data) for coordinate validation
- **Blocks**: Admin interface development

## 📅 Estimated Time
**4-5 days**

## ✅ Definition of Done
- [ ] All request endpoints working correctly
- [ ] Status workflow properly implemented
- [ ] File upload system functional
- [ ] Admin approval system working
- [ ] All security measures in place
- [ ] Comprehensive tests passing
- [ ] Documentation complete
- [ ] Frontend integration successful

## 🚨 Blockers & Risks
- File upload security could pose risks
- Large file handling might affect performance
- Status workflow must be bulletproof
- Data migration requires careful validation

---
**Previous Issue**: [#3 Map & Data Management](./03-map-data-management.md)
**Next Issue**: [#5 Middleware & Security](./05-middleware-security.md)
