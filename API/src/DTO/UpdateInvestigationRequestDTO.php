<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for updating an existing investigation request.
 * All fields are optional – only provided fields will be updated.
 */
final class UpdateInvestigationRequestDTO
{
  /** @var string[] List of field names (snake_case) that were explicitly set via fromArray */
  private array $setFields = [];

  /**
   * @param int|null $provinceSnitCode New province SNIT code
   * @param int|null $cantonSnitCode New canton SNIT code
   * @param int|null $districtSnitCode New district SNIT code
   * @param string|null $currentUsage New current usage
   * @param string|null $temperatureSensation New temperature sensation
   * @param string|null $ownerName New owner name
   * @param string|null $ownerPhoneNumber New owner phone number
   * @param string|null $ownerEmail New owner email
   * @param bool|null $bubbles New bubbles flag
   * @param string|null $details New details
   * @param string|null $exactAddress New exact address
   * @param float|null $latitude New latitude
   * @param float|null $longitude New longitude
   * @param string|null $relationWithOwner New relation with owner
   */
  public function __construct(
    public ?int $provinceSnitCode = null,
    public ?int $cantonSnitCode = null,
    public ?int $districtSnitCode = null,
    public ?string $currentUsage = null,
    public ?string $temperatureSensation = null,
    public ?string $ownerName = null,
    public ?string $ownerPhoneNumber = null,
    public ?string $ownerEmail = null,
    public ?bool $bubbles = null,
    public ?string $details = null,
    public ?string $exactAddress = null,
    public ?float $latitude = null,
    public ?float $longitude = null,
    public ?string $relationWithOwner = null,
  ) {}

  /**
   * Creates DTO from HTTP request payload (only fields that exist in the array).
   *
   * @param array<string,mixed> $data
   * @return self
   */
  public static function fromArray(array $data): self
  {
    $dto = new self();
    $dto->setFields = [];

    if (array_key_exists('province_snit_code', $data)) {
      $dto->provinceSnitCode = $data['province_snit_code'] !== null ? (int)$data['province_snit_code'] : null;
      $dto->setFields[] = 'province_snit_code';
    }
    if (array_key_exists('canton_snit_code', $data)) {
      $dto->cantonSnitCode = $data['canton_snit_code'] !== null ? (int)$data['canton_snit_code'] : null;
      $dto->setFields[] = 'canton_snit_code';
    }
    if (array_key_exists('district_snit_code', $data)) {
      $dto->districtSnitCode = $data['district_snit_code'] !== null ? (int)$data['district_snit_code'] : null;
      $dto->setFields[] = 'district_snit_code';
    }
    if (array_key_exists('current_usage', $data)) {
      $dto->currentUsage = $data['current_usage'] !== null ? (string)$data['current_usage'] : null;
      $dto->setFields[] = 'current_usage';
    }
    if (array_key_exists('temperature_sensation', $data)) {
      $dto->temperatureSensation = $data['temperature_sensation'] !== null ? (string)$data['temperature_sensation'] : null;
      $dto->setFields[] = 'temperature_sensation';
    }
    if (array_key_exists('owner_name', $data)) {
      $dto->ownerName = $data['owner_name'] !== null ? trim((string)$data['owner_name']) : null;
      $dto->setFields[] = 'owner_name';
    }
    if (array_key_exists('owner_phone_number', $data)) {
      $dto->ownerPhoneNumber = $data['owner_phone_number'] !== null ? (string)$data['owner_phone_number'] : null;
      $dto->setFields[] = 'owner_phone_number';
    }
    if (array_key_exists('owner_email', $data)) {
      $dto->ownerEmail = $data['owner_email'] !== null ? (string)$data['owner_email'] : null;
      $dto->setFields[] = 'owner_email';
    }
    if (array_key_exists('bubbles', $data)) {
      $dto->bubbles = $data['bubbles'] !== null ? (bool)$data['bubbles'] : null;
      $dto->setFields[] = 'bubbles';
    }
    if (array_key_exists('details', $data)) {
      $dto->details = $data['details'] !== null ? (string)$data['details'] : null;
      $dto->setFields[] = 'details';
    }
    if (array_key_exists('exact_address', $data)) {
      $dto->exactAddress = $data['exact_address'] !== null ? (string)$data['exact_address'] : null;
      $dto->setFields[] = 'exact_address';
    }
    if (array_key_exists('latitude', $data)) {
      $dto->latitude = $data['latitude'] !== null ? (float)$data['latitude'] : null;
      $dto->setFields[] = 'latitude';
    }
    if (array_key_exists('longitude', $data)) {
      $dto->longitude = $data['longitude'] !== null ? (float)$data['longitude'] : null;
      $dto->setFields[] = 'longitude';
    }
    if (array_key_exists('relation_with_owner', $data)) {
      $dto->relationWithOwner = $data['relation_with_owner'] !== null ? (string)$data['relation_with_owner'] : null;
      $dto->setFields[] = 'relation_with_owner';
    }

    return $dto;
  }

