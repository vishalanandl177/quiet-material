@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class,
    androidx.compose.foundation.ExperimentalFoundationApi::class,
    androidx.compose.foundation.layout.ExperimentalLayoutApi::class)

package com.quietmaterial

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.gestures.snapping.rememberSnapFlingBehavior
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.disabled
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

/** Controlled data; use stable IDs and localized labels. No navigation is performed internally. */
data class QuietChoice(val id: String, val label: String, val enabled: Boolean = true)
data class QuietAction(val label: String, val onClick: () -> Unit, val enabled: Boolean = true)
enum class QuietButtonKind { Filled, Tonal, Outlined, Text, Elevated }
enum class QuietCardKind { Filled, Elevated, Outlined }
enum class QuietChipKind { Assist, Suggestion, Filter, Input }
enum class QuietAppBarKind { Small, Centered, Medium, Large }

/* The drawer keeps its leading edge flush with the window and rounds the edge that faces content. */
private val QuietDrawerShape = RoundedCornerShape(topStart = QuietTokens.space0.dp,
    topEnd = QuietTokens.radiusCard.dp, bottomEnd = QuietTokens.radiusCard.dp,
    bottomStart = QuietTokens.space0.dp)

@Composable
fun QuietActionButton(label: String, onClick: () -> Unit, modifier: Modifier = Modifier,
    kind: QuietButtonKind = QuietButtonKind.Filled, enabled: Boolean = true) {
    val target = modifier.heightIn(min = QuietTokens.sizeTouchTarget.dp)
    when (kind) {
        QuietButtonKind.Filled -> Button(onClick, target, enabled, shape = QuietPillShape,
            colors = ButtonDefaults.buttonColors(containerColor = QuietTokens.colorAction,
                contentColor = QuietTokens.colorOnAction,
                disabledContainerColor = QuietTokens.colorSurfaceLow,
                disabledContentColor = QuietTokens.colorDisabled)) { Text(label) }
        QuietButtonKind.Tonal -> FilledTonalButton(onClick, target, enabled, shape = QuietPillShape,
            colors = ButtonDefaults.filledTonalButtonColors(
                containerColor = QuietTokens.colorPrimaryContainer,
                contentColor = QuietTokens.colorOnPrimaryContainer,
                disabledContainerColor = QuietTokens.colorSurfaceLow,
                disabledContentColor = QuietTokens.colorDisabled)) { Text(label) }
        QuietButtonKind.Outlined -> OutlinedButton(onClick, target, enabled, shape = QuietPillShape,
            colors = ButtonDefaults.outlinedButtonColors(contentColor = QuietTokens.colorText,
                disabledContentColor = QuietTokens.colorDisabled),
            border = QuietControlBorder) { Text(label) } // The edge identifies the control.
        QuietButtonKind.Text -> TextButton(onClick, target, enabled, shape = QuietPillShape,
            colors = ButtonDefaults.textButtonColors(contentColor = QuietTokens.colorText,
                disabledContentColor = QuietTokens.colorDisabled)) { Text(label) }
        QuietButtonKind.Elevated -> ElevatedButton(onClick, target, enabled, shape = QuietPillShape,
            colors = ButtonDefaults.elevatedButtonColors(containerColor = QuietTokens.colorSurfaceHigh,
                contentColor = QuietTokens.colorText,
                disabledContainerColor = QuietTokens.colorSurfaceLow,
                disabledContentColor = QuietTokens.colorDisabled)) { Text(label) }
    }
}

@Composable
fun QuietIconButton(label: String, onClick: () -> Unit, modifier: Modifier = Modifier,
    enabled: Boolean = true, icon: @Composable () -> Unit) {
    IconButton(onClick = onClick, enabled = enabled,
        colors = IconButtonDefaults.iconButtonColors(contentColor = QuietTokens.colorText,
            disabledContentColor = QuietTokens.colorDisabled),
        modifier = modifier.sizeIn(minWidth = QuietTokens.sizeTouchTarget.dp,
            minHeight = QuietTokens.sizeTouchTarget.dp)
            .semantics { contentDescription = label }, content = icon)
}

/** label must describe the action; pass null text to select the compact FAB. */
@Composable
fun QuietFab(label: String, onClick: () -> Unit, modifier: Modifier = Modifier,
    extended: Boolean = false, icon: @Composable () -> Unit) {
    // A floating action is the tonal graphite step, not a white fill: it sits over content, not in it.
    if (extended) ExtendedFloatingActionButton(onClick = onClick, modifier = modifier,
        shape = QuietControlShape, containerColor = QuietTokens.colorPrimaryContainer,
        contentColor = QuietTokens.colorOnPrimaryContainer,
        icon = icon, text = { Text(label) })
    else FloatingActionButton(onClick = onClick, shape = QuietControlShape,
        containerColor = QuietTokens.colorPrimaryContainer,
        contentColor = QuietTokens.colorOnPrimaryContainer,
        modifier = modifier.semantics { contentDescription = label }, content = icon)
}

