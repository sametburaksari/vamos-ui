import { BlockHeading, Container, Faq, Section, Steps } from "@vamos-ui/react/blocks";
import { faqDownload, type Copy } from "./content";
import { PhoneFrame, PlanScreen } from "./phone";
import { StoreBadges } from "./store-badges";

/** Download + FAQ: store badges and requirements, three setup steps, then the full FAQ. */
export function DownloadPage({ c }: { c: Copy }) {
  const { t, intl, labels } = c;
  const common = { locale: intl, labels };
  const reqs = [
    ["iPhone", t({ en: "iOS 17 or later · 148 MB", tr: "iOS 17 ve üstü · 148 MB" })],
    ["Android", t({ en: "Android 10 or later · 96 MB", tr: "Android 10 ve üstü · 96 MB" })],
    [t({ en: "Watches", tr: "Saatler" }), t({ en: "watchOS 10+, Wear OS 4+, .fit import", tr: "watchOS 10+, Wear OS 4+, .fit içe aktarma" })],
    [t({ en: "Languages", tr: "Diller" }), t({ en: "English, Turkish, German", tr: "İngilizce, Türkçe, Almanca" })],
  ];
  return (
    <>
      <Section anchor="get" headingId="tr-download-title" className="overflow-hidden">
        <Container size="wide">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-24">
            <div>
              <p className="m-0 font-mono text-xs tracking-[0.1em] text-fg-muted uppercase">{t({ en: "Version 5.3 · 6 November 2026", tr: "Sürüm 5.3 · 6 Kasım 2026" })}</p>
              <BlockHeading id="tr-download-title" level={1} size="display-xl" className="mt-5 max-w-[12ch]" text={t({ en: "Lace up. *Download.* Go.", tr: "Bağla. *İndir.* Koş." })} />
              <p className="mt-6 max-w-[46ch] text-lead text-fg-muted">
                {t({ en: "Free on both stores. Sign in with your email — no password, no card.", tr: "İki mağazada da ücretsiz. E-postanızla giriş yapın — şifre yok, kart yok." })}
              </p>
              <StoreBadges c={c} size="lg" className="mt-10" />
              <dl className="mt-12 grid max-w-2xl border-t border-line sm:grid-cols-2">
                {reqs.map(([k, v]) => (
                  <div key={k} className="border-b border-line py-4 sm:odd:pe-6 sm:even:border-s sm:even:ps-6">
                    <dt className="font-mono text-[11px] tracking-[0.08em] text-fg-subtle uppercase">{k}</dt>
                    <dd className="m-0 mt-1 text-small text-fg">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div role="img" aria-label={t({ en: "This week’s plan on the phone", tr: "Telefonda bu haftanın planı" })} className="justify-self-center">
              <PhoneFrame className="-rotate-2">
                <div className="flex flex-1 flex-col" aria-hidden>
                  <PlanScreen c={c} />
                </div>
              </PhoneFrame>
            </div>
          </div>
        </Container>
      </Section>

      <Steps
        {...common}
        anchor="setup"
        variant="horizontal"
        theme={{ surface: "surface-2" }}
        eyebrow={t({ en: "First run", tr: "İlk koşu" })}
        title={t({ en: "Running in *four minutes*", tr: "*Dört dakikada* koşuya" })}
        steps={[
          { title: t({ en: "Install and sign in", tr: "Kurun ve giriş yapın" }), text: t({ en: "A six-digit code arrives by email.", tr: "E-postanıza altı haneli bir kod gelir." }), duration: t({ en: "1 min", tr: "1 dk" }) },
          { title: t({ en: "Connect your watch", tr: "Saatinizi bağlayın" }), text: t({ en: "Optional. Tempo also runs on the phone alone.", tr: "İsteğe bağlı. Tempo tek başına telefonda da çalışır." }), duration: t({ en: "2 min", tr: "2 dk" }) },
          { title: t({ en: "Answer five questions", tr: "Beş soruyu yanıtlayın" }), text: t({ en: "Recent runs, goal, free days. Your first week appears.", tr: "Son koşular, hedef, boş günler. İlk haftanız belirir." }), duration: t({ en: "1 min", tr: "1 dk" }) },
        ]}
      />

      <Faq
        {...common}
        anchor="faq"
        variant="stacked"
        openFirst
        eyebrow="FAQ"
        title={t({ en: "Before you *download*", tr: "İndirmeden *önce*" })}
        items={faqDownload.map((x) => ({ q: t(x.q), a: t(x.a) }))}
      />
    </>
  );
}
