<?php

declare(strict_types=1);

namespace Services;

use PDO;
use DTO\AccessTokenDTO;
use DTO\LoginUserDTO;
use DTO\RefreshTokenDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Repositories\AuthRepository;
use Repositories\UserRepository;
use Throwable;

/**
 * Service handling authentication logic including login, token refresh, logout,
 * and token validation.
 *
 * Implements refresh token rotation with family detection and replay attack protection.
 * On reuse of a refresh token, the entire token family is revoked.
 *
 * @package Services
 */
final class AuthService
{
  private UserRepository $userRepository;
  private AuthRepository $authRepository;

  /**
   * AuthService constructor.
   *
   * @param PDO $pdo Active PDO database connection.
   */
  public function __construct(private PDO $pdo)
  {
    $this->userRepository = new UserRepository($this->pdo);
    $this->authRepository = new AuthRepository($this->pdo);
  }

  /**
   * Authenticates a user and issues a new access/refresh token pair.
   *
   * @param LoginUserDTO $dto Contains email and password.
   * @return array<string, mixed> The new access and refresh tokens with user info.
   * @throws ApiException When credentials are invalid or user not found.
   */
  public function login(LoginUserDTO $dto): array
  {
    $dto->validate();

    $user = $this->userRepository->findByEmail($dto->email);
    if (!$user || !password_verify($dto->password, $user['password_hash'])) {
      throw new ApiException(ErrorType::invalidCredentials(), 401);
    }

    $userId = $user['user_id'];
    $accessTtl = 3600 + 1800;   // 1.5 hours
    $refreshTtl = 3600 * 24 * 30; // 30 days

    $rawAccessToken = bin2hex(random_bytes(32));
    $rawRefreshToken = bin2hex(random_bytes(64));

    $accessHash = $this->hashToken($rawAccessToken);
    $refreshHash = $this->hashToken($rawRefreshToken);

    $refreshDto = new RefreshTokenDTO($userId, $refreshHash, $refreshTtl);
    try {
      $this->pdo->beginTransaction();
      $this->authRepository->createRefreshToken($refreshDto);
      $this->authRepository->upsertAccessToken(new AccessTokenDTO($userId, $accessHash, $accessTtl));
      $this->pdo->commit();
    } catch (Throwable $e) {
      $this->pdo->rollBack();
      throw new ApiException(ErrorType::internal('Login failed: ' . $e->getMessage()), 500);
    }

    $userInfo = $this->userRepository->findById($userId);
    return [
      'data' => [
        'access_token'  => $rawAccessToken,
        'refresh_token' => $rawRefreshToken,
        'user_id'       => $userId,
        'email'         => $userInfo['email'],
        'name'          => $userInfo['first_name'] . ' ' . $userInfo['last_name'],
        'role'          => $userInfo['role'],
      ],
      'meta' => [
        'token_type' => 'Bearer',
        'expires_in' => $accessTtl,
      ],
    ];
  }

  /**
   * Rotates an existing refresh token and issues a new pair.
   *
   * If the provided refresh token has already been used (replay attack),
   * the entire family is revoked and an exception is thrown.
   *
   * @param string $rawRefreshToken The raw refresh token from the client.
   * @return array<string, mixed> New access and refresh tokens.
   * @throws ApiException When the refresh token is invalid, expired, or reused.
   */
  public function refreshTokens(string $rawRefreshToken): array
  {
    $refreshHash = $this->hashToken($rawRefreshToken);
    $stored = $this->authRepository->findValidRefreshToken($refreshHash);

    if (!$stored) {
      // Check if the token exists but is used (possible replay)
      $usedToken = $this->authRepository->findRefreshTokenByHash($refreshHash);
      if ($usedToken && $usedToken['used_at'] !== null) {
        // Revoke the entire family because a replay attack is suspected
        $this->authRepository->revokeRefreshTokenFamily($usedToken['family_id']);
      }
      throw new ApiException(ErrorType::invalidRefreshToken(), 401);
    }

    $userId = $stored['user_id'];
    $oldTokenId = $stored['refresh_token_id'];
    $familyId = $stored['family_id'];
    $accessTtl = 3600 + 1800;
    $refreshTtl = 3600 * 24 * 30;

    $rawNewAccess = bin2hex(random_bytes(32));
    $rawNewRefresh = bin2hex(random_bytes(64));
    $newAccessHash = $this->hashToken($rawNewAccess);
    $newRefreshHash = $this->hashToken($rawNewRefresh);

    try {
      $this->pdo->beginTransaction();
      $newRefreshDto = new RefreshTokenDTO($userId, $newRefreshHash, $refreshTtl, $familyId);
      $this->authRepository->rotateRefreshToken($newRefreshDto, $oldTokenId);
      $this->authRepository->upsertAccessToken(new AccessTokenDTO($userId, $newAccessHash, $accessTtl));
      $this->pdo->commit();
    } catch (Throwable $e) {
      $this->pdo->rollBack();
      // If the old token was already marked as used (duplicate family detection), revoke family
      if (str_contains($e->getMessage(), 'Duplicate entry') || $e->getCode() == 23000) {
        $this->authRepository->revokeRefreshTokenFamily($familyId);
        throw new ApiException(ErrorType::invalidRefreshToken(), 401);
      }
      throw new ApiException(ErrorType::internal('Token refresh failed: ' . $e->getMessage()), 500);
    }

    return [
      'data' => [
        'access_token'        => $rawNewAccess,
        'access_expires_at'   => date('Y-m-d H:i:s', time() + $accessTtl),
        'refresh_token'       => $rawNewRefresh,
        'refresh_expires_at'  => date('Y-m-d H:i:s', time() + $refreshTtl),
      ],
      'meta' => [
        'token_type' => 'Bearer',
        'expires_in' => $accessTtl,
      ],
    ];
  }

