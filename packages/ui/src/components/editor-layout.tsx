"use client";

import * as React from "react";
import { Collapsible } from "radix-ui";
import { ArrowLeft, Check, ChevronDown, CloudOff, PanelRight, TriangleAlert } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { SmartLink } from "../lib/provider";
import { useHotkeys } from "../lib/use-hotkeys";
import { useContainerWidth } from "../lib/use-container-width";
import { useControllableState } from "../lib/use-controllable-state";
import { useComposedRefs } from "../lib/compose-refs";
import type { MenuEntry } from "../lib/variants";
import { Button } from "./button";
import { ActionMenu } from "./dropdown-menu";
import { Skeleton, SkeletonText } from "./skeleton";
import { Spinner } from "./spinner";
import { Sheet, SheetBody, SheetContent, SheetHeader } from "./sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { SidePaneHandle } from "./record-detail-layout";

/* ------------------------------------------------------------------ */
/* Labels & context                                                    */
/* ------------------------------------------------------------------ */

const editorLabels = {
  panel: "Settings",
  togglePanel: "Settings panel",
  resizePanel: "Resize settings panel",
  focusMode: "Focus mode",
  exitFocusMode: "Exit focus mode",
  moreActions: "More actions",
  dirty: "Unsaved changes",
  saving: "Saving…",
  saved: "Saved {time}",
  savedJustNow: "Saved just now",
  savedPlain: "Saved",
  error: "Couldn't save",
  retry: "Retry",
  offline: "Offline · changes kept locally",
  loading: "Loading editor",
};

export type EditorLayoutLabels = Partial<typeof editorLabels>;

/** Below this container width (44rem) the side panel becomes a sheet. Matches navigation.css. */
const NARROW = 704;

interface EditorLayoutContextValue {
  panelId: string;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  narrow: boolean;
  focusMode: boolean;
  setFocusMode: (on: boolean) => void;
  readOnly: boolean;
  idle: boolean;
  resizable: boolean;
  panelWidth: number;
  defaultPanelWidth: number;
  setPanelWidth: (w: number) => void;
  labels?: EditorLayoutLabels;
}

const EditorLayoutContext = React.createContext<EditorLayoutContextValue | null>(null);

function useEditorLayout() {
  return React.useContext(EditorLayoutContext);
}

/* ------------------------------------------------------------------ */
/* EditorLayout                                                        */
/* ------------------------------------------------------------------ */

export interface EditorLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Side panel visibility (controlled). On narrow layouts this drives the sheet. */
  panelOpen?: boolean;
  /** Default `true` on wide layouts. Narrow layouts always start with the sheet closed. */
  defaultPanelOpen?: boolean;
  onPanelOpenChange?: (open: boolean) => void;
  /** Panel width in px (controlled with `onPanelWidthChange`). */
  panelWidth?: number;
  /** Default 320. */
  defaultPanelWidth?: number;
  onPanelWidthChange?: (width: number) => void;
  /** Drag (or arrow-key) the panel edge. */
  resizable?: boolean;
  /** Hides the panel and dims the bar until the pointer moves. `mod+shift+f` toggles it; Esc leaves it. */
  focusMode?: boolean;
  defaultFocusMode?: boolean;
  /**
   * Called when focus mode changes — hide the App shell sidebar from here
   * (`<AppShell showSidebar={!focus}>`).
   */
  onFocusModeChange?: (on: boolean) => void;
  /** Locked version: bar actions hidden, panel controls disabled. Show an Alert in `EditorCanvas notice`. */
  readOnly?: boolean;
  /**
   * `"page"` (default): the page scrolls, bar and panel stick under the top bar.
   * `"panes"`: the layout fills its parent's height and canvas and panel scroll on their own.
   */
  scroll?: "page" | "panes";
  /** Where the bar sticks in `"page"` mode. Default `"var(--topbar-h)"`. Use `0` in your own scroll box. */
  stickyTop?: number | string;
  /** Register `mod+shift+,` (panel) and `mod+shift+f` (focus mode). Default `true`. */
  shortcuts?: boolean;
  labels?: EditorLayoutLabels;
}

