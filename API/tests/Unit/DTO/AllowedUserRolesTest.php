<?php
<<<<<<< HEAD
declare(strict_types=1);
=======

declare(strict_types=1);

>>>>>>> origin/web{fixWebApp}
namespace Tests\Unit\DTO;

use Tests\TestCase;
use DTO\AllowedUserRoles;

class AllowedUserRolesTest extends TestCase
{
    public function testAllowedRolesConstantsExist(): void
    {
        $this->assertTrue(defined('DTO\AllowedUserRoles::ADMIN'));
        $this->assertTrue(defined('DTO\AllowedUserRoles::USER'));
        $this->assertTrue(defined('DTO\AllowedUserRoles::MAINTENANCE'));
    }

    public function testAllowedRolesHaveCorrectValues(): void
    {
        $this->assertEquals('admin', AllowedUserRoles::ADMIN);
        $this->assertEquals('usr', AllowedUserRoles::USER);
        $this->assertEquals('maintenance', AllowedUserRoles::MAINTENANCE);
    }

    public function testGetAllRolesReturnsAllowedRoles(): void
    {
<<<<<<< HEAD
        $roles = AllowedUserRoles::values();
=======
        $roles = AllowedUserRoles::getAll();
>>>>>>> origin/web{fixWebApp}
        
        $this->assertIsArray($roles);
        $this->assertCount(3, $roles);
        $this->assertContains(AllowedUserRoles::ADMIN, $roles);
        $this->assertContains(AllowedUserRoles::USER, $roles);
        $this->assertContains(AllowedUserRoles::MAINTENANCE, $roles);
    }

    public function testIsValidRoleReturnsTrueForValidRoles(): void
    {
        $this->assertTrue(AllowedUserRoles::isValid(AllowedUserRoles::ADMIN));
        $this->assertTrue(AllowedUserRoles::isValid(AllowedUserRoles::USER));
        $this->assertTrue(AllowedUserRoles::isValid(AllowedUserRoles::MAINTENANCE));
    }

    public function testIsValidRoleReturnsFalseForInvalidRoles(): void
    {
        $this->assertFalse(AllowedUserRoles::isValid('invalid'));
        $this->assertFalse(AllowedUserRoles::isValid('superadmin'));
        $this->assertFalse(AllowedUserRoles::isValid('user '));
        $this->assertFalse(AllowedUserRoles::isValid(''));
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/web{fixWebApp}
