<?php

return [
  // ==========================================
  // 1. Auth (Autenticación y sesiones)
  // ==========================================
  // 1.1 Autentica un usuario y retorna credenciales [No requerida]
  ['method' => 'POST', 'path' => '/auth/login', 'controller' => 'AuthController', 'action' => 'login'],
  // 1.2 Renueva tokens de acceso usando refresh token [No requerida]
  ['method' => 'POST', 'path' => '/auth/refresh', 'controller' => 'AuthController', 'action' => 'refresh'],
  // 1.3 Cierra la sesión activa del usuario [Requerida]
  ['method' => 'POST', 'path' => '/auth/logout', 'controller' => 'AuthController', 'action' => 'logout'],
  // 1.4 Solicita envío de correo para restablecer contraseña [No requerida]
  ['method' => 'POST', 'path' => '/auth/password-reset/request', 'controller' => 'AuthController', 'action' => 'requestPasswordReset'],
  // 1.5 Cambia la contraseña mediante token OTP [No requerida]
  ['method' => 'POST', 'path' => '/auth/password-reset/reset', 'controller' => 'AuthController', 'action' => 'resetPassword'],

  // ==========================================
  // 2. Users (Gestión de usuarios)
  // ==========================================
  // 2.1 Crea una nueva cuenta de usuario [No requerida]
  ['method' => 'POST', 'path' => '/users/register', 'controller' => 'UserController', 'action' => 'register'],
  // 2.2 Retorna datos del usuario autenticado [Requerida]
  ['method' => 'GET', 'path' => '/users/me', 'controller' => 'UserController', 'action' => 'show'],
  // 2.3 Actualiza el perfil del usuario autenticado [Requerida]
  ['method' => 'PUT', 'path' => '/users/me', 'controller' => 'UserController', 'action' => 'update'],
  // 2.4 Actualiza la contraseña del usuario autenticado [Requerida]
  ['method' => 'PUT', 'path' => '/users/me/password', 'controller' => 'UserController', 'action' => 'updatePassword'],
  // 2.5 Realiza soft-delete de la cuenta del usuario autenticado [Requerida]
  ['method' => 'DELETE', 'path' => '/users/me', 'controller' => 'UserController', 'action' => 'delete'],
  // 2.6 Restaura una cuenta eliminada [No requerida]
  ['method' => 'POST', 'path' => '/users/restore', 'controller' => 'UserController', 'action' => 'restore'],
  // 2.7 Retorna datos de sesión del usuario autenticado [Requerida]
  ['method' => 'GET', 'path' => '/users/me/session', 'controller' => 'UserController', 'action' => 'showSession'],
  // 2.8 Actualiza el rol de un usuario [Admin]
  ['method' => 'PUT', 'path' => '/admin/users/{id}/role', 'controller' => 'UserController', 'action' => 'adminUpdateRole'],

  // ==========================================
  // 3. Investigation Requests (Solicitudes de Investigación)
  // ==========================================
  // 3.1 Crea una nueva solicitud de investigación [Requerida]
  ['method' => 'POST', 'path' => '/analysis-requests', 'controller' => 'InvestigationRequestController', 'action' => 'store'],
  // 3.2 Retorna todas las solicitudes del usuario autenticado [Requerida]
  ['method' => 'GET', 'path' => '/analysis-requests', 'controller' => 'InvestigationRequestController', 'action' => 'index'],
  // 3.3 Retorna una solicitud específica del usuario autenticado [Requerida]
  ['method' => 'GET', 'path' => '/analysis-requests/{id}', 'controller' => 'InvestigationRequestController', 'action' => 'show'],
  // 3.4 Actualiza una solicitud existente [Requerida]
  ['method' => 'PUT', 'path' => '/analysis-requests/{id}', 'controller' => 'InvestigationRequestController', 'action' => 'update'],
  // 3.5 Elimina una solicitud del usuario autenticado [Requerida]
  ['method' => 'DELETE', 'path' => '/analysis-requests/{id}', 'controller' => 'InvestigationRequestController', 'action' => 'delete'],
  // 3.6 Retorna el historial de estados de una solicitud [Requerida]
  ['method' => 'GET', 'path' => '/analysis-requests/{id}/states', 'controller' => 'InvestigationRequestController', 'action' => 'states'],
  // 3.7 Retorna todas las solicitudes del sistema [Admin]
  ['method' => 'GET', 'path' => '/admin/analysis-requests', 'controller' => 'InvestigationRequestController', 'action' => 'adminIndex'],
  // 3.8 Retorna cualquier solicitud por ID [Admin]
  ['method' => 'GET', 'path' => '/admin/analysis-requests/{id}', 'controller' => 'InvestigationRequestController', 'action' => 'adminShow'],
  // 3.9 Retorna el historial de estados de cualquier solicitud [Admin]
  ['method' => 'GET', 'path' => '/admin/analysis-requests/{id}/states', 'controller' => 'InvestigationRequestController', 'action' => 'adminStates'],
  // 3.10 Añade un nuevo estado a una solicitud [Admin]
  ['method' => 'POST', 'path' => '/admin/analysis-requests/{id}/states', 'controller' => 'InvestigationRequestController', 'action' => 'adminAddState'],

  // ==========================================
  // 4. Provinces (Provincias)
  // ==========================================
  // 4.1 Retorna todas las provincias del sistema [Público]
  ['method' => 'GET', 'path' => '/provinces', 'controller' => 'ProvinceController', 'action' => 'index'],
  // 4.2 Retorna una provincia por su ULID [Admin]
  ['method' => 'GET', 'path' => '/admin/provinces/{id}', 'controller' => 'ProvinceController', 'action' => 'show'],
  // 4.3 Retorna una provincia por su código SNIT [Admin]
  ['method' => 'GET', 'path' => '/admin/provinces/snit/{code}', 'controller' => 'ProvinceController', 'action' => 'showBySnitCode'],
  // 4.4 Crea una nueva provincia [Admin]
  ['method' => 'POST', 'path' => '/admin/provinces', 'controller' => 'ProvinceController', 'action' => 'store'],
  // 4.5 Actualiza una provincia existente [Admin]
  ['method' => 'PUT', 'path' => '/admin/provinces/{id}', 'controller' => 'ProvinceController', 'action' => 'update'],
  // 4.6 Elimina una provincia [Admin]
  ['method' => 'DELETE', 'path' => '/admin/provinces/{id}', 'controller' => 'ProvinceController', 'action' => 'delete'],

  // ==========================================
  // 5. Cantons (Cantones)
  // ==========================================
  // 5.1 Retorna todos los cantones [Público]
  ['method' => 'GET', 'path' => '/cantons', 'controller' => 'CantonController', 'action' => 'index'],
  // 5.2 Retorna un cantón por su ULID [Admin]
  ['method' => 'GET', 'path' => '/admin/cantons/{id}', 'controller' => 'CantonController', 'action' => 'show'],
  // 5.3 Retorna un cantón por su código SNIT [Admin]
  ['method' => 'GET', 'path' => '/admin/cantons/snit/{code}', 'controller' => 'CantonController', 'action' => 'showBySnitCode'],
  // 5.4 Crea un nuevo cantón [Admin]
  ['method' => 'POST', 'path' => '/admin/cantons', 'controller' => 'CantonController', 'action' => 'store'],
  // 5.5 Actualiza un cantón existente [Admin]
  ['method' => 'PUT', 'path' => '/admin/cantons/{id}', 'controller' => 'CantonController', 'action' => 'update'],
  // 5.6 Elimina un cantón [Admin]
  ['method' => 'DELETE', 'path' => '/admin/cantons/{id}', 'controller' => 'CantonController', 'action' => 'delete'],

  // ==========================================
  // 6. Districts (Distritos)
  // ==========================================
  // 6.1 Retorna todos los distritos [Público]
  ['method' => 'GET', 'path' => '/districts', 'controller' => 'DistrictController', 'action' => 'index'],
  // 6.2 Retorna un distrito por su ULID [Admin]
  ['method' => 'GET', 'path' => '/admin/districts/{id}', 'controller' => 'DistrictController', 'action' => 'show'],
  // 6.3 Retorna un distrito por su código SNIT [Admin]
  ['method' => 'GET', 'path' => '/admin/districts/snit/{code}', 'controller' => 'DistrictController', 'action' => 'showBySnitCode'],
  // 6.4 Crea un nuevo distrito [Admin]
  ['method' => 'POST', 'path' => '/admin/districts', 'controller' => 'DistrictController', 'action' => 'store'],
  // 6.5 Actualiza un distrito existente [Admin]
  ['method' => 'PUT', 'path' => '/admin/districts/{id}', 'controller' => 'DistrictController', 'action' => 'update'],
  // 6.6 Elimina un distrito [Admin]
  ['method' => 'DELETE', 'path' => '/admin/districts/{id}', 'controller' => 'DistrictController', 'action' => 'delete'],

  // ==========================================
  // 7. Geomanifestations (Geomanifestaciones)
  // ==========================================
  // 7.1 Listado público de manifestaciones visibles [Público]
  ['method' => 'GET', 'path' => '/geomanifestations', 'controller' => 'GeomanifestationController', 'action' => 'viewIndex'],
  // 7.2 Detalle público de manifestación [Público]
  ['method' => 'GET', 'path' => '/geomanifestations/{id}', 'controller' => 'GeomanifestationController', 'action' => 'viewShow'],
  // 7.3 Listado de todas las manifestaciones (incluye ocultas) [Admin]
  ['method' => 'GET', 'path' => '/admin/geomanifestations', 'controller' => 'GeomanifestationController', 'action' => 'index'],
  // 7.4 Detalle de manifestación por ID [Admin]
  ['method' => 'GET', 'path' => '/admin/geomanifestations/{id}', 'controller' => 'GeomanifestationController', 'action' => 'show'],
  // 7.5 Crea una nueva manifestación geotermal [Admin]
  ['method' => 'POST', 'path' => '/admin/geomanifestations', 'controller' => 'GeomanifestationController', 'action' => 'store'],
  // 7.6 Actualiza una manifestación existente [Admin]
  ['method' => 'PUT', 'path' => '/admin/geomanifestations/{id}', 'controller' => 'GeomanifestationController', 'action' => 'update'],
  // 7.7 Elimina permanentemente una manifestación [Admin]
  ['method' => 'DELETE', 'path' => '/admin/geomanifestations/{id}', 'controller' => 'GeomanifestationController', 'action' => 'delete'],
  // 7.8 Cambia la visibilidad pública de una manifestación [Admin]
  ['method' => 'PATCH', 'path' => '/admin/geomanifestations/{id}/visibility', 'controller' => 'GeomanifestationController', 'action' => 'setVisibility'],

  // ==========================================
  // 8. In-Situ Tests (Pruebas In-Situ)
  // ==========================================
  // 8.1 Retorna todas las pruebas in-situ de una manifestación [Admin]
  ['method' => 'GET', 'path' => '/admin/insitu-tests', 'controller' => 'InsituTestController', 'action' => 'index'],
  // 8.2 Retorna una prueba in-situ específica [Admin]
  ['method' => 'GET', 'path' => '/admin/insitu-tests/{id}', 'controller' => 'InsituTestController', 'action' => 'show'],
  // 8.3 Crea una nueva prueba in-situ [Admin]
  ['method' => 'POST', 'path' => '/admin/insitu-tests', 'controller' => 'InsituTestController', 'action' => 'store'],
  // 8.4 Actualiza una prueba in-situ existente [Admin]
  ['method' => 'PUT', 'path' => '/admin/insitu-tests/{id}', 'controller' => 'InsituTestController', 'action' => 'update'],
  // 8.5 Elimina una prueba in-situ [Admin]
  ['method' => 'DELETE', 'path' => '/admin/insitu-tests/{id}', 'controller' => 'InsituTestController', 'action' => 'delete'],

  // ==========================================
  // 9. In-Lab Tests (Pruebas de Laboratorio)
  // ==========================================
  // 9.1 Retorna todas las pruebas de laboratorio de una manifestación [Admin]
  ['method' => 'GET', 'path' => '/admin/inlab-tests', 'controller' => 'InlabTestController', 'action' => 'index'],
  // 9.2 Retorna una prueba de laboratorio específica [Admin]
  ['method' => 'GET', 'path' => '/admin/inlab-tests/{id}', 'controller' => 'InlabTestController', 'action' => 'show'],
  // 9.3 Crea una nueva prueba de laboratorio [Admin]
  ['method' => 'POST', 'path' => '/admin/inlab-tests', 'controller' => 'InlabTestController', 'action' => 'store'],
  // 9.4 Actualiza una prueba de laboratorio existente [Admin]
  ['method' => 'PUT', 'path' => '/admin/inlab-tests/{id}', 'controller' => 'InlabTestController', 'action' => 'update'],
  // 9.5 Elimina una prueba de laboratorio [Admin]
  ['method' => 'DELETE', 'path' => '/admin/inlab-tests/{id}', 'controller' => 'InlabTestController', 'action' => 'delete'],

  // ==========================================
  // 10. Georeports (Georeportes)
  // ==========================================
  // 10.1 Retorna el georeporte vigente de una manifestación [Público]
  ['method' => 'GET', 'path' => '/georeports', 'controller' => 'GeoreportController', 'action' => 'current'],
  // 10.2 Retorna todos los georeportes de una manifestación [Admin]
  ['method' => 'GET', 'path' => '/admin/georeports', 'controller' => 'GeoreportController', 'action' => 'index'],
  // 10.3 Retorna un georeporte específico [Admin]
  ['method' => 'GET', 'path' => '/admin/georeports/{id}', 'controller' => 'GeoreportController', 'action' => 'show'],
  // 10.4 Crea un nuevo georeporte [Admin]
  ['method' => 'POST', 'path' => '/admin/georeports', 'controller' => 'GeoreportController', 'action' => 'store'],
  // 10.5 Actualiza un georeporte existente [Admin]
  ['method' => 'PUT', 'path' => '/admin/georeports/{id}', 'controller' => 'GeoreportController', 'action' => 'update'],
  // 10.6 Elimina un georeporte [Admin]
  ['method' => 'DELETE', 'path' => '/admin/georeports/{id}', 'controller' => 'GeoreportController', 'action' => 'delete'],
  // 10.7 Promueve un georeporte como vigente y propaga visibilidad [Admin]
  ['method' => 'PATCH', 'path' => '/admin/georeports/{id}/promote', 'controller' => 'GeoreportController', 'action' => 'promote'],

  // ==========================================
  // 11. Maintenance (Mantenimiento)
  // ==========================================
  // 11.1 Retorna información del dashboard administrativo [Admin / Maintenance]
  ['method' => 'GET', 'path' => '/maintenance/dashboard', 'controller' => 'MaintenanceController', 'action' => 'getDashboardInfo'],
  // 11.2 Retorna todos los usuarios registrados [Admin / Maintenance]
  ['method' => 'GET', 'path' => '/maintenance/users', 'controller' => 'MaintenanceController', 'action' => 'showAllUsers'],
  // 11.3 Retorna logs del sistema [Admin / Maintenance]
  ['method' => 'GET', 'path' => '/maintenance/system/logs', 'controller' => 'MaintenanceController', 'action' => 'getSystemLogs'],
  // 11.4 Retorna información de todas las tablas de la BD [Admin / Maintenance]
  ['method' => 'GET', 'path' => '/maintenance/database/tables', 'controller' => 'MaintenanceController', 'action' => 'getAllDatabaseTables'],

  // ==========================================
  // 12. Field Trips (Giras de Campo)
  // ==========================================
  // 12.1 Retorna listado paginado de giras de campo [Admin / Investigator / Maintenance]
  ['method' => 'GET', 'path' => '/field-trips', 'controller' => 'FieldTripController', 'action' => 'index'],
  // 12.2 Retorna listado de giras asignadas al usuario autenticado [Requerida]
  ['method' => 'GET', 'path' => '/field-trips/my', 'controller' => 'FieldTripController', 'action' => 'myFieldTrips'],
  // 12.3 Retorna una gira de campo por ID con participantes y manifestaciones [Requerida]
  ['method' => 'GET', 'path' => '/field-trips/{id}', 'controller' => 'FieldTripController', 'action' => 'show'],
  // 12.4 Crea una nueva gira de campo [Admin / Investigator]
  ['method' => 'POST', 'path' => '/field-trips', 'controller' => 'FieldTripController', 'action' => 'store'],
  // 12.5 Actualiza una gira de campo existente [Admin / Investigator]
  ['method' => 'PUT', 'path' => '/field-trips/{id}', 'controller' => 'FieldTripController', 'action' => 'update'],
  // 12.6 Cambia el estado activo/inactivo de una gira [Admin / Investigator]
  ['method' => 'PATCH', 'path' => '/field-trips/{id}/active', 'controller' => 'FieldTripController', 'action' => 'toggleActive'],
  // 12.7 Agrega un participante a una gira [Admin / Investigator]
  ['method' => 'POST', 'path' => '/field-trips/{id}/participants', 'controller' => 'FieldTripController', 'action' => 'addParticipant'],
  // 12.8 Remueve un participante de una gira [Admin / Investigator]
  ['method' => 'DELETE', 'path' => '/field-trips/{id}/participants/{userId}', 'controller' => 'FieldTripController', 'action' => 'removeParticipant'],
  // 12.9 Asocia una manifestación a una gira [Admin / Investigator]
  ['method' => 'POST', 'path' => '/field-trips/{id}/geomanifestations', 'controller' => 'FieldTripController', 'action' => 'linkManifestation'],
  // 12.10 Desvincula una manifestación de una gira [Admin / Investigator]
  ['method' => 'DELETE', 'path' => '/field-trips/{id}/geomanifestations/{gmId}', 'controller' => 'FieldTripController', 'action' => 'unlinkManifestation'],
  // 12.11 Elimina una gira de campo (creador o admin) [Admin / Investigator]
  ['method' => 'DELETE', 'path' => '/field-trips/{id}', 'controller' => 'FieldTripController', 'action' => 'delete'],
  // 12.12 Elimina permanentemente una gira de campo [Admin]
  // ['method' => 'DELETE', 'path' => '/admin/field-trips/{id}', 'controller' => 'FieldTripController', 'action' => 'delete'], //DEPRECATED

  // ==========================================
  // 13. Comments (Comentarios)
  // ==========================================
  // 13.1 Retorna comentarios de una entidad (field_trip, request, geomanifestation) [Requerida]
  ['method' => 'GET', 'path' => '/comments/{entity_type}/{entity_id}', 'controller' => 'CommentController', 'action' => 'index'],
  // 13.2 Crea un nuevo comentario en una entidad [Requerida]
  ['method' => 'POST', 'path' => '/comments/{entity_type}/{entity_id}', 'controller' => 'CommentController', 'action' => 'store'],
  // 13.3 Edita un comentario por ID (autor o admin) [Requerida]
  ['method' => 'PUT', 'path' => '/comments/{id}', 'controller' => 'CommentController', 'action' => 'update'],
  // 13.4 Elimina un comentario por ID (autor o admin) [Requerida]
  ['method' => 'DELETE', 'path' => '/comments/{id}', 'controller' => 'CommentController', 'action' => 'delete'],
  // 13.5 Elimina un comentario por ID [Admin]
  // ['method' => 'DELETE', 'path' => '/admin/comments/{id}', 'controller' => 'CommentController', 'action' => 'delete'], // DEPRECATED
];