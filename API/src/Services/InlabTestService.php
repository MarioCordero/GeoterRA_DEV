<?php
declare(strict_types=1);

namespace Services;

use PDO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use DTO\InlabTestDTO;
use DTO\AllowedUserRoles;
use Repositories\InlabTestRepository;
use Repositories\GeomanifestationRepository;

/**
 * Business logic for in-lab tests (inlab_tests table).
 */
final class InlabTestService
{
  private InlabTestRepository $repository;
  private GeomanifestationRepository $geomanifestationRepository;
  private AuthService $authService;

  public function __construct(private PDO $pdo)
  {
    $this->repository = new InlabTestRepository($pdo);
    $this->geomanifestationRepository = new GeomanifestationRepository($pdo);
    $this->authService = new AuthService($pdo);
  }

  /**
   * Validates that the referenced geomanifestation exists.
   *
   * @param string $geomanifestationId
   * @throws ApiException
   */
  private function validateGeomanifestationExists(
    string $geomanifestationId
  ): void {
    $manifestation = $this->geomanifestationRepository->findById(
      $geomanifestationId
    );
    if (!$manifestation) {
      throw new ApiException(
        ErrorType::invalidField('geomanifestation_id'),
        422
      );
    }
  }

  /**
   * Creates a new in-lab test (admin only).
   *
   * @param InlabTestDTO $dto
   * @throws ApiException
   */
  public function create(InlabTestDTO $dto): void
  {
    $auth = Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::INVESTIGATOR
    ]);

    $dto->validate();
    $this->validateGeomanifestationExists($dto->geomanifestationId);

    $this->repository->create($dto, $auth['user_id']);
  }

  /**
   * Retrieves an in-lab test by its ID (admin access, with visibility check via manifestation).
   *
   * @param string $id
   * @return array
   * @throws ApiException
   */
  public function getById(string $id): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR
    ]);

    $test = $this->repository->findById($id);
    if (!$test) {
      throw new ApiException(ErrorType::notFound('In-lab test'), 404);
    }

    // Check manifestation visibility if needed (optional – tests might be considered sensitive)
    // For consistency, we can allow public access to test data if manifestation is visible.
    $manifestation = $this->geomanifestationRepository->findById(
      $test->geomanifestationId
    );
    if ($manifestation && !$manifestation['visibility']) {
      try {
        $auth = $this->authService->requireAuth();
        $isAdmin = ($auth['role'] ?? '') === AllowedUserRoles::ADMIN;
      } catch (\Exception $e) {
        $isAdmin = false;
      }
      if (!$isAdmin) {
        throw new ApiException(ErrorType::notFound('In-lab test'), 404);
      }
    }

    return [
      'inlab_test_id' => $test->inlabTestId,
      'geomanifestation_id' => $test->geomanifestationId,
      'ph' => $test->ph,
      'conductivity' => $test->conductivity,
      'cl' => $test->cl,
      'ca' => $test->ca,
      'hco3' => $test->hco3,
      'so4' => $test->so4,
      'fe' => $test->fe,
      'si' => $test->si,
      'b' => $test->b,
      'li' => $test->li,
      'f' => $test->f,
      'na' => $test->na,
      'k' => $test->k,
      'mg' => $test->mg,
      'description' => $test->description,
      'created_at' => $test->createdAt,
      'created_by' => $test->createdBy,
    ];
  }

  /**
   * Returns all in-lab tests for a given geomanifestation (with visibility check).
   *
   * @param string $geomanifestationId
   * @return array
   * @throws ApiException
   */
  public function getByManifestation(string $geomanifestationId): array
  {
    $manifestation = $this->geomanifestationRepository->findById(
      $geomanifestationId
    );
    if (!$manifestation) {
      throw new ApiException(
        ErrorType::notFound('Geothermal manifestation'),
        404
      );
    }

    if (!$manifestation['visibility']) {
      Request::requireRole([
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR,
        AllowedUserRoles::MAINTENANCE
      ]);
    }

    $tests = $this->repository->getByManifestation($geomanifestationId);
    return array_map(fn($dto) => [
      'inlab_test_id' => $dto->inlabTestId,
      'ph' => $dto->ph,
      'conductivity' => $dto->conductivity,
      'cl' => $dto->cl,
      'ca' => $dto->ca,
      'hco3' => $dto->hco3,
      'so4' => $dto->so4,
      'fe' => $dto->fe,
      'si' => $dto->si,
      'b' => $dto->b,
      'li' => $dto->li,
      'f' => $dto->f,
      'na' => $dto->na,
      'k' => $dto->k,
      'mg' => $dto->mg,
      'description' => $dto->description,
      'created_at' => $dto->createdAt,
    ], $tests);
  }

  /**
   * Updates an existing in-lab test (admin only).
   *
   * @param string $id
   * @param InlabTestDTO $dto
   * @throws ApiException
   */
  public function update(string $id, InlabTestDTO $dto): void
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::INVESTIGATOR
    ]);

    $dto->validate();
    $this->validateGeomanifestationExists($dto->geomanifestationId);

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('In-lab test'), 404);
    }

    $updated = $this->repository->update($id, $dto);
    if (!$updated) {
      throw new ApiException(
        ErrorType::internal('Failed to update in-lab test'),
        500
      );
    }
  }

  /**
   * Deletes an in-lab test (admin only).
   *
   * @param string $id
   * @throws ApiException
   */
  public function delete(string $id): void
  {

    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::INVESTIGATOR
    ]);

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('In-lab test'), 404);
    }

    $deleted = $this->repository->delete($id);
    if (!$deleted) {
      throw new ApiException(
        ErrorType::internal('Failed to delete in-lab test'),
        500
      );
    }
  }
}