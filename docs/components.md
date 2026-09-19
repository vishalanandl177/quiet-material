# Components

Load `styles/quiet-material.css` with the entire styles directory intact and call `initQuietMaterial()` once after the document exists. The public module initializes action, navigation, input and communication enhancements. Native HTML supplies input and form semantics; CSS classes alone do not add product business logic.

The [MD3 family matrix](md3-components.md) is the authoritative catalog: 36 official families, their implemented variants, reusable APIs and native mappings. This guide covers the shared contracts and compatible foundational markup. The component-specific guides linked from the matrix provide the expanded variants and mount APIs.

## Catalog and state contracts

The quick reference below includes foundations and supporting patterns as well as MD3 families. It is not a count of official MD3 components. “Product-owned” means styling or markup is available while application actions must be supplied by the consuming product. Default, hover, pressed, focus-visible and disabled states apply to interactive controls when meaningful.

| Component | Class or hook | States and variants | Keyboard and semantics |
| --- | --- | --- | --- |
| Button | `.qm-button` | Filled, tonal, elevated, outlined, text; compatible neutral, primary, ghost, danger aliases | Native button; Enter/Space; type="button" unless submitting |
| Icon button | `.qm-button--icon`, `[data-qm-icon-toggle]` | Filled, tonal, outlined, standard; optional toggle state | Accessible name required; 48px target; toggles expose aria-pressed |
| Card | `.qm-card` | Filled, outlined, elevated; compatible high/low surfaces | Structural container; a card is not inherently clickable |
| Text field | `.qm-text-field`, `[data-qm-text-field]`; compatible `.qm-field`, `.qm-input` | Filled/outlined floating labels; default, focused, invalid, disabled, read-only | Persistent label; native text editing; help/error described by ID |
| Textarea | `.qm-textarea` | Field states; vertically resizable | Native multiline editing; do not trap Enter |
| Select | `.qm-select` | Default, focused, invalid, disabled | Native select behavior varies by platform; label it |
| Switch | `.qm-switch` | Checked, unchecked, disabled | Checkbox input with role="switch"; Space changes state |
| Checkbox | `.qm-checkbox` | Checked, unchecked, disabled; native indeterminate when set by product | Space; fieldset and legend for a related group |
| Radio | `.qm-radio` | Selected, unselected, disabled | Shared name; native arrow navigation within group |
| Slider | `.qm-range`, `[data-qm-slider]`, `[data-qm-range-slider]` | Single or two-thumb range; continuous/discrete steps; disabled | Native arrows/Home/End; both range thumbs labeled; values cannot cross |
| Chips | `.qm-chip--assist`, `--filter`, `--input`, `--suggestion` | Action, selected/unselected, removable; disabled | Native buttons; filter aria-pressed; separate labeled input-chip removal |
| Badge | `.qm-badge`, `.qm-badge--small`, `.qm-badge--large` | Dot/count or semantic tone | Include count meaning in the owning control's accessible name |
| Avatar | `.qm-avatar` | Image or initials | Decorative with adjacent name; meaningful image needs alt |
| Tabs | `[data-qm-tabs]`, `.qm-tabs--primary`, `.qm-tabs--secondary`, `.qm-tabs--scrollable` | Primary/secondary, fixed/scrolling; selected, unselected, disabled | One tab stop, arrows, Home/End; labeled tablist and panels |
| Dialog | `.qm-dialog`, `.qm-dialog--fullscreen` | Basic or full-screen; closed/open | Native dialog shown modally; focus inside, Escape, restore focus |
| Bottom/side sheet | `.qm-sheet`, `.qm-dialog--sheet`, `.qm-dialog--side-sheet` | Standard and modal, expanded/collapsed | Keyboard handle/dismiss controls accompany gestures |
| Menu | `.qm-menu[popover]` or enhanced keyboard menu | Simple native controls or full menu navigation | Use the documented enhanced hooks before adding menu semantics |
| Tooltip | `.qm-tooltip-wrap`, `.qm-tooltip`, `[data-qm-rich-tooltip]` | Plain supplementary hint or rich interactive help | Plain hint uses role=tooltip; interactive rich help uses a nonmodal dialog |
| Accordion | `.qm-accordion` | Open/closed | Native details/summary; Enter/Space on summary |
| Inline alert | `.qm-alert` | Info, success, warning, danger | Ordinary text; live role only when a new dynamic message needs announcement |
| Snackbar | `showSnackbar()` | Visible, action pending/failed, dismissed; optional timed | Polite announcement; separate action and Dismiss; persistent default |
| Progress | `.qm-progress`, `[data-qm-progress]`, `mountProgress()` | Linear/circular; determinate/indeterminate | Accessible progressbar; omit numeric value when indeterminate |
| Skeleton | `.qm-skeleton` | Static | aria-hidden; content region owns aria-busy |
| Table | `.qm-table`, `.qm-table-wrap` | Static rows; product-owned sort/filter | Native table, caption and scoped headers |
| Breadcrumbs | `.qm-breadcrumbs` | Ancestors, current page | Labeled nav, links and aria-current="page" |
| Pagination | `.qm-pagination` | Current, other pages, unavailable directions | Labeled navigation; native links/buttons; application owns page change |
| Supporting text | `.qm-helper`, `.qm-muted` | Help, metadata, field error | Connect to control with aria-describedby when relevant |

