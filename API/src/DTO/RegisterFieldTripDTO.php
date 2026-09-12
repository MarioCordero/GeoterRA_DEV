<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for creating a new field trip (gira de campo).
 */
final class RegisterFieldTripDTO
{
  /**
   * @param string $fieldTripName Field trip name (required)
   * @param string $fieldTripScheduledDate Scheduled date (required, YYYY-MM-DD or ISO 8601)
   * @param string|null $fieldTripStartDate Actual start date (optional)
   * @param string|null $fieldTripFinishDate Actual finish date (optional)
   * @param bool $fieldTripIsActive Whether the field trip is active
   * @param int|null $provinceSnitCode SNIT code of province
   * @param int|null $cantonSnitCode SNIT code of canton
   * @param int|null $districtSnitCode SNIT code of district
   * @param string[] $participants List of participant user ULIDs
   * @param string[] $geomanifestations List of manifestation ULIDs to link
   */
  public function __construct(
    public string $fieldTripName,
    public string $fieldTripScheduledDate,
    public ?string $fieldTripStartDate = null,
    public ?string $fieldTripFinishDate = null,
    public bool $fieldTripIsActive = true,
    public ?int $provinceSnitCode = null,
    public ?int $cantonSnitCode = null,
    public ?int $districtSnitCode = null,
    public array $participants = [],
    public array $geomanifestations = []
  ) {}

  /**
   * Creates DTO from array payload.
   *
   * @param array<string,mixed> $data
   * @return self
   * @throws ApiException
   */
  public static function fromArray(array $data): self
  {
    if (!isset($data['field_trip_name']) || trim((string)$data['field_trip_name']) === '') {
      throw new ApiException(ErrorType::missingField('field_trip_name'), 422);
    }
    if (!isset($data['field_trip_scheduled_date']) || trim((string)$data['field_trip_scheduled_date']) === '') {
      throw new ApiException(ErrorType::missingField('field_trip_scheduled_date'), 422);
    }

    $participants = [];
    if (isset($data['participants']) && is_array($data['participants'])) {
      $participants = array_values(array_filter($data['participants'], 'is_string'));
    }

    $manifestations = [];
    if (isset($data['geomanifestations']) && is_array($data['geomanifestations'])) {
      $manifestations = array_values(array_filter($data['geomanifestations'], 'is_string'));
    }

    return new self(
      fieldTripName: trim((string)$data['field_trip_name']),
      fieldTripScheduledDate: trim((string)$data['field_trip_scheduled_date']),
      fieldTripStartDate: isset($data['field_trip_start_date']) ? trim((string)$data['field_trip_start_date']) : null,
      fieldTripFinishDate: isset($data['field_trip_finish_date']) ? trim((string)$data['field_trip_finish_date']) : null,
      fieldTripIsActive: isset($data['field_trip_is_active']) ? (bool)$data['field_trip_is_active'] : true,
      provinceSnitCode: isset($data['province_snit_code']) ? (int)$data['province_snit_code'] : null,
      cantonSnitCode: isset($data['canton_snit_code']) ? (int)$data['canton_snit_code'] : null,
      districtSnitCode: isset($data['district_snit_code']) ? (int)$data['district_snit_code'] : null,
      participants: $participants,
      geomanifestations: $manifestations
    );
  }

  /**
   * Converts to array for database insertion into field_trips table.
   *
   * @return array<string,mixed>
   */
  public function toArray(): array
  {
    return [
      'field_trip_name' => $this->fieldTripName,
      'field_trip_scheduled_date' => $this->fieldTripScheduledDate,
      'field_trip_start_date' => $this->fieldTripStartDate,
      'field_trip_finish_date' => $this->fieldTripFinishDate,
      'field_trip_is_active' => $this->fieldTripIsActive ? 1 : 0,
      'province_snit_code' => $this->provinceSnitCode,
      'canton_snit_code' => $this->cantonSnitCode,
      'district_snit_code' => $this->districtSnitCode,
    ];
  }

  /**
   * Validates DTO properties.
   *
   * @throws ApiException
   */
  public function validate(): void
  {
    if (strlen($this->fieldTripName) > 110) {
      throw new ApiException(ErrorType::invalidField('field_trip_name (max 110 characters)'), 422);
    }
  }
}
