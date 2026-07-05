<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\UserService;
use Services\PasswordService;
use DTO\RegisterUserDTO;
use DTO\UpdateUserDTO;
use DTO\UpdateUserRoleDTO;
use Http\ApiException;
use Http\Request;

class UserServiceTest extends TestCase
{
    private UserService $userService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->userService = new UserService($this->pdo);
        
        // Setup mocked environment for auth via Request
        $_SERVER['HTTP_X_API_KEY'] = 'web-secret-key-789';
        Request::init();
    }

    protected function tearDown(): void
    {
        // Clean up mock state
        unset($_SERVER['HTTP_X_API_KEY']);
        unset($_COOKIE['geoterra_session_token']);
        parent::tearDown();
    }

    private function authenticateUser(string $userId): void
    {
        $accessData = $this->createTestAccessToken($userId);
        $_COOKIE['geoterra_session_token'] = $accessData['token'];
    }

    public function testRegisterUserSuccess(): void
    {
        $dto = RegisterUserDTO::fromArray([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.new@example.com',
            'password' => 'SecurePass123!'
        ]);

        $result = $this->userService->registerUser($dto);
        
        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('user_id', $result['data']);
        
        $user = $this->getUserById($result['data']['user_id']);
        $this->assertNotNull($user);
        $this->assertEquals('john.new@example.com', $user['email']);
    }

    public function testRegisterUserFailsIfEmailExists(): void
    {
        $user = $this->createTestUser();
        
        $dto = RegisterUserDTO::fromArray([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => $user['email'],
            'password' => 'SecurePass123!'
        ]);

        $this->expectException(ApiException::class);
        $this->userService->registerUser($dto);
    }

    public function testUpdateUserSuccess(): void
    {
        $user = $this->createTestUser(['password' => 'SecurePass123!']);
        $this->authenticateUser($user['user_id']);

        $dto = UpdateUserDTO::fromArray([
            'first_name' => 'Johnny',
            'last_name' => 'Doe',
            'email' => $user['email'],
            'current_password' => 'SecurePass123!',
            'password' => 'NewSecurePass123!'
        ], $user['user_id']);

        $this->userService->updateUser($dto);
        
        $updatedUser = $this->getUserById($user['user_id']);
        $this->assertEquals('Johnny', $updatedUser['first_name']);
        $this->assertTrue(PasswordService::verify('NewSecurePass123!', $updatedUser['password_hash']));
    }

    public function testDeleteCurrentUserSuccess(): void
    {
        $user = $this->createTestUser();
        $this->authenticateUser($user['user_id']);

        $this->userService->deleteCurrentUser();
        
        $deletedUser = $this->getUserById($user['user_id']);
        // getUserById has 'deleted_at IS NULL' condition, so it should be null
        $this->assertNull($deletedUser); 
    }

    public function testGetCurrentUserSuccess(): void
    {
        $user = $this->createTestUser();
        $this->authenticateUser($user['user_id']);

        $result = $this->userService->getCurrentUser();
        
        $this->assertArrayHasKey('data', $result);
        $this->assertEquals($user['email'], $result['data']['email']);
    }

    public function testUpdateUserRoleSuccess(): void
    {
        $user = $this->createTestUser(['role' => 'user']);
        
        $dto = UpdateUserRoleDTO::fromArray([
            'role' => 'admin'
        ], $user['user_id']);

        $this->userService->updateUserRole($dto);
        
        $updatedUser = $this->getUserById($user['user_id']);
        $this->assertEquals('admin', $updatedUser['role']);
    }
}