# Quiet Material for Apple platforms

Native SwiftUI component adapter for iOS 16+, iPadOS 16+ and macOS 13+. Requires Xcode 15+ and Swift 5.9+. This folder is a local Swift package; it has no third-party dependencies. The shared tokens use SwiftUI `Color`, logical points, and milliseconds. Semantic SwiftUI fonts supply Dynamic Type instead of copying web font sizes.

## Run the example

1. Clone the repository. In Xcode, use **File → Add Package Dependencies → Add Local** and select `platforms/apple`. Add the `QuietMaterial` product to your app target. The repository root is not a Swift package.
2. Set the deployment target to iOS 16 or macOS 13 (or later).
3. Replace your app's root view with `QuietExample()`:

```swift
import SwiftUI
import QuietMaterial

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup { QuietExample() }
    }
}
```

For your own screen:

```swift
QuietTheme {
    ScrollView {
        QuietCard {
            Text("Welcome").font(.title2)
            Button("Continue") { /* app action */ }
                .buttonStyle(QuietButtonStyle())
        }
        .padding(QuietTokens.layoutPagePaddingCompact)
    }
}
```

Use `QuietTextField("Name", text: $name)` and `QuietToggle("Notifications", isOn: $enabled)` with app-owned state. `.disabled(true)` uses the native environment. Public `EnvironmentValues.quietAppearance` exposes the accent and action colors; pass a customized `QuietAppearance` into `QuietTheme`. Root background stays `#000000`.

## Coverage and native equivalents

| System part | Implementation |
| --- | --- |
| Shared colors, spacing, radii, motion, breakpoints | Generated `QuietTokens.swift` |
| MD3 curves and springs | `QuietMotionCurve`, `QuietMotion`, `QuietMotionProgress`; all seven curves and both spring schemes |
| App / sheet surface | `QuietTheme`; background alone ignores safe areas |
| Button | Native `Button` + `QuietButtonStyle` |
| Card | `QuietCard` content surface |
| Text field and form rows | `QuietTextField`, `QuietToggle`; compose into native `Form` as needed |
| Switch | Native SwiftUI `Toggle` |
| Navigation / dialog | Native `NavigationStack`, `NavigationLink`, `.sheet` in example |
| Full catalog | `QuietCatalog.swift` supplies reusable controls/compositions across all catalog families; platform-specific scope below |

This is a native adapter with a reusable catalog and runnable example. The catalog maps purpose to native semantics; not every web variant has identical geometry or motion. Native controls retain platform layout and interaction conventions. For native `List` or `Form`, use `.scrollContentBackground(.hidden)` and a black background, and apply `.listRowBackground(QuietTokens.colorSurface)` to rows. Theme your app's navigation toolbar backgrounds explicitly where needed; system chrome is platform-owned.

## Responsive and accessible behavior

The sample measures the **available window**, including iPad split view and macOS resizing. It starts with one column, switches to two at 840 points, and returns to one for accessibility Dynamic Type categories. There are no device-name checks or fixed content heights. Text wraps and the whole page scrolls; controls use minimum 48-point height. A card's container is not made into an extra accessibility element, preserving its children.

Apple's semantic fonts follow user text preferences. Button presses use a 10% state layer with MD3 standard easing; arbitrary 0.98 press scaling has been removed. Custom motion is disabled when `accessibilityReduceMotion` is true; native navigation and sheet motion remain managed by SwiftUI. The seven-contour loading indicator animates only when explicitly mounted for pending work; it pauses for Reduce Motion and an inactive scene. Do not use it as ambient decoration. Do not clamp Dynamic Type or replace system back gestures. Keep custom icons labeled, localize strings, and use leading/trailing alignment for RTL.

## MD3 motion integration

`QuietMotion.animation(.standard, milliseconds: QuietTokens.durationShort3, reduceMotion: reduceMotion)` returns a native cubic timing animation. The six single-cubic curves are available through `QuietCubicCurve`. MD3's seventh curve, emphasized, consists of two joined cubics and is exposed without a single-cubic approximation through `QuietMotionCurve.emphasized.transform(_:)` and `QuietMotionProgress`:

```swift
// expanded is app-owned @State. Use 0 and 1 as the progress endpoints.
QuietMotionProgress(
    progress: expanded ? 1 : 0,
    milliseconds: expanded ? QuietTokens.motionContainerDuration
                           : QuietTokens.motionContainerReturnDuration
) { progress in
    RoundedRectangle(cornerRadius: 32 - 16 * progress)
        .fill(QuietTokens.colorSurface)
        .frame(width: 96 + 160 * progress, height: 96 + 64 * progress)
}
```

This example animates a surface's geometry. It does not implement navigation, shared-element matching or a full container transform. `QuietMotionProgress` observes Reduce Motion. It uses native linear interpolation as a clock, then evaluates the chosen MD3 curve; the return direction evaluates the reverse journey with the same forward-time curve. Use `QuietMotion.spring(speed: .default, effects: false, scheme: .standard, reduceMotion: reduceMotion)` for interruptible custom spatial animation. Effects springs use critically damped tokens. SwiftUI's damping coefficient is calculated from MD3's damping ratio at unit mass.

