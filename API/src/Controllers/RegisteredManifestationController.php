<?php
// src/Controllers/RegisteredManifestationController.php
declare(strict_types=1);

namespace Controllers;

use DTO\AllowedRegions;
use Services\RegisteredManifestationService;
use Services\AuthService;
use DTO\RegisteredManifestationDTO;
use Http\Response;
use Http\Request;
use DTO\AllowedUserRoles;

use Http\ErrorType;
use Http\ApiException;

/**
 * Controller for Registered Geothermal Manifestations endpoints
 */
final class RegisteredManifestationController
{
  public function __construct(
    private RegisteredManifestationService $service,
    private AuthService $authService
  ) {}

  /**
   * POST /registered-manifestations
   */
  public function store(): void
  {
    try {
      // ===============================
      // Authorization
      // ===============================
      $auth = $this->authService->requireAuth();

      $userId = (string) $auth['user_id'];

      $user = $this->authService->findUserById($userId);
      $userRole = (string)$user['role'];

      if ($userRole !== AllowedUserRoles::ADMIN) {
        Response::error(ErrorType::forbidden(), 403);
        return;

      }

      // ===============================
      // Body parsing
      // ===============================
      $body = Request::parseJsonRequest();

      // ===============================
      // DTO + business logic
      // ===============================
      $dto = RegisteredManifestationDTO::fromArray($body);
      $this->service->create($dto, $userId);

      Response::success(
        data: ['success' => true ],
        meta: null,
        status: 201
      );

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());

    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /registered-manifestations?region={region}
   * Returns registered manifestations filtered by region
   */
  public function index(): void
  {
    try {
      // ===============================
      // Authorization
      // ===============================
      $auth = $this->authService->requireAuth();

      // ===============================
      // Query parameter parsing
      // ===============================
      $region = isset($_GET['region']) ? trim((string) $_GET['region']) : '';

      if (!AllowedRegions::isValid($region)) {
        Response::error(
          ErrorType::invalidRegion(region: $region),
          422
        );
        return;
      }

      // ===============================
      // Fetch data
      // ===============================
      $manifestations = $this->service->getAllByRegion($region);

      Response::success(data: $manifestations);

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());

    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /registered-manifestations/{id}
   */
  public function update(string $id): void
  {
    try {
      // ---------------------------------
      // Authorization
      // ---------------------------------
      $auth = $this->authService->requireAuth();

      $userId = (string) $auth['user_id'];
      $user = $this->authService->findUserById($userId);

      if ($user['role'] !== AllowedUserRoles::ADMIN) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

      // ---------------------------------
      // Body parsing
      // ---------------------------------
      $body = Request::parseJsonRequest();

      $dto = RegisteredManifestationDTO::fromArray($body);

      // ---------------------------------
      // Business logic
      // ---------------------------------
      $this->service->update($dto, $id, $userId);

      Response::success(
        data: ['id' => $id],
        meta: ['updated' => true]
      );

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
  
  /**
   * DELETE /registered-manifestations/{id}
   */
  public function delete(string $id): void
  {
    try {
      // ---------------------------------
      // Authorization
      // ---------------------------------
      $auth = $this->authService->requireAuth();

      $userId = (string) $auth['user_id'];
      $user = $this->authService->findUserById($userId);

      if ($user['role'] !== AllowedUserRoles::ADMIN) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

      // ---------------------------------
      // Business logic
      // ---------------------------------
      $this->service->delete($id, $userId);

      Response::success(
        data: null,
        meta: ['deleted' => true]
      );

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

}