Badge and alert tones use `data-tone="info|success|warning|danger"`; omit it for the base style. Search and menu enhancements have their own focus and selection contracts. The system does not supply a sortable data grid, product router or remote search service.

## Buttons and cards

```html
<article class="qm-card">
  <h2>Project settings</h2>
  <p class="qm-muted">Keep your workspace focused.</p>
  <button class="qm-button qm-button--primary" type="button">Save changes</button>
  <button class="qm-button qm-button--ghost" type="button">Cancel</button>
</article>
```

Use a link for navigation and a button for an action. Do not nest links or buttons inside another interactive wrapper. For a disabled button use native disabled. aria-disabled alone communicates a state but does not prevent navigation or arbitrary application handlers; the product must suppress those actions if that pattern is needed. Loading is product-owned: expose a status message and prevent duplicate submission.

## Fields and validation

```html
<div class="qm-field">
  <label for="project-name">Project name</label>
  <input class="qm-input" id="project-name" name="projectName"
    aria-describedby="project-help" required>
  <p class="qm-helper" id="project-help">Use a name your team will recognize.</p>
</div>
<div class="qm-field">
  <label for="summary">Summary</label>
  <textarea class="qm-textarea" id="summary" name="summary" rows="4"></textarea>
</div>
<div class="qm-field">
  <label for="visibility">Visibility</label>
  <select class="qm-select" id="visibility" name="visibility">
    <option value="private">Private</option>
    <option value="team">Team</option>
  </select>
</div>
```

On an established validation error, set aria-invalid="true" and point aria-describedby to specific error text. Remove the invalid state when resolved. Placeholder text is supplementary and never the only label. Native validation can be used; asynchronous validation and server errors belong to the application.

## Selection and range

```html
<label><input class="qm-switch" type="checkbox" role="switch" name="notifications">Notifications</label>
<label><input class="qm-checkbox" type="checkbox" name="weeklyDigest">Weekly digest</label>
<fieldset>
  <legend>Update frequency</legend>
  <label><input class="qm-radio" type="radio" name="frequency" value="daily" checked>Daily</label>
  <label><input class="qm-radio" type="radio" name="frequency" value="weekly">Weekly</label>
</fieldset>
<div class="qm-field">
  <label for="volume">Volume</label>
  <input class="qm-range" id="volume" type="range" min="0" max="100" value="40">
</div>
<button class="qm-chip" type="button" aria-pressed="false">Unread</button>
```

Switches apply immediately. Checkboxes may be part of a submitted form. Keep switch labels stable when state changes. For a range whose numeric value is not self-explanatory, maintain aria-valuetext and a visible value in the application. A chip emits `qm:chip-change` with `event.detail.pressed`; filtering the data remains the application's job.

## Tabs

```html
<div data-qm-tabs>
  <div class="qm-tabs" role="tablist" aria-label="Project views">
    <button class="qm-tab" type="button" role="tab" id="overview-tab"
      aria-controls="overview-panel" aria-selected="true">Overview</button>
    <button class="qm-tab" type="button" role="tab" id="activity-tab"
      aria-controls="activity-panel" aria-selected="false" tabindex="-1">Activity</button>
  </div>
  <section role="tabpanel" id="overview-panel" aria-labelledby="overview-tab" tabindex="0">
    <p>Your project overview.</p>
  </section>
  <section role="tabpanel" id="activity-panel" aria-labelledby="activity-tab" tabindex="0" hidden>
    <p>Your recent activity.</p>
  </section>
</div>
```

