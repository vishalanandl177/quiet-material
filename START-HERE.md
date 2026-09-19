# Quiet Material 1.1

Start with [README](README.md), [platforms](docs/platforms.md) and [mobile-first rules](docs/mobile-first.md).

For the responsive web explorer:

```sh
npm ci
npm run dev
```

Open the printed local URL. The Platforms page includes the device concepts and native starter links; the Motion page has three opt-in single-cycle GIFs.

Run `npm run check` to rebuild every token output and execute the repository tests. Run `npm run package:preview` to generate `dist/quiet-material-preview.html`, which embeds styles, scripts and visual assets. Documentation links in that standalone file require the full checkout and a matching relative location.

Native SDK instructions and pending build/device checks are recorded inside each platform starter and [validation](docs/validation.md).
