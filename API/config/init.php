<?php
declare(strict_types=1);

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

set_exception_handler(function(\Throwable $e) {
    Logger::logError($e, 'Uncaught Exception');
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error']);
});
