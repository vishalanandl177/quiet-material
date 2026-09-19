# MD3 component coverage

Quiet Material 1.4 supplies reusable web implementations across the **36 families** in the [official Material Design 3 catalog](https://m3.material.io/components), reviewed on 2026-09-19. The catalog includes the newer expressive action families as well as the established MD3 controls. The tables below identify concrete APIs and variants; component availability and device validation are separate.

The [machine-readable inventory](../exports/quiet-material.components.json), available through the package's `./components.json` export, makes the same family coverage available to documentation tools and integrations.

The system applies a custom black, graphite and white brand to MD3 component purposes, state contracts and motion foundations. The 1.4 migration retuned that appearance; it removed no family, API, selector or motion value. Family coverage does not imply every SDK option, expressive geometry or platform presentation is identical. Variant-level differences are recorded here and in the component guides. Shared durations, curves, springs and transition APIs are covered by the [motion audit](md3-motion-audit.md).

## Reusable web catalog

All styles enter through `styles/quiet-material.css`. `initQuietMaterial(root)` initializes the documented declarative hooks; explicit mount APIs are exported by `src/quiet-material.js`. Actions and data remain application-owned.

Appearance across the whole catalog follows one set of rules, specified in [foundations](foundations.md) and applied by the five component stylesheets:

- Surfaces: a #000000 canvas with #080808, #101010 and #181818 container steps, and #242424 as the single tonal step above them. Text is #f4f4f4, supporting text #b7b7b7, inactive control content #777777.
- Selection: a single-choice indicator is a white #f4f4f4 fill with #000000 content (selected chip, segment, tab pill, calendar day, checked switch track, checked checkbox, checked radio ring and dot). A current-location highlight is the #242424 graphite container with white content (active destination, current page, current row). Primary and secondary tabs keep the same meaning with a white indicator bar instead of a fill.
- Boundaries: `color-outline` #828282 is the functional edge that identifies a control; `color-outline-variant` #242424 only separates containers decoratively. They are never swapped.
- Focus: a 3px #f4f4f4 ring at a 2px offset, plus an inner #000000 separation ring inside a control that is already filled white.
- Shape: 8px small details, 12px icon tiles and compact controls, 16px fields, 24px cards, 32px feature surfaces, dialogs and sheets, and 999px pill controls.
- Depth: solid fills, with the three elevation composites reserved for genuinely floating surfaces. No gradients, glows, blur or glass.

| Official family | Reusable API or selector | Implemented variants and behavior | Guide |
| --- | --- | --- | --- |
| Button groups | `.qm-button-group`, `.qm-button-group--connected` | Standard and connected groups; native action buttons; press shape feedback | [Actions](components-actions.md) |
| Buttons | `.qm-button` | Filled, tonal, elevated, outlined, text; compatible branded aliases; disabled/focus/pressed states | [Actions](components-actions.md) |
| Extended FAB | `.qm-fab--extended` | Icon and label, native action semantics; fixed or in-layout composition | [Actions](components-actions.md) |
| FAB menu | `[data-qm-fab-menu]` | Expand/collapse, named actions, Escape/outside dismissal and focus return | [Actions](components-actions.md) |
| Floating action button | `.qm-fab` | Small, standard, large; small visual retains a 48-unit target | [Actions](components-actions.md) |
| Icon buttons | `.qm-button--icon`, `[data-qm-icon-toggle]` | Standard, filled, tonal, outlined; optional selected state and change event | [Actions](components-actions.md) |
| Segmented buttons | `[data-qm-segmented]` | Single/multiple selection, horizontal/vertical, RTL keyboard navigation, form values/reset | [Actions](components-actions.md) |
| Split button | `.qm-split-button`, `[data-qm-menu-trigger]` | Independent primary action and secondary menu trigger | [Actions](components-actions.md), [Inputs](components-input.md) |
| Date pickers | `mountDatePicker()`, `[data-qm-date-picker]` | Single/range; calendar and typed civil-date input; inline/modal; bounds; confirm/cancel | [Inputs](components-input.md) |
| Time pickers | `mountTimePicker()`, `[data-qm-time-picker]` | Clock and numeric input; 12/24-hour; inline/modal; confirm/cancel | [Inputs](components-input.md) |
| Loading indicator | `mountLoadingIndicator()`, `[data-qm-loading-indicator]` | Contained/uncontained branded morphing contours; reduced-motion static state | [Communication](components-communication.md) |
| Progress indicators | `mountProgress()`, `setProgress()`, `[data-qm-progress]` | Linear/circular; determinate/indeterminate; progress semantics and lifecycle | [Communication](components-communication.md) |
| Navigation bar | `.qm-navigation--bar`, `[data-qm-navigation]` | Current destination, links or explicit local view switching; compact adaptive form | [Navigation](components-navigation.md) |
| Navigation drawer | `.qm-navigation--drawer`, `.qm-dialog--drawer` | Permanent/in-layout and modal; shared destination state | [Navigation](components-navigation.md) |
| Navigation rail | `.qm-navigation--rail`, `[data-qm-navigation="adaptive"]` | Dedicated rail and single-DOM adaptive bar/rail/drawer | [Navigation](components-navigation.md) |
| Bottom sheets | `.qm-sheet--bottom`, `.qm-dialog--sheet` | Standard/modal; expanded/collapsed states; handle button and drag release | [Navigation](components-navigation.md) |
| Side sheets | `.qm-sheet--side`, `.qm-dialog--side-sheet` | Standard/modal; visible dismissal, modal focus return, RTL alignment | [Navigation](components-navigation.md) |
| App bars | `.qm-app-bar` | Small, centered, medium, large and bottom; pinned, enter-always, exit-until-collapsed states | [Navigation](components-navigation.md) |
| Badges | `.qm-badge--small`, `.qm-badge--large` | Dot/count anchors; supplementary semantic status pills remain available | [Communication](components-communication.md) |
| Cards | `.qm-card--filled`, `--outlined`, `--elevated` | Filled, outlined and elevated surfaces; compose named actions inside | [Actions](components-actions.md) |
| Carousel | `[data-qm-carousel]` | Multi-browse, uncontained, hero, vertical full-screen; swipe/scroll and previous/next; no autoplay | [Navigation](components-navigation.md) |
| Checkbox | `.qm-checkbox` | Checked, unchecked, native indeterminate, disabled; native form state | [Actions](components-actions.md) |
| Chips | `.qm-chip--assist`, `--filter`, `--input`, `--suggestion` | Assist, filter, input, suggestion; selectable/removable variants; cancellable input removal | [Actions](components-actions.md) |
| Dialogs | `.qm-dialog`, `.qm-dialog--fullscreen` | Basic/full-screen; native modal focus, result, close and restoration | [Navigation](components-navigation.md), [Core contracts](components.md) |
| Divider | `.qm-divider` | Full width, inset, leading inset and vertical | [Navigation](components-navigation.md) |
| Lists | `.qm-list`, `.qm-list__item` | One/two/three-line; leading media and trailing controls/text | [Navigation](components-navigation.md) |
| Menus | `[data-qm-menu-trigger]`, `.qm-menu[role="menu"]`, `[data-qm-combobox]` | Anchored keyboard action menus and selection items; submenu contract; exposed dropdown/combobox | [Inputs](components-input.md) |
| Radio button | `.qm-radio` | Native single-selection groups; checked/unchecked/disabled | [Actions](components-actions.md) |
| Search | `mountSearch()`, `[data-qm-search]` | Search bar and modal view; suggestions, keyboard selection, clear, asynchronous submit status | [Inputs](components-input.md) |
| Sliders | `[data-qm-slider]`, `[data-qm-range-slider]` | Single and two-thumb range; continuous/discrete step; bounds, labels, keyboard/pointer/reset | [Actions](components-actions.md) |
| Snackbar | `showSnackbar()` | Persistent or timed; real async action plus dismiss; pending/error handling; latest message replaces previous | [Communication](components-communication.md) |
| Switch | `.qm-switch` | Labeled native checkbox with switch role; checked/unchecked/disabled; spatial/effects motion | [Core contracts](components.md) |
| Tabs | `[data-qm-tabs]`, `.qm-tabs--primary`, `--secondary`, `--scrollable` | Primary/secondary, fixed/scrolling; horizontal/vertical keyboard navigation; disabled handling | [Navigation](components-navigation.md), [Core contracts](components.md) |
| Text fields | `[data-qm-text-field]`, `.qm-text-field--filled`, `--outlined` | Floating labels, single/multiline, leading/trailing content, supporting text/counters, invalid/read-only/disabled | [Actions](components-actions.md) |
| Toolbars | `[data-qm-toolbar]`, `.qm-toolbar` | Docked, floating and vertical; labeled toolbar with roving keyboard focus | [Navigation](components-navigation.md) |
| Tooltips | `.qm-tooltip`, `[data-qm-rich-tooltip]` | Plain descriptive hint and rich interactive nonmodal help; dismissal and focus contract | [Communication](components-communication.md) |

## Variant boundaries

- **Carousels:** multi-browse uses varied CSS item widths and snapping, rather than Android's continuous mask geometry. Hero and full-screen are reusable layouts with the same navigation contract.
- **Sheets and app bars:** sheet gestures commit an expanded/collapsed state on release; app bar scroll behavior uses discrete collapse states. These are not continuous native nested-scroll or drag-physics implementations.
- **Loading:** the web loading indicator uses MD3 timing/rotation/spring recipes with seven Quiet Material contour shapes. These are not literal Android RoundedPolygon paths. Linear/circular progress uses the documented component-specific recipes; additional Material SDK indicator shapes can be supplied by an adapter.
- **Pickers:** dates represent civil calendar values, not timestamps or scheduling time zones. Typed dates use the documented ISO format. The 48-unit calendar targets occupy a labeled horizontal scroll region when seven columns do not fit; the typed-input alternative remains available outside it. Product-level availability, holidays and timezone rules belong to the application.
- **Menus and search:** keyboard behavior and rendering are supplied; authorization, remote queries, route selection and business actions belong to the application. A menu is not a general-purpose virtualized data grid.
- **Selection color:** the white fill and the graphite container are the only two selection treatments, and the ARIA state plus the glyph, thumb travel or indicator bar carry the meaning alongside them. Where a platform paints its own selection the system rendering wins: `forced-colors: active` restores the native checkbox, radio and switch appearance, and a native `select`, discrete-slider tick or platform picker follows the browser.
- **Forms:** native input semantics remain available. The product owns validation messages, asynchronous validation, submission and required-group policies beyond the documented component contract.

## Native catalog mapping

The [platform matrix](platforms.md) identifies the actual Compose, SwiftUI and Flutter APIs for every family. Native source uses native toolkit controls when available and Quiet compositions where a toolkit does not expose the same component. Native loading indicators share the web's branded contour recipe. Platform-specific compositions and Apple navigation/presentation behavior are labeled in the matrix.

Native API availability is source coverage. Compilation, rendered appearance, keyboard/assistive-technology behavior and device support are validation claims recorded separately. Build the selected adapter on its target SDK before using it in a release.

## Supporting patterns

Avatars, accordions, inline alerts, skeletons, tables, breadcrumbs, pagination, empty states, supporting text and the adaptive application shell remain part of Quiet Material. They are useful compositions, but are not added to the 36-family MD3 denominator. This replaces the earlier ambiguous “27 components” count.

All of them were restyled with the families in the 1.4 migration, and none was left on an older appearance: avatars are #181818 circles, accordions and inline alerts sit at the 24px card radius (the accordion on #101010 with a decorative edge, the default alert on the graphite container), skeletons are static #181818 blocks at the 12px tile radius, tables use muted headers with decorative rules and #080808 zebra rows, breadcrumbs mark the current page in muted text, and pagination marks the current page with the graphite container. Their selected, current and disabled treatments follow the same rules as the MD3 families.

## Validation and maintenance

The repository tests exercise state changes, keyboard paths, input bounds, cancellation, cleanup and motion recipes. They do not establish pixel parity or screen-reader certification. See [validation](validation.md) for the recorded results and remaining browser/native checks, and [accessibility](accessibility.md) for product acceptance requirements.

When adding a variant, update its source, example, public type declarations, component guide and relevant behavior test together. Keep `data-qm-*` hooks and the documented JavaScript methods compatible within a minor release. Preserve the black application canvas, keep the white-fill and graphite-container selection treatments distinct from each other and from focus, and use the canonical semantic tokens for customization rather than literal colors, radii or `z-index` numbers.
