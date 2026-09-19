# Platforms and implementation contracts

Quiet Material shares one visual language across platforms: a black application background, charcoal content surfaces, clear typography, generous rounded shapes and brief interaction-driven motion. The portable contract is the token source plus component behavior and accessibility rules. CSS is the web implementation; native apps consume generated values through their own UI toolkit.

## What is supplied

| Target | Implementation supplied here | Delivery status |
| --- | --- | --- |
| Responsive web: phone, tablet, desktop browser | HTML/CSS, optional JavaScript interactions, 27-component catalog and live explorer | Implemented; exact automated/browser evidence is recorded in [validation](validation.md) |
| Android | [Compose source adapter and example](../platforms/android/) plus generated Kotlin tokens | Source integration starter; native compilation and device verification remain pending |
| iOS / iPadOS | [SwiftUI source package and example](../platforms/apple/) plus generated Swift tokens | Source integration starter; Xcode compilation and device verification remain pending |
| macOS | SwiftUI adapter, Flutter adapter, or responsive web | Native builds and desktop accessibility verification remain pending |
| Windows / Linux desktop | [Flutter source package and example](../platforms/flutter/) or responsive web | Flutter host apps must be created and validated on supported build hosts |
| Shared Flutter application | Theme, adaptive shell, motion helper, generated Dart tokens and stock Material widgets | Source package; SDK analysis, widget tests and target builds remain pending |
| Other UI stacks | Canonical JSON design tokens and contracts in this documentation | Requires a platform adapter and validation by the consuming team |

