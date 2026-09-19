# Scope and governance

## v1.3 scope

Quiet Material is an independent mobile-first implementation of Material Design 3 component families, using the approved black-and-charcoal visual language. It is not an official Google library or a replacement for native Android or iOS SDKs. The [family matrix](md3-components.md) names all 36 official catalog families and records the implementation and variants supplied here.

The repository owns semantic design tokens, generated CSS and native values, framework-independent component styles, progressive JavaScript behaviors, native toolkit adapters, a component workbench and written usage contracts. The approved aesthetic is black pages, charcoal containers, generous rounded shapes, large white typography, restrained blue/mint accents and interaction-driven motion.

Motion foundations now include MD3’s full curve/duration vocabulary, standard and expressive spring parameters, and the four web transition families. Pinned source versions and implementation/validation boundaries are recorded in [the MD3 audit](md3-motion-audit.md). Native system-owned transitions and unimplemented SDK variants are not represented as identical cross-platform motion.

The source package is private and unpublished. No public license grant is supplied. Distribution, package publication and licensing require the repository owner's separate decision. The approved concept image is a visual reference; do not assume it is a source of reusable third-party icons, fonts or brand assets.

## Coverage and product scope

Family coverage, variant coverage and validation are separate claims. A component counts as implemented only when reusable source and its interaction contract exist; a screenshot, CSS name or future toolkit recommendation does not count. A documented composition can cover a family when it implements that family's purpose, state and accessibility contract. Each matrix row identifies such compositions and fallbacks. Neither a passing DOM test nor a native source file establishes device-level correctness.

The 36-family list tracks the official MD3 catalog reviewed for this release. Update both the [documentation matrix](md3-components.md) and [machine-readable inventory](../exports/quiet-material.components.json) when Material adds or changes a family. Advanced SDK options and exact expressive geometry remain explicit variant-level work; they must not be hidden behind a blanket “every variant is complete” statement.

## Explicit limits

- Web styles are framework-independent; dedicated React/Angular/Vue wrapper packages are not included.
- Android Compose, Apple SwiftUI and Flutter source adapters and component catalogs are included. Android and Apple SDK builds plus Flutter analysis/tests passed in CI; device review remains pending. Stock toolkit controls, branded compositions and platform-specific fallbacks are identified in [platform coverage](platforms.md).
- No editable Figma library has been created by this repository; the handoff document describes a future mapping.
- No application authentication, persistence, backend, permissions or business logic is included.
- Product-scale data grids with virtualization, general drag-and-drop and rich-text editors are outside this component catalog. Date/time pickers, search and keyboard menus are included; data services and product validation remain application-owned.
- Dark appearance is the supported theme. Light and high-contrast product themes require separate token and interaction review; operating-system forced colors must remain usable.
- Accessibility is a product-level validation responsibility; automated checks do not constitute a conformance certification.

## Contribution decisions

Before adding a component, identify a recurring user need and check whether a native element or existing component solves it. Prefer a documented composition over a new variant. A proposal includes purpose, example content, states, keyboard behavior, narrow-screen behavior and evidence of reuse.

Token changes originate in tokens/quiet-material.tokens.json. Generated files are never the authority. A color change includes contrast evidence for every affected semantic pairing; a shape or spacing change includes compact and long-content examples. Motion changes include a reduced-motion result.

## Versioning

Use semantic versioning for the documented token names, CSS classes, JavaScript exports and interaction contracts. Removing or renaming an API or changing meaning is a major version. Additive compatible features are minor versions. Fixes that preserve the public contract are patch versions. Behavioral accessibility fixes should explain any observable change even when the release is a patch.

Deprecate before removal when practical. Document the replacement, migration example and removal version in the changelog. Do not silently change token semantics while retaining a familiar name.

## Release gate

1. Run the build and tests; inspect generated diffs and the family matrix against the source.
2. Review desktop and compact examples, long text and overflow.
3. Exercise every changed interaction with keyboard and pointer.
4. Verify reduced motion, focus visibility, contrast and relevant assistive-technology behavior.
5. Update docs, changelog, native mappings and migration notes to match the actual API.
6. Record known limitations with reproducible evidence.
7. Obtain the owner's decision before changing distribution or licensing.

A commit or private repository push is not a package publication or an accessibility certification. Keep release notes specific about what was validated.
