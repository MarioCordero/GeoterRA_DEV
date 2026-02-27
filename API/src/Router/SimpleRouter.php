<?php
declare(strict_types=1);

namespace Router;

use Http\Response;
use Http\ErrorType;

class SimpleRouter
{
    private array $routes;
    private array $controllers = [];
    private $db;
    private $userRepository;
    private $authRepository;

    public function __construct(array $routes, \PDO $db)
    {
        $this->routes = $routes;
        $this->db = $db;
        $this->userRepository = new \Repositories\UserRepository($db);
        $this->authRepository = new \Repositories\AuthRepository($db);
    }

    public function dispatch(string $method, string $path): ?object
    {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            $pattern = $this->pathToRegex($route['path']);
            if (preg_match($pattern, $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                try {
                    $controller = $this->getController($route['controller']);
                } catch (\Exception $e) {
                    $error = ErrorType::notFound('Controller');
                    return Response::error($error, $error->getStatusCode());
                }
                $action = $route['action'];
                if (!empty($params)) {
                    return $controller->$action(...array_values($params));
                }
                return $controller->$action();
            }
        }
        return null;
    }

    private function pathToRegex(string $path): string
    {
        $pattern = preg_replace('/\{([^}]+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    private function getController(string $name)
    {
        if (!isset($this->controllers[$name])) {
            $this->controllers[$name] = $this->createController($name);
        }
        return $this->controllers[$name];
    }

    private function createController(string $name)
    {
        $controllerClass = "\\Controllers\\{$name}";
        // Results in: \Controllers\UserController
        return new $controllerClass($this->db);
    }
}