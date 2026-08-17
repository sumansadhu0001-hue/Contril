package com.contril.app.theme

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = ContrilBlue,
    onPrimary = TextPrimaryDark,
    primaryContainer = ContrilDarkSurfaceElevated,
    onPrimaryContainer = ContrilCyan,
    secondary = ContrilCyan,
    onSecondary = ContrilDarkBackground,
    background = ContrilDarkBackground,
    onBackground = TextPrimaryDark,
    surface = ContrilDarkSurface,
    onSurface = TextPrimaryDark,
    surfaceVariant = ContrilDarkSurfaceElevated,
    onSurfaceVariant = TextSecondaryDark,
    outline = BorderSubtleDark
)

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
    outline = BorderSubtleLight
)

/**
 * Safely unwrap ContextWrappers to find the host Activity.
 * In Jetpack Compose, view.context is often a ContextThemeWrapper,
 * not directly castable to Activity.
 */
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
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = androidx.compose.ui.platform.LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    // Set status bar appearance safely
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
                // Safe fallback: some OEM ROMs may not support this
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = ContrilTypography,
        content = content
    )
}
