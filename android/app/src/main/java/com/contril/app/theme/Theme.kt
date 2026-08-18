package com.contril.app.theme

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = ContrilBlue,
    onPrimary = Color.White,
    primaryContainer = ContrilLightSurfaceElevated,
    onPrimaryContainer = ContrilBlueDark,
    secondary = ContrilBlueLight,
    onSecondary = Color.White,
    background = ContrilLightBackground,
    onBackground = TextPrimaryLight,
    surface = ContrilLightSurface,
    onSurface = TextPrimaryLight,
    surfaceVariant = ContrilLightSurfaceElevated,
    onSurfaceVariant = TextSecondaryLight,
    outline = ContrilLightOutline,
    outlineVariant = BorderSubtleLight,
    error = StatusError,
    onError = Color.White
)

private val DarkColorScheme = darkColorScheme(
    primary = ContrilBlueLight,
    onPrimary = ContrilNavy,
    primaryContainer = ContrilDarkSurfaceElevated,
    onPrimaryContainer = ContrilBlueLight,
    secondary = ContrilCyan,
    onSecondary = ContrilNavy,
    background = ContrilDarkBackground,
    onBackground = TextPrimaryDark,
    surface = ContrilDarkSurface,
    onSurface = TextPrimaryDark,
    surfaceVariant = ContrilDarkSurfaceElevated,
    onSurfaceVariant = TextSecondaryDark,
    outline = ContrilDarkOutline,
    outlineVariant = BorderSubtleDark,
    error = StatusError,
    onError = Color.White
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
    darkTheme: Boolean = false,
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            try {
                val activity = view.context.findActivity()
                if (activity != null) {
                    WindowCompat.getInsetsController(activity.window, view).apply {
                        isAppearanceLightStatusBars = !darkTheme
                        isAppearanceLightNavigationBars = !darkTheme
                    }
                }
            } catch (_: Exception) {
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = ContrilTypography,
        content = content
    )
}
