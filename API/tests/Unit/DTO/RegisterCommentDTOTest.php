<?php
declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\RegisterCommentDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class RegisterCommentDTOTest extends TestCase
{
  public function testFromArrayWithValidData(): void
  {
    $data = [
      'comment_text' => 'Comentario de prueba sobre la gira.',
    ];

    $dto = RegisterCommentDTO::fromArray($data);
    $this->assertSame('Comentario de prueba sobre la gira.', $dto->commentText);
  }

  public function testFromArrayThrowsOnMissingText(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterCommentDTO::fromArray([]);
  }

  public function testFromArrayThrowsOnEmptyText(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterCommentDTO::fromArray(['comment_text' => '   ']);
  }

  public function testValidateThrowsOnLongText(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = new RegisterCommentDTO(commentText: str_repeat('C', 501));
    $dto->validate('field_trip');
  }

  public function testValidateThrowsOnInvalidEntityType(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = new RegisterCommentDTO(commentText: 'Texto válido');
    $dto->validate('invalid_entity');
  }
}
