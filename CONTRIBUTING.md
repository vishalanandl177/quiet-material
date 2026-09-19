# Contributing to Quiet Material

Keep the system simple, predictable and consistent with the approved visual direction. Read [foundations](docs/foundations.md), [accessibility](docs/accessibility.md) and [governance](docs/governance.md) before changing a public contract.

## Local work

Use Node.js 22.22.2+ in the 22.x line, 24.15.0+ in the 24.x line, or 26+. The supported engine range is `^22.22.2 || ^24.15.0 || >=26.0.0`. Run `npm ci` before development or testing. DOM behavior tests use the development-only dependency jsdom 30.1.0; the browser runtime and styles remain dependency-free. The token build uses only Node's standard library.

```sh
npm ci
npm run build
npm run dev
npm test
npm run check
```

The development command serves the workbench; use the URL printed by the server. Build regenerates CSS variables from tokens/quiet-material.tokens.json. Check runs build and tests. These are contributor instructions, not a statement that a particular checkout passed them.

## Change checklist

- State the user problem and why the existing primitive or a native element is insufficient.
- Update source tokens rather than generated variables.
- Keep public CSS classes and data attributes aligned with the component documentation.
- Cover interaction states, keyboard input, focus, narrow layouts and reduced motion.
- Use meaningful tests for behavioral or token regressions.
- Update the changelog and include a migration note for breaking changes.
- Avoid runtime dependencies, remote fonts or tracking unless the owner has agreed to the need.

Never commit credentials, personal production data or private example content. Use invented sample data. Report a security-sensitive issue privately to the repository owner rather than placing details in a public issue.

No public license grant is provided by this private, unpublished project. Contributions and distribution are subject to the owner's agreement.
