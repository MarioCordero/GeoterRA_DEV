<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\InsituTestDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class InsituTestDTOTest extends TestCase
{
    public function testCanCreateInsituTestDTO(): void
    {
        $dto = new InsituTestDTO('id1', 'gm1', 95.5, 1000.5, 7.2, 'desc');

        $this->assertSame('id1', $dto->insituTestId);
        $this->assertSame('gm1', $dto->geomanifestationId);
        $this->assertSame(95.5, $dto->temperature);
        $this->assertSame(1000.5, $dto->conductivity);
        $this->assertSame(7.2, $dto->ph);
        $this->assertSame('desc', $dto->description);
    }

    public function testFromArrayWithValidData(): void
    {
        $data = [
            'geomanifestation_id' => 'gm1',
            'temperature' => '95.5',
            'conductivity' => '1000.5',
            'ph' => '7.2'
        ];

        $dto = InsituTestDTO::fromArray($data);

        $this->assertNull($dto->insituTestId);
        $this->assertSame('gm1', $dto->geomanifestationId);
        $this->assertSame(95.5, $dto->temperature);
        $this->assertSame(1000.5, $dto->conductivity);
        $this->assertSame(7.2, $dto->ph);
    }

    public function testFromArrayThrowsExceptionForMissingGeomanifestationId(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);
        
        InsituTestDTO::fromArray(['temperature' => 95.5]);
    }

    public function testFromDatabaseWithValidData(): void
    {
        $row = [
            'insitu_test_id' => 'id1',
            'geomanifestation_id' => 'gm1',
            'temperature' => 95.5,
            'conductivity' => 1000.5,
        ];

        $dto = InsituTestDTO::fromDatabase($row);

        $this->assertSame('id1', $dto->insituTestId);
        $this->assertSame('gm1', $dto->geomanifestationId);
        $this->assertSame(95.5, $dto->temperature);
    }

    public function testValidatePassesWithValidData(): void
    {
        $dto = new InsituTestDTO(null, 'gm1', 95.5, 1000.5, 7.2, 'desc');
        
        $this->expectNotToPerformAssertions();
        $dto->validate();
    }

    public function testValidateThrowsExceptionIfPhIsInvalid(): void
    {
        $dto = new InsituTestDTO(null, 'gm1', 95.5, 1000.5, 15.0, 'desc');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfTemperatureIsInvalid(): void
    {
        $dto = new InsituTestDTO(null, 'gm1', 201.0, 1000.5, 7.2, 'desc');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfConductivityIsInvalid(): void
    {
        $dto = new InsituTestDTO(null, 'gm1', 95.5, -10.0, 7.2, 'desc');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }
}
