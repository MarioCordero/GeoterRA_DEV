<?php
return [
    // Auth routes
    ['method' => 'POST', 'path' => '/auth/refresh', 'controller' => 'AuthController', 'action' => 'refresh'],
    ['method' => 'POST', 'path' => '/auth/login', 'controller' => 'AuthController', 'action' => 'login'],
    ['method' => 'POST', 'path' => '/auth/logout', 'controller' => 'AuthController', 'action' => 'logout'],
    
    // User routes
    ['method' => 'GET', 'path' => '/users/me', 'controller' => 'UserController', 'action' => 'show'],
    ['method' => 'PUT', 'path' => '/users/me', 'controller' => 'UserController', 'action' => 'update'],
    ['method' => 'GET', 'path' => '/users/me/session', 'controller' => 'UserController', 'action' => 'showSession'],
    ['method' => 'POST', 'path' => '/users/register', 'controller' => 'UserController', 'action' => 'register'],
    ['method' => 'DELETE', 'path' => '/users/me', 'controller' => 'UserController', 'action' => 'delete'],
    
    // Analysis request routes
    ['method' => 'POST', 'path' => '/analysis-request', 'controller' => 'AnalysisRequestController', 'action' => 'store'],
    ['method' => 'GET', 'path' => '/analysis-request', 'controller' => 'AnalysisRequestController', 'action' => 'index'],
    ['method' => 'PUT', 'path' => '/analysis-request/{id}', 'controller' => 'AnalysisRequestController', 'action' => 'update'],
    ['method' => 'DELETE', 'path' => '/analysis-request/{id}', 'controller' => 'AnalysisRequestController', 'action' => 'delete'],

    // Admin-only analysis request routes
    ['method' => 'GET', 'path' => '/admin/analysis-requests', 'controller' => 'AnalysisRequestController', 'action' => 'adminIndex'],
    ['method' => 'DELETE', 'path' => '/admin/analysis-request/{id}', 'controller' => 'AnalysisRequestController', 'action' => 'adminDelete'],
    ['method' => 'PUT', 'path' => '/admin/analysis-request/{id}', 'controller' => 'AnalysisRequestController', 'action' => 'adminUpdate'],
    
    // Maintenance routes
    ['method' => 'GET', 'path' => '/maintenance/system/logs', 'controller' => 'MaintenanceController', 'action' => 'getSystemLogs'],
    ['method' => 'GET', 'path' => '/maintenance/dashboard', 'controller' => 'MaintenanceController', 'action' => 'getDashboardInfo'],
    
    // Registered manifestations routes
    ['method' => 'GET', 'path' => '/regions', 'controller' => 'RegionController', 'action' => 'index'],
    ['method' => 'GET', 'path' => '/regions/{id}', 'controller' => 'RegionController', 'action' => 'show'],
    ['method' => 'POST', 'path' => '/regions', 'controller' => 'RegionController', 'action' => 'store'],
    ['method' => 'PUT', 'path' => '/regions/{id}', 'controller' => 'RegionController', 'action' => 'update'],
    ['method' => 'DELETE', 'path' => '/regions/{id}', 'controller' => 'RegionController', 'action' => 'delete'],
    
    // Region routes
    ['method' => 'GET', 'path' => '/regions', 'controller' => 'RegionController', 'action' => 'index'],
    ['method' => 'GET', 'path' => '/regions/{id}', 'controller' => 'RegionController', 'action' => 'show'],
    ['method' => 'POST', 'path' => '/regions', 'controller' => 'RegionController', 'action' => 'store'],
    ['method' => 'PUT', 'path' => '/regions/{id}', 'controller' => 'RegionController', 'action' => 'update'],
    ['method' => 'DELETE', 'path' => '/regions/{id}', 'controller' => 'RegionController', 'action' => 'delete'],
];