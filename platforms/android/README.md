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
    implementation("androidx.compose.runtime:runtime-saveable")
    implementation("androidx.compose.material3:material3")
}
```

The BOM version above is the stable version documented by Android Developers when this adapter was authored; the Compose compiler is configured separately through the host's Kotlin plugin. This source uses Material 3 surface-container color roles, so do not substitute an old Material 2 dependency. See the official [BOM guide](https://developer.android.com/develop/ui/compose/bom) and [Compose compiler compatibility guidance](https://developer.android.com/jetpack/androidx/releases/compose-kotlin).

Copy all three `.kt` files from `src/main/kotlin/com/quietmaterial/` into your app's `src/main/java/com/quietmaterial/` (or `src/main/kotlin/com/quietmaterial/`). Keep the `com.quietmaterial` package. In the generated activity:

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
| Color / typography / shapes | `QuietTheme` wraps native `MaterialTheme`; static dark colors, semantic scalable typography |
| Root surface | `QuietScaffold`; canvas stays `#000000` |
| Action / surface / switch / field | `QuietButton`, `QuietCard`, `QuietSwitch`, `QuietTextField` |
| Dialog | Native `AlertDialog` in the example |
| Tabs, navigation, sheets, chips, menus, sliders, progress | Use native Material 3 `TabRow`, navigation components, `ModalBottomSheet`, chips, `DropdownMenu`, `Slider`, progress indicators under the theme; no custom wrappers shipped |

Other Material 3 components inherit the color scheme. Pass `containerColor = QuietTokens.colorBackground` to app navigation surfaces that must stay black. The adapter does not turn every native surface black: the canvas is black and content cards remain charcoal. Brand colors remain stable because dynamic wallpaper colors are not selected.

## Responsive and accessible behavior

The sample uses available window constraints, never the physical device category. Content stacks first; above 840 dp it uses two columns. At font scale 1.5 or larger it returns to one column. Text is not capped to one line; the screen scrolls, and IME padding keeps editing content reachable. App state uses `rememberSaveable` through resizing and recreation. Hinge-aware two-pane navigation for a spanning foldable should use Android's adaptive layout components in the host application.

Buttons and toggle rows reserve at least 48 dp. `QuietSwitch` exposes one switch node for the entire labeled row. Native Material controls preserve their built-in role, input, focus and press behavior, as described in [Compose accessibility defaults](https://developer.android.com/develop/ui/compose/accessibility/api-defaults). There are no custom timers or repeating animations. Compose controls use platform animation infrastructure; custom animations added by the app must respect [MotionDurationScale](https://developer.android.com/reference/kotlin/androidx/compose/ui/MotionDurationScale). Do not replace native ripples with looping GIFs.

Localize the example's English strings before product use. Verify TalkBack, switch state announcements, keyboard/D-pad focus, 200% text, RTL, 320 dp windows, tablet split-screen, rotation, soft keyboard, system animation disabled and dialog dismissal in your consuming app. Build it with that app's `./gradlew :app:assembleDebug` and run on devices/emulators. **No Kotlin compiler, Android SDK or Gradle was available in this repository's Linux authoring environment; this native adapter has not been compiled or device-tested here.**

See [Material 3 theming](https://developer.android.com/develop/ui/compose/designsystems/material3), [Compose setup](https://developer.android.com/develop/ui/compose/setup), and [adaptive display size guidance](https://developer.android.com/develop/ui/compose/layouts/adaptive/support-different-display-sizes). Edit shared tokens in `tokens/quiet-material.tokens.json` and run `npm run build` at the repository root; copy regenerated `QuietTokens.kt` alongside the adapters.
