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

    $tokens_info =  [
      'data' => [
        'access_token' => $accessToken,
        'refresh_token' => $refreshToken
      ],
      'meta' => [
        'token_type' => 'Bearer'
      ]
    ];

    return $tokens_info;
  }

  /**
   * Rotate refresh token and issue new access + refresh tokens.
   *
   * @throws ApiException if refresh token is invalid or expired
   */
  public function refreshTokens(string $rawRefreshToken): array {
    $stored = $this->authRepository->findValidRefreshToken($rawRefreshToken);

    if (!$stored) {
      throw new ApiException(ErrorType::invalidRefreshToken(), 401);
    }

    $newAccessToken = bin2hex(random_bytes(32));
    $newRefreshToken = bin2hex(random_bytes(64));

    $this->authRepository->beginTransaction();

    // 🔒 Invalida SOLO el refresh usado
    $this->authRepository->deleteUserTokens(
      (string) $stored['user_id']
    );

    // 🔁 Reemplaza access token
    $access = $this->authRepository->upsertAccessToken(
      $stored['user_id'],
      $newAccessToken,
      3600 + 1800
    );

    // 🔁 Inserta nuevo refresh token
    $refresh = $this->authRepository->upsertRefreshToken(
      $stored['user_id'],
      $newRefreshToken,
      3600 * 24 * 30
    );

    $this->authRepository->commit();

    $tokens_info = [
      'data' => [
        'access_token' => $newAccessToken,
        'access_expires_at' => $access['expires_at'],
        'refresh_token' => $newRefreshToken,
        'refresh_expires_at'=> $refresh['expires_at']
      ],
      'meta' => ['rotated' => true]
    ];

    return $tokens_info;
  }

  /**
   * Logout the current user by revoking the session token.
   *
   * @throws ApiException if token is invalid or already revoked
   */
  public function logout(string $rawAccessToken): void
  {
    $token = $this->validateAccessToken($rawAccessToken);

    $this->authRepository->deleteUserTokens(
      (string) $token['user_id']
    );
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

  public function requireAuth(): array
  {
    $headers = getallheaders();
    $authorization =
      $headers['Authorization']
      ?? $_SERVER['HTTP_AUTHORIZATION']
      ?? '';

    if (!str_starts_with($authorization, 'Bearer ')) {
      throw new ApiException(
        ErrorType::missingAuthToken(), 401
      );
    }

    $token = trim(substr($authorization, 7));

    if ($token === '') {
      throw new ApiException(
        ErrorType::missingAuthToken(), 401
      );
    }

    $user = $this->authenticate($token);

    return $user;
  }

  /**
   * Validate an access token.
   */
  public function validateAccessToken(string $rawToken): array
  {
    
    $token = $this->authRepository->findValidAccessToken($rawToken);

    if (!$token) {
      throw new ApiException(
        ErrorType::invalidAccessToken(),
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
    $user = $this->userRepository->findById($userId);
    if (!$user) {
      throw new ApiException(
        ErrorType::notFound("user"),
        404
      );
    }
    return $user;
  }
}
?>