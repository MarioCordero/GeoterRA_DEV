<?php
declare(strict_types=1);

namespace DTO;

use DateTimeImmutable;
use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for updating an existing field trip.
 */
final class UpdateFieldTripDTO
{
  /**
   * @param string|null $fieldTripName
   * @param string|null $fieldTripStartDate
   * @param string|null $fieldTripFinishDate
   * @param int|null $provinceSnitCode
   * @param int|null $cantonSnitCode
   * @param int|null $districtSnitCode
   * @param string[]|null $participants
   * @param string[]|null $geomanifestations
   * @param array<string,bool> $fieldsProvided
   */
  public function __construct(
    public ?string $fieldTripName = null,
    public ?string $fieldTripStartDate = null,
    public ?string $fieldTripFinishDate = null,
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
      fieldTripName: array_key_exists('field_trip_name', $data)
      && $data['field_trip_name'] !== null ? trim((string)$data['field_trip_name']) : null,
      fieldTripStartDate: array_key_exists('field_trip_start_date', $data)
      && $data['field_trip_start_date'] !== null ? trim((string)$data['field_trip_start_date']) : null,
      fieldTripFinishDate: array_key_exists('field_trip_finish_date', $data)
      && $data['field_trip_finish_date'] !== null ? trim((string)$data['field_trip_finish_date']) : null,
      provinceSnitCode: array_key_exists('province_snit_code', $data)
      && $data['province_snit_code'] !== null ? (int)$data['province_snit_code'] : null,
      cantonSnitCode: array_key_exists('canton_snit_code', $data)
      && $data['canton_snit_code'] !== null ? (int)$data['canton_snit_code'] : null,
      districtSnitCode: array_key_exists('district_snit_code', $data)
      && $data['district_snit_code'] !== null ? (int)$data['district_snit_code'] : null,
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

    $mapping = [
      'field_trip_name' => $this->fieldTripName,
      'field_trip_start_date' => $this->fieldTripStartDate,
      'field_trip_finish_date' => $this->fieldTripFinishDate,
      'province_snit_code' => $this->provinceSnitCode,
      'canton_snit_code' => $this->cantonSnitCode,
      'district_snit_code' => $this->districtSnitCode,
    ];

    if (!empty($this->fieldsProvided)) {
      foreach ($mapping as $field => $value) {
        if (isset($this->fieldsProvided[$field])) {
          $update[$field] = $value;
        }
      }
      return $update;
    }

    foreach ($mapping as $field => $value) {
      if ($value !== null) {
        $update[$field] = $value;
      }
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
      throw new ApiException(
        ErrorType::invalidField('field_trip_name (max 110 characters)'),
        422
      );
    }

    $start = null;
    $finish = null;

    if ($this->fieldTripStartDate !== null) {
      $start = DateTimeImmutable::createFromFormat(
        'Y-m-d H:i:s', $this->fieldTripStartDate
      ) ?: DateTimeImmutable::createFromFormat(
        'Y-m-d', $this->fieldTripStartDate
      );
    }

    if ($this->fieldTripFinishDate !== null) {
      $finish = DateTimeImmutable::createFromFormat(
        'Y-m-d H:i:s', $this->fieldTripFinishDate
      ) ?: DateTimeImmutable::createFromFormat(
        'Y-m-d', $this->fieldTripFinishDate
      );
    }

    if ($start && $finish && $start > $finish) {
      throw new ApiException(
        ErrorType::invalidField(
          'field_trip_start_date must be less than or equal to field_trip_finish_date'
        ),
        422
      );
    }

  }
}