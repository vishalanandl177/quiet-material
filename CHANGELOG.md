# Changelog

## 1.4.0 - 2026-09-19

- Migrate the existing design system to the approved black direction. The canvas stays #000000, surfaces step #080808, #101010 and #181818, the tonal container is graphite #242424, and type reads #f4f4f4 with #b7b7b7 supporting and #777777 disabled text. Tokens go from 169 to 198: 21 retuned, 29 added, none removed. Full old-vs-new values are in [the 1.4 migration guide](docs/migration-1.4.md).
- Make selection neutral. A single-choice indicator, meaning a selected chip, segment, tab pill, calendar day, switch track, checkbox or radio, is a white fill with black content. A current-location highlight, meaning the active destination, current page or current row, is the graphite container with white content. Checkmarks, thumb travel, borders and ARIA state are unchanged, so selection is never signalled by hue alone.
- Repoint seven semantic roles to neutral values while keeping their names: `colorPrimary` #f4f4f4, `colorOnPrimary` #000000, `colorPrimaryContainer` #242424, `colorOnPrimaryContainer` #f4f4f4, `colorSecondary` #b7b7b7, `colorOnSecondary` #000000 and `colorFocus` #f4f4f4. A product that wants the previous blue or mint accent must now reference `colorPaletteBlue` or `colorPaletteMint` explicitly.
- Add restrained depth and stacking families: `elevation.level1/2/3` shadow composites of offset, blur and color; six `layer` tiers (base 0, raised 1, sticky 10, floating 20, overlay 30, popover 40); and four `state` layer opacities (hover 0.08, focus 0.12, pressed 0.12, dragged 0.16). Depth comes from the surface step, spacing and a selective 1px edge; shadows are reserved for genuinely floating surfaces. No gradients, glows, blur, glass or moving backgrounds.
- Add `colorScrim` and `colorPaletteScrim` #000000cc, `colorOutlineVariant` #242424 for decorative grouping separation only, `colorFocusContrast` #000000 for the inner separation ring that keeps a focus ring readable on a white-filled control, `colorPaletteGraphite` #242424, `colorPaletteShadowSoft` #00000099, `colorPaletteShadowStrong` #000000cc, and `borderFocusOffset` 2px. `colorOutline` #828282 remains the single functional boundary for anything whose edge identifies it as a control.
- Extend the shape scale with `radiusTile` 12px for icon tiles and compact controls and `radiusFeature` 32px for large feature surfaces. `radiusCard` moves from 40px to 24px and `radiusCardCompact` from 32px to 24px, which changes the default card silhouette; `radiusSmall` 8, `radiusControl` 16, `radiusDialog` 32 and `radiusPill` 999 are unchanged.
- Keep the accent palette exported and unchanged: `colorPaletteBlue` #a8c7fa, `colorPaletteBlueDark`, `colorPaletteBlueContainer` #24354e, `colorPaletteMint` #86d9ae, `colorPaletteMintContainer` #153d2b, and the yellow and red entries. `colorSuccess` #86d9ae, `colorWarning` #f3d17d, `colorDanger` #ffb4ab and their containers keep their hues. No palette entry was repointed to a different hue. Mint and blue are simply no longer applied to ordinary selection, links, buttons or icons; mint remains available for genuine positive or active status and as a documented optional accent.
- Keep the component inventory whole. All 36 families in the current MD3 catalog, their variants, interaction contracts and narrow-screen behavior are preserved, and no `.qm-*` selector, `data-qm-*` hook or JavaScript export was lost. The package name, exports map, component APIs and framework-independent architecture are unchanged.
- Keep the motion system byte-identical: 16 MD3 duration slots, seven easing families, the exact emphasized path data and both six-role spring schemes. This migration changed no motion value, binding or API.
- Keep the spacing scale, type scale, line heights, font stacks, weights, sizes, breakpoints and layout page insets untouched, along with `colorBackground` #000000, `colorText` #f4f4f4, `colorAction` and `colorOnAction`.
- Take every color, corner radius and stacking tier in the five component stylesheets and both example stylesheets from tokens. Only `@media (forced-colors: active)` blocks, geometric `50%` circles and explicit `0` corner resets remain literal, and anchored popups now use `--qm-layer-popover` instead of a local `z-index` number.
- Record the approved visual reference under `assets/reference/` with its provenance and its illustration-only boundaries. `assets/approved-concept.png` is retained as the historical reference for the 1.0-1.3 charcoal appearance.
- Verified in this environment: `npm run check` passes 117 of 117 tests on Node 22.22.2, including 12 new migration gates in `tests/theme.test.mjs` that fail on a stray color literal, a literal radius, a bare `z-index` or a hue in a neutral role. Measured contrast against `colorSurface` is 17.30:1 for text, 9.49:1 for muted text, 4.95:1 for outline and 4.25:1 for disabled text, up from 3.49:1 before the neutral retune; `colorOnPrimary` on `colorPrimary` is 19.09:1 and `colorOnPrimaryContainer` on the graphite container is 14.11:1. Every pre-existing contrast gate still passes. 25 rendered screenshots at 320, 390, 768, 1024 and 1440 were captured in headless Chromium with reduced motion.
- Verified in CI: the Android library build, the Apple package and iOS simulator builds, and Flutter `analyze` with the widget tests all pass on hosted machines for this change. No Android, Apple or Flutter SDK is installed in the authoring environment, so those builds were not run locally; the hosted run is the evidence.
- Not run anywhere: device and emulator sessions on real hardware, TalkBack and VoiceOver passes, browsers other than Chromium, and forced-colors or 400% browser-zoom sessions. A compiling build is not a tested device experience, the jsdom tests do not prove rendered layout, and the screenshots are Chromium only.
- The package remains private and UNLICENSED. Nothing was published, no release tag was created and no workflow was enabled. `package.json` is unchanged, so its `version` field still reads 1.3.0 until the owner decides to cut this release.

