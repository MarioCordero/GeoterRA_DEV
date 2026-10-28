<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\RegisterInlabTestDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class RegisterInlabTestDTOTest extends TestCase
{
	public function testFromArrayWithValidData(): void
	{
		$data = [
			'geomanifestation_id' => 'gm1',
			'inlab_test_name' => 'Prueba Lab Alfa',
			'ph' => 7.5,
			'conductivity' => 100.5,
			'cl' => 10,
			'ca' => 20,
			'hco3' => 30,
			'so4' => 40,
			'fe' => 50,
			'si' => 60,
			'b' => 70,
			'li' => 80,
			'f' => 90,
			'na' => 100,
			'k' => 110,
			'mg' => 120,
			'description' => 'Lab test'
		];

		$dto = RegisterInlabTestDTO::fromArray($data);

		$this->assertSame('gm1', $dto->geomanifestationId);
		$this->assertSame('Prueba Lab Alfa', $dto->inlabTestName);
		$this->assertSame(7.5, $dto->ph);
		$this->assertSame(100.5, $dto->conductivity);
		$this->assertSame(10.0, $dto->cl);
		$this->assertSame(20.0, $dto->ca);
		$this->assertSame(30.0, $dto->hco3);
		$this->assertSame(40.0, $dto->so4);
		$this->assertSame(50.0, $dto->fe);
		$this->assertSame(60.0, $dto->si);
		$this->assertSame(70.0, $dto->b);
		$this->assertSame(80.0, $dto->li);
		$this->assertSame(90.0, $dto->f);
		$this->assertSame(100.0, $dto->na);
		$this->assertSame(110.0, $dto->k);
		$this->assertSame(120.0, $dto->mg);
		$this->assertSame('Lab test', $dto->description);
	}

	public function testFromArrayWithMinimumData(): void
	{
		$data = [
			'geomanifestation_id' => 'gm1',
			'inlab_test_name' => 'Prueba Minima'
		];

		$dto = RegisterInlabTestDTO::fromArray($data);

		$this->assertSame('gm1', $dto->geomanifestationId);
		$this->assertSame('Prueba Minima', $dto->inlabTestName);
		$this->assertSame(0.0, $dto->ph);
		$this->assertSame(0.0, $dto->conductivity);
		$this->assertSame(0.0, $dto->cl);
		$this->assertNull($dto->description);
	}

	public function testFromArrayThrowsExceptionForMissingGeomanifestationId(): void
	{
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);

		RegisterInlabTestDTO::fromArray([
			'inlab_test_name' => 'Prueba',
			'ph' => 7.5
		]);
	}

	public function testFromArrayThrowsExceptionForEmptyGeomanifestationId(): void
	{
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);

		RegisterInlabTestDTO::fromArray([
			'geomanifestation_id' => '',
			'inlab_test_name' => 'Prueba'
		]);
	}

	public function testFromArrayThrowsExceptionForMissingInlabTestName(): void
	{
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);

		RegisterInlabTestDTO::fromArray([
			'geomanifestation_id' => 'gm1'
		]);
	}

	public function testValidatePassesWithValidData(): void
	{
		$dto = new RegisterInlabTestDTO(
			'gm1',
			'Prueba Valida',
			7.5,
			100.5,
			10,
			20,
			30,
			40,
			50,
			60,
			70,
			80,
			90,
			100,
			110,
			120,
			'desc'
		);
		$this->expectNotToPerformAssertions();
		$dto->validate();
	}

	public function testValidatePassesWithMinimumData(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba Min');
		$this->expectNotToPerformAssertions();
		$dto->validate();
	}

	public function testValidateThrowsExceptionForEmptyGeomanifestationId(): void
	{
		$dto = new RegisterInlabTestDTO('   ', 'Prueba');
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForEmptyInlabTestName(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', '   ');
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForInlabTestNameTooLong(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', str_repeat('a', 56));
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidatePassesWithInlabTestNameMaxLength(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', str_repeat('a', 55));
		$this->expectNotToPerformAssertions();
		$dto->validate();
	}

	public function testValidateThrowsExceptionForPhOutOfRange(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', 15.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeConductivity(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', null, -10.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeCl(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', null, null, -5.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeCa(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', null, null, null, -5.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeHco3(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', null, null, null, null, -5.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeSo4(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', null, null, null, null, null, -5.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeFe(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', null, null, null, null, null, null, -5.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeSi(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', null, null, null, null, null, null, null, -5.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeB(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', null, null, null, null, null, null, null, null, -5.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeLi(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', null, null, null, null, null, null, null, null, null, -5.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeF(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', null, null, null, null, null, null, null, null, null, null, -5.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeNa(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', null, null, null, null, null, null, null, null, null, null, null, -5.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeK(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', null, null, null, null, null, null, null, null, null, null, null, null, -5.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}

	public function testValidateThrowsExceptionForNegativeMg(): void
	{
		$dto = new RegisterInlabTestDTO('gm1', 'Prueba', null, null, null, null, null, null, null, null, null, null, null, null, null, -5.0);
		$this->expectException(ApiException::class);
		$this->expectExceptionCode(422);
		$dto->validate();
	}
}