# Validation record - v1.3

## Completed automated checks

On 2026-09-19, `npm run check` passed all **105 tests**:

- Canonical token validation, alias/cycle checks, deterministic generation and parity across CSS, JSON, JavaScript, TypeScript, Kotlin, Swift and Dart.
- All 16 MD3 durations, seven easing families, exact emphasized segments, standard/expressive physical spring values, component ripple timings and current themed transition bindings. Emphasized CSS sampling stays within 0.0001 of the exact source path.
- Four web motion families, X/Y/Z and RTL/reverse cases, immediate semantic updates, inert snapshots, interruption, style cleanup, native-dialog snapshot ownership, and queued route-scroll handling.
- Tested contrast pairings for text, statuses, action text, focus and control boundaries; pure opaque black canvas.
- DOM interaction checks for tabs including RTL/vertical cases, disabled items, repeated setup/cleanup, chips, tooltips, snackbars and reduced-motion ripple suppression.
- Opt-in GIF playback, replay, stop, one-study-at-a-time behavior, reduced-motion prevention, and timer cleanup. Asset dimensions, sizes, single-cycle encoding and manifest paths/durations are checked.
- Explorer IDs, labels, ARIA references, local resources and enhancement targets.
- All 36 official catalog families resolve to working showcase examples and component guides. The actual explorer module initializes without duplicate generated IDs; category/search filtering, real snackbar Undo, progress updates and mixed-checkbox state are exercised together.
- Segmented controls, form reset/submission, removable chips, range bounds/steps, adaptive navigation, toolbar focus, sheets and carousel interruption.
- Keyboard menus/submenus and disabled states; combobox input and search submission; date leap years/ranges/min-max/year limits; time midnight/noon/12-24-hour conversion and pointer/keyboard input; draft/cancel/commit isolation.
- Circular/linear progress recipes and semantics, reduced-motion loading, and rich-tooltip dismissal/focus.

JavaScript syntax, self-contained preview generation and `git diff --check` passed. The preview embeds the concepts, all seven posters/GIFs, every component module and stylesheet, the motion runtime and generated contract; the combined module parses with no external imports. HTTP smoke checks passed for the explorer, module, GIF, concept PNG, resolved tokens and native guide; Git metadata paths returned 404.

The motion generator was run, its seven static posters visually inspected, and byte-identical regeneration verified. Both additional generated device concepts were visually reviewed. These are illustrative references and motion studies, not screenshots or recordings of a tested application.

The [GitHub Actions workflow](https://github.com/vishalanandl177/quiet-material/actions) runs the repository checks on push and pull request and verifies that every generated token output stays in sync. Consult the run for the relevant commit for remote results.

## Native validation status

| Adapter | Completed here | Still required |
| --- | --- | --- |
| Android Compose | Android library `assembleDebug` passed with JDK 17, Gradle 8.11.1, AGP 8.10.1, Kotlin 2.3.21 and SDK 36; source/token review | Application integration, device/emulator and TalkBack review |
| Apple SwiftUI | macOS `swift build` and generic iOS simulator `xcodebuild` passed; source/token review | iPhone/iPad/Mac application integration, rendered flows and VoiceOver review |
| Flutter | Flutter 3.35.0 dependency resolution, `flutter analyze` and all 9 unit/widget tests passed | Platform host builds and device/desktop assistive-technology review |

Native starters do not include a complete MD3 container-transform route; SwiftUI navigation remains system-owned Apple motion. The shared foundation and web default patterns are implemented, while full native conformance is not claimed. See the [MD3 audit](md3-motion-audit.md).

The corresponding native SDKs were unavailable in the local creation environment, so validation ran on GitHub-hosted build machines. [Native validation run](https://github.com/vishalanandl177/quiet-material/actions/runs/35428708554) passed the Android build, macOS package build, iOS simulator library build, Flutter analysis and Flutter tests for source commit `64c1d92856dcf3f40ca15008a03f9a4fe9a47957`. The [web workflow](https://github.com/vishalanandl177/quiet-material/actions/runs/35428708534) also passed its 105 tests and generated-output check. The initial CI attempt caught an obsolete Kotlin Gradle DSL and an unused Flutter import; both were corrected before this passing run. A compiler pass does not replace device, visual or assistive-technology review.

## Remaining browser and device checks

Visual browser review was not completed because the creation environment's cloud browser blocks local-file preview URLs. DOM tests do not verify responsive rendering, native modal focus containment, popovers, screen readers, software keyboards, safe-area appearance or actual reduced-motion rendering.

Before product adoption, run the viewport and input scenarios in [mobile-first](mobile-first.md) and the manual [accessibility checklist](accessibility.md): 320/390/600/768/840/1024/1280/1440 widths, short windows, rotation, 200% text, high zoom, RTL, open keyboard, cutouts, reduced motion, focus visibility and assistive-technology behavior. This record is not an accessibility certification or an all-platform testing claim.
