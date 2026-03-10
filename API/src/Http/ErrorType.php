<?php
declare(strict_types=1);

namespace Http;

use JsonSerializable;

/**
 * Class to standardize API error responses with detailed codes
 * and descriptive messages. 
 * The code is a machine-readable identifier, while the message
 * is human-readable and explains the issue.
 */
final class ErrorType implements JsonSerializable
{
	public function __construct(
		private string $code,
		private string $message,
	) {
	}

	/**
	 * Generic constructor from code and message.
	 */
	public static function from(string $code, string $message): self
	{
		return new self($code, $message);
	}

	/**
	 * Error for invalid JSON payloads.
	 */
	public static function invalidJson(): self
	{
		return new self('INVALID_JSON', 'El cuerpo de la solicitud (JSON) está malformado o no es válido');
	}

	/**
	 * Generic validation error for a specific field.
	 */
	public static function invalidField(string $field): self
	{
		return new self("INVALID_FIELD", "El valor proporcionado para el campo '{$field}' no es válido");
	}

	/**
	 * Error for missing required fields.
	 */
	public static function missingField(string $field): self
	{
		return new self("MISSING_FIELD", "El campo obligatorio '{$field}' no se encuentra en la solicitud");
	}

	/**
	 * Error for invalid email format.
	 */
	public static function invalidEmail(): self
	{
		return new self('INVALID_EMAIL', 'El formato del correo electrónico no es válido');
	}

	/**
	 * Error when email is already registered.
	 */
	public static function emailAlreadyInUse(): self
	{
		return new self('EMAIL_ALREADY_IN_USE', 'El correo electrónico proporcionado ya se encuentra registrado');
	}

	/**
	 * Error for password not meeting security requirements.
	 */
	public static function weakPassword(): self
	{
		return new self('WEAK_PASSWORD', 'La contraseña no cumple con los requisitos mínimos de seguridad');
	}

	/**
	 * Error for authentication failures.
	 */
	public static function invalidCredentials(): self
	{
		return new self('INVALID_CREDENTIALS', 'El correo electrónico o la contraseña son incorrectos');
	}

	public static function userUpdateFailed(): self
	{
		return new self('USER_UPDATE_FAILED', 'No se pudo actualizar la información del usuario');
	}

	public static function userDeleteFailed(): self
	{
		return new self('USER_DELETE_FAILED', 'No se pudo eliminar la cuenta de usuario');
	}

	public static function userAlreadyDeleted(): self
	{
		return new self('USER_ALREADY_DELETED', 'La cuenta de usuario ya ha sido eliminada anteriormente');
	}

	/**
	 * Missing authentication token in headers.
	 */
	public static function missingAuthToken(): self
	{
		return new self('MISSING_AUTH_TOKEN', 'Se requiere un token de autorización para realizar esta acción');
	}

	/**
	 * Token provided is invalid or expired.
	 */
	public static function invalidAccessToken(): self
	{
		return new self('INVALID_ACCESS_TOKEN', 'El token de acceso no es válido o ha expirado');
	}

	public static function invalidRefreshToken(): self
	{
  	return new self('INVALID_REFRESH_TOKEN', 'El token de actualización no es válido o ha expirado');
	}

	public static function unknownAccessToken(): self
	{
  return new self('UNKNOWN_TOKEN', 'El token proporcionado no es reconocido por el sistema');
	}

	public static function sessionAlreadyRevoked(): self
	{
		return new self('SESSION_ALREADY_REVOKED', 'La sesión ya ha sido revocada previamente');
	}

	public static function logoutFailed(): self
	{
		return new self('LOGOUT_FAILED', 'No se pudo cerrar la sesión del usuario');
	}

	/**
	 * Unauthorized access to a resource.
	 */
	public static function unauthorized(): self
	{
		return new self('UNAUTHORIZED_ACCESS', 'No tienes los permisos necesarios para acceder a este recurso');
	}

	public static function latitudeRequired(): self
	{
		return new self('LATITUDE_REQUIRED', 'La latitud es obligatoria');
	}

	public static function longitudeRequired(): self
	{
		return new self('LONGITUDE_REQUIRED', 'La longitud es obligatoria');
	}

  public static function invalidRegion(int|string $region): self
  {
		return new self('INVALID_REGION', "La región '{$region}' no está permitida o no existe");
  }

  public static function manifestationCreateFailed(): self
  {
		return new self('MANIFESTATION_CREATE_FAILED', 'Error al intentar registrar la manifestación');
  }

	public static function analysisRequestNotFound(): self
	{
		return new self('ANALYSIS_REQUEST_NOT_FOUND', 'No se encontró la solicitud de análisis especificada');
	}

	public static function analysisRequestForbidden(): self
	{
		return new self('ANALYSIS_REQUEST_FORBIDDEN', 'No tienes permiso para modificar esta solicitud de análisis');
	}

	public static function analysisRequestUpdateFailed(): self
	{
		return new self('ANALYSIS_REQUEST_UPDATE_FAILED', 'No se pudo actualizar la solicitud de análisis');
	}

	public static function analysisRequestDeleteFailed(): self
	{
		return new self('ANALYSIS_REQUEST_DELETE_FAILED', 'No se pudo eliminar la solicitud de análisis');
	}

	public static function manifestationUpdateFailed(): self
	{
		return new self('MANIFESTATION_UPDATE_FAILED', 'No se pudo actualizar la manifestación registrada');
	}

	public static function manifestationDeleteFailed(): self
	{
		return new self('MANIFESTATION_DELETE_FAILED', 'No se pudo eliminar la manifestación registrada');
	}

	/**
	 * Forbidden access to a resource.
	 */
	public static function forbidden(): self
	{
		return new self('FORBIDDEN_ACCESS', 'El acceso a este recurso está estrictamente prohibido');	
	}

	/**
	 * Resource not found error.
	 */
	public static function notFound(string $resource = 'Resource'): self
	{
		return new self("NOT_FOUND", "El recurso '{$resource}' no pudo ser localizado");
	}

	/**
	 * Conflict error (e.g., duplicate data).
	 */
	public static function conflict(string $message = 'Conflict'): self
	{
		return new self('CONFLICT_ERROR', $message);
	}

	/**
	 * Generic internal server error.
	 */
	public static function internal(string $detail = 'Unexpected error'): self
	{
		return new self('INTERNAL_ERROR', $detail);
	}

	/**
	 * Serialize as JSON for API response.
	 */
	public function jsonSerialize(): array
	{
		return [
			'code' => $this->code,
			'message' => $this->message,
		];
	}

	/**
     * Get HTTP status code for this error type.
     */
    public function getStatusCode(): int
    {
        return match($this->code) {
            'NOT_FOUND' => 404,
            'UNAUTHORIZED_ACCESS', 'INVALID_ACCESS_TOKEN' => 401,
            'FORBIDDEN_ACCESS' => 403,
            'INVALID_JSON', 'INVALID_FIELD', 'MISSING_FIELD' => 400,
            'CONFLICT_ERROR' => 409,
            default => 500,
        };
    }
}