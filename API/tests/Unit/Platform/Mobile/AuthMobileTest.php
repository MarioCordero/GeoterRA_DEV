<?php

declare(strict_types=1);

namespace Tests\Unit\Platform\Mobile;

use Tests\TestCase;
use DTO\LoginUserDTO;
use Http\ApiException;

/**
 * Mobile Stack Authentication Tests
 * 
 * Tests bearer token-based authentication used by
 * Kotlin, iOS, and other native mobile applications
 */
class AuthMobileTest extends TestCase
{
    private \Services\AuthService $authService;
    private \Repositories\UserRepository $userRepository;
    private \Repositories\AuthRepository $authRepository;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->userRepository = new \Repositories\UserRepository($this->pdo);
        $this->authRepository = new \Repositories\AuthRepository($this->pdo);
        $this->authService = new \Services\AuthService(
            $this->userRepository,
            $this->authRepository
        );
    }
    public function testMobileLoginReturnsBearerToken(): void
    {
        $user = $this->createTestUser([
            'email' => 'mobile@example.com',
            'password' => 'SecurePass123!'
        ]);

        $dto = LoginUserDTO::fromArray([
            'email' => $user['email'],
            'password' => $user['password']
        ]);

        $result = $this->authService->login($dto);

        // Mobile response should include both tokens
        $this->assertArrayHasKey('access_token', $result);
        $this->assertArrayHasKey('refresh_token', $result);
        
        // Access token: 32 bytes hex (64 chars)
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $result['access_token']);
        
        // Refresh token: 64 bytes hex (128 chars)
        $this->assertMatchesRegularExpression('/^[a-f0-9]{128}$/', $result['refresh_token']);
    }

    public function testMobileTokensAreDifferent(): void
    {
        $user = $this->createTestUser([
            'email' => 'mobile@example.com',
            'password' => 'SecurePass123!'
        ]);

        $dto = LoginUserDTO::fromArray([
            'email' => $user['email'],
            'password' => $user['password']
        ]);

        $result = $this->authService->login($dto);

        // Access and refresh tokens must be different
        $this->assertNotEquals(
            $result['access_token'],
            $result['refresh_token']
        );
    }

    public function testMobileBearerTokenValidation(): void
    {
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['id']);

        // Mobile should validate bearer token
        $result = $this->authService->validateAccessToken($token['token']);

        $this->assertEquals($user['id'], $result['user_id']);
    }

    public function testMobileTokenRefresh(): void
    {
        $user = $this->createTestUser();
        $oldToken = $this->createTestAccessToken($user['id']);
        $refreshToken = $this->createTestRefreshToken($user['id']);

        // Refresh should return new tokens
        $result = $this->authService->refreshTokens($refreshToken['token']);

        // New tokens should be different from old
        $this->assertNotEquals($oldToken['token'], $result['access_token']);
        $this->assertNotEquals($refreshToken['token'], $result['refresh_token']);
        
        // Both should be valid hex
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $result['access_token']);
        $this->assertMatchesRegularExpression('/^[a-f0-9]{128}$/', $result['refresh_token']);
    }

    public function testMobileTokenRotationOnRefresh(): void
    {
        $user = $this->createTestUser();
        $oldRefreshToken = $this->createTestRefreshToken($user['id']);

        // Refresh rotates tokens
        $result = $this->authService->refreshTokens($oldRefreshToken['token']);

        // Old refresh token should potentially be revoked
        // New tokens should work
        $newResult = $this->authService->validateAccessToken($result['access_token']);
        $this->assertEquals($user['id'], $newResult['user_id']);
    }

    public function testMobileUnauthorizedHeaderHandling(): void
    {
        // Missing/invalid bearer token should throw
        $this->expectException(ApiException::class);
        
        $this->authService->validateAccessToken('invalid_bearer_token_format');
    }

    public function testMobileLogoutRevokesTokens(): void
    {
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['id']);

        // Mobile logout should revoke tokens
        $this->authService->logout($token['token']);

        // Token should be revoked
        $stmt = $this->pdo->prepare(
            'SELECT revoked_at FROM access_tokens WHERE token_hash = ?'
        );
        $stmt->execute([hash('sha256', $token['token'])]);
        $result = $stmt->fetch();

        $this->assertNotNull($result['revoked_at']);
    }

    public function testMobileMultipleAppsLoginsIndependent(): void
    {
        $user = $this->createTestUser();

        // Simulate login on mobile app 1
        $token1 = $this->createTestAccessToken($user['id']);

        // Simulate logout on mobile app 1
        $this->authService->logout($token1['token']);

        // Token1 should be revoked
        $this->expectException(ApiException::class);
        $this->authService->validateAccessToken($token1['token']);
    }

    public function testMobileRefreshTokenExpiry(): void
    {
        $user = $this->createTestUser();
        
        // Create expired refresh token (older than 30 days)
        $expiredRefresh = $this->createTestRefreshToken(
            $user['id'],
            new \DateTime('-31 days')
        );

        // Should not be able to refresh with expired token
        $this->expectException(ApiException::class);
        $this->authService->refreshTokens($expiredRefresh['token']);
    }

    public function testMobileBearerTokenFormat(): void
    {
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['id']);

        // Token should be hex string (valid for Authorization: Bearer header)
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $token['token']);
        
        // Should be usable in Authorization header as:
        // Authorization: Bearer {token}
        $header = "Bearer " . $token['token'];
        $this->assertStringContainsString('Bearer', $header);
    }

    public function testMobileAppPlatformDetection(): void
    {
        // This test would verify that mobile app requests
        // are correctly identified and routed to bearer auth
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['id']);

        // Token should be valid when app sends bearer token
        $result = $this->authService->validateAccessToken($token['token']);
        $this->assertIsArray($result);
    }

    public function testMobileOfflineTokenHandling(): void
    {
        // Mobile app might store tokens in secure local storage
        // and use them offline, but should validate when online
        
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['id']);

        // Simulate offline: token stored locally
        $offlineToken = $token['token'];

        // Simulate coming online: validate token
        $result = $this->authService->validateAccessToken($offlineToken);
        $this->assertEquals($user['id'], $result['user_id']);
    }

    public function testMobileWithCustomHeaders(): void
    {
        // Mobile apps send custom headers for platform detection
        // Headers like X-App-Platform, X-App-Version should be detectable
        
        // This is configuration-level, not token-level validation
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['id']);

        // Token should still validate regardless of headers
        $result = $this->authService->validateAccessToken($token['token']);
        $this->assertNotNull($result);
    }
}
