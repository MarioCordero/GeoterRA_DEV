<?php
declare(strict_types=1);

/**
 * Database connection factory.
 * Loads credentials from a config.ini file located outside the public scope.
 */

// Load .env file if exists
$envFile = __DIR__ . '/../../.env';
if (file_exists($envFile)) {
  $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  foreach ($lines as $line) {
    if (str_starts_with(trim($line), '#')) continue;
    if (!str_contains($line, '=')) continue;
    [$key, $value] = explode('=', $line, 2);
    $_ENV[trim($key)] = trim($value);
  }
}

$env = $_ENV['APP_ENV'] ?? getenv('APP_ENV') ?: 'development';

$configPath = $env === 'production'
  ? realpath(__DIR__ . '/../../../') . '/config.ini'
  : __DIR__ . '/config.ini';

if (!file_exists($configPath)) {
  throw new RuntimeException('Database configuration file not found.');
}

$config = parse_ini_file($configPath, true);

if ($config === false || !isset($config['database'])) {
  throw new RuntimeException('Invalid database configuration.');
}

$db = $config['database'];

$host = $db['host'] ?? 'localhost';
$port = $db['port'] ?? '3306';
$name = $db['name'] ?? '';
$user = $db['user'] ?? '';
$password = $db['pass'] ?? '';
$charset = $db['charset'] ?? 'utf8mb4';

if ($name === '' || $user === '') {
  throw new RuntimeException('Incomplete database credentials.');
}

$dsn = sprintf(
  'mysql:host=%s;port=%s;dbname=%s;charset=%s',
  $host,
  $port,
  $name,
  $charset
);

return new PDO(
  $dsn,
  $user,
  $password,
  [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ]
);