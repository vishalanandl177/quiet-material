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

@Composable
fun QuietActionButton(label: String, onClick: () -> Unit, modifier: Modifier = Modifier,
    kind: QuietButtonKind = QuietButtonKind.Filled, enabled: Boolean = true) {
    val target = modifier.heightIn(min = 48.dp)
    when (kind) {
        QuietButtonKind.Filled -> Button(onClick, target, enabled) { Text(label) }
        QuietButtonKind.Tonal -> FilledTonalButton(onClick, target, enabled) { Text(label) }
        QuietButtonKind.Outlined -> OutlinedButton(onClick, target, enabled) { Text(label) }
        QuietButtonKind.Text -> TextButton(onClick, target, enabled) { Text(label) }
        QuietButtonKind.Elevated -> ElevatedButton(onClick, target, enabled) { Text(label) }
    }
}

@Composable
fun QuietIconButton(label: String, onClick: () -> Unit, modifier: Modifier = Modifier,
    enabled: Boolean = true, icon: @Composable () -> Unit) {
    IconButton(onClick = onClick, enabled = enabled,
        modifier = modifier.sizeIn(minWidth = 48.dp, minHeight = 48.dp)
            .semantics { contentDescription = label }, content = icon)
}

/** label must describe the action; pass null text to select the compact FAB. */
@Composable
fun QuietFab(label: String, onClick: () -> Unit, modifier: Modifier = Modifier,
    extended: Boolean = false, icon: @Composable () -> Unit) {
    if (extended) ExtendedFloatingActionButton(onClick = onClick, modifier = modifier,
        icon = icon, text = { Text(label) })
    else FloatingActionButton(onClick = onClick,
        modifier = modifier.semantics { contentDescription = label }, content = icon)
}

/** Stable-Material composition, not the experimental expressive morphing button group. */
@Composable
fun QuietButtonGroup(actions: List<QuietAction>, modifier: Modifier = Modifier) {
    FlowRow(modifier, horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)) {
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
    if (multiple) MultiChoiceSegmentedButtonRow(scroll) {
        choices.forEachIndexed { index, choice ->
            SegmentedButton(checked = choice.id in selectedIds,
                onCheckedChange = { checked -> onSelectionChange(
                    if (checked) selectedIds + choice.id else selectedIds - choice.id) },
                shape = SegmentedButtonDefaults.itemShape(index, choices.size),
                enabled = choice.enabled) { Text(choice.label) }
        }
    } else SingleChoiceSegmentedButtonRow(scroll) {
        choices.forEachIndexed { index, choice ->
            SegmentedButton(selected = choice.id in selectedIds,
                onClick = { onSelectionChange(setOf(choice.id)) },
                shape = SegmentedButtonDefaults.itemShape(index, choices.size),
                enabled = choice.enabled) { Text(choice.label) }
        }
    }
}

@Composable
fun QuietSurfaceCard(modifier: Modifier = Modifier, kind: QuietCardKind = QuietCardKind.Filled,
    content: @Composable ColumnScope.() -> Unit) {
    when (kind) {
        QuietCardKind.Filled -> Card(modifier = modifier, content = content)
        QuietCardKind.Elevated -> ElevatedCard(modifier = modifier, content = content)
        QuietCardKind.Outlined -> OutlinedCard(modifier = modifier, content = content)
    }
}

@Composable
fun QuietBadge(label: String? = null, content: @Composable () -> Unit) {
    BadgedBox(badge = { if (label == null) Badge() else Badge { Text(label) } }, content = { content() })
}

@Composable
fun QuietProgress(label: String, progress: Float? = null, circular: Boolean = false,
    modifier: Modifier = Modifier) {
    val semantics = modifier.semantics { contentDescription = label }
    if (circular) {
        if (progress == null) CircularProgressIndicator(modifier = semantics)
        else CircularProgressIndicator(progress = { progress.coerceIn(0f, 1f) }, modifier = semantics)
    } else {
        if (progress == null) LinearProgressIndicator(modifier = semantics)
        else LinearProgressIndicator(progress = { progress.coerceIn(0f, 1f) }, modifier = semantics)
    }
}

@Composable
fun QuietSnackbarHost(state: SnackbarHostState, modifier: Modifier = Modifier) {
    SnackbarHost(hostState = state, modifier = modifier) { Snackbar(snackbarData = it) }
}

