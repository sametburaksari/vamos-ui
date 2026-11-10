"use client";

import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { MoreHorizontal } from "lucide-react";
import { cn } from "../lib/cn";
import { usePortalContainer } from "../lib/theme-scope";
import { Layer } from "../lib/layer";
import { useLabels } from "../lib/labels";
import type { MenuEntry } from "../lib/variants";
import {
  MenuCheckIcon,
  MenuEntries,
  MenuItemContent,
  MenuRadioDot,
  MenuSizeContext,
  menuContentVariants,
  menuIndicatorClass,
  menuItemClass,
  menuLabelClass,
  menuSeparatorClass,
  useVisibleEntries,
  type MenuParts,
} from "../lib/menu";
import { IconButton } from "./button";

/** Root. Controlled (`open` / `onOpenChange`) or uncontrolled. */
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export interface DropdownMenuContentProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {
  /** Minimum width: `sm` 180px, `md` 220px. Item size follows. */
  size?: "sm" | "md";
}

/** The menu panel. Portals into the nearest `ThemeScope`; only the first layer blurs in glass mode. */
export const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Content>, DropdownMenuContentProps>(function DropdownMenuContent(
  { className, size = "md", sideOffset = 6, collisionPadding = 12, align = "start", ...props },
  ref,
) {
  const container = usePortalContainer();
  return (
    <DropdownMenuPrimitive.Portal container={container}>
      <MenuSizeContext.Provider value={size}>
        <Layer asChild>
          <DropdownMenuPrimitive.Content
            ref={ref}
            data-slot="dropdown-menu-content"
            sideOffset={sideOffset}
            collisionPadding={collisionPadding}
            align={align}
            className={cn(menuContentVariants({ size }), "max-h-(--radix-dropdown-menu-content-available-height)", className)}
            {...props}
          />
        </Layer>
      </MenuSizeContext.Provider>
    </DropdownMenuPrimitive.Portal>
  );
});

/* ------------------------------------------------------------------ */
/* Items                                                               */
/* ------------------------------------------------------------------ */

export interface DropdownMenuItemProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
  /** Leading icon (lucide element). */
  icon?: React.ReactNode;
  /** Second line under the label. */
  description?: React.ReactNode;
  /** Shortcut hint, e.g. `"mod+d"` (rendered with Kbd). Display only — bind it with `useHotkeys`. */
  shortcut?: string | string[];
  /** Trailing count or badge. */
  badge?: React.ReactNode;
  /** `"danger"` for destructive actions (Delete, Move to trash). */
  tone?: "default" | "danger";
  /** Reserve the indicator gutter so labels align with checkbox/radio items. */
  inset?: boolean;
}

/**
 * One action. `onSelect` fires on click, Enter and Space, then the menu closes; call
 * `event.preventDefault()` in `onSelect` to keep it open (async actions).
 * With `asChild` the child (a link) is rendered as the item and must hold its own content.
 */
export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Item>, DropdownMenuItemProps>(function DropdownMenuItem(
  { className, icon, description, shortcut, badge, tone = "default", inset, asChild, children, ...props },
  ref,
) {
  const size = React.useContext(MenuSizeContext);
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-slot="dropdown-menu-item"
      data-tone={tone}
      asChild={asChild}
      className={menuItemClass({ size, tone, inset, className })}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <MenuItemContent icon={icon} description={description} shortcut={shortcut} badge={badge}>
          {children}
        </MenuItemContent>
      )}
    </DropdownMenuPrimitive.Item>
  );
});

export interface DropdownMenuCheckboxItemProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> {
  shortcut?: string | string[];
  description?: React.ReactNode;
}

/** A toggle (`menuitemcheckbox`). Selecting closes the menu; call `event.preventDefault()` in `onSelect` to keep it open (column toggles). */
export const DropdownMenuCheckboxItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>, DropdownMenuCheckboxItemProps>(
  function DropdownMenuCheckboxItem({ className, shortcut, description, children, ...props }, ref) {
    const size = React.useContext(MenuSizeContext);
    return (
      <DropdownMenuPrimitive.CheckboxItem ref={ref} data-slot="dropdown-menu-checkbox-item" className={menuItemClass({ size, inset: true, className })} {...props}>
        <span className={menuIndicatorClass}>
          <DropdownMenuPrimitive.ItemIndicator>
            <MenuCheckIcon />
          </DropdownMenuPrimitive.ItemIndicator>
        </span>
        <MenuItemContent shortcut={shortcut} description={description}>
          {children}
        </MenuItemContent>
      </DropdownMenuPrimitive.CheckboxItem>
    );
  },
);

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export interface DropdownMenuRadioItemProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> {
  shortcut?: string | string[];
  description?: React.ReactNode;
}

/** One choice inside a `DropdownMenuRadioGroup` (`menuitemradio`). */
export const DropdownMenuRadioItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>, DropdownMenuRadioItemProps>(function DropdownMenuRadioItem(
  { className, shortcut, description, children, ...props },
  ref,
) {
  const size = React.useContext(MenuSizeContext);
  return (
    <DropdownMenuPrimitive.RadioItem ref={ref} data-slot="dropdown-menu-radio-item" className={menuItemClass({ size, inset: true, className })} {...props}>
      <span className={menuIndicatorClass}>
        <DropdownMenuPrimitive.ItemIndicator>
          <MenuRadioDot />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      <MenuItemContent shortcut={shortcut} description={description}>
        {children}
      </MenuItemContent>
    </DropdownMenuPrimitive.RadioItem>
  );
});

