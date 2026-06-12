<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\InvestigationRequestDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class InvestigationRequestDTOTest extends TestCase
{
    public function testFromArrayWithValidData(): void
    {
        $data = [
            'province_snit_code' => 1,
            'canton_snit_code' => 2,
            'district_snit_code' => 3,
            'request_name' => 'Req 1',
            'current_usage' => 'Comercial',
            'temperature_sensation' => 'Caliente',
        ];

        $dto = InvestigationRequestDTO::fromArray($data);

        $this->assertSame(1, $dto->provinceSnitCode);
        $this->assertSame('Req 1', $dto->requestName);
        $this->assertFalse($dto->bubbles);
    }

    public function testFromArrayThrowsExceptionForMissingFields(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        InvestigationRequestDTO::fromArray(['request_name' => 'req']);
    }

    public function testFromDatabase(): void
    {
        $row = [
            'request_id' => 'req1',
            'province_snit_code' => 1,
            'canton_snit_code' => 2,
            'district_snit_code' => 3,
            'request_name' => 'Req 1',
            'current_usage' => 'Comercial',
            'temperature_sensation' => 'Caliente',
            'bubbles' => 1,
            'latitude' => null,
            'longitude' => null,
        ];

        $dto = InvestigationRequestDTO::fromDatabase($row);

        $this->assertSame('req1', $dto->requestId);
        $this->assertTrue($dto->bubbles);
        $this->assertNull($dto->latitude);
    }

    public function testToArray(): void
    {
        $dto = new InvestigationRequestDTO('req1', 1, 1, 1, 'name', null, null, null, 'Comercial', 'Caliente', true, null, null, 10.0, -84.0, null, null, 'PENDING', 'Pending desc', '2024-01-01');
        
        $arr = $dto->toArray();
        $this->assertSame('req1', $arr['request_id']);
        $this->assertSame('PENDING', $arr['state']['value']);
        $this->assertSame('Pending desc', $arr['state']['description']);
    }

    public function testValidatePassesWithValidData(): void
    {
        $dto = new InvestigationRequestDTO(null, 1, 1, 1, 'name', null, null, null, 'Comercial', 'Caliente', false, null, null, null, null, null);
        $userData = ['first_name' => 'John', 'last_name' => 'Doe'];
        
        $this->expectNotToPerformAssertions();
        $dto->validate($userData);
    }

    public function testValidateThrowsExceptionForInvalidSnitCode(): void
    {
        $dto = new InvestigationRequestDTO(null, 0, 1, 1, 'name', null, null, null, 'Comercial', 'Caliente', false, null, null, null, null, null);
        
        $this->expectException(ApiException::class);
        $dto->validate([]);
    }

    public function testValidateThrowsExceptionForInvalidUsage(): void
    {
        $dto = new InvestigationRequestDTO(null, 1, 1, 1, 'name', null, null, null, 'Invalid', 'Caliente', false, null, null, null, null, null);
        
        $this->expectException(ApiException::class);
        $dto->validate([]);
    }

    public function testValidateThrowsExceptionForInvalidTemperatureSensation(): void
    {
        $dto = new InvestigationRequestDTO(null, 1, 1, 1, 'name', null, null, null, 'Comercial', 'Invalid', false, null, null, null, null, null);
        
        $this->expectException(ApiException::class);
        $dto->validate([]);
    }

    public function testValidateThrowsExceptionForInvalidEmail(): void
    {
        $dto = new InvestigationRequestDTO(null, 1, 1, 1, 'name', null, null, 'invalid-email', 'Comercial', 'Caliente', false, null, null, null, null, null);
        
        $this->expectException(ApiException::class);
        $dto->validate([]);
    }

    public function testValidateThrowsExceptionForInvalidPhone(): void
    {
        $dto = new InvestigationRequestDTO(null, 1, 1, 1, 'name', null, '123', null, 'Comercial', 'Caliente', false, null, null, null, null, null);
        
        $this->expectException(ApiException::class);
        $dto->validate([]);
    }

    public function testValidateThrowsExceptionForMissingRelationWhenOwnerDiffers(): void
    {
        // Owner name is different, but relation is null
        $dto = new InvestigationRequestDTO(null, 1, 1, 1, 'name', 'Different Owner', null, null, 'Comercial', 'Caliente', false, null, null, null, null, null);
        $userData = ['first_name' => 'John', 'last_name' => 'Doe'];
        
        $this->expectException(ApiException::class);
        $dto->validate($userData);
    }

    public function testValidateThrowsExceptionForInvalidRelation(): void
    {
        $dto = new InvestigationRequestDTO(null, 1, 1, 1, 'name', 'Different Owner', null, null, 'Comercial', 'Caliente', false, null, null, null, null, 'InvalidRelation');
        $userData = ['first_name' => 'John', 'last_name' => 'Doe'];
        
        $this->expectException(ApiException::class);
        $dto->validate($userData);
    }
}
