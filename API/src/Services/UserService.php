<?php
declare(strict_types=1);

namespace Services;

use DTO\AllowedUserRoles;
use DTO\UpdatePasswordDTO;
use DTO\UpdateUserRoleDTO;
use Http\Request;
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
  private $notificationService;

  public function __construct(private PDO $pdo)
  {
    $this->repository = new UserRepository($this->pdo);
    $this->authService = new AuthService($this->pdo);
    $this->notificationService = new NotificationService(
      new SmtpEmailService()
    );
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
          ErrorType::from(
            'ACCOUNT_DELETED',
            'This account was deleted. Please use the account restoration endpoint.'
          ),
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
        ErrorType::from(
          'ACCOUNT_ACTIVE',
          'Account is already active and not deleted.'
        ),
        400
      );
    }
    $restored = $this->repository->restoreUser($user['user_id']);
    if (!$restored) {
      throw new ApiException(
        ErrorType::internal('Failed to restore account.'),
        500
      );
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
    $auth = Request::getUser();

    $userId = $auth['user_id'];
    $dto->validate();

    $updated = $this->repository->update($userId, $dto);
    if (!$updated) {
      throw new ApiException(ErrorType::userUpdateFailed(), 500);
    }
  }

  /**
   * Updates the authenticated user's password.
   *
   * @param UpdatePasswordDTO $dto The data transfer object containing the password update request
   * @throws ApiException
   * @return void
   */
  public function updatePassword(UpdatePasswordDTO $dto): void
  {
    $auth = Request::getUser();
    $userId = $auth['user_id'];
    $dto->validate();

    $currentUser = $this->repository->findById($userId);
    if (!$currentUser) {
      throw new ApiException(ErrorType::notFound('User'), 404);
    }

    if (
      !PasswordService::verify(
        $dto->currentPassword,
        $currentUser['password_hash']
      )
    ) {
      throw new ApiException(
        ErrorType::validationError('Current password is incorrect'),
        400
      );
    }

    $newPasswordHash = PasswordService::hash($dto->newPassword);

    $updated = $this->repository->updatePassword($userId, $newPasswordHash);
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
    $auth = Request::getUser();
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
    $auth = Request::getUser();
    $userId = (string) $auth['user_id'];
    $user = $this->repository->findActiveUserById($userId);
    if (!$user) {
      throw new ApiException(ErrorType::notFound('User'), 404);
    }
    return ['data' => $user, 'meta' => null];
  }

  /**
   * Updates a user's role.
   * Only users with Admin and Manteinance Roles can perform this action.
   *
   * @param UpdateUserRoleDTO $dto Validated role update data
   *
   * @throws ApiException If user not found, validation fails, or permission denied
   *
   * @return array|null Updated user data
   */
  public function updateUserRole(string $userId, UpdateUserRoleDTO $dto): ?array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::MAINTENANCE
    ]);

    $dto->validate();

    if ($dto->role === AllowedUserRoles::ADMIN) {
      Request::requireRole([AllowedUserRoles::ADMIN]);
    }

    // Check if target user exists
    $targetUser = $this->repository->findById($userId);
    if (!$targetUser) {
      throw new ApiException(ErrorType::notFound('User'), 404);
    }

    // Update the role
    $updated = $this->repository->updateRole($userId, $dto->role);
    if (!$updated) {
      throw new ApiException(ErrorType::userUpdateFailed(), 500);
    }

    // Return updated user data
    $updatedUser = $this->repository->findById($userId);

    if (isset($updatedUser['email'], $updatedUser['first_name'])) {
      $currentTime = date('d/m/Y H:i:s');
      $this->notificationService->notifyRoleUpdated(
        $updatedUser['email'],
        $updatedUser['first_name'],
        $this->translateUserRole($updatedUser['role']),
        $currentTime
      );
    }

    return [
      'data' => $updatedUser,
      'meta' => null
    ];
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
      throw new ApiException(
        ErrorType::notFound('User'),
        404
      );
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
      throw new ApiException(
        ErrorType::notFound('User'), 404
      );
    }
    return [
      'id' => $user['user_id'],
      'role' => $user['role'] ?? 'user',
      'email' => $user['email'] ?? null,
      'is_deleted' => $user['is_deleted'] ?? null,
      'first_name' => $user['first_name'] ?? null,
      'last_name' => $user['last_name'] ?? null,
      'phone_number' => $user['phone_number'] ?? null,
    ];
  }

  private function translateUserRole(string $role) : ?string
  {
    $translatedRoles = [
      'user' => 'Usuario',
      'admin' => 'Administrador',
      'maintenance' => 'Mantenimiento',
      'field_investigator' => 'Investigador de Campo',
      'investigator' => 'Investigador'
    ];

    return $translatedRoles[$role] ?? null;
  }
}