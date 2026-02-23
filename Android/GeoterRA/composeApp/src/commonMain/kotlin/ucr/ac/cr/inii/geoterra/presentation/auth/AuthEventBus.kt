package ucr.ac.cr.inii.geoterra.presentation.auth

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

class AuthEventBus {
  private val _events = MutableSharedFlow<Unit>(replay = 0)
  val unauthorizedEvents = _events.asSharedFlow()
  
  suspend fun emitUnauthorized() {
    _events.emit(Unit)
  }
}