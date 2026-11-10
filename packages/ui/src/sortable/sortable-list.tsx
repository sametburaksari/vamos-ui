"use client";

/**
 * Ready-made sortable list and grid on top of `Sortable`: row chrome, handle, Move menu,
 * placeholder and overlay included. For custom markup use `Sortable` + `SortableItem`.
 */
import * as React from "react";
import { cva } from "class-variance-authority";
import { GripVertical } from "lucide-react";
import { cn } from "../lib/cn";
import {
  Sortable,
  SortableMoveMenu,
  SortableOverlay,
  useSortableItem,
  type SortableLabels,
  type SortableMoveEvent,
} from "./sortable";

export interface SortableRenderState {
  index: number;
  isDragging: boolean;
  /** True when rendering the dragged clone. */
  overlay: boolean;
  disabled: boolean;
}

interface SharedProps<T> {
  items: readonly T[];
  getId?: (item: T) => string;
  getLabel?: (item: T) => string;
  onReorder: (next: T[], event: SortableMoveEvent) => void;
  renderItem: (item: T, state: SortableRenderState) => React.ReactNode;
  disabled?: boolean | ((item: T) => boolean);
  /** Show a Move menu on every item (the non-drag alternative). Default `true`. */
  moveMenu?: boolean;
  /** Trailing actions beside the Move menu. */
  renderActions?: (item: T) => React.ReactNode;
  /** Shown when `items` is empty. */
  empty?: React.ReactNode;
  labels?: Partial<SortableLabels>;
  /** Accessible name of the list. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  itemClassName?: string;
}

// ---------------------------------------------------------------------------------------------
// SortableList
// ---------------------------------------------------------------------------------------------

export const sortableListVariants = cva("vui-sortable-list flex min-w-0", {
  variants: {
    orientation: { vertical: "flex-col", horizontal: "flex-row flex-wrap items-stretch" },
    variant: {
      /** Separate bordered rows. */
      card: "gap-1.5",
      /** One bordered box with dividers. */
      inset: "overflow-hidden rounded-ui-lg border border-line bg-surface",
      /** No chrome. */
      plain: "gap-1",
    },
  },
  compoundVariants: [{ orientation: "horizontal", variant: "inset", className: "flex-nowrap" }],
  defaultVariants: { orientation: "vertical", variant: "card" },
});

export const sortableRowVariants = cva(
  "vui-sortable-row group/row relative flex min-w-0 items-center gap-1.5 text-sm text-fg outline-none",
  {
    variants: {
      variant: {
        card: "rounded-ui border border-line bg-surface ps-1 pe-1 shadow-[0_1px_1px_rgb(0_0_0/0.03)]",
        inset: "ps-1.5 pe-1 [&+&]:border-t [&+&]:border-line in-[[data-orientation=horizontal]]:[&+&]:border-t-0 in-[[data-orientation=horizontal]]:[&+&]:border-s",
        plain: "rounded-ui ps-0.5 pe-0.5 hover:bg-hover",
      },
      size: {
        sm: "min-h-[calc(var(--control-h)*0.82)] py-0.5",
        md: "min-h-(--control-h) py-1",
      },
    },
    defaultVariants: { variant: "card", size: "md" },
  },
);

export interface SortableListProps<T> extends SharedProps<T> {
  orientation?: "vertical" | "horizontal";
  /** Drag only from the handle. Default `true`. */
  handle?: boolean;
  variant?: "card" | "inset" | "plain";
  size?: "sm" | "md";
}

/**
 * A ready vertical or horizontal sortable list.
 *
 * ```tsx
 * <SortableList aria-label="Main menu" items={pages} onReorder={setPages} renderItem={(p) => p.title} />
 * ```
 */
