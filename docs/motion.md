# Material Design 3 motion

Quiet Material adopts Material Design 3 (MD3/M3) motion foundations and the four Material transition patterns. Motion communicates a change, its origin and its destination. The black canvas remains still until an interaction or meaningful state change occurs.

The system includes both the duration/easing model and spring definitions. These are complementary tools, not a requirement to animate every element. The default spring scheme is **standard**, appropriate to recurring, utilitarian interactions; expressive springs remain available for deliberate emphasis. Android's [MotionScheme reference](https://developer.android.com/reference/kotlin/androidx/compose/material3/MotionScheme) distinguishes these schemes and separates spatial motion from effects.

The [motion audit](md3-motion-audit.md) records coverage and remaining validation. This is a documented implementation profile, not a claim of Google certification or identical behavior from every native widget.

## Foundation tokens

Use `tokens/quiet-material.tokens.json` as the source of truth. Generate CSS, JavaScript/TypeScript, Kotlin, Swift and Dart outputs with `npm run build`. Do not hand-edit a platform's generated motion values.

All 16 MD3 duration slots are available. These values are verified against Flutter's official [Material duration constants](https://api.flutter.dev/flutter/material/Durations-class.html).

| Group | Slot 1 | Slot 2 | Slot 3 | Slot 4 |
| --- | --- | --- | --- | --- |
| `duration.short` | 50ms | 100ms | 150ms | 200ms |
| `duration.medium` | 250ms | 300ms | 350ms | 400ms |
| `duration.long` | 450ms | 500ms | 550ms | 600ms |
| `duration.extraLong` | 700ms | 800ms | 900ms | 1000ms |

For example, slot 3 of the short group is `duration.short3`, exported to CSS as `--qm-duration-short3`. Select timing according to the amount of change and the component's documented behavior.

The seven current curve slots are retained. Legacy curves, where exported, are compatibility values and should not be selected for new MD3 recipes. The cubic values can also be checked against Flutter's [Material easing API](https://api.flutter.dev/flutter/material/Easing-class.html).

| Easing | Value | Motion role |
| --- | --- | --- |
| `standard` | `cubic-bezier(.2, 0, 0, 1)` | Utility motion within the screen |
| `standardDecelerate` | `cubic-bezier(0, 0, 0, 1)` | Utility arrival |
| `standardAccelerate` | `cubic-bezier(.3, 0, 1, 1)` | Utility departure |
| `emphasized` | Two joined cubic segments, below | Contextual movement within the screen |
| `emphasizedDecelerate` | `cubic-bezier(.05, .7, .1, 1)` | Emphasized arrival |
| `emphasizedAccelerate` | `cubic-bezier(.3, 0, .8, .15)` | Emphasized departure |
| `linear` | `cubic-bezier(0, 0, 1, 1)` | Uniform progress |

The emphasized curve is **not** a single `cubic-bezier()` curve. Its official path is:

```text
M 0,0
C 0.05,0 0.133333,0.06 0.166666,0.4
C 0.208333,0.82 0.25,1 1,1
```

