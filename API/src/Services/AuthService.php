<?php
declare(strict_types=1);

namespace Services;

use DTO\LoginUserDTO;
use Http\ApiException;
use Repositories\UserRepository;
use Http\ErrorType;
use Services\PasswordService;

final class AuthService
{
  public function __construct(private UserRepository $repository) {}

  /**
   * Attempt to login a user.
   *
   * @throws ApiException if credentials invalid
   */
  public function login(LoginUserDTO $dto): array
  {
    $user = $this->repository->findByEmail($dto->email);

    if (!$user) {
      throw new ApiException(
        ErrorType::invalidCredentials()
      );
    }

    // Verify password
    if (!PasswordService::verify($dto->password, $user['password_hash'])) {
      throw new ApiException(
        ErrorType::invalidCredentials()
      );
    }

    // Check if there is an active session
    $activeSession = $this->repository->findActiveSessionByUserId((int) $user['user_id']);

    if ($activeSession) {
      return [
        'data' => [
          'user_id' => $user['user_id'],
          'token' => $activeSession['token_hash'],
          'expires_at' => $activeSession['expires_at']
        ],
        'meta' => ['new_session' => false]
      ];
    }

    // Generate new session token
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + 3600 * 24); // 24h

    $this->repository->createSession((int) $user['user_id'], $token, $expiresAt);

    return [
      'data' => [
        'user_id' => $user['user_id'],
        'token' => $token,
        'expires_at' => $expiresAt
      ],
      'meta' => ['new_session' => true]
    ];
  }

  /**
   * Validate if a token is active and return the session
   */
  public function validateToken(string $token): ?array
  {
    return $this->repository->findSessionByToken($token);
  }
}
?>