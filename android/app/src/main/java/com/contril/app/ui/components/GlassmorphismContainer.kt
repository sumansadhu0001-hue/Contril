package com.contril.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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

@Composable
fun GlassmorphismContainer(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(16.dp),
    borderWidth: Dp = 1.dp,
    content: @Composable BoxScope.() -> Unit
) {
    val isDark = MaterialTheme.colorScheme.background == Color(0xFF070A0F) ||
            MaterialTheme.colorScheme.surface == Color(0xFF0D1117)

    val surfaceColor = if (isDark) {
        Color(0xFF0D1117).copy(alpha = 0.85f)
    } else {
        Color(0xFFFFFFFF).copy(alpha = 0.92f)
    }

    val borderBrush = Brush.linearGradient(
        colors = if (isDark) {
            listOf(
                Color.White.copy(alpha = 0.12f),
                Color.White.copy(alpha = 0.04f)
            )
        } else {
            listOf(
                Color(0xFF2563EB).copy(alpha = 0.18f),
                Color(0xFF0F172A).copy(alpha = 0.06f)
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
