# Quiet Material for Android

Source adapter for native Jetpack Compose Material 3. It includes a theme, black scaffold, common controls and a responsive example for phone, tablet, foldable windows and Android apps on ChromeOS. It is not a Compose Multiplatform desktop/iOS package or a published Maven artifact.

## Add to an app

Use a working Android Studio **Empty Activity** Compose project with Kotlin 2.0+ and the Compose compiler Gradle plugin matching your Kotlin version. This integration baseline uses `minSdk = 23`; the host owns its `compileSdk`, `targetSdk`, AGP, JDK and activity dependencies, which must meet its selected AndroidX versions. Use the project's supported Android Studio/AGP toolchain rather than adding a separate Gradle build for these source files.

Add these dependencies in your existing app's `build.gradle.kts` (keep a single Compose BOM):

```kotlin
android {
    defaultConfig { minSdk = 23 }
    buildFeatures { compose = true }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2026.09.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.animation:animation")
    implementation("androidx.compose.runtime:runtime-saveable")
    implementation("androidx.compose.material3:material3")
}
```

The BOM version above is the stable version documented by Android Developers when this adapter was authored; the Compose compiler is configured separately through the host's Kotlin plugin. This source uses Material 3 surface-container color roles, so do not substitute an old Material 2 dependency. See the official [BOM guide](https://developer.android.com/develop/ui/compose/bom) and [Compose compiler compatibility guidance](https://developer.android.com/jetpack/androidx/releases/compose-kotlin).

Copy all `.kt` files from `src/main/kotlin/com/quietmaterial/` into your app's `src/main/java/com/quietmaterial/` (or `src/main/kotlin/com/quietmaterial/`). Keep the `com.quietmaterial` package. In the generated activity:

```kotlin
import com.quietmaterial.QuietExample

// Inside onCreate(), after super.onCreate(savedInstanceState):
setContent { QuietExample() }
```

Keep `androidx.activity.compose.setContent` and your template's activity dependencies. For your own screen:

```kotlin
QuietTheme {
    QuietScaffold { innerPadding ->
        Column(Modifier.padding(innerPadding).consumeWindowInsets(innerPadding)) {
            QuietCard(Modifier.padding(QuietTokens.space5.dp)) {
                Text("Welcome", style = MaterialTheme.typography.titleLarge)
                QuietButton("Continue", onClick = { /* app action */ })
            }
        }
    }
}
```

Import the usual Compose layout, `Modifier`, Material3 and `dp` symbols for this example. `QuietExample.kt` provides complete imports and keyboard-safe scrolling. For edge-to-edge activities, follow the host's system-bar setup, use light system-bar icons over black, and apply Scaffold padding exactly once. `QuietScaffold` already supplies safe drawing insets; avoid adding a second `safeDrawingPadding` around it. [Android window inset guidance](https://developer.android.com/develop/ui/compose/system/insets-ui) explains IME and inset consumption.

## Coverage and native equivalents

| System part | Implementation |
| --- | --- |
| Shared colors, spacing, radii, motion, breakpoints | Generated `QuietTokens.kt`; dimensions are logical `Float` values, append `.dp` |
| MD3 easing and springs | `QuietEasing` evaluates all seven curves; `QuietMotion.timed` and `springSpec` use generated tokens |
| Content transitions | `QuietContentChange` supplies fade through and shared axis X/Y/Z, including reverse direction and RTL |
| Color / typography / shapes | `QuietTheme` wraps native `MaterialTheme`; static dark colors, semantic scalable typography |
| Root surface | `QuietScaffold`; canvas stays `#000000` |
| Action / surface / switch / field | `QuietButton`, `QuietCard`, `QuietSwitch`, `QuietTextField` |
| Dialog | Native `AlertDialog` in the example |
| Tabs, navigation, sheets, chips, menus, sliders, progress | Use native Material 3 `TabRow`, navigation components, `ModalBottomSheet`, chips, `DropdownMenu`, `Slider`, progress indicators under the theme; no custom wrappers shipped |

Other Material 3 components inherit the color scheme. Pass `containerColor = QuietTokens.colorBackground` to app navigation surfaces that must stay black. The adapter does not turn every native surface black: the canvas is black and content cards remain charcoal. Brand colors remain stable because dynamic wallpaper colors are not selected.

## MD3 motion

Use the **standard** MD3 spring scheme for everyday interactions. Spatial springs animate bounds, shape and position; critically damped effects springs animate color and opacity. `QuietMotion.springSpec(effects = true)` selects effects tokens. `QuietMotion.timed` accepts each of the seven MD3 easings and all 16 duration tokens. `QuietEasing.Emphasized` evaluates the actual two-segment path; it is not substituted with `Standard`.

