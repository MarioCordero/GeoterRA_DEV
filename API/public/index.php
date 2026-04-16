<?php
declare(strict_types=1);

// 1. CORS (must be first)
require __DIR__ . '/../config/cors.php';

// 2. Configuración inicial
require __DIR__ . '/../config/init.php';

// 3. Autoloader (MUST be before using any classes)
spl_autoload_register(function (string $class): void {
    $baseDir = __DIR__ . '/../src/';
    $file = $baseDir . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

use Http\RequestParser;
use Http\Response;
use Http\ErrorType;
use Core\ErrorHandler;
use Router\SimpleRouter;

// 4. Manejo de errores
ErrorHandler::register();

// 5. Bootstrap
$db = require __DIR__ . '/../config/database.php';

// 6. Validar sesión
require __DIR__ . '/../config/session.php';
validateSessionToken($db);

if (!Http\Request::isValidClient()) {
    Http\Response::error(Http\ErrorType::unauthorized('Invalid API Key'), 403);
}

// 7. Parsear request
$path = RequestParser::getPath();
$method = RequestParser::getMethod();

// 8. Cargar rutas
$routes = require __DIR__ . '/../config/routes.php';

// 9. Enrutar
$router = new SimpleRouter($routes, $db);
$response = $router->dispatch($method, $path);

// 10. Respuesta o 404
if ($response === null) {
    Response::error(ErrorType::notFound('Route'), 404);
}