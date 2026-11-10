"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Bell, Check, CheckCheck, Settings } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { SmartLink } from "../lib/provider";
import { usePortalContainer } from "../lib/theme-scope";
import { Layer } from "../lib/layer";
import { useLatest } from "../lib/use-controllable-state";
import { useMediaQuery } from "../lib/use-media-query";
import { Button, IconButton } from "./button";
import { Avatar } from "./avatar";
import { Badge } from "./badge";
import { Skeleton } from "./skeleton";
import { Alert } from "./alert";
import { EmptyState } from "./empty-state";
import { Spinner } from "./spinner";
import { Sheet, SheetContent } from "./sheet";
import { DialogTitle } from "./dialog";
import { toast } from "./toast";

const notificationLabels = {
  label: "Notifications",
  trigger: "Notifications",
  triggerUnread: "Notifications, {count, plural, one {# unread} other {# unread}}",
  unreadCount: "{count, plural, one {# unread} other {# unread}}",
  markAllRead: "Mark all as read",
  markRead: "Mark as read",
  empty: "You're all caught up",
  emptyDescription: "New mentions, approvals and updates will show up here.",
  error: "Couldn't load notifications.",
  retry: "Try again",
  loadMore: "Load more",
  settings: "Notification settings",
  today: "Today",
  yesterday: "Yesterday",
  earlier: "Earlier",
  all: "All",
  unread: "Unread",
  mentions: "Mentions",
  filter: "Filter notifications",
  newItem: "New notification: {title}",
  unreadDot: "Unread",
};
export type NotificationLabels = typeof notificationLabels;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type NotificationTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface AppNotification {
  id: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  /** ISO string or Date. */
  createdAt: Date | string;
  readAt?: Date | string | null;
  actor?: { name: string; avatar?: string };
  /** Shown when there is no actor. */
  icon?: React.ReactNode;
  tone?: NotificationTone;
  /** Opens on click (marks it read, closes the panel). */
  href?: string;
  /** App badge in multi-app shells ("CRM"). */
  app?: string;
  /** For tab filters ("mention", "approval"). */
  category?: string;
  /** Inline actions ("Approve" / "Reject"); removed after `onAction` succeeds. */
  actions?: { id: string; label: string; variant?: "primary" | "secondary" }[];
  /** Turns the bell badge red while unread. */
  important?: boolean;
}

/** The kit owns the UI; the app owns transport (REST, SSE, websockets). */
export interface NotificationAdapter {
  list(options: { cursor?: string; filter?: string; signal: AbortSignal }): Promise<{ items: AppNotification[]; nextCursor?: string }>;
  unreadCount(): Promise<number>;
  markRead(ids: string[] | "all"): Promise<void>;
  onAction?(id: string, actionId: string): Promise<void>;
  /** Live items. Return the unsubscribe function. */
  subscribe?(callback: (n: AppNotification) => void): () => void;
}

export interface NotificationTab {
  id: string;
  label: string;
  /** Passed to `adapter.list({ filter })`. Omit for "all". */
  filter?: string;
}

/* ------------------------------------------------------------------ */
/* Memory adapter (docs, tests, prototypes)                            */
/* ------------------------------------------------------------------ */

export interface MemoryNotificationAdapter extends NotificationAdapter {
  /** Simulate a live notification (calls subscribers). */
  push(n: AppNotification): void;
}

/**
 * An in-memory adapter: `filter` "unread" keeps unread items, any other value matches `category`
 * or `app`. Pages of `pageSize` (default 20), with optional `latency` in ms.
 */
