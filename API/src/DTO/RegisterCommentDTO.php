<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for creating a new comment on an entity.
 */
final class RegisterCommentDTO
{
  public const ALLOWED_ENTITY_TYPES = ['field_trip', 'request', 'geomanifestation'];

  /**
   * @param string $commentText Comment text (required, max 500 chars)
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
   * Validates DTO properties and entity type.
   *
   * @param string|null $entityType
   * @throws ApiException
   */
  public function validate(?string $entityType = null): void
  {
    if (strlen($this->commentText) > 500) {
      throw new ApiException(ErrorType::invalidField('comment_text (max 500 characters)'), 422);
    }

    if ($entityType !== null && !in_array($entityType, self::ALLOWED_ENTITY_TYPES, true)) {
      throw new ApiException(ErrorType::invalidField('entity_type. Allowed: field_trip, request, geomanifestation'), 422);
    }
  }
}
