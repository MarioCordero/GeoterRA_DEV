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
        $dto = new UpdateUserRoleDTO('user123', AllowedUserRoles::ADMIN);

        $this->assertSame('user123', $dto->userId);
        $this->assertSame(AllowedUserRoles::ADMIN, $dto->role);
    }

    public function testFromArrayWithValidData(): void
    {
        $data = ['role' => AllowedUserRoles::MAINTENANCE];
        
        $dto = UpdateUserRoleDTO::fromArray($data, 'user123');

        $this->assertSame('user123', $dto->userId);
        $this->assertSame(AllowedUserRoles::MAINTENANCE, $dto->role);
    }

    public function testFromArrayTrimsRole(): void
    {
        $data = ['role' => '  user  '];
        
        $dto = UpdateUserRoleDTO::fromArray($data, 'user123');

        $this->assertSame('user', $dto->role);
    }

    public function testSetUserId(): void
    {
        $dto = new UpdateUserRoleDTO('', AllowedUserRoles::USER);
        $dto->setUserId('new_user_123');

        $this->assertSame('new_user_123', $dto->userId);
    }

    public function testValidatePassesWithValidData(): void
    {
        $dto = new UpdateUserRoleDTO('user123', AllowedUserRoles::USER);
        
        $this->expectNotToPerformAssertions();
        $dto->validate();
    }

    public function testValidateThrowsExceptionIfUserIdIsEmpty(): void
    {
        $dto = new UpdateUserRoleDTO('', AllowedUserRoles::USER);

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfRoleIsEmpty(): void
    {
        $dto = new UpdateUserRoleDTO('user123', '');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfRoleIsInvalid(): void
    {
        $dto = new UpdateUserRoleDTO('user123', 'invalid_role');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }
}
