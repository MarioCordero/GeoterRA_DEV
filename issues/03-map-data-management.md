# 🗺️ Issue #3: Map & Data Management

## 📋 Overview
Refactor map data and geothermal point management functionality into proper MVC structure with improved performance and maintainability.

## 🎯 Objectives
- Migrate map data logic to MapController
- Create robust models for map points and regions
- Implement efficient data retrieval and caching
- Add geospatial query capabilities

## 📂 Files to Migrate & Create

### **Current Files to Migrate**
- `map_data.inc.php` + `map_data_cont.php` → `MapController@getMapData`
- `map_data_model.php` → `MapPoint.php` model
- `get_regions.inc.php` → `MapController@getRegions` + `Region.php` model
- `add_approved_point.inc.php` → `MapController@addApprovedPoint`

### **New Files to Create**

#### **Controllers** (`/API/src/Controllers/`)
1. **MapController.php**

#### **Models** (`/API/src/Models/`)
1. **MapPoint.php**
2. **Region.php**

## 🔍 Detailed Tasks

### ✅ Task 1: MapController Implementation
**File**: `/API/src/Controllers/MapController.php`

#### **Methods to Implement**:
- [ ] `getMapData()` - Retrieve map points with filtering
- [ ] `getRegions()` - Get all available regions
- [ ] `getPointsByRegion()` - Get points filtered by region
- [ ] `addApprovedPoint()` - Add new approved geothermal point
- [ ] `updatePoint()` - Update existing point data
- [ ] `deletePoint()` - Remove point (admin only)
- [ ] `searchPoints()` - Search points by criteria

#### **Migration Sources**:
- Map data logic from `map_data.inc.php` and `map_data_cont.php`
- Region data from `get_regions.inc.php`
- Point addition from `add_approved_point.inc.php`

#### **Requirements**:
- [ ] Implement proper input validation
- [ ] Add pagination for large datasets
- [ ] Include caching for performance
- [ ] Add geospatial filtering capabilities
- [ ] Implement proper error handling

### ✅ Task 2: MapPoint Model Implementation
**File**: `/API/src/Models/MapPoint.php`

#### **Methods to Implement**:
- [ ] `getAll($filters = [])` - Get all points with optional filters
- [ ] `getByRegion($regionId)` - Get points by region ID
- [ ] `getById($id)` - Get single point by ID
- [ ] `create($pointData)` - Create new map point
- [ ] `update($id, $data)` - Update existing point
- [ ] `delete($id)` - Delete point
- [ ] `search($criteria)` - Search points by multiple criteria
- [ ] `getByCoordinates($lat, $lng, $radius)` - Get points within radius
- [ ] `getStatistics()` - Get statistical data about points

#### **Migration Sources**:
- Point data logic from `map_data_model.php`

#### **Requirements**:
- [ ] Use prepared statements for all queries
- [ ] Implement efficient geospatial queries
- [ ] Add data validation for coordinates
- [ ] Include point status management (active/inactive)
- [ ] Add audit trail for changes

### ✅ Task 3: Region Model Implementation
**File**: `/API/src/Models/Region.php`

#### **Methods to Implement**:
- [ ] `getAll()` - Get all regions
- [ ] `getById($id)` - Get region by ID
- [ ] `getWithPointCount()` - Get regions with point counts
- [ ] `create($regionData)` - Create new region
- [ ] `update($id, $data)` - Update region
- [ ] `delete($id)` - Delete region
- [ ] `getByName($name)` - Find region by name
- [ ] `getBounds($id)` - Get geographic bounds of region

#### **Migration Sources**:
- Region logic from `get_regions.inc.php`

#### **Requirements**:
- [ ] Use prepared statements for all queries
- [ ] Add region boundary data support
- [ ] Include point counting functionality
- [ ] Add region status management

## 🛣️ API Endpoints

### **Map Data Endpoints**
- `GET /api/map/data` → `MapController@getMapData`
  - Query params: `region`, `limit`, `offset`, `lat`, `lng`, `radius`
- `GET /api/map/data/{id}` → `MapController@getPointById`
- `GET /api/map/search` → `MapController@searchPoints`
  - Query params: `q`, `region`, `temperature`, `type`

### **Region Endpoints**
- `GET /api/map/regions` → `MapController@getRegions`
- `GET /api/map/regions/{id}` → `MapController@getRegionById`
- `GET /api/map/regions/{id}/points` → `MapController@getPointsByRegion`

### **Point Management Endpoints** (Admin only)
- `POST /api/map/points` → `MapController@addApprovedPoint`
- `PUT /api/map/points/{id}` → `MapController@updatePoint`
- `DELETE /api/map/points/{id}` → `MapController@deletePoint`

## 📊 Data Structure Requirements

### **MapPoint Data Structure**
```php
[
    'id' => int,
    'name' => string,
    'latitude' => float,
    'longitude' => float,
    'region_id' => int,
    'temperature' => float,
    'ph_level' => float,
    'thermal_sensation' => enum('hot', 'warm', 'cold'),
    'bubbling' => boolean,
    'owner' => string|null,
    'current_use' => string|null,
    'directions' => text|null,
    'photo_url' => string|null,
    'status' => enum('active', 'inactive', 'pending'),
    'created_at' => datetime,
    'updated_at' => datetime
]
```

