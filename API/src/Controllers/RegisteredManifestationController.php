<?php
// src/Controllers/RegisteredManifestationController.php
declare(strict_types=1);

namespace Controllers;

use DTO\AllowedRegions;
use Services\RegisteredManifestationService;
use Services\AuthService;
use DTO\RegisteredManifestationDTO;
use Http\Response;
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
   * PUT /registered-manifestations
   */
  public function store(): void
  {
    try {
      // ===============================
      // Authorization
      // ===============================
      $headers = getallheaders();
      $token = trim(str_replace('Bearer ', '', $headers['Authorization'] ?? ''));

      if (!$token) {
        Response::error(ErrorType::missingAuthToken(), 401);
        return;
      }

      $session = $this->authService->validateToken($token);
      if (!$session) {
        Response::error(ErrorType::invalidToken(), 401);
        return;
      }

      $userId = (int) $session['user_id'];

      // ===============================
      // Body parsing
      // ===============================
      $body = json_decode(file_get_contents('php://input'), true);
      if (!is_array($body)) {
        Response::error(ErrorType::invalidJson(), 400);
        return;
      }

      // ===============================
      // DTO + business logic
      // ===============================
      $dto = RegisteredManifestationDTO::fromArray($body);
      $this->service->create($dto, $userId);

      Response::success(
        data: ['id' => $dto->id],
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
      $headers = getallheaders();
      $token = trim(str_replace('Bearer ', '', $headers['Authorization'] ?? ''));

      if (!$token) {
        Response::error(ErrorType::missingAuthToken(), 401);
        return;
      }

      $session = $this->authService->validateToken($token);
      if (!$session) {
        Response::error(ErrorType::invalidToken(), 401);
        return;
      }

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
}
