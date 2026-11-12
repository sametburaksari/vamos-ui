"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { mergeIds } from "../lib/compose-refs";
import { useFieldControl } from "../lib/field-context";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { foldText, highlightParts, matchText } from "../lib/text";
import { useAsyncList } from "../lib/use-async-list";
import { useControllableState } from "../lib/use-controllable-state";
import { controlVariants, itemVariants } from "../lib/variants";
import { Badge, type BadgeProps } from "./badge";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";
import { Spinner } from "./spinner";

const tagInputLabels = {
  placeholder: "Add a tag…",
  list: "Tags",
  suggestions: "Suggestions",
  added: "“{tag}” added",
  removed: "“{tag}” removed",
  duplicate: "“{tag}” is already added",
  max: "{max, plural, one {Up to # tag} other {Up to # tags}}",
  notAllowed: "“{tag}” isn't one of the options",
  tooLong: "{max, plural, one {Tags can be at most # character} other {Tags can be at most # characters}}",
  invalid: "{tag}: {message}",
  remove: "Remove {label}",
  loading: "Loading suggestions…",
};
export type TagInputLabels = typeof tagInputLabels;

export type TagDelimiter = "Enter" | "Tab" | "," | ";" | " " | (string & {});

export interface TagInputProps {
  /** Current tags (controlled). */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  /**
   * Suggestions under the input: a static list (filtered with locale folding), or a loader
   * `(query, signal) => Promise<string[]>` — debounced and aborted for you.
   */
  suggestions?: string[] | ((query: string, signal: AbortSignal) => Promise<string[]>);
  /** `false`: only suggestions can be added. Default `true`. */
  allowCustom?: boolean;
  /** Keys that commit the typed text. Default `["Enter", "Tab", ","]`. Paste always splits on comma, semicolon and newline. */
  delimiters?: TagDelimiter[];
  /** Maximum number of tags. */
  max?: number;
  /** Maximum characters per tag. */
  maxLength?: number;
  /** Return an error message for an invalid tag; it is kept, shown in the danger tone and makes the field invalid. */
  validate?: (tag: string) => string | true;
  /** Normalise before adding. Default: trim and collapse inner whitespace. */
  transform?: (tag: string) => string;
  /** Duplicate check: `"fold"` (default) treats "İstanbul" and "istanbul" as the same tag. */
  dedupe?: "fold" | "exact";
  /** Badge tone per tag (segment colours, status). */
  tagTone?: (tag: string) => BadgeProps["tone"];
  /** Commit the typed text when the input loses focus. Default `false`. */
  addOnBlur?: boolean;
  /** Each tag submits one entry under this name (`formData.getAll(name)`). */
  name?: string;
  placeholder?: string;
  size?: "sm" | "md";
  /** `"ghost"`: borderless until hover/focus. */
  variant?: "default" | "ghost";
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
  /** Built-in string overrides (`tagInput` namespace). */
  labels?: Partial<TagInputLabels>;
}

const defaultTransform = (s: string) => s.replace(/\s+/g, " ").trim();
const PASTE_SPLIT = /[,;\n\r\t]+/;

/**
 * Free-form multi-value entry: post tags, contact segments, skills, recipients, keywords.
 * Chips live inside the box with a trailing text input. Enter, Tab or comma add; paste splits a
 * comma- or newline-separated list; Backspace on the empty input moves to the last chip, and a
 * second Backspace removes it; ←/→ move between chips. Adds and removals are announced.
 *
 * ```tsx
 * <Field label="Tags"><TagInput name="tags" suggestions={existingTags} max={10} /></Field>
 * <TagInput validate={(v) => /^\S+@\S+\.\S+$/.test(v) || "Not an email address"} />
 * ```
 */
