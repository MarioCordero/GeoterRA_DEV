<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for in-situ tests (insitu_tests table).
 */
final class InsituTestDTO
{
  public function __construct(
    public ?string $insituTestId,
    public string  $geomanifestationId,
    public ?float  $temperature,
    public ?float  $conductivity,
    public ?float  $ph,
    public ?string $description,
    public ?string $createdBy = null,
    public ?string $createdAt = null
  )
  {
  }

  /**
   * Creates DTO from HTTP request payload.
   *
   * @param array $data
   * @return self
   * @throws ApiException
   */
  public static function fromArray(array $data): self
  {
    if (!isset($data['geomanifestation_id']) || trim($data['geomanifestation_id']) === '') {
      throw new ApiException(ErrorType::missingField('geomanifestation_id'), 422);
    }

    return new self(
      null,
      trim($data['geomanifestation_id']),
      isset($data['temperature']) ? (float)$data['temperature'] : null,
      isset($data['conductivity']) ? (float)$data['conductivity'] : null,
      isset($data['ph']) ? (float)$data['ph'] : null,
      $data['description'] ?? null
    );
  }

  /**
   * Creates DTO from database row.
   *
   * @param array $row
   * @return self
   */
  public static function fromDatabase(array $row): self
  {
    return new self(
      $row['insitu_test_id'] ?? null,
      $row['geomanifestation_id'],
      isset($row['temperature']) ? (float)$row['temperature'] : null,
      isset($row['conductivity']) ? (float)$row['conductivity'] : null,
      isset($row['ph']) ? (float)$row['ph'] : null,
      $row['description'] ?? null,
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
    if (trim($this->geomanifestationId) === '') {
      throw new ApiException(ErrorType::invalidField('geomanifestation_id'), 422);
    }
    if ($this->temperature !== null && ($this->temperature < 0 || $this->temperature > 200)) {
      throw new ApiException(ErrorType::invalidField('temperature (must be between -273.15 and 200)'), 422);
    }
    if ($this->conductivity !== null && ($this->conductivity < 0 || $this->conductivity > 100000)) {
      throw new ApiException(ErrorType::invalidField('conductivity (must be >= 0)'), 422);
    }
    if ($this->ph !== null && ($this->ph < 0 || $this->ph > 14)) {
      throw new ApiException(ErrorType::invalidField('pH (must be between 0 and 14)'), 422);
    }
  }
}