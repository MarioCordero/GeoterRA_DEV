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
    return new self(
      provinceSnitCode: isset($data['province_snit_code']) ? (int)$data['province_snit_code'] : null,
      cantonSnitCode: isset($data['canton_snit_code']) ? (int)$data['canton_snit_code'] : null,
      districtSnitCode: isset($data['district_snit_code']) ? (int)$data['district_snit_code'] : null,
      currentUsage: isset($data['current_usage']) ? (string)$data['current_usage'] : null,
      temperatureSensation: isset($data['temperature_sensation']) ? (string)$data['temperature_sensation'] : null,
      ownerName: isset($data['owner_name']) ? trim((string)$data['owner_name']) : null,
      ownerPhoneNumber: $data['owner_phone_number'] ?? null,
      ownerEmail: $data['owner_email'] ?? null,
      bubbles: isset($data['bubbles']) ? (bool)$data['bubbles'] : null,
      details: $data['details'] ?? null,
      exactAddress: $data['exact_address'] ?? null,
      latitude: isset($data['latitude']) ? (float)$data['latitude'] : null,
      longitude: isset($data['longitude']) ? (float)$data['longitude'] : null,
      relationWithOwner: $data['relation_with_owner'] ?? null
    );
  }

  /**
   * Returns an array with only the fields that should be updated.
   * Excludes null values; includes false for bubbles if provided.
   *
   * @return array<string,mixed>
   */
  public function toArray(): array
  {
    $update = [];

    if ($this->provinceSnitCode !== null) {
      $update['province_snit_code'] = $this->provinceSnitCode;
    }
    if ($this->cantonSnitCode !== null) {
      $update['canton_snit_code'] = $this->cantonSnitCode;
    }
    if ($this->districtSnitCode !== null) {
      $update['district_snit_code'] = $this->districtSnitCode;
    }
    if ($this->currentUsage !== null) {
      $update['current_usage'] = $this->currentUsage;
    }
    if ($this->temperatureSensation !== null) {
      $update['temperature_sensation'] = $this->temperatureSensation;
    }
    if ($this->ownerName !== null) {
      $update['owner_name'] = $this->ownerName;
    }
    if ($this->ownerPhoneNumber !== null) {
      $update['owner_phone_number'] = $this->ownerPhoneNumber;
    }
    if ($this->ownerEmail !== null) {
      $update['owner_email'] = $this->ownerEmail;
    }
    if ($this->bubbles !== null) {
      $update['bubbles'] = $this->bubbles ? 1 : 0;
    }
    if ($this->details !== null) {
      $update['details'] = $this->details;
    }
    if ($this->exactAddress !== null) {
      $update['exact_address'] = $this->exactAddress;
    }
    if ($this->latitude !== null) {
      $update['latitude'] = $this->latitude;
    }
    if ($this->longitude !== null) {
      $update['longitude'] = $this->longitude;
    }
    if ($this->relationWithOwner !== null) {
      $update['relation_with_owner'] = $this->relationWithOwner;
    }

    return $update;
  }

  /**
   * Validates business rules for the fields that are being updated.
   *
   * @param array<string,mixed> $userData Authenticated user data (not used in validation anymore, kept for signature compatibility)
   * @throws ApiException
   */
  public function validate(array $userData): void
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