export function SortableList<T>(props: SortableListProps<T>) {
  const {
    items,
    getId,
    getLabel,
    onReorder,
    renderItem,
    disabled,
    moveMenu = true,
    renderActions,
    empty,
    labels,
    orientation = "vertical",
    handle = true,
    variant = "card",
    size = "md",
    className,
    itemClassName,
    ...aria
  } = props;
  const idOf = getId ?? ((it: T) => defaultId(it));
  return (
    <Sortable
      items={items}
      getId={idOf}
      getLabel={getLabel}
      onReorder={onReorder}
      orientation={orientation}
      handle={handle}
      disabled={disabled}
      labels={labels}
      renderOverlay={(item) => (
        <div className={cn(sortableRowVariants({ variant: variant === "plain" ? "card" : variant, size }), "vui-sortable-clone rounded-ui border border-line", itemClassName)}>
          {handle && (
            <span aria-hidden className="inline-flex size-7 shrink-0 items-center justify-center text-fg-subtle [&_svg]:size-4">
              <GripVertical />
            </span>
          )}
          <div className="min-w-0 flex-1">{renderItem(item, { index: items.indexOf(item), isDragging: true, overlay: true, disabled: false })}</div>
        </div>
      )}
    >
      {items.length === 0 && empty ? (
        <div data-slot="sortable-empty">{empty}</div>
      ) : (
        <ul data-slot="sortable-list" data-orientation={orientation} className={sortableListVariants({ orientation, variant, className })} {...aria}>
          {items.map((item, index) => (
            <ListRow
              key={idOf(item)}
              id={idOf(item)}
              handle={handle}
              moveMenu={moveMenu}
              className={cn(sortableRowVariants({ variant, size }), itemClassName)}
              actions={renderActions?.(item)}
              render={(s) => renderItem(item, { index, isDragging: s.isDragging, overlay: false, disabled: s.disabled })}
            />
          ))}
        </ul>
      )}
      <SortableOverlay />
    </Sortable>
  );
}

function defaultId(item: unknown): string {
  return typeof item === "string" ? item : String((item as { id?: unknown }).id);
}

interface RowProps {
  id: string;
  handle: boolean;
  moveMenu: boolean;
  className?: string;
  actions?: React.ReactNode;
  render: (s: { isDragging: boolean; disabled: boolean }) => React.ReactNode;
}

function ListRow({ id, handle, moveMenu, className, actions, render }: RowProps) {
  const s = useSortableItem(id);
  const { ref: activatorRef, ...activator } = s.handleProps;
  const content = <div className="min-w-0 flex-1">{render(s)}</div>;
  return (
    <li
      ref={s.ref}
      style={s.style}
      data-slot="sortable-item"
      data-dragging={s.isDragging ? "" : undefined}
      data-placeholder={s.isPlaceholder ? "" : undefined}
      data-disabled={s.disabled ? "" : undefined}
      className={className}
    >
      {handle ? (
        <>
          {s.disabled ? (
            <span aria-hidden className="w-7 shrink-0" />
          ) : (
            <button
              type="button"
              ref={activatorRef}
              data-slot="sortable-handle"
              className="vui-sortable-handle focus-ring inline-flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-ui-sm text-fg-subtle transition-colors hover:bg-hover hover:text-fg active:cursor-grabbing [&_svg]:size-4"
              {...(activator as React.ButtonHTMLAttributes<HTMLButtonElement>)}
            >
              <GripVertical aria-hidden />
            </button>
          )}
          {content}
        </>
      ) : (
        <div
          ref={activatorRef}
          data-slot="sortable-activator"
          className={cn("focus-ring -my-1 flex min-w-0 flex-1 items-center self-stretch rounded-ui-sm py-1 ps-1.5", !s.disabled && "cursor-grab touch-none active:cursor-grabbing")}
          {...(activator as React.HTMLAttributes<HTMLDivElement>)}
        >
          {content}
        </div>
      )}
      {actions}
      {moveMenu && !s.disabled && <SortableMoveMenu id={id} size="xs" className="opacity-70 group-hover/row:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100" />}
    </li>
  );
}

// ---------------------------------------------------------------------------------------------
// SortableGrid
// ---------------------------------------------------------------------------------------------

export interface SortableGridProps<T> extends SharedProps<T> {
  /** Minimum tile width; columns auto-fill. Default `"10rem"`. */
  minItemWidth?: string;
  /** Drag from a handle only. Default `false` (the whole tile is the activator). */
  handle?: boolean;
}

