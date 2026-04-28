<?php
declare(strict_types=1);

namespace Services;

use PDO;
use Http\ErrorType;
use DTO\UpdateUserDTO;
use Http\ApiException;
use DTO\RegisterUserDTO;
use Services\AuthService;
use Services\PasswordService;
use Repositories\UserRepository;

/**
 * Business logic for User
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
     * Registers a new user in the system.
     *
     * @param RegisterUserDTO $dto Validated registration data
     *
     * @throws ApiException If email is already registered
     *
     * @return array Newly created user data and metadata
     */
    public function registerUser(RegisterUserDTO $dto): array
    {
      $dto->validate();
      if ($this->repository->emailExists($dto->email)) {
        throw new ApiException(ErrorType::emailAlreadyInUse());
      }
      $hash = PasswordService::hash($dto->password);
      $userId = $this->repository->create($dto, $hash);
      return [
        'data' => [
          'user_id' => $userId
        ],
        'meta' => [
          'new_user' => true
        ]
      ];
    }

  /**
   * Updates user profile information.
   *
   * @param UpdateUserDTO $dto Validated update data
   *
   * @throws ApiException If update fails
   */
  public function updateUser(UpdateUserDTO $dto): void
  {
    $auth = $this->authService->requireAuth();
    $userId = $auth['user_id'];
    $dto->setUserId($userId);
    $dto->validate();

    // If password change requested, verify current password
    if ($dto->password) {
      $currentUser = $this->repository->findById($userId);
      if (!$currentUser) {
        throw new ApiException(ErrorType::notFound('User'), 404);
      }

      // Verify current password
      if (!PasswordService::verify($dto->currentPassword, $currentUser['password_hash'])) {
        throw new ApiException(
          ErrorType::validationError('Current password is incorrect'),
          400
        );
      }

      // Hash the new password
      $dto->password = PasswordService::hash($dto->password);
    }

    $updated = $this->repository->update($dto);
    if (!$updated) {
      throw new ApiException(ErrorType::userUpdateFailed(), 500);
    }
  }

  /**
   * Deletes a user by their ID.
   *
   * @param string $userId ID of the user to delete, extracted from session
   *
   * @throws ApiException If deletion fails
   */
  public function deleteCurrentUser(): void
  {
    $auth = $this->authService->requireAuth();
    $userId = $auth['user_id'];
    $deleted = $this->repository->deleteUser($userId);
    if (!$deleted) {
      throw new ApiException(ErrorType::userDeleteFailed(),500);
    }
  }

  /**
   * Get user info by ID
   *
   * @return array
   * @throws ApiException if user not found
   */
  public function getCurrentUser(): array
  {
    $auth = $this->authService->requireAuth();
    $userId = (string) $auth['user_id'];
    $user = $this->repository->findActiveUserById($userId);
    if (!$user) {
      throw new ApiException(ErrorType::notFound('User'),404);
    }
    return [
      'data' => $user,
      'meta' => null
    ];
  }

  /**
   * Get user info by ID
   * For internal service-to-service use only
   *
   * @return array
   * @throws ApiException if user not found
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
   * Get authenticated user from session token
   * Validates session and returns full user data
   *
   * @throws ApiException if session is invalid
   * @return array user data formatted for response
   */
  public function getSessionUser(): array
  {
    // Validate session using AuthService::requireAuth()
    // This handles session cookie extraction and validation
    $auth = $this->authService->requireAuth();
    $userId = (string) $auth['user_id'];
    
    // Get full user data from database
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