<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\ProvinceDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class ProvinceDTOTest extends TestCase
{
    public function testCanCreateProvinceDTO(): void
    {
        $dto = new ProvinceDTO(
            provinceId: '123',
            provinceSnitCode: 1,
            provinceName: 'San Jose',
            createdBy: 'admin',
            createdAt: '2024-01-01'
        );

        $this->assertSame('123', $dto->provinceId);
        $this->assertSame(1, $dto->provinceSnitCode);
        $this->assertSame('San Jose', $dto->provinceName);
        $this->assertSame('admin', $dto->createdBy);
        $this->assertSame('2024-01-01', $dto->createdAt);
    }

    public function testFromArrayWithValidData(): void
    {
        $data = [
            'province_snit_code' => '2',
            'province_name' => 'Alajuela'
        ];

        $dto = ProvinceDTO::fromArray($data);

        $this->assertNull($dto->provinceId);
        $this->assertSame(2, $dto->provinceSnitCode);
        $this->assertSame('Alajuela', $dto->provinceName);
    }

    public function testFromArrayThrowsExceptionForMissingProvinceSnitCode(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);
        
        ProvinceDTO::fromArray([
            'province_name' => 'Alajuela'
        ]);
    }

    public function testFromArrayThrowsExceptionForEmptyProvinceName(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);
        
        ProvinceDTO::fromArray([
            'province_snit_code' => 2,
            'province_name' => '   '
        ]);
    }

    public function testFromDatabaseWithValidData(): void
    {
        $row = [
            'province_id' => 'abc',
            'province_snit_code' => 3,
            'province_name' => 'Cartago',
            'created_by' => 'user123',
            'created_at' => '2024-01-01'
        ];

        $dto = ProvinceDTO::fromDatabase($row);

        $this->assertSame('abc', $dto->provinceId);
        $this->assertSame(3, $dto->provinceSnitCode);
        $this->assertSame('Cartago', $dto->provinceName);
    }

    public function testValidatePassesWithValidData(): void
    {
        $dto = new ProvinceDTO(null, 1, 'Valid Name');
        
        $this->expectNotToPerformAssertions();
        $dto->validate();
    }

    public function testValidateThrowsExceptionIfProvinceSnitCodeIsZeroOrNegative(): void
    {
        $dto = new ProvinceDTO(null, 0, 'Valid Name');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfProvinceNameIsEmpty(): void
    {
        $dto = new ProvinceDTO(null, 1, '   ');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfProvinceNameIsTooLong(): void
    {
        $longName = str_repeat('a', 56);
        $dto = new ProvinceDTO(null, 1, $longName);

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }
}