  /**
   * Logs out the currently authenticated user by deleting all their tokens.
   *
   * If the token is already invalid or no active session is found,
   * an ApiException with status 400 is thrown.
   *
   * @return void
   * @throws ApiException When no active session exists.
   */
  public function logout(): void
  {
    $userId = null;
    try {
      // Try to get authenticated user from context
      $auth = $this->requireAuth();
      $userId = $auth['user_id'];
    } catch (ApiException $e) {
      // No authenticated user in context, try to extract token
      $rawToken = $this->extractTokenFromRequest();
      if ($rawToken === null) {
        throw new ApiException(ErrorType::from('NO_ACTIVE_SESSION', 'No active session found.'), 400);
      }
      $tokenHash = $this->hashToken($rawToken);
      $tokenRecord = $this->authRepository->findAccessTokenByHash($tokenHash);
      if ($tokenRecord === null) {
        throw new ApiException(ErrorType::from('NO_ACTIVE_SESSION', 'No active session found.'), 400);
      }
      $userId = $tokenRecord['user_id'];
    }

    if ($userId === null) {
      throw new ApiException(ErrorType::from('NO_ACTIVE_SESSION', 'No active session found.'), 400);
    }

    // Delete all tokens for this user
    $this->authRepository->deleteUserTokens($userId);
  }

  /**
   * Ensures the current request is authenticated and returns user info.
   *
   * @return array<string, string> Authenticated user data (user_id, email, role).
   * @throws ApiException When no valid authentication is present.
   */
  public function requireAuth(): array
  {
    $existingUser = Request::getUser();
    if ($existingUser) {
      return $existingUser;
    }
    $rawToken = $this->extractTokenFromRequest();
    if ($rawToken === null) {
      throw new ApiException(ErrorType::unauthorized(), 401);
    }
    return $this->authenticate($rawToken);
  }

  /**
   * Validates a raw access token.
   *
   * @param string $rawAccessToken
   * @return array<string, string> Token record.
   * @throws ApiException
   */
  public function validateAccessToken(string $rawAccessToken): array
  {
    $hash = $this->hashToken($rawAccessToken);
    $token = $this->authRepository->findValidAccessToken($hash);
    if ($token === null) {
      throw new ApiException(ErrorType::invalidAccessToken(), 401);
    }
    return $token;
  }

  /**
   * Hashes a raw token using SHA‑256 (hexadecimal).
   *
   * @param string $rawToken
   * @return string
   */
  private function hashToken(string $rawToken): string
  {
    return hash('sha256', $rawToken);
  }

  /**
   * Extracts token from Authorization header or session cookie.
   *
   * @return string|null
   */
  private function extractTokenFromRequest(): ?string
  {
    $headers = getallheaders();
    $authorization = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (str_starts_with($authorization, 'Bearer ')) {
      return trim(substr($authorization, 7));
    }
    $sessionCookie = $_COOKIE['geoterra_session_token'] ?? null;
    if ($sessionCookie !== null && is_string($sessionCookie)) {
      return $sessionCookie;
    }
    return null;
  }

  /**
   * Authenticates a raw access token and returns user data.
   *
   * @param string $rawAccessToken
   * @return array<string, string>
   * @throws ApiException
   */
  private function authenticate(string $rawAccessToken): array
  {
    $tokenRecord = $this->validateAccessToken($rawAccessToken);
    $userId = $tokenRecord['user_id'];
    $user = $this->userRepository->findById($userId);
    if ($user === null) {
      throw new ApiException(ErrorType::unauthorized('User not found'), 401);
    }
    return [
      'user_id' => $user['user_id'],
      'email'   => $user['email'],
      'role'    => $user['role'],
    ];
  }
}