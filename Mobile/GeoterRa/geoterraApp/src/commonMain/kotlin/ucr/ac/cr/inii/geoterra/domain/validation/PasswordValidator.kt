package ucr.ac.cr.inii.geoterra.domain.validation

object PasswordValidator {

	/**
	 * Returns a string with the missing requirements if the password is not valid,
	 * otherwise returns null.
	 */
	fun getMissingRequirementsMessage(password: String): String? {
		if (password.isEmpty()) return "La contraseña es requerida."

		val missingRequirements = mutableListOf<String>()

		if (password.length < 8) missingRequirements.add("al menos 8 caracteres")
		if (!password.contains(Regex("[A-Z]"))) missingRequirements.add("una letra mayúscula")
		if (!password.contains(Regex("[a-z]"))) missingRequirements.add("una letra minúscula")
		if (!password.contains(Regex("\\d"))) missingRequirements.add("un número")
		if (!password.contains(Regex("[\\W_]"))) missingRequirements.add("un carácter especial")

		return if (missingRequirements.isNotEmpty()) {
			"La contraseña debe incluir: ${missingRequirements.joinToString(", ")}."
		} else {
			null
		}
	}
}