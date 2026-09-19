import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'quiet_tokens.dart';

enum QuietButtonKind { filled, tonal, outlined, text, elevated }
enum QuietChipKind { assist, suggestion, filter, input }
enum QuietCardKind { filled, outlined, elevated }

/// Immutable command. A null callback supplies the native disabled state.
class QuietAction {
  const QuietAction({required this.label, this.onPressed, this.icon});
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
}

class QuietButton extends StatelessWidget {
  const QuietButton({super.key, required this.label, this.onPressed,
    this.kind = QuietButtonKind.filled});
  final String label;
  final VoidCallback? onPressed;
  final QuietButtonKind kind;
  @override
  Widget build(BuildContext context) => switch (kind) {
    QuietButtonKind.filled => FilledButton(onPressed: onPressed, child: Text(label)),
    QuietButtonKind.tonal => FilledButton.tonal(onPressed: onPressed, child: Text(label)),
    QuietButtonKind.outlined => OutlinedButton(onPressed: onPressed, child: Text(label)),
    QuietButtonKind.text => TextButton(onPressed: onPressed, child: Text(label)),
    QuietButtonKind.elevated => ElevatedButton(onPressed: onPressed, child: Text(label)),
  };
}

class QuietIconButton extends StatelessWidget {
  const QuietIconButton({super.key, required this.label, required this.icon,
    this.onPressed, this.selected, this.filled = false});
  final String label;
  final IconData icon;
  final VoidCallback? onPressed;
  final bool? selected;
  final bool filled;
  @override
  Widget build(BuildContext context) => filled
      ? IconButton.filled(tooltip: label, icon: Icon(icon), onPressed: onPressed, isSelected: selected)
      : IconButton(tooltip: label, icon: Icon(icon), onPressed: onPressed, isSelected: selected);
}

class QuietFab extends StatelessWidget {
  const QuietFab({super.key, required this.label, required this.icon,
    required this.onPressed, this.extended = false, this.heroTag});
  final String label;
  final IconData icon;
  final VoidCallback onPressed;
  final bool extended;
  final Object? heroTag;
  @override
  Widget build(BuildContext context) => extended
      ? FloatingActionButton.extended(heroTag: heroTag, tooltip: label,
          onPressed: onPressed, icon: Icon(icon), label: Text(label))
      : FloatingActionButton(heroTag: heroTag, tooltip: label,
          onPressed: onPressed, child: Icon(icon));
}

/// Wrapping composition. Does not claim expressive connected-button shape morphing.
class QuietButtonGroup extends StatelessWidget {
  const QuietButtonGroup({super.key, required this.actions});
  final List<QuietAction> actions;
  @override
  Widget build(BuildContext context) => Wrap(spacing: 8, runSpacing: 8, children: [
    for (final action in actions) QuietButton(label: action.label, onPressed: action.onPressed),
  ]);
}

class QuietMenu extends StatelessWidget {
  const QuietMenu({super.key, required this.actions, required this.builder});
  final List<QuietAction> actions;
  final MenuAnchorChildBuilder builder;
  @override
  Widget build(BuildContext context) => MenuAnchor(builder: builder, menuChildren: [
    for (final action in actions) MenuItemButton(onPressed: action.onPressed,
      leadingIcon: action.icon == null ? null : Icon(action.icon), child: Text(action.label)),
  ]);
}

class QuietSplitButton extends StatelessWidget {
  const QuietSplitButton({super.key, required this.primary, required this.actions,
    required this.menuLabel});
  final QuietAction primary;
  final List<QuietAction> actions;
  final String menuLabel;
  @override
  Widget build(BuildContext context) => Wrap(crossAxisAlignment: WrapCrossAlignment.center, children: [
    QuietButton(label: primary.label, onPressed: primary.onPressed),
    QuietMenu(actions: actions, builder: (context, controller, child) => QuietIconButton(
      label: menuLabel, icon: Icons.arrow_drop_down, filled: true,
      onPressed: () => controller.isOpen ? controller.close() : controller.open())),
  ]);
}

