# Quiet Material

A mobile-first design system for web and native apps: pure black pages, matte near-black surfaces, one graphite tonal step, large readable type, pill controls, neutral white selection and purposeful interaction motion.

Quiet Material is an independent, customizable implementation of Material Design 3 component families. The black direction, native platform adapters and shared motion foundations follow one design contract. It is not an official Google library. See the [36-family coverage matrix](docs/md3-components.md) for exact variants and implementation status.

![Quiet Material across phone, tablet and desktop](assets/platforms/adaptive-family.png)

Illustrative concept, not an implementation screenshot. It was drawn for an earlier release and predates the 1.4 retune; for what the current build renders, see the [rendered screenshots](docs/screenshots/). [Phone concept](assets/platforms/mobile-focus.png) · [Approved visual reference](assets/reference/black-direction-2026-09.webp) and its [provenance](assets/reference/README.md) · [Historical 1.0-1.3 charcoal reference](assets/approved-concept.png)

## What is included

- 198 canonical design tokens with deterministic CSS, JSON, TypeScript, Kotlin, Swift, and Dart exports.
- The black direction as tokens: pure black canvas, #080808/#101010/#181818 surface steps, a graphite #242424 tonal container, white selection with black content, two distinct boundary roles, three elevation composites, six stacking layers and four state-layer opacities. 1.4 retuned 21 values and added 29 tokens without removing a single public name; blue and mint stay exported for status and as an optional accent. See [the 1.4 migration guide](docs/migration-1.4.md).
- Mobile-first 320px baseline, 600/840/1200 window classes, safe-area support, scalable type, and accessible target sizes.
- Android Compose, Apple SwiftUI, and Flutter source adapters, component catalogs and adaptive examples. Android and Apple library builds and Flutter analysis/widget tests pass on hosted CI machines; no native SDK is installed in this repository’s authoring environment, and application integration and device review remain pending.
- All 16 MD3 duration slots, seven easing families, and standard/expressive spring definitions with pinned official source references.
- Web APIs for container transform, shared axis X/Y/Z, fade through, fade, and spring motion.
- Framework-independent components across all 36 families in the official MD3 catalog, plus supporting patterns such as avatars, tables and empty states.
- Filled/outlined fields; all four chip types; single/range sliders; date/time pickers; menus and searchable results; circular/linear progress and a loading indicator.
- FABs and FAB menus, button groups, split/segmented buttons, adaptive navigation, app bars, toolbars, sheets, dialogs, lists and carousels.
- Progressive interactions with keyboard contracts, reduced motion, explicit cleanup and real snackbar action callbacks.
- A responsive component workbench with a Showcase page of illustrative local examples, platform guides, two additional device concepts, and seven small, opt-in motion GIFs.
- Foundations, accessibility rules, component contracts, motion recipes, patterns and design-tool handoff guidance.
- A dependency-free token build and development-only jsdom tests for DOM behavior.

## Choose a platform

| Stack | Entry point |
| --- | --- |
| Web, any framework | [Web integration](docs/getting-started.md) |
| Android / Compose | [Android adapter](platforms/android/README.md) |
| iOS, iPadOS, macOS / SwiftUI | [Apple Swift package](platforms/apple/README.md) |
| Android, iOS, web, Windows, macOS, Linux / Flutter | [Flutter package](platforms/flutter/README.md) |
| Another toolkit | [Resolved tokens](exports/quiet-material.tokens.resolved.json) and [platform contracts](docs/platforms.md) |

The adapters preserve native semantics and navigation. Platform compatibility is a shared design contract, not a claim that all devices have been tested.

## Screenshots

[`docs/screenshots/`](docs/screenshots/README.md) holds 25 rendered captures of the workbench: the showcase, foundations, components, platforms and motion pages at 320, 390, 768, 1024 and 1440 CSS px. They were captured by `node scripts/capture-screenshots.mjs` in headless Chromium with reduced motion, dark color scheme and `deviceScaleFactor` 1; set `SCALE=2` for retina. Playwright is located on the machine rather than added as a dependency, so `package.json` is unchanged. These captures are Chromium only, at default zoom and default text size, on no real device. [Validation](docs/validation.md) records what they do and do not establish.

## See the motion

The explorer’s Motion page provides Play and Stop controls; it loads static posters by default and honors reduced motion. The files below are single-cycle motion studies, not application recordings.

| Study | Active transition | Download |
| --- | --- | --- |
| Contained ripple | 450 ms growth, 225 ms minimum press, 375 ms release fade | [GIF](assets/motion/ripple.gif) · [Still](assets/motion/ripple.png) |
| Switch | Standard fast spatial/effects springs | [GIF](assets/motion/switch.gif) · [Still](assets/motion/switch.png) |
| Bottom sheet | Standard default spatial/effects springs | [GIF](assets/motion/sheet.gif) · [Still](assets/motion/sheet.png) |
| Container transform | 500 ms enter / 400 ms return, emphasized | [GIF](assets/motion/container-transform.gif) |
| Shared axis | 450 ms, emphasized; X/Y/Z in the live explorer | [GIF](assets/motion/shared-axis.gif) |
| Fade through | 450 ms, emphasized | [GIF](assets/motion/fade-through.gif) |
| Fade | 400 ms enter / 150 ms exit | [GIF](assets/motion/fade.gif) |

See [motion contracts](docs/motion.md) and the [MD3 source audit](docs/md3-motion-audit.md). The shared foundations and web default patterns follow verified MD3 source. Native coverage is explicit: SwiftUI system navigation remains Apple motion, and native adapters do not supply every Material SDK transition variant. Browser/native rendering and device conformance are recorded separately in [validation](docs/validation.md).

