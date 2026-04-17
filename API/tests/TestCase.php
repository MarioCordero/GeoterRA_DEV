<?php
<<<<<<< HEAD
declare(strict_types=1);
=======

declare(strict_types=1);

>>>>>>> origin/web{fixWebApp}
namespace Tests;

use PHPUnit\Framework\TestCase as PHPUnitTestCase;
use Http\ApiException;
use Http\ErrorType;

/**
 * Base TestCase for all GeoterRA API tests
<<<<<<< HEAD
 * * Provides:
=======
 * 
 * Provides:
>>>>>>> origin/web{fixWebApp}
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
<<<<<<< HEAD
        // Get test database connection
        $this->pdo = $_SERVER['TEST_DATABASE'];
=======
        
        // Get test database connection
        $this->pdo = $_SERVER['TEST_DATABASE'];
        
>>>>>>> origin/web{fixWebApp}
        // Reset database state for each test
        $this->resetDatabase();
    }

    /**
     * Reset database to clean state
     */
    protected function resetDatabase(): void
    {
        // Delete data in reverse order of foreign key dependencies
<<<<<<< HEAD
        $this->pdo->exec('DELETE FROM registered_geothermal_manifestations');
        $this->pdo->exec('DELETE FROM analysis_requests');
        $this->pdo->exec('DELETE FROM refresh_tokens');
        $this->pdo->exec('DELETE FROM access_tokens');
        $this->pdo->exec('DELETE FROM users');
        $this->pdo->exec('DELETE FROM regions');
=======
        $this->pdo->exec('DELETE FROM registered_manifestations');
        $this->pdo->exec('DELETE FROM analysis_requests');
        $this->pdo->exec('DELETE FROM refresh_tokens');
        $this->pdo->exec('DELETE FROM access_tokens');
        $this->pdo->exec('DELETE FROM regions');
        $this->pdo->exec('DELETE FROM users');
>>>>>>> origin/web{fixWebApp}
        
        // Insert default regions
        $this->insertDefaultRegions();
    }

    /**
     * Insert default regions for tests
     */
    protected function insertDefaultRegions(): void
    {
        $regions = [
<<<<<<< HEAD
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
=======
            'Los Andes',
            'Zona Sur',
            'Pacifico',
            'Zona Central',
            'Araucanía',
            'Los Lagos',
            'Zona Austral'
        ];

        foreach ($regions as $region) {
            $stmt = $this->pdo->prepare('INSERT INTO regions (id, name) VALUES (?, ?)');
            $stmt->execute([\Core\Ulid::generate(), $region]);
>>>>>>> origin/web{fixWebApp}
        }
    }

    /**
     * Generate test user with optional overrides
     */
    protected function createTestUser(array $overrides = []): array
    {
<<<<<<< HEAD
        // Mapeamos los campos a los nombres reales de tu base de datos
        $userId = $overrides['user_id'] ?? $overrides['id'] ?? \Core\Ulid::generate();
        $firstName = $overrides['first_name'] ?? $overrides['name'] ?? 'Test';
        $lastName = $overrides['last_name'] ?? $overrides['lastname'] ?? 'User';
        $email = $overrides['email'] ?? 'testuser' . rand(1000, 9999) . '@example.com';
        $password = $overrides['password'] ?? 'Password123!';
        $passwordHash = $overrides['password_hash'] ?? password_hash($password, PASSWORD_BCRYPT);
        $phone = $overrides['phone_number'] ?? $overrides['phone'] ?? null;
        $role = $overrides['role'] ?? 'user';

        // Consulta actualizada con las columnas correctas
        $stmt = $this->pdo->prepare(
            'INSERT INTO users (user_id, first_name, last_name, email, password_hash, phone_number, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        
        $stmt->execute([$userId, $firstName, $lastName, $email, $passwordHash, $phone, $role]);

        return [
            'user_id' => $userId,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password' => $password,
            'password_hash' => $passwordHash,
            'phone_number' => $phone,
            'role' => $role
=======
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
>>>>>>> origin/web{fixWebApp}
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
<<<<<<< HEAD

        $stmt = $this->pdo->prepare(
            'INSERT INTO access_tokens (user_id, token_hash, expires_at) 
             VALUES (?, ?, ?)'
        );
        
        $stmt->execute([$userId, $tokenHash, $expiresAt->format('Y-m-d H:i:s')]);

        return [
=======
        $tokenId = \Core\Ulid::generate();

        $stmt = $this->pdo->prepare(
            'INSERT INTO access_tokens (id, user_id, token_hash, expires_at) 
             VALUES (?, ?, ?, ?)'
        );
        
        $stmt->execute([$tokenId, $userId, $tokenHash, $expiresAt->format('Y-m-d H:i:s')]);

        return [
            'id' => $tokenId,
>>>>>>> origin/web{fixWebApp}
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
<<<<<<< HEAD

        $stmt = $this->pdo->prepare(
            'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
             VALUES (?, ?, ?)'
        );
        
        $stmt->execute([$userId, $tokenHash, $expiresAt->format('Y-m-d H:i:s')]);

        return [
=======
        $tokenId = \Core\Ulid::generate();

        $stmt = $this->pdo->prepare(
            'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) 
             VALUES (?, ?, ?, ?)'
        );
        
        $stmt->execute([$tokenId, $userId, $tokenHash, $expiresAt->format('Y-m-d H:i:s')]);

        return [
            'id' => $tokenId,
>>>>>>> origin/web{fixWebApp}
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
<<<<<<< HEAD
        
        /** @var ApiException $exception */
        $this->assertEquals($expectedStatus, $exception->getHttpStatus());
    }

    // ------------------- Helper methods for database queries ------------------ //

=======
        $this->assertEquals($expectedStatus, $exception->getHttpStatus());
    }

>>>>>>> origin/web{fixWebApp}
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
<<<<<<< HEAD
        // Cambiado de 'id' a 'user_id'
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE user_id = ? AND deleted_at IS NULL');
=======
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL');
>>>>>>> origin/web{fixWebApp}
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