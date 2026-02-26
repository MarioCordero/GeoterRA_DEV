<?php
declare(strict_types=1);

/**
 * ============================================================================
 * ARCHIVO: index.php
 * PROPÓSITO: Punto de entrada único (Front Controller) para toda la API
 * FECHA: 2024
 * 
 * ANÁLISIS DE RESPONSABILIDADES ACTUALES (Total: 7 responsabilidades distintas)
 * ============================================================================
 */

/**
 * RESPONSABILIDAD #1: Importación de clases (USE statements)
 * ----------------------------------------------------------------------------
 * PROBLEMA: 9 use statements que podrían automatizarse con mejor autoloading
 * SOLUCIÓN: Mantener pero organizar por dominio
 */
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

/**
 * RESPONSABILIDAD #2: Configuración del entorno PHP
 * ----------------------------------------------------------------------------
 * PROBLEMA: Configuración hardcodeada mezclada con lógica de aplicación
 * ¿Qué pasa si queremos diferentes configs para dev/prod?
 */
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

/**
 * RESPONSABILIDAD #3: Logging de requests
 * ----------------------------------------------------------------------------
 * PROBLEMA: Logging directamente a archivo, acoplado a filesystem
 * ¿Y si mañana queremos log a MongoDB o CloudWatch?
 */
file_put_contents('/tmp/debug_api.log', "REQUEST_URI: {$_SERVER['REQUEST_URI']}, METHOD: {$_SERVER['REQUEST_METHOD']}\n", FILE_APPEND);

/**
 * RESPONSABILIDAD #4: Manejo de errores y excepciones
 * ----------------------------------------------------------------------------
 * PROBLEMA: Handlers definidos como funciones anónimas, no reutilizables
 * El formato de respuesta de error está hardcodeado
 */
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
 * RESPONSABILIDAD #5: Bootstrap de base de datos
 * ----------------------------------------------------------------------------
 * PROBLEMA: La conexión DB se crea aquí, pero se usa en todo lado
 * ¿Y si queremos múltiples conexiones o conexiones lazy?
 */
$db = require __DIR__ . '/../config/database.php';

/**
 * RESPONSABILIDAD #6: Autoloader de clases
 * ----------------------------------------------------------------------------
 * PROBLEMA: Implementación manual de PSR-4
 * Podría delegarse a Composer
 */
