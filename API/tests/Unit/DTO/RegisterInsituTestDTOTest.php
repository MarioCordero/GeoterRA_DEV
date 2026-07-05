<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\RegisterInsituTestDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class RegisterInsituTestDTOTest extends TestCase
{
  public function testFromArrayWithValidData(): void
  {
    $data = [
      'geomanifestation_id' => 'gm1',
      'temperature' => 95.5,
      'conductivity' => 1000.5,
      'ph' => 7.2,
      'description' => 'In-situ test'
    ];

    $dto = RegisterInsituTestDTO::fromArray($data);

    $this->assertSame('gm1', $dto->geomanifestationId);
    $this->assertSame(95.5, $dto->temperature);
    $this->assertSame(1000.5, $dto->conductivity);
    $this->assertSame(7.2, $dto->ph);
    $this->assertSame('In-situ test', $dto->description);
  }

  public function testFromArrayWithMinimumData(): void
  {
    $data = ['geomanifestation_id' => 'gm1'];

    $dto = RegisterInsituTestDTO::fromArray($data);

    $this->assertSame('gm1', $dto->geomanifestationId);
    $this->assertSame(0.0,$dto->temperature);
    $this->assertSame(0.0,$dto->conductivity);
    $this->assertSame(0.0, $dto->ph);
    $this->assertNull($dto->description);
  }

  public function testFromArrayThrowsExceptionForMissingGeomanifestationId(
  ): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterInsituTestDTO::fromArray(['temperature' => 95.5]);
  }

  public function testFromArrayThrowsExceptionForEmptyGeomanifestationId(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterInsituTestDTO::fromArray(['geomanifestation_id' => '']);
  }

  public function testValidatePassesWithValidData(): void
  {
    $dto = new RegisterInsituTestDTO('gm1', 95.5, 1000.5, 7.2, 'desc');
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidatePassesWithMinimumData(): void
  {
    $dto = new RegisterInsituTestDTO('gm1');
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidateThrowsExceptionForEmptyGeomanifestationId(): void
  {
    $dto = new RegisterInsituTestDTO('   ');
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForTemperatureOutOfRange(): void
  {
    $dto = new RegisterInsituTestDTO('gm1', 201.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeConductivity(): void
  {
    $dto = new RegisterInsituTestDTO('gm1', null, -10.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForPhOutOfRange(): void
  {
    $dto = new RegisterInsituTestDTO('gm1', null, null, 15.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }
}