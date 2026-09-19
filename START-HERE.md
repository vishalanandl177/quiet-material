# Quiet Material 1.0

The downloadable package includes a self-contained `quiet-material-preview.html` beside this file. Open it in a modern browser to explore the system without installing anything. Relative documentation and token links work when the whole folder is extracted.

For development, use the source `index.html` through the local server:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4173`. Run `npm run check` to rebuild tokens and execute the test suite.

The generated preview can be recreated with `npm run package:preview`; its build output is `dist/quiet-material-preview.html`. Copy that file to the repository root if you want its relative documentation links to work when opening it directly.

Start with [README](README.md) and [the integration guide](docs/getting-started.md). The browser runtime has no third-party dependencies. Node and jsdom are development/testing tools only.
