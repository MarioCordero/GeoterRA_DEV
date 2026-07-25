package ucr.ac.cr.inii.geoterra.presentation.screens.account

import ucr.ac.cr.inii.geoterra.data.model.responses.UserResponse
import ucr.ac.cr.inii.geoterra.presentation.components.common.SnackbarMessage

data class AccountState(
	val isLoading: Boolean = false,
	val user: UserResponse? = null,
	val isDarkMode: Boolean = false,
	val snackBarMessage: SnackbarMessage? = null
)