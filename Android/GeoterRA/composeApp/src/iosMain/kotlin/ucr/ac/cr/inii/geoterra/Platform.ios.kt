package ucr.ac.cr.inii.geoterra

import platform.UIKit.UIDevice

class IOSPlatform : Platform {
  override val name: String =
    UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
  override val isIOS: Boolean = true
}

actual fun getPlatform(): Platform = IOSPlatform()