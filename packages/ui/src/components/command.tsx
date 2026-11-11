"use client";

import * as React from "react";
import { Command as Cmdk } from "cmdk";
import { ArrowLeft, ChevronRight, CornerDownLeft, Search } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useCan, useVamos } from "../lib/provider";
import { cmdkFilter, highlightParts } from "../lib/text";
import { useLatest } from "../lib/use-controllable-state";
import { isApplePlatform, matchesShortcut, parseShortcut } from "../lib/use-hotkeys";
import { itemSlots, itemVariants } from "../lib/variants";
import { isAbsoluteHref } from "../lib/nav";
import { Dialog, DialogContent, DialogTitle, type DialogProps } from "./dialog";
import { KbdGroup } from "./kbd";
import { Badge } from "./badge";
import { Spinner } from "./spinner";
import { Progress } from "./progress";
import { EmptyState } from "./empty-state";

const commandLabels = {
  label: "Command palette",
  placeholder: "Type a command or search…",
  empty: "No results found.",
  noResultsFor: "No results for “{query}”",
  results: "{count, plural, one {# result} other {# results}}",
  recent: "Recent",
  navigate: "navigate",
  select: "select",
  back: "back",
  close: "close",
  sourceError: "Couldn't load {group}.",
  loading: "Searching…",
};
export type CommandLabels = typeof commandLabels;

/* ------------------------------------------------------------------ */
/* Primitives (cmdk)                                                   */
/* ------------------------------------------------------------------ */

export interface CommandProps extends React.ComponentPropsWithoutRef<typeof Cmdk> {
  labels?: Partial<CommandLabels>;
}

/**
 * A searchable list of actions (WAI-ARIA combobox + listbox). Filtering folds text for the
 * current locale, so "istanbul" finds "İstanbul" and "isik" finds "ışık".
 *
 * ```tsx
 * <Command>
 *   <CommandInput />
 *   <CommandList>
 *     <CommandEmpty />
 *     <CommandGroup heading="Actions">
 *       <CommandItem icon={<FilePlus2 />} shortcut="mod+shift+n" onSelect={newPost}>New post</CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </Command>
 * ```
 */
export const Command = React.forwardRef<HTMLDivElement, CommandProps>(function Command({ className, filter, label, loop = true, vimBindings = false, labels, ...props }, ref) {
  const { locale } = useLocale();
  const t = useLabels("command", commandLabels, labels);
  const defaultFilter = React.useMemo(() => cmdkFilter(locale), [locale]);
  return (
    <Cmdk
      ref={ref}
      data-slot="command"
      label={label ?? t("label")}
      filter={filter ?? defaultFilter}
      loop={loop}
      vimBindings={vimBindings}
      className={cn("vui-command flex min-h-0 w-full flex-col overflow-hidden text-fg", className)}
      {...props}
    />
  );
});

export interface CommandInputProps extends React.ComponentPropsWithoutRef<typeof Cmdk.Input> {
  /** Breadcrumb chip before the input (the current sub-page). */
  chip?: React.ReactNode;
  /** Trailing slot (a spinner, a filter, a close hint). */
  end?: React.ReactNode;
  labels?: Partial<CommandLabels>;
}

/** The search field. Placeholder from the dictionary (`command.placeholder`). */
export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(function CommandInput({ className, chip, end, placeholder, labels, ...props }, ref) {
  const t = useLabels("command", commandLabels, labels);
  return (
    <div data-slot="command-input" className="flex items-center gap-2.5 border-b border-line px-4">
      <Search aria-hidden className="size-4 shrink-0 text-fg-subtle" />
      {chip ? (
        <span data-slot="command-chip" className="inline-flex max-w-[40%] shrink-0 items-center gap-1 truncate rounded-ui-sm bg-selected px-2 py-0.5 text-xs font-medium text-fg-muted">
          {chip}
        </span>
      ) : null}
      <Cmdk.Input
        ref={ref}
        placeholder={placeholder ?? t("placeholder")}
        className={cn(
          "h-[calc(var(--control-h)+0.75rem)] min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-subtle",
          className,
        )}
        {...props}
      />
      {end}
    </div>
  );
});

