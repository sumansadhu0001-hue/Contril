package com.contril.app.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// Two-tone Accent Gradient (Blue #3B82F6 to Indigo #6366F1)
val ContrilBlue = Color(0xFF3B82F6)
val ContrilIndigo = Color(0xFF6366F1)
val ContrilBlueDark = Color(0xFF2563EB)
val ContrilBlueLight = Color(0xFF60A5FA)
val ContrilCyan = Color(0xFF38BDF8)
val ContrilNavy = Color(0xFF0B132B)

val ContrilAccentGradient = Brush.horizontalGradient(
    colors = listOf(ContrilBlue, ContrilIndigo)
)

val ContrilAccentGradientVertical = Brush.verticalGradient(
    colors = listOf(ContrilBlue, ContrilIndigo)
)

// Light Theme Gradient Palette (Reversal Spec: #F7F8FC to #EDF0F9)
val ContrilLightBgTop = Color(0xFFF7F8FC)
val ContrilLightBgBottom = Color(0xFFEDF0F9)

val ContrilLightBackgroundGradient = Brush.verticalGradient(
    colors = listOf(ContrilLightBgTop, ContrilLightBgBottom)
)

val ContrilLightBackground = Color(0xFFF7F8FC)
val ContrilLightSurface = Color(0xFFFFFFFF)              // Pure White Card Surfaces
val ContrilLightSurfaceSubtle = Color(0xFFFAFBFF)        // Soft Tinted Card Surfaces
val ContrilLightSurfaceElevated = Color(0xFFFFFFFF)
val ContrilLightOutline = Color(0x00000000)             // No harsh 1px borders — use soft shadows
val ContrilLightShadow = Color(0x0F000000)              // 0px 4px 20px rgba(0,0,0,0.06)

// High-Contrast Typography (No gray-on-gray)
val TextPrimaryLight = Color(0xFF0F0F14)                // #0F0F14 (Deep Slate Black)
val TextSecondaryLight = Color(0xFF6B7280)              // #6B7280 (High-contrast cool gray)
val TextMutedLight = Color(0xFF9CA3AF)                  // #9CA3AF (Inactive nav & placeholders)

// Dark Palette Aliases (Preserved for compatibility)
val ContrilDarkBackground = Color(0xFFF7F8FC)
val ContrilDarkSurface = Color(0xFFFFFFFF)
val ContrilDarkSurfaceElevated = Color(0xFFFFFFFF)
val ContrilDarkOutline = Color(0x08000000)
val TextPrimaryDark = Color(0xFF0F0F14)
val TextSecondaryDark = Color(0xFF6B7280)
val TextMutedDark = Color(0xFF9CA3AF)

// Status Colors
val StatusActive = Color(0xFF10B981)                   // Emerald Green
val StatusWarning = Color(0xFFF59E0B)                  // Amber
val StatusError = Color(0xFFEF4444)                    // Crimson Red
val StatusInfo = Color(0xFF3B82F6)                     // Blue

val BorderSubtleLight = Color(0x10000000)
val BorderSubtleDark = Color(0x14FFFFFF)
val SpecularHighlight = Color(0x15FFFFFF)
