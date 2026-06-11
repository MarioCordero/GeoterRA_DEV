<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for geothermal reports (georeports table).
 */
final class GeoreportDTO
{
  public function __construct(
    public ?string $georeportId,
    public string $geomanifestationId,
    public string $insituTestId,
    public string $inlabTestId,
    public ?string $details,
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
    $required = ['geomanifestation_id', 'insitu_test_id', 'inlab_test_id'];
    foreach ($required as $field) {
      if (!isset($data[$field]) || trim($data[$field]) === '') {
        throw new ApiException(ErrorType::missingField($field), 422);
      }
    }

    return new self(
      null,
      trim($data['geomanifestation_id']),
      trim($data['insitu_test_id']),
      trim($data['inlab_test_id']),
      $data['details'] ?? null
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
      $row['georeport_id'] ?? null,
      $row['geomanifestation_id'],
      $row['insitu_test_id'],
      $row['inlab_test_id'],
      $row['details'] ?? null,
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
    if (trim($this->insituTestId) === '') {
      throw new ApiException(ErrorType::invalidField('insitu_test_id'), 422);
    }
    if (trim($this->inlabTestId) === '') {
      throw new ApiException(ErrorType::invalidField('inlab_test_id'), 422);
    }
    if ($this->details !== null && strlen($this->details) > 500) {
      throw new ApiException(ErrorType::invalidField('details (max 500 characters)'), 422);
    }
  }
}