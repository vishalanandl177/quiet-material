# Platforms and implementation contracts

Quiet Material shares one visual language across platforms: a black application background, charcoal content surfaces, clear typography, generous rounded shapes and brief interaction-driven motion. The portable contract is the token source plus component behavior and accessibility rules. CSS is the web implementation; native apps consume generated values through their own UI toolkit.

## What is supplied

| Target | Implementation supplied here | Delivery status |
| --- | --- | --- |
| Responsive web: phone, tablet, desktop browser | HTML/CSS, progressive JavaScript, all 36 MD3 families, supporting patterns and live explorer | Implemented; exact automated/browser evidence is recorded in [validation](validation.md) |
| Android | [Compose adapter and component catalog](../platforms/android/) plus generated Kotlin tokens | Android library build passed in CI; device verification remains pending |
| iOS / iPadOS | [SwiftUI package and component catalog](../platforms/apple/) plus generated Swift tokens | iOS simulator library build passed in CI; device verification remains pending |
| macOS | SwiftUI adapter, Flutter adapter, or responsive web | Swift package build passed in CI; desktop accessibility verification remains pending |
| Windows / Linux desktop | [Flutter source package and example](../platforms/flutter/) or responsive web | Flutter host apps must be created and validated on supported build hosts |
| Shared Flutter application | Theme, component wrappers and explicit Material aliases, adaptive shell, motion helpers and generated Dart tokens | Flutter analysis and all 9 unit/widget tests passed; platform host builds remain pending |
| Other UI stacks | Canonical JSON design tokens and contracts in this documentation | Requires a platform adapter and validation by the consuming team |

