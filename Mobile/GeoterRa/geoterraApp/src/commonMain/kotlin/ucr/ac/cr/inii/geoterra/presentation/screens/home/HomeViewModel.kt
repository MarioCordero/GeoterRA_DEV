package ucr.ac.cr.inii.geoterra.presentation.screens.home

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import ucr.ac.cr.inii.geoterra.presentation.base.BaseScreenModel

/**
 * Shared ViewModel for Home screen.
 *
 * Does not depend on Android lifecycle.
 */
class HomeViewModel : BaseScreenModel<HomeState>(HomeState()) {
  
  /**
   * Example event handler.
   */
  fun onCardSelected() {

  }
}