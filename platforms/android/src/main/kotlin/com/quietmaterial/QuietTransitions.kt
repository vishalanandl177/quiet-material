package com.quietmaterial

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedContentScope
import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.animation.core.Easing
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp

enum class QuietTransitionPattern { FadeThrough, SharedAxisX, SharedAxisY, SharedAxisZ }

private val quietFadeIn = Easing {
    ((QuietEasing.Emphasized.transform(it) - .35f) / .65f).coerceIn(0f, 1f)
}
private val quietFadeOut = Easing {
    (QuietEasing.Emphasized.transform(it) / .35f).coerceIn(0f, 1f)
}

/**
 * Current MD3 shared-axis / fade-through recipes. App owns destination state,
 * back history and focus. Compose handles system animation duration scaling.
 */
@Composable
fun <S> QuietContentChange(
    targetState: S,
    modifier: Modifier = Modifier,
    pattern: QuietTransitionPattern = QuietTransitionPattern.FadeThrough,
    backwards: Boolean = false,
    reduceMotion: Boolean = false,
    content: @Composable AnimatedContentScope.(S) -> Unit,
) {
    val distance = with(LocalDensity.current) { 30.dp.roundToPx() }
    val rtl = LocalLayoutDirection.current == LayoutDirection.Rtl
    AnimatedContent(
        targetState = targetState,
        modifier = modifier,
        label = "Quiet Material destination",
        transitionSpec = {
            if (reduceMotion) {
                (EnterTransition.None togetherWith ExitTransition.None).using(null)
            } else {
                val duration = if (pattern == QuietTransitionPattern.FadeThrough)
                    QuietTokens.motionFadeThroughDuration else QuietTokens.motionSharedAxisDuration
                val fadeEnter = fadeIn(tween(duration, easing = quietFadeIn))
                val fadeExit = fadeOut(tween(duration, easing = quietFadeOut))
                val direction = if (backwards) -1 else 1
                val enter: EnterTransition
                val exit: ExitTransition
                when (pattern) {
                    QuietTransitionPattern.FadeThrough -> {
                        enter = fadeEnter + scaleIn(tween(duration, easing = QuietEasing.Emphasized), initialScale = .92f)
                        exit = fadeExit
                    }
                    QuietTransitionPattern.SharedAxisX -> {
                        val offset = distance * direction * if (rtl) -1 else 1
                        enter = fadeEnter + slideInHorizontally(tween(duration, easing = QuietEasing.Emphasized)) { offset }
                        exit = fadeExit + slideOutHorizontally(tween(duration, easing = QuietEasing.Emphasized)) { -offset }
                    }
                    QuietTransitionPattern.SharedAxisY -> {
                        enter = fadeEnter + slideInVertically(tween(duration, easing = QuietEasing.Emphasized)) { distance * direction }
                        exit = fadeExit + slideOutVertically(tween(duration, easing = QuietEasing.Emphasized)) { -distance * direction }
                    }
                    QuietTransitionPattern.SharedAxisZ -> {
                        enter = fadeEnter + scaleIn(tween(duration, easing = QuietEasing.Emphasized), initialScale = if (backwards) 1.1f else .8f)
                        exit = fadeExit + scaleOut(tween(duration, easing = QuietEasing.Emphasized), targetScale = if (backwards) .8f else 1.1f)
                    }
                }
                (enter togetherWith exit).using(null)
            }
        },
        content = content,
    )
}
