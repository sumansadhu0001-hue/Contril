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
import androidx.compose.ui.platform.LocalContext
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

// Safe activity finder that unwraps ContextWrappers
fun Context.findActivity(): Activity? {
    var context = this
    while (context is ContextWrapper) {
        if (context is Activity) return context
        context = context.baseContext
    }
    return null
}

@Composable
fun ContrilTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Preserve Contril atmospheric blue identity by default
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val activity = view.context.findActivity()
            activity?.window?.let { window ->
                try {
                    WindowCompat.getInsetsController(window, view).apply {
                        isAppearanceLightStatusBars = !darkTheme
                        isAppearanceLightNavigationBars = !darkTheme
                    }
                } catch (e: Exception) {
                    // Safe fallback across various Android versions
                }
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = ContrilTypography,
        content = content
    )
}
