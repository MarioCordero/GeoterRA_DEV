-- GeoterRA Test Database Schema
-- In-memory SQLite database for unit tests

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    lastname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'usr' NOT NULL CHECK(role IN ('admin', 'usr', 'maintenance')),
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    deleted_at DATETIME,
    CHECK((role = 'admin' AND is_admin = 1) OR role IN ('usr', 'maintenance'))
);

-- Access tokens table
CREATE TABLE IF NOT EXISTS access_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK(name IN ('Los Andes', 'Zona Sur', 'Pacifico', 'Zona Central', 'Araucanía', 'Los Lagos', 'Zona Austral')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Analysis requests table
CREATE TABLE IF NOT EXISTS analysis_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    region_id TEXT NOT NULL,
    region TEXT NOT NULL CHECK(region IN ('Los Andes', 'Zona Sur', 'Pacifico', 'Zona Central', 'Araucanía', 'Los Lagos', 'Zona Austral')),
    email TEXT NOT NULL,
    temperature_sensation TEXT NOT NULL CHECK(temperature_sensation IN ('mucho_frio', 'frio', 'templado', 'calor', 'mucho_calor')),
    latitude REAL NOT NULL CHECK(latitude >= -90 AND latitude <= 90),
    longitude REAL NOT NULL CHECK(longitude >= -180 AND longitude <= 180),
    additional_information TEXT,
    registered_manifestations TEXT,
    status TEXT DEFAULT 'pending' NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    deleted_at DATETIME,
    approved_by TEXT,
    approved_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Registered manifestations table
CREATE TABLE IF NOT EXISTS registered_manifestations (
    id TEXT PRIMARY KEY,
    analysis_request_id TEXT NOT NULL,
    manifestation_type TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_request_id) REFERENCES analysis_requests(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_access_tokens_user_id ON access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_revoked_at ON access_tokens(revoked_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_user_id ON analysis_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_region ON analysis_requests(region);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_status ON analysis_requests(status);