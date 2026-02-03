<?php
declare(strict_types=1);

namespace Services;

use DTO\RegisterUserDTO;
use Http\ApiException;
use Repositories\UserRepository;
use Http\ErrorType;
use Services\PasswordService;
use DTO\UpdateUserDTO;

/**
 * Handles business logic related to users.
 */
final class UserService
{
  /**
   * Repository used to interact with the persistence layer.
   */
  private UserRepository $repository;

  /**
   * @param UserRepository $repository User persistence abstraction
   */
  public function __construct(UserRepository $repository)
  {
    $this->repository = $repository;
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
        // Use ErrorType to standardize error messaging
        throw new ApiException(
          ErrorType::emailAlreadyInUse()
        );
      }

      $hash = PasswordService::hash($dto->password);

      $userId = $this->repository->create(
        $dto->firstName,
        $dto->lastName,
        $dto->email,
        $dto->phoneNumber,
        $hash
      );

      return [
        'data' => [
          'user_id' => $userId
        ],
        'meta' => [
          'new_user' => true
        ]
      ];
    }

    public function updateUser(string $userId, UpdateUserDTO $dto): void
  {
    $dto->validate();

    $updated = $this->repository->updateUser(
      $userId,
      $dto->firstName,
      $dto->lastName,
      $dto->email,
      $dto->phoneNumber
    );

    if (!$updated) {
      throw new ApiException(
        ErrorType::userUpdateFailed(),
        500
      );
    }
  }

  /**
   * Deletes a user by their ID.
   *
   * @param string $userId ID of the user to delete
   *
   * @throws ApiException If deletion fails
   */
  public function deleteUser(string $userId): void
  {

    $deleted = $this->repository->deleteUser($userId);

    if (!$deleted) {
      throw new ApiException(
        ErrorType::userDeleteFailed(),
        500
      );
    }
  }

  /**
   * Get user info by ID
   *
   * @param string $userId
   * @return array
   * @throws ApiException if user not found
   */
  public function getUserById(string $userId): array
  {
    $user = $this->repository->findById($userId);

    if (!$user) {
      throw new ApiException(
        ErrorType::notFound('User')
      );
    }

    return [
      'data' => $user,
      'meta' => null
    ];
  }
}
?>