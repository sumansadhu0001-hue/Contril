package com.contril.app.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// ---------------------------------------------------------------------------
// Contril Luxury Executive Theme (Titanium Indigo & Obsidian Slate)
// ---------------------------------------------------------------------------

// Primary Luxury Brand Colors
val ContrilBlue = Color(0xFF4F46E5)              // Bespoke Titanium Indigo
val ContrilMidnight = Color(0xFF09090B)          // Pure Deep Obsidian
val ContrilCharcoal = Color(0xFF18181B)          // Charcoal Interactive
val ContrilIndigo = Color(0xFF4338CA)            // Deep Indigo
val ContrilBlueDark = Color(0xFF3730A3)
val ContrilBlueLight = Color(0xFF818CF8)          // Soft Lavender Indigo
val ContrilCyan = Color(0xFF0EA5E9)              // Electric Sky
val ContrilNavy = Color(0xFF09090B)

// Luxury Gradients
val ContrilHeroGradient = Brush.verticalGradient(
    colors = listOf(Color(0xFF09090B), Color(0xFF18181B))
)
val ContrilAccentGradient = Brush.horizontalGradient(
    colors = listOf(ContrilBlue, ContrilIndigo)
)
val ContrilAccentGradientVertical = Brush.verticalGradient(
    colors = listOf(ContrilBlue, ContrilIndigo)
)
val SuperElectricIndigo = Brush.horizontalGradient(
    colors = listOf(ContrilBlue, ContrilIndigo)
)
val SuperElectricEmerald = Brush.horizontalGradient(
    colors = listOf(Color(0xFF059669), Color(0xFF10B981))
)
val SuperWarmAmber = Brush.horizontalGradient(
    colors = listOf(Color(0xFFF59E0B), Color(0xFFD97706))
)
val SuperGlassCardGradient = Brush.verticalGradient(
    colors = listOf(Color(0xFFFFFFFF), Color(0xFFFAFAF9))
)

// Canvas & Surface Palette (Warm Stone-50 Canvas & Crisp White Surfaces)
val ContrilLightBgTop = Color(0xFFFAFAF9)        // Warm Stone Canvas
val ContrilLightBgBottom = Color(0xFFF4F4F5)
val ContrilLightBackgroundGradient = Brush.verticalGradient(
    colors = listOf(ContrilLightBgTop, ContrilLightBgBottom)
)

val ContrilLightBackground = Color(0xFFFAFAF9)
val ContrilLightSurface = Color(0xFFFFFFFF)              // Pure White
val ContrilLightSurfaceSubtle = Color(0xFFF4F4F5)        // Subtle Tinted Container
val ContrilLightSurfaceElevated = Color(0xFFFFFFFF)
val ContrilLightOutline = Color(0xFFE4E4E7)             // Crisp 1px hairline border
val ContrilLightShadow = Color(0x06000000)

// High-Contrast Slate Typography
val TextPrimaryLight = Color(0xFF09090B)                // Deep Obsidian
val TextSecondaryLight = Color(0xFF52525B)              // Cool Zinc Slate
val TextMutedLight = Color(0xFF9CA3AF)                  // Muted Zinc

// Dark Palette Aliases
val ContrilDarkBackground = Color(0xFFFAFAF9)
val ContrilDarkSurface = Color(0xFFFFFFFF)
val ContrilDarkSurfaceElevated = Color(0xFFFFFFFF)
val ContrilDarkOutline = Color(0xFFE4E4E7)
val TextPrimaryDark = Color(0xFF09090B)
val TextSecondaryDark = Color(0xFF52525B)
val TextMutedDark = Color(0xFF9CA3AF)

// Status Colors
val StatusActive = Color(0xFF10B981)                   // Emerald Green
val SuccessGreen = Color(0xFF10B981)
val StatusWarning = Color(0xFFF59E0B)                  // Amber
val StatusError = Color(0xFFEF4444)                    // Crimson Red
val StatusInfo = Color(0xFF4F46E5)                     // Titanium Indigo

val BorderSubtleLight = Color(0xFFE4E4E7)
val BorderSubtleDark = Color(0xFFE4E4E7)
val SpecularHighlight = Color(0x00000000)
