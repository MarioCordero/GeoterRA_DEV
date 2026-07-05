<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\RegisterUserDTO;
use Http\ApiException;
use Tests\TestCase;

class RegisterUserDTOTest extends TestCase
{
  public function testFromArrayWithValidData(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'SecurePass123!',
      'phone_number' => '87654321',
    ];

    $dto = RegisterUserDTO::fromArray($data);

    $this->assertSame('John', $dto->firstName);
    $this->assertSame('Doe', $dto->lastName);
    $this->assertSame('john@example.com', $dto->email);
    $this->assertSame('87654321', $dto->phoneNumber);
    $this->assertSame('SecurePass123!', $dto->password);
  }

  public function testFromArrayNormalizesEmailToLowercase(): void
  {
    $data = [
      'first_name' => 'Jane',
      'last_name' => 'Smith',
      'email' => 'JANE@EXAMPLE.COM',
      'password' => 'SecurePass123!',
    ];

    $dto = RegisterUserDTO::fromArray($data);
    $this->assertSame('jane@example.com', $dto->email);
  }

  public function testFromArrayWithoutPhone(): void
  {
    $data = [
      'first_name' => 'Jane',
      'last_name' => 'Smith',
      'email' => 'jane@example.com',
      'password' => 'AnotherPass123!',
    ];

    $dto = RegisterUserDTO::fromArray($data);
    $this->assertNull($dto->phoneNumber);
  }

  public function testValidateThrowsExceptionForMissingFirstName(): void
  {
    $data = [
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'SecurePass123!',
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForMissingLastName(): void
  {
    $data = [
      'first_name' => 'John',
      'email' => 'john@example.com',
      'password' => 'SecurePass123!',
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForMissingEmail(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'password' => 'SecurePass123!',
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForMissingPassword(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForInvalidEmail(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'not-an-email',
      'password' => 'SecurePass123!',
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForPasswordTooShort(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'Weak1!', // 6 characters
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForPasswordWithoutUppercase(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'securepass123!',
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForPasswordWithoutLowercase(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'SECUREPASS123!',
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForPasswordWithoutDigit(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'SecurePass!',
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForPasswordWithoutSpecialChar(
  ): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'SecurePass123',
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForPasswordContainingEmail(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'john@example.com123!', // contains email
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForInvalidPhoneNumber(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'SecurePass123!',
      'phone_number' => 'invalid',
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForPhoneNumberTooShort(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'SecurePass123!',
      'phone_number' => '1234567', // 7 digits
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForPhoneNumberTooLong(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'SecurePass123!',
      'phone_number' => '123456789012345678', // 18 digits
    ];

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = RegisterUserDTO::fromArray($data);
    $dto->validate();
  }

  public function testValidateAcceptsValidPhoneNumber(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'SecurePass123!',
      'phone_number' => '87654321',
    ];

    $dto = RegisterUserDTO::fromArray($data);
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidateAcceptsNullPhoneNumber(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'SecurePass123!',
    ];

    $dto = RegisterUserDTO::fromArray($data);
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidatePassesWithValidData(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john.doe@example.com',
      'password' => 'SecurePass123!',
      'phone_number' => '87654321',
    ];

    $dto = RegisterUserDTO::fromArray($data);
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }
}