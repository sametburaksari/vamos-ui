import * as React from "react";
import * as Slot from "radix-ui/slot";
import { Check } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { ItemListbox } from "../lib/data-islands";
import { Skeleton } from "./skeleton";

/* ------------------------------------------------------------------ */
/* List                                                                 */
/* ------------------------------------------------------------------ */

export interface ItemListProps extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue" | "onChange" | "value"> {
  /** Hairlines between rows. Default `true`. */
  divided?: boolean;
  /**
   * Rows with small side padding and rounded hover — for a list inside a padded CardBody.
   * Without it rows use the card padding, so a list placed straight in a Card lines up with the header.
   */
  inset?: boolean;
  /** Turns the list into a listbox (↑ ↓ Home End, Space toggles). Children need a `value`. */
  selectable?: "single" | "multiple";
  /** Selected values (controlled). */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Element. Default `"ul"` (`"div"` for a list of plain blocks). */
  as?: "ul" | "ol" | "div";
  /** Shown instead of the rows when there are none. */
  empty?: React.ReactNode;
}

/**
 * The container of Item rows. A plain `<ul>` by default; with `selectable` it becomes a listbox
 * (single or multiple) with arrow-key navigation. Server-component compatible unless selectable.
 *
 * ```tsx
 * <ItemList>
 *   <Item><ItemContent><ItemTitle>Local SEO checklist for 2026</ItemTitle><ItemDescription>Samet · Edited yesterday</ItemDescription></ItemContent></Item>
 * </ItemList>
 * ```
 */
export const ItemList = /*#__PURE__*/ React.forwardRef<HTMLElement, ItemListProps>(function ItemList(
  { divided = true, inset, selectable, value, defaultValue, onValueChange, as = "ul", empty, className, children, ...props },
  ref,
) {
  const count = React.Children.toArray(children).length;
  const classes = cn(
    "group/list m-0 grid list-none p-0",
    inset && "-mx-2 gap-0.5",
    // hairline at the bottom of every row but the last (also through an asChild wrapper)
    divided && !inset && "[&>[data-slot=item]:not(:last-child)]:shadow-[inset_0_-1px_0_var(--line)] [&>[data-slot=item-wrapper]:not(:last-child)>*]:shadow-[inset_0_-1px_0_var(--line)]",
    className,
  );
  const data = { "data-slot": "item-list", "data-divided": divided ? "" : undefined, "data-inset": inset ? "" : undefined };
  if (count === 0 && empty !== undefined) {
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} {...data} className={cn("px-(--card-p,1.25rem) py-8 text-center text-[13px] text-fg-muted", className)}>
        {empty}
      </div>
    );
  }
  if (selectable) {
    return (
      <ItemListbox
        ref={ref as React.Ref<HTMLUListElement>}
        selectable={selectable}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        {...data}
        className={classes}
        {...(props as Omit<React.HTMLAttributes<HTMLUListElement>, "defaultValue">)}
      >
        {children}
      </ItemListbox>
    );
  }
  const Comp = as as React.ElementType;
  return (
    <Comp ref={ref} {...data} className={classes} {...props}>
      {children}
    </Comp>
  );
});

/* ------------------------------------------------------------------ */
/* Item                                                                 */
/* ------------------------------------------------------------------ */

export const itemRowVariants = /*#__PURE__*/ cva(
  [
    "group/item relative flex w-full min-w-0 gap-3 text-start text-[13px] text-fg outline-none",
    "px-(--card-p,1.25rem) group-data-inset/list:rounded-ui-sm group-data-inset/list:px-2",
    // states (also driven by the listbox island via aria-selected / aria-disabled)
    "aria-selected:bg-selected data-[state=selected]:bg-selected",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50",
    "focus-visible:z-[1] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
  ],
  {
    variants: {
      size: {
        sm: "min-h-[calc(var(--row-h)-0.5rem)] py-1.5",
        md: "min-h-(--row-h) py-2.5",
        lg: "min-h-[calc(var(--row-h)+1rem)] py-3.5",
      },
      align: { center: "items-center", start: "items-start" },
      interactive: {
        true: "cursor-pointer transition-colors duration-100 hover:bg-hover",
      },
    },
    defaultVariants: { size: "md", align: "center" },
  },
);

export interface ItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "value"> {
  /** Option value — required for rows of a selectable ItemList. */
  value?: string;
  /** Merge the row styles onto the child (a link: `<Item asChild><a href>…</a></Item>`). */
  asChild?: boolean;
  /** Hover tint + pointer. On by default for `asChild` rows and options. */
  interactive?: boolean;
  disabled?: boolean;
  /** Row height from `--row-h`: sm −0.5rem, md, lg +1rem. Default `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Vertical alignment of the parts. Default `"center"`. */
  align?: "center" | "start";
  /** Element of the row wrapper. Default `"li"` (use `"div"` inside `ItemList as="div"`). */
  as?: "li" | "div";
}

