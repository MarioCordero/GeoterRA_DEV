<?php
declare(strict_types=1);

/**
 * Database connection factory.
 * Busca configuraciones al nivel de JOB/ (3 niveles arriba de API/config/)
 */

// Si este archivo está en GeoterRA_DEV/API/config/db.php:
// __DIR__ es .../GeoterRA_DEV/API/config
// dirname(__DIR__, 1) es .../GeoterRA_DEV/API
// dirname(__DIR__, 2) es .../GeoterRA_DEV
// dirname(__DIR__, 3) es .../JOB  <-- Aquí es donde quieres estar
$jobLevelDir = dirname(__DIR__, 3);
$repoLevelDir = dirname(__DIR__, 2);

// 1. Intentar cargar el .env desde el nivel de JOB/
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
        
        // Seteamos tanto en $_ENV como en el entorno del sistema para consistencia
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

// 2. Detección de entorno más agresiva
// Prioridad: $_ENV > getenv > Verificación de ruta (si estamos en /home/proyecto es produ)
$env = $_ENV['APP_ENV'] ?? getenv('APP_ENV');

if (!$env) {
    // Si no hay variable, usamos una marca física (ej. si la ruta contiene /home/proyecto)
    $env = (str_contains(__DIR__, '/home/proyecto')) ? 'production' : 'development';
}

// 3. Buscar config.ini basándose en el entorno
// En producción: JOB/config.ini
// En desarrollo: GeoterRA_DEV/config.ini (o donde lo tengas localmente)
$configPath = ($env === 'production')
    ? $jobLevelDir . '/config.ini'
    : $repoLevelDir . '/config.ini'; 

if (!file_exists($configPath)) {
    throw new RuntimeException("Archivo de configuración no encontrado en: $configPath. (Entorno detectado: $env)");
}

$config = parse_ini_file($configPath, true);

if ($config === false || !isset($config['database'])) {
    throw new RuntimeException('Configuración de base de datos inválida.');
}

$db = $config['database'];

// ... (Resto del código PDO)
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