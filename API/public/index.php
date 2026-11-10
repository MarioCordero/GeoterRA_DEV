<?php
declare(strict_types=1);

use Http\Response;
use Http\Request;
use Http\ErrorType;
use Core\GlobalErrorHandler;
use Router\SimpleRouter;
use Dotenv\Dotenv;

$basePath = realpath(__DIR__ . '/../');
$srcPath = $basePath . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR;
$configPath = $basePath . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR;

require __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv::createImmutable(__DIR__ . '/../../../');
$dotenv->load();

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

// Request parsing
$path = Request::getPath();
$method = Request::getMethod();

// Exempt public app installer download and version endpoints from API key requirement
$isPublicAppEndpoint = in_array($path, ['/app/download-apk', '/app/download', '/app/version'], true);

if (!$isPublicAppEndpoint && !Request::isValidClient()) {
  Http\Response::error(Http\ErrorType::unauthorized('Invalid API Key'), 403);
}

// Load routes
$routes = $safeRequire($configPath . 'routes.php');

if (!$routes) {
  Response::error(ErrorType::internal('Routes configuration missing'), 500);
  exit;
}

// Public app installer endpoints are file-based and do not require a database connection
if ($isPublicAppEndpoint) {
  $router = new SimpleRouter($routes, null);
  $response = $router->dispatch($method, $path);
  if ($response === null) {
    Response::error(ErrorType::notFound('Route'), 404);
  }
  exit;
}

// Database and session initialization for database-backed endpoints
$db = $safeRequire($configPath . 'database.php');

$safeRequire($configPath . 'session.php');
if (function_exists('validateSessionToken')) {
  validateSessionToken($db);
}

// Route dispatching
$router = new SimpleRouter($routes, $db);
$response = $router->dispatch($method, $path);

// If no route matched, return 404
if ($response === null) {
  Response::error(ErrorType::notFound('Route'), 404);
}