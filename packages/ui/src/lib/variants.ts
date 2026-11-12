import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * The shared box look of every text-entry or trigger control: Input, Textarea, Select trigger,
 * Combobox, date/time picker triggers, Tag input. Works both when the box itself is focusable
 * (a `<button>` trigger) and when it wraps a focusable child (Input group): focus, invalid and
 * disabled styles react to the element itself **or** a descendant.
 *
 * Heights follow the density axis through `--control-h`: `sm` = control-h − 0.5rem, `md` = control-h,
 * `lg` = control-h + 0.5rem. Set `data-readonly` on the box for the read-only look.
 *
 * ```tsx
 * <button className={controlVariants({ size: "sm" })}>Status</button>
 * ```
 */
export const controlVariants = /*#__PURE__*/ cva(
  [
    "relative flex w-full min-w-0 items-center rounded-ui border text-fg",
    "transition-[border-color,box-shadow,background-color] duration-150",
    // focus on self (trigger) or on a child (input group)
    "focus-visible:outline-none focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_var(--accent-soft)]",
    "has-[:focus-visible]:border-ring has-[:focus-visible]:shadow-[0_0_0_3px_var(--accent-soft)]",
    // invalid
    "aria-invalid:border-danger has-[[aria-invalid=true]]:border-danger",
    "aria-invalid:focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--danger)_18%,transparent)]",
    "has-[[aria-invalid=true]:focus-visible]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--danger)_18%,transparent)]",
    // disabled
    // Only a disabled field or trigger dims the wrapper; a disabled helper button inside (a stepper at
    // its limit, a clear button) must not make the whole control look disabled.
    "disabled:cursor-not-allowed disabled:opacity-50",
    "has-[input:disabled,select:disabled,textarea:disabled,[aria-haspopup]:disabled,[role=combobox]:disabled]:cursor-not-allowed",
    "has-[input:disabled,select:disabled,textarea:disabled,[aria-haspopup]:disabled,[role=combobox]:disabled]:opacity-50",
    "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    // read-only
    "data-readonly:border-dashed data-readonly:bg-transparent data-readonly:shadow-none",
  ],
  {
    variants: {
      size: {
        sm: "h-[calc(var(--control-h)-0.5rem)] gap-1.5 px-2.5 text-[13px] [&_svg]:size-3.5",
        md: "h-(--control-h) gap-2 px-3 text-sm [&_svg]:size-4",
        lg: "h-[calc(var(--control-h)+0.5rem)] gap-2.5 px-3.5 text-[15px] [&_svg]:size-[18px]",
      },
      variant: {
        /** Field background with a hairline border. */
        default: "border-field-border bg-field hover:border-field-border-hover",
        /** Borderless until hover/focus — inline cell editing, toolbar search. */
        ghost: "border-transparent bg-transparent hover:bg-hover",
        /** Inside the dark sidebar (`surface-nav`). */
        nav: "border-nav-line bg-nav-hover text-nav-fg-strong hover:border-[color-mix(in_srgb,var(--nav-fg)_30%,transparent)]",
      },
      pill: { true: "rounded-full" },
      /** Auto height for multi-line content (Textarea, Tag input). */
      multiline: { true: "h-auto items-start py-2" },
    },
    defaultVariants: { size: "md", variant: "default" },
  },
);
export type ControlVariantProps = VariantProps<typeof controlVariants>;

/**
 * One look for every list item: Select / Combobox options, pickers, Dropdown and Context Menu
 * items, Command items, sidebar flyout links. Highlight works with Radix (`data-highlighted`),
 * cmdk (`data-selected=true`) and plain `aria-selected`; checked items use `data-state=checked`.
 *
 * Compose with `itemSlots` for the inner parts.
 *
 * ```tsx
 * <DropdownMenu.Item className={itemVariants({ tone: "danger" })}>
 *   <Trash2 className={itemSlots.icon} /> Delete <span className={itemSlots.shortcut}>⌘⌫</span>
 * </DropdownMenu.Item>
 * ```
 */