/**
 * The "edit one thing" page: a sticky bar with back link, title, save status and publish
 * actions; a wide content canvas; and a side panel of collapsible settings sections (status,
 * SEO, taxonomy…). Below 44rem (704px) of its own width the panel opens as a non-modal sheet.
 *
 * ```tsx
 * <EditorLayout>
 *   <EditorBar back={{ href: "/posts", label: "Posts" }} title="Spring menu launch"
 *     status={<SaveStatus state="saved" at={savedAt} />}
 *     actions={<><Button>Preview</Button><Button variant="primary">Publish</Button></>} />
 *   <EditorCanvas width="prose">{editor}</EditorCanvas>
 *   <EditorPanel>
 *     <EditorPanelSection id="status" title="Status" summary="Draft">…</EditorPanelSection>
 *   </EditorPanel>
 * </EditorLayout>
 * ```
 */
export const EditorLayout = React.forwardRef<HTMLDivElement, EditorLayoutProps>(function EditorLayout(
  {
    panelOpen: panelOpenProp,
    defaultPanelOpen = true,
    onPanelOpenChange,
    panelWidth: panelWidthProp,
    defaultPanelWidth = 320,
    onPanelWidthChange,
    resizable = false,
    focusMode: focusModeProp,
    defaultFocusMode = false,
    onFocusModeChange,
    readOnly = false,
    scroll = "page",
    stickyTop,
    shortcuts = true,
    labels,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const { ref: measureRef, width } = useContainerWidth<HTMLDivElement>();
  const composed = useComposedRefs(ref, measureRef);
  const narrow = width !== undefined && width < NARROW;
  const autoId = React.useId();
  const panelId = `editor-panel${autoId.replace(/:/g, "")}`;

  const [wideOpen, setWideOpen] = useControllableState({ value: panelOpenProp, defaultValue: defaultPanelOpen, onChange: onPanelOpenChange, name: "EditorLayout" });
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const panelOpen = narrow ? (panelOpenProp !== undefined ? panelOpenProp : sheetOpen) : wideOpen;
  const setPanelOpen = React.useCallback(
    (open: boolean) => {
      if (narrow) {
        setSheetOpen(open);
        onPanelOpenChange?.(open);
      } else setWideOpen(open);
    },
    [narrow, setWideOpen, onPanelOpenChange],
  );
  // Leaving the narrow layout closes the sheet; the wide panel keeps its own state.
  React.useEffect(() => {
    if (!narrow) setSheetOpen(false);
  }, [narrow]);

  const [focusMode, setFocusMode] = useControllableState({ value: focusModeProp, defaultValue: defaultFocusMode, onChange: onFocusModeChange, name: "EditorLayout" });
  const [panelWidth, setPanelWidth] = useControllableState({ value: panelWidthProp, defaultValue: defaultPanelWidth, onChange: onPanelWidthChange, name: "EditorLayout" });

  // Focus mode: the bar dims after 1.5s without pointer movement.
  const [idle, setIdle] = React.useState(false);
  React.useEffect(() => {
    if (!focusMode) {
      setIdle(false);
      return;
    }
    let timer = window.setTimeout(() => setIdle(true), 1500);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), 1500);
    };
    window.addEventListener("pointermove", wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
    };
  }, [focusMode]);

  // `mod+shift+,` — `,` is `<` with Shift on many layouts, so listen for both.
  useHotkeys(["mod+shift+comma", "mod+shift+<"], () => setPanelOpen(!panelOpen), { enabled: shortcuts && !focusMode });
  useHotkeys("mod+shift+f", () => setFocusMode(!focusMode), { enabled: shortcuts });
  useHotkeys("escape", () => setFocusMode(false), { enabled: focusMode, preventDefault: false });

  const ctx = React.useMemo<EditorLayoutContextValue>(
    () => ({ panelId, panelOpen: panelOpen && !focusMode, setPanelOpen, narrow, focusMode, setFocusMode, readOnly, idle, resizable, panelWidth, defaultPanelWidth, setPanelWidth, labels }),
    [panelId, panelOpen, setPanelOpen, narrow, focusMode, setFocusMode, readOnly, idle, resizable, panelWidth, defaultPanelWidth, setPanelWidth, labels],
  );
  const top = stickyTop === undefined ? undefined : typeof stickyTop === "number" ? `${stickyTop}px` : stickyTop;

  return (
    <EditorLayoutContext.Provider value={ctx}>
      <div
        ref={composed}
        data-slot="editor-layout"
        data-scroll={scroll}
        data-focus-mode={focusMode ? "" : undefined}
        data-read-only={readOnly ? "" : undefined}
        className={cn("@container/editor relative w-full min-w-0", scroll === "panes" && "h-full min-h-0", className)}
        style={{ "--editor-panel-w": `${panelWidth}px`, ...(top !== undefined ? { "--editor-sticky-top": top } : null), ...style } as React.CSSProperties}
        {...props}
      >
        <div className="vui-editor-grid" data-panel={ctx.panelOpen && !narrow ? "open" : "closed"} data-scroll={scroll}>
          {children}
        </div>
      </div>
    </EditorLayoutContext.Provider>
  );
});

