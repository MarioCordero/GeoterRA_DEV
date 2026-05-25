<?php
declare(strict_types=1);

namespace Services;

use DTO\UpdateUserRoleDTO;
use PDO;
use Http\ErrorType;
use DTO\UpdateUserDTO;
use Http\ApiException;
use DTO\RegisterUserDTO;
use Repositories\UserRepository;

/**
 * Business logic for user management including registration, update, deletion,
 * and account restoration.
 */
final class UserService
{
  private UserRepository $repository;
  private AuthService $authService;

  public function __construct(private PDO $pdo)
  {
    $this->repository = new UserRepository($this->pdo);
    $this->authService = new AuthService($this->pdo);
  }

  /**
   * Registers a new user.
   *
   * If the email already belongs to a soft‑deleted user, an exception is thrown
   * suggesting restoration instead of registration.
   *
   * @param RegisterUserDTO $dto
   * @return array
   * @throws ApiException
   */
  public function registerUser(RegisterUserDTO $dto): array
  {
    $dto->validate();

    $existing = $this->repository->findByEmail($dto->email);
    if ($existing) {
      // If user exists but is soft‑deleted, suggest restoration
      if ($existing['deleted_at'] !== null) {
        throw new ApiException(
          ErrorType::from('ACCOUNT_DELETED', 'This account was deleted. Please use the account restoration endpoint.'),
          400
        );
      }
      throw new ApiException(ErrorType::emailAlreadyInUse(), 409);
    }

    $hash = PasswordService::hash($dto->password);
    $userId = $this->repository->create($dto, $hash);
    return [
      'data' => ['user_id' => $userId],
      'meta' => ['new_user' => true]
    ];
  }

  /**
   * Restores a soft‑deleted user account.
   *
   * @param string $email The email of the account to restore.
   * @return void
   * @throws ApiException
   */
  public function restoreAccount(string $email): void
  {
    $user = $this->repository->findByEmail($email);
    if (!$user) {
      throw new ApiException(ErrorType::notFound('User'), 404);
    }
    if ($user['deleted_at'] === null) {
      throw new ApiException(
        ErrorType::from('ACCOUNT_ACTIVE', 'Account is already active and not deleted.'),
        400
      );
    }
    $restored = $this->repository->restoreUser($user['user_id']);
    if (!$restored) {
      throw new ApiException(ErrorType::internal('Failed to restore account.'), 500);
    }
  }

  /**
   * Updates the authenticated user's profile.
   *
   * @param UpdateUserDTO $dto
   * @throws ApiException
   */
  public function updateUser(UpdateUserDTO $dto): void
  {
    $auth = $this->authService->requireAuth();
    $userId = $auth['user_id'];
    $dto->setUserId($userId);
    $dto->validate();

    if ($dto->password) {
      $currentUser = $this->repository->findById($userId);
      if (!$currentUser) {
        throw new ApiException(ErrorType::notFound('User'), 404);
      }
      if (!PasswordService::verify($dto->currentPassword, $currentUser['password_hash'])) {
        throw new ApiException(ErrorType::validationError('Current password is incorrect'), 400);
      }
      $dto->password = PasswordService::hash($dto->password);
    }

    $updated = $this->repository->update($dto);
    if (!$updated) {
      throw new ApiException(ErrorType::userUpdateFailed(), 500);
    }
  }

  /**
   * Deletes the currently authenticated user (soft delete).
   *
   * @throws ApiException
   */
  public function deleteCurrentUser(): void
  {
    $auth = $this->authService->requireAuth();
    $userId = $auth['user_id'];
    $deleted = $this->repository->deleteUser($userId);
    if (!$deleted) {
      throw new ApiException(ErrorType::userDeleteFailed(), 500);
    }
    // Optionally revoke all tokens after deletion
    $this->authService->logout();
  }

  /**
   * Returns the authenticated user's data.
   *
   * @return array
   * @throws ApiException
   */
  public function getCurrentUser(): array
  {
    $auth = $this->authService->requireAuth();
    $userId = (string) $auth['user_id'];
    $user = $this->repository->findActiveUserById($userId);
    if (!$user) {
      throw new ApiException(ErrorType::notFound('User'), 404);
    }
    return ['data' => $user, 'meta' => null];
  }

  /**
   * Updates a user's role (admin only).
   *
   * @param UpdateUserRoleDTO $dto
   * @throws ApiException
   */
  public function updateUserRole(UpdateUserRoleDTO $dto): void
  {
    // Admin authorization is checked in the controller via permission system
    $dto->validate();
    $user = $this->repository->findById($dto->userId);
    if (!$user) {
      throw new ApiException(ErrorType::notFound('User'), 404);
    }
    $updated = $this->repository->updateRole($dto->userId, $dto->role);
    if (!$updated) {
      throw new ApiException(ErrorType::internal('Failed to update user role'), 500);
    }
  }

  /**
   * Finds a user by ID (active only).
   *
   * @param string $userId
   * @return array
   * @throws ApiException
   */
  public function findById(string $userId): array
  {
    $user = $this->repository->findActiveUserById($userId);
    if (!$user) {
      throw new ApiException(ErrorType::notFound('User'), 404);
    }
    return $user;
  }

  /**
   * Returns the currently authenticated user from the session.
   *
   * @return array
   * @throws ApiException
   */
  public function getSessionUser(): array
  {
    $auth = $this->authService->requireAuth();
    $userId = (string) $auth['user_id'];
    $user = $this->repository->findActiveUserById($userId);
    if (!$user) {
      throw new ApiException(ErrorType::notFound('User'), 404);
    }
    return [
      'id' => $user['user_id'],
      'role' => $user['role'] ?? 'user',
      'email' => $user['email'] ?? null,
      'is_active' => $user['is_active'] ?? null,
      'first_name' => $user['first_name'] ?? null,
      'last_name' => $user['last_name'] ?? null,
      'phone_number' => $user['phone_number'] ?? null,
    ];
  }
}