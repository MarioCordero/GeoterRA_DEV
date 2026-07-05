package ucr.ac.cr.inii.geoterra.core.network

/**
 * Platform-specific base URL provider.
 */
expect object NetworkConfig {
  val API_URL: String
  val API_KEY : String
}