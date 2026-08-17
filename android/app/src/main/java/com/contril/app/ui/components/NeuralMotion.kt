package com.contril.app.ui.components

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring

object NeuralMotion {

    /**
     * Executive spring animation curve for tactile feedback and bottom sheets
     */
    val ExecutiveSpring = spring<Float>(
        dampingRatio = Spring.DampingRatioLowBouncy,
        stiffness = Spring.StiffnessMediumLow
    )

    /**
     * Smooth ease in/out curve for screen transitions and ambient glows
     */
    val SmoothEasing = CubicBezierEasing(0.2f, 0.0f, 0.0f, 1.0f)

    /**
     * Subtle micro-interaction transition curve
     */
    val MicroInteractionEasing = FastOutSlowInEasing
}