/* ------------------------------------------------------------------ */
/* EditorBar                                                           */
/* ------------------------------------------------------------------ */

export interface EditorBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** "← Posts". The label hides on narrow layouts (it stays the accessible name). */
  back?: { href: string; label: string };
  /** Document title — text or an inline-editable title. */
  title?: React.ReactNode;
  /** `SaveStatus`. */
  status?: React.ReactNode;
  /** Primary actions, always visible ("Publish"). Hidden when the layout is `readOnly`. */
  actions?: React.ReactNode;
  /** Secondary actions ("Preview", "Schedule"); hidden below 640px — mirror them in `menu`. */
  secondaryActions?: React.ReactNode;
  /** "⋯" menu at the end. */
  menu?: MenuEntry[];
  /** Show the panel toggle button. Default `true`. */
  panelToggle?: boolean;
  /** Show the focus-mode button. Default `false` (the shortcut always works). */
  focusToggle?: boolean;
  labels?: EditorLayoutLabels;
}

/** The sticky publish bar: back, title, save status, actions, panel toggle. */
export const EditorBar = React.forwardRef<HTMLDivElement, EditorBarProps>(function EditorBar(
  { back, title, status, actions, secondaryActions, menu, panelToggle = true, focusToggle = false, labels, className, children, ...props },
  ref,
) {
  const ctx = useEditorLayout();
  const t = useLabels("editor", editorLabels, labels ?? ctx?.labels);
  const readOnly = ctx?.readOnly ?? false;
  return (
    <div
      ref={ref}
      data-slot="editor-bar"
      data-idle={ctx?.idle ? "" : undefined}
      className={cn("vui-editor-bar surface-bar flex h-(--editor-bar-h,3.5rem) min-w-0 items-center gap-2 px-3 @2xl/editor:gap-3 @2xl/editor:px-4", className)}
      {...props}
    >
      {back ? (
        <SmartLink
          href={back.href}
          aria-label={back.label}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-ui-sm px-2 text-[13px] text-fg-muted transition-colors hover:bg-hover hover:text-fg focus-ring"
        >
          <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          <span aria-hidden className="hidden @3xl/editor:inline">{back.label}</span>
        </SmartLink>
      ) : null}
      {back && title ? <span aria-hidden className="hidden h-5 w-px bg-line @3xl/editor:block" /> : null}
      <div data-slot="editor-bar-title" className="min-w-0 flex-1 truncate text-[14px] font-medium text-fg">
        {title}
      </div>
      {status ? <div className="hidden shrink-0 @md/editor:block">{status}</div> : null}
      <div className="flex shrink-0 items-center gap-1.5">
        {secondaryActions && !readOnly ? <div className="hidden items-center gap-1.5 @2xl/editor:flex">{secondaryActions}</div> : null}
        {actions && !readOnly ? actions : null}
        {children}
        {menu?.length ? <ActionMenu items={menu} triggerSize="sm" triggerLabel={t("moreActions")} /> : null}
        {focusToggle && ctx ? (
          <Button variant="ghost" size="sm" aria-pressed={ctx.focusMode} onClick={() => ctx.setFocusMode(!ctx.focusMode)} aria-keyshortcuts="Control+Shift+F Meta+Shift+F">
            {ctx.focusMode ? t("exitFocusMode") : t("focusMode")}
          </Button>
        ) : null}
        {panelToggle && ctx && !ctx.focusMode ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("togglePanel")}
            title={t("togglePanel")}
            aria-expanded={ctx.panelOpen}
            aria-controls={ctx.panelOpen || !ctx.narrow ? ctx.panelId : undefined}
            aria-keyshortcuts="Control+Shift+Comma Meta+Shift+Comma"
            data-active={ctx.panelOpen ? "" : undefined}
            onClick={() => ctx.setPanelOpen(!ctx.panelOpen)}
            className="data-active:bg-selected"
          >
            <PanelRight aria-hidden className="rtl:-scale-x-100" />
          </Button>
        ) : null}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* SaveStatus                                                          */
/* ------------------------------------------------------------------ */

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error" | "offline";

export interface SaveStatusProps extends React.HTMLAttributes<HTMLSpanElement> {
  state: SaveState;
  /** Time of the last save, for "Saved 2 min ago". */
  at?: Date | number;
  /** Shows "Retry" in the error state. */
  onRetry?: () => void;
  /** Warn before leaving the page while `dirty` or `saving` (`beforeunload`). Default `true`. */
  guard?: boolean;
  /** Fixed "now" for docs and tests. */
  now?: Date | number;
  labels?: EditorLayoutLabels;
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

/**
 * Where the document's changes are: "Unsaved changes" · "Saving…" · "Saved 2 min ago" ·
 * "Couldn't save · Retry" · "Offline · changes kept locally". A polite status; the error is an alert.
 */
export const SaveStatus = React.forwardRef<HTMLSpanElement, SaveStatusProps>(function SaveStatus(
  { state, at, onRetry, guard = true, now: nowProp, labels, className, ...props },
  ref,
) {
  const ctx = useEditorLayout();
  const t = useLabels("editor", editorLabels, labels ?? ctx?.labels);
  const { locale } = useLocale();
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (state !== "saved" || at === undefined || nowProp !== undefined) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, [state, at, nowProp]);

  React.useEffect(() => {
    if (!guard || (state !== "dirty" && state !== "saving")) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [guard, state]);

  const savedText = React.useMemo(() => {
    if (at === undefined) return t("savedPlain");
    const now = nowProp !== undefined ? +nowProp : Date.now();
    const secs = Math.round((now - +at) / 1000);
    if (secs < 45) return t("savedJustNow");
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
    for (const [unit, size] of UNITS) {
      if (secs >= size || unit === "minute") return t("saved", { time: rtf.format(-Math.max(1, Math.round(secs / size)), unit) });
    }
    return t("savedPlain");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at, nowProp, locale, t, tick]);

  const content =
    state === "dirty" ? (
      <>
        <span aria-hidden className="size-1.5 rounded-full bg-warning" />
        {t("dirty")}
      </>
    ) : state === "saving" ? (
      <>
        <Spinner size="xs" />
        {t("saving")}
      </>
    ) : state === "saved" ? (
      <>
        <Check aria-hidden className="size-3.5 text-success" />
        {savedText}
      </>
    ) : state === "offline" ? (
      <>
        <CloudOff aria-hidden className="size-3.5" />
        {t("offline")}
      </>
    ) : null;

  return (
    <span ref={ref} data-slot="save-status" data-state={state} className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-fg-subtle", className)} {...props}>
      <span role="status" className="inline-flex items-center gap-1.5">
        {content}
      </span>
      {state === "error" ? (
        <span role="alert" className="inline-flex items-center gap-1.5 text-danger">
          <TriangleAlert aria-hidden className="size-3.5" />
          {t("error")}
          {onRetry ? (
            <>
              <span aria-hidden>·</span>
              <button type="button" onClick={onRetry} className="rounded-ui-sm font-medium underline underline-offset-2 hover:no-underline focus-ring">
                {t("retry")}
              </button>
            </>
          ) : null}
        </span>
      ) : null}
    </span>
  );
});

/* ------------------------------------------------------------------ */
/* EditorCanvas                                                        */
/* ------------------------------------------------------------------ */

const canvasWidth = { prose: "max-w-[720px]", wide: "max-w-[1080px]", full: "max-w-none" } as const;

export interface EditorCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column width: `prose` 720px (default) · `wide` 1080px · `full`. */
  width?: "prose" | "wide" | "full";
  /** `surface` (default) or `scene` — the bare page background for distraction-free writing. */
  tone?: "surface" | "scene";
  /** Banner above the content (a read-only Alert, a conflict warning). */
  notice?: React.ReactNode;
  /** Skeleton title and paragraphs. */
  loading?: boolean;
  labels?: EditorLayoutLabels;
}

/** The writing area: a centred column with generous margins. */
export const EditorCanvas = React.forwardRef<HTMLDivElement, EditorCanvasProps>(function EditorCanvas(
  { width = "prose", tone = "surface", notice, loading, labels, className, children, ...props },
  ref,
) {
  const ctx = useEditorLayout();
  const t = useLabels("editor", editorLabels, labels ?? ctx?.labels);
  return (
    <div
      ref={ref}
      data-slot="editor-canvas"
      data-tone={tone}
      aria-busy={loading || undefined}
      className={cn("vui-editor-canvas min-w-0 px-[var(--gutter,1.5rem)] py-8 @3xl/editor:py-12", tone === "surface" ? "bg-surface" : "bg-transparent", className)}
      {...props}
    >
      <div className={cn("mx-auto flex w-full flex-col gap-6", canvasWidth[width])}>
        {notice}
        {loading ? (
          <div role="status" aria-label={t("loading")} className="grid gap-6">
            <Skeleton className="h-10 w-3/4 rounded-ui-sm" />
            <SkeletonText lines={4} />
            <SkeletonText lines={5} />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* EditorPanel                                                         */
/* ------------------------------------------------------------------ */

export interface EditorPanelProps extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue"> {
  /** Panel tabs ("Document" / "Block"). Put each tab's sections in an `EditorPanelContent`. */
  tabs?: { id: string; label: string }[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Sticky footer inside the panel (e.g. "Move to trash"). */
  footer?: React.ReactNode;
  /** Accessible name of the complementary landmark. Default "Settings". */
  "aria-label"?: string;
  labels?: EditorLayoutLabels;
}

/** The side panel: `<aside>` of collapsible settings sections; a non-modal sheet on narrow layouts. */
export const EditorPanel = React.forwardRef<HTMLElement, EditorPanelProps>(function EditorPanel(
  { tabs, value: valueProp, defaultValue, onValueChange, footer, labels, className, children, ...props },
  ref,
) {
  const ctx = useEditorLayout();
  const t = useLabels("editor", editorLabels, labels ?? ctx?.labels);
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue: defaultValue ?? tabs?.[0]?.id ?? "", onChange: onValueChange, name: "EditorPanel" });
  const label = props["aria-label"] ?? t("panel");

  let inner: React.ReactNode = children;
  if (tabs?.length) {
    inner = (
      <Tabs value={value} onValueChange={setValue} className="gap-0">
        <div className="sticky top-0 z-[1] border-b border-line bg-surface px-3 py-2.5">
          <TabsList variant="segmented" size="sm" fill aria-label={label}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {children}
      </Tabs>
    );
  }
  const body = (
    <fieldset disabled={ctx?.readOnly || undefined} className="m-0 flex min-h-0 min-w-0 flex-1 flex-col border-0 p-0">
      <div className="min-h-0 flex-1">{inner}</div>
      {footer ? <div className="sticky bottom-0 border-t border-line bg-surface px-4 py-3">{footer}</div> : null}
    </fieldset>
  );

  if (ctx?.narrow) {
    return (
      <Sheet open={ctx.panelOpen} onOpenChange={ctx.setPanelOpen} modal={false}>
        <SheetContent side="end" size="sm" id={ctx.panelId}>
          <SheetHeader title={label} />
          <SheetBody className="p-0">
            <section aria-label={label} className={cn("flex min-h-full flex-col", className)}>
              {body}
            </section>
          </SheetBody>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      ref={ref}
      id={ctx?.panelId}
      aria-label={label}
      hidden={ctx ? !ctx.panelOpen : undefined}
      data-slot="editor-panel"
      className={cn("vui-editor-panel relative flex min-w-0 flex-col border-s border-line bg-surface", className)}
      {...props}
    >
      {ctx?.resizable ? (
        <SidePaneHandle
          aria-label={t("resizePanel")}
          edge="start"
          value={ctx.panelWidth}
          min={280}
          max={520}
          defaultValue={ctx.defaultPanelWidth}
          onValueChange={ctx.setPanelWidth}
          className="-start-1"
        />
      ) : null}
      {body}
    </aside>
  );
});

export interface EditorPanelContentProps extends React.ComponentPropsWithoutRef<typeof TabsContent> {}

/** The sections of one panel tab (`value` matches a tab `id`). */
export const EditorPanelContent = React.forwardRef<HTMLDivElement, EditorPanelContentProps>(function EditorPanelContent({ className, ...props }, ref) {
  return <TabsContent ref={ref} className={cn("mt-0", className)} {...props} />;
});

/* ------------------------------------------------------------------ */
/* EditorPanelSection                                                  */
/* ------------------------------------------------------------------ */

export interface EditorPanelSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Stable id: the open/closed state is remembered per id (localStorage). */
  id?: string;
  title: React.ReactNode;
  /** One-line summary shown while folded ("Draft · Visible to everyone"). */
  summary?: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Controls at the end of the header (kept outside the toggle button). */
  actions?: React.ReactNode;
  /** Heading level to fit the page outline. Default 2. */
  headingLevel?: 2 | 3;
}

const storageKey = (id: string) => `vui:editor-section:${id}`;
function readStored(id: string | undefined): boolean | undefined {
  if (!id || typeof window === "undefined") return undefined;
  try {
    const v = window.localStorage.getItem(storageKey(id));
    return v === "1" ? true : v === "0" ? false : undefined;
  } catch {
    return undefined;
  }
}

/** A folding meta box in the panel: Status, Permalink, Categories, Featured image, SEO. */
export const EditorPanelSection = React.forwardRef<HTMLElement, EditorPanelSectionProps>(function EditorPanelSection(
  { id, title, summary, defaultOpen = false, open: openProp, onOpenChange, actions, headingLevel = 2, className, children, ...props },
  ref,
) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange, name: "EditorPanelSection" });
  // Restore after mount (SSR renders the default).
  React.useEffect(() => {
    if (openProp !== undefined) return;
    const stored = readStored(id);
    if (stored !== undefined) setOpen(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const autoId = React.useId();
  const titleId = `editor-section${autoId.replace(/:/g, "")}`;
  const H = `h${headingLevel}` as "h2" | "h3";

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (id)
          try {
            window.localStorage.setItem(storageKey(id), v ? "1" : "0");
          } catch {
            /* storage blocked */
          }
      }}
      asChild
    >
      <section ref={ref} aria-labelledby={titleId} data-slot="editor-panel-section" data-section={id} className={cn("group/section border-b border-line last:border-b-0", className)} {...props}>
        <div className="flex items-center gap-1 pe-2">
          <H id={titleId} className="min-w-0 flex-1">
            <Collapsible.Trigger className="flex w-full min-w-0 items-center gap-2 py-3 ps-4 pe-2 text-start outline-none transition-colors hover:bg-hover focus-visible:bg-hover focus-ring focus-visible:outline-offset-[-2px]">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-fg">{title}</span>
                {summary && !open ? <span className="mt-0.5 block truncate text-[12px] font-normal text-fg-subtle">{summary}</span> : null}
              </span>
              <ChevronDown aria-hidden className="size-4 shrink-0 text-fg-subtle transition-transform duration-200 group-data-[state=open]/section:rotate-180 motion-reduce:transition-none" />
            </Collapsible.Trigger>
          </H>
          {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
        </div>
        <Collapsible.Content className="ui-collapse">
          <div className="grid gap-3 px-4 pb-4 pt-0.5 text-[13px]">{children}</div>
        </Collapsible.Content>
      </section>
    </Collapsible.Root>
  );
});
