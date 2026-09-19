# Navigation and containment

The web package supplies reusable app bars, adaptive navigation, drawers, toolbars, primary and secondary tabs, lists, dividers, carousels, standard and modal sheets, and fullscreen dialogs. Components use the existing black canvas, the near-black #080808 / #101010 / #181818 surface steps, #242424 for the tonal step and decorative separation, and the shared MD3 motion tokens. The current destination and the current row use the graphite container with white content; the white fill stays reserved for a single chosen option.

`initNavigationComponents(root)` is the optional initializer in `src/components-navigation.js`. It returns an idempotent cleanup function. Initialize a stable document or subtree once; clean up and reinitialize when replacing a component's structure or slide collection. Include `styles/components-navigation.css` together with the core stylesheet. The package initializer calls this module when using the integrated entry point.

## App bars

```html
<header class="qm-app-bar qm-app-bar--large qm-app-bar--sticky"
  data-qm-app-bar data-qm-scroll-target="page-scroll"
  data-qm-scroll-behavior="exit-until-collapsed">
  <button class="qm-button qm-button--icon" aria-label="Go back">←</button>
  <h1 class="qm-app-bar__title">Your library</h1>
  <div class="qm-app-bar__actions">
    <button class="qm-button qm-button--icon" aria-label="More actions">⋯</button>
  </div>
</header>
<main id="page-scroll">…</main>
```

A top app bar melts into the page: it fills with the #000000 canvas and white content and draws no edge at rest. A decorative 1px #242424 bottom edge appears only once content has scrolled under it, and the bottom app bar keeps the same decorative edge along its top, so the separation never pretends to be a control boundary. Variants: `qm-app-bar--small` (default), `--center`, `--medium`, `--large`, and `--bottom`. Bottom bars can contain action buttons and a FAB; they are distinct from destination navigation. `--sticky` opts into sticky positioning. The app must give a named scroll target an actual scrollable height/overflow, or omit `data-qm-scroll-target` to observe the window.

`data-qm-scroll-behavior` accepts `pinned` (default), `enter-always` (collapse while scrolling down; expand while scrolling up), and `exit-until-collapsed` (collapse beyond 64 logical pixels; expand near the top). Collapse is a discrete state transition using the standard spatial spring; this is not a pixel-by-pixel port of Android nested-scroll physics. The initializer sets `data-qm-scrolled` and `data-qm-collapsed`; it does not clone titles or controls.

## Navigation bar, rail and drawer

```html
<div class="qm-adaptive-shell">
  <nav class="qm-navigation" data-qm-navigation="adaptive" aria-label="Main destinations">
    <a class="qm-navigation__item" href="#inbox" data-qm-nav-target="inbox" aria-current="page">
      <span class="qm-navigation__icon" aria-hidden="true">▣</span><span>Inbox</span>
    </a>
    <a class="qm-navigation__item" href="#saved" data-qm-nav-target="saved">
      <span class="qm-navigation__icon" aria-hidden="true">☆</span><span>Saved</span>
    </a>
  </nav>
  <main>
    <section id="inbox" data-qm-nav-panel>Inbox content</section>
    <section id="saved" data-qm-nav-panel hidden>Saved content</section>
  </main>
</div>
```

Destinations rest on the #000000 canvas with #b7b7b7 labels; hover adds an 8% white state layer, and a disabled destination shows #777777. The current destination is the current-location treatment, never the white fill: in the bar and rail its icon sits in a #242424 graphite pill 56px wide while the label turns #f4f4f4 in the bold weight, and in a drawer, or the expanded adaptive layout from 1200px, the whole row takes the graphite container with white content. `aria-current="page"` carries the same state for assistive technology, and forced-colors mode marks it with a system `Highlight` outline. An in-layout drawer rounds its outer corners to the 24px card radius.

The same navigation tree becomes a bottom bar below 600px, a rail from 600px, and a drawer from 1200px. Focus and current destination remain on the same DOM elements. `qm-adaptive-shell` positions navigation and content; use the navigation standalone for an in-flow specimen. Explicit `qm-navigation--bar`, `--rail`, and `--drawer` variants do not change automatically. `qm-navigation__headline` supplies an optional drawer section heading.

