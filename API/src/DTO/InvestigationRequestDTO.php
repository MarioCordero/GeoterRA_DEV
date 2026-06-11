<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for an analysis request (geothermal manifestation request).
 *
 * Handles validation, conversion from HTTP request and database row, including
 * current state and relation with owner logic.
 */
final class InvestigationRequestDTO
{
  /**
   * @param string|null $requestId UID for the investigation request instance.
   * @param int $provinceSnitCode SNIT code of the province.
   * @param int $cantonSnitCode SNIT code of the canton.
   * @param int $districtSnitCode SNIT code of the district.
   * @param string $requestName Name of the request (provided by user or auto-generated).
   * @param string|null $ownerName Name of the land owner (if different from requester).
   * @param string|null $ownerPhoneNumber Phone number of the owner (Costa Rican format).
   * @param string|null $ownerEmail Email of the owner.
   * @param string $currentUsage Current land usage (enum: Residencial, Comercial, Turístico, Conservación, Ganadería, Otro).
   * @param string $temperatureSensation Perceived temperature (enum: Hirviendo, Muy Caliente, Caliente, Templado, Natural, Sin Especificar).
   * @param bool $bubbles Presence of gas bubbles.
   * @param string|null $details Additional details.
   * @param string|null $exactAddress Exact address text.
   * @param float|null $latitude Latitude coordinate (decimal degrees).
   * @param float|null $longitude Longitude coordinate (decimal degrees).
   * @param string|null $relationWithOwner Relationship with owner (Familiar, Empleado, Socio, Conocido) – required if owner differs.
   * @param string|null $currentState Current state value (for response, not for creation/update).
   * @param string|null $stateDescription Current state description (for response).
   */
  public function __construct(
    public ?string $requestId,
    public int $provinceSnitCode,
    public int $cantonSnitCode,
    public int $districtSnitCode,
    public string $requestName,
    public ?string $ownerName,
    public ?string $ownerPhoneNumber,
    public ?string $ownerEmail,
    public string $currentUsage,
    public string $temperatureSensation,
    public bool $bubbles,
    public ?string $details,
    public ?string $exactAddress,
    public ?float $latitude,
    public ?float $longitude,
    public ?string $relationWithOwner,
    public ?string $createdAt = null,
    public ?string $currentState = null,
    public ?string $stateDescription = null,
    public ?string $stateCreatedAt = null
  ) {}

  /**
   * Creates a DTO from an HTTP request payload.
   *
   * @param array $data The decoded JSON body.
   * @return self
   * @throws ApiException If required fields are missing or invalid.
   */
  public static function fromArray(array $data): self
  {
    $required = [
      'province_snit_code', 'canton_snit_code', 'district_snit_code',
      'request_name', 'current_usage', 'temperature_sensation'
    ];
    foreach ($required as $field) {
      if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
        throw new ApiException(ErrorType::missingField($field), 422);
      }
    }

