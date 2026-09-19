# Quiet Material for Flutter

A source package for Flutter 3.35+ / Dart 3.9+. It themes stock Material 3 widgets and supplies an adaptive shell. Its intended targets are Android, iOS, web, macOS, Windows and Linux through Flutter; native compilation and device testing have not been run for this delivery. This is not a published pub.dev package or a promise that every widget has identical platform behavior.

## Integrate

Create a Flutter application with the official Flutter tooling on a supported development host, then add this checkout as a path dependency in that app's `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  quiet_material:
    path: /absolute/path/to/quiet-material/platforms/flutter
```

Run `flutter pub get`, then copy [`example/lib/main.dart`](example/lib/main.dart) into the app's `lib/main.dart`. Run `flutter run` on a configured target. Native project scaffolds, signing, app identifiers, build hosts and deployment settings belong to the consuming app. The example uses stock Material icons; enable `uses-material-design: true` in the app's `flutter` section.

The token generator in the repository root writes `lib/src/quiet_tokens.dart`. Run `npm run build` at the root after changing canonical tokens; never hand-edit generated values.

## Public API

| API | Purpose |
| --- | --- |
| `quietMaterialTheme(reduceMotion: …)` | Black canvas/scaffold, charcoal surfaces, rounded Material widgets, standard density and padded targets |
| `QuietRoot` | Observes the OS motion preference below `MaterialApp.builder`; preserves locale, direction and text scaling |
| `QuietAdaptiveScaffold` | Controlled navigation, scrolling content and optional supporting pane; two to five destinations |
| `quietWindowClass(width)` | Compact `<600`, medium `<840`, expanded `<1200`, wide `>=1200` logical pixels |
| `quietDuration(context)` | Duration that becomes zero with the OS disable-animations preference |
| `QuietStateChange` | Keyed MD3 fade through or shared axis X/Y/Z; reverse direction and RTL supported |
| `showQuietModal` | MD3 fade with separate 400 ms enter / 150 ms exit timings, native modal route and focus handling |
| `QuietCurves` / `quietSpring` | All seven MD3 curves, exact emphasized path and standard/expressive spatial/effects springs |
| `QuietTokens` | Generated constants, including native `Color` values and millisecond duration integers |

Keep selection and draft data above the adaptive layout so rotating/resizing never loses it. Compact mode uses three labeled destinations at most; larger menus or large text switch to a drawer. Medium windows use a rail; expanded windows can expose a supporting pane. Reuse stock `TextField`, `SwitchListTile`, `CheckboxListTile`, `Slider`, `AlertDialog` and other widgets inside this theme to retain their platform input and accessibility behavior.

## MD3 motion

Stock Material controls retain the framework's component-specific timing and ink implementation. Quiet Material no longer overrides every button to 150 ms or replaces the framework's selected ink effect. Custom motion uses the generated MD3 tokens, with the standard spring scheme as the default. `quietSpring(effects: true)` selects critically damped color/opacity motion. When running your own physics controller, check `MediaQuery.disableAnimationsOf(context)` and set its target immediately when motion is disabled; a `SpringDescription` alone cannot observe widget context.

```dart
QuietStateChange(
  pattern: QuietTransitionPattern.sharedAxisX,
  reverse: currentStep < previousStep,
  child: StepScreen(key: ValueKey(currentStep), step: currentStep),
)

// Use for an app-owned modal requiring the MD3 fade recipe.
showQuietModal<void>(
  context: context,
  builder: (context) => AlertDialog(
    title: const Text('Your preferences'),
    actions: [TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Done'))],
  ),
);
```

`StepScreen` is an app-owned widget. The package's `PageTransitionSwitcher` manages incoming/outgoing child lifetimes; Quiet Material supplies the MD3 geometry and fade curves. Outgoing content is removed from pointer input, focus traversal and semantics during its exit. Reduced motion replaces content immediately. `showQuietModal` uses a native modal route and localized barrier label, contains keyboard focus and observes the system motion preference; test focus restoration and back behavior in the consuming app.

| Pattern | Shipped behavior |
| --- | --- |
| Shared axis X/Y/Z | 450 ms emphasized; X mirrors in RTL; 30 logical-pixel travel or 0.8/1.1 Z scale |
| Fade through | 450 ms emphasized; fade split at 35% of eased progress; incoming scale 0.92→1 |
| Fade | `showQuietModal`; enter 400 ms emphasized decelerate, exit 150 ms emphasized accelerate; no exit scale |
| Container transform | Tokens and integration contract: 500 ms forward / 400 ms return, emphasized, one shared surface with bounds/shape/content interpolation. A ready-made MD3 container route is not shipped in this adapter. |

The dependency is pinned to `animations: 2.2.0`, compatible with this package's Flutter 3.35 / Dart 3.9 baseline. Version 3 requires Flutter 3.44 / Dart 3.12 and the separate `material_ui` package; upgrading requires a deliberate host migration. [Official package changelog](https://pub.dev/packages/animations/changelog).

Do not use `OpenContainer` or the package's private transition defaults as evidence of current MD3 conformance: the [2.2.0 source](https://github.com/flutter/packages/blob/animations-v2.2.0/packages/animations/lib/src/shared_axis_transition.dart) still uses legacy easing. The supplied state-change helper uses `PageTransitionSwitcher` only for lifecycle and evaluates shared MD3 tokens itself. For a strict container transform, implement a host route with matched surface geometry, correct forward/return timing, reduced motion and route semantics; changing `OpenContainer.transitionDuration` alone does not replace its private easing. The [Material motion guide](https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md) and [shared motion contract](../../docs/motion.md) provide the complete source mapping.

## Accessibility and platform behavior

- Minimum controls are 48 logical pixels; do not shrink their hit areas for desktop.
- Use `EdgeInsetsDirectional` and `AlignmentDirectional` for asymmetric layout. The shell follows inherited direction; test your actual translated labels and routes.
- Do not disable or cap text scaling. The sample preserves `TextScaler` and reflows content vertically.
- `SafeArea`, scrolling content and Scaffold keyboard resizing protect controls from cutouts and input panels.
- Use native widgets for keyboard activation, focus, accessible names, disabled states and checked/selected announcements. Add product-specific labels for icon-only actions.
- The helper suppresses its own transition and ink motion. Route animations, modal animations and arbitrary animations authored by the consuming app still need their own reduced-motion handling. The OS setting is not a universal stop switch.
- Long labels, 200% text, small landscape windows, TalkBack/VoiceOver, external keyboards and platform back behavior need testing in the host app.

## Validation

The Flutter SDK was not available in the authoring environment. Run `flutter pub get`, `flutter analyze` and `flutter test` in this directory. The included widget tests cover background colors, window class boundaries, navigation reflow and motion preferences. Then run the example on each supported target; web browser evidence elsewhere in this repository does not validate native builds.

Current API references: [ThemeData](https://api.flutter.dev/flutter/material/ThemeData-class.html), [CardThemeData](https://api.flutter.dev/flutter/material/CardThemeData-class.html), [MediaQuery.disableAnimationsOf](https://api.flutter.dev/flutter/widgets/MediaQuery/disableAnimationsOf.html), [adaptive layout guidance](https://docs.flutter.dev/ui/adaptive-responsive/general).

## Distribution

This package remains private and unpublished (`publish_to: none`). Platform portability and public permission to reuse are separate questions. The repository currently has no public license grant; do not publish it or claim open-source availability without the owner's licensing decision.
