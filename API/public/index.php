<?php
declare(strict_types=1);

use Http\Response;
use Http\Request;
use Http\ErrorType;
use Core\GlobalErrorHandler;
use Router\SimpleRouter;

$basePath = realpath(__DIR__ . '/../');
$srcPath = $basePath . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR;
$configPath = $basePath . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR;

require __DIR__ . '/../vendor/autoload.php';

$safeRequire = function (string $path) {
  if (file_exists($path)) {
    return require $path;
  }
  return null;
};

// CORS Rules
$safeRequire($configPath . 'cors.php');

// Initial configurations
$safeRequire($configPath . 'init.php');

//// Autoloader
//spl_autoload_register(function (string $class) use ($srcPath): void {
//$file = realpath($srcPath . str_replace('\\', DIRECTORY_SEPARATOR, $class) . '.php');
//  if ($file && file_exists($file)) {
//    require_once $file;
//  }
//});

// Error handling
GlobalErrorHandler::register();

$db = $safeRequire($configPath . 'database.php');

$safeRequire($configPath . 'session.php');
if (function_exists('validateSessionToken')) {
  validateSessionToken($db);
}

// Request parsing
$path = Request::getPath();
$method = Request::getMethod();

// Load routes
$routes = $safeRequire($configPath . 'routes.php');

if (!$routes) {
  Response::error(ErrorType::internal('Routes configuration missing'), 500);
  exit;
}

// Route dispatching
$router = new SimpleRouter($routes, $db);
$response = $router->dispatch($method, $path);

// If no route matched, return 404
if ($response === null) {
  Response::error(ErrorType::notFound('Route'), 404);
}