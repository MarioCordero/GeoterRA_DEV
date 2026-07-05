<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for creating a new geothermal report.
 * All fields except geomanifestationId, insituTestId and inlabTestId are optional.
 */
final class RegisterGeoreportDTO
{
  /**
   * @param string $geomanifestationId ID of the associated manifestation (required)
   * @param string $insituTestId ID of the in-situ test (required)
   * @param string $inlabTestId ID of the in-lab test (required)
   * @param string|null $details Additional notes (max 500 chars)
   */
  public function __construct(
    public string $geomanifestationId,
    public string $insituTestId,
    public string $inlabTestId,
    public ?string $details = null,
  ) {}

  /**
   * Creates DTO from HTTP request payload.
   *
   * @param array<string,mixed> $data
   * @return self
   * @throws ApiException When required fields are missing
   */
  public static function fromArray(array $data): self
  {
    $required = ['geomanifestation_id', 'insitu_test_id', 'inlab_test_id'];
    foreach ($required as $field) {
      if (empty($data[$field])) {
        throw new ApiException(ErrorType::missingField($field), 422);
      }
    }

    return new self(
      geomanifestationId : trim((string)$data['geomanifestation_id']),
      insituTestId : trim((string)$data['insitu_test_id']),
      inlabTestId : trim((string)$data['inlab_test_id']),
      details : $data['details'] ?? null,
    );
  }

  /**
   * Validates business rules for creation.
   *
   * @throws ApiException
   */
  public function validate(): void
  {
    if (trim($this->geomanifestationId) === '') {
      throw new ApiException(
        ErrorType::invalidField('geomanifestation_id'), 422
      );
    }
    if (trim($this->insituTestId) === '') {
      throw new ApiException(ErrorType::invalidField('insitu_test_id'), 422);
    }
    if (trim($this->inlabTestId) === '') {
      throw new ApiException(ErrorType::invalidField('inlab_test_id'), 422);
    }
    if ($this->details !== null && strlen($this->details) > 500) {
      throw new ApiException(
        ErrorType::invalidField('details (max 500 characters)'), 422
      );
    }
  }
}