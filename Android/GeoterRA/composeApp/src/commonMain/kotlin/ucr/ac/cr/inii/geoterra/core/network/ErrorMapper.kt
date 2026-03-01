package ucr.ac.cr.inii.geoterra.core.network


/**
 * Maps technical API error codes to user-friendly messages.
 * Matches the ErrorType.php logic from the backend.
 */
object ErrorMapper {

  const val INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
  const val MISSING_AUTH_TOKEN = "MISSING_AUTH_TOKEN"
  const val INVALID_ACCESS_TOKEN = "INVALID_ACCESS_TOKEN"
  const val INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN"
  const val EMAIL_ALREADY_IN_USE = "EMAIL_ALREADY_IN_USE"
  const val WEAK_PASSWORD = "WEAK_PASSWORD"
  const val INVALID_EMAIL = "INVALID_EMAIL"
  const val NOT_FOUND = "NOT_FOUND"
  const val INTERNAL_ERROR = "INTERNAL_ERROR"
  const val FORBIDDEN_ACCESS = "FORBIDDEN_ACCESS"
  val authErrorCodes = listOf(
    MISSING_AUTH_TOKEN,
    INVALID_ACCESS_TOKEN,
    INVALID_REFRESH_TOKEN
  )

  fun isAuthError(errorCode: String): Boolean {
    return errorCode in authErrorCodes
  }

  fun mapCodeToMessage(errorCode: String): String {
    return when (errorCode) {
      INVALID_CREDENTIALS -> "The email or password you entered is incorrect."
      MISSING_AUTH_TOKEN -> "Your session has expired. Please log in again."
      INVALID_ACCESS_TOKEN -> "The provided access token is invalid."
      INVALID_REFRESH_TOKEN -> "The provided refresh token is invalid."
      EMAIL_ALREADY_IN_USE -> "This email is already registered."
      WEAK_PASSWORD -> "Your password is too weak. Use at least 8 characters."
      INVALID_EMAIL -> "Please enter a valid email address."
      NOT_FOUND -> "The requested resource was not found."
      INTERNAL_ERROR -> "A server error occurred. Please try again later."
      FORBIDDEN_ACCESS -> "You do not have permission to perform this action."
      else -> "An unexpected error occurred ($errorCode). Please try again."
    }
  }
}