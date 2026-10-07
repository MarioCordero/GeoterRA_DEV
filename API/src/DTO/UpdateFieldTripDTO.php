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
   * @param array<string,bool> $fieldsProvided
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
    public ?array $geomanifestations = null,
    public array $fieldsProvided = []
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
    if (array_key_exists('participants', $data) && is_array($data['participants'])) {
      $participants = array_values(array_filter($data['participants'], 'is_string'));
    }

    $manifestations = null;
    if (array_key_exists('geomanifestations', $data) && is_array($data['geomanifestations'])) {
      $manifestations = array_values(array_filter($data['geomanifestations'], 'is_string'));
    }

    $fieldsProvided = array_fill_keys(array_keys($data), true);

    return new self(
      fieldTripName: array_key_exists('field_trip_name', $data) && $data['field_trip_name'] !== null ? trim((string)$data['field_trip_name']) : null,
      fieldTripScheduledDate: array_key_exists('field_trip_scheduled_date', $data) && $data['field_trip_scheduled_date'] !== null ? trim((string)$data['field_trip_scheduled_date']) : null,
      fieldTripStartDate: array_key_exists('field_trip_start_date', $data) && $data['field_trip_start_date'] !== null ? trim((string)$data['field_trip_start_date']) : null,
      fieldTripFinishDate: array_key_exists('field_trip_finish_date', $data) && $data['field_trip_finish_date'] !== null ? trim((string)$data['field_trip_finish_date']) : null,
      fieldTripIsActive: array_key_exists('field_trip_is_active', $data) && $data['field_trip_is_active'] !== null ? (bool)$data['field_trip_is_active'] : null,
      provinceSnitCode: array_key_exists('province_snit_code', $data) && $data['province_snit_code'] !== null ? (int)$data['province_snit_code'] : null,
      cantonSnitCode: array_key_exists('canton_snit_code', $data) && $data['canton_snit_code'] !== null ? (int)$data['canton_snit_code'] : null,
      districtSnitCode: array_key_exists('district_snit_code', $data) && $data['district_snit_code'] !== null ? (int)$data['district_snit_code'] : null,
      participants: $participants,
      geomanifestations: $manifestations,
      fieldsProvided: $fieldsProvided
    );
  }

  /**
   * Checks whether a field was provided in the incoming payload.
   *
   * @param string $fieldName
   * @return bool
   */
  public function hasField(string $fieldName): bool
  {
    return isset($this->fieldsProvided[$fieldName]);
  }

  /**
   * Returns array of column => value for updating field_trips table.
   *
   * @return array<string,mixed>
   */
  public function toArray(): array
  {
    $update = [];

    if (!empty($this->fieldsProvided)) {
      if (isset($this->fieldsProvided['field_trip_name'])) {
        $update['field_trip_name'] = $this->fieldTripName;
      }
      if (isset($this->fieldsProvided['field_trip_scheduled_date'])) {
        $update['field_trip_scheduled_date'] = $this->fieldTripScheduledDate;
      }
      if (isset($this->fieldsProvided['field_trip_start_date'])) {
        $update['field_trip_start_date'] = $this->fieldTripStartDate;
      }
      if (isset($this->fieldsProvided['field_trip_finish_date'])) {
        $update['field_trip_finish_date'] = $this->fieldTripFinishDate;
      }
      if (isset($this->fieldsProvided['field_trip_is_active'])) {
        $update['field_trip_is_active'] = $this->fieldTripIsActive ? 1 : 0;
      }
      if (isset($this->fieldsProvided['province_snit_code'])) {
        $update['province_snit_code'] = $this->provinceSnitCode;
      }
      if (isset($this->fieldsProvided['canton_snit_code'])) {
        $update['canton_snit_code'] = $this->cantonSnitCode;
      }
      if (isset($this->fieldsProvided['district_snit_code'])) {
        $update['district_snit_code'] = $this->districtSnitCode;
      }
      return $update;
    }

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
