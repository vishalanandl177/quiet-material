# MD3 motion coverage and verification

Reviewed against official sources on **19 September 2026**. This audit defines what “follows MD3 motion” means for Quiet Material: complete foundation vocabulary, the four transition families, appropriate use, interruption handling and accessibility. It does not certify every application screen or every native operating-system animation.

## Source baseline

| Area | Primary source | What is checked |
| --- | --- | --- |
| Duration slots | [Flutter Material Durations](https://api.flutter.dev/flutter/material/Durations-class.html) | All 16 slot names and millisecond values |
| Easing slots | [Flutter Material Easing](https://api.flutter.dev/flutter/material/Easing-class.html) and [Material Components motion](https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md#curves-easing--duration) | Standard, emphasized, arrival, departure, linear; exact two-segment emphasized geometry |
| Spring roles | [Material spring model](https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md#springs) and [Compose MotionScheme](https://developer.android.com/reference/kotlin/androidx/compose/material3/MotionScheme) | Standard/expressive choice; fast/default/slow; spatial/effects separation |
| Transition families | [Official Flutter animations package](https://pub.dev/packages/animations) | Container transform; shared axis X/Y/Z; fade through; fade |
| Current themed timings | [Container transform](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/MaterialContainerTransform.java), [shared axis](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/MaterialSharedAxis.java), [fade through](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/MaterialFadeThrough.java), [fade](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/MaterialFade.java) | Current token bindings, rather than older fallback values in example tables |
| Hidden animation semantics | [Compose animation guide](https://developer.android.com/develop/ui/compose/animation/quick-guide#animate-appearing-disappearing) | Visual opacity does not by itself remove accessibility content |

The public Material 3 [motion overview](https://m3.material.io/styles/motion/overview/how-it-works) and [transition patterns](https://m3.material.io/styles/motion/transitions/transition-patterns) were reachable but exposed a JavaScript-required placeholder to the research reader. Substantive review therefore used the official implementation documentation and source above. Sources can evolve; rerun this review when upgrading Material libraries or changing the motion profile.

## Required release contract

1. Keep the full MD3 duration/easing vocabulary and spring roles in the canonical source; generated platforms must agree.
2. Use the exact emphasized path or label an approximation explicitly. Never rename a standard cubic as exact emphasized motion.
3. Choose a pattern from the actual relationship between states. Include forward and return behavior and logical direction.
4. Separate state feedback, appearance, disappearance, scene changes and spring effects. One generic “ease” token is insufficient.
5. Honor OS and local reduction, including an animation already in progress. Keep state changes and accessibility outcomes immediate.
6. Clean up outgoing visuals, timers and animation handles after completion, interruption and disposal. Preserve focus and native dismissal.
7. Keep GIFs optional, finite and captioned. Distinguish illustrations, tests and device recordings.
8. Record pending SDK and visual verification accurately. Exporting values is not evidence of end-to-end native conformance.

## Coverage matrix

Automated checks cover source bindings and animation contracts. The remaining device and rendering checks below are separate gates.

| Requirement | Repository binding | Evidence/status |
| --- | --- | --- |
| All 16 MD3 durations | Canonical tokens and generated platform exports | Passed token-value, alias and deterministic generation tests |
| Seven current easings | Canonical easing tokens; exact emphasized segments; sampled CSS | Passed control-point tests; emphasized CSS sampling error below 0.0001; fallback explicitly labeled |
| Standard and expressive spring roles | Canonical spring definitions and platform motion helpers | Passed both six-role source-value and finite-sample checks; native motion/device review remains separate from the passing SDK builds |
| State feedback and local movement | Component CSS and native adapter recipes | Web ripple hold/release/touch timings verified; switch/sheet use separate standard spatial/effects springs |
| Container transform | Web motion helper and live study | Web forward/return bounds, corner and content-handoff contracts pass; ordinary DOM, width-fit and straight path only |
| Shared axis X/Y/Z | Web motion helper and live studies | X/Y/Z, forward/return and RTL keyframe tests pass |
| Fade through | Web motion helper, independent page changes | Sequential opacity, .92 incoming scale and destination integration implemented and tested |
| Fade appearance/disappearance | Dialog, sheet, menu and feedback bindings | Dialog/snackbar entry and decorative exits implemented; native menu exit snapshot and exact CSS entry opacity mapping supplied; rendered focus review pending |
| Reduced motion | OS query, local preference, runtime cancellation and native guards | Tests pass for initial OS/local reduction and mid-flight runtime cancellation |
| Animation GIFs | Motion gallery and reproducible generation script | Seven studies regenerated; manifest/recipe bindings, finite encoding and opt-in Play/Stop tests pass |
| Native pattern coverage | Android/Flutter helpers and SwiftUI motion foundations | No complete native MD3 container-transform route; SwiftUI system navigation remains Apple motion. See each platform README. |
| Native compilation and behavior | Android, Apple and Flutter component adapters | Android/macOS/iOS simulator builds and Flutter analysis/tests passed in v1.3 CI; device/assistive-technology checks remain |
| Real rendered motion quality | Representative phone, tablet and desktop environments | Pending visual/device checks; automated source tests cannot establish frame pacing |

## Component mapping review

Review the motion owned by each component, including its unchanged or immediate states. Every component does not need a transition.

| Component group | Expected motion responsibility |
| --- | --- |
| Buttons, icon buttons, chips | Press/state layer; optional ripple; immediate activation semantics |
| Text fields, select, textarea | Focus/error state feedback; platform popup behavior |
| Switches, checkboxes, radio, slider | Immediate value update; thumb/indicator movement where implemented; no delayed announcement |
| Tabs and destination navigation | Indicator feedback; shared axis only for related ordered content, fade through for independent destinations |
| Cards and lists | Remain still; container transform when opening a related detail |
| Dialogs, sheets, menus, tooltip | Local appearance and departure; native focus/dismissal contract |
| Accordion | Immediate semantic expansion; optional stable local reveal |
| Alert, snackbar, progress | State-tied feedback; announce meaning; no decorative looping |
| Avatar, badge, table, breadcrumb, pagination, empty state, skeleton | Static by default; surrounding state transition only when it clarifies an actual change |

## Manual acceptance scenarios

- Phone, tablet and desktop: activate, reverse and repeat each transition; check safe areas, overflow, focus visibility and preserved scroll context.
- RTL: run X-axis forward/back and check the intended reading/navigation direction.
- Reduced motion enabled before load: no optional travel, ripple or GIF animation. Enable it during motion: settle and clean up promptly.
- Keyboard and screen reader: activate controls, dismiss a modal through all supported paths, and confirm only the current scene is exposed.
- Interruption: navigate elsewhere while a transition runs, close a surface immediately after opening, remove the animated element and resize the viewport.
- Native SDKs: build actual hosts, verify custom helpers separately from system-owned navigation, and record OS/library versions with results.

CSS-only popovers/dialogs require `linear()` support for the sampled opacity curve; older browsers use the documented approximation. JavaScript-enhanced dialogs use sampled WAAPI keyframes. A native popover closes without waiting for its decorative exit copy. Web snapshots do not capture live canvas, video, iframes or shadow DOM. The web spring helper samples a zero-initial-velocity physical model; it is not a velocity-carrying native spring integrator.

The release record belongs in [validation.md](validation.md). Do not replace pending evidence with “all MD3 motions tested on every platform.”