/** Stable-Material composition, not the experimental expressive morphing button group. */
@Composable
fun QuietButtonGroup(actions: List<QuietAction>, modifier: Modifier = Modifier) {
    FlowRow(modifier, horizontalArrangement = Arrangement.spacedBy(QuietTokens.space2.dp),
        verticalArrangement = Arrangement.spacedBy(QuietTokens.space2.dp)) {
        actions.forEach { QuietActionButton(it.label, it.onClick, enabled = it.enabled) }
    }
}

@Composable
fun QuietSplitButton(primary: QuietAction, menuLabel: String, expanded: Boolean,
    onExpandedChange: (Boolean) -> Unit, actions: List<QuietAction>, modifier: Modifier = Modifier) {
    Row(modifier, verticalAlignment = Alignment.CenterVertically) {
        QuietActionButton(primary.label, primary.onClick, enabled = primary.enabled)
        Box {
            QuietActionButton(menuLabel, { onExpandedChange(!expanded) }, kind = QuietButtonKind.Tonal)
            QuietMenu(expanded, { onExpandedChange(false) }, actions.map { action ->
                action.copy(onClick = { onExpandedChange(false); action.onClick() })
            })
        }
    }
}

/** Caller controls expanded state so Back, navigation and outside dismissal remain explicit. */
@Composable
fun QuietFabMenu(label: String, expanded: Boolean, onExpandedChange: (Boolean) -> Unit,
    actions: List<QuietAction>, modifier: Modifier = Modifier, icon: @Composable () -> Unit) {
    Box(modifier) {
        QuietFab(label, { onExpandedChange(!expanded) }, icon = icon)
        QuietMenu(expanded, { onExpandedChange(false) }, actions.map { action ->
            action.copy(onClick = { onExpandedChange(false); action.onClick() })
        })
    }
}

@Composable
fun QuietSegmentedButtons(choices: List<QuietChoice>, selectedIds: Set<String>,
    onSelectionChange: (Set<String>) -> Unit, modifier: Modifier = Modifier,
    multiple: Boolean = false) {
    if (choices.isEmpty()) return
    val scroll = modifier.horizontalScroll(rememberScrollState())
    // A chosen segment is the white indicator; the unchosen row is a recessed strip with a control edge.
    val colors = SegmentedButtonDefaults.colors(
        activeContainerColor = QuietTokens.colorPrimary,
        activeContentColor = QuietTokens.colorOnPrimary,
        activeBorderColor = QuietTokens.colorOutline,
        inactiveContainerColor = QuietTokens.colorSurfaceLow,
        inactiveContentColor = QuietTokens.colorTextMuted,
        inactiveBorderColor = QuietTokens.colorOutline,
        disabledActiveContainerColor = QuietTokens.colorSurfaceLow,
        disabledActiveContentColor = QuietTokens.colorDisabled,
        disabledActiveBorderColor = QuietTokens.colorDisabled,
        disabledInactiveContainerColor = QuietTokens.colorSurfaceLow,
        disabledInactiveContentColor = QuietTokens.colorDisabled,
        disabledInactiveBorderColor = QuietTokens.colorDisabled,
    )
    if (multiple) MultiChoiceSegmentedButtonRow(scroll) {
        choices.forEachIndexed { index, choice ->
            SegmentedButton(checked = choice.id in selectedIds,
                onCheckedChange = { checked -> onSelectionChange(
                    if (checked) selectedIds + choice.id else selectedIds - choice.id) },
                shape = SegmentedButtonDefaults.itemShape(index, choices.size),
                colors = colors,
                enabled = choice.enabled) { Text(choice.label) }
        }
    } else SingleChoiceSegmentedButtonRow(scroll) {
        choices.forEachIndexed { index, choice ->
            SegmentedButton(selected = choice.id in selectedIds,
                onClick = { onSelectionChange(setOf(choice.id)) },
                shape = SegmentedButtonDefaults.itemShape(index, choices.size),
                colors = colors,
                enabled = choice.enabled) { Text(choice.label) }
        }
    }
}

@Composable
fun QuietSurfaceCard(modifier: Modifier = Modifier, kind: QuietCardKind = QuietCardKind.Filled,
    content: @Composable ColumnScope.() -> Unit) {
    when (kind) {
        QuietCardKind.Filled -> Card(modifier = modifier, shape = QuietCardShape,
            colors = CardDefaults.cardColors(containerColor = QuietTokens.colorSurface,
                contentColor = QuietTokens.colorText),
            elevation = CardDefaults.cardElevation(defaultElevation = QuietTokens.space0.dp),
            border = QuietDecorativeBorder, content = content)
        // The elevated card is the only card that floats, so it is the only one carrying a shadow.
        QuietCardKind.Elevated -> ElevatedCard(modifier = modifier, shape = QuietCardShape,
            colors = CardDefaults.elevatedCardColors(containerColor = QuietTokens.colorSurfaceHigh,
                contentColor = QuietTokens.colorText),
            elevation = CardDefaults.elevatedCardElevation(
                defaultElevation = QuietTokens.elevationLevel1Blur.dp), content = content)
        QuietCardKind.Outlined -> OutlinedCard(modifier = modifier, shape = QuietCardShape,
            colors = CardDefaults.outlinedCardColors(containerColor = QuietTokens.colorSurface,
                contentColor = QuietTokens.colorText),
            border = QuietDecorativeBorder, content = content)
    }
}

