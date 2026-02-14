package ucr.ac.cr.inii.geoterra.presentation.screens.account

import ucr.ac.cr.inii.geoterra.data.model.remote.UserRemote

data class AccountState(
    val isLoading: Boolean = false,
    val user: UserRemote? = null,
    val error: String? = null,
    val successMessage: String? = null
)