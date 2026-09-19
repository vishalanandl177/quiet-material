# Mobile-first and adaptive layout

Start with a usable 320 CSS-pixel viewport and the core task in one column. Add space, a second pane and persistent navigation only when the current window can support them. A tablet in split view can be compact; a desktop window can be narrow. Device names never determine layout.

The full canvas remains pure black. Cards sit on the near-black surface steps, content remains legible, and larger windows earn whitespace rather than extra decoration.

## Window classes

These are Quiet Material's shared layout tokens. Their values are a product contract, not a claim that all platforms prescribe identical breakpoints.

| Width in logical units | Class | Layout | Navigation |
| --- | --- | --- | --- |
| Below 600 | Compact | One column; 20-unit page padding; cards fill available width | Three primary destinations at most in the compact bar; overflow or a menu for the rest |
| 600-839 | Medium | Wider single content area or suitable two-column groups; 32-unit padding | Rail or readable menu as appropriate |
| 840-1199 | Expanded | Primary content plus optional supporting pane; 48-unit padding | Persistent rail/sidebar when content still has enough room |
| 1200 and above | Wide | Constrained readable content plus supporting context; 48-unit padding | Persistent labeled navigation; avoid stretching text across the window |

At larger accessibility text sizes, fewer columns and a readable menu can be preferable even in a wider class. Native adapters may use a platform-native equivalent to the explorer navigation. Preserve destination order and selected state as the presentation changes.

## Content rules

- Keep the primary task first in visual and accessibility reading order. Put secondary detail underneath on compact screens and beside it when space permits.
- Use fluid widths and `min-width: 0` in flexible children. Wrap long labels, file names and translated strings. Do not silently truncate a primary action or error.
- Buttons have a minimum height, not a fixed text-clipping height. Text may wrap while its target remains at least 48 × 48 logical units.
- The card radius is `radius-card` 24 at every width. `radius-card-compact` resolves to the same 24, so the card silhouette does not change between window classes. A large feature surface may still take `radius-feature` 32, and generous corners must leave room for readable text.
- Forms stack on compact screens. Visible labels persist while typing; error messages expand their container. Do not rely on placeholders or color alone.
- Data tables can keep genuine two-dimensional relationships in their own labeled scroll region. Prevent accidental horizontal overflow of the entire page. Offer a list view when row comparison is not essential.
- Tabs represent a small set of related local views. Six tiny equal-width tabs are not a compact navigation strategy. Use a menu, a short primary set with overflow, or readable scrollable local tabs where appropriate.
- Empty, loading, success, warning, invalid, disabled and offline states need the same responsive treatment as happy-path content.

The 320-pixel baseline aligns with the width used to evaluate common horizontal-content reflow in [WCAG's reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). It does not by itself certify accessibility; tables and other content requiring two-dimensional layout have distinct considerations.

## Safe areas, keyboards and input

The web viewport must allow zoom. Use the device-width viewport and `viewport-fit=cover` only alongside safe-area padding; never disable pinch zoom or set a restrictive maximum scale. Edge controls account for `env(safe-area-inset-*)`. Use dynamic viewport height when a full-height surface is needed, with an appropriate fallback.

On native platforms use the toolkit's safe-area/window-inset APIs. Let the software keyboard reduce usable space, keep the focused field and its error visible, and make long forms scroll. A bottom action cannot sit behind a keyboard or gesture area. Test orientation changes with an unfinished form, not only a static home screen.

Touch, keyboard, mouse, trackpad and stylus can all exist on the same device. Show a clear keyboard focus indicator. Use hover only for supplementary feedback. Provide a visible activation alternative for drag, swipe and long-press gestures. Desktop windows retain the same meaningful target sizes and content hierarchy.

## Text, localization and preferences

Use browser zoom and user font settings on web, Dynamic Type on Apple, scalable text on Android, and inherited `TextScaler` in Flutter. Never cap scaling to protect a layout. At 200% text, labels and actions must remain readable; at high browser zoom, reflow rather than shrink content to fit.

Use start/end and leading/trailing alignment instead of left/right for reading-order layout. Mirror directional navigation icons when their meaning follows reading direction, while preserving universal symbols. Test a real right-to-left locale and long translated strings. A visual mirror without logical focus order is incomplete.

Respect reduced motion before starting an animation. Provide a stable final state and meaningful status even when animation is absent. GIF examples in the explorer are demonstrations with deliberate playback; they are not production widgets or a dependency of the component behavior.

## Review dimensions

| Scenario | What to verify |
| --- | --- |
| 320 × 740 and 390 × 844 | One-column task, visible labels, no page overflow, reachable navigation |
| 600 × 900 and 768 × 1024 | Boundary transition, useful whitespace, readable rail/menu |
| 840 × 900 and 1024 × 768 | Supporting-pane fit, content priority, short-height scrolling |
| 1280 × 900 and 1440 × 900 | Bounded line length and meaningful use of the extra space |
| 200% text / high browser zoom | Reflow, wrapping, focus visibility, reachable dismissal actions |
| RTL + long labels | Correct reading/focus order and directional spacing |
| Open keyboard + cutouts | Focused field, inline error and actions remain reachable |
| OS reduced motion | No decorative travel or endless playback; state remains understandable |
| Rotation / live window resize | Selection and unsaved data survive; focus has a sensible destination |

These are acceptance scenarios. Actual completed checks and remaining device checks are recorded in [validation](validation.md); a screenshot at one viewport does not establish all of them.
