<?php
// src/Controllers/AnalysisRequestController.php
declare(strict_types=1);

namespace Controllers;

use Http\Request;
use Http\Response;
use Http\ErrorType;
use Http\ApiException;
use DTO\AnalysisRequestDTO;
use OpenApi\Attributes as OA;
use Services\PermissionService;
use Services\AnalysisRequestService;
use DTO\PermissionsDTO as Permissions;

/**
 * Controller for handling analysis request related endpoints.
 */
#[OA\Tag(name: "Analysis Requests", description: "Gestión de solicitudes de análisis de puntos para GeoterRA")]
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
   */
  #[OA\Post(
    path: "/analysis-request",
    summary: "Crear una nueva solicitud de análisis",
    description: "Crea una solicitud vinculada al usuario autenticado.",
    security: [["cookieAuth" => []], ["tokenAuth" => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/AnalysisRequestDTO")
    ),
    responses: [
        new OA\Response(response: 201, description: "Solicitud creada exitosamente"),
        new OA\Response(response: 400, description: "Datos de entrada inválidos"),
        new OA\Response(response: 401, description: "No autenticado")
    ]
  )]
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
   */
  #[OA\Get(
    path: "/analysis-request",
    summary: "Listar solicitudes del usuario",
    description: "Retorna todas las solicitudes de análisis creadas por el usuario actual.",
    security: [["cookieAuth" => []], ["tokenAuth" => []]],
    responses: [
        new OA\Response(
            response: 200, 
            description: "Lista de solicitudes",
            content: new OA\JsonContent(type: "array", items: new OA\Items(ref: "#/components/schemas/AnalysisRequestDTO"))
        )
    ]
  )]
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
   * GET /analysis-request
   * Returns all analysis requests on the system, only if the authenticated user is an admin
   */
  #[OA\Get(
    path: "/admin/analysis-request",
    summary: "Listar todas las solicitudes (Admin)",
    description: "Endpoint exclusivo para administradores para visualizar el total de solicitudes en el sistema.",
    security: [["cookieAuth" => []], ["tokenAuth" => []]],
    responses: [
        new OA\Response(response: 200, description: "Listado completo para administración"),
        new OA\Response(response: 403, description: "Permisos insuficientes")
    ]
  )]
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
   * PUT /analysis-request/{id}
   * Updates an existing user's analysis request by ID, only if the authenticated user is an admin
   */
  #[OA\Put(
    path: "/analysis-request/{id}",
    summary: "Actualizar solicitud propia",
    security: [["cookieAuth" => []], ["tokenAuth" => []]],
    parameters: [
        new OA\Parameter(name: "id", in: "path", required: true, description: "ULID o ID de la solicitud", schema: new OA\Schema(type: "string"))
    ],
    requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/AnalysisRequestDTO")),
    responses: [
        new OA\Response(response: 200, description: "Actualización exitosa"),
        new OA\Response(response: 404, description: "Solicitud no encontrada")
    ]
  )]
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
   * DELETE /analysis-request/{id}
   * Deletes an user's analysis request by ID, only if the authenticated user is an admin
   */
  #[OA\Delete(
        path: "/analysis-request/{id}",
        summary: "Eliminar solicitud",
        security: [["cookieAuth" => []], ["tokenAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Eliminado correctamente")
        ]
  )]
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