class QuietFabMenu extends StatelessWidget {
  const QuietFabMenu({super.key, required this.label, required this.icon, required this.actions});
  final String label;
  final IconData icon;
  final List<QuietAction> actions;
  @override
  Widget build(BuildContext context) => QuietMenu(actions: actions,
    builder: (context, controller, child) => QuietFab(label: label, icon: icon,
      onPressed: () => controller.isOpen ? controller.close() : controller.open()));
}

class QuietSegments<T> extends StatelessWidget {
  const QuietSegments({super.key, required this.segments, required this.selected,
    required this.onChanged, this.multiple = false, this.emptySelectionAllowed = false});
  final List<ButtonSegment<T>> segments;
  final Set<T> selected;
  final ValueChanged<Set<T>>? onChanged;
  final bool multiple;
  final bool emptySelectionAllowed;
  @override
  Widget build(BuildContext context) => SingleChildScrollView(scrollDirection: Axis.horizontal,
    child: SegmentedButton<T>(segments: segments, selected: selected,
      onSelectionChanged: onChanged, multiSelectionEnabled: multiple,
      emptySelectionAllowed: emptySelectionAllowed));
}

class QuietCard extends StatelessWidget {
  const QuietCard({super.key, required this.child, this.kind = QuietCardKind.filled});
  final Widget child;
  final QuietCardKind kind;
  @override
  Widget build(BuildContext context) => switch (kind) {
    QuietCardKind.filled => Card.filled(child: child),
    QuietCardKind.outlined => Card.outlined(child: child),
    QuietCardKind.elevated => Card(elevation: 1, child: child),
  };
}

class QuietBadge extends StatelessWidget {
  const QuietBadge({super.key, required this.child, this.label, this.visible = true});
  final Widget child;
  final String? label;
  final bool visible;
  @override
  Widget build(BuildContext context) => Badge(isLabelVisible: visible,
    label: label == null ? null : Text(label!), child: child);
}

class QuietProgress extends StatelessWidget {
  const QuietProgress({super.key, required this.label, this.value, this.circular = false});
  final String label;
  final double? value;
  final bool circular;
  @override
  Widget build(BuildContext context) {
    final reduced = MediaQuery.disableAnimationsOf(context);
    // A static ring/bar conveys activity without an indefinite animation under Reduce Motion.
    final display = value?.clamp(0.0, 1.0).toDouble() ?? (reduced ? 0.75 : null);
    return Semantics(label: label, value: value == null ? null : '${(value!.clamp(0, 1) * 100).round()}%', liveRegion: false, child: ExcludeSemantics(child: circular
      ? CircularProgressIndicator(value: display)
      : LinearProgressIndicator(value: display)));
  }
}

/// Seven Quiet contours with the MD3 650ms step, 200/.6 spring and compound rotation.
/// Branded contours intentionally differ from Android RoundedPolygon artwork.
class QuietLoadingIndicator extends StatefulWidget {
  const QuietLoadingIndicator({super.key, required this.label, this.size = 48});
  final String label;
  final double size;
  @override
  State<QuietLoadingIndicator> createState() => _QuietLoadingIndicatorState();
}