## 1.3.0 - 2026-09-19

- Expand the reusable web catalog to all 36 families in the current MD3 catalog and publish an explicit family/variant/platform matrix.
- Add FABs, extended FABs and FAB menus; button groups, segmented and split buttons; filled/elevated/outlined/text buttons; toggle icon buttons; filled/outlined/elevated cards; all four chip types; floating-label fields; and two-thumb range sliders.
- Add reusable app bars, adaptive navigation bars/rails/drawers, primary/secondary tabs, toolbars, standard/modal bottom and side sheets, full-screen dialogs, lists, dividers and carousels.
- Add date/time pickers, keyboard menus, search, linear/circular progress, loading indicators, navigation badges and rich tooltips. Preserve native input semantics, narrow-screen layouts, cleanup and reduced-motion behavior.
- Add real asynchronous snackbar action callbacks with separate dismissal, single-message replacement and action-error events. Existing `actionLabel`-only dismissal remains compatible.
- Expand native source catalogs and document platform compositions separately from native compilation and device validation.
- Keep `styles/quiet-material.css` as the public entry point, now importing the complete base/component stylesheet set. Integrations must retain the entire `styles/` directory.

## 1.2.0 - 2026-09-19

- Replace the partial custom motion vocabulary with all 16 MD3 durations, seven easing families, exact emphasized path data, and both six-role spring schemes. Add pinned official source provenance and deterministic browser motion exports.
- Add container transform, shared axis X/Y/Z, fade through, fade, and spring APIs. Apply transitions to destinations, tabs, dialogs and snackbars; retain synchronous state and focus changes.
- Correct ripple growth/hold/release/touch timings; remove arbitrary button shrinking. Use separate standard spatial/effects springs for switch and sheet motion.
- Add live pattern/spring controls, expand to seven token-driven GIFs, and record encoding approximations.
- Add native curve/spring/transition helpers and document remaining native container, system-navigation and device-validation boundaries.
- Keep existing token aliases; motion behavior intentionally changes to the verified MD3 bindings.


## 1.1.0 - 2026-09-19

- Mobile-first explorer and reusable component defaults, four compact navigation actions, safe-area padding, relative typography, and RTL switch direction.
- 94 shared tokens with deterministic CSS, JSON, TypeScript, Kotlin, Swift and Dart outputs; cross-platform parity tests.
- Android Compose, Apple SwiftUI and Flutter starter adapters, adaptive examples and platform component mappings. Native compilation/device verification pending.
- Two additional device concepts and three compact, reproducible single-cycle motion GIFs. Opt-in playback honors local and OS reduced motion and stops when leaving the page.
- Platform/mobile-first guides and integration, scope and validation updates.


## 1.0.0 - Initial private foundation

- Establish the approved black-and-charcoal visual language, rounded containers, pill controls and restrained accent colors.
- Add source design tokens, generated CSS variables and framework-independent component styles.
- Add progressive JavaScript for interactive component patterns and a browsable component workbench.
- Document foundations, components, accessibility, motion, product patterns, design-tool handoff and governance.
- Add repository build and verification tooling.

This is the initial private, unpublished source release. Browser and accessibility support must be evaluated against the repository's recorded validation and the needs of each consuming product; this entry does not claim external certification.
