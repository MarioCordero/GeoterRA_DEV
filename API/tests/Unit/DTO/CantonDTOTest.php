<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\CantonDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class CantonDTOTest extends TestCase
{
    public function testCanCreateCantonDTO(): void
    {
        $dto = new CantonDTO(
            cantonId: '01H8X5B4G5N6J7K8L9M0P1Q2R3',
            provinceSnitCode: 1,
            cantonSnitCode: 15,
            cantonName: 'San Jose',
            createdBy: 'admin',
            createdAt: '2023-01-01 10:00:00'
        );

        $this->assertSame('01H8X5B4G5N6J7K8L9M0P1Q2R3', $dto->cantonId);
        $this->assertSame(1, $dto->provinceSnitCode);
        $this->assertSame(15, $dto->cantonSnitCode);
        $this->assertSame('San Jose', $dto->cantonName);
        $this->assertSame('admin', $dto->createdBy);
        $this->assertSame('2023-01-01 10:00:00', $dto->createdAt);
    }

    public function testFromArrayWithValidData(): void
    {
        $data = [
            'province_snit_code' => '2',
            'canton_snit_code' => '5',
            'canton_name' => 'Alajuela'
        ];

        $dto = CantonDTO::fromArray($data);

        $this->assertNull($dto->cantonId);
        $this->assertSame(2, $dto->provinceSnitCode);
        $this->assertSame(5, $dto->cantonSnitCode);
        $this->assertSame('Alajuela', $dto->cantonName);
    }

    public function testFromArrayThrowsExceptionForMissingProvinceSnitCode(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);
        
        CantonDTO::fromArray([
            'canton_snit_code' => 5,
            'canton_name' => 'Alajuela'
        ]);
    }

    public function testFromArrayThrowsExceptionForMissingCantonSnitCode(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);
        
        CantonDTO::fromArray([
            'province_snit_code' => 2,
            'canton_name' => 'Alajuela'
        ]);
    }

    public function testFromArrayThrowsExceptionForEmptyCantonName(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);
        
        CantonDTO::fromArray([
            'province_snit_code' => 2,
            'canton_snit_code' => 5,
            'canton_name' => '   '
        ]);
    }

    public function testFromDatabaseWithValidData(): void
    {
        $row = [
            'canton_id' => 'abc',
            'province_snit_code' => 3,
            'canton_snit_code' => 10,
            'canton_name' => 'Cartago',
            'created_by' => 'user123',
            'created_at' => '2024-01-01'
        ];

        $dto = CantonDTO::fromDatabase($row);

        $this->assertSame('abc', $dto->cantonId);
        $this->assertSame(3, $dto->provinceSnitCode);
        $this->assertSame(10, $dto->cantonSnitCode);
        $this->assertSame('Cartago', $dto->cantonName);
    }

    public function testValidatePassesWithValidData(): void
    {
        $dto = new CantonDTO(null, 1, 1, 'Valid Canton Name');
        
        // Si validate() lanza una excepción, esta prueba fallará
        $this->expectNotToPerformAssertions();
        $dto->validate();
    }

    public function testValidateThrowsExceptionIfProvinceSnitCodeIsZeroOrNegative(): void
    {
        $dto = new CantonDTO(null, 0, 1, 'Valid Name');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfCantonSnitCodeIsZeroOrNegative(): void
    {
        $dto = new CantonDTO(null, 1, -5, 'Valid Name');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfCantonNameIsEmpty(): void
    {
        $dto = new CantonDTO(null, 1, 1, '   ');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfCantonNameIsTooLong(): void
    {
        $longName = str_repeat('a', 56);
        $dto = new CantonDTO(null, 1, 1, $longName);

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }
}