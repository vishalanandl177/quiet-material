import 'package:flutter/material.dart';
import 'quiet_tokens.dart';

// Zero alpha, not a palette colour: painting a fully transparent surface tint is how Flutter
// switches its tonal elevation overlay off. Every real colour in this file comes from a token.
const Color _noTint = Colors.transparent;

// Shape. Every corner is a declared step; nothing invents a radius and nothing shares one by accident.
const BorderRadius _radiusTile = BorderRadius.all(Radius.circular(QuietTokens.radiusTile));
const BorderRadius _radiusControl = BorderRadius.all(Radius.circular(QuietTokens.radiusControl));
const BorderRadius _radiusCard = BorderRadius.all(Radius.circular(QuietTokens.radiusCard));
const BorderRadius _radiusDialog = BorderRadius.all(Radius.circular(QuietTokens.radiusDialog));
const RoundedRectangleBorder _controlShape = RoundedRectangleBorder(borderRadius: _radiusControl);
const RoundedRectangleBorder _dialogShape = RoundedRectangleBorder(borderRadius: _radiusDialog);
const StadiumBorder _pillShape = StadiumBorder();
// A grouping edge belongs on the surface itself, so cards, menus and dialogs carry it in their shape.
const RoundedRectangleBorder _groupedCardShape = RoundedRectangleBorder(borderRadius: _radiusCard, side: _decorativeEdge);
const RoundedRectangleBorder _groupedDialogShape = RoundedRectangleBorder(borderRadius: _radiusDialog, side: _decorativeEdge);
const RoundedRectangleBorder _sheetShape = RoundedRectangleBorder(
  borderRadius: BorderRadius.vertical(top: Radius.circular(QuietTokens.radiusDialog)));
// A 24 logical-pixel selection box needs a tighter corner than any declared step, so it takes half of it.
const RoundedRectangleBorder _selectionBoxShape = RoundedRectangleBorder(
  borderRadius: BorderRadius.all(Radius.circular(QuietTokens.radiusSmall / 2)));

// Borders. A decorative edge groups a surface; a control edge says "you can operate this".
const BorderSide _decorativeEdge = BorderSide(color: QuietTokens.colorOutlineVariant, width: QuietTokens.borderWidth);
const BorderSide _controlEdge = BorderSide(color: QuietTokens.colorOutline, width: QuietTokens.borderWidth);
const BorderSide _disabledEdge = BorderSide(color: QuietTokens.colorDisabled, width: QuietTokens.borderWidth);
const BorderSide _dangerEdge = BorderSide(color: QuietTokens.colorDanger, width: QuietTokens.borderWidth);
const BorderSide _focusEdge = BorderSide(color: QuietTokens.colorFocus, width: QuietTokens.borderFocus);
// On a white-filled control the ring has to read against the fill, so it switches to the contrast token.
const BorderSide _focusEdgeOnFill = BorderSide(color: QuietTokens.colorFocusContrast, width: QuietTokens.borderFocus);
// A selection box is small, so its boundary carries twice the stroke to stay readable at 24 logical pixels.
const BorderSide _selectionEdge = BorderSide(color: QuietTokens.colorOutline, width: QuietTokens.borderWidth * 2);
const BorderSide _selectionEdgeChosen = BorderSide(color: QuietTokens.colorPrimary, width: QuietTokens.borderWidth * 2);
const BorderSide _selectionEdgeDisabled = BorderSide(color: QuietTokens.colorDisabled, width: QuietTokens.borderWidth * 2);
// A chosen chip keeps a boundary, drawn in its own fill so it reads as one white pill.
const BorderSide _selectionFillEdge = BorderSide(color: QuietTokens.colorPrimary, width: QuietTokens.borderWidth);

// Depth. Flutter expresses a shadow as one elevation number, so each shipped composite maps to its
// own token offset: level1 locally raised, level2 menus and popovers, level3 dialogs, sheets and FAB.
const double _flat = QuietTokens.space0;
const double _level1 = QuietTokens.elevationLevel1OffsetY;
const double _level2 = QuietTokens.elevationLevel2OffsetY;
const double _level3 = QuietTokens.elevationLevel3OffsetY;

const Size _touchTarget = Size(QuietTokens.sizeTouchTarget, QuietTokens.sizeTouchTarget);
// 14 - the vertical trim that lands a single-line label on a 48 unit target; no spacing step matches.
const EdgeInsets _buttonPadding = EdgeInsets.symmetric(horizontal: QuietTokens.space6, vertical: 14);

