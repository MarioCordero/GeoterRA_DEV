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

// Ensure api-keys.php exists in config directory for tests
$apiKeysPath = BASE_DIR . '/config/api-keys.php';
if (!file_exists($apiKeysPath)) {
  @file_put_contents($apiKeysPath, "<?php\nreturn [\n  'web-secret-key-789' => 'web',\n  'android-key-123' => 'mobile',\n  'ios-key-456' => 'mobile',\n];\n");
}

if (session_status() === PHP_SESSION_NONE && PHP_SAPI !== 'cli') {
  session_start();
}

// Polyfill for getallheaders in CLI environment
if (!function_exists('getallheaders')) {
  function getallheaders()
  {
    return [];
  }
}

// Register PSR-4 autoloader
spl_autoload_register(
  function (string $class): void {
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
  }
);

/**
 * Initialize test database - copies schema from production
 */
function initializeTestDatabase(): PDO
{
  $configIniPath = BASE_DIR . '/config/config.ini';
  $iniConfig = file_exists($configIniPath) ? (parse_ini_file($configIniPath, true)['database'] ?? []) : [];

  // Read environment variables (GitHub Actions) or fallback to config.ini / defaults (Local)
  $host = getenv('DB_HOST') ?: ($iniConfig['host'] ?? '127.0.0.1');
  if ($host === 'localhost') $host = '127.0.0.1';
  $port = (int)(getenv('DB_PORT') ?: ($iniConfig['port'] ?? 3306));
  $user = getenv('DB_USER') ?: ($iniConfig['user'] ?? 'root');
  $password = getenv('DB_PASS') !== false ? (string)getenv('DB_PASS') : ($iniConfig['pass'] ?? '');

  $socket = getenv('DB_SOCKET') ?: ($iniConfig['unix_socket'] ?? null);

  if (!empty($socket)) {
    echo "[*] Configuración de DB - Socket: {$socket} | User: {$user}\n";
  } else {
    echo "[*] Configuración de DB - Host: {$host}:{$port} | User: {$user}\n";
  }

  // Names of the databases
  $prodDbName = 'GeoterRA';
  $testDbName = 'GeoterRA_test';

  // Connect to production database (to read schema)
  if (!empty($socket)) {
    $prodDsn = "mysql:unix_socket={$socket};dbname={$prodDbName};charset=utf8mb4";
  } else {
    $prodDsn = "mysql:host={$host};port={$port};dbname={$prodDbName};charset=utf8mb4";
  }

  try {
    $prodPdo = new PDO(
      $prodDsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      ]
    );
    echo "[✓] Connected to production database: {$prodDbName}\n";
  } catch (PDOException $e) {
    echo "[✗] Failed to connect to production database: " . $e->getMessage() . "\n";
    exit(1);
  }

  // Always drop and recreate test database to ensure clean schema load
  try {
    if (!empty($socket)) {
      $serverDsn = "mysql:unix_socket={$socket};charset=utf8mb4";
    } else {
      $serverDsn = "mysql:host={$host};port={$port};charset=utf8mb4";
    }

    $serverPdo = new PDO(
      $serverDsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      ]
    );
    $serverPdo->exec("DROP DATABASE IF EXISTS `{$testDbName}`");
    $serverPdo->exec("CREATE DATABASE `{$testDbName}`");

    if (!empty($socket)) {
      $testDsn = "mysql:unix_socket={$socket};dbname={$testDbName};charset=utf8mb4";
    } else {
      $testDsn = "mysql:host={$host};port={$port};dbname={$testDbName};charset=utf8mb4";
    }

    $testPdo = new PDO(
      $testDsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      ]
    );
    echo "[✓] Recreated and connected to test database: {$testDbName}\n";
  } catch (PDOException $e) {
    echo "[✗] Failed to recreate test database: " . $e->getMessage() . "\n";
    exit(1);
  }

  // Initialize schema and initial DML from the master GeoterRA.sql dump
  loadTestSchema($testPdo);

  return $testPdo;
}

/**
 * Load database schema and initial data from the master GeoterRA.sql dump
 * Includes both DDL and initial DML as the standard for the project
 */
function loadTestSchema(?PDO $testPdo = null): void
{
  try {
    $schemaPath = dirname(__DIR__, 2) . '/database/GeoterRA_schema.sql';
    if (!file_exists($schemaPath)) {
      $schemaPath = dirname(__DIR__, 2) . '/database/GeoterRA.sql';
    }
    if (!file_exists($schemaPath)) {
      echo "[!] Warning: Schema file not found at {$schemaPath}\n";
      return;
    }

    echo "\n[*] Loading test database schema from fixtures...\n";

    if ($testPdo !== null) {
      $sql = file_get_contents($schemaPath);
      $sql = preg_replace('/\`[gG]eoter[rR][aA]\`\./', '', $sql);
      $sql = preg_replace('/DELIMITER \$\$.*?DELIMITER ;/s', '', $sql);
      $testPdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, 1);
      $testPdo->exec($sql);
      echo "[✓] Schema successfully loaded\n";
      return;
    }
  } catch (Exception $e) {
    echo "[!] Schema load notice: " . $e->getMessage() . "\n";
  }
}

// Store database connection in global state for tests
$_SERVER['TEST_DATABASE'] = initializeTestDatabase();
?>