/** The scrolling listbox. */
export const CommandList = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Cmdk.List>>(function CommandList({ className, ...props }, ref) {
  return (
    <Cmdk.List
      ref={ref}
      data-slot="command-list"
      className={cn("max-h-[min(26rem,60dvh)] min-h-0 scroll-py-2 overflow-y-auto overscroll-contain p-1.5 outline-none", className)}
      {...props}
    />
  );
});

/** Shown when nothing matches. Default text from the dictionary (`command.empty`). */
export const CommandEmpty = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Cmdk.Empty> & { labels?: Partial<CommandLabels> }>(
  function CommandEmpty({ className, children, labels, ...props }, ref) {
    const t = useLabels("command", commandLabels, labels);
    return (
      <Cmdk.Empty ref={ref} data-slot="command-empty" className={cn("px-3 py-8 text-center text-sm text-fg-muted", className)} {...props}>
        {children ?? t("empty")}
      </Cmdk.Empty>
    );
  },
);

/** A loading row (async results). */
export const CommandLoading = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Cmdk.Loading> & { labels?: Partial<CommandLabels> }>(
  function CommandLoading({ className, children, labels, label, ...props }, ref) {
    const t = useLabels("command", commandLabels, labels);
    return (
      <Cmdk.Loading ref={ref} data-slot="command-loading" label={label ?? t("loading")} className={cn("flex items-center gap-2 px-3 py-2.5 text-[13px] text-fg-muted", className)} {...props}>
        {children ?? (
          <>
            <Spinner size="xs" /> {t("loading")}
          </>
        )}
      </Cmdk.Loading>
    );
  },
);

/** A titled group of items. */
export const CommandGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Cmdk.Group>>(function CommandGroup({ className, ...props }, ref) {
  return (
    <Cmdk.Group
      ref={ref}
      data-slot="command-group"
      className={cn(
        "[&:not(:first-child)]:mt-1.5",
        "[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5",
        "[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[0.04em] [&_[cmdk-group-heading]]:text-fg-subtle",
        className,
      )}
      {...props}
    />
  );
});

/** A hairline between groups. */
export const CommandSeparator = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Cmdk.Separator>>(function CommandSeparator({ className, ...props }, ref) {
  // Decorative: role="separator" is not an allowed child of the listbox (axe aria-required-children);
  // the group headings already tell screen readers where a section starts.
  return <Cmdk.Separator ref={ref} aria-hidden data-slot="command-separator" className={cn("-mx-1.5 my-1.5 h-px bg-line", className)} {...props} />;
});

export interface CommandItemProps extends React.ComponentPropsWithoutRef<typeof Cmdk.Item> {
  icon?: React.ReactNode;
  /** Second line under the label. */
  description?: React.ReactNode;
  /**
   * `"mod+shift+n"` or `["mod","shift","n"]` — display only. An array without modifier keys is a
   * key sequence (`["g","o"]` shows G then O).
   */
  shortcut?: string | string[];
  /** Trailing meta (an app badge, a count). */
  badge?: React.ReactNode;
  /** Trailing chevron (opens a sub-page). */
  chevron?: boolean;
  /** Spinner in place of the icon while the action runs. */
  loading?: boolean;
}

/** One selectable row. Highlighted with the arrow keys; Enter or click runs `onSelect`. */
export const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(function CommandItem(
  { className, icon, description, shortcut, badge, chevron, loading, children, ...props },
  ref,
) {
  return (
    <Cmdk.Item
      ref={ref}
      data-slot="command-item"
      aria-busy={loading || undefined}
      className={cn(itemVariants({ size: "md" }), "min-h-[calc(var(--control-h)*0.95)] gap-2.5 px-2.5 data-[selected=true]:bg-selected", className)}
      {...props}
    >
      {loading ? (
        <Spinner size="xs" className="shrink-0" />
      ) : icon ? (
        <span aria-hidden className={cn("flex shrink-0 items-center text-fg-muted", description && "self-start pt-0.5")}>
          {icon}
        </span>
      ) : null}
      <span className={itemSlots.label}>
        {children}
        {description ? <span className={cn(itemSlots.description, "mt-0.5 truncate")}>{description}</span> : null}
      </span>
      {badge != null ? <span className="ms-auto flex shrink-0 items-center ps-3">{badge}</span> : null}
      {shortcut ? <CommandShortcut keys={shortcut} className={badge == null ? "ms-auto" : undefined} /> : null}
      {chevron ? <ChevronRight aria-hidden className={cn("size-3.5! shrink-0 text-fg-subtle rtl:-scale-x-100", !shortcut && badge == null && "ms-auto")} /> : null}
    </Cmdk.Item>
  );
});

