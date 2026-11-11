"use client";

import * as React from "react";
import { Badge, Breadcrumb, Button, Field, Image, NumberInput, RadioGroup, RadioGroupItem } from "@vamos-ui/react";
import { Container, RatingStars, Section, sitePageHref, Testimonials } from "@vamos-ui/react/blocks";
import { Leaf, Package, Truck } from "lucide-react";
import { categories, copyFor, products, productById } from "./content";
import { ProductCard } from "./product-card";
import { useStore } from "./store-provider";

const copy = {
  home: { en: "Kilnhouse", tr: "Kilnhouse" },
  shop: { en: "Shop", tr: "Mağaza" },
  details: { en: "Details", tr: "Detaylar" },
  size: { en: "Size", tr: "Ölçü" },
  capacity: { en: "Capacity", tr: "Hacim" },
  care: { en: "Care", tr: "Bakım" },
  clay: { en: "Clay", tr: "Kil" },
  batch: { en: "Kiln batch", tr: "Pişirim" },
  delivery: { en: "Wrapped in recycled paper and posted from Üsküdar. Free delivery over $75 / ₺2,500.", tr: "Geri dönüştürülmüş kâğıtla sarılıp Üsküdar’dan gönderilir. 2.500 ₺ / 75 $ üzeri ücretsiz kargo." },
  breakage: { en: "Arrived broken? Send a photo within 7 days and we post a new one.", tr: "Kırık mı geldi? 7 gün içinde fotoğraf gönderin, yenisini yollayalım." },
  handmade: { en: "Handmade: small marks, pinholes and colour shifts are part of each piece.", tr: "El yapımı: küçük izler, iğne delikleri ve renk geçişleri her parçanın bir parçasıdır." },
  reviewsTitle: { en: "What people *say*", tr: "İnsanlar ne *diyor*" },
  more: { en: "From the same *firing*", tr: "Aynı *pişirimden*" },
};

const reviews = [
  { quote: { en: "The clay-foot cups feel even better than they look. I bought two and came back for four more.", tr: "Kil tabanlı fincanlar göründüğünden de güzel. İki tane aldım, dört tane daha almaya geri geldim." }, author: "Selin A.", date: "2026-11-02", rating: 5 },
  { quote: { en: "One plate arrived with a chip; a new one was in the post the next morning, no questions.", tr: "Bir tabak çatlak geldi; ertesi sabah sorgusuz yenisi kargodaydı." }, author: "Tom R.", date: "2026-10-18", rating: 5 },
  { quote: { en: "Colour is a touch lighter than the photo, which I actually prefer. Heavy in a good way.", tr: "Renk fotoğraftakinden bir tık açık, ki ben bunu tercih ederim. İyi anlamda ağır." }, author: "Defne K.", date: "2026-10-09", rating: 4 },
];

