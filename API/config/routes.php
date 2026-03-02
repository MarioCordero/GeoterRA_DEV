<?php

return [
    // Auth routes
    ['method' => 'POST', 'path' => '/auth/refresh', 'controller' => 'AuthController', 'action' => 'refresh'],
    ['method' => 'POST', 'path' => '/auth/login', 'controller' => 'AuthController', 'action' => 'login'],
    ['method' => 'POST', 'path' => '/auth/logout', 'controller' => 'AuthController', 'action' => 'logout'],
    
    // User routes
    ['method' => 'GET', 'path' => '/users/me', 'controller' => 'UserController', 'action' => 'show'],
    ['method' => 'PUT', 'path' => '/users/me', 'controller' => 'UserController', 'action' => 'update'],
    ['method' => 'POST', 'path' => '/users/register', 'controller' => 'UserController', 'action' => 'register'],
    ['method' => 'DELETE', 'path' => '/users/me', 'controller' => 'UserController', 'action' => 'delete'],
    
    // Analysis request routes
    ['method' => 'POST', 'path' => '/analysis-request', 'controller' => 'AnalysisRequestController', 'action' => 'store'],
    ['method' => 'GET', 'path' => '/analysis-request', 'controller' => 'AnalysisRequestController', 'action' => 'index'],
    ['method' => 'PUT', 'path' => '/analysis-request/{id}', 'controller' => 'AnalysisRequestController', 'action' => 'update'],
    ['method' => 'DELETE', 'path' => '/analysis-request/{id}', 'controller' => 'AnalysisRequestController', 'action' => 'delete'],
    
    // Registered manifestations routes
    ['method' => 'POST', 'path' => '/registered-manifestations', 'controller' => 'RegisteredManifestationController', 'action' => 'store'],
    ['method' => 'GET', 'path' => '/registered-manifestations', 'controller' => 'RegisteredManifestationController', 'action' => 'index'],
    ['method' => 'GET', 'path' => '/registered-regions', 'controller' => 'RegisteredManifestationController', 'action' => 'regions'],
    ['method' => 'PUT', 'path' => '/registered-manifestations/{id}', 'controller' => 'RegisteredManifestationController', 'action' => 'update'],
    ['method' => 'DELETE', 'path' => '/registered-manifestations/{id}', 'controller' => 'RegisteredManifestationController', 'action' => 'delete'],
];