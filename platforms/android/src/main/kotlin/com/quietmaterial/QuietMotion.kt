package com.quietmaterial

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.Easing
import androidx.compose.animation.core.FiniteAnimationSpec
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.tween

/** All seven MD3 duration-based curves, including the actual two-segment emphasized path. */
enum class QuietEasing : Easing {
    Standard, StandardAccelerate, StandardDecelerate,
    Emphasized, EmphasizedAccelerate, EmphasizedDecelerate, Linear;

    override fun transform(fraction: Float): Float {
        val time = fraction.coerceIn(0f, 1f)
        if (time == 0f || time == 1f) return time
        if (this == Emphasized) {
            val x = QuietTokens.easingEmphasizedJoinX
            val y = QuietTokens.easingEmphasizedJoinY
            return if (time <= x) {
                cubic(QuietTokens.easingEmphasizedFirst).transform(time / x) * y
            } else {
                y + cubic(QuietTokens.easingEmphasizedSecond)
                    .transform((time - x) / (1f - x)) * (1f - y)
            }
        }
        val points = when (this) {
            Standard -> QuietTokens.easingStandard
            StandardAccelerate -> QuietTokens.easingStandardAccelerate
            StandardDecelerate -> QuietTokens.easingStandardDecelerate
            EmphasizedAccelerate -> QuietTokens.easingEmphasizedAccelerate
            EmphasizedDecelerate -> QuietTokens.easingEmphasizedDecelerate
            Linear -> QuietTokens.easingLinear
            Emphasized -> error("Handled above")
        }
        return cubic(points).transform(time)
    }

    private fun cubic(points: FloatArray) =
        CubicBezierEasing(points[0], points[1], points[2], points[3])
}

enum class QuietMotionSpeed { Fast, Default, Slow }
enum class QuietSpringScheme { Standard, Expressive }

/**
 * Shared MD3 motion for product-owned animations. Native Material 3 controls keep
 * their component-specific motion. Compose animation APIs honor MotionDurationScale.
 */
object QuietMotion {
    fun <T> timed(
        durationMillis: Int = QuietTokens.durationMedium2,
        easing: QuietEasing = QuietEasing.Standard,
        reduceMotion: Boolean = false,
    ): FiniteAnimationSpec<T> = if (reduceMotion) snap() else tween(
        durationMillis = durationMillis.coerceAtLeast(0), easing = easing,
    )

    /** Use spatial specs for position/size/shape; use effects specs for color/alpha. */
    fun <T> springSpec(
        speed: QuietMotionSpeed = QuietMotionSpeed.Default,
        effects: Boolean = false,
        scheme: QuietSpringScheme = QuietSpringScheme.Standard,
        reduceMotion: Boolean = false,
    ): FiniteAnimationSpec<T> {
        if (reduceMotion) return snap()
        val (damping, stiffness) = when {
            effects -> when (speed) {
                QuietMotionSpeed.Fast -> QuietTokens.springStandardFastEffectsDamping to QuietTokens.springStandardFastEffectsStiffness
                QuietMotionSpeed.Default -> QuietTokens.springStandardDefaultEffectsDamping to QuietTokens.springStandardDefaultEffectsStiffness
                QuietMotionSpeed.Slow -> QuietTokens.springStandardSlowEffectsDamping to QuietTokens.springStandardSlowEffectsStiffness
            }
            scheme == QuietSpringScheme.Expressive -> when (speed) {
                QuietMotionSpeed.Fast -> QuietTokens.springExpressiveFastSpatialDamping to QuietTokens.springExpressiveFastSpatialStiffness
                QuietMotionSpeed.Default -> QuietTokens.springExpressiveDefaultSpatialDamping to QuietTokens.springExpressiveDefaultSpatialStiffness
                QuietMotionSpeed.Slow -> QuietTokens.springExpressiveSlowSpatialDamping to QuietTokens.springExpressiveSlowSpatialStiffness
            }
            else -> when (speed) {
                QuietMotionSpeed.Fast -> QuietTokens.springStandardFastSpatialDamping to QuietTokens.springStandardFastSpatialStiffness
                QuietMotionSpeed.Default -> QuietTokens.springStandardDefaultSpatialDamping to QuietTokens.springStandardDefaultSpatialStiffness
                QuietMotionSpeed.Slow -> QuietTokens.springStandardSlowSpatialDamping to QuietTokens.springStandardSlowSpatialStiffness
            }
        }
        return spring(dampingRatio = damping, stiffness = stiffness)
    }
}
