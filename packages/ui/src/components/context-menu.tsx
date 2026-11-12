"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "radix-ui/context-menu";
import { cn } from "../lib/cn";
import { usePortalContainer } from "../lib/theme-scope";
import { Layer } from "../lib/layer";
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

export const ContextMenuRoot = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export const ContextMenuGroup = ContextMenuPrimitive.Group;
export const ContextMenuSub = ContextMenuPrimitive.Sub;
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export interface ContextMenuContentProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content> {
  /** Minimum width: `sm` 180px, `md` 220px. Item size follows. */
  size?: "sm" | "md";
}

/** The menu panel, opened at the pointer. Portals into the nearest `ThemeScope`. */
export const ContextMenuContent = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Content>, ContextMenuContentProps>(function ContextMenuContent(
  { className, size = "md", collisionPadding = 12, ...props },
  ref,
) {
  const container = usePortalContainer();
  return (
    <ContextMenuPrimitive.Portal container={container}>
      <MenuSizeContext.Provider value={size}>
        <Layer asChild>
          <ContextMenuPrimitive.Content
            ref={ref}
            data-slot="context-menu-content"
            collisionPadding={collisionPadding}
            className={cn(menuContentVariants({ size }), "max-h-(--radix-context-menu-content-available-height)", className)}
            {...props}
          />
        </Layer>
      </MenuSizeContext.Provider>
    </ContextMenuPrimitive.Portal>
  );
});

/* ------------------------------------------------------------------ */
/* Items                                                               */
/* ------------------------------------------------------------------ */

export interface ContextMenuItemProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> {
  icon?: React.ReactNode;
  description?: React.ReactNode;
  /** Shortcut hint, e.g. `"mod+d"` (rendered with Kbd). Display only. */
  shortcut?: string | string[];
  badge?: React.ReactNode;
  tone?: "default" | "danger";
  inset?: boolean;
}

/** One action. Same API as `DropdownMenuItem`. */
export const ContextMenuItem = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Item>, ContextMenuItemProps>(function ContextMenuItem(
  { className, icon, description, shortcut, badge, tone = "default", inset, asChild, children, ...props },
  ref,
) {
  const size = React.useContext(MenuSizeContext);
  return (
    <ContextMenuPrimitive.Item ref={ref} data-slot="context-menu-item" data-tone={tone} asChild={asChild} className={menuItemClass({ size, tone, inset, className })} {...props}>
      {asChild ? (
        children
      ) : (
        <MenuItemContent icon={icon} description={description} shortcut={shortcut} badge={badge}>
          {children}
        </MenuItemContent>
      )}
    </ContextMenuPrimitive.Item>
  );
});

export interface ContextMenuCheckboxItemProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem> {
  shortcut?: string | string[];
  description?: React.ReactNode;
}

export const ContextMenuCheckboxItem = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>, ContextMenuCheckboxItemProps>(function ContextMenuCheckboxItem(
  { className, shortcut, description, children, ...props },
  ref,
) {
  const size = React.useContext(MenuSizeContext);
  return (
    <ContextMenuPrimitive.CheckboxItem ref={ref} data-slot="context-menu-checkbox-item" className={menuItemClass({ size, inset: true, className })} {...props}>
      <span className={menuIndicatorClass}>
        <ContextMenuPrimitive.ItemIndicator>
          <MenuCheckIcon />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      <MenuItemContent shortcut={shortcut} description={description}>
        {children}
      </MenuItemContent>
    </ContextMenuPrimitive.CheckboxItem>
  );
});

export interface ContextMenuRadioItemProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem> {
  shortcut?: string | string[];
  description?: React.ReactNode;
}

export const ContextMenuRadioItem = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.RadioItem>, ContextMenuRadioItemProps>(function ContextMenuRadioItem(
  { className, shortcut, description, children, ...props },
  ref,
) {
  const size = React.useContext(MenuSizeContext);
  return (
    <ContextMenuPrimitive.RadioItem ref={ref} data-slot="context-menu-radio-item" className={menuItemClass({ size, inset: true, className })} {...props}>
      <span className={menuIndicatorClass}>
        <ContextMenuPrimitive.ItemIndicator>
          <MenuRadioDot />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      <MenuItemContent shortcut={shortcut} description={description}>
        {children}
      </MenuItemContent>
    </ContextMenuPrimitive.RadioItem>
  );
});

export const ContextMenuLabel = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Label>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & { inset?: boolean }>(
  function ContextMenuLabel({ className, inset, ...props }, ref) {
    return <ContextMenuPrimitive.Label ref={ref} data-slot="context-menu-label" className={cn(menuLabelClass, inset && "ps-8", className)} {...props} />;
  },
);