/**
 * A ready sortable grid (gallery, dashboard tiles). Arrow keys move in two dimensions.
 *
 * ```tsx
 * <SortableGrid aria-label="Gallery" items={photos} onReorder={setPhotos} renderItem={(p) => <img src={p.src} alt={p.alt} />} />
 * ```
 */
export function SortableGrid<T>(props: SortableGridProps<T>) {
  const { items, getId, getLabel, onReorder, renderItem, disabled, moveMenu = true, renderActions, empty, labels, minItemWidth = "10rem", handle = false, className, itemClassName, ...aria } = props;
  const idOf = getId ?? ((it: T) => defaultId(it));
  return (
    <Sortable
      items={items}
      getId={idOf}
      getLabel={getLabel}
      onReorder={onReorder}
      orientation="grid"
      handle={handle}
      disabled={disabled}
      labels={labels}
      renderOverlay={(item) => (
        <div className={cn("vui-sortable-tile vui-sortable-clone overflow-hidden rounded-ui-lg border border-line", itemClassName)}>
          {renderItem(item, { index: items.indexOf(item), isDragging: true, overlay: true, disabled: false })}
        </div>
      )}
    >
      {items.length === 0 && empty ? (
        <div data-slot="sortable-empty">{empty}</div>
      ) : (
        <ul
          data-slot="sortable-grid"
          className={cn("vui-sortable-grid grid gap-(--gap,0.75rem)", className)}
          style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${minItemWidth}, 100%), 1fr))` }}
          {...aria}
        >
          {items.map((item, index) => (
            <GridTile
              key={idOf(item)}
              id={idOf(item)}
              handle={handle}
              moveMenu={moveMenu}
              className={itemClassName}
              actions={renderActions?.(item)}
              render={(s) => renderItem(item, { index, isDragging: s.isDragging, overlay: false, disabled: s.disabled })}
            />
          ))}
        </ul>
      )}
      <SortableOverlay />
    </Sortable>
  );
}

function GridTile({ id, handle, moveMenu, className, actions, render }: RowProps) {
  const s = useSortableItem(id);
  const { ref: activatorRef, ...activator } = s.handleProps;
  return (
    <li
      ref={s.ref}
      style={s.style}
      data-slot="sortable-item"
      data-dragging={s.isDragging ? "" : undefined}
      data-placeholder={s.isPlaceholder ? "" : undefined}
      data-disabled={s.disabled ? "" : undefined}
      className={cn("vui-sortable-tile group/tile relative min-w-0 rounded-ui-lg border border-line bg-surface", className)}
    >
      {handle ? (
        <>
          {render(s)}
          {!s.disabled && (
            <button
              type="button"
              ref={activatorRef}
              data-slot="sortable-handle"
              className="vui-sortable-handle focus-ring absolute start-1.5 top-1.5 inline-flex size-7 cursor-grab touch-none items-center justify-center rounded-ui-sm bg-popover text-fg-muted shadow-sm hover:text-fg active:cursor-grabbing [&_svg]:size-4"
              {...(activator as React.ButtonHTMLAttributes<HTMLButtonElement>)}
            >
              <GripVertical aria-hidden />
            </button>
          )}
        </>
      ) : (
        <div
          ref={activatorRef}
          data-slot="sortable-activator"
          className={cn("focus-ring h-full overflow-hidden rounded-[inherit]", !s.disabled && "cursor-grab touch-none active:cursor-grabbing")}
          {...(activator as React.HTMLAttributes<HTMLDivElement>)}
        >
          {render(s)}
        </div>
      )}
      {(moveMenu || actions) && !s.disabled && (
        <div className="absolute end-1.5 top-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover/tile:opacity-100 group-focus-within/tile:opacity-100 has-data-[state=open]:opacity-100 pointer-coarse:opacity-100">
          {actions}
          {moveMenu && <SortableMoveMenu id={id} size="xs" className="bg-popover text-fg-muted shadow-sm hover:bg-popover hover:text-fg" />}
        </div>
      )}
    </li>
  );
}
