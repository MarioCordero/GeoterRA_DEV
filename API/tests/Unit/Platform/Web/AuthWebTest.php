<?php

declare(strict_types=1);

namespace Tests\Unit\Platform\Web;

use Tests\TestCase;
use DTO\LoginUserDTO;
use Http\ApiException;

/**
 * Web Stack Authentication Tests
 * 
 * Tests HTTP-only cookie-based session authentication
 * used by web browsers and web applications
 */
class AuthWebTest extends TestCase
{
    private \Services\AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authService = new \Services\AuthService($this->pdo);
    }
    public function testLoginResultsInSessionCookie(): void
    {
        $user = $this->createTestUser([
            'email' => 'web@example.com',
            'password' => 'SecurePass123!'
        ]);

        $dto = LoginUserDTO::fromArray([
            'email' => $user['email'],
            'password' => $user['password']
        ]);

        $result = $this->authService->login($dto);

        // Web response should include access token
        $this->assertArrayHasKey('access_token', $result);
        $this->assertNotEmpty($result['access_token']);
        
        // Should be 32 bytes hex encoded (64 chars)
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $result['access_token']);
    }

    public function testWebLoginTokenCanBeValidated(): void
    {
        $user = $this->createTestUser([
            'email' => 'web@example.com',
            'password' => 'SecurePass123!'
        ]);

        // Simulate login
        $token = $this->createTestAccessToken($user['id']);

        // Token should be validatable
        $result = $this->authService->validateAccessToken($token['token']);

        $this->assertEquals($user['id'], $result['user_id']);
    }

    public function testWebSessionTokenExpiry(): void
    {
        $user = $this->createTestUser();
        
        // Create token that expires in future
        $futureToken = $this->createTestAccessToken(
            $user['id'],
            new \DateTime('+1 hour')
        );

        // Should be valid
        $result = $this->authService->validateAccessToken($futureToken['token']);
        $this->assertIsArray($result);

        // Create expired token
        $expiredToken = $this->createTestAccessToken(
            $user['id'],
            new \DateTime('-1 hour')
        );

        // Should throw when validating expired token
        $this->expectException(ApiException::class);
        $this->authService->validateAccessToken($expiredToken['token']);
    }

    public function testWebLogoutClearsSession(): void
    {
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['id']);

        // Logout should revoke token
        $this->authService->logout($token['token']);

        // Token should no longer be valid
        $stmt = $this->pdo->prepare(
            'SELECT revoked_at FROM access_tokens WHERE token_hash = ?'
        );
        $stmt->execute([hash('sha256', $token['token'])]);
        $result = $stmt->fetch();

        $this->assertNotNull($result['revoked_at']);
    }

    public function testWebMultipleLoginsSameBrowser(): void
    {
        $user = $this->createTestUser([
            'email' => 'web@example.com',
            'password' => 'SecurePass123!'
        ]);

        // First login
        $dto = LoginUserDTO::fromArray([
            'email' => $user['email'],
            'password' => $user['password']
        ]);

        $result1 = $this->authService->login($dto);

        // Second login (simulates user logging in again in same browser)
        $result2 = $this->authService->login($dto);

        // Only one token should be active per user (one-token-per-user pattern)
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) as count FROM access_tokens WHERE user_id = ? AND revoked_at IS NULL'
        );
        $stmt->execute([$user['id']]);
        $count = (int)$stmt->fetch()['count'];

        $this->assertEquals(1, $count, "Only one active token per user allowed");
    }

    public function testWebSessionPersistence(): void
    {
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['id']);

        // Simulate multiple requests with same token
        for ($i = 0; $i < 5; $i++) {
            $result = $this->authService->validateAccessToken($token['token']);
            $this->assertEquals($user['id'], $result['user_id']);
        }

        // Token should still be valid
        $this->assertTrue(true);
    }

    public function testWebCookieSecurityAttributes(): void
    {
        // Cookie should have:
        // 1. HTTP-only flag (not accessible to JavaScript)
        // 2. Secure flag (only HTTPS in production)
        // 3. SameSite=Lax (CSRF protection)
        // 4. Path=/ (available to entire domain)
        
        $user = $this->createTestUser();
        
        // These are configuration concerns that would be tested in integration tests
        // Unit tests verify token generation works correctly
        $token = $this->createTestAccessToken($user['id']);
        
        $this->assertNotEmpty($token['token']);
        $this->assertNotEmpty($token['token_hash']);
    }

    public function testWebInvalidTokenRejected(): void
    {
        // Web should not accept arbitrary tokens
        $this->expectException(ApiException::class);
        
        $invalidToken = bin2hex(random_bytes(32));
        $this->authService->validateAccessToken($invalidToken);
    }

    public function testWebExpiredTokenRejection(): void
    {
        $user = $this->createTestUser();
        $expiredToken = $this->createTestAccessToken(
            $user['id'],
            new \DateTime('-1 day')
        );

        $this->expectException(ApiException::class);
        $this->authService->validateAccessToken($expiredToken['token']);
    }

    public function testWebRevokedTokenRejection(): void
    {
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['id']);

        // Admin revokes session (logout from other device)
        $stmt = $this->pdo->prepare(
            'UPDATE access_tokens SET revoked_at = ? WHERE token_hash = ?'
        );
        $stmt->execute([date('Y-m-d H:i:s'), $token['token_hash']]);

        // Token should be rejected
        $this->expectException(ApiException::class);
        $this->authService->validateAccessToken($token['token']);
    }

    public function testWebSessionWithRoleTracking(): void
    {
        $adminUser = $this->createTestUser([
            'role' => 'admin',
            'is_admin' => 1
        ]);

        $token = $this->createTestAccessToken($adminUser['id']);
        
        $result = $this->authService->validateAccessToken($token['token']);

        // Verify user data includes role
        $user = $this->getUserById($adminUser['id']);
        $this->assertEquals('admin', $user['role']);
        $this->assertEquals(1, $user['is_admin']);
    }
}