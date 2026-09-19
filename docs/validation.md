# Validation record — v1.1

## Completed automated checks

On 2026-09-19, `npm run check` passed all **31 tests**:

- Canonical token validation, alias/cycle checks, deterministic generation and parity across CSS, resolved JSON, TypeScript, Kotlin, Swift and Dart.
- Tested contrast pairings for text, statuses, action text, focus and control boundaries; pure opaque black canvas.
- DOM interaction checks for tabs including RTL/vertical cases, disabled items, repeated setup/cleanup, chips, tooltips, snackbars and reduced-motion ripple suppression.
- Opt-in GIF playback, replay, stop, one-study-at-a-time behavior, reduced-motion prevention, and timer cleanup. Asset dimensions, sizes, single-cycle encoding and manifest paths/durations are checked.
- Explorer IDs, labels, ARIA references, local resources and enhancement targets.

JavaScript syntax, self-contained preview generation and `git diff --check` passed. The preview embeds the new concepts, posters and opt-in GIF sources. HTTP smoke checks passed for the explorer, module, GIF, concept PNG, resolved tokens and native guide; Git metadata paths returned 404.

The motion generator was run, its three static posters visually inspected, and byte-identical regeneration verified. Both additional generated device concepts were visually reviewed. These are illustrative references and motion studies, not screenshots or recordings of a tested application.

The [GitHub Actions workflow](https://github.com/vishalanandl177/quiet-material/actions) runs the repository checks on push and pull request and verifies that every generated token output stays in sync. Consult the run for the relevant commit for remote results.

## Native validation status

| Adapter | Completed here | Still required |
| --- | --- | --- |
| Android Compose | Source/API review and generated token-reference checks | Android SDK compilation, application integration, device/emulator and TalkBack review |
| Apple SwiftUI | Source/API review and generated token-reference checks | Xcode/Swift package compilation, iPhone/iPad/Mac integration and VoiceOver review |
| Flutter | Source/API review, complete semantic color mapping and token-reference checks; widget tests supplied | `flutter analyze`, `flutter test`, host builds and device/desktop assistive-technology review |

The corresponding native SDKs were unavailable in this environment. Source adapters have not been represented as compiled or production-verified packages.

## Remaining browser and device checks

Visual browser review was not completed because the creation environment's cloud browser blocks local-file preview URLs. DOM tests do not verify responsive rendering, native modal focus containment, popovers, screen readers, software keyboards, safe-area appearance or actual reduced-motion rendering.

Before product adoption, run the viewport and input scenarios in [mobile-first](mobile-first.md) and the manual [accessibility checklist](accessibility.md): 320/390/600/768/840/1024/1280/1440 widths, short windows, rotation, 200% text, high zoom, RTL, open keyboard, cutouts, reduced motion, focus visibility and assistive-technology behavior. This record is not an accessibility certification or an all-platform testing claim.
