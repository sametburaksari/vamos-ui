"use client";

import * as React from "react";

/**
 * Marks the section link for the part of the page being read (`aria-current="location"`), so the
 * sticky identity column works as a quiet table of contents. The site's one scroll-linked
 * effect: the accent rule slides to the active item. Without JavaScript the links are plain
 * in-page anchors.
 */
export function SectionSpy({ ids, children }: { ids: string[]; children: React.ReactNode }) {
  const ref = React.useRef<HTMLUListElement>(null);
  React.useEffect(() => {
    const list = ref.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, number>();
    const mark = () => {
      let best = "";
      let top = Infinity;
      for (const [id, y] of visible) if (y < top) [best, top] = [id, y];
      list.querySelectorAll<HTMLAnchorElement>("a[href^='#']").forEach((a) => {
        if (a.hash === `#${best}`) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
      const active = list.querySelector<HTMLElement>("a[aria-current]");
      list.style.setProperty("--cv-y", active ? `${active.offsetTop}px` : "0px");
      list.style.setProperty("--cv-h", active ? `${active.offsetHeight}px` : "0px");
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        mark();
      },
      { rootMargin: "-20% 0px -55% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [ids]);
  // The <style> sits beside the list: a <ul> may only hold <li> children.
  return (
    <>
      <style>{spyStyle}</style>
      <ul ref={ref} className="cv-spy relative flex flex-col border-s border-line">
        {children}
      </ul>
    </>
  );
}

const spyStyle = `
.cv-spy::before {
  content: ""; position: absolute; inset-inline-start: -1px; inset-block-start: 0; width: 1px;
  height: var(--cv-h, 0px); translate: 0 var(--cv-y, 0px); background: var(--accent);
}
.cv-spy a[aria-current] { color: var(--fg); }
@media screen and (prefers-reduced-motion: no-preference) {
  .cv-spy:where(:not([data-motion="off"] *))::before { transition: translate 360ms var(--ease-out-quint), height 360ms var(--ease-out-quint); }
}
`;
