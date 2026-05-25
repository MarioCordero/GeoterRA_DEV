<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for updating an existing geothermal manifestation.
 * All fields are optional – only provided fields will be updated.
 */
final class UpdateGeomanifestationDTO
{
  /**
   * @param string|null $name New name
   * @param float|null $latitude New latitude
   * @param float|null $longitude New longitude
   * @param int|null $provinceSnitCode New province SNIT code
   * @param int|null $cantonSnitCode New canton SNIT code
   * @param int|null $districtSnitCode New district SNIT code
   * @param string|null $currentGeoreportId New georeport ID
   * @param string|null $description New description
   * @param bool|null $visibility New visibility (null means no change)
   */
  public function __construct(
    public ?string $name = null,
    public ?float $latitude = null,
    public ?float $longitude = null,
    public ?int $provinceSnitCode = null,
    public ?int $cantonSnitCode = null,
    public ?int $districtSnitCode = null,
    public ?string $currentGeoreportId = null,
    public ?string $description = null,
    public ?bool $visibility = null
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
      name: isset($data['name']) ? trim((string)$data['name']) : null,
      latitude: isset($data['latitude']) ? (float)$data['latitude'] : null,
      longitude: isset($data['longitude']) ? (float)$data['longitude'] : null,
      provinceSnitCode: isset($data['province_snit_code']) ? (int)$data['province_snit_code'] : null,
      cantonSnitCode: isset($data['canton_snit_code']) ? (int)$data['canton_snit_code'] : null,
      districtSnitCode: isset($data['district_snit_code']) ? (int)$data['district_snit_code'] : null,
      currentGeoreportId: $data['current_georeport_id'] ?? null,
      description: $data['description'] ?? null,
      visibility: isset($data['visibility']) ? (bool)$data['visibility'] : null
    );
  }

  /**
   * Returns an array with only the fields that should be updated.
   * Excludes null values, but includes false for visibility.
   *
   * @return array<string,mixed>
   */
  public function toUpdateArray(): array
  {
    $update = [];

    if ($this->name !== null) {
      $update['geomanifestation_name'] = $this->name;
    }
    if ($this->latitude !== null) {
      $update['latitude'] = $this->latitude;
    }
    if ($this->longitude !== null) {
      $update['longitude'] = $this->longitude;
    }
    if ($this->provinceSnitCode !== null) {
      $update['province_snit_code'] = $this->provinceSnitCode;
    }
    if ($this->cantonSnitCode !== null) {
      $update['canton_snit_code'] = $this->cantonSnitCode;
    }
    if ($this->districtSnitCode !== null) {
      $update['district_snit_code'] = $this->districtSnitCode;
    }
    if ($this->currentGeoreportId !== null) {
      $update['current_georeport_id'] = $this->currentGeoreportId;
    }
    if ($this->description !== null) {
      $update['description'] = $this->description;
    }
    if ($this->visibility !== null) {
      $update['visibility'] = $this->visibility ? 1 : 0;
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
    if ($this->name !== null && strlen($this->name) > 255) {
      throw new ApiException(ErrorType::invalidField('name (max 255 characters)'), 422);
    }
    if ($this->latitude !== null && ($this->latitude < -90 || $this->latitude > 90)) {
      throw new ApiException(ErrorType::invalidField('latitude'), 422);
    }
    if ($this->longitude !== null && ($this->longitude < -180 || $this->longitude > 180)) {
      throw new ApiException(ErrorType::invalidField('longitude'), 422);
    }
    if ($this->provinceSnitCode !== null && $this->provinceSnitCode <= 0) {
      throw new ApiException(ErrorType::invalidField('province_snit_code'), 422);
    }
    if ($this->cantonSnitCode !== null && $this->cantonSnitCode <= 0) {
      throw new ApiException(ErrorType::invalidField('canton_snit_code'), 422);
    }
    if ($this->districtSnitCode !== null && $this->districtSnitCode <= 0) {
      throw new ApiException(ErrorType::invalidField('district_snit_code'), 422);
    }
  }
}