/** Product detail: glaze-driven gallery, glaze picker, quantity, add to cart, specs and reviews. */
export function ProductPage() {
  const { t, s, fmt, currency, add, locale, selected, select } = useStore();
  const product = productById(selected.productId);
  const index = Math.max(0, product.glazes.findIndex((g) => g.id === selected.glazeId));
  const glaze = product.glazes[index]!;
  const [qty, setQty] = React.useState(1);
  const first = React.useRef(true);
  React.useEffect(() => {
    setQty(1);
    // A related card picked on this page: back to the top of the new product.
    if (first.current) first.current = false;
    else window.scrollTo({ top: 0 });
  }, [product.id]);
  const intl = locale === "tr" ? "tr-TR" : "en-US";
  const date = new Intl.DateTimeFormat(intl, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${product.batch}T00:00:00Z`));
  const cat = categories.find((c) => c.id === product.category)!;
  const soldOut = glaze.stock === 0;
  const related = products.filter((p) => p.id !== product.id && p.batch >= "2026-10-30").slice(0, 3);

  return (
    <>
      <Section theme={{ rhythm: "tight" }} aria-label={t(product.name)}>
        <Container>
          <Breadcrumb
            size="sm"
            className="mb-8"
            items={[
              { label: t(copy.home), href: sitePageHref("home") },
              { label: t(copy.shop), href: sitePageHref("shop") },
              { label: t(cat.label), href: sitePageHref("shop") },
              { label: t(product.name) },
            ]}
          />
          <div className="grid gap-10 @4xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] @4xl:gap-16">
            <div className="grid gap-3 @xl:grid-cols-[4.5rem_minmax(0,1fr)]">
              <div className="order-2 flex gap-2 @xl:order-1 @xl:flex-col" role="group" aria-label={s("glaze")}>
                {product.glazes.map((g, i) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => select(product.id, g.id)}
                    aria-label={s("showGlaze", { glaze: t(g.name) })}
                    aria-pressed={i === index}
                    className={`w-[4.5rem] overflow-hidden rounded-ui focus-ring ${i === index ? "ring-[1.5px] ring-fg ring-offset-2 ring-offset-scene" : "opacity-70 hover:opacity-100"}`}
                  >
                    <Image src={g.photo.src} width={g.photo.width} height={g.photo.height} focal={g.photo.focal} alt="" aspect="4/5" sizes="72px" />
                  </button>
                ))}
              </div>
              <div className="order-1 @xl:order-2">
                <Image key={glaze.id} src={glaze.photo.src} width={glaze.photo.width} height={glaze.photo.height} focal={glaze.photo.focal} alt={t(glaze.alt)} aspect="4/5" rounded="ui-lg" priority sizes="(min-width: 1024px) 50vw, 100vw" className="motion-safe:animate-[ui-fade_300ms_ease-out]" />
              </div>
            </div>

            <div className="flex flex-col gap-7 @4xl:sticky @4xl:top-24 @4xl:self-start">
              <div className="flex flex-col gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg-muted">
                  {t(cat.label)} · {s("fired", { date })}
                </p>
                <h1 className="font-display text-display-l text-fg">{t(product.name)}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="tabular text-h3 text-fg">{fmt(product.price[currency])}</p>
                  <span className="flex items-center gap-2 text-small text-fg-muted">
                    <RatingStars rating={product.rating} label={s("ratingLabel", { r: product.rating.toLocaleString(intl) })} />
                    {s("reviews", { n: product.reviews })}
                  </span>
                </div>
                <p className="max-w-[46ch] text-lead text-fg-muted">{t(product.short)}</p>
              </div>

              <Field label={`${s("glaze")}: ${t(glaze.name)}`}>
                <RadioGroup value={glaze.id} onValueChange={(v) => select(product.id, v)} orientation="horizontal" className="flex flex-wrap gap-2">
                  {product.glazes.map((g) => (
                    <RadioGroupItem
                      key={g.id}
                      value={g.id}
                      label={
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden className="size-4 rounded-full shadow-[inset_0_0_0_1px_var(--color-line)]" style={{ background: g.swatch }} />
                          {t(g.name)}
                          {g.stock === 0 ? <Badge size="sm">{s("soldOut")}</Badge> : null}
                        </span>
                      }
                    />
                  ))}
                </RadioGroup>
              </Field>

              <div className="flex flex-wrap items-end gap-3">
                <Field label={s("quantity")} className="w-36">
                  <NumberInput value={qty} min={1} max={Math.max(1, Math.min(20, glaze.stock))} precision={0} stepper onValueChange={(v) => setQty(v ?? 1)} disabled={soldOut} />
                </Field>
                <Button variant="primary" size="lg" className="min-w-48 flex-1" disabled={soldOut} onClick={() => add(product.id, glaze.id, qty)}>
                  {soldOut ? s("soldOut") : `${s("addToCart")} · ${fmt(Number(product.price[currency]) * qty)}`}
                </Button>
              </div>
              <p className={`text-small ${glaze.stock > 0 && glaze.stock <= 4 ? "text-warning" : "text-fg-muted"}`}>
                {soldOut ? s("soldOut") : glaze.stock <= 4 ? s("lowStock", { n: glaze.stock }) : s("inStock")}
              </p>

              <p className="max-w-[56ch] leading-relaxed text-fg">{t(product.story)}</p>

              <div>
                <h2 className="mb-3 text-small font-semibold text-fg">{t(copy.details)}</h2>
                <dl className="grid grid-cols-[8rem_minmax(0,1fr)] border-t border-line text-small">
                  {[
                    [copy.size, product.specs.size],
                    ...(product.specs.capacity ? [[copy.capacity, product.specs.capacity] as const] : []),
                    [copy.clay, product.specs.clay],
                    [copy.care, product.specs.care],
                  ].map(([k, v]) => (
                    <React.Fragment key={k.en}>
                      <dt className="border-b border-line py-2.5 text-fg-muted">{t(k)}</dt>
                      <dd className="border-b border-line py-2.5 text-fg">{t(v)}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </div>

              <ul className="flex flex-col gap-2.5 text-small text-fg-muted">
                <li className="flex gap-3"><Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-fg" />{t(copy.delivery)}</li>
                <li className="flex gap-3"><Package aria-hidden className="mt-0.5 size-4 shrink-0 text-fg" />{t(copy.breakage)}</li>
                <li className="flex gap-3"><Leaf aria-hidden className="mt-0.5 size-4 shrink-0 text-fg" />{t(copy.handmade)}</li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <Testimonials
        locale={intl}
        labels={copyFor(locale).labels}
        variant="reviews"
        theme={{ surface: "surface-2" }}
        title={t(copy.reviewsTitle)}
        summary={{ rating: product.rating, count: product.reviews, source: "direct" }}
        items={reviews.map((r) => ({ quote: t(r.quote), author: r.author, date: r.date, rating: r.rating, source: "direct" as const }))}
      />

      <Section aria-label={t(copy.more)}>
        <Container>
          <h2 className="mb-10 font-display text-display-m text-fg">
            {t(copy.more).split("*").map((part, i) => (i === 1 ? <em key={i}>{part}</em> : part))}
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 @xl:grid-cols-2 @4xl:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
