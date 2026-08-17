package com.contril.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.contril.app.theme.*

@Composable
fun GlassmorphismContainer(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(16.dp),
    borderWidth: Dp = 0.8.dp,
    content: @Composable BoxScope.() -> Unit
) {
    val isDark = MaterialTheme.colorScheme.background == ContrilDarkBackground ||
            MaterialTheme.colorScheme.surface == ContrilDarkSurface

    val surfaceColor = if (isDark) {
        ContrilDarkSurface.copy(alpha = 0.88f)
    } else {
        ContrilLightSurface.copy(alpha = 0.94f)
    }

    val borderBrush = Brush.verticalGradient(
        colors = if (isDark) {
            listOf(
                Color.White.copy(alpha = 0.18f),
                Color.White.copy(alpha = 0.04f)
            )
        } else {
            listOf(
                Color.Black.copy(alpha = 0.10f),
                Color.Black.copy(alpha = 0.03f)
            )
        }
    )

    Surface(
        modifier = modifier.clip(shape),
        shape = shape,
        color = surfaceColor,
        border = BorderStroke(borderWidth, borderBrush)
    ) {
        Box(content = content)
    }
}
