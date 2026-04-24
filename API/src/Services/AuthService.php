<?php
declare(strict_types=1);

namespace Services;

use PDO;
use Http\Request;
use Http\ErrorType;
use DTO\LoginUserDTO;
use Http\ApiException;
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

    $userInfo = $this->userRepository->findById($userId);

    return [
      'data' => [
        'access_token' => $accessToken,
        'refresh_token' => $refreshToken,
        'user_id' => $userId,
        'email' => $userInfo['email'],
        'name' => $userInfo['name'] ?? '',
        'is_admin' => (bool) ($userInfo['role'] === 'admin'),
        'role' => $userInfo['role'] ?? 'usr'
      ],
      'meta' => [
        'token_type' => 'Bearer',
        'expires_in' => $accessExpires
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
   * Attempts to validate the token first, but if it's expired or invalid,
   * still allows logout as a fallback (clears the session).
   *
   * @throws ApiException only for real server errors (DB issues)
   */
  public function logout(): void
  {
    try {
      $auth = $this->requireAuth();
      $userId = $auth['user_id'];

    } catch (ApiException $e) {

      $headers = getallheaders();
      $authorization = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
      
      if (!str_starts_with($authorization, 'Bearer ')) {
        return;
      }
      
      $token = trim(substr($authorization, 7));
      
      if ($token === '') {
        return;
      }
      $tokenRecord = $this->authRepository->findAccessTokenWithoutValidation($token);
      
      if (!$tokenRecord) {
        return;
      }
      
      $userId = $tokenRecord['user_id'];
    }

    $this->authRepository->deleteUserTokens($userId);
  }

  /**
   * Require authentication for an endpoint and return the authenticated user info.
   *
   * @throws ApiException if authentication fails
   */
  public function requireAuth(): array
  {
    if (!Request::isValidClient()) {
      throw new ApiException(ErrorType::unauthorized('Client identification required'), 403);
    }

    $token = Request::isWeb() 
        ? Request::getCookie('geoterra_session_token')
        : Request::getBearerToken();

    error_log('info [AuthService] Authenticating request. Client type: ' . (Request::isWeb() ? 'web' : 'mobile') . ', Token: ' . ($token ? substr($token, 0, 8) . '...' : 'none'));

    if (!$token) {
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
  public function validateAccessToken(string $rawToken): array
  {
    $token = $this->authRepository->findValidAccessToken($rawToken);
    if (!$token) {
      throw new ApiException(ErrorType::invalidAccessToken(), 401);
    }
    return $token;
  }

  /**
   * Prepare login response for web clients (sets HTTP-only cookie).
   *
   * @param array $result Login result from login()
   * @return array Response data to send to client
   */
    public function prepareWebResponse(array $result): array
    {
      $accessToken = $result['data']['access_token'];
      
      // Dynamically determine cookie settings based on protocol and domain
      $useSecureFlag = \Core\EnvironmentDetector::shouldUseSecureCookie();
      $sameSite = \Core\EnvironmentDetector::getSameSiteValue();
      $cookieDomain = \Core\EnvironmentDetector::getCookieDomain();
      
      setcookie(
        'geoterra_session_token',
        $accessToken,
        [
          'expires' => time() + 5400,
          'path' => '/',
          'domain' => $cookieDomain,
          'secure' => $useSecureFlag,
          'httponly' => true,
          'samesite' => $sameSite,
        ]
      );

      return [
        'user_id' => $result['data']['user_id'],
        'email' => $result['data']['email'],
        'name' => $result['data']['name'],
        'role' => $result['data']['role'],
        'is_admin' => $result['data']['is_admin'],
      ];
    }

  /**
   * Prepare login response for mobile clients (returns bearer tokens).
   *
   * @param array $result Login result from login()
   * @return array Response data to send to client
   */
  public function prepareMobileResponse(array $result): array
  {
    return [
      'access_token' => $result['data']['access_token'],
      'refresh_token' => $result['data']['refresh_token'],
      'user_id' => $result['data']['user_id'],
    ];
  }

  // HELPERS

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
      'role' => $user['role'],
    ];
  }
}