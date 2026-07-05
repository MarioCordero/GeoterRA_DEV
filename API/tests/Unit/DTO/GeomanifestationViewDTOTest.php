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
      'manifestation_created_at' => '2024-01-01',
      'province_name' => 'San Jose',
      'province_snit_code' => 1,
      'canton_name' => 'San Jose',
      'canton_snit_code' => 1,
      'district_name' => 'Carmen',
      'district_snit_code' => 1,
      'georeport_id' => 'gr1',
      'report_details' => 'Details',
      'report_created_at' => '2024-01-02',
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
    $this->assertSame(-84.0, $dto->longitude);
    $this->assertSame('Desc', $dto->manifestationDescription);
    $this->assertSame('2024-01-01', $dto->manifestationCreatedAt);
    $this->assertSame('San Jose', $dto->provinceName);
    $this->assertSame(1, $dto->provinceSnitCode);
    $this->assertSame('San Jose', $dto->cantonName);
    $this->assertSame(1, $dto->cantonSnitCode);
    $this->assertSame('Carmen', $dto->districtName);
    $this->assertSame(1, $dto->districtSnitCode);
    $this->assertSame('gr1', $dto->georeportId);
    $this->assertSame('Details', $dto->reportDetails);
    $this->assertSame('2024-01-02', $dto->reportCreatedAt);
    $this->assertSame('is1', $dto->insituTestId);
    $this->assertSame(100.0, $dto->temperature);
    $this->assertSame(50.0, $dto->insituConductivity);
    $this->assertSame(7.0, $dto->insituPh);
    $this->assertSame('Insitu desc', $dto->insituDescription);
    $this->assertSame('2024-01-03', $dto->insituCreatedAt);
    $this->assertSame('il1', $dto->inlabTestId);
    $this->assertSame(7.1, $dto->labPh);
    $this->assertSame(51.0, $dto->labConductivity);
    $this->assertSame(1.0, $dto->cl);
    $this->assertSame(2.0, $dto->ca);
    $this->assertSame(3.0, $dto->hco3);
    $this->assertSame(4.0, $dto->so4);
    $this->assertSame(5.0, $dto->fe);
    $this->assertSame(6.0, $dto->si);
    $this->assertSame(7.0, $dto->b);
    $this->assertSame(8.0, $dto->li);
    $this->assertSame(9.0, $dto->f);
    $this->assertSame(10.0, $dto->na);
    $this->assertSame(11.0, $dto->k);
    $this->assertSame(12.0, $dto->mg);
    $this->assertSame('Lab desc', $dto->labDescription);
    $this->assertSame('2024-01-04', $dto->labCreatedAt);

    $array = $dto->toArray();
    $this->assertSame('gm1', $array['geomanifestation_id']);
    $this->assertSame('Name', $array['name']);
    $this->assertSame(10.0, $array['latitude']); // rounded to 7 decimals
    $this->assertSame(-84.0, $array['longitude']);
    $this->assertSame('Desc', $array['description']);
    $this->assertSame('2024-01-01', $array['created_at']);
    $this->assertSame('San Jose', $array['location']['province']);
    $this->assertSame(1, $array['location']['province_snit_code']);
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
      'manifestation_created_at' => '2024-01-01',
    ];

    $dto = GeomanifestationViewDTO::fromDatabase($row);

    $this->assertSame('gm2', $dto->geomanifestationId);
    $this->assertSame('Name 2', $dto->geomanifestationName);
    $this->assertSame(10.5, $dto->latitude);
    $this->assertSame(-84.5, $dto->longitude);
    $this->assertNull($dto->manifestationDescription);
    $this->assertNull($dto->provinceName);
    $this->assertNull($dto->provinceSnitCode);
    $this->assertNull($dto->cantonName);
    $this->assertNull($dto->cantonSnitCode);
    $this->assertNull($dto->districtName);
    $this->assertNull($dto->districtSnitCode);
    $this->assertNull($dto->georeportId);
    $this->assertNull($dto->insituTestId);
    $this->assertNull($dto->inlabTestId);

    $array = $dto->toArray();
    $this->assertNull($array['current_georeport']);
    $this->assertNull($array['insitu_test']);
    $this->assertNull($array['inlab_test']);
  }
}