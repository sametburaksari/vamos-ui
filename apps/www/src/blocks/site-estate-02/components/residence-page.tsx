"use client";

import * as React from "react";
import { addIsoDays, Button, Checkbox, cn, DatePicker, Field, Image, Input, PhoneInput, Select, todayIso } from "@vamos-ui/react";
import { BlockHeading, Container, GallerySection, Section } from "@vamos-ui/react/blocks";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ADDRESS, eur, fill, num, residenceById, residences, type Residence } from "./content";
import { SlowReveal, useEstate } from "./estate-provider";

const c = {
  back: { en: "The collection", tr: "Koleksiyon" },
  onRequest: { en: "Price on request", tr: "Fiyat talep üzerine" },
  offMarket: { en: "Off-market · shown to registered buyers", tr: "Piyasa dışı · kayıtlı alıcılara gösterilir" },
  facts: { en: "Key facts", tr: "Temel bilgiler" },
  area: { en: "Interior", tr: "İç alan" },
  plot: { en: "Land", tr: "Arsa" },
  bedrooms: { en: "Bedrooms", tr: "Yatak odası" },
  bathrooms: { en: "Bathrooms", tr: "Banyo" },
  year: { en: "Built", tr: "Yapım" },
  price: { en: "Asking price", tr: "İstenen fiyat" },
  storyEyebrow: { en: "The house", tr: "Ev" },
  planEyebrow: { en: "Walk the plan", tr: "Planda gezinin" },
  planTitle: { en: "Room by room, *at walking pace*", tr: "Oda oda, *yürür gibi*" },
  planLead: { en: "Point at a room — or use the arrow keys — and the photograph follows you through the house.", tr: "Bir odanın üzerine gelin — ya da ok tuşlarını kullanın — fotoğraf sizi evin içinde takip etsin." },
  planLabel: { en: "Floor plan of {name}, {floor}", tr: "{name} kat planı, {floor}" },
  room: { en: "Room {n} of {total}", tr: "Oda {n} / {total}" },
  north: { en: "N", tr: "K" },
  prevRoom: { en: "Previous room", tr: "Önceki oda" },
  nextRoom: { en: "Next room", tr: "Sonraki oda" },
  galleryEyebrow: { en: "Photographs", tr: "Fotoğraflar" },
  galleryTitle: { en: "In *November* light", tr: "*Kasım* ışığında" },
  viewEyebrow: { en: "Private viewing", tr: "Özel gösterim" },
  viewTitle: { en: "See it with the person who *knows it best*", tr: "Onu *en iyi tanıyan* kişiyle görün" },
  viewLead: { en: "Viewings are one party at a time and last about ninety minutes. We confirm by phone within one working day.", tr: "Gösterimler her seferinde tek bir grupla yapılır ve yaklaşık doksan dakika sürer. Bir iş günü içinde telefonla teyit ederiz." },
  name: { en: "Full name", tr: "Ad soyad" },
  email: { en: "Email", tr: "E-posta" },
  phone: { en: "Phone", tr: "Telefon" },
  date: { en: "Preferred day", tr: "Tercih edilen gün" },
  slot: { en: "Time of day", tr: "Günün saati" },
  morning: { en: "Morning light (09:30)", tr: "Sabah ışığı (09.30)" },
  afternoon: { en: "Afternoon (14:00)", tr: "Öğleden sonra (14.00)" },
  dusk: { en: "At dusk (17:00)", tr: "Alacakaranlık (17.00)" },
  funds: { en: "I can show proof of funds or a financing letter at the viewing.", tr: "Gösterimde fon belgesi ya da finansman yazısı sunabilirim." },
  consent: { en: "Vellacourt may contact me about this viewing (KVKK notice).", tr: "Vellacourt bu gösterim için benimle iletişime geçebilir (KVKK aydınlatma metni)." },
  required: { en: "Please fill this in.", tr: "Lütfen doldurun." },
  needConsent: { en: "We need your agreement to contact you.", tr: "Sizinle iletişim için onayınız gerekiyor." },
  submit: { en: "Request a viewing", tr: "Gösterim talep edin" },
  doneTitle: { en: "Thank you, {name}.", tr: "Teşekkürler, {name}." },
  doneBody: { en: "Selin Varol will call you before {date} to confirm the viewing of {house}.", tr: "Selin Varol, {house} gösterimini teyit etmek için {date} tarihinden önce sizi arayacak." },
  agent: { en: "Shown by Selin Varol · +90 216 000 00 00", tr: "Gösteren: Selin Varol · +90 216 000 00 00" },
  others: { en: "Also in the collection", tr: "Koleksiyonda ayrıca" },
};

