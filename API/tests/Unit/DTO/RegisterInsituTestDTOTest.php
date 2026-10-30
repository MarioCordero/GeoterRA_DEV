<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\RegisterInsituTestDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class RegisterInsituTestDTOTest extends TestCase
{
	public function testFromArrayWithValidData(): void
	{
		$data = [
			'geomanifestation_id' => 'gm1',
			'insitu_test_name' => 'Prueba In-Situ Alfa',
			'temperature' => 95.5,
			'conductivity' => 1000.5,
			'ph' => 7.2,
			'description' => 'In-situ test'
		];

		$dto = RegisterInsituTestDTO::fromArray($data);

		$this->assertSame('gm1', $dto->geomanifestationId);
		$this->assertSame('Prueba In-Situ Alfa', $dto->insituTestName);
		$this->assertSame(95.5, $dto->temperature);
		$this->assertSame(1000.5, $dto->conductivity);
		$this->assertSame(7.2, $dto->ph);
		$this->assertSame('In-situ test', $dto->description);
	}

	public function testFromArrayWithMinimumData(): void
	{
		$data = [
			'geomanifestation_id' => 'gm1',
			'insitu_test_name' => 'Prueba Minima'
		];

		$dto = RegisterInsituTestDTO::fromArray($data);

		$this->assertSame('gm1', $dto->geomanifestationId);
		$this->assertSame('Prueba Minima', $dto->insituTestName);
		$this->assertSame(0.0, $dto->temperature);
		$this->assertSame(0.0, $dto->conductivity);
		$this->assertSame(0.0, $dto->ph);
		$this->assertNull($dto->description);
	}

	public function testFromArrayThrowsExceptionForMissingGeomanifestationId(
	): void
	{
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);

		RegisterInsituTestDTO::fromArray([
			'insitu_test_name' => 'Prueba',
			'temperature' => 95.5
		]);
	}

	public function testFromArrayThrowsExceptionForEmptyGeomanifestationId(): void
	{
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);

		RegisterInsituTestDTO::fromArray([
			'geomanifestation_id' => '',
			'insitu_test_name' => 'Prueba'
		]);
	}

	public function testFromArrayThrowsExceptionForMissingInsituTestName(): void
	{
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);

		RegisterInsituTestDTO::fromArray([
			'geomanifestation_id' => 'gm1'
		]);
	}

	public function testValidatePassesWithValidData(): void
	{
		$dto = new RegisterInsituTestDTO('gm1', 'Prueba Valida', 95.5, 1000.5, 7.2, 'desc');
		$this->expectNotToPerformAssertions();
		$dto->validate();
	}

	public function testValidatePassesWithMinimumData(): void
	{
		$dto = new RegisterInsituTestDTO('gm1', 'Prueba Min');
		$this->expectNotToPerformAssertions();
		$dto->validate();
	}

	public function testValidateThrowsExceptionForEmptyGeomanifestationId(): void
	{
		$dto = new RegisterInsituTestDTO('   ', 'Prueba');
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForEmptyInsituTestName(): void
	{
		$dto = new RegisterInsituTestDTO('gm1', '   ');
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForInsituTestNameTooLong(): void
	{
		$dto = new RegisterInsituTestDTO('gm1', str_repeat('a', 56));
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidatePassesWithInsituTestNameMaxLength(): void
	{
		$dto = new RegisterInsituTestDTO('gm1', str_repeat('a', 55));
		$this->expectNotToPerformAssertions();
		$dto->validate();
	}

	public function testValidateThrowsExceptionForTemperatureOutOfRange(): void
	{
		$dto = new RegisterInsituTestDTO('gm1', 'Prueba', 201.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeConductivity(): void
	{
		$dto = new RegisterInsituTestDTO('gm1', 'Prueba', null, -10.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForPhOutOfRange(): void
	{
		$dto = new RegisterInsituTestDTO('gm1', 'Prueba', null, null, 15.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}
}