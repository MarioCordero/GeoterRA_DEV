<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\DistrictDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class DistrictDTOTest extends TestCase
{
    public function testCanCreateDistrictDTO(): void
    {
        $dto = new DistrictDTO(
            districtId: '01H8X5B4G5N6J7K8L9M0P1Q2R3',
            cantonSnitCode: 15,
            districtSnitCode: 20,
            districtName: 'Carmen',
            createdBy: 'admin',
            createdAt: '2023-01-01 10:00:00'
        );

        $this->assertSame('01H8X5B4G5N6J7K8L9M0P1Q2R3', $dto->districtId);
        $this->assertSame(15, $dto->cantonSnitCode);
        $this->assertSame(20, $dto->districtSnitCode);
        $this->assertSame('Carmen', $dto->districtName);
        $this->assertSame('admin', $dto->createdBy);
        $this->assertSame('2023-01-01 10:00:00', $dto->createdAt);
    }

    public function testFromArrayWithValidData(): void
    {
        $data = [
            'canton_snit_code' => '5',
            'district_snit_code' => '10',
            'district_name' => 'San Jose'
        ];

        $dto = DistrictDTO::fromArray($data);

        $this->assertNull($dto->districtId);
        $this->assertSame(5, $dto->cantonSnitCode);
        $this->assertSame(10, $dto->districtSnitCode);
        $this->assertSame('San Jose', $dto->districtName);
    }

    public function testFromArrayThrowsExceptionForMissingCantonSnitCode(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);
        
        DistrictDTO::fromArray([
            'district_snit_code' => 10,
            'district_name' => 'San Jose'
        ]);
    }

    public function testFromArrayThrowsExceptionForMissingDistrictSnitCode(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);
        
        DistrictDTO::fromArray([
            'canton_snit_code' => 5,
            'district_name' => 'San Jose'
        ]);
    }

    public function testFromArrayThrowsExceptionForEmptyDistrictName(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);
        
        DistrictDTO::fromArray([
            'canton_snit_code' => 5,
            'district_snit_code' => 10,
            'district_name' => '   '
        ]);
    }

    public function testFromDatabaseWithValidData(): void
    {
        $row = [
            'district_id' => 'abc',
            'canton_snit_code' => 3,
            'district_snit_code' => 12,
            'district_name' => 'Pavas',
            'created_by' => 'user123',
            'created_at' => '2024-01-01'
        ];

        $dto = DistrictDTO::fromDatabase($row);

        $this->assertSame('abc', $dto->districtId);
        $this->assertSame(3, $dto->cantonSnitCode);
        $this->assertSame(12, $dto->districtSnitCode);
        $this->assertSame('Pavas', $dto->districtName);
    }

    public function testValidatePassesWithValidData(): void
    {
        $dto = new DistrictDTO(null, 1, 1, 'Valid District Name');
        
        $this->expectNotToPerformAssertions();
        $dto->validate();
    }

    public function testValidateThrowsExceptionIfCantonSnitCodeIsZeroOrNegative(): void
    {
        $dto = new DistrictDTO(null, 0, 1, 'Valid Name');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfDistrictSnitCodeIsZeroOrNegative(): void
    {
        $dto = new DistrictDTO(null, 1, -5, 'Valid Name');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfDistrictNameIsEmpty(): void
    {
        $dto = new DistrictDTO(null, 1, 1, '   ');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfDistrictNameIsTooLong(): void
    {
        $longName = str_repeat('a', 56);
        $dto = new DistrictDTO(null, 1, 1, $longName);

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }
}