/** An anchored badge is a neutral count, not a status: graphite container, white content. */
@Composable
fun QuietBadge(label: String? = null, content: @Composable () -> Unit) {
    val container = QuietTokens.colorPrimaryContainer
    val onContainer = QuietTokens.colorOnPrimaryContainer
    BadgedBox(badge = {
        if (label == null) Badge(containerColor = onContainer, contentColor = container)
        else Badge(containerColor = container, contentColor = onContainer) { Text(label) }
    }, content = { content() })
}

@Composable
fun QuietProgress(label: String, progress: Float? = null, circular: Boolean = false,
    modifier: Modifier = Modifier) {
    val semantics = modifier.semantics { contentDescription = label }
    val track = QuietTokens.colorSurfaceHigh
    if (circular) {
        if (progress == null) CircularProgressIndicator(modifier = semantics,
            color = QuietTokens.colorPrimary, trackColor = track)
        else CircularProgressIndicator(progress = { progress.coerceIn(0f, 1f) }, modifier = semantics,
            color = QuietTokens.colorPrimary, trackColor = track)
    } else {
        if (progress == null) LinearProgressIndicator(modifier = semantics,
            color = QuietTokens.colorPrimary, trackColor = track)
        else LinearProgressIndicator(progress = { progress.coerceIn(0f, 1f) }, modifier = semantics,
            color = QuietTokens.colorPrimary, trackColor = track)
    }
}

@Composable
fun QuietSnackbarHost(state: SnackbarHostState, modifier: Modifier = Modifier) {
    SnackbarHost(hostState = state, modifier = modifier) {
        Snackbar(snackbarData = it, shape = QuietCardShape,
            containerColor = QuietTokens.colorSurfaceHigh, contentColor = QuietTokens.colorText,
            actionColor = QuietTokens.colorPrimary, actionContentColor = QuietTokens.colorPrimary,
            dismissActionContentColor = QuietTokens.colorTextMuted)
    }
}

@Composable
fun QuietTooltip(text: String, modifier: Modifier = Modifier, title: String? = null,
    action: (@Composable () -> Unit)? = null, content: @Composable () -> Unit) {
    TooltipBox(modifier = modifier,
        positionProvider = TooltipDefaults.rememberPlainTooltipPositionProvider(),
        state = rememberTooltipState(isPersistent = action != null),
        tooltip = {
            // The plain tooltip inverts (white on black text); a rich one is an elevated panel.
            if (title == null && action == null) PlainTooltip(shape = QuietTileShape,
                containerColor = QuietTokens.colorText, contentColor = QuietTokens.colorBackground) { Text(text) }
            else RichTooltip(title = title?.let { { Text(it) } }, action = action,
                shape = QuietCardShape,
                colors = TooltipDefaults.richTooltipColors(
                    containerColor = QuietTokens.colorSurfaceHigh,
                    contentColor = QuietTokens.colorTextMuted,
                    titleContentColor = QuietTokens.colorText,
                    actionContentColor = QuietTokens.colorText)) { Text(text) }
        }, content = content)
}

@Composable
fun QuietDivider(modifier: Modifier = Modifier, vertical: Boolean = false) {
    // A divider only groups, so it stays on the decorative edge colour.
    if (vertical) VerticalDivider(modifier, thickness = QuietTokens.borderWidth.dp,
        color = QuietTokens.colorOutlineVariant)
    else HorizontalDivider(modifier, thickness = QuietTokens.borderWidth.dp,
        color = QuietTokens.colorOutlineVariant)
}

@Composable
fun QuietListItem(headline: String, modifier: Modifier = Modifier, supporting: String? = null,
    overline: String? = null, onClick: (() -> Unit)? = null,
    leading: (@Composable () -> Unit)? = null, trailing: (@Composable () -> Unit)? = null) {
    ListItem(headlineContent = { Text(headline) },
        modifier = if (onClick == null) modifier else modifier.clickable(onClick = onClick),
        colors = ListItemDefaults.colors(containerColor = QuietTokens.colorSurface,
            headlineColor = QuietTokens.colorText, supportingColor = QuietTokens.colorTextMuted,
            overlineColor = QuietTokens.colorTextMuted, leadingIconColor = QuietTokens.colorTextMuted,
            trailingIconColor = QuietTokens.colorTextMuted,
            disabledHeadlineColor = QuietTokens.colorDisabled,
            disabledLeadingIconColor = QuietTokens.colorDisabled,
            disabledTrailingIconColor = QuietTokens.colorDisabled),
        supportingContent = supporting?.let { { Text(it) } },
        overlineContent = overline?.let { { Text(it) } },
        leadingContent = leading, trailingContent = trailing)
}

