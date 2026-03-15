package ucr.ac.cr.inii.geoterra.presentation.screens.account

import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import ucr.ac.cr.inii.geoterra.domain.repository.UserRepositoryInterface
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEvent
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEventBus
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

class AccountViewModel(
  private val userRepository: UserRepositoryInterface,
  private val authEventBus: AuthEventBus
) : BaseScreenModel<AccountState>(AccountState()) {
  
  init {
    loadUserProfile()
  }
  
  fun loadUserProfile() {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true, error = null) }
      userRepository.getMe()
        .onSuccess { user -> _state.update { it.copy(user = user, isLoading = false) } }
        .onFailure { e -> _state.update { it.copy(error = e.message, isLoading = false) } }
    }
  }

  fun deleteAccount() {
    screenModelScope.launch {
      _state.update { it.copy(isLoading = true, error = null) }
      userRepository.deleteMe()
        .onSuccess { _state.update { it.copy(isLoading = false) } }
        .onFailure { e -> _state.update { it.copy(error = e.message, isLoading = false) } }
    }
  }

  fun toggleTheme(isDark: Boolean) {
    _state.update { it.copy(isDarkMode = isDark) }

  }

  fun logout() {
    screenModelScope.launch {
      authEventBus.emit(AuthEvent.Logout)
    }
  }
}