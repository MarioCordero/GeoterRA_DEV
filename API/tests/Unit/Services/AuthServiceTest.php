<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\AuthService;
use DTO\LoginUserDTO;
use Http\ApiException;

class AuthServiceTest extends TestCase
{
    private AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authService = new AuthService($this->pdo);
    }

    public function testLoginSuccess(): void
    {
        $password = 'SecurePass123!';
        $user = $this->createTestUser(['password' => $password]);

        $dto = LoginUserDTO::fromArray([
            'email' => $user['email'],
            'password' => $password
        ]);

        $result = $this->authService->login($dto);

        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('access_token', $result['data']);
        $this->assertArrayHasKey('refresh_token', $result['data']);
        $this->assertEquals($user['user_id'], $result['data']['user_id']);
    }

    public function testLoginFailsWithInvalidPassword(): void
    {
        $user = $this->createTestUser(['password' => 'SecurePass123!']);

        $dto = LoginUserDTO::fromArray([
            'email' => $user['email'],
            'password' => 'WrongPassword!1'
        ]);

        $this->expectException(ApiException::class);
        $this->authService->login($dto);
    }

    public function testLoginFailsWithNonexistentUser(): void
    {
        $dto = LoginUserDTO::fromArray([
            'email' => 'doesnotexist@example.com',
            'password' => 'SecurePass123!'
        ]);

        $this->expectException(ApiException::class);
        $this->authService->login($dto);
    }

    public function testRefreshTokensSuccess(): void
    {
        $user = $this->createTestUser();
        $refreshData = $this->createTestRefreshToken($user['user_id']);
        
        $result = $this->authService->refreshTokens($refreshData['token']);
        
        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('access_token', $result['data']);
        $this->assertArrayHasKey('refresh_token', $result['data']);
        $this->assertNotEquals($refreshData['token'], $result['data']['refresh_token']);
    }

    public function testRefreshTokensFailsOnInvalidToken(): void
    {
        $this->expectException(ApiException::class);
        $this->authService->refreshTokens('invalid_token');
    }

    public function testValidateAccessTokenSuccess(): void
    {
        $user = $this->createTestUser();
        $accessData = $this->createTestAccessToken($user['user_id']);
        
        $tokenRecord = $this->authService->validateAccessToken($accessData['token']);
        
        $this->assertEquals($user['user_id'], $tokenRecord['user_id']);
    }

    public function testValidateAccessTokenFailsOnInvalidToken(): void
    {
        $this->expectException(ApiException::class);
        $this->authService->validateAccessToken('invalid_token');
    }
}