# Foundations

Quiet Material gives content room to breathe: pure black pages, rounded charcoal containers, clear white type and just enough color to communicate an action or state. The approved reference is [the concept image](../assets/approved-concept.png). This specification translates that direction into portable rules; it does not reproduce a particular operating system.

## Principles

1. Start with the simplest native element or existing composition that meets the need.
2. Let typography and spacing create hierarchy before adding decoration.
3. Keep the page black; use charcoal only when a container communicates a useful group.
4. Use motion to explain a change or acknowledge an interaction.
5. Preserve accessible names, focus and control boundaries even when they add visual detail.

## Color roles

Use semantic variables in product code. Palette tokens are implementation ingredients, not the public styling contract. Never select a color solely because it looks right in a screenshot.

| CSS variable, prefixed with `--qm-color-` | Value | Role |
| --- | --- | --- |
| background | #000000 | Entire page canvas |
| surface-low | #171717 | Quiet grouping or a recessed region |
| surface | #242424 | Default card and container |
| surface-high | #2d2d2d | Elevated or emphasized container |
| text | #f4f4f4 | Primary readable content |
| text-muted | #b7b7bd | Supporting information, still readable |
| primary | #a8c7fa | Selected state, focus and limited accent actions |
| on-primary | #10213b | Text on primary fill |
| primary-container | #24354e | Restrained selected container |
| on-primary-container | #a8c7fa | Text on the selected container |
| secondary / success | #86d9ae | Secondary emphasis or success with a label |
| on-secondary / success-container | #153d2b | Dark text on mint / success surface |
| warning / warning-container | #f3d17d / #423411 | Warning text and surface |
| danger / danger-container | #ffb4ab / #522622 | Error text and surface |
| outline | #828289 | Boundaries needed to identify controls |
| focus | #a8c7fa | Visible keyboard focus |
| action / on-action | #f4f4f4 / #000000 | Quiet, high-emphasis neutral action |
| disabled | #77777d | Inactive content only |

Keep most pixels neutral. A page usually needs only one visual primary action. Blue and mint are accents, not large decorative backgrounds. Errors and warnings may use their semantic colors when an actual state needs them. Never use success color merely to make a card attractive.

“Minimal borders” applies to decorative containers. Inputs and controls can require an outline to remain identifiable; see [accessibility](accessibility.md). Use flat fills and spacing for depth. Do not add glowing cards, animated gradients, glass blur or a shadow under every element.

## Typography

The font stack is Inter, Roboto, Arial, sans-serif. Fonts are not downloaded or bundled; available local fonts determine the rendering. A future font asset requires a separate licensing and loading decision. Code uses the local monospace stack.

| Role | Token | Size | Suggested use |
| --- | --- | --- | --- |
| Display | `--qm-type-display` | 3.5rem | A short lead statement |
| Headline | `--qm-type-headline` | 2.25rem | Page or major section title |
| Title | `--qm-type-title` | 1.5rem | Card or subsection heading |
| Body | `--qm-type-body` | 1rem | Reading and form text |
| Label | `--qm-type-label` | 0.875rem | Concise control and metadata labels |
| Caption | `--qm-type-caption` | 0.75rem | Noncritical supporting detail only |

At a 16px root size, the type tokens correspond to 56px, 36px, 24px, 16px, 14px and 12px. Pairing display with tight line height gives 61.6px, headline/title with heading gives 45px/30px, and body with body line height gives 25.6px. Caption text inherits its context; with body line height it is 19.2px. These are token-derived reference values, not fixed pixel sizing requirements.

Weights are 400, 500 and 600. The “bold” token is 600, not 700. Line-height tokens are tight 1.1, heading/control 1.25 and body 1.6. Avoid light weights on black. Prefer sentence case. Visual size does not determine heading level; use a logical HTML heading hierarchy. Fluid display sizing may shrink on compact screens without changing body text size.

## Spacing, shape and layout

Space tokens run from `--qm-space-0` through `--qm-space-12` in 4px steps: 0–48px. Use 8–12px inside a control group, 16–24px between related items and 32–48px between major groups. These are composition recommendations; the actual component stylesheet is authoritative for a primitive's padding.

| Shape token | Value | Application |
| --- | --- | --- |
| radius-small | 8px | Small embedded details |
| radius-control | 16px | Field and compact surface |
| radius-card | 40px | Signature large containers |
| radius-dialog | 32px | Modal surface |
| radius-pill | 999px | Buttons, chips and rounded navigation |

Cards start with a 32px radius and 24px padding; from 600px the component stylesheet uses a 40px radius and responsive padding. Use at least enough padding to keep content away from a large rounded corner. Do not put dense tables into tiny pill-shaped cells. A pill control can grow taller and wrap when translated text needs space.

Content maximum width is 1200px; reading width is 720px; desktop sidebar width is 256px. Components should respond to available space rather than assume a fixed device. Stack columns on compact screens, allow controls to wrap and retain a useful reading order. The preferred control target is 48px. The [mobile-first contract](mobile-first.md) defines 600/840/1200 window classes and 20/32/48 page insets.

## Icons and imagery

Prefer recognizable outline icons at consistent optical size and stroke weight. Icons support text; decorative icons use aria-hidden="true". An icon-only button requires a meaningful accessible name and a full target area. Supply icons as local assets from a source whose license you have verified. This repository does not grant a license to Google's icon or font assets.

Use imagery when it carries information. Keep it inside content regions rather than behind text. Avatars are supplementary when a name is already present; avoid announcing the same identity twice.

## Token architecture

The source is [quiet-material.tokens.json](../tokens/quiet-material.tokens.json); `npm run build` writes [tokens.css](../styles/tokens.css), resolved JSON, typed TypeScript, Kotlin, Swift and Dart. See [platform contracts](platforms.md) for units and adapters. Token paths become kebab-case custom properties with a `--qm-` prefix: `color.textMuted` becomes `--qm-color-text-muted`. Components consume semantic aliases rather than raw palette entries.

The file uses `$type`, `$value` and alias references described by the [DTCG format specification](https://www.designtokens.org/tr/2025.10/format/). The repository implements the subset it needs; it does not claim to be a universal DTCG resolver. Rebuild after changing a source value. Do not hand-edit the generated CSS.

Material is the inspiration, while the black canvas, palette, radii and type scale are Quiet Material's own choices. Consult the [official Material Design site](https://m3.material.io/) for the broader design language; do not describe this custom theme as an official Material implementation.
