"use client";

import * as React from "react";
import { Toggle as TogglePrimitive, ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

export const toggleVariants = cva(
  [
    "relative inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap font-medium outline-none",
    "transition-[background-color,color,box-shadow,border-color] duration-150 focus-ring [&_svg]:shrink-0",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      variant: {
        /** Toolbar look: transparent until hovered; pressed = tinted. */
        ghost: "text-fg-muted hover:bg-hover hover:text-fg data-[state=on]:bg-selected data-[state=on]:text-fg",
        /** Bordered, like a secondary button; pressed = tinted + stronger edge. */
        outline:
          "border border-field-border bg-field text-fg-muted hover:border-field-border-hover hover:text-fg glass:border-field-border-hover data-[state=on]:border-field-border-hover data-[state=on]:bg-selected data-[state=on]:text-fg",
        /** Moving-thumb look used inside a segmented ToggleGroup. */
        segmented:
          "text-fg-muted hover:text-fg data-[state=on]:bg-(--segment-thumb) data-[state=on]:text-fg data-[state=on]:shadow-(--segment-thumb-shadow) focus-visible:outline-offset-0",
      },
      size: {
        xs: "h-7 rounded-ui-sm px-2 text-xs [&_svg]:size-3.5",
        sm: "h-8 rounded-ui-sm px-2.5 text-[13px] [&_svg]:size-4",
        md: "h-(--control-h) rounded-ui px-3 text-sm [&_svg]:size-4",
        lg: "h-12 rounded-ui px-4 text-[15px] [&_svg]:size-[18px]",
      },
      iconOnly: { true: "aspect-square px-0" },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  },
);

type ToggleVariant = "ghost" | "outline" | "segmented";
type ToggleSize = "xs" | "sm" | "md" | "lg";

export interface ToggleProps extends Omit<React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>, "aria-label"> {
  variant?: Exclude<ToggleVariant, "segmented">;
  size?: ToggleSize;
  /** Accessible name — required when the toggle shows only an icon. */
  label?: string;
  "aria-label"?: string;
}

/**
 * A two-state button (`aria-pressed`): Bold in an editor toolbar, "Show archived", pin.
 *
 * ```tsx
 * <Toggle label="Bold" size="sm"><Bold /></Toggle>
 * <Toggle variant="outline" defaultPressed>Show archived</Toggle>
 * ```
 */
export const Toggle = React.forwardRef<React.ElementRef<typeof TogglePrimitive.Root>, ToggleProps>(function Toggle(
  { variant = "ghost", size = "md", label, className, children, title, ...props },
  ref,
) {
  const iconOnly = Boolean(label) && !hasText(children);
  return (
    <TogglePrimitive.Root
      ref={ref}
      data-slot="toggle"
      aria-label={props["aria-label"] ?? (iconOnly ? label : undefined)}
      title={title ?? (iconOnly ? label : undefined)}
      className={cn(toggleVariants({ variant, size, iconOnly }), className)}
      {...props}
    >
      {children}
    </TogglePrimitive.Root>
  );
});

function hasText(node: React.ReactNode): boolean {
  let found = false;
  React.Children.forEach(node, (c) => {
    if (typeof c === "string" ? c.trim() !== "" : typeof c === "number") found = true;
    else if (React.isValidElement<{ children?: React.ReactNode }>(c) && c.props.children && (typeof c.type === "string" || c.type === React.Fragment)) found ||= hasText(c.props.children);
  });
  return found;
}

/* ------------------------------------------------------------------ */
/* ToggleGroup                                                         */
/* ------------------------------------------------------------------ */

interface ToggleGroupContextValue {
  variant: ToggleVariant;
  size: ToggleSize;
}
const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({ variant: "outline", size: "md" });

interface ToggleGroupBaseProps {
  /**
   * `"segmented"` (default): an inset track with a raised thumb — view switches (List / Board).
   * `"outline"`: attached bordered buttons — text alignment, formatting.
   * `"ghost"`: loose toolbar buttons.
   */
  variant?: ToggleVariant;
  size?: ToggleSize;
  orientation?: "horizontal" | "vertical";
  /** Stretch to the container width; items share the space. */
  block?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface ToggleGroupSingleProps
  extends ToggleGroupBaseProps,
    Omit<React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>, "type" | "value" | "defaultValue" | "onValueChange" | "orientation" | "dir"> {
  type?: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Allow pressing the active item again to clear the selection. Default `false` — a view switch always has a view. */
  allowEmpty?: boolean;
}
export interface ToggleGroupMultipleProps
  extends ToggleGroupBaseProps,
    Omit<React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>, "type" | "value" | "defaultValue" | "onValueChange" | "orientation" | "dir"> {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  allowEmpty?: never;
}
export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

const trackClass = (orientation: "horizontal" | "vertical") =>
  cn("gap-0.5 rounded-ui border border-line bg-selected p-[3px]", orientation === "vertical" ? "flex-col" : "");

/**
 * A set of toggles with roving focus (one tab stop, arrow keys move): view switches, alignment,
 * filters. `type="single"` (default) keeps exactly one item on; `type="multiple"` for B / I / U.
 * Use RadioGroup `variant="segmented"` instead when the choice is a form value.
 *
 * ```tsx
 * <ToggleGroup aria-label="View" defaultValue="board">
 *   <ToggleGroupItem value="list"><List /> List</ToggleGroupItem>
 *   <ToggleGroupItem value="board"><Kanban /> Board</ToggleGroupItem>
 * </ToggleGroup>
 * ```
 */
export const ToggleGroup = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Root>, ToggleGroupProps>(function ToggleGroup(props, ref) {
  const { variant = "segmented", size = "md", orientation = "horizontal", block, className, children, ...rest } = props;
  const ctx = React.useMemo(() => ({ variant, size }), [variant, size]);
  const layout = cn(
    "relative isolate items-stretch",
    block ? "flex w-full [&>*]:flex-1" : "inline-flex w-fit max-w-full",
    orientation === "vertical" && "flex-col",
    variant === "segmented" && trackClass(orientation),
    variant === "ghost" && "gap-0.5",
    variant === "outline" &&
      (orientation === "vertical"
        ? "[&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none"
        : "[&>*:not(:first-child)]:-ms-px [&>*:not(:first-child)]:rounded-s-none [&>*:not(:last-child)]:rounded-e-none"),
    variant === "outline" && "[&>*:focus-visible]:z-10 [&>[data-state=on]]:z-[1]",
    className,
  );
  const common = { ref, "data-slot": "toggle-group", "data-variant": variant, orientation, className: layout } as const;

  if (rest.type === "multiple") {
    const { type: _t, allowEmpty: _a, ...multi } = rest as ToggleGroupMultipleProps;
    return (
      <ToggleGroupPrimitive.Root type="multiple" {...multi} {...common}>
        <ToggleGroupContext.Provider value={ctx}>{children}</ToggleGroupContext.Provider>
      </ToggleGroupPrimitive.Root>
    );
  }
  return (
    <SingleToggleGroup {...(rest as ToggleGroupSingleProps)} common={common}>
      <ToggleGroupContext.Provider value={ctx}>{children}</ToggleGroupContext.Provider>
    </SingleToggleGroup>
  );
});

function SingleToggleGroup({
  value,
  defaultValue,
  onValueChange,
  allowEmpty = false,
  type: _type,
  common,
  children,
  ...props
}: ToggleGroupSingleProps & { common: Record<string, unknown> }) {
  const [inner, setInner] = React.useState(defaultValue ?? "");
  const current = value !== undefined ? value : inner;
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      {...props}
      {...(common as object)}
      value={current}
      onValueChange={(next: string) => {
        if (!next && !allowEmpty) return;
        if (value === undefined) setInner(next);
        onValueChange?.(next);
      }}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  );
}

export interface ToggleGroupItemProps extends Omit<React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>, "aria-label"> {
  /** Accessible name — required when the item shows only an icon. */
  label?: string;
  "aria-label"?: string;
}

/** One toggle inside a `ToggleGroup`. */
export const ToggleGroupItem = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Item>, ToggleGroupItemProps>(function ToggleGroupItem(
  { label, className, children, title, ...props },
  ref,
) {
  const { variant, size } = React.useContext(ToggleGroupContext);
  const iconOnly = Boolean(label) && !hasText(children);
  const segmentSize =
    variant === "segmented"
      ? size === "xs"
        ? "h-[calc(1.75rem-8px)] rounded-[4px]"
        : size === "sm"
          ? "h-[calc(2rem-8px)] rounded-[5px]"
          : size === "lg"
            ? "h-[calc(3rem-8px)] rounded-[calc(var(--radius)-5px)]"
            : "h-[calc(var(--control-h)-8px)] rounded-[calc(var(--radius)-5px)]"
      : undefined;
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      data-slot="toggle-group-item"
      aria-label={props["aria-label"] ?? (iconOnly ? label : undefined)}
      title={title ?? (iconOnly ? label : undefined)}
      className={cn(toggleVariants({ variant, size, iconOnly }), segmentSize, className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
