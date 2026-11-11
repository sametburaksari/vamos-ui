import { Table, TableBody, TableCaption, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@vamos-ui/react";
import { BlockLink, Container, Faq, PageIntro, RichText, Section, SectionHeader, Steps, sitePageHref } from "@vamos-ui/react/blocks";
import { faqSecurity, policyJson, retention, SECURITY_EMAIL, subprocessors, type Copy } from "./content";

/**
 * Security: what happens to a sentence (steps), retention per plan, the admin policy file,
 * subprocessors, how to report a vulnerability and a short FAQ.
 */
export function SecurityPage({ c }: { c: Copy }) {
  const { t, f, intl, labels } = c;
  const common = { locale: intl, labels };
  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        headingLevel={1}
        breadcrumb={[{ label: "Quill", href: sitePageHref("home") }, { label: t({ en: "Security", tr: "Güvenlik" }) }]}
        eyebrow={t({ en: "Security and data handling", tr: "Güvenlik ve veri işleme" })}
        title={t({ en: "Your words are *yours*. Here is the proof.", tr: "Kelimeleriniz *sizindir*. Kanıtı burada." })}
        lead={t({ en: "What happens to a sentence from the moment you press Rewrite, how long anything is kept, and who else touches it.", tr: "Yeniden yaz’a bastığınız andan itibaren bir cümleye ne olduğu, neyin ne kadar tutulduğu ve başka kimin dokunduğu." })}
        meta={[
          { label: t({ en: "Last audit", tr: "Son denetim" }), value: f.date("2026-09-18", "long") },
          { label: t({ en: "Report", tr: "Rapor" }), value: t({ en: "SOC 2 Type II, on request", tr: "SOC 2 Tip II, talep üzerine" }) },
          { label: t({ en: "Region", tr: "Bölge" }), value: t({ en: "Frankfurt or Virginia", tr: "Frankfurt ya da Virginia" }) },
        ]}
      />

      <Steps
        {...common}
        anchor="flow"
        variant="horizontal"
        eyebrow={t({ en: "The life of a sentence", tr: "Bir cümlenin yolculuğu" })}
        title={t({ en: "From your draft to *nowhere*, in four steps", tr: "Taslağınızdan *hiçliğe*, dört adımda" })}
        steps={[
          { title: t({ en: "Sent over TLS 1.3", tr: "TLS 1.3 ile gönderilir" }), text: t({ en: "Only the selected text and the tone you picked. No page, no thread, no contacts.", tr: "Yalnızca seçili metin ve seçtiğiniz ton. Sayfa, yazışma ya da kişiler değil." }), duration: "~40 ms" },
          { title: t({ en: "Checked against your style", tr: "Üslubunuzla karşılaştırılır" }), text: t({ en: "Banned phrases and house rules are applied in the same request, in your region.", tr: "Yasaklı ifadeler ve kurum kuralları aynı istekte, sizin bölgenizde uygulanır." }), duration: "~90 ms" },
          { title: t({ en: "Rewritten in memory", tr: "Bellekte yeniden yazılır" }), text: t({ en: "The model runs on our own deployment. Nothing is written to disk or logs.", tr: "Model kendi kurulumumuzda çalışır. Diske ya da kayıtlara hiçbir şey yazılmaz." }), duration: "~1.2 s" },
          { title: t({ en: "Returned, then discarded", tr: "Döndürülür, sonra silinir" }), text: t({ en: "Memory is cleared when the response closes. Only a count (“1 rewrite, 84 words”) remains.", tr: "Yanıt kapandığında bellek temizlenir. Yalnızca bir sayı kalır (“1 yazım, 84 kelime”)." }), duration: "0 ms" },
        ]}
      />

      <Section anchor="retention" headingId="ql-ret-title" theme={{ surface: "surface-2" }}>
        <Container>
          <SectionHeader
            headingId="ql-ret-title"
            align="split"
            eyebrow={t({ en: "Retention", tr: "Saklama" })}
            title={t({ en: "What we keep, and for *how long*", tr: "Neyi, *ne kadar* tutuyoruz" })}
            lead={t({ en: "Defaults per plan. Admins can only make these shorter, never longer.", tr: "Paket başına varsayılanlar. Yöneticiler bunları yalnızca kısaltabilir, uzatamaz." })}
          />
          <TableContainer className="mt-10 surface rounded-ui-lg">
            <Table>
              <TableCaption visuallyHidden>{t({ en: "Data retention by plan", tr: "Pakete göre veri saklama" })}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{t({ en: "Data", tr: "Veri" })}</TableHead>
                  <TableHead scope="col">{t({ en: "Draft", tr: "Taslak" })}</TableHead>
                  <TableHead scope="col">{t({ en: "Team", tr: "Ekip" })}</TableHead>
                  <TableHead scope="col">{t({ en: "Organisation", tr: "Kurum" })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {retention.map((r) => (
                  <TableRow key={t(r.what)}>
                    <TableCell className="font-medium text-fg">{t(r.what)}</TableCell>
                    <TableCell>{t(r.draft)}</TableCell>
                    <TableCell>{t(r.team)}</TableCell>
                    <TableCell>{t(r.org)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Section>

      <Section anchor="policy" headingId="ql-pol-title">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <SectionHeader
                headingId="ql-pol-title"
                eyebrow={t({ en: "Admin policy", tr: "Yönetici politikası" })}
                title={t({ en: "One file your *security team* can read", tr: "*Güvenlik ekibinizin* okuyabileceği tek dosya" })}
                lead={t({
                  en: "Every workspace setting that touches data lives in one policy, versioned in your audit log. Export it, review it in a pull request, apply it through the API.",
                  tr: "Veriye dokunan her çalışma alanı ayarı tek bir politikada durur ve denetim kaydınızda sürümlenir. Dışa aktarın, bir PR’da inceleyin, API ile uygulayın.",
                })}
              />
            </div>
            <div className="min-w-0 lg:col-span-7">
              <p className="m-0 mb-2 font-mono text-xs text-fg-subtle">quill.policy.json</p>
              <RichText doc={{ type: "doc", content: [{ type: "code", language: "json", text: policyJson }] }} fullWidth />
            </div>
          </div>
        </Container>
      </Section>

      <Section anchor="subprocessors" headingId="ql-sub-title" theme={{ surface: "surface-2" }}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeader
                headingId="ql-sub-title"
                eyebrow={t({ en: "Subprocessors", tr: "Alt işleyiciler" })}
                title={t({ en: "Four companies, *named*", tr: "Dört şirket, *isimleriyle*" })}
                lead={t({ en: "We email admins 30 days before adding one. Updated 4 November 2026.", tr: "Yeni birini eklemeden 30 gün önce yöneticilere e-posta göndeririz. Güncelleme: 4 Kasım 2026." })}
              />
            </div>
            <ul className="m-0 list-none p-0 lg:col-span-8">
              {subprocessors.map((s) => (
                <li key={s.name} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[13rem_minmax(0,1fr)_8rem] sm:gap-6">
                  <span className="font-medium text-fg">{s.name}</span>
                  <span className="text-fg-muted">{t(s.role)}</span>
                  <span className="font-mono text-xs text-fg-subtle sm:text-end">{t(s.region)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section anchor="report" headingId="ql-rep-title">
        <Container>
          <div className="surface grid gap-6 rounded-ui-lg p-6 sm:p-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <h2 id="ql-rep-title" className="m-0 font-display text-display-m text-fg">
                {t({ en: "Found something? Tell us first.", tr: "Bir şey mi buldunuz? Önce bize söyleyin." })}
              </h2>
              <p className="m-0 mt-3 max-w-[56ch] text-fg-muted">
                {t({
                  en: "We answer within 2 working days, don’t take legal action against good-faith research, and pay bounties from $250 to $8,000.",
                  tr: "2 iş günü içinde yanıt veririz, iyi niyetli araştırmalara karşı hukuki işlem başlatmayız ve 250 $ ile 8.000 $ arasında ödül veririz.",
                })}
              </p>
              <p className="m-0 mt-3 font-mono text-xs break-all text-fg-subtle">PGP 4F2A 91C0 7DE3 18B5 · /.well-known/security.txt</p>
            </div>
            <BlockLink href={`mailto:${SECURITY_EMAIL}`} appearance="primary" size="lg" {...common}>
              {SECURITY_EMAIL}
            </BlockLink>
          </div>
        </Container>
      </Section>

      <Faq
        {...common}
        anchor="security-faq"
        variant="stacked"
        theme={{ surface: "surface-2" }}
        eyebrow="FAQ"
        title={t({ en: "Questions from *security reviews*", tr: "*Güvenlik incelemelerinden* sorular" })}
        items={faqSecurity.map((x) => ({ q: t(x.q), a: t(x.a) }))}
        deepLink={false}
      />
    </>
  );
}
