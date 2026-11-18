"use client";

import * as React from "react";
import { commerceLabelsTr, ProductCard as KitProductCard, sitePageHref } from "@vamos-ui/react/blocks";
import { toDecimal } from "@vamos-ui/react/commerce";
import { CURRENCY, intlOf, ui, type Product } from "./content";
import { useStore } from "./store-provider";

/**
 * The shop's card is the kit `ProductCard` with glaze swatches: hovering or focusing a swatch
 * previews that glaze's photo, clicking keeps it, and the link and quick add follow the chosen
 * glaze (the choice lives in state here, so quick add is disabled when that glaze is sold out).
 */
export function ProductCard({ product, priority, size = "md" }: { product: Product; priority?: boolean; size?: "md" | "lg" }) {
  const { t, locale, add, select } = useStore();
  const [chosen, setChosen] = React.useState(0);
  const labels = React.useMemo(
    () => ({
      ...(locale === "tr" ? commerceLabelsTr : null),
      quickAddVariant: t(ui.quickAdd).replace("{glaze}", "{variant}"),
      optionsOf: t(ui.glazeOf),
      newBadge: t(ui.newBadge),
    }),
    [locale, t],
  );

  return (
    <KitProductCard
      title={t(product.name)}
      href={sitePageHref("product")}
      image={{ ...product.glazes[0]!.photo, alt: t(product.glazes[0]!.alt) }}
      price={{ amount: toDecimal(product.price), currency: CURRENCY }}
      isNew={product.isNew}
      swatches={product.glazes.map((g) => ({ name: t(g.name), color: g.swatch, image: { ...g.photo, alt: t(g.alt) }, soldOut: g.stock === 0 }))}
      swatchIndex={chosen}
      onSwatchChange={setChosen}
      onQuickAdd={(i) => add(product.id, product.glazes[i]!.id, 1)}
      onNavigate={(i) => select(product.id, product.glazes[i]!.id)}
      size={size}
      priority={priority}
      sizes={size === "lg" ? "(min-width: 1024px) 40vw, 90vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"}
      labels={labels}
      locale={intlOf(locale)}
    />
  );
}
