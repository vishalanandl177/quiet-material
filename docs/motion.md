# Motion

Motion gives feedback, preserves context and shows what changed. At rest, Quiet Material is still. Animations begin because the user acted or meaningful state changed.

The system is inspired by [Material's motion guidance](https://m3.material.io/styles/motion/overview/how-it-works). The durations and recipes below are custom Quiet Material choices, not a copied or certified Material motion specification. The official Material page requires JavaScript and was not available as full text during the source review; no detailed claim here depends on an unread specification.

## Tokens

| CSS duration token | Value | Intended use |
| --- | --- | --- |
| `--qm-duration-instant` | 100ms | Small state feedback; “instant” is a token name, not zero time |
| `--qm-duration-short` | 150ms | Press and hover response |
| `--qm-duration-medium` | 250ms | Local reveal and selection change |
| `--qm-duration-long` | 350ms | Larger context changes, used sparingly |

| CSS easing token | Value | Intended use |
| --- | --- | --- |
| `--qm-easing-standard` | cubic-bezier(.2, 0, 0, 1) | A state settling into place |
| `--qm-easing-enter` | cubic-bezier(0, 0, 0, 1) | An element arriving |
| `--qm-easing-exit` | cubic-bezier(.3, 0, 1, 1) | An element leaving |

## Recipes

- **Press:** briefly change the state layer or scale slightly. Release restores the resting appearance; keyboard activation gets equivalent feedback.
- **Selection:** update the selected control immediately, then let a small visual transition clarify the new state. Do not delay data or accessibility attributes until animation completion.
- **Dialog or sheet:** make the content available and focus it immediately; use a short fade or modest translation to explain its arrival. Avoid sweeping an entire page across the viewport.
- **Disclosure:** the content may appear directly. Animate only when layout remains stable and the extra movement helps comprehension.
- **Feedback:** reveal a snackbar quietly. Keep it readable and dismissible; do not bounce it or pulse it repeatedly.

These are authoring recipes. Read the stylesheet and workbench for which transitions are implemented in v1. Shared-element route transitions, spring choreography and cross-platform motion engines are not included.

## Reduced motion

When prefers-reduced-motion is reduce, duration tokens resolve to 0ms and optional transforms or decorative animation are removed. State, focus and status still update. A product-level “Reduce motion” preference can request more reduction; it cannot turn motion back on against the OS preference. Do not merely slow a large movement down.

Animation must never gate saving, dismissal, focus restoration or other application logic. Prefer opacity and transform when a transition is useful; avoid animating layout properties continuously. Do not use transition: all. Cancel or replace an unfinished transition when the next interaction arrives.

## Review

A motion change should answer three questions: What changed? Why does movement clarify it? Is the interface equally usable with motion disabled? If the second answer is weak, omit the animation.
