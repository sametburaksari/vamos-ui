/**
 * Store pricing, React-free and shared by the browser (cart display) and the server (the amount
 * that is charged). Money is integer minor units (kuruş, cents): no floating-point sums.
 *
 * Prices in the catalog include VAT (KDV dahil), as Turkish consumer prices must; the VAT share of
 * each line is worked out for the receipt. The server never trusts a price from the browser: it
 * prices the cart again from the catalog with `priceCart`.
 *
 * Discount codes (`Catalog.coupons`) are priced here too. The catalog ships to the browser, so the
 * codes in it are public (a "SUMMER10" printed on a flyer, not a per-customer secret); the server
 * re-validates the code, its window and its conditions on every checkout.
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

/**
 * A discount code. The catalog is public, so anyone can read these: per-customer, single-use or
 * secret codes need a server-side store and are out of scope.
 */
export interface Coupon {
  /** What the buyer types. Matched trimmed and case-insensitively. */
  code: string;
  /** `percent` off, a fixed `amount` off (minor units), or `free-shipping`. */
  kind: "percent" | "amount" | "free-shipping";
  /** Percent (1–100) or minor units. Ignored for `free-shipping`. */
  value?: number;
  /** Cart subtotal (minor units, before the discount) the code needs. */
  minSubtotal?: number;
  /** ISO time the code starts working. */
  startsAt?: string;
  /** ISO time the code stops working (exclusive). */
  endsAt?: string;
  /** Limit to these products (any listed product or category qualifies). */
  productIds?: string[];
  /** Limit to these categories (`CatalogProduct.category`). */
  categories?: string[];
  /** Cap for `percent`, minor units. */
  maxDiscount?: number;
}

export interface Catalog {
  /** ISO 4217 code: "TRY", "USD", "EUR" … */
  currency: string;
  products: CatalogProduct[];
  /** Default VAT rate in percent. Default 20. */
  vatRate?: number;
  /** Omitted: no shipping charge (digital goods, or included in prices). */
  shipping?: StoreShipping;
  /** Discount codes. Public: see `Coupon`. */
  coupons?: Coupon[];
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
  /** unit × qty, before any discount. */
  total: number;
  /** This line's share of the quote's discount (0 without a code). The line is charged total − discount. */
  discount: number;
  vatRate: number;
  /** VAT included in what the line is charged (total − discount). */
  vat: number;
}

export interface Quote {
  currency: string;
  lines: QuoteLine[];
  /** Sum of line totals, before the discount. */
  subtotal: number;
  /** Discount from the coupon, minor units (0 without one). Shipping is not part of it. */
  discount: number;
  /** The applied code, normalised to the catalog's spelling. */
  coupon?: { code: string; kind: Coupon["kind"] };
  shipping: number;
  shippingLabel: string;
  /** VAT included in `total`, by rate ("20" → amount). */
  vatByRate: Record<string, number>;
  vat: number;
  /** What the customer pays: subtotal − discount + shipping. */
  total: number;
  /** True when a line needs a delivery address. */
  physical: boolean;
}

export type CouponIssueCode = "coupon-invalid" | "coupon-expired" | "coupon-min-subtotal" | "coupon-not-applicable";

export type CartIssueCode = "unknown-product" | "unknown-variant" | "unavailable" | "bad-quantity" | "too-many" | "empty" | "duplicate" | CouponIssueCode;

export interface CartIssue {
  /** Index in the lines that were priced, or -1 for the whole cart. */
  index: number;
  code: CartIssueCode;
  productId?: string;
}

export type PriceResult = { ok: true; quote: Quote } | { ok: false; issues: CartIssue[] };

export interface PriceOptions {
  /** A discount code from the buyer. Empty or whitespace means none. */
  coupon?: string;
  /** Clock for the coupon's window. Default now. */
  now?: Date | number;
}

