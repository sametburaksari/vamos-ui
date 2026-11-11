import { Lock, Mail } from "lucide-react";
import { Badge, Button } from "@vamos-ui/react";
import { Container, PageIntro, Section, Steps } from "@vamos-ui/react/blocks";
import { copyFor, home, layers, lostPhone, SECURITY_EMAIL, uptime, type SiteLocale } from "./content";
import { TrustBadges } from "./trust-badges";

const stateTone = { up: "bg-success", degraded: "bg-warning", down: "bg-danger" } as const;

/**
 * Security: four layers of protection with their proofs, the last 90 days of service health,
 * what to do when a phone is lost, and how to report a vulnerability.
 */
export function SecurityPage({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const outage = uptime.find((d) => d.state === "down")!;
  const degraded = uptime.filter((d) => d.state === "degraded").length;

  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[{ label: "Fernway", href: home() }, { label: t({ en: "Security", tr: "Güvenlik" }) }]}
        eyebrow={t({ en: "Security & safeguarding", tr: "Güvenlik ve koruma" })}
        title={t({ en: "Where your money is, and who can touch it", tr: "Paranız nerede ve ona kim dokunabilir" })}
        lead={t({
          en: "The short version: it is held apart from ours, only your face or finger on your phone can move it, and people check anything unusual before it leaves.",
          tr: "Kısaca: bizimkinden ayrı tutulur, onu yalnızca telefonunuzdaki yüzünüz ya da parmağınız hareket ettirebilir ve olağan dışı her şey çıkmadan önce insanlar tarafından kontrol edilir.",
        })}
        meta={[
          { label: t({ en: "Last audit", tr: "Son denetim" }), value: f.date("2026-06-30", "medium") },
          { label: t({ en: "Last penetration test", tr: "Son sızma testi" }), value: f.date("2026-09-12", "medium") },
        ]}
      />

      <Section headingId="fw-layers" theme={{ rhythm: "tight" }}>
        <Container className="flex flex-col gap-10">
          <h2 id="fw-layers" className="sr-only">
            {t({ en: "Four layers of protection", tr: "Dört koruma katmanı" })}
          </h2>
          <ol className="grid gap-px overflow-hidden rounded-[calc(var(--radius)*1.6)] border border-surface-border bg-line @4xl:grid-cols-2">
            {layers.map((l) => (
              <li key={l.no} className="surface flex flex-col gap-4 rounded-none border-0 p-6 shadow-none @md:p-8">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-small text-accent-ink tabular">{l.no}</span>
                  <h3 className="text-h3 font-semibold tracking-[-0.02em] text-balance">{t(l.title)}</h3>
                </div>
                <p className="max-w-[52ch] text-fg-muted text-pretty">{t(l.text)}</p>
                <ul className="mt-auto flex flex-wrap gap-2 pt-2">
                  {l.facts.map((x, i) => (
                    <li key={i}>
                      <Badge tone="outline">
                        {t(x)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <TrustBadges locale={locale} label={t({ en: "Licences and certifications", tr: "Lisanslar ve sertifikalar" })} />
        </Container>
      </Section>

      <Section anchor="status" headingId="fw-status" theme={{ rhythm: "tight" }}>
        <Container>
          <div className="surface flex flex-col gap-5 rounded-[calc(var(--radius)*1.6)] border border-surface-border p-6 @md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="fw-status" className="text-h3 font-semibold tracking-[-0.02em]">
                {t({ en: "Service health, last 90 days", tr: "Hizmet durumu, son 90 gün" })}
              </h2>
              <p className="inline-flex items-center gap-2 text-small">
                <span aria-hidden className="size-2 rounded-full bg-success" />
                {t({ en: "All systems working", tr: "Tüm sistemler çalışıyor" })}
              </p>
            </div>
            <div aria-hidden className="flex h-10 items-stretch gap-[2px]">
              {uptime.map((d) => (
                <span key={d.day} title={`${d.day} · ${d.state}`} className={`min-w-0 flex-1 rounded-[2px] ${stateTone[d.state]} ${d.state === "up" ? "opacity-70" : ""}`} />
              ))}
            </div>
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 text-small text-fg-muted">
              <span className="tabular">{f.date(uptime[0]!.day, "medium")}</span>
              <p>
                {t({
                  en: `99.97% uptime · 1 outage (22 min, ${f.date(outage.day, "medium")}) · ${degraded} days with slower payments`,
                  tr: `%99,97 erişilebilirlik · 1 kesinti (22 dk, ${f.date(outage.day, "medium")}) · ödemelerin yavaşladığı ${degraded} gün`,
                })}
              </p>
              <span className="tabular">{t({ en: "Today", tr: "Bugün" })}</span>
            </div>
          </div>
        </Container>
      </Section>

      <Steps
        {...common}
        variant="horizontal"
        anchor="lost-phone"
        eyebrow={t({ en: "If your phone is lost", tr: "Telefonunuz kaybolursa" })}
        title={t({ en: "Four steps, the first takes a minute", tr: "Dört adım, ilki bir dakika sürer" })}
        steps={lostPhone.map((s) => ({ title: t(s.title), text: t(s.text), duration: t(s.duration) }))}
      />

      <Section anchor="report" headingId="fw-report" theme={{ rhythm: "tight" }}>
        <Container>
          <div className="grid gap-8 rounded-[calc(var(--radius)*1.6)] border border-line bg-surface-2 p-6 @md:p-10 @4xl:grid-cols-12">
            <div className="flex flex-col gap-3 @4xl:col-span-7">
              <Lock aria-hidden className="size-5 text-accent-ink" />
              <h2 id="fw-report" className="font-display text-display-m text-balance">
                {t({ en: "Found a vulnerability?", tr: "Bir güvenlik açığı mı buldunuz?" })}
              </h2>
              <p className="max-w-[52ch] text-fg-muted text-pretty">
                {t({
                  en: "Tell us first and give us 90 days to fix it. We reply within two working days, never take legal action over good-faith research, and pay up to ₺250,000 for critical findings.",
                  tr: "Önce bize söyleyin ve düzeltmemiz için 90 gün tanıyın. İki iş günü içinde yanıt veririz, iyi niyetli araştırmalar için asla hukuki işlem başlatmayız ve kritik bulgular için 250.000 ₺’ye kadar ödeme yaparız.",
                })}
              </p>
            </div>
            <div className="flex flex-col justify-end gap-3 @4xl:col-span-5">
              <Button asChild variant="primary" size="lg">
                <a href={`mailto:${SECURITY_EMAIL}`}>
                  <Mail aria-hidden /> {SECURITY_EMAIL}
                </a>
              </Button>
              <p className="font-mono text-eyebrow text-fg-muted [overflow-wrap:anywhere]">PGP 7F3A 19C2 0B4E 88D1 5A6F · /.well-known/security.txt</p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
