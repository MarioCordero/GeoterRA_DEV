package com.inii.geoterra.development.interfaces

/**
 * @brief Interface for fragment-to-host communication
 *
 * Defines a contract for handling events propagated from fragments to their host components
 * (Activities or parent Fragments). Provides default no-op implementation for optional usage.
 */
interface FragmentListener {
  /**
   * @brief Handles fragment-generated events
   * @param event String identifier representing the event type
   * @param data Optional payload accompanying the event
   *
   * Implementers should override this method to handle specific fragment events.
   * Default empty implementation allows selective override of only needed events.
   *
   * Usage example:
   * ```
   * override fun onFragmentEvent(event: String, data: Any?) {
   *     when(event) {
   *         "NAVIGATE_EVENT" -> handleNavigation(data)
   *         "DATA_UPDATE_EVENT" -> updateViewModel(data)
   *     }
   * }
   * ```
   */
  fun onFragmentEvent(event: String, data: Any? = null) {
    // Default empty implementation to allow optional event handling
    // Override in concrete implementations for specific event processing
  }
}