/** Uncontained snapping carousel; items keep their content's height and stable identity. */
@Composable
fun <T> QuietCarousel(items: List<T>, key: (T) -> Any, modifier: Modifier = Modifier,
    itemWidth: Dp = 280.dp, content: @Composable (T) -> Unit) { // 280 dp item measure - no spacing step matches
    val state = rememberLazyListState()
    LazyRow(modifier = modifier, state = state, flingBehavior = rememberSnapFlingBehavior(state),
        horizontalArrangement = Arrangement.spacedBy(QuietTokens.space3.dp)) {
        items(items, key = key) { item -> Box(Modifier.width(itemWidth)) { content(item) } }
    }
}

@Composable
fun QuietDialog(title: String, onDismiss: () -> Unit, confirm: QuietAction,
    dismiss: QuietAction? = null, content: @Composable () -> Unit) {
    AlertDialog(onDismissRequest = onDismiss, title = { Text(title) }, text = content,
        shape = QuietDialogShape, containerColor = QuietTokens.colorSurfaceHigh,
        titleContentColor = QuietTokens.colorText, textContentColor = QuietTokens.colorTextMuted,
        iconContentColor = QuietTokens.colorText,
        confirmButton = { QuietActionButton(confirm.label, confirm.onClick,
            kind = QuietButtonKind.Text, enabled = confirm.enabled) },
        dismissButton = dismiss?.let { { QuietActionButton(it.label, it.onClick,
            kind = QuietButtonKind.Text, enabled = it.enabled) } })
}

@Composable
fun QuietFullScreenDialog(onDismiss: () -> Unit, content: @Composable () -> Unit) {
    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        // Full bleed: the canvas reaches every edge, so there is no corner to round.
        Surface(Modifier.fillMaxSize(), color = QuietTokens.colorBackground,
            contentColor = QuietTokens.colorText) { content() }
    }
}

@Composable
fun QuietBottomSheet(onDismiss: () -> Unit, state: SheetState = rememberModalBottomSheetState(),
    content: @Composable ColumnScope.() -> Unit) {
    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = state, shape = QuietSheetShape,
        containerColor = QuietTokens.colorSurfaceHigh, contentColor = QuietTokens.colorText,
        scrimColor = QuietTokens.colorScrim, content = content)
}

@Composable
fun QuietStandardBottomSheet(state: BottomSheetScaffoldState = rememberBottomSheetScaffoldState(),
    sheetContent: @Composable ColumnScope.() -> Unit, content: @Composable (PaddingValues) -> Unit) {
    BottomSheetScaffold(scaffoldState = state, containerColor = QuietTokens.colorBackground,
        contentColor = QuietTokens.colorText, sheetShape = QuietSheetShape,
        sheetContainerColor = QuietTokens.colorSurfaceHigh, sheetContentColor = QuietTokens.colorText,
        sheetContent = sheetContent, content = content)
}

/** Modal side-sheet composition; full window dialog owns focus and system Back dismissal. */
@Composable
fun QuietSideSheet(onDismiss: () -> Unit, width: Dp = 360.dp, // 360 dp sheet measure - no spacing step matches
    content: @Composable ColumnScope.() -> Unit) {
    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.CenterEnd) {
            Surface(Modifier.widthIn(max = width).fillMaxHeight(), shape = QuietSideSheetShape,
                color = QuietTokens.colorSurfaceHigh, contentColor = QuietTokens.colorText,
                shadowElevation = QuietTokens.elevationLevel3Blur.dp) {
                Column(Modifier.padding(QuietTokens.space6.dp), content = content)
            }
        }
    }
}

@Composable
fun QuietTopAppBar(title: String, modifier: Modifier = Modifier,
    kind: QuietAppBarKind = QuietAppBarKind.Small, navigationIcon: @Composable () -> Unit = {},
    actions: @Composable RowScope.() -> Unit = {}) {
    // The bar melts into the canvas and only steps up to the card surface once content scrolls under it.
    val colors = TopAppBarDefaults.topAppBarColors(containerColor = QuietTokens.colorBackground,
        scrolledContainerColor = QuietTokens.colorSurface, titleContentColor = QuietTokens.colorText,
        navigationIconContentColor = QuietTokens.colorText, actionIconContentColor = QuietTokens.colorText)
    when (kind) {
        QuietAppBarKind.Small -> TopAppBar({ Text(title) }, modifier, navigationIcon, actions, colors = colors)
        QuietAppBarKind.Centered -> CenterAlignedTopAppBar({ Text(title) }, modifier, navigationIcon, actions, colors = colors)
        QuietAppBarKind.Medium -> MediumTopAppBar({ Text(title) }, modifier, navigationIcon, actions, colors = colors)
        QuietAppBarKind.Large -> LargeTopAppBar({ Text(title) }, modifier, navigationIcon, actions, colors = colors)
    }
}

@Composable
fun QuietBottomAppBar(modifier: Modifier = Modifier, content: @Composable RowScope.() -> Unit) {
    BottomAppBar(modifier = modifier, containerColor = QuietTokens.colorBackground,
        contentColor = QuietTokens.colorText, content = content)
}

