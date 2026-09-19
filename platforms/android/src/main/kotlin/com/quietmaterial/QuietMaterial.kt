package com.quietmaterial

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Shapes
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldColors
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp

/**
 * Every Material 3 colour role resolves to a generated Quiet token, so no component can fall back to
 * the toolkit's purple/blue baseline. Selection is carried by the white primary pair; the graphite
 * container pair carries "you are here" highlights. The semantic mint/yellow/red tokens stay
 * available for genuine status but are no longer wired to ordinary roles.
 */
private val QuietColors = darkColorScheme(
    primary = QuietTokens.colorPrimary,
    onPrimary = QuietTokens.colorOnPrimary,
    primaryContainer = QuietTokens.colorPrimaryContainer,
    onPrimaryContainer = QuietTokens.colorOnPrimaryContainer,
    // inversePrimary paints actions on the inverted (white) snackbar surface, so it must be black.
    inversePrimary = QuietTokens.colorOnPrimary,
    secondary = QuietTokens.colorSecondary,
    onSecondary = QuietTokens.colorOnSecondary,
    // secondaryContainer drives navigation indicators, filter chips and picker ranges - graphite, never mint.
    secondaryContainer = QuietTokens.colorPrimaryContainer,
    onSecondaryContainer = QuietTokens.colorOnPrimaryContainer,
    // tertiary carried the warning yellow and leaked into the time picker period selector - neutral now.
    tertiary = QuietTokens.colorPrimary,
    onTertiary = QuietTokens.colorOnPrimary,
    tertiaryContainer = QuietTokens.colorPrimaryContainer,
    onTertiaryContainer = QuietTokens.colorOnPrimaryContainer,
    background = QuietTokens.colorBackground,
    onBackground = QuietTokens.colorText,
    surface = QuietTokens.colorSurface,
    onSurface = QuietTokens.colorText,
    surfaceVariant = QuietTokens.colorSurfaceHigh,
    onSurfaceVariant = QuietTokens.colorTextMuted,
    // surfaceTint equals surface, so surfaceColorAtElevation composites surface over surface: no tonal tint.
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
    error = QuietTokens.colorDanger,
    onError = QuietTokens.colorDangerContainer,
    errorContainer = QuietTokens.colorDangerContainer,
    onErrorContainer = QuietTokens.colorDanger,
    outline = QuietTokens.colorOutline,
    // outlineVariant is the decorative grouping edge only; control boundaries pass colorOutline explicitly.
    outlineVariant = QuietTokens.colorOutlineVariant,
    scrim = QuietTokens.colorScrim,
)

/* Shared corner geometry. No radius is hardcoded: each surface takes the step its size earns. */
internal val QuietTileShape = RoundedCornerShape(QuietTokens.radiusTile.dp)
internal val QuietControlShape = RoundedCornerShape(QuietTokens.radiusControl.dp)
internal val QuietCardShape = RoundedCornerShape(QuietTokens.radiusCard.dp)
internal val QuietDialogShape = RoundedCornerShape(QuietTokens.radiusDialog.dp)
internal val QuietPillShape = RoundedCornerShape(QuietTokens.radiusPill.dp)
internal val QuietSheetShape = RoundedCornerShape(topStart = QuietTokens.radiusDialog.dp,
    topEnd = QuietTokens.radiusDialog.dp, bottomEnd = QuietTokens.space0.dp, bottomStart = QuietTokens.space0.dp)
internal val QuietSideSheetShape = RoundedCornerShape(topStart = QuietTokens.radiusDialog.dp,
    topEnd = QuietTokens.space0.dp, bottomEnd = QuietTokens.space0.dp, bottomStart = QuietTokens.radiusDialog.dp)

/* A decorative edge groups a surface; a control edge identifies something you can operate. */
internal val QuietDecorativeBorder = BorderStroke(QuietTokens.borderWidth.dp, QuietTokens.colorOutlineVariant)
internal val QuietControlBorder = BorderStroke(QuietTokens.borderWidth.dp, QuietTokens.colorOutline)

/** Outlined field colours: functional outline, muted support text, grey reserved for inactive controls. */
@Composable
internal fun quietOutlinedFieldColors(): TextFieldColors = OutlinedTextFieldDefaults.colors(
    focusedTextColor = QuietTokens.colorText, unfocusedTextColor = QuietTokens.colorText,
    disabledTextColor = QuietTokens.colorDisabled, errorTextColor = QuietTokens.colorText,
    focusedContainerColor = QuietTokens.colorSurfaceLow, unfocusedContainerColor = QuietTokens.colorSurfaceLow,
    disabledContainerColor = QuietTokens.colorSurfaceLow, errorContainerColor = QuietTokens.colorSurfaceLow,
    cursorColor = QuietTokens.colorPrimary, errorCursorColor = QuietTokens.colorDanger,
    focusedBorderColor = QuietTokens.colorPrimary, unfocusedBorderColor = QuietTokens.colorOutline,
    disabledBorderColor = QuietTokens.colorDisabled, errorBorderColor = QuietTokens.colorDanger,
    focusedLeadingIconColor = QuietTokens.colorText, unfocusedLeadingIconColor = QuietTokens.colorTextMuted,
    focusedTrailingIconColor = QuietTokens.colorText, unfocusedTrailingIconColor = QuietTokens.colorTextMuted,
    focusedLabelColor = QuietTokens.colorText, unfocusedLabelColor = QuietTokens.colorTextMuted,
    disabledLabelColor = QuietTokens.colorDisabled, errorLabelColor = QuietTokens.colorDanger,
    focusedPlaceholderColor = QuietTokens.colorTextMuted, unfocusedPlaceholderColor = QuietTokens.colorTextMuted,
    focusedSupportingTextColor = QuietTokens.colorTextMuted, unfocusedSupportingTextColor = QuietTokens.colorTextMuted,
    errorSupportingTextColor = QuietTokens.colorDanger,
)

