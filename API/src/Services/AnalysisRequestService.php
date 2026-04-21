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
  private AnalysisRequestRepository $repository;
  private AuthService $authService;
  public function __construct(private PDO $pdo)
  {
    $this->authService = new AuthService($this->pdo);
    $this->repository = new AnalysisRequestRepository($this->pdo);
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
   * Updates an existing analysis request from any user, only if the authenticated user is an admin.
   * 
   * @param string $id
   * @param AnalysisRequestDTO $dto
   * 
   * @throws ApiException
   */
  public function adminUpdate(string $id, AnalysisRequestDTO $dto): void
  {
    $auth = $this->authService->requireAuth();
    
    if ($auth['role'] !== 'admin') {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    $dto->validate();

    try {
      $this->pdo->beginTransaction();
      $existing = $this->repository->findById($id);

      if (!$existing) {
        throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
      }

      $this->repository->adminUpdate($id, $dto);
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
   * Deletes an analysis request by ID, only if it belongs to the authenticated user.
   * 
   * @param string $id
   * @throws ApiException
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
   * Deletes an user's analysis request by ID, only if the authenticated user is an admin.
   * 
   * @param string $id
   * @throws ApiException
   */
  public function adminDelete(string $id): void
  {
    $auth = $this->authService->requireAuth();

    if ($auth['role'] !== 'admin') {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    try {
      $this->pdo->beginTransaction();
      $existing = $this->repository->findById($id);
      if (!$existing) {
        throw new ApiException(ErrorType::analysisRequestNotFound(),404);
      }
      $this->repository->adminDelete($id);
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

  /**
   * Returns all analysis requests for an authenticated user, only if the authenticated user is an admin.
   *
   * @return array
   */
  public function getAll(): array
  {
    $auth = $this->authService->requireAuth();

    if ($auth['role'] !== 'admin' && $auth['role'] !== 'maintenance') {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    // TODO: Implement pagination and filtering in the repository method to avoid returning too much data at once
    // TODO: Consider adding a separate method for maintenance users if they should have different access than admins
    return $this->repository->getAll();
  }
}
