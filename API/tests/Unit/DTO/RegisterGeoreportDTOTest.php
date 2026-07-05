<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\RegisterGeoreportDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class RegisterGeoreportDTOTest extends TestCase
{
  public function testFromArrayWithValidData(): void
  {
    $data = [
      'geomanifestation_id' => 'gm1',
      'insitu_test_id' => 'in1',
      'inlab_test_id' => 'il1',
      'details' => 'Some details'
    ];

    $dto = RegisterGeoreportDTO::fromArray($data);

    $this->assertSame('gm1', $dto->geomanifestationId);
    $this->assertSame('in1', $dto->insituTestId);
    $this->assertSame('il1', $dto->inlabTestId);
    $this->assertSame('Some details', $dto->details);
  }

  public function testFromArrayWithNullDetails(): void
  {
    $data = [
      'geomanifestation_id' => 'gm1',
      'insitu_test_id' => 'in1',
      'inlab_test_id' => 'il1',
    ];

    $dto = RegisterGeoreportDTO::fromArray($data);

    $this->assertSame('gm1', $dto->geomanifestationId);
    $this->assertSame('in1', $dto->insituTestId);
    $this->assertSame('il1', $dto->inlabTestId);
    $this->assertNull($dto->details);
  }

  public function testFromArrayThrowsExceptionForMissingGeomanifestationId(
  ): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterGeoreportDTO::fromArray(
      [
        'insitu_test_id' => 'in1',
        'inlab_test_id' => 'il1'
      ]
    );
  }

  public function testFromArrayThrowsExceptionForEmptyGeomanifestationId(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterGeoreportDTO::fromArray(
      [
        'geomanifestation_id' => '',
        'insitu_test_id' => 'in1',
        'inlab_test_id' => 'il1'
      ]
    );
  }

  public function testFromArrayThrowsExceptionForMissingInsituTestId(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterGeoreportDTO::fromArray(
      [
        'geomanifestation_id' => 'gm1',
        'inlab_test_id' => 'il1'
      ]
    );
  }

  public function testFromArrayThrowsExceptionForMissingInlabTestId(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterGeoreportDTO::fromArray(
      [
        'geomanifestation_id' => 'gm1',
        'insitu_test_id' => 'in1'
      ]
    );
  }

  public function testValidatePassesWithValidData(): void
  {
    $dto = new RegisterGeoreportDTO('gm1', 'in1', 'il1', 'Some details');
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidatePassesWithNullDetails(): void
  {
    $dto = new RegisterGeoreportDTO('gm1', 'in1', 'il1');
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidateThrowsExceptionForEmptyGeomanifestationId(): void
  {
    $dto = new RegisterGeoreportDTO('   ', 'in1', 'il1');
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForEmptyInsituTestId(): void
  {
    $dto = new RegisterGeoreportDTO('gm1', '   ', 'il1');
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForEmptyInlabTestId(): void
  {
    $dto = new RegisterGeoreportDTO('gm1', 'in1', '   ');
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForDetailsTooLong(): void
  {
    $dto = new RegisterGeoreportDTO('gm1', 'in1', 'il1', str_repeat('a', 501));
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }
}