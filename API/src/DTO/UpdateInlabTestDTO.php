<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for updating an existing in-lab test.
 * All fields are optional – only provided fields will be updated.
 */
final class UpdateInlabTestDTO
{
  /**
   * @param float|null $ph New pH value
   * @param float|null $conductivity New conductivity in µS/cm
   * @param float|null $cl New chloride concentration
   * @param float|null $ca New calcium concentration
   * @param float|null $hco3 New bicarbonate concentration
   * @param float|null $so4 New sulfate concentration
   * @param float|null $fe New iron concentration
   * @param float|null $si New silica concentration
   * @param float|null $b New boron concentration
   * @param float|null $li New lithium concentration
   * @param float|null $f New fluoride concentration
   * @param float|null $na New sodium concentration
   * @param float|null $k New potassium concentration
   * @param float|null $mg New magnesium concentration
   * @param string|null $description New description
   */
  public function __construct(
    public ?float $ph = null,
    public ?float $conductivity = null,
    public ?float $cl = null,
    public ?float $ca = null,
    public ?float $hco3 = null,
    public ?float $so4 = null,
    public ?float $fe = null,
    public ?float $si = null,
    public ?float $b = null,
    public ?float $li = null,
    public ?float $f = null,
    public ?float $na = null,
    public ?float $k = null,
    public ?float $mg = null,
    public ?string $description = null,
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
      ph : isset($data['ph']) ? (float)$data['ph'] : null,
      conductivity : isset($data['conductivity']) ? (float)$data['conductivity'] : null,
      cl : isset($data['cl']) ? (float)$data['cl'] : null,
      ca : isset($data['ca']) ? (float)$data['ca'] : null,
      hco3 : isset($data['hco3']) ? (float)$data['hco3'] : null,
      so4 : isset($data['so4']) ? (float)$data['so4'] : null,
      fe : isset($data['fe']) ? (float)$data['fe'] : null,
      si : isset($data['si']) ? (float)$data['si'] : null,
      b : isset($data['b']) ? (float)$data['b'] : null,
      li : isset($data['li']) ? (float)$data['li'] : null,
      f : isset($data['f']) ? (float)$data['f'] : null,
      na : isset($data['na']) ? (float)$data['na'] : null,
      k : isset($data['k']) ? (float)$data['k'] : null,
      mg : isset($data['mg']) ? (float)$data['mg'] : null,
      description : $data['description'] ?? null,
    );
  }

  /**
   * Returns an array with only the fields that should be updated.
   * Excludes null values.
   *
   * @return array<string,mixed>
   */
  public function toArray(): array
  {
    $update = [];
    if ($this->ph !== null) {
      $update['ph'] = $this->ph;
    }
    if ($this->conductivity !== null) {
      $update['conductivity'] = $this->conductivity;
    }
    if ($this->cl !== null) {
      $update['cl'] = $this->cl;
    }
    if ($this->ca !== null) {
      $update['ca'] = $this->ca;
    }
    if ($this->hco3 !== null) {
      $update['hco3'] = $this->hco3;
    }
    if ($this->so4 !== null) {
      $update['so4'] = $this->so4;
    }
    if ($this->fe !== null) {
      $update['fe'] = $this->fe;
    }
    if ($this->si !== null) {
      $update['si'] = $this->si;
    }
    if ($this->b !== null) {
      $update['b'] = $this->b;
    }
    if ($this->li !== null) {
      $update['li'] = $this->li;
    }
    if ($this->f !== null) {
      $update['f'] = $this->f;
    }
    if ($this->na !== null) {
      $update['na'] = $this->na;
    }
    if ($this->k !== null) {
      $update['k'] = $this->k;
    }
    if ($this->mg !== null) {
      $update['mg'] = $this->mg;
    }
    if ($this->description !== null) {
      $update['description'] = $this->description;
    }
    return $update;
  }

  /**
   * Validates business rules for the fields that are being updated.
   *
   * @param array<string,mixed> $userData Not used, kept for consistency
   * @throws ApiException
   */
  public function validate(): void
  {
    if ($this->ph !== null && ($this->ph < 0 || $this->ph > 14)) {
      throw new ApiException(
        ErrorType::invalidField('pH (must be between 0 and 14)'), 422
      );
    }
    if ($this->conductivity !== null && $this->conductivity < 0) {
      throw new ApiException(
        ErrorType::invalidField('conductivity (must be >= 0)'), 422
      );
    }

    $negativeFields = ['cl', 'ca', 'hco3', 'so4', 'fe', 'si', 'b', 'li', 'f', 'na', 'k', 'mg'];
    foreach ($negativeFields as $field) {
      if ($this->$field !== null && $this->$field < 0) {
        throw new ApiException(
          ErrorType::invalidField($field . ' (must be >= 0)'), 422
        );
      }
    }
  }
}