## Start the workbench

Use Node.js 22.22.2+ in the 22.x line, 24.15.0+ in the 24.x line, or 26+. The supported engine range is `^22.22.2 || ^24.15.0 || >=26.0.0`. Run `npm ci` to install the development test dependencies. The browser runtime and styles have no dependencies; the token build itself uses only Node's standard library.

```sh
npm ci
npm run build
npm run dev
```

Open the local URL printed by the server. The entry point is index.html. Build generates CSS and all portable/native token outputs from tokens/quiet-material.tokens.json. Do not hand-edit generated files.

```sh
npm test          # Run repository tests.
npm run check    # Rebuild tokens and run tests.
```

## Use in a page

Keep the entire `styles/` directory intact so `quiet-material.css` can import its tokens, base and component stylesheets. Keep `src/` and `exports/` together for module imports. Serve modules over HTTP, not file://.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Quiet Material example</title>
    <link rel="stylesheet" href="./styles/quiet-material.css">
  </head>
  <body>
    <main class="qm-card">
      <h1>Make room for what matters.</h1>
      <p class="qm-muted">A focused workspace with clear actions.</p>
      <button class="qm-button qm-button--primary" id="save" type="button">Save changes</button>
    </main>
    <script type="module">
      import { initQuietMaterial, showSnackbar } from './src/quiet-material.js';
      const cleanup = initQuietMaterial(document);
      document.querySelector('#save').addEventListener('click', () => {
        showSnackbar('Example confirmation.');
      });
      // In an application, call cleanup() before disposing this enhanced root.
    </script>
  </body>
</html>
```

For a local workspace integration that already resolves this package, the exports are:

```js
import '@quiet-material/core/styles.css';
import { initQuietMaterial, showSnackbar } from '@quiet-material/core';
```

This package is private and unpublished; the example is not an instruction to install it from the public npm registry. CSS import support depends on your build tool. The package also exposes `./tokens.css`, `./tokens.json`, `./motion`, `./motion.json`, and the machine-readable `./components.json` family inventory. Product actions, routing, persistence and data loading remain your application's responsibility.

## Use a Material transition

```js
import { transitionView, animateMaterial } from './src/motion.js';

transitionView({
  from: summary,
  to: details,
  pattern: 'container-transform',
  update() {
    summary.hidden = true;
    details.hidden = false;
    // Commit app state and focus here, synchronously.
  },
});

// Springs decorate an already-committed state. Cancellation keeps that state.
indicator.style.translate = '80px';
animateMaterial(indicator, [{translate: '0px'}, {translate: '80px'}], {
  scheme: 'standard', speed: 'fast', role: 'spatial',
});
```

The web helper handles ordinary DOM views. It does not capture live video, canvas content, iframes or shadow DOM. The default container morph uses width fitting and a straight path; specialized SDK variants require a consuming adapter. Reduced motion and unavailable animation support apply the final state immediately.

## Documentation

| Guide | Covers |
| --- | --- |
| [Getting started](docs/getting-started.md) | Commands, imports and integration lifecycle |
| [Platforms](docs/platforms.md) | Android, Apple, Flutter, desktop coverage and native component mappings |
| [Mobile first](docs/mobile-first.md) | Window classes, safe areas, text scaling, touch, keyboard and RTL |
| [Migrating to 1.4](docs/migration-1.4.md) | Every retuned and added token, names whose meaning changed, and what to check in a product |
| [Screenshots](docs/screenshots/README.md) | Rendered captures of five workbench pages at five widths |
| [Motion gallery](docs/motion-gallery.md) | Seven small GIFs, static posters, timings and reproducible generator |
| [Foundations](docs/foundations.md) | Principles, exact colors, type, spacing, shape and token architecture |
| [Components](docs/components.md) | Catalog, states, markup, keyboard contracts and JavaScript lifecycle |
| [MD3 family matrix](docs/md3-components.md) | All 36 official families, concrete variants, APIs and native mappings |
| [Motion](docs/motion.md) | Custom durations/easings, recipes and reduced motion |
| [Accessibility](docs/accessibility.md) | Contrast, focus, semantics, input and acceptance checks |
| [Patterns](docs/patterns.md) | Forms, settings, navigation, errors and notifications |
| [Design-tool handoff](docs/design-handoff.md) | Variable and component mapping for a future design library |
| [Governance](docs/governance.md) | Scope, limitations, versioning and release gates |
| [Contributing](CONTRIBUTING.md) | Local commands and change expectations |
| [Changelog](CHANGELOG.md) | Release history |

## Scope and ownership

The supported theme is dark. Current browser features such as dialog, popover and :has() are used; verify your browser support policy before integrating. The web styles can be used from any framework. Native source adapters combine Quiet components and toolkit controls; platform-specific mappings are documented instead of claiming identical controls on every OS. Android, macOS and iOS simulator builds plus Flutter analysis/tests pass in CI; device and assistive-technology review remain separate. See [validation](docs/validation.md). An editable Figma library, advanced data widgets and backend functionality are not included.

Catalog coverage means each MD3 family has a reusable implementation or documented native composition with an explicit contract. It does not mean every Material SDK option, branded shape, device or assistive technology has identical behavior. The [matrix](docs/md3-components.md) separates component availability from validation evidence.

Accessibility is designed into the contracts, including visible focus, semantic HTML and reduced motion. A consuming product still needs keyboard, screen-reader, zoom and flow testing; this repository does not claim universal accessibility certification.

The source package is private and unpublished. No public license grant is supplied. See [governance](docs/governance.md) before distribution or publication.

## Validation record

See [validation and remaining manual checks](docs/validation.md). The downloadable archive also includes a [quick entry guide](START-HERE.md).
