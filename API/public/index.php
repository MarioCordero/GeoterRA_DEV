<?php
declare(strict_types=1);

use Http\Response;
use Http\ErrorType;
use Repositories\UserRepository;
use Services\UserService;
use Controllers\UserController;
use Controllers\AuthController;

use Controllers\AnalysisRequestController;
use Repositories\AnalysisRequestRepository;
use Services\AnalysisRequestService;
use Services\AuthService;
use Repositories\AuthRepository;

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

$userRepository = new UserRepository($db);
$authRepository = new AuthRepository($db);


/**
 * Routes
 */

if ($method === 'POST' && $path === '/auth/refresh') {
  $userService = new UserService($userRepository);
  $authService = new AuthService($authRepository, $userRepository);
  $controller = new AuthController($authService, $userService);
  $controller->refresh();
  return;
}

if ($method === 'POST' && $path === '/auth/register') {
  $userService = new UserService($userRepository);
  $authService = new AuthService($authRepository, $userRepository);
  $controller = new AuthController($authService, $userService);
  $controller->register();
  return;
}

if ($method === 'POST' && $path === '/auth/login') {
  $userService = new UserService($userRepository);
  $authService = new AuthService($authRepository, $userRepository);
  $controller = new AuthController($authService, $userService);
  $controller->login();
  return;
}

if ($method === 'POST' && $path === '/auth/logout') {
  $userService = new UserService($userRepository);
  $authService = new AuthService($authRepository, $userRepository);
  $controller = new AuthController($authService, $userService);
  $controller->logout();
  return;
}

if ($path === '/users/me') {
  $userService = new UserService($userRepository);
  $authService = new AuthService($authRepository, $userRepository);
  $controller = new UserController($userService, $authService);

  if ($method === 'GET') {
    $controller->show();
    return;
  }

  if ($method === 'PUT') {
    $controller->update();
    return;
  }

  if ($method === 'DELETE') {
    $controller->delete();
    return;
  }
  return;
}

if ($path === '/analysis-request') {
  $repository = new AnalysisRequestRepository($db);
  $service = new AnalysisRequestService($repository, $db);
  $authService = new AuthService($authRepository, $userRepository);
  $controller = new AnalysisRequestController($service, $authService);

  if ($method === 'POST') {
    $controller->store();
    return;
  }

  if ($method === 'GET') {
    $controller->index();
    return;
  }

  if (preg_match('#^/analysis-request/([0-9A-HJKMNP-TV-Z]{26})$#', $path, $matches)) {
    $id = (string) $matches[1];
      if ($method === 'PUT') {
      $controller->update($id);
      return;
    }

    if ($method === 'DELETE') {
      $controller->delete($id);
      return;
    }
  }

  return;
}

if (str_starts_with($path, '/registered-manifestations')) {

  $repository = new RegisteredManifestationRepository($db);
  $service = new RegisteredManifestationService($repository);
  $authService = new AuthService($authRepository, $userRepository);
  $controller = new RegisteredManifestationController($service, $authService);

  if ($method === 'POST' && $path === '/registered-manifestations') {
    $controller->store();
    return;
  }

  if ($method === 'GET' && $path === '/registered-manifestations') {
    $controller->index();
    return;
  }

  if (preg_match('#^/registered-manifestations/([0-9A-HJKMNP-TV-Z]{26})$#i', $path, $matches)) {
    $id = (string) $matches[1];

    if ($method === 'PUT') {
      $controller->update($id);
      return;
    }

    if ($method === 'DELETE') {
      $controller->delete($id);
      return;
    }
  }
}

/**
 * Fallback
 */
Response::error(ErrorType::notFound('Route'), 404);
?>