/** Wrapping toolbar avoids clipping under text scaling. Host supplies labeled buttons. */
@Composable
fun QuietToolbar(modifier: Modifier = Modifier, content: @Composable FlowRowScope.() -> Unit) {
    // A floating strip: elevated surface, pill shape, the level 2 shadow of a raised panel.
    Surface(modifier, shape = QuietPillShape, color = QuietTokens.colorSurfaceHigh,
        contentColor = QuietTokens.colorText, shadowElevation = QuietTokens.elevationLevel2Blur.dp,
        border = QuietDecorativeBorder) {
        FlowRow(Modifier.padding(QuietTokens.space2.dp),
            horizontalArrangement = Arrangement.spacedBy(QuietTokens.space2.dp), content = content)
    }
}

@Composable
fun QuietNavigationBar(choices: List<QuietChoice>, selectedId: String,
    onSelect: (String) -> Unit, icon: @Composable (QuietChoice) -> Unit) {
    NavigationBar(containerColor = QuietTokens.colorBackground, contentColor = QuietTokens.colorText) {
        // The current destination is a graphite container, never a hue.
        val colors = NavigationBarItemDefaults.colors(
            selectedIconColor = QuietTokens.colorOnPrimaryContainer,
            selectedTextColor = QuietTokens.colorText,
            indicatorColor = QuietTokens.colorPrimaryContainer,
            unselectedIconColor = QuietTokens.colorTextMuted,
            unselectedTextColor = QuietTokens.colorTextMuted,
            disabledIconColor = QuietTokens.colorDisabled,
            disabledTextColor = QuietTokens.colorDisabled)
        choices.forEach { choice -> NavigationBarItem(selected = selectedId == choice.id,
            onClick = { onSelect(choice.id) }, icon = { icon(choice) }, label = { Text(choice.label) },
            colors = colors, enabled = choice.enabled) }
    }
}

@Composable
fun QuietNavigationRail(choices: List<QuietChoice>, selectedId: String,
    onSelect: (String) -> Unit, icon: @Composable (QuietChoice) -> Unit) {
    NavigationRail(containerColor = QuietTokens.colorBackground, contentColor = QuietTokens.colorText) {
        val colors = NavigationRailItemDefaults.colors(
            selectedIconColor = QuietTokens.colorOnPrimaryContainer,
            selectedTextColor = QuietTokens.colorText,
            indicatorColor = QuietTokens.colorPrimaryContainer,
            unselectedIconColor = QuietTokens.colorTextMuted,
            unselectedTextColor = QuietTokens.colorTextMuted,
            disabledIconColor = QuietTokens.colorDisabled,
            disabledTextColor = QuietTokens.colorDisabled)
        choices.forEach { choice -> NavigationRailItem(selected = selectedId == choice.id,
            onClick = { onSelect(choice.id) }, icon = { icon(choice) }, label = { Text(choice.label) },
            colors = colors, enabled = choice.enabled) }
    }
}

@Composable
fun QuietNavigationDrawer(choices: List<QuietChoice>, selectedId: String, onSelect: (String) -> Unit,
    modifier: Modifier = Modifier) {
    ModalDrawerSheet(modifier = modifier, drawerShape = QuietDrawerShape,
        drawerContainerColor = QuietTokens.colorBackground, drawerContentColor = QuietTokens.colorText) {
        val colors = NavigationDrawerItemDefaults.colors(
            selectedContainerColor = QuietTokens.colorPrimaryContainer,
            selectedTextColor = QuietTokens.colorOnPrimaryContainer,
            selectedIconColor = QuietTokens.colorOnPrimaryContainer,
            unselectedTextColor = QuietTokens.colorTextMuted,
            unselectedIconColor = QuietTokens.colorTextMuted)
        choices.forEach { choice ->
            if (choice.enabled) NavigationDrawerItem(label = { Text(choice.label) },
                selected = selectedId == choice.id, onClick = { onSelect(choice.id) },
                shape = QuietPillShape, colors = colors,
                modifier = Modifier.padding(horizontal = QuietTokens.space3.dp))
            else Text(choice.label, color = QuietTokens.colorDisabled, // A destination that cannot be entered.
                modifier = Modifier.padding(horizontal = QuietTokens.space7.dp)
                    .heightIn(min = 56.dp).semantics { disabled() }) // 56 dp destination height - no spacing step matches
        }
    }
}

@Composable
fun QuietTabs(choices: List<QuietChoice>, selectedId: String, onSelect: (String) -> Unit,
    modifier: Modifier = Modifier, scrollable: Boolean = false) {
    val selectedIndex = choices.indexOfFirst { it.id == selectedId }
    if (choices.isEmpty() || selectedIndex < 0) return
    val tabs: @Composable () -> Unit = {
        choices.forEach { choice -> Tab(selected = selectedId == choice.id,
            onClick = { onSelect(choice.id) }, enabled = choice.enabled, text = { Text(choice.label) },
            selectedContentColor = QuietTokens.colorText,
            unselectedContentColor = QuietTokens.colorTextMuted) }
    }
    // The white indicator stays the selection signal; the row itself keeps the canvas.
    if (scrollable) ScrollableTabRow(selectedIndex, modifier, containerColor = QuietTokens.colorBackground,
        contentColor = QuietTokens.colorText, tabs = tabs)
    else TabRow(selectedIndex, modifier, containerColor = QuietTokens.colorBackground,
        contentColor = QuietTokens.colorText, tabs = tabs)
}

