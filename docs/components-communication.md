# Communication components

The public stylesheet includes these variants. `initQuietMaterial(root)` mounts hosts with `data-qm-progress` / `data-qm-loading-indicator` and binds rich tooltip controls. Give every progress host a meaningful accessible label. Unmount through the owning initializer's cleanup.

## Progress and loading

```html
<div data-qm-progress="circular" data-value="65" data-max="100" aria-label="Upload progress"></div>
<div data-qm-progress="linear" aria-label="Synchronizing"></div>
<div data-qm-loading-indicator class="qm-loading-indicator--contained" aria-label="Loading recent files"></div>
```

```js
import {mountProgress, setProgress} from './src/quiet-material.js';
// Use a factory OR declarative initialization for the same host.
const progress = mountProgress(host, {circular: true, value: 0, max: 100});
progress.setValue(65);
progress.setValue(null); // Indeterminate: removes aria-valuenow.
progress.destroy();
// A declaratively mounted host can instead be updated directly:
setProgress(document.querySelector('[data-qm-progress]'), 80);
```

Circular and linear indicators support determinate and indeterminate states. Values clamp to [0, max]; invalid maxima normalize to 100 and nonfinite values become indeterminate. Progress state and ARIA change together. The decorative SVG does not duplicate the accessible name. Repeating motion pauses for hidden documents, invisible hosts and reduced-motion preferences; reduced motion leaves a static indicator with the same semantics. Hide or remove a loader when work finishes. Do not invent progress percentages for unknown-duration work.

The circular advance recipe uses a 5400ms cycle with four 667ms expansion/collapse sequences and `cubic-bezier(.4,0,.2,1)`. The linear disjoint recipe uses a 1800ms cycle with separate head/tail timings and interpolators. The loading indicator advances its target every 650ms with stiffness 200, damping ratio .6, and the 50-degree constant plus 90-degree spring-driven rotation recipe. Its seven contours are Quiet Material brand geometry, not literal Android RoundedPolygon paths. These component-specific recipes do not substitute arbitrary durations for the baseline/spring tokens used by interactive transitions.

Reference implementations: [circular advance](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/progressindicator/CircularIndeterminateAdvanceAnimatorDelegate.java), [linear disjoint](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/progressindicator/LinearIndeterminateDisjointAnimatorDelegate.java), [loading animation](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/loadingindicator/LoadingIndicatorAnimatorDelegate.java). These are primary-source timing references; Quiet's web renderer is an independent implementation.

## Notification badges

```html
<span class="qm-badge-anchor">
  <button class="qm-button qm-button--icon" type="button" aria-label="Inbox, 3 unread messages">…</button>
  <span class="qm-badge qm-badge--large" aria-hidden="true">3</span>
</span>
```

Use `qm-badge--small` for a dot without a visible count; `qm-badge--large` for a count. Put the count/status in the owning control's accessible name, then hide the visual badge from assistive technology. Truncate large visible counts in product state, for example 999+, while keeping an understandable accessible label. Existing tonal status pills remain available through `qm-badge[data-tone]`.

## Plain and rich tooltips

Plain tooltips retain the `.qm-tooltip-wrap` / `.qm-tooltip[role=tooltip]` pattern. They are descriptions and contain no interactive children. Rich tooltips can include a title, explanation and an action, so they use a named **nonmodal dialog** on the web and open with an explicit click/tap:

```html
<button class="qm-button" type="button" data-qm-rich-tooltip="storage-help"
  aria-controls="storage-help" aria-expanded="false">Storage help</button>
<div class="qm-rich-tooltip" id="storage-help" role="dialog" aria-labelledby="storage-title" hidden>
  <h3 id="storage-title">Storage space</h3>
  <p>Archived files remain available in your workspace.</p>
  <button class="qm-button qm-button--text" type="button" data-qm-rich-tooltip-close>Got it</button>
</div>
```

Opening focuses the panel. Escape or its close control dismisses and restores trigger focus. Moving focus elsewhere or clicking outside dismisses without moving focus back. Positioning accounts for viewport bounds and RTL; the panel has an internal overflow region on small screens. Never hide essential instructions exclusively in a tooltip.

## Snackbar actions

```js
showSnackbar('Item archived.', {
  actionLabel: 'Undo',
  onAction: async () => restoreItem(),
  dismissLabel: 'Dismiss',
});
```

Only one snackbar is visible; a newer notification replaces the previous one. The action is separate from dismiss, is protected against duplicate clicks, and dismisses after successful completion. On rejection the snackbar remains available, announces an error and emits `qm:snackbar-action-error` with `detail.error`. Override the announcement with `actionErrorMessage`. Optional timeouts pause during hover, focus or an in-flight action. Feedback never steals focus. Omit duration for persistent feedback; positive durations clamp to at least five seconds. Product-level reliable notification queues can be implemented above this API.
