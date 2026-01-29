<?php
// src/Services/AnalysisRequestService.php
declare(strict_types=1);

namespace Services;

use DTO\AnalysisRequestDTO;
use Http\ApiException;
use Http\ErrorType;
use Repositories\AnalysisRequestRepository;
use PDO;

/**
 * Business logic for AnalysisRequests
 */
final class AnalysisRequestService
{
  public function __construct(
    private AnalysisRequestRepository $repository,
    private PDO $pdo
  ) {}

  /**
   * Creates a new analysis request
   *
   * @param AnalysisRequestDTO $dto
   * @param int $userId
   *
   * @throws ApiException
   */
  public function create(AnalysisRequestDTO $dto, int $userId): void
  {
    // Validate DTO business rules
    $dto->validate();

    try {
      // Begin atomic operation
      $this->pdo->beginTransaction();

      // Create request and get generated ID
      $requestId = $this->repository->create($dto, $userId);

      if ($requestId <= 0) {
        throw new ApiException(
          ErrorType::internal('Failed to generate analysis request ID'),
          500
        );
      }

      // Commit transaction
      $this->pdo->commit();

    } catch (ApiException $e) {
      $this->pdo->rollBack();
      throw $e;

    } catch (\Throwable $e) {
      $this->pdo->rollBack();
      throw new ApiException(
        ErrorType::internal('Failed to create analysis request'),
        500
      );
    }
  }

    /**
   * Returns all analysis requests for an authenticated user.
   *
   * @param int $userId
   * @return array
   */
  public function getAllByUser(int $userId): array
  {
    return $this->repository->findAllByUser($userId);
  }
}
