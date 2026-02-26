<?php
declare(strict_types=1);

namespace Core;

use Http\Response;
use Http\ErrorType;

class ErrorHandler
{
    public static function register(): void
    {
        set_error_handler([self::class, 'handleError']);
        set_exception_handler([self::class, 'handleException']);
    }

    public static function handleError($severity, $message, $file, $line): void
    {
        file_put_contents('/tmp/debug_api.log', "[ERROR] $message in $file:$line\n", FILE_APPEND);
        http_response_code(500);
        echo json_encode([
            'errors' => [['code' => 'INTERNAL_ERROR', 'message' => $message]],
            'data' => null,
            'meta' => null
        ]);
        exit;
    }

    public static function handleException($e): void
    {
        file_put_contents('/tmp/debug_api.log', "[EXCEPTION] " . $e->getMessage() . "\n", FILE_APPEND);
        http_response_code(500);
        echo json_encode([
            'errors' => [['code' => 'INTERNAL_ERROR', 'message' => $e->getMessage()]],
            'data' => null,
            'meta' => null
        ]);
        exit;
    }
}