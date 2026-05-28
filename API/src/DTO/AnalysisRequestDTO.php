<?php
// src/DTO/AnalysisRequestDTO.php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *   schema="AnalysisRequestDTO",
 *   type="object",
 *   description="Solicitud de análisis de punto geotérmico",
 *   required={"region", "email", "temperature_sensation", "latitude", "longitude"},
 *   @OA\Property(
 *     property="region",
 *     type="integer",
 *     description="ID de la región",
 *     example=1
 *   ),
 *   @OA\Property(
 *     property="email",
 *     type="string",
 *     format="email",
 *     description="Email de contacto del solicitante",
 *     example="contact@example.com"
 *   ),
 *   @OA\Property(
 *     property="owner_contact_number",
 *     type="string",
 *     nullable=true,
 *     description="Número de contacto del dueño",
 *     example="87654321"
 *   ),
 *   @OA\Property(
 *     property="owner_name",
 *     type="string",
 *     nullable=true,
 *     description="Nombre del dueño del terreno",
 *     example="Carlos Mendoza"
 *   ),
 *   @OA\Property(
 *     property="temperature_sensation",
 *     type="string",
 *     enum={"Muy frío", "Frío", "Templado", "Cálido", "Muy Caliente", "caliente"},
 *     description="Percepción térmica del lugar",
 *     example="Cálido"
 *   ),
 *   @OA\Property(
 *     property="bubbles",
 *     type="boolean",
 *     description="¿Hay burbujas de gas?",
 *     example=false
 *   ),
 *   @OA\Property(
 *     property="details",
 *     type="string",
 *     nullable=true,
 *     description="Detalles adicionales del punto",
 *     example="Zona con actividad geotérmica notable"
 *   ),
 *   @OA\Property(
 *     property="current_usage",
 *     type="string",
 *     nullable=true,
 *     description="Uso actual del terreno",
 *     example="Agrícola"
 *   ),
 *   @OA\Property(
 *     property="latitude",
 *     type="number",
 *     format="float",
 *     description="Latitud del punto en grados decimales",
 *     example=10.4630
 *   ),
 *   @OA\Property(
 *     property="longitude",
 *     type="number",
 *     format="float",
 *     description="Longitud del punto en grados decimales",
 *     example=-85.4519
 *   ),
 *   @OA\Property(
 *     property="state",
 *     type="string",
 *     nullable=true,
 *     enum={"Registrada", "En revisión", "Verificación de campo", "Análisis en laboratorio", "Aprobada", "Rechazada", "Archivada"},
 *     description="Estado actual de la solicitud",
 *     example="Registrada"
 *   )
 * )
 */
final class AnalysisRequestDTO
{
	public function __construct(
		public int $region,
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
			(int) $data['region'],
			strtolower(trim((string) $data['email'])),
			$data['owner_contact_number'] ?? null,
			trim((string) $data['owner_name']) ?: null,
			$data['temperature_sensation'],
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
		// Validate email format
		if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
			throw new ApiException(
				ErrorType::invalidField('email'),
				422
			);
		}

		// Validate temperature_sensation ENUM
		$validTemperatureSensations = ['Muy frío', 'Frío', 'Templado', 'Cálido', 'Muy Caliente', 'caliente'];
		if (!in_array($this->temperature_sensation, $validTemperatureSensations, true)) {
			throw new ApiException(
				ErrorType::invalidField(
					"percepción térmica: debe ser uno de ['Muy frío', 'Frío', 'Templado', 'Cálido', 'Muy Caliente', 'caliente']"
				),
				422
			);
		}

		// Validate state ENUM if provided
		if ($this->state !== null) {
			$validStates = ['Analizada', 'Registrada', 'En revisión', 'Verificación de campo', 'Análisis en laboratorio', 'Aprobada', 'Rechazada', 'Archivada'];
			if (!in_array($this->state, $validStates, true)) {
				throw new ApiException(
					ErrorType::invalidField(
						"estado: debe ser uno de ['Analizada', 'Registrada', 'En revisión', 'Verificación de campo', 'Análisis en laboratorio', 'Aprobada', 'Rechazada', 'Archivada']"
					),
					422
				);
			}
		}
	}
}
