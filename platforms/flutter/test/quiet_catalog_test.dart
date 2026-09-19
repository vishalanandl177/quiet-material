import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:quiet_material/quiet_material.dart';

void main() {
  Widget host(Widget child) => MaterialApp(theme: quietMaterialTheme(),
    home: Scaffold(body: child));

  testWidgets('split primary and secondary commands remain independent', (tester) async {
    var primary = 0;
    var alternate = 0;
    await tester.pumpWidget(host(QuietSplitButton(
      primary: QuietAction(label: 'Save', onPressed: () => primary++),
      menuLabel: 'More save options',
      actions: [QuietAction(label: 'Save copy', onPressed: () => alternate++)],
    )));
    await tester.tap(find.text('Save'));
    expect(primary, 1);
    expect(alternate, 0);
    await tester.tap(find.byTooltip('More save options'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Save copy'));
    await tester.pumpAndSettle();
    expect(primary, 1);
    expect(alternate, 1);
  });

  testWidgets('controlled multiple segments can deselect and disabled command stays inert', (tester) async {
    var selection = <String>{'a'};
    await tester.pumpWidget(host(StatefulBuilder(builder: (context, update) => Column(children: [
      QuietSegments<String>(segments: const [
        ButtonSegment(value: 'a', label: Text('Alpha')),
        ButtonSegment(value: 'b', label: Text('Beta')),
      ], selected: selection, multiple: true, emptySelectionAllowed: true,
        onChanged: (next) => update(() => selection = next)),
      const QuietButton(label: 'Disabled'),
    ]))));
    await tester.tap(find.text('Beta'));
    await tester.pumpAndSettle();
    expect(selection, {'a', 'b'});
    await tester.tap(find.text('Alpha'));
    await tester.pumpAndSettle();
    expect(selection, {'b'});
    expect(tester.widget<FilledButton>(find.byType(FilledButton)).onPressed, isNull);
  });

  testWidgets('a tonal command keeps the graphite step beside a white filled one', (tester) async {
    await tester.pumpWidget(host(const Column(children: [
      QuietButton(label: 'Strong'),
      QuietButton(label: 'Secondary', kind: QuietButtonKind.tonal),
    ])));
    const idle = <WidgetState>{};
    final commands = tester.widgetList<FilledButton>(find.byType(FilledButton)).toList();
    expect(commands.length, 2);
    // The strong command inherits the shared white fill from the theme.
    expect(commands.first.style, isNull);
    // FilledButtonTheme also reaches FilledButton.tonal, so the tonal step is restated on the widget.
    expect(commands.last.style!.backgroundColor!.resolve(idle), QuietTokens.colorPrimaryContainer);
    expect(commands.last.style!.foregroundColor!.resolve(idle), QuietTokens.colorOnPrimaryContainer);
  });

  testWidgets('input chip removal has a distinct action', (tester) async {
    var removed = false;
    await tester.pumpWidget(host(QuietChip(label: 'Design', kind: QuietChipKind.input,
      deleteLabel: 'Remove Design', onDeleted: () => removed = true)));
    await tester.tap(find.byTooltip('Remove Design'));
    await tester.pumpAndSettle();
    expect(removed, isTrue);
  });

  testWidgets('reduced motion loading does not run an indefinite controller', (tester) async {
    await tester.pumpWidget(host(const MediaQuery(data: MediaQueryData(disableAnimations: true),
      child: QuietLoadingIndicator(label: 'Loading projects'))));
    await tester.pumpAndSettle();
    expect(find.byType(CustomPaint), findsWidgets);
    expect(find.byType(CircularProgressIndicator), findsNothing);
    expect(tester.binding.hasScheduledFrame, isFalse);
  });

  testWidgets('button groups reflow in a 320px window at 200 percent text', (tester) async {
    await tester.binding.setSurfaceSize(const Size(320, 720));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(host(MediaQuery(data: const MediaQueryData(textScaler: TextScaler.linear(2)),
      child: QuietButtonGroup(actions: [
        QuietAction(label: 'Save changes', onPressed: () {}),
        QuietAction(label: 'Discard draft', onPressed: () {}),
      ]))));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    final save = tester.getTopLeft(find.text('Save changes'));
    final discard = tester.getTopLeft(find.text('Discard draft'));
    expect(discard.dy, greaterThan(save.dy));
  });
}