/** Filled field colours; the indicator, not a box, is this control's functional boundary. */
@Composable
internal fun quietFilledFieldColors(): TextFieldColors = TextFieldDefaults.colors(
    focusedTextColor = QuietTokens.colorText, unfocusedTextColor = QuietTokens.colorText,
    disabledTextColor = QuietTokens.colorDisabled, errorTextColor = QuietTokens.colorText,
    focusedContainerColor = QuietTokens.colorSurfaceHigh, unfocusedContainerColor = QuietTokens.colorSurfaceHigh,
    disabledContainerColor = QuietTokens.colorSurfaceLow, errorContainerColor = QuietTokens.colorSurfaceHigh,
    cursorColor = QuietTokens.colorPrimary, errorCursorColor = QuietTokens.colorDanger,
    focusedIndicatorColor = QuietTokens.colorPrimary, unfocusedIndicatorColor = QuietTokens.colorOutline,
    disabledIndicatorColor = QuietTokens.colorDisabled, errorIndicatorColor = QuietTokens.colorDanger,
    focusedLeadingIconColor = QuietTokens.colorText, unfocusedLeadingIconColor = QuietTokens.colorTextMuted,
    focusedTrailingIconColor = QuietTokens.colorText, unfocusedTrailingIconColor = QuietTokens.colorTextMuted,
    focusedLabelColor = QuietTokens.colorText, unfocusedLabelColor = QuietTokens.colorTextMuted,
    disabledLabelColor = QuietTokens.colorDisabled, errorLabelColor = QuietTokens.colorDanger,
    focusedPlaceholderColor = QuietTokens.colorTextMuted, unfocusedPlaceholderColor = QuietTokens.colorTextMuted,
    focusedSupportingTextColor = QuietTokens.colorTextMuted, unfocusedSupportingTextColor = QuietTokens.colorTextMuted,
    errorSupportingTextColor = QuietTokens.colorDanger,
)

/** Native Material 3 behavior with shared Quiet Material colors and shapes. */
@Composable
fun QuietTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = QuietColors,
        typography = Typography(), // Semantic sp styles follow the user's font scale.
        shapes = Shapes(
            extraSmall = RoundedCornerShape(QuietTokens.radiusSmall.dp), // Small embedded details.
            small = QuietTileShape, // Compact controls and small inline chips.
            medium = QuietControlShape, // Fields, menu items, compact surfaces.
            large = QuietCardShape, // Default cards and floating action surfaces.
            extraLarge = QuietDialogShape, // Dialogs and sheet tops.
        ),
        content = content,
    )
}

/**
 * Apply inner padding once in content; preserve system bars, cutouts and back behavior.
 * The app-owned window canvas and its safe areas are black; OS keyboards, permission dialogs and
 * other system surfaces stay under the platform's control.
 */
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
        shape = QuietPillShape,
        colors = ButtonDefaults.buttonColors(
            containerColor = QuietTokens.colorAction,
            contentColor = QuietTokens.colorOnAction,
            disabledContainerColor = QuietTokens.colorSurfaceLow,
            disabledContentColor = QuietTokens.colorDisabled,
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
        shape = QuietCardShape,
        colors = CardDefaults.cardColors(containerColor = QuietTokens.colorSurface,
            contentColor = QuietTokens.colorText),
        elevation = CardDefaults.cardElevation(defaultElevation = QuietTokens.space0.dp),
        border = QuietDecorativeBorder, // A grouping edge, not a control boundary.
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
        // ON is the single-choice indicator: white track, black thumb. Thumb travel is unchanged.
        Switch(checked = checked, onCheckedChange = null, enabled = enabled,
            colors = SwitchDefaults.colors(
                checkedThumbColor = QuietTokens.colorOnPrimary,
                checkedTrackColor = QuietTokens.colorPrimary,
                checkedBorderColor = QuietTokens.colorPrimary,
                checkedIconColor = QuietTokens.colorPrimary,
                uncheckedThumbColor = QuietTokens.colorTextMuted,
                uncheckedTrackColor = QuietTokens.colorSurface,
                uncheckedBorderColor = QuietTokens.colorOutline,
                uncheckedIconColor = QuietTokens.colorSurface,
                disabledCheckedThumbColor = QuietTokens.colorSurface,
                disabledCheckedTrackColor = QuietTokens.colorDisabled,
                disabledCheckedBorderColor = QuietTokens.colorDisabled,
                disabledUncheckedThumbColor = QuietTokens.colorDisabled,
                disabledUncheckedTrackColor = QuietTokens.colorSurfaceLow,
                disabledUncheckedBorderColor = QuietTokens.colorDisabled,
            ))
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
        shape = QuietControlShape,
        colors = quietOutlinedFieldColors(),
    )
}
