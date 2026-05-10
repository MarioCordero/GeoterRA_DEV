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
    public int $region_id,
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
   * Validate domain rules for physical and chemical attributes
   * 
   * @throws ApiException
   */
  public function validate(): void
  { 
    // Validate core geographic fields
    if (trim($this->name) === '') {
      throw new ApiException(ErrorType::invalidField('name'), 422);
    }

    if ($this->latitude < -90 || $this->latitude > 90) {
      throw new ApiException(ErrorType::invalidField('latitud (debe estar entre -90 y 90)'), 422);
    }

    if ($this->longitude < -180 || $this->longitude > 180) {
      throw new ApiException(ErrorType::invalidField('longitud (debe estar entre -180 y 180)'), 422);
    }

    // Validate In Situ Physical Attributes
    if ($this->temperature !== null) {
      if ($this->temperature < 0 || $this->temperature > 250) {
        throw new ApiException(
          ErrorType::invalidField('temperatura (In Situ: debe estar entre 0-250°C)'),
          422
        );
      }
    }

    if ($this->field_pH !== null) {
      if ($this->field_pH < 0 || $this->field_pH > 14) {
        throw new ApiException(
          ErrorType::invalidField('pH en campo (In Situ: debe estar entre 0-14)'),
          422
        );
      }
    }

    if ($this->field_conductivity !== null) {
      if ($this->field_conductivity < 0) {
        throw new ApiException(
          ErrorType::invalidField('conductividad en campo (In Situ: debe ser ≥0 µS/cm)'),
          422
        );
      }
    }

    // Validate Laboratory Physical Attributes
    if ($this->lab_pH !== null) {
      if ($this->lab_pH < 0 || $this->lab_pH > 14) {
        throw new ApiException(
          ErrorType::invalidField('pH en laboratorio (Laboratorio: debe estar entre 0-14)'),
          422
        );
      }
    }

    if ($this->lab_conductivity !== null) {
      if ($this->lab_conductivity < 0) {
        throw new ApiException(
          ErrorType::invalidField('conductividad en laboratorio (Laboratorio: debe ser ≥0 µS/cm)'),
          422
        );
      }
    }

    // Validate Chemical Elements (all must be non-negative)
    $chemicalElements = [
      'cl' => 'Cl (Cloruros)',
      'ca' => 'Ca (Calcio)',
      'hco3' => 'HCO3 (Bicarbonatos)',
      'so4' => 'SO4 (Sulfatos)',
      'fe' => 'Fe (Hierro)',
      'si' => 'Si (Sílice)',
      'b' => 'B (Boro)',
      'li' => 'Li (Litio)',
      'f' => 'F (Fluoruro)',
      'na' => 'Na (Sodio)',
      'k' => 'K (Potasio)',
      'mg' => 'Mg (Magnesio)'
    ];

    foreach ($chemicalElements as $field => $label) {
      $value = $this->$field;
      if ($value !== null) {
        if ($value < 0) {
          throw new ApiException(
            ErrorType::invalidField("{$label} (debe ser ≥0)"),
            422
          );
        }
      }
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
    if (!array_key_exists('region_id', $data) || !is_numeric($data['region_id'])) {
      throw new ApiException(ErrorType::missingField('region_id'), 422);
    }
    if (!array_key_exists('latitude', $data)) {
      throw new ApiException(ErrorType::missingField('latitude'), 422);
    }
    if (!array_key_exists('longitude', $data)) {
      throw new ApiException(ErrorType::missingField('longitude'), 422);
    }

    return new self(
      trim((string) $data['name']),
      (int) $data['region_id'],
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