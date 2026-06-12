<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\GeoreportDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class GeoreportDTOTest extends TestCase
{
    public function testCanCreateGeoreportDTO(): void
    {
        $dto = new GeoreportDTO('gr1', 'gm1', 'in1', 'il1', 'Some details');

        $this->assertSame('gr1', $dto->georeportId);
        $this->assertSame('gm1', $dto->geomanifestationId);
        $this->assertSame('in1', $dto->insituTestId);
        $this->assertSame('il1', $dto->inlabTestId);
        $this->assertSame('Some details', $dto->details);
    }

    public function testFromArrayWithValidData(): void
    {
        $data = [
            'geomanifestation_id' => 'gm1',
            'insitu_test_id' => 'in1',
            'inlab_test_id' => 'il1',
            'details' => 'Some details'
        ];

        $dto = GeoreportDTO::fromArray($data);

        $this->assertNull($dto->georeportId);
        $this->assertSame('gm1', $dto->geomanifestationId);
        $this->assertSame('in1', $dto->insituTestId);
        $this->assertSame('il1', $dto->inlabTestId);
        $this->assertSame('Some details', $dto->details);
    }

    public function testFromArrayThrowsExceptionForMissingFields(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);
        
        GeoreportDTO::fromArray([
            'geomanifestation_id' => 'gm1',
            'insitu_test_id' => 'in1',
            // Missing inlab_test_id
        ]);
    }

    public function testFromDatabaseWithValidData(): void
    {
        $row = [
            'georeport_id' => 'gr1',
            'geomanifestation_id' => 'gm1',
            'insitu_test_id' => 'in1',
            'inlab_test_id' => 'il1',
            'details' => 'Some details'
        ];

        $dto = GeoreportDTO::fromDatabase($row);

        $this->assertSame('gr1', $dto->georeportId);
        $this->assertSame('gm1', $dto->geomanifestationId);
    }

    public function testValidatePassesWithValidData(): void
    {
        $dto = new GeoreportDTO(null, 'gm1', 'in1', 'il1', 'details');
        
        $this->expectNotToPerformAssertions();
        $dto->validate();
    }

    public function testValidateThrowsExceptionIfGeomanifestationIdIsEmpty(): void
    {
        $dto = new GeoreportDTO(null, '   ', 'in1', 'il1', 'details');

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }

    public function testValidateThrowsExceptionIfDetailsTooLong(): void
    {
        $dto = new GeoreportDTO(null, 'gm1', 'in1', 'il1', str_repeat('a', 501));

        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        $dto->validate();
    }
}
