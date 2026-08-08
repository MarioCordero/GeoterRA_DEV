<?php
declare(strict_types=1);

namespace Services;

use Core\EnvironmentDetector;
use Core\Logger;
use DateTime;
use DateTimeZone;
use DTO\AccessTokenDTO;
use DTO\LoginUserDTO;
use DTO\RefreshTokenDTO;
use DTO\ResetPasswordDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use PDO;
use Repositories\AuthRepository;
use Repositories\UserRepository;
use Throwable;

final class AuthService
{
  private UserRepository $userRepository;
  private AuthRepository $authRepository;

  public function __construct(
    private readonly PDO $pdo,
    private readonly ?NotificationService $notificationService = null
  ) {
    $this->userRepository = new UserRepository($this->pdo);
    $this->authRepository = new AuthRepository($this->pdo);
  }

  /**
   * Login – verifies credentials, checks account status, issues tokens.
   *
   * @param LoginUserDTO $dto
   * @return array
   * @throws ApiException
   */
  public function login(LoginUserDTO $dto): array
  {
    $dto->validate();

    $user = $this->userRepository->findByEmail($dto->email);
    if (!$user || !PasswordService::verify(
        $dto->password, $user['password_hash']
      )) {
      throw new ApiException(ErrorType::invalidCredentials(), 401);
    }

    // Check if account is soft-deleted
    if ($user['is_deleted'] === 1 || $user['deleted_at'] !== null) {
      throw new ApiException(
        ErrorType::from('ACCOUNT_DELETED', 'This account has been deleted.'),
        401
      );
    }

    $userId = $user['user_id'];
    $accessTtl = 60 * 5;
    $refreshTtl = 3600 * 24 * 30;

    $rawAccessToken = bin2hex(random_bytes(32));
    $rawRefreshToken = bin2hex(random_bytes(64));

    $accessHash = $this->hashToken($rawAccessToken);
    $refreshHash = $this->hashToken($rawRefreshToken);

    $refreshDto = new RefreshTokenDTO($userId, $refreshHash, $refreshTtl);
    $accessDto = new AccessTokenDTO($userId, $accessHash, $accessTtl);

    try {
      $this->pdo->beginTransaction();
      $this->authRepository->deleteUserTokens($userId);
      $this->authRepository->createRefreshToken($refreshDto);
      $this->authRepository->upsertAccessToken($accessDto);
      $this->pdo->commit();

      if ($this->notificationService !== null) {
        $ip = Request::getIpAddress();
        $userAgent = Request::getUserAgent();
        $location = IpLocationService::getFromIp($ip);
        $tz = new DateTimeZone('America/Costa_Rica');
        $crDate = new DateTime('now', $tz);
        $time = $crDate->format('Y-m-d H:i:s');
        $device = $this->parseDeviceFromUserAgent($userAgent);

        $this->notificationService->notifyNewLogin(
          $user['email'],
          $user['first_name'],
          $device,
          $location,
          $time
        );
      }

    } catch (Throwable $e) {
      $this->pdo->rollBack();
      throw new ApiException(
        ErrorType::internal('Login failed'),
        500
      );
    }

    // Use $user from findByEmail (no extra query)
    return [
      'data' => [
        'access_token' => $rawAccessToken,
        'refresh_token' => $rawRefreshToken,
        'user_id' => $userId,
        'role' => $user['role'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'email' => $user['email'],
        'phone_number' => $user['phone_number']
      ],
      'meta' => [
        'token_type' => 'Bearer',
        'expires_in' => $accessTtl,
      ],
    ];
  }

  /**
   * Extracts a simplified device OS/Browser name from the raw User-Agent string.
   *
   * @param string $userAgent The raw HTTP User-Agent.
   * @return string A human-readable device/browser identifier.
   */
  private function parseDeviceFromUserAgent(string $userAgent): string
  {
    $os = 'Unknown OS';
    if (preg_match('/windows nt 10/i', $userAgent)) $os = 'Windows 10/11';
    elseif (preg_match('/windows nt/i', $userAgent)) $os = 'Windows';
    elseif (preg_match('/macintosh|mac os x/i', $userAgent)) $os = 'macOS';
    elseif (preg_match('/linux/i', $userAgent)) $os = 'Linux';
    elseif (preg_match('/iphone|ipad|ipod/i', $userAgent)) $os = 'iOS';
    elseif (preg_match('/android/i', $userAgent)) $os = 'Android';

    $browser = 'Unknown Browser';
    if (preg_match('/edg/i', $userAgent)) $browser = 'Edge';
    elseif (preg_match('/chrome/i', $userAgent)) $browser = 'Chrome';
    elseif (preg_match('/safari/i', $userAgent)
      && !preg_match('/chrome/i', $userAgent)
    ) $browser = 'Safari';
    elseif (preg_match('/firefox/i', $userAgent)) $browser = 'Firefox';

    return "{$os} - {$browser}";
  }

  /**
   * Initiates the password reset process by generating an OTP and dispatching an email.
   *
   * @param string $email The user's email address.
   * @return void
   * @throws Throwable
   */
  public function requestPasswordReset(string $email): void
  {
    $user = $this->userRepository->findByEmail($email);

    if (!$user || $user['is_deleted'] === 1) {
      return;
    }

    $rawToken = (string) random_int(100000, 999999);
    $tokenHash = hash('sha256', $rawToken);
    // 5-Minutes expiry
    $expiry = time() + 300;

    try {
      $this->pdo->beginTransaction();

      $this->authRepository->deletePasswordResetTokens($user['user_id']);
      $this->authRepository->insertPasswordResetToken(
        $user['user_id'],
        $tokenHash,
        $expiry
      );

      $this->pdo->commit();

      if ($this->notificationService !== null) {
        $this->notificationService->notifyPasswordReset(
          $user['email'],
          $user['first_name'],
          $rawToken
        );
      }
    } catch (Throwable $e) {
      $this->pdo->rollBack();
      throw new ApiException(
        ErrorType::internal(
          'Ha ocurrido un error durante la petición de recuperación'),
        500
      );
    }
  }

  /**
   * Validates the provided OTP and updates the user's password.
   *
   * @param ResetPasswordDTO $dto The DTO containing the OTP and new password.
   * @return void
   * @throws ApiException
   */
  public function resetPassword(ResetPasswordDTO $dto): void
  {
    $dto->validate();

    $tokenHash = hash('sha256', $dto->token);
    $record = $this->authRepository->findPasswordResetToken($tokenHash);

    if (!$record || (int)$record['token_expiry'] < time()) {
      throw new ApiException(
        ErrorType::unauthorized('Invalid or expired reset token'),
        401
      );
    }

    $hashedPassword = PasswordService::hash($dto->newPassword);

    try {
      $this->pdo->beginTransaction();
      $this->userRepository->updatePassword(
        $record['user_id'],
        $hashedPassword
      );
      $this->authRepository->deletePasswordResetTokens($record['user_id']);

      // Enforce security by revoking active sessions upon password change
      $this->authRepository->deleteUserTokens($record['user_id']);
      $this->pdo->commit();
    } catch (Throwable $e) {
      $this->pdo->rollBack();
      throw new ApiException(
        ErrorType::internal('Failed to reset password'),
        500
      );
    }
  }

  private function hashToken(string $rawToken): string
  {
    return hash('sha256', $rawToken);
  }

  /**
   * Refresh tokens – advanced rotation with family detection and replay protection.
   *
   * @param string $rawRefreshToken
   * @return array
   * @throws ApiException
   */
  public function refreshTokens(string $rawRefreshToken): array
  {
    $refreshHash = $this->hashToken($rawRefreshToken);
    $stored = $this->authRepository->findValidRefreshToken($refreshHash);

    if (!$stored) {
      // Possible replay attack – check if token exists but is used
      $usedToken = $this->authRepository->findRefreshTokenByHash($refreshHash);
      if ($usedToken && $usedToken['used_at'] !== null) {
        // Revoke entire family
        $this->authRepository->revokeRefreshTokenFamily(
          $usedToken['family_id']
        );
        $this->authRepository->deleteUserTokens($usedToken['user_id']);
      }
      throw new ApiException(ErrorType::invalidRefreshToken(), 401);
    }

    $userId = $stored['user_id'];
    $oldTokenId = $stored['refresh_token_id'];
    $familyId = $stored['family_id'];
    $accessTtl = 60 * 5;
    $refreshTtl = 3600 * 24 * 30;

    $rawNewAccess = bin2hex(random_bytes(32));
    $rawNewRefresh = bin2hex(random_bytes(64));
    $newAccessHash = $this->hashToken($rawNewAccess);
    $newRefreshHash = $this->hashToken($rawNewRefresh);

    $newRefreshDto = new RefreshTokenDTO(
      $userId, $newRefreshHash, $refreshTtl, $familyId
    );
    $newAccessDto = new AccessTokenDTO($userId, $newAccessHash, $accessTtl);

    try {
      $this->pdo->beginTransaction();
      $this->authRepository->rotateRefreshToken($newRefreshDto, $oldTokenId);
      $this->authRepository->upsertAccessToken($newAccessDto);
      $this->pdo->commit();
    } catch (Throwable $e) {
      $this->pdo->rollBack();
      // If duplicate entry (race condition), revoke family
      if ($e->getCode() === 23000) {
        $this->authRepository->revokeRefreshTokenFamily($familyId);
        throw new ApiException(ErrorType::invalidRefreshToken(), 401);
      }
      throw new ApiException(
        ErrorType::internal('Token refresh failed'),
        500
      );
    }

    return [
      'data' => [
        'access_token' => $rawNewAccess,
        'access_expires_at' => date('Y-m-d H:i:s', time() + $accessTtl),
        'refresh_token' => $rawNewRefresh,
        'refresh_expires_at' => date('Y-m-d H:i:s', time() + $refreshTtl),
        'user_id' => $userId,
      ],
      'meta' => [
        'token_type' => 'Bearer',
        'expires_in' => $accessTtl,
      ],
    ];
  }

  /**
   * Logout – revokes all tokens of the authenticated user.
   * Tries to get user from context; if fails, extracts token from header/cookie.
   *
   * @throws ApiException
   */
  public function logout(): void
  {
    $userId = null;

    try {
      $auth = $this->requireAuth();
      $userId = $auth['user_id'];
    } catch (ApiException $e) {
      // Not authenticated – try to extract token anyway
      $rawToken = $this->extractTokenFromRequest();
      if ($rawToken === null) {
        // No token -> nothing to logout
        return;
      }
      $tokenHash = $this->hashToken($rawToken);
      $tokenRecord = $this->authRepository->findAccessTokenByHash($tokenHash);
      if ($tokenRecord === null) {
        return; // Token not found, nothing to revoke
      }
      $userId = $tokenRecord['user_id'];
    }

    if ($userId !== null) {
      $this->authRepository->deleteUserTokens($userId);
    }
  }

  /**
   * Require authentication – checks client validity and extracts token.
   *
   * @return array
   * @throws ApiException
   */
  public function requireAuth(): array
  {
    if (!Request::isValidClient()) {
      throw new ApiException(
        ErrorType::unauthorized('Client identification required'),
        403
      );
    }

    $token = Request::getToken(); // Uses platform detection internally

    Logger::debug(
      'info [AuthService] Authenticating request. Client type: '
      . (Request::isWeb() ? 'web' : 'mobile') . ', Token: '
      . ($token ? substr($token, 0, 8) . '...' : 'none')
    );

    if (!$token) {
      throw new ApiException(ErrorType::missingAuthToken(), 401);
    }

    return $this->authenticate($token);
  }

  private function authenticate(string $rawAccessToken): array
  {
    $tokenRecord = $this->validateAccessToken($rawAccessToken);
    $user = $this->userRepository->findById($tokenRecord['user_id']);
    if (!$user) {
      throw new ApiException(ErrorType::unauthorized('User not found'), 401);
    }
    return [
      'user_id' => $user['user_id'],
      'email' => $user['email'],
      'first_name' => $user['first_name'],
      'last_name' => $user['last_name'],
      'phone_number' => $user['phone_number'] ?? null,
      'role' => $user['role'],
    ];
  }

  /**
   * Validate an access token.
   *
   * @param string $rawAccessToken
   * @return array
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

  // ---------- Private helpers ----------

  private function extractTokenFromRequest(): ?string
  {
    // Try Authorization header first
    $headers = getallheaders();
    $authorization = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (str_starts_with($authorization, 'Bearer ')) {
      return trim(substr($authorization, 7));
    }

    // Fallback: session cookie (for web)
    return $_COOKIE['geoterra_session_token'] ?? null;
  }

  /**
   * Prepare response for web clients – sets HTTP‑only cookie, returns user data.
   *
   * @param array $result
   * @return array
   */
  public function prepareWebResponse(array $result): array
  {
    $accessToken = $result['data']['access_token'];
    $expiresIn = $result['meta']['expires_in'] ?? 5400;

    $useSecure = EnvironmentDetector::shouldUseSecureCookie();
    $sameSite = EnvironmentDetector::getSameSiteValue();
    $domain = EnvironmentDetector::getCookieDomain();

    setcookie(
      'geoterra_session_token',
      $accessToken,
      [
        'expires' => time() + $expiresIn,
        'path' => '/',
        'domain' => $domain,
        'secure' => $useSecure,
        'httponly' => true,
        'samesite' => $sameSite,
      ]
    );

    return [
      'user_id' => $result['data']['user_id'],
      'role' => $result['data']['role'],
      'email' => $result['data']['email'],
      'first_name' => $result['data']['first_name'],
      'last_name' => $result['data']['last_name'],
    ];
  }

  /**
   * Prepare response for mobile clients – returns bearer tokens.
   *
   * @param array $result
   * @return array
   */
  public function prepareMobileResponse(array $result): array
  {
    return [
      'access_token' => $result['data']['access_token'],
      'refresh_token' => $result['data']['refresh_token'],
      'user_id' => $result['data']['user_id'],
    ];
  }
}