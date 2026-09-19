# Foundations

Quiet Material gives content room to breathe: pure black pages, matte near-black containers, clear white type, and color reserved for the few states that genuinely carry meaning. The approved visual reference is [the approved black direction](../assets/reference/black-direction-2026-09.webp); its provenance is recorded in [the reference README](../assets/reference/README.md). [The earlier concept image](../assets/approved-concept.png) is kept only as a historical record of the 1.0-1.3 charcoal appearance. This specification translates the approved direction into portable rules; it does not reproduce a particular operating system.

The reference is a concept board, not a running build. Its device bezels, wallpaper, footer imagery, demo wordmark, app names, third-party app icons and on-screen keyboard are illustration only: none of them is a token, a component or a feature of this system. The values below are deliberate design choices made for this direction, not pixels sampled from the board.

## Principles

1. Start with the simplest native element or existing composition that meets the need.
2. Let typography and spacing create hierarchy before adding decoration.
3. Keep the page black; step up to a near-black surface only when a container communicates a useful group.
4. Use motion to explain a change or acknowledge an interaction.
5. Preserve accessible names, focus and control boundaries even when they add visual detail.

## Color roles

Use semantic variables in product code. Palette tokens are implementation ingredients, not the public styling contract. Never select a color solely because it looks right in a screenshot.

| CSS variable, prefixed with `--qm-color-` | Value | Role |
| --- | --- | --- |
| background | #000000 | Entire page canvas |
| surface-low | #080808 | Quiet grouping or a recessed region |
| surface | #101010 | Default card and container |
| surface-high | #181818 | Elevated or emphasized container |
| text | #f4f4f4 | Primary readable content |
| text-muted | #b7b7b7 | Supporting information, still readable |
| primary | #f4f4f4 | White fill for one selected choice and for a primary action |
| on-primary | #000000 | Content on a white primary fill |
| primary-container | #242424 | Graphite container for the current location and tonal surfaces |
| on-primary-container | #f4f4f4 | Content on the graphite container |
| secondary | #b7b7b7 | Neutral secondary emphasis |
| on-secondary | #000000 | Content on a secondary fill |
| success / success-container | #86d9ae / #153d2b | Genuine positive state, with a label |
| warning / warning-container | #f3d17d / #423411 | Warning text and surface |
| danger / danger-container | #ffb4ab / #522622 | Error text and surface |
| outline | #828282 | Functional boundary that identifies a control |
| outline-variant | #242424 | Decorative separation between containers |
| focus | #f4f4f4 | Visible keyboard focus ring |
| focus-contrast | #000000 | Inner separation ring inside a light-filled control |
| scrim | #000000cc | Dimming layer behind a modal surface |
| action / on-action | #f4f4f4 / #000000 | Quiet, high-emphasis neutral action |
| disabled | #777777 | Inactive control content only, never placeholder text |

The surfaces form one deliberate ladder: #000000 canvas, then #080808, #101010 and #181818 for containers, with #242424 as the single tonal step above them. Keep most pixels neutral. A page usually needs only one visual primary action. Errors, warnings and real positive states may use their semantic colors when an actual state needs them; never use the success color merely to make a card attractive.

The token tests compute the ratios this palette produces: text 17.30:1 on `color-surface`, text-muted 9.49:1, outline 4.95:1, disabled 4.25:1 (up from 3.49:1 before the neutral retune), on-primary-container on the graphite container 14.11:1, and on-primary on a white fill 19.09:1. Those are token-pair figures, not a product audit; see [accessibility](accessibility.md) for the acceptance policy.

### Selection and current location

Selection has exactly two treatments, and they are not interchangeable.

- A single-choice indicator is a **white fill with black content**: `color-primary` background, `color-on-primary` content. This covers a selected chip, a segmented-button segment, a selected tab pill, a selected calendar day, a checked switch track and a checked checkbox. A checked radio uses the same white for its ring and inner dot, because a dot carries no content to invert.
- A current-location highlight is the **graphite container with white content**: `color-primary-container` background, `color-on-primary-container` content. This covers the active navigation destination, the current page in pagination and the current row in a list.

Selection is never signalled by hue alone. The checkmark glyph, the switch thumb travel, the tab indicator, the control boundary and the ARIA state all stay in place, so the state survives a forced-colors or monochrome rendering.

### Decorative and functional boundaries

Two boundary tokens exist and must never be swapped.

