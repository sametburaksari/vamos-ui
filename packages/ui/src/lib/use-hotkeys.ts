import * as React from "react";
import { useLatest } from "./use-controllable-state";

/**
 * Shortcut strings are `+`-separated, case-insensitive: `"mod+k"`, `"shift+?"`, `"esc"`, `"mod+shift+p"`.
 * `mod` is ⌘ on Apple platforms and Ctrl elsewhere. Several shortcuts: pass an array.
 *
 * Key aliases: `esc`, `enter`/`return`, `space`, `tab`, `backspace`, `delete`/`del`, `up`, `down`, `left`, `right`,
 * `pageup`, `pagedown`, `home`, `end`, `plus`, `comma`, `period`, `slash`, `f1`…`f12`. Any other single character
 * matches `event.key`.
 */
export type Shortcut = string;

export interface ParsedShortcut {
  key: string;
  mod: boolean;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

const KEY_ALIASES: Record<string, string> = {
  esc: "escape",
  return: "enter",
  space: " ",
  spacebar: " ",
  del: "delete",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  plus: "+",
  comma: ",",
  period: ".",
  slash: "/",
  cmd: "meta",
  command: "meta",
  option: "alt",
  opt: "alt",
  control: "ctrl",
};

/** `true` on macOS, iOS and iPadOS. Always `false` on the server. */
export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}

const noopSubscribe = () => () => {};

/**
 * Platform check that is safe for SSR: renders as non-Apple ("Ctrl") on the server and during
 * hydration, then switches to "⌘" on Apple devices without a hydration mismatch.
 */
export function useIsMac(): boolean {
  return React.useSyncExternalStore(noopSubscribe, isApplePlatform, () => false);
}

/** Parses `"mod+shift+k"` into its parts. */
export function parseShortcut(shortcut: Shortcut): ParsedShortcut {
  const parts = shortcut
    .toLowerCase()
    .split(/\+(?!$)/) // keep a trailing "+" as the key ("mod++")
    .map((p) => p.trim())
    .filter(Boolean);
  const out: ParsedShortcut = { key: "", mod: false, ctrl: false, meta: false, alt: false, shift: false };
  for (const raw of parts) {
    const p = KEY_ALIASES[raw] ?? raw;
    if (p === "mod") out.mod = true;
    else if (p === "ctrl") out.ctrl = true;
    else if (p === "meta") out.meta = true;
    else if (p === "alt") out.alt = true;
    else if (p === "shift") out.shift = true;
    else out.key = p;
  }
  return out;
}

const isLetterOrDigit = (k: string) => /^[a-z0-9]$/.test(k);

/** Does this keyboard event match the shortcut? */
export function matchesShortcut(event: KeyboardEvent | React.KeyboardEvent, shortcut: Shortcut | ParsedShortcut, isMac = isApplePlatform()): boolean {
  const s = typeof shortcut === "string" ? parseShortcut(shortcut) : shortcut;
  if (!s.key) return false;
  const wantMeta = s.meta || (s.mod && isMac);
  const wantCtrl = s.ctrl || (s.mod && !isMac);
  if (event.metaKey !== wantMeta || event.ctrlKey !== wantCtrl || event.altKey !== s.alt) return false;

  const key = (event.key ?? "").toLowerCase();
  const code = (event as KeyboardEvent).code ?? "";
  // Shift is implied for symbols ("?" is shift+/ on US layouts) — only enforce it for letters, digits and named keys.
  const symbol = s.key.length === 1 && !isLetterOrDigit(s.key);
  if (!symbol && event.shiftKey !== s.shift) return false;
  if (key === s.key) return true;
  // Layout-independent fallback (Option on macOS changes event.key: alt+k → "˚").
  if (isLetterOrDigit(s.key)) return code === `Key${s.key.toUpperCase()}` || code === `Digit${s.key}`;
  return false;
}

export interface ShortcutKeyLabels {
  mod?: string;
  ctrl?: string;
  alt?: string;
  shift?: string;
  meta?: string;
}

const MAC_SYMBOLS: Record<string, string> = {
  mod: "⌘",
  meta: "⌘",
  ctrl: "⌃",
  alt: "⌥",
  shift: "⇧",
  enter: "↩",
  backspace: "⌫",
  delete: "⌦",
  escape: "Esc",
  tab: "⇥",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  " ": "Space",
  pageup: "PgUp",
  pagedown: "PgDn",
};
const PC_NAMES: Record<string, string> = {
  mod: "Ctrl",
  meta: "Win",
  ctrl: "Ctrl",
  alt: "Alt",
  shift: "Shift",
  enter: "Enter",
  backspace: "Backspace",
  delete: "Del",
  escape: "Esc",
  tab: "Tab",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  " ": "Space",
  pageup: "PgUp",
  pagedown: "PgDn",
};

