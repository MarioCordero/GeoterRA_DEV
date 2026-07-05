<?php
declare(strict_types=1);

namespace Controllers;

use DTO\RegisterGeomanifestationDTO;
use DTO\UpdateGeomanifestationDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use PDO;
use Services\GeomanifestationService;
use Throwable;

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
   * GET /admin/geomanifestations
   * Returns all manifestations (including hidden) with pagination and optional filters.
   */
  public function index(): void
  {
    try {
      $page = (int)($_GET['page'] ?? 1);
      $limit = (int)($_GET['limit'] ?? 20);

      $provinceSnitCode = isset($_GET['province_snit_code']) ? (int)$_GET['province_snit_code'] : null;
      $cantonSnitCode = isset($_GET['canton_snit_code']) ? (int)$_GET['canton_snit_code'] : null;
      $districtSnitCode = isset($_GET['district_snit_code']) ? (int)$_GET['district_snit_code'] : null;

      // If any filter is provided, use the filtered method; otherwise getAll.
      if ($provinceSnitCode !== null || $cantonSnitCode !== null || $districtSnitCode !== null) {
        $result = $this->service->getViewAllPaginated(
          $page,
          $limit,
          $provinceSnitCode,
          $cantonSnitCode,
          $districtSnitCode,
          null,
          null,
          false // admin: show all, including hidden
        );
      } else {
        $result = $this->service->getAll($page, $limit);
      }

      Response::success($result);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /admin/geomanifestations/{id}
   * Returns a single manifestation (admin, includes hidden).
   *
   * @param string $id
   */
  public function show(string $id): void
  {
    try {
      $manifestation = $this->service->getById($id, true);
      Response::success($manifestation);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /admin/geomanifestations
   * Creates a new geothermal manifestation.
   */
  public function store(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = RegisterGeomanifestationDTO::fromArray($body);
      $result = $this->service->create($dto);
      Response::success($result, null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /admin/geomanifestations/{id}
   * Updates an existing manifestation.
   *
   * @param string $id
   */
  public function update(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = UpdateGeomanifestationDTO::fromArray($body);
      $result = $this->service->update($id, $dto);
      Response::success($result, null, 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /admin/geomanifestations/{id}
   * Permanently deletes a manifestation.
   *
   * @param string $id
   */
  public function delete(string $id): void
  {
    try {
      $this->service->delete($id);
      Response::success(['deleted' => true]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PATCH /admin/geomanifestations/{id}/visibility
   * Toggles the visibility of a manifestation.
   *
   * @param string $id
   */
  public function setVisibility(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $visible = isset($body['visibility']) ? filter_var(
        $body['visibility'],
        FILTER_VALIDATE_BOOLEAN
      ) : false;
      $result = $this->service->setVisibility($id, $visible);
      Response::success($result, null, 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /geomanifestations
   * Returns paginated enriched data from view_geomanifestations (public).
   * Only visible manifestations. Admin can see all by passing `?show_all=1`.
   */
  public function viewIndex(): void
  {
    try {
      $page = (int)($_GET['page'] ?? 1);
      $limit = (int)($_GET['limit'] ?? 20);

      $provinceSnitCode = isset($_GET['province_snit_code']) ? (int)$_GET['province_snit_code'] : null;
      $cantonSnitCode = isset($_GET['canton_snit_code']) ? (int)$_GET['canton_snit_code'] : null;
      $districtSnitCode = isset($_GET['district_snit_code']) ? (int)$_GET['district_snit_code'] : null;
      $tempMin = isset($_GET['temp_min']) ? (float)$_GET['temp_min'] : null;
      $tempMax = isset($_GET['temp_max']) ? (float)$_GET['temp_max'] : null;

      $showAll = isset($_GET['show_all']) ? filter_var(
        $_GET['show_all'],
        FILTER_VALIDATE_BOOLEAN
      ) : false;
      $onlyVisible = !$showAll;

      $result = $this->service->getViewAllPaginated(
        $page,
        $limit,
        $provinceSnitCode,
        $cantonSnitCode,
        $districtSnitCode,
        $tempMin,
        $tempMax,
        $onlyVisible
      );

      Response::success($result);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /geomanifestations/{id}
   * Returns a single enriched manifestation from the view (public).
   *
   * @param string $id
   */
  public function viewShow(string $id): void
  {
    try {
      $data = $this->service->getViewById($id);
      Response::success($data);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}