<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\GeomanifestationViewDTO;
use PHPUnit\Framework\TestCase;

class GeomanifestationViewDTOTest extends TestCase
{
    public function testFromDatabaseWithAllFields(): void
    {
        $row = [
            'geomanifestation_id' => 'gm1',
            'geomanifestation_name' => 'Name',
            'latitude' => 10.0,
            'longitude' => -84.0,
            'manifestation_description' => 'Desc',
            'visibility' => 1,
            'manifestation_created_at' => '2024-01-01',
            'manifestation_creator_first_name' => 'John',
            'manifestation_creator_last_name' => 'Doe',
            'province_name' => 'San Jose',
            'province_snit_code' => 1,
            'canton_name' => 'San Jose',
            'canton_snit_code' => 1,
            'district_name' => 'Carmen',
            'district_snit_code' => 1,
            'georeport_id' => 'gr1',
            'report_details' => 'Details',
            'report_created_at' => '2024-01-02',
            'report_creator_first_name' => 'Jane',
            'report_creator_last_name' => 'Smith',
            'insitu_test_id' => 'is1',
            'temperature' => 100.0,
            'insitu_conductivity' => 50.0,
            'insitu_ph' => 7.0,
            'insitu_description' => 'Insitu desc',
            'insitu_created_at' => '2024-01-03',
            'inlab_test_id' => 'il1',
            'lab_ph' => 7.1,
            'lab_conductivity' => 51.0,
            'cl' => 1.0,
            'ca' => 2.0,
            'hco3' => 3.0,
            'so4' => 4.0,
            'fe' => 5.0,
            'si' => 6.0,
            'b' => 7.0,
            'li' => 8.0,
            'f' => 9.0,
            'na' => 10.0,
            'k' => 11.0,
            'mg' => 12.0,
            'lab_description' => 'Lab desc',
            'lab_created_at' => '2024-01-04'
        ];

        $dto = GeomanifestationViewDTO::fromDatabase($row);

        $this->assertSame('gm1', $dto->geomanifestationId);
        $this->assertSame('Name', $dto->geomanifestationName);
        $this->assertSame(10.0, $dto->latitude);
        $this->assertTrue($dto->visibility);
        
        $array = $dto->toArray();
        $this->assertSame('gm1', $array['geomanifestation_id']);
        $this->assertSame('Name', $array['name']);
        $this->assertSame('San Jose', $array['location']['province']);
        $this->assertSame('gr1', $array['current_georeport']['georeport_id']);
        $this->assertSame('is1', $array['insitu_test']['insitu_test_id']);
        $this->assertSame('il1', $array['inlab_test']['inlab_test_id']);
        $this->assertSame(1.0, $array['inlab_test']['cl']);
    }

    public function testFromDatabaseWithMinimalFields(): void
    {
        $row = [
            'geomanifestation_id' => 'gm2',
            'geomanifestation_name' => 'Name 2',
            'latitude' => 10.5,
            'longitude' => -84.5,
            'visibility' => 0,
            'manifestation_created_at' => '2024-01-01',
            'manifestation_creator_first_name' => 'John',
            'manifestation_creator_last_name' => 'Doe',
        ];

        $dto = GeomanifestationViewDTO::fromDatabase($row);

        $this->assertSame('gm2', $dto->geomanifestationId);
        $this->assertFalse($dto->visibility);
        
        $array = $dto->toArray();
        $this->assertNull($array['current_georeport']);
        $this->assertNull($array['insitu_test']);
        $this->assertNull($array['inlab_test']);
    }
}
