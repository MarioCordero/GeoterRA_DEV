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
		public string $owner_name,
		public ?string $temperature_sensation,
		public bool $bubbles,
		public ?string $details,
		public ?string $current_usage,
		public float $latitude,
		public float $longitude
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

		if (!isset($data['owner_name']) || trim((string) $data['owner_name']) === '') {
			throw new ApiException(ErrorType::missingField('owner_name'), 422);
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
			trim((string) $data['owner_name']),
			$data['temperature_sensation'] ?? null,
			isset($data['bubbles']) ? (bool) $data['bubbles'] : false,
			$data['details'] ?? null,
			$data['current_usage'] ?? null,
			(float) $data['latitude'],
			(float) $data['longitude']
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
	}
}
