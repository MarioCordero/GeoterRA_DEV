<?php
declare(strict_types=1);

namespace DTO;

use DateTimeImmutable;
use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for creating a new field trip (gira de campo).
 */
final class RegisterFieldTripDTO
{
  /**
   * @param string $fieldTripName Field trip name
   * @param string $fieldTripStartDate Actual start date
   * @param string $fieldTripFinishDate Actual finish date
   * @param int $provinceSnitCode SNIT code of province
   * @param int $cantonSnitCode SNIT code of canton
   * @param int $districtSnitCode SNIT code of district
   * @param string[] $participants List of participant user ULIDs
   * @param string[] $geomanifestations List of manifestation ULIDs to link
   */
  public function __construct(
    public string $fieldTripName,
    public string $fieldTripStartDate,
    public string $fieldTripFinishDate,
    public int $provinceSnitCode,
    public int $cantonSnitCode,
    public int $districtSnitCode,
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
    if (!isset($data['field_trip_start_date']) || trim((string)$data['field_trip_start_date']) === '') {
      throw new ApiException(ErrorType::missingField('field_trip_start_date'), 422);
    }
    if (!isset($data['field_trip_finish_date']) || trim((string)$data['field_trip_finish_date']) === '') {
      throw new ApiException(ErrorType::missingField('field_trip_finish_date'), 422);
    }
    if (!isset($data['province_snit_code'])) {
      throw new ApiException(
        ErrorType::missingField('province_snit_code'), 422
      );
    }
    if (!isset($data['canton_snit_code'])) {
      throw new ApiException(
        ErrorType::missingField('canton_snit_code'), 422
      );
    }
    if (!isset($data['district_snit_code'])) {
      throw new ApiException(
        ErrorType::missingField('district_snit_code'), 422
      );
    }

    $participants = [];
    if (isset($data['participants']) && is_array($data['participants'])) {
      $participants = array_values(array_filter($data['participants'], 'is_string'));
    }

    $manifestations = [];
    if (isset($data['geomanifestations'])
      && is_array($data['geomanifestations'])) {
      $manifestations = array_values(
        array_filter($data['geomanifestations'], 'is_string')
      );
    }

    return new self(
      fieldTripName: trim((string)$data['field_trip_name']),
      fieldTripStartDate: trim((string)$data['field_trip_start_date']),
      fieldTripFinishDate: trim((string)$data['field_trip_finish_date']),
      provinceSnitCode: (int)$data['province_snit_code'],
      cantonSnitCode: (int)$data['canton_snit_code'],
      districtSnitCode: (int)$data['district_snit_code'],
      participants: $participants,
      geomanifestations: $manifestations
    );
  }

  /**
   * Converts to array for database insertion into the field_trips table.
   *
   * @return array<string,mixed>
   */
  public function toArray(): array
  {
    return [
      'field_trip_name' => $this->fieldTripName,
      'field_trip_start_date' => $this->fieldTripStartDate,
      'field_trip_finish_date' => $this->fieldTripFinishDate,
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
      throw new ApiException(
        ErrorType::invalidField('field_trip_name (max 110 characters)'), 422
      );
    }

    $start = DateTimeImmutable::createFromFormat(
      'Y-m-d H:i:s', $this->fieldTripStartDate
    ) ?: DateTimeImmutable::createFromFormat(
      'Y-m-d', $this->fieldTripStartDate
    );

    $finish = DateTimeImmutable::createFromFormat(
      'Y-m-d H:i:s', $this->fieldTripFinishDate
    ) ?:DateTimeImmutable::createFromFormat(
      'Y-m-d', $this->fieldTripFinishDate
    );

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