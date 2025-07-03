package com.inii.geoterra.development.interfaces

/**
 * @brief Interface for receiving and processing string messages
 *
 * Defines a callback mechanism to handle incoming string-based messages.
 * Implementers should register this listener to receive message notifications.
 *
 * Typical use cases:
 * - Network message reception
 * - Real-time data streaming
 * - Cross-component communication
 */
interface MessageListener {
  /**
   * @brief Called when a new message is available
   * @param message The received message content as String
   * @param data Optional payload accompanying the message
   *
   * Implementations must override this method to process incoming messages.
   *
   * Example implementation:
   * ```
   * override fun onMessageReceived(message: String, data: Any?) {
   *     when {
   *         message.startsWith("ERROR:") -> showErrorAlert(message)
   *         message == "REFRESH_DATA" -> fetchLatestData(data)
   *         else -> logMessage(message)
   *     }
   * }
   * ```
   */
  fun onMessageReceived(message: String, data: Any? = null)
}