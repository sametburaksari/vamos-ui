/**
 * Store pricing, React-free and shared by the browser (cart display) and the server (the amount
 * that is charged). Money is integer minor units (kuruş, cents): no floating-point sums.
 *
 * Prices in the catalog include VAT (KDV dahil), as Turkish consumer prices must; the VAT share of
 * each line is worked out for the receipt. The server never trusts a price from the browser: it
 * prices the cart again from the catalog with `priceCart`.
 */

export interface CatalogVariant {
  id: string;
  name: string;
  /** Overrides the product price, minor units incl. VAT. */
  price?: number;
  /** `false` hides it from checkout (sold out). Default true. */
  available?: boolean;
}

export interface CatalogProduct {
  id: string;
  name: string;
  /** Price in minor units incl. VAT: 149_90 for ₺149.90. */
  price: number;
  /** VAT rate in percent. Default the catalog's `vatRate`, else 20. */
  vatRate?: number;
  /** For the payment provider's basket (iyzico category1). */
  category?: string;
  /** `"VIRTUAL"` for digital goods and services (no shipping address needed). Default PHYSICAL. */
  itemType?: "PHYSICAL" | "VIRTUAL";
  variants?: CatalogVariant[];
  /** `false` hides it from checkout. Default true. */
  available?: boolean;
  /** Most of this item per order. Default 20. */
  maxQty?: number;
}

export interface StoreShipping {
  /** Flat rate per order, minor units incl. VAT. */
  flat: number;
  /** Free from this subtotal (minor units). */
  freeOver?: number;
  /** VAT rate on shipping. Default 20. */
  vatRate?: number;
  /** Name on receipts and in the payment basket. */
  label?: string;
}

export interface Catalog {
  /** ISO 4217 code: "TRY", "USD", "EUR" … */
  currency: string;
  products: CatalogProduct[];
  /** Default VAT rate in percent. Default 20. */
  vatRate?: number;
  /** Omitted: no shipping charge (digital goods, or included in prices). */
  shipping?: StoreShipping;
}

export interface CartLine {
  productId: string;
  variantId?: string;
  qty: number;
}

export interface QuoteLine {
  productId: string;
  variantId?: string;
  /** Product name, plus " · variant" when there is one. */
  name: string;
  category: string;
  itemType: "PHYSICAL" | "VIRTUAL";
  unit: number;
  qty: number;
  total: number;
  vatRate: number;
  /** VAT included in `total`. */
  vat: number;
}

export interface Quote {
  currency: string;
  lines: QuoteLine[];
  /** Sum of line totals. */
  subtotal: number;
  shipping: number;
  shippingLabel: string;
  /** VAT included in `total`, by rate ("20" → amount). */
  vatByRate: Record<string, number>;
  vat: number;
  /** What the customer pays. */
  total: number;
  /** True when a line needs a delivery address. */
  physical: boolean;
}

export type CartIssueCode = "unknown-product" | "unknown-variant" | "unavailable" | "bad-quantity" | "too-many" | "empty" | "duplicate";

export interface CartIssue {
  /** Index in the lines that were priced, or -1 for the whole cart. */
  index: number;
  code: CartIssueCode;
  productId?: string;
}

export type PriceResult = { ok: true; quote: Quote } | { ok: false; issues: CartIssue[] };

/** Most lines one order may have (keeps the signed order small). */
export const MAX_CART_LINES = 30;

const vatOf = (gross: number, rate: number) => (rate > 0 ? Math.round((gross * rate) / (100 + rate)) : 0);

/** Prices a cart from the catalog. Unknown, unavailable or out-of-range lines make it fail. */
export function priceCart(catalog: Catalog, lines: readonly CartLine[]): PriceResult {
  const issues: CartIssue[] = [];
  if (!Array.isArray(lines) || lines.length === 0) return { ok: false, issues: [{ index: -1, code: "empty" }] };
  if (lines.length > MAX_CART_LINES) return { ok: false, issues: [{ index: -1, code: "too-many" }] };
  const byId = new Map(catalog.products.map((p) => [p.id, p]));
  const seen = new Set<string>();
  const out: QuoteLine[] = [];
  lines.forEach((line, index) => {
    const product = byId.get(String(line?.productId));
    if (!product) return void issues.push({ index, code: "unknown-product", productId: line?.productId });
    const variant = line.variantId === undefined || line.variantId === null || line.variantId === "" ? undefined : product.variants?.find((v) => v.id === line.variantId);
    if (line.variantId && !variant) return void issues.push({ index, code: "unknown-variant", productId: product.id });
    if (!variant && product.variants?.length) return void issues.push({ index, code: "unknown-variant", productId: product.id });
    if (product.available === false || variant?.available === false) return void issues.push({ index, code: "unavailable", productId: product.id });
    const qty = line.qty;
    if (!Number.isInteger(qty) || qty < 1 || qty > (product.maxQty ?? 20)) return void issues.push({ index, code: "bad-quantity", productId: product.id });
    const key = `${product.id}\u0000${variant?.id ?? ""}`;
    if (seen.has(key)) return void issues.push({ index, code: "duplicate", productId: product.id });
    seen.add(key);
    const unit = variant?.price ?? product.price;
    if (!Number.isInteger(unit) || unit <= 0) return void issues.push({ index, code: "unavailable", productId: product.id });
    const vatRate = product.vatRate ?? catalog.vatRate ?? 20;
    const total = unit * qty;
    out.push({
      productId: product.id,
      ...(variant ? { variantId: variant.id } : {}),
      name: variant ? `${product.name} · ${variant.name}` : product.name,
      category: product.category ?? "General",
      itemType: product.itemType ?? "PHYSICAL",
      unit,
      qty,
      total,
      vatRate,
      vat: vatOf(total, vatRate),
    });
  });
  if (issues.length) return { ok: false, issues };

  const subtotal = out.reduce((s, l) => s + l.total, 0);
  const physical = out.some((l) => l.itemType === "PHYSICAL");
  const s = catalog.shipping;
  const shipping = s && physical && !(s.freeOver !== undefined && subtotal >= s.freeOver) ? s.flat : 0;
  const vatByRate: Record<string, number> = {};
  for (const l of out) vatByRate[String(l.vatRate)] = (vatByRate[String(l.vatRate)] ?? 0) + l.vat;
  if (shipping > 0) {
    const r = s?.vatRate ?? 20;
    vatByRate[String(r)] = (vatByRate[String(r)] ?? 0) + vatOf(shipping, r);
  }
  const vat = Object.values(vatByRate).reduce((a, b) => a + b, 0);
  return {
    ok: true,
    quote: { currency: catalog.currency, lines: out, subtotal, shipping, shippingLabel: s?.label ?? "Shipping", vatByRate, vat, total: subtotal + shipping, physical },
  };
}

/** Minor units → decimal string with two places: 14990 → "149.90". */
export function toDecimal(minor: number): string {
  if (!Number.isInteger(minor)) throw new TypeError("toDecimal: minor units must be an integer");
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

/** Formats minor units for display with `Intl.NumberFormat`. */
export function formatMoney(minor: number, currency: string, locale = "tr-TR"): string {
  const whole = minor % 100 === 0;
  return new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(minor / 100);
}