/// Theme stock Material widgets while retaining their input and semantics APIs.
ThemeData quietMaterialTheme({bool reduceMotion = false}) {
  // Every Material 3 color role is intentional and resolves to a generated Quiet token, so no
  // component can fall back to the toolkit's purple/blue baseline. Fixed roles reuse the same
  // accessible pair because Quiet Material supplies one dark theme, not a second generated palette.
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
    // secondaryContainer drives navigation indicators, drawer indicators, selected chips and
    // date-range fills. It is the graphite "you are here" container now, never the mint status fill.
    secondaryContainer: QuietTokens.colorPrimaryContainer,
    onSecondaryContainer: QuietTokens.colorOnPrimaryContainer,
    secondaryFixed: QuietTokens.colorSecondary,
    secondaryFixedDim: QuietTokens.colorSecondary,
    onSecondaryFixed: QuietTokens.colorOnSecondary,
    onSecondaryFixedVariant: QuietTokens.colorOnSecondary,
    // tertiary carried the warning yellow and leaked into the time picker AM/PM selector. Neutral now;
    // the warning tokens stay available for genuine status through QuietTokens directly.
    tertiary: QuietTokens.colorPrimary,
    onTertiary: QuietTokens.colorOnPrimary,
    tertiaryContainer: QuietTokens.colorPrimaryContainer,
    onTertiaryContainer: QuietTokens.colorOnPrimaryContainer,
    tertiaryFixed: QuietTokens.colorPrimary,
    tertiaryFixedDim: QuietTokens.colorPrimary,
    onTertiaryFixed: QuietTokens.colorOnPrimary,
    onTertiaryFixedVariant: QuietTokens.colorOnPrimary,
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
    // An action drawn on the inverted (white) surface has to be black.
    inversePrimary: QuietTokens.colorOnPrimary,
    outline: QuietTokens.colorOutline,
    // outlineVariant is the decorative grouping edge and the divider colour. Anything whose edge
    // identifies a control passes colorOutline explicitly instead.
    outlineVariant: QuietTokens.colorOutlineVariant,
    shadow: QuietTokens.colorPaletteBlack,
    scrim: QuietTokens.colorScrim,
    // A transparent tint makes surfaceColorAtElevation a no-op, so elevation never tints a surface.
    surfaceTint: _noTint,
  );
  final base = ThemeData(useMaterial3: true, colorScheme: scheme);
  // Strong action: white fill, black content. The focus ring flips to the contrast token so it reads
  // against that fill, which keeps focus visually distinct from selection.
  final pill = FilledButton.styleFrom(
    minimumSize: _touchTarget,
    padding: _buttonPadding,
    shape: _pillShape,
    animationDuration: reduceMotion ? Duration.zero : null,
    backgroundColor: QuietTokens.colorAction,
    foregroundColor: QuietTokens.colorOnAction,
    disabledBackgroundColor: QuietTokens.colorSurfaceLow,
    disabledForegroundColor: QuietTokens.colorDisabled,
  ).copyWith(side: WidgetStateProperty.resolveWith(
    (states) => states.contains(WidgetState.focused) ? _focusEdgeOnFill : null));
  return base.copyWith(
    scaffoldBackgroundColor: QuietTokens.colorBackground,
    canvasColor: QuietTokens.colorBackground,
    shadowColor: QuietTokens.colorPaletteBlack,
    dividerColor: QuietTokens.colorOutlineVariant,
    applyElevationOverlayColor: false,
    visualDensity: VisualDensity.standard,
    materialTapTargetSize: MaterialTapTargetSize.padded,
    splashFactory: reduceMotion ? NoSplash.splashFactory : base.splashFactory,
    // State layers come from the declared steps, not from framework opacity guesses.
    hoverColor: QuietTokens.colorText.withValues(alpha: QuietTokens.stateHover),
    focusColor: QuietTokens.colorText.withValues(alpha: QuietTokens.stateFocus),
    highlightColor: QuietTokens.colorText.withValues(alpha: QuietTokens.statePressed),
    splashColor: QuietTokens.colorText.withValues(alpha: QuietTokens.statePressed),
    iconTheme: const IconThemeData(color: QuietTokens.colorText),
    textTheme: base.textTheme.copyWith(
      displaySmall: const TextStyle(fontSize: QuietTokens.typeHeadline, height: QuietTokens.lineHeightHeading, fontWeight: FontWeight.w500),
      headlineMedium: const TextStyle(fontSize: QuietTokens.typeTitle, height: QuietTokens.lineHeightHeading, fontWeight: FontWeight.w500),
      titleLarge: const TextStyle(fontSize: QuietTokens.typeTitle, height: QuietTokens.lineHeightHeading, fontWeight: FontWeight.w500),
      bodyLarge: const TextStyle(fontSize: QuietTokens.typeBody, height: QuietTokens.lineHeightBody),
      bodyMedium: const TextStyle(fontSize: QuietTokens.typeLabel, height: QuietTokens.lineHeightBody),
    ).apply(bodyColor: QuietTokens.colorText, displayColor: QuietTokens.colorText),
    cardTheme: const CardThemeData(
      elevation: _flat,
      color: QuietTokens.colorSurface,
      shadowColor: QuietTokens.elevationLevel1Color,
      surfaceTintColor: _noTint,
      margin: EdgeInsets.zero,
      shape: _groupedCardShape, // A grouping edge, never a control boundary.
    ),
    filledButtonTheme: FilledButtonThemeData(style: pill),
    elevatedButtonTheme: ElevatedButtonThemeData(style: ElevatedButton.styleFrom(
      minimumSize: _touchTarget,
      backgroundColor: QuietTokens.colorSurfaceHigh,
      foregroundColor: QuietTokens.colorText,
      disabledBackgroundColor: QuietTokens.colorSurfaceLow,
      disabledForegroundColor: QuietTokens.colorDisabled,
      shadowColor: QuietTokens.elevationLevel1Color,
      surfaceTintColor: _noTint,
      elevation: _level1, // Locally raised, not floating.
      padding: _buttonPadding,
      shape: _pillShape,
      animationDuration: reduceMotion ? Duration.zero : null,
    ).copyWith(side: WidgetStateProperty.resolveWith(
      (states) => states.contains(WidgetState.focused) ? _focusEdge : null))),
    outlinedButtonTheme: OutlinedButtonThemeData(style: OutlinedButton.styleFrom(
      minimumSize: _touchTarget,
      foregroundColor: QuietTokens.colorText,
      disabledForegroundColor: QuietTokens.colorDisabled,
      padding: _buttonPadding,
      shape: _pillShape,
      animationDuration: reduceMotion ? Duration.zero : null,
    ).copyWith(side: WidgetStateProperty.resolveWith((states) {
      if (states.contains(WidgetState.disabled)) return _disabledEdge;
      if (states.contains(WidgetState.focused)) return _focusEdge;
      return _controlEdge; // The edge is what identifies this control.
    }))),
    textButtonTheme: TextButtonThemeData(style: TextButton.styleFrom(
      minimumSize: _touchTarget,
      foregroundColor: QuietTokens.colorText, // Quiet action: no fill, token label.
      disabledForegroundColor: QuietTokens.colorDisabled,
      padding: const EdgeInsets.symmetric(horizontal: QuietTokens.space4, vertical: 14), // 14 - see _buttonPadding.
      shape: _pillShape,
      animationDuration: reduceMotion ? Duration.zero : null,
    )),
    iconButtonTheme: IconButtonThemeData(style: IconButton.styleFrom(
      minimumSize: _touchTarget,
      disabledForegroundColor: QuietTokens.colorDisabled,
      // No foregroundColor here on purpose: a theme-level value would override IconButton.filled's
      // black-on-white pair and paint a white glyph on a white fill. QuietIconButton sets emphasis.
    )),
    segmentedButtonTheme: SegmentedButtonThemeData(style: ButtonStyle(
      minimumSize: const WidgetStatePropertyAll(_touchTarget),
      shape: const WidgetStatePropertyAll(_pillShape),
      // Chosen segment: white fill, black content. Unchosen segments sit on the recessed step.
      backgroundColor: WidgetStateProperty.resolveWith((states) => states.contains(WidgetState.selected)
          ? QuietTokens.colorPrimary : QuietTokens.colorSurfaceLow),
      foregroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return QuietTokens.colorDisabled;
        if (states.contains(WidgetState.selected)) return QuietTokens.colorOnPrimary;
        return QuietTokens.colorText;
      }),
      iconColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return QuietTokens.colorDisabled;
        if (states.contains(WidgetState.selected)) return QuietTokens.colorOnPrimary;
        return QuietTokens.colorText;
      }),
      side: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.focused)) {
          return states.contains(WidgetState.selected) ? _focusEdgeOnFill : _focusEdge;
        }
        return _decorativeEdge; // The surface step identifies the selector; the edge only groups it.
      }),
      animationDuration: reduceMotion ? Duration.zero : null,
    )),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: QuietTokens.colorPrimaryContainer,
      foregroundColor: QuietTokens.colorOnPrimaryContainer,
      elevation: _level3, // Genuinely floating.
      focusElevation: _level3,
      hoverElevation: _level3,
      highlightElevation: _level3,
      disabledElevation: _flat,
      shape: _controlShape,
      extendedPadding: EdgeInsets.symmetric(horizontal: QuietTokens.space5),
      extendedIconLabelSpacing: QuietTokens.space3,
    ),
    chipTheme: ChipThemeData(
      // Chosen chip: white fill, black label. Unchosen: no fill, functional edge, supporting label.
      color: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return states.contains(WidgetState.disabled) ? QuietTokens.colorSurfaceHigh : QuietTokens.colorPrimary;
        }
        return null; // No fill: the functional edge is what identifies an unchosen chip.
      }),
      labelStyle: TextStyle(color: WidgetStateColor.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return QuietTokens.colorDisabled;
        if (states.contains(WidgetState.selected)) return QuietTokens.colorOnPrimary;
        return QuietTokens.colorTextMuted;
      }), fontSize: QuietTokens.typeLabel, height: QuietTokens.lineHeightControl),
      secondaryLabelStyle: TextStyle(color: WidgetStateColor.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return QuietTokens.colorDisabled;
        if (states.contains(WidgetState.selected)) return QuietTokens.colorOnPrimary;
        return QuietTokens.colorTextMuted;
      }), fontSize: QuietTokens.typeLabel, height: QuietTokens.lineHeightControl),
      checkmarkColor: QuietTokens.colorOnPrimary,
      iconTheme: IconThemeData(size: QuietTokens.space5, color: WidgetStateColor.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return QuietTokens.colorDisabled;
        return states.contains(WidgetState.selected) ? QuietTokens.colorOnPrimary : QuietTokens.colorTextMuted;
      })),
      deleteIconColor: WidgetStateColor.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return QuietTokens.colorDisabled;
        return states.contains(WidgetState.selected) ? QuietTokens.colorOnPrimary : QuietTokens.colorTextMuted;
      }),
      surfaceTintColor: _noTint,
      shadowColor: QuietTokens.elevationLevel1Color,
      elevation: _flat,
      pressElevation: _flat,
      shape: _pillShape,
      padding: const EdgeInsets.symmetric(horizontal: QuietTokens.space3, vertical: QuietTokens.space2),
      side: WidgetStateBorderSide.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return _disabledEdge;
        if (states.contains(WidgetState.selected)) return _selectionFillEdge;
        return _controlEdge;
      }),
    ),
    switchTheme: SwitchThemeData(
      // ON track: white fill, black thumb. OFF: default surface with the functional control edge.
      trackColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return QuietTokens.colorSurfaceLow;
        if (states.contains(WidgetState.selected)) return QuietTokens.colorPrimary;
        return QuietTokens.colorSurface;
      }),
      thumbColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return QuietTokens.colorDisabled;
        if (states.contains(WidgetState.selected)) return QuietTokens.colorOnPrimary;
        return QuietTokens.colorTextMuted;
      }),
      trackOutlineColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return QuietTokens.colorDisabled;
        if (states.contains(WidgetState.selected)) return QuietTokens.colorPrimary;
        return QuietTokens.colorOutline;
      }),
      trackOutlineWidth: const WidgetStatePropertyAll(QuietTokens.borderWidth),
      overlayColor: WidgetStatePropertyAll(QuietTokens.colorText.withValues(alpha: QuietTokens.stateHover)),
    ),
    checkboxTheme: CheckboxThemeData(
      // Checked box: white fill, black check. The mark and the fill both carry the state.
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (!states.contains(WidgetState.selected)) return null; // Unchecked: no fill, the edge carries it.
        return states.contains(WidgetState.disabled) ? QuietTokens.colorDisabled : QuietTokens.colorPrimary;
      }),
      checkColor: const WidgetStatePropertyAll(QuietTokens.colorOnPrimary),
      side: WidgetStateBorderSide.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return _selectionEdgeDisabled;
        if (states.contains(WidgetState.selected)) return _selectionEdgeChosen;
        return _selectionEdge;
      }),
      shape: _selectionBoxShape,
      overlayColor: WidgetStatePropertyAll(QuietTokens.colorText.withValues(alpha: QuietTokens.stateHover)),
    ),
    radioTheme: RadioThemeData(
      // A radio has no fill to invert, so the chosen one takes the white ring and dot.
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return QuietTokens.colorDisabled;
        if (states.contains(WidgetState.selected)) return QuietTokens.colorPrimary;
        return QuietTokens.colorOutline;
      }),
      overlayColor: WidgetStatePropertyAll(QuietTokens.colorText.withValues(alpha: QuietTokens.stateHover)),
    ),
    sliderTheme: SliderThemeData(
      activeTrackColor: QuietTokens.colorPrimary,
      inactiveTrackColor: QuietTokens.colorPrimaryContainer,
      thumbColor: QuietTokens.colorPrimary,
      disabledActiveTrackColor: QuietTokens.colorDisabled,
      disabledInactiveTrackColor: QuietTokens.colorSurfaceHigh,
      disabledThumbColor: QuietTokens.colorDisabled,
      activeTickMarkColor: QuietTokens.colorOnPrimary,
      inactiveTickMarkColor: QuietTokens.colorTextMuted,
      overlayColor: QuietTokens.colorText.withValues(alpha: QuietTokens.stateHover),
      valueIndicatorColor: QuietTokens.colorSurfaceHigh,
      valueIndicatorTextStyle: const TextStyle(color: QuietTokens.colorText, fontSize: QuietTokens.typeLabel),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: QuietTokens.colorPrimary,
      linearTrackColor: QuietTokens.colorPrimaryContainer,
      circularTrackColor: QuietTokens.colorPrimaryContainer,
      linearMinHeight: QuietTokens.space1,
    ),
    badgeTheme: const BadgeThemeData(
      // A count is not a status, so the badge uses the neutral tonal pair rather than the error role.
      backgroundColor: QuietTokens.colorPrimaryContainer,
      textColor: QuietTokens.colorOnPrimaryContainer,
      textStyle: TextStyle(fontSize: QuietTokens.typeCaption, fontWeight: FontWeight.w500),
    ),
    dividerTheme: const DividerThemeData(
      color: QuietTokens.colorOutlineVariant, // Decorative separation.
      thickness: QuietTokens.borderWidth,
      space: QuietTokens.space4,
    ),
    listTileTheme: const ListTileThemeData(
      shape: _controlShape,
      textColor: QuietTokens.colorText,
      iconColor: QuietTokens.colorTextMuted,
      // Current row: the graphite container treatment, not a white fill and not hue alone.
      selectedColor: QuietTokens.colorOnPrimaryContainer,
      selectedTileColor: QuietTokens.colorPrimaryContainer,
      contentPadding: EdgeInsets.symmetric(horizontal: QuietTokens.space4),
      minVerticalPadding: QuietTokens.space3,
    ),
    inputDecorationTheme: const InputDecorationTheme(
      filled: true,
      fillColor: QuietTokens.colorSurfaceLow, // A field is recessed into its surface.
      // 18 - the vertical trim that keeps a single-line field on a 48 unit target; no step matches.
      contentPadding: EdgeInsets.symmetric(horizontal: QuietTokens.space5, vertical: 18),
      labelStyle: TextStyle(color: QuietTokens.colorTextMuted),
      floatingLabelStyle: TextStyle(color: QuietTokens.colorText),
      // Supporting copy stays muted: the disabled token is reserved for genuinely inactive controls.
      helperStyle: TextStyle(color: QuietTokens.colorTextMuted),
      hintStyle: TextStyle(color: QuietTokens.colorTextMuted),
      errorStyle: TextStyle(color: QuietTokens.colorDanger),
      prefixIconColor: QuietTokens.colorTextMuted,
      suffixIconColor: QuietTokens.colorTextMuted,
      border: OutlineInputBorder(borderRadius: _radiusControl, borderSide: _controlEdge),
      enabledBorder: OutlineInputBorder(borderRadius: _radiusControl, borderSide: _controlEdge),
      focusedBorder: OutlineInputBorder(borderRadius: _radiusControl, borderSide: _focusEdge),
      disabledBorder: OutlineInputBorder(borderRadius: _radiusControl, borderSide: _disabledEdge),
      errorBorder: OutlineInputBorder(borderRadius: _radiusControl, borderSide: _dangerEdge),
      focusedErrorBorder: OutlineInputBorder(borderRadius: _radiusControl,
        borderSide: BorderSide(color: QuietTokens.colorDanger, width: QuietTokens.borderFocus)),
    ),
    searchBarTheme: SearchBarThemeData(
      backgroundColor: const WidgetStatePropertyAll(QuietTokens.colorSurfaceHigh),
      surfaceTintColor: const WidgetStatePropertyAll(_noTint),
      shadowColor: const WidgetStatePropertyAll(QuietTokens.elevationLevel1Color),
      elevation: const WidgetStatePropertyAll(_flat),
      shape: const WidgetStatePropertyAll(_pillShape),
      side: const WidgetStatePropertyAll(_controlEdge),
      padding: const WidgetStatePropertyAll(EdgeInsets.symmetric(horizontal: QuietTokens.space4)),
      textStyle: const WidgetStatePropertyAll(TextStyle(color: QuietTokens.colorText, fontSize: QuietTokens.typeBody)),
      hintStyle: const WidgetStatePropertyAll(TextStyle(color: QuietTokens.colorTextMuted, fontSize: QuietTokens.typeBody)),
      overlayColor: WidgetStatePropertyAll(QuietTokens.colorText.withValues(alpha: QuietTokens.stateHover)),
    ),
    searchViewTheme: const SearchViewThemeData(
      backgroundColor: QuietTokens.colorSurfaceHigh, // Elevated overlay.
      surfaceTintColor: _noTint,
      elevation: _level3,
      side: _decorativeEdge,
      shape: _dialogShape,
      dividerColor: QuietTokens.colorOutlineVariant,
      headerTextStyle: TextStyle(color: QuietTokens.colorText, fontSize: QuietTokens.typeBody),
      headerHintStyle: TextStyle(color: QuietTokens.colorTextMuted, fontSize: QuietTokens.typeBody),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: QuietTokens.colorBackground,
      surfaceTintColor: _noTint,
      shadowColor: QuietTokens.elevationLevel1Color,
      // Active destination: the graphite "current location" container, not a white fill.
      indicatorColor: QuietTokens.colorPrimaryContainer,
      indicatorShape: _pillShape,
      elevation: _flat,
      iconTheme: WidgetStateProperty.resolveWith((states) => IconThemeData(
        color: states.contains(WidgetState.selected) ? QuietTokens.colorOnPrimaryContainer : QuietTokens.colorTextMuted,
        size: QuietTokens.space6)),
      labelTextStyle: WidgetStateProperty.resolveWith((states) => TextStyle(
        // The label sits below the indicator on the black bar, so it takes the content tokens.
        color: states.contains(WidgetState.selected) ? QuietTokens.colorText : QuietTokens.colorTextMuted,
        fontSize: QuietTokens.typeCaption, height: QuietTokens.lineHeightControl,
        fontWeight: states.contains(WidgetState.selected) ? FontWeight.w500 : FontWeight.w400)),
    ),
    navigationRailTheme: const NavigationRailThemeData(
      backgroundColor: QuietTokens.colorBackground,
      elevation: _flat,
      useIndicator: true,
      indicatorColor: QuietTokens.colorPrimaryContainer,
      indicatorShape: _pillShape,
      selectedIconTheme: IconThemeData(color: QuietTokens.colorOnPrimaryContainer, size: QuietTokens.space6),
      unselectedIconTheme: IconThemeData(color: QuietTokens.colorTextMuted, size: QuietTokens.space6),
      selectedLabelTextStyle: TextStyle(color: QuietTokens.colorText, fontSize: QuietTokens.typeCaption, fontWeight: FontWeight.w500),
      unselectedLabelTextStyle: TextStyle(color: QuietTokens.colorTextMuted, fontSize: QuietTokens.typeCaption),
    ),
    navigationDrawerTheme: NavigationDrawerThemeData(
      backgroundColor: QuietTokens.colorBackground,
      surfaceTintColor: _noTint,
      elevation: _flat,
      indicatorColor: QuietTokens.colorPrimaryContainer,
      indicatorShape: _pillShape,
      iconTheme: WidgetStateProperty.resolveWith((states) => IconThemeData(
        color: states.contains(WidgetState.selected) ? QuietTokens.colorOnPrimaryContainer : QuietTokens.colorTextMuted,
        size: QuietTokens.space6)),
      labelTextStyle: WidgetStateProperty.resolveWith((states) => TextStyle(
        color: states.contains(WidgetState.selected) ? QuietTokens.colorOnPrimaryContainer : QuietTokens.colorText,
        fontSize: QuietTokens.typeLabel, height: QuietTokens.lineHeightControl)),
    ),
    drawerTheme: const DrawerThemeData(
      backgroundColor: QuietTokens.colorBackground,
      surfaceTintColor: _noTint,
      shadowColor: QuietTokens.elevationLevel3Color,
      scrimColor: QuietTokens.colorScrim,
      elevation: _level3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadiusDirectional.horizontal(end: Radius.circular(QuietTokens.radiusDialog)),
        side: _decorativeEdge),
      endShape: RoundedRectangleBorder(
        borderRadius: BorderRadiusDirectional.horizontal(start: Radius.circular(QuietTokens.radiusDialog)),
        side: _decorativeEdge),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: QuietTokens.colorBackground,
      foregroundColor: QuietTokens.colorText,
      surfaceTintColor: _noTint,
      shadowColor: QuietTokens.elevationLevel1Color,
      iconTheme: IconThemeData(color: QuietTokens.colorText, size: QuietTokens.space6),
      actionsIconTheme: IconThemeData(color: QuietTokens.colorText, size: QuietTokens.space6),
      elevation: _flat,
      scrolledUnderElevation: _flat,
    ),
    tabBarTheme: const TabBarThemeData(
      // The tab baseline is decorative separation; the white indicator carries the selection.
      dividerColor: QuietTokens.colorOutlineVariant,
      dividerHeight: QuietTokens.borderWidth,
      indicatorColor: QuietTokens.colorPrimary,
      indicatorSize: TabBarIndicatorSize.label,
      labelColor: QuietTokens.colorText,
      unselectedLabelColor: QuietTokens.colorTextMuted,
      labelStyle: TextStyle(fontSize: QuietTokens.typeLabel, fontWeight: FontWeight.w500, height: QuietTokens.lineHeightControl),
      unselectedLabelStyle: TextStyle(fontSize: QuietTokens.typeLabel, height: QuietTokens.lineHeightControl),
    ),
    menuTheme: const MenuThemeData(style: MenuStyle(
      backgroundColor: WidgetStatePropertyAll(QuietTokens.colorSurfaceHigh),
      surfaceTintColor: WidgetStatePropertyAll(_noTint),
      shadowColor: WidgetStatePropertyAll(QuietTokens.elevationLevel2Color),
      elevation: WidgetStatePropertyAll(_level2), // Menus and popovers.
      shape: WidgetStatePropertyAll(_groupedCardShape),
      padding: WidgetStatePropertyAll(EdgeInsets.all(QuietTokens.space2)),
    )),
    menuBarTheme: const MenuBarThemeData(style: MenuStyle(
      backgroundColor: WidgetStatePropertyAll(QuietTokens.colorSurface),
      surfaceTintColor: WidgetStatePropertyAll(_noTint),
      elevation: WidgetStatePropertyAll(_flat),
      shape: WidgetStatePropertyAll(_controlShape),
    )),
    menuButtonTheme: MenuButtonThemeData(style: ButtonStyle(
      minimumSize: const WidgetStatePropertyAll(Size(QuietTokens.space0, QuietTokens.sizeTouchTarget)),
      shape: const WidgetStatePropertyAll(_controlShape),
      padding: const WidgetStatePropertyAll(
        EdgeInsets.symmetric(horizontal: QuietTokens.space4, vertical: QuietTokens.space3)),
      // A pointed-at or focused option takes the graphite container; the option itself is never tinted.
      backgroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return null;
        return states.contains(WidgetState.hovered) || states.contains(WidgetState.focused)
            ? QuietTokens.colorPrimaryContainer : null;
      }),
      foregroundColor: WidgetStateProperty.resolveWith((states) =>
        states.contains(WidgetState.disabled) ? QuietTokens.colorDisabled : QuietTokens.colorText),
      iconColor: WidgetStateProperty.resolveWith((states) =>
        states.contains(WidgetState.disabled) ? QuietTokens.colorDisabled : QuietTokens.colorTextMuted),
      animationDuration: reduceMotion ? Duration.zero : null,
    )),
    popupMenuTheme: const PopupMenuThemeData(
      color: QuietTokens.colorSurfaceHigh,
      surfaceTintColor: _noTint,
      shadowColor: QuietTokens.elevationLevel2Color,
      elevation: _level2,
      shape: _groupedCardShape,
      textStyle: TextStyle(color: QuietTokens.colorText, fontSize: QuietTokens.typeBody),
      iconColor: QuietTokens.colorTextMuted,
    ),
    tooltipTheme: TooltipThemeData(
      decoration: BoxDecoration(
        color: QuietTokens.colorText, // The inverted surface, as on the web build.
        borderRadius: _radiusTile,
        border: Border.all(color: QuietTokens.colorOutlineVariant, width: QuietTokens.borderWidth),
      ),
      textStyle: const TextStyle(color: QuietTokens.colorBackground, fontSize: QuietTokens.typeCaption),
      padding: const EdgeInsets.symmetric(horizontal: QuietTokens.space3, vertical: QuietTokens.space2),
      margin: const EdgeInsets.symmetric(horizontal: QuietTokens.space2),
    ),
    dialogTheme: const DialogThemeData(
      backgroundColor: QuietTokens.colorSurfaceHigh, // Elevated overlay, not the default card step.
      surfaceTintColor: _noTint,
      shadowColor: QuietTokens.elevationLevel3Color,
      elevation: _level3,
      barrierColor: QuietTokens.colorScrim,
      iconColor: QuietTokens.colorText,
      titleTextStyle: TextStyle(color: QuietTokens.colorText, fontSize: QuietTokens.typeTitle,
        height: QuietTokens.lineHeightHeading, fontWeight: FontWeight.w500),
      contentTextStyle: TextStyle(color: QuietTokens.colorTextMuted, fontSize: QuietTokens.typeBody,
        height: QuietTokens.lineHeightBody),
      actionsPadding: EdgeInsets.fromLTRB(QuietTokens.space6, QuietTokens.space2, QuietTokens.space6, QuietTokens.space6),
      shape: _groupedDialogShape,
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: QuietTokens.colorSurfaceHigh,
      modalBackgroundColor: QuietTokens.colorSurfaceHigh,
      surfaceTintColor: _noTint,
      shadowColor: QuietTokens.elevationLevel3Color,
      elevation: _level3,
      modalElevation: _level3,
      modalBarrierColor: QuietTokens.colorScrim,
      dragHandleColor: QuietTokens.colorTextMuted,
      dragHandleSize: Size(QuietTokens.space8, QuietTokens.space1),
      shape: _sheetShape,
    ),
    snackBarTheme: const SnackBarThemeData(
      backgroundColor: QuietTokens.colorSurfaceHigh,
      contentTextStyle: TextStyle(color: QuietTokens.colorText, fontSize: QuietTokens.typeLabel),
      actionTextColor: QuietTokens.colorPrimary,
      disabledActionTextColor: QuietTokens.colorDisabled,
      closeIconColor: QuietTokens.colorTextMuted,
      elevation: _level3,
      shape: _groupedCardShape,
      behavior: SnackBarBehavior.floating,
    ),
    datePickerTheme: DatePickerThemeData(
      backgroundColor: QuietTokens.colorSurfaceHigh,
      surfaceTintColor: _noTint,
      shadowColor: QuietTokens.elevationLevel3Color,
      elevation: _level3,
      shape: _groupedDialogShape,
      headerBackgroundColor: QuietTokens.colorSurfaceHigh,
      headerForegroundColor: QuietTokens.colorText,
      dividerColor: QuietTokens.colorOutlineVariant,
      weekdayStyle: const TextStyle(color: QuietTokens.colorTextMuted, fontSize: QuietTokens.typeCaption),
      dayStyle: const TextStyle(fontSize: QuietTokens.typeLabel),
      // Chosen day: white fill, black numeral. A range spans the graphite container instead.
      dayBackgroundColor: WidgetStateProperty.resolveWith((states) =>
        states.contains(WidgetState.selected) ? QuietTokens.colorPrimary : null),
      dayForegroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return QuietTokens.colorDisabled;
        return states.contains(WidgetState.selected) ? QuietTokens.colorOnPrimary : QuietTokens.colorText;
      }),
      todayBackgroundColor: WidgetStateProperty.resolveWith((states) =>
        states.contains(WidgetState.selected) ? QuietTokens.colorPrimary : null),
      todayForegroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return QuietTokens.colorDisabled;
        return states.contains(WidgetState.selected) ? QuietTokens.colorOnPrimary : QuietTokens.colorText;
      }),
      todayBorder: _controlEdge,
      yearBackgroundColor: WidgetStateProperty.resolveWith((states) =>
        states.contains(WidgetState.selected) ? QuietTokens.colorPrimary : null),
      yearForegroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return QuietTokens.colorDisabled;
        return states.contains(WidgetState.selected) ? QuietTokens.colorOnPrimary : QuietTokens.colorText;
      }),
      rangeSelectionBackgroundColor: QuietTokens.colorPrimaryContainer,
      rangePickerBackgroundColor: QuietTokens.colorSurfaceHigh,
      rangePickerSurfaceTintColor: _noTint,
      rangePickerShape: _groupedDialogShape,
      rangePickerShadowColor: QuietTokens.elevationLevel3Color,
      rangePickerElevation: _level3,
      rangePickerHeaderBackgroundColor: QuietTokens.colorSurfaceHigh,
      rangePickerHeaderForegroundColor: QuietTokens.colorText,
    ),
    timePickerTheme: TimePickerThemeData(
      backgroundColor: QuietTokens.colorSurfaceHigh,
      shape: _groupedDialogShape,
      elevation: _level3,
      padding: const EdgeInsets.all(QuietTokens.space6),
      helpTextStyle: const TextStyle(color: QuietTokens.colorTextMuted, fontSize: QuietTokens.typeLabel),
      entryModeIconColor: QuietTokens.colorTextMuted,
      dialBackgroundColor: QuietTokens.colorSurfaceLow,
      dialHandColor: QuietTokens.colorPrimary,
      dialTextColor: WidgetStateColor.resolveWith((states) =>
        states.contains(WidgetState.selected) ? QuietTokens.colorOnPrimary : QuietTokens.colorText),
      // Chosen hour, minute and period all follow the selection rule: white fill, black content.
      hourMinuteColor: WidgetStateColor.resolveWith((states) =>
        states.contains(WidgetState.selected) ? QuietTokens.colorPrimary : QuietTokens.colorSurfaceLow),
      hourMinuteTextColor: WidgetStateColor.resolveWith((states) =>
        states.contains(WidgetState.selected) ? QuietTokens.colorOnPrimary : QuietTokens.colorText),
      hourMinuteShape: _controlShape,
      dayPeriodColor: WidgetStateColor.resolveWith((states) =>
        states.contains(WidgetState.selected) ? QuietTokens.colorPrimary : QuietTokens.colorSurfaceLow),
      dayPeriodTextColor: WidgetStateColor.resolveWith((states) =>
        states.contains(WidgetState.selected) ? QuietTokens.colorOnPrimary : QuietTokens.colorText),
      dayPeriodBorderSide: _controlEdge,
      dayPeriodShape: const RoundedRectangleBorder(borderRadius: _radiusControl, side: _controlEdge),
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
