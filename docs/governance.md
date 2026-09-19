# Scope and governance

## v1 scope

Quiet Material is an independent web design system inspired by Material's emphasis on purposeful hierarchy and interaction. It is not an official Google library, a complete implementation of Material components, or a replacement for native Android or iOS SDKs.

The repository owns semantic design tokens, generated CSS variables, framework-independent component styles, a small progressive JavaScript layer, a component workbench and written usage contracts. The approved aesthetic is black pages, charcoal containers, generous rounded shapes, large white typography, restrained blue/mint accents and interaction-driven motion.

The source package is private and unpublished. No public license grant is supplied. Distribution, package publication and licensing require the repository owner's separate decision. The approved concept image is a visual reference; do not assume it is a source of reusable third-party icons, fonts or brand assets.

## Explicit limits

- No React, Angular, Vue, Android or iOS adapter is included in v1.
- No editable Figma library has been created by this repository; the handoff document describes a future mapping.
- No application authentication, persistence, backend, permissions or business logic is included.
- Data grids with virtualization, custom comboboxes, date pickers, drag-and-drop and rich-text editors are outside v1.
- Dark appearance is the supported theme. Light and high-contrast product themes require separate token and interaction review; operating-system forced colors must remain usable.
- Accessibility is a product-level validation responsibility; automated checks do not constitute a conformance certification.

## Contribution decisions

Before adding a component, identify a recurring user need and check whether a native element or existing component solves it. Prefer a documented composition over a new variant. A proposal includes purpose, example content, states, keyboard behavior, narrow-screen behavior and evidence of reuse.

Token changes originate in tokens/quiet-material.tokens.json. Generated files are never the authority. A color change includes contrast evidence for every affected semantic pairing; a shape or spacing change includes compact and long-content examples. Motion changes include a reduced-motion result.

## Versioning

Use semantic versioning for the documented token names, CSS classes, JavaScript exports and interaction contracts. Removing or renaming an API or changing meaning is a major version. Additive compatible features are minor versions. Fixes that preserve the public contract are patch versions. Behavioral accessibility fixes should explain any observable change even when the release is a patch.

Deprecate before removal when practical. Document the replacement, migration example and removal version in the changelog. Do not silently change token semantics while retaining a familiar name.

## Release gate

1. Run the build and tests; inspect generated diffs.
2. Review desktop and compact examples, long text and overflow.
3. Exercise every changed interaction with keyboard and pointer.
4. Verify reduced motion, focus visibility, contrast and relevant assistive-technology behavior.
5. Update docs, changelog and migration notes to match the actual API.
6. Record known limitations with reproducible evidence.
7. Obtain the owner's decision before changing distribution or licensing.

A commit or private repository push is not a package publication or an accessibility certification. Keep release notes specific about what was validated.
