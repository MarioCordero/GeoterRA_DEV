package ucr.ac.cr.inii.geoterra.presentation.screens.editProfile

data class EditProfileState(
  val name: String = "",
  val lastname: String = "",
  val email: String = "",
  val phoneNumber: String = "",
  val isLoading: Boolean = false,
  val fieldErrors: Map<String, String> = emptyMap(),
  val error: String? = null,
  val snackBarMessage: String? = null,
  val isSuccess: Boolean = false
)