Keep panels inside their data-qm-tabs wrapper and IDs unique across the page. The module implements automatic activation and skips disabled tabs. Use it for already available panels. A remote-loading or manual-activation tab pattern requires an extension and its own keyboard tests. Native links are a better choice for separate routes. The interaction contract follows the [WAI tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

## Dialog and sheet

```html
<button class="qm-button" type="button" data-qm-dialog-open="confirm-dialog">Review changes</button>
<dialog class="qm-dialog" id="confirm-dialog" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Save these changes?</h2>
  <p>You can update these preferences again later.</p>
  <button class="qm-button" type="button" data-qm-dialog-close autofocus>Keep editing</button>
  <button class="qm-button qm-button--primary" type="button" data-qm-dialog-close
    data-qm-dialog-result="confirmed">Confirm</button>
</dialog>
```

Add `qm-dialog--sheet` for a modal bottom sheet, `qm-dialog--side-sheet` for a modal side sheet or `qm-dialog--fullscreen` for a full-screen dialog. Standard sheets use `.qm-sheet` in the page layout. Escape and native modal focus behavior come from dialog; the enhancement restores focus to the invoker on close. Only one modal is opened at a time. Confirmation here returns a dialog result; it does not save data. The product listens for close and performs its intended action. Avoid nested modals. Provide a visible close or cancel action and follow the [WAI dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) for initial-focus decisions.

## Menu, tooltip and accordion

```html
<button class="qm-button" type="button" popovertarget="project-actions">Actions</button>
<div class="qm-menu" id="project-actions" popover>
  <a href="/projects">View projects</a>
  <button type="button">Duplicate project</button>
</div>

<span class="qm-tooltip-wrap">
  <button class="qm-button" type="button" aria-describedby="shortcut-tip">Search</button>
  <span class="qm-tooltip" role="tooltip" id="shortcut-tip">Find a project by name</span>
</span>

<details class="qm-accordion">
  <summary>What happens when I archive a project?</summary>
  <p>It leaves the active list and remains available in the archive.</p>
</details>
```

This compatible popover example is a simple collection of native controls. The enhanced menu documented in the family matrix adds positioning, arrow-key navigation and managed focus; use that full markup contract when menu semantics are needed. Native popovers require supporting browsers; provide an inline fallback if your browser policy includes older engines. Plain tooltip content is supplementary, never the only source of an essential instruction; touch users still need a complete label. Rich interactive help uses the dedicated rich-tooltip trigger and dialog contract. Accordion semantics and expanded state are native.

## Feedback and loading

```html
<div class="qm-alert" data-tone="warning">
  <p>Connection interrupted. Your unsent changes are still here.</p>
</div>
<span class="qm-badge" data-tone="success">Connected</span>
<label for="upload-progress">Upload progress</label>
<progress class="qm-progress" id="upload-progress" max="100" value="65">65%</progress>
<div aria-busy="true" aria-label="Loading project details">
  <div class="qm-skeleton" aria-hidden="true"></div>
</div>
```

```js
import { showSnackbar } from './src/quiet-material.js';
const dismiss = showSnackbar('Preferences saved.'); // Persistent until dismissed.
// Optional supplementary timed confirmation; positive durations clamp to >= 5000ms.
showSnackbar('Preview refreshed.', { duration: 6000 });
// Call dismiss() when the original message no longer applies.
```

Add `onAction` and `actionLabel` for a real asynchronous application action, alongside a separate `dismissLabel`. Without `onAction`, the existing `actionLabel`-only dismissal behavior remains compatible. A pending action cannot be submitted twice; a rejection keeps the message available and emits `qm:snackbar-action-error`. New messages replace the previous snackbar. Text is rendered as text, announced politely, and an optional timeout pauses on hover/focus. Do not use snackbars for essential errors or a sole recovery action. Alerts present from initial page load do not need role="alert". For urgent new errors the application can add an appropriate live announcement.

Skeletons are static. Replace them with content when loading ends, and provide a labeled progress indicator when the loading state needs more explanation.

## Data and navigation

```html
<nav class="qm-breadcrumbs" aria-label="Breadcrumb">
  <ol><li><a href="/">Home</a></li><li><span aria-current="page">Projects</span></li></ol>
</nav>
<div class="qm-table-wrap" role="region" aria-label="Projects table" tabindex="0">
  <table class="qm-table">
    <caption>Active projects</caption>
    <thead><tr><th scope="col">Project</th><th scope="col">Status</th></tr></thead>
    <tbody><tr><th scope="row">Workspace</th><td>Active</td></tr></tbody>
  </table>
</div>
<nav class="qm-pagination" aria-label="Project pages">
  <a href="?page=1" aria-current="page" aria-label="Page 1">1</a>
  <a href="?page=2" aria-label="Page 2">2</a>
  <a href="?page=2" aria-label="Next page">Next</a>
</nav>
```

Example URLs are illustrative product routes. Only add a focusable table region when it needs keyboard scrolling. Sorting, pagination, filtering, row selection and virtualized rendering are application features, not behavior provided by these classes. For an unavailable page direction, omit the action or use a disabled button with explanatory context.

## Lifecycle and integration

`initQuietMaterial(root = document)` returns a cleanup function and composes the component initializers. Calling it repeatedly on the same root returns the existing cleanup rather than duplicating listeners. Clean up before removing an enhanced application root. Prefer a single root; nested independently initialized roots can duplicate event handling. Dynamically inserted scanned structures need initialization in an appropriately scoped new root, or cleanup and reinitialization after rendering.

Explicit `mountDatePicker`, `mountTimePicker`, `mountSearch`, `mountProgress` and `mountLoadingIndicator` calls return component handles with a `destroy()` method. Keep those handles and destroy explicitly mounted instances before disposing their host. Declarative picker, search, progress and loading hosts are owned by `initQuietMaterial`; do not mount them again independently. Follow the [getting-started lifecycle](getting-started.md) and the individual API guides.

The styles apply some global typography and element defaults. Review that boundary before placing the stylesheet into an existing application; a shadow-root or fully scoped CSS adapter is not supplied. Native controls remain useful without JavaScript; enhanced tabs and dialog triggers need the module. Supply a sensible no-script path if those contain essential tasks.
