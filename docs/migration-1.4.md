# Migrating to Quiet Material 1.4

## What changed and why

1.4 is a visual migration of the existing design system to the approved black direction. The
approved visual reference recorded in [`assets/reference/`](../assets/reference/README.md) replaced the
charcoal board that guided 1.0 through 1.3, so the token layer was retuned to match it: a pure black
canvas, matte near-black surfaces, one graphite tonal step, white and neutral-gray type, neutral
selection, and depth built from surface steps and edges rather than color. `assets/approved-concept.png`
is retained as the historical reference for the 1.0-1.3 charcoal appearance.

This is not a new product and not a new API. The package name, exports map, component APIs,
framework-independent architecture and the full 36-family component inventory are unchanged. Every
change lives in the values behind the tokens and in the stylesheets that consume them.

The numbers: 169 tokens become 198. 21 values were retuned, 29 tokens were added, and no public token
name was removed. Token values are deliberate design choices made for this migration; they are not
pixels sampled from the reference, and the reference's device bezels, wallpaper, footer, wordmark, app
names, third-party icons and on-screen keyboard are illustration only, not tokens, components or
features.

What did not move is as important as what did. All motion is byte-identical: the 16 MD3 duration slots,
seven easing families, the exact emphasized path data and both six-role spring schemes. The spacing
scale, type scale, line heights, font stacks, weights, sizes, breakpoints and layout page insets are
untouched. `colorSuccess` #86d9ae, `colorWarning` #f3d17d, `colorDanger` #ffb4ab and their containers keep
their hues, and no palette entry was repointed to a different hue.

### The design language as implemented

- Canvas `colorBackground` #000000. Surfaces step #080808, #101010 and #181818. One tonal step, graphite
  #242424.
- Text #f4f4f4, supporting text #b7b7b7, disabled #777777 for inactive controls only and never for
  placeholders.
- Selection is neutral. A single-choice indicator, meaning a selected chip, segment, tab pill, calendar
  day, switch track, checkbox or radio, is a white fill with black content. A current-location
  highlight, meaning the active destination, current page or current row, is the graphite container with
  white content. Checkmarks, thumb travel, borders and ARIA state are all preserved, so selection is
  never signalled by hue alone.
- Boundaries have two distinct jobs. `colorOutlineVariant` #242424 is decorative grouping separation.
  `colorOutline` #828282 is the functional boundary for anything whose edge identifies it as a control.
  Do not swap them.
- Focus is a `colorFocus` #f4f4f4 ring at `borderFocus` 3px with `borderFocusOffset` 2px. On a
  white-filled control an inner separation ring in `colorFocusContrast` #000000 keeps the ring readable
  on both edges. Focus stays visually distinct from selection.
- Shape: `radiusSmall` 8 for detail, `radiusTile` 12 for icon tiles and compact controls,
  `radiusControl` 16 for fields, `radiusCard` 24 for default cards, `radiusFeature` 32 for large feature
  surfaces, `radiusDialog` 32 for dialogs and sheets, `radiusPill` 999 for buttons, chips and segmented
  selectors.
- Depth is solid fills, the surface step, spacing and a selective 1px edge. Shadows appear only on
  genuinely floating surfaces, through the three elevation composites. No gradients, glows, blur, glass,
  neumorphism or moving backgrounds.
- Mint and blue are no longer applied to ordinary selection, links, buttons or icons. Mint remains
  available for genuine positive or active status and as a documented optional accent.

## Retuned tokens: all 21

Old values are 1.3, new values are 1.4. CSS variable names are unchanged.

