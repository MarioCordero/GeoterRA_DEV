<?php
declare(strict_types=1);

/**
 * Database connection factory
 * Works in both web (Apache) and CLI (terminal) environments.
 */

$jobLevelDir = dirname(__DIR__, 3);
$apiLevelDir = dirname(__DIR__, 1);

// Load environment variables from .env if it exists (optional)
$envFile = $jobLevelDir . '/.env';
if (file_exists($envFile)) {
  $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || str_starts_with($line, '#')) continue;
    if (!str_contains($line, '=')) continue;

    [$key, $value] = explode('=', $line, 2);
    $key = trim($key);
    $value = trim($value, " \t\n\r\0\x0B\"");

    $_ENV[$key] = $value;
    putenv("$key=$value");
  }
}

// Detect environment (CLI vs web)
$isCli = php_sapi_name() === 'cli';

if ($isCli) {
  // For CLI, assume local development (or you could use an env var)
  $isProduction = false;
  $configPath = $apiLevelDir . '/config/config.ini';
} else {
  // Web: detect by hostname/IP
  $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
  $isProduction = str_contains($host, '163.178.171.105') || str_contains($host, 'geoterra.com');
  $configPath = $isProduction
    ? $jobLevelDir . '/config.ini'
    : $apiLevelDir . '/config/config.ini';
}

if (!file_exists($configPath)) {
  throw new RuntimeException("Configuration file not found at: $configPath");
}

$config = parse_ini_file($configPath, true);
if ($config === false || !isset($config['database'])) {
  throw new RuntimeException('Invalid database configuration.');
}

$db = $config['database'];

// Build DSN with support for both TCP/IP and Unix socket
$dsn = 'mysql:';
if (!empty($db['unix_socket'])) {
  $dsn .= 'unix_socket=' . $db['unix_socket'] . ';';
} else {
  // If host is 'localhost' and we are in CLI, force to 127.0.0.1 to avoid socket issues
  $host = $db['host'] ?? 'localhost';
  if ($isCli && $host === 'localhost') {
    $host = '127.0.0.1';
  }
  $dsn .= 'host=' . $host . ';port=' . ($db['port'] ?? '3306') . ';';
}
$dsn .= 'dbname=' . ($db['name'] ?? '') . ';charset=' . ($db['charset'] ?? 'utf8mb4');

return new PDO(
  $dsn,
  $db['user'] ?? '',
  $db['pass'] ?? '',
  [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ]
);