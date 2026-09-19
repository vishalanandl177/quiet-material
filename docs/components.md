# Components

Load styles/quiet-material.css and call initQuietMaterial() once after the document exists. Native HTML supplies most behavior; the optional module enhances tabs, dialog triggers, selectable chips, tooltips and interaction feedback. CSS classes alone do not add semantics or product business logic.

## Catalog and state contracts

The catalog covers 27 primitives and compositions. “Product-owned” means styling or markup is available while application actions must be supplied by the consuming product. Default, hover, pressed, focus-visible and disabled states apply to interactive controls when meaningful.

| Component | Class or hook | States and variants | Keyboard and semantics |
| --- | --- | --- | --- |
| Button | `.qm-button` | Neutral, primary, tonal, ghost, danger; disabled | Native button; Enter/Space; type="button" unless submitting |
| Icon button | `.qm-button--icon` | Same button states | Accessible name required; 48px target |
| Card | `.qm-card` | Default, high, low | Structural container; a card is not inherently clickable |
| Text field | `.qm-field`, `.qm-input` | Default, focused, invalid, disabled, read-only | Persistent label; native text editing; help/error described by ID |
| Textarea | `.qm-textarea` | Field states; vertically resizable | Native multiline editing; do not trap Enter |
| Select | `.qm-select` | Default, focused, invalid, disabled | Native select behavior varies by platform; label it |
| Switch | `.qm-switch` | Checked, unchecked, disabled | Checkbox input with role="switch"; Space changes state |
| Checkbox | `.qm-checkbox` | Checked, unchecked, disabled; native indeterminate when set by product | Space; fieldset and legend for a related group |
| Radio | `.qm-radio` | Selected, unselected, disabled | Shared name; native arrow navigation within group |
| Range slider | `.qm-range` | Value, focused, disabled | Native arrows/Home/End; visible label and understandable value |
| Filter chip | `.qm-chip[aria-pressed]` | Pressed, unpressed, disabled | Button with aria-pressed; module toggles and emits change event |
| Badge | `.qm-badge` | Neutral, info, success, warning, danger | Text status; no tab stop unless part of a separate action |
| Avatar | `.qm-avatar` | Image or initials | Decorative with adjacent name; meaningful image needs alt |
| Tabs | `[data-qm-tabs]`, `.qm-tabs`, `.qm-tab` | Selected, unselected, disabled | One tab stop, arrows, Home/End; labeled tablist and panels |
| Dialog | `.qm-dialog` | Closed/open | Native dialog shown modally; focus inside, Escape, restore focus |
| Bottom sheet | `.qm-dialog--sheet` | Closed/open; modal variant | Same contract as dialog; no drag gesture required |
| Popover menu | `.qm-menu[popover]` | Open/closed | Native popover with ordinary links/buttons; Tab, Escape |
| Tooltip | `.qm-tooltip-wrap`, `.qm-tooltip` | Hover/focus visible, dismissed | Description of a named trigger; Escape dismissal; no interactive child |
| Accordion | `.qm-accordion` | Open/closed | Native details/summary; Enter/Space on summary |
| Inline alert | `.qm-alert` | Info, success, warning, danger | Ordinary text; live role only when a new dynamic message needs announcement |
| Snackbar | `showSnackbar()` | Visible, dismissed; optional timed | Polite announcement; focusable Dismiss; persistent default |
| Progress | `.qm-progress` | Determinate or native indeterminate | Native progress with accessible label; measured value only |
| Skeleton | `.qm-skeleton` | Static | aria-hidden; content region owns aria-busy |
| Table | `.qm-table`, `.qm-table-wrap` | Static rows; product-owned sort/filter | Native table, caption and scoped headers |
| Breadcrumbs | `.qm-breadcrumbs` | Ancestors, current page | Labeled nav, links and aria-current="page" |
| Pagination | `.qm-pagination` | Current, other pages, unavailable directions | Labeled navigation; native links/buttons; application owns page change |
| Supporting text | `.qm-helper`, `.qm-muted` | Help, metadata, field error | Connect to control with aria-describedby when relevant |

Badge and alert tones use `data-tone="info|success|warning|danger"`; omit it for the base style. The catalog does not promise a custom listbox, ARIA application menu, combobox, sortable grid or router.

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

Add qm-dialog--sheet for the bottom-sheet presentation. Escape and native modal focus behavior come from dialog; the enhancement restores focus to the invoker on close. Only one modal is opened at a time. Confirmation here returns a dialog result; it does not save data. The product listens for close and performs its intended action. Avoid nested modals. Provide a visible close or cancel action and follow the [WAI dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) for initial-focus decisions.

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

The popover is a simple collection of native controls. Do not add role="menu" unless implementing its full arrow-key and focus contract. Native popovers require supporting browsers; provide an inline fallback if your browser policy includes older engines. Menu positioning relative to a trigger is product layout work. Tooltip content is supplementary, never the only source of an essential instruction; touch users still need a complete label. Accordion semantics and expanded state are native.

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

The snackbar's actionLabel only renames its dismiss button; it does not wire an Undo action. It renders plain text, announces politely and pauses an optional timeout on hover/focus. Do not use it for essential errors or a sole recovery action. Alerts present from initial page load do not need role="alert". For urgent new errors the application can add an appropriate live announcement.

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

initQuietMaterial(root = document) returns a cleanup function. Calling it repeatedly on the same root returns the existing cleanup rather than duplicating listeners. Clean up before removing an enhanced application root. Prefer a single root; nested independently initialized roots can duplicate event handling. Dynamically inserted tabs need initialization in an appropriately scoped new root or a documented application lifecycle strategy.

The styles apply some global typography and element defaults. Review that boundary before placing the stylesheet into an existing application; a shadow-root or fully scoped CSS adapter is not supplied. Native controls remain useful without JavaScript; enhanced tabs and dialog triggers need the module. Supply a sensible no-script path if those contain essential tasks.
