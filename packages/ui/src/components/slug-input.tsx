"use client";

import * as React from "react";
import { Check, CircleAlert, Link2, Pencil, RefreshCw } from "lucide-react";
import { cn } from "../lib/cn";
import { mergeIds, useComposedRefs } from "../lib/compose-refs";
import { useFieldContext } from "../lib/field-context";
import { useLabels, type LabelFn } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { slugify } from "../lib/text";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { useFormattedInput } from "../lib/use-formatted-input";
import { Button } from "./button";
import { Input } from "./input";
import { Spinner } from "./spinner";
import { WithoutFieldName } from "./formatted-input";

const slugLabels = {
  edit: "Edit",
  editSlug: "Edit URL",
  done: "Done",
  cancel: "Cancel",
  auto: "Auto",
  autoHint: "Follows the title until you edit it",
  regenerate: "Regenerate from title",
  checking: "Checking availability…",
  available: "Available",
  taken: "This URL is already in use",
  useSuggestion: "Use {slug}",
  empty: "Add a title to create the URL",
  slug: "URL slug",
};
export type SlugInputLabels = typeof slugLabels;

type Check = { state: "idle" } | { state: "checking" } | { state: "ok" } | { state: "error"; message: string; suggestion?: string };

export interface SlugInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (slug: string) => void;
  /** Text the slug is derived from (the title) until the user edits the slug. */
  source?: string;
  /** `true` = manual: stops following `source`. Saved content should start locked. */
  locked?: boolean;
  /** Default: `true` when there is an initial slug, else `false` (auto). */
  defaultLocked?: boolean;
  onLockedChange?: (locked: boolean) => void;
  /** Shown before the slug: `"vamos.ist/blog/"`. */
  prefix?: string;
  /** Default 80. Cut at a word boundary when possible. */
  maxLength?: number;
  /** Transliteration rules. Default: the LocaleProvider's locale. */
  locale?: string;
  /**
   * Async uniqueness check, debounced. Resolve `true` when free, or a message ("Used by
   * “Spring menu”") when not. The signal aborts when the slug changes again.
   */
  validate?: (slug: string, signal: AbortSignal) => Promise<string | true>;
  /** Offer a free alternative after a failed check ("spring-menu-2"). */
  suggestUnique?: (slug: string) => Promise<string>;
  /** Debounce for `validate`, ms. Default 350. */
  validateDelay?: number;
  /** `"field"`: always an input (default). `"permalink"`: a link with "Edit" that opens the input inline. */
  variant?: "field" | "permalink";
  /** Link target for the permalink view. Default: `prefix + slug` when the prefix looks like a URL. */
  href?: string;
  size?: "sm" | "md" | "lg";
  name?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  labels?: Partial<SlugInputLabels>;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

/**
 * URL slug derived from a title, with locale transliteration ("İşe Alım & Oryantasyon" →
 * `ise-alim-ve-oryantasyon` in Turkish), a lock once edited by hand, and an optional async
 * uniqueness check with a suggested alternative.
 *
 * ```tsx
 * <Field label="URL"><SlugInput source={title} prefix="vamos.ist/blog/" validate={checkSlug} /></Field>
 * <SlugInput variant="permalink" source={title} prefix="https://vamos.ist/blog/" />
 * ```
 */
