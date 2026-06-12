<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use Services\PermissionService;
use DTO\AllowedUserRoles;
use DTO\PermissionsDTO as Permissions;

class PermissionServiceTest extends TestCase
{
    public function testGetPermissionsForRoleReturnsCorrectPermissions(): void
    {
        $userPermissions = PermissionService::getPermissionsForRole(AllowedUserRoles::USER);
        $this->assertContains(Permissions::CREATE_REQUESTS, $userPermissions);
        $this->assertContains(Permissions::VIEW_OWN_REQUESTS, $userPermissions);
        $this->assertNotContains(Permissions::MANAGE_USERS, $userPermissions);

        $adminPermissions = PermissionService::getPermissionsForRole(AllowedUserRoles::ADMIN);
        $this->assertContains(Permissions::MANAGE_USERS, $adminPermissions);
        $this->assertContains(Permissions::MANAGE_GEOMANIFESTATIONS, $adminPermissions);
    }

    public function testGetPermissionsForInvalidRoleReturnsEmptyArray(): void
    {
        $permissions = PermissionService::getPermissionsForRole('invalid_role');
        $this->assertEmpty($permissions);
    }

    public function testHasPermissionReturnsTrueForValidPermission(): void
    {
        $this->assertTrue(PermissionService::hasPermission(AllowedUserRoles::USER, Permissions::CREATE_REQUESTS));
        $this->assertTrue(PermissionService::hasPermission(AllowedUserRoles::ADMIN, Permissions::MANAGE_USERS));
    }

    public function testHasPermissionReturnsFalseForInvalidPermissionOrRole(): void
    {
        $this->assertFalse(PermissionService::hasPermission(AllowedUserRoles::USER, Permissions::MANAGE_USERS));
        $this->assertFalse(PermissionService::hasPermission('invalid_role', Permissions::CREATE_REQUESTS));
        $this->assertFalse(PermissionService::hasPermission(AllowedUserRoles::ADMIN, 'invalid_permission'));
    }

    public function testHasAnyPermission(): void
    {
        $permissionsToCheck = [Permissions::MANAGE_USERS, Permissions::CREATE_REQUESTS];
        
        // User has CREATE_REQUESTS
        $this->assertTrue(PermissionService::hasAnyPermission(AllowedUserRoles::USER, $permissionsToCheck));
        
        // Admin has both
        $this->assertTrue(PermissionService::hasAnyPermission(AllowedUserRoles::ADMIN, $permissionsToCheck));
        
        // User does not have either of these
        $this->assertFalse(PermissionService::hasAnyPermission(AllowedUserRoles::USER, [Permissions::MANAGE_USERS, Permissions::ASSIGN_ROLES]));
    }

    public function testHasAllPermissions(): void
    {
        $permissionsToCheck = [Permissions::CREATE_REQUESTS, Permissions::VIEW_OWN_REQUESTS];
        
        // User has both
        $this->assertTrue(PermissionService::hasAllPermissions(AllowedUserRoles::USER, $permissionsToCheck));
        
        $adminPermissionsToCheck = [Permissions::CREATE_REQUESTS, Permissions::MANAGE_USERS];
        
        // Admin has both
        $this->assertTrue(PermissionService::hasAllPermissions(AllowedUserRoles::ADMIN, $adminPermissionsToCheck));
        
        // User lacks MANAGE_USERS
        $this->assertFalse(PermissionService::hasAllPermissions(AllowedUserRoles::USER, $adminPermissionsToCheck));
    }
}