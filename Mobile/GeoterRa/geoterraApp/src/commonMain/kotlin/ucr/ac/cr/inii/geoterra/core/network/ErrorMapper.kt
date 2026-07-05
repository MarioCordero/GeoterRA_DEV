package ucr.ac.cr.inii.geoterra.core.network


/**
 * Maps technical API error codes to user-friendly messages.
 * Matches the ErrorType.php logic from the backend.
 */
object ErrorMapper {

  const val INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
  const val INVALID_FIELD = "INVALID_FIELD"
  const val MISSING_FIELD = "MISSING_FIELD"
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

  fun mapCodeToMessage(errorCode: String, errorMessage: String?): String {
    return when (errorCode) {
      INVALID_FIELD -> errorMessage ?: "Uno de los campos es inválido. Por favor, verifica los datos."
      MISSING_FIELD -> errorMessage ?: "Uno de los campos es faltante. Por favor, completa todos los campos."
      INVALID_CREDENTIALS -> errorMessage ?: "El correo o la contraseña son incorrectos."
      MISSING_AUTH_TOKEN -> errorMessage ?: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo."
      INVALID_ACCESS_TOKEN -> errorMessage ?: "El token de acceso proporcionado no es válido."
      INVALID_REFRESH_TOKEN -> errorMessage ?: "El token de actualización proporcionado no es válido."
      EMAIL_ALREADY_IN_USE -> errorMessage ?: "Este correo electrónico ya está registrado."
      WEAK_PASSWORD -> errorMessage ?: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial."
      INVALID_EMAIL -> errorMessage ?: "Por favor, ingresa una dirección de correo válida."
      NOT_FOUND -> errorMessage ?: "El recurso solicitado no fue encontrado."
      INTERNAL_ERROR -> errorMessage ?: "Ocurrió un error en el servidor. Por favor, intenta más tarde."
      FORBIDDEN_ACCESS -> errorMessage ?: "No tienes permiso para realizar esta acción."
      else -> "Ocurrió un error inesperado ($errorCode). Por favor, intenta de nuevo."
    }
  }
}