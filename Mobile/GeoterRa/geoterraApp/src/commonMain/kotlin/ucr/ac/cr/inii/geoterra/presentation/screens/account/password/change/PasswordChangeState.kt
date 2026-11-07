package ucr.ac.cr.inii.geoterra.presentation.screens.account.password.change

import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class PasswordChangeState(
	val currentPassword: String = "",
	val newPassword: String = "",
	val confirmPassword: String = "",
	val isPasswordVisible: Boolean = false,
	val isLoading: Boolean = false,
	val isSuccess: Boolean = false,
	val fieldErrors: Map<String, String> = emptyMap(),
	val snackBarMessage: SnackbarMessage? = null
)