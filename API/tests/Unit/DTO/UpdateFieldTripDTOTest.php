<?php
declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\UpdateFieldTripDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class UpdateFieldTripDTOTest extends TestCase
{
  public function testFromArrayWithPartialData(): void
  {
    $data = [
      'field_trip_name' => 'Updated Gira Name',
      'field_trip_start_date' => '2026-10-15 09:00:00',
      'field_trip_is_active' => false,
      'participants' => ['01HXYZ12345678901234567890'],
    ];

    $dto = UpdateFieldTripDTO::fromArray($data);

    $this->assertSame('Updated Gira Name', $dto->fieldTripName);
    $this->assertSame('2026-10-15 09:00:00', $dto->fieldTripStartDate);
    $this->assertFalse($dto->fieldTripIsActive);
    $this->assertNull($dto->fieldTripFinishDate);
    $this->assertSame(['01HXYZ12345678901234567890'], $dto->participants);

    $updateArray = $dto->toArray();
    $this->assertSame('Updated Gira Name', $updateArray['field_trip_name']);
    $this->assertSame(0, $updateArray['field_trip_is_active']);
    $this->assertArrayNotHasKey('field_trip_finish_date', $updateArray);
  }

  public function testValidateThrowsOnLongName(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = new UpdateFieldTripDTO(
      fieldTripName: str_repeat('B', 111)
    );
    $dto->validate();
  }
}
