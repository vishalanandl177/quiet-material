# Quiet Material 1.4

Start with [README](README.md), the [1.4 migration guide](docs/migration-1.4.md), the [36-family component matrix](docs/md3-components.md), [platforms](docs/platforms.md) and [mobile-first rules](docs/mobile-first.md). 1.4 is a visual migration of the existing system to the approved black direction: 198 tokens, neutral white selection, a graphite current-location container, and no change to the component APIs, exports or motion. `package.json` still reads version 1.3.0 until the owner cuts the release.

For the responsive web explorer:

```sh
npm ci
npm run dev
```

Open the printed local URL. The Showcase page assembles five illustrative local examples from the same catalog components. The Components page includes the expanded interactive catalog. The Platforms page includes the device concepts and native adapter links; the Motion page has seven opt-in single-cycle GIFs and live MD3 transition/spring examples.

Run `npm run check` to rebuild every token output and execute the repository tests; it passes 117 of 117 on Node 22.22.2. Rendered captures of five pages at five widths are in [docs/screenshots/](docs/screenshots/README.md). Run `npm run package:preview` to generate `dist/quiet-material-preview.html`, which embeds styles, scripts and visual assets; that preview was last verified for 1.3 and was not re-checked for this release. Documentation links in that standalone file require the full checkout and a matching relative location.

For application integration, retain all of `styles/`, `src/` and `exports/`; the public entry points import the component modules and generated motion values.

Native SDK instructions, hosted CI results and remaining application-host/device checks are recorded inside each platform adapter and [validation](docs/validation.md). No Android, Apple or Flutter SDK runs in this repository's authoring environment, so those builds are CI evidence rather than local evidence, and no device, screen-reader or non-Chromium browser session was performed.