### **Region Data Structure**
```php
[
    'id' => int,
    'name' => string,
    'code' => string,
    'bounds' => json, // Geographic bounds
    'point_count' => int,
    'description' => text|null,
    'status' => enum('active', 'inactive'),
    'created_at' => datetime,
    'updated_at' => datetime
]
```

## 🚀 Performance Optimizations

### **Database Optimizations**
- [ ] Add spatial indexes for coordinate-based queries
- [ ] Implement database query caching
- [ ] Optimize JOIN queries for region-point relationships
- [ ] Add proper indexes on frequently queried columns

### **Caching Strategy**
- [ ] Implement Redis/Memcached for frequently accessed data
- [ ] Cache region data (changes infrequently)
- [ ] Cache point counts per region
- [ ] Implement cache invalidation strategy

### **Response Optimization**
- [ ] Implement pagination for large datasets
- [ ] Add data compression for API responses
- [ ] Optimize JSON serialization
- [ ] Include ETag headers for caching

## 🗺️ Geospatial Features

### **Coordinate Validation**
- [ ] Validate latitude/longitude ranges
- [ ] Check coordinate format and precision
- [ ] Verify coordinates are within Costa Rica bounds

### **Distance Calculations**
- [ ] Implement haversine formula for distance calculation
- [ ] Add radius-based point searching
- [ ] Include nearest point functionality

### **Boundary Checking**
- [ ] Verify points are within region boundaries
- [ ] Add point-in-polygon checking for regions
- [ ] Implement region boundary validation

## 🧪 Testing Requirements

### **Unit Tests** (`/API/tests/Unit/`)
- [ ] `Models/MapPointTest.php` - Test map point model methods
- [ ] `Models/RegionTest.php` - Test region model methods

### **Integration Tests** (`/API/tests/Integration/`)
- [ ] `MapControllerTest.php` - Test map controller endpoints

### **Test Cases to Cover**:
- [ ] Point retrieval with various filters
- [ ] Region-based point filtering
- [ ] Coordinate validation
- [ ] Geospatial distance calculations
- [ ] Pagination functionality
- [ ] Cache behavior
- [ ] Admin-only operations

## 📊 Database Schema Requirements

### **Map Points Table**
```sql
-- Ensure proper structure exists
CREATE TABLE map_points (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    region_id INT NOT NULL,
    temperature DECIMAL(5, 2),
    ph_level DECIMAL(4, 2),
    thermal_sensation ENUM('hot', 'warm', 'cold'),
    bubbling BOOLEAN DEFAULT FALSE,
    owner VARCHAR(255),
    current_use TEXT,
    directions TEXT,
    photo_url VARCHAR(500),
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_coordinates (latitude, longitude),
    INDEX idx_region (region_id),
    INDEX idx_status (status),
    SPATIAL INDEX spatial_coords (coordinates),
    
    FOREIGN KEY (region_id) REFERENCES regions(id)
);
```

### **Regions Table**
```sql
CREATE TABLE regions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    bounds JSON,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_code (code),
    INDEX idx_status (status)
);
```

## 🔄 Migration Strategy

### **Phase 1: Create Models and Controllers**
1. Implement MapPoint model with full functionality
2. Implement Region model
3. Create MapController with all endpoints
4. Add proper validation and error handling

### **Phase 2: Performance Optimization**
1. Add database indexes
2. Implement caching layer
3. Optimize queries
4. Add pagination

### **Phase 3: Testing & Validation**
1. Create comprehensive test suite
2. Test with production-like data volumes
3. Validate coordinate calculations
4. Performance testing

### **Phase 4: Frontend Integration**
1. Update frontend to use new endpoints
2. Test map functionality thoroughly
3. Verify performance improvements

## 📝 Documentation Requirements
- [ ] API endpoint documentation with examples
- [ ] Geospatial query documentation
- [ ] Caching strategy documentation
- [ ] Performance optimization notes

## ⚠️ Migration Notes
- **Data Integrity** - Ensure all existing map points are preserved
- **Coordinate Precision** - Maintain coordinate precision during migration
- **Performance** - Monitor query performance with large datasets
- **Caching** - Implement gradual cache warming

## 🔗 Dependencies
- **Requires**: Issue #1 (Core Infrastructure) to be completed
- **Optional**: Issue #2 (Authentication) for admin-only endpoints
- **Blocks**: Issue #4 (Request Management) depends on map point data

## 📅 Estimated Time
**3-4 days**

## ✅ Definition of Done
- [ ] All map data endpoints working correctly
- [ ] Geospatial queries optimized and accurate
- [ ] Caching implemented and functional
- [ ] Performance improvements measurable
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Frontend integration successful

## 🚨 Blockers & Risks
- Large datasets could cause performance issues
- Coordinate precision must be maintained
- Geospatial queries need proper indexing
- Cache invalidation strategy is critical

---
**Previous Issue**: [#2 Authentication & Session Management](./02-authentication-session-management.md)
**Next Issue**: [#4 Request Management System](./04-request-management-system.md)