export function createMemoryNotificationAdapter(
  initial: AppNotification[],
  options: { pageSize?: number; latency?: number; onAction?: (id: string, actionId: string) => Promise<void> | void } = {},
): MemoryNotificationAdapter {
  let items = [...initial].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const subs = new Set<(n: AppNotification) => void>();
  const pageSize = options.pageSize ?? 20;
  const wait = (signal?: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      if (!options.latency) return resolve();
      const t = setTimeout(resolve, options.latency);
      signal?.addEventListener("abort", () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
  return {
    async list({ cursor, filter, signal }) {
      await wait(signal);
      const pool = items.filter((n) => (!filter ? true : filter === "unread" ? !n.readAt : n.category === filter || n.app === filter));
      const start = cursor ? Number(cursor) : 0;
      const page = pool.slice(start, start + pageSize);
      return { items: page, nextCursor: start + pageSize < pool.length ? String(start + pageSize) : undefined };
    },
    async unreadCount() {
      return items.filter((n) => !n.readAt).length;
    },
    async markRead(ids) {
      const now = new Date().toISOString();
      items = items.map((n) => (ids === "all" || ids.includes(n.id) ? { ...n, readAt: n.readAt ?? now } : n));
    },
    async onAction(id, actionId) {
      await wait();
      await options.onAction?.(id, actionId);
      items = items.map((n) => (n.id === id ? { ...n, actions: undefined, readAt: n.readAt ?? new Date().toISOString() } : n));
    },
    subscribe(cb) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    push(n) {
      items = [n, ...items];
      subs.forEach((cb) => cb(n));
    },
  };
}

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

type ListState = { items: AppNotification[]; nextCursor?: string; status: "idle" | "loading" | "ready" | "error"; loadingMore: boolean };
const emptyList: ListState = { items: [], status: "idle", loadingMore: false };

interface NotificationContextValue {
  open: boolean;
  setOpen: (o: boolean) => void;
  unread: number;
  important: boolean;
  tabs: NotificationTab[];
  tab: string;
  setTab: (id: string) => void;
  list: ListState;
  reload: () => void;
  loadMore: () => void;
  markRead: (ids: string[] | "all") => void;
  runAction: (id: string, actionId: string) => Promise<void>;
  pending: Record<string, string | undefined>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  settingsHref?: string;
  size: "md" | "lg";
  t: ReturnType<typeof useLabels<NotificationLabels>>;
}
const NotificationContext = React.createContext<NotificationContextValue | null>(null);
const useNC = () => {
  const ctx = React.useContext(NotificationContext);
  if (!ctx) throw new Error("Notification parts must be used inside <NotificationCenter>.");
  return ctx;
};

const isUnread = (n: AppNotification) => !n.readAt;

export interface NotificationCenterProps {
  adapter: NotificationAdapter;
  /** Default: All · Unread · Mentions (`filter: "mention"`). */
  tabs?: NotificationTab[];
  /** Toast when a live item arrives (or a predicate). */
  toastOnNew?: boolean | ((n: AppNotification) => boolean);
  /** ms between unread-count refreshes when the adapter has no `subscribe`. */
  pollInterval?: number;
  /** Panel width: `md` 380px (default), `lg` 440px. */
  size?: "md" | "lg";
  /** "Notification settings" link in the footer. */
  settingsHref?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Custom composition; default trigger + panel (tabs, list, footer). */
  children?: React.ReactNode;
  labels?: Partial<NotificationLabels>;
}

/**
 * An in-app inbox: the bell in the top bar, a panel (popover ≥768px, sheet below) with filter tabs,
 * a grouped feed (Today / Yesterday / Earlier), read/unread, inline actions and "Mark all as read".
 * Data comes through an adapter, so the app chooses REST, SSE or websockets.
 *
 * ```tsx
 * <NotificationCenter adapter={inbox} settingsHref="/settings/notifications" toastOnNew />
 * ```
 */
export function NotificationCenter({
  adapter,
  tabs: tabsProp,
  toastOnNew,
  pollInterval,
  size = "md",
  settingsHref,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  labels,
}: NotificationCenterProps) {
  const t = useLabels("notifications", notificationLabels, labels);
  const tabs = React.useMemo<NotificationTab[]>(
    () => tabsProp ?? [{ id: "all", label: t("all") }, { id: "unread", label: t("unread"), filter: "unread" }, { id: "mentions", label: t("mentions"), filter: "mention" }],
    [tabsProp, t],
  );
  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = openProp ?? openState;
  const onOpenChangeRef = useLatest(onOpenChange);
  const setOpen = React.useCallback(
    (o: boolean) => {
      if (openProp === undefined) setOpenState(o);
      onOpenChangeRef.current?.(o);
    },
    [openProp, onOpenChangeRef],
  );
  const [tab, setTab] = React.useState(tabs[0]?.id ?? "all");
  const [lists, setLists] = React.useState<Record<string, ListState>>({});
  const [unread, setUnread] = React.useState(0);
  const [pending, setPending] = React.useState<Record<string, string | undefined>>({});
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const adapterRef = useLatest(adapter);
  const filterOf = React.useCallback((id: string) => tabs.find((x) => x.id === id)?.filter, [tabs]);

  const refreshCount = React.useCallback(() => {
    adapterRef.current.unreadCount().then(setUnread, () => {});
  }, [adapterRef]);
  React.useEffect(refreshCount, [refreshCount, adapter]);

  const load = React.useCallback(
    (tabId: string, signal: AbortSignal, cursor?: string) => {
      setLists((prev) => {
        const cur = prev[tabId] ?? emptyList;
        return { ...prev, [tabId]: cursor ? { ...cur, loadingMore: true } : { ...cur, status: "loading" } };
      });
      adapterRef.current.list({ cursor, filter: filterOf(tabId), signal }).then(
        (res) => {
          if (signal.aborted) return;
          setLists((prev) => {
            const cur = prev[tabId] ?? emptyList;
            const items = cursor ? [...cur.items, ...res.items.filter((n) => !cur.items.some((c) => c.id === n.id))] : res.items;
            return { ...prev, [tabId]: { items, nextCursor: res.nextCursor, status: "ready", loadingMore: false } };
          });
        },
        () => {
          if (signal.aborted) return;
          setLists((prev) => ({ ...prev, [tabId]: { ...(prev[tabId] ?? emptyList), status: cursor ? "ready" : "error", loadingMore: false } }));
        },
      );
    },
    [adapterRef, filterOf],
  );

  // Load the active tab when the panel opens or the tab changes.
  const [reloadKey, setReloadKey] = React.useState(0);
  React.useEffect(() => {
    if (!open) return;
    const ac = new AbortController();
    load(tab, ac.signal);
    refreshCount();
    return () => ac.abort();
  }, [open, tab, load, reloadKey, refreshCount]);

  const loadMore = React.useCallback(() => {
    const cur = lists[tab];
    if (!cur?.nextCursor || cur.loadingMore) return;
    load(tab, new AbortController().signal, cur.nextCursor);
  }, [lists, tab, load]);

  // Live items + toasts + a throttled polite announcement.
  const [announcement, setAnnouncement] = React.useState("");
  const lastAnnounce = React.useRef(0);
  const toastRef = useLatest(toastOnNew);
  React.useEffect(() => {
    if (!adapter.subscribe) return;
    return adapter.subscribe((n) => {
      setLists((prev) => {
        const next: Record<string, ListState> = {};
        for (const [id, l] of Object.entries(prev)) {
          const f = filterOf(id);
          const fits = !f || (f === "unread" && isUnread(n)) || n.category === f || n.app === f;
          next[id] = fits ? { ...l, items: [n, ...l.items.filter((x) => x.id !== n.id)] } : l;
        }
        return next;
      });
      if (isUnread(n)) setUnread((u) => u + 1);
      const shouldToast = typeof toastRef.current === "function" ? toastRef.current(n) : toastRef.current;
      if (shouldToast) toast(n.title, { description: n.body });
      const now = Date.now();
      if (now - lastAnnounce.current > 10_000) {
        lastAnnounce.current = now;
        setAnnouncement(t("newItem", { title: typeof n.title === "string" ? n.title : "" }));
      }
    });
  }, [adapter, filterOf, toastRef, t]);

  React.useEffect(() => {
    if (adapter.subscribe || !pollInterval) return;
    const id = setInterval(refreshCount, pollInterval);
    return () => clearInterval(id);
  }, [adapter, pollInterval, refreshCount]);

  const markRead = React.useCallback(
    (ids: string[] | "all") => {
      const now = new Date().toISOString();
      let changed = 0;
      const seen = new Set<string>();
      setLists((prev) => {
        const next: Record<string, ListState> = {};
        for (const [id, l] of Object.entries(prev)) {
          next[id] = {
            ...l,
            items: l.items.map((n) => {
              if (isUnread(n) && (ids === "all" || ids.includes(n.id))) {
                if (!seen.has(n.id)) {
                  seen.add(n.id);
                  changed++;
                }
                return { ...n, readAt: now };
              }
              return n;
            }),
          };
        }
        return next;
      });
      setUnread((u) => (ids === "all" ? 0 : Math.max(0, u - (changed || ids.length))));
      adapterRef.current.markRead(ids).then(refreshCount, refreshCount);
    },
    [adapterRef, refreshCount],
  );

  const runAction = React.useCallback(
    async (id: string, actionId: string) => {
      setPending((p) => ({ ...p, [id]: actionId }));
      try {
        await adapterRef.current.onAction?.(id, actionId);
        setLists((prev) => {
          const next: Record<string, ListState> = {};
          for (const [k, l] of Object.entries(prev)) next[k] = { ...l, items: l.items.map((n) => (n.id === id ? { ...n, actions: undefined, readAt: n.readAt ?? new Date().toISOString() } : n)) };
          return next;
        });
        refreshCount();
      } finally {
        setPending((p) => ({ ...p, [id]: undefined }));
      }
    },
    [adapterRef, refreshCount],
  );

  const list = lists[tab] ?? emptyList;
  const important = Object.values(lists).some((l) => l.items.some((n) => n.important && isUnread(n)));

  const value: NotificationContextValue = {
    open,
    setOpen,
    unread,
    important,
    tabs,
    tab,
    setTab,
    list,
    reload: () => setReloadKey((k) => k + 1),
    loadMore,
    markRead,
    runAction,
    pending,
    triggerRef,
    settingsHref,
    size,
    t,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children ?? (
        <>
          <NotificationTrigger />
          <NotificationPanel>
            <NotificationTabs />
            <NotificationList />
            <NotificationFooter />
          </NotificationPanel>
        </>
      )}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </NotificationContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Trigger                                                             */
/* ------------------------------------------------------------------ */

/** The bell with the unread badge (99+). `aria-label` includes the count. */
export const NotificationTrigger = React.forwardRef<HTMLButtonElement, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { size?: "xs" | "sm" | "md" }>(
  function NotificationTrigger({ className, size = "sm", onClick, ...props }, ref) {
    const { open, setOpen, unread, important, triggerRef, t } = useNC();
    const { format } = useLocale();
    const label = unread > 0 ? t("triggerUnread", { count: unread }) : t("trigger");
    return (
      <span className="relative inline-flex">
        <IconButton
          ref={(node) => {
            triggerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          label={label}
          tooltip={false}
          size={size}
          aria-haspopup="dialog"
          aria-expanded={open}
          data-state={open ? "open" : "closed"}
          onClick={(e) => {
            onClick?.(e);
            if (!e.defaultPrevented) setOpen(!open);
          }}
          className={cn(open && "bg-hover", className)}
          {...props}
        >
          <Bell />
        </IconButton>
        {unread > 0 ? (
          <span
            aria-hidden
            data-slot="notification-badge"
            className={cn(
              "pointer-events-none absolute -end-0.5 -top-0.5 min-w-4 rounded-full px-1 text-center text-[10px] font-semibold leading-4 tabular ring-2 ring-(--scene)",
              important ? "bg-danger-solid text-white" : "bg-accent text-accent-fg",
            )}
          >
            {unread > 99 ? `${format.number(99)}+` : format.number(unread)}
          </span>
        ) : null}
      </span>
    );
  },
);

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

/** Popover anchored to the bell on ≥768px, an end Sheet below. Titled "Notifications". */
export function NotificationPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, setOpen, triggerRef, size, t } = useNC();
  const container = usePortalContainer();
  const desktop = useMediaQuery("(min-width: 768px)") ?? true;
  const titleId = React.useId();
  const closedByPointer = React.useRef(false);
  const header = (
    <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
      <h2 id={titleId} className="text-[15px] font-semibold tracking-[-0.01em] text-fg">
        {t("label")}
      </h2>
      <NotificationUnreadBadge />
    </div>
  );

  if (!desktop) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="end" size="sm" className={cn("p-0", className)}>
          <DialogTitle className="sr-only">{t("label")}</DialogTitle>
          {header}
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor virtualRef={triggerRef as React.RefObject<HTMLButtonElement>} />
      <PopoverPrimitive.Portal container={container}>
        <Layer asChild>
          <PopoverPrimitive.Content
            align="end"
            sideOffset={8}
            collisionPadding={12}
            aria-labelledby={titleId}
            data-slot="notification-panel"
            data-size={size}
            onInteractOutside={(e) => {
              // The bell toggles itself.
              if (triggerRef.current?.contains(e.target as Node)) e.preventDefault();
              else if (e.type === "dismissableLayer.pointerDownOutside") closedByPointer.current = true;
            }}
            onOpenAutoFocus={() => {
              closedByPointer.current = false;
            }}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              // Return focus to the bell — unless the user clicked elsewhere (don't steal that focus).
              if (!closedByPointer.current) triggerRef.current?.focus();
              closedByPointer.current = false;
            }}
            className={cn(
              "surface-popover ui-pop z-(--z-popover) flex max-h-[min(36rem,calc(var(--radix-popover-content-available-height)-8px))] flex-col overflow-hidden rounded-ui-lg outline-none",
              size === "lg" ? "w-[27.5rem]" : "w-[23.75rem]",
              "max-w-[calc(100vw-1.5rem)]",
              className,
            )}
          >
            {header}
            {children}
          </PopoverPrimitive.Content>
        </Layer>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function NotificationUnreadBadge() {
  const { unread, t } = useNC();
  if (!unread) return null;
  return (
    <Badge tone="accent" size="sm">
      {t("unreadCount", { count: unread })}
    </Badge>
  );
}

/** Filter tabs (All · Unread · Mentions by default). Toggle buttons with `aria-pressed`. */
export function NotificationTabs({ className }: { className?: string }) {
  const { tabs, tab, setTab, t } = useNC();
  if (tabs.length < 2) return null;
  return (
    <div role="group" aria-label={t("filter")} className={cn("flex items-center gap-1 border-b border-line px-3 pb-2", className)}>
      {tabs.map((x) => (
        <button
          key={x.id}
          type="button"
          aria-pressed={x.id === tab}
          onClick={() => setTab(x.id)}
          className={cn(
            "h-7 rounded-full px-3 text-[12.5px] font-medium transition-colors focus-ring",
            x.id === tab ? "bg-fg text-scene" : "text-fg-muted hover:bg-hover hover:text-fg",
          )}
        >
          {x.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* List + item                                                         */
/* ------------------------------------------------------------------ */

function dayKey(d: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** Splits notifications into Today / Yesterday / Earlier in the provider's time zone. */
export function groupNotifications(items: AppNotification[], timeZone = "UTC", now = new Date()): Array<{ id: "today" | "yesterday" | "earlier"; items: AppNotification[] }> {
  const today = dayKey(now, timeZone);
  const yesterday = dayKey(new Date(now.getTime() - 86_400_000), timeZone);
  const groups = { today: [] as AppNotification[], yesterday: [] as AppNotification[], earlier: [] as AppNotification[] };
  for (const n of items) {
    const k = dayKey(new Date(n.createdAt), timeZone);
    (k === today ? groups.today : k === yesterday ? groups.yesterday : groups.earlier).push(n);
  }
  return (["today", "yesterday", "earlier"] as const).filter((g) => groups[g].length).map((g) => ({ id: g, items: groups[g] }));
}

/** The grouped feed with loading, empty, error and "Load more" states. */
export function NotificationList({ className, grouped = true }: { className?: string; grouped?: boolean }) {
  const { list, reload, loadMore, markRead, runAction, pending, setOpen, t } = useNC();
  const { timeZone } = useLocale();
  const groupIds = React.useId();

  let body: React.ReactNode;
  if (list.status === "loading" || list.status === "idle") {
    body = (
      <div role="status" aria-label={t("label")} className="grid gap-1 p-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3 rounded-ui p-2.5">
            <Skeleton shape="circle" className="size-9 shrink-0" />
            <div className="grid flex-1 gap-2 pt-1">
              <Skeleton className="h-3 w-4/5 rounded-full" />
              <Skeleton className="h-2.5 w-1/2 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (list.status === "error") {
    body = (
      <div className="p-3">
        <Alert tone="danger" title={t("error")} actions={<Button size="sm" onClick={reload}>{t("retry")}</Button>} />
      </div>
    );
  } else if (!list.items.length) {
    body = <EmptyState kind="done" size="sm" title={t("empty")} description={t("emptyDescription")} className="py-10" />;
  } else {
    const groups = grouped ? groupNotifications(list.items, timeZone) : [{ id: "earlier" as const, items: list.items }];
    body = (
      <div className="grid gap-1 px-1.5 py-1.5">
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={grouped ? `${groupIds}-${g.id}` : undefined}>
            {grouped ? (
              <h3 id={`${groupIds}-${g.id}`} className="px-2.5 pt-2 pb-1 text-[11px] font-medium tracking-[0.06em] text-fg-subtle">
                {t(g.id)}
              </h3>
            ) : null}
            <div role="feed" aria-busy={list.loadingMore} aria-labelledby={grouped ? `${groupIds}-${g.id}` : undefined} aria-label={grouped ? undefined : t("label")} className="grid gap-px">
              {g.items.map((n, i) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  posinset={i + 1}
                  setsize={g.items.length}
                  pendingAction={pending[n.id]}
                  onOpen={() => {
                    if (isUnread(n)) markRead([n.id]);
                    setOpen(false);
                  }}
                  onMarkRead={() => markRead([n.id])}
                  onAction={(actionId) => runAction(n.id, actionId)}
                />
              ))}
            </div>
          </section>
        ))}
        {list.nextCursor ? (
          <div className="flex justify-center py-2">
            <Button size="sm" variant="ghost" loading={list.loadingMore} onClick={loadMore}>
              {t("loadMore")}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }
  return <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", className)}>{body}</div>;
}

const toneWell: Record<NotificationTone, string> = {
  neutral: "tone-neutral",
  info: "tone-info",
  success: "tone-success",
  warning: "tone-warning",
  danger: "tone-danger",
};

export interface NotificationItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  notification: AppNotification;
  /** Clicked the item's link. */
  onOpen?: () => void;
  onMarkRead?: () => void;
  onAction?: (actionId: string) => unknown;
  /** Id of the action currently running (spinner on that button). */
  pendingAction?: string;
  /** Position in the feed (`aria-posinset` / `aria-setsize`). */
  posinset?: number;
  setsize?: number;
  labels?: Partial<NotificationLabels>;
}

/** One notification. Usable on its own — e.g. a full "/notifications" page. */
export const NotificationItem = React.forwardRef<HTMLElement, NotificationItemProps>(function NotificationItem(
  { notification: n, onOpen, onMarkRead, onAction, pendingAction, posinset, setsize, labels, className, ...props },
  ref,
) {
  const t = useLabels("notifications", notificationLabels, labels);
  const { format } = useLocale();
  const titleId = React.useId();
  const bodyId = React.useId();
  const unread = isUnread(n);
  const created = new Date(n.createdAt);
  return (
    <article
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={n.body ? bodyId : undefined}
      aria-posinset={posinset}
      aria-setsize={setsize}
      data-slot="notification-item"
      data-unread={unread ? "" : undefined}
      className={cn(
        "group/n relative flex gap-3 rounded-ui p-2.5 transition-colors focus-within:bg-hover hover:bg-hover",
        unread && "bg-[color-mix(in_srgb,var(--accent-soft)_45%,transparent)]",
        className,
      )}
      {...props}
    >
      <div className="relative shrink-0">
        {n.actor ? (
          <Avatar name={n.actor.name} src={n.actor.avatar} size="md" aria-hidden />
        ) : (
          <span aria-hidden className={cn("tone-soft grid size-9 place-items-center rounded-full [&_svg]:size-4", toneWell[n.tone ?? "neutral"])}>
            {n.icon ?? <Bell />}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p id={titleId} className={cn("text-[13.5px] leading-snug text-fg", unread ? "font-medium" : "text-fg-muted")}>
          {n.href ? (
            <SmartLink href={n.href} onClick={onOpen} className="rounded-[3px] outline-none after:absolute after:inset-0 after:rounded-ui after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-ring">
              {n.title}
            </SmartLink>
          ) : (
            n.title
          )}
        </p>
        {n.body ? (
          <p id={bodyId} className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-fg-muted">
            {n.body}
          </p>
        ) : null}
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-fg-subtle">
          <time dateTime={created.toISOString()} suppressHydrationWarning>{format.relative(created, { style: "short" })}</time>
          {n.app ? (
            <>
              <span aria-hidden>·</span>
              <Badge size="sm" tone="outline" shape="square">
                {n.app}
              </Badge>
            </>
          ) : null}
        </p>
        {n.actions?.length ? (
          <div className="relative z-10 mt-2 flex flex-wrap gap-1.5">
            {n.actions.map((a) => (
              <Button
                key={a.id}
                size="xs"
                variant={a.variant === "primary" ? "primary" : "secondary"}
                loading={pendingAction === a.id}
                disabled={Boolean(pendingAction) && pendingAction !== a.id}
                onClick={() => void onAction?.(a.id)}
              >
                {a.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
      {unread ? (
        <div className="relative z-10 flex shrink-0 flex-col items-center gap-1">
          <span className="mt-1.5 size-2 rounded-full bg-accent ring-2 ring-[color-mix(in_srgb,var(--accent)_25%,transparent)]">
            <span className="sr-only">{t("unreadDot")}</span>
          </span>
          {onMarkRead ? (
            <IconButton label={t("markRead")} size="xs" tooltip={false} className="opacity-0 transition-opacity group-hover/n:opacity-100 group-focus-within/n:opacity-100 focus-visible:opacity-100" onClick={onMarkRead}>
              <Check />
            </IconButton>
          ) : null}
        </div>
      ) : null}
    </article>
  );
});

/** Footer: "Mark all as read" and a settings link. */
export function NotificationFooter({ className }: { className?: string }) {
  const { unread, markRead, settingsHref, setOpen, t } = useNC();
  return (
    <div className={cn("flex items-center justify-between gap-2 border-t border-line px-2 py-1.5", className)}>
      <Button size="sm" variant="ghost" disabled={!unread} onClick={() => markRead("all")}>
        <CheckCheck aria-hidden /> {t("markAllRead")}
      </Button>
      {settingsHref ? (
        <Button size="sm" variant="ghost" asChild>
          <SmartLink href={settingsHref} onClick={() => setOpen(false)}>
            <Settings aria-hidden /> {t("settings")}
          </SmartLink>
        </Button>
      ) : null}
    </div>
  );
}

/** Spinner row while paginating (for custom lists). */
export function NotificationLoadingRow() {
  return (
    <div className="flex justify-center py-3 text-fg-subtle">
      <Spinner size="sm" />
    </div>
  );
}
