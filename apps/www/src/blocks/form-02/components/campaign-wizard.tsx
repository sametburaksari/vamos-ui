"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, CalendarCheck2, Copy, Rocket } from "lucide-react";
import {
  Badge,
  Button,
  ConfirmDialog,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  Input,
  PageHeader,
  Stepper,
  cn,
  toast,
  type StepItem,
} from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { me } from "../../_shared/people";
import { NOW } from "../../_shared/time";
import { initialDraft, smsSegments, type CampaignDraft } from "./data";
import { MessagePreview } from "./message-preview";
import { estimate } from "./reach";
import { AudienceStep, ContentStep, ReviewStep, ScheduleStep, inQuietHours, type Errors } from "./steps";

function useMedia(query: string) {
  const [match, setMatch] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

function validate(step: number, d: CampaignDraft, c: (en: string, tr: string) => string): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!d.segment) e.segment = c("Choose who gets this campaign.", "Kampanyanın kime gideceğini seçin.");
    if (d.cities.length === 0) e.cities = c("Keep at least one city.", "En az bir şehir seçili kalmalı.");
  }
  if (step === 1) {
    if (d.channel === "email") {
      if (!d.subject.trim()) e.subject = c("Write a subject line.", "Bir konu satırı yazın.");
      if (d.body.trim().length < 20) e.body = c("The message needs a few sentences.", "İleti birkaç cümle olmalı.");
      if (d.cta && !/^https:\/\/[^\s.]+\.[^\s]+$/.test(d.url)) e.url = c("Use a full https:// link.", "Tam bir https:// bağlantısı girin.");
    }
    if (d.channel === "sms") {
      if (!d.sms.trim()) e.sms = c("Write the text message.", "SMS metnini yazın.");
      else if (smsSegments(d.sms).count > 3) e.sms = c("Keep it to three segments or fewer.", "En fazla üç parça olsun.");
    }
    if (d.channel === "push" && !d.pushTitle.trim()) e.pushTitle = c("Give the notification a title.", "Bildirime bir başlık verin.");
  }
  if (step === 2 && d.mode === "later") {
    if (!d.date) e.date = c("Pick a date.", "Bir tarih seçin.");
    if (!d.time) e.time = c("Pick a time.", "Bir saat seçin.");
    else if (d.date && `${d.date}T${d.time}` <= NOW.slice(0, 16)) e.time = c("That time has already passed.", "Bu saat geçti.");
  }
  return e;
}

