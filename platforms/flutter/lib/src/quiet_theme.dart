import 'package:flutter/material.dart';
import 'quiet_tokens.dart';

/// Theme stock Material widgets while retaining their input and semantics APIs.
ThemeData quietMaterialTheme({bool reduceMotion = false}) {
  // Every Material 3 color role is intentional. Fixed roles reuse the same
  // accessible pair because Quiet Material supplies one dark theme, not a
  // second independently generated palette.
  const scheme = ColorScheme(
    brightness: Brightness.dark,
    primary: QuietTokens.colorPrimary,
    onPrimary: QuietTokens.colorOnPrimary,
    primaryContainer: QuietTokens.colorPrimaryContainer,
    onPrimaryContainer: QuietTokens.colorOnPrimaryContainer,
    primaryFixed: QuietTokens.colorPrimary,
    primaryFixedDim: QuietTokens.colorPrimary,
    onPrimaryFixed: QuietTokens.colorOnPrimary,
    onPrimaryFixedVariant: QuietTokens.colorOnPrimary,
    secondary: QuietTokens.colorSecondary,
    onSecondary: QuietTokens.colorOnSecondary,
    secondaryContainer: QuietTokens.colorSuccessContainer,
    onSecondaryContainer: QuietTokens.colorSuccess,
    secondaryFixed: QuietTokens.colorSecondary,
    secondaryFixedDim: QuietTokens.colorSecondary,
    onSecondaryFixed: QuietTokens.colorOnSecondary,
    onSecondaryFixedVariant: QuietTokens.colorOnSecondary,
    tertiary: QuietTokens.colorWarning,
    onTertiary: QuietTokens.colorWarningContainer,
    tertiaryContainer: QuietTokens.colorWarningContainer,
    onTertiaryContainer: QuietTokens.colorWarning,
    tertiaryFixed: QuietTokens.colorWarning,
    tertiaryFixedDim: QuietTokens.colorWarning,
    onTertiaryFixed: QuietTokens.colorWarningContainer,
    onTertiaryFixedVariant: QuietTokens.colorWarningContainer,
    error: QuietTokens.colorDanger,
    onError: QuietTokens.colorDangerContainer,
    errorContainer: QuietTokens.colorDangerContainer,
    onErrorContainer: QuietTokens.colorDanger,
    surface: QuietTokens.colorSurface,
    onSurface: QuietTokens.colorText,
    onSurfaceVariant: QuietTokens.colorTextMuted,
    surfaceDim: QuietTokens.colorBackground,
    surfaceBright: QuietTokens.colorSurfaceHigh,
    surfaceContainerLowest: QuietTokens.colorBackground,
    surfaceContainerLow: QuietTokens.colorSurfaceLow,
    surfaceContainer: QuietTokens.colorSurface,
    surfaceContainerHigh: QuietTokens.colorSurfaceHigh,
    surfaceContainerHighest: QuietTokens.colorSurfaceHigh,
    inverseSurface: QuietTokens.colorText,
    onInverseSurface: QuietTokens.colorBackground,
    inversePrimary: QuietTokens.colorOnPrimary,
    outline: QuietTokens.colorOutline,
    outlineVariant: QuietTokens.colorOutline,
    shadow: QuietTokens.colorBackground,
    scrim: QuietTokens.colorBackground,
    surfaceTint: Colors.transparent,
  );
  final base = ThemeData(useMaterial3: true, colorScheme: scheme);
  final pill = FilledButton.styleFrom(
    minimumSize: const Size(48, 48),
    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
    shape: const StadiumBorder(),
    animationDuration: reduceMotion ? Duration.zero : null,
    backgroundColor: QuietTokens.colorAction,
    foregroundColor: QuietTokens.colorOnAction,
  );
  return base.copyWith(
    scaffoldBackgroundColor: QuietTokens.colorBackground,
    canvasColor: QuietTokens.colorBackground,
    applyElevationOverlayColor: false,
    visualDensity: VisualDensity.standard,
    materialTapTargetSize: MaterialTapTargetSize.padded,
    splashFactory: reduceMotion ? NoSplash.splashFactory : base.splashFactory,
    textTheme: base.textTheme.copyWith(
      displaySmall: const TextStyle(fontSize: QuietTokens.typeHeadline, height: QuietTokens.lineHeightHeading, fontWeight: FontWeight.w500),
      headlineMedium: const TextStyle(fontSize: QuietTokens.typeTitle, height: QuietTokens.lineHeightHeading, fontWeight: FontWeight.w500),
      titleLarge: const TextStyle(fontSize: QuietTokens.typeTitle, height: QuietTokens.lineHeightHeading, fontWeight: FontWeight.w500),
      bodyLarge: const TextStyle(fontSize: QuietTokens.typeBody, height: QuietTokens.lineHeightBody),
      bodyMedium: const TextStyle(fontSize: QuietTokens.typeLabel, height: QuietTokens.lineHeightBody),
    ).apply(bodyColor: QuietTokens.colorText, displayColor: QuietTokens.colorText),
    cardTheme: const CardThemeData(
      elevation: 0,
      color: QuietTokens.colorSurface,
      surfaceTintColor: Colors.transparent,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(QuietTokens.radiusCardCompact)),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(style: pill),
    outlinedButtonTheme: OutlinedButtonThemeData(style: OutlinedButton.styleFrom(
      minimumSize: const Size(48, 48),
      foregroundColor: QuietTokens.colorText,
      side: const BorderSide(color: QuietTokens.colorOutline),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      shape: const StadiumBorder(),
      animationDuration: reduceMotion ? Duration.zero : null,
    )),
    textButtonTheme: TextButtonThemeData(style: TextButton.styleFrom(
      minimumSize: const Size(48, 48),
      animationDuration: reduceMotion ? Duration.zero : null,
    )),
    iconButtonTheme: IconButtonThemeData(style: IconButton.styleFrom(
      minimumSize: const Size(48, 48),
      foregroundColor: QuietTokens.colorText,
    )),
    inputDecorationTheme: const InputDecorationTheme(
      filled: true,
      fillColor: QuietTokens.colorSurface,
      contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(QuietTokens.radiusControl)),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(color: QuietTokens.colorOutline),
        borderRadius: BorderRadius.all(Radius.circular(QuietTokens.radiusControl)),
      ),
    ),
    navigationBarTheme: const NavigationBarThemeData(
      backgroundColor: QuietTokens.colorBackground,
      surfaceTintColor: Colors.transparent,
      indicatorColor: QuietTokens.colorSurfaceHigh,
      elevation: 0,
    ),
    navigationRailTheme: const NavigationRailThemeData(
      backgroundColor: QuietTokens.colorBackground,
      indicatorColor: QuietTokens.colorSurfaceHigh,
    ),
    drawerTheme: const DrawerThemeData(
      backgroundColor: QuietTokens.colorBackground,
      surfaceTintColor: Colors.transparent,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: QuietTokens.colorBackground,
      foregroundColor: QuietTokens.colorText,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
    ),
    dialogTheme: const DialogThemeData(
      backgroundColor: QuietTokens.colorSurface,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(QuietTokens.radiusCardCompact)),
      ),
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: QuietTokens.colorSurface,
      modalBackgroundColor: QuietTokens.colorSurface,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(QuietTokens.radiusCardCompact)),
      ),
    ),
    snackBarTheme: const SnackBarThemeData(
      backgroundColor: QuietTokens.colorSurfaceHigh,
      contentTextStyle: TextStyle(color: QuietTokens.colorText),
      actionTextColor: QuietTokens.colorPrimary,
      behavior: SnackBarBehavior.floating,
    ),
  );
}

/// Put below MaterialApp using its builder. It observes system motion changes.
/// The inherited MediaQuery, text scaling, locale and direction are preserved.
class QuietRoot extends StatelessWidget {
  const QuietRoot({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final reduced = MediaQuery.disableAnimationsOf(context);
    return Theme(
      data: quietMaterialTheme(reduceMotion: reduced),
      child: ColoredBox(color: QuietTokens.colorBackground, child: child),
    );
  }
}
