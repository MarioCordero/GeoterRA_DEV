<?php
declare(strict_types=1);

// Load .env, dirname(__DIR__, 3) points /home/proyecto/
$envFile = dirname(__DIR__, 3) . '/.env';
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

use Core\Logger;

// PHP CONFIG
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// SYSTEM LOGGING
$logPath = __DIR__ . '/../logs/system.log';
Logger::init($logPath);
Logger::logRequest();

// Handle fatal errors
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    Logger::error("PHP Error ({$errno}): {$errstr} in {$errfile}:{$errline}");
    return false;
});

set_exception_handler(function(Throwable $e) {
    Logger::logError($e, 'Uncaught Exception');
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error']);
});