@Composable
fun QuietTooltip(text: String, modifier: Modifier = Modifier, title: String? = null,
    action: (@Composable () -> Unit)? = null, content: @Composable () -> Unit) {
    TooltipBox(modifier = modifier,
        positionProvider = TooltipDefaults.rememberPlainTooltipPositionProvider(),
        state = rememberTooltipState(isPersistent = action != null),
        tooltip = {
            if (title == null && action == null) PlainTooltip { Text(text) }
            else RichTooltip(title = title?.let { { Text(it) } }, action = action) { Text(text) }
        }, content = content)
}

@Composable
fun QuietDivider(modifier: Modifier = Modifier, vertical: Boolean = false) {
    if (vertical) VerticalDivider(modifier) else HorizontalDivider(modifier)
}

@Composable
fun QuietListItem(headline: String, modifier: Modifier = Modifier, supporting: String? = null,
    overline: String? = null, onClick: (() -> Unit)? = null,
    leading: (@Composable () -> Unit)? = null, trailing: (@Composable () -> Unit)? = null) {
    ListItem(headlineContent = { Text(headline) },
        modifier = if (onClick == null) modifier else modifier.clickable(onClick = onClick),
        supportingContent = supporting?.let { { Text(it) } },
        overlineContent = overline?.let { { Text(it) } },
        leadingContent = leading, trailingContent = trailing)
}

/** Uncontained snapping carousel; items keep their content's height and stable identity. */
@Composable
fun <T> QuietCarousel(items: List<T>, key: (T) -> Any, modifier: Modifier = Modifier,
    itemWidth: Dp = 280.dp, content: @Composable (T) -> Unit) {
    val state = rememberLazyListState()
    LazyRow(modifier = modifier, state = state, flingBehavior = rememberSnapFlingBehavior(state),
        horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        items(items, key = key) { item -> Box(Modifier.width(itemWidth)) { content(item) } }
    }
}

@Composable
fun QuietDialog(title: String, onDismiss: () -> Unit, confirm: QuietAction,
    dismiss: QuietAction? = null, content: @Composable () -> Unit) {
    AlertDialog(onDismissRequest = onDismiss, title = { Text(title) }, text = content,
        confirmButton = { QuietActionButton(confirm.label, confirm.onClick,
            kind = QuietButtonKind.Text, enabled = confirm.enabled) },
        dismissButton = dismiss?.let { { QuietActionButton(it.label, it.onClick,
            kind = QuietButtonKind.Text, enabled = it.enabled) } })
}

@Composable
fun QuietFullScreenDialog(onDismiss: () -> Unit, content: @Composable () -> Unit) {
    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Surface(Modifier.fillMaxSize(), color = QuietTokens.colorBackground) { content() }
    }
}

@Composable
fun QuietBottomSheet(onDismiss: () -> Unit, state: SheetState = rememberModalBottomSheetState(),
    content: @Composable ColumnScope.() -> Unit) {
    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = state,
        containerColor = QuietTokens.colorSurface, content = content)
}

@Composable
fun QuietStandardBottomSheet(state: BottomSheetScaffoldState = rememberBottomSheetScaffoldState(),
    sheetContent: @Composable ColumnScope.() -> Unit, content: @Composable (PaddingValues) -> Unit) {
    BottomSheetScaffold(scaffoldState = state, containerColor = QuietTokens.colorBackground,
        sheetContainerColor = QuietTokens.colorSurface, sheetContent = sheetContent, content = content)
}

/** Modal side-sheet composition; full window dialog owns focus and system Back dismissal. */
@Composable
fun QuietSideSheet(onDismiss: () -> Unit, width: Dp = 360.dp, content: @Composable ColumnScope.() -> Unit) {
    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.CenterEnd) {
            Surface(Modifier.widthIn(max = width).fillMaxHeight(), color = QuietTokens.colorSurface) {
                Column(Modifier.padding(24.dp), content = content)
            }
        }
    }
}

@Composable
fun QuietTopAppBar(title: String, modifier: Modifier = Modifier,
    kind: QuietAppBarKind = QuietAppBarKind.Small, navigationIcon: @Composable () -> Unit = {},
    actions: @Composable RowScope.() -> Unit = {}) {
    val colors = TopAppBarDefaults.topAppBarColors(containerColor = QuietTokens.colorBackground)
    when (kind) {
        QuietAppBarKind.Small -> TopAppBar({ Text(title) }, modifier, navigationIcon, actions, colors = colors)
        QuietAppBarKind.Centered -> CenterAlignedTopAppBar({ Text(title) }, modifier, navigationIcon, actions, colors = colors)
        QuietAppBarKind.Medium -> MediumTopAppBar({ Text(title) }, modifier, navigationIcon, actions, colors = colors)
        QuietAppBarKind.Large -> LargeTopAppBar({ Text(title) }, modifier, navigationIcon, actions, colors = colors)
    }
}

