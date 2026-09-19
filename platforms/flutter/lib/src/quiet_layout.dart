import 'package:flutter/material.dart';
import 'quiet_tokens.dart';
import 'quiet_motion.dart';

enum QuietWindowClass { compact, medium, expanded, wide }

QuietWindowClass quietWindowClass(double width) {
  if (width < QuietTokens.breakpointMedium) return QuietWindowClass.compact;
  if (width < QuietTokens.breakpointExpanded) return QuietWindowClass.medium;
  if (width < QuietTokens.breakpointWide) return QuietWindowClass.expanded;
  return QuietWindowClass.wide;
}

class QuietDestination {
  const QuietDestination({required this.label, required this.icon});
  final String label;
  final IconData icon;
}

/// A controlled navigation shell: the product owns destination state and routes.
/// Window constraints determine layout, never the device or operating-system name.
class QuietAdaptiveScaffold extends StatelessWidget {
  const QuietAdaptiveScaffold({
    super.key,
    required this.title,
    required this.destinations,
    required this.selectedIndex,
    required this.onDestinationSelected,
    required this.body,
    this.supportingPane,
  }) : assert(destinations.length >= 2 && destinations.length <= 5),
       assert(selectedIndex >= 0 && selectedIndex < destinations.length);

  final String title;
  final List<QuietDestination> destinations;
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;
  final Widget body;
  final Widget? supportingPane;

  @override
  Widget build(BuildContext context) => LayoutBuilder(builder: (context, constraints) {
    final window = quietWindowClass(constraints.maxWidth);
    final compact = window == QuietWindowClass.compact;
    final wide = window == QuietWindowClass.wide;
    // Preserve readable labels at large accessibility text sizes with a drawer.
    // 1.5 - the label growth past which three labelled destinations stop fitting; not a token.
    final largeText = MediaQuery.textScalerOf(context).scale(QuietTokens.typeLabel) > QuietTokens.typeLabel * 1.5;
    final useDrawer = compact && (largeText || destinations.length > 3);
    final padding = compact ? QuietTokens.layoutPagePaddingCompact
        : window == QuietWindowClass.medium ? QuietTokens.layoutPagePaddingMedium
        : QuietTokens.layoutPagePaddingExpanded;

    final content = Expanded(child: SingleChildScrollView(
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: EdgeInsets.all(padding),
      child: Align(
        alignment: AlignmentDirectional.topStart,
        // 840 - the content measure cap; no size token matches this reading width.
        child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 840), child: body),
      ),
    ));
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      // Scaffold resizes for the software keyboard. SafeArea handles cutouts.
      resizeToAvoidBottomInset: true,
      drawer: useDrawer ? Drawer(child: SafeArea(child: ListView(
        padding: const EdgeInsets.all(QuietTokens.space4),
        children: [
          for (var i = 0; i < destinations.length; i++)
            // The current destination takes the graphite container treatment from the list theme.
            ListTile(
              selected: i == selectedIndex,
              leading: Icon(destinations[i].icon),
              title: Text(destinations[i].label),
              minVerticalPadding: QuietTokens.space4,
              onTap: () { Navigator.of(context).pop(); onDestinationSelected(i); },
            ),
        ],
      ))) : null,
      bottomNavigationBar: compact && !useDrawer ? NavigationBar(
        selectedIndex: selectedIndex,
        animationDuration: quietDuration(context),
        onDestinationSelected: onDestinationSelected,
        destinations: [for (final item in destinations)
          NavigationDestination(icon: Icon(item.icon), label: item.label)],
      ) : null,
      body: SafeArea(top: false, child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!compact) SingleChildScrollView(child: IntrinsicHeight(child: NavigationRail(
            extended: wide && !largeText,
            selectedIndex: selectedIndex,
            onDestinationSelected: onDestinationSelected,
            labelType: wide && !largeText ? NavigationRailLabelType.none : NavigationRailLabelType.all,
            destinations: [for (final item in destinations) NavigationRailDestination(
              icon: Icon(item.icon), label: Text(item.label),
            )],
          ))),
          content,
          if ((window == QuietWindowClass.expanded || wide) && !largeText && supportingPane != null)
            // 240 - supporting pane measure; the sidebar size token is wider than this pane.
            SizedBox(width: 240, child: SingleChildScrollView(
              padding: const EdgeInsetsDirectional.fromSTEB(QuietTokens.space0,
                QuietTokens.space8, QuietTokens.space5, QuietTokens.space8),
              child: supportingPane,
            )),
        ],
      )),
    );
  });
}