/**
 * The generic row of a non-tabular list: leading visual, title + description, meta and actions.
 *
 * ```tsx
 * <Item>
 *   <ItemLeading><Avatar … /></ItemLeading>
 *   <ItemContent><ItemTitle>Ayşe Kaya</ItemTitle><ItemDescription>Head of Sales · Northwind</ItemDescription></ItemContent>
 *   <ItemMeta>2h</ItemMeta>
 *   <ItemActions reveal="hover"><IconButton label="Call Ayşe Kaya" size="xs"><Phone /></IconButton></ItemActions>
 * </Item>
 * ```
 */
export const Item = /*#__PURE__*/ React.forwardRef<HTMLElement, ItemProps>(function Item(
  { value, asChild, interactive, disabled, size, align, as = "li", className, children, ...props },
  ref,
) {
  const option = value !== undefined;
  const rowClass = cn(itemRowVariants({ size, align, interactive: interactive ?? (asChild || option) }), className);
  const state = {
    "data-slot": "item",
    "data-value": value,
    "data-disabled": disabled ? "" : undefined,
    "aria-disabled": disabled || undefined,
  };
  const check = option ? (
    <span aria-hidden data-slot="item-check" className="ms-1 grid size-4 shrink-0 place-items-center self-center text-accent-ink opacity-0 transition-opacity group-aria-selected/item:opacity-100 [&_svg]:size-3.5">
      <Check strokeWidth={2.5} />
    </span>
  ) : null;

  if (asChild) {
    const Wrapper = as as React.ElementType;
    return (
      <Wrapper className="contents" data-slot="item-wrapper">
        <Slot.Root ref={ref} {...state} className={rowClass} {...props}>
          {children}
        </Slot.Root>
      </Wrapper>
    );
  }
  const Comp = as as React.ElementType;
  return (
    <Comp ref={ref} {...state} className={rowClass} {...props}>
      {children}
      {check}
    </Comp>
  );
});

/** Leading visual: avatar, icon tile, thumbnail or checkbox. */
export function ItemLeading({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "plain" | "icon" | "thumbnail" }) {
  return (
    <div
      data-slot="item-leading"
      className={cn(
        "flex shrink-0 items-center",
        variant === "icon" && "grid size-8 place-items-center rounded-ui-sm border border-line bg-surface-2 text-fg-muted [&_svg]:size-4",
        variant === "thumbnail" && "h-10 w-14 overflow-hidden rounded-ui-sm border border-line bg-surface-2 [&_img]:size-full [&_img]:object-cover",
        className,
      )}
      {...props}
    />
  );
}

/** Title + description column; takes the remaining width and truncates. */
export function ItemContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="item-content" className={cn("grid min-w-0 flex-1 gap-0.5", className)} {...props} />;
}

export interface ItemTitleProps extends React.HTMLAttributes<HTMLElement> {
  /** Render as the child (a link or heading). */
  asChild?: boolean;
  /** Cut to one line (with the full text as `title` when it is a string). Default `true`. */
  truncate?: boolean;
}

export function ItemTitle({ className, asChild, truncate = true, title, children, ...props }: ItemTitleProps) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="item-title"
      title={title ?? (truncate && typeof children === "string" ? children : undefined)}
      className={cn("font-medium text-fg", truncate && "truncate", className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function ItemDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="item-description" className={cn("min-w-0 truncate text-xs text-fg-subtle", className)} {...props} />;
}

/** Trailing information: time, count, badge. */
export function ItemMeta({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="item-meta" className={cn("flex shrink-0 items-center gap-2 text-xs text-fg-subtle tabular", className)} {...props} />;
}

export interface ItemActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * `"always"` (default) or `"hover"`: hidden until the row is hovered — but still visible when
   * anything in the row has focus, and always visible on touch screens.
   */
  reveal?: "always" | "hover";
}

export function ItemActions({ className, reveal = "always", ...props }: ItemActionsProps) {
  return (
    <div
      data-slot="item-actions"
      data-reveal={reveal}
      className={cn(
        "flex shrink-0 items-center gap-1",
        reveal === "hover" &&
          "opacity-0 transition-opacity duration-100 group-hover/item:opacity-100 group-focus-within/item:opacity-100 has-[[data-state=open]]:opacity-100 [@media(hover:none)]:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export interface ItemSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of placeholder rows. Default 3. */
  count?: number;
  /** Include a leading circle. Default `true`. */
  leading?: boolean;
}

/** Placeholder rows while a list loads (one `aria-busy` region). */
export function ItemSkeleton({ count = 3, leading = true, className, ...props }: ItemSkeletonProps) {
  return (
    <div data-slot="item-skeleton" aria-busy="true" className={cn("grid", className)} {...props}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex min-h-(--row-h) items-center gap-3 px-(--card-p,1.25rem) py-2.5">
          {leading ? <Skeleton shape="circle" className="size-8" /> : null}
          <div className="grid flex-1 gap-2">
            <Skeleton shape="text" className="h-3" style={{ width: `${68 - ((i * 17) % 30)}%` }} />
            <Skeleton shape="text" className="h-2.5" style={{ width: `${38 - ((i * 11) % 14)}%` }} />
          </div>
          <Skeleton shape="text" className="h-2.5 w-10" />
        </div>
      ))}
    </div>
  );
}
