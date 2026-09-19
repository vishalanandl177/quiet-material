# Getting started

Quiet Material provides a dark web theme, semantic tokens, component styles and optional progressive interactions. It is a private, unpublished source package. Use this checkout directly or integrate it as a local workspace package.

## Run the workbench

Use Node.js 22.22.2+ in the 22.x line, 24.15.0+ in the 24.x line, or 26+. The supported engine range is `^22.22.2 || ^24.15.0 || >=26.0.0`. Run these commands from the repository root. `npm ci` installs the development test dependencies, including jsdom 30.1.0. The browser runtime and styles remain dependency-free; the token build does not need installed packages.

```sh
npm ci
npm run build
npm run dev
```

Build generates styles/tokens.css from tokens/quiet-material.tokens.json. Open the local URL printed by the development server to view index.html.

```sh
npm test
npm run check
```

Test runs the repository tests. Check rebuilds tokens and runs those tests. Review the actual command results; these instructions do not assert that a particular checkout has passed.

## Add styles and interactions

Serve the files over HTTP. Keep styles/quiet-material.css beside styles/tokens.css because the former imports the latter.

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

The module does not initialize on import. Call initQuietMaterial after the markup exists. Native fields, buttons, details and popovers keep their browser behavior. Tabs, dialog trigger attributes, selectable chips, tooltip dismissal and ripples use the enhancement. Product actions, saving, validation, navigation and persistence remain application responsibilities.

For a local workspace that already resolves the package, use its exports:

```js
import '@quiet-material/core/styles.css';
import { initQuietMaterial, showSnackbar } from '@quiet-material/core';
```

Your build tool must support CSS imports. No public npm installation is implied. The package additionally exports ./tokens.css and ./tokens.json, and ships TypeScript declarations for its JavaScript API.

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
showSnackbar('Preview updated.', { duration: 6000 });
// dismiss() removes the first message when it is no longer relevant.
```

A positive timeout is clamped to at least 5000ms and pauses on hover/focus. actionLabel changes only the dismiss-button text; it does not install an Undo handler. Essential feedback needs a persistent location in the product.

For system changes, edit the source token JSON and rebuild. In a consuming product, prefer semantic variables such as --qm-color-surface and --qm-space-6. Keep the approved black background and re-check contrast, focus and reduced motion for any override. The stylesheet includes global typography and element defaults, so review its effects when integrating with existing CSS.

Before shipping a product, review [component contracts](components.md), the [accessibility checks](accessibility.md) and [scope limitations](governance.md). An editable design-tool library and native mobile SDKs are not included.