@Composable
fun QuietCheckbox(label: String, checked: Boolean, onChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier, enabled: Boolean = true) {
    Row(modifier.heightIn(min = QuietTokens.sizeTouchTarget.dp).toggleable(checked, enabled = enabled,
        role = Role.Checkbox, onValueChange = onChange), verticalAlignment = Alignment.CenterVertically) {
        // Checked is the white box with a black mark; the mark itself is unchanged.
        Checkbox(checked, onCheckedChange = null, enabled = enabled,
            colors = CheckboxDefaults.colors(checkedColor = QuietTokens.colorPrimary,
                uncheckedColor = QuietTokens.colorOutline,
                checkmarkColor = QuietTokens.colorOnPrimary,
                disabledCheckedColor = QuietTokens.colorDisabled,
                disabledUncheckedColor = QuietTokens.colorDisabled,
                disabledIndeterminateColor = QuietTokens.colorDisabled))
        Text(label, Modifier.padding(start = QuietTokens.space3.dp))
    }
}

@Composable
fun QuietRadioGroup(choices: List<QuietChoice>, selectedId: String, onSelect: (String) -> Unit,
    modifier: Modifier = Modifier) {
    val colors = RadioButtonDefaults.colors(selectedColor = QuietTokens.colorPrimary,
        unselectedColor = QuietTokens.colorOutline,
        disabledSelectedColor = QuietTokens.colorDisabled,
        disabledUnselectedColor = QuietTokens.colorDisabled)
    Column(modifier.selectableGroup()) {
        choices.forEach { choice -> Row(Modifier.fillMaxWidth()
            .heightIn(min = QuietTokens.sizeTouchTarget.dp)
            .selectable(selectedId == choice.id, enabled = choice.enabled, role = Role.RadioButton,
                onClick = { onSelect(choice.id) }), verticalAlignment = Alignment.CenterVertically) {
            RadioButton(selectedId == choice.id, onClick = null, enabled = choice.enabled, colors = colors)
            Text(choice.label, Modifier.padding(start = QuietTokens.space3.dp))
        } }
    }
}

