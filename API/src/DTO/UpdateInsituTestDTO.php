<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for updating an existing in-situ test.
 * All fields are optional – only provided fields will be updated.
 */
final class UpdateInsituTestDTO
{
  /**
   * @param float|null $temperature New temperature in °C
   * @param float|null $conductivity New conductivity in µS/cm
   * @param float|null $ph New pH value
   * @param string|null $description New description
   */
  public function __construct(
    public ?float $temperature = null,
    public ?float $conductivity = null,
    public ?float $ph = null,
    public ?string $description = null,
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
      temperature : isset($data['temperature']) ? (float)$data['temperature'] : null,
      conductivity : isset($data['conductivity']) ? (float)$data['conductivity'] : null,
      ph : isset($data['ph']) ? (float)$data['ph'] : null,
      description : $data['description'] ?? null,
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
    if ($this->temperature !== null) {
      $update['temperature'] = $this->temperature;
    }
    if ($this->conductivity !== null) {
      $update['conductivity'] = $this->conductivity;
    }
    if ($this->ph !== null) {
      $update['ph'] = $this->ph;
    }
    if ($this->description !== null) {
      $update['description'] = $this->description;
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
    if ($this->temperature !== null
        && ($this->temperature < 0 || $this->temperature > 200)) {
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