The tokens retain both segments and the join. The web build samples the path into CSS `linear()`; a standard cubic fallback supports older CSS engines and is explicitly an approximation. Native consumers can evaluate the two segments. The exact path and curve roles are defined in the official [Material Components motion guide](https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md#curves-easing--duration).

### Springs

Each scheme has six roles: fast, default and slow, each split into spatial and effects. The token path is `spring.<scheme>.<speed>.<kind>.damping` or `.stiffness`. `scheme` is `standard` or `expressive`; `kind` is `spatial` or `effects`. Mass is normalized to 1 in adapters.

| Standard spring | Damping ratio | Stiffness |
| --- | --- | --- |
| Fast spatial | 0.9 | 1400 |
| Default spatial | 0.9 | 700 |
| Slow spatial | 0.9 | 300 |
| Fast effects | 1 | 3800 |
| Default effects | 1 | 1600 |
| Slow effects | 1 | 800 |

Use spatial springs for position, size and shape. Use effects springs for opacity and color so these properties do not overshoot. Small controls use fast; changes occupying part of a screen use default; large travel uses slow. These defaults and distinctions are documented in the [Material spring model](https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md#springs). A spring's settling time comes from physics; do not mislabel it as a fixed-duration cubic curve.

Generated web spring trajectories are finite samples starting at zero velocity. Their derived duration is a settling estimate, not another MD3 duration slot. They reproduce a spring from rest; they do not provide a physics engine that carries live velocity through gesture interruption. Use the physical values with an appropriate native spring API when velocity continuity matters.

## Choose the relationship first

All four Material transition families are part of the system. This selection table follows the official Flutter team's [Material motion patterns](https://pub.dev/packages/animations).

| Pattern | When to use it | Required relationship |
| --- | --- | --- |
| Container transform | A card, row or compact surface opens its detail | One visible container changes bounds and shape while its content changes |
| Shared axis X | Forward/backward steps arranged horizontally | Outgoing and incoming content move together; backward reverses the direction |
| Shared axis Y | Steps or content with a vertical relationship | Both elements preserve the same vertical direction |
| Shared axis Z | Parent/child navigation or a depth relationship | Scale and fade convey approach or retreat |
| Fade through | Change between independent destinations or result sets | Outgoing content fades away before incoming content becomes readable |
| Fade | Show or dismiss a menu, dialog, snackbar or similar local surface | Content arrives or leaves within the existing screen |

Shared axis has three variants of one family. A crossfade alone is not a container transform. Horizontal direction follows logical forward/backward navigation, including RTL. Keep unrelated navigation chrome stationary.

## Transition bindings

The current Material Components implementation resolves themed tokens, which differ from some older fallback timings shown in its documentation. Quiet Material follows the themed source bindings below. Tokens allow intentional product variants; do not describe a custom variant as an exact stock component animation.

| Transition | Arrival / forward | Departure / return | Easing |
| --- | --- | --- | --- |
| [Container transform](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/MaterialContainerTransform.java) | `long2` · 500ms | `medium4` · 400ms | Emphasized |
| [Shared axis](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/MaterialSharedAxis.java) | `long1` · 450ms | `long1` · 450ms | Emphasized |
| [Fade through](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/MaterialFadeThrough.java) | `long1` · 450ms | `long1` · 450ms | Emphasized |
| [Fade](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/MaterialFade.java) | `medium4` · 400ms | `short3` · 150ms | Emphasized decelerate in; emphasized accelerate out |

Shared-axis X/Y uses 30 logical units of travel from the Android [transition dimension](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/res/values/dimens.xml); Z uses 0.8→1 for incoming content and 1→1.1 for outgoing content in the forward direction, reversing on return. Fade through uses a 0.35 handoff threshold and incoming scale 0.92→1. Fade enters from scale 0.8 and completes opacity in the first 0.3 of eased progress; departure fades without scaling. These are bindings from the official [scale](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/ScaleProvider.java), [fade-through](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/FadeThroughProvider.java), and [fade](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/MaterialFade.java) providers.

State layers and local control changes use separate semantic recipes rather than an entire scene transition. Their exact binding is in the canonical `motion` group. A toolkit component with a documented motion specification owns its internal timing; a product must deliberately choose and document any replacement.

### Choreography rules

- Animate the smallest area that explains the change. Keep the canvas, system bars and unrelated controls stable.
- Move elements that belong together as a group. Avoid a decorative cascade across every list item.
- Preserve a transformed container's identity: origin, destination, bounds, corner shape and content handoff all matter.
- Give transient surfaces both an entrance and an exit. Preserve native back, Escape, outside dismissal and focus return.
- Update selection, data, validation and accessible state immediately. Application logic must not wait for animation completion.
- Keep progress truthful and tied to a real pending state; no decorative endless pulsing, shimmering or bouncing at rest.
- Animate explicit properties. Avoid `transition: all`, repeated layout measurement and document-wide animation on resize.
- Cancel or replace unfinished motion when the next interaction arrives. Clean up temporary visuals even if the element is removed.

For a scene transition, commit destination state and the accessibility tree promptly. Any outgoing visual kept for continuity must be inert, hidden from assistive technology and temporary. No invisible overlay may keep intercepting taps.

These rules are the Quiet Material integration contract. CSS, Web Animations and native APIs must preserve the same state and accessibility outcomes.

## Reduced motion and platform behavior

The effective preference is reduced if the OS **or** the in-app preference requests it. The app cannot override OS reduction with an animation toggle. Use immediate state changes for scene travel, scale, shape morphing and optional spring effects. Preserve focus, status, selection and dismissal.

Stop active optional animation when reduction is enabled. Suppress decorative ripples and GIF playback. Content must remain understandable without movement; a static progress state may still report that work is occurring. Check native platform accessibility settings as well as shared token values. An opacity-only element can remain in the accessibility tree, so hiding must include semantic removal where appropriate; Android's [animation guidance](https://developer.android.com/develop/ui/compose/animation/quick-guide#animate-appearing-disappearing) explains this distinction.

System-owned navigation, keyboard, permission and window animations retain platform behavior. Supplying MD3 tokens does not make SwiftUI's default navigation or a browser's native popup an MD3 animation. The [platform adapters](platforms.md) document the integration boundary and SDK requirements.

## Visual studies and verification

The [motion gallery](motion-gallery.md) contains posters and short, opt-in GIF studies. They illustrate timing and relationships; they are not recorded proof of native widget conformance. Reduced-motion users receive posters. Review the live interaction alongside the illustrated sequence.

Every motion change must update its recipe or platform binding, include forward and return states, and record automated versus visual/device evidence in the [motion audit](md3-motion-audit.md) and [validation record](validation.md).

## Web integration

`src/motion.js` exports `transitionView`, `animateMaterial`, `cancelMotion`, and `motionReduced`. `transitionView` commits the supplied `update()` synchronously, then decorates the result with sampled MD3 motion. Place focus and route state changes inside that callback. Outgoing copies are inert, anonymous and hidden from accessibility; completion and cancellation remove them. Programmatic close can use the core `closeQuietDialog` helper, which closes semantic state immediately.

For `animateMaterial`, commit the final application style before calling and pass two compatible numeric/unit keyframes. The helper owns no persistent styles, so reduced motion, completion or cancellation all expose that final state. See the [README example](../README.md). Web spring sampling begins at zero velocity; it does not claim native velocity continuity when interrupted.

The web container adapter handles ordinary DOM, width fitting and a straight movement path. Live media/canvas, iframes, shadow DOM, arc paths and other toolkit-specific variants require a consuming implementation. Native starters do not supply a complete MD3 container-transform route; SwiftUI navigation and system presentations retain Apple motion. These boundaries and pending rendered/native checks are part of the [audit](md3-motion-audit.md).
