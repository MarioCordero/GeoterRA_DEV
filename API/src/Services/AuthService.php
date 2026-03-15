<?php
declare(strict_types=1);

namespace Services;

use PDO;
use DTO\LoginUserDTO;
use Http\ApiException;
use Http\ErrorType;
use Services\PasswordService;
use Repositories\UserRepository;
use Repositories\AuthRepository;

final class AuthService
{
  private AuthRepository $authRepository;
  private UserRepository $userRepository;

  public function __construct(private PDO $pdo)
  {
    $this->userRepository = new UserRepository($this->pdo);
    $this->authRepository = new AuthRepository($this->pdo);
  }

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
      throw new ApiException(ErrorType::invalidCredentials(), 401);
    }
    $userId = (string) $user['user_id'];
    $accessToken = bin2hex(random_bytes(32));
    $refreshToken = bin2hex(random_bytes(64));
    $accessExpires = 3600 + 1800;
    $refreshExpires = 3600 * 24 * 30;
    $this->authRepository->upsertAccessToken(
      $userId,
      $accessToken,
      $accessExpires
    );
    $this->authRepository->upsertRefreshToken(
      $userId,
      $refreshToken,
      $refreshExpires
    );
    return [
      'data' => [
        'access_token' => $accessToken,
        'refresh_token' => $refreshToken
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
      throw new ApiException(ErrorType::invalidRefreshToken(), 401);
    }
    $newAccessToken = bin2hex(random_bytes(32));
    $newRefreshToken = bin2hex(random_bytes(64));
    $this->authRepository->beginTransaction();
    $this->authRepository->deleteUserTokens((string) $stored['user_id']);
    $access = $this->authRepository->upsertAccessToken(
      $stored['user_id'],
      $newAccessToken,
      3600 + 1800
    );
    $refresh = $this->authRepository->upsertRefreshToken(
      $stored['user_id'],
      $newRefreshToken,
      3600 * 24 * 30
    );
    $this->authRepository->commit();
    return [
      'data' => [
        'access_token' => $newAccessToken,
        'access_expires_at' => $access['expires_at'],
        'refresh_token' => $newRefreshToken,
        'refresh_expires_at' => $refresh['expires_at']
      ],
      'meta' => ['rotated' => true]
    ];
  }

  /**
   * Logout the current user by revoking the session token.
   *
   * @throws ApiException if token is invalid or already revoked
   */
  public function logout(): void
  {
    $auth = $this->requireAuth();
    $userId = $auth['user_id'];
    $this->authRepository->deleteUserTokens($userId);
  }

  /**
   * Authenticate a user by access token.
   *
   * @throws ApiException if token is invalid or expired
   */
  private function authenticate(string $rawAccessToken): array
  {
    $token = $this->validateAccessToken($rawAccessToken);
    $user = $this->findUserById($token['user_id']);
    return [
      'user_id' => (string) $user['user_id'],
      'email' => $user['email'],
    ];
  }

  /**
   * Require authentication for an endpoint and return the authenticated user info.
   *
   * @throws ApiException if authentication fails
   */
  public function requireAuth(): array
  {
    $headers = getallheaders();
    $authorization = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!str_starts_with($authorization, 'Bearer ')) {
      throw new ApiException(ErrorType::missingAuthToken(), 401);
    }
    $token = trim(substr($authorization, 7));
    if ($token === '') {
      throw new ApiException(ErrorType::missingAuthToken(), 401);
    }
    return $this->authenticate($token);
  }

  /**
   * Validate an access token.
   * 
   * @param string $rawToken the raw access token string from the Authorization header
   * 
   * @throws ApiException if token is invalid or expired
   * @return array token record from database
   */
  private function validateAccessToken(string $rawToken): array
  {
    $token = $this->authRepository->findValidAccessToken($rawToken);
    if (!$token) {
      throw new ApiException(ErrorType::invalidAccessToken(), 401);
    }
    return $token;
  }

  /**
   * Find user by ID
   * 
   * @param string $userId the user ID to look up
   * 
   * @throws ApiException if user not found
   * @return array user record from database
   */
  private function findUserById(string $userId): array
  {
    $user = $this->userRepository->findById($userId);
    if (!$user) {
      throw new ApiException(ErrorType::notFound("user"), 404);
    }
    return $user;
  }
}