/**
 * Canonical key tokens of a shortcut in display order, e.g. `"mod+shift+k"` → `["mod", "shift", "k"]`
 * (Apple order is ⌃ ⌥ ⇧ ⌘; elsewhere Ctrl, Alt, Shift). Kbd uses this to render one keycap per key.
 */
export function shortcutKeys(shortcut: Shortcut, isMac = false): string[] {
  const s = parseShortcut(shortcut);
  const mods: string[] = [];
  const push = (cond: boolean, k: string) => cond && mods.push(k);
  if (isMac) {
    push(s.ctrl, "ctrl");
    push(s.alt, "alt");
    push(s.shift, "shift");
    push(s.meta || s.mod, "mod");
  } else {
    push(s.ctrl || s.mod, "ctrl");
    push(s.meta, "meta");
    push(s.alt, "alt");
    push(s.shift, "shift");
  }
  return s.key ? [...mods, s.key] : mods;
}

/** Display text for one key token (`"mod"` → `"⌘"` / `"Ctrl"`, `"k"` → `"K"`). */
export function formatKey(key: string, isMac = false): string {
  const k = KEY_ALIASES[key.toLowerCase()] ?? key.toLowerCase();
  const table = isMac ? MAC_SYMBOLS : PC_NAMES;
  if (table[k]) return table[k]!;
  if (/^f\d{1,2}$/.test(k)) return k.toUpperCase();
  return k.length === 1 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1);
}

/**
 * Human-readable shortcut: `"mod+k"` → `"⌘K"` on Apple platforms, `"Ctrl+K"` elsewhere.
 * Pass `isMac` explicitly in render code (from `useIsMac()`) so SSR and client agree.
 */
export function formatShortcut(shortcut: Shortcut, options: { isMac?: boolean; separator?: string } = {}): string {
  const isMac = options.isMac ?? isApplePlatform();
  const keys = shortcutKeys(shortcut, isMac).map((k) => formatKey(k, isMac));
  return keys.join(options.separator ?? (isMac ? "" : "+"));
}

export interface UseHotkeysOptions {
  /** Default `true`. */
  enabled?: boolean;
  /** Call `preventDefault()` on match. Default `true`. */
  preventDefault?: boolean;
  /**
   * Fire while focus is in an input, textarea, select or contenteditable.
   * Default: `true` for shortcuts with Ctrl/⌘/Alt (e.g. `mod+k`), `false` for plain keys (e.g. `/`, `?`, `j`).
   */
  enableOnFormFields?: boolean;
  /** Element to listen on. Default `document`. */
  target?: React.RefObject<HTMLElement | null> | HTMLElement | Document | null;
  /** Default `"keydown"`. */
  event?: "keydown" | "keyup";
  /** Ignore auto-repeat while the key is held. Default `false`. */
  ignoreRepeat?: boolean;
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!el || !(el as HTMLElement).tagName) return false;
  const t = el as HTMLElement;
  const tag = t.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    const type = (t as HTMLInputElement).type;
    return !["checkbox", "radio", "button", "submit", "reset", "range", "color", "file"].includes(type);
  }
  return t.isContentEditable;
}

/**
 * Registers global (or element-scoped) keyboard shortcuts.
 *
 * ```ts
 * useHotkeys("mod+k", () => setOpen(true));
 * useHotkeys(["j", "down"], next, { enabled: listFocused });
 * ```
 *
 * IME composition is ignored. The kit itself only registers `mod+k`, `mod+\` and opt-in layout
 * shortcuts; everything else belongs to the app (avoid clashing with browsers and rich-text editors).
 */
export function useHotkeys(shortcuts: Shortcut | Shortcut[], handler: (event: KeyboardEvent) => void, options: UseHotkeysOptions = {}): void {
  const { enabled = true, preventDefault = true, enableOnFormFields, target, event = "keydown", ignoreRepeat = false } = options;
  const handlerRef = useLatest(handler);
  const list = Array.isArray(shortcuts) ? shortcuts : [shortcuts];
  const key = list.join("|");

  React.useEffect(() => {
    if (!enabled || typeof document === "undefined") return;
    const parsed = key.split("|").map(parseShortcut);
    const el: HTMLElement | Document | null | undefined =
      target && "current" in (target as object) ? (target as React.RefObject<HTMLElement | null>).current : (target as HTMLElement | Document | null | undefined);
    const node = el ?? document;
    const mac = isApplePlatform();
    const listener = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.isComposing || ke.key === "Process" || (ignoreRepeat && ke.repeat)) return;
      for (const s of parsed) {
        if (!matchesShortcut(ke, s, mac)) continue;
        const withModifier = s.mod || s.ctrl || s.meta || s.alt;
        if (isTypingTarget(ke.target) && !(enableOnFormFields ?? withModifier)) return;
        if (preventDefault) ke.preventDefault();
        handlerRef.current(ke);
        return;
      }
    };
    node.addEventListener(event, listener);
    return () => node.removeEventListener(event, listener);
  }, [key, enabled, preventDefault, enableOnFormFields, target, event, ignoreRepeat, handlerRef]);
}
