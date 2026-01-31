<?php
declare(strict_types=1);

namespace Services;

use DTO\LoginUserDTO;
use Http\ApiException;
use Repositories\UserRepository;
use Http\ErrorType;
use Repositories\AuthRepository;
use Services\PasswordService;

final class AuthService
{
  public function __construct(private AuthRepository $authRepository, private UserRepository $userRepository) {}

  /**
   * Attempt to login a user.
   *
   * @throws ApiException if credentials invalid
   */
  public function login(LoginUserDTO $dto): array
  {
    $dto->validate();

    $user = $this->userRepository->findByEmail($dto->email);

    if (!$user || !PasswordService::verify($dto->password, $user['password_hash'])) {
      throw new ApiException(ErrorType::invalidCredentials());
    }

    $userId = (string) $user['user_id'];

    $accessToken = bin2hex(random_bytes(32));
    $refreshToken = bin2hex(random_bytes(64));

    $accessHash = hash('sha256', $accessToken);
    $refreshHash = hash('sha256', $refreshToken);

    $accessExpires = date('Y-m-d H:i:s', time() + 900);
    $refreshExpires = date('Y-m-d H:i:s', time() + 3600 * 24 * 30);

    $this->authRepository->upsertAccessToken(
      $userId,
      $accessHash,
      $accessExpires
    );

    $this->authRepository->upsertRefreshToken(
      $userId,
      $refreshHash,
      $refreshExpires
    );

    return [
      'data' => [
        'access_token' => $accessToken,
        'refresh_token' => $refreshToken,
        'access_expires_at' => $accessExpires,
        'refresh_expires_at' => $refreshExpires
      ],
      'meta' => [
        'token_type' => 'Bearer'
      ]
    ];
  }

  /**
   * Rotate refresh token and issue new access + refresh tokens.
   *
   * @throws ApiException if refresh token is invalid or expired
   */
  public function refreshTokens(string $rawRefreshToken): array
  {
    $stored = $this->authRepository->findValidRefreshToken($rawRefreshToken);

    if (!$stored) {
      throw new ApiException(ErrorType::invalidToken(), 401);
    }

    $userId = (string) $stored['user_id'];

    $newAccess = bin2hex(random_bytes(32));
    $newRefresh = bin2hex(random_bytes(64));

    $accessHash = hash('sha256', $newAccess);
    $refreshHash = hash('sha256', $newRefresh);

    $accessExpires = date('Y-m-d H:i:s', time() + 900);
    $refreshExpires = date('Y-m-d H:i:s', time() + 3600 * 24 * 30);

    $this->authRepository->upsertAccessToken(
      $userId,
      $accessHash,
      $accessExpires
    );

    $this->authRepository->upsertRefreshToken(
      $userId,
      $refreshHash,
      $refreshExpires
    );

    return [
      'data' => [
        'access_token' => $newAccess,
        'refresh_token' => $newRefresh,
        'access_expires_at' => $accessExpires,
        'refresh_expires_at' => $refreshExpires
      ],
      'meta' => [
        'rotated' => true
      ]
    ];
  }

  /**
   * Logout the current user by revoking the session token.
   *
   * @throws ApiException if token is invalid or already revoked
   */
  public function logout(string $rawAccessToken): void
  {
    $hash = hash('sha256', $rawAccessToken);

    $token = $this->authRepository->findValidAccessToken($hash);

    if (!$token) {
      throw new ApiException(ErrorType::invalidToken(), 401);
    }

    $this->authRepository->deleteUserTokens(
      (string) $token['user_id']
    );
  }


  /**
   * Authenticate a user by access token.
   *
   * @throws ApiException if token is invalid or expired
   */
  public function authenticate(string $rawAccessToken): array
  {
    $token = $this->authRepository->findValidAccessToken($rawAccessToken);

    if (!$token) {
      throw new ApiException(
        ErrorType::invalidToken()
      );
    }

    $user = $this->userRepository->findById(
      (string) $token['user_id']
    );

    if (!$user) {
      throw new ApiException(
        ErrorType::invalidToken()
      );
    }

    return [
      'user_id' => (string) $user['user_id'],
      'email' => $user['email'],
    ];
  }

  public function requireAuth(): array
  {
    $headers = getallheaders();
    $authorization = $headers['Authorization'] ?? '';

    if (!str_starts_with($authorization, 'Bearer ')) {
      throw new ApiException(
        ErrorType::missingAuthToken()
      );
    }

    $token = trim(substr($authorization, 7));

    if ($token === '') {
      throw new ApiException(
        ErrorType::missingAuthToken()
      );
    }

    return $this->authenticate($token);
  }
  /**
   * Validate an access token.
   */
  public function validateAccessToken(string $rawToken): array
  {
    $tokenHash = hash('sha256', $rawToken);

    $token = $this->authRepository->findValidAccessToken($tokenHash);

    if (!$token) {
      throw new ApiException(
        ErrorType::invalidToken(),
        401
      );
    }

    return $token;
  }

  /**
   * Find user by ID
   */
  public function findUserById(string $userId): ?array
 {
    return $this->userRepository->findById($userId);
  }
}
?>