export const itemVariants = /*#__PURE__*/ cva(
  [
    "relative flex w-full cursor-default select-none items-center gap-2 rounded-ui-sm text-start text-fg outline-none",
    "transition-colors duration-100",
    "data-highlighted:bg-hover data-[selected=true]:bg-hover aria-selected:bg-hover focus-visible:bg-hover",
    "data-[state=checked]:font-medium",
    "[&[data-disabled]:not([data-disabled=false])]:pointer-events-none [&[data-disabled]:not([data-disabled=false])]:opacity-45",
    "aria-disabled:pointer-events-none aria-disabled:opacity-45",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      size: {
        sm: "min-h-7 px-2 py-1 text-[13px]",
        md: "min-h-8 px-2 py-1.5 text-sm",
      },
      tone: {
        default: "[&_svg]:text-fg-muted",
        danger: "text-danger [&_svg]:text-danger data-highlighted:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] data-[selected=true]:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]",
        /** Inside the dark sidebar / nav popovers. */
        nav: "text-nav-fg data-highlighted:bg-nav-hover data-highlighted:text-nav-fg-strong data-[selected=true]:bg-nav-hover aria-selected:bg-nav-hover focus-visible:bg-nav-hover",
      },
      /** Reserve the start gutter for a check/radio indicator. */
      inset: { true: "ps-8" },
    },
    defaultVariants: { size: "md", tone: "default" },
  },
);
export type ItemVariantProps = VariantProps<typeof itemVariants>;

/** Class names for the inner parts of an item. */
export const itemSlots = {
  /** Leading icon. */
  icon: "size-4 shrink-0 text-fg-muted",
  /** Check / radio indicator in the inset gutter. */
  indicator: "absolute start-2 flex size-4 items-center justify-center text-fg",
  /** Main label (truncates). */
  label: "min-w-0 flex-1 truncate",
  /** Secondary line under the label. */
  description: "block text-xs font-normal text-fg-subtle",
  /** Shortcut / trailing meta at the end. */
  shortcut: "ms-auto ps-4 font-mono text-[11px] tracking-wide text-fg-subtle",
  /** Group heading. */
  groupLabel: "px-2 pt-2 pb-1 text-[11px] font-medium tracking-[0.04em] text-fg-subtle",
  /** Divider between groups. */
  separator: "-mx-1 my-1 h-px bg-line",
} as const;

interface MenuEntryBase {
  /** Stable key. */
  id: string;
  disabled?: boolean;
  /** Hidden unless `can(permission)` is true (see `useCan`). Hiding is not security. */
  permission?: string;
}

/** A selectable entry. Exactly one of `onSelect` / `href` is typical. */
export interface MenuItemEntry extends MenuEntryBase {
  type?: "item";
  label: React.ReactNode;
  /** Plain text for typeahead and search when `label` isn't a string. */
  textValue?: string;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  /** Shortcut string, e.g. `"mod+shift+p"` (rendered with Kbd / formatShortcut). */
  shortcut?: string;
  /** Extra search terms (Command). */
  keywords?: string[];
  tone?: "default" | "danger";
  href?: string;
  onSelect?: () => void;
  /** Trailing count or badge. */
  badge?: React.ReactNode;
}
export interface MenuCheckboxEntry extends MenuEntryBase {
  type: "checkbox";
  label: React.ReactNode;
  textValue?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  shortcut?: string;
}
export interface MenuRadioEntry extends MenuEntryBase {
  type: "radio";
  label?: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: React.ReactNode; textValue?: string; disabled?: boolean }>;
}
export interface MenuSubmenuEntry extends MenuEntryBase {
  type: "submenu";
  label: React.ReactNode;
  textValue?: string;
  icon?: React.ReactNode;
  items: MenuEntry[];
}
export interface MenuGroupEntry {
  type: "group";
  id: string;
  label?: React.ReactNode;
  items: MenuEntry[];
}
export interface MenuSeparatorEntry {
  type: "separator";
  id?: string;
}
export interface MenuLabelEntry {
  type: "label";
  id?: string;
  label: React.ReactNode;
}

/**
 * Data-driven menu model shared by Dropdown Menu, Context Menu, Command, Select/Combobox option
 * lists and sidebar flyouts.
 */
export type MenuEntry = MenuItemEntry | MenuCheckboxEntry | MenuRadioEntry | MenuSubmenuEntry | MenuGroupEntry | MenuSeparatorEntry | MenuLabelEntry;
