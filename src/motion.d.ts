export type MaterialTransitionPattern = 'container-transform' | 'shared-axis' | 'fade-through' | 'fade';
export type MaterialMotionScheme = 'standard' | 'expressive';
export interface MaterialMotionHandle {
  /** Resolves on completion or cancellation; visual motion never gates application state. */
  finished: Promise<void>;
  cancel(): void;
}
export interface MaterialTransitionOptions {
  from?: HTMLElement | null;
  to?: HTMLElement | null;
  pattern?: MaterialTransitionPattern;
  axis?: 'x' | 'y' | 'z';
  reverse?: boolean;
  /** Synchronously show/hide the views and commit navigation/focus/application state. */
  update(): void;
}
export function transitionView(options: MaterialTransitionOptions): MaterialMotionHandle;
export function motionReduced(element: Element | Document): boolean;
export function cancelMotion(root?: Element | Document): void;
/** Commit the final style/state before calling. Cancellation removes visual overlays, not app state. */
export function animateMaterial(
  element: HTMLElement,
  keyframes: [Keyframe, Keyframe],
  options?: {
    role?: 'spatial' | 'effects';
    speed?: 'fast' | 'default' | 'slow';
    scheme?: MaterialMotionScheme;
  },
): MaterialMotionHandle;
