"use client";

import * as React from "react";
import * as MenubarPrimitive from "radix-ui/menubar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { usePortalContainer } from "../lib/theme-scope";
import { Layer } from "../lib/layer";
import type { MenuEntry } from "../lib/variants";
import { useCan } from "../lib/provider";
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

/* ------------------------------------------------------------------ */
/* Bar                                                                 */
/* ------------------------------------------------------------------ */

export const menubarVariants = /*#__PURE__*/ cva("flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]", {
  variants: {
    variant: {
      /** A hairline surface strip — the top of an editor or a desktop-style app window. */
      bar: "surface rounded-ui-lg p-1",
      /** No chrome: sits inside a Top bar, toolbar or window header. */
      ghost: "",
    },
  },
  defaultVariants: { variant: "bar" },
});

/** One top-level menu in the data-driven form. */
export interface MenubarMenuEntry {
  id: string;
  /** Trigger text ("File", "Edit", "View"…). */
  label: React.ReactNode;
  /** The menu's entries — the same `MenuEntry` model as Dropdown Menu, Context Menu and Command. */
  items: MenuEntry[];
  disabled?: boolean;
  /** Hidden unless `can(permission)` is true (see `useCan`). */
  permission?: string;
}

export interface MenubarProps extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>, VariantProps<typeof menubarVariants> {
  /** Data-driven menus. Rendered before `children`. */
  menus?: MenubarMenuEntry[];
  /** Minimum panel width of every menu: `sm` 180px, `md` 220px. Default `md`. */
  size?: "sm" | "md";
}

/**
 * A desktop-app menu bar (WAI-ARIA `menubar`): File / Edit / View… One tab stop; ← → move between
 * menus (and keep the open one open), ↓ / Enter / Space open, Esc closes, typeahead inside a menu.
 *
 * ```tsx
 * <Menubar aria-label="Editor" menus={[
 *   { id: "file", label: "File", items: [{ id: "new", label: "New document", shortcut: "mod+n", onSelect: create }] },
 * ]} />
 * ```
 */
export const Menubar = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Root>, MenubarProps>(function Menubar(
  { className, variant, menus, size = "md", children, loop = true, ...props },
  ref,
) {
  return (
    <MenuSizeContext.Provider value={size}>
      <MenubarPrimitive.Root ref={ref} data-slot="menubar" data-variant={variant ?? "bar"} loop={loop} className={cn(menubarVariants({ variant }), className)} {...props}>
        {menus ? <MenubarMenus menus={menus} /> : null}
        {children}
      </MenubarPrimitive.Root>
    </MenuSizeContext.Provider>
  );
});

/** One menu: a `MenubarTrigger` plus its `MenubarContent`. `value` is needed only for a controlled bar. */
export const MenubarMenu: typeof MenubarPrimitive.Menu = MenubarPrimitive.Menu;
export const MenubarGroup = MenubarPrimitive.Group;
export const MenubarSub = MenubarPrimitive.Sub;
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

/** The top-level button ("File"). */
export const MenubarTrigger = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>>(
  function MenubarTrigger({ className, ...props }, ref) {
    return (
      <MenubarPrimitive.Trigger
        ref={ref}
        data-slot="menubar-trigger"
        className={cn(
          "inline-flex h-[calc(var(--control-h)-0.5rem)] shrink-0 cursor-default select-none items-center gap-1.5 rounded-ui-sm px-2.5 text-[13px] font-medium text-fg outline-none",
          "transition-colors duration-100 hover:bg-hover focus-visible:bg-hover focus-ring",
          "data-highlighted:bg-hover data-[state=open]:bg-selected",
          "disabled:pointer-events-none disabled:opacity-45 data-disabled:pointer-events-none data-disabled:opacity-45",
          "[&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-fg-muted",
          className,
        )}
        {...props}
      />
    );
  },
);

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export interface MenubarContentProps extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content> {
  /** Overrides the bar's `size` for this menu. */
  size?: "sm" | "md";
}