export const DropdownMenuLabel = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Label>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }>(
  function DropdownMenuLabel({ className, inset, ...props }, ref) {
    return <DropdownMenuPrimitive.Label ref={ref} data-slot="dropdown-menu-label" className={cn(menuLabelClass, inset && "ps-8", className)} {...props} />;
  },
);

export const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>>(
  function DropdownMenuSeparator({ className, ...props }, ref) {
    return <DropdownMenuPrimitive.Separator ref={ref} data-slot="dropdown-menu-separator" className={cn(menuSeparatorClass, className)} {...props} />;
  },
);

/** Trailing text hint (when you don't want keycaps). */
export function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span data-slot="dropdown-menu-shortcut" className={cn("ms-auto ps-4 font-mono text-[11px] tracking-wide text-fg-subtle", className)} {...props} />;
}

export interface DropdownMenuSubTriggerProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> {
  icon?: React.ReactNode;
  inset?: boolean;
}

/** Opens a submenu on hover, Enter, Space or → (← in RTL). */
export const DropdownMenuSubTrigger = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>, DropdownMenuSubTriggerProps>(function DropdownMenuSubTrigger(
  { className, icon, inset, children, ...props },
  ref,
) {
  const size = React.useContext(MenuSizeContext);
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      data-slot="dropdown-menu-sub-trigger"
      className={menuItemClass({ size, inset, className: cn("data-[state=open]:bg-hover", className) })}
      {...props}
    >
      <MenuItemContent icon={icon} chevron>
        {children}
      </MenuItemContent>
    </DropdownMenuPrimitive.SubTrigger>
  );
});

/** A submenu panel. It is one layer deeper, so it is opaque in glass mode. */
export const DropdownMenuSubContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> & { size?: "sm" | "md" }>(
  function DropdownMenuSubContent({ className, size: sizeProp, sideOffset = 4, collisionPadding = 12, ...props }, ref) {
    const container = usePortalContainer();
    const parentSize = React.useContext(MenuSizeContext);
    const size = sizeProp ?? parentSize;
    return (
      <DropdownMenuPrimitive.Portal container={container}>
        <Layer asChild>
          <DropdownMenuPrimitive.SubContent
            ref={ref}
            data-slot="dropdown-menu-sub-content"
            sideOffset={sideOffset}
            alignOffset={-5}
            collisionPadding={collisionPadding}
            className={cn(menuContentVariants({ size }), "max-h-(--radix-dropdown-menu-content-available-height)", className)}
            {...props}
          />
        </Layer>
      </DropdownMenuPrimitive.Portal>
    );
  },
);

/* ------------------------------------------------------------------ */
/* Data-driven                                                         */
/* ------------------------------------------------------------------ */

const dropdownParts: MenuParts = {
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Group: DropdownMenuGroup,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
};

/** Renders `MenuEntry[]` as dropdown items (use inside your own `DropdownMenuContent`). */
export function DropdownMenuEntries({ items }: { items: MenuEntry[] }) {
  const visible = useVisibleEntries(items);
  return <MenuEntries entries={visible} parts={dropdownParts} />;
}

const actionMenuLabels = { trigger: "More actions" };
export type ActionMenuLabels = typeof actionMenuLabels;

export interface ActionMenuProps extends Omit<DropdownMenuContentProps, "children"> {
  /** The menu model, shared with Context Menu and Command. Entries with a failing `permission` are hidden. */
  items: MenuEntry[];
  /** Custom trigger element (rendered with `asChild`). Default: a "⋯" IconButton. */
  trigger?: React.ReactElement;
  /** Accessible name of the default trigger. Default "More actions". */
  triggerLabel?: string;
  /** Size of the default trigger. Default `"sm"`. */
  triggerSize?: "xs" | "sm" | "md";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Non-modal: the page stays scrollable and interactive while open. Default `true` (modal). */
  modal?: boolean;
  labels?: Partial<ActionMenuLabels>;
}

/**
 * A one-line menu from data — the "⋯" in a table row, card or toolbar.
 *
 * ```tsx
 * <ActionMenu items={[
 *   { id: "edit", label: "Edit", icon: <Pencil />, shortcut: "mod+e", onSelect: edit },
 *   { type: "separator" },
 *   { id: "trash", label: "Move to trash", icon: <Trash2 />, tone: "danger", onSelect: trash },
 * ]} />
 * ```
 */
export function ActionMenu({ items, trigger, triggerLabel, triggerSize = "sm", open, defaultOpen, onOpenChange, modal, labels, align = "end", ...contentProps }: ActionMenuProps) {
  const t = useLabels("actionMenu", actionMenuLabels, labels);
  const visible = useVisibleEntries(items);
  if (visible.length === 0) return null;
  return (
    <DropdownMenu open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <IconButton label={triggerLabel ?? t("trigger")} size={triggerSize} tooltip={false}>
            <MoreHorizontal />
          </IconButton>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} {...contentProps}>
        <MenuEntries entries={visible} parts={dropdownParts} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