@Composable
fun QuietBottomAppBar(modifier: Modifier = Modifier, content: @Composable RowScope.() -> Unit) {
    BottomAppBar(modifier = modifier, containerColor = QuietTokens.colorBackground, content = content)
}

/** Wrapping toolbar avoids clipping under text scaling. Host supplies labeled buttons. */
@Composable
fun QuietToolbar(modifier: Modifier = Modifier, content: @Composable FlowRowScope.() -> Unit) {
    Surface(modifier, shape = RoundedCornerShape(28.dp), color = QuietTokens.colorSurface) {
        FlowRow(Modifier.padding(8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), content = content)
    }
}

@Composable
fun QuietNavigationBar(choices: List<QuietChoice>, selectedId: String,
    onSelect: (String) -> Unit, icon: @Composable (QuietChoice) -> Unit) {
    NavigationBar(containerColor = QuietTokens.colorBackground) {
        choices.forEach { choice -> NavigationBarItem(selected = selectedId == choice.id,
            onClick = { onSelect(choice.id) }, icon = { icon(choice) }, label = { Text(choice.label) },
            enabled = choice.enabled) }
    }
}

@Composable
fun QuietNavigationRail(choices: List<QuietChoice>, selectedId: String,
    onSelect: (String) -> Unit, icon: @Composable (QuietChoice) -> Unit) {
    NavigationRail(containerColor = QuietTokens.colorBackground) {
        choices.forEach { choice -> NavigationRailItem(selected = selectedId == choice.id,
            onClick = { onSelect(choice.id) }, icon = { icon(choice) }, label = { Text(choice.label) },
            enabled = choice.enabled) }
    }
}

@Composable
fun QuietNavigationDrawer(choices: List<QuietChoice>, selectedId: String, onSelect: (String) -> Unit,
    modifier: Modifier = Modifier) {
    ModalDrawerSheet(modifier = modifier, drawerContainerColor = QuietTokens.colorBackground) {
        choices.forEach { choice ->
            if (choice.enabled) NavigationDrawerItem(label = { Text(choice.label) },
                selected = selectedId == choice.id, onClick = { onSelect(choice.id) },
                modifier = Modifier.padding(horizontal = 12.dp))
            else Text(choice.label, color = QuietTokens.colorTextMuted,
                modifier = Modifier.padding(horizontal = 28.dp).heightIn(min = 56.dp).semantics { disabled() })
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
            onClick = { onSelect(choice.id) }, enabled = choice.enabled, text = { Text(choice.label) }) }
    }
    if (scrollable) ScrollableTabRow(selectedIndex, modifier, containerColor = QuietTokens.colorBackground, tabs = tabs)
    else TabRow(selectedIndex, modifier, containerColor = QuietTokens.colorBackground, tabs = tabs)
}

@Composable
fun QuietCheckbox(label: String, checked: Boolean, onChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier, enabled: Boolean = true) {
    Row(modifier.heightIn(min = 48.dp).toggleable(checked, enabled = enabled,
        role = Role.Checkbox, onValueChange = onChange), verticalAlignment = Alignment.CenterVertically) {
        Checkbox(checked, onCheckedChange = null, enabled = enabled)
        Text(label, Modifier.padding(start = 12.dp))
    }
}

@Composable
fun QuietRadioGroup(choices: List<QuietChoice>, selectedId: String, onSelect: (String) -> Unit,
    modifier: Modifier = Modifier) {
    Column(modifier.selectableGroup()) {
        choices.forEach { choice -> Row(Modifier.fillMaxWidth().heightIn(min = 48.dp)
            .selectable(selectedId == choice.id, enabled = choice.enabled, role = Role.RadioButton,
                onClick = { onSelect(choice.id) }), verticalAlignment = Alignment.CenterVertically) {
            RadioButton(selectedId == choice.id, onClick = null, enabled = choice.enabled)
            Text(choice.label, Modifier.padding(start = 12.dp))
        } }
    }
}

