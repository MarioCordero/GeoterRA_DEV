package ucr.ac.cr.inii.geoterra.presentation.screens.home

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Shared ViewModel for Home screen.
 *
 * Does not depend on Android lifecycle.
 */
class HomeViewModel {
  
  private val _state = MutableStateFlow(HomeState())
  val state: StateFlow<HomeState> = _state.asStateFlow()
  
  /**
   * Example event handler.
   */
  fun onCardSelected() {

  }
}