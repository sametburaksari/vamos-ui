"use client";

import * as React from "react";
import * as Slot from "radix-ui/slot";

const LayerDepthContext = /*#__PURE__*/ React.createContext(0);

/**
 * Depth of the current floating layer: 0 = page, 1 = first overlay (dialog, popover, menu…),
 * 2 = a popover inside that dialog, and so on. Travels through React context, so it survives portals.
 */
export function useLayerDepth(): number {
  return React.useContext(LayerDepthContext);
}

/**
 * Marks its subtree as one layer deeper. Use when you can't put `Layer` on the content element
 * itself; read the depth with `useLayerDepth()` and set `data-layer-depth` yourself.
 */
export function LayerProvider({ children }: { children: React.ReactNode }) {
  const depth = useLayerDepth() + 1;
  return <LayerDepthContext.Provider value={depth}>{children}</LayerDepthContext.Provider>;
}

/** Attributes for a layer's content element at `depth`. */
export function layerAttributes(depth: number) {
  return { "data-layer-depth": String(depth), "data-layer-content": "" } as const;
}

export interface LayerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Merge onto the single child (e.g. `<Layer asChild><Popover.Content/></Layer>`). */
  asChild?: boolean;
}

/**
 * A floating layer's content root. Sets `data-layer-depth` and increments the depth for
 * descendants. In glass mode only depth 1 blurs; deeper layers get `--blur: 0` and the more
 * opaque `--popover-nested` (styles.css), keeping at most one overlay blur on screen.
 *
 * ```tsx
 * <Popover.Portal container={usePortalContainer()}>
 *   <Layer asChild>
 *     <Popover.Content className="surface-popover ui-pop">…</Popover.Content>
 *   </Layer>
 * </Popover.Portal>
 * ```
 */
export const Layer = /*#__PURE__*/ React.forwardRef<HTMLDivElement, LayerProps>(function Layer({ asChild, ...props }, ref) {
  const depth = useLayerDepth() + 1;
  const Comp = asChild ? Slot.Root : "div";
  return (
    <LayerDepthContext.Provider value={depth}>
      <Comp ref={ref} {...layerAttributes(depth)} {...props} />
    </LayerDepthContext.Provider>
  );
});
