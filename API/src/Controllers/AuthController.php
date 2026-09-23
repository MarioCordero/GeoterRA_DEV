<?php
declare(strict_types=1);

namespace Controllers;

use DTO\LoginUserDTO;
use DTO\ResetPasswordDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use PDO;
use Services\AuthService;
use Services\SmtpEmailService;
use Services\NotificationService;
use Throwable;
use OpenApi\Annotations as OA;

/**
 * Controller handling authentication endpoints.
 */
final class AuthController
{
  private AuthService $authService;

  /**
   * Constructs the AuthController and wires necessary dependencies.
   *
   * @param PDO $pdo The active database connection.
   */
  public function __construct(private readonly PDO $pdo)
  {
    $emailSender = new SmtpEmailService();
    $notificationService = new NotificationService($emailSender);
    $this->authService = new AuthService($this->pdo, $notificationService);
  }

  /**
   * @OA\Post(
   *     path="/auth/login",
   *     summary="Authenticate user and return tokens",
   *     tags={"Authentication"},
   *     @OA\RequestBody(
   *         required=true,
   *         @OA\JsonContent(ref="#/components/schemas/LoginUserDTO")
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="Successful authentication"
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Invalid credentials or account deleted"
   *     )
   * )
   */
  public function login(): void
  {
    try {
      $data = Request::parseJsonRequest();
      $dto = LoginUserDTO::fromArray($data);
      $result = $this->authService->login($dto);

      if (Request::isWeb()) {
        $responseData = $this->authService->prepareWebResponse($result);
        $meta = [
          'token_type' => 'Cookie',
          'expires_in' => $result['meta']['expires_in'] ?? 5400,
          'message' => 'Session set via HTTP-only cookie',
        ];
      } else {
        $responseData = $this->authService->prepareMobileResponse($result);
        $meta = [
          'token_type' => 'Bearer',
          'expires_in' => $result['meta']['expires_in'] ?? 5400,
        ];
      }

      Response::success($responseData, $meta, 200);

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * @OA\Post(
   *     path="/auth/refresh",
   *     summary="Refresh access tokens",
   *     tags={"Authentication"},
   *     @OA\Response(
   *         response=200,
   *         description="Tokens refreshed successfully"
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Invalid or expired refresh token"
   *     )
   * )
   */
  public function refresh(): void
  {
    try {
      // For web: read refresh token from HttpOnly cookie
      // For mobile: read from JSON body (existing behavior)
      if (Request::isWeb()) {
        $refreshToken = $_COOKIE['geoterra_refresh_token'] ?? null;
      } else {
        $body = Request::parseJsonRequest();
        $refreshToken = $body['refresh_token'] ?? null;
      }

      if (empty($refreshToken)) {
        throw new ApiException(
          ErrorType::missingField('refresh_token'),
          400
        );
      }

      $result = $this->authService->refreshTokens($refreshToken);
      if (Request::isWeb()) {
        $accessToken = $result['data']['access_token'];
        $newRefreshToken = $result['data']['refresh_token'];
        $expiresIn = $result['meta']['expires_in'] ?? 60 * 5;
        $refreshTtl = 3600 * 24 * 30; // 30 days

        // Renew access token cookie
        setcookie(
          'geoterra_session_token',
          $accessToken,
          [
            'expires' => time() + $expiresIn,
            'path' => '/',
            'domain' => '',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Lax',
          ]
        );

        // Renew rotated refresh token cookie
        setcookie(
          'geoterra_refresh_token',
          $newRefreshToken,
          [
            'expires' => time() + $refreshTtl,
            'path' => '/api/auth/',
            'domain' => '',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Lax',
          ]
        );

        $responseData = [
          'user_id' => $result['data']['user_id'],
          'message' => 'Session renewed',
        ];
        $meta = [
          'token_type' => 'Cookie',
          'expires_in' => $expiresIn,
        ];
      } else {
        $responseData = [
          'access_token' => $result['data']['access_token'],
          'refresh_token' => $result['data']['refresh_token'],
          'user_id' => $result['data']['user_id'],
        ];
        $meta = [
          'token_type' => 'Bearer',
          'expires_in' => $result['meta']['expires_in'] ?? 60 * 5,
        ];
      }

      Response::success($responseData, $meta, 200);

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * @OA\Post(
   *     path="/auth/password-reset/request",
   *     summary="Request a password reset OTP",
   *     tags={"Authentication"},
   *     @OA\RequestBody(
   *         required=true,
   *         @OA\JsonContent(
   *             required={"email"},
   *             @OA\Property(property="email", type="string", format="email")
   *         )
   *     ),
   *     @OA\Response(response=200, description="OTP requested successfully")
   * )
   */
  public function requestPasswordReset(): void
  {
    try {
      $data = Request::parseJsonRequest();

      if (empty($data['email'])) {
        throw new ApiException(
          ErrorType::missingField('email'),
          400
        );
      }

      $this->authService->requestPasswordReset($data['email']);

      Response::success(
        ['message' => 'El código de recuperación ha sido enviado a su correo electrónico.']
      );
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * @OA\Post(
   *     path="/auth/password-reset/reset",
   *     summary="Reset the password using the OTP",
   *     tags={"Authentication"},
   *     @OA\RequestBody(
   *         required=true,
   *         @OA\JsonContent(
   *             required={"token", "new_password"},
   *             @OA\Property(property="token", type="string"),
   *             @OA\Property(property="new_password", type="string")
   *         )
   *     ),
   *     @OA\Response(response=200, description="Password updated successfully")
   * )
   */
  public function resetPassword(): void
  {
    try {
      $data = Request::parseJsonRequest();
      $dto = ResetPasswordDTO::fromArray($data);

      $this->authService->resetPassword($dto);

      Response::success(
        ['message' => 'La contraseña se ha actualizado correctamente.']
      );
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * @OA\Post(
   *     path="/auth/logout",
   *     summary="Invalidate user session",
   *     tags={"Authentication"},
   *     @OA\Response(
   *         response=200,
   *         description="User logged out successfully"
   *     )
   * )
   */
  public function logout(): void
  {
    try {
      $this->authService->logout();

      if (Request::isWeb()) {
        // Clear access token cookie
        setcookie(
          'geoterra_session_token', '', [
            'expires' => time() - 60 * 5,
            'path' => '/',
            'domain' => '',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Lax',
          ]
        );

        // Clear refresh token cookie
        setcookie(
          'geoterra_refresh_token', '', [
            'expires' => time() - 60 * 5,
            'path' => '/api/auth/',
            'domain' => '',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Lax',
          ]
        );
      }

      Response::success(['logged_out' => true], null, 200);

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}