<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\PasswordService;

class PasswordServiceTest extends TestCase
{
    public function testHashReturnsHashedPassword(): void
    {
        $password = 'SecurePassword123!';
        $hash = PasswordService::hash($password);
        
        $this->assertIsString($hash);
        $this->assertNotEmpty($hash);
        $this->assertNotEquals($password, $hash);
        $this->assertTrue(strlen($hash) >= 60); // bcrypt hash length
    }

    public function testHashGeneratesDifferentHashesForSamePassword(): void
    {
        // bcrypt generates different hashes each time
        $password = 'SecurePassword123!';
        $hash1 = PasswordService::hash($password);
        $hash2 = PasswordService::hash($password);
        
        $this->assertNotEquals($hash1, $hash2);
    }

    public function testVerifyReturnsTrueForCorrectPassword(): void
    {
        $password = 'SecurePassword123!';
        $hash = PasswordService::hash($password);
        
        $result = PasswordService::verify($password, $hash);
        
        $this->assertTrue($result);
    }

    public function testVerifyReturnsFalseForIncorrectPassword(): void
    {
        $password = 'SecurePassword123!';
        $hash = PasswordService::hash($password);
        
        $result = PasswordService::verify('WrongPassword456!', $hash);
        
        $this->assertFalse($result);
    }

    public function testVerifyReturnsFalseForEmptyPassword(): void
    {
        $password = 'SecurePassword123!';
        $hash = PasswordService::hash($password);
        
        $result = PasswordService::verify('', $hash);
        
        $this->assertFalse($result);
    }

    public function testVerifyReturnsFalseForEmptyHash(): void
    {
        $password = 'SecurePassword123!';
        
        try {
            $result = PasswordService::verify($password, '');
            // bcrypt will either throw or return false for invalid hash
            $this->assertFalse($result);
        } catch (\Exception $e) {
            // Invalid hash format may throw
            $this->assertInstanceOf(\Exception::class, $e);
        }
    }

    public function testVerifyHandlesLongPasswords(): void
    {
        $password = str_repeat('a', 100) . '!';
        $hash = PasswordService::hash($password);
        
        $result = PasswordService::verify($password, $hash);
        
        $this->assertTrue($result);
    }

    public function testVerifyHandlesSpecialCharacters(): void
    {
        $password = 'P@ssw0rd!#$%^&*()';
        $hash = PasswordService::hash($password);
        
        $result = PasswordService::verify($password, $hash);
        
        $this->assertTrue($result);
    }

    public function testVerifyHandlesUnicodeCharacters(): void
    {
        $password = 'Sécüré™Pàss√√oŕd!';
        $hash = PasswordService::hash($password);
        
        $result = PasswordService::verify($password, $hash);
        
        $this->assertTrue($result);
    }

    public function testHashAndVerifyWorkTogether(): void
    {
        $passwords = [
            'Password123!',
            'Secure@Pass456#',
            'Complex$Pass789%',
            'Speci@l!Ch@r$',
        ];

        foreach ($passwords as $password) {
            $hash = PasswordService::hash($password);
            $this->assertTrue(PasswordService::verify($password, $hash));
            $this->assertFalse(PasswordService::verify('wrong', $hash));
        }
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/web{fixWebApp}
