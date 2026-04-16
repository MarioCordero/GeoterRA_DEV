package ucr.ac.cr.inii.geoterra.core.network
import ucr.ac.cr.inii.geoterra.AppConfig

actual object NetworkConfig {
  actual val API_URL: String = AppConfig.API_URL

  actual val API_KEY : String = AppConfig.ANDROID_API_KEY
}