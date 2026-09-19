# Getting started

Quiet Material provides a black, mobile-first theme, semantic tokens, reusable components across the 36 MD3 catalog families, and progressive interactions. It is a private, unpublished source package. Use this checkout directly or integrate it as a local workspace package. The [family matrix](md3-components.md) records the exact variants and platform implementations.

The web layer is framework-independent: generated CSS custom properties, plain `.qm-*` classes on semantic HTML, and progressive JavaScript that enhances markup which already exists. There is no React, Angular or Vue component package here, and none is required. Use the styles with static HTML, a template engine, a static-site generator or any framework's rendered output; the only integration contract is the class names, the documented `data-qm-*` hooks and one call to `initQuietMaterial`. If you are upgrading an existing product from 1.3, read [the 1.4 migration guide](migration-1.4.md) before you rebuild, because seven color roles keep their names and change meaning.

## Run the workbench

Use Node.js 22.22.2+ in the 22.x line, 24.15.0+ in the 24.x line, or 26+. The supported engine range is `^22.22.2 || ^24.15.0 || >=26.0.0`. Run these commands from the repository root. `npm ci` installs the development test dependencies, including jsdom 30.1.0. The browser runtime and styles remain dependency-free; the token build does not need installed packages.

```sh
npm ci
npm run build
npm run dev
```

Build generates styles/tokens.css from tokens/quiet-material.tokens.json. Open the local URL printed by the development server to view index.html.

The workbench is one page with sections for foundations, the component library, motion, platforms, patterns, accessibility and, new in this release, Showcase. Showcase assembles five illustrative examples out of the same components as the catalog, so you can judge the black direction on a whole layout instead of on single controls: a sparse start screen, a tile grid with live filtering, a settings list, a media surface and a dialog flow. Everything there is static demo content inside the page, with no launcher, no live device, no accounts, no network requests and no reading of installed applications. Its layout-only stylesheet, `showcase.css`, sits beside `index.html` with `demo.css`; both are workbench styles and neither is part of the distributed `styles/` layer.

```sh
npm test
npm run check
```

Test runs the repository tests. Check rebuilds tokens and runs those tests. Review the actual command results; these instructions do not assert that a particular checkout has passed.

## Add styles and interactions

Serve the files over HTTP. Keep the entire `styles/` directory together: `quiet-material.css` imports generated tokens, base styles, and the action, navigation, input and communication stylesheets. Also retain `src/` and `exports/`; JavaScript modules import their local helpers and generated motion data.

```html
<link rel="stylesheet" href="./styles/quiet-material.css">

<main>
  <article class="qm-card">
    <h1>Your workspace</h1>
    <p class="qm-muted">Keep your next action clear.</p>
    <button class="qm-button qm-button--primary" type="button" id="preview-save">
      Preview confirmation
    </button>
  </article>
</main>

<script type="module">
  import { initQuietMaterial, showSnackbar } from './src/quiet-material.js';

  const cleanup = initQuietMaterial(document);
  document.querySelector('#preview-save').addEventListener('click', () => {
    showSnackbar('This is an example confirmation.');
  });
  // Call cleanup() before disposing the enhanced root in an application.
</script>
```

The module does not initialize on import. Call `initQuietMaterial` after the markup exists. It initializes tabs, dialog triggers, action groups, navigation, sheets, carousels, menus, tooltips, progress, declarative pickers/search and interaction feedback. Native fields, buttons and details keep their browser semantics. Date/time pickers and search also expose the explicit mount APIs described below. Product actions, saving, server validation, routing and persistence remain application responsibilities.

For a local workspace that already resolves the package, use its exports:

```js
import '@quiet-material/core/styles.css';
import { initQuietMaterial, showSnackbar } from '@quiet-material/core';
```

Your build tool must support CSS imports. No public npm installation is implied. The package additionally exports `./tokens.css`, `./tokens.json` and the machine-readable `./components.json` family inventory, and ships TypeScript declarations for its JavaScript API.

## Initialization lifecycle

