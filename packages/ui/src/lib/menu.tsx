"use client";

/**
 * Shared internals of Dropdown Menu and Context Menu: classes, the item's inner layout and the
 * `MenuEntry[]` renderer. Both menus build their parts from these, so they look and behave alike.
 */
import * as React from "react";
import { cva } from "class-variance-authority";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "./cn";
import { itemSlots, itemVariants, type MenuEntry } from "./variants";
import { useCan, useLink } from "./provider";
import { KbdGroup } from "../components/kbd";

/** Floating panel of a menu (root content and sub-content). */
export const menuContentVariants = /*#__PURE__*/ cva(
  [
    "surface-popover ui-pop z-(--z-popover) rounded-ui-lg p-1 outline-none",
    "overflow-x-hidden overflow-y-auto overscroll-contain",
  ],
  {
    variants: {
      size: {
        sm: "min-w-[180px] max-w-[min(20rem,calc(100vw-1.5rem))]",
        md: "min-w-[220px] max-w-[min(24rem,calc(100vw-1.5rem))]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/** Menu items are `--control-h × 0.8` tall, so they follow the density axis. */
export function menuItemClass(opts: { size?: "sm" | "md"; tone?: "default" | "danger"; inset?: boolean; className?: string }) {
  return cn(
    itemVariants({ size: opts.size ?? "md", tone: opts.tone ?? "default", inset: opts.inset }),
    "min-h-[calc(var(--control-h)*0.8)]",
    opts.size === "sm" && "min-h-[calc(var(--control-h)*0.7)]",
    opts.className,
  );
}

export const menuLabelClass = itemSlots.groupLabel;
export const menuSeparatorClass = itemSlots.separator;
export const menuIndicatorClass = itemSlots.indicator;

/** Size context so items pick up the content's `size`. */
export const MenuSizeContext = /*#__PURE__*/ React.createContext<"sm" | "md">("md");

export interface MenuItemContentProps {
  icon?: React.ReactNode;
  description?: React.ReactNode;
  /** `"mod+shift+d"` or `["mod", "d"]`. */
  shortcut?: string | string[];
  /** Trailing count or badge. */
  badge?: React.ReactNode;
  children?: React.ReactNode;
  /** Trailing chevron for sub-triggers. */
  chevron?: boolean;
}

/** Icon · label (+ description) · badge · shortcut · chevron. */
export function MenuItemContent({ icon, description, shortcut, badge, chevron, children }: MenuItemContentProps) {
  return (
    <>
      {icon ? (
        <span aria-hidden className={cn("flex shrink-0 items-center", description ? "self-start pt-px" : undefined)}>
          {icon}
        </span>
      ) : null}
      <span className={itemSlots.label}>
        {children}
        {description ? <span className={cn(itemSlots.description, "mt-0.5 whitespace-normal")}>{description}</span> : null}
      </span>
      {badge != null ? <span className="ms-auto shrink-0 ps-3 text-xs tabular text-fg-subtle">{badge}</span> : null}
      {shortcut ? <KbdGroup keys={shortcut} size="sm" variant="ghost" className={cn("shrink-0 ps-4", badge == null && "ms-auto")} /> : null}
      {chevron ? <ChevronRight aria-hidden className={cn("ms-auto size-3.5! shrink-0 text-fg-subtle rtl:-scale-x-100", (shortcut || badge != null) && "ms-2")} /> : null}
    </>
  );
}

export function MenuCheckIcon() {
  return <Check className="size-3.5! text-fg!" strokeWidth={2.5} />;
}
export function MenuRadioDot() {
  return <span className="size-1.5 rounded-full bg-fg" />;
}

/** The styled parts a menu provides to the entry renderer. */
export interface MenuParts {
  Item: React.ComponentType<any>;
  CheckboxItem: React.ComponentType<any>;
  RadioGroup: React.ComponentType<any>;
  RadioItem: React.ComponentType<any>;
  Label: React.ComponentType<any>;
  Separator: React.ComponentType<any>;
  Group: React.ComponentType<any>;
  Sub: React.ComponentType<any>;
  SubTrigger: React.ComponentType<any>;
  SubContent: React.ComponentType<any>;
}

/** Drops entries the user can't access, then leading/trailing/doubled separators. */
export function useVisibleEntries(entries: MenuEntry[]): MenuEntry[] {
  const can = useCan();
  return React.useMemo(() => cleanEntries(entries, can), [entries, can]);
}

export function cleanEntries(entries: MenuEntry[], can: (p: string) => boolean): MenuEntry[] {
  const allowed = entries.filter((e) => !("permission" in e && e.permission) || can((e as { permission: string }).permission));
  const out: MenuEntry[] = [];
  for (const e of allowed) {
    if (e.type === "separator" && (out.length === 0 || out[out.length - 1]!.type === "separator")) continue;
    if (e.type === "submenu" || e.type === "group") {
      const items = cleanEntries(e.items, can);
      if (items.length === 0) continue;
      out.push({ ...e, items });
      continue;
    }
    out.push(e);
  }
  while (out.length && out[out.length - 1]!.type === "separator") out.pop();
  return out;
}

const keyOf = (e: MenuEntry, i: number) => ("id" in e && e.id ? e.id : `${e.type ?? "item"}-${i}`);

/** Renders a `MenuEntry[]` with the given parts. Call `useVisibleEntries` first. */
export function MenuEntries({ entries, parts }: { entries: MenuEntry[]; parts: MenuParts }) {
  const Link = useLink();
  const P = parts;
  return (
    <>
      {entries.map((e, i) => {
        const key = keyOf(e, i);
        switch (e.type) {
          case "separator":
            return <P.Separator key={key} />;
          case "label":
            return <P.Label key={key}>{e.label}</P.Label>;
          case "group":
            return (
              <P.Group key={key}>
                {e.label ? <P.Label>{e.label}</P.Label> : null}
                <MenuEntries entries={e.items} parts={parts} />
              </P.Group>
            );
          case "checkbox":
            return (
              <P.CheckboxItem key={key} checked={e.checked} onCheckedChange={e.onCheckedChange} disabled={e.disabled} textValue={e.textValue} shortcut={e.shortcut}>
                {e.label}
              </P.CheckboxItem>
            );
          case "radio":
            return (
              <P.Group key={key}>
                {e.label ? <P.Label>{e.label}</P.Label> : null}
                <P.RadioGroup value={e.value} onValueChange={e.onValueChange}>
                  {e.options.map((o) => (
                    <P.RadioItem key={o.value} value={o.value} disabled={o.disabled || e.disabled} textValue={o.textValue}>
                      {o.label}
                    </P.RadioItem>
                  ))}
                </P.RadioGroup>
              </P.Group>
            );
          case "submenu":
            return (
              <P.Sub key={key}>
                <P.SubTrigger icon={e.icon} disabled={e.disabled} textValue={e.textValue}>
                  {e.label}
                </P.SubTrigger>
                <P.SubContent>
                  <MenuEntries entries={e.items} parts={parts} />
                </P.SubContent>
              </P.Sub>
            );
          default: {
            const content = (
              <MenuItemContent icon={e.icon} description={e.description} shortcut={e.shortcut} badge={e.badge}>
                {e.label}
              </MenuItemContent>
            );
            if (e.href) {
              return (
                <P.Item key={key} asChild tone={e.tone} disabled={e.disabled} textValue={e.textValue} onSelect={e.onSelect}>
                  <Link href={e.href}>{content}</Link>
                </P.Item>
              );
            }
            return (
              <P.Item key={key} tone={e.tone} disabled={e.disabled} textValue={e.textValue} onSelect={e.onSelect} icon={e.icon} description={e.description} shortcut={e.shortcut} badge={e.badge}>
                {e.label}
              </P.Item>
            );
          }
        }
      })}
    </>
  );
}