@Composable
fun QuietChip(label: String, onClick: () -> Unit, modifier: Modifier = Modifier,
    kind: QuietChipKind = QuietChipKind.Assist, selected: Boolean = false, enabled: Boolean = true,
    trailingIcon: (@Composable () -> Unit)? = null) {
    // Unselected chips sit on the recessed step with a control edge; a chosen chip is the white indicator.
    when (kind) {
        QuietChipKind.Assist -> AssistChip(onClick, { Text(label) }, modifier, enabled = enabled,
            trailingIcon = trailingIcon, shape = QuietPillShape,
            colors = AssistChipDefaults.assistChipColors(
                containerColor = QuietTokens.colorSurfaceLow, labelColor = QuietTokens.colorText,
                leadingIconContentColor = QuietTokens.colorTextMuted,
                trailingIconContentColor = QuietTokens.colorTextMuted,
                disabledContainerColor = QuietTokens.colorSurfaceLow,
                disabledLabelColor = QuietTokens.colorDisabled,
                disabledLeadingIconContentColor = QuietTokens.colorDisabled,
                disabledTrailingIconContentColor = QuietTokens.colorDisabled),
            border = AssistChipDefaults.assistChipBorder(enabled = enabled,
                borderColor = QuietTokens.colorOutline, disabledBorderColor = QuietTokens.colorDisabled,
                borderWidth = QuietTokens.borderWidth.dp))
        QuietChipKind.Suggestion -> SuggestionChip(onClick, { Text(label) }, modifier, enabled = enabled,
            shape = QuietPillShape,
            colors = SuggestionChipDefaults.suggestionChipColors(
                containerColor = QuietTokens.colorSurfaceLow, labelColor = QuietTokens.colorText,
                iconContentColor = QuietTokens.colorTextMuted,
                disabledContainerColor = QuietTokens.colorSurfaceLow,
                disabledLabelColor = QuietTokens.colorDisabled,
                disabledIconContentColor = QuietTokens.colorDisabled),
            border = SuggestionChipDefaults.suggestionChipBorder(enabled = enabled,
                borderColor = QuietTokens.colorOutline, disabledBorderColor = QuietTokens.colorDisabled,
                borderWidth = QuietTokens.borderWidth.dp))
        QuietChipKind.Filter -> FilterChip(selected, onClick, { Text(label) }, modifier, enabled = enabled,
            trailingIcon = trailingIcon, shape = QuietPillShape,
            colors = FilterChipDefaults.filterChipColors(
                containerColor = QuietTokens.colorSurfaceLow, labelColor = QuietTokens.colorTextMuted,
                iconColor = QuietTokens.colorTextMuted,
                disabledContainerColor = QuietTokens.colorSurfaceLow,
                disabledLabelColor = QuietTokens.colorDisabled,
                disabledLeadingIconColor = QuietTokens.colorDisabled,
                disabledTrailingIconColor = QuietTokens.colorDisabled,
                selectedContainerColor = QuietTokens.colorPrimary,
                disabledSelectedContainerColor = QuietTokens.colorSurfaceHigh,
                selectedLabelColor = QuietTokens.colorOnPrimary,
                selectedLeadingIconColor = QuietTokens.colorOnPrimary,
                selectedTrailingIconColor = QuietTokens.colorOnPrimary),
            border = FilterChipDefaults.filterChipBorder(enabled = enabled, selected = selected,
                borderColor = QuietTokens.colorOutline, selectedBorderColor = QuietTokens.colorPrimary,
                disabledBorderColor = QuietTokens.colorDisabled,
                disabledSelectedBorderColor = QuietTokens.colorDisabled,
                borderWidth = QuietTokens.borderWidth.dp,
                selectedBorderWidth = QuietTokens.borderWidth.dp))
        QuietChipKind.Input -> InputChip(selected, onClick, { Text(label) }, modifier, enabled = enabled,
            trailingIcon = trailingIcon, shape = QuietPillShape,
            colors = InputChipDefaults.inputChipColors(
                containerColor = QuietTokens.colorSurfaceLow, labelColor = QuietTokens.colorTextMuted,
                leadingIconColor = QuietTokens.colorTextMuted,
                trailingIconColor = QuietTokens.colorTextMuted,
                disabledContainerColor = QuietTokens.colorSurfaceLow,
                disabledLabelColor = QuietTokens.colorDisabled,
                disabledLeadingIconColor = QuietTokens.colorDisabled,
                disabledTrailingIconColor = QuietTokens.colorDisabled,
                selectedContainerColor = QuietTokens.colorPrimary,
                disabledSelectedContainerColor = QuietTokens.colorSurfaceHigh,
                selectedLabelColor = QuietTokens.colorOnPrimary,
                selectedLeadingIconColor = QuietTokens.colorOnPrimary,
                selectedTrailingIconColor = QuietTokens.colorOnPrimary),
            border = InputChipDefaults.inputChipBorder(enabled = enabled, selected = selected,
                borderColor = QuietTokens.colorOutline, selectedBorderColor = QuietTokens.colorPrimary,
                disabledBorderColor = QuietTokens.colorDisabled,
                disabledSelectedBorderColor = QuietTokens.colorDisabled,
                borderWidth = QuietTokens.borderWidth.dp,
                selectedBorderWidth = QuietTokens.borderWidth.dp))
    }
}

/* One slider palette: white travelled track and handle, recessed remainder. */
@Composable
private fun quietSliderColors(): SliderColors = SliderDefaults.colors(
    thumbColor = QuietTokens.colorPrimary,
    activeTrackColor = QuietTokens.colorPrimary,
    activeTickColor = QuietTokens.colorOnPrimary,
    inactiveTrackColor = QuietTokens.colorSurfaceHigh,
    inactiveTickColor = QuietTokens.colorTextMuted,
    disabledThumbColor = QuietTokens.colorDisabled,
    disabledActiveTrackColor = QuietTokens.colorDisabled,
    disabledActiveTickColor = QuietTokens.colorSurfaceLow,
    disabledInactiveTrackColor = QuietTokens.colorSurfaceLow,
    disabledInactiveTickColor = QuietTokens.colorDisabled,
)

@Composable
fun QuietSlider(label: String, value: Float, onChange: (Float) -> Unit, modifier: Modifier = Modifier,
    range: ClosedFloatingPointRange<Float> = 0f..1f, steps: Int = 0, enabled: Boolean = true) {
    Slider(value, onChange, modifier.semantics { contentDescription = label },
        enabled = enabled, valueRange = range, steps = steps, colors = quietSliderColors())
}

@Composable
fun QuietRangeSlider(label: String, value: ClosedFloatingPointRange<Float>,
    onChange: (ClosedFloatingPointRange<Float>) -> Unit, modifier: Modifier = Modifier,
    range: ClosedFloatingPointRange<Float> = 0f..1f, steps: Int = 0, enabled: Boolean = true) {
    RangeSlider(value, onChange, modifier.semantics { contentDescription = label },
        enabled = enabled, valueRange = range, steps = steps, colors = quietSliderColors())
}

