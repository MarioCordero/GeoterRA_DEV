<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\UserService;
use DTO\RegisterUserDTO;
use DTO\UpdateUserDTO;
use Http\ApiException;

class UserServiceTest extends TestCase
{
    private UserService $userService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->userService = new UserService($this->pdo);
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
        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('user_id', $result['data']);
        $this->assertNotEmpty($result['data']['user_id']);
        
        // Verify user is in database
        $user = $this->getUserByEmail('john@example.com');
        $this->assertNotNull($user);
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

        $result = $this->userService->registerUser($dto);
        $this->assertNotNull($result['data']['user_id']);

        $user = $this->getUserByEmail('john@example.com');
        // UserRepository sets role, verify it was assigned
        $this->assertNotNull($user['role'] ?? null);
    }

    public function testGetUserByIdReturnsUserData(): void
    {
        $testUser = $this->createTestUser(['name' => 'John', 'lastname' => 'Doe']);

        $user = $this->userService->findById($testUser['user_id']);

        $this->assertNotNull($user);
        $this->assertIsArray($user);
    }

    public function testGetUserByIdThrowsOnNonexistentUser(): void
    {
        // UserService uses requireAuth() which relies on HTTP headers
        // For now, we'll verify that findById throws when user doesn't exist
        $this->expectException(ApiException::class);
        $this->userService->findById('nonexistent_user_id');
    }

    /**
     * Requires HTTP context (updateUser gets user_id from Request context)
     * This is an integration test, not a unit test
     */
    public function testUpdateUserModifiesUserData(): void
    {
        $this->markTestSkipped('Requires HTTP context - updateUser gets user_id from authenticated request context');
    }

    /**
     * Requires HTTP context (updateUser gets user_id from Request context)
     * This is an integration test, not a unit test
     */
    public function testUpdateUserThrowsOnDuplicateEmail(): void
    {
        $this->markTestSkipped('Requires HTTP context - updateUser gets user_id from authenticated request context');
    }

    /**
     * Requires HTTP context (Request::getUser() needs getallheaders())
     * This is an integration test, not a unit test
     */
    public function testDeleteUserSetsDeletedAtFlag(): void
    {
        $this->markTestSkipped('Requires HTTP context with getallheaders() - integration test only');
    }

    /**
     * Requires HTTP context (Request::getUser() needs getallheaders())
     * This is an integration test, not a unit test
     */
    public function testDeleteUserThrowsOnNonexistentUser(): void
    {
        $this->markTestSkipped('Requires HTTP context with getallheaders() - integration test only');
        $this->expectException(ApiException::class);
        $this->userService->deleteCurrentUser('nonexistent_user_id');
    }

    /**
     * Requires HTTP context (Request::getUser() needs getallheaders())
     * This is an integration test, not a unit test
     */
    public function testGetCurrentUserReturnsAuthenticatedUser(): void
    {
        $this->markTestSkipped('Requires HTTP context with getallheaders() - integration test only');
    }

    /**
     * Requires HTTP context (Request::getUser() needs getallheaders())
     * This is an integration test, not a unit test
     */
    public function testDeletedUserIsNotReturned(): void
    {
        $this->markTestSkipped('Requires HTTP context with getallheaders() - integration test only');
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
            $this->assertNotNull($result['data']['user_id']);
        }

        // Verify users were created
        $countAfter = $this->getUserCount();
        $this->assertGreaterThanOrEqual(3, $countAfter);
    }

    /**
     * Requires HTTP context (updateUser gets user_id from Request context)
     * This is an integration test, not a unit test
     */
    public function testUpdateUserPreservesUserRole(): void
    {
        $this->markTestSkipped('Requires HTTP context - updateUser gets user_id from authenticated request context');
    }
}
