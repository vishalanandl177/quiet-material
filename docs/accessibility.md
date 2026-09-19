# Accessibility

Quiet Material targets WCAG 2.2 AA in consuming products. A design system cannot certify an entire product: real content, task flows, integrations and assistive-technology testing determine the result. The checklist below is an acceptance policy, not a claim that every combination has been audited.

## Contrast without visual noise

The page remains black. Cards use charcoal to group content. Card separation is decorative; a boundary needed to identify an input, control or state is functional and must remain visible. Use the control outline token and a visible keyboard focus ring even when a screenshot would look cleaner without them.

| Content | Required treatment |
| --- | --- |
| Body text and meaningful secondary text | At least 4.5:1 against every actual background |
| Large text | At least 3:1; prefer the body-text threshold anyway |
| Required control boundaries, meaningful icons and state indicators | At least 3:1 against adjacent colors |
| Error, success, selection | Text or a recognizable symbol in addition to color |
| Disabled control | Visually distinct; explain an unavailable action if its reason matters |

The text thresholds come from [WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Large text means at least 24 CSS px regular or approximately 18.67 CSS px bold. Do not round a failing contrast result upward. Functional boundaries and indicators follow [non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

## Keyboard and focus

Use native buttons, links, inputs, select elements and details wherever possible. Every action must work without a pointer. Keep source order aligned with reading order; do not use positive tabindex. Focus must be visible and not hidden behind sticky UI. Provide a skip link when navigation precedes substantial content.

Tabs use one tab stop within the tab list. Left/Right move between horizontal tabs, Home/End reach the ends. In a vertical list, use Up/Down. Automatically activate only when panels are already available without noticeable delay. These behaviors follow the [WAI tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

A modal dialog moves focus inside, contains keyboard focus while open, closes on Escape and returns focus to the invoking control when it still exists. If the action removes the invoker, move focus to a sensible successor. Label the dialog with its visible heading. For long content, initially focus a heading with tabindex="-1". Native dialog.showModal() provides the modal foundation; verify it in the browsers you support. See the [WAI modal-dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## Touch, zoom and reading

Use 48 × 48 CSS px as the system's preferred interactive target, including invisible padding around small icons. Never overlap adjacent hit regions. This is a system choice above WCAG 2.2 AA's 24 × 24 CSS px minimum, which also has spacing and other exceptions; see [target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Support 200% text zoom and reflow at 320 CSS px. Long text wraps; essential labels are not ellipsized. Tables may scroll inside a labeled region if their structure requires it. Test translated copy and right-to-left content; avoid fixed-height text boxes. Do not disable pinch zoom. Respect forced-colors mode rather than forcing brand colors onto it.

## Forms and status

Associate every field with a persistent label. Use autocomplete and an appropriate input type when the purpose is known. Connect help and errors through aria-describedby; set aria-invalid only when invalidity is established. Explain what happened and how to fix it. Move focus to an error summary after a failed multi-field submission, with links to affected inputs.

Announce routine feedback through a polite status region. Reserve alert/assertive announcements for urgent interruptions. A snackbar must never be the only place to find an error or a time-sensitive action; provide a persistent equivalent. Loading skeletons are decorative and hidden from assistive technology; the affected content region communicates busy state.

## Expanded component contracts

| Component | Required behavior |
| --- | --- |
| Segmented controls | Single selection exposes a labeled radio group with one tab stop; multiple selection exposes separately toggled buttons. Disabled choices are skipped. |
| FAB menu and split button | Primary and secondary actions have distinct names. The disclosure exposes expanded state, closes with Escape and restores focus. A split button must not hide the primary action inside the menu. |
| Toolbars and menus | Use each enhanced component's documented roving focus and arrow keys. Ordinary site navigation remains native links; do not assign menu roles to every navigation region. |
| Navigation bar, rail and drawer | Preserve current destination and focus across responsive layouts. Modal drawers use the dialog focus contract; permanent navigation does not trap focus. |
| Standard sheets and carousels | Provide visible buttons for every drag or swipe action. Carousels do not auto-advance; announce user-requested position changes without repeatedly reading all slides. |
| Date/time pickers | Label every field and calendar/time control. Keep typed input available, describe invalid values, and retain a predictable focus return path on dismissal. Test locale, 12/24-hour choices and range selection with assistive technology. |
| Search | Label the input and results, expose expanded/active-option state, and keep keyboard selection coherent when results change. Announce a useful result count; loading and error content must remain understandable. |
| Range sliders | Give each thumb a distinct label and expose its current bounds. Keep the order stable, prevent crossing, and provide understandable units with visible values or aria-valuetext. |
| Input chips | Removal is a separate labeled action. After removal, move focus to an appropriate surviving item or the associated input; never leave focus on a detached node. |
| Rich tooltips | Interactive help is a nonmodal dialog with a name and explicit dismissal. Plain role=tooltip hints contain no interactive controls. |
| Progress and loading | Name the operation. Indeterminate progress omits a numeric value; completion updates the content's busy state. Reduced motion uses a static meaningful state instead of repeated movement. |
| Snackbar actions | Pending actions prevent duplicate invocation. Failed actions leave recovery available and must produce a product-owned, persistent error when necessary. Dismissal is separate from Undo or Retry. |

See [the component family matrix](md3-components.md) for the implementation and individual keyboard contracts. These are acceptance requirements for integrations; [validation](validation.md) records the evidence actually collected.

## Motion and sensory needs

Honor prefers-reduced-motion automatically. A product may expose an additional reduction setting, but cannot use it to override an OS request for less motion. State updates remain immediate and understandable without movement. Do not use flashing, looping promotional animation or moving backgrounds. Reduced-motion support also implements our design policy inspired by [WCAG interaction-animation guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), which is a Level AAA criterion.

## Acceptance checks

1. Complete every demonstrated action with Tab, Shift+Tab, Enter, Space, arrows and Escape as appropriate.
2. Check modal initial focus, tab containment, dismissal and focus restoration.
3. Inspect names, roles, checked/expanded/selected values and live announcements with a screen reader.
4. Check focus visibility on black, every charcoal surface and colored controls.
5. Check default, hovered, focused, selected and error color pairs; token tests alone do not cover composited effects.
6. Test 320 CSS px, 200% text zoom, long labels, reduced motion and forced colors.
7. Verify product flows with at least a desktop screen reader and a mobile screen reader before claiming support.

Record browser, OS, assistive technology, version, task and result. Automated checks are useful evidence, not a replacement for these reviews. The normative baseline is [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
