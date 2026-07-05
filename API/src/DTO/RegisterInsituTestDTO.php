<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for creating a new in-situ test.
 * Only geomanifestationId is required; all other fields are optional.
 */
final class RegisterInsituTestDTO
{
  /**
   * @param string $geomanifestationId ID of the associated geothermal manifestation (required)
   * @param float|null $temperature Temperature in °C (range: 0‑200)
   * @param float|null $conductivity Electrical conductivity in µS/cm (must be ≥ 0)
   * @param float|null $ph pH value (range: 0‑14)
   * @param string|null $description Additional notes
   */
  public function __construct(
    public string $geomanifestationId,
    public ?float $temperature = null,
    public ?float $conductivity = null,
    public ?float $ph = null,
    public ?string $description = null,
  ) {}

  /**
   * Creates DTO from HTTP request payload.
   *
   * @param array<string,mixed> $data
   * @return self
   * @throws ApiException When required field is missing
   */
  public static function fromArray(array $data): self
  {
    if (empty($data['geomanifestation_id'])) {
      throw new ApiException(
        ErrorType::missingField('geomanifestation_id'), 422
      );
    }

    return new self(
      geomanifestationId : trim((string)$data['geomanifestation_id']),
      temperature : isset($data['temperature']) ? (float)$data['temperature']
        : 0,
      conductivity : isset($data['conductivity']) ? (float)$data['conductivity'] : 0,
      ph : isset($data['ph']) ? (float)$data['ph'] : 0,
      description : $data['description'] ?? null,
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
    if ($this->temperature !== null && ($this->temperature < 0 || $this->temperature > 200)) {
      throw new ApiException(
        ErrorType::invalidField('temperature (must be between 0 and 200)'), 422
      );
    }
    if ($this->conductivity !== null && $this->conductivity < 0) {
      throw new ApiException(
        ErrorType::invalidField('conductivity (must be >= 0)'), 422
      );
    }
    if ($this->ph !== null && ($this->ph < 0 || $this->ph > 14)) {
      throw new ApiException(
        ErrorType::invalidField('pH (must be between 0 and 14)'), 422
      );
    }
  }
}