/**
 * Signature: walk the plan. An architectural floor plan whose rooms are real buttons; hovering,
 * focusing or arrowing through them crossfades a large photograph of that room, with its size
 * and a line about it. The plan and the photograph stay in sync in both directions.
 */
function WalkThePlan({ r }: { r: Residence }) {
  const { t } = useEstate();
  const [active, setActive] = React.useState(r.rooms[0]!.id);
  const refs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  React.useEffect(() => setActive(r.rooms[0]!.id), [r]);
  const idx = Math.max(0, r.rooms.findIndex((x) => x.id === active));
  const room = r.rooms[idx]!;
  const move = (d: number) => {
    const n = (idx + d + r.rooms.length) % r.rooms.length;
    const next = r.rooms[n]!;
    setActive(next.id);
    return next.id;
  };

  return (
    <Section anchor="plan" aria-labelledby="vc-plan-title" theme={{ surface: "surface-2" }}>
      <Container>
        <div className="grid gap-6 @4xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @4xl:items-end">
          <div className="flex flex-col gap-4">
            <p className="text-small uppercase tracking-[0.22em] text-fg-muted">{t(c.planEyebrow)}</p>
            <BlockHeading id="vc-plan-title" level={2} size="display-l" text={t(c.planTitle)} />
          </div>
          <p className="max-w-[46ch] text-fg-muted">{t(c.planLead)}</p>
        </div>

        <div className="mt-12 grid gap-8 @5xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @5xl:items-start">
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-4 font-code text-[0.72rem] uppercase tracking-[0.16em] text-fg-muted">
              <span>{t(r.floor)}</span>
              <span aria-hidden className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-px bg-fg" />
                {t(c.north)}
              </span>
            </div>
            <div
              role="group"
              aria-label={fill(t(c.planLabel), { name: r.name, floor: t(r.floor) })}
              className="relative aspect-[3/2] w-full border-2 border-fg bg-surface"
              onKeyDown={(e) => {
                if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) {
                  e.preventDefault();
                  const id = move(e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1);
                  refs.current[id]?.focus();
                }
              }}
            >
              {/* hatched outer wall */}
              <div aria-hidden className="pointer-events-none absolute inset-[3.3%] border border-line" />
              {r.rooms.map((rm, i) => {
                const [x, y, w, h] = rm.rect;
                const on = rm.id === active;
                return (
                  <button
                    key={rm.id}
                    ref={(el) => {
                      refs.current[rm.id] = el;
                    }}
                    type="button"
                    tabIndex={on ? 0 : -1}
                    aria-pressed={on}
                    onMouseEnter={() => setActive(rm.id)}
                    onFocus={() => setActive(rm.id)}
                    onClick={() => setActive(rm.id)}
                    className={cn(
                      "group absolute flex flex-col items-start justify-end gap-0.5 border border-fg/70 p-2 text-start transition-colors duration-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent @3xl:p-3",
                      on ? "bg-accent text-accent-fg" : "bg-surface text-fg hover:bg-hover",
                    )}
                    style={{ left: `${(x / 600) * 100}%`, top: `${(y / 400) * 100}%`, width: `${(w / 600) * 100}%`, height: `${(h / 400) * 100}%` }}
                  >
                    <span className="hidden font-code text-[0.62rem] tabular-nums opacity-70 @3xl:block">{String(i + 1).padStart(2, "0")}</span>
                    <span className="max-w-full truncate text-[0.7rem] font-medium leading-tight @3xl:whitespace-normal @3xl:text-small">{t(rm.name)}</span>
                    <span className="hidden font-code text-[0.62rem] tabular-nums opacity-70 @4xl:block">{rm.size}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-small text-fg-muted tabular-nums">{fill(t(c.room), { n: idx + 1, total: r.rooms.length })}</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => move(-1)} aria-label={t(c.prevRoom)} className="rounded-full">
                  <ArrowLeft aria-hidden />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => move(1)} aria-label={t(c.nextRoom)} className="rounded-full">
                  <ArrowRight aria-hidden />
                </Button>
              </div>
            </div>
          </div>

          <figure className="flex flex-col gap-4">
            <div className="relative aspect-[3/2] overflow-hidden bg-skeleton">
              {r.rooms.map((rm) => (
                <div key={rm.id} aria-hidden={rm.id !== active} className="absolute inset-0 transition-[opacity,transform] duration-[1600ms] ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:duration-200" style={{ opacity: rm.id === active ? 1 : 0, transform: rm.id === active ? "scale(1)" : "scale(1.04)" }}>
                  <Image src={rm.photo.src} width={rm.photo.width} height={rm.photo.height} alt={rm.id === active ? t(rm.photo.alt) : ""} sizes="(min-width: 1280px) 55vw, 100vw" className="size-full" imgClassName="size-full object-cover" />
                </div>
              ))}
            </div>
            <figcaption className="grid gap-2 @2xl:grid-cols-[minmax(0,1fr)_auto] @2xl:items-baseline" aria-live="polite">
              <p className="font-display text-[1.75rem] leading-tight text-fg">{t(room.name)}</p>
              <p className="font-code text-small text-fg-muted tabular-nums">{room.size}</p>
              <p className="text-fg-muted @2xl:col-span-2">{t(room.note)}</p>
            </figcaption>
          </figure>
        </div>
      </Container>
    </Section>
  );
}

function ViewingForm({ r }: { r: Residence }) {
  const { t, locale } = useEstate();
  const [today, setToday] = React.useState<string | null>(null);
  const [day, setDay] = React.useState<string | null>(null);
  const [slot, setSlot] = React.useState("afternoon");
  const [funds, setFunds] = React.useState(false);
  const [consent, setConsent] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<string | null>(null);
  React.useEffect(() => setToday(todayIso("Europe/Istanbul")), []);
  React.useEffect(() => setDone(null), [r]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    const name = String(d.get("name") ?? "").trim();
    if (!name) next.name = t(c.required);
    if (!/^\S+@\S+\.\S+$/.test(String(d.get("email") ?? ""))) next.email = t(c.required);
    if (!day) next.day = t(c.required);
    if (!consent) next.consent = t(c.needConsent);
    setErrors(next);
    if (Object.keys(next).length) {
      e.currentTarget.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    setDone(name.split(" ")[0] ?? name);
  };

  const confirmBy = today ? new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "long" }).format(new Date(`${addIsoDays(today, 1)}T12:00:00`)) : "";

  return (
    <Section anchor="viewing" aria-labelledby="vc-view-title">
      <Container>
        <div className="grid gap-12 @4xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col gap-5">
            <p className="text-small uppercase tracking-[0.22em] text-fg-muted">{t(c.viewEyebrow)}</p>
            <BlockHeading id="vc-view-title" level={2} size="display-l" text={t(c.viewTitle)} />
            <p className="max-w-[44ch] text-fg-muted">{t(c.viewLead)}</p>
            <p className="text-small text-fg">{t(c.agent)}</p>
            <p className="text-small text-fg-muted">{ADDRESS}</p>
          </div>
          {done ? (
            <div role="status" className="flex flex-col gap-4 border-t border-fg pt-8">
              <Check aria-hidden className="size-6 text-accent-ink" />
              <p className="font-display text-display-m leading-none text-fg">{fill(t(c.doneTitle), { name: done })}</p>
              <p className="max-w-[48ch] text-fg-muted">{fill(t(c.doneBody), { date: confirmBy, house: r.name })}</p>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="grid gap-5 border-t border-fg pt-8 @2xl:grid-cols-2">
              <Field label={t(c.name)} required error={errors.name}>
                <Input name="name" autoComplete="name" />
              </Field>
              <Field label={t(c.email)} required error={errors.email}>
                <Input name="email" type="email" autoComplete="email" placeholder="name@example.com" />
              </Field>
              <Field label={t(c.phone)} optional>
                <PhoneInput name="phone" defaultCountry="TR" />
              </Field>
              <Field label={t(c.date)} required error={errors.day}>
                <DatePicker value={day} onValueChange={setDay} min={today ? addIsoDays(today, 2) : undefined} max={today ? addIsoDays(today, 90) : undefined} disabledDays={[{ dayOfWeek: [0] }]} />
              </Field>
              <Field label={t(c.slot)} className="@2xl:col-span-2">
                <Select
                  value={slot}
                  onValueChange={(v) => v && setSlot(v)}
                  items={[
                    { value: "morning", label: t(c.morning) },
                    { value: "afternoon", label: t(c.afternoon) },
                    { value: "dusk", label: t(c.dusk) },
                  ]}
                />
              </Field>
              <div className="flex flex-col gap-3 @2xl:col-span-2">
                <Checkbox id="vc-funds" checked={funds} onCheckedChange={(v) => setFunds(v === true)} label={t(c.funds)} />
                <Checkbox id="vc-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} label={t(c.consent)} aria-invalid={errors.consent ? true : undefined} />
                {errors.consent ? <p className="text-small font-medium text-danger">{errors.consent}</p> : null}
              </div>
              <Button type="submit" variant="primary" size="lg" className="self-start rounded-full @2xl:col-span-2 @2xl:justify-self-start">
                {t(c.submit)} <ArrowRight aria-hidden />
              </Button>
            </form>
          )}
        </div>
      </Container>
    </Section>
  );
}

export function ResidencePage() {
  const { t, locale, current, open } = useEstate();
  const r = residenceById(current);
  const facts: [string, string][] = [
    [t(c.area), `${num(r.area, locale)} m²`],
    ...(r.plot ? ([[t(c.plot), `${num(r.plot, locale)} m²`]] as [string, string][]) : []),
    [t(c.bedrooms), String(r.bedrooms)],
    [t(c.bathrooms), String(r.bathrooms)],
    [t(c.year), String(r.year)],
    [t(c.price), r.price ? eur(r.price, locale) : t(c.onRequest)],
  ];
  const gallery = Array.from(new Map(r.rooms.map((rm) => [rm.photo.src, rm.photo])).values());
  const others = residences.filter((x) => x.id !== r.id).slice(0, 3);

  return (
    <>
      <Section theme={{ mode: "dark" }} aria-labelledby="vc-res-title" className="relative isolate flex min-h-[max(40rem,92svh)] flex-col justify-end overflow-hidden !pb-12">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div key={r.id} className="size-full motion-safe:animate-[ui-fade-in_2.4s_ease-out]">
            <Image src={r.hero.src} width={r.hero.width} height={r.hero.height} alt="" focal={r.hero.focal} priority sizes="100vw" className="size-full" imgClassName="size-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_oklch,var(--scene)_92%,transparent),transparent_62%),linear-gradient(to_bottom,color-mix(in_oklch,var(--scene)_60%,transparent),transparent_24%)]" />
        </div>
        <Container className="pt-36">
          <a href="?page=collection" className="mb-8 inline-flex items-center gap-2 text-small text-fg-muted hover:text-fg focus-ring rounded-[2px]">
            <ArrowLeft aria-hidden className="size-4" /> {t(c.back)}
          </a>
          <div className="grid gap-6 @4xl:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] @4xl:items-end">
            <div className="flex flex-col gap-4">
              <p className="text-small uppercase tracking-[0.22em] text-fg-muted">{t(r.place)}</p>
              <h1 id="vc-res-title" tabIndex={-1} className="font-display text-display-xl leading-[0.95] text-fg outline-none">
                {r.name}
              </h1>
            </div>
            <div className="flex flex-col gap-1 @4xl:items-end @4xl:text-end">
              <p className="font-display text-[2rem] leading-none text-fg tabular-nums">{r.price ? eur(r.price, locale) : t(c.onRequest)}</p>
              {r.offMarket ? <p className="text-small text-fg-muted">{t(c.offMarket)}</p> : null}
            </div>
          </div>
        </Container>
      </Section>

      <Section aria-label={t(c.facts)} className="!py-0">
        <Container>
          <dl className="grid grid-cols-2 border-b border-line @3xl:grid-cols-3 @5xl:grid-cols-6">
            {facts.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 border-line py-6 pe-4 @5xl:border-e @5xl:ps-5 @5xl:first:ps-0 @5xl:last:border-e-0">
                <dt className="text-small text-fg-muted">{k}</dt>
                <dd className="font-display text-[1.5rem] leading-tight text-fg tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section aria-label={t(c.storyEyebrow)}>
        <Container>
          <SlowReveal className="grid gap-10 @4xl:grid-cols-[minmax(0,3fr)_minmax(0,6fr)_minmax(0,3fr)]">
            <p className="text-small uppercase tracking-[0.22em] text-fg-muted">{t(c.storyEyebrow)}</p>
            <div className="flex flex-col gap-6">
              <p className="font-display text-[clamp(1.4rem,1rem+1.6cqi,2.3rem)] leading-[1.22] text-fg text-pretty">{t(r.line)}</p>
              <p className="max-w-[62ch] text-fg-muted">{t(r.story)}</p>
            </div>
            <ul className="flex flex-col divide-y divide-line border-y border-line text-small text-fg">
              {r.features.map((f) => (
                <li key={f.en} className="py-3">
                  {t(f)}
                </li>
              ))}
            </ul>
          </SlowReveal>
        </Container>
      </Section>

      <WalkThePlan r={r} />

      <GallerySection
        locale={locale === "tr" ? "tr-TR" : "en-GB"}
        variant="filmstrip"
        lightbox
        eyebrow={t(c.galleryEyebrow)}
        title={t(c.galleryTitle)}
        images={[{ image: { ...r.hero, alt: t(r.hero.alt) } }, ...gallery.filter((p) => p.src !== r.hero.src).map((p) => ({ image: { ...p, alt: t(p.alt) } }))]}
      />

      <ViewingForm r={r} />

      <Section aria-labelledby="vc-others-title" theme={{ surface: "surface-2" }}>
        <Container>
          <h2 id="vc-others-title" className="text-small uppercase tracking-[0.22em] text-fg-muted">
            {t(c.others)}
          </h2>
          <ul className="mt-8 grid gap-8 @3xl:grid-cols-3">
            {others.map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => open(o.id)} className="group flex w-full flex-col gap-4 text-start focus-ring">
                  <span className="block overflow-hidden">
                    <Image src={o.hero.src} width={o.hero.width} height={o.hero.height} alt={t(o.hero.alt)} focal={o.hero.focal} aspect="4/3" sizes="(min-width: 1024px) 30vw, 100vw" imgClassName="transition-transform duration-[2400ms] ease-out motion-safe:group-hover:scale-[1.04]" />
                  </span>
                  <span className="font-display text-[1.5rem] leading-tight text-fg">{o.name}</span>
                  <span className="text-small text-fg-muted">
                    {t(o.place)} · {o.price ? eur(o.price, locale) : t(c.onRequest)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
