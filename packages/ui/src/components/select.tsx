"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useFieldContext, useFieldControl } from "../lib/field-context";
import { useLabels } from "../lib/labels";
import { Layer } from "../lib/layer";
import { useLocale } from "../lib/locale";
import { foldText } from "../lib/text";
import { usePortalContainer } from "../lib/theme-scope";
import { useControllableState } from "../lib/use-controllable-state";
import { controlVariants, itemSlots, itemVariants } from "../lib/variants";
import { Spinner } from "./spinner";

const selectLabels = {
  placeholder: "Select…",
  clear: "Clear selection",
  loading: "Loading options…",
  empty: "No options",
};
export type SelectLabels = typeof selectLabels;

/** One option of the `items` shorthand. */
export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
  icon?: React.ReactNode;
  /** Second line under the label (also shown in the open list only). */
  description?: string;
  disabled?: boolean;
  /** Options with the same `group` are rendered under one heading, in first-seen order. */
  group?: string;
}

interface SelectContextValue {
  size: "sm" | "md" | "lg";
  itemSize: "sm" | "md";
}
const SelectContext = React.createContext<SelectContextValue>({ size: "md", itemSize: "md" });

/* ------------------------------------------------------------------ */
/* Composite parts                                                     */
/* ------------------------------------------------------------------ */

/** Radix root. Use the parts below to compose; or use the `Select` shorthand. */
export const SelectRoot = SelectPrimitive.Root;

export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  size?: "sm" | "md" | "lg";
  /** `"default"` field look · `"ghost"` borderless (table cells, toolbars) · `"pill"` rounded (filter bars). */
  variant?: "default" | "ghost" | "pill";
  invalid?: boolean;
  /** Read-only look: dashed border, no chevron, does not open. */
  readOnly?: boolean;
  /** Spinner in place of the chevron. */
  loading?: boolean;
  /** Announced as `aria-required` (set `required` on the root for form validation). */
  required?: boolean;
}

/**
 * The button that shows the value. Uses `controlVariants`, so it lines up with Input.
 * Reads the surrounding Field (id, description, invalid, disabled).
 */
export const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, SelectTriggerProps>(function SelectTrigger(
  { className, size = "md", variant = "default", invalid, readOnly, loading, children, ...rest },
  ref,
) {
  const props = useFieldControl({ ...rest, readOnly, "aria-invalid": invalid ? true : rest["aria-invalid"] });
  const { readOnly: ro, required, name: _name, ...triggerProps } = props as typeof props & { required?: boolean; name?: string };
  void _name;
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      data-size={size}
      data-readonly={ro ? "" : undefined}
      aria-readonly={ro || undefined}
      aria-required={required || undefined}
      aria-busy={loading || undefined}
      className={cn(
        controlVariants({ size, variant: variant === "pill" ? "default" : variant, pill: variant === "pill" }),
        "justify-between text-start whitespace-nowrap cursor-default",
        "data-placeholder:text-fg-subtle [&>span]:min-w-0 [&>span]:truncate",
        ro && "cursor-default",
        className,
      )}
      {...triggerProps}
    >
      {children}
      {loading ? (
        <Spinner size={size === "lg" ? "md" : "sm"} tone="muted" />
      ) : ro ? null : (
        <SelectPrimitive.Icon asChild>
          <ChevronDown aria-hidden className="shrink-0 text-fg-subtle transition-transform duration-150 [[data-state=open]>&]:rotate-180" />
        </SelectPrimitive.Icon>
      )}
    </SelectPrimitive.Trigger>
  );
});

/** Shows the selected item's text, or the placeholder. Children override the rendering. */
export const SelectValue = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Value>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>>(
  function SelectValue({ className, ...props }, ref) {
    return <SelectPrimitive.Value ref={ref} data-slot="select-value" className={cn("min-w-0 truncate", className)} {...props} />;
  },
);

export interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  /** Item density inside the list. Default follows the trigger size. */
  itemSize?: "sm" | "md";
}

/**
 * The floating list. Popper-positioned under the trigger, at least as wide as it, portalled into
 * the nearest ThemeScope, and one layer deep (glass blur only at depth 1).
 */
export const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, SelectContentProps>(function SelectContent(
  { className, children, position = "popper", sideOffset = 6, collisionPadding = 12, itemSize, ...props },
  ref,
) {
  const container = usePortalContainer();
  const parent = React.useContext(SelectContext);
  const ctx = React.useMemo(() => ({ ...parent, itemSize: itemSize ?? parent.itemSize }), [parent, itemSize]);
  return (
    <SelectPrimitive.Portal container={container}>
      <Layer asChild>
        <SelectPrimitive.Content
          ref={ref}
          data-slot="select-content"
          position={position}
          sideOffset={position === "popper" ? sideOffset : undefined}
          collisionPadding={collisionPadding}
          className={cn(
            "surface-popover ui-pop relative z-(--z-popover) overflow-hidden rounded-ui-lg",
            position === "popper" &&
              "max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) max-w-[min(28rem,calc(100vw-1.5rem))]",
            className,
          )}
          {...props}
        >
          <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-fg-subtle">
            <ChevronUp aria-hidden className="size-4" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "max-h-[min(22rem,var(--radix-select-content-available-height))]")}>
            <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-fg-subtle">
            <ChevronDown aria-hidden className="size-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </Layer>
    </SelectPrimitive.Portal>
  );
});

export interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  icon?: React.ReactNode;
  /** Second line, shown in the list only (the trigger shows the label). */
  description?: React.ReactNode;
}

/**
 * One option. Typeahead uses a locale-folded copy of the text, so typing "i" finds "İstanbul"
 * and "c" finds "Çanakkale". Pass `textValue` when children aren't plain text.
 */
export const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, SelectItemProps>(function SelectItem(
  { className, children, icon, description, textValue, ...props },
  ref,
) {
  const { itemSize } = React.useContext(SelectContext);
  const { locale } = useLocale();
  const plain = textValue ?? (typeof children === "string" ? children : undefined);
  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      textValue={plain !== undefined ? foldText(plain, locale) : undefined}
      className={cn(itemVariants({ size: itemSize }), "pe-8", description ? "items-start" : undefined, className)}
      {...props}
    >
      {icon ? <span className={cn(itemSlots.icon, "flex items-center justify-center", description && "mt-0.5")}>{icon}</span> : null}
      <span className="grid min-w-0 flex-1">
        <SelectPrimitive.ItemText>
          <span className="flex min-w-0 items-center gap-2">
            {icon ? <span aria-hidden className="hidden items-center text-fg-muted [[data-slot=select-trigger]_&]:flex">{icon}</span> : null}
            <span className="truncate">{children}</span>
          </span>
        </SelectPrimitive.ItemText>
        {description ? <span className={itemSlots.description}>{description}</span> : null}
      </span>
      <span className={cn("absolute end-2 flex size-4 items-center justify-center text-accent-ink", description && "top-2")}>
        <SelectPrimitive.ItemIndicator>
          <Check aria-hidden strokeWidth={2.5} className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
});

export interface SelectGroupProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group> {
  /** Heading for the group (or put a `SelectLabel` first). */
  label?: React.ReactNode;
}

/** Groups items under a heading; announced as a group. */
export const SelectGroup = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Group>, SelectGroupProps>(function SelectGroup(
  { label, children, ...props },
  ref,
) {
  return (
    <SelectPrimitive.Group ref={ref} data-slot="select-group" {...props}>
      {label != null ? <SelectLabel>{label}</SelectLabel> : null}
      {children}
    </SelectPrimitive.Group>
  );
});

export const SelectLabel = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Label>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>>(
  function SelectLabel({ className, ...props }, ref) {
    return <SelectPrimitive.Label ref={ref} data-slot="select-label" className={cn(itemSlots.groupLabel, className)} {...props} />;
  },
);

export const SelectSeparator = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>>(
  function SelectSeparator({ className, ...props }, ref) {
    return <SelectPrimitive.Separator ref={ref} data-slot="select-separator" className={cn(itemSlots.separator, className)} {...props} />;
  },
);

/* ------------------------------------------------------------------ */
/* Shorthand                                                           */
/* ------------------------------------------------------------------ */

export interface SelectProps<V extends string = string> {
  /** Selected value; `null` = nothing selected (controlled). */
  value?: V | null;
  defaultValue?: V | null;
  /** Called with the new value, or `null` after clearing. */
  onValueChange?: (value: V | null) => void;
  /** Options shorthand. Or compose `SelectItem` / `SelectGroup` / `SelectSeparator` as children. */
  items?: SelectOption<V>[];
  children?: React.ReactNode;
  /** Text shown while nothing is selected. Default "Select…". */
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "pill";
  /** Show a clear (×) button while there is a value. Clearing yields `null`. */
  clearable?: boolean;
  /** Form field name — Radix renders a native `<select>` for FormData. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /** Read-only: focusable and announced, but doesn't open. */
  readOnly?: boolean;
  /** Options are still loading: spinner in the trigger and a status row in the list. */
  loading?: boolean;
  /** Custom trigger content for the selected option (`items` shorthand only). */
  renderValue?: (item: SelectOption<V>) => React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  /** Classes for the trigger (alias of `triggerClassName`). */
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  /** Built-in string overrides (`select` namespace). */
  labels?: Partial<SelectLabels>;
}

function groupItems<V extends string>(items: SelectOption<V>[]) {
  const groups: Array<{ label?: string; items: SelectOption<V>[] }> = [];
  const byName = new Map<string, { label?: string; items: SelectOption<V>[] }>();
  for (const item of items) {
    const key = item.group ?? "";
    let g = byName.get(key);
    if (!g) {
      g = { label: item.group, items: [] };
      byName.set(key, g);
      groups.push(g);
    }
    g.items.push(item);
  }
  return groups;
}