| Pattern | Host integration contract |
| --- | --- |
| Container transform | One matched surface, size/position/shape and content fade; 500 ms outward / 400 ms return, emphasized. Use the progress helper and app-owned shared identity. |
| Shared axis X/Y/Z | 450 ms emphasized, 30-point X/Y travel or 0.8/1.1 Z scale; fade out through 35% then fade in. Mirror X travel in RTL. |
| Fade through | 450 ms emphasized; outgoing content fades through 35%, incoming fades afterward with 0.92→1 scale. |
| Fade | 400 ms emphasized decelerate enter, 150 ms emphasized accelerate exit; enter scale 0.8→1, no exit scale. |

These are custom-presentation contracts, not automatic replacements for SwiftUI's navigation, sheets, menus or toggles. **The starter's native transitions are Apple platform motion, not certified MD3 motion.** Apps requiring identical MD3 navigation must implement and test custom presentations with the helpers, or use the web/Flutter implementation. Preserve dismissal gestures, focus, accessibility and route state when doing so. See the [shared motion guide](../../docs/motion.md) and [official Material motion definitions](https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md).

Before releasing a consuming app, build for both iOS and macOS, test a narrow iPhone and iPad split view, largest accessibility text, VoiceOver order, keyboard focus, sheet dismissal, reduced motion, and landscape with the software keyboard open. Run `swift build --package-path platforms/apple` on a Mac for package compilation, then use an iOS simulator/device for iOS verification. **The package has not been compiled or run on an Apple SDK in this repository's Linux authoring environment.**

## Official references

- [SwiftUI NavigationStack](https://developer.apple.com/documentation/swiftui/navigationstack)
- [SwiftUI Reduce Motion environment](https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion)
- [Apple accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [ViewThatFits for additional content-led adaptations](https://developer.apple.com/documentation/swiftui/viewthatfits)

Edit the shared source in `tokens/quiet-material.tokens.json` and run `npm run build` at the repository root to regenerate native tokens. Do not edit generated values directly.


## Component catalog

`QuietCatalog.swift` exports the following reusable views. All bindings, navigation selection, commands and dismissal state belong to the host application.

| Category | Public APIs |
| --- | --- |
| Actions | `QuietActionButton` and five `QuietButtonKind` variants, `QuietIconButton`, `QuietFab` (compact/extended), `QuietButtonGroup`, `QuietSplitButton`, `QuietFabMenu`, `QuietSegments` |
| Communication | `QuietBadge`, `QuietProgress`, `QuietLoadingIndicator`, `QuietSnackbar`, `.quietTooltip`, `QuietRichTooltip` |
| Containment | `QuietSurfaceCard`, `QuietCarousel`, `QuietListItem`, `QuietDivider`, `.quietDialog`, `.quietFullScreenDialog`, `.quietBottomSheet`, `QuietStandardBottomSheet`, `QuietSideSheet` |
| Navigation | `QuietAdaptiveNavigation`, `QuietNavigationBar`, `QuietNavigationRail`, `QuietNavigationDrawer`, `QuietAppBar`, `QuietTabs`, `QuietToolbar` |
| Selection/input | `QuietCheckbox`, `QuietRadioGroup`, `QuietChip`, `QuietSlider`, `QuietRangeSlider`, `QuietDatePicker`, `QuietDateRangePicker`, `QuietTimePicker`, `QuietMenu`, `QuietField`, `QuietSearch`, existing `QuietToggle` |

```swift
@State private var destination = "home"

// Inside a View's body, under QuietTheme:
QuietAdaptiveNavigation(choices: [
    QuietChoice(id: "home", label: "Home", systemImage: "house"),
    QuietChoice(id: "settings", label: "Settings", systemImage: "gear")
], selection: $destination) {
    Text(destination)
}
```

The adaptive container keeps the content in one structural location and moves navigation through safe-area insets. It uses current window width and accessibility text size; app routing remains your responsibility. `QuietAction` requires a stable ID and callback. The snackbar is controlled and remains visible until the app dismisses it; no timer silently removes an action. Plain tooltip text uses `.help`; essential help must also be available in the focusable rich help presentation on touch devices.

The loading indicator uses the same seven branded contours, 650 ms target interval, stiffness 200/damping ratio 0.6 and compound rotation as the web implementation. It is a real shape morph, not a spinner alias. `TimelineView` stops its animation schedule for Reduce Motion or an inactive scene. The contour geometry is Quiet artwork, not a copy of Android RoundedPolygon paths.

Apple-specific variants remain explicit: `QuietSegments` is single selection; multiple selection composes filter chips. Radio selection uses native `Picker`; a range uses two labeled native sliders; date range uses two coordinated date controls. Keep range bounds ordered before creating these views. Carousels are horizontal scrolling content, not all MD3 masking variants. `QuietField` has persistent labels rather than MD3 floating-label animation. Search combines a field with app-owned results. Toolbars/groups use native buttons without expressive connected-shape morphing. `QuietStandardBottomSheet` is an in-layout surface without detents; modal bottom sheets use medium/large native detents on iOS and native sheets on macOS. Full-screen dialogs use `fullScreenCover` on iOS and native sheets on macOS. The host must supply a visible dismiss action and can present `QuietSideSheet` through a native sheet at compact widths.

These native presentation choices retain **Apple motion**, not universal MD3 motion parity. Source availability is not SDK validation: run `swift build --package-path platforms/apple` on macOS, then build an iOS host/simulator and test VoiceOver, input, cancellation and state restoration before release.
