import * as React from "react";

/**
 * The writing direction an element inherits, kept current when an ancestor's `dir` changes
 * (SiteShell sets it after hydration). Radix primitives default to ltr and stamp `dir` on their
 * root, so news islands pass this down to keep RTL sites mirrored.
 */
export function useInheritedDir<T extends HTMLElement>(ref: React.RefObject<T | null>): "ltr" | "rtl" | undefined {
  const [dir, setDir] = React.useState<"ltr" | "rtl" | undefined>(undefined);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setDir(getComputedStyle(el.parentElement ?? el).direction === "rtl" ? "rtl" : "ltr");
    read();
    if (typeof MutationObserver === "undefined") return;
    const mo = new MutationObserver(read);
    mo.observe(el.ownerDocument.documentElement, { attributes: true, attributeFilter: ["dir"], subtree: true });
    return () => mo.disconnect();
  }, [ref]);
  return dir;
}
