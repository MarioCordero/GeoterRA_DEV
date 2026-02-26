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
		return new self('INVALID_JSON', 'Malformed or invalid JSON payload');
	}

	/**
	 * Generic validation error for a specific field.
	 */
	public static function invalidField(string $field): self
	{
		return new self("INVALID_FIELD", "Invalid value for field '{$field}'");
	}

	/**
	 * Error for missing required fields.
	 */
	public static function missingField(string $field): self
	{
		return new self("MISSING_FIELD", "Required field '{$field}' is missing");
	}

	/**
	 * Error for invalid email format.
	 */
	public static function invalidEmail(): self
	{
		return new self('INVALID_EMAIL', 'Email format is not valid');
	}

	/**
	 * Error when email is already registered.
	 */
	public static function emailAlreadyInUse(): self
	{
		return new self('EMAIL_ALREADY_IN_USE', 'The provided email is already registered');
	}

	/**
	 * Error for password not meeting security requirements.
	 */
	public static function weakPassword(): self
	{
		return new self('WEAK_PASSWORD', 'Password does not meet minimum security requirements');
	}

	/**
	 * Error for authentication failures.
	 */
	public static function invalidCredentials(): self
	{
		return new self('INVALID_CREDENTIALS', 'Incorrect email or password');
	}

	public static function userUpdateFailed(): self
{
  return new self(
    'USER_UPDATE_FAILED',
    'Failed to update user information'
  );
}

	public static function userDeleteFailed(): self
	{
		return new self(
			'USER_DELETE_FAILED',
			'Failed to delete user account'
		);
	}

	public static function userAlreadyDeleted(): self
	{
		return new self(
			'USER_ALREADY_DELETED',
			'User account is already deleted'
		);
	}

	/**
	 * Missing authentication token in headers.
	 */
	public static function missingAuthToken(): self
	{
		return new self('MISSING_AUTH_TOKEN', 'Authorization token is required');
	}

	/**
	 * Token provided is invalid or expired.
	 */
	public static function invalidAccessToken(): self
	{
		return new self('INVALID_ACCESS_TOKEN', 'Authorization token is invalid or expired');
	}

	public static function invalidRefreshToken(): self
	{
		return new self('INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
	}

	public static function unknownAccessToken(): self
	{
		return new self('UNKNOWN_TOKEN', 'The provided token is not recognized');
	}

	public static function sessionAlreadyRevoked(): self
	{
		return new self('SESSION_ALREADY_REVOKED', 'The session has already been revoked');
	}

	public static function logoutFailed(): self
	{
		return new self('LOGOUT_FAILED', 'Unable to logout user');
	}
	/**
	 * Unauthorized access to a resource.
	 */
	public static function unauthorized(): self
	{
		return new self('UNAUTHORIZED_ACCESS', 'You do not have permission to access this resource');
	}

	public static function latitudeRequired(): self
	{
		return new self('LATITUDE_REQUIRED', 'Latitude is required');
	}

	public static function longitudeRequired(): self
	{
		return new self('LONGITUDE_REQUIRED', 'Longitude is required');
	}

		public static function invalidRegion(string $region): self
  {
    return new self(
      'INVALID_REGION',
      "Region '{$region}' is not allowed"
		);
  }

  // public static function allowedRegions(): self
  // {
  //   return [
  //     'Guanacaste',
  //     'Alajuela',
  //     'San José',
  //     'Puntarenas',
  //     'Cartago',
  //     'Heredia',
  //     'Limón'
  //   ];
  // }

  public static function manifestationCreateFailed(): self
  {
    return new self(
      'MANIFESTATION_CREATE_FAILED',
      'Failed to create registered manifestation'
    );
  }

	public static function analysisRequestNotFound(): self
	{
		return new self(
			'ANALYSIS_REQUEST_NOT_FOUND',
			'Analysis request not found'
		);
	}

	public static function analysisRequestForbidden(): self
	{
		return new self(
			'ANALYSIS_REQUEST_FORBIDDEN',
			'You do not have permission to modify this analysis request'
		);
	}

	public static function analysisRequestUpdateFailed(): self
	{
		return new self(
			'ANALYSIS_REQUEST_UPDATE_FAILED',
			'Failed to update analysis request'
		);
	}

	public static function analysisRequestDeleteFailed(): self
	{
		return new self(
			'ANALYSIS_REQUEST_DELETE_FAILED',
			'Failed to delete analysis request'
		);
	}

	public static function manifestationUpdateFailed(): self
	{
		return new self(
			'MANIFESTATION_UPDATE_FAILED',
			'Failed to update registered manifestation'
		);
	}

	public static function manifestationDeleteFailed(): self
	{
		return new self(
			'MANIFESTATION_DELETE_FAILED',
			'Failed to delete registered manifestation'
		);
	}

	/**
	 * Forbidden access to a resource.
	 */
	public static function forbidden(): self
	{
		return new self('FORBIDDEN_ACCESS', 'Access to this resource is forbidden');
	}

	/**
	 * Resource not found error.
	 */
	public static function notFound(string $resource = 'Resource'): self
	{
		return new self("NOT_FOUND", "Resource {$resource} not found");
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
}
?>