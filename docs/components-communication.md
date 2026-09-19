# Communication components

Communication defaults to neutral: white #f4f4f4 for the part that moves or matters, #181818 for the track or panel behind it, #242424 with white content where a container is wanted, and semantic color only where an actual state earns it. The public stylesheet includes these variants. `initQuietMaterial(root)` mounts hosts with `data-qm-progress` / `data-qm-loading-indicator` and binds rich tooltip controls. Give every progress host a meaningful accessible label. Unmount through the owning initializer's cleanup.

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

Both progress forms are white on #181818: the linear indicator is a white bar on a #181818 track at a pill radius, and the circular indicator strokes white over a #181818 track ring with round caps. The morphing loading indicator draws its contour in white as well, and `qm-loading-indicator--contained` puts that white contour inside a #242424 graphite pill. Under `forced-colors: active` the indicators switch to the system `Highlight` over `CanvasText`. Progress is neutral by default; if a product needs to show a failed or completed state, it should say so in text or with a semantic badge rather than recoloring the bar.

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

Anchored badges are neutral: the count badge is the #242424 graphite container with white content, and the dot, which holds no text to invert, is drawn as a solid white 6px mark so it still reads against the control it sits on. Color is never the meaning here: the semantic tones are the purposeful exception, keeping #86d9ae success, #f3d17d warning and #ffb4ab danger over their containers, while `info` uses the same graphite pairing. Use `qm-badge--small` for a dot without a visible count; `qm-badge--large` for a count. Put the count/status in the owning control's accessible name, then hide the visual badge from assistive technology. Truncate large visible counts in product state, for example 999+, while keeping an understandable accessible label. Existing tonal status pills remain available through `qm-badge[data-tone]`.

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

A plain tooltip inverts the page: a #f4f4f4 surface with #000000 text at the 12px tile radius, sized to a short hint. A rich tooltip is instead a #181818 panel up to 320px wide at the 24px card radius, with a decorative 1px #242424 edge, the level-2 shadow and the popover layer, matching the menus and dropdown lists it sits beside. Opening focuses the panel. Escape or its close control dismisses and restores trigger focus. Moving focus elsewhere or clicking outside dismisses without moving focus back. Positioning accounts for viewport bounds and RTL; the panel has an internal overflow region on small screens. Never hide essential instructions exclusively in a tooltip.

## Snackbar actions

```js
showSnackbar('Item archived.', {
  actionLabel: 'Undo',
  onAction: async () => restoreItem(),
  dismissLabel: 'Dismiss',
});
```

A snackbar is a #181818 surface at the 24px card radius with a decorative 1px #242424 edge and the level-2 shadow, held on the overlay layer above ordinary content and inside the safe area. Its action label is white in the bold label weight, so it separates from the message by weight and type rather than by an accent color, and it dims to #777777 when disabled; the dismiss control keeps its own 48px target. Only one snackbar is visible; a newer notification replaces the previous one. The action is separate from dismiss, is protected against duplicate clicks, and dismisses after successful completion. On rejection the snackbar remains available, announces an error and emits `qm:snackbar-action-error` with `detail.error`. Override the announcement with `actionErrorMessage`. Optional timeouts pause during hover, focus or an in-flight action. Feedback never steals focus. Omit duration for persistent feedback; positive durations clamp to at least five seconds. Product-level reliable notification queues can be implemented above this API.
