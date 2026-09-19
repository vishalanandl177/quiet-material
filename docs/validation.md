# Validation record - v1.4

This record covers the 1.4 migration of the default appearance to the approved black direction. It separates three evidence levels and does not blur them: checks completed in the authoring environment, checks completed on hosted CI machines, and checks that were not run anywhere. A passing suite and a compiling build are weaker claims than a tested product on real hardware.

## Completed automated checks

On 2026-09-19, `npm run check` (`node scripts/build-tokens.mjs` followed by `node --test tests/*.test.mjs`) passed all **117 tests** on Node 22.22.2. The suite held 105 tests before this release; the 12 new tests are the migration gates in `tests/theme.test.mjs` described below. Every pre-existing test still passes, and none was deleted or weakened.

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

### Migration gates added for 1.4

`tests/theme.test.mjs` holds 12 tests that fail if the black direction is later eroded. They assert that:

1. No component stylesheet contains a color literal outside its `@media (forced-colors: active)` block.
2. Neither example stylesheet, `demo.css` and `showcase.css`, contains a color literal.
3. Component stylesheets carry no literal `border-radius` length and no bare `z-index`; a geometric `50%`, an explicit `0` reset and a negated tier such as `calc(var(--qm-layer-raised) * -1)` are the only accepted exceptions.
4. Nineteen neutral roles are literally neutral (red, green and blue channels equal), with `colorPrimary` #f4f4f4, `colorOnPrimary` #000000 and `colorFocus` #f4f4f4 pinned by value.
5. `colorSuccess` #86d9ae, `colorWarning` #f3d17d and `colorDanger` #ffb4ab keep their hue, and the palette entries a consumer may still reference, `colorPaletteBlue` #a8c7fa, `colorPaletteMint` #86d9ae, `colorPaletteBlueContainer` #24354e and `colorPaletteMintContainer` #153d2b, remain defined at their original values.
6. The surfaces step 0, 8, 16 and 24 in the red channel from pure black and stay near-black rather than drifting to medium gray.
7. The shape scale is 8, 12, 16, 24, 32, 32, 999 and `radiusCardCompact` follows `radiusCard`.
8. The elevation, layer and state families exist and reach the Kotlin, Swift and Dart exports, together with `colorOutlineVariant`, `colorScrim`, `colorFocusContrast`, `radiusTile` and `radiusFeature`.
9. `colorOutlineVariant` documents itself as decorative, `colorOutline` holds at least 3:1 on all four surface steps, the focus ring holds at least 3:1 on the black canvas, and `colorFocusContrast` holds at least 3:1 inside a white-filled control.
10. `colorDisabled` holds at least 3:1 on all four surface steps and is never equal to `colorTextMuted`, so supporting text can never be styled as disabled content.
11. Padding, margin and gap values that land exactly on a 4 px step come from the spacing scale rather than a raw length.
12. State-layer opacities come from the state family rather than a repeated 0.08, 0.12 or 0.16.

### Generation, parity and preserved surface

`node scripts/build-tokens.mjs` writes nine generated files. Two consecutive runs are byte-identical and match what is committed, which is asserted for the generated CSS in `tests/tokens.test.mjs` and for the six token outputs compared in `tests/platform-tokens.test.mjs`: `styles/tokens.css`, `exports/quiet-material.tokens.resolved.json`, `exports/quiet-material.tokens.ts`, the Kotlin `QuietTokens.kt`, the Swift `QuietTokens.swift` and the Dart `quiet_tokens.dart`. That parity test traverses the DTCG source independently rather than repeating the generator's own conversion. The three remaining generated files, the JavaScript token and motion modules and the motion JSON, are checked for the same determinism and for agreement with the resolved JSON in `tests/md3-tokens.test.mjs`, so all nine outputs are committed in sync. The token count went from 169 to 198 with no public name removed.

No `.qm-*` class selector was lost. Comparing the pre-migration baseline commit `91d6782` with the migrated stylesheets, the set of distinct `.qm-*` class names in each of the five component stylesheets is identical: 45 in `base.css`, 39 in `components-actions.css`, 34 in `components-input.css`, 58 in `components-navigation.css` and 15 in `components-communication.css`. The comparison is a set difference in both directions, so a rename would show as a loss on one side and an addition on the other; neither occurred. `exports/quiet-material.components.json` and the motion exports are unchanged.

Motion was not touched. `exports/quiet-material.motion.js`, `exports/quiet-material.motion.json` and every generated poster and GIF under `assets/motion/` are byte-identical to 1.3, so the motion evidence recorded for that release still describes exactly what ships. The 1.3 packaged self-contained preview and its HTTP smoke checks were **not** re-run for 1.4; the workbench gained a Showcase page in this release, so that evidence is stale and is not claimed here.

Flutter widget tests gained coverage without losing any: 13 test cases now, up from 9, with `expect()` calls rising from 13 to 17 in `quiet_catalog_test.dart` and from 23 to 80 in `quiet_material_test.dart`. No existing assertion was deleted or weakened.

## Completed rendered checks

`docs/screenshots/` holds **25 real rendered screenshots**: five workbench pages (showcase, foundations, components, platforms, motion) at five widths (320, 390, 768, 1024 and 1440 CSS px). They were produced by `node scripts/capture-screenshots.mjs`, which starts the repository's own dev server and drives headless Chromium through Playwright, capturing each page full height with `colorScheme: 'dark'`, `reducedMotion: 'reduce'` and `deviceScaleFactor` 1; set `SCALE=2` for retina captures. Playwright is found on the machine and is deliberately not a package dependency, so `package.json` is unchanged. The committed files are 1x, which the 320 px captures confirm at 320 device px wide, and the generated `docs/screenshots/README.md` reports the scale actually used.

