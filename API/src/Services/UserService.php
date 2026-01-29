<?php
declare(strict_types=1);

namespace Services;

use DTO\RegisterUserDTO;
use Http\ApiException;
use Repositories\UserRepository;
use Http\ErrorType;
use Services\PasswordService;

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
   * @return int Newly created user ID
   */
  public function register(RegisterUserDTO $dto): array
  {
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

  /**
   * Get user info by ID
   *
   * @param int $userId
   * @return array
   * @throws ApiException if user not found
   */
  public function getUserById(int $userId): array
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