export const TagInput = /*#__PURE__*/ React.forwardRef<HTMLInputElement, TagInputProps>(function TagInput(props, forwardedRef) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    suggestions,
    allowCustom = true,
    delimiters = ["Enter", "Tab", ","],
    max,
    maxLength,
    validate,
    transform = defaultTransform,
    dedupe = "fold",
    tagTone,
    addOnBlur = false,
    name: nameProp,
    placeholder,
    size = "md",
    variant = "default",
    invalid,
    className,
    labels,
  } = props;
  const t = useLabels("tagInput", tagInputLabels, labels);
  const { locale } = useLocale();
  const control = useFieldControl({
    id: props.id,
    name: nameProp,
    disabled: props.disabled,
    readOnly: props.readOnly,
    required: props.required,
    "aria-invalid": invalid ? true : undefined,
    "aria-label": props["aria-label"],
    "aria-labelledby": props["aria-labelledby"],
    "aria-describedby": props["aria-describedby"],
  });
  const disabled = Boolean(control.disabled);
  const readOnly = Boolean(control.readOnly);
  const inert = disabled || readOnly;

  const [tags, setTags] = useControllableState<string[]>({ value: valueProp, defaultValue: defaultValue ?? [], onChange: onValueChange, name: "TagInput" });
  const [text, setText] = React.useState("");
  const [announcement, setAnnouncement] = React.useState("");
  const [flash, setFlash] = React.useState<number | null>(null);
  const [focused, setFocused] = React.useState(false);
  const [listOpen, setListOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const chipsRef = React.useRef<HTMLUListElement>(null);
  const baseId = React.useId();
  const listId = `${baseId}-list`;
  const maxId = `${baseId}-max`;

  const key = React.useCallback((s: string) => (dedupe === "fold" ? foldText(s, locale) : s), [dedupe, locale]);
  const full = max !== undefined && tags.length >= max;

  /* ---------------------------------------------------------------- suggestions */
  const loader = typeof suggestions === "function" ? suggestions : undefined;
  const async = useAsyncList<string>({ load: loader, query: text.trim(), enabled: Boolean(loader) && focused && listOpen });
  const taken = React.useMemo(() => new Set(tags.map(key)), [tags, key]);
  const options = React.useMemo(() => {
    const source = Array.isArray(suggestions) ? suggestions.filter((s) => !text.trim() || matchText(s, text.trim(), locale)) : async.items;
    return source.filter((s) => !taken.has(key(s))).slice(0, 50);
  }, [suggestions, async.items, text, locale, taken, key]);
  const hasSuggestions = suggestions !== undefined;
  const showList = hasSuggestions && focused && listOpen && !inert && !full && (options.length > 0 || async.loading);

  React.useEffect(() => {
    setActive(-1);
  }, [text]);

  /* ---------------------------------------------------------------- mutations */
  const say = (msg: string) => setAnnouncement((prev) => (prev === msg ? `${msg} ` : msg));

  const add = (raw: string, current: string[]): string[] | null => {
    const tag = transform(raw);
    if (!tag) return null;
    if (max !== undefined && current.length >= max) {
      say(t("max", { max }));
      return null;
    }
    if (maxLength !== undefined && tag.length > maxLength) {
      say(t("tooLong", { max: maxLength }));
      return null;
    }
    const k = key(tag);
    const dup = current.findIndex((x) => key(x) === k);
    if (dup >= 0) {
      setFlash(dup);
      say(t("duplicate", { tag: current[dup]! }));
      return null;
    }
    if (!allowCustom) {
      const pool = Array.isArray(suggestions) ? suggestions : async.items;
      const match = pool.find((s) => key(s) === k);
      if (!match) {
        say(t("notAllowed", { tag }));
        return null;
      }
      return [...current, match];
    }
    return [...current, tag];
  };

  const commit = (raws: string[]) => {
    let next = tags;
    const added: string[] = [];
    for (const raw of raws) {
      const r = add(raw, next);
      if (r) {
        added.push(r[r.length - 1]!);
        next = r;
      }
    }
    if (added.length === 0) return false;
    setTags(next);
    const message = validate ? validate(added[added.length - 1]!) : true;
    say(message === true ? t("added", { tag: added.join(", ") }) : t("invalid", { tag: added[added.length - 1]!, message }));
    return true;
  };

  const removeAt = (index: number, refocus: boolean) => {
    if (inert) return;
    const tag = tags[index];
    if (tag === undefined) return;
    setTags(tags.filter((_, i) => i !== index));
    say(t("removed", { tag }));
    if (!refocus) return;
    requestAnimationFrame(() => {
      const buttons = chipsRef.current?.querySelectorAll<HTMLButtonElement>('[data-slot="chip-remove"]');
      if (buttons && buttons.length > 0 && index > 0) buttons[index - 1]!.focus();
      else inputRef.current?.focus();
    });
  };

  React.useEffect(() => {
    if (flash === null) return;
    const id = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(id);
  }, [flash]);

  /* ---------------------------------------------------------------- input events */
  const charDelimiters = delimiters.filter((d) => d.length === 1);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (showList && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      const n = options.length;
      if (n === 0) return;
      setActive((i) => (e.key === "ArrowDown" ? (i + 1) % n : i <= 0 ? n - 1 : i - 1));
      return;
    }
    if (e.key === "ArrowDown" && hasSuggestions) {
      e.preventDefault();
      setListOpen(true);
      return;
    }
    if (e.key === "Escape" && showList) {
      e.preventDefault();
      setListOpen(false);
      return;
    }
    if (e.key === "Enter" && showList && active >= 0 && options[active]) {
      e.preventDefault();
      if (commit([options[active]!])) setText("");
      return;
    }
    if (delimiters.includes(e.key)) {
      if (!text.trim()) {
        // An empty Enter must not submit the form by accident; Tab moves on as usual.
        if (e.key === "Enter") e.preventDefault();
        return;
      }
      e.preventDefault();
      if (commit([text])) setText("");
      return;
    }
    if (e.key === "Backspace" && text === "" && tags.length > 0) {
      e.preventDefault();
      const buttons = chipsRef.current?.querySelectorAll<HTMLButtonElement>('[data-slot="chip-remove"]');
      buttons?.[buttons.length - 1]?.focus();
      return;
    }
    if ((e.key === "ArrowLeft" && !isRtl()) || (e.key === "ArrowRight" && isRtl())) {
      if (e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0 && tags.length > 0) {
        e.preventDefault();
        const buttons = chipsRef.current?.querySelectorAll<HTMLButtonElement>('[data-slot="chip-remove"]');
        buttons?.[buttons.length - 1]?.focus();
      }
    }
  };

  const isRtl = () => (boxRef.current ? getComputedStyle(boxRef.current).direction === "rtl" : false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // Typed (or IME-inserted) delimiter characters split the text.
    if (charDelimiters.some((d) => v.includes(d))) {
      const parts = v.split(new RegExp(`[${charDelimiters.map((d) => d.replace(/[\\\]^-]/g, "\\$&")).join("")}]`));
      const rest = parts.pop() ?? "";
      commit(parts);
      setText(rest);
    } else {
      setText(v);
    }
    setListOpen(true);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (!PASTE_SPLIT.test(pasted)) return;
    e.preventDefault();
    const parts = (text + pasted).split(PASTE_SPLIT).filter((p) => p.trim());
    commit(parts);
    setText("");
  };

  const onChipKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const buttons = [...(chipsRef.current?.querySelectorAll<HTMLButtonElement>('[data-slot="chip-remove"]') ?? [])];
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const rtl = isRtl();
    if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
      e.preventDefault();
      buttons[Math.max(0, i - 1)]!.focus();
    } else if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
      e.preventDefault();
      (buttons[i + 1] ?? inputRef.current)?.focus();
    } else if (e.key === "Escape" || (e.key.length === 1 && !e.metaKey && !e.ctrlKey)) {
      // Typing on a chip goes back to the input.
      inputRef.current?.focus();
    }
  };

  /* ---------------------------------------------------------------- render */
  const invalidTags = validate ? tags.map((tag) => validate(tag)) : null;
  const anyInvalid = invalidTags?.some((r) => r !== true) ?? false;
  const isInvalid = Boolean(control["aria-invalid"]) || anyInvalid;
  const activeId = active >= 0 ? `${listId}-${active}` : undefined;
  const name = control.name;

  const box = (
    <div
      ref={boxRef}
      data-slot="tag-input"
      data-size={size}
      data-readonly={readOnly ? "" : undefined}
      data-full={full ? "" : undefined}
      aria-invalid={isInvalid || undefined}
      aria-disabled={disabled || undefined}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget || e.target === chipsRef.current) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }}
      className={cn(
        controlVariants({ size, variant, multiline: true }),
        "cursor-text flex-wrap gap-1 py-1 ps-1.5 pe-2",
        size === "sm" ? "min-h-[calc(var(--control-h)-0.5rem)] py-0.5" : "min-h-(--control-h)",
        disabled && "cursor-not-allowed",
        className,
      )}
    >
      {tags.length > 0 ? (
        <ul ref={chipsRef} aria-label={t("list")} className="contents" onKeyDown={onChipKeyDown}>
          {tags.map((tag, i) => {
            const result = invalidTags?.[i];
            const bad = result !== undefined && result !== true;
            return (
              <li key={`${tag}-${i}`} className="flex min-w-0">
                <Badge
                  size={size === "sm" ? "sm" : "md"}
                  shape="square"
                  tone={bad ? "danger" : (tagTone?.(tag) ?? "neutral")}
                  data-flash={flash === i ? "" : undefined}
                  data-invalid={bad ? "" : undefined}
                  title={bad ? (result as string) : undefined}
                  className="ui-tag max-w-64 min-w-0"
                  onRemove={inert ? undefined : () => removeAt(i, true)}
                  removeLabel={t("remove", { label: tag })}
                >
                  <span className="truncate">{tag}</span>
                  {bad ? <span className="sr-only">, {result as string}</span> : null}
                </Badge>
              </li>
            );
          })}
        </ul>
      ) : null}
      <input
        ref={(node) => {
          inputRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        id={control.id}
        type="text"
        value={text}
        disabled={disabled}
        readOnly={readOnly || full}
        aria-label={control["aria-label"]}
        aria-labelledby={control["aria-labelledby"]}
        aria-describedby={mergeIds(control["aria-describedby"], max !== undefined ? maxId : undefined)}
        aria-invalid={isInvalid || undefined}
        aria-required={control.required || undefined}
        enterKeyHint="enter"
        autoComplete="off"
        placeholder={full || readOnly ? undefined : tags.length === 0 ? (placeholder ?? t("placeholder")) : undefined}
        {...(hasSuggestions
          ? {
              role: "combobox",
              "aria-autocomplete": "list" as const,
              "aria-expanded": showList,
              "aria-controls": showList ? listId : undefined,
              "aria-activedescendant": showList ? activeId : undefined,
            }
          : {})}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setListOpen(false);
          if (addOnBlur && text.trim() && commit([text])) setText("");
        }}
        className={cn(
          "h-[calc(var(--control-h)-0.5rem)] min-w-0 flex-1 bg-transparent px-1.5 text-[length:inherit] text-fg outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed",
          size === "sm" && "h-[calc(var(--control-h)-0.875rem)]",
          full ? "w-2 min-w-2 max-w-2 flex-none caret-transparent" : "min-w-20",
        )}
      />
      {max !== undefined ? (
        <span aria-hidden className={cn("ms-auto shrink-0 self-center ps-1 text-[11px] tabular text-fg-subtle", full && "text-fg-muted")}>
          {tags.length}/{max}
        </span>
      ) : null}
      <span id={maxId} className="sr-only">
        {max !== undefined ? t("max", { max }) : ""}
      </span>
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
      {name ? tags.map((tag, i) => <input key={`${tag}-${i}`} type="hidden" name={name} value={tag} />) : null}
    </div>
  );

  if (!hasSuggestions) return box;

  return (
    <Popover open={showList} onOpenChange={(o) => !o && setListOpen(false)}>
      <PopoverAnchor asChild>{box}</PopoverAnchor>
      <PopoverContent
        size="trigger"
        padded={false}
        align="start"
        aria-label={t("suggestions")}
        className="min-w-48"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (boxRef.current?.contains(e.target as Node)) e.preventDefault();
        }}
      >
        <ul id={listId} role="listbox" aria-label={t("suggestions")} className="max-h-64 overflow-y-auto p-1">
          {async.loading && options.length === 0 ? (
            <li role="presentation" className="flex items-center gap-2 px-2 py-1.5 text-[13px] text-fg-muted">
              <Spinner size="xs" tone="muted" />
              {t("loading")}
            </li>
          ) : null}
          {options.map((option, i) => (
            <li
              key={option}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              data-selected={i === active ? "true" : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onMouseMove={() => setActive(i)}
              onClick={() => {
                if (commit([option])) setText("");
                inputRef.current?.focus();
              }}
              className={itemVariants({ size: size === "sm" ? "sm" : "md" })}
            >
              <span className="truncate">
                {highlightParts(option, text.trim(), locale).map((p, j) =>
                  p.match ? (
                    <span key={j} className="font-semibold text-fg">
                      {p.text}
                    </span>
                  ) : (
                    <React.Fragment key={j}>{p.text}</React.Fragment>
                  ),
                )}
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
});
