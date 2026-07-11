package ucr.ac.cr.inii.geoterra.presentation.base

import cafe.adriel.voyager.core.model.ScreenModel
import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * Base architecture component for managing UI state using Voyager's ScreenModel.
 * Provides thread-safe state mutation mechanisms for Kotlin Multiplatform.
 *
 * @param State The immutable data class representing the UI state layout.
 */
abstract class BaseScreenModel<State>(initialState: State) : ScreenModel {

  /**
   * Internal backing property holding the mutable state flow stream.
   */
  protected val _state = MutableStateFlow(initialState)

  /**
   * Public read-only state flow exposed to UI Composables.
   */
  val state = _state.asStateFlow()

  /**
   * Performs an atomic, thread-safe update on the current state.
   * Essential for handling rapid synchronous mutations or multi-threaded background updates.
   *
   * @param block Lambda function exposing the current state snapshot and returning the mutated state.
   */
  protected fun updateState(block: (State) -> State) {
    _state.update { currentState -> block(currentState) }
  }
}