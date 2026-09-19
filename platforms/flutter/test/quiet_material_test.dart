import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:quiet_material/quiet_material.dart';

void main() {
  test('MD3 emphasized uses the canonical joined path and all curves are bounded', () {
    expect(QuietCurves.emphasized.transform(QuietTokens.easingEmphasizedJoinX),
        closeTo(QuietTokens.easingEmphasizedJoinY, 0.00001));
    for (final curve in [QuietCurves.standard, QuietCurves.standardAccelerate,
      QuietCurves.standardDecelerate, QuietCurves.emphasized,
      QuietCurves.emphasizedAccelerate, QuietCurves.emphasizedDecelerate, QuietCurves.linear]) {
      expect(curve.transform(0), 0);
      expect(curve.transform(1), 1);
      var previous = 0.0;
      for (var i = 1; i <= 100; i++) {
        final value = curve.transform(i / 100);
        expect(value, inInclusiveRange(previous - 0.00001, 1.0));
        previous = value;
      }
    }
    final effects = quietSpring(effects: true);
    expect(effects.stiffness, 1600);
    expect(effects.damping, closeTo(80, 0.00001));
    expect(quietSpring(speed: QuietMotionSpeed.fast).stiffness, 1400);
  });

  test('window classes change at shared boundaries', () {
    expect(quietWindowClass(320), QuietWindowClass.compact);
    expect(quietWindowClass(599), QuietWindowClass.compact);
    expect(quietWindowClass(600), QuietWindowClass.medium);
    expect(quietWindowClass(840), QuietWindowClass.expanded);
    expect(quietWindowClass(1200), QuietWindowClass.wide);
    expect(quietMaterialTheme().scaffoldBackgroundColor, const Color(0xFF000000));
    expect(quietMaterialTheme().canvasColor, const Color(0xFF000000));
  });

  test('every colour role resolves to a Quiet token, never to a toolkit accent', () {
    final scheme = quietMaterialTheme().colorScheme;
    expect(scheme.primary, QuietTokens.colorPrimary);
    expect(scheme.onPrimary, QuietTokens.colorOnPrimary);
    expect(scheme.primaryContainer, QuietTokens.colorPrimaryContainer);
    expect(scheme.onPrimaryContainer, QuietTokens.colorOnPrimaryContainer);
    expect(scheme.surface, QuietTokens.colorSurface);
    expect(scheme.onSurface, QuietTokens.colorText);
    expect(scheme.onSurfaceVariant, QuietTokens.colorTextMuted);
    // secondaryContainer drives navigation indicators, drawer indicators and date ranges. It carries
    // the graphite container now; the mint success token is reserved for genuine status.
    expect(scheme.secondaryContainer, QuietTokens.colorPrimaryContainer);
    expect(scheme.onSecondaryContainer, QuietTokens.colorOnPrimaryContainer);
    // tertiary paints the time picker period selector, so it is neutral rather than warning yellow.
    expect(scheme.tertiary, QuietTokens.colorPrimary);
    expect(scheme.tertiaryContainer, QuietTokens.colorPrimaryContainer);
    // The decorative grouping edge and the functional control boundary stay different tokens.
    expect(scheme.outline, QuietTokens.colorOutline);
    expect(scheme.outlineVariant, QuietTokens.colorOutlineVariant);
    expect(scheme.outline, isNot(scheme.outlineVariant));
    expect(scheme.scrim, QuietTokens.colorScrim);
    expect(scheme.error, QuietTokens.colorDanger);
    expect(scheme.errorContainer, QuietTokens.colorDangerContainer);
    // A transparent surface tint stops elevation from tinting any surface.
    expect(scheme.surfaceTint.a, 0.0);
  });

  test('selection reads as the white pair and current location as graphite', () {
    final theme = quietMaterialTheme();
    const chosen = <WidgetState>{WidgetState.selected};
    const idle = <WidgetState>{};
    expect(theme.switchTheme.trackColor!.resolve(chosen), QuietTokens.colorPrimary);
    expect(theme.switchTheme.thumbColor!.resolve(chosen), QuietTokens.colorOnPrimary);
    expect(theme.switchTheme.trackOutlineColor!.resolve(idle), QuietTokens.colorOutline);
    expect(theme.checkboxTheme.fillColor!.resolve(chosen), QuietTokens.colorPrimary);
    expect(theme.checkboxTheme.checkColor!.resolve(chosen), QuietTokens.colorOnPrimary);
    expect(theme.radioTheme.fillColor!.resolve(chosen), QuietTokens.colorPrimary);
    expect(theme.radioTheme.fillColor!.resolve(idle), QuietTokens.colorOutline);
    expect(theme.chipTheme.color!.resolve(chosen), QuietTokens.colorPrimary);
    expect(theme.chipTheme.color!.resolve(idle), isNull);
    expect(theme.segmentedButtonTheme.style!.backgroundColor!.resolve(chosen), QuietTokens.colorPrimary);
    expect(theme.segmentedButtonTheme.style!.foregroundColor!.resolve(chosen), QuietTokens.colorOnPrimary);
    expect(theme.filledButtonTheme.style!.backgroundColor!.resolve(idle), QuietTokens.colorAction);
    expect(theme.filledButtonTheme.style!.foregroundColor!.resolve(idle), QuietTokens.colorOnAction);
    // A current destination or current row is a container highlight, not a white fill.
    expect(theme.navigationBarTheme.indicatorColor, QuietTokens.colorPrimaryContainer);
    expect(theme.navigationRailTheme.indicatorColor, QuietTokens.colorPrimaryContainer);
    expect(theme.navigationDrawerTheme.indicatorColor, QuietTokens.colorPrimaryContainer);
    expect(theme.listTileTheme.selectedTileColor, QuietTokens.colorPrimaryContainer);
    expect(theme.listTileTheme.selectedColor, QuietTokens.colorOnPrimaryContainer);
    // Focus stays distinct from selection: on a white fill the ring uses the contrast token.
    expect(theme.filledButtonTheme.style!.side!.resolve(
        const <WidgetState>{WidgetState.focused})!.color, QuietTokens.colorFocusContrast);
    expect(theme.inputDecorationTheme.focusedBorder!.borderSide.color, QuietTokens.colorFocus);
    expect(theme.inputDecorationTheme.focusedBorder!.borderSide.width, QuietTokens.borderFocus);
  });

  test('surfaces take a declared corner and elevation never tints them', () {
    final theme = quietMaterialTheme();
    const idle = <WidgetState>{};
    expect((theme.cardTheme.shape! as RoundedRectangleBorder).borderRadius,
        const BorderRadius.all(Radius.circular(QuietTokens.radiusCard)));
    expect((theme.cardTheme.shape! as RoundedRectangleBorder).side.color, QuietTokens.colorOutlineVariant);
    expect((theme.dialogTheme.shape! as RoundedRectangleBorder).borderRadius,
        const BorderRadius.all(Radius.circular(QuietTokens.radiusDialog)));
    expect(theme.dialogTheme.backgroundColor, QuietTokens.colorSurfaceHigh);
    expect(theme.bottomSheetTheme.backgroundColor, QuietTokens.colorSurfaceHigh);
    expect(theme.cardTheme.color, QuietTokens.colorSurface);
    expect(theme.dividerTheme.color, QuietTokens.colorOutlineVariant);
    expect(theme.cardTheme.surfaceTintColor!.a, 0.0);
    expect(theme.appBarTheme.surfaceTintColor!.a, 0.0);
    expect(theme.dialogTheme.surfaceTintColor!.a, 0.0);
    expect(theme.bottomSheetTheme.surfaceTintColor!.a, 0.0);
    expect(theme.navigationBarTheme.surfaceTintColor!.a, 0.0);
    expect(theme.drawerTheme.surfaceTintColor!.a, 0.0);
    expect(theme.menuTheme.style!.surfaceTintColor!.resolve(idle)!.a, 0.0);
    expect(theme.applyElevationOverlayColor, isFalse);
    // Buttons and chips are pills; fields and menu items take the control step.
    expect(theme.filledButtonTheme.style!.shape!.resolve(idle), isA<StadiumBorder>());
    expect(theme.chipTheme.shape, isA<StadiumBorder>());
    expect((theme.inputDecorationTheme.enabledBorder! as OutlineInputBorder).borderRadius,
        const BorderRadius.all(Radius.circular(QuietTokens.radiusControl)));
  });

  testWidgets('compact navigation becomes a rail at medium width', (tester) async {
    Future<void> render(Size size) async {
      await tester.binding.setSurfaceSize(size);
      await tester.pumpWidget(MaterialApp(theme: quietMaterialTheme(), home: QuietAdaptiveScaffold(
        title: 'Example', selectedIndex: 0, onDestinationSelected: (_) {},
        destinations: const [
          QuietDestination(label: 'Home', icon: Icons.home),
          QuietDestination(label: 'Settings', icon: Icons.settings),
        ],
        body: const Text('Content'),
      )));
      await tester.pumpAndSettle();
    }
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await render(const Size(320, 700));
    expect(find.byType(NavigationBar), findsOneWidget);
    expect(find.byType(NavigationRail), findsNothing);
    expect(tester.takeException(), isNull);
    await render(const Size(700, 700));
    expect(find.byType(NavigationBar), findsNothing);
    expect(find.byType(NavigationRail), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('reduced motion returns zero duration and keeps text scaling', (tester) async {
    await tester.pumpWidget(MaterialApp(home: MediaQuery(
      data: const MediaQueryData(disableAnimations: true, textScaler: TextScaler.linear(2)),
      child: QuietRoot(child: Builder(builder: (context) {
        expect(quietDuration(context), Duration.zero);
        expect(MediaQuery.textScalerOf(context).scale(16), 32);
        expect(Theme.of(context).splashFactory, NoSplash.splashFactory);
        return const SizedBox.shrink();
      })),
    )));
  });
}
