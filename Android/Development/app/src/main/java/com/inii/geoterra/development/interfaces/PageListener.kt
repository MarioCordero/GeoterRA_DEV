package com.inii.geoterra.development.interfaces

import timber.log.Timber

/**
 * @brief Interface for fragment-to-host communication
 *
 * Defines a contract for handling events propagated from fragments to their host components
 * (Activities or parent Fragments). Provides default no-op implementation for optional usage.
 */
interface PageListener {
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
  fun onPageEvent(event: String, data: Any? = null) {
    // Default empty implementation to allow optional event handling
    // Override in concrete implementations for specific event processing
    Timber.d(this.javaClass.simpleName +
               " received parent event: $event with data: $data")
  }

  fun onParentEvent(event: String, data: Any?) {
    Timber.d(this.javaClass.simpleName +
               " received parent event: $event with data: $data")
  }

  /**
   * Allows fragment to request data and get an immediate response.
   *
   * @param event Request type identifier.
   * @param data Optional input data for the request.
   * @return Any? Response object or null if not available.
   */
  fun onPageRequest(event: String, data: Any?): Any? {
    return null
  }

  /** Allows fragment to request data and get an async response.
  *
  * @param event Request type identifier.
  * @param data Optional input data for the request.
  * @return Any? Response object or null if not available.
  */
  fun onPageRequestDataAsync(event: String, data: Any?, callback: (Any?) -> Unit) {
    Timber.d(this.javaClass.simpleName +
               " received parent event: $event with data: $data")
    callback(null)
  }
}