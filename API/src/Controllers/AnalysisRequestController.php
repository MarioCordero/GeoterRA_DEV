<?php
// src/Controllers/AnalysisRequestController.php
declare(strict_types=1);

namespace Controllers;

use Http\Request;
use Http\Response;
use Http\ErrorType;
use Http\ApiException;
use DTO\AnalysisRequestDTO;
use OpenApi\Annotations as OA;
use Services\PermissionService;
use Services\AnalysisRequestService;
use DTO\PermissionsDTO as Permissions;

/**
 * Controller for handling analysis request related endpoints.
 *
 * @OA\Tag(
 * name="Analysis Requests",
 * description="Gestión de solicitudes de análisis de puntos para GeoterRA"
 * )
 */
final class AnalysisRequestController
{
  private AnalysisRequestService $service;
  public function __construct(private \PDO $pdo)
  {
    $this->service = new AnalysisRequestService($this->pdo);
  }

  /**
   * POST /analysis-request
   * Creates a new analysis request for the authenticated user
   *
   * @OA\Post(
   * path="/analysis-request",
   * summary="Crear una nueva solicitud de análisis",
   * description="Crea una solicitud vinculada al usuario autenticado.",
   * tags={"Analysis Requests"},
   * security={{"cookieAuth": {}}, {"tokenAuth": {}}},
   * @OA\RequestBody(
   * required=true,
   * @OA\JsonContent(
   * ref="#/components/schemas/AnalysisRequestDTO",
   * example={
   * "region": 1,
   * "email": "user@example.com",
   * "owner_contact_number": "87654321",
   * "owner_name": "Carlos Mendoza",
   * "temperature_sensation": "Cálido",
   * "bubbles": false,
   * "details": "Zona con actividad geotérmica notable",
   * "current_usage": "Agrícola",
   * "latitude": 10.4630,
   * "longitude": -85.4519,
   * "state": "Registrada"
   * }
   * )
   * ),
   * @OA\Response(
   * response=201,
   * description="Solicitud creada exitosamente",
   * @OA\JsonContent(
   * @OA\Property(property="message", type="string", example="Analysis request created successfully"),
   * @OA\Property(property="data", type="object")
   * )
   * ),
   * @OA\Response(response=400, description="Datos de entrada inválidos"),
   * @OA\Response(response=401, description="No autenticado"),
   * @OA\Response(response=500, description="Error interno del servidor")
   * )
   */
  public function store(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = AnalysisRequestDTO::fromArray($body);
      $this->service->create($dto);
      Response::success(['message' => 'Analysis request created successfully'], [], 201); // Use http response code 201 for created?
    } catch (ApiException $e) {
        Response::error($e->getError(), 400);
    } catch (\Throwable $e) {
         Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /analysis-request
   * Returns all analysis requests created by the authenticated user
   *
   * @OA\Get(
   * path="/analysis-request",
   * summary="Listar solicitudes del usuario",
   * description="Retorna todas las solicitudes de análisis creadas por el usuario actual.",
   * tags={"Analysis Requests"},
   * security={{"cookieAuth": {}}, {"tokenAuth": {}}},
   * @OA\Response(
   * response=200, 
   * description="Lista de solicitudes",
   * @OA\JsonContent(
   * type="array",
   * @OA\Items(ref="#/components/schemas/AnalysisRequestDTO"),
   * example={
   * {
   * "region": 1,
   * "email": "user@example.com",
   * "owner_contact_number": "87654321",
   * "owner_name": "Carlos Mendoza",
   * "temperature_sensation": "Cálido",
   * "bubbles": false,
   * "details": "Zona con actividad geotérmica notable",
   * "current_usage": "Agrícola",
   * "latitude": 10.4630,
   * "longitude": -85.4519,
   * "state": "Registrada"
   * }
   * }
   * )
   * ),
   * @OA\Response(response=401, description="No autenticado"),
   * @OA\Response(response=500, description="Error interno del servidor")
   * )
   */
  public function index(): void
  {
    try {
      $requests = $this->service->getAllByUser();
      Response::success(data: $requests);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /analysis-request/{id}
   * Returns a specific analysis request if it belongs to the authenticated user
   *
   * @OA\Get(
   * path="/analysis-request/{id}",
   * summary="Obtener solicitud específica",
   * description="Retorna una solicitud de análisis específica si pertenece al usuario autenticado.",
   * tags={"Analysis Requests"},
   * security={{"cookieAuth": {}}, {"tokenAuth": {}}},
   * @OA\Parameter(
   * name="id",
   * in="path",
   * required=true,
   * description="ULID o ID de la solicitud",
   * @OA\Schema(type="string")
   * ),
   * @OA\Response(
   * response=200,
   * description="Solicitud encontrada",
   * @OA\JsonContent(ref="#/components/schemas/AnalysisRequestDTO")
   * ),
   * @OA\Response(response=401, description="No autenticado"),
   * @OA\Response(response=404, description="Solicitud no encontrada"),
   * @OA\Response(response=500, description="Error interno del servidor")
   * )
   */
  public function show(string $id): void
  {
    try {
      $request = $this->service->getById($id);
      Response::success(data: $request);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /admin/analysis-request/{id}
   * Returns a specific analysis request for admin/maintenance users
   *
   * @OA\Get(
   * path="/admin/analysis-request/{id}",
   * summary="Obtener solicitud específica (Admin)",
   * description="Retorna una solicitud de análisis específica. Requiere permisos de administrador.",
   * tags={"Analysis Requests"},
   * security={{"cookieAuth": {}}, {"tokenAuth": {}}},
   * @OA\Parameter(
   * name="id",
   * in="path",
   * required=true,
   * description="ULID o ID de la solicitud",
   * @OA\Schema(type="string")
   * ),
   * @OA\Response(
   * response=200,
   * description="Solicitud encontrada",
   * @OA\JsonContent(ref="#/components/schemas/AnalysisRequestDTO")
   * ),
   * @OA\Response(response=401, description="No autenticado"),
   * @OA\Response(response=403, description="Permisos insuficientes"),
   * @OA\Response(response=404, description="Solicitud no encontrada"),
   * @OA\Response(response=500, description="Error interno del servidor")
   * )
   */
  public function adminShow(string $id): void
  {
    try {
      $request = $this->service->adminGetById($id);
      Response::success(data: $request);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /admin/analysis-request
   * Returns all analysis requests on the system, only if the authenticated user is an admin
   *
   * @OA\Get(
   * path="/admin/analysis-request",
   * summary="Listar todas las solicitudes (Admin)",
   * description="Endpoint exclusivo para administradores para visualizar el total de solicitudes en el sistema.",
   * tags={"Analysis Requests"},
   * security={{"cookieAuth": {}}, {"tokenAuth": {}}},
   * @OA\Response(
   * response=200, 
   * description="Listado completo para administración",
   * @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/AnalysisRequestDTO"))
   * ),
   * @OA\Response(response=401, description="No autenticado"),
   * @OA\Response(response=403, description="Permisos insuficientes"),
   * @OA\Response(response=500, description="Error interno del servidor")
   * )
   */
  public function adminIndex(): void
  {
    try {
      $user = Request::getUser();
      
      // Debug logging
      if (!$user) {
        error_log('[AnalysisRequestController: adminIndex] ❌ User not authenticated');
        Response::error(ErrorType::forbidden(), 403);
        return;
      }
      $hasPermission = PermissionService::hasPermission($user['role'], Permissions::REVIEW_REQUESTS);
      if (!$hasPermission) {
        error_log('[AnalysisRequestController: adminIndex] ❌ Permission denied - User role "' . ($user['role'] ?? 'null') . '" does not have REVIEW_REQUESTS');
        Response::error(ErrorType::forbidden(), 403);
        return;
      }
      
      $requests = $this->service->getAll();
      Response::success(data: $requests);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /analysis-request/{id}
   * Updates an existing analysis request by ID, only if it belongs to the authenticated user
   *
   * @OA\Put(
   * path="/analysis-request/{id}",
   * summary="Actualizar solicitud propia",
   * description="Actualiza una solicitud existente que pertenece al usuario autenticado.",
   * tags={"Analysis Requests"},
   * security={{"cookieAuth": {}}, {"tokenAuth": {}}},
   * @OA\Parameter(
   * name="id",
   * in="path",
   * required=true,
   * description="ULID o ID de la solicitud",
   * @OA\Schema(type="string")
   * ),
   * @OA\RequestBody(
   * required=true,
   * @OA\JsonContent(ref="#/components/schemas/AnalysisRequestDTO")
   * ),
   * @OA\Response(response=200, description="Actualización exitosa"),
   * @OA\Response(response=400, description="Datos de entrada inválidos"),
   * @OA\Response(response=401, description="No autenticado"),
   * @OA\Response(response=404, description="Solicitud no encontrada"),
   * @OA\Response(response=500, description="Error interno del servidor")
   * )
   */
  public function update(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = AnalysisRequestDTO::fromArray($body);
      $this->service->update($id, $dto);
      Response::success(['message' => 'Analysis request updated successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /admin/analysis-request/{id}
   * Updates an existing user's analysis request by ID, only if the authenticated user is an admin
   *
   * @OA\Put(
   * path="/admin/analysis-request/{id}",
   * summary="Actualizar cualquier solicitud (Admin)",
   * description="Actualiza una solicitud específica. Requiere permisos de administrador (APPROVE_REQUESTS).",
   * tags={"Analysis Requests"},
   * security={{"cookieAuth": {}}, {"tokenAuth": {}}},
   * @OA\Parameter(
   * name="id",
   * in="path",
   * required=true,
   * description="ULID o ID de la solicitud a actualizar",
   * @OA\Schema(type="string")
   * ),
   * @OA\RequestBody(
   * required=true,
   * @OA\JsonContent(ref="#/components/schemas/AnalysisRequestDTO")
   * ),
   * @OA\Response(response=200, description="Actualización exitosa"),
   * @OA\Response(response=400, description="Datos de entrada inválidos"),
   * @OA\Response(response=401, description="No autenticado"),
   * @OA\Response(response=403, description="Permisos insuficientes"),
   * @OA\Response(response=404, description="Solicitud no encontrada"),
   * @OA\Response(response=500, description="Error interno del servidor")
   * )
   */
  public function adminUpdate(string $id): void
  {
    try {
      $user = Request::getUser();
      if (!$user || !PermissionService::hasPermission($user['role'], Permissions::APPROVE_REQUESTS)) {
        Response::error(ErrorType::forbidden(), 403);
      }
      
      $body = Request::parseJsonRequest();
      $dto = AnalysisRequestDTO::fromArray($body);
      $this->service->adminUpdate($id, $dto);
      Response::success(['message' => 'Analysis request updated successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /analysis-request/{id}
   * Deletes an analysis request by ID, only if it belongs to the authenticated user
   *
   * @OA\Delete(
   * path="/analysis-request/{id}",
   * summary="Eliminar solicitud propia",
   * description="Elimina una solicitud de análisis que pertenece al usuario autenticado.",
   * tags={"Analysis Requests"},
   * security={{"cookieAuth": {}}, {"tokenAuth": {}}},
   * @OA\Parameter(
   * name="id",
   * in="path",
   * required=true,
   * description="ULID o ID de la solicitud a eliminar",
   * @OA\Schema(type="string")
   * ),
   * @OA\Response(response=200, description="Eliminada correctamente"),
   * @OA\Response(response=401, description="No autenticado"),
   * @OA\Response(response=404, description="Solicitud no encontrada"),
   * @OA\Response(response=500, description="Error interno del servidor")
   * )
   */
  public function delete(string $id): void
  {
    try {
      $this->service->delete($id);
      Response::success(['message' => 'Analysis request deleted successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /admin/analysis-request/{id}
   * Deletes an user's analysis request by ID, only if the authenticated user is an admin
   *
   * @OA\Delete(
   * path="/admin/analysis-request/{id}",
   * summary="Eliminar cualquier solicitud (Admin)",
   * description="Elimina cualquier solicitud. Requiere permisos de administrador (DELETE_REQUESTS).",
   * tags={"Analysis Requests"},
   * security={{"cookieAuth": {}}, {"tokenAuth": {}}},
   * @OA\Parameter(
   * name="id",
   * in="path",
   * required=true,
   * description="ULID o ID de la solicitud a eliminar",
   * @OA\Schema(type="string")
   * ),
   * @OA\Response(response=200, description="Eliminada correctamente"),
   * @OA\Response(response=401, description="No autenticado"),
   * @OA\Response(response=403, description="Permisos insuficientes"),
   * @OA\Response(response=404, description="Solicitud no encontrada"),
   * @OA\Response(response=500, description="Error interno del servidor")
   * )
   */
  public function adminDelete(string $id): void
  {
    try {
      $user = Request::getUser();
      if (!$user || !PermissionService::hasPermission($user['role'], Permissions::DELETE_REQUESTS)) {
        Response::error(ErrorType::forbidden(), 403);
      }
      
      $this->service->adminDelete($id);
      Response::success(['message' => 'Analysis request deleted successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}