Use one root for a static page, normally document. A repeated call for the same root returns the existing cleanup function. Cleanup is safe to call more than once. Avoid initializing overlapping roots because their delegated listeners can handle the same event twice.

For a mounted application view, initialize the view element after rendering. Before replacing or removing it, call its cleanup and remove any application event listeners you added. Initialize the replacement view after its markup exists. Calling initQuietMaterial again on an already initialized root does not re-scan newly added tabs; clean up and reinitialize that root after replacing tab structures, or use separate non-overlapping view roots. Close any active modal before disposing the view.

```js
const view = document.querySelector('#settings-view');
const cleanup = initQuietMaterial(view);

// Later, before replacing the view:
cleanup();
view.remove();
```

The import is safe without a DOM, but calling these functions requires an actual browser document. showSnackbar can accept a document option when working with a specific owning document.

## Feedback and customization

```js
const dismiss = showSnackbar('Settings saved.'); // Persistent by default.
// Call dismiss() when that message no longer applies.

showSnackbar('Item archived.', {
  actionLabel: 'Undo',
  onAction: async () => restoreArchivedItem(),
  dismissLabel: 'Dismiss',
});
```

A positive timeout is clamped to at least 5000ms and pauses on hover/focus. Only the latest snackbar is visible. `onAction` supplies a real application callback with a separate Dismiss action; successful completion dismisses the message. A rejected callback leaves it available and emits `qm:snackbar-action-error` so the application can display a specific recovery message. The example's `restoreArchivedItem` is an application function. Essential feedback needs a persistent location in the product.

For system changes, edit the source token JSON and rebuild. In a consuming product, prefer semantic variables such as --qm-color-surface and --qm-space-6. Keep the approved black background and re-check contrast, focus and reduced motion for any override. Note the 1.4 meanings before you override anything: `--qm-color-primary`, `--qm-color-on-primary`, `--qm-color-primary-container`, `--qm-color-on-primary-container`, `--qm-color-secondary`, `--qm-color-on-secondary` and `--qm-color-focus` kept their names and are now neutral, `--qm-radius-card` is 24px, and a product that wants the former blue or mint accent must reference `--qm-color-palette-blue` or `--qm-color-palette-mint` explicitly. The stylesheet includes global typography and element defaults, so review its effects when integrating with existing CSS.

Before shipping a product, review [component contracts](components.md), the [accessibility checks](accessibility.md) and [scope](governance.md). An editable design-tool library and native platform SDK installations are not included.

## Mount a composed component

The main module exports `mountDatePicker`, `mountTimePicker`, `mountSearch`, `mountProgress`, `setProgress` and `mountLoadingIndicator`. Use explicit mounts for callback/options control, or use the documented declarative hooks with `initQuietMaterial`.

```js
import { initQuietMaterial, mountDatePicker } from './src/quiet-material.js';

const root = document.querySelector('#booking-view');
const cleanup = initQuietMaterial(root);
const picker = mountDatePicker(root.querySelector('#travel-date'), {
  label: 'Travel date',
});

// Before replacing the view, destroy explicit mounts and clean up enhancements.
picker.destroy();
cleanup();
```

The example expects an ordinary empty element with `id="travel-date"`, without a declarative mount attribute. See the component guides linked from [the family matrix](md3-components.md) for options, change events and examples. Keep one owner for each component instance; do not explicitly mount a host that is already owned by a declaratively initialized root. Listen for selection events to update application state instead of reading decorative animation frames.

## Native applications

For native toolkits, use the [platform adapters and coverage matrix](platforms.md). `npm run build` regenerates all six token formats from the same source. [Mobile-first rules](mobile-first.md) apply to available window size, not device names.

## MD3 motion API

Import `transitionView`, `animateMaterial`, `cancelMotion` and `motionReduced` from `src/motion.js` (or the package’s `./motion` export). See [motion contracts](motion.md) and the README example. Keep `exports/quiet-material.motion.js` beside the source tree; it is generated runtime data, not a remote dependency. `closeQuietDialog` from the core module closes semantic state immediately and animates a decorative snapshot; use it for programmatic dismissal where an MD3 fade is appropriate.
