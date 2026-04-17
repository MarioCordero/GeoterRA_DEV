<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use Tests\TestCase;
use DTO\UpdateUserDTO;
use Http\ApiException;

class UpdateUserDTOTest extends TestCase
{
    public function testValidUpdateUserDTOCreation(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com'
        ];

        $dto = UpdateUserDTO::fromArray($data);
        
        $this->assertNotNull($dto);
    }

    public function testFromArrayCreatesInstance(): void
    {
        $data = [
            'name' => 'Jane',
            'lastname' => 'Smith',
            'email' => 'jane@example.com',
            'phone' => '+56912345678'
        ];

        $dto = UpdateUserDTO::fromArray($data);
        
        $this->assertInstanceOf(UpdateUserDTO::class, $dto);
    }

    public function testValidateThrowsOnMissingName(): void
    {
        $data = [
            'lastname' => 'Doe',
            'email' => 'john@example.com'
        ];

        $this->expectException(ApiException::class);
        $dto = UpdateUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnMissingLastname(): void
    {
        $data = [
            'name' => 'John',
            'email' => 'john@example.com'
        ];

        $this->expectException(ApiException::class);
        $dto = UpdateUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnMissingEmail(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe'
        ];

        $this->expectException(ApiException::class);
        $dto = UpdateUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnInvalidEmailFormat(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'not-an-email'
        ];

        $this->expectException(ApiException::class);
        $dto = UpdateUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnInvalidPhoneFormat(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'phone' => 'invalid'
        ];

        $this->expectException(ApiException::class);
        $dto = UpdateUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateAcceptsOptionalPhone(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com'
        ];

        $dto = UpdateUserDTO::fromArray($data);
        $dto->validate(); // Should not throw
        
        $this->assertTrue(true);
    }

    public function testValidateAcceptsValidPhoneNumber(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '+56912345678'
        ];

        $dto = UpdateUserDTO::fromArray($data);
        $dto->validate(); // Should not throw
        
        $this->assertTrue(true);
    }

    public function testValidateAcceptsValidData(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone' => '+56912345678'
        ];

        $dto = UpdateUserDTO::fromArray($data);
        $dto->validate(); // Should not throw
        
        $this->assertTrue(true);
    }

    public function testValidateThrowsOnEmptyName(): void
    {
        $data = [
            'name' => '',
            'lastname' => 'Doe',
            'email' => 'john@example.com'
        ];

        $this->expectException(ApiException::class);
        $dto = UpdateUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnEmptyLastname(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => '',
            'email' => 'john@example.com'
        ];

        $this->expectException(ApiException::class);
        $dto = UpdateUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnEmptyEmail(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => ''
        ];

        $this->expectException(ApiException::class);
        $dto = UpdateUserDTO::fromArray($data);
        $dto->validate();
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/web{fixWebApp}
