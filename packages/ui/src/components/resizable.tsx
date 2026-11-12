"use client";

import * as React from "react";
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  usePanelRef,
  useGroupRef,
  type GroupProps,
  type PanelProps,
  type SeparatorProps,
  type LayoutStorage,
  type PanelImperativeHandle,
  type GroupImperativeHandle,
} from "react-resizable-panels";
import { cn } from "../lib/cn";

export type { PanelImperativeHandle as ResizablePanelHandle, GroupImperativeHandle as ResizableGroupHandle, LayoutStorage as ResizableLayoutStorage };
/** Typed ref for a `ResizablePanel`'s `panelRef` (`collapse()`, `expand()`, `resize()`, `isCollapsed()`). */
export const useResizablePanelRef = usePanelRef;
/** Typed ref for a `ResizableGroup`'s `groupRef` (`getLayout()`, `setLayout()`). */
export const useResizableGroupRef = useGroupRef;

const OrientationContext = /*#__PURE__*/ React.createContext<"horizontal" | "vertical">("horizontal");

/** localStorage that never throws (private mode, SSR, blocked storage). */
const safeLocalStorage: LayoutStorage = {
  getItem(key) {
    try {
      return typeof window === "undefined" ? null : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
};

export interface ResizableGroupProps extends Omit<GroupProps, "orientation"> {
  /** Default `"horizontal"` (panes side by side). */
  orientation?: "horizontal" | "vertical";
  /** Alias of `orientation`. */
  direction?: "horizontal" | "vertical";
  /** Persist the layout under this key (localStorage by default). Panels need stable `id`s. */
  autoSaveId?: string;
  /** Storage for `autoSaveId` — e.g. a cookie adapter so the server can render the saved layout. */
  storage?: LayoutStorage;
}

/**
 * User-sized panes: list + detail, editor + preview, media grid + details. Built on
 * react-resizable-panels (WAI-ARIA Window Splitter: arrow keys resize, Home/End, Enter collapses a
 * collapsible pane, double-click resets).
 *
 * ```tsx
 * <ResizableGroup autoSaveId="inbox" className="h-[560px]">
 *   <ResizablePanel id="list" defaultSize="35%" minSize="25%">…</ResizablePanel>
 *   <ResizableHandle withGrip />
 *   <ResizablePanel id="detail">…</ResizablePanel>
 * </ResizableGroup>
 * ```
 *
 * Sizes: numbers are **pixels**, strings without a unit are percentages (`"35"`), or use explicit
 * units (`"35%"`, `"280px"`, `"20rem"`). In glass mode surfaces inside stop blurring while a
 * handle is dragged. On phones, show one pane and open the other in a Sheet (not automatic).
 */
export const ResizableGroup = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ResizableGroupProps>(function ResizableGroup(props, ref) {
  return props.autoSaveId ? <PersistedGroup {...props} forwardedRef={ref} /> : <BaseGroup {...props} forwardedRef={ref} />;
});

type InnerProps = ResizableGroupProps & { forwardedRef: React.Ref<HTMLDivElement> };

function PersistedGroup({ autoSaveId, storage, onLayoutChanged, defaultLayout, ...props }: InnerProps) {
  const saved = useDefaultLayout({ id: autoSaveId!, storage: storage ?? safeLocalStorage });
  return (
    <BaseGroup
      {...props}
      defaultLayout={saved.defaultLayout ?? defaultLayout}
      onLayoutChanged={(layout, meta) => {
        saved.onLayoutChanged(layout, meta);
        onLayoutChanged?.(layout, meta);
      }}
    />
  );
}

function BaseGroup({ orientation, direction, autoSaveId: _a, storage: _s, forwardedRef, className, style, elementRef, ...props }: InnerProps) {
  const o = orientation ?? direction ?? "horizontal";
  const refs = React.useCallback(
    (node: HTMLDivElement | null) => {
      for (const r of [forwardedRef, elementRef]) {
        if (typeof r === "function") r(node);
        else if (r) (r as React.RefObject<HTMLDivElement | null>).current = node;
      }
    },
    [forwardedRef, elementRef],
  );
  return (
    <OrientationContext.Provider value={o}>
      <Group
        elementRef={refs}
        orientation={o}
        data-slot="resizable-group"
        data-orientation={o}
        // The engine inlines height/width 100%, which would beat a height class (`h-64`); fill the
        // parent through classes instead so `className` can size the group.
        className={cn("h-full w-full min-h-0 min-w-0", className)}
        style={{ height: undefined, width: undefined, ...style }}
        {...props}
      />
    </OrientationContext.Provider>
  );
}

export interface ResizablePanelProps extends PanelProps {}

/** One pane. Give it a stable `id` when the group persists its layout. */
export function ResizablePanel({ className, ...props }: ResizablePanelProps) {
  return <Panel data-slot="resizable-panel" className={cn("min-h-0 min-w-0", className)} {...props} />;
}

export interface ResizableHandleProps extends SeparatorProps {
  /** A visible grip in the middle of the line (for discoverability on touch and in dense UIs). */
  withGrip?: boolean;
  /** Accessible name, e.g. "Resize contact list". Recommended when there are several handles. */
  "aria-label"?: string;
}

/**
 * The divider between panes: a 1px line with a wider invisible hit area. Hover and focus tint it,
 * dragging paints it in the accent ink. Keyboard: focus it, then arrows / Home / End.
 */
export function ResizableHandle({ withGrip, className, children, ...props }: ResizableHandleProps) {
  const groupOrientation = React.useContext(OrientationContext);
  const vertical = groupOrientation === "horizontal"; // the line itself is vertical
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        "group/handle relative flex shrink-0 items-center justify-center bg-line outline-none transition-colors duration-150",
        vertical ? "w-px" : "h-px",
        // invisible 8px hit area
        "before:absolute before:content-['']",
        vertical ? "before:inset-y-0 before:-inset-x-1" : "before:inset-x-0 before:-inset-y-1",
        "data-[separator=hover]:bg-field-border-hover data-[separator=focus]:bg-accent-ink data-[separator=active]:bg-accent-ink",
        "focus-visible:bg-accent-ink focus-visible:shadow-[0_0_0_3px_var(--accent-soft)]",
        "data-[separator=disabled]:cursor-default data-[separator=disabled]:opacity-60",
        className,
      )}
      {...props}
    >
      {children ??
        (withGrip ? (
          <span
            aria-hidden
            className={cn(
              "z-[1] flex items-center justify-center gap-[3px] rounded-full border border-field-border bg-[var(--surface-solid,var(--surface))] shadow-[0_1px_2px_rgb(0_0_0/0.08)] transition-colors",
              "group-data-[separator=active]/handle:border-accent-ink group-data-[separator=focus]/handle:border-accent-ink",
              vertical ? "h-7 w-3 flex-col" : "h-3 w-7 flex-row",
            )}
          >
            <i className="block size-[3px] rounded-full bg-fg-subtle" />
            <i className="block size-[3px] rounded-full bg-fg-subtle" />
            <i className="block size-[3px] rounded-full bg-fg-subtle" />
          </span>
        ) : null)}
    </Separator>
  );
}
