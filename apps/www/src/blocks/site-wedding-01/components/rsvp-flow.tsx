"use client";

import * as React from "react";
import { Alert, Button, Checkbox, CheckboxGroup, Field, foldText, Input, RadioGroup, Stepper, Textarea } from "@vamos-ui/react";
import { pickLocale, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowLeft, ArrowRight, CalendarPlus, Search } from "lucide-react";
import { diets, invitations, meals, type DietId, type Invitation, type L, type MealId, type SiteLocale } from "./content";

const c = {
  steps: { en: "Reply steps", tr: "Yanıt adımları" },
  sFind: { en: "Find you", tr: "Sizi bulalım" },
  sWho: { en: "Who’s coming", tr: "Kimler geliyor" },
  sDinner: { en: "Dinner", tr: "Yemek" },
  sLast: { en: "Last bits", tr: "Son ayrıntılar" },
  qFind: { en: "Find your invitation", tr: "Davetiyenizi bulun" },
  findLead: { en: "Type the name on your envelope — one of you is enough for a couple or a family.", tr: "Zarfın üzerindeki adı yazın — çift ya da aile için birinizin adı yeterli." },
  name: { en: "Your full name", tr: "Adınız soyadınız" },
  demo: { en: "This is a demo guest list: try Selin Aksoy, Marco Bellini or Aylin Yıldız.", tr: "Bu bir örnek davetli listesi: Selin Aksoy, Marco Bellini ya da Aylin Yıldız deneyin." },
  find: { en: "Find my invitation", tr: "Davetiyemi bul" },
  notFound: { en: "We couldn’t find “{q}”. Try the spelling on your envelope, or write to Defne.", tr: "“{q}” bulunamadı. Zarftaki yazılışı deneyin ya da Defne’ye yazın." },
  needName: { en: "Please type your name.", tr: "Lütfen adınızı yazın." },
  qWho: { en: "Who’s coming?", tr: "Kimler geliyor?" },
  whoLead: { en: "Your invitation is for {names}.", tr: "Davetiyeniz {names} için." },
  accept: { en: "Joyfully accepts", tr: "Seve seve katılıyor" },
  decline: { en: "Regretfully declines", tr: "Ne yazık ki katılamıyor" },
  pickReply: { en: "Choose a reply for {name}.", tr: "{name} için bir yanıt seçin." },
  plusTitle: { en: "Bringing someone?", tr: "Yanınızda biri olacak mı?" },
  plusLabel: { en: "Yes, I’m bringing a guest", tr: "Evet, bir misafir getiriyorum" },
  plusHint: { en: "Your invitation includes one guest. We’ll put their name on a place card.", tr: "Davetiyeniz bir misafir içeriyor. Adını yer kartına yazacağız." },
  plusName: { en: "Your guest’s full name", tr: "Misafirinizin adı soyadı" },
  plusNone: { en: "Your invitation is for the people named above. If that’s a problem, talk to us — we’d rather know.", tr: "Davetiyeniz yukarıda adı geçenler için. Bir sorun varsa bize söyleyin — bilmeyi tercih ederiz." },
  needPlus: { en: "Please add your guest’s name.", tr: "Lütfen misafirinizin adını yazın." },
  qDinner: { en: "Dinner at the long table", tr: "Uzun masada akşam yemeği" },
  dinnerLead: { en: "Meze and dessert are shared. Choose one main for each guest and tell us what they can’t eat — the kitchen reads every line.", tr: "Mezeler ve tatlı ortak. Her misafir için bir ana yemek seçin ve yiyemediklerini yazın — mutfak her satırı okuyor." },
  main: { en: "Main course", tr: "Ana yemek" },
  diet: { en: "Dietary needs", tr: "Beslenme ihtiyaçları" },
  dietOther: { en: "Anything else the kitchen should know", tr: "Mutfağın bilmesi gereken başka bir şey" },
  dietOtherHint: { en: "Optional. Allergies are taken seriously; we’ll call if anything is unclear.", tr: "İsteğe bağlı. Alerjileri ciddiye alıyoruz; belirsiz bir şey olursa ararız." },
  needMeal: { en: "Choose a main course.", tr: "Bir ana yemek seçin." },
  veganClash: { en: "Vegan is ticked — the courgette-flower dolma is the vegan main.", tr: "Vegan işaretli — vegan ana yemek kabak çiçeği dolması." },
  vegClash: { en: "Vegetarian is ticked — the courgette-flower dolma has no meat or fish.", tr: "Vejetaryen işaretli — kabak çiçeği dolmasında et ya da balık yok." },
  glutenOk: { en: "Gluten-free is ticked — the lamb comes with freekeh (wheat). The sea bass and the dolma are gluten-free.", tr: "Glutensiz işaretli — kuzu firikle (buğday) geliyor. Levrek ve dolma glutensiz." },
  useDolma: { en: "Switch to the dolma", tr: "Dolmaya geç" },
  guestOf: { en: "{name}’s guest", tr: "{name} misafiri" },
  child: { en: "Under 12", tr: "12 yaş altı" },
  noOne: { en: "Nobody is coming to dinner, so there’s nothing to choose. Continue to the last step.", tr: "Yemeğe gelen yok, seçilecek bir şey kalmadı. Son adıma geçin." },
  qLast: { en: "Last bits", tr: "Son ayrıntılar" },
  shuttle: { en: "We’d like seats on the Saturday shuttle", tr: "Cumartesi servisinde yer istiyoruz" },
  shuttleHint: { en: "16:15 from Urla Cumhuriyet Square and the partner hotels.", tr: "16:15’te Urla Cumhuriyet Meydanı ve anlaşmalı otellerden." },
  friday: { en: "We’ll come to Friday’s welcome drinks", tr: "Cuma günkü hoş geldin içkisine geleceğiz" },
  sunday: { en: "We’ll come to Sunday’s brunch", tr: "Pazar kahvaltısına geleceğiz" },
  song: { en: "One song that will get you dancing", tr: "Sizi dansa kaldıracak bir şarkı" },
  songHint: { en: "Optional. The band gets the list in May.", tr: "İsteğe bağlı. Liste Mayıs’ta gruba gidiyor." },
  note: { en: "A note for Ece & Daniel", tr: "Ece & Daniel’a bir not" },
  sorry: { en: "We’re sorry you can’t make it. Leave a note if you like — we’ll read it on the day.", tr: "Gelemeyeceğinize üzüldük. İsterseniz bir not bırakın — düğün günü okuyacağız." },
  back: { en: "Back", tr: "Geri" },
  next: { en: "Continue", tr: "Devam" },
  send: { en: "Send our reply", tr: "Yanıtımızı gönder" },
  card: { en: "Your reply card", tr: "Yanıt kartınız" },
  cardEmpty: { en: "Find your invitation and this card fills in as you go.", tr: "Davetiyenizi bulun; kart siz ilerledikçe dolacak." },
  replyBy: { en: "Kindly reply by 1 April 2027", tr: "Lütfen 1 Nisan 2027’ye kadar yanıtlayın" },
  attending: { en: "attending", tr: "katılıyor" },
  notAttending: { en: "not attending", tr: "katılmıyor" },
  pending: { en: "—", tr: "—" },
  extrasShuttle: { en: "Shuttle", tr: "Servis" },
  extrasFriday: { en: "Friday", tr: "Cuma" },
  extrasSunday: { en: "Sunday", tr: "Pazar" },
  doneTitle: { en: "Thank you — see you under the olive tree", tr: "Teşekkürler — zeytin ağacının altında görüşürüz" },
  doneDecline: { en: "Thank you for letting us know", tr: "Haber verdiğiniz için teşekkürler" },
  doneText: { en: "Your reply is saved as {ref}. You can change it until 1 April by finding your invitation again.", tr: "Yanıtınız {ref} olarak kaydedildi. 1 Nisan’a kadar davetiyenizi yeniden bulup değiştirebilirsiniz." },
  addCal: { en: "Add the wedding to your calendar", tr: "Düğünü takviminize ekleyin" },
  edit: { en: "Change my reply", tr: "Yanıtımı değiştir" },
  details: { en: "Travel and where to stay", tr: "Ulaşım ve konaklama" },
  fix: { en: "One thing needs a look before you continue.", tr: "Devam etmeden önce bir şeye bakmak gerekiyor." },
} satisfies Record<string, L>;

