<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for in-lab tests (inlab_tests table).
 */
final class InlabTestDTO
{
  public function __construct(
    public ?string $inlabTestId,
    public string $geomanifestationId,
    public ?float $ph,
    public ?float $conductivity,
    public ?float $cl,
    public ?float $ca,
    public ?float $hco3,
    public ?float $so4,
    public ?float $fe,
    public ?float $si,
    public ?float $b,
    public ?float $li,
    public ?float $f,
    public ?float $na,
    public ?float $k,
    public ?float $mg,
    public ?string $description,
    public ?string $createdBy = null,
    public ?string $createdAt = null
  ) {}

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
      isset($data['ph']) ? (float) $data['ph'] : null,
      isset($data['conductivity']) ? (float) $data['conductivity'] : null,
      isset($data['cl']) ? (float) $data['cl'] : null,
      isset($data['ca']) ? (float) $data['ca'] : null,
      isset($data['hco3']) ? (float) $data['hco3'] : null,
      isset($data['so4']) ? (float) $data['so4'] : null,
      isset($data['fe']) ? (float) $data['fe'] : null,
      isset($data['si']) ? (float) $data['si'] : null,
      isset($data['b']) ? (float) $data['b'] : null,
      isset($data['li']) ? (float) $data['li'] : null,
      isset($data['f']) ? (float) $data['f'] : null,
      isset($data['na']) ? (float) $data['na'] : null,
      isset($data['k']) ? (float) $data['k'] : null,
      isset($data['mg']) ? (float) $data['mg'] : null,
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
      $row['inlab_test_id'] ?? null,
      $row['geomanifestation_id'],
      isset($row['ph']) ? (float) $row['ph'] : null,
      isset($row['conductivity']) ? (float) $row['conductivity'] : null,
      isset($row['cl']) ? (float) $row['cl'] : null,
      isset($row['ca']) ? (float) $row['ca'] : null,
      isset($row['hco3']) ? (float) $row['hco3'] : null,
      isset($row['so4']) ? (float) $row['so4'] : null,
      isset($row['fe']) ? (float) $row['fe'] : null,
      isset($row['si']) ? (float) $row['si'] : null,
      isset($row['b']) ? (float) $row['b'] : null,
      isset($row['li']) ? (float) $row['li'] : null,
      isset($row['f']) ? (float) $row['f'] : null,
      isset($row['na']) ? (float) $row['na'] : null,
      isset($row['k']) ? (float) $row['k'] : null,
      isset($row['mg']) ? (float) $row['mg'] : null,
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
    if ($this->ph !== null && ($this->ph < 0 || $this->ph > 14)) {
      throw new ApiException(ErrorType::invalidField('pH (must be between 0 and 14)'), 422);
    }
    if ($this->conductivity !== null && $this->conductivity < 0) {
      throw new ApiException(ErrorType::invalidField('conductivity (must be >= 0)'), 422);
    }
    // Additional numeric constraints for chemical parameters (non‑negative)
    $negativeFields = ['cl', 'ca', 'hco3', 'so4', 'fe', 'si', 'b', 'li', 'f', 'na', 'k', 'mg'];
    foreach ($negativeFields as $field) {
      if ($this->$field !== null && $this->$field < 0) {
        throw new ApiException(ErrorType::invalidField($field . ' (must be >= 0)'), 422);
      }
    }
  }
}