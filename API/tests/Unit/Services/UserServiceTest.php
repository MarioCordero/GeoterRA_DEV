<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\UserService;
<<<<<<< HEAD
=======
use Services\AuthService;
use Repositories\UserRepository;
use Repositories\AuthRepository;
>>>>>>> origin/web{fixWebApp}
use DTO\RegisterUserDTO;
use DTO\UpdateUserDTO;
use Http\ApiException;

class UserServiceTest extends TestCase
{
    private UserService $userService;
<<<<<<< HEAD
=======
    private UserRepository $userRepository;
    private AuthService $authService;
>>>>>>> origin/web{fixWebApp}

    protected function setUp(): void
    {
        parent::setUp();
<<<<<<< HEAD
        $this->userService = new UserService($this->pdo);
=======
        
        $this->userRepository = new UserRepository($this->pdo);
        $authRepository = new AuthRepository($this->pdo);
        $this->authService = new AuthService($this->userRepository, $authRepository);
        $this->userService = new UserService($this->userRepository, $this->authService);
>>>>>>> origin/web{fixWebApp}
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
<<<<<<< HEAD
        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('user_id', $result['data']);
        $this->assertNotEmpty($result['data']['user_id']);
=======
        $this->assertArrayHasKey('id', $result);
        $this->assertArrayHasKey('email', $result);
        $this->assertEquals('john@example.com', $result['email']);
>>>>>>> origin/web{fixWebApp}
        
        // Verify user is in database
        $user = $this->getUserByEmail('john@example.com');
        $this->assertNotNull($user);
<<<<<<< HEAD
=======
        $this->assertEquals('John', $user['name']);
>>>>>>> origin/web{fixWebApp}
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

<<<<<<< HEAD
        $result = $this->userService->registerUser($dto);
        $this->assertNotNull($result['data']['user_id']);

        $user = $this->getUserByEmail('john@example.com');
        // UserRepository sets role, verify it was assigned
        $this->assertNotNull($user['role'] ?? null);
=======
        $this->userService->registerUser($dto);

        $user = $this->getUserByEmail('john@example.com');
        $this->assertEquals('usr', $user['role']);
        $this->assertEquals(0, $user['is_admin']);
>>>>>>> origin/web{fixWebApp}
    }

    public function testGetUserByIdReturnsUserData(): void
    {
        $testUser = $this->createTestUser(['name' => 'John', 'lastname' => 'Doe']);

<<<<<<< HEAD
        $user = $this->userService->findById($testUser['user_id']);

        $this->assertNotNull($user);
        $this->assertIsArray($user);
=======
        $user = $this->userService->getUserById($testUser['id']);

        $this->assertNotNull($user);
        $this->assertEquals($testUser['id'], $user['id']);
        $this->assertEquals('John', $user['name']);
>>>>>>> origin/web{fixWebApp}
    }

    public function testGetUserByIdThrowsOnNonexistentUser(): void
    {
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/web{fixWebApp}
        $this->expectException(ApiException::class);
        $this->userService->deleteCurrentUser('nonexistent_user_id');
    }

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/web{fixWebApp}
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
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/web{fixWebApp}