type Reply = "yes" | "no";
interface GuestDinner {
  meal: MealId | null;
  diets: DietId[];
  other: string;
}

const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");
const EMPTY_DINNER: GuestDinner = { meal: null, diets: [], other: "" };

const ICS = (() => {
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ece and Daniel//Wedding//EN",
    "BEGIN:VEVENT",
    "DTSTART;TZID=Europe/Istanbul:20270612T170000",
    "DTEND;TZID=Europe/Istanbul:20270613T010000",
    "SUMMARY:Ece & Daniel’s wedding",
    "LOCATION:Bademli Olive Estate, Zeytinlik Yolu 7, Bademler, Urla, İzmir",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
})();

/**
 * The RSVP flow: find the invitation by name → reply per guest (+ a plus-one when the invitation
 * allows one) → a main course and dietary needs per attending guest, with gentle clash hints →
 * shuttle, Friday/Sunday, a song and a note. A stationery reply card fills in alongside.
 */
export function RsvpFlow({ locale }: { locale: SiteLocale }) {
  const t = (v: L) => pickLocale(v, locale) ?? "";
  const [step, setStep] = React.useState(0);
  const [query, setQuery] = React.useState("");
  const [invite, setInvite] = React.useState<Invitation | null>(null);
  const [replies, setReplies] = React.useState<Record<string, Reply | null>>({});
  const [plus, setPlus] = React.useState({ coming: false, name: "" });
  const [dinner, setDinner] = React.useState<Record<string, GuestDinner>>({});
  const [extras, setExtras] = React.useState({ shuttle: true, friday: false, sunday: false, song: "", note: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState<string | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const focusPanel = () => requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("h2")?.focus());

  const attending = invite ? invite.guests.filter((g) => replies[g.name] === "yes") : [];
  const plusComing = !!invite?.plusOne && plus.coming && attending.length > 0;
  /** Everyone who needs a dinner choice: key, display name, child. */
  const diners = [
    ...attending.map((g) => ({ key: g.name, name: g.name, child: !!g.child })),
    ...(plusComing ? [{ key: "+1", name: plus.name.trim() || fill(t(c.guestOf), { name: invite!.guests[0]!.name.split(" ")[0]! }), child: false }] : []),
  ];
  const anyoneComing = attending.length > 0;
  const dinnerOf = (key: string) => dinner[key] ?? EMPTY_DINNER;
  const setDinnerOf = (key: string, patch: Partial<GuestDinner>) => setDinner((d) => ({ ...d, [key]: { ...(d[key] ?? EMPTY_DINNER), ...patch } }));

  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    const q = foldText(query.trim(), locale);
    if (!q) return setErrors({ query: t(c.needName) });
    const words = q.split(/\s+/);
    const found = invitations.find((inv) => inv.guests.some((g) => {
      const name = foldText(g.name, locale);
      return name === q || (words.length > 1 && words.every((w) => name.includes(w)));
    }));
    if (!found) return setErrors({ query: fill(t(c.notFound), { q: query.trim() }) });
    setErrors({});
    if (found.id !== invite?.id) {
      setInvite(found);
      setReplies(Object.fromEntries(found.guests.map((g) => [g.name, null])));
      setPlus({ coming: false, name: "" });
      setDinner({});
    }
    setStep(1);
    focusPanel();
  };

  const validate = (s: number) => {
    const next: Record<string, string> = {};
    if (s === 1 && invite) {
      for (const g of invite.guests) if (!replies[g.name]) next[`reply-${g.name}`] = fill(t(c.pickReply), { name: g.name.split(" ")[0]! });
      if (plusComing && !plus.name.trim()) next.plusName = t(c.needPlus);
    }
    if (s === 2) for (const d of diners) if (!dinnerOf(d.key).meal) next[`meal-${d.key}`] = t(c.needMeal);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>(`[data-err="${CSS.escape(first)}"] button, [data-err="${CSS.escape(first)}"] input`)?.focus());
      return false;
    }
    return true;
  };

  const go = (n: number) => {
    if (n > step && !validate(step)) return;
    setErrors({});
    setStep(n);
    focusPanel();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(3)) return;
    const ref = `ED-${invite!.id.slice(0, 3).toUpperCase()}-${String(attending.length + (plusComing ? 1 : 0)).padStart(2, "0")}${invite!.guests.length}`;
    setDone(ref);
    setStep(4);
    focusPanel();
  };

  const steps = [c.sFind, c.sWho, c.sDinner, c.sLast].map((s, i) => ({
    title: t(s),
    status: i === 2 && step > 2 && !anyoneComing ? ("skipped" as const) : undefined,
  }));

  const errorBanner = Object.keys(errors).length > 0 && step > 0 ? <Alert tone="danger" className="mt-6" live="polite">{t(c.fix)}</Alert> : null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
      <div ref={panelRef} className="min-w-0 rounded-ui border border-line bg-surface p-5 sm:p-8">
        {step < 4 ? <Stepper aria-label={t(c.steps)} value={step} steps={steps} onValueChange={(i) => go(i)} navigable="completed" size="sm" /> : null}

        {/* 0 · Find ------------------------------------------------------ */}
        {step === 0 ? (
          <form onSubmit={lookup} noValidate className="mt-8">
            <h2 tabIndex={-1} className="m-0 font-display text-display-m text-fg outline-none">{t(c.qFind)}</h2>
            <p className="m-0 mt-2 text-fg-muted">{t(c.findLead)}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <Field label={t(c.name)} error={errors.query}>
                <Input name="guest" autoComplete="name" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Selin Aksoy" />
              </Field>
              <Button type="submit" variant="primary" className="rounded-full">
                <Search aria-hidden />
                {t(c.find)}
              </Button>
            </div>
            <p className="m-0 mt-4 border-s-2 border-accent-ink/50 ps-3 text-small text-fg-muted">{t(c.demo)}</p>
          </form>
        ) : null}

        {/* 1 · Who --------------------------------------------------------- */}
        {step === 1 && invite ? (
          <div className="mt-8">
            <h2 tabIndex={-1} className="m-0 font-display text-display-m text-fg outline-none">{t(c.qWho)}</h2>
            <p className="m-0 mt-2 text-fg-muted">{fill(t(c.whoLead), { names: new Intl.ListFormat(locale === "tr" ? "tr-TR" : "en-GB", { type: "conjunction" }).format(invite.guests.map((g) => g.name)) })}</p>
            {errorBanner}
            <div className="mt-6 grid gap-0">
              {invite.guests.map((g) => (
                <div key={g.name} data-err={`reply-${g.name}`} className="grid gap-3 border-t border-line py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div>
                    <span id={`rsvp-${g.name}`} className="font-display text-lg text-fg">{g.name}</span>
                    {g.child ? <span className="ms-2 text-small text-fg-muted">· {t(c.child)}</span> : null}
                    {errors[`reply-${g.name}`] ? <p className="m-0 mt-1 text-small text-danger">{errors[`reply-${g.name}`]}</p> : null}
                  </div>
                  <RadioGroup
                    aria-labelledby={`rsvp-${g.name}`}
                    variant="segmented"
                    value={replies[g.name] ?? null}
                    onValueChange={(v) => setReplies((r) => ({ ...r, [g.name]: v as Reply }))}
                    invalid={!!errors[`reply-${g.name}`]}
                    items={[
                      { value: "yes", label: t(c.accept) },
                      { value: "no", label: t(c.decline) },
                    ]}
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-6">
              <h3 className="m-0 text-small font-semibold text-fg">{t(c.plusTitle)}</h3>
              {invite.plusOne ? (
                <div className="mt-3 grid gap-4">
                  <Checkbox
                    label={t(c.plusLabel)}
                    description={t(c.plusHint)}
                    checked={plus.coming}
                    disabled={!anyoneComing}
                    onCheckedChange={(v) => setPlus((p) => ({ ...p, coming: v === true }))}
                  />
                  {plus.coming && anyoneComing ? (
                    <div data-err="plusName" className="ps-7">
                      <Field label={t(c.plusName)} error={errors.plusName} required>
                        <Input name="plus-name" value={plus.name} onChange={(e) => setPlus((p) => ({ ...p, name: e.target.value }))} autoComplete="off" />
                      </Field>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="m-0 mt-2 text-small text-fg-muted">{t(c.plusNone)}</p>
              )}
            </div>
            <Nav t={t} onBack={() => go(0)} onNext={() => go(anyoneComing ? 2 : 3)} />
          </div>
        ) : null}

        {/* 2 · Dinner ------------------------------------------------------ */}
        {step === 2 ? (
          <div className="mt-8">
            <h2 tabIndex={-1} className="m-0 font-display text-display-m text-fg outline-none">{t(c.qDinner)}</h2>
            <p className="m-0 mt-2 text-fg-muted">{t(c.dinnerLead)}</p>
            {errorBanner}
            {diners.length === 0 ? <p className="mt-6 text-fg-muted">{t(c.noOne)}</p> : null}
            {diners.map((d) => {
              const g = dinnerOf(d.key);
              const options = meals.filter((m) => (d.child ? true : !m.kids));
              const meal = meals.find((m) => m.id === g.meal);
              const hint =
                g.meal && g.meal !== "dolma" && g.diets.includes("vegan")
                  ? t(c.veganClash)
                  : g.meal && g.meal !== "dolma" && g.diets.includes("vegetarian")
                    ? t(c.vegClash)
                    : g.meal === "lamb" && g.diets.includes("gluten")
                      ? t(c.glutenOk)
                      : null;
              return (
                <fieldset key={d.key} data-err={`meal-${d.key}`} className="m-0 mt-8 min-w-0 border-0 border-t border-line p-0 pt-6">
                  <legend className="float-start mb-4 w-full font-display text-xl text-fg">
                    {d.name}
                    {d.child ? <span className="ms-2 font-sans text-small text-fg-muted">· {t(c.child)}</span> : null}
                  </legend>
                  <Field label={t(c.main)} error={errors[`meal-${d.key}`]} className="clear-both">
                    <RadioGroup
                      variant="card"
                      value={g.meal}
                      onValueChange={(v) => setDinnerOf(d.key, { meal: v as MealId })}
                      items={options.map((m) => ({
                        value: m.id,
                        label: t(m.name),
                        description: `${t(m.detail)}${m.tags.length ? ` · ${m.tags.map(t).join(" · ")}` : ""}`,
                      }))}
                    />
                  </Field>
                  <div className="mt-5">
                    <Field label={t(c.diet)}>
                      <CheckboxGroup
                        orientation="horizontal"
                        size="sm"
                        value={g.diets}
                        onValueChange={(v) => setDinnerOf(d.key, { diets: v as DietId[] })}
                        items={diets.map((x) => ({ value: x.id, label: t(x.label) }))}
                        className="flex-wrap gap-x-5 gap-y-2"
                      />
                    </Field>
                  </div>
                  {hint ? (
                    <Alert tone="warning" className="mt-4" actions={meal && meal.id !== "dolma" && !d.child ? <Button size="sm" variant="secondary" onClick={() => setDinnerOf(d.key, { meal: "dolma" })}>{t(c.useDolma)}</Button> : undefined}>
                      {hint}
                    </Alert>
                  ) : null}
                  {g.diets.length > 0 ? (
                    <div className="mt-4">
                      <Field label={t(c.dietOther)} hint={t(c.dietOtherHint)}>
                        <Textarea rows={2} value={g.other} onChange={(e) => setDinnerOf(d.key, { other: e.target.value })} />
                      </Field>
                    </div>
                  ) : null}
                </fieldset>
              );
            })}
            <Nav t={t} onBack={() => go(1)} onNext={() => go(3)} />
          </div>
        ) : null}

        {/* 3 · Last bits --------------------------------------------------- */}
        {step === 3 ? (
          <form onSubmit={submit} className="mt-8">
            <h2 tabIndex={-1} className="m-0 font-display text-display-m text-fg outline-none">{t(c.qLast)}</h2>
            {anyoneComing ? (
              <div className="mt-6 grid gap-4">
                <Checkbox label={t(c.shuttle)} description={t(c.shuttleHint)} checked={extras.shuttle} onCheckedChange={(v) => setExtras((x) => ({ ...x, shuttle: v === true }))} />
                <Checkbox label={t(c.friday)} checked={extras.friday} onCheckedChange={(v) => setExtras((x) => ({ ...x, friday: v === true }))} />
                <Checkbox label={t(c.sunday)} checked={extras.sunday} onCheckedChange={(v) => setExtras((x) => ({ ...x, sunday: v === true }))} />
                <Field label={t(c.song)} hint={t(c.songHint)} className="mt-2">
                  <Input value={extras.song} onChange={(e) => setExtras((x) => ({ ...x, song: e.target.value }))} placeholder={locale === "tr" ? "Sezen Aksu — Firuze" : "Talking Heads — This Must Be the Place"} />
                </Field>
              </div>
            ) : (
              <p className="m-0 mt-2 text-fg-muted">{t(c.sorry)}</p>
            )}
            <div className="mt-5">
              <Field label={t(c.note)}>
                <Textarea rows={3} maxLength={400} value={extras.note} onChange={(e) => setExtras((x) => ({ ...x, note: e.target.value }))} />
              </Field>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
              <Button type="button" variant="ghost" onClick={() => go(anyoneComing ? 2 : 1)}>
                <ArrowLeft aria-hidden className="rtl:rotate-180" />
                {t(c.back)}
              </Button>
              <Button type="submit" variant="primary" className="rounded-full px-6">
                {t(c.send)}
              </Button>
            </div>
          </form>
        ) : null}

        {/* 4 · Done -------------------------------------------------------- */}
        {step === 4 && done ? (
          <div className="py-4 text-center" role="status">
            <h2 tabIndex={-1} className="m-0 font-display text-display-m text-balance text-fg outline-none">{anyoneComing ? t(c.doneTitle) : t(c.doneDecline)}</h2>
            <p className="mx-auto mt-3 max-w-[46ch] text-fg-muted">{fill(t(c.doneText), { ref: done })}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {anyoneComing ? (
                <Button asChild variant="primary" className="rounded-full">
                  <a href={ICS} download="ece-daniel-wedding.ics">
                    <CalendarPlus aria-hidden />
                    {t(c.addCal)}
                  </a>
                </Button>
              ) : null}
              <Button variant="secondary" className="rounded-full" onClick={() => { setDone(null); setStep(1); focusPanel(); }}>
                {t(c.edit)}
              </Button>
              <Button asChild variant="ghost" className="rounded-full">
                <a href={sitePageHref("details", "travel")}>{t(c.details)}</a>
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* The reply card ------------------------------------------------------ */}
      <aside aria-label={t(c.card)} className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative mx-auto max-w-md rotate-[-1.2deg] border border-line bg-surface p-1.5 shadow-[0_18px_40px_-24px_color-mix(in_srgb,var(--fg)_45%,transparent)] motion-reduce:rotate-0">
          <div className="border border-line px-6 py-8 text-center">
            <p className="m-0 font-mono text-[10px] tracking-[0.24em] text-fg-muted uppercase">{t(c.replyBy)}</p>
            <p className="m-0 mt-4 font-display text-2xl text-fg">
              Ece <em className="text-accent-ink">&amp;</em> Daniel
            </p>
            <div className="mx-auto my-5 h-px w-16 bg-line" />
            {invite ? (
              <ul className="m-0 grid list-none gap-3 p-0 text-start">
                {invite.guests.map((g) => {
                  const r = replies[g.name];
                  const m = meals.find((x) => x.id === dinnerOf(g.name).meal);
                  return (
                    <li key={g.name} className="border-b border-dotted border-line pb-2">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-display text-fg">{g.name}</span>
                        <span className={`font-mono text-[11px] tracking-[0.08em] uppercase ${r === "yes" ? "text-accent-ink" : "text-fg-muted"}`}>{r === "yes" ? t(c.attending) : r === "no" ? t(c.notAttending) : t(c.pending)}</span>
                      </span>
                      {r === "yes" && m ? <span className="block text-small text-fg-muted">{t(m.name)}{dinnerOf(g.name).diets.length ? ` · ${dinnerOf(g.name).diets.map((id) => t(diets.find((x) => x.id === id)!.label)).join(", ")}` : ""}</span> : null}
                    </li>
                  );
                })}
                {plusComing ? (
                  <li className="border-b border-dotted border-line pb-2">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-fg">{diners.at(-1)!.name}</span>
                      <span className="font-mono text-[11px] tracking-[0.08em] text-accent-ink uppercase">+1</span>
                    </span>
                    {dinnerOf("+1").meal ? <span className="block text-small text-fg-muted">{t(meals.find((x) => x.id === dinnerOf("+1").meal)!.name)}</span> : null}
                  </li>
                ) : null}
                {anyoneComing && step >= 3 ? (
                  <li className="flex flex-wrap gap-x-4 gap-y-1 pt-1 font-mono text-[11px] tracking-[0.08em] text-fg-muted uppercase">
                    {extras.friday ? <span>{t(c.extrasFriday)} ✓</span> : null}
                    {extras.shuttle ? <span>{t(c.extrasShuttle)} ✓</span> : null}
                    {extras.sunday ? <span>{t(c.extrasSunday)} ✓</span> : null}
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="m-0 text-small text-fg-muted italic">{t(c.cardEmpty)}</p>
            )}
            {extras.song && step >= 3 ? <p className="m-0 mt-4 text-small text-fg-muted">♪ {extras.song}</p> : null}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Nav({ t, onBack, onNext }: { t: (v: L) => string; onBack: () => void; onNext: () => void }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
      <Button type="button" variant="ghost" onClick={onBack}>
        <ArrowLeft aria-hidden className="rtl:rotate-180" />
        {t(c.back)}
      </Button>
      <Button type="button" variant="primary" className="rounded-full px-6" onClick={onNext}>
        {t(c.next)}
        <ArrowRight aria-hidden className="rtl:rotate-180" />
      </Button>
    </div>
  );
}