class _QuietLoadingIndicatorState extends State<QuietLoadingIndicator> with SingleTickerProviderStateMixin {
  late final Ticker _ticker;
  double elapsed = 0, position = 0, velocity = 0;
  Duration? _last;
  @override
  void initState() { super.initState(); _ticker = createTicker(_tick); }
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final run = !MediaQuery.disableAnimationsOf(context) && TickerMode.of(context);
    if (run && !_ticker.isActive) { _last = null; _ticker.start(); }
    if (!run && _ticker.isActive) { _ticker.stop(); _last = null; }
  }
  void _tick(Duration time) {
    var remaining = _last == null ? 0.0 : (time - _last!).inMicroseconds / 1000;
    _last = time;
    remaining = remaining.clamp(0.0, 64.0).toDouble();
    while (remaining > 0) {
      final step = math.min(4.0, remaining); remaining -= step; elapsed += step;
      final target = (elapsed / 650).floor() + 1;
      final dt = step / 1000;
      velocity += (200 * (target - position) - 2 * .6 * math.sqrt(200) * velocity) * dt;
      position += velocity * dt;
    }
    setState(() {});
  }
  @override
  void dispose() { _ticker.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) => Semantics(label: widget.label,
    child: ExcludeSemantics(child: CustomPaint(size: Size.square(widget.size),
      painter: _QuietLoadingPainter(position, elapsed, Theme.of(context).colorScheme.primary))));
}

class _QuietLoadingPainter extends CustomPainter {
  const _QuietLoadingPainter(this.position, this.elapsed, this.color);
  final double position, elapsed;
  final Color color;
  double radius(int shape, double angle) => switch (shape % 7) {
    0 => .82 + .12 * math.cos(12 * angle),
    1 => .86 + .1 * math.cos(9 * angle),
    2 => .87 + .08 * math.cos(5 * angle),
    3 => .7 + .25 * math.cos(angle).abs(),
    4 => .82 + .12 * math.cos(8 * angle),
    5 => .84 + .12 * math.cos(4 * angle),
    _ => .76 + .2 * math.sin(angle).abs(),
  };
  @override
  void paint(Canvas canvas, Size size) {
    final whole = position.floor();
    final fraction = position - position.floor();
    canvas.translate(size.width / 2, size.height / 2);
    canvas.rotate((50 * elapsed / 650 + 90 * position - 90) * math.pi / 180);
    final path = Path();
    final scale = math.min(size.width, size.height) / 2.3;
    for (var i = 0; i < 96; i++) {
      final angle = i * math.pi * 2 / 96;
      final r = (radius(whole, angle) * (1 - fraction) + radius(whole + 1, angle) * fraction) * scale;
      if (i == 0) { path.moveTo(r * math.cos(angle), r * math.sin(angle)); }
      else { path.lineTo(r * math.cos(angle), r * math.sin(angle)); }
    }
    path.close(); canvas.drawPath(path, Paint()..color = color);
  }
  @override
  bool shouldRepaint(_QuietLoadingPainter old) => position != old.position || elapsed != old.elapsed || color != old.color;
}

class QuietTooltip extends StatelessWidget {
  const QuietTooltip({super.key, required this.message, required this.child});
  final String message;
  final Widget child;
  @override
  Widget build(BuildContext context) => Tooltip(message: message, child: child);
}

/// Interactive rich help uses a focusable popup, not Flutter Tooltip's noninteractive text span.
class QuietRichTooltip extends StatelessWidget {
  const QuietRichTooltip({super.key, required this.label, required this.title,
    required this.message, this.action});
  final String label;
  final String title;
  final String message;
  final QuietAction? action;
  @override
  Widget build(BuildContext context) => MenuAnchor(
    builder: (context, controller, child) => QuietIconButton(label: label, icon: Icons.info_outline,
      onPressed: () => controller.isOpen ? controller.close() : controller.open()),
    menuChildren: [SizedBox(width: 280, child: Padding(padding: const EdgeInsets.all(16),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start,
        children: [Text(title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8), Text(message),
          if (action != null) TextButton(onPressed: action!.onPressed, child: Text(action!.label))])))],
  );
}

ScaffoldFeatureController<SnackBar, SnackBarClosedReason> showQuietSnackbar(
    BuildContext context, {required String message, QuietAction? action,
    Duration duration = const Duration(seconds: 8)}) => ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(content: Text(message), duration: duration, showCloseIcon: true,
    action: action?.onPressed == null ? null : SnackBarAction(label: action!.label,
      onPressed: action.onPressed!)));

