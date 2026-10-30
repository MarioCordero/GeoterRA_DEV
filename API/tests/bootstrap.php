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
 * Connects to the throw-away Docker test database.
 *
 * The schema is NOT built here: tests/run-tests.sh starts a disposable MariaDB
 * container and applies every file in database/migrations/ with the real
 * `mariadb` client (triggers included, aborting on the first SQL error), so the
 * tests run against exactly what the migrations produce. The container is
 * destroyed when the run ends.
 *
 * With ParaTest each worker gets its own database (GeoterRA_test_<TEST_TOKEN>)
 * because the tests wipe every table between cases.
 */
function connectToTestDatabase(): PDO
{
  $fail = static function (string $message): never {
    fwrite(STDERR, "[✗] {$message}\n");
    exit(1);
  };

  if (getenv('GEOTERRA_TEST_DB_READY') !== '1') {
    $fail(
      "La base de datos de pruebas no está preparada.\n"
      . "    Los tests corren sobre un contenedor Docker efímero creado desde database/migrations/.\n"
      . "    Ejecuta:  composer test   (o:  bash tests/run-tests.sh)"
    );
  }

  $host = getenv('DB_HOST') ?: '127.0.0.1';
  $port = (int)(getenv('DB_PORT') ?: 3306);
  $user = getenv('DB_USER') ?: 'root';
  $password = (string)getenv('DB_PASS');

  // Fixed name on purpose (no override): resetDatabase() deletes every row.
  $testToken = getenv('TEST_TOKEN') ?: ($_SERVER['TEST_TOKEN'] ?? ($_ENV['TEST_TOKEN'] ?? ''));
  $testDbName = 'GeoterRA_test' . ($testToken !== '' ? '_' . $testToken : '');

  try {
    $pdo = new PDO(
      "mysql:host={$host};port={$port};dbname={$testDbName};charset=utf8mb4",
      $user,
      $password,
      [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => true,
      ]
    );
  } catch (PDOException $e) {
    $fail("No se pudo conectar a {$testDbName} en {$host}:{$port}: " . $e->getMessage());
  }

  $tables = (int)$pdo->query(
    'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()'
  )->fetchColumn();
  if ($tables === 0) {
    $fail("{$testDbName} está vacía: las migraciones no se aplicaron.");
  }

  return $pdo;
}

// Store database connection in global state for tests
$_SERVER['TEST_DATABASE'] = connectToTestDatabase();
