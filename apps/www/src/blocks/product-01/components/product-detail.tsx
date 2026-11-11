"use client";

import * as React from "react";
import {
  Badge,
  Breadcrumb,
  Button,
  cn,
  Field,
  NumberInput,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@vamos-ui/react";
import { RatingStars } from "@vamos-ui/react/blocks";
import { Clock, PackageCheck, RotateCcw, Store, Truck } from "lucide-react";
import { NOW_MS } from "../../_shared/time";
import { businessDay, featured, FREE_SHIPPING_FROM, ratingBreakdown, relatedIds, reviews, shopItems, times, vatIncluded, type FeaturedSizeId, type ShopItem } from "./catalogue";
import { useCart, useShop } from "./cart-store";
import { ProductGallery } from "./product-gallery";
import { Eyebrow, PriceTag, ProductTile, StoreContainer } from "./storefront";

type Stock = "out" | "low" | "ok";
const stockOf = (n: number): Stock => (n === 0 ? "out" : n <= 5 ? "low" : "ok");

/** Minutes left until today's 14:00 dispatch cut-off, measured from the fixtures' NOW. */
const CUTOFF_MIN = (() => {
  const d = new Date(NOW_MS + 3 * 3_600_000);
  return 14 * 60 - (d.getUTCHours() * 60 + d.getUTCMinutes());
})();

/** Product detail: gallery, glaze + size with stock, quantity, price, add to cart, delivery, tabs, related. */
export function ProductDetail() {
  const { t, c, f, money, date } = useShop();
  const cart = useCart();
  const [glazeId, setGlazeId] = React.useState("sea-salt");
  const [sizeId, setSizeId] = React.useState<FeaturedSizeId>("dinner");
  const [qty, setQty] = React.useState(1);
  const [tab, setTab] = React.useState("details");

  const glaze = featured.glazes.find((g) => g.id === glazeId)!;
  const size = featured.sizes.find((s) => s.id === sizeId)!;
  const stock = featured.stock[glazeId]?.[sizeId] ?? 0;
  const state = stockOf(stock);
  const glazeOut = featured.sizes.every((s) => (featured.stock[glazeId]?.[s.id] ?? 0) === 0);
  const name = t(featured.name);
  const optionText = `${t(size.name)} ${t(size.detail)} · ${t(glaze.name)}`;
  const saving = size.compareAt ? Math.round((1 - Number(size.price) / Number(size.compareAt)) * 100) : 0;
  const lineTotal = times(size.price, qty);

  React.useEffect(() => {
    if (stock > 0 && qty > stock) setQty(stock);
  }, [stock, qty]);

  const addToCart = () => {
    // Same key as the starter cart's dinner / sea-salt row, so adding it again raises that quantity.
    cart.add("plate", qty, `plate-${sizeId}-${glazeId}`, {
      ...shopItems.plate!,
      sku: `${featured.sku}-${sizeId.slice(0, 3).toUpperCase()}-${glazeId.slice(0, 2).toUpperCase()}`,
      option: { en: `${size.name.en} ${size.detail.en} · ${glaze.name.en}`, tr: `${size.name.tr} ${size.detail.tr} · ${glaze.name.tr}` },
      price: size.price,
      compareAt: size.compareAt,
      photo: glaze.photos[0]!.id,
      stock,
    });
    toast.success(c("Added to your cart", "Sepetinize eklendi"), {
      description: `${qty} × ${name} — ${optionText}`,
      action: { label: c("View cart", "Sepeti gör"), onClick: () => cart.setOpen(true) },
    });
  };

  const addRelated = (item: ShopItem) => {
    const id = Object.keys(shopItems).find((k) => shopItems[k] === item)!;
    cart.add(id, 1);
    toast.success(c("Added to your cart", "Sepetinize eklendi"), { description: t(item.name), action: { label: c("View cart", "Sepeti gör"), onClick: () => cart.setOpen(true) } });
  };

  const h = Math.floor(CUTOFF_MIN / 60);
  const m = CUTOFF_MIN % 60;
  const countdown = c(`${h} h ${m} min`, `${h} sa ${m} dk`);

  return (
    <>
      <StoreContainer className="pt-6 pb-12 lg:pt-8">
        <Breadcrumb
          size="sm"
          className="mb-6"
          items={[
            { label: c("Home", "Ana sayfa"), href: "#" },
            { label: c("Ceramics", "Seramik"), href: "#" },
            { label: c("Plates", "Tabaklar"), href: "#" },
            { label: name },
          ]}
        />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14 xl:gap-20">
          <ProductGallery photos={glaze.photos} label={name} />

          <div className="flex min-w-0 flex-col gap-7 lg:sticky lg:top-6 lg:self-start">
            <div className="flex flex-col gap-3">
              <Eyebrow>{t(featured.collection)}</Eyebrow>
              <h1 className="font-display text-display-l text-balance text-fg">{name}</h1>
              <button type="button" onClick={() => { setTab("reviews"); document.getElementById("product-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="flex w-fit items-center gap-2 rounded-ui-sm text-small text-fg-muted hover:text-fg focus-ring">
                <RatingStars rating={featured.rating} label={c(`Rated ${f.number(featured.rating)} out of 5`, `5 üzerinden ${f.number(featured.rating)} puan`)} />
                <span className="underline decoration-line underline-offset-4">{c(`${featured.reviewCount} reviews`, `${featured.reviewCount} değerlendirme`)}</span>
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <PriceTag price={size.price} compareAt={size.compareAt} size="lg" />
                {saving ? <Badge tone="accent" size="md">{c(`Save ${saving}%`, `%${saving} indirim`)}</Badge> : null}
              </div>
              <p className="text-[12px] text-fg-subtle">
                {c(`Includes ${money(vatIncluded(size.price))} VAT (20%) · free delivery over ${money(FREE_SHIPPING_FROM)}`, `${money(vatIncluded(size.price))} KDV (%20) dahil · ${money(FREE_SHIPPING_FROM)} üzeri ücretsiz kargo`)}
              </p>
            </div>

            <p className="max-w-[52ch] leading-relaxed text-fg-muted">{t(featured.short)}</p>

            <Field label={<>{c("Glaze", "Sır")}: <span className="font-normal text-fg-muted">{t(glaze.name)}</span></>}>
              <RadioGroup value={glazeId} onValueChange={setGlazeId} orientation="horizontal" className="flex flex-wrap gap-x-5 gap-y-3">
                {featured.glazes.map((g) => {
                  const out = featured.sizes.every((s) => (featured.stock[g.id]?.[s.id] ?? 0) === 0);
                  return (
                    <RadioGroupItem
                      key={g.id}
                      value={g.id}
                      label={
                        <span className={cn("inline-flex items-center gap-2", out && "text-fg-muted")}>
                          {/* Product data: the glaze colour itself. */}
                          <span aria-hidden className="size-5 rounded-full shadow-[inset_0_0_0_1px_var(--color-line)]" style={{ background: g.swatch }} />
                          {t(g.name)}
                          {out ? <span className="text-[12px] text-fg-subtle">({c("sold out", "tükendi")})</span> : null}
                        </span>
                      }
                    />
                  );
                })}
              </RadioGroup>
            </Field>

            <Field label={c("Size", "Ölçü")} labelAction={<button type="button" className="rounded-ui-sm text-[12px] text-fg-muted underline underline-offset-4 hover:text-fg focus-ring" onClick={() => { setTab("size"); document.getElementById("product-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{c("Size guide", "Ölçü rehberi")}</button>}>
              <RadioGroup value={sizeId} onValueChange={(v) => setSizeId(v as FeaturedSizeId)} variant="card" orientation="horizontal" className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                {featured.sizes.map((s) => {
                  const n = featured.stock[glazeId]?.[s.id] ?? 0;
                  const st = stockOf(n);
                  return (
                    <RadioGroupItem
                      key={s.id}
                      value={s.id}
                      className="p-3"
                      label={t(s.name)}
                      description={
                        <span className="flex flex-col gap-0.5">
                          <span>{t(s.detail)}</span>
                          <span className={cn("text-[11px]", st === "out" ? "text-fg-subtle line-through" : st === "low" ? "text-warning" : "text-success")}>
                            {st === "out" ? c("Sold out", "Tükendi") : st === "low" ? c(`${n} left`, `${n} adet`) : c("In stock", "Stokta")}
                          </span>
                        </span>
                      }
                    />
                  );
                })}
              </RadioGroup>
            </Field>

            <div className="flex flex-wrap items-end gap-3">
              <Field label={c("Quantity", "Adet")} className="w-32">
                <NumberInput value={qty} min={1} max={Math.max(1, Math.min(20, stock))} precision={0} stepper onValueChange={(v) => setQty(v ?? 1)} disabled={state === "out"} />
              </Field>
              {state === "out" ? (
                <Button
                  variant="secondary"
                  size="lg"
                  className="min-w-0 flex-1 basis-48"
                  onClick={() => toast(c("We’ll email you when it’s back", "Stoğa girince size e-posta göndereceğiz"), { description: `${name} — ${optionText}` })}
                >
                  {c("Notify me when back", "Gelince haber ver")}
                </Button>
              ) : (
                <Button variant="primary" size="lg" className="min-w-0 flex-1 basis-48" onClick={addToCart}>
                  {c("Add to cart", "Sepete ekle")}
                  <span aria-hidden className="opacity-60">·</span>
                  <span className="tabular">{money(lineTotal)}</span>
                </Button>
              )}
            </div>
            <p role="status" className={cn("-mt-3 text-small", state === "out" ? "text-fg-muted" : state === "low" ? "text-warning" : "text-fg-muted")}>
              {state === "out"
                ? glazeOut
                  ? c(`${t(glaze.name)} is between firings — next batch due ${date(businessDay(9), { day: "numeric", month: "long" })}.`, `${t(glaze.name)} pişirim arasında — yeni parti ${date(businessDay(9), { day: "numeric", month: "long" })} bekleniyor.`)
                  : c("This size is sold out in this glaze. Try another size.", "Bu ölçü bu sırda tükendi. Başka bir ölçü deneyin.")
                : state === "low"
                  ? c(`Only ${stock} left in ${t(glaze.name)}.`, `${t(glaze.name)} renginde son ${stock} adet.`)
                  : c(`In stock — ${stock} ready to ship from İzmir.`, `Stokta — İzmir’den gönderime hazır ${stock} adet.`)}
            </p>

            <section aria-label={c("Delivery", "Teslimat")} className="surface rounded-ui-lg">
              <div className="flex items-start gap-3 border-b border-line p-4">
                <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
                <p className="text-small text-fg">
                  {c("Order in the next ", "Önümüzdeki ")}
                  <strong className="tabular font-medium">{countdown}</strong>
                  {c(" and it ships today.", " içinde sipariş verin, bugün kargoda.")}
                </p>
              </div>
              <ul className="grid gap-3 p-4 text-small">
                <li className="flex items-start gap-3">
                  <Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                  <span className="text-fg-muted">
                    <span className="text-fg">{c("Standard", "Standart")}</span> · {f.dateRange(businessDay(2), businessDay(4), { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <PackageCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                  <span className="text-fg-muted">
                    <span className="text-fg">{c("Express", "Hızlı")}</span> · {date(businessDay(1), { weekday: "long", day: "numeric", month: "short" })}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Store aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                  <span className="text-fg-muted">{c("Collect from the Kadıköy studio today, free", "Kadıköy atölyesinden bugün ücretsiz teslim alın")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <RotateCcw aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                  <span className="text-fg-muted">{c("30-day returns. Arrived chipped? We replace it.", "30 gün iade. Kırık mı geldi? Yenisini göndeririz.")}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </StoreContainer>

      <StoreContainer id="product-tabs" className="scroll-mt-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label={c("Product information", "Ürün bilgileri")}>
            <TabsTrigger value="details">{c("Details", "Detaylar")}</TabsTrigger>
            <TabsTrigger value="size">{c("Size guide", "Ölçü rehberi")}</TabsTrigger>
            <TabsTrigger value="reviews">
              {c("Reviews", "Yorumlar")} <span className="tabular text-fg-subtle">{featured.reviewCount}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="pt-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="flex max-w-[60ch] flex-col gap-4 leading-relaxed text-fg">
                <p>{c("Every Tide plate is thrown in pairs on the same wheel, then trimmed by hand, so no two rims sit exactly alike. The satin glaze breaks pale over the rim and pools darker in the well.", "Her Gelgit tabağı aynı tornada çiftler hâlinde çekilir, sonra elle tıraşlanır; böylece hiçbir kenar birbirinin aynı olmaz. Saten sır kenarda açılır, çukurda koyulaşarak toplanır.")}</p>
                <p className="text-fg-muted">{c("Handmade: small pinholes, a slightly uneven foot and colour shifts between firings are part of each piece, not flaws.", "El yapımı: küçük iğne delikleri, hafif eğri bir taban ve pişirimler arası renk farkları her parçanın doğasıdır, kusur değildir.")}</p>
              </div>
              <dl className="grid grid-cols-[minmax(7rem,auto)_minmax(0,1fr)] border-t border-line text-small">
                {featured.details.map(([k, v]) => (
                  <React.Fragment key={k.en}>
                    <dt className="border-b border-line py-3 pe-4 text-fg-muted">{t(k)}</dt>
                    <dd className="border-b border-line py-3 text-fg">{t(v)}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </div>
          </TabsContent>

          <TabsContent value="size" className="pt-8">
            <TableContainer className="rounded-ui-lg border border-line">
              <Table aria-label={c("Tide plate sizes", "Gelgit tabak ölçüleri")}>
                <TableHeader>
                  <TableRow>
                    <TableHead>{c("Size", "Ölçü")}</TableHead>
                    <TableHead align="end">{c("Diameter", "Çap")}</TableHead>
                    <TableHead align="end">{c("Well", "İç çap")}</TableHead>
                    <TableHead align="end">{c("Height", "Yükseklik")}</TableHead>
                    <TableHead align="end">{c("Weight", "Ağırlık")}</TableHead>
                    <TableHead>{c("Good for", "Kullanım")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featured.sizeGuide.map(([id, dia, well, height, weight, use]) => {
                    const s = featured.sizes.find((x) => x.id === id)!;
                    return (
                      <TableRow key={id} selected={id === sizeId}>
                        <TableCell className="font-medium text-fg">{t(s.name)}</TableCell>
                        <TableCell align="end" className="tabular">{f.number(dia)} cm</TableCell>
                        <TableCell align="end" className="tabular">{f.number(well)} cm</TableCell>
                        <TableCell align="end" className="tabular">{f.number(height, { minimumFractionDigits: 1 })} cm</TableCell>
                        <TableCell align="end" className="tabular">{f.number(weight)} g</TableCell>
                        <TableCell className="text-fg-muted">{t(use)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <p className="mt-3 text-[12px] text-fg-subtle">{c("Handmade sizes vary by up to 5 mm. Measure your cupboard: the platter needs 33 cm of depth.", "El yapımı ölçüler 5 mm’ye kadar değişebilir. Dolabınızı ölçün: servis tabağı için 33 cm derinlik gerekir.")}</p>
          </TabsContent>

          <TabsContent value="reviews" className="pt-8">
            <div className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
              <div className="flex flex-col gap-4">
                <p className="font-display text-display-m text-fg tabular">{f.number(featured.rating)}</p>
                <RatingStars rating={featured.rating} label={c(`Rated ${f.number(featured.rating)} out of 5`, `5 üzerinden ${f.number(featured.rating)} puan`)} />
                <p className="text-small text-fg-muted">{c(`Based on ${featured.reviewCount} reviews`, `${featured.reviewCount} değerlendirmeye göre`)}</p>
                <ul className="mt-2 flex flex-col gap-2" aria-label={c("Ratings breakdown", "Puan dağılımı")}>
                  {ratingBreakdown.map((n, i) => (
                    <li key={i} className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-[12px] text-fg-muted">
                      <span className="tabular">{5 - i} ★</span>
                      <Progress size="xs" value={n} max={featured.reviewCount} aria-label={c(`${5 - i} stars: ${n} reviews`, `${5 - i} yıldız: ${n} değerlendirme`)} />
                      <span className="tabular text-end">{n}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="mt-2 w-fit" onClick={() => toast(c("Reviews open after delivery", "Değerlendirme teslimattan sonra açılır"), { description: c("We email you a link 7 days after your order arrives.", "Siparişiniz ulaştıktan 7 gün sonra size bir bağlantı göndeririz.") })}>
                  {c("Write a review", "Değerlendirme yaz")}
                </Button>
              </div>
              <ol className="flex flex-col">
                {reviews.map((r) => {
                  const g = featured.glazes.find((x) => x.id === r.glaze)!;
                  return (
                    <li key={r.id} className="flex flex-col gap-3 border-b border-line py-6 first:pt-0 last:border-b-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <RatingStars rating={r.rating} label={c(`${r.rating} out of 5`, `5 üzerinden ${r.rating}`)} />
                        <span className="text-[12px] text-fg-subtle">{f.date(r.date, "long")}</span>
                      </div>
                      <p className="max-w-[68ch] leading-relaxed text-fg">{t(r.text)}</p>
                      <p className="text-[12px] text-fg-muted">
                        {r.name} · {r.city} · {c("Glaze", "Sır")}: {t(g.name)} · <span className="text-success">{c("Verified purchase", "Doğrulanmış alışveriş")}</span>
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </TabsContent>
        </Tabs>
      </StoreContainer>

      <StoreContainer className="mt-20">
        <section aria-labelledby="related-title">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 id="related-title" className="font-display text-display-m text-fg">
              {c("Sets the table with", "Bununla iyi gider")}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {relatedIds.map((id) => (
              <ProductTile key={id} item={shopItems[id]!} onAdd={addRelated} />
            ))}
          </div>
        </section>
      </StoreContainer>
    </>
  );
}
