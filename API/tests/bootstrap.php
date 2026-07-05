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

// Ensure session starts correctly in CLI mode without throwing headers already sent
//if (session_status() === PHP_SESSION_NONE) {
//  session_start();
//}

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
  // Read the environment variables (GitHub Actions) or use the defaults (Local)
  // Note: It is better to use 127.0.0.1 instead of 'localhost' to force TCP connection and avoid error 2002
  $host = getenv('DB_HOST') ?: '127.0.0.1';
  $port = getenv('DB_PORT') ?: 8081;
  $user = getenv('DB_USER') ?: 'mario';
  $password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '2003';

  $host = '127.0.0.1';
  $port = 8081;
  $user = 'root';
  $password = '';

  // Names of the databases
  $prodDbName = 'GeoterRA';
  $testDbName = 'GeoterRA_test';

  // Connect to production database (to read schema)
  $prodDsn = "mysql:host={$host};port={$port};dbname={$prodDbName};charset=utf8mb4";
  try {
    $prodPdo = new PDO(
      $prodDsn, $user, $password, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
    );
    echo "[✓] Connected to production database: {$prodDbName}\n";
  } catch (PDOException $e) {
    echo "[✗] Failed to connect to production database: " . $e->getMessage(
      ) . "\n";
    exit(1);
  }

  // Always drop and recreate test database to ensure clean schema load
  try {
    $serverDsn = "mysql:host={$host};port={$port};charset=utf8mb4";
    $serverPdo = new PDO(
      $serverDsn, $user, $password, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]
    );
    $serverPdo->exec("DROP DATABASE IF EXISTS `{$testDbName}`");
    $serverPdo->exec("CREATE DATABASE `{$testDbName}`");

    $testDsn = "mysql:host={$host};port={$port};dbname={$testDbName};charset=utf8mb4";
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
  loadTestSchema();

  return $testPdo;
}

/**
 * Load database schema and initial data from the master GeoterRA.sql dump
 * Includes both DDL and initial DML as the standard for the project
 */
function loadTestSchema(): void
{
  $host = getenv('DB_HOST') ?: '127.0.0.1';
  $port = getenv('DB_PORT') ?: 3306;
  $user = getenv('DB_USER') ?: 'mario';
  $password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '2003';
  $testDbName = 'GeoterRA_test';

  $host = '127.0.0.1';
  $port = 8081;
  $user = 'root';
  $password = '';

  try {
    $schemaPath = dirname(__DIR__, 2) . '/database/GeoterRA.sql';
    if (!file_exists($schemaPath)) {
      echo "[!] Warning: Schema file not found at {$schemaPath}\n";
      return;
    }

    echo "\n[*] Loading test database schema from fixtures...\n";

    $command = sprintf(
      'sed "s/\`[gG]eoter[rR][aA]\`\.//g" %s | mysql -h %s -P %s -u %s -p%s %s 2>&1',
      escapeshellarg($schemaPath),
      escapeshellarg((string)$host),
      escapeshellarg((string)$port),
      escapeshellarg($user),
      escapeshellarg($password),
      escapeshellarg($testDbName)
    );

    $output = [];
    $returnVar = 0;
    exec($command, $output, $returnVar);

    if ($returnVar !== 0) {
      echo "[✗] Failed to load schema via mysql CLI:\n" . implode(
          "\n", $output
        ) . "\n";
      exit(1);
    }

    echo "[✓] Schema successfully loaded\n";

  } catch (Exception $e) {
    echo "[✗] Failed to load schema: " . $e->getMessage() . "\n";
    exit(1);
  }
}

// Store database connection in global state for tests
$_SERVER['TEST_DATABASE'] = initializeTestDatabase();

ob_start();
$_SERVER['TEST_DATABASE'] = initializeTestDatabase();
ob_end_clean();
?>