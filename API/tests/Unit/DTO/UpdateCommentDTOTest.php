<?php
declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\UpdateCommentDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class UpdateCommentDTOTest extends TestCase
{
  public function testFromArrayWithValidData(): void
  {
    $data = [
      'comment_text' => 'Comentario editado correctamente.',
    ];

    $dto = UpdateCommentDTO::fromArray($data);
    $this->assertSame('Comentario editado correctamente.', $dto->commentText);
  }

  public function testFromArrayThrowsOnMissingText(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    UpdateCommentDTO::fromArray([]);
  }

  public function testFromArrayThrowsOnEmptyText(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    UpdateCommentDTO::fromArray(['comment_text' => '   ']);
  }

  public function testValidateThrowsOnLongText(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = new UpdateCommentDTO(commentText: str_repeat('E', 501));
    $dto->validate();
  }
}
