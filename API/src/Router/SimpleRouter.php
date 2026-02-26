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
                // Extraer parámetros de la URL
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                
                // Obtener controlador y ejecutar acción
                $controller = $this->getController($route['controller']);
                $action = $route['action'];
                
                if (!empty($params)) {
                    return $controller->$action(...array_values($params));
                }
                
                return $controller->$action();
            }
        }

        return null; // No route found
    }

    private function pathToRegex(string $path): string
    {
        // Convertir /users/{id} a #^/users/([^/]+)$#
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
        switch ($name) {
            // DEBUG
            case 'HealthController':
                $healthRepository = new \Repositories\HealthRepository($this->db);
                $healthService = new \Services\HealthService($healthRepository);
                return new \Controllers\HealthController($healthService);
       
            case 'AuthController':
                $userService = new \Services\UserService($this->userRepository);
                $authService = new \Services\AuthService($this->authRepository, $this->userRepository);
                return new \Controllers\AuthController($authService, $userService);
            
            case 'UserController':
                $userService = new \Services\UserService($this->userRepository);
                $authService = new \Services\AuthService($this->authRepository, $this->userRepository);
                return new \Controllers\UserController($userService, $authService);
            
            case 'AnalysisRequestController':
                $repository = new \Repositories\AnalysisRequestRepository($this->db);
                $service = new \Services\AnalysisRequestService($repository, $this->db);
                $authService = new \Services\AuthService($this->authRepository, $this->userRepository);
                return new \Controllers\AnalysisRequestController($service, $authService);
            
            case 'RegisteredManifestationController':
                $repository = new \Repositories\RegisteredManifestationRepository($this->db);
                $service = new \Services\RegisteredManifestationService($repository);
                $authService = new \Services\AuthService($this->authRepository, $this->userRepository);
                return new \Controllers\RegisteredManifestationController($service, $authService);
            
            default:
                throw new \Exception("Controller not found: {$name}");
        }
    }
}