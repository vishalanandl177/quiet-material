# Design-tool handoff

This document specifies how to create a matching design library later. It is not an editable Figma library, and no Figma file creation or synchronization is implied.

## Library structure

Create pages for Overview, Foundations, Components, Patterns and Change log. Place the [approved visual reference](../assets/reference/) on Overview and label it as a reference board, not a screenshot; `assets/approved-concept.png` is the historical 1.0-1.3 appearance and should be marked as such if it is kept at all. Actual token values and component contracts take precedence over image sampling, and the board's device bezels, wallpaper, footer, wordmark, app names and third-party icons are illustration rather than library content.

Use a Quiet Material variable collection with one supported mode, Dark. Keep component variants focused on meaningful behavior; avoid generating combinations that a product should never use.

Two distinctions must survive the move into a design tool, because a library that blurs them will produce inaccessible screens:

- **Decorative versus functional boundaries.** `color.outlineVariant` separates containers and must never be used for an edge that identifies a control. `color.outline` is that functional edge. Give them separate, clearly named variables; do not merge them into one "border" variable because they look similar on screen.
- **Selection versus focus.** Selection is a fill: white with black content for a single choice, the graphite container with white content for a current location. Focus is a ring around the control, and on a white-filled control it also carries an inner separation ring. A design file that shows only the selected fill will lose the focus state that keyboard users depend on.

| Source path or group | Suggested design-tool name | Treatment |
| --- | --- | --- |
| color.background | Color / Background | Pure black page |
| color.surface, surfaceLow, surfaceHigh | Color / Surface / Default, Low, High | Reusable fills |
| color.text, textMuted | Color / Text / Primary, Secondary | Readable text roles |
| color.primary, onPrimary | Color / Selection / Primary, On primary | White fill with black content; the single-choice indicator and the primary action |
| color.primaryContainer, onPrimaryContainer | Color / Selection / Container, On container | Graphite tonal fill for a current-location highlight |
| color.success, warning, danger and their containers | Color / Status / … | Label or icon accompanies color |
| color.outline | Color / Outline / Control | Functional edge that identifies a control; never swap with the decorative role |
| color.outlineVariant | Color / Outline / Decorative | Container separation only; no contrast requirement |
| color.focus, focusContrast | Color / Focus / Ring, Separation | Ring plus the inner ring used inside a light-filled control |
| color.scrim | Color / Scrim | Dimming behind a modal surface |
| space.0 through space.12 | Space / 0 through 12 | Number variables, 4px increments |
| radius.small, tile, control, card, feature, dialog, pill | Shape / … | Number variables: 8 detail, 12 icon tile, 16 field, 24 card, 32 feature and dialog, 999 pill |
| elevation.level1-3 | Effect / Elevation / 1-3 | Offset, blur and shadow colour; reserve for genuinely floating surfaces |
| state.hover, focus, pressed, dragged | Number / State layer | Opacities drawn over a control in its own content colour |
| layer.base … popover | Number / Layer | Stacking order, for annotation rather than a visual property |
| type.* and font.* | Type / Display, Headline, Title, Body, Label, Caption | Text styles using token values |
| duration.* and easing.* | Motion / … | Prototype annotations where variables cannot express the behavior |

## Component anatomy

Name components by purpose: Button, Field, Card, Switch, Tabs, Dialog. Expose text and icon swaps as properties. Use auto layout, content-driven height and minimum target size. Add default, hover, pressed, focus-visible and disabled variants where relevant; fields add invalid and read-only, selection controls add selected/checked.

Keep a visible focus variant in the design file. Include long-label, compact-width, error and reduced-motion examples alongside the ideal state. A disabled variant must not be used to hide an explanation the user needs.

## Handoff acceptance

For each component, record semantic HTML, CSS class, required data attributes, accessible name, keyboard behavior and responsive constraints. Link the corresponding section in [components](components.md). Mark dynamic behaviors as implemented, proposed or product-owned. Do not treat a prototype interaction as evidence that keyboard or assistive-technology behavior exists in code.

Update source tokens first, regenerate CSS, then update the design library. Compare real browser rendering with design frames; font fallback and content wrapping can differ. Record any intentional deviation rather than maintaining two unexplained authorities.