/** True for the issue codes a discount code produces (index -1). */
export const isCouponIssue = (issue: CartIssue) => issue.code.startsWith("coupon-");

/**
 * Trims and upper-cases a code the way `priceCart` matches it. Turkish dotted and dotless i fold to
 * plain I, so "indirim", "İNDİRİM" and "INDIRIM" are the same code on any keyboard.
 */
export const normalizeCouponCode = (code: string) =>
  String(code ?? "")
    .normalize("NFC")
    .trim()
    .replace(/[İı]/g, (c) => (c === "İ" ? "I" : "i"))
    .toUpperCase();

/** Most lines one order may have (keeps the signed order small). */
export const MAX_CART_LINES = 30;

const vatOf = (gross: number, rate: number) => (rate > 0 ? Math.round((gross * rate) / (100 + rate)) : 0);

const time = (iso: string | undefined) => (iso ? Date.parse(iso) : NaN);

/**
 * Resolves the coupon against priced lines: the discount, which lines share it, or an issue.
 * The minimum is checked against the whole subtotal; restrictions pick the eligible lines.
 */
function resolveCoupon(catalog: Catalog, out: QuoteLine[], subtotal: number, input: string, now: number, chargesShipping: boolean): { coupon: Coupon; discount: number; eligible: number[] } | CouponIssueCode {
  const wanted = normalizeCouponCode(input);
  const coupon = (catalog.coupons ?? []).find((c) => normalizeCouponCode(c.code) === wanted);
  if (!coupon || !wanted) return "coupon-invalid";
  const starts = time(coupon.startsAt);
  const ends = time(coupon.endsAt);
  if ((coupon.startsAt && Number.isNaN(starts)) || (coupon.endsAt && Number.isNaN(ends))) return "coupon-invalid";
  // Not started yet reads as "invalid" to the buyer: the code does not work (yet).
  if (!Number.isNaN(starts) && now < starts) return "coupon-invalid";
  if (!Number.isNaN(ends) && now >= ends) return "coupon-expired";
  const v = coupon.value ?? 0;
  if (coupon.kind === "percent" ? !(Number.isFinite(v) && v > 0 && v <= 100) : coupon.kind === "amount" ? !(Number.isInteger(v) && v > 0) : coupon.kind !== "free-shipping") return "coupon-invalid";
  if (coupon.minSubtotal !== undefined && subtotal < coupon.minSubtotal) return "coupon-min-subtotal";
  const restricted = !!(coupon.productIds?.length || coupon.categories?.length);
  const eligible = out.flatMap((l, i) => (!restricted || coupon.productIds?.includes(l.productId) || coupon.categories?.includes(l.category) ? [i] : []));
  if (coupon.kind === "free-shipping") {
    if (!chargesShipping || !eligible.some((i) => out[i]!.itemType === "PHYSICAL")) return "coupon-not-applicable";
    return { coupon, discount: 0, eligible: [] };
  }
  if (!eligible.length) return "coupon-not-applicable";
  const base = eligible.reduce((s, i) => s + out[i]!.total, 0);
  let discount = coupon.kind === "percent" ? Math.round((base * v) / 100) : v;
  if (coupon.kind === "percent" && coupon.maxDiscount !== undefined && coupon.maxDiscount >= 0) discount = Math.min(discount, Math.floor(coupon.maxDiscount));
  // Every eligible line keeps at least one minor unit (iyzico refuses zero-priced basket items).
  discount = Math.max(0, Math.min(discount, base - eligible.length));
  return { coupon, discount, eligible };
}

/**
 * Splits `discount` over `lines` (indices into `out`) in proportion to their totals, exactly: the
 * shares are floored, the last eligible line takes the remainder, and no line drops below 1 minor
 * unit (any overflow walks back to earlier lines). Requires discount ≤ Σ(total − 1).
 */
