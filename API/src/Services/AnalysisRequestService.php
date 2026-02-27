<?php
// src/Services/AnalysisRequestService.php
declare(strict_types=1);

namespace Services;

use PDO;
use DTO\AnalysisRequestDTO;
use Http\ApiException;
use Http\ErrorType;
use Services\AuthService;
use Repositories\AnalysisRequestRepository;


/**
 * Business logic for AnalysisRequests
 */
final class AnalysisRequestService
{
  private AuthService $authService;
  public function __construct(
    private AnalysisRequestRepository $repository,
    private PDO $pdo
  ) {
    $authRepository = new \Repositories\AuthRepository($this->pdo);
    $userRepository = new \Repositories\UserRepository($this->pdo);
    $this->authService = new AuthService($this->pdo);
  }

  /**
   * Creates a new analysis request
   *
   * @param AnalysisRequestDTO $dto
   * @param string $userId
   *
   * @throws ApiException
   */
  public function create(AnalysisRequestDTO $dto): void
  {
    $auth = $this->authService->requireAuth();
    $userId = (string)$auth['user_id'];
    $dto->validate();

    try {
      $this->pdo->beginTransaction();
      $requestId = $this->repository->create($dto, $userId);
      if ($requestId <= 0) {
        throw new ApiException(
          ErrorType::internal('Failed to generate analysis request ID'),
          500
        );
      }
      $this->pdo->commit();
    } catch (ApiException $e) {
      $this->pdo->rollBack();
      throw $e;
    } catch (\Throwable $e) {
      $this->pdo->rollBack();
      throw new ApiException(
        ErrorType::internal('Failed to create analysis request: ' . $e->getMessage()),
        500
      );
    }
  }

  /**
   * Updates an existing analysis request.
   * 
   * @param string $id
   * @param AnalysisRequestDTO $dto
   * 
   * @throws ApiException
   */
  public function update(string $id, AnalysisRequestDTO $dto): void
  {
    $auth = $this->authService->requireAuth();
    $userId = (string)$auth['user_id'];
    $dto->validate();

    try {
      $this->pdo->beginTransaction();
      $existing = $this->repository->findByIdAndUser($id, $userId);
      if (!$existing) {
        throw new ApiException(ErrorType::analysisRequestNotFound(),404);
      }
      $this->repository->update($id, $userId, $dto);
      $this->pdo->commit();

    } catch (ApiException $e) {
      $this->pdo->rollBack();
      throw $e;
    } catch (\Throwable $e) {
      $this->pdo->rollBack();
      throw new ApiException(ErrorType::internal('Failed to update analysis request: ' . $e->getMessage()), 500);
    }
  }

  /**
   * Deletes an analysis request.
   */
  public function delete(string $id): void
  {
    $auth = $this->authService->requireAuth();
    $userId = (string)$auth['user_id'];

    try {
      $this->pdo->beginTransaction();
      $existing = $this->repository->findByIdAndUser($id, $userId);
      if (!$existing) {
        throw new ApiException(ErrorType::analysisRequestNotFound(),404);
      }
      $this->repository->delete($id, $userId);
      $this->pdo->commit();
    } catch (ApiException $e) {
      $this->pdo->rollBack();
      throw $e;
    } catch (\Throwable $e) {
      $this->pdo->rollBack();
      throw new ApiException(ErrorType::internal('Failed to delete analysis request: ' . $e->getMessage()),500);
    }
  }

    /**
   * Returns all analysis requests for an authenticated user.
   *
   * @return array
   */
  public function getAllByUser(): array
  {
    $auth = $this->authService->requireAuth();
    $userId = (string)$auth['user_id'];
    return $this->repository->findAllByUser($userId);
  }
}
