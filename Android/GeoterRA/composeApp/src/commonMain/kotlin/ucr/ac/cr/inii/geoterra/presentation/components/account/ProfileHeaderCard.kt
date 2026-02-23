package ucr.ac.cr.inii.geoterra.presentation.components.account

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ucr.ac.cr.inii.geoterra.data.model.remote.UserRemote

@Composable
fun ProfileHeaderCard(user: UserRemote) {
  Card(
    modifier = Modifier.fillMaxWidth(),
    colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
    shape = RoundedCornerShape(24.dp)
  ) {
    Row(modifier = Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
      Box(
        modifier = Modifier.size(65.dp).background(Color(0xFFE0E0E0), CircleShape),
        contentAlignment = Alignment.Center
      ) {
        Text(
          "${user.first_name.first()}${user.last_name.first()}",
          fontWeight = FontWeight.Bold,
          fontSize = 24.sp
        )
      }
      Spacer(Modifier.width(16.dp))
      Column {
        Text(
          "${user.first_name} ${user.last_name}",
          style = MaterialTheme.typography.titleLarge,
          fontWeight = FontWeight.Bold
        )
        Text(
          "Miembro desde: ${user.created_at.take(10)}",
          style = MaterialTheme.typography.bodySmall,
          color = Color.Gray
        )
      }
    }
  }
}