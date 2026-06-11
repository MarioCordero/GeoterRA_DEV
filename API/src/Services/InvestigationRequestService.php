<?php
declare(strict_types=1);

namespace Services;

use PDO;
use Http\ApiException;
use Http\ErrorType;
use DTO\InvestigationRequestDTO;
use Repositories\InvestigationRequestRepository;
use Repositories\UserRepository;

/**
 * Business logic for analysis requests, including state handling and owner relation validation.
 */
final class InvestigationRequestService
{
  private InvestigationRequestRepository $repository;
  private AuthService $authService;
  private UserRepository $userRepository;

  public function __construct(private PDO $pdo)
  {
    $this->authService = new AuthService($pdo);
    $this->userRepository = new UserRepository($pdo);
    $this->repository = new InvestigationRequestRepository($pdo);
  }

  /**
   * Helper to get the authenticated user ID and full data.
   *
   * @return array{user_id: string, role: string, email: string, first_name: string, last_name: string, phone_number: string|null}
   * @throws ApiException
   */
  private function getAuthenticatedUser(): array
  {
    $auth = $this->authService->requireAuth();
    $user = $this->userRepository->findById($auth['user_id']);
    if (!$user) {
      throw new ApiException(ErrorType::unauthorized('User not found'), 401);
    }
    return [
      'user_id' => $auth['user_id'],
      'role' => $auth['role'],
      'email' => $user['email'],
      'first_name' => $user['first_name'],
      'last_name' => $user['last_name'],
      'phone_number' => $user['phone_number'] ?? null
    ];
  }

  /**
   * Validates that relation_with_owner is provided if owner differs from requester.
   *
   * @param InvestigationRequestDTO $dto
   * @param array $userData
   * @throws ApiException
   */
  private function validateOwnerRelation(InvestigationRequestDTO $dto, array $userData): void
  {
    $fullName = trim($userData['first_name'] . ' ' . $userData['last_name']);
    $ownerDiffers = false;
    if ($dto->ownerName !== null && $dto->ownerName !== $fullName) {
      $ownerDiffers = true;
    }
    if ($dto->ownerPhoneNumber !== null && $dto->ownerPhoneNumber !== ($userData['phone_number'] ?? null)) {
      $ownerDiffers = true;
    }
    if ($dto->ownerEmail !== null && strtolower($dto->ownerEmail) !== strtolower($userData['email'])) {
      $ownerDiffers = true;
    }
    if ($ownerDiffers && empty($dto->relationWithOwner)) {
      throw new ApiException(
        ErrorType::missingField('relation_with_owner (required because owner is different from requester)'),
        422
      );
    }
  }

  /**
   * Creates a new request with initial state.
   */
  public function create(InvestigationRequestDTO $dto): string
  {
    $user = $this->getAuthenticatedUser();
    $dto->validate($user);
    $this->validateOwnerRelation($dto, $user);

    try {
      $this->pdo->beginTransaction();
      $id = $this->repository->create($dto, $user['user_id']); // repositorio ya retorna ID
      $this->pdo->commit();
      return $id;
    } catch (\Throwable $e) {
      $this->pdo->rollBack();
      throw new ApiException(ErrorType::internal('Failed to create request: ' . $e->getMessage()), 500);
    }
  }

  /**
   * Updates a request owned by the user, only if current state is 'Pendiente'.
   */
  public function update(string $id, InvestigationRequestDTO $dto): void
  {
    $user = $this->getAuthenticatedUser();
    $dto->validate($user);
    $this->validateOwnerRelation($dto, $user);

    $existing = $this->repository->findByIdAndUser($id, $user['user_id']);
    if (!$existing) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }

    // Restriction: only 'Pendiente' can be edited by the owner
    if (($existing['current_state'] ?? '') !== 'Pendiente') {
      throw new ApiException(
        ErrorType::invalidField('Only requests in "Pendiente" state can be modified'),
        422
      );
    }

