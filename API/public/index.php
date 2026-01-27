<?php
declare(strict_types=1);

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

use Http\Response;
use Controllers\RegisterController;
use Repositories\UserRepository;
use Services\UserService;
use Controllers\LoginController;
use Controllers\UserController;
use Services\AuthService;

/**
 * Database bootstrap
 */
$db = require __DIR__ . '/../config/database.php';

/**
 * Autoloader (PSR-4–like)
 */
spl_autoload_register(function (string $class): void {
  $baseDir = __DIR__ . '/../src/';
  $file = $baseDir . str_replace('\\', '/', $class) . '.php';

  if (file_exists($file)) {
    require_once $file;
  }
});

/**
 * Request info
 */
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

/**
 * Normalize base path
 * Public folder acts as root
 */
$basePath = '/api/public';
if (str_starts_with($path, $basePath)) {
    $path = substr($path, strlen($basePath));
}
$path = '/' . ltrim($path, '/'); // asegura que siempre empiece con '/'

/**
 * Routes
 */
if ($method === 'POST' && $path === '/register') {
  $repository = new UserRepository($db);
  $service = new UserService($repository);
  $controller = new RegisterController($service);
  $controller();
  return;
}

if ($method === 'POST' && $path === '/login') {
  $repository = new UserRepository($db);
  $authService = new AuthService($repository);
  $controller = new LoginController($authService);
  $controller();
  return;
}

if ($method === 'GET' && $path === '/user') {
  $repository = new UserRepository($db);
  $userService = new UserService($repository);
  $authService = new AuthService($repository);

  $controller = new UserController($userService, $authService);
  $controller();
  return;
}

/**
 * Fallback
 */
Response::json(['error' => 'Not Found'], 404);
