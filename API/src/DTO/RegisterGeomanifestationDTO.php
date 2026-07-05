<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for creating a new geothermal manifestation.
 * All fields except name, latitude, longitude are optional.
 */
final class RegisterGeomanifestationDTO
{
  /**
   * @param string $name Manifestation name (required)
   * @param float $latitude Latitude (required)
   * @param float $longitude Longitude (required)
   * @param int|null $provinceSnitCode SNIT code of province
   * @param int|null $cantonSnitCode SNIT code of canton
   * @param int|null $districtSnitCode SNIT code of district
   * @param string|null $currentGeoreportId Associated georeport ID
   * @param string|null $description Description text
   * @param bool $visibility Whether visible to public (default false)
   */
  public function __construct(
    public string $name,
    public float $latitude,
    public float $longitude,
    public ?int $provinceSnitCode = null,
    public ?int $cantonSnitCode = null,
    public ?int $districtSnitCode = null,
    public ?string $description = null,
    public ?string $currentGeoreportId = null,
    public bool $visibility = false
  ) {}

  /**
   * Creates DTO from HTTP request payload.
   *
   * @param array<string,mixed> $data
   * @return self
   * @throws ApiException When required fields missing
   */
  public static function fromArray(array $data): self
  {
    if (!isset($data['name']) || trim((string)$data['name']) === '') {
      throw new ApiException(ErrorType::missingField('name'), 422);
    }
    if (!isset($data['latitude']) || !is_numeric($data['latitude'])) {
      throw new ApiException(ErrorType::missingField('latitude'), 422);
    }
    if (!isset($data['longitude']) || !is_numeric($data['longitude'])) {
      throw new ApiException(ErrorType::missingField('longitude'), 422);
    }

    return new self(
      name : trim((string)$data['name']),
      latitude : (float)$data['latitude'],
      longitude : (float)$data['longitude'],
      provinceSnitCode : isset($data['province_snit_code']) ? (int)$data['province_snit_code'] : null,
      cantonSnitCode : isset($data['canton_snit_code']) ? (int)$data['canton_snit_code'] : null,
      districtSnitCode : isset($data['district_snit_code']) ? (int)$data['district_snit_code'] : null,
      description : $data['description'] ?? null,
      currentGeoreportId : $data['current_georeport_id'] ?? null,
      visibility : isset($data['visibility']) ? (bool)$data['visibility'] : false
    );
  }

  /**
   * Converts DTO to an array suitable for database insertion.
   *
   * @return array<string,mixed>
   */
  public function toArray(): array
  {
    return [
      'name' => $this->name,
      'latitude' => $this->latitude,
      'longitude' => $this->longitude,
      'province_snit_code' => $this->provinceSnitCode,
      'canton_snit_code' => $this->cantonSnitCode,
      'district_snit_code' => $this->districtSnitCode,
      'current_georeport_id' => $this->currentGeoreportId,
      'description' => $this->description,
      'visibility' => $this->visibility ? 1 : 0,
    ];
  }

  /**
   * Validates business rules for creation.
   *
   * @throws ApiException
   */
  public function validate(): void
  {
    if (strlen($this->name) > 255) {
      throw new ApiException(ErrorType::invalidField('name (max 255 characters)'), 422);
    }
    if ($this->latitude < -90 || $this->latitude > 90) {
      throw new ApiException(ErrorType::invalidField('latitude'), 422);
    }
    if ($this->longitude < -180 || $this->longitude > 180) {
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