"use client";

import * as React from "react";
import { Alert, Badge, Button, Checkbox, cn, Field, Input, PhoneInput, RadioGroup, Switch, Textarea } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { Check, DoorOpen, EyeOff, LockKeyhole, Mail, MessageSquareText, Phone, ShieldCheck } from "lucide-react";
import { CHANNELS, channelNames, copyFor, EMAIL, EXIT_URL, fill, form as c, PHONE, team, times, topics, type Channel, type SiteLocale } from "./content";

interface Draft {
  channel: Channel;
  email: string;
  phone: string | null;
  voicemail: boolean;
  sayName: boolean;
  name: string;
  topics: string[];
  times: string[];
  therapist: string;
  inPerson: boolean;
  message: string;
  consent: boolean;
}

const EMPTY: Draft = { channel: "email", email: "", phone: null, voicemail: false, sayName: false, name: "", topics: [], times: [], therapist: "any", inPerson: false, message: "", consent: false };

const CHANNEL_ICONS: Record<Channel, React.ReactNode> = {
  email: <Mail aria-hidden className="size-4" />,
  phone: <Phone aria-hidden className="size-4" />,
  text: <MessageSquareText aria-hidden className="size-4" />,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Leave quickly: replace this page in the history with a neutral one. */
function leave() {
  window.location.replace(EXIT_URL);
}

/**
 * Contact page. Signature: the privacy-first form — only a name and one way back are required,
 * the sender can stay anonymous on calls and emails, and a live "what we will receive" panel
 * lists every field as sent or not sent before anything leaves the page.
 */
export function ContactPage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const [d, setD] = React.useState<Draft>(EMPTY);
  const [errors, setErrors] = React.useState<Partial<Record<"name" | "contact" | "consent", string>>>({});
  const [done, setDone] = React.useState<{ ref: string; draft: Draft } | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const doneRef = React.useRef<HTMLHeadingElement>(null);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setD((prev) => ({ ...prev, [key]: value }));
  const toggle = (key: "topics" | "times", id: string, on: boolean) => setD((prev) => ({ ...prev, [key]: on ? [...prev[key], id] : prev[key].filter((x) => x !== id) }));

  const contactValue = d.channel === "email" ? d.email.trim() : (d.phone ?? "");
  const message = d.inPerson ? "" : d.message.trim();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!d.name.trim()) next.name = t(c.required);
    if (d.channel === "email" ? !EMAIL_RE.test(d.email.trim()) : (d.phone ?? "").replace(/\D/g, "").length < 11) next.contact = d.channel === "email" ? (d.email.trim() ? t(c.badEmail) : t(c.required)) : t(c.badPhone);
    if (!d.consent) next.consent = t(c.needConsent);
    setErrors(next);
    const first = (["contact", "name", "consent"] as const).find((k) => next[k]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#qh-${first}`)?.focus();
      return;
    }
    // A reference that says nothing about the person: day of year + a counter-like suffix.
    const ref = `QH-${String(new Date().getDate()).padStart(2, "0")}${String(d.name.trim().length * 37 + contactValue.length).padStart(3, "0").slice(-3)}`;
    setDone({ ref, draft: { ...d, message } });
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  const clear = () => {
    setD(EMPTY);
    setErrors({});
    setDone(null);
    requestAnimationFrame(() => {
      const h1 = document.getElementById("qh-contact-title");
      if (!h1) return;
      if (!h1.hasAttribute("tabindex")) h1.setAttribute("tabindex", "-1");
      h1.focus();
    });
  };

  const shown = done?.draft ?? { ...d, message };
  const therapistName = shown.therapist === "any" ? t(c.anyone) : (team.find((p) => p.id === shown.therapist)?.name ?? "");
  const rules = [
    shown.channel === "phone" ? t(shown.voicemail ? c.voiceYes : c.voiceNo) : null,
    t(shown.sayName ? c.nameYes : c.nameNo),
  ].filter(Boolean).join(" · ");
  const listOf = (ids: string[], from: { id: string; label: { en: string; tr: string } }[]) => ids.map((id) => t(from.find((x) => x.id === id)!.label)).join(", ");

  const rows: { label: string; value: string; sent: boolean }[] = [
    { label: t(c.rName), value: shown.name.trim(), sent: !!shown.name.trim() },
    { label: t(c.rContact), value: shown.channel === "email" ? shown.email.trim() : (shown.phone ?? ""), sent: !!(shown.channel === "email" ? shown.email.trim() : shown.phone) },
    { label: t(c.rRules), value: `${t(channelNames[shown.channel])} · ${rules}`, sent: true },
    { label: t(c.rTopics), value: listOf(shown.topics, topics), sent: shown.topics.length > 0 },
    { label: t(c.rTimes), value: listOf(shown.times, times), sent: shown.times.length > 0 },
    { label: t(c.rTherapist), value: shown.therapist === "any" ? "" : therapistName, sent: shown.therapist !== "any" },
    { label: t(c.rMessage), value: shown.message ? fill(t(c.chars), { n: shown.message.length }) : shown.inPerson ? t(c.inPerson) : "", sent: !!shown.message },
  ];

  return (
    <>
      <PageIntro
        headingId="qh-contact-title"
        locale={intl}
        labels={labels}
        variant="simple"
        breadcrumb={[{ label: "Quiet Harbour", href: sitePageHref("home") }, { label: t(c.crumb) }]}
        title={t(c.title)}
        lead={t(c.lead)}
      />

      <Section theme={{ rhythm: "tight" }} aria-label={t(c.crumb)} className="pt-0!">
        <Container>
          <div className="mb-10 flex flex-col gap-2 border-y border-line py-4 @2xl:flex-row @2xl:items-center @2xl:justify-between">
            <p className="flex items-center gap-2 text-small text-fg-muted">
              <EyeOff aria-hidden className="size-4 text-accent-ink" />
              {t(c.autofill)}
            </p>
            <Button variant="secondary" onClick={leave} aria-describedby="qh-exit-hint" className="self-start rounded-full @2xl:self-auto">
              <DoorOpen aria-hidden />
              {t(c.exit)}
            </Button>
            <span id="qh-exit-hint" className="sr-only">
              {t(c.exitHint)}
            </span>
          </div>

          <div className="grid gap-10 @4xl:grid-cols-12 @4xl:gap-12">
            <div className="@4xl:col-span-7">
              {done ? (
                <div role="status" className="flex flex-col items-start gap-5 border-t-2 border-accent pt-8">
                  <span className="grid size-11 place-items-center rounded-full bg-accent text-accent-fg">
                    <Check aria-hidden className="size-5" />
                  </span>
                  <h2 ref={doneRef} tabIndex={-1} className="font-display text-display-m text-fg outline-none">
                    {t(c.doneTitle)}
                  </h2>
                  <p className="max-w-[54ch] text-lead text-fg-muted">
                    {fill(t(c.doneText), {
                      name: done.draft.name.trim(),
                      how: t(done.draft.channel === "email" ? c.howEmail : done.draft.channel === "phone" ? c.howPhone : c.howText),
                      rule: t(done.draft.sayName ? c.ruleOpen : c.ruleDiscreet),
                      ref: done.ref,
                    })}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <Button variant="primary" onClick={clear} className="self-start rounded-full">
                      {t(c.clear)}
                    </Button>
                    <span className="text-small text-fg-muted">{t(c.clearHint)}</span>
                  </div>
                </div>
              ) : (
                <form ref={formRef} noValidate autoComplete="off" onSubmit={submit} className="flex flex-col gap-10">
                  {Object.keys(errors).length ? <Alert tone="danger">{t(c.fix)}</Alert> : null}

                  <fieldset className="flex flex-col gap-5">
                    <legend className="mb-5 flex items-baseline gap-3 font-display text-h3 text-fg">
                      <span aria-hidden className="font-mono text-xs text-accent-ink">01</span>
                      {t(c.s1)}
                    </legend>
                    <Field label={t(c.channel)}>
                      <RadioGroup
                        name="channel"
                        variant="segmented"
                        value={d.channel}
                        onValueChange={(v) => set("channel", v as Channel)}
                        items={CHANNELS.map((ch) => ({ value: ch, label: t(channelNames[ch]), icon: CHANNEL_ICONS[ch] }))}
                      />
                    </Field>
                    {d.channel === "email" ? (
                      <Field label={t(c.email)} required error={errors.contact}>
                        <Input id="qh-contact" type="email" inputMode="email" autoComplete="off" spellCheck={false} value={d.email} onChange={(e) => set("email", e.target.value)} />
                      </Field>
                    ) : (
                      <Field label={t(c.phone)} required error={errors.contact}>
                        <PhoneInput id="qh-contact" defaultCountry="TR" autoComplete="off" value={d.phone} onValueChange={(v) => set("phone", v)} />
                      </Field>
                    )}
                    <div className="flex flex-col gap-4 rounded-[var(--radius)] bg-surface-2 p-4">
                      {d.channel === "phone" ? <Switch checked={d.voicemail} onCheckedChange={(v) => set("voicemail", v)} label={t(c.voicemail)} description={t(c.voicemailHint)} /> : null}
                      <Switch checked={d.sayName} onCheckedChange={(v) => set("sayName", v)} label={t(c.sayName)} description={t(c.sayNameHint)} />
                    </div>
                  </fieldset>

                  <fieldset className="flex flex-col gap-5">
                    <legend className="mb-5 flex items-baseline gap-3 font-display text-h3 text-fg">
                      <span aria-hidden className="font-mono text-xs text-accent-ink">02</span>
                      {t(c.s2)}
                    </legend>
                    <Field label={t(c.name)} hint={t(c.nameHint)} required error={errors.name}>
                      <Input id="qh-name" autoComplete="off" value={d.name} onChange={(e) => set("name", e.target.value)} className="max-w-sm" />
                    </Field>
                  </fieldset>

                  <fieldset className="flex flex-col gap-6">
                    <legend className="mb-1 flex items-baseline gap-3 font-display text-h3 text-fg">
                      <span aria-hidden className="font-mono text-xs text-accent-ink">03</span>
                      {t(c.s3)}
                    </legend>
                    <p className="-mt-1 text-small text-fg-muted">{t(c.s3hint)}</p>
                    <div role="group" aria-labelledby="qh-topics-l" className="flex flex-col gap-3">
                      <p id="qh-topics-l" className="text-small font-medium text-fg">
                        {t(c.topics)}
                      </p>
                      <div className="grid gap-x-6 gap-y-2.5 @md:grid-cols-2">
                        {topics.map((tp) => (
                          <Checkbox key={tp.id} checked={d.topics.includes(tp.id)} onCheckedChange={(v) => toggle("topics", tp.id, v === true)} label={t(tp.label)} />
                        ))}
                      </div>
                    </div>
                    <div role="group" aria-labelledby="qh-times-l" className="flex flex-col gap-3">
                      <p id="qh-times-l" className="text-small font-medium text-fg">
                        {t(c.when)}
                      </p>
                      <div className="flex flex-col gap-2.5 @md:flex-row @md:flex-wrap @md:gap-x-6">
                        {times.map((tm) => (
                          <Checkbox key={tm.id} checked={d.times.includes(tm.id)} onCheckedChange={(v) => toggle("times", tm.id, v === true)} label={t(tm.label)} />
                        ))}
                      </div>
                    </div>
                    <Field label={t(c.therapist)}>
                      <RadioGroup
                        name="therapist"
                        value={d.therapist}
                        onValueChange={(v) => set("therapist", v)}
                        items={[{ value: "any", label: t(c.anyone) }, ...team.map((p) => ({ value: p.id, label: p.name, description: t(p.focus) }))]}
                      />
                    </Field>
                    <Switch checked={d.inPerson} onCheckedChange={(v) => set("inPerson", v)} label={t(c.inPerson)} />
                    {d.inPerson ? null : (
                      <Field label={t(c.message)} hint={t(c.messageHint)} optional>
                        <Textarea autoComplete="off" rows={4} maxLength={400} showCount value={d.message} onChange={(e) => set("message", e.target.value)} />
                      </Field>
                    )}
                  </fieldset>

                  <div className="flex flex-col gap-6 border-t border-line pt-8">
                    <div>
                      <Checkbox id="qh-consent" checked={d.consent} onCheckedChange={(v) => set("consent", v === true)} label={t(c.consent)} aria-invalid={errors.consent ? true : undefined} />
                      {errors.consent ? <p className="mt-1.5 ms-7 text-small text-danger">{errors.consent}</p> : null}
                    </div>
                    <Button type="submit" variant="primary" size="lg" className="self-start rounded-full px-7">
                      <LockKeyhole aria-hidden />
                      {t(c.send)}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <aside aria-labelledby="qh-receipt-h" className="@4xl:col-span-5">
              <div className="flex flex-col gap-6 @4xl:sticky @4xl:top-[calc(var(--topbar-h,4rem)+1.5rem)]">
                <div className="rounded-[var(--radius)] border border-line bg-surface p-5 @md:p-6">
                  <h2 id="qh-receipt-h" className="flex items-center gap-2 font-display text-h3 text-fg">
                    <ShieldCheck aria-hidden className="size-5 text-accent-ink" />
                    {t(c.rTitle)}
                  </h2>
                  <p className="mt-1 text-small text-fg-muted">{t(c.rLead)}</p>
                  <dl className="mt-5 divide-y divide-line border-y border-line" data-qh-receipt="">
                    {rows.map((r) => (
                      <div key={r.label} data-sent={r.sent ? "true" : "false"} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-0.5 py-3">
                        <dt className="text-small font-medium text-fg">{r.label}</dt>
                        <dd className="row-span-2">
                          <Badge tone={r.sent ? "accent" : "outline"} className={cn(!r.sent && "text-fg-muted")}>
                            {r.sent ? t(c.sent) : t(c.notSent)}
                          </Badge>
                        </dd>
                        <dd className={cn("min-w-0 truncate text-small", r.sent ? "text-fg-muted" : "text-fg-subtle")}>{r.value || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-5 flex flex-col gap-1 rounded-[calc(var(--radius)-2px)] bg-surface-2 p-3.5">
                    <p className="text-xs font-semibold tracking-wide text-fg-muted uppercase">{t(c.never)}</p>
                    <p className="text-small text-fg">{t(c.neverList)}</p>
                  </div>
                  <p className="mt-4 text-small text-fg-muted">{t(c.readBy)}</p>
                  <p className="mt-2 text-small text-fg-muted">{t(c.noTracking)}</p>
                </div>

                <Alert tone="neutral" title={t(c.urgentTitle)}>
                  {t(c.urgentText)}
                </Alert>

                <div className="flex flex-col gap-2 border-t border-line pt-5 text-small">
                  <p className="font-medium text-fg">{t(c.otherTitle)}</p>
                  <a href={`mailto:${EMAIL}`} className="focus-ring self-start rounded-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline">
                    {EMAIL}
                  </a>
                  <a href={`tel:${PHONE}`} className="focus-ring self-start rounded-sm text-fg-muted tabular underline-offset-4 hover:text-fg hover:underline">
                    +90 216 000 00 00
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
