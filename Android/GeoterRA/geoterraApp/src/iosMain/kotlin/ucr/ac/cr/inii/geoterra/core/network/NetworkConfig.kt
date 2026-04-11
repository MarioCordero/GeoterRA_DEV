package ucr.ac.cr.inii.geoterra.core.network

// iosMain
actual object NetworkConfig {
  // iOS simulator shares the network with the host machine
  actual val BASE_URL: String = "http://163.178.171.105/API/public/"
}