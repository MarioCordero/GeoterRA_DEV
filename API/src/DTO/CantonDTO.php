<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for a Canton.
 */
final class CantonDTO
{
  public function __construct(
    public ?string $cantonId,
    public int $provinceSnitCode,
    public int $cantonSnitCode,
    public string $cantonName,
    public ?string $createdBy = null,
    public ?string $createdAt = null
  ) {}

  /**
   * Creates a CantonDTO from HTTP request payload.
   *
   * @param array $data
   * @return self
   * @throws ApiException
   */
  public static function fromArray(array $data): self
  {
    if (!isset($data['province_snit_code']) || !is_numeric($data['province_snit_code'])) {
      throw new ApiException(ErrorType::missingField('province_snit_code'), 422);
    }
    if (!isset($data['canton_snit_code']) || !is_numeric($data['canton_snit_code'])) {
      throw new ApiException(ErrorType::missingField('canton_snit_code'), 422);
    }
    if (!isset($data['canton_name']) || trim($data['canton_name']) === '') {
      throw new ApiException(ErrorType::missingField('canton_name'), 422);
    }

    return new self(
      null,
      (int) $data['province_snit_code'],
      (int) $data['canton_snit_code'],
      trim($data['canton_name'])
    );
  }

  /**
   * Creates a CantonDTO from database row.
   *
   * @param array $row
   * @return self
   * @throws ApiException
   */
  public static function fromDatabase(array $row): self
  {
    return new self(
      $row['canton_id'] ?? null,
      (int) $row['province_snit_code'],
      (int) $row['canton_snit_code'],
      $row['canton_name'],
      $row['created_by'] ?? null,
      $row['created_at'] ?? null
    );
  }

  /**
   * Validates business rules.
   *
   * @throws ApiException
   */
  public function validate(): void
  {
    if ($this->provinceSnitCode <= 0) {
      throw new ApiException(ErrorType::invalidField('province_snit_code'), 422);
    }
    if ($this->cantonSnitCode <= 0) {
      throw new ApiException(ErrorType::invalidField('canton_snit_code'), 422);
    }
    if (trim($this->cantonName) === '') {
      throw new ApiException(ErrorType::invalidField('canton_name'), 422);
    }
    if (strlen($this->cantonName) > 55) {
      throw new ApiException(ErrorType::invalidField('canton_name (max 55 characters)'), 422);
    }
  }
}