spl_autoload_register(function (string $class): void {
    $baseDir = __DIR__ . '/../src/';
    $file = $baseDir . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

/**
 * RESPONSABILIDAD #7: Parseo de Request
 * ----------------------------------------------------------------------------
 * PROBLEMA: Lógica de parseo de URL mezclada con routing
 * El basePath está hardcodeado
 */
$path = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($path, PHP_URL_PATH) ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$basePath = '/api/public';
if (str_starts_with($path, $basePath)) {
    $path = substr($path, strlen($basePath));
}
$path = rtrim('/' . ltrim($path, '/'), '/');

/**
 * RESPONSABILIDAD #8: Creación de repositorios base
 * ----------------------------------------------------------------------------
 * PROBLEMA: Se crean instancias aquí para usar después
 * Acoplamiento: estos repositorios se usan en TODAS las rutas aunque no se necesiten
 */
$userRepository = new UserRepository($db);
$authRepository = new AuthRepository($db);

/**
 * ============================================================================
 * RESPONSABILIDAD #9: Routing + Controller Instantiation (LA MÁS GRANDE)
 * ----------------------------------------------------------------------------
 * PROBLEMAS IDENTIFICADOS:
 * 
 * 1. DUPLICACIÓN DE CÓDIGO:
 *    - new UserService($userRepository) se repite 7+ veces
 *    - new AuthService(...) se repite 7+ veces
 *    - new AuthController(...) se repite 4 veces
 * 
 * 2. MEZCLA DE CONCEPTOS:
 *    - Routing (¿qué ruta? ¿qué método?)
 *    - Controller instantiation (new)
 *    - Service instantiation (new)
 *    - Repository instantiation (new AnalysisRequestRepository)
 * 
 * 3. DIFICULTAD PARA TESTEAR:
 *    - No se puede testear routing sin hacer peticiones HTTP reales
 *    - Las dependencias están hardcodeadas (new)
 * 
 * 4. ESCALABILIDAD LIMITADA:
 *    - 50 líneas de if/else para 13 rutas
 *    - Con 50 rutas sería inmantenible
 * 
 * 5. ERRORES SILENCIOSOS:
 *    - if ($method === 'POST' && $path === '/auth/refresh') { ... return; }
 *    - Si olvidas el return, sigue ejecutando y da 404 falso
 * ============================================================================
 */

/**
 * Grupo AUTH - 4 rutas
 * ----------------------------------------------------------------------------
 * Patrón repetido 4 veces exactamente igual
 */
if ($method === 'POST' && $path === '/auth/refresh') {
    // Creación de servicios (duplicado)
    $userService = new UserService($userRepository);
    $authService = new AuthService($authRepository, $userRepository);
    // Creación de controller (duplicado)
    $controller = new AuthController($authService, $userService);
    $controller->refresh();
    return;
}

if ($method === 'POST' && $path === '/auth/register') {
    // MISMO código duplicado
    $userService = new UserService($userRepository);
    $authService = new AuthService($authRepository, $userRepository);
    $controller = new AuthController($authService, $userService);
    $controller->register();
    return;
}

if ($method === 'POST' && $path === '/auth/login') {
    // MISMO código duplicado
    $userService = new UserService($userRepository);
    $authService = new AuthService($authRepository, $userRepository);
    $controller = new AuthController($authService, $userService);
    $controller->login();
    return;
}

if ($method === 'POST' && $path === '/auth/logout') {
    // MISMO código duplicado
    $userService = new UserService($userRepository);
    $authService = new AuthService($authRepository, $userRepository);
    $controller = new AuthController($authService, $userService);
    $controller->logout();
    return;
}

/**
 * Grupo USERS - 3 métodos en una ruta
 * ----------------------------------------------------------------------------
 * Mezcla: La misma ruta con 3 métodos diferentes
 * La validación de método está dentro del bloque de ruta
 */
if ($path === '/users/me') {
    // Servicios (otra vez los mismos)
    $userService = new UserService($userRepository);
    $authService = new AuthService($authRepository, $userRepository);
    $controller = new UserController($userService, $authService);

    // Routing secundario por método HTTP
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
    return; // Si método no soportado, cae a 404 (¿o no?)
}

/**
 * Grupo ANALYSIS REQUEST - Rutas simples + ruta con parámetro
 * ----------------------------------------------------------------------------
 * Complejidad: routing por path exacto + routing con regex
 * La variable $controller se define antes pero se usa después de if/else
 */
if ($path === '/analysis-request') {
    // Nuevas dependencias específicas
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
    // IMPORTANTE: No hay return aquí, sigue ejecutando al regex de abajo
    // ¿Bug? Si es POST o GET, hace return. Si es PUT/DELETE, sigue.
}

// Regex para capturar ID
if (preg_match('#^/analysis-request/([0-9A-HJKMNP-TV-Z]{26})$#', $path, $matches)) {
    $id = (string) $matches[1];
    // PELIGRO: $controller podría no estar definido si no pasó por el if anterior
    if ($method === 'PUT') {
        $controller->update($id);
        return;
    }
    if ($method === 'DELETE') {
        $controller->delete($id);
        return;
    }
}

/**
 * Grupo REGISTERED MANIFESTATIONS - El más complejo
 * ----------------------------------------------------------------------------
 * 3 niveles de anidamiento:
 * 1. str_starts_with (cualquier path que empiece así)
 * 2. path exacto para POST/GET
 * 3. regex para PUT/DELETE con ID
 */
if (str_starts_with($path, '/registered-manifestations')) {
    // Dependencias específicas
    $repository = new RegisteredManifestationRepository($db);
    $service = new RegisteredManifestationService($repository);
    $authService = new AuthService($authRepository, $userRepository);
    $controller = new RegisteredManifestationController($service, $authService);

    // Rutas exactas
    if ($method === 'POST' && $path === '/registered-manifestations') {
        $controller->store();
        return;
    }
    if ($method === 'GET' && $path === '/registered-manifestations') {
        $controller->index();
        return;
    }

    // Rutas con ID
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
    // Si no match, ¿qué pasa? No hay return explícito
}

/**
 * RESPONSABILIDAD #10: Respuesta 404 (Fallback)
 * ----------------------------------------------------------------------------
 */
Response::error(ErrorType::notFound('Route'), 404);

/**
 * ============================================================================
 * RESUMEN DE RESPONSABILIDADES (10 en total)
 * ============================================================================
 * 
 * 1. Importación de clases
 * 2. Configuración PHP
 * 3. Logging
 * 4. Manejo de errores
 * 5. Bootstrap DB
 * 6. Autoloader
 * 7. Parseo de Request
 * 8. Creación de repositorios base
 * 9. Routing + Instantiation (la más pesada)
 * 10. Respuesta 404
 * 
 * ============================================================================
 * MÉTRICAS DEL ARCHIVO
 * ============================================================================
 * 
 * Total líneas: ~200
 * Líneas de routing: ~120 (60% del archivo)
 * Número de rutas: 13
 * Número de instanciaciones "new": 26
 * Número de if/else: 15
 * Número de returns: 12 (riesgo de olvidar alguno)
 * 
 * ============================================================================
 * RIESGOS IDENTIFICADOS
 * ============================================================================
 * 
 * 🚨 RIESGO ALTO: Duplicación de código (principio DRY violado)
 * 🚨 RIESGO ALTO: Acoplamiento a implementaciones concretas (new)
 * 🚨 RIESGO MEDIO: Posibles bugs por returns olvidados
 * 🚨 RIESGO MEDIO: Variables definidas condicionalmente ($controller)
 * 🚨 RIESGO BAJO: Dificultad para probar unitariamente
 * 🚨 RIESGO BAJO: Escalabilidad limitada (más rutas = más caos)
 * 
 * ============================================================================
 * PROPUESTA DE REFACTORIZACIÓN (para discutir en reunión)
 * ============================================================================
 * 
 * FASE 1 (Inmediata, bajo riesgo):
 * - Mover configuración PHP a archivo separado
 * - Mover error handlers a clase dedicada
 * - Mover parseo de request a clase Request
 * 
 * FASE 2 (Corto plazo, riesgo medio):
 * - Extraer rutas a archivo de configuración (routes.php)
 * - Crear Router simple que itere sobre array de rutas
 * - Centralizar creación de dependencias (Factory/Container básico)
 * 
 * FASE 3 (Mediano plazo, riesgo mayor):
 * - Implementar Dependency Injection Container
 * - Añadir middlewares (auth, logging, etc)
 * - Tests unitarios para router
 * 
 * ============================================================================
 * ¿PREGUNTAS PARA LA REUNIÓN?
 * ============================================================================
 * 
 * 1. ¿Cuánto va a crecer esta API en los próximos 6 meses?
 * 2. ¿Vamos a añadir más desarrolladores al proyecto?
 * 3. ¿Qué nivel de testing necesitamos?
 * 4. ¿Hay plazo para refactorizar o priorizamos features?
 * ============================================================================
 */
?>