<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\PermissionsDTO;
use PHPUnit\Framework\TestCase;

class PermissionsDTOTest extends TestCase
{
    public function testValuesReturnsArrayOfPermissions(): void
    {
        $permissions = PermissionsDTO::values();
        
        $this->assertIsArray($permissions);
        $this->assertNotEmpty($permissions);
        
        // Assert some known permissions exist
        $this->assertContains(PermissionsDTO::CREATE_REQUESTS, $permissions);
        $this->assertContains(PermissionsDTO::MANAGE_USERS, $permissions);
        $this->assertContains(PermissionsDTO::EXPORT_DATA, $permissions);
    }

    public function testIsValidReturnsTrueForValidPermissions(): void
    {
        $this->assertTrue(PermissionsDTO::isValid(PermissionsDTO::CREATE_REQUESTS));
        $this->assertTrue(PermissionsDTO::isValid(PermissionsDTO::MANAGE_USERS));
        $this->assertTrue(PermissionsDTO::isValid(PermissionsDTO::EXPORT_PDF));
    }

    public function testIsValidReturnsFalseForInvalidPermissions(): void
    {
        $this->assertFalse(PermissionsDTO::isValid('INVALID_PERMISSION'));
        $this->assertFalse(PermissionsDTO::isValid('create_requests')); // case sensitive
        $this->assertFalse(PermissionsDTO::isValid(''));
    }
}
