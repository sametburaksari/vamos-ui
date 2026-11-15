"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/dropdown-menu";
import { cn2 as cn } from "./shared/kit-2";
import { newsText, type NewsBlockLabels } from "./shared/labels-news";

export interface PostTab {
  /** Stable id (`"all"`, `"science"`). */
  id: string;
  label: string;
  /** The panel, usually a server-rendered `<PostLayout>` / `<PostBlock>` without a title. */
  content?: React.ReactNode;
}

export interface PostTabsProps {
  /** Module title ("Don’t miss"). */
  title: React.ReactNode;
  /** Title level. Default 2. */
  headingLevel?: 2 | 3;
  tabs: PostTab[];
  defaultTab?: string;
  /** Controlled selection. */
  value?: string;
  onValueChange?: (id: string) => void;
  /**
   * Loads a panel that has no `content` the first time its tab opens (client-side data: a fetch
   * returning rendered cards). Results are cached per tab.
   */
  load?: (id: string) => Promise<React.ReactNode>;
  /** Tabs shown before measuring (server render / no ResizeObserver). Default 5. */
  maxVisible?: number;
  /** Rendered while a panel loads. Default: a card skeleton. */
  loadingFallback?: React.ReactNode;
  locale?: string;
  labels?: NewsBlockLabels;
  className?: string;
  id?: string;
}

