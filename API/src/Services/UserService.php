<?php
declare(strict_types=1);

namespace Services;

use PDO;
use DTO\RegisterUserDTO;
use DTO\UpdateUserDTO;
use Http\ApiException;
use Http\ErrorType;
use Services\PasswordService;
use Services\AuthService;
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
      $updated = $this->repository->update($dto);
      if (!$updated) {
        throw new ApiException(ErrorType::userUpdateFailed(), 500);
      }
    }

  /**
   * Deletes a user by their ID.
   *
   * @param string $userId ID of the user to delete
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
   * @param string $userId
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
}