"use client";

import * as React from "react";
import { useIsomorphicLayoutEffect, useLatest } from "./use-controllable-state";

/**
 * Caret-preserving formatting engine behind CurrencyInput, PhoneInput, IbanInput, IdInput and
 * FormattedInput.
 *
 * The model: a **display** string (what the `<input>` shows, with separators and grouping) and a
 * locale-free **raw** value (decimal string, E.164, compact IBAN). Formatting may add or remove
 * literal characters (spaces, group separators, brackets), so the caret is mapped by counting
 * *significant* characters (`accept`) before it: if the caret sat after the 7th digit before
 * formatting, it sits after the 7th digit after formatting. Backspace / Delete on a literal skip
 * over it and remove the significant character next to it, so separators never "trap" the caret.
 *
 * ```ts
 * const f = useFormattedInput({
 *   value, defaultValue, onValueChange,
 *   accept: (ch) => /\d/.test(ch),
 *   format: (typed) => typed.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 "),
 *   parse: (display) => display.replace(/\D/g, "") || null,
 *   toDisplay: (raw) => raw ?? "",
 * });
 * <input ref={f.ref} {...f.inputProps} />
 * ```
 */
export interface UseFormattedInputOptions {
  /** Controlled raw value (`null` = empty). `undefined` = uncontrolled. */
  value?: string | null;
  defaultValue?: string | null;
  /** Called with the new raw value whenever it changes. */
  onValueChange?: (raw: string | null, display: string) => void;
  /** Significant characters (kept by `format`, counted for the caret). */
  accept: (ch: string) => boolean;
  /** Typed text → display text. Must keep the order of accepted characters; may drop extras. */
  format: (typed: string) => string;
  /** Display text → raw value (`null` when empty / not a value yet). */
  parse: (display: string) => string | null;
  /** Raw value → display text (initial value, controlled updates). */
  toDisplay: (raw: string | null) => string;
  /** Final polish on blur (pad decimals, full international format…). Default: none. */
  formatOnBlur?: (display: string) => string;
  /** Raw values compare equal (avoid resetting the display for "1250.5" vs "1250.50"). Default `===`. */
  isSameValue?: (a: string | null, b: string | null) => boolean;
}

export interface FormattedInputState {
  /** Attach to the `<input>`. */
  ref: React.RefObject<HTMLInputElement | null>;
  display: string;
  raw: string | null;
  /** Spread on the `<input>` (compose your own handlers around them if needed). */
  inputProps: {
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
    onBlur: React.FocusEventHandler<HTMLInputElement>;
  };
  /** Replaces the current selection with `text` and formats (custom key handling, paste parsing). */
  insert: (text: string) => void;
  /** Sets the display directly (formatted with `format`), keeping the caret at the end. */
  setDisplay: (display: string) => void;
  /** Formats `typed` as if the user produced it with the caret at `caret`. */
  update: (typed: string, caret: number) => void;
}

/** Number of characters accepted by `accept` in `s`. */
export function countAccepted(s: string, accept: (ch: string) => boolean): number {
  let n = 0;
  for (const ch of s) if (accept(ch)) n++;
  return n;
}

/**
 * Index just after the `n`-th accepted character of `s` (0 when `n` is 0; the end when `s`
 * has fewer). Works on UTF-16 indexes (all masks in the kit are BMP characters).
 */
export function caretAfterAccepted(s: string, n: number, accept: (ch: string) => boolean): number {
  if (n <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < s.length; i++) {
    if (accept(s[i]!)) {
      seen++;
      if (seen === n) return i + 1;
    }
  }
  return s.length;
}

