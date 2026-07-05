<?php
declare(strict_types=1);
namespace Tests\Unit\DTO;

use Tests\TestCase;
use DTO\AllowedUserRoles;

class AllowedUserRolesTest extends TestCase
{
    public function testAllowedRolesConstantsExist(): void
    {
        $this->assertTrue(defined('DTO\AllowedUserRoles::USER'));
        $this->assertTrue(defined('DTO\AllowedUserRoles::ADMIN'));
        $this->assertTrue(defined('DTO\AllowedUserRoles::MAINTENANCE'));
        $this->assertTrue(defined('DTO\AllowedUserRoles::INVESTIGATOR'));
        $this->assertTrue(defined('DTO\AllowedUserRoles::FIELD_INVESTIGATOR'));
    }

    public function testAllowedRolesHaveCorrectValues(): void
    {
        $this->assertEquals('admin', AllowedUserRoles::ADMIN);
        $this->assertEquals('user', AllowedUserRoles::USER);
        $this->assertEquals('maintenance', AllowedUserRoles::MAINTENANCE);
        $this->assertEquals('investigator', AllowedUserRoles::INVESTIGATOR);
        $this->assertEquals('fieldInvestigator', AllowedUserRoles::FIELD_INVESTIGATOR);
    }

    public function testGetAllRolesReturnsAllowedRoles(): void
    {
        $roles = AllowedUserRoles::values();
        
        $this->assertIsArray($roles);
        $this->assertCount(5, $roles);
        $this->assertContains(AllowedUserRoles::USER, $roles);
        $this->assertContains(AllowedUserRoles::ADMIN, $roles);
        $this->assertContains(AllowedUserRoles::MAINTENANCE, $roles);
        $this->assertContains(AllowedUserRoles::INVESTIGATOR, $roles);
        $this->assertContains(AllowedUserRoles::FIELD_INVESTIGATOR, $roles);
    }

    public function testIsValidRoleReturnsTrueForValidRoles(): void
    {
        $this->assertTrue(AllowedUserRoles::isValid(AllowedUserRoles::USER));
        $this->assertTrue(AllowedUserRoles::isValid(AllowedUserRoles::ADMIN));
        $this->assertTrue(AllowedUserRoles::isValid(AllowedUserRoles::MAINTENANCE));
        $this->assertTrue(AllowedUserRoles::isValid(AllowedUserRoles::INVESTIGATOR));
        $this->assertTrue(AllowedUserRoles::isValid(AllowedUserRoles::FIELD_INVESTIGATOR));
    }

    public function testIsValidRoleReturnsFalseForInvalidRoles(): void
    {
        $this->assertFalse(AllowedUserRoles::isValid('invalid'));
        $this->assertFalse(AllowedUserRoles::isValid('superadmin'));
        $this->assertFalse(AllowedUserRoles::isValid('usr '));
        $this->assertFalse(AllowedUserRoles::isValid(''));
    }
}