Flutter targets Android, iOS, web and desktop operating systems; supported OS versions depend on the Flutter SDK selected for the product. A framework's supported-platform list is not evidence that this repository has been tested on those devices. Consult [Flutter's platform matrix](https://docs.flutter.dev/reference/supported-platforms) when setting a minimum OS.

The adapters supply reusable components and explicit native compositions across the catalog. They reuse toolkit semantics and do not recreate every control from drawing primitives. The matrix below identifies actual source APIs and the few native presentation compositions. Product routing, persistence, validation, permission flows and business logic remain application responsibilities.

## One component contract, native toolkit behavior

The web implementation and state contracts are in the [36-family matrix](md3-components.md). The native APIs below are defined in [Compose QuietCatalog.kt](../platforms/android/src/main/kotlin/com/quietmaterial/QuietCatalog.kt), [SwiftUI QuietCatalog.swift](../platforms/apple/Sources/QuietMaterial/QuietCatalog.swift) and [Flutter quiet_catalog.dart](../platforms/flutter/lib/src/quiet_catalog.dart), together with their theme modules. An alias uses the toolkit's implementation under the Quiet theme; a composition is identified explicitly. The rows describe source APIs; the delivery table and [validation record](validation.md) identify which SDK builds/tests passed and which device checks remain.

| Official family | Android Compose | Apple SwiftUI | Flutter |
| --- | --- | --- | --- |
| Button groups | `QuietButtonGroup` | `QuietButtonGroup` | `QuietButtonGroup` |
| Buttons | `QuietActionButton` | `QuietActionButton` | `QuietButton` |
| Extended FAB | `QuietFab(extended = true)` | `QuietFab(extended: true)` | `QuietFab` extended variant |
| FAB menu | `QuietFabMenu` | `QuietFabMenu`, native menu composition | `QuietFabMenu` |
| Floating action button | `QuietFab` | `QuietFab` | `QuietFab` |
| Icon buttons | `QuietIconButton` | `QuietIconButton` | `QuietIconButton` |
| Segmented buttons | `QuietSegmentedButtons` | `QuietSegments`, native single-selection picker | `QuietSegments` |
| Split button | `QuietSplitButton` | `QuietSplitButton` | `QuietSplitButton` |
| Date pickers | `QuietDatePicker`, `QuietDateRangePicker` | `QuietDatePicker`, `QuietDateRangePicker` | `showQuietDatePicker`, `showQuietDateRangePicker` |
| Time pickers | `QuietTimePicker` | `QuietTimePicker`, native date/time control | `showQuietTimePicker` |
| Loading indicator | `QuietLoadingIndicator`, branded contour animation | `QuietLoadingIndicator`, branded contour animation | `QuietLoadingIndicator`, branded contour animation |
| Progress indicators | `QuietProgress` | `QuietProgress` | `QuietProgress` |
| Navigation bar | `QuietNavigationBar` | `QuietNavigationBar`, `QuietAdaptiveNavigation` | `QuietNavigationBar` alias |
| Navigation drawer | `QuietNavigationDrawer`; native modal drawer composition | `QuietNavigationDrawer`; sheet composition for modal | `QuietNavigationDrawer` alias; Scaffold drawer composition |
| Navigation rail | `QuietNavigationRail` | `QuietNavigationRail` | `QuietNavigationRail` alias |
| Bottom sheets | `QuietBottomSheet`, `QuietStandardBottomSheet` | `.quietBottomSheet`, `QuietStandardBottomSheet` | `showQuietBottomSheet`, `showQuietStandardBottomSheet` |
| Side sheets | `QuietSideSheet`; native Surface for in-layout | `QuietSideSheet`; native sheet for modal | `showQuietSideSheet`; `Drawer`/Surface for in-layout |
| App bars | `QuietTopAppBar`, `QuietBottomAppBar` | `QuietAppBar`; native toolbar composition | `QuietTopAppBar`, `QuietBottomAppBar` aliases |
| Badges | `QuietBadge` | `QuietBadge` | `QuietBadge` |
| Cards | `QuietSurfaceCard` | `QuietSurfaceCard` | `QuietCard` |
| Carousel | `QuietCarousel`, snapping uncontained list | `QuietCarousel`, horizontal scroll composition | `QuietCarousel`, native Material CarouselView |
| Checkbox | `QuietCheckbox` | `QuietCheckbox`, native Toggle semantics | `QuietCheckbox` alias |
| Chips | `QuietChip` | `QuietChip` | `QuietChip` |
| Dialogs | `QuietDialog`, `QuietFullScreenDialog` | `.quietDialog`, `.quietFullScreenDialog` | `QuietDialog` alias, `showQuietFullScreenDialog` |
| Divider | `QuietDivider` | `QuietDivider` | `QuietDivider` |
| Lists | `QuietListItem` | `QuietListItem` | `QuietListItem` |
| Menus | `QuietMenu` | `QuietMenu`, native Menu | `QuietMenu` |
| Radio button | `QuietRadioGroup` | `QuietRadioGroup`, native picker semantics | `QuietRadio` alias |
| Search | `QuietSearch` | `QuietSearch`, native field and controlled results | `QuietSearch` |
| Sliders | `QuietSlider`, `QuietRangeSlider` | `QuietSlider`; `QuietRangeSlider` as labeled bound controls | `QuietSlider` alias, `QuietRangeSlider` |
| Snackbar | `QuietSnackbarHost` | `QuietSnackbar`, persistent status composition | `showQuietSnackbar` |
| Switch | `QuietSwitch` | `QuietToggle` | `QuietSwitch` alias |
| Tabs | `QuietTabs` | `QuietTabs`, navigation-button/content composition | `QuietTabs`, `QuietTabView` aliases |
| Text fields | `QuietField` | `QuietField` | `QuietField` |
| Toolbars | `QuietToolbar` | `QuietToolbar` | `QuietToolbar` |
| Tooltips | `QuietTooltip`, plain/rich | Native `.help` plus `QuietRichTooltip` | `QuietTooltip`, `QuietRichTooltip` |

Supporting patterns such as avatars, accordions, tables and empty states compose native toolkit controls with the same tokens. They are not additional MD3 families.

## Native variants and fallbacks

Native loading indicators implement the same seven branded contours and 650ms target/rotation/spring recipe as the web, with reduced-motion handling. These contours are Quiet geometry, not literal Android RoundedPolygon paths. Stable button groups, FAB menus, split buttons and toolbars provide their action contracts without promising every expressive shape morph. Native carousels cover the documented scrolling/Material CarouselView compositions, not every web carousel layout or Android masking strategy.

SwiftUI intentionally retains Apple system presentations and input semantics. Its range control uses two labeled bound sliders; date range uses coordinated native date controls; segmented selection uses a native single-selection picker. Full-screen dialog presentation uses a full-screen cover on iOS and a sheet on macOS. The standard bottom sheet is an in-layout surface without draggable detents. See each adapter README for precise options and host requirements.

Use the web components when a browser-hosted application needs the same visual implementation on every operating system. Use native adapters when native interaction and platform integration are required. Both approaches consume the same tokens and documented purpose, while native SDK variants remain platform-specific.

Use the current [Compose component catalog](https://developer.android.com/develop/ui/compose/components), [SwiftUI documentation](https://developer.apple.com/documentation/swiftui), and [Flutter Material API](https://api.flutter.dev/flutter/material/material-library.html) for available toolkit APIs and semantics. Where a platform has no direct equivalent, implement the documented purpose with native controls; a matching silhouette alone is insufficient.

## Units, type and colors

| Property | Web | Android | Apple | Flutter |
| --- | --- | --- | --- | --- |
| Layout unit | CSS px; scalable text in rem | dp | pt | Logical pixel |
| Text scaling | Browser zoom and user font settings | sp / system font scale | Dynamic Type | Inherited `TextScaler` |
| Color | sRGB CSS value | Compose color | SwiftUI color | Dart `Color` |
| Time | Milliseconds | Milliseconds | Seconds at API boundary | `Duration(milliseconds: value)` |
| Direction | Logical CSS properties | Start/end padding | Leading/trailing | Directional insets/alignment |
| Motion preference | `prefers-reduced-motion` | Platform animator/accessibility settings | Accessibility Reduce Motion | `MediaQuery.disableAnimationsOf` |

Numeric layout values express design intent in each toolkit's logical units; they are not physical-device pixel counts. Fonts use the native system stack unless the consuming app bundles an appropriately licensed font. Keep font scaling enabled and verify scripts with different character widths. Generate platform values from canonical tokens instead of introducing separate platform palettes.

Black belongs to the application's canvas and safe-area background. Charcoal belongs to cards, dialogs and controls. System-owned keyboards, permission dialogs and OS surfaces retain the platform's presentation; the application theme does not control their entire appearance.

## Interaction contract

- Touch targets are at least 48 logical units in both dimensions, including icon buttons and dismiss actions. Preserve these on pointer devices; visual size may be smaller inside the target.
- A control must have a native role, accessible name, current state and valid keyboard action. Prefer toolkit controls over gesture-only containers.
- Hover is supplementary. Every essential action works through touch, keyboard and assistive technology. Swipe/drag actions need a visible alternative.
- Preserve platform back and dismissal conventions. A modal has a visible dismissal action, appropriate initial focus and a return path. A sheet handle is not its sole exit.
- Avoid announcing entire changing cards. Announce the meaningful new status, expose errors adjacent to fields, and keep urgent recovery information available.
- Reduced motion removes decorative travel/scale and repeated animation. Inspect app-level routes, modals, loading indicators and authored animations separately; a theme alone cannot guarantee that every animation stops.
- At breakpoints preserve selected items, focus where possible, scroll context and unsaved inputs. Choose by available window size, including split view, floating windows and foldable panes.

## What “complete” means for a product release

The system contains visual foundations, reusable token outputs, responsive layout contracts, the full MD3 family catalog with explicit variant scope, motion demonstrations, native adapters and contribution guidance. Product readiness requires building the selected native adapter on its actual SDK and verifying the product's screens, state handling and assistive-technology workflows. Record that evidence in [validation](validation.md); do not replace pending checks with a blanket “all platforms tested” statement.

The repository remains private and has no public license grant. “Usable across platforms” describes implementation portability. “Anyone may download, redistribute or reuse it” requires a separate repository visibility and licensing decision by the owner.

## MD3 motion coverage

The shared system exports all duration/easing roles plus standard and expressive springs. Web supplies the four default transition families and a finite sampled spring helper. Android and Flutter include selected transition helpers; SwiftUI includes curve/spring/progress helpers. Native adapters do not implement a full MD3 container-transform route, and SwiftUI system-owned navigation remains Apple motion. Consult the [MD3 audit](md3-motion-audit.md) and each native README before describing a product as having identical motion across platforms.