The initializer emits cancelable `qm:navigate` with `{ destination, item }`. With `data-qm-nav-target`, it resolves the target ID within the initializer root, applies `aria-current="page"`, hides other referenced panels, and performs a fade-through. It does not move focus away from the activated destination. Callers can prevent the event and own routing. Ordinary links keep browser navigation and modifier-click behavior; the router must update their current state after navigation. Buttons and links with `aria-disabled="true"` are blocked. Only one item may carry `aria-current` within a navigation instance.

`qm:navigation-layout` emits `{ layout: 'bar' | 'rail' | 'drawer' }` when the adaptive window class changes. Route changes, history, page titles and focus on route replacement are application responsibilities.

A modal drawer uses the existing native dialog controller:

```html
<button class="qm-button" data-qm-dialog-open="main-drawer">Open navigation</button>
<dialog id="main-drawer" class="qm-dialog qm-dialog--drawer" aria-labelledby="drawer-title">
  <h2 id="drawer-title">Workspace</h2>
  <button class="qm-button" data-qm-dialog-close>Close</button>
  <nav class="qm-navigation qm-navigation--drawer" data-qm-navigation="drawer" aria-label="Workspace">
    <a class="qm-navigation__item" href="/inbox" aria-current="page">Inbox</a>
    <a class="qm-navigation__item" href="/saved">Saved</a>
  </nav>
</dialog>
```

Keep one navigation landmark active for an adaptive destination set. Do not combine a visible persistent drawer and an identical modal drawer without hiding/inerting the inactive tree. A drawer link that changes routes should close the dialog in the application router after navigation succeeds.

## Toolbars

```html
<div class="qm-toolbar qm-toolbar--floating" data-qm-toolbar role="toolbar" aria-label="Document actions">
  <button class="qm-button qm-button--icon" aria-label="Undo">↶</button>
  <button class="qm-button qm-button--icon" aria-label="Redo" disabled>↷</button>
  <button class="qm-button" aria-pressed="false">Bold</button>
</div>
```

A default toolbar is a #101010 surface at the 16px control radius; `--floating` lifts it onto #181818 as a pill with the level-2 shadow, and `--docked` spans the full width with square corners. The buttons inside keep their own variants and state layers. Default, `--floating`, `--docked`, and `--vertical` appearances are available. Vertical toolbars must also use `aria-orientation="vertical"`. Arrow keys move focus, skip disabled/hidden controls and reverse in RTL; Home/End select boundary items. Native buttons retain Enter/Space activation. Toolbar buttons use a single roving tab stop. Inputs can be placed in a toolbar but keep their native keyboard behavior. Stateful actions remain application-owned.

## Tabs, lists and dividers

Add `qm-tabs--primary` or `qm-tabs--secondary` to an existing `.qm-tabs[role="tablist"]` within `[data-qm-tabs]`. Add `qm-tabs--scrollable` for overflow instead of wrapping. Existing tab IDs, `aria-controls`, `aria-labelledby`, `aria-selected` and panel associations are unchanged; core keyboard activation and shared-axis transitions remain active. These two variants keep a transparent tab over a decorative 1px #242424 baseline instead of the pill rail: the selected tab raises its label to #f4f4f4 and draws its indicator in white, 3px and pill-capped under a primary tab, 2px and full-width under a secondary tab. Unselected labels stay #b7b7b7 and a disabled tab is #777777. Primary tabs support an icon and label; secondary tabs use a full-width indicator. Browser focus scrolling reveals offscreen tabs.

```html
<ul class="qm-list">
  <li class="qm-list__item qm-list__item--two-line">
    <span class="qm-list__leading" aria-hidden="true">▣</span>
    <span class="qm-list__content">
      <span class="qm-list__headline">Notifications</span>
      <span class="qm-list__supporting">Choose what reaches you</span>
    </span>
    <span class="qm-list__trailing">On</span>
  </li>
</ul>
<hr class="qm-divider qm-divider--inset">
```

