<?php

declare(strict_types=1);

namespace Tests\Unit\Platform\Web;

use Tests\TestCase;

/**
 * Basic Web Platform Test
 * 
 * Verification that the test infrastructure is working correctly
 */
class BasicWebTest extends TestCase
{
    /**
     * Test that test database is initialized
     */
    public function testDatabaseIsInitialized(): void
    {
        $this->assertNotNull($this->pdo);
    }

    /**
     * Test that regions can be inserted and retrieved
     */
    public function testDefaultRegionsAreInserted(): void
    {
        $stmt = $this->pdo->query('SELECT COUNT(*) as count FROM regions');
        $result = $stmt->fetch();
        
        $this->assertGreaterThan(0, $result['count']);
    }

    /**
     * Test that specific region exists
     */
    public function testLosAndesRegionExists(): void
    {
        $stmt = $this->pdo->prepare('SELECT * FROM regions WHERE name = ?');
        $stmt->execute(['Los Andes']);
        $region = $stmt->fetch();
        
        $this->assertNotEmpty($region);
        $this->assertEquals('Los Andes', $region['name']);
    }

    /**
     * Test that users table is empty initially
     */
    public function testUsersTableIsEmpty(): void
    {
        $stmt = $this->pdo->query('SELECT COUNT(*) as count FROM users');
        $result = $stmt->fetch();
        
        $this->assertEquals(0, $result['count']);
    }

    /**
     * Test that test user can be created
     */
    public function testCanCreateTestUser(): void
    {
        $user = $this->createTestUser([
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com'
        ]);
        
        $this->assertNotEmpty($user['id']);
        $this->assertEquals('john@example.com', $user['email']);
        $this->assertEquals('John', $user['name']);
    }

    /**
     * Test that users persist in database
     */
    public function testUsersPersistInDatabase(): void
    {
        $this->createTestUser(['email' => 'persist@example.com']);
        
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute(['persist@example.com']);
        $user = $stmt->fetch();
        
        $this->assertNotEmpty($user);
        $this->assertEquals('persist@example.com', $user['email']);
    }
}
