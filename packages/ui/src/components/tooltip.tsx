"use client";

import * as React from "react";
import * as Slot from "radix-ui/slot";
import * as TooltipPrimitive from "radix-ui/tooltip";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { usePortalContainer } from "../lib/theme-scope";
import { FloatingArrow } from "../lib/floating-arrow";
import { KbdGroup } from "./kbd";

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

const TooltipProviderContext = /*#__PURE__*/ React.createContext(false);

/** `true` when a `TooltipProvider` is above this point (IconButton switches from `title` to Tooltip). */
export function useHasTooltipProvider(): boolean {
  return React.useContext(TooltipProviderContext);
}

export interface TooltipProviderProps extends React.ComponentProps<typeof TooltipPrimitive.Provider> {}

/**
 * Shares open/skip timing between every tooltip below it: once one tooltip has opened, moving
 * to the next opens it instantly. Put one at the app root (App shell ships it).
 * Inside a provider, `IconButton` shows its `label` as a Tooltip instead of the native `title`.
 */
export function TooltipProvider({ delayDuration = 400, skipDelayDuration = 300, ...props }: TooltipProviderProps) {
  return (
    <TooltipProviderContext.Provider value={true}>
      <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration} {...props} />
    </TooltipProviderContext.Provider>
  );
}

/** Wraps in a provider only when none is present (Radix requires one). */
function EnsureProvider({ children }: { children: React.ReactNode }) {
  return useHasTooltipProvider() ? <>{children}</> : <TooltipProvider>{children}</TooltipProvider>;
}

/* ------------------------------------------------------------------ */
/* Compound parts                                                      */
/* ------------------------------------------------------------------ */

export interface TooltipRootProps extends React.ComponentProps<typeof TooltipPrimitive.Root> {}

/** Compound root. Works with or without a surrounding `TooltipProvider`. */
export function TooltipRoot(props: TooltipRootProps) {
  return (
    <EnsureProvider>
      <TooltipPrimitive.Root {...props} />
    </EnsureProvider>
  );
}

export const TooltipTrigger = TooltipPrimitive.Trigger;

export const tooltipContentVariants = /*#__PURE__*/ cva(
  [
    "ui-pop z-(--z-tooltip) max-w-[min(18rem,calc(100vw-1.5rem))] select-none rounded-ui-sm px-2 py-1 text-[12.5px] leading-snug font-medium",
    // tooltips never blur — they open and close too often to spend the glass budget on
    "[--blur:0px] backdrop-filter-none",
    // Close instantly: while a tooltip animates out it stays the top dismissable layer, so an Esc
    // pressed just after tabbing past an IconButton closed the tooltip instead of the dialog.
    "data-[state=closed]:animate-none",
    "flex items-center gap-2 text-balance",
  ],
  {
    variants: {
      tone: {
        /** Opaque, high-contrast chip. Stays readable on glass. */
        inverted: "bg-fg text-scene shadow-[0_4px_14px_-4px_rgb(0_0_0/0.35)]",
        /** Floating-layer look, for longer hints. */
        default: "border border-popover-border bg-popover-nested text-fg shadow-(--popover-shadow)",
      },
    },
    defaultVariants: { tone: "inverted" },
  },
);

export interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>, VariantProps<typeof tooltipContentVariants> {
  /** Show the pointer arrow. Default `false`. */
  arrow?: boolean;
  /** Shortcut hint after the text, e.g. `"mod+e"` or `["mod", "e"]` (rendered with Kbd). */
  shortcut?: string | string[];
}

export const TooltipContent = /*#__PURE__*/ React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, TooltipContentProps>(function TooltipContent(
  { className, tone, arrow = false, shortcut, sideOffset = 6, collisionPadding = 8, children, ...props },
  ref,
) {
  const container = usePortalContainer();
  const inverted = (tone ?? "inverted") === "inverted";
  return (
    <TooltipPrimitive.Portal container={container}>
      <TooltipPrimitive.Content
        ref={ref}
        data-slot="tooltip-content"
        data-tone={tone ?? "inverted"}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(tooltipContentVariants({ tone }), className)}
        {...props}
      >
        <span className="min-w-0">{children}</span>
        {shortcut ? (
          <KbdGroup
            keys={shortcut}
            size="sm"
            variant="ghost"
            className={cn("-me-0.5", inverted && "[&_kbd_kbd]:border-[color-mix(in_srgb,var(--scene)_28%,transparent)] [&_kbd_kbd]:text-[color-mix(in_srgb,var(--scene)_78%,transparent)]")}
          />
        ) : null}
        {arrow ? (
          <TooltipPrimitive.Arrow asChild width={10} height={5}>
            <FloatingArrow width={10} height={5} fill={inverted ? "var(--fg)" : "var(--popover-nested)"} stroke={inverted ? "none" : "var(--popover-border)"} />
          </TooltipPrimitive.Arrow>
        ) : null}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});

