package ucr.ac.cr.inii.geoterra

import androidx.compose.ui.window.ComposeUIViewController
import ucr.ac.cr.inii.geoterra.core.di.initKoin

fun MainViewController() = ComposeUIViewController {
  initKoin()
  App()
}