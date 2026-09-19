/** Optional progressive enhancement for semantic Quiet Material HTML. */
export type QuietMaterialRoot = Document | Element | DocumentFragment;

export interface SnackbarOptions {
  /** Owning document; defaults to the current document. */
  document?: Document;
  /** Action label when onAction is provided; otherwise the legacy dismiss label. */
  actionLabel?: string;
  /** Real action; successful completion dismisses. Rejection keeps feedback available. */
  onAction?: () => void | Promise<void>;
  dismissLabel?: string;
  actionErrorMessage?: string;
  /**
   * Optional auto-dismiss delay in milliseconds, clamped to at least 5000.
   * Pauses while hovered or focused. Omit or pass 0 for persistent feedback.
   */
  duration?: number;
}

/**
 * Enhance all declarative component families, including pickers, navigation and menus.
 * Native controls and popover disclosures retain their browser behavior.
 * Repeated calls for the same root return the same idempotent cleanup function.
 * Imports have no side effects. Call after the relevant markup exists.
 */
export declare function initQuietMaterial(root?: QuietMaterialRoot): () => void;

/** Display plain text feedback without moving focus; returns an idempotent dismiss function. */
export declare function showSnackbar(message: string, options?: SnackbarOptions): () => void;

/** Close the native dialog immediately and fade a noninteractive visual snapshot. */
export declare function closeQuietDialog(dialog: HTMLDialogElement, result?: string): import('./motion.js').MaterialMotionHandle | undefined;

/** Emitted from a button.qm-chip[aria-pressed] after its pressed state changes. */
export interface QuietMaterialChipChangeDetail {
  pressed: boolean;
}

export interface DateRange { start: string; end: string; }
export interface DatePickerOptions<T = string | DateRange> {
  value?: T; range?: boolean; min?: string; max?: string;
  locale?: string; weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; modal?: boolean; label?: string;
  onChange?: (value: T) => void;
}
export interface TimePickerOptions {
  value?: string; hour24?: boolean; modal?: boolean; label?: string; onChange?: (value: string) => void;
}
export interface SearchSuggestion {label: string; value?: string;}
export interface SearchOptions {
  suggestions?: Array<string | SearchSuggestion>; label?: string; modal?: boolean; placeholder?: string;
  onSearch?: (value: string) => void | Promise<void>;
}
export interface PickerController<T> {open(): void; close(): void; destroy(): void; setValue(value: T): void; readonly value: T;}
export interface SearchController {open(): void; close(): void; destroy(): void; setSuggestions(values: Array<string | SearchSuggestion>): void; readonly input: HTMLInputElement;}
export declare function mountDatePicker(host: HTMLElement, options: DatePickerOptions<DateRange> & {range: true}): PickerController<DateRange>;
export declare function mountDatePicker(host: HTMLElement, options?: DatePickerOptions<string> & {range?: false}): PickerController<string>;
export declare function mountDatePicker(host: HTMLElement, options: DatePickerOptions): PickerController<string | DateRange>;
export declare function mountTimePicker(host: HTMLElement, options?: TimePickerOptions): PickerController<string>;
export declare function mountSearch(host: HTMLElement, options?: SearchOptions): SearchController;
export interface ProgressOptions {value?: number | string | null; max?: number | string; circular?: boolean;}
export interface ProgressController {setValue(value: number | null, max?: number): void; destroy(): void;}
export declare function mountProgress(host: HTMLElement, options?: ProgressOptions): ProgressController;
export declare function setProgress(host: HTMLElement, value: number | null, max?: number): void;
export declare function mountLoadingIndicator(host: HTMLElement): {destroy(): void};

declare global {
  interface HTMLElementEventMap {
    'qm:chip-change': CustomEvent<QuietMaterialChipChangeDetail>;
  }
}
