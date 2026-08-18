package com.contril.app.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.WifiOff
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.contril.app.theme.StatusWarning
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun OfflineBanner(
    isOnline: Boolean,
    hasCachedData: Boolean = false,
    lastSyncedTime: Long = 0L,
    customMessage: String? = null,
    modifier: Modifier = Modifier
) {
    val formattedTime = remember(lastSyncedTime) {
        if (lastSyncedTime > 0) {
            val sdf = SimpleDateFormat("h:mm a", Locale.getDefault())
            sdf.format(Date(lastSyncedTime))
        } else {
            null
        }
    }

    AnimatedVisibility(
        visible = !isOnline,
        enter = expandVertically() + fadeIn(),
        exit = shrinkVertically() + fadeOut(),
        modifier = modifier
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 6.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(Color(0xFFFEF3C7)) // Amber-100 warning surface
                .padding(horizontal = 12.dp, vertical = 8.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    imageVector = if (hasCachedData) Icons.Default.CloudOff else Icons.Default.WifiOff,
                    contentDescription = "Offline",
                    tint = Color(0xFFD97706), // Amber-600
                    modifier = Modifier.size(18.dp)
                )

                Column(modifier = Modifier.weight(1f)) {
                    val title = customMessage ?: if (hasCachedData) {
                        "No Internet Connection"
                    } else {
                        "You're Offline"
                    }

                    val subtitle = if (hasCachedData && formattedTime != null) {
                        "Showing cached data • Last synced $formattedTime"
                    } else if (hasCachedData) {
                        "Showing cached data from previous session"
                    } else {
                        "Connect to internet to load live data"
                    }

                    Text(
                        text = title,
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        ),
                        color = Color(0xFF92400E) // Amber-800
                    )
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontSize = 11.sp,
                            lineHeight = 14.sp
                        ),
                        color = Color(0xFFB45309) // Amber-700
                    )
                }
            }
        }
    }
}