export function useFormattedInput(options: UseFormattedInputOptions): FormattedInputState {
  const opts = useLatest(options);
  const { value } = options;
  const controlled = value !== undefined;
  const ref = React.useRef<HTMLInputElement | null>(null);
  const [display, setDisplayState] = React.useState(() => options.toDisplay(controlled ? value ?? null : options.defaultValue ?? null));
  const displayRef = React.useRef(display);
  displayRef.current = display;
  const lastRaw = React.useRef<string | null>(controlled ? value ?? null : options.defaultValue ?? null);
  const pendingCaret = React.useRef<number | null>(null);

  // Controlled value changed from outside → re-derive the display.
  const same = options.isSameValue ?? ((a: string | null, b: string | null) => a === b);
  if (controlled && !same(value ?? null, lastRaw.current)) {
    lastRaw.current = value ?? null;
    const next = options.toDisplay(value ?? null);
    if (next !== display) {
      displayRef.current = next;
      setDisplayState(next);
    }
  }

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    const caret = pendingCaret.current;
    if (el && caret != null && el.ownerDocument.activeElement === el) {
      el.setSelectionRange(caret, caret);
    }
    pendingCaret.current = null;
  });

  const commit = React.useCallback(
    (next: string, caret: number | null) => {
      const o = opts.current!;
      const el = ref.current;
      if (el) {
        // Write synchronously so React's controlled-value restore never moves the caret.
        if (el.value !== next) el.value = next;
        if (caret != null && el.ownerDocument.activeElement === el) el.setSelectionRange(caret, caret);
      }
      pendingCaret.current = caret;
      displayRef.current = next;
      setDisplayState(next);
      const raw = o.parse(next);
      if (!(o.isSameValue ?? ((a, b) => a === b))(raw, lastRaw.current)) {
        lastRaw.current = raw;
        o.onValueChange?.(raw, next);
      }
    },
    [opts],
  );

  const apply = React.useCallback(
    (typed: string, caret: number) => {
      const o = opts.current!;
      const n = countAccepted(typed.slice(0, caret), o.accept);
      const next = o.format(typed);
      commit(next, caretAfterAccepted(next, n, o.accept));
    },
    [opts, commit],
  );

  const onChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const el = e.currentTarget;
      apply(el.value, el.selectionStart ?? el.value.length);
    },
    [apply],
  );

  const onKeyDown = React.useCallback<React.KeyboardEventHandler<HTMLInputElement>>(
    (e) => {
      if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return;
      if (e.key !== "Backspace" && e.key !== "Delete") return;
      const el = e.currentTarget;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? start;
      if (start !== end) return;
      const s = el.value;
      const accept = opts.current!.accept;
      if (e.key === "Backspace") {
        if (start === 0 || accept(s[start - 1]!)) return;
        // A literal before the caret: delete the significant character before it instead.
        let j = start - 1;
        while (j >= 0 && !accept(s[j]!)) j--;
        e.preventDefault();
        if (j < 0) {
          el.setSelectionRange(0, 0);
          return;
        }
        apply(s.slice(0, j) + s.slice(j + 1), j);
      } else {
        if (start >= s.length || accept(s[start]!)) return;
        let k = start;
        while (k < s.length && !accept(s[k]!)) k++;
        e.preventDefault();
        if (k >= s.length) return;
        apply(s.slice(0, k) + s.slice(k + 1), start);
      }
    },
    [opts, apply],
  );

  const onBlur = React.useCallback<React.FocusEventHandler<HTMLInputElement>>(() => {
    const o = opts.current!;
    if (!o.formatOnBlur) return;
    const next = o.formatOnBlur(displayRef.current);
    if (next !== displayRef.current) commit(next, null);
  }, [opts, commit]);

  const insert = React.useCallback(
    (text: string) => {
      const el = ref.current;
      const s = el?.value ?? displayRef.current;
      const start = el?.selectionStart ?? s.length;
      const end = el?.selectionEnd ?? start;
      apply(s.slice(0, start) + text + s.slice(end), start + text.length);
    },
    [apply],
  );

  const setDisplay = React.useCallback(
    (d: string) => {
      const next = opts.current!.format(d);
      commit(next, next.length);
    },
    [opts, commit],
  );

  return {
    ref,
    display,
    raw: lastRaw.current,
    inputProps: { value: display, onChange, onKeyDown, onBlur },
    insert,
    setDisplay,
    update: apply,
  };
}
