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
| `QuietStateChange` | Short keyed content fade; no repeated animation |
| `QuietTokens` | Generated constants, including native `Color` values and millisecond duration integers |

Keep selection and draft data above the adaptive layout so rotating/resizing never loses it. Compact mode uses three labeled destinations at most; larger menus or large text switch to a drawer. Medium windows use a rail; expanded windows can expose a supporting pane. Reuse stock `TextField`, `SwitchListTile`, `CheckboxListTile`, `Slider`, `AlertDialog` and other widgets inside this theme to retain their platform input and accessibility behavior.

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
