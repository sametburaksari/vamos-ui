"use client";

import * as React from "react";
import { AtSign, Check, CornerDownRight, Eye, Hash, Heart, HelpCircle, Link2, MoreHorizontal, Paperclip, Pencil, RotateCcw, SmilePlus, ThumbsUp, Trash2, type LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useFormat, useLocale } from "../lib/locale";
import { foldText } from "../lib/text";
import { RelativeTime } from "../lib/data-islands";
import { Avatar } from "./avatar";
import { Badge } from "./badge";
import { Button, IconButton } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";
import { Spinner } from "./spinner";
import { AttachmentList, type AttachmentData } from "./attachment-list";

/* ------------------------------------------------------------------ */
/* Mentions: serialized format `@[Jane Cooper](user:42)` / `#[Q4 renewal](record:deal-118)` */
/* ------------------------------------------------------------------ */

export type MentionKind = "user" | "team" | "record";

/** A suggestion in the `@` / `#` picker, and a resolved mention in a body. */
export interface MentionItem {
  id: string;
  label: string;
  kind: MentionKind;
  /** Avatar photo (users) — teams and records get an icon. */
  avatar?: string;
  /** Second line in the picker ("Account executive", "Deal · $48,500"). */
  description?: string;
}

/** Where `@` (or `#`) suggestions come from. Search is async; return at most ~8 items. */
export interface MentionSource {
  search: (query: string) => MentionItem[] | Promise<MentionItem[]>;
  /** Default `"@"`. */
  trigger?: "@" | "#";
}

export interface ParsedMention {
  id: string;
  kind: MentionKind;
  label: string;
  /** Offsets in the plain `text` (start inclusive, end exclusive; includes the trigger). */
  start: number;
  end: number;
  trigger: "@" | "#";
}

