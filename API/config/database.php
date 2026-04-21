<?php
declare(strict_types=1);

/**
 * Database connection factory.
 * Busca .env y config.ini un nivel arriba de la carpeta del proyecto.
 */

// 1. Definimos las rutas relativas al proyecto
// Si este archivo está en la raíz de GeoterRA_DEV, __DIR__ es esa raíz.
// dirname(__DIR__) nos sube a la carpeta JOB/
$projectRoot = __DIR__;
$parentDir   = dirname($projectRoot); 

// 2. Cargar .env desde el nivel de JOB/
$envFile = $parentDir . '/.env';

if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        if (!str_contains($line, '=')) continue;
        
        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value, " \t\n\r\0\x0B\"");
    }
}

$env = $_ENV['APP_ENV'] ?? getenv('APP_ENV') ?: 'development';

// 3. Determinar la ruta del config.ini
// Si es producción, lo busca en JOB/. Si no, en la carpeta local del repo.
$configPath = ($env === 'production')
    ? $parentDir . '/config.ini'
    : $projectRoot . '/config.ini';

if (!file_exists($configPath)) {
    throw new RuntimeException("Archivo de configuración no encontrado en: $configPath");
}

$config = parse_ini_file($configPath, true);

if ($config === false || !isset($config['database'])) {
    throw new RuntimeException('Configuración de base de datos inválida.');
}

$db = $config['database'];

// ... (resto del código de conexión PDO igual que antes)
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