# Quiet Material 1.3

Start with [README](README.md), the [36-family component matrix](docs/md3-components.md), [platforms](docs/platforms.md) and [mobile-first rules](docs/mobile-first.md).

For the responsive web explorer:

```sh
npm ci
npm run dev
```

Open the printed local URL. The Components page includes the expanded interactive catalog. The Platforms page includes the device concepts and native adapter links; the Motion page has seven opt-in single-cycle GIFs and live MD3 transition/spring examples.

Run `npm run check` to rebuild every token output and execute the repository tests. Run `npm run package:preview` to generate `dist/quiet-material-preview.html`, which embeds styles, scripts and visual assets. Documentation links in that standalone file require the full checkout and a matching relative location.

For application integration, retain all of `styles/`, `src/` and `exports/`; the public entry points import the component modules and generated motion values.

Native SDK instructions and pending build/device checks are recorded inside each platform adapter and [validation](docs/validation.md).
