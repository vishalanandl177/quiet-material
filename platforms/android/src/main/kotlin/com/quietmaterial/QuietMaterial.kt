package com.quietmaterial

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Shapes
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp

private val QuietColors = darkColorScheme(
    primary = QuietTokens.colorPrimary,
    onPrimary = QuietTokens.colorOnPrimary,
    primaryContainer = QuietTokens.colorPrimaryContainer,
    onPrimaryContainer = QuietTokens.colorOnPrimaryContainer,
    secondary = QuietTokens.colorSecondary,
    onSecondary = QuietTokens.colorOnSecondary,
    secondaryContainer = QuietTokens.colorSuccessContainer,
    onSecondaryContainer = QuietTokens.colorSuccess,
    tertiary = QuietTokens.colorWarning,
    onTertiary = QuietTokens.colorWarningContainer,
    tertiaryContainer = QuietTokens.colorWarningContainer,
    onTertiaryContainer = QuietTokens.colorWarning,
    background = QuietTokens.colorBackground,
    onBackground = QuietTokens.colorText,
    surface = QuietTokens.colorSurface,
    onSurface = QuietTokens.colorText,
    surfaceVariant = QuietTokens.colorSurfaceHigh,
    onSurfaceVariant = QuietTokens.colorTextMuted,
    surfaceTint = QuietTokens.colorSurface,
    surfaceDim = QuietTokens.colorBackground,
    surfaceBright = QuietTokens.colorSurfaceHigh,
    surfaceContainerLowest = QuietTokens.colorBackground,
    surfaceContainerLow = QuietTokens.colorSurfaceLow,
    surfaceContainer = QuietTokens.colorSurface,
    surfaceContainerHigh = QuietTokens.colorSurfaceHigh,
    surfaceContainerHighest = QuietTokens.colorSurfaceHigh,
    inverseSurface = QuietTokens.colorText,
    inverseOnSurface = QuietTokens.colorBackground,
    inversePrimary = QuietTokens.colorOnPrimary,
    error = QuietTokens.colorDanger,
    onError = QuietTokens.colorDangerContainer,
    errorContainer = QuietTokens.colorDangerContainer,
    onErrorContainer = QuietTokens.colorDanger,
    outline = QuietTokens.colorOutline,
    outlineVariant = QuietTokens.colorOutline,
    scrim = QuietTokens.colorBackground,
)

/** Native Material 3 behavior with shared Quiet Material colors and shapes. */
@Composable
fun QuietTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = QuietColors,
        typography = Typography(), // Semantic sp styles follow the user's font scale.
        shapes = Shapes(
            extraSmall = RoundedCornerShape(QuietTokens.radiusSmall.dp),
            small = RoundedCornerShape(QuietTokens.radiusControl.dp),
            medium = RoundedCornerShape(QuietTokens.radiusControl.dp),
            large = RoundedCornerShape(QuietTokens.radiusCardCompact.dp),
            extraLarge = RoundedCornerShape(QuietTokens.radiusCard.dp),
        ),
        content = content,
    )
}

/** Apply inner padding once in content; preserve system bars, cutouts and back behavior. */
@Composable
fun QuietScaffold(
    modifier: Modifier = Modifier,
    topBar: @Composable () -> Unit = {},
    bottomBar: @Composable () -> Unit = {},
    content: @Composable (PaddingValues) -> Unit,
) {
    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = QuietTokens.colorBackground,
        contentColor = QuietTokens.colorText,
        contentWindowInsets = WindowInsets.safeDrawing,
        topBar = topBar,
        bottomBar = bottomBar,
        content = content,
    )
}

@Composable
fun QuietButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    Button(
        onClick = onClick,
        modifier = modifier.heightIn(min = QuietTokens.sizeTouchTarget.dp),
        enabled = enabled,
        shape = RoundedCornerShape(50),
        colors = ButtonDefaults.buttonColors(
            containerColor = QuietTokens.colorAction,
            contentColor = QuietTokens.colorOnAction,
        ),
        contentPadding = PaddingValues(horizontal = QuietTokens.space6.dp,
            vertical = QuietTokens.space3.dp),
    ) { Text(label) }
}

@Composable
fun QuietCard(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit,
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(QuietTokens.radiusCardCompact.dp),
        colors = CardDefaults.cardColors(containerColor = QuietTokens.colorSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(QuietTokens.space6.dp),
            verticalArrangement = Arrangement.spacedBy(QuietTokens.space4.dp),
            content = content,
        )
    }
}

/** The entire row is one accessible switch target; avoid duplicate announcements. */
@Composable
fun QuietSwitch(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    Row(
        modifier = modifier.fillMaxWidth()
            .heightIn(min = QuietTokens.sizeTouchTarget.dp)
            .toggleable(value = checked, enabled = enabled, role = Role.Switch,
                onValueChange = onCheckedChange)
            .padding(vertical = QuietTokens.space2.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(QuietTokens.space4.dp),
    ) {
        Text(label, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyLarge)
        Switch(checked = checked, onCheckedChange = null, enabled = enabled)
    }
}

@Composable
fun QuietTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isError: Boolean = false,
    supportingText: (@Composable () -> Unit)? = null,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier.fillMaxWidth().heightIn(min = QuietTokens.sizeTouchTarget.dp),
        label = { Text(label) },
        enabled = enabled,
        isError = isError,
        supportingText = supportingText,
        shape = RoundedCornerShape(QuietTokens.radiusControl.dp),
    )
}
