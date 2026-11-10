"use client";

import * as React from "react";
import { Sortable, SortableHandle, SortableItem, SortableOverlay, keepMountedRange, useSortableActiveId } from "@vamos-ui/react/sortable";

interface Product {
  id: string;
  name: string;
  sku: string;
}

const ADJECTIVES = ["Linen", "Oak", "Ceramic", "Wool", "Copper", "Walnut", "Cotton", "Brass"];
const NOUNS = ["side table", "throw", "pendant lamp", "mug set", "planter", "cushion cover", "shelf", "serving board"];
const PRODUCTS: Product[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `${ADJECTIVES[i % 8]} ${NOUNS[Math.floor(i / 8) % 8]}`,
  sku: `HM-${String(10_000 + i * 7).padStart(5, "0")}`,
}));

const ROW = 40;

/** Fixed-height windowing (any virtualizer works the same way; with @tanstack/react-virtual pass keepMountedRange as rangeExtractor). */
function useWindow(scrollRef: React.RefObject<HTMLDivElement | null>, count: number) {
  const [range, setRange] = React.useState({ startIndex: 0, endIndex: 12 });
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setRange({ startIndex: Math.floor(el.scrollTop / ROW), endIndex: Math.min(count - 1, Math.ceil((el.scrollTop + el.clientHeight) / ROW)) });
    update();
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, [scrollRef, count]);
  return range;
}

function Rows({ items, scrollRef }: { items: Product[]; scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const activeId = useSortableActiveId();
  const activeIndex = activeId ? items.findIndex((p) => p.id === activeId) : null;
  const range = useWindow(scrollRef, items.length);
  // Keep the dragged row mounted while it is scrolled out of view.
  const indexes = keepMountedRange(activeIndex)({ ...range, overscan: 8, count: items.length });
  return (
    <ul aria-label="Featured products, 1,000 items" className="relative m-0 p-0" style={{ height: items.length * ROW }}>
      {indexes.map((index) => {
        const p = items[index]!;
        return (
          <SortableItem
            key={p.id}
            id={p.id}
            as="li"
            aria-setsize={items.length}
            aria-posinset={index + 1}
            className="absolute inset-x-0 flex items-center gap-2 border-b border-line bg-surface ps-1 pe-3 text-sm"
            style={{ top: index * ROW, height: ROW }}
          >
            <SortableHandle size="sm" />
            <span className="tabular w-9 text-end text-xs text-fg-subtle">{index + 1}</span>
            <span className="min-w-0 flex-1 truncate">{p.name}</span>
            <span className="font-mono text-[11px] text-fg-subtle">{p.sku}</span>
          </SortableItem>
        );
      })}
    </ul>
  );
}

export default function SortableVirtualized() {
  const [items, setItems] = React.useState(PRODUCTS);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  return (
    <Sortable items={items} getLabel={(p) => p.name} onReorder={setItems}>
      <div ref={scrollRef} className="h-80 w-full max-w-lg overflow-auto rounded-ui-lg border border-line bg-surface">
        <Rows items={items} scrollRef={scrollRef} />
      </div>
      <SortableOverlay>
        {(id) => (
          <div className="vui-sortable-clone flex h-10 w-96 items-center rounded-ui border border-line px-3 text-sm">{items.find((p) => p.id === id)?.name}</div>
        )}
      </SortableOverlay>
    </Sortable>
  );
}
