package ucr.ac.cr.inii.geoterra.presentation

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.core.screen.Screen
import cafe.adriel.voyager.navigator.tab.CurrentTab
import cafe.adriel.voyager.navigator.tab.LocalTabNavigator
import cafe.adriel.voyager.navigator.tab.Tab
import cafe.adriel.voyager.navigator.tab.TabNavigator
import com.russhwolf.settings.Settings
import org.koin.compose.koinInject
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
      Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
          ModernBottomNavigationBar(
            items = tabs,
            tabNavigator = tabNavigator
          )
        }
      ) { padding ->
        Box(Modifier.padding(padding)) {
          CurrentTab()
        }
      }
    }
  }
}

@Composable
fun ModernBottomNavigationBar(
  items: List<Tab>,
  tabNavigator: TabNavigator
) {
  Surface(
    modifier = Modifier
      .fillMaxWidth()
      .padding(start = 16.dp, end = 16.dp, bottom = 24.dp),
    shape = RoundedCornerShape(32.dp),
    color = MaterialTheme.colorScheme.surface,
    shadowElevation = 8.dp
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(vertical = 8.dp),
      horizontalArrangement = Arrangement.SpaceEvenly
    ) {
      items.forEach { tab ->
        val isSelected = tabNavigator.current.key == tab.key

        Column(
          horizontalAlignment = Alignment.CenterHorizontally,
          modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable { tabNavigator.current = tab }
            .padding(8.dp)
        ) {
          Icon(
            painter = tab.options.icon!!,
            contentDescription = tab.options.title,
            tint = if (isSelected) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.outline
          )
          Text(
            text = tab.options.title,
            style = MaterialTheme.typography.labelSmall,
            color = if (isSelected) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.outline
          )
        }
      }
    }
  }
}