const MENTION_RE = /([@#])\[([^\]\n]{1,120})\]\((user|team|record):([^)\s]{1,120})\)/g;

/** Turns a mention into its stored form: `@[Jane Cooper](user:42)`. */
export function serializeMention(m: Pick<MentionItem, "id" | "label" | "kind">, trigger: "@" | "#" = m.kind === "record" ? "#" : "@"): string {
  return `${trigger}[${m.label.replace(/[[\]]/g, "")}](${m.kind}:${m.id})`;
}

/**
 * Reads a stored comment body. `text` is what people see ("@Jane Cooper can you check?");
 * `mentions` carries ids and offsets into `text`. Locale-independent.
 */
export function parseMentions(body: string): { text: string; mentions: ParsedMention[] } {
  const mentions: ParsedMention[] = [];
  let text = "";
  let last = 0;
  for (const m of body.matchAll(MENTION_RE)) {
    text += body.slice(last, m.index);
    const shown = `${m[1]}${m[2]}`;
    mentions.push({ id: m[4]!, kind: m[3] as MentionKind, label: m[2]!, start: text.length, end: text.length + shown.length, trigger: m[1] as "@" | "#" });
    text += shown;
    last = m.index! + m[0].length;
  }
  text += body.slice(last);
  return { text, mentions };
}

/** Re-serializes composer text: every `@Label` of a picked mention becomes its stored token. */
function serializeComposer(text: string, picked: MentionItem[]): { body: string; mentions: MentionItem[] } {
  const used: MentionItem[] = [];
  let body = text;
  const sorted = [...picked].sort((a, b) => b.label.length - a.label.length);
  const tokens: string[] = [];
  for (const m of sorted) {
    const trigger = m.kind === "record" ? "#" : "@";
    const shown = `${trigger}${m.label}`;
    if (!body.includes(shown)) continue;
    if (!used.some((u) => u.id === m.id && u.kind === m.kind)) used.push(m);
    // Placeholder first so a shorter label inside a longer one isn't replaced twice.
    const ph = `\u0000${tokens.length}\u0000`;
    tokens.push(serializeMention(m, trigger));
    body = body.split(shown).join(ph);
  }
  body = body.replace(/\u0000(\d+)\u0000/g, (_, i) => tokens[Number(i)]!);
  return { body, mentions: used };
}

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

export interface CommentAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface CommentReaction {
  /** Key of a reaction in `reactions` of the thread (default set: like, agree, love, question, seen). */
  key: string;
  count: number;
  /** The current user reacted. */
  reacted?: boolean;
  /** Names, for the tooltip ("Ayşe Kaya, Daniel Brooks"). */
  users?: string[];
}

export interface CommentData {
  id: string;
  author: CommentAuthor;
  /** Stored body with serialized mentions: `"@[Jane Cooper](user:42) can you check the totals?"`. */
  body: string;
  /** ISO instant. */
  createdAt: string;
  editedAt?: string;
  /** Reply to this top-level comment (one nesting level). */
  parentId?: string;
  attachments?: AttachmentData[];
  /** Top-level only: the discussion is closed and collapses. */
  resolved?: boolean;
  resolvedBy?: string;
  /** Optimistic states while saving. */
  status?: "sending" | "failed";
  /** Soft-deleted: shows "This comment was deleted" when it has replies, hidden otherwise. */
  deleted?: boolean;
  reactions?: CommentReaction[];
}

export interface CommentSubmit {
  body: string;
  parentId?: string;
  attachments: File[];
  mentions: MentionItem[];
}

export interface ReactionOption {
  key: string;
  label: string;
  icon: LucideIcon;
}

/** Default reaction set — icons, not emoji, so they follow the theme. */
export const defaultReactions: ReactionOption[] = [
  { key: "like", label: "Like", icon: ThumbsUp },
  { key: "agree", label: "Agree", icon: Check },
  { key: "love", label: "Love", icon: Heart },
  { key: "question", label: "Question", icon: HelpCircle },
  { key: "seen", label: "Seen", icon: Eye },
];

export const commentLabels = {
  thread: "Comments",
  empty: "Start the conversation",
  emptyHint: "Mention a teammate with @ to bring them in.",
  placeholder: "Write a comment… Use @ to mention",
  replyPlaceholder: "Write a reply…",
  comment: "Comment",
  reply: "Reply",
  replyTo: "Reply to {name}",
  edit: "Edit",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  copyLink: "Copy link",
  linkCopied: "Link copied",
  resolve: "Resolve",
  reopen: "Reopen",
  resolved: "Resolved",
  resolvedBy: "Resolved by {name}",
  show: "Show",
  hide: "Hide",
  replies: "{count, plural, one {# reply} other {# replies}}",
  edited: "edited",
  editedAt: "Edited {time}",
  deleted: "This comment was deleted",
  sending: "Sending…",
  failed: "Not sent",
  retry: "Retry",
  discard: "Discard",
  more: "More actions for {name}'s comment",
  attach: "Attach files",
  mention: "Mention someone",
  submitHint: "{key}+Enter to send",
  submitError: "Couldn't post your comment. Try again.",
  suggestions: "{count, plural, =0 {No matches} one {# suggestion} other {# suggestions}}",
  searching: "Searching…",
  noMatch: "No one matches “{query}”",
  react: "Add reaction",
  reaction: "{label}: {count}",
  you: "You",
  commentBy: "Comment by {name}",
};
export type CommentThreadLabels = Partial<typeof commentLabels>;

type T = LabelFn<typeof commentLabels>;

/* ------------------------------------------------------------------ */
/* Mention chip + body                                                  */
/* ------------------------------------------------------------------ */

export interface MentionChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  mention: Pick<ParsedMention, "label" | "kind"> & { trigger?: "@" | "#" };
  /** Highlights a mention of the current user. */
  self?: boolean;
}

/** Inline mention token inside a comment body. */
export function MentionChip({ mention, self, className, ...props }: MentionChipProps) {
  const trigger = mention.trigger ?? (mention.kind === "record" ? "#" : "@");
  return (
    <span
      data-slot="mention"
      data-kind={mention.kind}
      data-self={self ? "" : undefined}
      className={cn(
        "inline rounded-[5px] px-1 py-px font-medium [box-decoration-break:clone]",
        mention.kind === "record" ? "bg-selected text-fg" : "bg-accent-soft text-accent-ink",
        self && "ring-1 ring-inset ring-[color-mix(in_srgb,var(--accent-ink)_40%,transparent)]",
        className,
      )}
      {...props}
    >
      {trigger}
      {mention.label}
    </span>
  );
}

export interface CommentBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stored body with serialized mentions. */
  body: string;
  currentUserId?: string;
  renderMention?: (mention: ParsedMention) => React.ReactNode;
}

