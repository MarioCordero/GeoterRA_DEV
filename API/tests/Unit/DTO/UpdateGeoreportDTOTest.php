<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\UpdateGeoreportDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class UpdateGeoreportDTOTest extends TestCase
{
  public function testFromArrayWithValidData(): void
  {
    $data = [
      'insitu_test_id' => 'in2',
      'inlab_test_id' => 'il2',
      'details' => 'Updated details'
    ];

    $dto = UpdateGeoreportDTO::fromArray($data);

    $this->assertSame('in2', $dto->insituTestId);
    $this->assertSame('il2', $dto->inlabTestId);
    $this->assertSame('Updated details', $dto->details);
  }

  public function testFromArrayWithPartialData(): void
  {
    $data = ['details' => 'New details'];

    $dto = UpdateGeoreportDTO::fromArray($data);

    $this->assertNull($dto->insituTestId);
    $this->assertNull($dto->inlabTestId);
    $this->assertSame('New details', $dto->details);
  }

  public function testFromArrayWithEmptyData(): void
  {
    $dto = UpdateGeoreportDTO::fromArray([]);

    $this->assertNull($dto->insituTestId);
    $this->assertNull($dto->inlabTestId);
    $this->assertNull($dto->details);
  }

  public function testToArrayReturnsOnlyNonNullFields(): void
  {
    $dto = new UpdateGeoreportDTO('in2', null, 'Details');
    $arr = $dto->toArray();

    $expected = [
      'insitu_test_id' => 'in2',
      'details' => 'Details',
    ];
    $this->assertSame($expected, $arr);
  }

  public function testToArrayReturnsEmptyArrayWhenNoFieldsSet(): void
  {
    $dto = new UpdateGeoreportDTO();
    $arr = $dto->toArray();
    $this->assertSame([], $arr);
  }

  public function testValidatePassesWithValidData(): void
  {
    $dto = new UpdateGeoreportDTO('in1', 'il1', 'Details');
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidatePassesWithNullFields(): void
  {
    $dto = new UpdateGeoreportDTO();
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidateThrowsExceptionForEmptyInsituTestId(): void
  {
    $dto = new UpdateGeoreportDTO('   ');
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForEmptyInlabTestId(): void
  {
    $dto = new UpdateGeoreportDTO(null, '   ');
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForDetailsTooLong(): void
  {
    $dto = new UpdateGeoreportDTO(null, null, str_repeat('a', 501));
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }
}