/** Marketing → New campaign: audience, content, schedule and review, with a live preview and reach estimate. */
export function CampaignWizard() {
  const { c, f, money } = useBlockFormat();
  const wide = useMedia("(min-width: 1024px)");
  const [draft, setDraft] = React.useState<CampaignDraft>(initialDraft);
  const [step, setStep] = React.useState(0);
  const [visited, setVisited] = React.useState(0);
  const [errors, setErrors] = React.useState<Errors>({});
  const [attempted, setAttempted] = React.useState<number[]>([]);
  const [confirming, setConfirming] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testTo, setTestTo] = React.useState(me.email);
  const [sendingTest, setSendingTest] = React.useState(false);
  const [launched, setLaunched] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const set = <K extends keyof CampaignDraft>(key: K, value: CampaignDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setSavedAt(null);
    if (attempted.includes(step)) setErrors(validate(step, { ...draft, [key]: value }, c));
  };
  const est = estimate(draft);

  const titles = [c("Audience", "Kitle"), c("Content", "İçerik"), c("Schedule", "Zamanlama"), c("Review", "Kontrol")];
  const summaries = [
    est.seg ? c(`${f.number(est.reach)} people`, `${f.number(est.reach)} kişi`) : c("Not chosen", "Seçilmedi"),
    draft.channel === "email" ? c("Email", "E-posta") : draft.channel === "sms" ? "SMS" : c("App push", "Bildirim"),
    draft.mode === "now" ? c("Now", "Hemen") : draft.mode === "smart" ? c("Best hour", "En iyi saat") : draft.date ? f.date(draft.date, { day: "numeric", month: "short" }) + ` · ${draft.time ?? "—"}` : "—",
    c("Launch", "Başlat"),
  ];
  const errorSteps = [0, 1, 2].filter((i) => attempted.includes(i) && Object.keys(validate(i, draft, c)).length > 0);
  const steps: StepItem[] = titles.map((title, i) => ({
    id: `cmp-${i}`,
    title,
    description: summaries[i],
    status: errorSteps.includes(i) ? "error" : i === step ? "current" : i < visited || (i <= visited && i < step) ? "complete" : "upcoming",
  }));

  const go = (to: number) => {
    // Moving forward checks every step in between.
    for (let i = step; i < to; i++) {
      const e = validate(i, draft, c);
      if (Object.keys(e).length) {
        setAttempted((a) => [...new Set([...a, i])]);
        setErrors(e);
        setStep(i);
        toast.warning(c(`Check “${titles[i]}”`, `“${titles[i]}” adımını kontrol edin`), { description: Object.values(e)[0] });
        return;
      }
    }
    setErrors({});
    setStep(to);
    setVisited((v) => Math.max(v, to));
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: false }));
  };

  const saveDraft = () => {
    setSavedAt(NOW);
    toast(c("Draft saved", "Taslak kaydedildi"), { description: c("Anyone on the marketing team can pick it up.", "Pazarlama ekibinden herkes devam edebilir.") });
  };

  if (launched) {
    const later = draft.mode === "later";
    return (
      <div className="mx-auto grid max-w-[640px] gap-6 py-6 text-center ui-fade">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-accent-ink">
          <CalendarCheck2 className="size-6" strokeWidth={1.6} />
        </span>
        <div>
          <h1 className="font-display text-[length:calc(30px*var(--display-scale))] leading-tight text-fg">{later ? c("Campaign scheduled", "Kampanya zamanlandı") : c("Campaign is sending", "Kampanya gönderiliyor")}</h1>
          <p className="mt-2 text-[14px] text-fg-muted">
            {later && draft.date
              ? c(`“${draft.name}” goes to ${f.number(est.reach)} people on ${f.date(draft.date, "full")} at ${inQuietHours(draft.time) && draft.quietHours ? "09:00" : draft.time}.`, `“${draft.name}” ${f.date(draft.date, "full")} ${inQuietHours(draft.time) && draft.quietHours ? "09:00" : draft.time} saatinde ${f.number(est.reach)} kişiye gidecek.`)
              : c(`“${draft.name}” is going out to ${f.number(est.reach)} people.`, `“${draft.name}” ${f.number(est.reach)} kişiye gönderiliyor.`)}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-ui-lg border border-line bg-line text-start">
          {[
            { k: c("Recipients", "Alıcı"), v: <CountUp value={est.reach} /> },
            { k: c("Likely opens", "Tahmini açılma"), v: <CountUp value={est.opens} /> },
            { k: c("Cost", "Maliyet"), v: Number(est.cost) === 0 ? c("Free", "Ücretsiz") : money({ amount: est.cost, currency: "TRY" }, { whole: Number(est.cost) > 1000 }) },
          ].map((s) => (
            <div key={s.k} className="bg-surface px-4 py-3">
              <dt className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">{s.k}</dt>
              <dd className="tabular mt-1 font-display text-[1.4rem] leading-none text-fg">{s.v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              setLaunched(false);
              setStep(2);
              toast(c("Campaign unscheduled", "Zamanlama kaldırıldı"), { description: c("It's a draft again — nothing was sent.", "Yeniden taslak oldu — hiçbir şey gönderilmedi.") });
            }}
            disabled={!later}
          >
            {c("Unschedule", "Zamanlamayı kaldır")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setDraft({ ...draft, name: `${draft.name} (copy)` });
              setLaunched(false);
              setStep(0);
              setVisited(0);
            }}
          >
            <Copy /> {c("Duplicate", "Kopyala")}
          </Button>
        </div>
      </div>
    );
  }

  const last = step === titles.length - 1;

  return (
    <div className="mx-auto max-w-[1320px]">
      <PageHeader
        eyebrow={c("Marketing · New campaign", "Pazarlama · Yeni kampanya")}
        title={
          <label className="block">
            <span className="sr-only">{c("Campaign name", "Kampanya adı")}</span>
            <input
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              className="focus-ring -ms-1 w-full max-w-[22ch] rounded-ui-sm bg-transparent px-1 text-fg outline-none hover:bg-hover"
              size={Math.max(12, draft.name.length)}
            />
          </label>
        }
        meta={<Badge tone={savedAt ? "neutral" : "outline"}>{savedAt ? c("Draft saved", "Taslak kaydedildi") : c("Unsaved draft", "Kaydedilmemiş taslak")}</Badge>}
        actions={
          <Button variant="ghost" onClick={saveDraft}>
            {c("Save draft", "Taslağı kaydet")}
          </Button>
        }
        className="mb-6"
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[196px_minmax(0,1fr)] xl:grid-cols-[196px_minmax(0,1fr)_340px]">
        <div className="lg:sticky lg:top-[calc(var(--topbar-h,56px)+16px)] lg:self-start">
          <Stepper value={step} onValueChange={go} steps={steps} orientation={wide ? "vertical" : "horizontal"} variant={wide ? "numbered" : "bar"} size="sm" navigable="all" aria-label={c("Campaign steps", "Kampanya adımları")} />
        </div>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (last) setConfirming(true);
            else go(step + 1);
          }}
          className="surface min-w-0 rounded-ui-lg"
        >
          <div className="border-b border-line px-5 py-4 sm:px-6">
            <p className="tabular text-[12px] text-fg-subtle">{c(`Step ${step + 1} of ${titles.length}`, `Adım ${step + 1} / ${titles.length}`)}</p>
            <h2 ref={headingRef} tabIndex={-1} className="font-display text-[1.45rem] leading-tight text-fg outline-none">
              {[c("Choose the audience", "Kitleyi seçin"), c("Write the message", "İletiyi yazın"), c("Decide when it goes", "Ne zaman gideceğine karar verin"), c("Check and launch", "Kontrol edip başlatın")][step]}
            </h2>
          </div>
          <div key={step} className="px-5 py-6 ui-fade sm:px-6">
            {step === 0 ? <AudienceStep draft={draft} set={set} errors={errors} /> : null}
            {step === 1 ? <ContentStep draft={draft} set={set} errors={errors} /> : null}
            {step === 2 ? <ScheduleStep draft={draft} set={set} errors={errors} /> : null}
            {step === 3 ? <ReviewStep draft={draft} onEdit={go} onTest={() => setTesting(true)} /> : null}
          </div>
          <div className="flex items-center gap-2 border-t border-line px-5 py-3.5 sm:px-6">
            <Button type="button" variant="ghost" disabled={step === 0} onClick={() => go(step - 1)}>
              <ArrowLeft className="rtl:-scale-x-100" /> {c("Back", "Geri")}
            </Button>
            <span className="tabular ms-auto hidden text-[12.5px] text-fg-subtle sm:inline">{c(`${f.number(est.reach)} recipients`, `${f.number(est.reach)} alıcı`)}</span>
            <Button type="submit" variant={last ? "primary" : "solid"} className="max-sm:ms-auto">
              {last ? (
                <>
                  <Rocket /> {draft.mode === "later" ? c("Schedule campaign", "Kampanyayı zamanla") : c("Launch campaign", "Kampanyayı başlat")}
                </>
              ) : (
                <>
                  {c(`Continue to ${titles[step + 1]!.toLowerCase()}`, `${titles[step + 1]} adımına geç`)} <ArrowRight className="rtl:-scale-x-100" />
                </>
              )}
            </Button>
          </div>
        </form>

        <aside aria-label={c("Live preview", "Canlı önizleme")} className={cn("grid content-start gap-4 lg:col-start-2 xl:col-start-3 xl:row-start-1", "xl:sticky xl:top-[calc(var(--topbar-h,56px)+16px)] xl:self-start")}>
          <div className="rounded-ui-lg border border-line bg-surface px-4 py-3.5">
            <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">{c("Estimated reach", "Tahmini erişim")}</p>
            <p className="tabular mt-1 font-display text-[2rem] leading-none text-fg" aria-live="polite">
              <CountUp value={est.reach} duration={600} />
            </p>
            <p className="tabular mt-1.5 text-[12.5px] text-fg-muted">
              {est.seg
                ? c(`${f.number(est.afterExclusions - est.reach)} without ${draft.channel === "email" ? "email" : draft.channel === "sms" ? "SMS" : "push"} consent · ${Number(est.cost) === 0 ? "free" : money({ amount: est.cost, currency: "TRY" }, { whole: Number(est.cost) > 1000 })}`, `${f.number(est.afterExclusions - est.reach)} kişinin izni yok · ${Number(est.cost) === 0 ? "ücretsiz" : money({ amount: est.cost, currency: "TRY" }, { whole: Number(est.cost) > 1000 })}`)
                : c("Choose a segment to see who it reaches.", "Kime ulaşacağını görmek için bir segment seçin.")}
            </p>
          </div>
          <MessagePreview draft={draft} />
        </aside>
      </div>

      <ConfirmDialog
        open={confirming}
        title={draft.mode === "later" ? c(`Schedule for ${f.number(est.reach)} people?`, `${f.number(est.reach)} kişi için zamanlansın mı?`) : c(`Send to ${f.number(est.reach)} people now?`, `${f.number(est.reach)} kişiye şimdi gönderilsin mi?`)}
        description={c("You can unschedule until it starts. Once it's out, it can't be recalled.", "Başlayana kadar zamanlamayı kaldırabilirsiniz. Gönderildikten sonra geri alınamaz.")}
        confirmLabel={draft.mode === "later" ? c("Schedule", "Zamanla") : c("Send now", "Şimdi gönder")}
        onConfirm={() => new Promise<void>((r) => window.setTimeout(r, 800))}
        onResult={(ok) => {
          setConfirming(false);
          if (ok) setLaunched(true);
        }}
      />

      <Dialog open={testing} onOpenChange={(o) => !sendingTest && setTesting(o)}>
        <DialogContent size="sm">
          <form
            className="contents"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(testTo)) return;
              setSendingTest(true);
              window.setTimeout(() => {
                setSendingTest(false);
                setTesting(false);
                toast.success(c(`Test sent to ${testTo}`, `Test ${testTo} adresine gönderildi`), { description: c("Merge tags use your own profile.", "Kişiselleştirme sizin profilinizi kullanır.") });
              }, 700);
            }}
          >
            <DialogHeader title={c("Send a test", "Test gönder")} description={c("Tests don't count toward reach or cost.", "Testler erişime ve maliyete sayılmaz.")} />
            <DialogBody>
              <Field label={draft.channel === "sms" ? c("Email for the SMS copy", "SMS kopyası için e-posta") : c("Send to", "Alıcı")} error={/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(testTo) ? undefined : c("Enter a valid email.", "Geçerli bir e-posta girin.")}>
                <Input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} autoComplete="email" />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setTesting(false)}>
                {c("Cancel", "Vazgeç")}
              </Button>
              <Button type="submit" variant="primary" loading={sendingTest}>
                {c("Send test", "Testi gönder")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
