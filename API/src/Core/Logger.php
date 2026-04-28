<?php
declare(strict_types=1);

namespace Core;

final class Logger
{
    private static string $logFile = '';
    private static bool $initialized = false;

    public static function init(string $logPath): void
    {
        self::$logFile = $logPath;
        self::$initialized = true;
        
        // Ensure directory exists
        $dir = dirname($logPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }

    public static function info(string $message): void
    {
        self::log('INFO', $message);
    }

    public static function error(string $message): void
    {
        self::log('ERROR', $message);
    }

    public static function warning(string $message): void
    {
        self::log('WARNING', $message);
    }

    public static function debug(string $message): void
    {
        self::log('DEBUG', $message);
    }

    private static function log(string $level, string $message): void
    {
        if (!self::$initialized || empty(self::$logFile)) {
            return;
        }

        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] {$level}: {$message}\n";
        
        file_put_contents(self::$logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }

    public static function logRequest(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN';
        $uri = $_SERVER['REQUEST_URI'] ?? 'UNKNOWN';
        $clientIp = self::getClientIp();
        
        self::info("REQUEST: {$method} {$uri} from {$clientIp}");
    }

    public static function logError(\Throwable $e, ?string $context = null): void
    {
        $message = "Exception: " . $e->getMessage();
        if ($context) {
            $message .= " (Context: {$context})";
        }
        $message .= " | File: " . $e->getFile() . ":" . $e->getLine();
        
        self::error($message);
    }

    private static function getClientIp(): string
    {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
            return $_SERVER['REMOTE_ADDR'];
        }
        return 'UNKNOWN';
    }
}