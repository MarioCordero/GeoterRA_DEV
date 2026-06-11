<?php
declare(strict_types=1);

/**
 * Database connection factory
 * Works in both web (Apache) and CLI (terminal) environments.
 */

$jobLevelDir = dirname(__DIR__, 3);
$apiLevelDir = dirname(__DIR__, 1);

use Core\EnvironmentDetector;

// Detect environment (CLI vs web)
$isCli = php_sapi_name() === 'cli';
$isProduction = EnvironmentDetector::isProduction();

if ($isCli) {
  // For CLI, assume local development
  $configPath = $apiLevelDir . '/config/config.ini';
} else {
  // Web: load config based on detected environment
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