function allocate(out: QuoteLine[], lines: number[], discount: number): void {
  if (!discount || !lines.length) return;
  const base = BigInt(lines.reduce((s, i) => s + out[i]!.total, 0));
  let given = 0;
  for (const i of lines) {
    // BigInt: discount × total can pass 2^53 on large carts.
    const share = Number((BigInt(discount) * BigInt(out[i]!.total)) / base);
    out[i]!.discount = share;
    given += share;
  }
  let rest = discount - given;
  for (let k = lines.length - 1; k >= 0 && rest > 0; k--) {
    const l = out[lines[k]!]!;
    const take = Math.min(rest, l.total - 1 - l.discount);
    l.discount += take;
    rest -= take;
  }
}

/**
 * Prices a cart from the catalog. Unknown, unavailable or out-of-range lines make it fail, and so
 * does a coupon that does not apply (issue at index -1, checked only once the lines are fine).
 *
 * Free shipping (`shipping.freeOver`) is judged on the subtotal before the discount, so a code can
 * never make the cart more expensive by pushing it back under the threshold.
 */
export function priceCart(catalog: Catalog, lines: readonly CartLine[], options: PriceOptions = {}): PriceResult {
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
      discount: 0,
      vatRate,
      vat: 0,
    });
  });
  if (issues.length) return { ok: false, issues };

  const subtotal = out.reduce((s, l) => s + l.total, 0);
  const physical = out.some((l) => l.itemType === "PHYSICAL");
  const s = catalog.shipping;
  let shipping = s && physical && !(s.freeOver !== undefined && subtotal >= s.freeOver) ? s.flat : 0;
  let discount = 0;
  let applied: Quote["coupon"];
  const code = typeof options.coupon === "string" ? options.coupon.trim() : "";
  if (code) {
    const now = options.now === undefined ? Date.now() : +options.now;
    const r = resolveCoupon(catalog, out, subtotal, code, now, !!s && physical && s.flat > 0);
    if (typeof r === "string") return { ok: false, issues: [{ index: -1, code: r }] };
    allocate(out, r.eligible, r.discount);
    discount = r.discount;
    if (r.coupon.kind === "free-shipping") shipping = 0;
    applied = { code: r.coupon.code, kind: r.coupon.kind };
  }
  const vatByRate: Record<string, number> = {};
  for (const l of out) {
    l.vat = vatOf(l.total - l.discount, l.vatRate);
    vatByRate[String(l.vatRate)] = (vatByRate[String(l.vatRate)] ?? 0) + l.vat;
  }
  if (shipping > 0) {
    const r = s?.vatRate ?? 20;
    vatByRate[String(r)] = (vatByRate[String(r)] ?? 0) + vatOf(shipping, r);
  }
  const vat = Object.values(vatByRate).reduce((a, b) => a + b, 0);
  return {
    ok: true,
    quote: {
      currency: catalog.currency,
      lines: out,
      subtotal,
      discount,
      ...(applied ? { coupon: applied } : {}),
      shipping,
      shippingLabel: s?.label ?? "Shipping",
      vatByRate,
      vat,
      total: subtotal - discount + shipping,
      physical,
    },
  };
}

/** Minor units → decimal string with two places: 14990 → "149.90". */
export function toDecimal(minor: number): string {
  if (!Number.isInteger(minor)) throw new TypeError("toDecimal: minor units must be an integer");
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

/**
 * Formats minor units for display with `Intl.NumberFormat`. `currencyDisplay` is the Intl option:
 * default "symbol" (en-US shows "TRY 3,400"); "narrowSymbol" gives "₺3,400" in every locale.
 */
export function formatMoney(minor: number, currency: string, locale = "tr-TR", currencyDisplay?: Intl.NumberFormatOptions["currencyDisplay"]): string {
  const whole = minor % 100 === 0;
  return new Intl.NumberFormat(locale, { style: "currency", currency, ...(currencyDisplay ? { currencyDisplay } : {}), minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(minor / 100);
}
