<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use Tests\TestCase;
use DTO\LoginUserDTO;
use Http\ApiException;

class LoginUserDTOTest extends TestCase
{
    public function testValidLoginUserDTOCreation(): void
    {
        $data = [
            'email' => 'john@example.com',
            'password' => 'SecurePass123!'
        ];

        $dto = LoginUserDTO::fromArray($data);
        
        $this->assertNotNull($dto);
    }

    public function testFromArrayCreatesInstance(): void
    {
        $data = [
            'email' => 'jane@example.com',
            'password' => 'SecurePass456!'
        ];

        $dto = LoginUserDTO::fromArray($data);
        
        $this->assertInstanceOf(LoginUserDTO::class, $dto);
    }

    public function testValidateThrowsOnMissingEmail(): void
    {
        $data = [
            'password' => 'SecurePass123!'
        ];

        $this->expectException(ApiException::class);
        $dto = LoginUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnMissingPassword(): void
    {
        $data = [
            'email' => 'john@example.com'
        ];

        $this->expectException(ApiException::class);
        $dto = LoginUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnInvalidEmailFormat(): void
    {
        $data = [
            'email' => 'not-an-email',
            'password' => 'SecurePass123!'
        ];

        $this->expectException(ApiException::class);
        $dto = LoginUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnWeakPassword(): void
    {
        $data = [
            'email' => 'john@example.com',
            'password' => 'weak'
        ];

        $this->expectException(ApiException::class);
        $dto = LoginUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnEmptyEmail(): void
    {
        $data = [
            'email' => '',
            'password' => 'SecurePass123!'
        ];

        $this->expectException(ApiException::class);
        $dto = LoginUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnEmptyPassword(): void
    {
        $data = [
            'email' => 'john@example.com',
            'password' => ''
        ];

        $this->expectException(ApiException::class);
        $dto = LoginUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateAcceptsValidData(): void
    {
        $data = [
            'email' => 'john.doe@example.com',
            'password' => 'SecurePass123!'
        ];

        $dto = LoginUserDTO::fromArray($data);
        $dto->validate(); // Should not throw
        
        $this->assertTrue(true);
    }
}