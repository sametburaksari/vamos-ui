"use client";

import * as React from "react";
import { Toaster } from "@vamos-ui/react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { copyFor, templateById, type Copy, type Licence, type SiteLocale } from "./content";

interface ShopContextValue {
  c: Copy;
  /** The template the product page shows. */
  selected: string;
  select: (id: string) => void;
  /** The one-item cart: a template and a licence (templates are bought one at a time). */
  cart: { templateId: string; licence: Licence } | null;
  buy: (templateId: string, licence: Licence) => void;
  clearCart: () => void;
}

const ShopContext = React.createContext<ShopContextValue | null>(null);

export function useShop() {
  const ctx = React.useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>.");
  return ctx;
}

/**
 * Selected template and cart for the whole site. Inside SiteShell, above the EN / TR switch,
 * so changing language keeps both. Starts with Ledger (Team) in the cart so checkout has content.
 */
export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useSiteShell();
  const c = React.useMemo(() => copyFor((locale === "tr" ? "tr" : "en") as SiteLocale), [locale]);
  const [selected, setSelected] = React.useState("ledger");
  const [cart, setCart] = React.useState<ShopContextValue["cart"]>({ templateId: "ledger", licence: "team" });

  const value = React.useMemo<ShopContextValue>(
    () => ({
      c,
      selected: templateById(selected).id,
      select: setSelected,
      cart,
      buy: (templateId, licence) => setCart({ templateId, licence }),
      clearCart: () => setCart(null),
    }),
    [c, selected, cart],
  );

  return (
    <ShopContext.Provider value={value}>
      {children}
      <Toaster />
    </ShopContext.Provider>
  );
}

/** Navbar label: "Cart" with a dot when something is in it. */
export function CartLabel({ label }: { label: string }) {
  const { cart } = useShop();
  return (
    <span className="inline-flex items-center gap-2">
      {label}
      <span className="tabular inline-grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-medium text-accent-fg">{cart ? 1 : 0}</span>
    </span>
  );
}