function Skeleton() {
  return (
    <div aria-hidden className="grid gap-x-8 gap-y-5 @2xl:grid-cols-2" data-skeleton="">
      <div className="flex flex-col gap-3">
        <div className="aspect-[3/2] rounded-ui-sm bg-skeleton" />
        <div className="h-5 w-4/5 rounded-ui-sm bg-skeleton" />
        <div className="h-3 w-2/5 rounded-ui-sm bg-skeleton" />
      </div>
      <div className="flex flex-col gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-[5.5rem_1fr] gap-4">
            <div className="aspect-square rounded-ui-sm bg-skeleton" />
            <div className="flex flex-col gap-2 pt-1">
              <div className="h-4 w-11/12 rounded-ui-sm bg-skeleton" />
              <div className="h-3 w-1/3 rounded-ui-sm bg-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * A tabbed category module ("Don’t miss"): the title on a heavy rule, one tab per category at
 * the end, and the tabs that don't fit folded into a "More" menu (measured, so it adapts to the
 * column). The selected tab always stays in the row. Panels come from props (server-rendered) or
 * from `load` on first open. WAI-ARIA tabs: arrows, Home / End.
 *
 * ```tsx
 * <PostTabs title="Don’t miss" tabs={[{ id: "all", label: "All", content: <PostLayout … /> }, …]} />
 * ```
 */
export function PostTabs({ title, headingLevel = 2, tabs, defaultTab, value: valueProp, onValueChange, load, maxVisible = 5, loadingFallback, locale = "en-US", labels, className, id }: PostTabsProps) {
  const t = newsText(labels, locale);
  const auto = React.useId();
  const headingId = `${id ?? `ptabs${auto.replace(/[^a-zA-Z0-9]/g, "")}`}-title`;
  const [inner, setInner] = React.useState(defaultTab ?? tabs[0]?.id ?? "");
  const value = valueProp ?? inner;
  const setValue = (v: string) => {
    if (valueProp === undefined) setInner(v);
    onValueChange?.(v);
  };

  // Lazy panels
  const [loaded, setLoaded] = React.useState<Record<string, React.ReactNode>>({});
  const [failed, setFailed] = React.useState<Record<string, boolean>>({});
  React.useEffect(() => {
    const tab = tabs.find((x) => x.id === value);
    if (!tab || tab.content !== undefined || !load || value in loaded) return;
    let live = true;
    load(value).then(
      (node) => live && setLoaded((m) => ({ ...m, [value]: node })),
      () => live && setFailed((m) => ({ ...m, [value]: true })),
    );
    return () => {
      live = false;
    };
  }, [value, tabs, load, loaded]);

  // Overflow: measure every label once, then fit as many as the row allows.
  const rowRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLDivElement>(null);
  const [fit, setFit] = React.useState(Math.min(maxVisible, tabs.length));
  React.useLayoutEffect(() => {
    const row = rowRef.current;
    const measure = measureRef.current;
    if (!row || !measure || typeof ResizeObserver === "undefined") return;
    const compute = () => {
      const widths = Array.from(measure.children).map((c) => (c as HTMLElement).offsetWidth);
      const more = widths.pop() ?? 0;
      const gap = 20;
      const avail = row.clientWidth;
      if (!avail) return;
      let used = 0;
      let n = 0;
      for (let i = 0; i < widths.length; i++) {
        const needMore = i < widths.length - 1 ? more + gap : 0;
        if (used + widths[i]! + (n ? gap : 0) + needMore > avail) break;
        used += widths[i]! + (n ? gap : 0);
        n++;
      }
      setFit(Math.max(1, n));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(row);
    return () => ro.disconnect();
  }, [tabs]);

  const selectedIndex = Math.max(0, tabs.findIndex((x) => x.id === value));
  let visible = tabs.slice(0, fit);
  if (selectedIndex >= fit) visible = [...tabs.slice(0, Math.max(0, fit - 1)), tabs[selectedIndex]!];
  const hidden = tabs.filter((x) => !visible.includes(x));
  const H = `h${headingLevel}` as "h2";
  const triggerCls = "h-8 text-[0.8125rem]";

  return (
    <section aria-labelledby={headingId} className={cn("vb-news-tabs @container flex flex-col gap-5", className)}>
      <Tabs value={value} onValueChange={setValue} className="gap-5">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-t-[3px] border-fg pt-2">
          <H id={headingId} className="shrink-0 font-display text-[1.5rem] leading-tight tracking-[-0.01em] text-fg">
            {title}
          </H>
          <div ref={rowRef} className="relative flex min-w-0 flex-1 items-center justify-end gap-5 @max-xl:basis-full @max-xl:justify-start">
            <TabsList aria-labelledby={headingId} overflow="none" className="gap-5 border-b-0">
              {visible.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className={triggerCls}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {hidden.length ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-8 shrink-0 items-center gap-1 rounded-ui-sm text-[0.8125rem] font-medium text-fg-muted hover:text-fg focus-ring data-[state=open]:text-fg" aria-label={t("moreTopics")}>
                  {t("more")}
                  <ChevronDown aria-hidden className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {hidden.map((tab) => (
                    <DropdownMenuItem key={tab.id} onSelect={() => setValue(tab.id)}>
                      {tab.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            {/* Measuring row: every label at its real width, plus the "More" button last. */}
            <div ref={measureRef} aria-hidden inert className="pointer-events-none invisible absolute end-0 top-0 flex gap-5 whitespace-nowrap">
              {tabs.map((tab) => (
                <span key={tab.id} className="px-0.5 text-[0.8125rem] font-medium">
                  {tab.label}
                </span>
              ))}
              <span className="inline-flex items-center gap-1 text-[0.8125rem] font-medium">
                {t("more")}
                <ChevronDown className="size-3.5" />
              </span>
            </div>
          </div>
        </div>
        {tabs.map((tab) => {
          const content = tab.content ?? loaded[tab.id];
          const busy = content === undefined && !!load && !failed[tab.id];
          return (
            <TabsContent key={tab.id} value={tab.id} aria-busy={busy || undefined} className="rounded-none focus-visible:outline-offset-4">
              {content !== undefined ? content : failed[tab.id] ? <p className="py-6 text-fg-muted">{t("errorGeneric")}</p> : busy ? (loadingFallback ?? <Skeleton />) : <p className="py-6 text-fg-muted">{t("emptyModule")}</p>}
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}