/** A menu panel under its trigger. Portals into the nearest `ThemeScope`; only this first layer blurs in glass mode. */
export const MenubarContent = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Content>, MenubarContentProps>(function MenubarContent(
  { className, size: sizeProp, sideOffset = 6, alignOffset = -4, collisionPadding = 12, align = "start", ...props },
  ref,
) {
  const container = usePortalContainer();
  const barSize = React.useContext(MenuSizeContext);
  const size = sizeProp ?? barSize;
  return (
    <MenubarPrimitive.Portal container={container}>
      <MenuSizeContext.Provider value={size}>
        <Layer asChild>
          <MenubarPrimitive.Content
            ref={ref}
            data-slot="menubar-content"
            sideOffset={sideOffset}
            alignOffset={alignOffset}
            collisionPadding={collisionPadding}
            align={align}
            className={cn(
              menuContentVariants({ size }),
              "max-h-(--radix-menubar-content-available-height) origin-(--radix-menubar-content-transform-origin)",
              className,
            )}
            {...props}
          />
        </Layer>
      </MenuSizeContext.Provider>
    </MenubarPrimitive.Portal>
  );
});

/* ------------------------------------------------------------------ */
/* Items                                                               */
/* ------------------------------------------------------------------ */

export interface MenubarItemProps extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> {
  icon?: React.ReactNode;
  description?: React.ReactNode;
  /** Shortcut hint, e.g. `"mod+s"` (rendered with Kbd). Display only — bind it with `useHotkeys`. */
  shortcut?: string | string[];
  badge?: React.ReactNode;
  tone?: "default" | "danger";
  /** Reserve the indicator gutter so labels align with checkbox/radio items. */
  inset?: boolean;
}

/** One command. `onSelect` fires on click, Enter and Space, then the menu closes (`event.preventDefault()` keeps it open). */
export const MenubarItem = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Item>, MenubarItemProps>(function MenubarItem(
  { className, icon, description, shortcut, badge, tone = "default", inset, asChild, children, ...props },
  ref,
) {
  const size = React.useContext(MenuSizeContext);
  return (
    <MenubarPrimitive.Item ref={ref} data-slot="menubar-item" data-tone={tone} asChild={asChild} className={menuItemClass({ size, tone, inset, className })} {...props}>
      {asChild ? (
        children
      ) : (
        <MenuItemContent icon={icon} description={description} shortcut={shortcut} badge={badge}>
          {children}
        </MenuItemContent>
      )}
    </MenubarPrimitive.Item>
  );
});

export interface MenubarCheckboxItemProps extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem> {
  shortcut?: string | string[];
  description?: React.ReactNode;
}

/** A toggle (`menuitemcheckbox`) — "Show ruler", "Word wrap". */
export const MenubarCheckboxItem = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof MenubarPrimitive.CheckboxItem>, MenubarCheckboxItemProps>(function MenubarCheckboxItem(
  { className, shortcut, description, children, ...props },
  ref,
) {
  const size = React.useContext(MenuSizeContext);
  return (
    <MenubarPrimitive.CheckboxItem ref={ref} data-slot="menubar-checkbox-item" className={menuItemClass({ size, inset: true, className })} {...props}>
      <span className={menuIndicatorClass}>
        <MenubarPrimitive.ItemIndicator>
          <MenuCheckIcon />
        </MenubarPrimitive.ItemIndicator>
      </span>
      <MenuItemContent shortcut={shortcut} description={description}>
        {children}
      </MenuItemContent>
    </MenubarPrimitive.CheckboxItem>
  );
});

export interface MenubarRadioItemProps extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem> {
  shortcut?: string | string[];
  description?: React.ReactNode;
}

/** One choice inside a `MenubarRadioGroup` (`menuitemradio`) — zoom level, sort order. */
export const MenubarRadioItem = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof MenubarPrimitive.RadioItem>, MenubarRadioItemProps>(function MenubarRadioItem(
  { className, shortcut, description, children, ...props },
  ref,
) {
  const size = React.useContext(MenuSizeContext);
  return (
    <MenubarPrimitive.RadioItem ref={ref} data-slot="menubar-radio-item" className={menuItemClass({ size, inset: true, className })} {...props}>
      <span className={menuIndicatorClass}>
        <MenubarPrimitive.ItemIndicator>
          <MenuRadioDot />
        </MenubarPrimitive.ItemIndicator>
      </span>
      <MenuItemContent shortcut={shortcut} description={description}>
        {children}
      </MenuItemContent>
    </MenubarPrimitive.RadioItem>
  );
});

