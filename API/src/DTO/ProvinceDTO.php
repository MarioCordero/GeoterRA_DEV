<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for a Province.
 */
final class ProvinceDTO
{
  public function __construct(
    public ?string $provinceId,
    public int $provinceSnitCode,
    public string $provinceName,
    public ?string $createdBy = null,
    public ?string $createdAt = null
  ) {}

  /**
   * Creates a ProvinceDTO from HTTP request payload (for creation or full update).
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
    if (!isset($data['province_name']) || trim($data['province_name']) === '') {
      throw new ApiException(ErrorType::missingField('province_name'), 422);
    }

    return new self(
      null,
      (int) $data['province_snit_code'],
      trim($data['province_name'])
    );
  }

  /**
   * Creates a ProvinceDTO from database row.
   *
   * @param array $row
   * @return self
   */
  public static function fromDatabase(array $row): self
  {
    return new self(
      $row['province_id'] ?? null,
      (int) $row['province_snit_code'],
      $row['province_name'],
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
    if (trim($this->provinceName) === '') {
      throw new ApiException(ErrorType::invalidField('province_name'), 422);
    }
    if (strlen($this->provinceName) > 55) {
      throw new ApiException(ErrorType::invalidField('province_name (max 55 characters)'), 422);
    }
  }
}