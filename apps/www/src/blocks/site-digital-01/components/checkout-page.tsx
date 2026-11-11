"use client";

import * as React from "react";
import { Badge, Button, EmptyState, Field, Input, NativeSelect, Switch } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { CircleCheck, Download, KeyRound, Lock } from "lucide-react";
import { countries, COUPONS, fill, licenceById, templateById, UPDATES_PRICE } from "./content";
import { initialPreview, LivePreview } from "./live-preview";
import { useShop } from "./shop-provider";

const copy = {
  home: { en: "Gridwork", tr: "Gridwork" },
  crumb: { en: "Checkout", tr: "Ödeme" },
  eyebrow: { en: "Step 1 of 1 · instant download", tr: "Tek adım · anında indirme" },
  title: { en: "Order *summary*", tr: "Sipariş *özeti*" },
  lead: { en: "Check the licence, add lifetime updates if you want them, and pay. The download link and licence key arrive on this page and by email.", tr: "Lisansı kontrol edin, isterseniz ömür boyu güncelleme ekleyin ve ödeyin. İndirme bağlantısı ve lisans anahtarı bu sayfada ve e-postada." },
  item: { en: "Your template", tr: "Şablonunuz" },
  licence: { en: "{licence} licence", tr: "{licence} lisans" },
  change: { en: "Change licence", tr: "Lisansı değiştir" },
  updates: { en: "Lifetime updates", tr: "Ömür boyu güncelleme" },
  updatesHint: { en: "Every future version of this template, not just 12 months.", tr: "Yalnızca 12 ay değil, bu şablonun gelecekteki tüm sürümleri." },
  coupon: { en: "Discount code", tr: "İndirim kodu" },
  apply: { en: "Apply", tr: "Uygula" },
  couponOk: { en: "{code}: {pct} off the template", tr: "{code}: şablonda {pct} indirim" },
  couponBad: { en: "That code is not valid. Try GRID10.", tr: "Bu kod geçerli değil. GRID10’u deneyin." },
  country: { en: "Billing country", tr: "Fatura ülkesi" },
  email: { en: "Email for the download", tr: "İndirme için e-posta" },
  emailBad: { en: "Enter an email like you@example.com.", tr: "you@example.com gibi bir e-posta girin." },
  subtotal: { en: "Subtotal", tr: "Ara toplam" },
  discount: { en: "Discount", tr: "İndirim" },
  tax: { en: "Tax", tr: "Vergi" },
  total: { en: "Total", tr: "Toplam" },
  pay: { en: "Pay {total}", tr: "{total} öde" },
  paying: { en: "Processing…", tr: "İşleniyor…" },
  secure: { en: "Card payment through our processor. We never see your card number.", tr: "Kart ödemesi ödeme kuruluşumuz üzerinden. Kart numaranızı asla görmeyiz." },
  empty: { en: "Your cart is empty", tr: "Sepetiniz boş" },
  emptyText: { en: "Pick a template, try it live, then choose a licence.", tr: "Bir şablon seçin, canlı deneyin, sonra lisans seçin." },
  browse: { en: "Browse templates", tr: "Şablonlara göz at" },
  doneTitle: { en: "Thank you — {name} is yours", tr: "Teşekkürler — {name} artık sizin" },
  doneText: { en: "Order GW-26-30418. A copy of the link and key went to {email}.", tr: "Sipariş GW-26-30418. Bağlantı ve anahtarın bir kopyası {email} adresine gitti." },
  download: { en: "Download {file}", tr: "{file} indir" },
  key: { en: "Licence key", tr: "Lisans anahtarı" },
  again: { en: "Back to templates", tr: "Şablonlara dön" },
};

