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
    // Leemos las variables de entorno (GitHub Actions) o usamos los defaults (Local)
    // Nota: Es mejor usar 127.0.0.1 en lugar de 'localhost' para forzar conexión TCP y evitar el error 2002
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $port = getenv('DB_PORT') ?: 3306;
    $user = getenv('DB_USER') ?: 'mario';
    $password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '2003';
    
    // Nombres de las bases de datos
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
    } catch (\PDOException $e) {
        echo "[✗] Failed to connect to test database: " . $e->getMessage() . "\n";
        echo "Please ensure test database exists: CREATE DATABASE {$testDbName};\n";
        exit(1);
    }
    
    // Copy schema from production to test database
    copySchemaFromProduction($prodPdo, $testPdo, $prodDbName, $testDbName);
    
    return $testPdo;
}

/**
 * Copy database schema from production to test database
 * Copies: Tables, columns, indexes, foreign keys, constraints
 * Does NOT copy: Data (starts empty for each test)
 */
function copySchemaFromProduction(\PDO $prodPdo, \PDO $testPdo, string $prodDb, string $testDb): void {
    try {
        // Step 1: Drop all existing test tables
        echo "\n[*] Resetting test database schema...\n";
        $tables = $testPdo->query("
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE()
        ")->fetchAll(\PDO::FETCH_COLUMN);
        
        if (!empty($tables)) {
            $testPdo->exec('SET FOREIGN_KEY_CHECKS=0');
            foreach ($tables as $table) {
                $testPdo->exec("DROP TABLE IF EXISTS `{$table}`");
                echo "    [✓] Dropped table: {$table}\n";
            }
            $testPdo->exec('SET FOREIGN_KEY_CHECKS=1');
        }
        
        // Step 2: Get list of tables from production
        $productionTables = $prodPdo->query("
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = '{$prodDb}'
            ORDER BY TABLE_NAME
        ")->fetchAll(\PDO::FETCH_COLUMN);
        
        if (empty($productionTables)) {
            echo "[!] Warning: No tables found in production database '{$prodDb}'\n";
            return;
        }
        
        echo "[*] Copying " . count($productionTables) . " tables from production...\n";
        
        // Step 3: For each table, copy CREATE TABLE statement
        $testPdo->exec('SET FOREIGN_KEY_CHECKS=0');
        
        foreach ($productionTables as $table) {
            // Get CREATE TABLE statement from production
            $createTableResult = $prodPdo->query("SHOW CREATE TABLE `{$table}`")->fetch();
            $createTableSql = $createTableResult['Create Table'];
            
            // Replace database name references
            $createTableSql = str_replace(
                "CREATE TABLE `{$table}`",
                "CREATE TABLE IF NOT EXISTS `{$table}`",
                $createTableSql
            );
            
            // Execute CREATE TABLE in test database
            $testPdo->exec($createTableSql);
            echo "    [✓] Copied table: {$table}\n";
        }
        
        $testPdo->exec('SET FOREIGN_KEY_CHECKS=1');
        
        echo "[✓] Schema successfully copied from production database\n";
        
    } catch (\PDOException $e) {
        echo "[✗] Failed to copy schema: " . $e->getMessage() . "\n";
        echo "SQL State: " . $e->getCode() . "\n";
        exit(1);
    }
}

// Store database connection in global state for tests
$_SERVER['TEST_DATABASE'] = initializeTestDatabase();
?>