"use client";

import * as React from "react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { usePortalContainer } from "../lib/theme-scope";
import { Layer } from "../lib/layer";
import { FloatingArrow } from "../lib/floating-arrow";

export interface HoverCardProps extends React.ComponentProps<typeof HoverCardPrimitive.Root> {}

/**
 * Root. Opens after 500 ms of hover and closes 150 ms after the pointer leaves.
 * Hover cards are *extra* information for pointer users: they don't open from the keyboard or on
 * touch, so the same details must be reachable on the link target.
 */
export function HoverCard({ openDelay = 500, closeDelay = 150, ...props }: HoverCardProps) {
  return <HoverCardPrimitive.Root openDelay={openDelay} closeDelay={closeDelay} {...props} />;
}

export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export const hoverCardContentVariants = cva(
  "surface-popover ui-pop z-(--z-popover) rounded-ui-lg p-[calc(var(--gap)*0.85)] outline-none max-w-[calc(100vw-1.5rem)]",
  {
    variants: {
      size: {
        sm: "w-64",
        md: "w-80",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface HoverCardContentProps extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>, VariantProps<typeof hoverCardContentVariants> {
  /** Show the pointer arrow. Default `false`. */
  arrow?: boolean;
}

/** The preview panel. Portals into the nearest `ThemeScope` and follows the layer-depth glass rules. */
export const HoverCardContent = React.forwardRef<React.ElementRef<typeof HoverCardPrimitive.Content>, HoverCardContentProps>(function HoverCardContent(
  { className, size, arrow = false, sideOffset = 8, collisionPadding = 12, children, ...props },
  ref,
) {
  const container = usePortalContainer();
  return (
    <HoverCardPrimitive.Portal container={container}>
      <Layer asChild>
        <HoverCardPrimitive.Content
          ref={ref}
          data-slot="hover-card-content"
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          className={cn(hoverCardContentVariants({ size }), className)}
          {...props}
        >
          {children}
          {arrow ? (
            <HoverCardPrimitive.Arrow asChild width={14} height={7}>
              <FloatingArrow />
            </HoverCardPrimitive.Arrow>
          ) : null}
        </HoverCardPrimitive.Content>
      </Layer>
    </HoverCardPrimitive.Portal>
  );
});
