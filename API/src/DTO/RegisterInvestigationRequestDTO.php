<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for creating a new investigation request.
 * All fields except province/canton/district SNIT codes and current_usage/temperature_sensation are optional.
 */
final class RegisterInvestigationRequestDTO
{
  /**
   * @param int $provinceSnitCode SNIT code of the province (required)
   * @param int $cantonSnitCode SNIT code of the canton (required)
   * @param int $districtSnitCode SNIT code of the district (required)
   * @param string $currentUsage Current land usage (enum: Residencial, Comercial, Turístico, Conservación, Ganadería, Otro) (required)
   * @param string $temperatureSensation Perceived temperature (enum: Hirviendo, Muy Caliente, Caliente, Templado, Natural, Sin Especificar) (required)
   * @param string|null $ownerName Name of the land owner (if different from requester)
   * @param string|null $ownerPhoneNumber Phone number of the owner (Costa Rican format)
   * @param string|null $ownerEmail Email of the owner
   * @param bool $bubbles Presence of gas bubbles (default false)
   * @param string|null $details Additional details
   * @param string|null $exactAddress Exact address text
   * @param float|null $latitude Latitude coordinate (decimal degrees)
   * @param float|null $longitude Longitude coordinate (decimal degrees)
   * @param string|null $relationWithOwner Relationship with owner (Familiar, Empleado, Socio, Conocido, Titular) – required if owner differs
   */
  public function __construct(
    public int $provinceSnitCode,
    public int $cantonSnitCode,
    public int $districtSnitCode,
    public string $currentUsage,
    public string $temperatureSensation,
    public ?string $ownerName = null,
    public ?string $ownerPhoneNumber = null,
    public ?string $ownerEmail = null,
    public bool $bubbles = false,
    public ?string $details = null,
    public ?string $exactAddress = null,
    public ?float $latitude = null,
    public ?float $longitude = null,
    public ?string $relationWithOwner = null,
  ) {}

  /**
   * Creates DTO from HTTP request payload.
   *
   * @param array<string,mixed> $data
   * @return self
   * @throws ApiException When required fields are missing or invalid
   */
  public static function fromArray(array $data): self
  {
    $required = [
      'province_snit_code',
      'canton_snit_code',
      'district_snit_code',
      'current_usage',
      'temperature_sensation'
    ];
    foreach ($required as $field) {
      if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
        throw new ApiException(ErrorType::missingField($field), 422);
      }
    }

    return new self(
      provinceSnitCode : (int)$data['province_snit_code'],
      cantonSnitCode : (int)$data['canton_snit_code'],
      districtSnitCode : (int)$data['district_snit_code'],
      currentUsage : (string)$data['current_usage'],
      temperatureSensation : (string)$data['temperature_sensation'],
      ownerName : isset($data['owner_name']) ? trim(
        (string)$data['owner_name']
      ) : null,
      ownerPhoneNumber : $data['owner_phone_number'] ?? null,
      ownerEmail : $data['owner_email'] ?? null,
      bubbles : isset($data['bubbles']) ? (bool)$data['bubbles'] : false,
      details : $data['details'] ?? null,
      exactAddress : $data['exact_address'] ?? null,
      latitude : isset($data['latitude']) ? (float)$data['latitude'] : null,
      longitude : isset($data['longitude']) ? (float)$data['longitude'] : null,
      relationWithOwner : $data['relation_with_owner'] ?? null
    );
  }

  /**
   * Validates business rules for creation.
   *
   * @param array<string,mixed> $userData Authenticated user data (keys: first_name, last_name, phone_number, email, user_id)
   * @throws ApiException
   */
  public function validate(array $userData): void
  {
    // SNIT codes must be positive
    if ($this->provinceSnitCode <= 0 || $this->cantonSnitCode <= 0 || $this->districtSnitCode <= 0) {
      throw new ApiException(
        ErrorType::invalidField(
          'province/canton/district SNIT code must be positive'
        ), 422
      );
    }

    // Current usage enum
    $validUsages = ['Residencial', 'Comercial', 'Turístico', 'Conservación', 'Ganadería', 'Otro'];
    if (!in_array($this->currentUsage, $validUsages, true)) {
      throw new ApiException(ErrorType::invalidField('current_usage'), 422);
    }

    // Temperature sensation enum
    $validTemps = ['Hirviendo', 'Muy Caliente', 'Caliente', 'Templado', 'Natural', 'Sin Especificar'];
    if (!in_array($this->temperatureSensation, $validTemps, true)) {
      throw new ApiException(
        ErrorType::invalidField('temperature_sensation'), 422
      );
    }

    // Owner email format (if provided)
    if ($this->ownerEmail !== null && !filter_var(
        $this->ownerEmail, FILTER_VALIDATE_EMAIL
      )) {
      throw new ApiException(ErrorType::invalidField('owner_email'), 422);
    }

    // Owner phone number format (Costa Rican: 8 digits or 1234-5678)
    if ($this->ownerPhoneNumber !== null && !preg_match(
        '/^[0-9]{8}$|^[0-9]{4}-[0-9]{4}$/', $this->ownerPhoneNumber
      )) {
      throw new ApiException(
        ErrorType::invalidField(
          'owner_phone_number (must be 8 digits or 1234-5678)'
        ), 422
      );
    }

    // Coordinates range
    if ($this->latitude !== null && ($this->latitude < -90 || $this->latitude > 90)) {
      throw new ApiException(ErrorType::invalidField('latitude'), 422);
    }
    if ($this->longitude !== null && ($this->longitude < -180 || $this->longitude > 180)) {
      throw new ApiException(ErrorType::invalidField('longitude'), 422);
    }

    // Check if owner differs from authenticated user
    $fullName = trim(
      ($userData['first_name'] ?? '') . ' ' . ($userData['last_name'] ?? '')
    );
    $ownerDiffers = false;
    if ($this->ownerName !== null && $this->ownerName !== $fullName) {
      $ownerDiffers = true;
    }
    if ($this->ownerPhoneNumber !== null && $this->ownerPhoneNumber !== ($userData['phone_number'] ?? null)) {
      $ownerDiffers = true;
    }
    if ($this->ownerEmail !== null && strtolower(
        $this->ownerEmail
      ) !== strtolower($userData['email'] ?? '')) {
      $ownerDiffers = true;
    }

    if ($ownerDiffers && empty($this->relationWithOwner)) {
      throw new ApiException(
        ErrorType::missingField(
          'relation_with_owner (required when owner information differs from requester)'
        ),
        422
      );
    }

    // Relation enum
    if ($this->relationWithOwner !== null) {
      $validRelations = ['Familiar', 'Empleado', 'Socio', 'Conocido', 'Titular'];
      if (!in_array($this->relationWithOwner, $validRelations, true)) {
        throw new ApiException(
          ErrorType::invalidField(
            'relation_with_owner (must be Familiar, Empleado, Socio, Conocido, Titular)'
          ), 422
        );
      }
    }
  }
}