    $this->repository->update($id, $user['user_id'], $dto);
  }

  /**
   * Admin update – updates any request without state restriction.
   */
  public function adminUpdate(string $id, InvestigationRequestDTO $dto): void
  {
    $user = $this->getAuthenticatedUser();
    if ($user['role'] !== 'admin') {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    $dto->validate($user);
    $this->validateOwnerRelation($dto, $user);

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }

    $this->repository->adminUpdate($id, $dto);
  }

  /**
   * Adds a new state to a request (admin only).
   *
   * @param string $id Request ULID.
   * @param string $stateValue New state value.
   * @param string $description Optional description.
   * @throws ApiException
   */
  public function addState(string $id, string $stateValue, string $description): void
  {
    $user = $this->getAuthenticatedUser();
    if ($user['role'] !== 'admin') {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    $request = $this->repository->findById($id);
    if (!$request) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }

    $this->repository->addState($id, $stateValue, $description, $user['user_id']);
  }

  /**
   * Returns all states of a request. Accessible by owner or admin.
   *
   * @param string $id Request ULID.
   * @return array List of state entries.
   * @throws ApiException
   */
  public function getStates(string $id): array
  {
    $user = $this->getAuthenticatedUser();
    $request = $this->repository->findById($id);
    if (!$request) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }

    $isOwner = ($request['user_id'] === $user['user_id']);
    $isAdmin = ($user['role'] === 'admin');

    if (!$isOwner && !$isAdmin) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    return $this->repository->getStatesByRequestId($id);
  }

  /**
   * Deletes a request owned by the authenticated user (no state restriction).
   */
  public function delete(string $id): void
  {
    $user = $this->getAuthenticatedUser();
    $existing = $this->repository->findByIdAndUser($id, $user['user_id']);
    if (!$existing) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }
    $this->repository->delete($id, $user['user_id']);
  }

  /**
   * Admin delete – deletes any request.
   */
  public function adminDelete(string $id): void
  {
    $user = $this->getAuthenticatedUser();
    if ($user['role'] !== 'admin') {
      throw new ApiException(ErrorType::forbidden(), 403);
    }
    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }
    $this->repository->adminDelete($id);
  }

  /**
   * Returns all requests of the authenticated user, including current state.
   *
   * @return InvestigationRequestDTO[]
   */
  public function getAllByUser(): array
  {
    $user = $this->getAuthenticatedUser();
    $rows = $this->repository->findAllByUser($user['user_id']);
    return array_map(
      fn($row) => InvestigationRequestDTO::fromDatabase($row)->toArray(), $rows
    );
  }

  /**
   * Returns all requests (admin only), including current state.
   *
   * @return InvestigationRequestDTO[]
   * @throws ApiException
   */
  public function getAll(): array
  {
    $user = $this->getAuthenticatedUser();
    if (!in_array($user['role'], ['admin', 'maintenance'], true)) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }
    $rows = $this->repository->getAll();
    return array_map(
      fn($row) => InvestigationRequestDTO::fromDatabase($row)->toArray(), $rows
    );
  }

  /**
   * Returns a single request if it belongs to the user.
   *
   * @param string $id
   * @return InvestigationRequestDTO
   */
  public function getById(string $id): InvestigationRequestDTO
  {
    $user = $this->getAuthenticatedUser();
    $row = $this->repository->findByIdAndUser($id, $user['user_id']);
    if (!$row) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }
    return InvestigationRequestDTO::fromDatabase($row);
  }

  /**
   * Admin view of any request.
   *
   * @param string $id
   * @return InvestigationRequestDTO
   */
  public function adminGetById(string $id): InvestigationRequestDTO
  {
    $user = $this->getAuthenticatedUser();
    if (!in_array($user['role'], ['admin', 'maintenance'], true)) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }
    $row = $this->repository->findById($id);
    if (!$row) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }
    return InvestigationRequestDTO::fromDatabase($row);
  }
}