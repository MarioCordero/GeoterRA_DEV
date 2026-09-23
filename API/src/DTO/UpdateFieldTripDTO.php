<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for updating an existing field trip.
 */
final class UpdateFieldTripDTO
{
  /**
   * @param string|null $fieldTripName
   * @param string|null $fieldTripScheduledDate
   * @param string|null $fieldTripStartDate
   * @param string|null $fieldTripFinishDate
   * @param bool|null $fieldTripIsActive
   * @param int|null $provinceSnitCode
   * @param int|null $cantonSnitCode
   * @param int|null $districtSnitCode
   * @param string[]|null $participants
   * @param string[]|null $geomanifestations
   */
  public function __construct(
    public ?string $fieldTripName = null,
    public ?string $fieldTripScheduledDate = null,
    public ?string $fieldTripStartDate = null,
    public ?string $fieldTripFinishDate = null,
    public ?bool $fieldTripIsActive = null,
    public ?int $provinceSnitCode = null,
    public ?int $cantonSnitCode = null,
    public ?int $districtSnitCode = null,
    public ?array $participants = null,
    public ?array $geomanifestations = null
  ) {}

  /**
   * Creates DTO from array payload.
   *
   * @param array<string,mixed> $data
   * @return self
   */
  public static function fromArray(array $data): self
  {
    $participants = null;
    if (isset($data['participants']) && is_array($data['participants'])) {
      $participants = array_values(array_filter($data['participants'], 'is_string'));
    }

    $manifestations = null;
    if (isset($data['geomanifestations']) && is_array($data['geomanifestations'])) {
      $manifestations = array_values(array_filter($data['geomanifestations'], 'is_string'));
    }

    return new self(
      fieldTripName: isset($data['field_trip_name']) ? trim((string)$data['field_trip_name']) : null,
      fieldTripScheduledDate: isset($data['field_trip_scheduled_date']) ? trim((string)$data['field_trip_scheduled_date']) : null,
      fieldTripStartDate: isset($data['field_trip_start_date']) ? trim((string)$data['field_trip_start_date']) : null,
      fieldTripFinishDate: isset($data['field_trip_finish_date']) ? trim((string)$data['field_trip_finish_date']) : null,
      fieldTripIsActive: isset($data['field_trip_is_active']) ? (bool)$data['field_trip_is_active'] : null,
      provinceSnitCode: isset($data['province_snit_code']) ? (int)$data['province_snit_code'] : null,
      cantonSnitCode: isset($data['canton_snit_code']) ? (int)$data['canton_snit_code'] : null,
      districtSnitCode: isset($data['district_snit_code']) ? (int)$data['district_snit_code'] : null,
      participants: $participants,
      geomanifestations: $manifestations
    );
  }

  /**
   * Returns array of column => value for updating field_trips table.
   *
   * @return array<string,mixed>
   */
  public function toArray(): array
  {
    $update = [];

    if ($this->fieldTripName !== null) {
      $update['field_trip_name'] = $this->fieldTripName;
    }
    if ($this->fieldTripScheduledDate !== null) {
      $update['field_trip_scheduled_date'] = $this->fieldTripScheduledDate;
    }
    if ($this->fieldTripStartDate !== null) {
      $update['field_trip_start_date'] = $this->fieldTripStartDate;
    }
    if ($this->fieldTripFinishDate !== null) {
      $update['field_trip_finish_date'] = $this->fieldTripFinishDate;
    }
    if ($this->fieldTripIsActive !== null) {
      $update['field_trip_is_active'] = $this->fieldTripIsActive ? 1 : 0;
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

    return $update;
  }

  /**
   * Validates DTO properties.
   *
   * @throws ApiException
   */
  public function validate(): void
  {
    if ($this->fieldTripName !== null && strlen($this->fieldTripName) > 110) {
      throw new ApiException(ErrorType::invalidField('field_trip_name (max 110 characters)'), 422);
    }
  }
}
