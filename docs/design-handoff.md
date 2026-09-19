# Design-tool handoff

This document specifies how to create a matching design library later. It is not an editable Figma library, and no Figma file creation or synchronization is implied.

## Library structure

Create pages for Overview, Foundations, Components, Patterns and Change log. Place the approved concept image on Overview and label it as a visual reference. Actual token values and component contracts take precedence over image sampling.

Use a Quiet Material variable collection with one supported mode, Dark. Keep component variants focused on meaningful behavior; avoid generating combinations that a product should never use.

| Source path or group | Suggested design-tool name | Treatment |
| --- | --- | --- |
| color.background | Color / Background | Pure black page |
| color.surface, surfaceLow, surfaceHigh | Color / Surface / Default, Low, High | Reusable fills |
| color.text, textMuted | Color / Text / Primary, Secondary | Readable text roles |
| color.primary, onPrimary | Color / Accent / Primary, On primary | Paired variables |
| color.success, warning, danger and their containers | Color / Status / … | Label or icon accompanies color |
| color.outline, focus | Color / Outline, Focus | Functional visibility |
| space.0 through space.12 | Space / 0 through 12 | Number variables, 4px increments |
| radius.card, dialog, control, pill | Shape / … | Number variables |
| type.* and font.* | Type / Display, Headline, Title, Body, Label, Caption | Text styles using token values |
| duration.* and easing.* | Motion / … | Prototype annotations where variables cannot express the behavior |

## Component anatomy

Name components by purpose: Button, Field, Card, Switch, Tabs, Dialog. Expose text and icon swaps as properties. Use auto layout, content-driven height and minimum target size. Add default, hover, pressed, focus-visible and disabled variants where relevant; fields add invalid and read-only, selection controls add selected/checked.

Keep a visible focus variant in the design file. Include long-label, compact-width, error and reduced-motion examples alongside the ideal state. A disabled variant must not be used to hide an explanation the user needs.

## Handoff acceptance

For each component, record semantic HTML, CSS class, required data attributes, accessible name, keyboard behavior and responsive constraints. Link the corresponding section in [components](components.md). Mark dynamic behaviors as implemented, proposed or product-owned. Do not treat a prototype interaction as evidence that keyboard or assistive-technology behavior exists in code.

Update source tokens first, regenerate CSS, then update the design library. Compare real browser rendering with design frames; font fallback and content wrapping can differ. Record any intentional deviation rather than maintaining two unexplained authorities.
