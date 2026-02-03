<?php
declare(strict_types=1);

namespace Http;

class RequestParser
{
    public static function getPath(): string
    {
        $path = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($path, PHP_URL_PATH) ?? '/';
        
        // Normalizar base path (case-insensitive)
        $basePath = '/API/public';
        if (stripos($path, $basePath) === 0) {
            $path = substr($path, strlen($basePath));
        }
        
        return $path ?: '/';
    }

    public static function getMethod(): string
    {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }

    public static function getHeaders(): array
    {
        return getallheaders();
    }

    public static function getBody(): ?string
    {
        return file_get_contents('php://input');
    }
}