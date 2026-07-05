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
  ['method' => 'POST', 'path' => '/users/restore', 'controller' => 'UserController', 'action' => 'restore'],
  ['method' => 'PUT', 'path' => '/admin/users/{id}/role', 'controller' => 'UserController', 'action' => 'adminUpdateRole'],

  // Analysis request routes
  ['method' => 'POST', 'path' => '/analysis-requests', 'controller' => 'InvestigationRequestController', 'action' => 'store'],
  ['method' => 'GET', 'path' => '/analysis-requests', 'controller' => 'InvestigationRequestController', 'action' => 'index'],
  ['method' => 'GET', 'path' => '/analysis-requests/{id}', 'controller' => 'InvestigationRequestController', 'action' => 'show'],
  ['method' => 'PUT', 'path' => '/analysis-requests/{id}', 'controller' => 'InvestigationRequestController', 'action' => 'update'],
  ['method' => 'DELETE', 'path' => '/analysis-requests/{id}', 'controller' => 'InvestigationRequestController', 'action' => 'delete'],
  ['method' => 'GET', 'path' => '/analysis-requests/{id}/states', 'controller' =>
    'InvestigationRequestController', 'action' => 'states'],

  // Admin-only analysis request routes
  ['method' => 'GET', 'path' => '/admin/analysis-requests', 'controller' => 'InvestigationRequestController', 'action' => 'adminIndex'],
  ['method' => 'GET', 'path' => '/admin/analysis-requests/{id}', 'controller' => 'InvestigationRequestController', 'action' => 'adminShow'],
  ['method' => 'GET', 'path' => '/admin/analysis-requests/{id}/states', 'controller' => 'InvestigationRequestController', 'action' => 'adminStates'],
  ['method' => 'POST', 'path' => '/admin/analysis-requests/{id}/states', 'controller' => 'InvestigationRequestController', 'action' => 'adminAddState'],

  // Maintenance routes
  ['method' => 'GET', 'path' => '/maintenance/system/logs', 'controller' => 'MaintenanceController', 'action' => 'getSystemLogs'],
  ['method' => 'GET', 'path' => '/maintenance/dashboard', 'controller' => 'MaintenanceController', 'action' => 'getDashboardInfo'],
  ['method' => 'GET', 'path' => '/maintenance/users', 'controller' => 'MaintenanceController', 'action' => 'showAllUsers'],
  ['method' => 'PUT', 'path' => '/maintenance/users/{id}', 'controller' => 'MaintenanceController', 'action' => 'updateUserRole'],
  ['method' => 'GET', 'path' => '/maintenance/database/tables', 'controller' => 'MaintenanceController', 'action' => 'getAllDatabaseTables'],

  ['method' => 'GET', 'path' => '/provinces', 'controller' => 'ProvinceController', 'action' => 'index'],

  ['method' => 'GET', 'path' => '/admin/provinces/{id}', 'controller' => 'ProvinceController', 'action' => 'show'],
  ['method' => 'GET', 'path' => '/admin/provinces/snit/{code}', 'controller' => 'ProvinceController', 'action' => 'showBySnitCode'],
  ['method' => 'POST', 'path' => '/admin/provinces', 'controller' => 'ProvinceController', 'action' => 'store'],
  ['method' => 'PUT', 'path' => '/admin/provinces/{id}', 'controller' => 'ProvinceController', 'action' => 'update'],
  ['method' => 'DELETE', 'path' => '/admin/provinces/{id}', 'controller' => 'ProvinceController', 'action' => 'delete'],

  // Cantons
  ['method' => 'GET', 'path' => '/cantons', 'controller' => 'CantonController', 'action' => 'index'],

  ['method' => 'GET', 'path' => '/admin/cantons/{id}', 'controller' => 'CantonController', 'action' => 'show'],
  ['method' => 'GET', 'path' => '/admin/cantons/snit/{code}', 'controller' => 'CantonController', 'action' => 'showBySnitCode'],
  ['method' => 'POST', 'path' => '/admin/cantons', 'controller' => 'CantonController', 'action' => 'store'],
  ['method' => 'PUT', 'path' => '/admin/cantons/{id}', 'controller' => 'CantonController', 'action' => 'update'],
  ['method' => 'DELETE', 'path' => '/admin/cantons/{id}', 'controller' => 'CantonController', 'action' => 'delete'],

  // Districts
  ['method' => 'GET', 'path' => '/districts', 'controller' => 'DistrictController', 'action' => 'index'],
  ['method' => 'GET', 'path' => '/admin/districts/{id}', 'controller' => 'DistrictController', 'action' => 'show'],
  ['method' => 'GET', 'path' => '/admin/districts/snit/{code}', 'controller' => 'DistrictController', 'action' => 'showBySnitCode'],
  ['method' => 'POST', 'path' => '/admin/districts', 'controller' => 'DistrictController', 'action' => 'store'],
  ['method' => 'PUT', 'path' => '/admin/districts/{id}', 'controller' => 'DistrictController', 'action' => 'update'],
  ['method' => 'DELETE', 'path' => '/admin/districts/{id}', 'controller' => 'DistrictController', 'action' => 'delete'],

  // Geomanifestations View (Public data)
  ['method' => 'GET', 'path' => '/geomanifestations', 'controller' => 'GeomanifestationController', 'action' => 'viewIndex'],
  ['method' => 'GET', 'path' => '/geomanifestations/{id}', 'controller' => 'GeomanifestationController', 'action' => 'viewShow'],

  // Geomanifestations admin
  ['method' => 'GET', 'path' => '/admin/geomanifestations', 'controller' => 'GeomanifestationController', 'action' => 'index'],
  ['method' => 'GET', 'path' => '/admin/geomanifestations/{id}', 'controller'
  => 'GeomanifestationController', 'action' => 'show'],
  ['method' => 'POST', 'path' => '/admin/geomanifestations', 'controller' => 'GeomanifestationController', 'action' => 'store'],
  ['method' => 'PUT', 'path' => '/admin/geomanifestations/{id}', 'controller'
  => 'GeomanifestationController', 'action' => 'update'],
  ['method' => 'DELETE', 'path' => '/admin/geomanifestations/{id}', 'controller' => 'GeomanifestationController', 'action' => 'delete'],
  ['method' => 'PATCH', 'path' => '/admin/geomanifestations/{id}/visibility',
    'controller' => 'GeomanifestationController', 'action' => 'setVisibility'],

  // Insitu Tests
  ['method' => 'GET', 'path' => '/admin/insitu-tests', 'controller' => 'InsituTestController', 'action' => 'index'],
  ['method' => 'GET', 'path' => '/admin/insitu-tests/{id}', 'controller' => 'InsituTestController', 'action' => 'show'],
  ['method' => 'POST', 'path' => '/admin/insitu-tests', 'controller' => 'InsituTestController', 'action' => 'store'],
  ['method' => 'PUT', 'path' => '/admin/insitu-tests/{id}', 'controller' => 'InsituTestController', 'action' => 'update'],
  ['method' => 'DELETE', 'path' => '/admin/insitu-tests/{id}', 'controller' => 'InsituTestController', 'action' => 'delete'],

  // Inlab Tests
  ['method' => 'GET', 'path' => '/admin/inlab-tests', 'controller' => 'InlabTestController', 'action' => 'index'],
  ['method' => 'GET', 'path' => '/admin/inlab-tests/{id}', 'controller' => 'InlabTestController', 'action' => 'show'],
  ['method' => 'POST', 'path' => '/admin/inlab-tests', 'controller' => 'InlabTestController', 'action' => 'store'],
  ['method' => 'PUT', 'path' => '/admin/inlab-tests/{id}', 'controller' => 'InlabTestController', 'action' => 'update'],
  ['method' => 'DELETE', 'path' => '/admin/inlab-tests/{id}', 'controller' => 'InlabTestController', 'action' => 'delete'],

  // Georeports`
  ['method' => 'GET', 'path' => '/georeports', 'controller' => 'GeoreportController', 'action' => 'current'],

  ['method' => 'GET', 'path' => '/admin/georeports', 'controller' => 'GeoreportController', 'action' => 'index'],
  ['method' => 'GET', 'path' => '/admin/georeports/{id}', 'controller' => 'GeoreportController', 'action' => 'show'],
  ['method' => 'POST', 'path' => '/admin/georeports', 'controller' => 'GeoreportController', 'action' => 'store'],
  ['method' => 'PUT', 'path' => '/admin/georeports/{id}', 'controller' => 'GeoreportController', 'action' => 'update'],
  ['method' => 'DELETE', 'path' => '/admin/georeports/{id}', 'controller' => 'GeoreportController', 'action' => 'delete'],
];