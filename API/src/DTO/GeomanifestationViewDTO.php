<?php
declare(strict_types=1);

namespace DTO;

/**
 * Data Transfer Object for the enriched view `view_geomanifestations`.
 */
final class GeomanifestationViewDTO
{
  public function __construct(
    public string  $geomanifestationId,
    public string  $geomanifestationName,
    public float   $latitude,
    public float   $longitude,
    public ?string $manifestationDescription,
    public bool    $visibility,
    public string  $manifestationCreatedAt,
    public string  $manifestationCreatorFirstName,
    public string  $manifestationCreatorLastName,
    public ?string $provinceName,
    public ?int  $provinceSnitCode,
    public ?string $cantonName,
    public ?int  $cantonSnitCode,
    public ?string $districtName,
    public ?int  $districtSnitCode,
    public ?string $georeportId,
    public ?string $reportDetails,
    public ?string $reportCreatedAt,
    public ?string $reportCreatorFirstName,
    public ?string $reportCreatorLastName,
    public ?string $insituTestId,
    public ?float $temperature,
    public ?float $insituConductivity,
    public ?float $insituPh,
    public ?string $insituDescription,
    public ?string $insituCreatedAt,
    public ?string $inlabTestId,
    public ?float $labPh,
    public ?float $labConductivity,
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
    public ?float $mg,
    public ?string $labDescription,
    public ?string $labCreatedAt
  ) {}

  /**
   * Creates DTO from database row.
   *
   * @param array<string, mixed> $row
   * @return self
   */
  public static function fromDatabase(array $row): self
  {
    return new self(
      geomanifestationId: $row['geomanifestation_id'],
      geomanifestationName: $row['geomanifestation_name'],
      latitude: (float) $row['latitude'],
      longitude: (float) $row['longitude'],
      manifestationDescription: $row['manifestation_description'] ?? null,
      visibility: (bool) $row['visibility'],
      manifestationCreatedAt: $row['manifestation_created_at'],
      manifestationCreatorFirstName: $row['manifestation_creator_first_name'],
      manifestationCreatorLastName: $row['manifestation_creator_last_name'],
      provinceName: $row['province_name'] ?? null,
      provinceSnitCode: $row['province_snit_code'] ?? null,
      cantonName: $row['canton_name'] ?? null,
      cantonSnitCode: $row['canton_snit_code'] ?? null,
      districtName: $row['district_name'] ?? null,
      districtSnitCode: $row['district_snit_code'] ?? null,
      georeportId: $row['georeport_id'] ?? null,
      reportDetails: $row['report_details'] ?? null,
      reportCreatedAt: $row['report_created_at'] ?? null,
      reportCreatorFirstName: $row['report_creator_first_name'] ?? null,
      reportCreatorLastName: $row['report_creator_last_name'] ?? null,
      insituTestId: $row['insitu_test_id'] ?? null,
      temperature: isset($row['temperature']) ? (float) $row['temperature'] : null,
      insituConductivity: isset($row['insitu_conductivity']) ? (float) $row['insitu_conductivity'] : null,
      insituPh: isset($row['insitu_ph']) ? (float) $row['insitu_ph'] : null,
      insituDescription: $row['insitu_description'] ?? null,
      insituCreatedAt: $row['insitu_created_at'] ?? null,
      inlabTestId: $row['inlab_test_id'] ?? null,
      labPh: isset($row['lab_ph']) ? (float) $row['lab_ph'] : null,
      labConductivity: isset($row['lab_conductivity']) ? (float) $row['lab_conductivity'] : null,
      cl: isset($row['cl']) ? (float) $row['cl'] : null,
      ca: isset($row['ca']) ? (float) $row['ca'] : null,
      hco3: isset($row['hco3']) ? (float) $row['hco3'] : null,
      so4: isset($row['so4']) ? (float) $row['so4'] : null,
      fe: isset($row['fe']) ? (float) $row['fe'] : null,
      si: isset($row['si']) ? (float) $row['si'] : null,
      b: isset($row['b']) ? (float) $row['b'] : null,
      li: isset($row['li']) ? (float) $row['li'] : null,
      f: isset($row['f']) ? (float) $row['f'] : null,
      na: isset($row['na']) ? (float) $row['na'] : null,
      k: isset($row['k']) ? (float) $row['k'] : null,
      mg: isset($row['mg']) ? (float) $row['mg'] : null,
      labDescription: $row['lab_description'] ?? null,
      labCreatedAt: $row['lab_created_at'] ?? null
    );
  }

  /**
   * Converts the DTO to an API-friendly array.
   *
   * @return array
   */
  public function toArray(): array
  {
    return [
      'geomanifestation_id' => $this->geomanifestationId,
      'name' => $this->geomanifestationName,
      'latitude' => $this->latitude !== null ? round($this->latitude, 7) : null,
      'longitude' => $this->longitude !== null ? round($this->longitude, 7) : null,
      'description' => $this->manifestationDescription,
      'visibility' => $this->visibility,
      'created_at' => $this->manifestationCreatedAt,
      'created_by' => [
        'first_name' => $this->manifestationCreatorFirstName,
        'last_name' => $this->manifestationCreatorLastName,
      ],
      'location' => [
        'province' => $this->provinceName,
        'province_snit_code' => $this->provinceSnitCode,
        'canton' => $this->cantonName,
        'canton_snit_code' => $this->cantonSnitCode,
        'district' => $this->districtName,
        'district_snit_code' => $this->districtSnitCode,
      ],
      'current_georeport' => $this->georeportId ? [
        'georeport_id' => $this->georeportId,
        'details' => $this->reportDetails,
        'created_at' => $this->reportCreatedAt,
        'created_by' => $this->reportCreatorFirstName && $this->reportCreatorLastName
          ? "{$this->reportCreatorFirstName} {$this->reportCreatorLastName}"
          : null,
      ] : null,
      'insitu_test' => $this->insituTestId ? [
        'insitu_test_id' => $this->insituTestId,
        'temperature' => $this->temperature,
        'conductivity' => $this->insituConductivity,
        'ph' => $this->insituPh,
        'description' => $this->insituDescription,
        'created_at' => $this->insituCreatedAt,
      ] : null,
      'inlab_test' => $this->inlabTestId ? [
        'inlab_test_id' => $this->inlabTestId,
        'ph' => $this->labPh,
        'conductivity' => $this->labConductivity,
        'cl' => $this->cl,
        'ca' => $this->ca,
        'hco3' => $this->hco3,
        'so4' => $this->so4,
        'fe' => $this->fe,
        'si' => $this->si,
        'b' => $this->b,
        'li' => $this->li,
        'f' => $this->f,
        'na' => $this->na,
        'k' => $this->k,
        'mg' => $this->mg,
        'description' => $this->labDescription,
        'created_at' => $this->labCreatedAt,
      ] : null,
    ];
  }
}