Flutter targets Android, iOS, web and desktop operating systems; supported OS versions depend on the Flutter SDK selected for the product. A framework's supported-platform list is not evidence that this repository has been tested on those devices. Consult [Flutter's platform matrix](https://docs.flutter.dev/reference/supported-platforms) when setting a minimum OS.

The starter adapters supply foundations and core compositions; they do not implement 27 bespoke components independently in every framework. The matrix below specifies how the same catalog can be composed from each toolkit. Product routing, persistence, validation, permission flows and business logic remain application responsibilities.

## One component contract, native toolkit behavior

The web implementation and state contracts are in [components](components.md). These are recommended integration mappings, not claims that every row has a dedicated wrapper in the native source packages.

| Catalog component | Android Compose | Apple SwiftUI | Flutter |
| --- | --- | --- | --- |
| Button | `Button`, `OutlinedButton`, `TextButton` | `Button` with Quiet styling | `FilledButton`, `OutlinedButton`, `TextButton` |
| Icon button | `IconButton` + content description | Labeled `Button` with image | `IconButton` + tooltip/semantic label |
| Card | `Card` / `Surface` | Quiet container with rounded background | `Card` |
| Text field | `OutlinedTextField` | `TextField` / `SecureField` | `TextField` / `TextFormField` |
| Textarea | Multiline `TextField` | `TextEditor` | `TextField(maxLines: …)` |
| Select | Exposed dropdown / selection dialog | `Picker` | `DropdownMenu` |
| Switch | `Switch` with labeled row | `Toggle` | `SwitchListTile` |
| Checkbox | `Checkbox` with labeled row | `Toggle`; checkbox style where supported | `CheckboxListTile` |
| Radio | `RadioButton` in selection group | `Picker`; radio style where supported | `Radio` in a toolkit selection group |
| Range slider | `Slider` | `Slider` | `Slider` |
| Filter chip | `FilterChip` | Selected `Button` or `Toggle` composition | `FilterChip` |
| Badge | `Badge` / `BadgedBox` | Text badge; native `.badge` in supported containers | `Badge` |
| Avatar | Clipped image or initials | Clipped `Image` or initials | `CircleAvatar` |
| Tabs | `TabRow` / tabs | `TabView` for destinations; `Picker` for small local modes | `TabBar` / `TabBarView` |
| Dialog | `AlertDialog` / `Dialog` | `.alert` / `.confirmationDialog` | `showDialog` / `AlertDialog` |
| Bottom sheet | `ModalBottomSheet` | `.sheet` with appropriate presentation | `showModalBottomSheet` |
| Popover menu | `DropdownMenu` | `Menu` / `.popover` | `MenuAnchor` / `MenuItemButton` |
| Tooltip | `TooltipBox` | `.help` where supported; visible help on touch | `Tooltip` |
| Accordion | Expandable semantic heading and content | `DisclosureGroup` | `ExpansionTile` |
| Inline alert | Text/status container | Text/status container | `MaterialBanner` or labeled status container |
| Snackbar | `SnackbarHost` | Product-owned status overlay and announcement | `ScaffoldMessenger` / `SnackBar` |
| Progress | Linear/circular progress indicator | `ProgressView` | Linear/circular progress indicator |
| Skeleton | Static placeholder, hidden semantics | `.redacted` with semantic loading context | Static placeholder with excluded semantics |
| Table | Semantic rows/grid; application-owned table | `Table` where suitable, list at compact widths | `DataTable`, optionally scrollable |
| Breadcrumbs | Ancestor actions in a semantic group | Navigation path / ancestor links | Ancestor text buttons / links |
| Pagination | Labeled previous/next actions | Labeled previous/next actions | Labeled previous/next actions |
| Empty state | Heading, explanation and native action composition | Heading, explanation and native `Button` composition | Heading, explanation and native button composition |

Use the current [Compose component catalog](https://developer.android.com/develop/ui/compose/components), [SwiftUI documentation](https://developer.apple.com/documentation/swiftui), and [Flutter Material API](https://api.flutter.dev/flutter/material/material-library.html) for available toolkit APIs and semantics. Where a platform has no direct equivalent, implement the documented purpose with native controls; a matching silhouette alone is insufficient.

## Units, type and colors

| Property | Web | Android | Apple | Flutter |
| --- | --- | --- | --- | --- |
| Layout unit | CSS px; scalable text in rem | dp | pt | Logical pixel |
| Text scaling | Browser zoom and user font settings | sp / system font scale | Dynamic Type | Inherited `TextScaler` |
| Color | sRGB CSS value | Compose color | SwiftUI color | Dart `Color` |
| Time | Milliseconds | Milliseconds | Seconds at API boundary | `Duration(milliseconds: value)` |
| Direction | Logical CSS properties | Start/end padding | Leading/trailing | Directional insets/alignment |
| Motion preference | `prefers-reduced-motion` | Platform animator/accessibility settings | Accessibility Reduce Motion | `MediaQuery.disableAnimationsOf` |

Numeric layout values express design intent in each toolkit's logical units; they are not physical-device pixel counts. Fonts use the native system stack unless the consuming app bundles an appropriately licensed font. Keep font scaling enabled and verify scripts with different character widths. Generate platform values from canonical tokens instead of introducing separate platform palettes.

Black belongs to the application's canvas and safe-area background. Charcoal belongs to cards, dialogs and controls. System-owned keyboards, permission dialogs and OS surfaces retain the platform's presentation; the application theme does not control their entire appearance.

## Interaction contract

- Touch targets are at least 48 logical units in both dimensions, including icon buttons and dismiss actions. Preserve these on pointer devices; visual size may be smaller inside the target.
- A control must have a native role, accessible name, current state and valid keyboard action. Prefer toolkit controls over gesture-only containers.
- Hover is supplementary. Every essential action works through touch, keyboard and assistive technology. Swipe/drag actions need a visible alternative.
- Preserve platform back and dismissal conventions. A modal has a visible dismissal action, appropriate initial focus and a return path. A sheet handle is not its sole exit.
- Avoid announcing entire changing cards. Announce the meaningful new status, expose errors adjacent to fields, and keep urgent recovery information available.
- Reduced motion removes decorative travel/scale and repeated animation. Inspect app-level routes, modals, loading indicators and authored animations separately; a theme alone cannot guarantee that every animation stops.
- At breakpoints preserve selected items, focus where possible, scroll context and unsaved inputs. Choose by available window size, including split view, floating windows and foldable panes.

## What “complete” means for a product release

The system contains the visual foundations, reusable token outputs, responsive layout contracts, core component specifications, motion demonstrations, starter adapters and contribution guidance. Product readiness still requires building the selected native adapter on its actual SDK and verifying the product's screens, state handling and assistive-technology workflows. Record that evidence in [validation](validation.md); do not replace pending checks with a blanket “all platforms tested” statement.

The repository remains private and has no public license grant. “Usable across platforms” describes implementation portability. “Anyone may download, redistribute or reuse it” requires a separate repository visibility and licensing decision by the owner.

## MD3 motion coverage

The shared system exports all duration/easing roles plus standard and expressive springs. Web supplies the four default transition families and a finite sampled spring helper. Android and Flutter include selected transition helpers; SwiftUI includes curve/spring/progress helpers. Native starters do not implement a full MD3 container-transform route, and SwiftUI system-owned navigation remains Apple motion. Consult the [MD3 audit](md3-motion-audit.md) and each native README before describing a product as having identical motion across platforms.
