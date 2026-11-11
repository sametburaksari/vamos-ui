"use client";

import * as React from "react";
import { Avatar, Badge, Breadcrumb, Button, Image, Tabs, TabsContent, TabsList, TabsTrigger, toast, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Container, RatingStars, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { MapPin, MessageCircle, Plus } from "lucide-react";
import { categories, fill, isTopMaker, productById, productsOf, reviewsOf, sellerById, workshop } from "./content";
import { useMarket } from "./market-provider";
import { ProductCard } from "./product-card";
import { RatingBars, ratingCopy, TopMakerBadge } from "./seller-rating";

const copy = {
  home: { en: "Makersrow", tr: "Makersrow" },
  makers: { en: "Makers", tr: "Üreticiler" },
  since: { en: "On Makersrow since {y}", tr: "{y}’den beri Makersrow’da" },
  follow: { en: "Follow", tr: "Takip et" },
  followed: { en: "You’ll hear when {name} lists something new.", tr: "{name} yeni bir şey eklediğinde haber alacaksınız." },
  message: { en: "Message {name}", tr: "{name} ile yazış" },
  shop: { en: "Shop", tr: "Dükkân" },
  reviews: { en: "Reviews", tr: "Değerlendirmeler" },
  about: { en: "About", tr: "Hakkında" },
  all: { en: "All", tr: "Tümü" },
  pieces: { en: "{n} pieces", tr: "{n} ürün" },
  showing: { en: "Showing {n} of {total} reviews", tr: "{total} değerlendirmeden {n} tanesi" },
  showingStars: { en: "{stars}-star reviews: {n} shown", tr: "{stars} yıldızlı değerlendirmeler: {n} gösteriliyor" },
  allReviews: { en: "All reviews", tr: "Tüm değerlendirmeler" },
  noStars: { en: "No {stars}-star reviews in the latest batch. The bars count all {total}.", tr: "Son değerlendirmelerde {stars} yıldız yok. Çubuklar {total} değerlendirmenin tümünü sayar." },
  bought: { en: "Bought {product}", tr: "{product} aldı" },
  reply: { en: "Reply from {maker}", tr: "{maker} yanıtı" },
  policies: { en: "Shop policies", tr: "Dükkân kuralları" },
  pol: [
    { en: "Returns within 14 days, unused and in the original packing.", tr: "Kullanılmamış ve orijinal ambalajında 14 gün içinde iade." },
    { en: "Breakage in transit replaced free — send a photo within 48 hours.", tr: "Taşımada kırılan ürün ücretsiz değiştirilir — 48 saat içinde fotoğraf gönderin." },
    { en: "Payments are held by Makersrow until you confirm delivery.", tr: "Ödemeler teslimatı onaylayana kadar Makersrow’da tutulur." },
  ],
};

/** Seller page: header with the rating card, then Shop / Reviews / About. Review bars filter the list. */
export function SellerPage() {
  const { c, seller: sellerId } = useMarket();
  const { t, f, rating } = c;
  const seller = sellerById(sellerId);
  const items = productsOf(seller.id);
  const list = reviewsOf(seller.id);
  const [cat, setCat] = React.useState("all");
  const [stars, setStars] = React.useState<number | null>(null);
  const [tab, setTab] = React.useState("shop");
  const [shown, setShown] = React.useState(seller.id);
  if (shown !== seller.id) {
    setShown(seller.id);
    setCat("all");
    setStars(null);
    setTab("shop");
  }
  const cats = categories.filter((x) => items.some((p) => p.category === x.id));
  const visibleItems = items.filter((p) => cat === "all" || p.category === cat);
  const visibleReviews = list.filter((r) => stars === null || r.stars === stars);
  const cover = items[0]?.photo ?? workshop;
  const aboutPic = items[1] ?? items[0] ?? { photo: workshop, alt: workshop.alt };

  return (
    <>
      <Section theme={{ rhythm: "tight" }} headingId="mr-seller-title" className="!pt-6">
        <Container size="wide">
          <Breadcrumb items={[{ label: t(copy.home), href: sitePageHref("home") }, { label: t(copy.makers), href: sitePageHref("search") }, { label: seller.name }]} />
          <div aria-hidden className="mt-5 grid h-40 grid-cols-3 gap-1 overflow-hidden rounded-ui-lg sm:h-56">
            {(items.length ? items : [{ id: "w", photo: cover }]).slice(0, 3).map((p) => (
              <div key={p.id} className="relative min-w-0 bg-surface-2">
                <Image src={p.photo.src} width={p.photo.width} height={p.photo.height} alt="" sizes="33vw" className="my-0! absolute! inset-0 h-full w-full" />
              </div>
            ))}
          </div>
          <div className="relative -mt-10 grid gap-8 px-1 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="flex flex-col gap-4">
              <Avatar src={seller.avatar} name={seller.maker} size="xl" className="ring-4 ring-scene" />
              <div className="flex flex-wrap items-center gap-3">
                <h1 id="mr-seller-title" className="text-[clamp(1.9rem,4.5vw,3rem)] leading-none font-semibold tracking-[-0.03em] text-fg">
                  {seller.name}
                </h1>
                {isTopMaker(seller) ? <TopMakerBadge /> : null}
              </div>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-fg-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin aria-hidden className="size-3.5" />
                  {t(seller.city)}
                </span>
                <span>{seller.maker}</span>
                <span>{t(seller.craft)}</span>
                <span>{fill(t(copy.since), { y: seller.since })}</span>
              </p>
              <p className="max-w-2xl text-fg">{t(seller.bio)}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => toast.success(fill(t(copy.followed), { name: seller.name }))}>
                  <Plus aria-hidden />
                  {t(copy.follow)}
                </Button>
                <Button variant="secondary">
                  <MessageCircle aria-hidden />
                  {fill(t(copy.message), { name: seller.maker.split(" ")[0]! })}
                </Button>
              </div>
            </div>

            <div className="surface flex flex-col gap-3 self-start rounded-ui-lg p-5 lg:mt-14">
              <div className="flex items-end gap-3">
                <span className="tabular text-[3rem] leading-none font-semibold tracking-[-0.04em] text-fg">{rating(seller.rating)}</span>
                <span className="flex flex-col gap-1 pb-1">
                  <RatingStars rating={seller.rating} label={fill(t(ratingCopy.outOf), { rating: rating(seller.rating) })} />
                  <span className="text-[12px] text-fg-muted">{fill(t(ratingCopy.reviews), { n: f.number(seller.reviews) })}</span>
                </span>
              </div>
              <RatingBars
                seller={seller}
                active={stars}
                onPick={(s) => {
                  setStars((prev) => (prev === s ? null : s));
                  setTab("reviews");
                }}
              />
              <dl className="tabular grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
                <div>
                  <dt className="text-[11px] text-fg-muted">{t(ratingCopy.onTime)}</dt>
                  <dd className="font-semibold text-fg">{f.percent(seller.onTime)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-fg-muted">{t(ratingCopy.reply)}</dt>
                  <dd className="font-semibold text-fg">{fill(t(ratingCopy.hours), { n: seller.replyHours })}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-fg-muted">{t(ratingCopy.sales)}</dt>
                  <dd className="font-semibold text-fg">{f.number(seller.sales)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      <Section theme={{ rhythm: "tight" }} aria-label={seller.name} className="!pt-4">
        <Container size="wide">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="shop">
                {t(copy.shop)} <span className="tabular ms-1 text-fg-muted">{items.length}</span>
              </TabsTrigger>
              <TabsTrigger value="reviews">
                {t(copy.reviews)} <span className="tabular ms-1 text-fg-muted">{f.number(seller.reviews)}</span>
              </TabsTrigger>
              <TabsTrigger value="about">{t(copy.about)}</TabsTrigger>
            </TabsList>

            <TabsContent value="shop" className="pt-6">
              {cats.length > 1 ? (
                <ToggleGroup type="single" size="sm" value={cat} onValueChange={(v) => setCat(v || "all")} aria-label={t(copy.shop)} className="mb-6">
                  <ToggleGroupItem value="all">{t(copy.all)}</ToggleGroupItem>
                  {cats.map((x) => (
                    <ToggleGroupItem key={x.id} value={x.id}>
                      {t(x.label)}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              ) : null}
              <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4">
                {visibleItems.map((p) => (
                  <li key={p.id} className="min-w-0">
                    <ProductCard product={p} showSeller={false} />
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="reviews" className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="tabular text-small text-fg-muted" aria-live="polite">
                  {stars === null ? fill(t(copy.showing), { n: visibleReviews.length, total: f.number(seller.reviews) }) : fill(t(copy.showingStars), { stars, n: visibleReviews.length })}
                </p>
                {stars !== null ? (
                  <Button variant="ghost" size="sm" onClick={() => setStars(null)}>
                    {t(copy.allReviews)}
                  </Button>
                ) : null}
              </div>
              {visibleReviews.length ? (
                <ul role="list" className="mt-4 grid gap-4 md:grid-cols-2">
                  {visibleReviews.map((r, i) => (
                    <li key={i} className="surface flex flex-col gap-3 rounded-ui-lg p-5">
                      <div className="flex items-center justify-between gap-3">
                        <RatingStars rating={r.stars} label={fill(t(ratingCopy.outOf), { rating: r.stars })} />
                        <time dateTime={r.date} className="text-[12px] text-fg-muted">
                          {f.date(r.date, "medium")}
                        </time>
                      </div>
                      <p className="text-fg">{t(r.text)}</p>
                      <p className="text-[12.5px] text-fg-muted">
                        <span className="font-medium text-fg">{r.author}</span> · {r.city} · {fill(t(copy.bought), { product: t(productById(r.product).name) })}
                      </p>
                      {r.reply ? (
                        <div className="rounded-ui bg-surface-2 p-3 text-small">
                          <p className="font-medium text-fg">{fill(t(copy.reply), { maker: seller.maker })}</p>
                          <p className="mt-1 text-fg-muted">{t(r.reply)}</p>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 rounded-ui-lg border border-dashed border-line p-6 text-small text-fg-muted">{fill(t(copy.noStars), { stars: stars ?? 0, total: f.number(seller.reviews) })}</p>
              )}
            </TabsContent>

            <TabsContent value="about" className="pt-6">
              <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <div className="flex flex-col gap-4">
                  <p className="text-lead text-fg">{t(seller.bio)}</p>
                  <h2 className="mt-2 text-small font-semibold text-fg">{t(copy.policies)}</h2>
                  <ul className="flex list-disc flex-col gap-2 ps-5 text-small text-fg-muted marker:text-fg-subtle">
                    {copy.pol.map((p) => (
                      <li key={p.en}>{t(p)}</li>
                    ))}
                  </ul>
                </div>
                <Image src={aboutPic.photo.src} width={aboutPic.photo.width} height={aboutPic.photo.height} alt={t(aboutPic.alt)} aspect="4/3" className="my-0! rounded-ui-lg" sizes="(min-width: 768px) 40vw, 100vw" />
              </div>
              <Badge tone="neutral" className="mt-6">
                {seller.maker} · {t(seller.city)}
              </Badge>
            </TabsContent>
          </Tabs>
        </Container>
      </Section>
    </>
  );
}