- `color-outline-variant` (#242424) is **decorative**. It separates containers that are already grouped by spacing and surface step: cards, accordions, menus, snackbars and tooltips.
- `color-outline` (#828282) is **functional**. Use it for any edge whose presence is what identifies the thing as a control: inputs, select elements, textareas, chips, switch tracks, checkbox and radio boxes, and unfilled containers that accept interaction.

A decorative edge must never be the only sign that something is a control. If removing the edge would leave a user unable to tell that a region is interactive, the edge is functional, so it must use `color-outline` and meet non-text contrast. "Minimal borders" applies to decorative containers only; see [accessibility](accessibility.md).

### Focus

Focus is always visually distinct from selection.

- The ring is `color-focus` (#f4f4f4) drawn at `border-focus` (3px) with `border-focus-offset` (2px), applied through `:focus-visible`.
- On a control that is already filled white (primary button, selected chip, selected tab, checked switch, checked checkbox, selected calendar day, pressed time field), an inner separation ring in `color-focus-contrast` (#000000) is drawn one `border-width` inside the control so the outer white ring stays readable on both of its edges.
- Under `forced-colors: active` the ring switches to the system `Highlight` color; do not remove or recolor focus for visual cleanliness.

### Semantic color exceptions

Success #86d9ae, warning #f3d17d and danger #ffb4ab keep their hue, along with their containers. They communicate state, not brand, so the neutral direction does not apply to them.

Mint and blue remain in the palette as `color-palette-mint`, `color-palette-mint-container`, `color-palette-blue`, `color-palette-blue-dark` and `color-palette-blue-container`. They are not the default selection, link, button or icon color any more. Mint stays available for a genuine positive or active status and as a documented optional accent. A product that wants the former blue or mint accent must reference the palette entry explicitly rather than expecting `color-primary` to supply it.

## Typography

Type did not change in this direction. The font stack is Inter, Roboto, Arial, sans-serif. Fonts are not downloaded or bundled; available local fonts determine the rendering. A future font asset requires a separate licensing and loading decision. Code uses the local monospace stack.

| Role | Token | Size | Suggested use |
| --- | --- | --- | --- |
| Display | `--qm-type-display` | 3.5rem | A short lead statement |
| Headline | `--qm-type-headline` | 2.25rem | Page or major section title |
| Title | `--qm-type-title` | 1.5rem | Card or subsection heading |
| Body | `--qm-type-body` | 1rem | Reading and form text |
| Label | `--qm-type-label` | 0.875rem | Concise control and metadata labels |
| Caption | `--qm-type-caption` | 0.75rem | Noncritical supporting detail only |

At a 16px root size, the type tokens correspond to 56px, 36px, 24px, 16px, 14px and 12px. Pairing display with tight line height gives 61.6px, headline/title with heading gives 45px/30px, and body with body line height gives 25.6px. Caption text inherits its context; with body line height it is 19.2px. These are token-derived reference values, not fixed pixel sizing requirements.

Weights are 400, 500 and 600. The “bold” token is 600, not 700. Line-height tokens are tight 1.1, heading/control 1.25 and body 1.6. Avoid light weights on black. Prefer sentence case. Visual size does not determine heading level; use a logical HTML heading hierarchy. Fluid display sizing may shrink on compact screens without changing body text size. Headings are white and supporting copy is #b7b7b7; emphasis comes from weight, size and spacing rather than from a colored heading.

## Spacing, shape and layout

Space tokens run from `--qm-space-0` through `--qm-space-12` in 4px steps: 0-48px. Use 8-12px inside a control group, 16-24px between related items and 32-48px between major groups. These are composition recommendations; the actual component stylesheet is authoritative for a primitive's padding.

| Shape token | Value | Application |
| --- | --- | --- |
| radius-small | 8px | Small embedded details: MD3 chip corners, the inner corners of connected and split buttons, and, halved, the checkbox box |
| radius-tile | 12px | Icon tiles, thumbnails and compact controls |
| radius-control | 16px | Fields and other compact surfaces |
| radius-card | 24px | Default cards and containers |
| radius-feature | 32px | Large feature surfaces whose size justifies a wider corner |
| radius-dialog | 32px | Dialogs and sheets |
| radius-pill | 999px | Buttons, chips, segmented selectors and rounded navigation |

`radius-card` moved from 40px to 24px in this direction, and `radius-card-compact` moved from 32px to 24px; it is now an alias of `radius-card`. The old 40px default read as a soft capsule rather than a panel: at ordinary card widths it ate the corners of the content, forced extra padding to keep text clear of the curve, and left the page looking rounder than the approved direction, whose surfaces are square-shouldered rounded rectangles with pill shapes reserved for controls. The consequence is intentional and visible: the default card silhouette is tighter than in 1.3. A surface that genuinely wants the wider corner should ask for `radius-feature`.

Cards use a 24px radius at every width with 24px padding, and take 32px padding from 600px. Use at least enough padding to keep content away from a rounded corner. Do not put dense tables into tiny pill-shaped cells. A pill control can grow taller and wrap when translated text needs space.

Content maximum width is 1200px; reading width is 720px; desktop sidebar width is 256px. Components should respond to available space rather than assume a fixed device. Stack columns on compact screens, allow controls to wrap and retain a useful reading order. The preferred control target is 48px. The [mobile-first contract](mobile-first.md) defines 600/840/1200 window classes and 20/32/48 page insets.

## Elevation

Depth comes from the surface step, spacing and a selective 1px edge. Fills are solid. There are no gradients, glows, blurs, glass effects, neumorphic treatments or moving backgrounds; the one gradient in the system is a scrim ramp that keeps a caption legible over an image, which is legibility rather than decoration.

Shadows are reserved for surfaces that genuinely float above the page. Three composites cover every such case, and `styles/base.css` assembles each one from the generated elevation primitives:

| Composite | Offset Y | Blur | Ink | Used by |
| --- | --- | --- | --- | --- |
| `--qm-shadow-level1` | 1px | 2px | `color-palette-shadow-soft` #00000099 | Elevated button, elevated card, elevated chip |
| `--qm-shadow-level2` | 2px | 8px | `color-palette-shadow-soft` #00000099 | Menu, tooltip, rich tooltip, snackbar, dropdown listbox, search suggestions, floating toolbar |
| `--qm-shadow-level3` | 8px | 24px | `color-palette-shadow-strong` #000000cc | Dialog, FAB, sheet |

Compose a new shadow from `--qm-elevation-level*-offset-y`, `-blur` and `-color` rather than writing a literal `box-shadow`. Do not put a shadow under an element that is flush with the page: on black, an unearned shadow reads as grime rather than as height.

## Layering

Six tiers order everything that can overlap. Use the token, never a bare `z-index` number.

| Token | Value | Tier |
| --- | --- | --- |
| `--qm-layer-base` | 0 | Ordinary in-flow content |
| `--qm-layer-raised` | 1 | An item raised inside its own group |
| `--qm-layer-sticky` | 10 | Sticky app bars and persistent navigation |
| `--qm-layer-floating` | 20 | Floating action surfaces anchored to the viewport |
| `--qm-layer-overlay` | 30 | Snackbars and transient regions above floating surfaces |
| `--qm-layer-popover` | 40 | Menus, dropdowns and rich tooltips anchored to a trigger |

The gaps between tiers are deliberate: a product can slot its own stacking between two tiers without editing the system.

## State layers

Hover, focus, press and drag feedback is a translucent layer in the control's own content color, drawn over the fill rather than a separate color for each state. Four opacities cover it.

| Token | Value | State |
| --- | --- | --- |
| `--qm-state-hover` | 0.08 | Pointer hover |
| `--qm-state-focus` | 0.12 | Keyboard focus, in addition to the focus ring |
| `--qm-state-pressed` | 0.12 | Press, and the ripple's own opacity |
| `--qm-state-dragged` | 0.16 | Drag |

Because the layer uses `currentColor`, the same rule works on a black-on-white primary button and on a white-on-graphite container. A state layer never replaces the selection treatment or the focus ring; it sits alongside them.

## Icons and imagery

Prefer recognizable outline icons at consistent optical size and stroke weight. Icons support text; decorative icons use aria-hidden="true". An icon-only button requires a meaningful accessible name and a full target area. An icon that sits on its own tile uses `radius-tile` and a near-black surface, not a colored badge. Supply icons as local assets from a source whose license you have verified. This repository does not grant a license to Google's icon or font assets.

Use imagery when it carries information. Keep it inside content regions rather than behind text. Avatars are supplementary when a name is already present; avoid announcing the same identity twice.

## Token architecture

The source is [quiet-material.tokens.json](../tokens/quiet-material.tokens.json) and holds 198 tokens. `npm run build` writes nine generated outputs: [tokens.css](../styles/tokens.css), resolved JSON, typed TypeScript, a JavaScript token module, two motion exports, and Kotlin, Swift and Dart sources. See [platform contracts](platforms.md) for units and adapters. Token paths become kebab-case custom properties with a `--qm-` prefix: `color.textMuted` becomes `--qm-color-text-muted`. Components consume semantic aliases rather than raw palette entries.

The families are color (palette ingredients plus semantic aliases), space, radius, font, type, line-height, size, border, breakpoint, layout, duration, easing, spring, motion, and the three families this direction added: elevation, layer and state.

This direction retuned 21 values and added 29 tokens without removing or renaming a single public token, CSS class, `data-qm-*` hook or JavaScript export. Seven names kept their spelling and changed their meaning from a blue or mint accent to a neutral one: `color-primary`, `color-on-primary`, `color-primary-container`, `color-on-primary-container`, `color-secondary`, `color-on-secondary` and `color-focus`. Motion is untouched. The [changelog](../CHANGELOG.md) records the full before-and-after list.

The file uses `$type`, `$value` and alias references described by the [DTCG format specification](https://www.designtokens.org/tr/2025.10/format/). The repository implements the subset it needs; it does not claim to be a universal DTCG resolver. Rebuild after changing a source value. Do not hand-edit the generated CSS.

Material is the inspiration, while the black canvas, palette, radii and type scale are Quiet Material's own choices. Consult the [official Material Design site](https://m3.material.io/) for the broader design language; do not describe this custom theme as an official Material implementation.
