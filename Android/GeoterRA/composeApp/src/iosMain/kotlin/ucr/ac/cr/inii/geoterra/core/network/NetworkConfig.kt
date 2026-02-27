package ucr.ac.cr.inii.geoterra.core.network

// iosMain
actual object NetworkConfig {
  // iOS simulator shares the network with the host machine
  actual val BASE_URL: String = "http://192.168.1.11:80/api/public/"
}