export const ContextMenuSeparator = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>>(
  function ContextMenuSeparator({ className, ...props }, ref) {
    return <ContextMenuPrimitive.Separator ref={ref} data-slot="context-menu-separator" className={cn(menuSeparatorClass, className)} {...props} />;
  },
);

export interface ContextMenuSubTriggerProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> {
  icon?: React.ReactNode;
  inset?: boolean;
}

export const ContextMenuSubTrigger = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>, ContextMenuSubTriggerProps>(function ContextMenuSubTrigger(
  { className, icon, inset, children, ...props },
  ref,
) {
  const size = React.useContext(MenuSizeContext);
  return (
    <ContextMenuPrimitive.SubTrigger
      ref={ref}
      data-slot="context-menu-sub-trigger"
      className={menuItemClass({ size, inset, className: cn("data-[state=open]:bg-hover", className) })}
      {...props}
    >
      <MenuItemContent icon={icon} chevron>
        {children}
      </MenuItemContent>
    </ContextMenuPrimitive.SubTrigger>
  );
});

export const ContextMenuSubContent = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent> & { size?: "sm" | "md" }>(
  function ContextMenuSubContent({ className, size: sizeProp, sideOffset = 4, collisionPadding = 12, ...props }, ref) {
    const container = usePortalContainer();
    const parentSize = React.useContext(MenuSizeContext);
    const size = sizeProp ?? parentSize;
    return (
      <ContextMenuPrimitive.Portal container={container}>
        <Layer asChild>
          <ContextMenuPrimitive.SubContent
            ref={ref}
            data-slot="context-menu-sub-content"
            sideOffset={sideOffset}
            alignOffset={-5}
            collisionPadding={collisionPadding}
            className={cn(menuContentVariants({ size }), "max-h-(--radix-context-menu-content-available-height)", className)}
            {...props}
          />
        </Layer>
      </ContextMenuPrimitive.Portal>
    );
  },
);

/* ------------------------------------------------------------------ */
/* Data-driven root                                                    */
/* ------------------------------------------------------------------ */

const contextParts: MenuParts = {
  Item: ContextMenuItem,
  CheckboxItem: ContextMenuCheckboxItem,
  RadioGroup: ContextMenuRadioGroup,
  RadioItem: ContextMenuRadioItem,
  Label: ContextMenuLabel,
  Separator: ContextMenuSeparator,
  Group: ContextMenuGroup,
  Sub: ContextMenuSub,
  SubTrigger: ContextMenuSubTrigger,
  SubContent: ContextMenuSubContent,
};

/** Renders `MenuEntry[]` as context-menu items (use inside your own `ContextMenuContent`). */
export function ContextMenuEntries({ items }: { items: MenuEntry[] }) {
  const visible = useVisibleEntries(items);
  return <MenuEntries entries={visible} parts={contextParts} />;
}

export interface ContextMenuProps extends Omit<React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Root>, "children"> {
  /**
   * Data-driven mode: the menu model (shared with `ActionMenu`). `children` is then the area
   * that opens it on right-click / long-press / Shift+F10.
   * Without `items`, `ContextMenu` is the compound root: put `ContextMenuTrigger` + `ContextMenuContent` inside.
   */
  items?: MenuEntry[];
  children: React.ReactNode;
  /** Let the native browser menu through (no custom menu). */
  disabled?: boolean;
  /** Content size in data-driven mode. */
  size?: "sm" | "md";
  /** Extra props for the content in data-driven mode. */
  contentProps?: Omit<ContextMenuContentProps, "children">;
}

/**
 * A right-click menu. Never the only way to an action: give every entry a keyboard/touch path too,
 * e.g. the same `MenuEntry[]` in the row's `ActionMenu`.
 *
 * ```tsx
 * <ContextMenu items={fileActions}>
 *   <FileTile file={file} />
 * </ContextMenu>
 * ```
 */
export function ContextMenu({ items, children, disabled, size, contentProps, ...rootProps }: ContextMenuProps) {
  if (!items) return <ContextMenuPrimitive.Root {...rootProps}>{children}</ContextMenuPrimitive.Root>;
  return (
    <ContextMenuPrimitive.Root {...rootProps}>
      <ContextMenuPrimitive.Trigger asChild disabled={disabled}>
        {children}
      </ContextMenuPrimitive.Trigger>
      <ContextMenuContent size={size} {...contentProps}>
        <ContextMenuEntries items={items} />
      </ContextMenuContent>
    </ContextMenuPrimitive.Root>
  );
}
