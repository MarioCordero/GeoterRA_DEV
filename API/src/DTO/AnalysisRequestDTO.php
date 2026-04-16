<?php
// src/DTO/AnalysisRequestDTO.php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * Data Transfer Object for creating an AnalysisRequest.
 * The request name is generated internally using the persisted ID.
 */
final class AnalysisRequestDTO
{
	public function __construct(
		public string $region,
		public string $email,
		public ?string $owner_contact_number,
		public ?string $owner_name,
		public string $temperature_sensation,
		public bool $bubbles,
		public ?string $details,
		public ?string $current_usage,
		public float $latitude,
		public float $longitude,
		public ?string $state
	) {
	}

	/**
	 * Creates DTO from request payload.
	 *
	 * @throws ApiException
	 */
	public static function fromArray(array $data): self
	{

		if (!isset($data['region']) || trim((string) $data['region']) === '') {
			throw new ApiException(ErrorType::missingField('region'), 422);
		}

		if (!isset($data['email']) || trim((string) $data['email']) === '') {
			throw new ApiException(ErrorType::missingField('email'), 422);
		}

		if (!isset($data['temperature_sensation']) || trim((string) $data['temperature_sensation']) === '') {
			throw new ApiException(ErrorType::missingField('temperature_sensation'), 422);
		}

		if (!isset($data['latitude']) || $data['latitude'] === '') {
			throw new ApiException(ErrorType::missingField('latitude'), 422);
		}

		if (!isset($data['longitude']) || $data['longitude'] === '') {
			throw new ApiException(ErrorType::missingField('longitude'), 422);
		}

		return new self(
			trim((string) $data['region']),
			strtolower(trim((string) $data['email'])),
			$data['owner_contact_number'] ?? null,
			isset($data['owner_name']) ? trim((string) $data['owner_name']) ?: null : null,
			trim((string) $data['temperature_sensation']),
			isset($data['bubbles']) ? (bool) $data['bubbles'] : false,
			$data['details'] ?? null,
			$data['current_usage'] ?? null,
			(float) $data['latitude'],
			(float) $data['longitude'],
			$data['state'] ?? null
		);
	}

	/**
	 * Validates business rules.
	 *
	 * @throws ApiException
	 */
	public function validate(): void
	{
		if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
			throw new ApiException(
				ErrorType::invalidField('email'),
				422
			);
		}

		$validRegions = [
			'Los Andes',
			'Zona Sur',
			'Pacifico',
			'Zona Central',
			'Araucanía',
			'Los Lagos',
			'Zona Austral'
		];

		if (!in_array($this->region, $validRegions, true)) {
			throw new ApiException(
				ErrorType::invalidField('region'),
				422
			);
		}

		$validTemperatureSensations = [
			'mucho_frio',
			'frio',
			'templado',
			'calor',
			'mucho_calor'
		];

		if (!in_array($this->temperature_sensation, $validTemperatureSensations, true)) {
			throw new ApiException(
				ErrorType::invalidField('temperature_sensation'),
				422
			);
		}

		if ($this->latitude < -90 || $this->latitude > 90) {
			throw new ApiException(
				ErrorType::invalidField('latitude'),
				422
			);
		}

		if ($this->longitude < -180 || $this->longitude > 180) {
			throw new ApiException(
				ErrorType::invalidField('longitude'),
				422
			);
		}
	}
}
