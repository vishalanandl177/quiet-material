package com.quietmaterial

import android.database.ContentObserver
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import kotlin.math.*
import kotlinx.coroutines.isActive

/** Seven branded contours, 650ms targets, 200/.6 spring, 50 + 90 degree rotation.
 * Unlike the platform artwork these are Quiet's sampled contours. The OS animation
 * scale is observed; pass reduceMotion for an additional app preference. */
@Composable
fun QuietLoadingIndicator(label: String, modifier: Modifier = Modifier, reduceMotion: Boolean = false) {
    val resolver = LocalContext.current.contentResolver
    var scale by remember { mutableFloatStateOf(Settings.Global.getFloat(resolver,
        Settings.Global.ANIMATOR_DURATION_SCALE, 1f)) }
    DisposableEffect(resolver) {
        val observer = object : ContentObserver(Handler(Looper.getMainLooper())) {
            override fun onChange(selfChange: Boolean) {
                scale = Settings.Global.getFloat(resolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f)
            }
        }
        resolver.registerContentObserver(Settings.Global.getUriFor(Settings.Global.ANIMATOR_DURATION_SCALE), false, observer)
        onDispose { resolver.unregisterContentObserver(observer) }
    }
    var position by remember { mutableDoubleStateOf(0.0) }
    var elapsed by remember { mutableDoubleStateOf(0.0) }
    LaunchedEffect(reduceMotion, scale) {
        if (reduceMotion || scale <= 0f) return@LaunchedEffect
        var velocity = 0.0
        var previous = 0L
        while (isActive) {
            withFrameNanos { now ->
                var remaining = if (previous == 0L) 0.0 else min(64.0, (now - previous) / 1_000_000.0 / scale)
                previous = now
                var nextPosition = position
                var nextElapsed = elapsed
                while (remaining > 0) {
                    val step = min(4.0, remaining); remaining -= step; nextElapsed += step
                    val target = floor(nextElapsed / 650) + 1; val dt = step / 1000
                    velocity += (200 * (target - nextPosition) - 2 * .6 * sqrt(200.0) * velocity) * dt
                    nextPosition += velocity * dt
                }
                position = nextPosition; elapsed = nextElapsed
            }
        }
    }
    Canvas(modifier.size(48.dp).semantics {
        contentDescription = label; progressBarRangeInfo = ProgressBarRangeInfo.Indeterminate
    }) {
        val whole = floor(position).toInt(); val fraction = position - floor(position)
        val path = Path(); val unit = min(size.width, size.height) / 2.3
        for (index in 0 until 96) {
            val angle = index * PI * 2 / 96
            val radius = (quietContour(whole, angle) * (1 - fraction) + quietContour(whole + 1, angle) * fraction) * unit
            val x = center.x + (radius * cos(angle)).toFloat()
            val y = center.y + (radius * sin(angle)).toFloat()
            if (index == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }
        path.close()
        rotate((50 * elapsed / 650 + 90 * position - 90).toFloat()) { drawPath(path, QuietTokens.colorPrimary) }
    }
}

private fun quietContour(shape: Int, angle: Double): Double = when (((shape % 7) + 7) % 7) {
    0 -> .82 + .12 * cos(12 * angle)
    1 -> .86 + .1 * cos(9 * angle)
    2 -> .87 + .08 * cos(5 * angle)
    3 -> .7 + .25 * abs(cos(angle))
    4 -> .82 + .12 * cos(8 * angle)
    5 -> .84 + .12 * cos(4 * angle)
    else -> .76 + .2 * abs(sin(angle))
}
