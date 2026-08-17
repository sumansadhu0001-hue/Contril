package com.contril.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.graphicsLayer

object MotionEngine {

    /**
     * Cinematic spring for modal sheets and hero surfaces
     */
    val ExecutiveSpring = spring<Float>(
        dampingRatio = Spring.DampingRatioLowBouncy,
        stiffness = Spring.StiffnessMediumLow
    )

    /**
     * Ultra-responsive spring for tactile taps and pill toggles
     */
    val ResponsiveTapSpring = spring<Float>(
        dampingRatio = Spring.DampingRatioNoBouncy,
        stiffness = Spring.StiffnessHigh
    )

    /**
     * Fluid cubic bezier easing for kinetic typography and transitions
     */
    val KineticEasing = CubicBezierEasing(0.16f, 1.0f, 0.3f, 1.0f)

    /**
     * Smooth subtle breathing pulse animation spec
     */
    val AmbientPulseSpec = infiniteRepeatable<Float>(
        animation = tween(durationMillis = 2400, easing = FastOutSlowInEasing),
        repeatMode = RepeatMode.Reverse
    )
}

/**
 * Modifier for staggered entrance animations in list items
 */
fun Modifier.staggeredEntrance(
    index: Int,
    baseDelayMs: Int = 40
): Modifier = composed {
    var isVisible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        isVisible = true
    }

    val alpha by animateFloatAsState(
        targetValue = if (isVisible) 1f else 0f,
        animationSpec = tween(
            durationMillis = 350,
            delayMillis = index * baseDelayMs,
            easing = MotionEngine.KineticEasing
        ),
        label = "stagger_alpha"
    )

    val translationY by animateFloatAsState(
        targetValue = if (isVisible) 0f else 24f,
        animationSpec = tween(
            durationMillis = 350,
            delayMillis = index * baseDelayMs,
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
