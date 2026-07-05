<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for updating an existing geothermal report.
 * All fields are optional – only provided fields will be updated.
 */
final class UpdateGeoreportDTO
{
  /**
   * @param string|null $insituTestId New in-situ test ID
   * @param string|null $inlabTestId New in-lab test ID
   * @param string|null $details New details
   */
  public function __construct(
    public ?string $insituTestId = null,
    public ?string $inlabTestId = null,
    public ?string $details = null,
  ) {}

  /**
   * Creates DTO from HTTP request payload (only fields that exist in the array).
   *
   * @param array<string,mixed> $data
   * @return self
   */
  public static function fromArray(array $data): self
  {
    return new self(
      insituTestId : isset($data['insitu_test_id']) ? trim(
        (string)$data['insitu_test_id']
      ) : null,
      inlabTestId : isset($data['inlab_test_id']) ? trim(
        (string)$data['inlab_test_id']
      ) : null,
      details : $data['details'] ?? null,
    );
  }

  /**
   * Returns an array with only the fields that should be updated.
   * Excludes null values.
   *
   * @return array<string,mixed>
   */
  public function toArray(): array
  {
    $update = [];
    if ($this->insituTestId !== null) {
      $update['insitu_test_id'] = $this->insituTestId;
    }
    if ($this->inlabTestId !== null) {
      $update['inlab_test_id'] = $this->inlabTestId;
    }
    if ($this->details !== null) {
      $update['details'] = $this->details;
    }
    return $update;
  }

  /**
   * Validates business rules for the fields that are being updated.
   *
   * @throws ApiException
   */
  public function validate(): void
  {
    if ($this->insituTestId !== null && trim($this->insituTestId) === '') {
      throw new ApiException(ErrorType::invalidField('insitu_test_id'), 422);
    }
    if ($this->inlabTestId !== null && trim($this->inlabTestId) === '') {
      throw new ApiException(ErrorType::invalidField('inlab_test_id'), 422);
    }
    if ($this->details !== null && strlen($this->details) > 500) {
      throw new ApiException(
        ErrorType::invalidField('details (max 500 characters)'), 422
      );
    }
  }
}