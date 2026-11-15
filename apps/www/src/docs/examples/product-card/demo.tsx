"use client";

import { ProductCard } from "@vamos-ui/react/blocks";
import { toast } from "@vamos-ui/react";
import { ceramics } from "./_data";

// Swatches swap the photo (CSS), the sale price strikes the regular one, quick add calls back with the chosen swatch.
export default function ProductCardDemo() {
  return (
    <div className="@container grid w-full max-w-3xl grid-cols-1 gap-8 sm:grid-cols-2">
      {ceramics.slice(0, 2).map((p) => (
        <ProductCard key={p.id} {...p} onQuickAdd={(i) => toast.success(`Added ${p.title}${p.swatches?.[i] ? ` · ${p.swatches[i]!.name}` : ""}`)} />
      ))}
    </div>
  );
}