| Token | CSS variable | 1.3 | 1.4 | Note |
| --- | --- | --- | --- | --- |
| `colorPaletteCharcoal` | `--qm-color-palette-charcoal` | #242424 | #101010 | Mid surface primitive, now a matte near-black |
| `colorPaletteCharcoalHigh` | `--qm-color-palette-charcoal-high` | #2d2d2d | #181818 | Highest surface primitive |
| `colorPaletteCharcoalLow` | `--qm-color-palette-charcoal-low` | #171717 | #080808 | Recessed surface primitive |
| `colorPaletteMuted` | `--qm-color-palette-muted` | #b7b7bd | #b7b7b7 | Supporting-text primitive, neutralized |
| `colorPaletteOutline` | `--qm-color-palette-outline` | #828289 | #828282 | Boundary primitive, neutralized |
| `colorPaletteDisabled` | `--qm-color-palette-disabled` | #77777d | #777777 | Disabled primitive, neutralized and lifted in contrast |
| `colorSurface` | `--qm-color-surface` | #242424 | #101010 | Default container |
| `colorSurfaceHigh` | `--qm-color-surface-high` | #2d2d2d | #181818 | Raised or emphasized container |
| `colorSurfaceLow` | `--qm-color-surface-low` | #171717 | #080808 | Quiet grouping or recessed region |
| `colorTextMuted` | `--qm-color-text-muted` | #b7b7bd | #b7b7b7 | Supporting text. 9.49:1 on `colorSurface` |
| `colorPrimary` | `--qm-color-primary` | #a8c7fa | #f4f4f4 | Meaning changed: neutral white instead of blue |
| `colorOnPrimary` | `--qm-color-on-primary` | #10213b | #000000 | Meaning changed: content on a white fill |
| `colorPrimaryContainer` | `--qm-color-primary-container` | #24354e | #242424 | Meaning changed: graphite current-location container |
| `colorOnPrimaryContainer` | `--qm-color-on-primary-container` | #a8c7fa | #f4f4f4 | Meaning changed: white content in that container. 14.11:1 |
| `colorSecondary` | `--qm-color-secondary` | #86d9ae | #b7b7b7 | Meaning changed: neutral instead of mint |
| `colorOnSecondary` | `--qm-color-on-secondary` | #153d2b | #000000 | Meaning changed: content on the secondary neutral |
| `colorOutline` | `--qm-color-outline` | #828289 | #828282 | Functional control boundary. 4.95:1 on `colorSurface` |
| `colorFocus` | `--qm-color-focus` | #a8c7fa | #f4f4f4 | Meaning changed: focus ring is white, never an accent hue |
| `colorDisabled` | `--qm-color-disabled` | #77777d | #777777 | Inactive controls only, never placeholders. 4.25:1, up from 3.49:1 |
| `radiusCard` | `--qm-radius-card` | 40px | 24px | Default card silhouette is tighter |
| `radiusCardCompact` | `--qm-radius-card-compact` | 32px | 24px | Now identical to `radiusCard` |

## Added tokens: all 29

| Token | CSS variable | 1.4 | Purpose |
| --- | --- | --- | --- |
| `colorPaletteGraphite` | `--qm-color-palette-graphite` | #242424 | Tonal step primitive for current-location containers |
| `colorPaletteShadowSoft` | `--qm-color-palette-shadow-soft` | #00000099 | Shadow primitive, emitted as `rgb(0 0 0 / 0.6)` in CSS |
| `colorPaletteShadowStrong` | `--qm-color-palette-shadow-strong` | #000000cc | Shadow primitive, emitted as `rgb(0 0 0 / 0.8)` in CSS |
| `colorPaletteScrim` | `--qm-color-palette-scrim` | #000000cc | Scrim primitive, emitted as `rgb(0 0 0 / 0.8)` in CSS |
| `colorOutlineVariant` | `--qm-color-outline-variant` | #242424 | Decorative grouping separation only. Never a control edge |
| `colorFocusContrast` | `--qm-color-focus-contrast` | #000000 | Inner separation ring inside a focus ring on a white fill. 19.09:1 on `colorPrimary` |
| `colorScrim` | `--qm-color-scrim` | #000000cc | Dimming behind modal dialogs, sheets and drawers |
| `radiusTile` | `--qm-radius-tile` | 12px | Icon tiles and compact controls |
| `radiusFeature` | `--qm-radius-feature` | 32px | Large feature surfaces |
| `borderFocusOffset` | `--qm-border-focus-offset` | 2px | Gap between a control edge and its `borderFocus` 3px ring |
| `elevationLevel1OffsetY` | `--qm-elevation-level1-offset-y` | 1px | Level 1 shadow offset |
| `elevationLevel1Blur` | `--qm-elevation-level1-blur` | 2px | Level 1 shadow blur |
| `elevationLevel1Color` | `--qm-elevation-level1-color` | #00000099 | Level 1 shadow color |
| `elevationLevel2OffsetY` | `--qm-elevation-level2-offset-y` | 2px | Level 2 shadow offset |
| `elevationLevel2Blur` | `--qm-elevation-level2-blur` | 8px | Level 2 shadow blur |
| `elevationLevel2Color` | `--qm-elevation-level2-color` | #00000099 | Level 2 shadow color |
| `elevationLevel3OffsetY` | `--qm-elevation-level3-offset-y` | 8px | Level 3 shadow offset |
| `elevationLevel3Blur` | `--qm-elevation-level3-blur` | 24px | Level 3 shadow blur |
| `elevationLevel3Color` | `--qm-elevation-level3-color` | #000000cc | Level 3 shadow color |
| `layerBase` | `--qm-layer-base` | 0 | Ordinary in-flow content |
| `layerRaised` | `--qm-layer-raised` | 1 | Locally raised item inside its own group |
| `layerSticky` | `--qm-layer-sticky` | 10 | Sticky app bars and persistent navigation |
| `layerFloating` | `--qm-layer-floating` | 20 | Floating action surfaces anchored to the viewport |
| `layerOverlay` | `--qm-layer-overlay` | 30 | Snackbars and transient regions above floating surfaces |
| `layerPopover` | `--qm-layer-popover` | 40 | Menus, dropdowns and rich tooltips anchored to a trigger |
| `stateHover` | `--qm-state-hover` | 0.08 | Hover state-layer opacity |
| `stateFocus` | `--qm-state-focus` | 0.12 | Focus state-layer opacity |
| `statePressed` | `--qm-state-pressed` | 0.12 | Pressed state-layer opacity |
| `stateDragged` | `--qm-state-dragged` | 0.16 | Dragged state-layer opacity |