class QuietDivider extends StatelessWidget {
  const QuietDivider({super.key, this.vertical = false, this.inset = 0});
  final bool vertical;
  final double inset;
  @override
  Widget build(BuildContext context) => vertical
    ? VerticalDivider(indent: inset, endIndent: inset)
    : Divider(indent: inset, endIndent: inset);
}

class QuietListItem extends StatelessWidget {
  const QuietListItem({super.key, required this.title, this.supporting, this.leading,
    this.trailing, this.onTap, this.selected = false, this.enabled = true});
  final String title;
  final String? supporting;
  final Widget? leading;
  final Widget? trailing;
  final VoidCallback? onTap;
  final bool selected;
  final bool enabled;
  @override
  Widget build(BuildContext context) => ListTile(title: Text(title),
    subtitle: supporting == null ? null : Text(supporting!), leading: leading,
    trailing: trailing, onTap: onTap, selected: selected, enabled: enabled, minVerticalPadding: 12);
}

class QuietCarousel extends StatelessWidget {
  const QuietCarousel({super.key, required this.children, this.height = 240,
    this.itemExtent = 280, this.onTap});
  final List<Widget> children;
  final double height;
  final double itemExtent;
  final ValueChanged<int>? onTap;
  @override
  Widget build(BuildContext context) => SizedBox(height: height, child: CarouselView(
    itemExtent: itemExtent, itemSnapping: true, onTap: onTap,
    padding: const EdgeInsets.all(6), children: children));
}

Future<T?> showQuietBottomSheet<T>(BuildContext context, {required WidgetBuilder builder}) =>
  showModalBottomSheet<T>(context: context, builder: builder, isScrollControlled: true,
    useSafeArea: true, showDragHandle: true);

PersistentBottomSheetController showQuietStandardBottomSheet(BuildContext context,
    {required WidgetBuilder builder}) => showBottomSheet(context: context,
      builder: builder, showDragHandle: true, backgroundColor: QuietTokens.colorSurface);

/// Full screen modal with the platform's back handling and safe drawing area.
Future<T?> showQuietFullScreenDialog<T>(BuildContext context,
    {required WidgetBuilder builder}) => showDialog<T>(context: context,
      builder: (context) => Dialog.fullscreen(child: SafeArea(child: builder(context))));

/// Focus-contained, dismissible trailing sheet. Uses a dialog route, not an unfocusable overlay.
Future<T?> showQuietSideSheet<T>(BuildContext context, {required WidgetBuilder builder,
    double width = 360}) => showDialog<T>(context: context,
      builder: (context) => Align(alignment: AlignmentDirectional.centerEnd,
        child: ConstrainedBox(constraints: BoxConstraints(maxWidth: width),
          child: SizedBox.expand(child: Material(color: QuietTokens.colorSurface,
            child: SafeArea(child: builder(context)))))));

class QuietToolbar extends StatelessWidget {
  const QuietToolbar({super.key, required this.actions});
  final List<QuietAction> actions;
  @override
  Widget build(BuildContext context) => Material(color: QuietTokens.colorSurface,
    borderRadius: BorderRadius.circular(28), child: Padding(padding: const EdgeInsets.all(8),
      child: Wrap(spacing: 8, runSpacing: 8, children: [for (final action in actions)
        action.icon == null ? QuietButton(label: action.label, onPressed: action.onPressed,
          kind: QuietButtonKind.text) : QuietIconButton(label: action.label,
            icon: action.icon!, onPressed: action.onPressed)])));
}

class QuietChip extends StatelessWidget {
  const QuietChip({super.key, required this.label, this.kind = QuietChipKind.assist,
    this.selected = false, this.onPressed, this.onSelected, this.onDeleted, this.deleteLabel});
  final String label;
  final QuietChipKind kind;
  final bool selected;
  final VoidCallback? onPressed;
  final ValueChanged<bool>? onSelected;
  final VoidCallback? onDeleted;
  final String? deleteLabel;
  @override
  Widget build(BuildContext context) => switch (kind) {
    QuietChipKind.assist || QuietChipKind.suggestion => ActionChip(label: Text(label), onPressed: onPressed),
    QuietChipKind.filter => FilterChip(label: Text(label), selected: selected, onSelected: onSelected),
    QuietChipKind.input => InputChip(label: Text(label), selected: selected, onSelected: onSelected,
      onDeleted: onDeleted, deleteButtonTooltipMessage: deleteLabel),
  };
}

