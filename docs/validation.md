# Validation record — initial version

## Automated checks

The initial implementation was checked with the repository's Node test suite:

- Token generation is deterministic and the generated CSS matches the typed source.
- Text, status/action text, focus indicators and control boundaries meet the tested contrast thresholds on their supported surfaces.
- DOM interaction tests cover tab focus and selection, RTL/vertical navigation, disabled-tab skipping, repeated initialization, cleanup, chips, tooltip ownership, safe snackbar text and dismissal, ripple cleanup, and system/local reduced-motion preferences.
- HTML structure checks cover unique IDs, ARIA references, control labels, local links and enhancement targets.

The development server was smoke-tested for HTML, CSS, JavaScript, documentation and JSON responses. Internal Git files returned 404. JavaScript syntax and self-contained preview generation were checked.

## Remaining manual checks

Visual browser review was not completed in the creation environment because its cloud browser blocks local-file preview URLs. DOM tests do not verify layout, rendering, native modal focus containment, native popovers, screen readers or actual reduced-motion rendering.

Before adopting the system in a production product, run the manual checklist in [accessibility](accessibility.md), including compact/expanded viewport layouts, 200% text enlargement, 400% zoom, native dialog Escape/focus restoration, popover behavior, forced colors and screen-reader announcements. This record is not an accessibility-conformance certification.

The GitHub Actions workflow is provided but is not represented as a successful remote run until the repository has been pushed and that run has completed.
