import * as React from "react";

export interface ContainerSize {
  width: number | undefined;
  height: number | undefined;
}

/**
 * Measures an element with `ResizeObserver` (content box, rAF-throttled).
 * Width is `undefined` until the first measurement — render the CSS layout (`@container`) first
 * and use this only where JS needs the number (charts, virtualised lists, overflow menus).
 *
 * ```tsx
 * const { ref, width } = useContainerWidth<HTMLDivElement>();
 * <div ref={ref}>{width && width < 480 ? <Compact /> : <Full />}</div>
 * ```
 */
export function useContainerWidth<T extends Element = HTMLDivElement>() {
  const [size, setSize] = React.useState<ContainerSize>({ width: undefined, height: undefined });
  const observer = React.useRef<ResizeObserver | null>(null);
  const frame = React.useRef(0);

  const ref = React.useCallback((node: T | null) => {
    observer.current?.disconnect();
    cancelAnimationFrame(frame.current);
    if (!node || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const box = entry.contentBoxSize?.[0];
      const width = box ? box.inlineSize : entry.contentRect.width;
      const height = box ? box.blockSize : entry.contentRect.height;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() =>
        setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height })),
      );
    });
    ro.observe(node);
    observer.current = ro;
  }, []);

  React.useEffect(() => () => {
    observer.current?.disconnect();
    cancelAnimationFrame(frame.current);
  }, []);

  return { ref, width: size.width, height: size.height };
}
