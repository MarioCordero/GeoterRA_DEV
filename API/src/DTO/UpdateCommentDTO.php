<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for updating an existing comment.
 */
final class UpdateCommentDTO
{
  /**
   * @param string $commentText Updated comment text (required, max 500 chars)
   */
  public function __construct(
    public string $commentText
  ) {}

  /**
   * Creates DTO from array payload.
   *
   * @param array<string,mixed> $data
   * @return self
   * @throws ApiException
   */
  public static function fromArray(array $data): self
  {
    if (!isset($data['comment_text']) || trim((string)$data['comment_text']) === '') {
      throw new ApiException(ErrorType::missingField('comment_text'), 422);
    }

    return new self(
      commentText: trim((string)$data['comment_text'])
    );
  }

  /**
   * Validates DTO properties.
   *
   * @throws ApiException
   */
  public function validate(): void
  {
    if (strlen($this->commentText) > 500) {
      throw new ApiException(ErrorType::invalidField('comment_text (max 500 characters)'), 422);
    }
  }
}
