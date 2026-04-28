<?php
declare(strict_types=1);

/**
 * Database connection factory
 * Loads configuration based on environment detection (hostname or IP)
 * Production: JOB/config.ini (163.178.171.105)
 * Local: API/config/config.ini (localhost, 127.0.0.1)
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

// Detect environment based on hostname/IP (not path)
// Production: 163.178.171.105 or geoterra.com
// Local: localhost or 127.0.0.1
$host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
$isProduction = str_contains($host, '163.178.171.105') || str_contains($host, 'geoterra.com');

// Locate config.ini based on detected environment
$configPath = $isProduction
    ? $jobLevelDir . '/config.ini'
    : $apiLevelDir . '/config/config.ini';

if (!file_exists($configPath)) {
    throw new RuntimeException("Configuration file not found at: $configPath (Host: $host, Environment: " . ($isProduction ? 'production' : 'local') . ")");
}

$config = parse_ini_file($configPath, true);

if ($config === false || !isset($config['database'])) {
    throw new RuntimeException('Invalid database configuration.');
}

// Parse and create database connection
$db = $config['database'];

$dsn = sprintf(
    'mysql:host=%s;port=%s;dbname=%s;charset=%s',
    $db['host'] ?? 'localhost',
    $db['port'] ?? '3306',
    $db['name'] ?? '',
    $db['charset'] ?? 'utf8mb4'
);

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