<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\UpdateInsituTestDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class UpdateInsituTestDTOTest extends TestCase
{
	public function testFromArrayWithValidData(): void
	{
		$data = [
			'insitu_test_name' => 'Prueba Actualizada',
			'temperature' => 96.0,
			'conductivity' => 1100.5,
			'ph' => 7.3,
			'description' => 'Updated in-situ test'
		];

		$dto = UpdateInsituTestDTO::fromArray($data);

		$this->assertSame('Prueba Actualizada', $dto->insituTestName);
		$this->assertSame(96.0, $dto->temperature);
		$this->assertSame(1100.5, $dto->conductivity);
		$this->assertSame(7.3, $dto->ph);
		$this->assertSame('Updated in-situ test', $dto->description);
	}

	public function testFromArrayWithPartialData(): void
	{
		$data = [
			'insitu_test_name' => 'Nuevo Nombre',
			'temperature' => 100.0
		];

		$dto = UpdateInsituTestDTO::fromArray($data);

		$this->assertSame('Nuevo Nombre', $dto->insituTestName);
		$this->assertSame(100.0, $dto->temperature);
		$this->assertNull($dto->conductivity);
		$this->assertNull($dto->ph);
		$this->assertNull($dto->description);
	}

	public function testFromArrayWithEmptyData(): void
	{
		$dto = UpdateInsituTestDTO::fromArray([]);

		$this->assertNull($dto->insituTestName);
		$this->assertNull($dto->temperature);
		$this->assertNull($dto->conductivity);
		$this->assertNull($dto->ph);
		$this->assertNull($dto->description);
	}

	public function testToArrayReturnsOnlyNonNullFields(): void
	{
		$dto = new UpdateInsituTestDTO(insituTestName: 'Test Name', temperature: 95.0, conductivity: null, ph: 7.0, description: 'Desc');
		$arr = $dto->toArray();

		$expected = [
			'insitu_test_name' => 'Test Name',
			'temperature' => 95.0,
			'ph' => 7.0,
			'description' => 'Desc',
		];
		$this->assertSame($expected, $arr);
	}

	public function testToArrayReturnsEmptyArrayWhenNoFieldsSet(): void
	{
		$dto = new UpdateInsituTestDTO();
		$arr = $dto->toArray();
		$this->assertSame([], $arr);
	}

	public function testValidatePassesWithValidData(): void
	{
		$dto = new UpdateInsituTestDTO('Test Name', 95.5, 1000.5, 7.2, 'desc');
		$this->expectNotToPerformAssertions();
		$dto->validate();
	}

	public function testValidatePassesWithNullFields(): void
	{
		$dto = new UpdateInsituTestDTO();
		$this->expectNotToPerformAssertions();
		$dto->validate();
	}

	public function testValidateThrowsExceptionForEmptyInsituTestName(): void
	{
		$dto = new UpdateInsituTestDTO('   ');
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForInsituTestNameTooLong(): void
	{
		$dto = new UpdateInsituTestDTO(str_repeat('a', 56));
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidatePassesWithInsituTestNameMaxLength(): void
	{
		$dto = new UpdateInsituTestDTO(str_repeat('a', 55));
		$this->expectNotToPerformAssertions();
		$dto->validate();
	}

	public function testValidateThrowsExceptionForTemperatureOutOfRange(): void
	{
		$dto = new UpdateInsituTestDTO(null, temperature: 201.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeConductivity(): void
	{
		$dto = new UpdateInsituTestDTO(null, conductivity: -10.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForPhOutOfRange(): void
	{
		$dto = new UpdateInsituTestDTO(null, ph: 15.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}
}