<?php
declare(strict_types=1);

namespace Controllers;

use DTO\RegisterGeomanifestationDTO;
use DTO\UpdateGeomanifestationDTO;
use DTO\PermissionsDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use Services\GeomanifestationService;
use Services\PermissionService;
use PDO;

/**
 * Controller for geothermal manifestation endpoints.
 */
final class GeomanifestationController
{
  private GeomanifestationService $service;

  public function __construct(private PDO $pdo)
  {
    $this->service = new GeomanifestationService($pdo);
  }

  /**
   * GET /geomanifestations
   * Returns all visible manifestations (public) with pagination and optional province filter.
   */
  public function index(): void
  {
    try {
      $page = (int) ($_GET['page'] ?? 1);
      $limit = (int) ($_GET['limit'] ?? 20);
      $provinceSnitCode = isset(
        $_GET['province_snit_code']
      ) ? (int) $_GET['province_snit_code'] : null;

      if ($provinceSnitCode !== null) {
        $result = $this->service->getByProvince(
          $provinceSnitCode,
          $page,
          $limit
        );
      } else {
        $result = $this->service->getAllVisible($page, $limit);
      }
      Response::success($result);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /admin/geomanifestations
   * Returns all manifestations (including hidden) – admin only, with pagination.
   */
  public function adminIndex(): void
  {
    try {
      $page = (int) ($_GET['page'] ?? 1);
      $limit = (int) ($_GET['limit'] ?? 20);
      $result = $this->service->getAll($page, $limit);
      Response::success($result);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /geomanifestations/{id}
   * Returns a single manifestation from base table.
   */
  public function show(string $id): void
  {
    try {
      $includeHidden = false;
      try {
        $user = Request::getUser();
        $includeHidden = ($user['role'] ?? '') === 'admin';
      } catch (\Exception $e) {
        // Not authenticated
      }
      $manifestation = $this->service->getById($id, $includeHidden);
      Response::success($manifestation);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /admin/geomanifestations
   * Creates a new geothermal manifestation (admin only).
   */
  public function store(): void
  {
    try {

      $body = Request::parseJsonRequest();
      $dto = RegisterGeomanifestationDTO::fromArray($body);
      $this->service->create($dto);
      Response::success(['success' => true], null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /admin/geomanifestations/{id}
   * Updates an existing manifestation (admin only).
   */
  public function update(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = UpdateGeomanifestationDTO::fromArray($body);
      $this->service->update($id, $dto);
      Response::success(['updated' => true]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /admin/geomanifestations/{id}
   * Permanently deletes a manifestation (admin only).
   */
  public function delete(string $id): void
  {
    try {
      $this->service->delete($id);
      Response::success(['deleted' => true]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PATCH /admin/geomanifestations/{id}/visibility
   * Toggles the visibility of a manifestation (admin only).
   */
  public function setVisibility(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $visible = isset($body['visible']) && $body['visible'];
      $this->service->setVisibility($id, $visible);
      Response::success(['visibility_updated' => true]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  // ==================== New endpoints for enriched view ====================

  /**
   * GET /geomanifestations/view
   * Returns paginated enriched data from view_geomanifestations.
   * Public: only visible ones. Admin can see all by passing `?show_all=1`.
   */
  public function viewIndex(): void
  {
    try {
      $page = (int) ($_GET['page'] ?? 1);
      $limit = (int) ($_GET['limit'] ?? 20);
      $provinceSnitCode = isset($_GET['province_snit_code']) ? (int) $_GET['province_snit_code'] : null;
      $tempMin = isset($_GET['temp_min']) ? (float) $_GET['temp_min'] : null;
      $tempMax = isset($_GET['temp_max']) ? (float) $_GET['temp_max'] : null;
      $showAll = isset($_GET['show_all']) ? filter_var($_GET['show_all'], FILTER_VALIDATE_BOOLEAN) : false;

      $onlyVisible = !$showAll;

      $result = $this->service->getViewAllPaginated(
        $page,
        $limit,
        $provinceSnitCode,
        $tempMin,
        $tempMax,
        $onlyVisible
      );

      Response::success($result);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /geomanifestations/view/{id}
   * Returns a single enriched manifestation from the view.
   */
  public function viewShow(string $id): void
  {
    try {
      $data = $this->service->getViewById($id);
      Response::success($data);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}