export const SlugInput = /*#__PURE__*/ React.forwardRef<HTMLInputElement, SlugInputProps>(function SlugInput(props, forwardedRef) {
  const {
    value,
    defaultValue,
    onValueChange,
    source,
    locked: lockedProp,
    defaultLocked,
    onLockedChange,
    prefix,
    maxLength = 80,
    locale: localeProp,
    validate,
    suggestUnique,
    validateDelay = 350,
    variant = "field",
    href,
    size,
    name,
    id,
    disabled,
    invalid,
    placeholder,
    labels,
    className,
    "aria-label": ariaLabel,
    "aria-describedby": describedByProp,
    ...rest
  } = props;
  const { locale: providerLocale } = useLocale();
  const locale = localeProp ?? providerLocale;
  const t = useLabels("slug", slugLabels, labels);
  const field = useFieldContext();
  const submitName = name ?? field?.name;
  const messageId = React.useId();

  const initial = value ?? defaultValue ?? "";
  const [slug, setSlug] = useControllableState<string>({ value, defaultValue: defaultValue ?? "", onChange: onValueChange, name: "SlugInput" });
  const [locked, setLocked] = useControllableState<boolean>({ value: lockedProp, defaultValue: defaultLocked ?? initial !== "", onChange: onLockedChange, name: "SlugInput" });
  const derive = React.useCallback((s: string) => slugify(s, { locale, maxLength }), [locale, maxLength]);

  // Follow the source while unlocked.
  React.useEffect(() => {
    if (locked || source === undefined) return;
    const next = derive(source);
    if (next !== slug) setSlug(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, locked, derive]);

  /* ---------------- typing (sanitised live, caret kept) ---------------- */

  const accept = (ch: string) => /^[\p{L}\p{N}\s_-]$/u.test(ch);
  const sanitize = (typed: string) => {
    const trailing = /[\s_-]$/.test(typed);
    let s = slugify(typed, { locale, maxLength });
    if (trailing && s && s.length < maxLength) s += "-";
    return s;
  };
  const engine = useFormattedInput({
    value: slug,
    accept,
    format: sanitize,
    parse: (d) => d.replace(/-+$/, ""),
    toDisplay: (raw) => raw ?? "",
    formatOnBlur: (d) => d.replace(/-+$/, ""),
    onValueChange: (raw) => {
      setSlug(raw ?? "");
      if (!locked) setLocked(true);
    },
  });
  const ref = useComposedRefs(forwardedRef, engine.ref);

  /* ---------------- uniqueness ---------------- */

  const [check, setCheck] = React.useState<Check>({ state: "idle" });
  const validateRef = useLatest(validate);
  const suggestRef = useLatest(suggestUnique);
  React.useEffect(() => {
    const fn = validateRef.current;
    if (!fn || !slug) {
      setCheck({ state: "idle" });
      return;
    }
    const ac = new AbortController();
    setCheck({ state: "checking" });
    const timer = setTimeout(async () => {
      try {
        const res = await fn(slug, ac.signal);
        if (ac.signal.aborted) return;
        if (res === true) {
          setCheck({ state: "ok" });
          return;
        }
        const message = typeof res === "string" && res ? res : t("taken");
        setCheck({ state: "error", message });
        const sug = suggestRef.current;
        if (sug) {
          const suggestion = await sug(slug);
          if (!ac.signal.aborted && suggestion && suggestion !== slug) setCheck({ state: "error", message, suggestion });
        }
      } catch {
        if (!ac.signal.aborted) setCheck({ state: "idle" });
      }
    }, validateDelay);
    return () => {
      ac.abort();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, validateDelay]);

  const regenerate = () => {
    setLocked(false);
    if (source !== undefined) setSlug(derive(source));
  };
  const applySuggestion = (s: string) => {
    setSlug(s);
    setLocked(true);
    engine.ref.current?.focus();
  };

  const isInvalid = invalid || check.state === "error";
  const canRegenerate = locked && source !== undefined && derive(source) !== slug && !!derive(source);

  const status =
    check.state === "checking" ? (
      <Spinner size="xs" className="text-fg-subtle" />
    ) : check.state === "ok" ? (
      <Check aria-hidden className="size-3.5 text-success" />
    ) : check.state === "error" ? (
      <CircleAlert aria-hidden className="size-3.5 text-danger" />
    ) : null;

  const lockControl = !locked && source !== undefined ? (
    <span data-slot="slug-input-auto" title={t("autoHint")} className="me-1.5 inline-flex h-5 items-center rounded-full bg-accent-soft px-2 text-[11px] font-medium text-accent-ink">
      {t("auto")}
    </span>
  ) : canRegenerate && !disabled ? (
    <button
      type="button"
      data-slot="slug-input-regenerate"
      onClick={regenerate}
      aria-label={t("regenerate")}
      title={t("regenerate")}
      className="me-1 inline-flex size-7 items-center justify-center rounded-ui-sm text-fg-subtle transition-colors hover:bg-hover hover:text-fg focus-ring [&_svg]:size-3.5"
    >
      <RefreshCw aria-hidden className="rtl:-scale-x-100" />
    </button>
  ) : null;

  const message =
    check.state === "error" ? (
      <p id={messageId} data-slot="slug-input-message" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-danger">
        <span>{check.message}</span>
        {check.suggestion ? (
          <button
            type="button"
            onClick={() => applySuggestion(check.suggestion!)}
            className="rounded-ui-sm font-mono text-[11.5px] font-medium text-fg underline decoration-line underline-offset-[3px] transition-colors hover:decoration-fg focus-ring"
          >
            {t("useSuggestion", { slug: check.suggestion })}
          </button>
        ) : null}
      </p>
    ) : null;

  const live = (
    <span className="sr-only" aria-live="polite">
      {check.state === "checking" ? t("checking") : check.state === "ok" ? t("available") : check.state === "error" ? check.message : ""}
    </span>
  );

  const input = (extra?: { onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>; autoFocus?: boolean; trailingExtra?: React.ReactNode }) => (
    <WithoutFieldName>
      <Input
        ref={ref}
        {...engine.inputProps}
        id={id}
        size={size}
        disabled={disabled}
        invalid={isInvalid}
        dir="ltr"
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        placeholder={placeholder ?? (source !== undefined && !source ? t("empty") : undefined)}
        aria-label={ariaLabel ?? (field ? undefined : t("slug"))}
        aria-describedby={mergeIds(describedByProp, message ? messageId : undefined)}
        addonStart={prefix ? <span className="max-w-[16rem] truncate font-mono text-[12px] text-fg-subtle max-sm:max-w-[9rem]" title={prefix}>{prefix}</span> : undefined}
        inputClassName="font-mono text-[13px]"
        data-slot="slug-input-control"
        trailing={
          status || lockControl || extra?.trailingExtra ? (
            <span className="flex items-center gap-1">
              {status ? <span className="flex size-5 items-center justify-center">{status}</span> : null}
              {lockControl}
              {extra?.trailingExtra}
            </span>
          ) : undefined
        }
        onKeyDown={(e) => {
          extra?.onKeyDown?.(e);
          if (!e.defaultPrevented) engine.inputProps.onKeyDown(e);
        }}
      />
    </WithoutFieldName>
  );

  const hidden = submitName ? <input type="hidden" name={submitName} value={slug} disabled={disabled} /> : null;

  if (variant === "permalink") {
    return (
      <Permalink
        {...rest}
        className={className}
        slug={slug}
        prefix={prefix}
        href={href}
        disabled={disabled}
        t={t}
        input={input}
        message={message}
        live={live}
        hiddenInput={hidden}
        status={status}
        onCancel={(previous) => setSlug(previous)}
        onConfirm={() => {
          const el = engine.ref.current;
          if (el) engine.inputProps.onBlur({ currentTarget: el } as React.FocusEvent<HTMLInputElement>);
        }}
      />
    );
  }

  return (
    <div {...rest} data-slot="slug-input" data-locked={locked ? "" : undefined} className={cn("grid min-w-0 gap-1.5", className)}>
      {input()}
      {message}
      {live}
      {hidden}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Permalink view                                                      */
/* ------------------------------------------------------------------ */

function Permalink({
  slug,
  prefix,
  href,
  disabled,
  t,
  input,
  message,
  live,
  hiddenInput,
  status,
  onCancel,
  onConfirm,
  className,
  ...rest
}: Omit<React.HTMLAttributes<HTMLDivElement>, "onCancel"> & {
  slug: string;
  prefix?: string;
  href?: string;
  disabled?: boolean;
  t: LabelFn<SlugInputLabels>;
  input: (extra?: { onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>; trailingExtra?: React.ReactNode }) => React.ReactNode;
  message: React.ReactNode;
  live: React.ReactNode;
  hiddenInput: React.ReactNode;
  status: React.ReactNode;
  onCancel: (previous: string) => void;
  onConfirm: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const previous = React.useRef(slug);
  const editRef = React.useRef<HTMLButtonElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const returnFocus = React.useRef(false);

  React.useEffect(() => {
    if (editing) wrapRef.current?.querySelector<HTMLInputElement>("input:not([type=hidden])")?.focus();
    else if (returnFocus.current) {
      returnFocus.current = false;
      editRef.current?.focus();
    }
  }, [editing]);

  const open = () => {
    previous.current = slug;
    setEditing(true);
  };
  const close = (keep: boolean) => {
    if (keep) onConfirm();
    else onCancel(previous.current);
    returnFocus.current = true;
    setEditing(false);
  };

  const link = href ?? (prefix && /^(https?:)?\/\//.test(prefix) ? prefix + slug : undefined);

  return (
    <div {...rest} ref={wrapRef} data-slot="slug-input" data-variant="permalink" className={cn("grid min-w-0 gap-1.5", className)}>
      {editing ? (
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0 flex-1">
            {input({
              onKeyDown: (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  close(true);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  e.stopPropagation();
                  close(false);
                }
              },
            })}
          </div>
          <Button size="sm" variant="primary" onClick={() => close(true)}>
            {t("done")}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => close(false)}>
            {t("cancel")}
          </Button>
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-2 text-[13px]">
          <Link2 aria-hidden className="size-3.5 shrink-0 text-fg-subtle rtl:-scale-x-100" />
          <span dir="ltr" className="min-w-0 truncate font-mono text-[12.5px]">
            {link ? (
              <a href={link} target="_blank" rel="noreferrer" className="rounded-ui-sm text-fg-muted underline decoration-line underline-offset-[3px] transition-colors hover:text-fg hover:decoration-fg-subtle focus-ring">
                <span className="text-fg-subtle">{prefix}</span>
                <span className="text-fg">{slug || "…"}</span>
              </a>
            ) : (
              <>
                <span className="text-fg-subtle">{prefix}</span>
                <span className="text-fg">{slug || "…"}</span>
              </>
            )}
          </span>
          {status ? <span className="flex size-4 shrink-0 items-center justify-center">{status}</span> : null}
          <Button ref={editRef} size="xs" variant="ghost" className="shrink-0" disabled={disabled} onClick={open} aria-label={t("editSlug")}>
            <Pencil aria-hidden /> {t("edit")}
          </Button>
        </div>
      )}
      {message}
      {live}
      {hiddenInput}
    </div>
  );
}
