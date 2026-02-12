package ucr.ac.cr.inii.geoterra.presentation.base

import cafe.adriel.voyager.core.model.ScreenModel
import cafe.adriel.voyager.core.model.screenModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

abstract class BaseScreenModel<State>(initialState: State) : ScreenModel {
    protected val _state = MutableStateFlow(initialState)
    val state = _state.asStateFlow()

    protected fun updateState(block: (State) -> State) {
        _state.value = block(_state.value)
    }
}