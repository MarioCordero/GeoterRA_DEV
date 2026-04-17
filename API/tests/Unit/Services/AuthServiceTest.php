<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use DTO\LoginUserDTO;
use Http\ApiException;
use Services\AuthService;

class AuthServiceTest extends TestCase
{
    private AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authService = new AuthService($this->pdo);
    }

    public function testLoginWithValidCredentialsReturnsTokens(): void
    {
        // Create test user
        $user = $this->createTestUser([
            'email' => 'test@example.com',
            'password' => 'ValidPass123!'
        ]);

        $dto = LoginUserDTO::fromArray([
            'email' => $user['email'],
            'password' => $user['password']
        ]);
        
        $result = $this->authService->login($dto);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('access_token', $result['data']);
        $this->assertArrayHasKey('refresh_token', $result['data']);
        $this->assertArrayHasKey('user_id', $result['data']);
        $this->assertEquals($user['user_id'], $result['data']['user_id']);
    }

    public function testLoginThrowsOnInvalidEmail(): void
    {
        $dto = LoginUserDTO::fromArray([
            'email' => 'nonexistent@example.com',
            'password' => 'ValidPass123!'
        ]);

        $this->expectException(ApiException::class);
        $this->authService->login($dto);
    }

    public function testLoginThrowsOnWrongPassword(): void
    {
        $user = $this->createTestUser([
            'email' => 'test@example.com',
            'password' => 'ValidPass123!'
        ]);

        $dto = LoginUserDTO::fromArray([
            'email' => $user['email'],
            'password' => 'WrongPass456!'
        ]);

        $this->expectException(ApiException::class);
        $this->authService->login($dto);
    }

    public function testLoginGeneratesAccessAndRefreshTokens(): void
    {
        $user = $this->createTestUser([
            'email' => 'test@example.com',
            'password' =>  'ValidPass123!'
        ]);

        $dto = LoginUserDTO::fromArray([
            'email' => $user['email'],
            'password' => $user['password']
        ]);

        $result = $this->authService->login($dto);

        $accessToken = $result['data']['access_token'] ?? null;
        $refreshToken = $result['data']['refresh_token'] ?? null;

        // Verify tokens are hex strings (64 and 128 chars)
        $this->assertNotNull($accessToken, 'Access token should not be null');
        $this->assertNotNull($refreshToken, 'Refresh token should not be null');
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $accessToken);
        $this->assertMatchesRegularExpression('/^[a-f0-9]{128}$/', $refreshToken);
    }

    public function testValidateAccessTokenReturnsUserOnValidToken(): void
    {
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['user_id']);

        $result = $this->authService->validateAccessToken($token['token']);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('user_id', $result);
        $this->assertEquals($user['user_id'], $result['user_id']);
    }

    public function testValidateAccessTokenThrowsOnExpiredToken(): void
    {
        $this->markTestSkipped('Token expiration check requires proper database timezone configuration and integration testing');
    }

    public function testValidateAccessTokenThrowsOnRevokedToken(): void
    {
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['user_id']);

        // Revoke the token
        $stmt = $this->pdo->prepare('UPDATE access_tokens SET revoked_at = ? WHERE token_hash = ?');
        $stmt->execute([date('Y-m-d H:i:s'), $token['token_hash']]);

        $this->expectException(ApiException::class);
        $this->authService->validateAccessToken($token['token']);
    }

    public function testValidateAccessTokenThrowsOnInvalidToken(): void
    {
        $this->expectException(ApiException::class);
        $this->authService->validateAccessToken('invalid_token_' . bin2hex(random_bytes(30)));
    }

    public function testRefreshTokensRotatesTokens(): void
    {
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['user_id']);
        $refreshToken = $this->createTestRefreshToken($user['user_id']);

        $result = $this->authService->refreshTokens($refreshToken['token']);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('access_token', $result['data']);
        $this->assertArrayHasKey('refresh_token', $result['data']);
        
        // Tokens should be different from old ones
        $this->assertNotEquals($token['token'], $result['data']['access_token']);
        $this->assertNotEquals($refreshToken['token'], $result['data']['refresh_token']);
    }

    public function testRefreshTokensThrowsOnInvalidRefreshToken(): void
    {
        $this->expectException(ApiException::class);
        $this->authService->refreshTokens('invalid_refresh_token_' . bin2hex(random_bytes(30)));
    }

    public function testRefreshTokensThrowsOnExpiredRefreshToken(): void
    {
        $user = $this->createTestUser();
        $expiredTime = new \DateTime('-31 days');
        $refreshToken = $this->createTestRefreshToken($user['user_id'], $expiredTime);

        $this->expectException(ApiException::class);
        $this->authService->refreshTokens($refreshToken['token']);
    }

    /**
     * @skip Requires HTTP context (getallheaders() not available in CLI tests)
     * This is an integration test, not a unit test
     */
    /**
     * @skip Requires HTTP context (getallheaders() not available in CLI tests)
     * This is an integration test, not a unit test
     */
    public function testLogoutRevokesTokens(): void
    {
        $this->markTestSkipped('Requires HTTP context with getallheaders() - integration test only');
    }

    /**
     * Requires HTTP context (getallheaders() not available in CLI tests)
     * This is an integration test, not a unit test
     */
    public function testLogoutThrowsOnInvalidToken(): void
    {
        $this->markTestSkipped('Requires HTTP context with getallheaders() - integration test only');
        $this->expectException(ApiException::class);
        $this->authService->logout('invalid_token_' . bin2hex(random_bytes(30)));
    }

    public function testMultipleLoginsCreateDifferentTokens(): void
    {
        $user = $this->createTestUser([
            'email' => 'test@example.com',
            'password' => 'ValidPass123!'
        ]);

        $dto = LoginUserDTO::fromArray([
            'email' => $user['email'],
            'password' => $user['password']
        ]);

        $result1 = $this->authService->login($dto);
        $result2 = $this->authService->login($dto);

        // Tokens should be different
        $this->assertNotEquals($result1['data']['access_token'], $result2['data']['access_token']);
        $this->assertNotEquals($result1['data']['refresh_token'], $result2['data']['refresh_token']);
    }

    public function testLoginDeletesOldTokens(): void
    {
        $user = $this->createTestUser([
            'email' => 'test@example.com',
            'password' => 'ValidPass123!'
        ]);

        // Create first tokens
        $this->createTestAccessToken($user['user_id']);

        // Count tokens before
        $stmt = $this->pdo->prepare('SELECT COUNT(*) as count FROM access_tokens WHERE user_id = ?');
        $stmt->execute([$user['user_id']]);
        $countBefore = (int)$stmt->fetch()['count'];

        $dto = LoginUserDTO::fromArray([
            'email' => $user['email'],
            'password' => $user['password']
        ]);

        $this->authService->login($dto);

        // Count tokens after - should only have 1 (one-token-per-user pattern)
        $stmt->execute([$user['user_id']]);
        $countAfter = (int)$stmt->fetch()['count'];

        $this->assertEquals(1, $countAfter);
    }
}