/* Pickers inherit the scheme: a chosen day is the white indicator, a selected range the graphite container. */
@Composable
fun QuietDatePicker(state: DatePickerState, modifier: Modifier = Modifier) { DatePicker(state, modifier) }
@Composable
fun QuietDateRangePicker(state: DateRangePickerState, modifier: Modifier = Modifier) { DateRangePicker(state, modifier) }
@Composable
fun QuietTimePicker(state: TimePickerState, modifier: Modifier = Modifier, input: Boolean = false) {
    // Chosen hour, minute and period are single-choice indicators: white fill, black content.
    val colors = TimePickerDefaults.colors(
        containerColor = QuietTokens.colorSurface,
        clockDialColor = QuietTokens.colorSurfaceHigh,
        clockDialSelectedContentColor = QuietTokens.colorOnPrimary,
        clockDialUnselectedContentColor = QuietTokens.colorText,
        selectorColor = QuietTokens.colorPrimary,
        periodSelectorBorderColor = QuietTokens.colorOutline,
        periodSelectorSelectedContainerColor = QuietTokens.colorPrimary,
        periodSelectorUnselectedContainerColor = QuietTokens.colorSurface,
        periodSelectorSelectedContentColor = QuietTokens.colorOnPrimary,
        periodSelectorUnselectedContentColor = QuietTokens.colorTextMuted,
        timeSelectorSelectedContainerColor = QuietTokens.colorPrimary,
        timeSelectorUnselectedContainerColor = QuietTokens.colorSurfaceHigh,
        timeSelectorSelectedContentColor = QuietTokens.colorOnPrimary,
        timeSelectorUnselectedContentColor = QuietTokens.colorText,
    )
    if (input) TimeInput(state, modifier, colors = colors) else TimePicker(state, modifier, colors = colors)
}

@Composable
fun QuietMenu(expanded: Boolean, onDismiss: () -> Unit, actions: List<QuietAction>) {
    // A menu genuinely floats: elevated surface, card corners, the level 2 shadow.
    DropdownMenu(expanded = expanded, onDismissRequest = onDismiss, shape = QuietCardShape,
        containerColor = QuietTokens.colorSurfaceHigh, border = QuietDecorativeBorder,
        tonalElevation = QuietTokens.space0.dp, // No tonal overlay: the surface step carries the depth.
        shadowElevation = QuietTokens.elevationLevel2Blur.dp) {
        actions.forEach { action -> DropdownMenuItem(text = { Text(action.label) },
            onClick = action.onClick, enabled = action.enabled,
            colors = MenuDefaults.itemColors(textColor = QuietTokens.colorText,
                leadingIconColor = QuietTokens.colorTextMuted,
                trailingIconColor = QuietTokens.colorTextMuted,
                disabledTextColor = QuietTokens.colorDisabled,
                disabledLeadingIconColor = QuietTokens.colorDisabled,
                disabledTrailingIconColor = QuietTokens.colorDisabled)) }
    }
}

/** Filled and outlined variants preserve native editing, floating label and error semantics. */
@Composable
fun QuietField(label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier,
    filled: Boolean = false, enabled: Boolean = true, readOnly: Boolean = false,
    isError: Boolean = false, supportingText: (@Composable () -> Unit)? = null) {
    if (filled) TextField(value, onChange, modifier.fillMaxWidth(), enabled = enabled,
        readOnly = readOnly, label = { Text(label) }, isError = isError, supportingText = supportingText,
        shape = QuietControlShape, colors = quietFilledFieldColors())
    else OutlinedTextField(value, onChange, modifier.fillMaxWidth(), enabled = enabled,
        readOnly = readOnly, label = { Text(label) }, isError = isError, supportingText = supportingText,
        shape = QuietControlShape, colors = quietOutlinedFieldColors())
}

/** Stable Material3 SearchBar overload; host owns query/results and expanded state. */
@Suppress("DEPRECATION")
@Composable
fun QuietSearch(query: String, onQueryChange: (String) -> Unit, onSearch: (String) -> Unit,
    expanded: Boolean, onExpandedChange: (Boolean) -> Unit, label: String,
    modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    SearchBar(query = query, onQueryChange = onQueryChange, onSearch = onSearch,
        active = expanded, onActiveChange = onExpandedChange, modifier = modifier,
        colors = SearchBarDefaults.colors(containerColor = QuietTokens.colorSurfaceHigh,
            dividerColor = QuietTokens.colorOutlineVariant),
        placeholder = { Text(label) }, content = content)
}

/** Window-sized navigation. App-owned selection survives reflow; content owns scrolling. */
@Composable
fun QuietAdaptiveScaffold(title: String, choices: List<QuietChoice>, selectedId: String,
    onSelect: (String) -> Unit, modifier: Modifier = Modifier,
    icon: @Composable (QuietChoice) -> Unit, content: @Composable () -> Unit) {
    require(choices.size in 2..5) { "Adaptive navigation expects two to five destinations" }
    BoxWithConstraints(modifier.fillMaxSize()) {
        val compact = maxWidth < QuietTokens.breakpointMedium.dp
        Scaffold(containerColor = QuietTokens.colorBackground, contentColor = QuietTokens.colorText,
            topBar = { QuietTopAppBar(title) },
            bottomBar = { if (compact) QuietNavigationBar(choices, selectedId, onSelect, icon) }) { padding ->
            Row(Modifier.fillMaxSize().padding(padding).consumeWindowInsets(padding)) {
                if (!compact) QuietNavigationRail(choices, selectedId, onSelect, icon)
                Box(Modifier.weight(1f).fillMaxHeight()) { content() }
            }
        }
    }
}