export const MenubarLabel = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Label>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & { inset?: boolean }>(
  function MenubarLabel({ className, inset, ...props }, ref) {
    return <MenubarPrimitive.Label ref={ref} data-slot="menubar-label" className={cn(menuLabelClass, inset && "ps-8", className)} {...props} />;
  },
);

export const MenubarSeparator = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>>(
  function MenubarSeparator({ className, ...props }, ref) {
    return <MenubarPrimitive.Separator ref={ref} data-slot="menubar-separator" className={cn(menuSeparatorClass, className)} {...props} />;
  },
);

/** Trailing text hint (when you don't want keycaps). */
export function MenubarShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span data-slot="menubar-shortcut" className={cn("ms-auto ps-4 font-mono text-[11px] tracking-wide text-fg-subtle", className)} {...props} />;
}

export interface MenubarSubTriggerProps extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> {
  icon?: React.ReactNode;
  inset?: boolean;
}

/** Opens a submenu on hover, Enter, Space or → (← in RTL). */
export const MenubarSubTrigger = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof MenubarPrimitive.SubTrigger>, MenubarSubTriggerProps>(function MenubarSubTrigger(
  { className, icon, inset, children, ...props },
  ref,
) {
  const size = React.useContext(MenuSizeContext);
  return (
    <MenubarPrimitive.SubTrigger
      ref={ref}
      data-slot="menubar-sub-trigger"
      className={menuItemClass({ size, inset, className: cn("data-[state=open]:bg-hover", className) })}
      {...props}
    >
      <MenuItemContent icon={icon} chevron>
        {children}
      </MenuItemContent>
    </MenubarPrimitive.SubTrigger>
  );
});

/** A submenu panel. One layer deeper, so it is opaque in glass mode. */
export const MenubarSubContent = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof MenubarPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent> & { size?: "sm" | "md" }>(
  function MenubarSubContent({ className, size: sizeProp, sideOffset = 4, alignOffset = -5, collisionPadding = 12, ...props }, ref) {
    const container = usePortalContainer();
    const parentSize = React.useContext(MenuSizeContext);
    const size = sizeProp ?? parentSize;
    return (
      <MenubarPrimitive.Portal container={container}>
        <Layer asChild>
          <MenubarPrimitive.SubContent
            ref={ref}
            data-slot="menubar-sub-content"
            sideOffset={sideOffset}
            alignOffset={alignOffset}
            collisionPadding={collisionPadding}
            className={cn(menuContentVariants({ size }), "max-h-(--radix-menubar-content-available-height)", className)}
            {...props}
          />
        </Layer>
      </MenubarPrimitive.Portal>
    );
  },
);

/* ------------------------------------------------------------------ */
/* Data-driven                                                         */
/* ------------------------------------------------------------------ */

const menubarParts: MenuParts = {
  Item: MenubarItem,
  CheckboxItem: MenubarCheckboxItem,
  RadioGroup: MenubarRadioGroup,
  RadioItem: MenubarRadioItem,
  Label: MenubarLabel,
  Separator: MenubarSeparator,
  Group: MenubarGroup,
  Sub: MenubarSub,
  SubTrigger: MenubarSubTrigger,
  SubContent: MenubarSubContent,
};

/** Renders `MenuEntry[]` as menubar items (inside your own `MenubarContent`). */
export function MenubarEntries({ items }: { items: MenuEntry[] }) {
  const visible = useVisibleEntries(items);
  return <MenuEntries entries={visible} parts={menubarParts} />;
}

function MenubarDataMenu({ menu }: { menu: MenubarMenuEntry }) {
  const visible = useVisibleEntries(menu.items);
  if (visible.length === 0) return null;
  return (
    <MenubarMenu value={menu.id}>
      <MenubarTrigger disabled={menu.disabled}>{menu.label}</MenubarTrigger>
      <MenubarContent>
        <MenuEntries entries={visible} parts={menubarParts} />
      </MenubarContent>
    </MenubarMenu>
  );
}

/** Renders `MenubarMenuEntry[]` (what `Menubar menus` uses). Menus with no visible entries are dropped. */
export function MenubarMenus({ menus }: { menus: MenubarMenuEntry[] }) {
  const can = useCan();
  return (
    <>
      {menus
        .filter((m) => !m.permission || can(m.permission))
        .map((m) => (
          <MenubarDataMenu key={m.id} menu={m} />
        ))}
    </>
  );
}
