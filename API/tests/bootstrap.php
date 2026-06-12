<?php
declare(strict_types=1);

// Set error reporting to strict
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Set default timezone
date_default_timezone_set('UTC');

// Define base directory
define('BASE_DIR', dirname(__DIR__));
define('TESTS_DIR', dirname(__FILE__));

// Register PSR-4 autoloader
spl_autoload_register(function (string $class): void {
    // Try src/ namespace (production code)
    $baseDir = BASE_DIR . '/src/';
    $file = $baseDir . str_replace('\\', '/', $class) . '.php';
    
    if (file_exists($file)) {
        require_once $file;
        return;
    }
    
    // Try Tests/ namespace (test code)
    $baseDir = TESTS_DIR . '/';
    $file = $baseDir . str_replace('\\', '/', $class) . '.php';
    
    if (file_exists($file)) {
        require_once $file;
    }
});

/**
 * Initialize test database - copies schema from production
 */
function initializeTestDatabase(): \PDO {
    // Read the environment variables (GitHub Actions) or use the defaults (Local)
    // Note: It is better to use 127.0.0.1 instead of 'localhost' to force TCP connection and avoid error 2002
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $port = getenv('DB_PORT') ?: 3306;
    $user = getenv('DB_USER') ?: 'mario';
    $password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '2003';
    
    // Names of the databases
    $prodDbName = 'GeoterRA';
    $testDbName = 'GeoterRA_test';
    
    // Connect to production database (to read schema)
    $prodDsn = "mysql:host={$host};port={$port};dbname={$prodDbName};charset=utf8mb4";
    try {
        $prodPdo = new \PDO($prodDsn, $user, $password, [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ]);
        echo "[✓] Connected to production database: {$prodDbName}\n";
    } catch (\PDOException $e) {
        echo "[✗] Failed to connect to production database: " . $e->getMessage() . "\n";
        exit(1);
    }
    
    // Connect to test database
    $testDsn = "mysql:host={$host};port={$port};dbname={$testDbName};charset=utf8mb4";
    try {
        $testPdo = new \PDO($testDsn, $user, $password, [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ]);
        echo "[✓] Connected to test database: {$testDbName}\n";
    } catch (\PDOException $e) { // If not, create a test database
        if ($e->getCode() == 1049 || strpos($e->getMessage(), 'Unknown database') !== false) {
            echo "[!] Test database '{$testDbName}' not found. Attempting to create it automatically...\n";
            try {
                $serverDsn = "mysql:host={$host};port={$port};charset=utf8mb4";
                $serverPdo = new \PDO($serverDsn, $user, $password, [
                    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                ]);
                $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `{$testDbName}`");
                echo "[✓] Successfully created test database: {$testDbName}\n";
                
                // Retry connection to the newly created database
                $testPdo = new \PDO($testDsn, $user, $password, [
                    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                ]);
            } catch (\PDOException $createEx) {
                echo "[✗] Failed to create test database: " . $createEx->getMessage() . "\n";
                echo "Please ensure test database exists manually: CREATE DATABASE {$testDbName};\n";
                exit(1);
            }
        } else {
            echo "[✗] Failed to connect to test database: " . $e->getMessage() . "\n";
            exit(1);
        }
    }
    
    // Initialize schema from database_schema.sql
    loadTestSchema($testPdo);
    
    return $testPdo;
}

/**
 * Load database schema from fixtures
 * Does NOT copy data (starts empty for each test)
 */
function loadTestSchema(\PDO $testPdo): void {
    try {
        $schemaPath = dirname(__DIR__) . '/tests/Fixtures/database_schema.sql';
        if (!file_exists($schemaPath)) {
            echo "[!] Warning: Schema file not found at {$schemaPath}\n";
            return;
        }

        echo "\n[*] Loading test database schema from fixtures...\n";
        
        $sql = file_get_contents($schemaPath);
        
        // Execute the SQL dump
        $testPdo->exec($sql);
        
        echo "[✓] Schema successfully loaded\n";
        
    } catch (\PDOException $e) {
        echo "[✗] Failed to load schema: " . $e->getMessage() . "\n";
        echo "SQL State: " . $e->getCode() . "\n";
        exit(1);
    }
}

// Store database connection in global state for tests
$_SERVER['TEST_DATABASE'] = initializeTestDatabase();
?>