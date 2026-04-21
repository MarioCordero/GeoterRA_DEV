<?php
declare(strict_types=1);

/**
 * Database connection factory
 * Loads configuration from the top-level JOB/ directory
 */

$jobLevelDir = dirname(__DIR__, 3);
$repoLevelDir = dirname(__DIR__, 2);

// Load environment variables from .env file
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

// Detect environment (APP_ENV variable or path-based detection)
$env = $_ENV['APP_ENV'] ?? getenv('APP_ENV');

if (!$env) {
    $env = (str_contains(__DIR__, '/home/proyecto')) ? 'production' : 'development';
}

// Locate config file based on environment
// Production: JOB/config.ini | Development: GeoterRA_DEV/config.ini
$configPath = ($env === 'production')
    ? $jobLevelDir . '/config.ini'
    : $repoLevelDir . '/config.ini'; 

if (!file_exists($configPath)) {
    throw new RuntimeException("Configuration file not found at: $configPath (Environment: $env)");
}

$config = parse_ini_file($configPath, true);

if ($config === false || !isset($config['database'])) {
    throw new RuntimeException('Invalid database configuration.');
}

// Parse database connection parameters
$db = $config['database'];

$dsn = sprintf(
    'mysql:host=%s;port=%s;dbname=%s;charset=%s',
    $db['host'] ?? 'localhost',
    $db['port'] ?? '3306',
    $db['name'] ?? '',
    $db['charset'] ?? 'utf8mb4'
);

// Create and return PDO connection
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