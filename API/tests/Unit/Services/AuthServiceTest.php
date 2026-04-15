<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\AuthService;
use Services\UserService;
use Repositories\UserRepository;
use Repositories\AuthRepository;
use DTO\LoginUserDTO;
use Http\ApiException;

class AuthServiceTest extends TestCase
{
    private AuthService $authService;
    private UserRepository $userRepository;
    private AuthRepository $authRepository;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->userRepository = new UserRepository($this->pdo);
        $this->authRepository = new AuthRepository($this->pdo);
        $this->authService = new AuthService(
            $this->userRepository,
            $this->authRepository
        );
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
        $this->assertArrayHasKey('access_token', $result);
        $this->assertArrayHasKey('refresh_token', $result);
        $this->assertArrayHasKey('user_id', $result);
        $this->assertEquals($user['id'], $result['user_id']);
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

        $accessToken = $result['access_token'];
        $refreshToken = $result['refresh_token'];

        // Verify tokens are hex strings (64 and 128 chars)
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $accessToken);
        $this->assertMatchesRegularExpression('/^[a-f0-9]{128}$/', $refreshToken);
    }

    public function testValidateAccessTokenReturnsUserOnValidToken(): void
    {
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['id']);

        $result = $this->authService->validateAccessToken($token['token']);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('user_id', $result);
        $this->assertEquals($user['id'], $result['user_id']);
    }

    public function testValidateAccessTokenThrowsOnExpiredToken(): void
    {
        $user = $this->createTestUser();
        $expiredTime = new \DateTime('-1 hour');
        $token = $this->createTestAccessToken($user['id'], $expiredTime);

        $this->expectException(ApiException::class);
        $this->authService->validateAccessToken($token['token']);
    }

    public function testValidateAccessTokenThrowsOnRevokedToken(): void
    {
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['id']);

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
        $token = $this->createTestAccessToken($user['id']);
        $refreshToken = $this->createTestRefreshToken($user['id']);

        $result = $this->authService->refreshTokens($refreshToken['token']);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('access_token', $result);
        $this->assertArrayHasKey('refresh_token', $result);
        
        // Tokens should be different from old ones
        $this->assertNotEquals($token['token'], $result['access_token']);
        $this->assertNotEquals($refreshToken['token'], $result['refresh_token']);
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
        $refreshToken = $this->createTestRefreshToken($user['id'], $expiredTime);

        $this->expectException(ApiException::class);
        $this->authService->refreshTokens($refreshToken['token']);
    }

    public function testLogoutRevokesTokens(): void
    {
        $user = $this->createTestUser();
        $token = $this->createTestAccessToken($user['id']);

        $this->authService->logout($token['token']);

        // Verify token is revoked
        $revokedToken = $this->getAccessToken($token['token_hash']);
        $this->assertNotNull($revokedToken['revoked_at']);
    }

    public function testLogoutThrowsOnInvalidToken(): void
    {
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
        $this->assertNotEquals($result1['access_token'], $result2['access_token']);
        $this->assertNotEquals($result1['refresh_token'], $result2['refresh_token']);
    }

    public function testLoginDeletesOldTokens(): void
    {
        $user = $this->createTestUser([
            'email' => 'test@example.com',
            'password' => 'ValidPass123!'
        ]);

        // Create first tokens
        $this->createTestAccessToken($user['id']);

        // Count tokens before
        $stmt = $this->pdo->prepare('SELECT COUNT(*) as count FROM access_tokens WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $countBefore = (int)$stmt->fetch()['count'];

        $dto = LoginUserDTO::fromArray([
            'email' => $user['email'],
            'password' => $user['password']
        ]);

        $this->authService->login($dto);

        // Count tokens after - should only have 1 (one-token-per-user pattern)
        $stmt->execute([$user['id']]);
        $countAfter = (int)$stmt->fetch()['count'];

        $this->assertEquals(1, $countAfter);
    }
}
