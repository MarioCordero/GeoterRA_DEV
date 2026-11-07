package ucr.ac.cr.inii.geoterra.presentation.screens.account.password.recovery

import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

/**
 * Holds the UI state for the password recovery screen.
 *
 * @property step The current stage of the password recovery process.
 * @property email The user's email address.
 * @property token The OTP token received by the user.
 * @property newPassword The new password chosen by the user.
 * @property isPasswordVisible Controls the visibility of the password input field.
 * @property confirmPassword The password confirmation input field.
 * @property isLoading Indicates if a network operation is in progress.
 * @property isSuccess Indicates if the password reset process was completed successfully.
 * @property fieldErrors A map containing form validation errors.
 * @property snackBarMessage An optional message to display in the UI snackbar.
 */
data class PasswordRecoveryState(
	val step: Step = Step.REQUEST_EMAIL,
	val email: String = "",
	val token: String = "",
	val newPassword: String = "",
	val confirmPassword: String = "",
	val isPasswordVisible: Boolean = false,
	val isLoading: Boolean = false,
	val isSuccess: Boolean = false,
	val fieldErrors: Map<String, String> = emptyMap(),
	val snackBarMessage: SnackbarMessage? = null
) {
	enum class Step {
		REQUEST_EMAIL,
		RESET_PASSWORD
	}
}