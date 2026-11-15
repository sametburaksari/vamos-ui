"use client";

import * as React from "react";
import { Button } from "@vamos-ui/react";
import { ProductCard } from "@vamos-ui/react/blocks";
import { Heart } from "lucide-react";
import { ceramics } from "./_data";

// Your own controls in the slots: a wishlist toggle and a "Choose size" button. No cart logic in the card.
export default function ProductCardSlots() {
  const [saved, setSaved] = React.useState(false);
  const vase = ceramics[2]!;
  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-8 sm:grid-cols-2">
      <ProductCard
        {...vase}
        rangeStyle="range"
        wishlist={
          <Button variant="secondary" size="icon" pill aria-pressed={saved} aria-label={`Save ${vase.title}`} onClick={() => setSaved((s) => !s)} className="bg-surface shadow-sm">
            <Heart aria-hidden className={saved ? "fill-current" : undefined} />
          </Button>
        }
        quickAdd={
          <Button variant="secondary" size="sm" pill className="bg-surface shadow-sm">
            Choose size
          </Button>
        }
      />
      <ProductCard {...ceramics[3]!} />
    </div>
  );
}
