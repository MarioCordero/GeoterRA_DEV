<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use Services\PasswordService;

class PasswordServiceTest extends TestCase
{
    public function testHashGeneratesValidBcryptHash(): void
    {
        $password = 'SecurePass123!';
        $hash = PasswordService::hash($password);
        
        $this->assertNotEmpty($hash);
        $this->assertNotEquals($password, $hash);
        $this->assertTrue(password_get_info($hash)['algo'] === PASSWORD_BCRYPT);
    }

    public function testVerifyReturnsTrueForCorrectPassword(): void
    {
        $password = 'SecurePass123!';
        $hash = PasswordService::hash($password);
        
        $this->assertTrue(PasswordService::verify($password, $hash));
    }

    public function testVerifyReturnsFalseForIncorrectPassword(): void
    {
        $password = 'SecurePass123!';
        $wrongPassword = 'WrongPassword123!';
        $hash = PasswordService::hash($password);
        
        $this->assertFalse(PasswordService::verify($wrongPassword, $hash));
    }
}