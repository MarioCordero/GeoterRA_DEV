<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\AllowedUserRoles;
use DTO\UpdateUserRoleDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class UpdateUserRoleDTOTest extends TestCase
{
    public function testCanCreateUpdateUserRoleDTO(): void
    {
        $dto = new UpdateUserRoleDTO(AllowedUserRoles::ADMIN);

        $this->assertSame(AllowedUserRoles::ADMIN, $dto->role);
    }

    public function testFromArrayWithValidData(): void
    {
        $data = ['role' => AllowedUserRoles::MAINTENANCE];
        
        $dto = UpdateUserRoleDTO::fromArray($data);

        $this->assertSame(AllowedUserRoles::MAINTENANCE, $dto->role);
    }

    public function testFromArrayTrimsRole(): void
    {
        $data = ['role' => '  user  '];
        
        $dto = UpdateUserRoleDTO::fromArray($data, 'user123');

        $this->assertSame('user', $dto->role);
    }

    public function testRoleAssigment(): void
    {
        $dto = new UpdateUserRoleDTO(AllowedUserRoles::USER);

        $this->assertSame('user', $dto->role);
    }

    public function testValidatePassesWithValidData(): void
    {
        $dto = new UpdateUserRoleDTO(AllowedUserRoles::USER);
        
        $this->expectNotToPerformAssertions();
        $dto->validate();
    }

    public function testValidateThrowsExceptionIfRoleIsEmpty(): void
    {
        $dto = new UpdateUserRoleDTO( '');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfRoleIsInvalid(): void
    {
        $dto = new UpdateUserRoleDTO('invalid');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }
}
