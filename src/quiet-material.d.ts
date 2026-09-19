/** Optional progressive enhancement for semantic Quiet Material HTML. */
export type QuietMaterialRoot = Document | Element | DocumentFragment;

export interface SnackbarOptions {
  /** Owning document; defaults to the current document. */
  document?: Document;
  /** Dismiss button text. Defaults to "Dismiss". */
  actionLabel?: string;
  /**
   * Optional auto-dismiss delay in milliseconds, clamped to at least 5000.
   * Pauses while hovered or focused. Omit or pass 0 for persistent feedback.
   */
  duration?: number;
}

/**
 * Enhance tabs, dialog triggers, toggle chips, ripples, and tooltip dismissal.
 * Native controls and popover disclosures retain their browser behavior.
 * Repeated calls for the same root return the same idempotent cleanup function.
 * Imports have no side effects. Call after the relevant markup exists.
 */
export declare function initQuietMaterial(root?: QuietMaterialRoot): () => void;

/** Display plain text feedback without moving focus; returns an idempotent dismiss function. */
export declare function showSnackbar(message: string, options?: SnackbarOptions): () => void;

/** Emitted from a button.qm-chip[aria-pressed] after its pressed state changes. */
export interface QuietMaterialChipChangeDetail {
  pressed: boolean;
}

declare global {
  interface HTMLElementEventMap {
    'qm:chip-change': CustomEvent<QuietMaterialChipChangeDetail>;
  }
}
