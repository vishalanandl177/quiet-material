# Quiet Material for Apple platforms

Native SwiftUI starter adapter for iOS 16+, iPadOS 16+ and macOS 13+. Requires Xcode 15+ and Swift 5.9+. This folder is a local Swift package; it has no third-party dependencies. The shared tokens use SwiftUI `Color`, logical points, and milliseconds. Semantic SwiftUI fonts supply Dynamic Type instead of copying web font sizes.

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
| App / sheet surface | `QuietTheme`; background alone ignores safe areas |
| Button | Native `Button` + `QuietButtonStyle` |
| Card | `QuietCard` content surface |
| Text field and form rows | `QuietTextField`, `QuietToggle`; compose into native `Form` as needed |
| Switch | Native SwiftUI `Toggle` |
| Navigation / dialog | Native `NavigationStack`, `NavigationLink`, `.sheet` in example |
| Tabs, pickers, lists, menus, sliders, progress, alerts | Use `TabView`, `Picker`, `List`, `Menu`, `Slider`, `ProgressView`, `.alert` under the theme; no custom wrappers shipped |

This is an adapter and runnable starter screen, not an implementation of every web example. Native controls retain platform layout and interaction conventions. For native `List` or `Form`, use `.scrollContentBackground(.hidden)` and a black background, and apply `.listRowBackground(QuietTokens.colorSurface)` to rows. Theme your app's navigation toolbar backgrounds explicitly where needed; system chrome is platform-owned.

## Responsive and accessible behavior

The sample measures the **available window**, including iPad split view and macOS resizing. It starts with one column, switches to two at 840 points, and returns to one for accessibility Dynamic Type categories. There are no device-name checks or fixed content heights. Text wraps and the whole page scrolls; controls use minimum 48-point height. A card's container is not made into an extra accessibility element, preserving its children.

Apple's semantic fonts follow user text preferences. Custom button scaling is disabled when `accessibilityReduceMotion` is true; native navigation and sheet motion remain managed by SwiftUI. No ambient or repeating animation runs. Do not clamp Dynamic Type or replace system back gestures. Keep custom icons labeled, localize strings, and use leading/trailing alignment for RTL.

Before releasing a consuming app, build for both iOS and macOS, test a narrow iPhone and iPad split view, largest accessibility text, VoiceOver order, keyboard focus, sheet dismissal, reduced motion, and landscape with the software keyboard open. Run `swift build --package-path platforms/apple` on a Mac for package compilation, then use an iOS simulator/device for iOS verification. **The package has not been compiled or run on an Apple SDK in this repository's Linux authoring environment.**

## Official references

- [SwiftUI NavigationStack](https://developer.apple.com/documentation/swiftui/navigationstack)
- [SwiftUI Reduce Motion environment](https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion)
- [Apple accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [ViewThatFits for additional content-led adaptations](https://developer.apple.com/documentation/swiftui/viewthatfits)

Edit the shared source in `tokens/quiet-material.tokens.json` and run `npm run build` at the repository root to regenerate native tokens. Do not edit generated values directly.
