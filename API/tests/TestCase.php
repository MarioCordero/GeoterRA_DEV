<?php
declare(strict_types=1);
namespace Tests;

use PHPUnit\Framework\TestCase as PHPUnitTestCase;
use Http\ApiException;
use Http\ErrorType;

/**
 * Base TestCase for all GeoterRA API tests
 * 
 * Provides:
 * - Database access (in-memory SQLite)
 * - Helper methods for creating test data
 * - Common assertions for API testing
 * - Database reset between tests
 */
abstract class TestCase extends PHPUnitTestCase
{
    protected \PDO $pdo;

    protected function setUp(): void
    {
        parent::setUp();
        // Get test database connection
        $this->pdo = $_SERVER['TEST_DATABASE'];
        // Reset database state for each test
        $this->resetDatabase();
    }

    /**
     * Reset database to clean state
     */
    protected function resetDatabase(): void
    {
        // Delete data in reverse order of foreign key dependencies
        $this->pdo->exec('DELETE FROM registered_geothermal_manifestations'); // <-- EL CAMBIO ESTÁ AQUÍ
        $this->pdo->exec('DELETE FROM analysis_requests');
        $this->pdo->exec('DELETE FROM refresh_tokens');
        $this->pdo->exec('DELETE FROM access_tokens');
        $this->pdo->exec('DELETE FROM users');
        $this->pdo->exec('DELETE FROM regions');
        
        // Insert default regions
        $this->insertDefaultRegions();
    }

    /**
     * Insert default regions for tests
     */
    protected function insertDefaultRegions(): void
    {
        $regions = [
            'Guanacaste',
            'San José',
            'Heredia',
            'Cartago',
            'Alajuela',
            'Puntarenas'
        ];

        foreach ($regions as $region) {
            // Use INSERT IGNORE to skip if region already exists
            $stmt = $this->pdo->prepare('INSERT IGNORE INTO regions (name) VALUES (?)');
            $stmt->execute([$region]);
        }
    }

    /**
     * Generate test user with optional overrides
     */
    protected function createTestUser(array $overrides = []): array
    {
        $userId = $overrides['id'] ?? \Core\Ulid::generate();
        $name = $overrides['name'] ?? 'Test';
        $lastname = $overrides['lastname'] ?? 'User';
        $email = $overrides['email'] ?? 'testuser' . rand(1000, 9999) . '@example.com';
        $password = $overrides['password'] ?? 'Password123!';
        $passwordHash = $overrides['password_hash'] ?? password_hash($password, PASSWORD_BCRYPT);
        $phone = $overrides['phone'] ?? null;
        $role = $overrides['role'] ?? 'usr';
        $is_admin = $overrides['is_admin'] ?? ($role === 'admin' ? 1 : 0);

        $stmt = $this->pdo->prepare(
            'INSERT INTO users (id, name, lastname, email, password_hash, phone, role, is_admin) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        
        $stmt->execute([$userId, $name, $lastname, $email, $passwordHash, $phone, $role, $is_admin]);

        return [
            'id' => $userId,
            'name' => $name,
            'lastname' => $lastname,
            'email' => $email,
            'password' => $password,
            'password_hash' => $passwordHash,
            'phone' => $phone,
            'role' => $role,
            'is_admin' => $is_admin
        ];
    }

    /**
     * Generate test access token
     */
    protected function createTestAccessToken(string $userId, \DateTime $expiresAt = null): array
    {
        if ($expiresAt === null) {
            $expiresAt = new \DateTime('+1 hour');
        }

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $tokenId = \Core\Ulid::generate();

        $stmt = $this->pdo->prepare(
            'INSERT INTO access_tokens (id, user_id, token_hash, expires_at) 
             VALUES (?, ?, ?, ?)'
        );
        
        $stmt->execute([$tokenId, $userId, $tokenHash, $expiresAt->format('Y-m-d H:i:s')]);

        return [
            'id' => $tokenId,
            'user_id' => $userId,
            'token' => $token,
            'token_hash' => $tokenHash,
            'expires_at' => $expiresAt
        ];
    }

    /**
     * Generate test refresh token
     */
    protected function createTestRefreshToken(string $userId, \DateTime $expiresAt = null): array
    {
        if ($expiresAt === null) {
            $expiresAt = new \DateTime('+30 days');
        }

        $token = bin2hex(random_bytes(64));
        $tokenHash = hash('sha256', $token);
        $tokenId = \Core\Ulid::generate();

        $stmt = $this->pdo->prepare(
            'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) 
             VALUES (?, ?, ?, ?)'
        );
        
        $stmt->execute([$tokenId, $userId, $tokenHash, $expiresAt->format('Y-m-d H:i:s')]);

        return [
            'id' => $tokenId,
            'user_id' => $userId,
            'token' => $token,
            'token_hash' => $tokenHash,
            'expires_at' => $expiresAt
        ];
    }

    /**
     * Assert that an exception is ApiException with specific error
     */
    protected function assertApiException(
        \Throwable $exception,
        string $expectedErrorType,
        int $expectedStatus
    ): void {
        $this->assertInstanceOf(ApiException::class, $exception);
        
        /** @var ApiException $exception */
        $this->assertEquals($expectedStatus, $exception->getHttpStatus());
    }

    // ------------------- Helper methods for database queries ------------------ //

    /**
     * Get user from database by email
     */
    protected function getUserByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Get user from database by ID
     */
    protected function getUserById(string $userId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL');
        $stmt->execute([$userId]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Get access token from database
     */
    protected function getAccessToken(string $tokenHash): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM access_tokens WHERE token_hash = ? AND revoked_at IS NULL'
        );
        $stmt->execute([$tokenHash]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Count total users in database
     */
    protected function getUserCount(): int
    {
        $stmt = $this->pdo->prepare('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL');
        $stmt->execute();
        return (int)$stmt->fetch()['count'];
    }

    /**
     * Helper to test DTOs
     */
    protected function assertDTOValidationThrows(
        string $dtoClass,
        array $data,
        string $expectedErrorCode = null
    ): void {
        try {
            $dto = $dtoClass::fromArray($data);
            $dto->validate();
            $this->fail("Expected ApiException was not thrown");
        } catch (ApiException $e) {
            if ($expectedErrorCode) {
                // Verify error code matches expected
                $this->assertStringContainsString(
                    $expectedErrorCode,
                    json_encode($e->getError())
                );
            }
        }
    }
}