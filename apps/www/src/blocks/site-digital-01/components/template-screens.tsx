"use client";

import { Avatar, Badge, Button, cn, Image, Input, Progress, Sparkline, Switch } from "@vamos-ui/react";
import { ArrowUpRight, Check, CreditCard, LayoutGrid, Search, Settings, Users } from "lucide-react";
import type { L, Template } from "./content";

/**
 * The screens inside a template preview. They are rendered at the preview's device width inside
 * a container (`@container`), so `@3xl:` / `@5xl:` respond to the simulated device, not the
 * viewport. No headings or landmarks: the preview is a picture of a page, made of live parts.
 */
export function TemplateScreen({ template, page, t, fmt }: { template: Template; page: string; t: (v: L) => string; fmt: Fmt }) {
  if (template.layout === "dashboard") return <Dashboard template={template} page={page} t={t} fmt={fmt} />;
  if (template.layout === "editorial") return <Editorial template={template} page={page} t={t} />;
  return <Landing template={template} page={page} t={t} fmt={fmt} />;
}

type Fmt = { money: (v: number) => string; num: (v: number) => string };

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

/* ------------------------------------------------------------------ */
/* Landing: Launchpad, Harbor                                          */
/* ------------------------------------------------------------------ */

function Landing({ template, page, t, fmt }: { template: Template; page: string; t: (v: L) => string; fmt: Fmt }) {
  const nav = (
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 @3xl:px-10">
      <span className="flex items-center gap-2 font-display text-[17px] font-semibold text-fg">
        <span className="size-4 rounded-[5px] bg-accent" />
        {template.brand}
      </span>
      <span className="hidden gap-6 text-[13px] text-fg-muted @3xl:flex">
        <span>{t({ en: "Product", tr: "Ürün" })}</span>
        <span className={page === "pricing" ? "text-fg" : ""}>{t({ en: "Pricing", tr: "Fiyatlar" })}</span>
        <span>{t({ en: "Customers", tr: "Müşteriler" })}</span>
        <span>{t({ en: "Changelog", tr: "Yenilikler" })}</span>
      </span>
      <Button size="sm" variant="primary">
        {t({ en: "Start free", tr: "Ücretsiz başla" })}
      </Button>
    </div>
  );

  if (page === "signin")
    return (
      <div className="flex min-h-full flex-col bg-scene">
        {nav}
        <div className="grid flex-1 place-items-center px-5 py-14">
          <div className="surface w-full max-w-[380px] rounded-ui-lg p-7">
            <p className="font-display text-[24px] font-semibold text-fg">{t({ en: "Welcome back", tr: "Tekrar hoş geldiniz" })}</p>
            <p className="mt-1 text-[13px] text-fg-muted">{t({ en: "Sign in to your workspace.", tr: "Çalışma alanınıza giriş yapın." })}</p>
            <div className="mt-6 flex flex-col gap-3">
              <span className="text-[12px] font-medium text-fg">{t({ en: "Work email", tr: "İş e-postası" })}</span>
              <Input defaultValue="sam@tidewell.example.com" aria-label="Email" readOnly />
              <span className="text-[12px] font-medium text-fg">{t({ en: "Password", tr: "Parola" })}</span>
              <Input type="password" defaultValue="••••••••••" aria-label="Password" readOnly />
              <Button variant="primary" block className="mt-2">
                {t({ en: "Sign in", tr: "Giriş yap" })}
              </Button>
              <Button variant="secondary" block>
                {t({ en: "Send me a magic link", tr: "Bana sihirli bağlantı gönder" })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );

  if (page === "pricing") {
    const plans = [
      { name: "Starter", price: 0, items: [t({ en: "3 projects", tr: "3 proje" }), t({ en: "1 GB storage", tr: "1 GB alan" }), t({ en: "Community support", tr: "Topluluk desteği" })] },
      { name: "Team", price: 24, items: [t({ en: "Unlimited projects", tr: "Sınırsız proje" }), t({ en: "Roles & audit log", tr: "Roller ve denetim kaydı" }), t({ en: "Priority email", tr: "Öncelikli e-posta" })], featured: true },
      { name: "Scale", price: 59, items: [t({ en: "SSO & SCIM", tr: "SSO ve SCIM" }), t({ en: "99.95% uptime SLA", tr: "%99,95 erişim SLA" }), t({ en: "Named success lead", tr: "Size özel başarı yöneticisi" })] },
    ];
    return (
      <div className="min-h-full bg-scene">
        {nav}
        <div className="px-5 py-12 text-center @3xl:px-10">
          <p className="font-display text-[clamp(28px,6cqi,52px)] leading-[1.05] font-semibold tracking-[-0.02em] text-fg">{t({ en: "Simple plans, billed per seat", tr: "Basit planlar, kullanıcı başına" })}</p>
          <div className="mx-auto mt-5 inline-flex rounded-full border border-line bg-surface p-1 text-[12px]">
            <span className="rounded-full px-3 py-1 text-fg-muted">{t({ en: "Monthly", tr: "Aylık" })}</span>
            <span className="rounded-full bg-accent px-3 py-1 text-accent-fg">{t({ en: "Yearly −20%", tr: "Yıllık −%20" })}</span>
          </div>
          <div className="mx-auto mt-9 grid max-w-[1000px] gap-4 text-start @3xl:grid-cols-3">
            {plans.map((p) => (
              <div key={p.name} className={cn("surface flex flex-col gap-4 rounded-ui-lg p-6", p.featured && "ring-2 ring-accent")}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-fg">{p.name}</span>
                  {p.featured ? <Badge tone="accent">{t({ en: "Most picked", tr: "En çok seçilen" })}</Badge> : null}
                </div>
                <p className="tabular font-display text-[34px] font-semibold text-fg">
                  {fmt.money(p.price)}
                  <span className="text-[13px] font-normal text-fg-muted"> /{t({ en: "seat/mo", tr: "kişi/ay" })}</span>
                </p>
                <ul className="flex flex-col gap-2 text-[13px] text-fg-muted">
                  {p.items.map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="size-3.5 text-accent-ink" />
                      {i}
                    </li>
                  ))}
                </ul>
                <Button variant={p.featured ? "primary" : "secondary"} block>
                  {p.price ? t({ en: "Start 14-day trial", tr: "14 gün dene" }) : t({ en: "Start free", tr: "Ücretsiz başla" })}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-scene">
      {nav}
      <div className="grid items-center gap-10 px-5 py-12 @3xl:grid-cols-[1fr_1.1fr] @3xl:px-10 @3xl:py-16">
        <div className="flex flex-col gap-5">
          <Badge tone="accent" className="self-start">
            {t({ en: "New · shared inboxes", tr: "Yeni · ortak gelen kutuları" })}
          </Badge>
          <p className="font-display text-[clamp(34px,7cqi,64px)] leading-[1] font-semibold tracking-[-0.03em] text-fg">
            {t({ en: "Every customer message, one calm queue.", tr: "Her müşteri mesajı, tek sakin kuyruk." })}
          </p>
          <p className="max-w-[440px] text-[15px] leading-relaxed text-fg-muted">
            {t({ en: "Email, chat and forms land in one place, get routed to the right person and answered in under an hour.", tr: "E-posta, sohbet ve formlar tek yerde toplanır, doğru kişiye yönlenir ve bir saatin altında yanıtlanır." })}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">{t({ en: "Start free", tr: "Ücretsiz başla" })}</Button>
            <Button variant="secondary">{t({ en: "Book a demo", tr: "Demo planla" })}</Button>
          </div>
          <p className="text-[12px] text-fg-subtle">{t({ en: "No card needed · 14-day trial · cancel any time", tr: "Kart gerekmez · 14 gün deneme · istediğiniz an iptal" })}</p>
        </div>
        <div className="surface flex flex-col gap-3 rounded-ui-lg p-4">
          {[
            { n: "Leyla Aydın", s: t({ en: "Invoice for October is missing VAT", tr: "Ekim faturasında KDV eksik" }), tag: t({ en: "Billing", tr: "Fatura" }), p: 92 },
            { n: "Tom Becker", s: t({ en: "Can we add two more seats?", tr: "İki kullanıcı daha ekleyebilir miyiz?" }), tag: t({ en: "Sales", tr: "Satış" }), p: 64 },
            { n: "Selin Kaya", s: t({ en: "Export stuck at 80%", tr: "Dışa aktarma %80’de takıldı" }), tag: t({ en: "Support", tr: "Destek" }), p: 38 },
          ].map((m) => (
            <div key={m.n} className="flex items-center gap-3 rounded-ui border border-line bg-surface-2 p-3">
              <Avatar name={m.n} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-fg">{m.s}</p>
                <Progress value={m.p} aria-label="SLA" className="mt-2 h-1" />
              </div>
              <Badge tone="neutral">{m.tag}</Badge>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            {[
              ["38m", t({ en: "first reply", tr: "ilk yanıt" })],
              ["96%", t({ en: "within SLA", tr: "SLA içinde" })],
              ["4.8", t({ en: "CSAT", tr: "Memnuniyet" })],
            ].map(([v, l]) => (
              <div key={l} className="rounded-ui bg-accent-soft py-2">
                <p className="tabular font-display text-[18px] font-semibold text-accent-ink">{v}</p>
                <p className="text-[11px] text-fg-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2 border-t border-line px-5 py-6 text-[13px] font-medium tracking-[0.06em] text-fg-subtle uppercase">
        <span>Brightloom</span>
        <span>Orchard&nbsp;Lane</span>
        <span>Kitemark</span>
        <span>Halden</span>
        <span>Yellowpine</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard: Ledger, Quarry                                           */
/* ------------------------------------------------------------------ */

const customers = [
  { name: "Brightloom Ltd", city: "Manchester", mrr: 4200, status: "paid" as const, due: "2026-11-02" },
  { name: "Orchard Lane Studio", city: "İzmir", mrr: 1850, status: "due" as const, due: "2026-11-15" },
  { name: "Kitemark Labs", city: "Rotterdam", mrr: 9600, status: "paid" as const, due: "2026-11-01" },
  { name: "Halden Freight", city: "Mersin", mrr: 3120, status: "late" as const, due: "2026-10-24" },
  { name: "Yellowpine Co-op", city: "Porto", mrr: 760, status: "paid" as const, due: "2026-11-05" },
  { name: "Saffron Works", city: "Bursa", mrr: 2480, status: "due" as const, due: "2026-11-20" },
];

function Dashboard({ template, page, t, fmt }: { template: Template; page: string; t: (v: L) => string; fmt: Fmt }) {
  const statusTone = { paid: "success", due: "warning", late: "danger" } as const;
  const statusLabel = { paid: t({ en: "Paid", tr: "Ödendi" }), due: t({ en: "Due", tr: "Vadesi yakın" }), late: t({ en: "Late", tr: "Gecikmiş" }) };
  const nav = [
    { id: "overview", icon: LayoutGrid, label: t({ en: "Overview", tr: "Genel bakış" }) },
    { id: "customers", icon: Users, label: t({ en: "Customers", tr: "Müşteriler" }) },
    { id: "invoices", icon: CreditCard, label: t({ en: "Invoices", tr: "Faturalar" }) },
    { id: "settings", icon: Settings, label: t({ en: "Settings", tr: "Ayarlar" }) },
  ];

  let body: React.ReactNode;
  if (page === "customers") {
    body = (
      <>
        <div className="flex flex-wrap items-center gap-3">
          <Input leading={<Search className="size-4" />} placeholder={t({ en: "Search customers", tr: "Müşteri ara" })} aria-label="Search" className="w-full @3xl:w-72" readOnly />
          <Badge tone="accent">{t({ en: "Active · 128", tr: "Aktif · 128" })}</Badge>
          <Badge tone="neutral">{t({ en: "Churned · 9", tr: "Ayrılan · 9" })}</Badge>
        </div>
        <div className="surface overflow-hidden rounded-ui-lg">
          {customers.map((c) => (
            <div key={c.name} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-4 py-3 last:border-0 @3xl:grid-cols-[1.6fr_1fr_1fr_auto]">
              <span className="flex min-w-0 items-center gap-3">
                <Avatar name={c.name} size="sm" shape="square" />
                <span className="truncate text-[13px] font-medium text-fg">{c.name}</span>
              </span>
              <span className="hidden text-[13px] text-fg-muted @3xl:block">{c.city}</span>
              <span className="tabular hidden text-[13px] text-fg @3xl:block">{fmt.money(c.mrr)}</span>
              <Badge tone={statusTone[c.status]}>{statusLabel[c.status]}</Badge>
            </div>
          ))}
        </div>
      </>
    );
  } else if (page === "settings") {
    body = (
      <div className="grid gap-4 @4xl:grid-cols-2">
        <div className="surface flex flex-col gap-3 rounded-ui-lg p-5">
          <p className="font-medium text-fg">{t({ en: "Company", tr: "Şirket" })}</p>
          <span className="text-[12px] text-fg-muted">{t({ en: "Legal name", tr: "Ticari unvan" })}</span>
          <Input defaultValue={template.brand} aria-label="Legal name" readOnly />
          <span className="text-[12px] text-fg-muted">{t({ en: "Invoice prefix", tr: "Fatura ön eki" })}</span>
          <Input defaultValue="NB-2026-" aria-label="Prefix" readOnly className="font-mono" />
        </div>
        <div className="surface flex flex-col gap-4 rounded-ui-lg p-5">
          <p className="font-medium text-fg">{t({ en: "Reminders", tr: "Hatırlatmalar" })}</p>
          <Switch defaultChecked label={t({ en: "Email 3 days before due", tr: "Vadeden 3 gün önce e-posta" })} />
          <Switch defaultChecked label={t({ en: "Email on the due date", tr: "Vade gününde e-posta" })} />
          <Switch label={t({ en: "SMS when 7 days late", tr: "7 gün gecikmede SMS" })} />
          <Button variant="primary" className="self-start">
            {t({ en: "Save changes", tr: "Değişiklikleri kaydet" })}
          </Button>
        </div>
      </div>
    );
  } else {
    const kpis = [
      { l: t({ en: "Cash in bank", tr: "Bankadaki nakit" }), v: fmt.money(184300), d: "+6.2%", s: [12, 14, 13, 16, 18, 17, 21, 22] },
      { l: t({ en: "Outstanding", tr: "Tahsil edilecek" }), v: fmt.money(42870), d: "−3.1%", s: [9, 11, 10, 12, 10, 9, 8, 8] },
      { l: t({ en: "Runway", tr: "Nakit pisti" }), v: t({ en: "19 months", tr: "19 ay" }), d: "+1", s: [14, 15, 15, 16, 17, 18, 18, 19] },
      { l: t({ en: "Late invoices", tr: "Geciken fatura" }), v: fmt.num(4), d: "−2", s: [7, 6, 8, 6, 5, 6, 5, 4] },
    ];
    const months = [62, 71, 58, 80, 76, 88, 94, 83, 97];
    body = (
      <>
        <div className="grid grid-cols-2 gap-3 @4xl:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.l} className="surface flex flex-col gap-2 rounded-ui-lg p-4">
              <span className="text-[12px] text-fg-muted">{k.l}</span>
              <span className="tabular font-display text-[22px] font-semibold text-fg">{k.v}</span>
              <span className="flex items-center justify-between gap-2">
                <span className="tabular text-[11.5px] text-accent-ink">{k.d}</span>
                <Sparkline values={k.s} size="xs" aria-hidden />
              </span>
            </div>
          ))}
        </div>
        <div className="grid gap-3 @4xl:grid-cols-[1.4fr_1fr]">
          <div className="surface flex flex-col gap-4 rounded-ui-lg p-5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-fg">{t({ en: "Collected per month", tr: "Aylık tahsilat" })}</span>
              <Badge tone="neutral">2026</Badge>
            </div>
            <div className="flex h-36 items-end gap-2">
              {months.map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} className={cn("flex-1 rounded-t-[4px]", i === months.length - 1 ? "bg-accent" : "bg-accent-soft")} />
              ))}
            </div>
          </div>
          <div className="surface flex flex-col gap-3 rounded-ui-lg p-5">
            <span className="text-[13px] font-medium text-fg">{t({ en: "Due this week", tr: "Bu hafta vadesi gelenler" })}</span>
            {customers.slice(1, 5).map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="truncate text-fg">{c.name}</span>
                <span className="tabular shrink-0 text-fg-muted">{fmt.money(c.mrr)}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex min-h-full bg-scene">
      <aside className="surface-nav hidden w-56 shrink-0 flex-col gap-1 p-3 @3xl:flex">
        <span className="mb-4 flex items-center gap-2 px-2 pt-1 text-[14px] font-semibold text-nav-fg-strong">
          <span className="size-4 rounded-[4px] bg-accent" />
          {template.brand}
        </span>
        {nav.map((n) => (
          <span key={n.id} className={cn("flex items-center gap-2.5 rounded-ui px-2.5 py-2 text-[13px]", n.id === page ? "bg-nav-active text-nav-fg-strong" : "text-nav-fg")}>
            <n.icon className="size-4" />
            {n.label}
          </span>
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 @3xl:p-7">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-[22px] font-semibold text-fg">{nav.find((n) => n.id === page)?.label ?? nav[0]!.label}</p>
          <span className="flex items-center gap-2">
            <Button size="sm" variant="primary">
              {t({ en: "New invoice", tr: "Yeni fatura" })}
            </Button>
            <Avatar name="Derin Aksu" size="sm" />
          </span>
        </div>
        {body}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editorial: Almanac, Fieldbook                                       */
/* ------------------------------------------------------------------ */

const pics = {
  river: { ...unsplash("1513635269975-59663e0ac1ad", 1200, 800), alt: "" },
  roofs: { ...unsplash("1524231757912-21f4fe3a7200", 900, 700), alt: "" },
  desk: { ...unsplash("1434030216411-0b793f4b4173", 900, 700), alt: "" },
};

function Editorial({ template, page, t }: { template: Template; page: string; t: (v: L) => string }) {
  const mast = (
    <div className="border-b border-line px-5 pt-6 pb-4 text-center @3xl:px-10">
      <p className="text-[11px] tracking-[0.18em] text-fg-muted uppercase">{t({ en: "Issue 41 · November 2026", tr: "Sayı 41 · Kasım 2026" })}</p>
      <p className="mt-2 font-display text-[clamp(30px,7cqi,64px)] leading-none tracking-[-0.02em] text-fg">{template.brand}</p>
      <div className="mt-4 flex justify-center gap-5 text-[12.5px] text-fg-muted">
        <span>{t({ en: "Cities", tr: "Şehirler" })}</span>
        <span>{t({ en: "Design", tr: "Tasarım" })}</span>
        <span>{t({ en: "Notes", tr: "Notlar" })}</span>
        <span className={page === "about" ? "text-fg" : ""}>{t({ en: "About", tr: "Hakkında" })}</span>
      </div>
    </div>
  );
  const story = { en: "The slow city: what we lose when every street is optimised", tr: "Yavaş şehir: her sokak optimize edilince ne kaybediyoruz" };

  if (page === "article")
    return (
      <div className="min-h-full bg-scene">
        {mast}
        <article className="mx-auto max-w-[680px] px-5 py-10">
          <p className="text-[12px] tracking-[0.12em] text-accent-ink uppercase">{t({ en: "Essay · 12 min", tr: "Deneme · 12 dk" })}</p>
          <p className="mt-3 font-display text-[clamp(28px,5.5cqi,46px)] leading-[1.08] text-fg">{t(story)}</p>
          <p className="mt-4 text-[13px] text-fg-muted">{t({ en: "By Ada Rennick · 6 November 2026", tr: "Ada Rennick · 6 Kasım 2026" })}</p>
          <Image {...pics.river} aspect="16/9" className="my-0! mt-7 rounded-ui" sizes="680px" />
          <div className="mt-7 flex flex-col gap-4 text-[16px] leading-[1.75] text-fg">
            <p>{t({ en: "On the morning the new traffic plan went live, the bakery on the corner lost its queue. Nobody had decided that; the light simply turned green eleven seconds sooner.", tr: "Yeni trafik planının devreye girdiği sabah köşedeki fırın kuyruğunu kaybetti. Kimse buna karar vermemişti; ışık yalnızca on bir saniye erken yeşile dönüyordu." })}</p>
            <p className="border-s-2 border-accent ps-5 font-display text-[22px] leading-snug">{t({ en: "“A street is a room with the ceiling taken off.”", tr: "“Sokak, tavanı alınmış bir odadır.”" })}</p>
            <p>{t({ en: "What follows is a walk through four neighbourhoods that were made faster, and one that refused.", tr: "Ardından gelen, hızlandırılmış dört mahalle ve buna direnen birinde bir yürüyüş." })}</p>
          </div>
        </article>
      </div>
    );

  if (page === "about")
    return (
      <div className="min-h-full bg-scene">
        {mast}
        <div className="mx-auto grid max-w-[980px] gap-8 px-5 py-10 @3xl:grid-cols-[1fr_1.2fr]">
          <Image {...pics.desk} aspect="4/5" className="my-0! rounded-ui" sizes="400px" />
          <div className="flex flex-col gap-4">
            <p className="font-display text-[34px] leading-tight text-fg">{t({ en: "A quarterly for people who walk", tr: "Yürüyen insanlar için üç aylık bir dergi" })}</p>
            <p className="text-[15px] leading-relaxed text-fg-muted">{t({ en: "Four writers, one editor, no algorithm. We publish long essays four times a year and a short letter every other Sunday.", tr: "Dört yazar, bir editör, algoritma yok. Yılda dört kez uzun denemeler, iki pazarda bir kısa bir mektup yayımlıyoruz." })}</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {["Ada Rennick", "Kerem Talu", "Noor Haddad", "Iris Vale"].map((n) => (
                <span key={n} className="flex items-center gap-2 text-[13px] text-fg">
                  <Avatar name={n} size="sm" />
                  {n}
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input placeholder="you@example.com" aria-label="Email" readOnly />
              <Button variant="primary">{t({ en: "Subscribe", tr: "Abone ol" })}</Button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-full bg-scene">
      {mast}
      <div className="grid gap-8 px-5 py-8 @3xl:grid-cols-[1.5fr_1fr] @3xl:px-10">
        <div className="flex flex-col gap-4">
          <Image {...pics.river} aspect="3/2" className="my-0! rounded-ui" sizes="700px" />
          <p className="text-[12px] tracking-[0.12em] text-accent-ink uppercase">{t({ en: "Lead essay", tr: "Kapak denemesi" })}</p>
          <p className="font-display text-[clamp(26px,4.6cqi,44px)] leading-[1.08] text-fg">{t(story)}</p>
          <p className="text-[15px] leading-relaxed text-fg-muted">{t({ en: "Four neighbourhoods were made faster this year. We walked all of them, and one that refused.", tr: "Bu yıl dört mahalle hızlandırıldı. Hepsini yürüdük, bir de direneni." })}</p>
        </div>
        <div className="flex flex-col divide-y divide-line">
          {[
            { k: t({ en: "Design", tr: "Tasarım" }), h: t({ en: "Benches, and who they are for", tr: "Banklar ve kimin için oldukları" }) },
            { k: t({ en: "Cities", tr: "Şehirler" }), h: t({ en: "A ferry timetable, read as a poem", tr: "Şiir gibi okunan bir vapur tarifesi" }) },
            { k: t({ en: "Notes", tr: "Notlar" }), h: t({ en: "Eleven seconds of green light", tr: "On bir saniyelik yeşil ışık" }) },
          ].map((s, i) => (
            <div key={i} className="flex gap-4 py-4 first:pt-0">
              {i === 0 ? <Image {...pics.roofs} aspect="1/1" className="my-0! w-20 shrink-0 rounded-ui-sm" sizes="80px" /> : null}
              <div>
                <p className="text-[11px] tracking-[0.12em] text-accent-ink uppercase">{s.k}</p>
                <p className="mt-1 font-display text-[19px] leading-snug text-fg">{s.h}</p>
              </div>
            </div>
          ))}
          <p className="flex items-center gap-1 pt-4 text-[13px] text-fg-muted">
            {t({ en: "All 41 issues", tr: "41 sayının tümü" })} <ArrowUpRight className="size-3.5" />
          </p>
        </div>
      </div>
    </div>
  );
}
