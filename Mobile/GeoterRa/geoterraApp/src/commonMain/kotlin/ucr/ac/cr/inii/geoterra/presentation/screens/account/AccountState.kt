package ucr.ac.cr.inii.geoterra.presentation.screens.account

import ucr.ac.cr.inii.geoterra.data.model.responses.UserResponse

data class AccountState(
	val isLoading: Boolean = false,
	val user: UserResponse? = null,
	val isDarkMode: Boolean = false,
	val error: String? = null,
	val successMessage: String? = null
)