package com.contril.app.ui.components

import android.view.MotionEvent
import androidx.compose.animation.core.*
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.runtime.*
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInteropFilter
import androidx.compose.ui.platform.LocalContext

object MotionEngine {

    /**
     * Executive spring: stiffness = 400f, dampingRatio = 0.8f for organic, responsive tactile feel
     */
    val ExecutiveSpring = spring<Float>(
        dampingRatio = 0.8f,
        stiffness = 400f
    )

    /**
     * Magnetic touch spring: stiffness = 450f, dampingRatio = 0.75f for snappy tactile recovery
     */
    val MagneticTouchSpring = spring<Float>(
        dampingRatio = 0.75f,
        stiffness = 450f
    )

    /**
     * Fluid cubic bezier easing for kinetic typography and card reveals
     */
    val KineticEasing = CubicBezierEasing(0.16f, 1.0f, 0.3f, 1.0f)
}

/**
 * High-performance UI-thread magnetic press modifier.
 * Uses graphicsLayer transforms to eliminate recomposition overhead during touch interactions.
 */
fun Modifier.magneticPress(
    pressedScale: Float = 0.965f,
    onClick: (() -> Unit)? = null
): Modifier = composed {
    val context = LocalContext.current
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()

    val scale by animateFloatAsState(
        targetValue = if (isPressed) pressedScale else 1.0f,
        animationSpec = MotionEngine.MagneticTouchSpring,
        label = "magnetic_scale"
    )

    this
        .graphicsLayer {
            scaleX = scale
            scaleY = scale
        }
        .then(
            if (onClick != null) {
                Modifier.clickable(
                    interactionSource = interactionSource,
                    indication = null
                ) {
                    ContrilHaptics.performClickHaptic(context)
                    onClick()
                }
            } else {
                Modifier
            }
        )
}

/**
 * Staggered entrance modifier with capped delays to guarantee 60fps on mid-range devices
 */
fun Modifier.staggeredEntrance(
    index: Int,
    baseDelayMs: Int = 40,
    maxStaggerItems: Int = 6
): Modifier = composed {
    var isVisible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        isVisible = true
    }

    val cappedIndex = minOf(index, maxStaggerItems)

    val alpha by animateFloatAsState(
        targetValue = if (isVisible) 1f else 0f,
        animationSpec = tween(
            durationMillis = 280,
            delayMillis = cappedIndex * baseDelayMs,
            easing = MotionEngine.KineticEasing
        ),
        label = "stagger_alpha"
    )

    val translationY by animateFloatAsState(
        targetValue = if (isVisible) 0f else 18f,
        animationSpec = tween(
            durationMillis = 280,
            delayMillis = cappedIndex * baseDelayMs,
            easing = MotionEngine.KineticEasing
        ),
        label = "stagger_transY"
    )

    this
        .alpha(alpha)
        .graphicsLayer {
            this.translationY = translationY
        }
}