The captures were compared against the approved visual reference in `assets/reference/` for six properties of the visual language:

- a pure black canvas rather than a dark gray one,
- restrained dark surfaces that separate by step rather than by borders or glow,
- neutral selection, meaning a white fill with black content for a single choice and the graphite container with white content for a current location,
- proportionate corners across tiles, fields, cards, feature surfaces, dialogs and pill controls,
- a readable hierarchy of white headings over neutral-gray supporting text,
- uncluttered spacing at every width.

This is a visual-language comparison, not a pixel-perfect reproduction of a concept board. The reference is a concept board, not a screenshot of a running build: its device bezels, planetary wallpaper, mountain footer, demo wordmark, app names, third-party app icons and on-screen keyboard are illustration only, and none of them is a token, a component or a feature of this design system. Token values are deliberate design choices for this migration, not pixels sampled from the image. See `assets/reference/README.md` for provenance.

What the screenshots do not establish: they are Chromium only, at default zoom and default text size, on no real device. A 320 px capture shows that the layout reflows, and nothing about scaled text, a forced palette or an assistive technology.

### Rendered behaviour checks

Four behaviours were checked by reading computed values and layout metrics out of the same headless Chromium, rather than by looking at a still frame. Each is a browser measurement, not a device or assistive-technology session.

| Check | Method | Result |
| --- | --- | --- |
| Reduced motion collapses the vocabulary | `reducedMotion: 'reduce'`, read the computed custom properties on the root | `--qm-duration-short`, `-medium`, `-long`, `--qm-motion-enter-duration` and `--qm-spring-standard-fast-spatial-duration` all compute to `0ms` |
| The override is conditional, not a blanket zero | `reducedMotion: 'no-preference'`, same properties | `--qm-duration-short` `150ms`, `--qm-motion-enter-duration` `500ms` |
| Reflow at 320 CSS px | Compare `documentElement.scrollWidth` with `clientWidth` on the showcase, components and foundations pages | 320 against 320 on all three; no horizontal page overflow |
| Right-to-left layout | Set `dir="rtl"` at 390 px and re-measure | No horizontal overflow; the logical-property layout holds |

The reduced-motion result is a token measurement. It shows the durations an animation would read, not that every transition visibly stops over time, and it says nothing about a real operating-system reduced-motion setting.

## Native validation status

No Android, Apple or Flutter SDK is installed in the authoring environment, so none of the native commands below was run here. The native sources for this migration were written and reviewed by inspection here, and built on GitHub-hosted machines by [`.github/workflows/native.yml`](../.github/workflows/native.yml).

| Adapter | Exact command | In this environment | On hosted CI machines |
| --- | --- | --- | --- |
| Android Compose | `gradle assembleDebug --no-daemon --stacktrace` in `platforms/android` | Not run: no Android SDK or Gradle toolchain installed | Passed on ubuntu-latest with Temurin JDK 17, Gradle 8.11.1, Kotlin 2.3.21 and compileSdk 36 |
| Apple SwiftUI | `swift build --package-path platforms/apple`, then `xcodebuild -scheme QuietMaterial -destination 'generic/platform=iOS Simulator' -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO build` in `platforms/apple` | Not run: no Apple toolchain installed | Both passed on macos-latest |
| Flutter | `flutter pub get`, `flutter analyze`, then `flutter test` in `platforms/flutter` | Not run: no Flutter SDK installed | Analysis clean and all 13 widget tests passed with Flutter 3.35.0 |

The evidence is the [native run for commit `485572c`](https://github.com/vishalanandl177/quiet-material/actions/runs/35465603595), the commit that carries every native source change in this release; all three jobs completed successfully. Later commits on this branch touch documentation only. The [web workflow](https://github.com/vishalanandl177/quiet-material/actions/runs/35466117876) ran the same 117-test suite green on hosted Node 24 and verified that every committed token output is in sync. Consult the run for the relevant commit for remote results.

A compiling, test-passing build is not a tested device experience. Native starters do not include a complete MD3 container-transform route; SwiftUI navigation remains system-owned Apple motion. The shared foundation and web default patterns are implemented, while full native conformance is not claimed. See the [MD3 audit](md3-motion-audit.md).

## Not run anywhere

None of the following was performed, in this environment or in CI, and nothing in this repository substitutes for them:

- Device and emulator sessions on real hardware, and application integration for Android, iPhone, iPad, Mac and Flutter platform hosts.
- Screen-reader passes: TalkBack, VoiceOver or any desktop screen reader.
- Browsers other than Chromium: no Firefox, Safari or WebKit verification of any kind.
- Forced-colors sessions, 200% text zoom, 400% browser zoom, software keyboards, safe-area appearance, rotation and RTL rendering in a browser.
- Reduced motion as behavior over time. The captures were taken with reduced motion requested, which is a static frame, not a check that transitions actually stop.

The jsdom tests do not prove rendered layout, native modal focus containment, popovers or screen-reader behavior. Before product adoption, run the viewport and input scenarios in [mobile-first](mobile-first.md) and the manual [accessibility checklist](accessibility.md): 320/390/600/768/840/1024/1280/1440 widths, short windows, rotation, 200% text, high zoom, RTL, open keyboard, cutouts, reduced motion, focus visibility and assistive-technology behavior. This record is not an accessibility certification or an all-platform testing claim.

## Publishing status

The package remains private and UNLICENSED. Nothing was published, no release tag was created and no workflow was enabled. `package.json` is unchanged by this migration.
