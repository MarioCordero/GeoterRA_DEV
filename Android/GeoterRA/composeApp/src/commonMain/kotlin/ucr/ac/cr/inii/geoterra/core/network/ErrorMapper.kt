package ucr.ac.cr.inii.geoterra.core.network

/**
 * Maps technical API error codes to user-friendly messages.
 * Matches the ErrorType.php logic from the backend.
 */
object ErrorMapper {
    fun mapCodeToMessage(errorCode: String): String {
        return when (errorCode) {
            "INVALID_CREDENTIALS" -> "The email or password you entered is incorrect."
            "MISSING_AUTH_TOKEN" -> "Your session has expired. Please log in again."
            "INVALID_TOKEN" -> "Invalid session. Please sign in again."
            "EMAIL_ALREADY_IN_USE" -> "This email is already registered."
            "WEAK_PASSWORD" -> "Your password is too weak. Use at least 8 characters."
            "INVALID_EMAIL" -> "Please enter a valid email address."
            "NOT_FOUND" -> "The requested resource was not found."
            "INTERNAL_ERROR" -> "A server error occurred. Please try again later."
            "FORBIDDEN_ACCESS" -> "You do not have permission to perform this action."
            else -> "An unexpected error occurred ($errorCode). Please try again."
        }
    }
}