/** Checkout summary: one template + licence, lifetime updates, coupon, tax by country, pay. */
export function CheckoutPage() {
  const { c, cart, clearCart } = useShop();
  const { t, usd, f } = c;
  const [updates, setUpdates] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [applied, setApplied] = React.useState<string | null>(null);
  const [codeError, setCodeError] = React.useState<string | null>(null);
  const [country, setCountry] = React.useState(c.locale === "tr" ? "TR" : "DE");
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [paying, setPaying] = React.useState(false);
  const [done, setDone] = React.useState<{ name: string; email: string; version: string; id: string } | null>(null);

  const intro = (
    <PageIntro
      locale={c.intl}
      labels={c.labels}
      variant="simple"
      className="!pt-10 !pb-6 lg:!pt-14"
      breadcrumb={[{ label: t(copy.home), href: sitePageHref("home") }, { label: t(copy.crumb) }]}
      eyebrow={t(copy.eyebrow)}
      title={t(copy.title)}
      lead={t(copy.lead)}
    />
  );

  if (done)
    return (
      <>
        {intro}
        <Section theme={{ rhythm: "tight" }} aria-label={t(copy.crumb)} className="!pt-2">
          <Container size="prose">
            <div role="status" className="surface flex flex-col gap-5 rounded-ui-lg p-6 sm:p-8">
              <CircleCheck aria-hidden className="size-8 text-accent-ink" />
              <h2 className="font-display text-[1.8rem] leading-tight font-semibold tracking-[-0.02em] text-fg">{fill(t(copy.doneTitle), { name: done.name })}</h2>
              <p className="text-fg-muted">{fill(t(copy.doneText), { email: done.email })}</p>
              <Button asChild variant="primary" size="lg" className="self-start">
                <a href={`#download-${done.id}`}>
                  <Download aria-hidden />
                  {fill(t(copy.download), { file: `gridwork-${done.id}-${done.version}.zip` })}
                </a>
              </Button>
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-2 text-small text-fg-muted">
                  <KeyRound aria-hidden className="size-4" />
                  {t(copy.key)}
                </span>
                <code className="tabular rounded-ui-sm bg-surface-2 px-3 py-2 font-mono text-small text-fg select-all">GW-7Q4K-M2XD-91HT-LA3P</code>
              </div>
              <Button asChild variant="secondary" className="self-start">
                <a href={sitePageHref("home", "templates")}>{t(copy.again)}</a>
              </Button>
            </div>
          </Container>
        </Section>
      </>
    );

  if (!cart)
    return (
      <>
        {intro}
        <Section theme={{ rhythm: "tight" }} aria-label={t(copy.crumb)} className="!pt-2">
          <Container>
            <EmptyState
              title={t(copy.empty)}
              description={t(copy.emptyText)}
              actions={
                <Button asChild variant="primary">
                  <a href={sitePageHref("home", "templates")}>{t(copy.browse)}</a>
                </Button>
              }
            />
          </Container>
        </Section>
      </>
    );

  const tpl = templateById(cart.templateId);
  const lic = licenceById(cart.licence);
  const pct = applied ? (COUPONS[applied] ?? 0) : 0;
  const discount = Math.round(lic.price * pct * 100) / 100;
  const subtotal = lic.price + (updates ? UPDATES_PRICE : 0);
  const net = subtotal - discount;
  const ctry = countries.find((x) => x.id === country) ?? countries[0]!;
  const tax = Math.round(net * ctry.vat * 100) / 100;
  const total = net + tax;

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError(t(copy.emailBad));
      document.getElementById("gw-email")?.focus();
      return;
    }
    setEmailError(null);
    setPaying(true);
    window.setTimeout(() => {
      setPaying(false);
      setDone({ name: tpl.name, email: email.trim(), version: tpl.version, id: tpl.id });
      clearCart();
    }, 800);
  };

  return (
    <>
      {intro}
      <Section theme={{ rhythm: "tight" }} aria-label={t(copy.crumb)} className="!pt-2">
        <Container>
          <form onSubmit={pay} noValidate className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-8">
              <section aria-labelledby="gw-item" className="flex flex-col gap-4">
                <h2 id="gw-item" className="text-small font-medium text-fg">
                  {t(copy.item)}
                </h2>
                <div className="grid items-start gap-4 rounded-ui-lg border border-line p-3 sm:grid-cols-[14rem_1fr]">
                  <div className="overflow-hidden rounded-ui border border-line">
                    <LivePreview template={tpl} state={initialPreview(tpl)} variant="thumb" />
                  </div>
                  <div className="flex flex-col gap-2 p-1">
                    <p className="flex items-center justify-between gap-3">
                      <span className="font-display text-[1.4rem] font-semibold tracking-[-0.02em] text-fg">{tpl.name}</span>
                      <span className="tabular font-medium text-fg">{usd(lic.price)}</span>
                    </p>
                    <p className="text-small text-fg-muted">{t(tpl.tagline)}</p>
                    <p className="flex flex-wrap items-center gap-2 text-small">
                      <Badge tone="accent">{fill(t(copy.licence), { licence: t(lic.name) })}</Badge>
                      <span className="text-fg-muted">{t(lic.who)}</span>
                    </p>
                    <a href={sitePageHref("product")} className="mt-auto self-start rounded-[2px] text-small text-accent-ink underline underline-offset-4 focus-ring">
                      {t(copy.change)}
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-ui-lg border border-line p-4">
                  <Switch checked={updates} onCheckedChange={setUpdates} label={t(copy.updates)} description={t(copy.updatesHint)} />
                  <span className="tabular shrink-0 text-small text-fg">+{usd(UPDATES_PRICE)}</span>
                </div>
              </section>

              <section aria-label={t(copy.coupon)} className="grid gap-4 sm:grid-cols-2">
                <Field label={t(copy.coupon)} error={codeError ?? undefined} hint={applied ? fill(t(copy.couponOk), { code: applied, pct: f.percent(pct) }) : undefined}>
                  <div className="flex gap-2">
                    <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="font-mono" placeholder="GRID10" />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const k = code.trim();
                        if (COUPONS[k]) {
                          setApplied(k);
                          setCodeError(null);
                        } else {
                          setApplied(null);
                          setCodeError(t(copy.couponBad));
                        }
                      }}
                    >
                      {t(copy.apply)}
                    </Button>
                  </div>
                </Field>
                <Field label={t(copy.country)} hint={t(ctry.note)}>
                  <NativeSelect value={country} onChange={(e) => setCountry(e.target.value)} items={countries.map((x) => ({ value: x.id, label: t(x.name) }))} />
                </Field>
                <Field label={t(copy.email)} required error={emailError ?? undefined} className="sm:col-span-2">
                  <Input id="gw-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </Field>
              </section>
            </div>

            <aside aria-labelledby="gw-sum" className="lg:sticky lg:top-24 lg:self-start">
              <div className="surface flex flex-col gap-4 rounded-ui-lg p-6">
                <h2 id="gw-sum" className="text-small font-medium text-fg">
                  {t(copy.total)}
                </h2>
                <dl className="tabular flex flex-col gap-2 text-small">
                  <div className="flex justify-between gap-4">
                    <dt className="text-fg-muted">{t(copy.subtotal)}</dt>
                    <dd className="text-fg">{usd(subtotal)}</dd>
                  </div>
                  {discount ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-fg-muted">
                        {t(copy.discount)} · {applied}
                      </dt>
                      <dd className="text-accent-ink">−{usd(discount)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-4">
                    <dt className="text-fg-muted">
                      {t(copy.tax)} · {f.percent(ctry.vat)}
                    </dt>
                    <dd className="text-fg">{usd(tax)}</dd>
                  </div>
                </dl>
                <p className="tabular flex items-baseline justify-between gap-4 border-t border-line pt-4">
                  <span className="font-medium text-fg">{t(copy.total)}</span>
                  <span className="font-display text-[2.25rem] leading-none font-semibold tracking-[-0.03em] text-fg">{usd(total)}</span>
                </p>
                <Button type="submit" variant="primary" size="lg" block loading={paying} loadingText={t(copy.paying)}>
                  <Lock aria-hidden />
                  {fill(t(copy.pay), { total: usd(total) })}
                </Button>
                <p className="text-[12.5px] leading-relaxed text-fg-muted">{t(copy.secure)}</p>
              </div>
            </aside>
          </form>
        </Container>
      </Section>
    </>
  );
}
