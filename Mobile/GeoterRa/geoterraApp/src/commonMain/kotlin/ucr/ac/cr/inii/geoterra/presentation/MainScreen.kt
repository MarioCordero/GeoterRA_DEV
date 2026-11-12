package ucr.ac.cr.inii.geoterra.presentation

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveableStateHolder
import androidx.compose.ui.Modifier
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.tab.TabNavigator
import org.koin.compose.koinInject
import ucr.ac.cr.inii.geoterra.presentation.components.common.BottomNavBar
import ucr.ac.cr.inii.geoterra.presentation.navigation.AccountTab
import ucr.ac.cr.inii.geoterra.presentation.navigation.FieldTripTab
import ucr.ac.cr.inii.geoterra.presentation.navigation.HomeTab
import ucr.ac.cr.inii.geoterra.presentation.navigation.MapTab
import ucr.ac.cr.inii.geoterra.presentation.navigation.RequestTab
import ucr.ac.cr.inii.geoterra.presentation.screens.account.AccountViewModel

class MainScreen : Screen {
	@Composable
	override fun Content() {
		val accountViewModel: AccountViewModel = koinInject()
		val accountState by accountViewModel.state.collectAsState()

		val isFieldTripMode = accountState.isFieldTripMode

		val actionTab = if (isFieldTripMode) FieldTripTab else RequestTab
		val tabs = remember(isFieldTripMode) {
			listOf(HomeTab, MapTab, actionTab, AccountTab)
		}

		TabNavigator(HomeTab) { tabNavigator ->
			val saveableStateHolder = rememberSaveableStateHolder()

			Scaffold(
				containerColor = MaterialTheme.colorScheme.background,
				bottomBar = {
					BottomNavBar(
						items = tabs,
						tabNavigator = tabNavigator
					)
				}
			) { padding ->
				Box(Modifier.padding(padding)) {
					AnimatedContent(
						targetState = tabNavigator.current,
						transitionSpec = {
							fadeIn(animationSpec = tween(250)) togetherWith
									fadeOut(animationSpec = tween(250))
						},
						label = "TabTransition"
					) { tab ->
						saveableStateHolder.SaveableStateProvider(tab.key) {
							tab.Content()
						}
					}
				}
			}
		}
	}
}