/* ------------------------------------------------------------------ */
/* Simple API                                                          */
/* ------------------------------------------------------------------ */

export interface TooltipProps extends Omit<TooltipContentProps, "content" | "children"> {
  /** Tooltip text. Empty / `null` renders the trigger without a tooltip. */
  content: React.ReactNode;
  /** The trigger. Rendered with `asChild`, so it must accept a ref (Button, IconButton, `<a>`…). */
  children: React.ReactElement;
  /** Open delay in ms (overrides the provider's 400 ms). */
  delay?: number;
  /** Render the trigger without a tooltip. */
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function isDisabledElement(el: React.ReactElement): boolean {
  // A child rendered by a server component reaches this client component as a lazy reference
  // without `props` in production (RSC), so this can only be a hint; see the DOM check below.
  const p = (el as { props?: { disabled?: boolean } } | null)?.props;
  return p?.disabled === true;
}

/**
 * A short label for an icon button or abbreviation. Opens on hover and focus, closes on Esc.
 * Never shown on touch screens, so it can't be the only place a piece of information lives.
 *
 * ```tsx
 * <Tooltip content="Edit post" shortcut="mod+e">
 *   <IconButton label="Edit post"><Pencil /></IconButton>
 * </Tooltip>
 * ```
 *
 * A disabled button fires no pointer events, so a disabled child is wrapped in a focusable
 * `<span>` automatically — use it to explain *why* the action is unavailable.
 */
export function Tooltip({ content, children, delay, disabled, open, defaultOpen, onOpenChange, ...contentProps }: TooltipProps) {
  // When the child's props are not readable (server-rendered child), detect a disabled trigger
  // from the DOM after mount and switch to the focusable wrapper.
  const triggerRef = React.useRef<HTMLElement>(null);
  const [domDisabled, setDomDisabled] = React.useState(false);
  const off = disabled || content == null || content === false || content === "";
  React.useEffect(() => {
    const el = triggerRef.current;
    if (!off && el && el.dataset.slot !== "tooltip-disabled-trigger" && el.matches(":disabled")) setDomDisabled(true);
  }, [off]);
  if (off) return children;
  const trigger = isDisabledElement(children) || domDisabled ? (
    // tabIndex keeps the explanation reachable from the keyboard
    <span data-slot="tooltip-disabled-trigger" tabIndex={0} className="inline-flex cursor-not-allowed rounded-ui focus-ring">
      {children}
    </span>
  ) : (
    children
  );
  return (
    <TooltipRoot delayDuration={delay} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <TooltipPrimitive.Trigger ref={triggerRef as React.Ref<HTMLButtonElement>} asChild>{trigger}</TooltipPrimitive.Trigger>
      <TooltipContent {...contentProps}>{content}</TooltipContent>
    </TooltipRoot>
  );
}

/* ------------------------------------------------------------------ */
/* IconButton bridge                                                   */
/* ------------------------------------------------------------------ */

export interface IconButtonTooltipProps {
  /** Text shown in the tooltip (or the `title` fallback). */
  label: string;
  /** `"auto"`: Tooltip inside a `TooltipProvider`, native `title` otherwise. `true`: always a Tooltip. */
  mode?: "auto" | "always";
  side?: TooltipContentProps["side"];
  shortcut?: TooltipContentProps["shortcut"];
  children: React.ReactElement;
}

/**
 * Used by `IconButton`: shows `label` as a Tooltip when a `TooltipProvider` is present,
 * and falls back to the native `title` attribute when it isn't (so code without a provider keeps working).
 */
export function IconButtonTooltip({ label, mode = "auto", side, shortcut, children }: IconButtonTooltipProps) {
  const hasProvider = useHasTooltipProvider();
  if (mode === "auto" && !hasProvider) return <Slot.Root title={label}>{children}</Slot.Root>;
  return (
    <Tooltip content={label} side={side} shortcut={shortcut}>
      {children}
    </Tooltip>
  );
}