@Composable
fun QuietChip(label: String, onClick: () -> Unit, modifier: Modifier = Modifier,
    kind: QuietChipKind = QuietChipKind.Assist, selected: Boolean = false, enabled: Boolean = true,
    trailingIcon: (@Composable () -> Unit)? = null) {
    when (kind) {
        QuietChipKind.Assist -> AssistChip(onClick, { Text(label) }, modifier, enabled = enabled, trailingIcon = trailingIcon)
        QuietChipKind.Suggestion -> SuggestionChip(onClick, { Text(label) }, modifier, enabled = enabled)
        QuietChipKind.Filter -> FilterChip(selected, onClick, { Text(label) }, modifier, enabled = enabled, trailingIcon = trailingIcon)
        QuietChipKind.Input -> InputChip(selected, onClick, { Text(label) }, modifier, enabled = enabled, trailingIcon = trailingIcon)
    }
}

@Composable
fun QuietSlider(label: String, value: Float, onChange: (Float) -> Unit, modifier: Modifier = Modifier,
    range: ClosedFloatingPointRange<Float> = 0f..1f, steps: Int = 0, enabled: Boolean = true) {
    Slider(value, onChange, modifier.semantics { contentDescription = label },
        enabled = enabled, valueRange = range, steps = steps)
}

@Composable
fun QuietRangeSlider(label: String, value: ClosedFloatingPointRange<Float>,
    onChange: (ClosedFloatingPointRange<Float>) -> Unit, modifier: Modifier = Modifier,
    range: ClosedFloatingPointRange<Float> = 0f..1f, steps: Int = 0, enabled: Boolean = true) {
    RangeSlider(value, onChange, modifier.semantics { contentDescription = label },
        enabled = enabled, valueRange = range, steps = steps)
}

@Composable
fun QuietDatePicker(state: DatePickerState, modifier: Modifier = Modifier) { DatePicker(state, modifier) }
@Composable
fun QuietDateRangePicker(state: DateRangePickerState, modifier: Modifier = Modifier) { DateRangePicker(state, modifier) }
@Composable
fun QuietTimePicker(state: TimePickerState, modifier: Modifier = Modifier, input: Boolean = false) {
    if (input) TimeInput(state, modifier) else TimePicker(state, modifier)
}

@Composable
fun QuietMenu(expanded: Boolean, onDismiss: () -> Unit, actions: List<QuietAction>) {
    DropdownMenu(expanded = expanded, onDismissRequest = onDismiss) {
        actions.forEach { action -> DropdownMenuItem(text = { Text(action.label) },
            onClick = action.onClick, enabled = action.enabled) }
    }
}

/** Filled and outlined variants preserve native editing, floating label and error semantics. */
@Composable
fun QuietField(label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier,
    filled: Boolean = false, enabled: Boolean = true, readOnly: Boolean = false,
    isError: Boolean = false, supportingText: (@Composable () -> Unit)? = null) {
    if (filled) TextField(value, onChange, modifier.fillMaxWidth(), enabled = enabled,
        readOnly = readOnly, label = { Text(label) }, isError = isError, supportingText = supportingText)
    else OutlinedTextField(value, onChange, modifier.fillMaxWidth(), enabled = enabled,
        readOnly = readOnly, label = { Text(label) }, isError = isError, supportingText = supportingText)
}

/** Stable Material3 SearchBar overload; host owns query/results and expanded state. */
@Suppress("DEPRECATION")
@Composable
fun QuietSearch(query: String, onQueryChange: (String) -> Unit, onSearch: (String) -> Unit,
    expanded: Boolean, onExpandedChange: (Boolean) -> Unit, label: String,
    modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    SearchBar(query = query, onQueryChange = onQueryChange, onSearch = onSearch,
        active = expanded, onActiveChange = onExpandedChange, modifier = modifier,
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
        Scaffold(containerColor = QuietTokens.colorBackground,
            topBar = { QuietTopAppBar(title) },
            bottomBar = { if (compact) QuietNavigationBar(choices, selectedId, onSelect, icon) }) { padding ->
            Row(Modifier.fillMaxSize().padding(padding).consumeWindowInsets(padding)) {
                if (!compact) QuietNavigationRail(choices, selectedId, onSelect, icon)
                Box(Modifier.weight(1f).fillMaxHeight()) { content() }
            }
        }
    }
}
