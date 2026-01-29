<?php
declare(strict_types=1);

use Http\Response;
use Http\ErrorType;
use Controllers\RegisterController;
use Repositories\UserRepository;
use Services\UserService;
use Controllers\LoginController;
use Controllers\UserController;

use Controllers\AnalysisRequestController;
use Repositories\AnalysisRequestRepository;
use Services\AnalysisRequestService;
use Services\AuthService;

use Services\RegisteredManifestationService;
use Repositories\RegisteredManifestationRepository;
use Controllers\RegisteredManifestationController;


ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

file_put_contents('/tmp/debug_api.log', "REQUEST_URI: {$_SERVER['REQUEST_URI']}, METHOD: {$_SERVER['REQUEST_METHOD']}\n", FILE_APPEND);

set_error_handler(function($severity, $message, $file, $line) {
    file_put_contents('/tmp/debug_api.log', "[ERROR] $message in $file:$line\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['errors'=>[['code'=>'INTERNAL_ERROR','message'=>$message]], 'data'=>null, 'meta'=>null]);
    exit;
});

set_exception_handler(function($e) {
    file_put_contents('/tmp/debug_api.log', "[EXCEPTION] ".$e->getMessage()."\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['errors'=>[['code'=>'INTERNAL_ERROR','message'=>$e->getMessage()]], 'data'=>null, 'meta'=>null]);
    exit;
});

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
$path = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($path, PHP_URL_PATH) ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';


/**
 * Normalize base path
 * Public folder acts as root
 */
$basePath = '/api/public';
if (str_starts_with($path, $basePath)) {
    $path = substr($path, strlen($basePath));
}
$path = rtrim('/' . ltrim($path, '/'), '/');

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

if ($path === '/analysis-request') {
  $repository = new AnalysisRequestRepository($db);
  $service = new AnalysisRequestService($repository, $db);
  $authService = new AuthService(new UserRepository($db));
  $controller = new AnalysisRequestController($service, $authService);

  if ($method === 'POST') {
    $controller();
  }

  if ($method === 'GET') {
    $controller->index();
  }

  return;
}

if ($path === '/registered-manifestations') {
  $repository = new RegisteredManifestationRepository($db);
  $service = new RegisteredManifestationService($repository);
  $authService = new AuthService(new UserRepository($db));
  $controller = new RegisteredManifestationController($service, $authService);

  if ($method === 'PUT') {
    $controller();
  }

  if ($method === 'GET') {
    $controller->index();
  }
  return;
}


/**
 * Fallback
 */
Response::error(ErrorType::notFound('Route'), 404);
?>