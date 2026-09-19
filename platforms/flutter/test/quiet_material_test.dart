import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:quiet_material/quiet_material.dart';

void main() {
  test('window classes change at shared boundaries', () {
    expect(quietWindowClass(320), QuietWindowClass.compact);
    expect(quietWindowClass(599), QuietWindowClass.compact);
    expect(quietWindowClass(600), QuietWindowClass.medium);
    expect(quietWindowClass(840), QuietWindowClass.expanded);
    expect(quietWindowClass(1200), QuietWindowClass.wide);
    expect(quietMaterialTheme().scaffoldBackgroundColor, const Color(0xFF000000));
    expect(quietMaterialTheme().canvasColor, const Color(0xFF000000));
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