The three shadow colors and the scrim carry alpha. The generated CSS layer emits them in `rgb()`
notation, so `#00000099` appears as `rgb(0 0 0 / 0.6)` and `#000000cc` as `rgb(0 0 0 / 0.8)`. The hex
forms above are what `exports/quiet-material.tokens.resolved.json` and the native outputs carry.

Compose a shadow from the parts, for example
`box-shadow: 0 var(--qm-elevation-level2-offset-y) var(--qm-elevation-level2-blur) var(--qm-elevation-level2-color)`.

## Names kept, meaning changed

Seven semantic roles keep their names and their types but now resolve to neutral values. If your product
reads any of these expecting a blue or mint accent, it will render neutral after upgrading. This is the
one place where 1.4 can change your product without any code change on your side.

| Role | 1.3 meaning | 1.4 meaning |
| --- | --- | --- |
| `colorPrimary` | Blue accent #a8c7fa | White primary fill #f4f4f4 |
| `colorOnPrimary` | Dark blue content #10213b | Black content #000000 |
| `colorPrimaryContainer` | Blue container #24354e | Graphite current-location container #242424 |
| `colorOnPrimaryContainer` | Blue content #a8c7fa | White content #f4f4f4 |
| `colorSecondary` | Mint accent #86d9ae | Neutral gray #b7b7b7 |
| `colorOnSecondary` | Dark mint content #153d2b | Black content #000000 |
| `colorFocus` | Blue focus ring #a8c7fa | White focus ring #f4f4f4 |

If you want the previous accent, reference the palette entries directly. They are unchanged and still
exported:

- `colorPaletteBlue` #a8c7fa, `colorPaletteBlueDark` #10213b and `colorPaletteBlueContainer` #24354e.
- `colorPaletteMint` #86d9ae and `colorPaletteMintContainer` #153d2b.
- The yellow and red entries are likewise unchanged.

```css
/* Keep the 1.3 accent on one component without forking the token layer. */
.my-product-cta {
  background: var(--qm-color-palette-blue);
  color: var(--qm-color-palette-blue-dark);
}
```

Reserve that for a deliberate product accent. Do not use it to restore blue selection or a blue focus
ring wholesale: the neutral selection rule and the white focus ring are what the rest of the system,
its contrast evidence and its migration gates are built on.

## Nothing removed

- No public token name was removed. The 169 names present in 1.3 are all present in 1.4.
- No CSS class, `data-qm-*` hook or JavaScript export was renamed or removed. No `.qm-*` selector was
  lost from any stylesheet.
- No component, variant or interaction contract was dropped. All 36 families in the current MD3 catalog
  are still implemented, and `exports/quiet-material.components.json` is unchanged.