class QuietField extends StatelessWidget {
  const QuietField({super.key, required this.label, required this.controller,
    this.filled = false, this.enabled = true, this.readOnly = false,
    this.errorText, this.helperText, this.onChanged, this.maxLines = 1});
  final String label;
  final TextEditingController controller;
  final bool filled;
  final bool enabled;
  final bool readOnly;
  final String? errorText;
  final String? helperText;
  final ValueChanged<String>? onChanged;
  final int maxLines;
  @override
  Widget build(BuildContext context) => TextField(controller: controller,
    enabled: enabled, readOnly: readOnly, onChanged: onChanged, maxLines: maxLines,
    decoration: InputDecoration(labelText: label, errorText: errorText, helperText: helperText,
      filled: filled, border: filled ? const UnderlineInputBorder() : const OutlineInputBorder(),
      enabledBorder: filled ? const UnderlineInputBorder() : const OutlineInputBorder()));
}

class QuietSearch extends StatelessWidget {
  const QuietSearch({super.key, required this.label, required this.controller,
    required this.suggestionsBuilder});
  final String label;
  final SearchController controller;
  final SuggestionsBuilder suggestionsBuilder;
  @override
  Widget build(BuildContext context) => SearchAnchor.bar(barHintText: label,
    searchController: controller, suggestionsBuilder: suggestionsBuilder);
}

class QuietRangeSlider extends StatelessWidget {
  const QuietRangeSlider({super.key, required this.values, required this.onChanged,
    this.min = 0, this.max = 1, this.divisions, this.labels});
  final RangeValues values;
  final ValueChanged<RangeValues>? onChanged;
  final double min;
  final double max;
  final int? divisions;
  final RangeLabels? labels;
  @override
  Widget build(BuildContext context) => RangeSlider(values: values,
    onChanged: onChanged, min: min, max: max, divisions: divisions, labels: labels);
}

Future<DateTime?> showQuietDatePicker(BuildContext context, {required DateTime firstDate,
    required DateTime lastDate, DateTime? initialDate}) => showDatePicker(context: context,
      firstDate: firstDate, lastDate: lastDate, initialDate: initialDate);

Future<DateTimeRange?> showQuietDateRangePicker(BuildContext context,
    {required DateTime firstDate, required DateTime lastDate, DateTimeRange? initialRange}) =>
  showDateRangePicker(context: context, firstDate: firstDate, lastDate: lastDate,
    initialDateRange: initialRange);

Future<TimeOfDay?> showQuietTimePicker(BuildContext context,
    {required TimeOfDay initialTime, bool input = false}) => showTimePicker(context: context,
      initialTime: initialTime, initialEntryMode: input ? TimePickerEntryMode.input : TimePickerEntryMode.dial);

// Direct public toolkit aliases preserve the complete constructor and semantics API.
// These are exported component implementations, not hand-maintained lookalikes.
typedef QuietTopAppBar = AppBar;
typedef QuietBottomAppBar = BottomAppBar;
typedef QuietNavigationBar = NavigationBar;
typedef QuietNavigationRail = NavigationRail;
typedef QuietNavigationDrawer = NavigationDrawer;
typedef QuietTabs = TabBar;
typedef QuietTabView = TabBarView;
typedef QuietDialog = AlertDialog;
typedef QuietCheckbox = CheckboxListTile;
typedef QuietRadio<T> = RadioListTile<T>;
typedef QuietSwitch = SwitchListTile;
typedef QuietSlider = Slider;
