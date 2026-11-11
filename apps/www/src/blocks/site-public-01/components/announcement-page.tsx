import { Bus, Droplets, FileText } from "lucide-react";
import { Alert, Badge } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, EMAIL, noticeKinds, notices, works, type SiteLocale } from "./content";

/**
 * One announcement — planned water works: the facts first (when, where, reference), what to do,
 * a dated timeline, affected streets, a downloadable notice and the other announcements.
 */
export function AnnouncementPage({ locale, time }: { locale: SiteLocale; time: { start: string; end: string } }) {
  const { t, f, intl, labels } = copyFor(locale);
  const notice = notices[0]!;
  const others = notices.slice(1, 4);
  const day = (iso: string) => f.date(iso, { weekday: "long", day: "numeric", month: "long" });
  const at = (iso: string) => f.time(iso, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

  return (
    <>
      <PageIntro
        locale={intl}
        labels={labels}
        variant="ruled"
        breadcrumb={[
          { label: t({ en: "Home", tr: "Ana sayfa" }), href: sitePageHref("home") },
          { label: t({ en: "Announcements", tr: "Duyurular" }), href: sitePageHref("home", "announcements") },
          { label: t({ en: "Water main renewal", tr: "Su hattı yenilemesi" }) },
        ]}
        eyebrow={`${t(noticeKinds[notice.kind])} · ${t({ en: "published", tr: "yayım" })} ${f.date(notice.date, "long")}`}
        title={t(notice.title)}
        lead={t({
          en: "We are replacing 380 metres of 1962 cast-iron water main under Iskele Caddesi. Homes and shops at numbers 1–58, Fener Sokak and Değirmen Çıkmazı will have no water for up to 57 hours.",
          tr: "İskele Caddesi altındaki 1962 yapımı 380 metrelik dökme demir su hattını yeniliyoruz. 1–58 numaralar, Fener Sokak ve Değirmen Çıkmazı’ndaki konut ve dükkânlarda 57 saate kadar su olmayacak.",
        })}
      />

      <Section theme={{ rhythm: "tight" }} className="pt-8" aria-label={t({ en: "Details", tr: "Ayrıntılar" })}>
        <Container>
          <div className="grid gap-10 @4xl:grid-cols-12">
            <article className="flex flex-col gap-10 @4xl:col-span-8">
              <dl className="m-0 grid gap-px overflow-hidden rounded-ui border-2 border-fg bg-fg @2xl:grid-cols-3">
                {[
                  { k: { en: "Water off", tr: "Su kesintisi" }, v: `${day(works.start)}, ${time.start}` },
                  { k: { en: "Water back", tr: "Su gelişi" }, v: `${day(works.end)}, ${t({ en: "by", tr: "en geç" })} ${time.end}` },
                  { k: { en: "Reference", tr: "Referans" }, v: works.ref },
                ].map((row) => (
                  <div key={row.k.en} className="bg-surface p-4">
                    <dt className="text-small font-bold text-fg-muted">{t(row.k)}</dt>
                    <dd className="m-0 mt-1 text-h3 font-semibold leading-snug tabular-nums">{row.v}</dd>
                  </div>
                ))}
              </dl>

              <Alert tone="info" icon={<Droplets aria-hidden />} title={t({ en: "Drinking water tankers", tr: "İçme suyu tankerleri" })}>
                  {t({
                    en: "On Iskele Square and at the corner of Fener Sokak, 10:00–22:00 each day. Residents over 70 or with a disability can ask for 20 litres delivered to the door: call +90 216 000 00 00.",
                    tr: "Her gün 10.00–22.00 arası İskele Meydanı’nda ve Fener Sokak köşesinde. 70 yaş üstü ya da engelli sakinler kapıya 20 litre teslim isteyebilir: +90 216 000 00 00.",
                  })}
              </Alert>

              <section aria-labelledby="ann-steps">
                <h2 id="ann-steps" className="m-0 font-display text-display-m">
                  {t({ en: "What happens when", tr: "Ne zaman ne olacak" })}
                </h2>
                <ol className="m-0 mt-6 list-none border-s-2 border-fg p-0">
                  {works.timeline.map((s) => (
                    <li key={s.at} className="relative ps-6 pb-7 last:pb-0">
                      <span aria-hidden className="absolute -start-[7px] top-1.5 size-3 rounded-full border-2 border-fg bg-accent" />
                      <p className="m-0 text-small font-bold tabular-nums text-accent-ink">
                        <time dateTime={s.at}>
                          {day(s.at)} · {at(s.at)}
                        </time>
                      </p>
                      <h3 className="m-0 mt-1 text-h3 font-semibold">{t(s.title)}</h3>
                      <p className="m-0 mt-1 max-w-[60ch] text-body text-fg-muted">{t(s.text)}</p>
                    </li>
                  ))}
                </ol>
              </section>

              <section aria-labelledby="ann-streets">
                <h2 id="ann-streets" className="m-0 font-display text-display-m">
                  {t({ en: "Streets affected", tr: "Etkilenen sokaklar" })}
                </h2>
                <table className="mt-5 w-full border-collapse text-body">
                  <caption className="sr-only">{t({ en: "Streets and the part affected", tr: "Sokaklar ve etkilenen kısım" })}</caption>
                  <thead>
                    <tr className="border-b-2 border-fg">
                      <th scope="col" className="py-2 text-start font-bold">{t({ en: "Street", tr: "Sokak" })}</th>
                      <th scope="col" className="py-2 text-start font-bold">{t({ en: "Affected", tr: "Etkilenen" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {works.streets.map((s) => (
                      <tr key={s.name} className="border-b border-line">
                        <th scope="row" className="py-3 pe-4 text-start font-semibold">{s.name}</th>
                        <td className="py-3">{t(s.detail)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="m-0 mt-5 flex items-start gap-2 text-body">
                  <Bus aria-hidden className="mt-1 size-5 shrink-0 text-accent-ink" />
                  {t({ en: "Buses 14 and 22 run via Kayıkhane Yolu; the Iskele stop moves 120 m north, outside the library.", tr: "14 ve 22 numaralı otobüsler Kayıkhane Yolu üzerinden gider; İskele durağı 120 m kuzeye, kütüphanenin önüne taşınır." })}
                </p>
              </section>
            </article>

            <aside className="flex flex-col gap-8 @4xl:col-span-4">
              <div className="rounded-ui border-2 border-fg p-5">
                <h2 className="m-0 text-h3 font-semibold">{t({ en: "The notice as a document", tr: "Duyurunun belgesi" })}</h2>
                <a href="https://files.example.com/rdo-2026-1187.pdf" className="mt-4 flex items-start gap-3 rounded-ui-sm p-2 -m-2 hover:bg-hover focus-ring">
                  <FileText aria-hidden className="mt-0.5 size-6 shrink-0 text-accent-ink" />
                  <span>
                    <span className="block font-semibold text-accent-ink underline underline-offset-[0.2em]">{t({ en: "Water works notice", tr: "Su çalışması duyurusu" })}</span>
                    <span className="block text-small text-fg-muted">{t({ en: "PDF, tagged, 182 KB, 2 pages", tr: "PDF, etiketli, 182 KB, 2 sayfa" })}</span>
                  </span>
                </a>
                <p className="m-0 mt-4 text-small">
                  {t({ en: "Large print, Braille or Easy Read on request:", tr: "Büyük punto, Braille ya da kolay okunur hâli talep üzerine:" })}{" "}
                  <a href={`mailto:${EMAIL}?subject=${works.ref}`} className="font-semibold text-accent-ink underline underline-offset-[0.2em] focus-ring rounded-[2px]">
                    {EMAIL}
                  </a>
                </p>
              </div>

              <div>
                <h2 className="m-0 text-small font-bold tracking-[0.08em] text-accent-ink uppercase">{t({ en: "Other announcements", tr: "Diğer duyurular" })}</h2>
                <ul className="m-0 mt-3 list-none p-0">
                  {others.map((n) => (
                    <li key={n.id} className="border-t border-line py-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">{t(noticeKinds[n.kind])}</Badge>
                        <time dateTime={n.date} className="text-small text-fg-muted tabular-nums">
                          {f.date(n.date, "long")}
                        </time>
                      </div>
                      <p className="m-0 mt-1.5 font-semibold leading-snug">{t(n.title)}</p>
                    </li>
                  ))}
                </ul>
                <a href={sitePageHref("home", "announcements")} className="mt-2 inline-block text-body font-semibold text-accent-ink underline underline-offset-[0.2em] focus-ring rounded-[2px]">
                  {t({ en: "All announcements", tr: "Tüm duyurular" })}
                </a>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
