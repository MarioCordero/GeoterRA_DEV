<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\UserService;
use Services\AuthService;
use Repositories\UserRepository;
use Repositories\AuthRepository;
use DTO\RegisterUserDTO;
use DTO\UpdateUserDTO;
use Http\ApiException;

class UserServiceTest extends TestCase
{
    private UserService $userService;
    private UserRepository $userRepository;
    private AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->userRepository = new UserRepository($this->pdo);
        $authRepository = new AuthRepository($this->pdo);
        $this->authService = new AuthService($this->userRepository, $authRepository);
        $this->userService = new UserService($this->userRepository, $this->authService);
    }

    public function testRegisterUserCreatesNewUser(): void
    {
        $dto = RegisterUserDTO::fromArray([
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!',
            'phone' => '+56912345678'
        ]);

        $result = $this->userService->registerUser($dto);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('id', $result);
        $this->assertArrayHasKey('email', $result);
        $this->assertEquals('john@example.com', $result['email']);
        
        // Verify user is in database
        $user = $this->getUserByEmail('john@example.com');
        $this->assertNotNull($user);
        $this->assertEquals('John', $user['name']);
    }

    public function testRegisterUserThrowsOnDuplicateEmail(): void
    {
        $this->createTestUser(['email' => 'existing@example.com']);

        $dto = RegisterUserDTO::fromArray([
            'name' => 'Jane',
            'lastname' => 'Doe',
            'email' => 'existing@example.com',
            'password' => 'SecurePass123!'
        ]);

        $this->expectException(ApiException::class);
        $this->userService->registerUser($dto);
    }

    public function testRegisterUserHashesPassword(): void
    {
        $dto = RegisterUserDTO::fromArray([
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!'
        ]);

        $this->userService->registerUser($dto);

        $user = $this->getUserByEmail('john@example.com');
        
        // Password should be hashed, not plaintext
        $this->assertNotEquals('SecurePass123!', $user['password_hash']);
        $this->assertGreaterThan(50, strlen($user['password_hash'])); // bcrypt hash length
    }

    public function testRegisterUserAssignsUserRole(): void
    {
        $dto = RegisterUserDTO::fromArray([
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!'
        ]);

        $this->userService->registerUser($dto);

        $user = $this->getUserByEmail('john@example.com');
        $this->assertEquals('usr', $user['role']);
        $this->assertEquals(0, $user['is_admin']);
    }

    public function testGetUserByIdReturnsUserData(): void
    {
        $testUser = $this->createTestUser(['name' => 'John', 'lastname' => 'Doe']);

        $user = $this->userService->getUserById($testUser['id']);

        $this->assertNotNull($user);
        $this->assertEquals($testUser['id'], $user['id']);
        $this->assertEquals('John', $user['name']);
    }

    public function testGetUserByIdThrowsOnNonexistentUser(): void
    {
        $this->expectException(ApiException::class);
        $this->userService->getUserById('nonexistent_user_id');
    }

    public function testUpdateUserModifiesUserData(): void
    {
        $testUser = $this->createTestUser(['name' => 'John', 'email' => 'john@example.com']);

        $dto = UpdateUserDTO::fromArray([
            'name' => 'Jane',
            'lastname' => 'Smith',
            'email' => 'jane@example.com',
            'phone' => '+56912345678'
        ]);

        $updated = $this->userService->updateUser($testUser['id'], $dto);

        $this->assertEquals('Jane', $updated['name']);
        $this->assertEquals('Smith', $updated['lastname']);
        $this->assertEquals('jane@example.com', $updated['email']);

        // Verify in database
        $user = $this->getUserById($testUser['id']);
        $this->assertEquals('Jane', $user['name']);
    }

    public function testUpdateUserThrowsOnDuplicateEmail(): void
    {
        $user1 = $this->createTestUser(['email' => 'user1@example.com']);
        $user2 = $this->createTestUser(['email' => 'user2@example.com']);

        $dto = UpdateUserDTO::fromArray([
            'name' => 'New Name',
            'lastname' => 'New Last',
            'email' => 'user1@example.com' // Email of user1
        ]);

        // Try to assign user1's email to user2
        $this->expectException(ApiException::class);
        $this->userService->updateUser($user2['id'], $dto);
    }

    public function testDeleteUserSetsDeletedAtFlag(): void
    {
        $testUser = $this->createTestUser();

        $this->userService->deleteCurrentUser($testUser['id']);

        $user = $this->pdo->prepare('SELECT * FROM users WHERE id = ?');
        $user->execute([$testUser['id']]);
        $deletedUser = $user->fetch();

        $this->assertNotNull($deletedUser['deleted_at']);
    }

    public function testDeleteUserThrowsOnNonexistentUser(): void
    {
        $this->expectException(ApiException::class);
        $this->userService->deleteCurrentUser('nonexistent_user_id');
    }

    public function testGetCurrentUserReturnsAuthenticatedUser(): void
    {
        $testUser = $this->createTestUser();

        $user = $this->userService->getCurrentUser($testUser['id']);

        $this->assertNotNull($user);
        $this->assertEquals($testUser['id'], $user['id']);
    }

    public function testDeletedUserIsNotReturned(): void
    {
        $testUser = $this->createTestUser();
        
        // Delete the user
        $this->userService->deleteCurrentUser($testUser['id']);

        // Should not be able to get deleted user
        $this->expectException(ApiException::class);
        $this->userService->getUserById($testUser['id']);
    }

    public function testRegisterMultipleUsersWithDifferentEmails(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $dto = RegisterUserDTO::fromArray([
                'name' => 'User',
                'lastname' => "Num$i",
                'email' => "user$i@example.com",
                'password' => 'SecurePass123!'
            ]);

            $result = $this->userService->registerUser($dto);
            $this->assertNotNull($result['id']);
        }

        // Verify all 3 users in database + default ones
        $countBefore = $this->getUserCount();
        $this->assertGreaterThanOrEqual(3, $countBefore);
    }

    public function testUpdateUserPreservesUserRole(): void
    {
        $testUser = $this->createTestUser(['role' => 'usr']);

        $dto = UpdateUserDTO::fromArray([
            'name' => 'Updated',
            'lastname' => 'User',
            'email' => 'updated@example.com'
        ]);

        $updated = $this->userService->updateUser($testUser['id'], $dto);

        $this->assertEquals('usr', $updated['role']);
    }
}
