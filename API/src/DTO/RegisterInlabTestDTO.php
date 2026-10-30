<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for creating a new in-lab test.
 * Only geomanifestationId and inlabTestName are required; all other fields are optional.
 */
final class RegisterInlabTestDTO
{
	/**
	 * @param string $geomanifestationId ID of the associated geothermal manifestation (required)
	 * @param string $inlabTestName Name of the in-lab test (required, max 55 chars)
	 * @param float|null $ph pH value (range: 0-14)
	 * @param float|null $conductivity Electrical conductivity in µS/cm (must be >= 0)
	 * @param float|null $cl Chloride concentration (must be >= 0)
	 * @param float|null $ca Calcium concentration (must be >= 0)
	 * @param float|null $hco3 Bicarbonate concentration (must be >= 0)
	 * @param float|null $so4 Sulfate concentration (must be >= 0)
	 * @param float|null $fe Iron concentration (must be >= 0)
	 * @param float|null $si Silica concentration (must be >= 0)
	 * @param float|null $b Boron concentration (must be >= 0)
	 * @param float|null $li Lithium concentration (must be >= 0)
	 * @param float|null $f Fluoride concentration (must be >= 0)
	 * @param float|null $na Sodium concentration (must be >= 0)
	 * @param float|null $k Potassium concentration (must be >= 0)
	 * @param float|null $mg Magnesium concentration (must be >= 0)
	 * @param string|null $description Additional notes
	 */
	public function __construct(
		public string $geomanifestationId,
		public string $inlabTestName,
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
	 * Creates DTO from the HTTP request payload.
	 *
	 * @param array<string,mixed> $data
	 * @return self
	 * @throws ApiException When required fields are missing
	 */
	public static function fromArray(array $data): self
	{
		$required = ['geomanifestation_id', 'inlab_test_name'];
		foreach ($required as$field) {
			if (empty($data[$field])) {
				throw new ApiException(
					ErrorType::missingField($field), 422
				);
			}
		}

		return new self(
			geomanifestationId : trim((string)$data['geomanifestation_id']),
			inlabTestName : trim((string)$data['inlab_test_name']),
			ph : isset($data['ph']) ? (float)$data['ph'] : 0,
			conductivity : isset($data['conductivity']) ? (float)$data['conductivity'] : 0,
			cl : isset($data['cl']) ? (float)$data['cl'] : 0,
			ca : isset($data['ca']) ? (float)$data['ca'] : 0,
			hco3 : isset($data['hco3']) ? (float)$data['hco3'] : 0,
			so4 : isset($data['so4']) ? (float)$data['so4'] : 0,
			fe : isset($data['fe']) ? (float)$data['fe'] : 0,
			si : isset($data['si']) ? (float)$data['si'] : 0,
			b : isset($data['b']) ? (float)$data['b'] : 0,
			li : isset($data['li']) ? (float)$data['li'] : 0,
			f : isset($data['f']) ? (float)$data['f'] : 0,
			na : isset($data['na']) ? (float)$data['na'] : 0,
			k : isset($data['k']) ? (float)$data['k'] : 0,
			mg : isset($data['mg']) ? (float)$data['mg'] : 0,
			description : $data['description'] ?? null,
		);
	}

	/**
	 * Validates business rules for creation.
	 *
	 * @throws ApiException
	 */
	public function validate(): void
	{
		if (trim($this->geomanifestationId) === '') {
			throw new ApiException(
				ErrorType::invalidField('geomanifestation_id'), 422
			);
		}
		if (trim($this->inlabTestName) === '' || mb_strlen($this->inlabTestName) > 55) {
		throw new ApiException(
			ErrorType::invalidField('inlab_test_name (required, max 55 characters)'), 422
		);
	}
    if ($this->ph !== null && ($this->ph < 0 || $this->ph > 14)) {
		throw new ApiException(
			ErrorType::invalidField('pH (must be between 0 and 14)'), 422
		);
	}
    if ($this->conductivity !== null &&$this->conductivity < 0) {
			throw new ApiException(
				ErrorType::invalidField('conductivity (must be >= 0)'), 422
			);
		}

    $negativeFields = ['cl', 'ca', 'hco3', 'so4', 'fe', 'si', 'b', 'li', 'f', 'na', 'k', 'mg'];
    foreach ($negativeFields as$field) {
			if ($this->$field !== null && $this->$field < 0) {
				throw new ApiException(
					ErrorType::invalidField($field . ' (must be >= 0)'), 422
				);
			}
		}
  }
}