```kotlin
// Inside a composable. selection and history belong to the host app.
QuietContentChange(
    targetState = selection,
    pattern = QuietTransitionPattern.SharedAxisX,
    backwards = movingBack,
) { destination ->
    DestinationScreen(destination)
}

// A product-owned spatial animation:
val offset by animateFloatAsState(
    targetValue = targetOffset,
    animationSpec = QuietMotion.springSpec(),
    label = "Panel offset",
)
```

Import `androidx.compose.animation.core.animateFloatAsState` and your own `DestinationScreen`. Use fade through for unrelated destinations, shared X/Y for sequential peers and shared Z for hierarchical movement. The content helper uses 450 ms with emphasized easing and a 35% fade-through split in eased progress. There is no automatic animation when no content changes.

| Transition | MD3 integration |
| --- | --- |
| Container transform | App-owned shared surface, or Material Components Views `MaterialContainerTransform`; 500 ms forward / 400 ms return with emphasized easing. No generic Compose container-transform wrapper is supplied. |
| Shared axis X/Y/Z | `QuietContentChange` at 450 ms, emphasized; translation 30 dp or scales 0.8/1.1; mirrors horizontal motion in RTL |
| Fade through | `QuietContentChange` at 450 ms, emphasized; outgoing fade then incoming fade with 0.92→1 scale |
| Fade | Material component APIs, or a product-owned `AnimatedVisibility` using `motionFadeEnterDuration` (400 ms), `EmphasizedDecelerate`, then `motionFadeExitDuration` (150 ms), `EmphasizedAccelerate`; no exit scale |

The stable Material 3 1.4 library uses its built-in motion scheme. Its public expressive APIs were removed from the stable branch. When the host deliberately adopts a Material 3 release exposing public `MotionScheme`, configure `MaterialTheme(motionScheme = MotionScheme.standard(), …)` and use `MaterialTheme.motionScheme` specs for custom components. This adapter does not require an alpha dependency solely to set a theme parameter. See the [1.4 release notes](https://developer.android.com/jetpack/androidx/releases/compose-material3#1.4.0), current [MotionScheme API](https://developer.android.com/reference/kotlin/androidx/compose/material3/MotionScheme) and [official Material motion guide](https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md).

Token availability does not replace app integration: verify shared-element identity, mask/shape interpolation, route back handling, outgoing-content input suppression and focus restoration in the consuming app. Native components retain their own MD3 component-specific recipes rather than forcing every animation to 450 ms. The shared recipe source and coverage are documented in [motion guidance](../../docs/motion.md).

## Responsive and accessible behavior

The sample uses available window constraints, never the physical device category. Content stacks first; above 840 dp it uses two columns. At font scale 1.5 or larger it returns to one column. Text is not capped to one line; the screen scrolls, and IME padding keeps editing content reachable. App state uses `rememberSaveable` through resizing and recreation. Hinge-aware two-pane navigation for a spanning foldable should use Android's adaptive layout components in the host application.

Buttons and toggle rows reserve at least 48 dp. `QuietSwitch` exposes one switch node for the entire labeled row. Native Material controls preserve their built-in role, input, focus and press behavior, as described in [Compose accessibility defaults](https://developer.android.com/develop/ui/compose/accessibility/api-defaults). There are no custom timers or repeating animations. Compose controls use platform animation infrastructure; custom animations added by the app must respect [MotionDurationScale](https://developer.android.com/reference/kotlin/androidx/compose/ui/MotionDurationScale). Do not replace native ripples with looping GIFs.

Localize the example's English strings before product use. Verify TalkBack, switch state announcements, keyboard/D-pad focus, 200% text, RTL, 320 dp windows, tablet split-screen, rotation, soft keyboard, system animation disabled and dialog dismissal in your consuming app. Build it with that app's `./gradlew :app:assembleDebug` and run on devices/emulators. **No Kotlin compiler, Android SDK or Gradle was available in this repository's Linux authoring environment; this native adapter has not been compiled or device-tested here.**

See [Material 3 theming](https://developer.android.com/develop/ui/compose/designsystems/material3), [Compose setup](https://developer.android.com/develop/ui/compose/setup), and [adaptive display size guidance](https://developer.android.com/develop/ui/compose/layouts/adaptive/support-different-display-sizes). Edit shared tokens in `tokens/quiet-material.tokens.json` and run `npm run build` at the repository root; copy regenerated `QuietTokens.kt` alongside the adapters.
