"use client";

import * as React from "react";
import { Badge, buttonVariants, cn, Image, Switch } from "@vamos-ui/react";
import { Container, PageIntro, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { copyFor, fill, pets, team, type Vet } from "./content";
import { PET_ICONS, PetSwitch, usePet } from "./pet-provider";

const c = {
  crumb: { en: "Team", tr: "Ekip" },
  title: { en: "The people who will *know your pet*", tr: "Dostunuzu *tanıyacak* insanlar" },
  lead: { en: "Three vets, four nurses and a front desk that remembers names. You can always ask for the same vet again.", tr: "Üç veteriner hekim, dört hemşire ve isimleri unutmayan bir danışma. Her zaman aynı hekimi isteyebilirsiniz." },
  who: { en: "Your pet", tr: "Dostunuz" },
  only: { en: "Only show who sees {pets}", tr: "Yalnızca {pets} ile ilgilenenleri göster" },
  sees: { en: "Sees", tr: "Baktığı türler" },
  days: { en: "In clinic", tr: "Klinikte" },
  book: { en: "Request {name}", tr: "{name} ile randevu iste" },
  deskEyebrow: { en: "Front desk & nurses", tr: "Danışma ve hemşireler" },
  deskTitle: { en: "The *first* faces you meet", tr: "Karşılaşacağınız *ilk* yüzler" },
  deskLead: { en: "They weigh your pet, answer the phone at 03:00 and know which cats prefer the top shelf.", tr: "Dostunuzu tartar, gece 03:00’te telefonu açar ve hangi kedinin üst rafı sevdiğini bilirler." },
};

const DOW = { en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], tr: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"] };

const desk = [
  { name: "Ayla Durmaz", role: { en: "Veterinary nurse · rabbits and dental care", tr: "Veteriner hemşire · tavşanlar ve diş bakımı" } },
  { name: "Can Ilgaz", role: { en: "Veterinary nurse · anaesthesia and recovery", tr: "Veteriner hemşire · anestezi ve uyanma" } },
  { name: "Nehir Sarp", role: { en: "Veterinary nurse · out-of-hours lead", tr: "Veteriner hemşire · mesai dışı sorumlusu" } },
  { name: "Tuna Erkan", role: { en: "Front desk · insurance claims and payment plans", tr: "Danışma · sigorta talepleri ve ödeme planları" } },
  { name: "Sevgi Ataman", role: { en: "Front desk · reminders and records", tr: "Danışma · hatırlatmalar ve kayıtlar" } },
];

function VetCard({ vet }: { vet: Vet }) {
  const { t, locale } = usePet();
  const name = vet.title ? `${t(vet.title)} ${vet.name}` : vet.name;
  return (
    <article className="flex flex-col gap-5 rounded-[2rem] border border-line bg-surface p-4 animate-[ui-rise_320ms_cubic-bezier(0.2,0.8,0.2,1)_both] motion-reduce:animate-none @md:flex-row @md:p-5">
      <Image
        src={vet.photo.src}
        width={vet.photo.width}
        height={vet.photo.height}
        focal={vet.photo.focal}
        alt={t(vet.photo.alt)}
        aspect="4/5"
        sizes="(min-width: 640px) 200px, 100vw"
        className="w-full overflow-hidden rounded-[1.5rem] @md:w-48 @md:shrink-0"
      />
      <div className="flex min-w-0 flex-col gap-3 py-1">
        <div>
          <h2 className="font-display text-h3 text-fg">{name}</h2>
          <p className="text-small font-semibold text-accent-ink">{t(vet.role)}</p>
        </div>
        <p className="text-fg">{t(vet.focus)}</p>
        <p className="text-small text-fg-muted">{t(vet.bio)}</p>
        <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-y-2 text-small">
          <dt className="text-fg-muted">{t(c.sees)}</dt>
          <dd className="flex flex-wrap gap-1.5">
            {vet.pets.map((id) => {
              const Icon = PET_ICONS[id];
              return (
                <Badge key={id} tone="accent">
                  <Icon aria-hidden className="size-3" />
                  {t(pets[id].label)}
                </Badge>
              );
            })}
          </dd>
          <dt className="text-fg-muted">{t(c.days)}</dt>
          <dd className="flex flex-wrap gap-1">
            <span className="sr-only">{vet.days.map((d) => DOW[locale][d]).join(", ")}</span>
            {[1, 2, 3, 4, 5, 6].map((d) => (
              <span key={d} aria-hidden className={cn("grid h-6 min-w-9 place-items-center rounded-full px-1.5 text-[11px] font-semibold", vet.days.includes(d) ? "bg-fg text-scene" : "border border-dashed border-line text-fg-muted")}>
                {DOW[locale][d]}
              </span>
            ))}
          </dd>
        </dl>
        <a href={sitePageHref("services", "book")} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-auto self-start rounded-full")}>
          {fill(t(c.book), { name: vet.name.split(" ")[0]! })}
          <ArrowRight aria-hidden className="rtl:rotate-180" />
        </a>
      </div>
    </article>
  );
}

export function TeamPage() {
  const { t, locale, pet } = usePet();
  const { intl, labels } = copyFor(locale);
  const [only, setOnly] = React.useState(false);
  const list = only ? team.filter((v) => v.pets.includes(pet)) : team;
  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="ruled" breadcrumb={[{ label: "Pawbridge", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.crumb)} className="pt-0!">
        <Container>
          <div className="mb-10 flex flex-col gap-4 @3xl:flex-row @3xl:items-center @3xl:justify-between">
            <PetSwitch label={t(c.who)} size="md" />
            <Switch checked={only} onCheckedChange={setOnly} label={fill(t(c.only), { pets: t(pets[pet].plural) })} />
          </div>
          <ul className="grid gap-6 @5xl:grid-cols-2" aria-live="polite">
            {list.map((v) => (
              <li key={v.id}>
                <VetCard vet={v} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <Section theme={{ surface: "surface-2" }} headingId="pb-desk-h">
        <Container>
          <SectionHeader eyebrow={t(c.deskEyebrow)} title={t(c.deskTitle)} lead={t(c.deskLead)} align="split" headingId="pb-desk-h" className="mb-8" />
          <ul className="grid border-t border-line @3xl:grid-cols-2 @3xl:gap-x-12">
            {desk.map((p) => (
              <li key={p.name} className="flex flex-col gap-0.5 border-b border-line py-4">
                <span className="font-semibold text-fg">{p.name}</span>
                <span className="text-small text-fg-muted">{t(p.role)}</span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
