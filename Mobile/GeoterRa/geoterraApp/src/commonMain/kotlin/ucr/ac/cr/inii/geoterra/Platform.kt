package ucr.ac.cr.inii.geoterra

interface Platform {
  val name: String
  val isIOS: Boolean
}

expect fun getPlatform(): Platform