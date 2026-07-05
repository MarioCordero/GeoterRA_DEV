<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\UpdateInlabTestDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class UpdateInlabTestDTOTest extends TestCase
{
  public function testFromArrayWithValidData(): void
  {
    $data = [
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
      'description' => 'Updated lab test'
    ];

    $dto = UpdateInlabTestDTO::fromArray($data);

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
    $this->assertSame('Updated lab test', $dto->description);
  }

  public function testFromArrayWithPartialData(): void
  {
    $data = ['ph' => 7.2, 'conductivity' => 200.0];

    $dto = UpdateInlabTestDTO::fromArray($data);

    $this->assertSame(7.2, $dto->ph);
    $this->assertSame(200.0, $dto->conductivity);
    $this->assertNull($dto->cl);
    $this->assertNull($dto->description);
  }

  public function testFromArrayWithEmptyData(): void
  {
    $dto = UpdateInlabTestDTO::fromArray([]);

    $this->assertNull($dto->ph);
    $this->assertNull($dto->conductivity);
    $this->assertNull($dto->cl);
    $this->assertNull($dto->description);
  }

  public function testToArrayReturnsOnlyNonNullFields(): void
  {
    $dto = new UpdateInlabTestDTO(
      ph: 7.5,
      conductivity: null,
      cl: 10.0,
      ca: null,
      hco3: 30.0,
      so4: null,
      fe: 50.0,
      si: null,
      b: 70.0,
      li: null,
      f: 90.0,
      na: null,
      k: 110.0,
      mg: null,
      description: 'Desc'
    );

    $arr = $dto->toArray();

    $expected = [
      'ph' => 7.5,
      'cl' => 10.0,
      'hco3' => 30.0,
      'fe' => 50.0,
      'b' => 70.0,
      'f' => 90.0,
      'k' => 110.0,
      'description' => 'Desc'
    ];
    $this->assertSame($expected, $arr);
  }

  public function testToArrayReturnsEmptyArrayWhenNoFieldsSet(): void
  {
    $dto = new UpdateInlabTestDTO();
    $arr = $dto->toArray();
    $this->assertSame([], $arr);
  }

  public function testValidatePassesWithValidData(): void
  {
    $dto = new UpdateInlabTestDTO(7.5, 100.5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 'desc');
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidatePassesWithNullFields(): void
  {
    $dto = new UpdateInlabTestDTO();
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidateThrowsExceptionForPhOutOfRange(): void
  {
    $dto = new UpdateInlabTestDTO(ph: 15.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeConductivity(): void
  {
    $dto = new UpdateInlabTestDTO(conductivity: -10.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeCl(): void
  {
    $dto = new UpdateInlabTestDTO(cl: -5.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeCa(): void
  {
    $dto = new UpdateInlabTestDTO(ca: -5.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeHco3(): void
  {
    $dto = new UpdateInlabTestDTO(hco3: -5.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeSo4(): void
  {
    $dto = new UpdateInlabTestDTO(so4: -5.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeFe(): void
  {
    $dto = new UpdateInlabTestDTO(fe: -5.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeSi(): void
  {
    $dto = new UpdateInlabTestDTO(si: -5.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeB(): void
  {
    $dto = new UpdateInlabTestDTO(b: -5.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeLi(): void
  {
    $dto = new UpdateInlabTestDTO(li: -5.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeF(): void
  {
    $dto = new UpdateInlabTestDTO(f: -5.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeNa(): void
  {
    $dto = new UpdateInlabTestDTO(na: -5.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeK(): void
  {
    $dto = new UpdateInlabTestDTO(k: -5.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeMg(): void
  {
    $dto = new UpdateInlabTestDTO(mg: -5.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }
}