    return new self(
      requestId: null,
      provinceSnitCode: (int) $data['province_snit_code'],
      cantonSnitCode: (int) $data['canton_snit_code'],
      districtSnitCode: (int) $data['district_snit_code'],
      requestName: trim($data['request_name']),
      ownerName: $data['owner_name'] ?? null,
      ownerPhoneNumber: $data['owner_phone_number'] ?? null,
      ownerEmail: $data['owner_email'] ?? null,
      currentUsage: $data['current_usage'],
      temperatureSensation: $data['temperature_sensation'],
      bubbles: isset($data['bubbles']) ? (bool) $data['bubbles'] : false,
      details: $data['details'] ?? null,
      exactAddress: $data['exact_address'] ?? null,
      latitude: isset($data['latitude']) ? (float) $data['latitude'] : null,
      longitude: isset($data['longitude']) ? (float) $data['longitude'] : null,
      relationWithOwner: $data['relation_with_owner'] ?? null
    );
  }

  /**
   * Creates a DTO from a database row (including joined current state).
   *
   * @param array $row Associative array from the database.
   * @return self
   */
  public static function fromDatabase(array $row): self
  {
    return new self(
      requestId: $row['request_id'],
      provinceSnitCode: (int) $row['province_snit_code'],
      cantonSnitCode: (int) $row['canton_snit_code'],
      districtSnitCode: (int) $row['district_snit_code'],
      requestName: $row['request_name'],
      ownerName: $row['owner_name'] ?? null,
      ownerPhoneNumber: $row['owner_phone_number'] ?? null,
      ownerEmail: $row['owner_email'] ?? null,
      currentUsage: $row['current_usage'],
      temperatureSensation: $row['temperature_sensation'],
      bubbles: (bool) $row['bubbles'],
      details: $row['details'] ?? null,
      exactAddress: $row['exact_address'] ?? null,
      latitude: $row['latitude'] !== null ? (float) $row['latitude'] : null,
      longitude: $row['longitude'] !== null ? (float) $row['longitude'] : null,
      relationWithOwner: $row['relation_with_owner'] ?? null,
      createdAt: $row['created_at'] ?? null,
      currentState: $row['current_state'] ?? null,
      stateDescription: $row['state_description'] ?? null,
      stateCreatedAt: $row['state_created_at'] ?? null
    );
  }

  /**
   * Converts the DTO to an array for database insertion/update.
   *
   * @return array
   */
  public function toArray(): array
  {
    $state = null;
    if ($this->currentState !== null) {
      $state = [
        'value' => $this->currentState,
        'description' => $this->stateDescription,
        'created_at' => $this->stateCreatedAt
      ];
    }

    return [
      'request_id' => $this->requestId,
      'province_snit_code' => $this->provinceSnitCode,
      'canton_snit_code' => $this->cantonSnitCode,
      'district_snit_code' => $this->districtSnitCode,
      'request_name' => $this->requestName,
      'owner_name' => $this->ownerName,
      'owner_phone_number' => $this->ownerPhoneNumber,
      'owner_email' => $this->ownerEmail,
      'current_usage' => $this->currentUsage,
      'temperature_sensation' => $this->temperatureSensation,
      'bubbles' => $this->bubbles,
      'details' => $this->details,
      'exact_address' => $this->exactAddress,
      'latitude' => $this->latitude !== null ? round($this->latitude, 7) : null,
      'longitude' => $this->longitude !== null ? round($this->longitude, 7) : null,
      'relation_with_owner' => $this->relationWithOwner,
      'created_at' => $this->createdAt,
      'state' => $state
    ];
  }

  /**
   * Validates business rules using the authenticated user data.
   *
   * @param array $userData Authenticated user data (keys: first_name, last_name, phone_number, email).
   * @throws ApiException If validation fails.
   */
  public function validate(array $userData): void
  {
    // SNIT codes must be positive
    if ($this->provinceSnitCode <= 0 || $this->cantonSnitCode <= 0
      || $this->districtSnitCode <= 0) {
      throw new ApiException(
        ErrorType::invalidField(
          'province/canton/district SNIT code must be positive'
        ),
      422
      );
    }

    // Request name length
    if (strlen($this->requestName) > 110) {
      throw new ApiException(
        ErrorType::invalidField('request_name (max 110 characters)'), 422
      );
    }

    // Current usage enum
    $validUsages = [
      'Residencial', 'Comercial',
      'Turístico', 'Conservación',
      'Ganadería', 'Otro'
    ];
    if (!in_array($this->currentUsage, $validUsages, true)) {
      throw new ApiException(
        ErrorType::invalidField('current_usage'), 422
      );
    }

    // Temperature sensation enum
    $validTemps = [
      'Hirviendo', 'Muy Caliente',
      'Caliente', 'Templado', 'Natural', 'Sin Especificar'
    ];
    if (!in_array($this->temperatureSensation, $validTemps, true)) {
      throw new ApiException(
        ErrorType::invalidField('temperature_sensation'), 422
      );
    }

    // Owner email format (if provided)
    if ($this->ownerEmail !== null &&
      !filter_var($this->ownerEmail, FILTER_VALIDATE_EMAIL)) {
      throw new ApiException(ErrorType::invalidField('owner_email'), 422);
    }

    // Owner phone number format (Costa Rican: 8 digits or 1234-5678)
    if ($this->ownerPhoneNumber !== null &&
      !preg_match('/^[0-9]{8}$|^[0-9]{4}-[0-9]{4}$/', $this->ownerPhoneNumber)) {
      throw new ApiException(
        ErrorType::invalidField(
          'owner_phone_number (must be 8 digits or 1234-5678)'
        ),
        422
      );
    }

    // Coordinates range
    if ($this->latitude !== null &&
      ($this->latitude < -90 || $this->latitude > 90)) {
      throw new ApiException(ErrorType::invalidField('latitude'), 422);
    }
    if ($this->longitude !== null &&
      ($this->longitude < -180 || $this->longitude > 180)) {
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
    if ($this->ownerPhoneNumber !== null
      && $this->ownerPhoneNumber !== ($userData['phone_number'] ?? null)) {
      $ownerDiffers = true;
    }
    if ($this->ownerEmail !== null
      && strtolower($this->ownerEmail) !== strtolower($userData['email'] ?? '')) {
      $ownerDiffers = true;
    }

    if ($ownerDiffers && empty($this->relationWithOwner)) {
      throw new ApiException(
        ErrorType::missingField(
          'relation_with_owner (
          required when owner information differs from requester
          )'
        ),
        422
      );
    }

    // Relation enum
    if ($this->relationWithOwner !== null) {
      $validRelations = [
        'Familiar', 'Empleado',
        'Socio', 'Conocido', 'Titular'
      ];
      if (!in_array($this->relationWithOwner, $validRelations, true)) {
        throw new ApiException(
          ErrorType::invalidField(
            'relation_with_owner (
            must be Familiar, Empleado, Socio, Conocido, Titular
            )'
          ),
          422
        );
      }
    }
  }
}