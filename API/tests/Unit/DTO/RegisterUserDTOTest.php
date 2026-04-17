<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use Tests\TestCase;
use DTO\RegisterUserDTO;
use Http\ApiException;

class RegisterUserDTOTest extends TestCase
{
    public function testValidRegisterUserDTOCreation(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!'
        ];

        $dto = RegisterUserDTO::fromArray($data);
        
        $this->assertNotNull($dto);
    }

    public function testFromArrayCreatesInstance(): void
    {
        $data = [
            'name' => 'Jane',
            'lastname' => 'Smith',
            'email' => 'jane@example.com',
            'password' => 'SecurePass456!',
            'phone' => '+56912345678'
        ];

        $dto = RegisterUserDTO::fromArray($data);
        
        $this->assertInstanceOf(RegisterUserDTO::class, $dto);
    }

    public function testValidateThrowsOnMissingName(): void
    {
        $data = [
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnMissingLastname(): void
    {
        $data = [
            'name' => 'John',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnMissingEmail(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'password' => 'SecurePass123!'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnMissingPassword(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnInvalidEmailFormat(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'not-an-email',
            'password' => 'SecurePass123!'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnWeakPassword(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'weak'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnPasswordWithoutUppercase(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'securepass123!'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnPasswordWithoutLowercase(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SECUREPASS123!'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnPasswordWithoutNumber(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass!'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnPasswordWithoutSpecialChar(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnPasswordEqualsEmail(): void
    {
        $email = 'john@example.com';
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => $email,
            'password' => 'JohnExample.com1' // Contains email components
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnInvalidPhoneFormat(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!',
            'phone' => 'invalid'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnPhoneToolong(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!',
            'phone' => '123456789012345678' // More than 15 characters
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnPhoneTooShort(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!',
            'phone' => '1234567' // Less than 8 characters
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateAcceptsValidPhone(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!',
            'phone' => '+56912345678'
        ];

        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate(); // Should not throw
        
        $this->assertTrue(true); // If we get here, validation passed
    }

    public function testValidateAcceptsOptionalPhoneAsNull(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!'
        ];

        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate(); // Should not throw
        
        $this->assertTrue(true);
    }

    public function testValidateAcceptsValidData(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => 'john.doe@example.com',
            'password' => 'SecurePass123!',
            'phone' => '+56912345678'
        ];

        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate(); // Should not throw
        
        $this->assertTrue(true);
    }

    public function testValidateThrowsOnEmptyName(): void
    {
        $data = [
            'name' => '',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnEmptyLastname(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => '',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnEmptyEmail(): void
    {
        $data = [
            'name' => 'John',
            'lastname' => 'Doe',
            'email' => '',
            'password' => 'SecurePass123!'
        ];

        $this->expectException(ApiException::class);
        $dto = RegisterUserDTO::fromArray($data);
        $dto->validate();
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/web{fixWebApp}
