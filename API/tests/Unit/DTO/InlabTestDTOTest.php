<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\InlabTestDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class InlabTestDTOTest extends TestCase
{
    public function testCanCreateInlabTestDTO(): void
    {
        $dto = new InlabTestDTO('id1', 'gm1', 7.5, 100.5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 'desc');

        $this->assertSame('id1', $dto->inlabTestId);
        $this->assertSame('gm1', $dto->geomanifestationId);
        $this->assertSame(7.5, $dto->ph);
        $this->assertSame(100.5, $dto->conductivity);
        $this->assertSame(10.0, $dto->cl);
    }

    public function testFromArrayWithValidData(): void
    {
        $data = [
            'geomanifestation_id' => 'gm1',
            'ph' => '7.5',
            'conductivity' => '100.5',
            'cl' => '10'
        ];

        $dto = InlabTestDTO::fromArray($data);

        $this->assertNull($dto->inlabTestId);
        $this->assertSame('gm1', $dto->geomanifestationId);
        $this->assertSame(7.5, $dto->ph);
        $this->assertSame(100.5, $dto->conductivity);
        $this->assertSame(10.0, $dto->cl);
        $this->assertNull($dto->ca);
    }

    public function testFromArrayThrowsExceptionForMissingGeomanifestationId(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);
        
        InlabTestDTO::fromArray(['ph' => 7.5]);
    }

    public function testFromDatabaseWithValidData(): void
    {
        $row = [
            'inlab_test_id' => 'id1',
            'geomanifestation_id' => 'gm1',
            'ph' => 7.5,
            'conductivity' => 100.5,
        ];

        $dto = InlabTestDTO::fromDatabase($row);

        $this->assertSame('id1', $dto->inlabTestId);
        $this->assertSame('gm1', $dto->geomanifestationId);
        $this->assertSame(7.5, $dto->ph);
    }

    public function testValidatePassesWithValidData(): void
    {
        $dto = new InlabTestDTO(null, 'gm1', 7.5, 100.5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 'desc');
        
        $this->expectNotToPerformAssertions();
        $dto->validate();
    }

    public function testValidateThrowsExceptionIfPhIsInvalid(): void
    {
        $dto = new InlabTestDTO(null, 'gm1', 15.0, 100.5, null, null, null, null, null, null, null, null, null, null, null, null, null);

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfConductivityIsNegative(): void
    {
        $dto = new InlabTestDTO(null, 'gm1', 7.5, -10.0, null, null, null, null, null, null, null, null, null, null, null, null, null);

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfChemicalParameterIsNegative(): void
    {
        $dto = new InlabTestDTO(null, 'gm1', 7.5, 100.5, -5.0, null, null, null, null, null, null, null, null, null, null, null, null);

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }
}
