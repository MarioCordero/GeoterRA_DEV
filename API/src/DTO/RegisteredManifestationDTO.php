<?php
// src/DTO/RegisteredManifestationDTO.php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for Registered Geothermal Manifestations
 */
final class RegisteredManifestationDTO
{
  public function __construct(
    public string $name,
    public string $region,
    public float $latitude,
    public float $longitude,
    public ?string $description,
    public ?float $temperature,
    public ?float $field_pH,
    public ?float $field_conductivity,
    public ?float $lab_pH,
    public ?float $lab_conductivity,
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
    public ?float $mg
  ) {}

  

  /**
   * Validate domain rules
   */
  public function validate(): void
  { 
    if (trim($this->name) === '') {
      throw new ApiException(ErrorType::invalidField('name'));
    }

    if ($this->region !== 'all' && !AllowedRegions::isValid($this->region)) {
      throw new ApiException(ErrorType::invalidRegion(region: $this->region), 422);
    }

    if ($this->latitude < -90 || $this->latitude > 90) {
      throw new ApiException(ErrorType::invalidField('latitude'));
    }

    if ($this->longitude < -180 || $this->longitude > 180) {
      throw new ApiException(ErrorType::invalidField('longitude'));
    }
  }

  /**
   * Build DTO from HTTP body
   */
  public static function fromArray(array $data): self
  {

    // Required fields presence checks
    if (!array_key_exists('name', $data) || trim((string) $data['name']) === '') {
      throw new ApiException(ErrorType::missingField('name'), 422);
    }
    if (!array_key_exists('region', $data) || trim((string) $data['region']) === '') {
      throw new ApiException(ErrorType::missingField('region'), 422);
    }
    if (!array_key_exists('latitude', $data)) {
      throw new ApiException(ErrorType::missingField('latitude'), 422);
    }
    if (!array_key_exists('longitude', $data)) {
      throw new ApiException(ErrorType::missingField('longitude'), 422);
    }

    return new self(
      trim((string) $data['name']),
      trim((string) $data['region']),
      (float) $data['latitude'],
      (float) $data['longitude'],
      $data['description'] ?? null,
      isset($data['temperature']) ? (float) $data['temperature'] : null,
      isset($data['field_pH']) ? (float) $data['field_pH'] : null,
      isset($data['field_conductivity']) ? (float) $data['field_conductivity'] : null,
      isset($data['lab_pH']) ? (float) $data['lab_pH'] : null,
      isset($data['lab_conductivity']) ? (float) $data['lab_conductivity'] : null,
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
      isset($data['mg']) ? (float) $data['mg'] : null
    );
  }
}
