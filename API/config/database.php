<?php
declare(strict_types=1);

/**
 * Database connection factory.
 * Loads credentials from a config.ini file located outside the public scope.
 */

$configPath = dirname(__DIR__, 2) . '/config.ini';

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
$password = $db['password'] ?? '';
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
