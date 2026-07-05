package ucr.ac.cr.inii.geoterra.core.network
import ucr.ac.cr.inii.geoterra.AppConfig


actual object NetworkConfig {
  // iOS simulator shares the network with the host machine
  actual val API_URL: String = AppConfig.API_URL

  actual val API_KEY : String = AppConfig.IOS_API_KEY

}