/** A comment's text: line breaks kept, mentions rendered as chips, mixed directions handled (`dir="auto"`). */
export function CommentBody({ body, currentUserId, renderMention, className, ...props }: CommentBodyProps) {
  const { text, mentions } = React.useMemo(() => parseMentions(body), [body]);
  const parts: React.ReactNode[] = [];
  let pos = 0;
  mentions.forEach((m, i) => {
    if (m.start > pos) parts.push(text.slice(pos, m.start));
    parts.push(
      <React.Fragment key={`m${i}`}>
        {renderMention ? renderMention(m) : <MentionChip mention={m} self={m.kind === "user" && m.id === currentUserId} />}
      </React.Fragment>,
    );
    pos = m.end;
  });
  if (pos < text.length) parts.push(text.slice(pos));
  return (
    <div data-slot="comment-body" dir="auto" className={cn("whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-fg", className)} {...props}>
      {parts}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composer                                                             */
/* ------------------------------------------------------------------ */

export interface CommentComposerProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "defaultValue"> {
  onSubmit: (data: CommentSubmit) => void | Promise<void>;
  onCancel?: () => void;
  /** Stored body to start from (editing). */
  defaultValue?: string;
  parentId?: string;
  mentionSources?: MentionSource[];
  /** Paperclip button + chips. */
  allowAttachments?: boolean;
  placeholder?: string;
  /** Submit button text. Default "Comment". */
  submitLabel?: string;
  /** Current user's avatar beside the box. */
  author?: CommentAuthor;
  autoFocus?: boolean;
  /** `inline` (default) or `sticky-bottom` (pinned to the bottom of a scrolling panel). */
  variant?: "inline" | "sticky-bottom";
  /** Compact sizing for side panels. */
  compact?: boolean;
  labels?: CommentThreadLabels;
}

interface PickerState {
  trigger: "@" | "#";
  start: number;
  query: string;
}

function findTrigger(value: string, caret: number, triggers: string[]): PickerState | null {
  const before = value.slice(0, caret);
  for (let i = before.length - 1; i >= 0 && before.length - i <= 32; i--) {
    const ch = before[i]!;
    if (ch === "\n") return null;
    if (triggers.includes(ch) && (i === 0 || /\s|[(\[{"'“]/.test(before[i - 1]!))) {
      const query = before.slice(i + 1);
      if (/^\s/.test(query) || /\s$/.test(query)) return null;
      return { trigger: ch as "@" | "#", start: i, query };
    }
  }
  return null;
}

/**
 * The comment box: a plain textarea with an `@` / `#` mention picker (combobox pattern:
 * ↑/↓ move, Enter or Tab insert, Esc close), optional attachments, and ⌘/Ctrl+Enter to send.
 * Picked mentions are stored as `@[Name](user:id)` in the submitted body.
 */
export const CommentComposer = /*#__PURE__*/ React.forwardRef<HTMLTextAreaElement, CommentComposerProps>(function CommentComposer(
  { onSubmit, onCancel, defaultValue, parentId, mentionSources, allowAttachments, placeholder, submitLabel, author, autoFocus, variant = "inline", compact, labels, className, ...props },
  ref,
) {
  const t = useLabels("comments", commentLabels, labels);
  const { locale } = useLocale();
  const initial = React.useMemo(() => (defaultValue ? parseMentions(defaultValue) : null), [defaultValue]);
  const [value, setValue] = React.useState(initial?.text ?? "");
  const [picked, setPicked] = React.useState<MentionItem[]>(() => initial?.mentions.map((m) => ({ id: m.id, kind: m.kind, label: m.label })) ?? []);
  const [files, setFiles] = React.useState<File[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [picker, setPicker] = React.useState<PickerState | null>(null);
  const [results, setResults] = React.useState<MentionItem[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const areaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const searchSeq = React.useRef(0);
  const listId = React.useId();
  const hintId = React.useId();
  const triggers = React.useMemo(() => (mentionSources ?? []).map((s) => s.trigger ?? "@"), [mentionSources]);
  // Platform is read after mount so the server and first client render agree.
  const [isMac, setIsMac] = React.useState(false);
  React.useEffect(() => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  React.useImperativeHandle(ref, () => areaRef.current!, []);

  React.useEffect(() => {
    if (autoFocus) areaRef.current?.focus();
  }, [autoFocus]);

  // Grow with content (up to ~10 lines) and place the caret after a programmatic insert —
  // synchronously, so keys typed right after an insert land in the right place.
  const pendingCaret = React.useRef<number | null>(null);
  React.useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
    if (pendingCaret.current !== null) {
      const pos = pendingCaret.current;
      pendingCaret.current = null;
      el.focus();
      el.setSelectionRange(pos, pos);
    }
  }, [value]);

  // Run the mention search for the current query (latest request wins).
  React.useEffect(() => {
    if (!picker) return;
    const source = mentionSources?.find((s) => (s.trigger ?? "@") === picker.trigger);
    if (!source) return;
    const seq = ++searchSeq.current;
    setSearching(true);
    Promise.resolve(source.search(picker.query))
      .then((items) => {
        if (seq !== searchSeq.current) return;
        const q = foldText(picker.query, locale);
        // Locale-aware fallback ranking: prefix matches first.
        const ranked = [...items].sort((a, b) => Number(!foldText(a.label, locale).startsWith(q)) - Number(!foldText(b.label, locale).startsWith(q)));
        setResults(ranked.slice(0, 8));
        setActive(0);
      })
      .catch(() => seq === searchSeq.current && setResults([]))
      .finally(() => seq === searchSeq.current && setSearching(false));
  }, [picker?.trigger, picker?.query, mentionSources, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const updatePicker = (el: HTMLTextAreaElement) => {
    if (!triggers.length) return;
    const p = findTrigger(el.value, el.selectionStart ?? el.value.length, triggers);
    setPicker(p);
    if (!p) setResults([]);
  };

  const insert = (item: MentionItem) => {
    if (!picker) return;
    const el = areaRef.current;
    const trigger = item.kind === "record" ? "#" : picker.trigger;
    const caret = el?.selectionStart ?? picker.start + 1 + picker.query.length;
    const token = `${trigger}${item.label} `;
    const next = value.slice(0, picker.start) + token + value.slice(caret);
    setValue(next);
    setPicked((p) => (p.some((x) => x.id === item.id && x.kind === item.kind) ? p : [...p, item]));
    setPicker(null);
    setResults([]);
    pendingCaret.current = picker.start + token.length;
  };

  const canSubmit = (value.trim().length > 0 || files.length > 0) && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    const { body, mentions } = serializeComposer(value.trim(), picked);
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ body, parentId, attachments: files, mentions });
      setValue("");
      setPicked([]);
      setFiles([]);
    } catch {
      setError(t("submitError"));
    } finally {
      setBusy(false);
    }
  };

  const open = Boolean(picker) && (results.length > 0 || searching || picker!.query.length > 0);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (open && results.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => (a + 1) % results.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => (a - 1 + results.length) % results.length);
        return;
      }
      if ((e.key === "Enter" && !e.metaKey && !e.ctrlKey) || e.key === "Tab") {
        e.preventDefault();
        insert(results[active]!);
        return;
      }
    }
    if (e.key === "Escape") {
      if (picker) {
        e.preventDefault();
        e.stopPropagation();
        setPicker(null);
        setResults([]);
        return;
      }
      if (onCancel) {
        e.preventDefault();
        onCancel();
      }
      return;
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void submit();
    }
  };

  const fileItems: AttachmentData[] = files.map((f, i) => ({ id: `${i}-${f.name}`, name: f.name, size: f.size, mime: f.type }));

  return (
    <form
      data-slot="comment-composer"
      data-variant={variant}
      className={cn(
        "flex gap-2.5",
        variant === "sticky-bottom" && "sticky bottom-0 z-(--z-sticky) -mx-[var(--composer-bleed,0px)] border-t border-line bg-[color-mix(in_srgb,var(--surface-solid)_94%,transparent)] px-[var(--composer-bleed,0px)] py-3",
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      {...props}
    >
      {author ? <Avatar name={author.name} src={author.avatar} size={compact ? "sm" : "md"} className="mt-1" /> : null}
      <div className="relative min-w-0 flex-1">
        <div
          className={cn(
            "rounded-ui border border-field-border bg-field transition-[border-color,box-shadow]",
            "focus-within:border-field-border-hover focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_18%,transparent)]",
            error && "border-[color-mix(in_srgb,var(--danger)_55%,transparent)]",
          )}
        >
          <textarea
            ref={areaRef}
            dir="auto"
            rows={compact ? 1 : 2}
            value={value}
            placeholder={placeholder ?? t(parentId ? "replyPlaceholder" : "placeholder")}
            aria-label={placeholder ?? t(parentId ? "replyPlaceholder" : "placeholder")}
            aria-describedby={hintId}
            aria-autocomplete={triggers.length ? "list" : undefined}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
            aria-invalid={error ? true : undefined}
            disabled={busy}
            onChange={(e) => {
              setValue(e.target.value);
              updatePicker(e.target);
            }}
            onSelect={(e) => updatePicker(e.currentTarget)}
            onKeyDown={onKeyDown}
            onBlur={() => setTimeout(() => setPicker(null), 120)}
            className={cn(
              "block w-full resize-none bg-transparent px-3 pt-2.5 text-[13.5px] leading-relaxed text-fg outline-none placeholder:text-fg-subtle disabled:opacity-60",
              compact ? "min-h-9" : "min-h-16",
            )}
          />
          {files.length ? (
            <AttachmentList layout="chips" items={fileItems} className="px-2 pb-1" onRemove={(f) => setFiles((all) => all.filter((_, i) => `${i}-${all[i]!.name}` !== f.id))} />
          ) : null}
          <div className="flex items-center gap-1 px-1.5 pb-1.5">
            {triggers.includes("@") ? (
              <IconButton
                label={t("mention")}
                tooltip={false}
                size="xs"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const el = areaRef.current!;
                  const caret = el.selectionStart ?? value.length;
                  const pad = caret > 0 && !/\s/.test(value[caret - 1]!) ? " " : "";
                  const next = value.slice(0, caret) + pad + "@" + value.slice(caret);
                  setValue(next);
                  const pos = caret + pad.length + 1;
                  setPicker({ trigger: "@", start: pos - 1, query: "" });
                  pendingCaret.current = pos;
                }}
              >
                <AtSign />
              </IconButton>
            ) : null}
            {allowAttachments ? (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  hidden
                  tabIndex={-1}
                  aria-hidden
                  onChange={(e) => {
                    const list = Array.from(e.currentTarget.files ?? []);
                    setFiles((f) => [...f, ...list]);
                    e.currentTarget.value = "";
                  }}
                />
                <IconButton label={t("attach")} tooltip={false} size="xs" onClick={() => fileRef.current?.click()}>
                  <Paperclip />
                </IconButton>
              </>
            ) : null}
            <span id={hintId} className="ms-1 hidden truncate text-[11px] text-fg-subtle sm:inline">
              {t("submitHint", { key: isMac ? "⌘" : "Ctrl" })}
            </span>
            <span className="ms-auto flex items-center gap-1.5">
              {onCancel ? (
                <Button size="xs" variant="ghost" onClick={onCancel}>
                  {t("cancel")}
                </Button>
              ) : null}
              <Button size="xs" variant="primary" type="submit" disabled={!canSubmit} loading={busy}>
                {submitLabel ?? t(parentId ? "reply" : "comment")}
              </Button>
            </span>
          </div>
        </div>
        {error ? (
          <p role="alert" className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        ) : null}
        {open ? (
          <div
            data-slot="mention-picker"
            className="absolute inset-x-0 top-full z-(--z-popover) mt-1 max-w-80 overflow-hidden rounded-ui border border-popover-border bg-popover-nested p-1 shadow-(--popover-shadow)"
          >
            <ul id={listId} role="listbox" aria-label={t("suggestions", { count: results.length })}>
              {results.map((item, i) => {
                const Icon = item.kind === "record" ? Hash : null;
                return (
                  <li
                    key={`${item.kind}:${item.id}`}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => insert(item)}
                    className={cn("flex cursor-pointer items-center gap-2.5 rounded-ui-sm px-2 py-1.5 text-[13px]", i === active && "bg-hover")}
                  >
                    {Icon ? (
                      <span aria-hidden className="inline-flex size-6 items-center justify-center rounded-ui-sm bg-selected text-fg-muted [&_svg]:size-3.5">
                        <Icon />
                      </span>
                    ) : (
                      <Avatar name={item.label} src={item.avatar} size="sm" shape={item.kind === "team" ? "square" : "circle"} aria-hidden />
                    )}
                    <span className="grid min-w-0">
                      <span className="truncate font-medium text-fg">{item.label}</span>
                      {item.description ? <span className="truncate text-[11.5px] text-fg-muted">{item.description}</span> : null}
                    </span>
                  </li>
                );
              })}
            </ul>
            {results.length === 0 ? (
              <p className="flex items-center gap-2 px-2 py-1.5 text-[13px] text-fg-muted">
                {searching ? (
                  <>
                    <Spinner size="xs" /> {t("searching")}
                  </>
                ) : (
                  t("noMatch", { query: picker!.query })
                )}
              </p>
            ) : null}
          </div>
        ) : null}
        <span className="sr-only" aria-live="polite">
          {open && !searching ? t("suggestions", { count: results.length }) : ""}
        </span>
      </div>
    </form>
  );
});

/* ------------------------------------------------------------------ */
/* One comment                                                          */
/* ------------------------------------------------------------------ */

export interface CommentProps extends Omit<React.HTMLAttributes<HTMLElement>, "onSubmit"> {
  comment: CommentData;
  currentUserId?: string;
  /** Shown as a reply (smaller avatar, no resolve). */
  isReply?: boolean;
  /** Show the Reply action. */
  onReply?: () => void;
  onEdit?: (id: string, body: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  onResolve?: (id: string, resolved: boolean) => void | Promise<void>;
  onRetry?: (comment: CommentData) => void;
  onDiscard?: (comment: CommentData) => void;
  onReact?: (id: string, key: string, on: boolean) => void;
  /** Builds a permalink — shows "Copy link". */
  getLink?: (comment: CommentData) => string;
  reactions?: ReactionOption[];
  mentionSources?: MentionSource[];
  renderMention?: (mention: ParsedMention) => React.ReactNode;
  onPreviewAttachment?: (file: AttachmentData) => void;
  readOnly?: boolean;
  compact?: boolean;
  now?: Date | string | number;
  labels?: CommentThreadLabels;
  /** Replies / reply composer slot. */
  children?: React.ReactNode;
}

/** One comment: avatar, author and time, body with mention chips, attachments, reactions and actions. An `<article>` labelled by its header. */
export const Comment = /*#__PURE__*/ React.forwardRef<HTMLElement, CommentProps>(function Comment(
  {
    comment: c,
    currentUserId,
    isReply,
    onReply,
    onEdit,
    onDelete,
    onResolve,
    onRetry,
    onDiscard,
    onReact,
    getLink,
    reactions = defaultReactions,
    mentionSources,
    renderMention,
    onPreviewAttachment,
    readOnly,
    compact,
    now,
    labels,
    className,
    children,
    ...props
  },
  ref,
) {
  const t = useLabels("comments", commentLabels, labels);
  const f = useFormat();
  const headId = React.useId();
  const [editing, setEditing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const own = c.author.id === currentUserId;
  const canEdit = own && !readOnly && onEdit && !c.status && !c.deleted;
  const canDelete = own && !readOnly && onDelete && !c.status && !c.deleted;
  const canResolve = !isReply && !readOnly && onResolve && !c.status && !c.deleted;

  if (c.deleted) {
    return (
      <article ref={ref} data-slot="comment" data-deleted="" aria-label={t("deleted")} tabIndex={-1} className={cn("flex flex-col gap-3 outline-none", className)} {...props}>
        <p className="flex items-center gap-2 rounded-ui-sm border border-dashed border-line px-3 py-2 text-[13px] italic text-fg-subtle">{t("deleted")}</p>
        {children}
      </article>
    );
  }

  const copyLink = async () => {
    if (!getLink) return;
    try {
      await navigator.clipboard.writeText(getLink(c));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  const menu = canEdit || canDelete || getLink;

  return (
    <article
      ref={ref}
      data-slot="comment"
      data-status={c.status}
      data-own={own ? "" : undefined}
      aria-labelledby={headId}
      tabIndex={-1}
      className={cn("group/comment relative flex gap-2.5 outline-none focus-visible:rounded-ui-sm focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-4 focus-visible:ring-offset-(--surface-solid)", className)}
      {...props}
    >
      <Avatar name={c.author.name} src={c.author.avatar} size={isReply || compact ? "sm" : "md"} className={cn(isReply || compact ? "mt-0.5" : "mt-px")} />
      <div className="min-w-0 flex-1">
        <header className="flex min-h-6 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h4 id={headId} className="contents">
            <span className="text-[13.5px] font-semibold text-fg">{c.author.name}</span>
            {own ? <span className="sr-only"> ({t("you")})</span> : null}
            <span className="sr-only">, </span>
            <RelativeTime value={c.createdAt} now={now} className="text-xs text-fg-subtle" />
          </h4>
          {c.editedAt ? (
            <span className="text-xs text-fg-subtle" title={t("editedAt", { time: f.dateTime(c.editedAt) })}>
              · {t("edited")}
            </span>
          ) : null}
          {c.status === "sending" ? (
            <span className="inline-flex items-center gap-1 text-xs text-fg-subtle">
              <Spinner size="xs" /> {t("sending")}
            </span>
          ) : null}
          {c.resolved && !isReply ? (
            <Badge tone="success" size="sm">
              <Check aria-hidden /> {c.resolvedBy ? t("resolvedBy", { name: c.resolvedBy }) : t("resolved")}
            </Badge>
          ) : null}
          {!readOnly && !editing && (menu || canResolve) && !c.status ? (
            <span className="ms-auto flex items-center gap-0.5 self-center opacity-100 transition-opacity sm:opacity-0 sm:group-hover/comment:opacity-100 sm:group-focus-within/comment:opacity-100 [@media(hover:none)]:opacity-100">
              {canResolve ? (
                <Button size="xs" variant="ghost" onClick={() => onResolve!(c.id, !c.resolved)} className="text-fg-muted">
                  {c.resolved ? <RotateCcw aria-hidden /> : <Check aria-hidden />}
                  {c.resolved ? t("reopen") : t("resolve")}
                </Button>
              ) : null}
              {menu ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <IconButton label={t("more", { name: c.author.name })} size="xs" tooltip={false}>
                      <MoreHorizontal />
                    </IconButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit ? (
                      <DropdownMenuItem icon={<Pencil />} onSelect={() => setEditing(true)}>
                        {t("edit")}
                      </DropdownMenuItem>
                    ) : null}
                    {getLink ? (
                      <DropdownMenuItem icon={<Link2 />} onSelect={() => void copyLink()}>
                        {t("copyLink")}
                      </DropdownMenuItem>
                    ) : null}
                    {canDelete ? (
                      <>
                        {canEdit || getLink ? <DropdownMenuSeparator /> : null}
                        <DropdownMenuItem icon={<Trash2 />} tone="danger" onSelect={() => void onDelete!(c.id)}>
                          {t("delete")}
                        </DropdownMenuItem>
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </span>
          ) : null}
        </header>

        {editing ? (
          <CommentComposer
            className="mt-1.5"
            defaultValue={c.body}
            mentionSources={mentionSources}
            autoFocus
            compact
            submitLabel={t("save")}
            labels={labels}
            onCancel={() => setEditing(false)}
            onSubmit={async ({ body }) => {
              await onEdit!(c.id, body);
              setEditing(false);
            }}
          />
        ) : (
          <CommentBody body={c.body} currentUserId={currentUserId} renderMention={renderMention} className={cn("mt-0.5", c.status === "sending" && "text-fg-muted")} />
        )}

        {c.attachments?.length ? <AttachmentList layout="chips" readOnly items={c.attachments} onPreview={onPreviewAttachment} className="mt-2" /> : null}

        {c.status === "failed" ? (
          <p role="alert" className="mt-1.5 flex items-center gap-2 text-xs text-danger">
            {t("failed")}
            {onRetry ? (
              <Button size="xs" variant="link" onClick={() => onRetry(c)} className="text-xs">
                {t("retry")}
              </Button>
            ) : null}
            {onDiscard ? (
              <Button size="xs" variant="link" onClick={() => onDiscard(c)} className="text-xs text-fg-muted!">
                {t("discard")}
              </Button>
            ) : null}
          </p>
        ) : null}

        {!editing && !c.status && (onReply || onReact || c.reactions?.length) ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {(c.reactions ?? [])
              .filter((r) => r.count > 0)
              .map((r) => {
                const opt = reactions.find((o) => o.key === r.key);
                if (!opt) return null;
                const Icon = opt.icon;
                return (
                  <button
                    key={r.key}
                    type="button"
                    aria-pressed={Boolean(r.reacted)}
                    aria-label={t("reaction", { label: opt.label, count: r.count })}
                    title={r.users?.join(", ")}
                    disabled={readOnly || !onReact}
                    onClick={() => onReact?.(c.id, r.key, !r.reacted)}
                    className={cn(
                      "inline-flex h-6 cursor-pointer items-center gap-1 rounded-full border px-2 text-[11.5px] tabular transition-colors focus-ring disabled:cursor-default [&_svg]:size-3",
                      r.reacted ? "border-[color-mix(in_srgb,var(--accent-ink)_35%,transparent)] bg-accent-soft text-accent-ink" : "border-line text-fg-muted hover:bg-hover",
                    )}
                  >
                    <Icon aria-hidden strokeWidth={2.2} />
                    {r.count}
                  </button>
                );
              })}
            {onReact && !readOnly ? <ReactionPicker reactions={reactions} current={c.reactions} onPick={(key, on) => onReact(c.id, key, on)} t={t} /> : null}
            {onReply && !readOnly ? (
              <Button size="xs" variant="ghost" onClick={onReply} className="text-fg-muted" aria-label={t("replyTo", { name: c.author.name })}>
                <CornerDownRight aria-hidden />
                {t("reply")}
              </Button>
            ) : null}
          </div>
        ) : null}
        <span className="sr-only" aria-live="polite">
          {copied ? t("linkCopied") : ""}
        </span>
        {children}
      </div>
    </article>
  );
});

function ReactionPicker({ reactions, current, onPick, t }: { reactions: ReactionOption[]; current?: CommentReaction[]; onPick: (key: string, on: boolean) => void; t: T }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <IconButton label={t("react")} size="xs" tooltip={false} className="size-6 rounded-full text-fg-subtle">
          <SmilePlus />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="flex min-w-0 gap-0.5 p-1">
        {reactions.map((r) => {
          const on = Boolean(current?.find((c) => c.key === r.key)?.reacted);
          const Icon = r.icon;
          return (
            <DropdownMenuItem key={r.key} aria-label={r.label} title={r.label} onSelect={() => onPick(r.key, !on)} className={cn("size-8 justify-center p-0 [&_svg]:size-4", on && "bg-accent-soft text-accent-ink")}>
              <Icon aria-hidden />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/* Thread                                                               */
/* ------------------------------------------------------------------ */

export interface CommentThreadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  comments: CommentData[];
  /** Own comments get Edit / Delete. */
  currentUserId?: string;
  /** Current user's avatar next to the composer. */
  currentUser?: CommentAuthor;
  /** Posting a new comment or reply. Without it (or with `readOnly`) there is no composer. */
  onSubmit?: (data: CommentSubmit) => void | Promise<void>;
  onEdit?: (id: string, body: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  onResolve?: (id: string, resolved: boolean) => void | Promise<void>;
  /** Failed (optimistic) comments: Retry / Discard. */
  onRetry?: (comment: CommentData) => void;
  onDiscard?: (comment: CommentData) => void;
  /** Toggle a reaction. Shows the reaction picker. */
  onReact?: (id: string, key: string, on: boolean) => void;
  reactions?: ReactionOption[];
  getLink?: (comment: CommentData) => string;
  /** `@` people / teams and `#` records. */
  mentionSources?: MentionSource[];
  renderMention?: (mention: ParsedMention) => React.ReactNode;
  onPreviewAttachment?: (file: AttachmentData) => void;
  allowAttachments?: boolean;
  /** Default `"oldest-first"` (conversation order). Replies are always oldest first. */
  order?: "oldest-first" | "newest-first";
  /** `thread` (full) or `compact` (side panel). Default `"thread"`. */
  layout?: "thread" | "compact";
  /** Composer position. Default `"inline"`. */
  composer?: "inline" | "sticky-bottom" | "top";
  readOnly?: boolean;
  /** Pin the clock (docs, tests). */
  now?: Date | string | number;
  labels?: CommentThreadLabels;
}

/**
 * Threaded discussion on a record: editorial notes on a post, CRM notes on a deal, feedback on
 * a candidate. One reply level, @mentions with a picker, attachments, reactions, edit / delete,
 * resolve & collapse, and optimistic sending / failed states. ARIA feed: PageUp / PageDown
 * move between comments.
 *
 * ```tsx
 * <CommentThread
 *   comments={comments}
 *   currentUserId="u1"
 *   mentionSources={[{ search: searchPeople }]}
 *   onSubmit={({ body, parentId }) => api.comment(dealId, { body, parentId })}
 *   onResolve={(id, resolved) => api.resolve(id, resolved)}
 * />
 * ```
 */
export const CommentThread = /*#__PURE__*/ React.forwardRef<HTMLDivElement, CommentThreadProps>(function CommentThread(
  {
    comments,
    currentUserId,
    currentUser,
    onSubmit,
    onEdit,
    onDelete,
    onResolve,
    onRetry,
    onDiscard,
    onReact,
    reactions,
    getLink,
    mentionSources,
    renderMention,
    onPreviewAttachment,
    allowAttachments,
    order = "oldest-first",
    layout = "thread",
    composer = "inline",
    readOnly,
    now,
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("comments", commentLabels, labels);
  const compact = layout === "compact";
  const [replyTo, setReplyTo] = React.useState<string | null>(null);
  const [shown, setShown] = React.useState<Set<string>>(() => new Set());
  const replyButtons = React.useRef(new Map<string, HTMLElement>());
  const feedRef = React.useRef<HTMLDivElement>(null);

  const { roots, replies } = React.useMemo(() => {
    const byTime = (a: CommentData, b: CommentData) => a.createdAt.localeCompare(b.createdAt);
    const replies = new Map<string, CommentData[]>();
    const roots: CommentData[] = [];
    for (const c of comments) {
      if (c.parentId) replies.set(c.parentId, [...(replies.get(c.parentId) ?? []), c]);
      else roots.push(c);
    }
    replies.forEach((list) => list.sort(byTime));
    roots.sort(byTime);
    if (order === "newest-first") roots.reverse();
    // Deleted with no replies → hidden.
    return { roots: roots.filter((r) => !r.deleted || (replies.get(r.id)?.length ?? 0) > 0), replies };
  }, [comments, order]);

  const canPost = Boolean(onSubmit) && !readOnly;

  const onFeedKey = (e: React.KeyboardEvent) => {
    if (e.key !== "PageDown" && e.key !== "PageUp") return;
    const articles = Array.from(feedRef.current?.querySelectorAll<HTMLElement>(":scope > [data-slot=comment-group] > [data-slot=comment]") ?? []);
    if (!articles.length) return;
    const current = articles.findIndex((a) => a.contains(document.activeElement));
    const next = e.key === "PageDown" ? Math.min(articles.length - 1, current + 1) : Math.max(0, current - 1);
    e.preventDefault();
    articles[next]?.focus();
  };

  const shared = { currentUserId, onEdit, onDelete, onRetry, onDiscard, onReact, reactions, getLink, mentionSources, renderMention, onPreviewAttachment, readOnly, compact, now, labels };

  const newComposer = canPost ? (
    <CommentComposer
      onSubmit={onSubmit!}
      mentionSources={mentionSources}
      allowAttachments={allowAttachments}
      author={currentUser}
      compact={compact}
      variant={composer === "sticky-bottom" ? "sticky-bottom" : "inline"}
      labels={labels}
    />
  ) : null;

  return (
    <div ref={ref} data-slot="comment-thread" data-layout={layout} className={cn("flex flex-col", compact ? "gap-4" : "gap-5", className)} {...props}>
      {composer === "top" ? newComposer : null}
      {roots.length === 0 ? (
        <div data-slot="comment-empty" className="flex flex-col items-start gap-1 border-s-2 border-line ps-3">
          <p className="text-sm font-medium text-fg">{t("empty")}</p>
          {canPost && mentionSources?.length ? <p className="text-[13px] text-fg-muted">{t("emptyHint")}</p> : null}
        </div>
      ) : (
        <div ref={feedRef} role="feed" aria-label={t("thread")} aria-busy={comments.some((c) => c.status === "sending") || undefined} onKeyDown={onFeedKey} className={cn("flex flex-col", compact ? "gap-4" : "gap-6")}>
          {roots.map((root, i) => {
            const kids = replies.get(root.id) ?? [];
            const collapsed = root.resolved && !shown.has(root.id);
            return (
              <div key={root.id} data-slot="comment-group" data-resolved={root.resolved ? "" : undefined} className="contents">
                <Comment
                  {...shared}
                  comment={root}
                  aria-posinset={i + 1}
                  aria-setsize={roots.length}
                  onResolve={onResolve}
                  className={cn(root.resolved && "[&_[data-slot=comment-body]]:text-fg-muted")}
                  onReply={
                    canPost && !root.resolved
                      ? () => {
                          setReplyTo(root.id);
                        }
                      : undefined
                  }
                  ref={(el) => {
                    if (el) replyButtons.current.set(root.id, el);
                  }}
                >
                  {root.resolved && kids.length > 0 ? (
                    <button
                      type="button"
                      aria-expanded={!collapsed}
                      onClick={() =>
                        setShown((s) => {
                          const n = new Set(s);
                          if (n.has(root.id)) n.delete(root.id);
                          else n.add(root.id);
                          return n;
                        })
                      }
                      className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-fg-muted hover:text-fg focus-ring"
                    >
                      {collapsed ? t("show") : t("hide")} · {t("replies", { count: kids.length })}
                    </button>
                  ) : null}
                  {!collapsed && (kids.length > 0 || replyTo === root.id) ? (
                    <div data-slot="comment-replies" className={cn("mt-3 flex flex-col gap-3.5 border-s border-line", compact ? "ps-3" : "ps-4")}>
                      {kids
                        .filter((k) => !k.deleted)
                        .map((reply) => (
                          <Comment key={reply.id} {...shared} comment={reply} isReply onReply={canPost && !root.resolved ? () => setReplyTo(root.id) : undefined} />
                        ))}
                      {replyTo === root.id && canPost ? (
                        <CommentComposer
                          parentId={root.id}
                          mentionSources={mentionSources}
                          allowAttachments={allowAttachments}
                          compact
                          autoFocus
                          labels={labels}
                          onCancel={() => {
                            setReplyTo(null);
                            replyButtons.current.get(root.id)?.focus();
                          }}
                          onSubmit={async (d) => {
                            await onSubmit!(d);
                            setReplyTo(null);
                            replyButtons.current.get(root.id)?.focus();
                          }}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </Comment>
              </div>
            );
          })}
        </div>
      )}
      {composer !== "top" ? newComposer : null}
    </div>
  );
});