  /**
   * Returns an array with only the fields that should be updated.
   * Excludes fields that were not explicitly set; includes null values for fields set to null.
   *
   * @return array<string,mixed>
   */
  public function toArray(): array
  {
    $update = [];
    $fieldMap = [
      'province_snit_code'     => 'provinceSnitCode',
      'canton_snit_code'       => 'cantonSnitCode',
      'district_snit_code'     => 'districtSnitCode',
      'current_usage'          => 'currentUsage',
      'temperature_sensation'  => 'temperatureSensation',
      'owner_name'             => 'ownerName',
      'owner_phone_number'     => 'ownerPhoneNumber',
      'owner_email'            => 'ownerEmail',
      'bubbles'                => 'bubbles',
      'details'                => 'details',
      'exact_address'          => 'exactAddress',
      'latitude'               => 'latitude',
      'longitude'              => 'longitude',
      'relation_with_owner'    => 'relationWithOwner',
    ];

    foreach ($this->setFields as $fieldKey) {
      $property = $fieldMap[$fieldKey] ?? null;
      if ($property === null) {
        continue;
      }
      $value = $this->$property;
      if ($fieldKey === 'bubbles' && $value !== null) {
        $value = $value ? 1 : 0;
      }
      $update[$fieldKey] = $value;
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
    // SNIT codes must be positive if provided
    if ($this->provinceSnitCode !== null && $this->provinceSnitCode <= 0) {
      throw new ApiException(ErrorType::invalidField('province_snit_code'), 422);
    }
    if ($this->cantonSnitCode !== null && $this->cantonSnitCode <= 0) {
      throw new ApiException(ErrorType::invalidField('canton_snit_code'), 422);
    }
    if ($this->districtSnitCode !== null && $this->districtSnitCode <= 0) {
      throw new ApiException(ErrorType::invalidField('district_snit_code'), 422);
    }

    // Current usage enum
    if ($this->currentUsage !== null) {
      $validUsages = ['Residencial', 'Comercial', 'Turístico', 'Conservación', 'Ganadería', 'Otro'];
      if (!in_array($this->currentUsage, $validUsages, true)) {
        throw new ApiException(ErrorType::invalidField('current_usage'), 422);
      }
    }

    // Temperature sensation enum
    if ($this->temperatureSensation !== null) {
      $validTemps = ['Hirviendo', 'Muy Caliente', 'Caliente', 'Templado', 'Natural', 'Sin Especificar'];
      if (!in_array($this->temperatureSensation, $validTemps, true)) {
        throw new ApiException(ErrorType::invalidField('temperature_sensation'), 422);
      }
    }

    // Coordinates range (if provided)
    if ($this->latitude !== null && ($this->latitude < -90 || $this->latitude > 90)) {
      throw new ApiException(ErrorType::invalidField('latitude'), 422);
    }
    if ($this->longitude !== null && ($this->longitude < -180 || $this->longitude > 180)) {
      throw new ApiException(ErrorType::invalidField('longitude'), 422);
    }

    // Relation with owner: if provided, must be valid enum
    if ($this->relationWithOwner !== null) {
      $validRelations = ['Familiar', 'Empleado', 'Socio', 'Conocido', 'Titular'];
      if (!in_array($this->relationWithOwner, $validRelations, true)) {
        throw new ApiException(
          ErrorType::invalidField('relation_with_owner (must be Familiar, Empleado, Socio, Conocido, Titular)'),
          422
        );
      }

      // Only validate owner email and phone if relation is not 'Titular'
      if ($this->relationWithOwner !== 'Titular') {
        if ($this->ownerEmail !== null && !filter_var($this->ownerEmail, FILTER_VALIDATE_EMAIL)) {
          throw new ApiException(ErrorType::invalidField('owner_email'), 422);
        }
        if ($this->ownerPhoneNumber !== null && !preg_match('/^[0-9]{8}$|^[0-9]{4}-[0-9]{4}$/', $this->ownerPhoneNumber)) {
          throw new ApiException(
            ErrorType::invalidField('owner_phone_number (must be 8 digits or 1234-5678)'),
            422
          );
        }
      }
    }
  }
}