A list is a #101010 surface at the 24px card radius. Headlines are #f4f4f4 while overlines, supporting text and trailing text are #b7b7b7; a leading icon sits in a #181818 tile at the 12px tile radius and a leading image is cropped to the same radius. An interactive row takes an 8% white state layer on hover, and a row marked with `aria-current` takes the #242424 graphite container with white content at the 16px control radius, the current-location treatment rather than the white selection fill. Dividers are a 1px decorative #242424 rule in every inset and vertical form. Default one-line, `qm-list__item--two-line` and `--three-line` layouts have 56/72/88px minimum heights and expand for translated text or text zoom. Leading content accepts icons, avatars or images; trailing content accepts supporting text or controls. `qm-list__overline` is optional. Use actual links or buttons for actions, and avoid nesting interactive controls inside an interactive row. A list itself does not create listbox selection semantics.

Dividers support full width, `--inset`, `--inset-leading`, and `--vertical`. For a vertical divider use `<div class="qm-divider qm-divider--vertical" role="separator" aria-orientation="vertical"></div>`. Decorative separators should use `aria-hidden="true"`.

## Carousels

```html
<section class="qm-carousel qm-carousel--hero" data-qm-carousel aria-label="Featured collections">
  <div class="qm-carousel__track" data-qm-carousel-track tabindex="0" aria-label="Collection slides">
    <article class="qm-carousel__item" data-qm-carousel-item aria-label="Mountain collection">
      <img src="mountains.webp" alt="Mountains in soft morning light" width="640" height="400">
      <p class="qm-carousel__caption">Mountains</p>
    </article>
    <article class="qm-carousel__item" data-qm-carousel-item aria-label="Coastal collection">
      <img src="coast.webp" alt="Waves meeting a dark shore" width="640" height="400">
      <p class="qm-carousel__caption">Coast</p>
    </article>
  </div>
  <div class="qm-carousel__controls">
    <button class="qm-button" data-qm-carousel-prev aria-label="Previous collection">←</button>
    <span data-qm-carousel-status></span>
    <button class="qm-button" data-qm-carousel-next aria-label="Next collection">→</button>
  </div>
</section>
```

Carousel items are #101010 surfaces at the 32px feature radius, the one place a wider corner is earned by size, and a full-screen item drops to square corners because it fills the viewport. A caption sits over a transparent-to-#000000cc scrim ramp, which exists to keep the text legible over an image rather than as decoration. Variants: `--multi-browse` (large, medium and small item rhythm), `--uncontained` (equal-size items), `--hero` (dominant item with a next-item peek), and `--fullscreen` (vertical, one item per viewport). Fullscreen is constrained by the embedding viewport; its track can be sized by the application. Multi-browse uses responsive CSS item widths rather than Android's continuous masking implementation.

The initializer labels the region/slides, supplies a polite numeric status, disables boundary controls and emits `qm:carousel-change` with `{ index, item, count }`; `index` is zero-based. Left/Right (RTL-aware), Home and End operate when the track itself has focus. Fullscreen uses Up/Down. Keys inside slide controls are untouched. Native touch/wheel scrolling remains available, and manual scroll reconciles the current index. There is no autoplay, swipe requirement or hidden duplicate slide content.

Control-driven scrolling uses the canonical MD3 standard/default spatial spring samples and duration. A new command replaces the previous animation; pointer/wheel input cancels it. Resize and reduced-motion changes commit the destination. Both OS reduced motion and `data-qm-motion="reduced"` are respected. Native gesture inertia is controlled by the browser. Ensure slide content stays readable in narrow multi-browse items; reserve full descriptions for a detail view.

## Standard and modal sheets

```html
<button class="qm-button" data-qm-sheet-open="details" aria-controls="details" aria-expanded="false">Show details</button>
<aside id="details" class="qm-sheet qm-sheet--bottom" data-qm-sheet data-qm-sheet-state="collapsed" hidden aria-labelledby="details-title">
  <button class="qm-sheet__handle" data-qm-sheet-drag data-qm-sheet-toggle
    aria-label="Expand or collapse details" aria-expanded="false">
    <span aria-hidden="true"></span>
  </button>
  <h2 id="details-title">Details</h2>
  <p>A short summary stays visible.</p>
  <div data-qm-sheet-details hidden>Additional information is available when expanded.</div>
  <div class="qm-sheet__actions"><button class="qm-button" data-qm-sheet-close>Close</button></div>
</aside>
```

