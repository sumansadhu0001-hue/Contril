package com.contril.app.theme

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = ContrilBlue,
    onPrimary = TextPrimaryDark,
    primaryContainer = ContrilLightSurfaceElevated,
    onPrimaryContainer = ContrilBlueDark,
    secondary = ContrilBlueLight,
    onSecondary = TextPrimaryDark,
    background = ContrilLightBackground,
    onBackground = TextPrimaryLight,
    surface = ContrilLightSurface,
    onSurface = TextPrimaryLight,
    surfaceVariant = ContrilLightSurfaceElevated,
    onSurfaceVariant = TextSecondaryLight,
    outline = BorderSubtleLight,
    outlineVariant = BorderSubtleLight
)

private fun Context.findActivity(): Activity? {
    var ctx: Context? = this
    while (ctx != null) {
        if (ctx is Activity) return ctx
        ctx = if (ctx is ContextWrapper) ctx.baseContext else null
    }
    return null
}

@Composable
fun ContrilTheme(
    darkTheme: Boolean = false, // Locked to premium Light Theme only per product specification
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            try {
                val activity = view.context.findActivity()
                if (activity != null) {
                    WindowCompat.getInsetsController(activity.window, view).apply {
                        isAppearanceLightStatusBars = true
                        isAppearanceLightNavigationBars = true
                    }
                }
            } catch (_: Exception) {
                // Safe fallback across various Android versions
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = ContrilTypography,
        content = content
    )
}