function SelectInner<V extends string = string>(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    items,
    children,
    placeholder,
    size = "md",
    variant = "default",
    clearable,
    name,
    required,
    disabled,
    invalid,
    readOnly,
    loading,
    renderValue,
    open: openProp,
    defaultOpen,
    onOpenChange,
    className,
    triggerClassName,
    contentClassName,
    labels,
    ...aria
  }: SelectProps<V>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const t = useLabels("select", selectLabels, labels);
  const field = useFieldContext();
  const isDisabled = disabled ?? (field?.disabled || undefined);
  const isReadOnly = readOnly ?? (field?.readOnly || undefined);
  const isRequired = required ?? (field?.required || undefined);
  const [value, setValue] = useControllableState<V | null>({ value: valueProp, defaultValue: defaultValue ?? null, onChange: onValueChange, name: "Select" });
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen ?? false, onChange: onOpenChange, name: "Select" });
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const ctx = React.useMemo(() => ({ size, itemSize: size === "sm" ? ("sm" as const) : ("md" as const) }), [size]);
  const selected = items?.find((i) => i.value === value);
  const showClear = clearable && value !== null && !isDisabled && !isReadOnly;

  return (
    <SelectContext.Provider value={ctx}>
      <SelectPrimitive.Root
        // Radix treats "" as "no selection" and shows the placeholder.
        value={value ?? ""}
        onValueChange={(v) => setValue(v === "" ? null : (v as V))}
        open={isReadOnly ? false : open}
        onOpenChange={(o) => {
          if (!isReadOnly) setOpen(o);
        }}
        name={name ?? field?.name}
        required={isRequired}
        disabled={isDisabled}
      >
        <div data-slot="select" className="relative w-full min-w-0">
          <SelectTrigger
            ref={(node) => {
              triggerRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            size={size}
            variant={variant}
            invalid={invalid}
            readOnly={isReadOnly}
            loading={loading}
            disabled={isDisabled}
            required={isRequired}
            className={cn(showClear && (size === "sm" ? "pe-12" : "pe-14"), className, triggerClassName)}
            {...aria}
          >
            <SelectValue placeholder={placeholder ?? t("placeholder")}>{selected && renderValue ? renderValue(selected) : undefined}</SelectValue>
          </SelectTrigger>
          {showClear ? (
            <button
              type="button"
              data-slot="select-clear"
              aria-label={t("clear")}
              onClick={() => {
                setValue(null);
                triggerRef.current?.focus();
              }}
              className={cn(
                "absolute top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-hover hover:text-fg focus-ring",
                size === "sm" ? "end-7 size-5 [&_svg]:size-3" : "end-8 size-6 [&_svg]:size-3.5",
              )}
            >
              <X aria-hidden />
            </button>
          ) : null}
        </div>
        <SelectContent className={contentClassName}>
          {items
            ? groupItems(items).map((g, gi) => {
                const rendered = g.items.map((item) => (
                  <SelectItem key={item.value} value={item.value} icon={item.icon} description={item.description} disabled={item.disabled} textValue={item.label}>
                    {item.label}
                  </SelectItem>
                ));
                return g.label ? (
                  <React.Fragment key={g.label}>
                    {gi > 0 ? <SelectSeparator /> : null}
                    <SelectGroup label={g.label}>{rendered}</SelectGroup>
                  </React.Fragment>
                ) : (
                  <React.Fragment key={`_${gi}`}>{rendered}</React.Fragment>
                );
              })
            : children}
          {loading ? (
            <div role="status" className="flex items-center gap-2 px-2 py-2 text-[13px] text-fg-muted">
              <Spinner size="xs" tone="muted" />
              {t("loading")}
            </div>
          ) : items && items.length === 0 ? (
            <div className="px-2 py-2 text-[13px] text-fg-subtle">{t("empty")}</div>
          ) : null}
        </SelectContent>
      </SelectPrimitive.Root>
    </SelectContext.Provider>
  );
}

/**
 * Pick one of a small, fixed set (≤ ~15): content status, currency, department, sort order.
 * For longer or searchable lists use Combobox. WAI-ARIA select-only combobox on Radix:
 * arrow keys, Home/End, typeahead (locale-folded), Esc.
 *
 * ```tsx
 * <Field label="Status">
 *   <Select name="status" defaultValue="draft" items={[
 *     { value: "draft", label: "Draft", description: "Only editors can see it" },
 *     { value: "published", label: "Published" },
 *   ]} />
 * </Field>
 * ```
 */
export const Select = React.forwardRef(SelectInner) as <V extends string = string>(
  props: SelectProps<V> & { ref?: React.Ref<HTMLButtonElement> },
) => React.ReactElement;
