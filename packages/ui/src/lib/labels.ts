import * as React from "react";
import { useLocale, type ResolvedMessages } from "./locale";
import { formatMessage } from "./message-format";
import type { MessagesInput } from "../locales/en";

/** A flat map of label keys to English templates. */
export type LabelValues = Record<string, string>;

/** Per-instance label overrides (the `labels` prop of a component). */
export type LabelsProp<T extends LabelValues> = Partial<T>;

/**
 * A label lookup: call it to get a formatted string, read `.labels` for the raw merged templates.
 *
 * ```ts
 * t("remove", { label: "Design" }); // "Remove Design"
 * t.labels.remove;                  // "Remove {label}"
 * ```
 */
export interface LabelFn<T extends LabelValues> {
  (key: keyof T & string, vars?: Record<string, unknown>): string;
  readonly labels: T;
  readonly locale: string;
}

/**
 * Merges label sources. Precedence (highest first): per-instance `override` → dictionary
 * `messages[namespace]` → English `defaults`. `undefined` overrides are ignored.
 */
export function resolveLabels<T extends LabelValues>(
  namespace: string,
  defaults: T,
  messages?: ResolvedMessages | MessagesInput,
  override?: Partial<T>,
): T {
  const dict = (messages as Record<string, Record<string, string | undefined> | undefined> | undefined)?.[namespace];
  const out: Record<string, string> = { ...defaults };
  if (dict) for (const k in dict) if (typeof dict[k] === "string") out[k] = dict[k]!;
  if (override) for (const k in override) if (typeof override[k] === "string") out[k] = override[k]!;
  return out as T;
}

/**
 * Server-friendly label lookup (no React context): for server components and `createBlocks({ labels })`.
 *
 * ```ts
 * const t = createLabels("footer", { rights: "All rights reserved." }, { locale: "tr-TR", messages: tr });
 * ```
 */
export function createLabels<T extends LabelValues>(
  namespace: string,
  defaults: T,
  options: { locale?: string; messages?: ResolvedMessages | MessagesInput; override?: Partial<T> } = {},
): LabelFn<T> {
  const labels = resolveLabels(namespace, defaults, options.messages, options.override);
  const locale = options.locale ?? "en-US";
  const fn = ((key: keyof T & string, vars?: Record<string, unknown>) => formatMessage(labels[key] ?? String(key), vars, locale)) as LabelFn<T>;
  Object.defineProperties(fn, { labels: { value: labels }, locale: { value: locale } });
  return fn;
}

/**
 * Built-in strings for a component. Pass the component's English defaults (a module constant)
 * and its `labels` prop; translations come from `LocaleProvider` messages under `namespace`.
 *
 * ```tsx
 * const badgeLabels = { remove: "Remove {label}" };
 * function Chip({ label, labels }: { label: string; labels?: Partial<typeof badgeLabels> }) {
 *   const t = useLabels("badge", badgeLabels, labels);
 *   return <button aria-label={t("remove", { label })}>…</button>;
 * }
 * ```
 *
 * Templates support `{name}` and `{count, plural, one {# item} other {# items}}` (Intl.PluralRules).
 */
export function useLabels<T extends LabelValues>(namespace: string, defaults: T, override?: Partial<T>): LabelFn<T> {
  const { locale, messages } = useLocale();
  // Overrides are usually inline objects; key them by content so the result stays stable.
  const overrideKey = override ? JSON.stringify(override) : "";
  return React.useMemo(
    () => createLabels(namespace, defaults, { locale, messages, override }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [namespace, defaults, locale, messages, overrideKey],
  );
}
