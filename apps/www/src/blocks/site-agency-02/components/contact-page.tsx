"use client";

import * as React from "react";
import { Button, Field, Input, RadioGroup, Textarea, ToggleGroup, ToggleGroupItem, useFormat } from "@vamos-ui/react";
import { Container, formatSitePhone, Section } from "@vamos-ui/react/blocks";
import { Check } from "lucide-react";
import { ColourBlock } from "./colour-block";
import { ADDRESS, EMAIL, PHONE, services, STUDIO_ACCENT } from "./content";
import { useCopy } from "./project-provider";

type Budget = "s" | "m" | "l";
type Start = "now" | "q1" | "later";

/**
 * Start a project: pick services, budget and timing; the colour block beside the form adds it
 * up live (weeks and a starting figure). Submitting validates and shows a reference — no data
 * leaves the page in this demo.
 */
export function ContactPage() {
  const { t, locale } = useCopy();
  const f = useFormat();
  const tr = locale === "tr";
  const [picked, setPicked] = React.useState<string[]>(["identity"]);
  const [budget, setBudget] = React.useState<Budget>("m");
  const [start, setStart] = React.useState<Start>("q1");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [tried, setTried] = React.useState(false);
  const [sent, setSent] = React.useState<string | null>(null);

  const money = (usd: number, tryAmount: number) => (tr ? f.currency(tryAmount, "TRY", { notation: "compact", maximumFractionDigits: 1 }) : f.currency(usd, "USD", { notation: "compact", maximumFractionDigits: 0 }));
  const chosen = services.filter((s) => picked.includes(s.id));
  // Services overlap: the longest runs in full, the others add half their time.
  const weeks = chosen.length ? Math.max(...chosen.map((s) => s.weeks)) + Math.round(chosen.reduce((a, s) => a + s.weeks, 0) / 2 - Math.max(...chosen.map((s) => s.weeks)) / 2) : 0;
  const fromUsd = chosen.reduce((a, s) => a + s.fromUsd, 0);
  const fromTry = chosen.reduce((a, s) => a + s.fromTry, 0);

  const errors = {
    services: picked.length === 0 ? t({ en: "Pick at least one thing we should make.", tr: "Yapmamız gereken en az bir şey seçin." }) : undefined,
    name: name.trim() === "" ? t({ en: "Tell us who you are.", tr: "Kim olduğunuzu yazın." }) : undefined,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : t({ en: "We need an e-mail address to reply.", tr: "Yanıt için bir e-posta adresi gerekli." }),
  };
  const invalid = Object.values(errors).some(Boolean);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (invalid) {
      const first = errors.services ? "tt-services" : errors.name ? "tt-name" : "tt-email";
      document.getElementById(first)?.focus();
      return;
    }
    setSent(`TT-2611-${String(100 + ((name.length * 37 + email.length * 11) % 900))}`);
  };

  const budgets = [
    { value: "s" as const, label: `${money(15000, 525000)}–${money(30000, 1050000)}`, description: t({ en: "Naming or a focused identity", tr: "İsim ya da odaklı bir kimlik" }) },
    { value: "m" as const, label: `${money(30000, 1050000)}–${money(60000, 2100000)}`, description: t({ en: "Identity plus packaging or a website", tr: "Kimlik artı ambalaj ya da web sitesi" }) },
    { value: "l" as const, label: `${money(60000, 2100000)}+`, description: t({ en: "A full rebrand across several products", tr: "Birden çok üründe tam yeniden markalaşma" }) },
  ];

  return (
    <>
      <Section anchor="start" headingId="tt-contact-title" className="[container-type:inline-size]">
        <Container size="wide">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">{t({ en: "Start a project", tr: "Proje başlatın" })}</p>
          <h1 id="tt-contact-title" className="mt-3 max-w-[12ch] font-display text-[clamp(3rem,11cqi,10rem)] leading-[0.86] tracking-[-0.055em]">
            {t({ en: "Tell us what to make.", tr: "Ne yapalım, söyleyin." })}
          </h1>
        </Container>
      </Section>

      <Section anchor="brief" headingId="tt-brief-title" theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <h2 id="tt-brief-title" className="sr-only">
            {t({ en: "Project brief", tr: "Proje özeti" })}
          </h2>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
            {sent ? (
              <div role="status" className="rounded-ui-lg border-2 border-fg p-8">
                <Check aria-hidden className="size-10" />
                <p className="mt-4 font-display text-display-m">{t({ en: "Got it. We’ll reply within two working days.", tr: "Aldık. İki iş günü içinde yanıt veririz." })}</p>
                <p className="mt-3 text-fg-muted">
                  {t({ en: "Your reference", tr: "Referansınız" })}: <span className="font-mono text-fg">{sent}</span>
                </p>
                <Button className="mt-6" variant="secondary" onClick={() => setSent(null)}>
                  {t({ en: "Edit the brief", tr: "Özeti düzenleyin" })}
                </Button>
              </div>
            ) : (
              <form noValidate onSubmit={submit} className="grid gap-8">
                <Field label={t({ en: "What should we make?", tr: "Ne yapmamızı istersiniz?" })} hint={t({ en: "Pick all that apply.", tr: "Uyanların hepsini seçin." })} error={tried ? errors.services : undefined} required>
                  <ToggleGroup id="tt-services" type="multiple" variant="outline" value={picked} onValueChange={setPicked} className="flex-wrap [&>*]:rounded-ui! [&>*]:m-0.5">
                    {services.map((s) => (
                      <ToggleGroupItem key={s.id} value={s.id} className="data-[state=on]:bg-accent data-[state=on]:text-accent-fg">
                        {t(s.name)}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>
                <Field label={t({ en: "Budget", tr: "Bütçe" })}>
                  <RadioGroup variant="card" value={budget} onValueChange={setBudget} items={budgets} className="grid gap-2 sm:grid-cols-3" />
                </Field>
                <Field label={t({ en: "When should we start?", tr: "Ne zaman başlayalım?" })}>
                  <RadioGroup
                    orientation="horizontal"
                    className="flex flex-wrap gap-x-6 gap-y-2"
                    value={start}
                    onValueChange={setStart}
                    items={[
                      { value: "now", label: t({ en: "As soon as possible", tr: "En kısa sürede" }) },
                      { value: "q1", label: t({ en: "January–March", tr: "Ocak–Mart" }) },
                      { value: "later", label: t({ en: "Later in 2027", tr: "2027’de daha sonra" }) },
                    ]}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t({ en: "Your name", tr: "Adınız" })} error={tried ? errors.name : undefined} required>
                    <Input id="tt-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </Field>
                  <Field label={t({ en: "E-mail", tr: "E-posta" })} error={tried ? errors.email : undefined} required>
                    <Input id="tt-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Field>
                  <Field label={t({ en: "Company", tr: "Şirket" })} optional className="sm:col-span-2">
                    <Input autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </Field>
                  <Field label={t({ en: "What’s going on?", tr: "Neler oluyor?" })} hint={t({ en: "Two or three sentences are plenty.", tr: "İki üç cümle yeter." })} optional className="sm:col-span-2">
                    <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1200} />
                  </Field>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Button type="submit" variant="primary" size="xl">
                    {t({ en: "Send the brief", tr: "Özeti gönderin" })}
                  </Button>
                  <p className="max-w-[40ch] text-[12px] text-fg-muted">{t({ en: "We only use these details to reply. Nothing is shared or added to a mailing list.", tr: "Bu bilgileri yalnızca yanıt vermek için kullanırız. Hiçbir şey paylaşılmaz ya da listeye eklenmez." })}</p>
                </div>
              </form>
            )}

            <div className="grid gap-4 lg:sticky lg:top-24">
              <ColourBlock colour={STUDIO_ACCENT} className="rounded-ui-lg p-6" aria-live="polite">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em]">{t({ en: "Your brief so far", tr: "Şimdiye kadarki özetiniz" })}</p>
                <p className="mt-4 font-display text-[clamp(2rem,4vw,3.25rem)] leading-[0.95] tracking-[-0.045em]">{chosen.length ? chosen.map((s) => t(s.name)).join(" + ") : t({ en: "Nothing yet", tr: "Henüz bir şey yok" })}</p>
                <dl className="mt-6 grid grid-cols-2 gap-4 border-t-2 border-current pt-4 text-[14px]">
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em]">{t({ en: "About", tr: "Yaklaşık" })}</dt>
                    <dd className="mt-1 font-display text-3xl tracking-[-0.04em]">
                      {weeks} {t({ en: "weeks", tr: "hafta" })}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em]">{t({ en: "Starts from", tr: "Başlangıç" })}</dt>
                    <dd className="mt-1 font-display text-3xl tracking-[-0.04em]">{chosen.length ? money(fromUsd, fromTry) : "—"}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-[12px]">{t({ en: "Excluding VAT. A fixed quote follows a one-hour call.", tr: "KDV hariç. Bir saatlik görüşmeden sonra sabit teklif gelir." })}</p>
              </ColourBlock>
              <div className="rounded-ui-lg border border-line p-6 text-[14px]">
                <p className="font-semibold">{t({ en: "Or just come by", tr: "Ya da uğrayın" })}</p>
                <address className="mt-2 not-italic text-fg-muted">{ADDRESS}</address>
                <p className="mt-3 grid gap-1">
                  <a className="focus-ring rounded-ui-sm underline underline-offset-4" href={`tel:${PHONE}`}>
                    {formatSitePhone(PHONE)}
                  </a>
                  <a className="focus-ring rounded-ui-sm underline underline-offset-4" href={`mailto:${EMAIL}`}>
                    {EMAIL}
                  </a>
                </p>
                <p className="mt-3 text-fg-muted">{t({ en: "Monday–Friday, 10:00–18:30. Coffee is on us.", tr: "Pazartesi–cuma, 10:00–18:30. Kahve bizden." })}</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
