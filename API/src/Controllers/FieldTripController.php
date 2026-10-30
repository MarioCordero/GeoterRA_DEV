<?php
declare(strict_types=1);

namespace Controllers;

use DTO\RegisterFieldTripDTO;
use DTO\UpdateFieldTripDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use PDO;
use Services\FieldTripService;
use Throwable;

/**
 * Controller for field trip endpoints.
 */
final class FieldTripController
{
  private FieldTripService $service;

  public function __construct(private readonly PDO $pdo)
  {
    $this->service = new FieldTripService($this->pdo);
  }

  /**
   * GET /field-trips
   * Returns paginated list of field trips with optional filters.
   */
  public function index(): void
  {
    try {
      $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
      $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
      $isActive = isset($_GET['is_active']) ?filter_var($_GET['is_active'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) : null;
      $provinceSnitCode = isset($_GET['province_snit_code']) ? (int)$_GET['province_snit_code'] : null;
      $cantonSnitCode = isset($_GET['canton_snit_code']) ? (int)$_GET['canton_snit_code'] : null;
      $districtSnitCode = isset($_GET['district_snit_code']) ? (int)$_GET['district_snit_code'] : null;

      $result = $this->service->getAll(
        $page,
        $limit,
        $isActive,
        $provinceSnitCode,
        $cantonSnitCode,
        $districtSnitCode
      );

      Response::success(
        $result['data'], ['pagination' => $result['pagination']]
      );

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /field-trips/my
   * Returns paginated list of field trips assigned to or created by the current user with optional filters.
   */
  public function myFieldTrips(): void
  {
    try {
      $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
      $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
      $provinceSnitCode = isset($_GET['province_snit_code']) ? (int)$_GET['province_snit_code'] : null;
      $cantonSnitCode = isset($_GET['canton_snit_code']) ? (int)$_GET['canton_snit_code'] : null;
      $districtSnitCode = isset($_GET['district_snit_code']) ? (int)$_GET['district_snit_code'] : null;

      $result = $this->service->getMyFieldTrips($page, $limit, $provinceSnitCode, $cantonSnitCode, $districtSnitCode);
      Response::success(
        $result['data'],
        [
          'total' => $result['total'],
          'page' => $result['page'],
          'limit' => $result['limit'],
        ]
      );
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /field-trips/{id}
   * Returns a single field trip with participants and linked manifestations.
   */
  public function show(string $id): void
  {
    try {
      $trip = $this->service->getById($id);
      Response::success($trip);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /field-trips
   * Creates a new field trip.
   */
  public function store(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = RegisterFieldTripDTO::fromArray($body);
      $trip = $this->service->create($dto);
      Response::success($trip, null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /field-trips/{id}
   * Updates an existing field trip.
   */
  public function update(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = UpdateFieldTripDTO::fromArray($body);
      $trip = $this->service->update($id, $dto);
      Response::success($trip, null, 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /field-trips/{id}/participants
   * Adds a participant to a field trip.
   */
  public function addParticipant(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      if (!isset($body['user_id'])
        || trim((string)$body['user_id']) === '') {
        throw new ApiException(
          ErrorType::missingField('user_id'), 422
        );
      }
      $participants = $this->service->addParticipant(
        $id, trim((string)$body['user_id'])
      );
      Response::success($participants);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /field-trips/{id}/participants/{userId}
   * Removes a participant from a field trip.
   */
  public function removeParticipant(string $id, string $userId): void
  {
    try {
      $participants = $this->service->removeParticipant($id, $userId);
      Response::success($participants);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /field-trips/{id}/geomanifestations
   * Links a geomanifestation to a field trip.
   */
  public function linkManifestation(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      if (!isset($body['geomanifestation_id'])
        || trim((string)$body['geomanifestation_id']) === '') {
        throw new ApiException(
          ErrorType::missingField('geomanifestation_id'), 422
        );
      }

      $manifestations = $this->service->linkManifestation(
        $id,
        trim((string)$body['geomanifestation_id'])
      );

      Response::success($manifestations);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /field-trips/{id}/geomanifestations/{gmId}
   * Unlinks a geomanifestation from a field trip.
   */
  public function unlinkManifestation(string $id, string $gmId): void
  {
    try {
      $manifestations = $this->service->unlinkManifestation($id, $gmId);
      Response::success($manifestations);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /field-trips/{id}
   * Deletes a field trip (creator or admin).
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
}