<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use Tests\TestCase;
use DTO\AnalysisRequestDTO;
use Http\ApiException;

class AnalysisRequestDTOTest extends TestCase
{
    public function testValidAnalysisRequestDTOCreation(): void
    {
        $data = [
            'region' => 'Los Andes',
            'email' => 'user@example.com',
            'temperature_sensation' => 'templado',
            'latitude' => -33.8688,
            'longitude' => -151.2093
        ];

        $dto = AnalysisRequestDTO::fromArray($data);
        
        $this->assertNotNull($dto);
    }

    public function testFromArrayCreatesInstance(): void
    {
        $data = [
            'region' => 'Zona Sur',
            'email' => 'user@example.com',
            'temperature_sensation' => 'frio',
            'latitude' => -40.5,
            'longitude' => -72.5,
            'additional_information' => 'Test info'
        ];

        $dto = AnalysisRequestDTO::fromArray($data);
        
        $this->assertInstanceOf(AnalysisRequestDTO::class, $dto);
    }

    public function testValidateThrowsOnMissingRegion(): void
    {
        $data = [
            'email' => 'user@example.com',
            'temperature_sensation' => 'templado',
            'latitude' => -33.8688,
            'longitude' => -151.2093
        ];

        $this->expectException(ApiException::class);
        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnMissingEmail(): void
    {
        $data = [
            'region' => 'Los Andes',
            'temperature_sensation' => 'templado',
            'latitude' => -33.8688,
            'longitude' => -151.2093
        ];

        $this->expectException(ApiException::class);
        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnInvalidEmailFormat(): void
    {
        $data = [
            'region' => 'Los Andes',
            'email' => 'invalid-email',
            'temperature_sensation' => 'templado',
            'latitude' => -33.8688,
            'longitude' => -151.2093
        ];

        $this->expectException(ApiException::class);
        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnMissingTemperatureSensation(): void
    {
        $data = [
            'region' => 'Los Andes',
            'email' => 'user@example.com',
            'latitude' => -33.8688,
            'longitude' => -151.2093
        ];

        $this->expectException(ApiException::class);
        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnMissingLatitude(): void
    {
        $data = [
            'region' => 'Los Andes',
            'email' => 'user@example.com',
            'temperature_sensation' => 'templado',
            'longitude' => -151.2093
        ];

        $this->expectException(ApiException::class);
        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnMissingLongitude(): void
    {
        $data = [
            'region' => 'Los Andes',
            'email' => 'user@example.com',
            'temperature_sensation' => 'templado',
            'latitude' => -33.8688
        ];

        $this->expectException(ApiException::class);
        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnInvalidRegion(): void
    {
        $data = [
            'region' => 'Invalid Region',
            'email' => 'user@example.com',
            'temperature_sensation' => 'templado',
            'latitude' => -33.8688,
            'longitude' => -151.2093
        ];

        $this->expectException(ApiException::class);
        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnInvalidTemperatureSensation(): void
    {
        $data = [
            'region' => 'Los Andes',
            'email' => 'user@example.com',
            'temperature_sensation' => 'invalid_temp',
            'latitude' => -33.8688,
            'longitude' => -151.2093
        ];

        $this->expectException(ApiException::class);
        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnLatitudeOutOfRange(): void
    {
        $data = [
            'region' => 'Los Andes',
            'email' => 'user@example.com',
            'temperature_sensation' => 'templado',
            'latitude' => 91.0, // Out of range (-90 to 90)
            'longitude' => -151.2093
        ];

        $this->expectException(ApiException::class);
        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnLongitudeOutOfRange(): void
    {
        $data = [
            'region' => 'Los Andes',
            'email' => 'user@example.com',
            'temperature_sensation' => 'templado',
            'latitude' => -33.8688,
            'longitude' => 181.0 // Out of range (-180 to 180)
        ];

        $this->expectException(ApiException::class);
        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateAcceptsAllValidTemperatureSensations(): void
    {
        $sensations = ['mucho_frio', 'frio', 'templado', 'calor', 'mucho_calor'];

        foreach ($sensations as $sensation) {
            $data = [
                'region' => 'Los Andes',
                'email' => 'user@example.com',
                'temperature_sensation' => $sensation,
                'latitude' => -33.8688,
                'longitude' => -151.2093
            ];

            $dto = AnalysisRequestDTO::fromArray($data);
            $dto->validate(); // Should not throw
        }

        $this->assertTrue(true);
    }

    public function testValidateAcceptsAllValidRegions(): void
    {
        $regions = [
            'Los Andes',
            'Zona Sur',
            'Pacifico',
            'Zona Central',
            'Araucanía',
            'Los Lagos',
            'Zona Austral'
        ];

        foreach ($regions as $region) {
            $data = [
                'region' => $region,
                'email' => 'user@example.com',
                'temperature_sensation' => 'templado',
                'latitude' => -33.8688,
                'longitude' => -151.2093
            ];

            $dto = AnalysisRequestDTO::fromArray($data);
            $dto->validate(); // Should not throw
        }

        $this->assertTrue(true);
    }

    public function testValidateAcceptsAtitudeAndLongitudeBoundaries(): void
    {
        // Test min latitude
        $data = [
            'region' => 'Los Andes',
            'email' => 'user@example.com',
            'temperature_sensation' => 'templado',
            'latitude' => -90.0,
            'longitude' => -151.2093
        ];

        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();

        // Test max latitude
        $data['latitude'] = 90.0;
        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();

        // Test min longitude
        $data['latitude'] = -33.8688;
        $data['longitude'] = -180.0;
        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();

        // Test max longitude
        $data['longitude'] = 180.0;
        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate();

        $this->assertTrue(true);
    }

    public function testValidateAcceptsValidData(): void
    {
        $data = [
            'region' => 'Los Andes',
            'email' => 'user@example.com',
            'temperature_sensation' => 'templado',
            'latitude' => -33.8688,
            'longitude' => -151.2093,
            'additional_information' => 'Additional test info'
        ];

        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate(); // Should not throw
        
        $this->assertTrue(true);
    }

    public function testValidateAcceptsOptionalAdditionalInformation(): void
    {
        $data = [
            'region' => 'Los Andes',
            'email' => 'user@example.com',
            'temperature_sensation' => 'templado',
            'latitude' => -33.8688,
            'longitude' => -151.2093
        ];

        $dto = AnalysisRequestDTO::fromArray($data);
        $dto->validate(); // Should not throw
        
        $this->assertTrue(true);
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/web{fixWebApp}