A sheet is a #181818 surface at the 32px dialog radius with the level-3 shadow, rounded only on the edges that stay inside the viewport, and its drag handle is a short #b7b7b7 bar in a full-width 48px target that takes a white state layer on hover. A modal sheet adds the #000000cc scrim that the native dialog backdrop paints. Standard sheets use in-flow `.qm-sheet` with `--bottom` or `--side` and never trap focus or block surrounding content. Open/close controls use `data-qm-sheet-open="id"` and `data-qm-sheet-close`. Escape closes a standard sheet from within it. Close restores focus to its invoker when focus was inside the sheet. Opening preserves the invoker's focus, appropriate for a nonmodal complementary region. Placement in an application scaffold remains caller-owned.

The handle is a genuine button, so keyboard and assistive-technology users can change snap states without a gesture. A 24px-or-greater upward/leading drag expands and the reverse collapses; state commits on release and canceled gestures do nothing. The implementation supplies snap-state transitions, not continuous finger-following sheet physics. Use separate visible Expand/Collapse wording with `data-qm-sheet-toggle` when helpful. `data-qm-sheet-details` controls optional expanded content; it is hidden in the collapsed state. Collapsing returns focus to a handle before hiding a focused detail control.

Events: `qm:sheet-open`, `qm:sheet-close`, and `qm:sheet-change` with `{ expanded, state: 'expanded' | 'collapsed' }` for state changes.

Modal bottom sheets use `<dialog class="qm-dialog qm-dialog--sheet" data-qm-sheet …>`. Modal side sheets use `.qm-dialog.qm-dialog--side-sheet`. Open and close these with the existing `data-qm-dialog-open` / `data-qm-dialog-close` attributes, **not** the standard sheet attributes. Native dialog owns modal inertness, Escape and focus restoration. Both modal sheet types can use the same optional expansion handle and detail markup. Give every dialog an accessible title and visible close control.

## Fullscreen dialogs

```html
<button class="qm-button" data-qm-dialog-open="editor">Open editor</button>
<dialog id="editor" class="qm-dialog qm-dialog--fullscreen" aria-labelledby="editor-title">
  <header class="qm-app-bar">
    <button class="qm-button" data-qm-dialog-close aria-label="Close editor">Close</button>
    <h2 id="editor-title" class="qm-app-bar__title">Edit collection</h2>
    <button class="qm-button qm-button--primary" type="submit" form="edit-form">Save</button>
  </header>
  <form id="edit-form">…</form>
</dialog>
```

Fullscreen dialogs fill the available viewport with the #000000 canvas, square corners, safe-area padding and a sticky action bar, so a full-screen task reads as the page itself rather than as a floating #181818 surface. Core native dialog behavior supplies Escape, focus containment and invoker restoration. Validation, saving and unsaved-change policy belong to the product. Use `closeQuietDialog` for programmatic dismissal when an exit transition is desired.

## Validation and source boundaries

`tests/components-navigation.test.mjs` exercises adaptive state, cancellable navigation, disabled/modified clicks, toolbar keyboard behavior, scroll-reactive app bars, sheet expansion/focus/gestures, carousel indices/scrolling/reduced-motion interruption, cleanup and existing tab integration. These are DOM behavior checks, not real browser layout or assistive-technology certification.

Primary references checked for this implementation:

- [Android app bars](https://developer.android.com/develop/ui/compose/components/app-bars): top/bottom families, title hierarchy and scroll behaviors.
- [Android navigation rail](https://developer.android.com/develop/ui/compose/components/navigation-rail): primary destinations, selection and adaptive use.
- [Android carousel](https://developer.android.com/develop/ui/compose/components/carousel): multi-browse, uncontained, hero and vertical fullscreen layouts.
- [Android bottom sheets](https://developer.android.com/develop/ui/compose/components/bottom-sheets): modal sheet state and dismissal lifecycle.
- [WAI-ARIA carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/): named regions/slides, controls and reading order.
- [WAI-ARIA toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/): roving keyboard navigation and orientation.

The Material website's side-sheet page is linked from the catalog but did not expose specification text in the research tool. The side-sheet implementation is a native-dialog/nonmodal-aside composition, not a claim of verified pixel-level MD3 side-sheet conformance. Native Android/iOS/desktop components require their platform adapters and runtime validation.
