package ucr.ac.cr.inii.geoterra.presentation.screens.editProfile

data class EditProfileState(
  val name: String = "",
  val lastname: String = "",
  val email: String = "",
  val phoneNumber: String = "",
  val isLoading: Boolean = false,
  val nameError: String? = null,
  val lastnameError: String? = null,
  val emailError: String? = null,
  val snackBarMessage: String? = null,
  val isSuccess: Boolean = false,
  val errorMessage: String? = null
)