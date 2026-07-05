<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use Tests\TestCase;
use DTO\UpdateUserDTO;
use Http\ApiException;

class UpdateUserDTOTest extends TestCase
{
  private const USER_ID = '01H8X5B4G5N6J7K8L9M0P1Q2R3';

  public function testFromArrayWithValidData(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'phone_number' => '87654321',
      'current_password' => 'OldPass123!',
      'password' => 'NewPass123!',
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->assertSame(self::USER_ID, $dto->userId);
    $this->assertSame('John', $dto->firstName);
    $this->assertSame('Doe', $dto->lastName);
    $this->assertSame('john@example.com', $dto->email);
    $this->assertSame('87654321', $dto->phoneNumber);
    $this->assertSame('OldPass123!', $dto->currentPassword);
    $this->assertSame('NewPass123!', $dto->password);
  }

  public function testFromArrayWithPartialData(): void
  {
    $data = [
      'phone_number' => '87654321',
      'password' => 'NewPass123!',
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->assertSame(self::USER_ID, $dto->userId);
    // Los campos no proporcionados se asignan como string vacío
    $this->assertSame('', $dto->firstName);
    $this->assertSame('', $dto->lastName);
    $this->assertSame('', $dto->email);
    $this->assertSame('87654321', $dto->phoneNumber);
    $this->assertNull($dto->currentPassword);
    $this->assertSame('NewPass123!', $dto->password);
  }

  public function testSetUserId(): void
  {
    $dto = UpdateUserDTO::fromArray([], '');
    $this->assertSame('', $dto->userId);

    $dto->setUserId('new-id');
    $this->assertSame('new-id', $dto->userId);
  }

  public function testValidatePassesWithValidData(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'phone_number' => '87654321',
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidateThrowsExceptionWhenChangingPasswordWithoutCurrentPassword(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'password' => 'NewPass123!', // password provided, but no current_password
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(400);
    $this->expectExceptionMessage('Current password is required to change password');

    $dto->validate();
  }

  public function testValidateThrowsExceptionForInvalidEmail(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'not-an-email',
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto->validate();
  }

  public function testValidateThrowsExceptionForNewPasswordTooShort(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'current_password' => 'OldPass123!',
      'password' => 'Short1!', // 7 characters
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(400);
    $this->expectExceptionMessage('Password must be at least 8 characters');

    $dto->validate();
  }

  public function testValidateThrowsExceptionForMissingFirstName(): void
  {
    $data = [
      'last_name' => 'Doe',
      'email' => 'john@example.com',
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto->validate();
  }

  public function testValidateThrowsExceptionForMissingLastName(): void
  {
    $data = [
      'first_name' => 'John',
      'email' => 'john@example.com',
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto->validate();
  }

  public function testValidateThrowsExceptionForMissingEmail(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto->validate();
  }

  public function testValidateThrowsExceptionForEmptyFirstName(): void
  {
    $data = [
      'first_name' => '',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto->validate();
  }

  public function testValidateThrowsExceptionForEmptyLastName(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => '',
      'email' => 'john@example.com',
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto->validate();
  }

  public function testValidateThrowsExceptionForEmptyEmail(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => '',
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto->validate();
  }

  public function testValidateThrowsExceptionForInvalidPhoneNumber(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'phone_number' => 'invalid',
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto->validate();
  }

  public function testValidateThrowsExceptionForPhoneNumberTooShort(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'phone_number' => '1234567', // 7 digits
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto->validate();
  }

  public function testValidateThrowsExceptionForPhoneNumberTooLong(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'phone_number' => '123456789012345678', // 18 digits
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto->validate();
  }

  public function testValidateAcceptsNullPhoneNumber(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidateAcceptsValidPhoneNumber(): void
  {
    $data = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => 'john@example.com',
      'phone_number' => '87654321',
    ];

    $dto = UpdateUserDTO::fromArray($data, self::USER_ID);
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }
}