- No motion value, binding or API changed. The motion exports are byte-identical to 1.3.
- The package name, the `exports` map and the `files` list in `package.json` are unchanged.

## What you must check in your product

- **Anywhere you relied on `colorPrimary` being blue.** Buttons, links, icons, badges, charts, selected
  states and illustrations that read the primary roles now render white on black. Decide per surface
  whether neutral is correct or whether you want an explicit `colorPaletteBlue` accent.
- **Anywhere you hardcoded a 40px card radius** to line up with `radiusCard`, or 32px to line up with
  `radiusCardCompact`. Both are now 24px. Sibling surfaces, images, media crops, masks and overlays that
  repeated the old number will no longer match. Use `var(--qm-radius-card)` rather than a literal.
- **Anywhere a decorative border was carrying control meaning.** Under 1.4 a control edge must use
  `colorOutline` and a decorative group separator must use `colorOutlineVariant`. If your product drew
  control edges with a faint divider color, that edge is now too quiet to identify the control; move it
  to `colorOutline`.
- **Custom focus treatments.** If you overrode the focus ring, account for `borderFocusOffset` 2px and,
  on white-filled controls, the inner `colorFocusContrast` ring.
- **Local `z-index` and shadow values.** Six `layer` tiers and three elevation composites now exist. Map
  product overlays onto the tiers so your surfaces and ours stack predictably.
- **Product themes that override surfaces.** If you re-pointed `colorSurface` and its steps, re-check
  contrast against your own values. Dark appearance remains the supported theme; light and
  high-contrast product themes still require separate token and interaction review.

### Evidence, by level

Separate what is implemented from what was tested here and what was not run at all.

- Implemented and verified here: `npm run check` passes 117 of 117 tests on Node 22.22.2, including 12
  migration gates added to `tests/theme.test.mjs` that fail on a stray color literal, a literal corner
  radius, a bare `z-index` or a hue in a role that must stay neutral. Token generation is deterministic
  and all generated outputs are committed in sync. Measured contrast on `colorSurface`: text 17.30:1,
  muted text 9.49:1, outline 4.95:1, disabled 4.25:1 up from 3.49:1; `colorOnPrimaryContainer` on the
  graphite container 14.11:1; `colorOnPrimary` on `colorPrimary` 19.09:1; `colorFocusContrast` on a
  white fill 19.09:1. Every pre-existing contrast gate still passes. 25 rendered screenshots at 320,
  390, 768, 1024 and 1440 were captured in headless Chromium with reduced motion.
- Not run in this environment but passing in CI: Android `assembleDebug`, Apple `swift build` and
  `xcodebuild`, and Flutter `analyze` and `test`. No Android, Apple or Flutter SDK is installed here, so
  the native sources were written and reviewed by inspection; the hosted workflow then built all three
  adapters green for the commit carrying the native changes, and the Flutter widget tests gained
  assertions without losing any.
- Not performed at all: any device, emulator, screen-reader, forced-colors or 400% browser-zoom session.
  The jsdom tests do not prove rendered layout, and the screenshots are Chromium only, with no Firefox
  or Safari verification.

None of this replaces your own product validation. Accessibility conformance remains a product-level
responsibility, as [governance](governance.md) states.

## Versioning note

Under the repository's [versioning policy](governance.md), 1.4.0 is a minor release: no documented token
name, CSS class, JavaScript export or interaction contract was removed or renamed, and every API keeps
its shape, so an integration upgrades without changing code.

The same policy says that changing the meaning of an API is a major version, and it says not to silently
change token semantics while retaining a familiar name. Seven semantic color roles do change meaning
here, and `radiusCard` changes a default silhouette. That is precisely why this guide exists: the
affected tokens are named individually, with exact old and new values, an explicit escape hatch to
`colorPaletteBlue` and `colorPaletteMint`, and a checklist of what to inspect. The changed defaults are
documented rather than silently broken. If the owner judges the repointed roles to be a breaking change
for their consumers, the release can be numbered accordingly; the migration content above does not
change either way.

The package remains private and UNLICENSED. Nothing has been published, no release tag was created, and
`package.json` is unchanged, so its `version` field still reads 1.3.0 until the owner decides to cut this
release. See [governance](governance.md) before distribution or publication.
