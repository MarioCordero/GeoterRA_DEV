<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\AuthService;

/**
 * AuthService Web Stack Tests
 * 
 * Tests HTTP-only cookie-based session authentication
 */
class AuthServiceWebTest extends TestCase
{
    private AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authService = new AuthService($this->pdo);
    }

    /**
     * Test that AuthService can be instantiated
     */
    public function testAuthServiceCanBeInstantiated(): void
    {
        $this->assertInstanceOf(AuthService::class, $this->authService);
    }

    /**
     * Test that user can be registered
     */
    public function testUserRegistration(): void
    {
        $this->createTestUser([
            'email' => 'newuser@example.com',
            'name' => 'New',
            'lastname' => 'User'
        ]);
        
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute(['newuser@example.com']);
        $user = $stmt->fetch();
        
        $this->assertNotEmpty($user);
        $this->assertEquals('newuser@example.com', $user['email']);
    }

    /**
     * Test that password hash is stored securely
     */
    public function testPasswordHashIsStored(): void
    {
        $user = $this->createTestUser(['email' => 'secure@example.com']);
        
<<<<<<< HEAD
        $stmt = $this->pdo->prepare('SELECT password_hash FROM users WHERE user_id = ?');
        $stmt->execute([$user['user_id']]);
=======
        $stmt = $this->pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
        $stmt->execute([$user['id']]);
>>>>>>> origin/web{fixWebApp}
        $result = $stmt->fetch();
        
        $this->assertNotEmpty($result['password_hash']);
        $this->assertNotEquals('password123', $result['password_hash']); // Should be hashed
    }

    /**
     * Test that access tokens can be created
     */
    public function testAccessTokenCreation(): void
    {
        $user = $this->createTestUser();
<<<<<<< HEAD
        $token = $this->createTestAccessToken($user['user_id']);
=======
        $token = $this->createTestAccessToken($user['id']);
>>>>>>> origin/web{fixWebApp}
        
        $this->assertNotEmpty($token['token']);
        $this->assertNotEmpty($token['token_hash']);
    }

    /**
     * Test that refresh tokens can be created
     */
    public function testRefreshTokenCreation(): void
    {  
        $user = $this->createTestUser();
<<<<<<< HEAD
        $token = $this->createTestRefreshToken($user['user_id']);
=======
        $token = $this->createTestRefreshToken($user['id']);
>>>>>>> origin/web{fixWebApp}
        
        $this->assertNotEmpty($token['token']);
        $this->assertNotEmpty($token['token_hash']);
    }

    /**
     * Test that access token can be retrieved from database
     */
    public function testAccessTokenPersists(): void
    {
        $user = $this->createTestUser();
<<<<<<< HEAD
        $created = $this->createTestAccessToken($user['user_id']);
        
        $stmt = $this->pdo->prepare('SELECT * FROM access_tokens WHERE user_id = ?');
        $stmt->execute([$user['user_id']]);
        $retrieved = $stmt->fetch();
        
        $this->assertNotEmpty($retrieved);
        $this->assertEquals($user['user_id'], $retrieved['user_id']);
    }
}
=======
        $created = $this->createTestAccessToken($user['id']);
        
        $stmt = $this->pdo->prepare('SELECT * FROM access_tokens WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $retrieved = $stmt->fetch();
        
        $this->assertNotEmpty($retrieved);
        $this->assertEquals($user['id'], $retrieved['user_id']);
    }
}
>>>>>>> origin/web{fixWebApp}
