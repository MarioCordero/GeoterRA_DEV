<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for a District.
 */
final class DistrictDTO
{
  public function __construct(
    public ?string $districtId,
    public int $cantonSnitCode,
    public int $districtSnitCode,
    public string $districtName,
    public ?string $createdBy = null,
    public ?string $createdAt = null
  ) {}

  /**
   * Creates a DistrictDTO from HTTP request payload.
   *
   * @param array $data
   * @return self
   * @throws ApiException
   */
  public static function fromArray(array $data): self
  {
    if (!isset($data['canton_snit_code']) || !is_numeric($data['canton_snit_code'])) {
      throw new ApiException(ErrorType::missingField('canton_snit_code'), 422);
    }
    if (!isset($data['district_snit_code']) || !is_numeric($data['district_snit_code'])) {
      throw new ApiException(ErrorType::missingField('district_snit_code'), 422);
    }
    if (!isset($data['district_name']) || trim($data['district_name']) === '') {
      throw new ApiException(ErrorType::missingField('district_name'), 422);
    }

    return new self(
      null,
      (int) $data['canton_snit_code'],
      (int) $data['district_snit_code'],
      trim($data['district_name'])
    );
  }

  /**
   * Creates a District from database row.
   *
   * @param array $row
   * @return self
   * @throws ApiException
   */
  public static function fromDatabase(array $row): self
  {
    return new self(
      $row['district_id'] ?? null,
      (int) $row['canton_snit_code'],
      (int) $row['district_snit_code'],
      $row['district_name'],
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
    if ($this->cantonSnitCode <= 0) {
      throw new ApiException(ErrorType::invalidField('canton_snit_code'), 422);
    }
    if ($this->districtSnitCode <= 0) {
      throw new ApiException(ErrorType::invalidField('district_snit_code'), 422);
    }
    if (trim($this->districtName) === '') {
      throw new ApiException(ErrorType::invalidField('district_name'), 422);
    }
    if (strlen($this->districtName) > 55) {
      throw new ApiException(ErrorType::invalidField('district_name (max 55 characters)'), 422);
    }
  }
}