const MODIFIER_KEYS = /^(mod|ctrl|control|meta|cmd|command|alt|option|shift)$/i;

/**
 * Shortcut keycaps at the end of an item. A string or an array with modifiers is one combination
 * (`"mod+k"`, `["mod","k"]`); an array of plain keys is a sequence (`["g","o"]` → G O).
 */
export function CommandShortcut({ keys, className }: { keys: string | string[]; className?: string }) {
  const sequence = Array.isArray(keys) && keys.length > 1 && !keys.some((k) => MODIFIER_KEYS.test(k));
  return (
    <KbdGroup
      keys={sequence ? (keys as string[]) : Array.isArray(keys) ? keys.join("+") : keys}
      size="sm"
      variant="ghost"
      className={cn("shrink-0 ps-3", className)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* CommandDialog                                                       */
/* ------------------------------------------------------------------ */

export interface CommandDialogProps extends DialogProps {
  /** `md` 560px, `lg` 680px. Default `"lg"`. */
  size?: "md" | "lg";
  /** Hidden dialog title. Default "Command palette" (`command.label`). */
  title?: string;
  /** Props for the inner `Command` (filter, shouldFilter, value…). */
  commandProps?: Omit<CommandProps, "children">;
  className?: string;
  labels?: Partial<CommandLabels>;
}

/**
 * Command inside a top-anchored dialog (fullscreen on phones). Focus goes to the input; Esc closes
 * and returns focus to whatever opened it.
 *
 * ```tsx
 * const [open, setOpen] = React.useState(false);
 * useHotkeys("mod+k", () => setOpen((o) => !o));
 * <CommandDialog open={open} onOpenChange={setOpen}>
 *   <CommandInput />
 *   <CommandList>…</CommandList>
 * </CommandDialog>
 * ```
 */
export function CommandDialog({ size = "lg", title, commandProps, className, labels, children, ...dialogProps }: CommandDialogProps) {
  const t = useLabels("command", commandLabels, labels);
  return (
    <Dialog {...dialogProps}>
      <DialogContent
        size={size === "md" ? "md" : "lg"}
        mobile="fullscreen"
        hideClose
        data-command-size={size}
        className={cn("vui-command-dialog p-0", className)}
      >
        <DialogTitle className="sr-only">{title ?? t("label")}</DialogTitle>
        <Command labels={labels} {...commandProps}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

export interface CommandContext {
  /** Navigate through the app router (absolute URLs do a full navigation). */
  navigate: (href: string) => void;
  /** Close the palette. */
  close: () => void;
  /** The query the action was picked with. */
  query: string;
  can: (permission: string) => boolean;
}

export interface CommandAction {
  /** Module-prefixed and unique: `"cms.post.new"`. */
  id: string;
  title: string;
  subtitle?: string;
  /** Group heading: "Actions", "Go to", "Posts"… Default "Actions". */
  group?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  /** Synonyms: `["article", "entry"]`. */
  keywords?: string[];
  /** `"mod+shift+n"` or `["mod","shift","n"]`. With `global: true` it also works while the palette is closed. */
  shortcut?: string | string[];
  global?: boolean;
  /** Navigates via the app router. */
  href?: string;
  /** Runs the action. Return a promise to keep the palette open with a spinner until it settles. */
  perform?: (ctx: CommandContext) => unknown;
  /** Opens a sub-page with these commands (or loads them). */
  children?: CommandAction[] | (() => Promise<CommandAction[]>);
  /** Hidden unless `can(permission)` (all of them for an array). */
  permission?: string | string[];
  /** Contextual: only listed while this returns true. */
  when?: (ctx: CommandContext) => boolean;
  /** Higher ranks first among equal matches. */
  priority?: number;
  /** App badge in multi-app shells ("CRM"). */
  app?: string;
}

export interface CommandSource {
  id: string;
  /** Group heading for the results ("Contacts"). */
  group: string;
  /** Minimum query length. Default 2. */
  minQuery?: number;
  /** ms. Default 200. */
  debounce?: number;
  /** Return matching commands. Abort when `signal` fires (the query changed). */
  search: (query: string, options: { signal: AbortSignal }) => Promise<CommandAction[]>;
}

export interface CommandRegistry {
  /** Adds commands; returns the remove function. Later registrations win for the same id. */
  register: (actions: CommandAction[]) => () => void;
  registerSource: (source: CommandSource) => () => void;
  getActions: () => CommandAction[];
  getSources: () => CommandSource[];
  subscribe: (listener: () => void) => () => void;
}

/**
 * A command store (`useSyncExternalStore`). App shells create one from their app definitions;
 * pages add to it with `useRegisterCommands`.
 */
export function createCommandRegistry(init: { actions?: CommandAction[]; sources?: CommandSource[] } = {}): CommandRegistry {
  const regs = new Map<symbol, CommandAction[]>();
  const sources = new Map<symbol, CommandSource>();
  const listeners = new Set<() => void>();
  let actionsSnap: CommandAction[] = [];
  let sourcesSnap: CommandSource[] = [];
  const rebuild = () => {
    const byId = new Map<string, CommandAction>();
    for (const list of regs.values()) for (const a of list) byId.set(a.id, a);
    actionsSnap = [...byId.values()];
    const seen = new Map<string, CommandSource>();
    for (const s of sources.values()) seen.set(s.id, s);
    sourcesSnap = [...seen.values()];
    listeners.forEach((l) => l());
  };
  const registry: CommandRegistry = {
    register(actions) {
      const key = Symbol("commands");
      regs.set(key, actions);
      rebuild();
      return () => {
        if (regs.delete(key)) rebuild();
      };
    },
    registerSource(source) {
      const key = Symbol("source");
      sources.set(key, source);
      rebuild();
      return () => {
        if (sources.delete(key)) rebuild();
      };
    },
    getActions: () => actionsSnap,
    getSources: () => sourcesSnap,
    subscribe(l) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
  if (init.actions?.length) registry.register(init.actions);
  for (const s of init.sources ?? []) registry.registerSource(s);
  return registry;
}

interface PaletteContextValue {
  registry: CommandRegistry;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  /** Sub-page to open next (`open(pageId)`). */
  initialPage: string | undefined;
  setInitialPage: (id: string | undefined) => void;
  run: (action: CommandAction, query?: string) => unknown;
  can: (permission: string) => boolean;
  navigate: (href: string) => void;
}

const PaletteContext = React.createContext<PaletteContextValue | null>(null);

const allowedBy = (a: CommandAction, can: (p: string) => boolean) => !a.permission || (Array.isArray(a.permission) ? a.permission : [a.permission]).every((p) => can(p));
const toShortcut = (s: string | string[]) => (Array.isArray(s) ? s.join("+") : s);

const RECENT_KEY = "ui-cmd-recent";
function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 8) : [];
  } catch {
    return [];
  }
}
function pushRecent(id: string) {
  try {
    const next = [id, ...readRecents().filter((x) => x !== id)].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}

function isTyping(el: EventTarget | null) {
  const t = el as HTMLElement | null;
  if (!t?.tagName) return false;
  return t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable;
}

export interface CommandProviderProps {
  /** Use an existing registry (e.g. one built from app definitions). Default: a new one. */
  registry?: CommandRegistry;
  /** Static commands added for the provider's lifetime. */
  actions?: CommandAction[];
  sources?: CommandSource[];
  /** Toggle shortcut. Default `"mod+k"`; `false` disables it. */
  shortcut?: string | false;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * Holds the command registry, the palette's open state and the single global `keydown` listener
 * (`mod+k` plus commands marked `global`). Inside inputs only shortcuts with `mod` fire. App shell
 * mounts one; mount it yourself for a standalone palette.
 */
export function CommandProvider({ registry: registryProp, actions, sources, shortcut = "mod+k", open: openProp, defaultOpen = false, onOpenChange, children }: CommandProviderProps) {
  const [ownRegistry] = React.useState(() => createCommandRegistry());
  const registry = registryProp ?? ownRegistry;
  const [openState, setOpenState] = React.useState(defaultOpen);
  const isOpen = openProp ?? openState;
  const onOpenChangeRef = useLatest(onOpenChange);
  const setOpen = React.useCallback(
    (o: boolean) => {
      if (openProp === undefined) setOpenState(o);
      onOpenChangeRef.current?.(o);
    },
    [openProp, onOpenChangeRef],
  );
  const [initialPage, setInitialPage] = React.useState<string | undefined>();
  const vamos = useVamos();
  const can = useCan();

  const navigate = React.useCallback(
    (href: string) => {
      if (isAbsoluteHref(href) && typeof window !== "undefined") {
        if (/^(mailto|tel):/i.test(href)) window.location.href = href;
        else if (href.startsWith(window.location.origin)) window.location.assign(href);
        else window.open(href, "_blank", "noopener,noreferrer");
      } else vamos.navigate(href);
    },
    [vamos],
  );

  React.useEffect(() => (actions?.length ? registry.register(actions) : undefined), [registry, actions]);
  React.useEffect(() => {
    const off = (sources ?? []).map((s) => registry.registerSource(s));
    return () => off.forEach((f) => f());
  }, [registry, sources]);

  const run = React.useCallback(
    (a: CommandAction, query = "") => {
      const ctx: CommandContext = { navigate, close: () => setOpen(false), query, can };
      const result = a.perform?.(ctx);
      if (a.href) navigate(a.href);
      return result;
    },
    [navigate, setOpen, can],
  );

  const latest = useLatest({ isOpen, setOpen, run, can });
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const toggle = shortcut ? parseShortcut(shortcut) : null;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return;
      const mac = isApplePlatform();
      const { isOpen: o, setOpen: so, run: r, can: c } = latest.current;
      if (toggle && matchesShortcut(e, toggle, mac)) {
        e.preventDefault();
        so(!o);
        return;
      }
      if (o) return;
      for (const a of registry.getActions()) {
        if (!a.global || !a.shortcut) continue;
        const parsed = parseShortcut(toShortcut(a.shortcut));
        if (!matchesShortcut(e, parsed, mac)) continue;
        if (isTyping(e.target) && !(parsed.mod || parsed.meta || parsed.ctrl)) return;
        if (!allowedBy(a, c)) continue;
        e.preventDefault();
        void r(a);
        return;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [registry, shortcut, latest]);

  const value = React.useMemo<PaletteContextValue>(
    () => ({ registry, isOpen, setOpen, initialPage, setInitialPage, run, can, navigate }),
    [registry, isOpen, setOpen, initialPage, run, can, navigate],
  );
  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

/** The registry of the nearest `CommandProvider` (or `null`). */
export function useCommandRegistry(): CommandRegistry | null {
  return React.useContext(PaletteContext)?.registry ?? null;
}

/**
 * Adds commands while the calling component is mounted (page-scoped: "Publish" only exists in the
 * editor). `perform` always calls the latest closure. Re-registers when ids / titles change or `deps` change.
 *
 * ```tsx
 * useRegisterCommands([{ id: "cms.post.publish", title: "Publish post", group: "This post", perform: publish }]);
 * ```
 */
export function useRegisterCommands(actions: CommandAction[], deps?: React.DependencyList): void {
  const registry = useCommandRegistry();
  const latest = useLatest(actions);
  const key = actions.map((a) => `${a.id}\u0001${a.title}\u0001${a.subtitle ?? ""}\u0001${a.group ?? ""}\u0001${a.href ?? ""}`).join("\u0002");
  React.useEffect(() => {
    if (!registry) return;
    const wrapped = latest.current.map((a): CommandAction => ({
      ...a,
      perform: a.perform ? (ctx) => (latest.current.find((x) => x.id === a.id)?.perform ?? a.perform)!(ctx) : undefined,
      when: a.when ? (ctx) => (latest.current.find((x) => x.id === a.id)?.when ?? a.when)!(ctx) : undefined,
    }));
    return registry.register(wrapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry, key, ...(deps ?? [])]);
}

/** Adds an async search source (record search) while mounted. */
export function useCommandSource(source: CommandSource | null | undefined): void {
  const registry = useCommandRegistry();
  const latest = useLatest(source);
  const id = source?.id;
  const group = source?.group;
  React.useEffect(() => {
    if (!registry || !latest.current) return;
    const s = latest.current;
    return registry.registerSource({ ...s, search: (q, o) => (latest.current ?? s).search(q, o) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry, id, group]);
}

export interface CommandPaletteControls {
  /** Open the palette, optionally on the sub-page of a command with `children`. */
  open: (pageId?: string) => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
  /** `false` when there is no `CommandProvider` above (calls are no-ops). */
  available: boolean;
}

/** Open / close the palette from anywhere (a search button, an empty state). */
export function useCommandPalette(): CommandPaletteControls {
  const ctx = React.useContext(PaletteContext);
  return React.useMemo(
    () =>
      ctx
        ? {
            open: (pageId?: string) => {
              ctx.setInitialPage(pageId);
              ctx.setOpen(true);
            },
            close: () => ctx.setOpen(false),
            toggle: () => ctx.setOpen(!ctx.isOpen),
            isOpen: ctx.isOpen,
            available: true,
          }
        : { open: () => {}, close: () => {}, toggle: () => {}, isOpen: false, available: false },
    [ctx],
  );
}

/* ------------------------------------------------------------------ */
/* CommandPalette                                                      */
/* ------------------------------------------------------------------ */

type Page = { id: string; title: string; actions: CommandAction[]; status: "ready" | "loading" | "error" };
type SourceState = { status: "loading" | "ready" | "error"; items: CommandAction[] };

function ActionIcon({ icon }: { icon: CommandAction["icon"] }) {
  if (!icon) return null;
  if (React.isValidElement(icon)) return icon;
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in (icon as object))) {
    const Icon = icon as React.ComponentType<{ className?: string }>;
    return <Icon className="size-4" />;
  }
  return <>{icon as React.ReactNode}</>;
}

function Highlight({ text, query, locale }: { text: string; query: string; locale: string }) {
  if (!query.trim()) return <>{text}</>;
  return (
    <>
      {highlightParts(text, query, locale).map((p, i) =>
        p.match ? (
          <mark key={i} className="rounded-[3px] bg-accent-soft text-fg">
            {p.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        ),
      )}
    </>
  );
}

export interface CommandPaletteProps {
  /** Default `"lg"`. */
  size?: "md" | "lg";
  placeholder?: string;
  /** Show recently used commands first when the query is empty. Default `true`. */
  recents?: boolean;
  /** Footer hint bar (↑↓ navigate · ↵ select · ⌫ back · esc close). Default `true`. */
  footer?: boolean;
  /** Group order; unlisted groups follow in first-seen order. */
  groupOrder?: string[];
  labels?: Partial<CommandLabels>;
}

/**
 * The ready-made ⌘K palette wired to the nearest `CommandProvider`: ranked local commands,
 * recents, async sources (debounced, aborted on every keystroke), sub-pages with a breadcrumb chip
 * (Backspace on an empty input goes back), a spinner while an action runs, and a polite result count.
 * App shell mounts one for you.
 */
export function CommandPalette({ size = "lg", placeholder, recents: showRecents = true, footer = true, groupOrder, labels }: CommandPaletteProps) {
  const ctx = React.useContext(PaletteContext);
  if (!ctx) throw new Error("CommandPalette must be used inside <CommandProvider> (App shell provides one).");
  const { registry, isOpen, setOpen, initialPage, setInitialPage, run, can, navigate } = ctx;
  const t = useLabels("command", commandLabels, labels);
  const { locale } = useLocale();
  const actions = React.useSyncExternalStore(registry.subscribe, registry.getActions, registry.getActions);
  const sources = React.useSyncExternalStore(registry.subscribe, registry.getSources, registry.getSources);
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState<Page[]>([]);
  const [running, setRunning] = React.useState<string | null>(null);
  const [recentIds, setRecentIds] = React.useState<string[]>([]);
  const [sourceState, setSourceState] = React.useState<Record<string, SourceState>>({});
  const page = pages[pages.length - 1];
  const filter = React.useMemo(() => cmdkFilter(locale), [locale]);

  const ctxFor = React.useCallback((q: string): CommandContext => ({ navigate, close: () => setOpen(false), query: q, can }), [navigate, setOpen, can]);

  const pushPage = React.useCallback(async (a: CommandAction) => {
    if (!a.children) return;
    setQuery("");
    if (Array.isArray(a.children)) {
      setPages((p) => [...p, { id: a.id, title: a.title, actions: a.children as CommandAction[], status: "ready" }]);
      return;
    }
    setPages((p) => [...p, { id: a.id, title: a.title, actions: [], status: "loading" }]);
    try {
      const list = await a.children();
      setPages((p) => p.map((x) => (x.id === a.id ? { ...x, actions: list, status: "ready" } : x)));
    } catch {
      setPages((p) => p.map((x) => (x.id === a.id ? { ...x, status: "error" } : x)));
    }
  }, []);

  // Reset on open; honour open(pageId).
  React.useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setRunning(null);
    setRecentIds(showRecents ? readRecents() : []);
    const target = initialPage ? registry.getActions().find((a) => a.id === initialPage) : undefined;
    setPages([]);
    if (target) void pushPage(target);
    if (initialPage) setInitialPage(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const visible = React.useMemo(() => {
    const c = ctxFor(query);
    const list = page ? page.actions : actions;
    return list.filter((a) => allowedBy(a, can) && (!a.when || a.when(c)));
  }, [page, actions, can, ctxFor, query]);

  // Async sources (root page only).
  const activeSources = React.useMemo(() => (page ? [] : sources.filter((s) => query.trim().length >= (s.minQuery ?? 2))), [page, sources, query]);
  React.useEffect(() => {
    const q = query.trim();
    if (!activeSources.length) {
      setSourceState({});
      return;
    }
    const controllers: AbortController[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    setSourceState((prev) => Object.fromEntries(activeSources.map((s) => [s.id, { status: "loading", items: prev[s.id]?.items ?? [] }])));
    for (const s of activeSources) {
      const ac = new AbortController();
      controllers.push(ac);
      timers.push(
        setTimeout(() => {
          s.search(q, { signal: ac.signal }).then(
            (items) => !ac.signal.aborted && setSourceState((prev) => ({ ...prev, [s.id]: { status: "ready", items } })),
            () => !ac.signal.aborted && setSourceState((prev) => ({ ...prev, [s.id]: { status: "error", items: [] } })),
          );
        }, s.debounce ?? 200),
      );
    }
    return () => {
      timers.forEach(clearTimeout);
      controllers.forEach((c) => c.abort());
    };
  }, [activeSources, query]);

  const groups = React.useMemo(() => {
    const q = query.trim();
    let ranked: CommandAction[];
    if (q) {
      ranked = visible
        .map((a) => ({ a, s: filter(a.title, q, [...(a.keywords ?? []), a.subtitle ?? "", a.group ?? "", a.app ?? ""]) }))
        .filter((x) => x.s > 0)
        .sort((x, y) => y.s - x.s || (y.a.priority ?? 0) - (x.a.priority ?? 0))
        .map((x) => x.a);
    } else ranked = [...visible].sort((x, y) => (y.priority ?? 0) - (x.priority ?? 0));
    const map = new Map<string, CommandAction[]>();
    const defaultGroup = page ? page.title : "Actions";
    for (const a of ranked) {
      const g = page ? defaultGroup : (a.group ?? defaultGroup);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(a);
    }
    let entries = [...map.entries()];
    if (groupOrder && !q) entries = entries.sort(([a], [b]) => (groupOrder.indexOf(a) + 1 || 999) - (groupOrder.indexOf(b) + 1 || 999));
    return entries;
  }, [visible, query, filter, page, groupOrder]);

  const recentActions = React.useMemo(() => {
    if (page || query.trim() || !showRecents) return [];
    const byId = new Map(visible.map((a) => [a.id, a]));
    return recentIds.map((id) => byId.get(id)).filter((a): a is CommandAction => Boolean(a)).slice(0, 5);
  }, [page, query, showRecents, recentIds, visible]);

  const sourceGroups = activeSources.map((s) => ({ source: s, state: sourceState[s.id] ?? { status: "loading" as const, items: [] } }));
  const count = groups.reduce((n, [, l]) => n + l.length, 0) + sourceGroups.reduce((n, g) => n + g.state.items.length, 0);
  const searching = sourceGroups.some((g) => g.state.status === "loading");

  const select = async (a: CommandAction) => {
    if (running) return;
    if (a.children) return void pushPage(a);
    pushRecent(a.id);
    const result = run(a, query);
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setRunning(a.id);
      try {
        await result;
      } finally {
        setRunning(null);
      }
    }
    setOpen(false);
  };

  const renderItem = (a: CommandAction, valuePrefix = "") => (
    <CommandItem
      key={valuePrefix + a.id}
      value={valuePrefix + a.id}
      onSelect={() => void select(a)}
      icon={<ActionIcon icon={a.icon} />}
      description={a.subtitle}
      shortcut={a.shortcut}
      chevron={Boolean(a.children)}
      loading={running === a.id}
      badge={a.app ? <Badge size="sm" tone="outline" shape="square">{a.app}</Badge> : undefined}
    >
      <Highlight text={a.title} query={query} locale={locale} />
    </CommandItem>
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !query && pages.length) {
      e.preventDefault();
      setPages((p) => p.slice(0, -1));
    }
  };

  const nothing = count === 0 && !searching && !(page?.status === "loading");

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setOpen}
      size={size}
      labels={labels}
      commandProps={{ shouldFilter: false, className: "max-h-[inherit]" }}
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        labels={labels}
        chip={
          page ? (
            <>
              <ArrowLeft aria-hidden className="size-3 rtl:-scale-x-100" />
              {page.title}
            </>
          ) : undefined
        }
        end={searching ? <Spinner size="xs" className="text-fg-subtle" /> : undefined}
      />
      {searching ? <Progress aria-label={t("loading")} value={null} size="xs" className="-mt-px rounded-none" /> : null}
      <CommandList>
        {page?.status === "loading" ? <CommandLoading labels={labels} /> : null}
        {page?.status === "error" ? <p className="px-3 py-2.5 text-[13px] text-danger">{t("sourceError", { group: page.title })}</p> : null}
        {nothing && page?.status !== "error" ? (
          <EmptyState size="sm" kind="no-results" role="presentation" title={query.trim() ? t("noResultsFor", { query: query.trim() }) : t("empty")} className="py-8" />
        ) : null}
        {recentActions.length ? <CommandGroup heading={t("recent")}>{recentActions.map((a) => renderItem(a, "recent:"))}</CommandGroup> : null}
        {groups.map(([g, list]) => (
          <CommandGroup key={g} heading={g}>
            {list.map((a) => renderItem(a))}
          </CommandGroup>
        ))}
        {sourceGroups.map(({ source, state }) =>
          state.status === "error" ? (
            <CommandGroup key={source.id} heading={source.group} forceMount>
              <p className="px-2.5 py-1.5 text-[13px] text-danger">{t("sourceError", { group: source.group })}</p>
            </CommandGroup>
          ) : state.items.length ? (
            <CommandGroup key={source.id} heading={source.group}>
              {state.items.map((a) => renderItem(a, `${source.id}:`))}
            </CommandGroup>
          ) : null,
        )}
      </CommandList>
      <div aria-live="polite" className="sr-only">
        {query.trim() && !searching ? t("results", { count }) : ""}
      </div>
      {footer ? (
        <div data-slot="command-footer" className="flex items-center gap-4 border-t border-line px-4 py-2 text-[11.5px] text-fg-subtle max-sm:hidden">
          <span className="flex items-center gap-1.5">
            <KbdGroup keys={["up", "down"]} size="sm" /> {t("navigate")}
          </span>
          <span className="flex items-center gap-1.5">
            <CornerDownLeft aria-hidden className="size-3" /> {t("select")}
          </span>
          {pages.length ? (
            <span className="flex items-center gap-1.5">
              <KbdGroup keys={["backspace"]} size="sm" /> {t("back")}
            </span>
          ) : null}
          <span className="ms-auto flex items-center gap-1.5">
            <KbdGroup keys={["esc"]} size="sm" /> {t("close")}
          </span>
        </div>
      ) : null}
    </CommandDialog>
  );
}
