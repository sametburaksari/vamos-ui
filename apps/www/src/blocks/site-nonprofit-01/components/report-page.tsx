import { Badge, Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@vamos-ui/react";
import { Container, Cta, PageIntro, Section, SectionHeader, sitePageHref, StatsBand } from "@vamos-ui/react/blocks";
import { ArrowDownToLine } from "lucide-react";
import { board, impact, ledger, reportFiles, spendSplit, type Copy } from "./content";

/** Tones for the four spending shares, strongest first (tokens only). */
const shareTone = ["bg-accent", "bg-fg", "bg-fg-muted", "bg-fg-subtle"];

/** Transparency report: the year in figures, every ₺100, the ledger, files and the board. */
export function ReportPage({ c }: { c: Copy }) {
  const { t, f, lira, intl, labels } = c;
  const common = { locale: intl, labels };
  const income = ledger.income.reduce((s, r) => s + r.amount, 0);
  const spent = ledger.spending.reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        headingLevel={1}
        breadcrumb={[{ label: t({ en: "Home", tr: "Ana sayfa" }), href: sitePageHref("home") }, { label: t({ en: "Report 2025", tr: "2025 raporu" }) }]}
        eyebrow={t({ en: "Transparency report", tr: "Şeffaflık raporu" })}
        title={t({ en: "Where the money went in *2025*", tr: "2025’te para *nereye gitti*" })}
        lead={t({ en: "Every lira in, every lira out, checked by an independent auditor. If a number here doesn’t add up, write to the treasurer — his address is at the bottom.", tr: "Giren her lira, çıkan her lira; bağımsız bir denetçi tarafından kontrol edildi. Buradaki bir rakam tutmuyorsa saymana yazın — adresi en altta." })}
        meta={[
          { label: t({ en: "Period", tr: "Dönem" }), value: f.dateRange("2025-01-01", "2025-12-31", { day: "numeric", month: "short", year: "numeric" }) },
          { label: t({ en: "Auditor", tr: "Denetçi" }), value: "Ilgaz & Partners" },
          { label: t({ en: "Published", tr: "Yayın" }), value: f.date("2026-04-14", { day: "numeric", month: "long", year: "numeric" }) },
        ]}
      />

      <StatsBand
        {...common}
        variant="ledger"
        eyebrow={t({ en: "The year in figures", tr: "Rakamlarla yıl" })}
        items={[
          ...impact.map((s) => ({ value: s.value, label: t(s.label), source: t(s.source) })),
          { value: 1148, label: t({ en: "Monthly givers", tr: "Aylık bağışçı" }), source: t({ en: "Payment records, 31 Dec 2025", tr: "Ödeme kayıtları, 31 Ara 2025" }) },
        ]}
      />

      {/* Every ₺100 */}
      <Section anchor="split" headingId="osf-split-title" theme={{ surface: "surface-2" }}>
        <Container>
          <SectionHeader
            headingId="osf-split-title"
            align="split"
            eyebrow={t({ en: "Every ₺100", tr: "Her ₺100" })}
            title={t({ en: "₺92 reach a shelf, *₺8 keep the lights on*", tr: "₺92 rafa ulaşır, *₺8 ışıkları açık tutar*" })}
            lead={t({ en: "Shares of what we spent in 2025. Running costs include the audit, card fees and the one person who does our fundraising.", tr: "2025 harcamalarımızın payları. İşletme giderlerine denetim, kart komisyonları ve bağış toplamayı yürüten tek kişi dahil." })}
          />
          <div className="mt-10">
            <div className="flex h-14 w-full overflow-hidden border border-fg" role="img" aria-label={f.list(spendSplit.map((s) => `${t(s.label)} ${lira(s.share)}`))}>
              {spendSplit.map((s, i) => (
                <span key={s.key} className={`${shareTone[i]} block h-full border-e border-scene last:border-e-0`} style={{ width: `${s.share}%` }} />
              ))}
            </div>
            <ol className="m-0 mt-6 grid list-none gap-x-8 gap-y-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {spendSplit.map((s, i) => (
                <li key={s.key} className="border-t border-line pt-4">
                  <span className="flex items-center gap-2">
                    <span aria-hidden className={`${shareTone[i]} size-3 shrink-0`} />
                    <span className="font-semibold">{t(s.label)}</span>
                  </span>
                  <span className="mt-2 block font-display text-display-m leading-none tabular-nums">{lira(s.share)}</span>
                  <span className="mt-2 block text-small text-fg-muted">{t(s.note)}</span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      {/* Ledger */}
      <Section anchor="ledger" headingId="osf-ledger-title">
        <Container>
          <SectionHeader headingId="osf-ledger-title" eyebrow={t({ en: "Ledger", tr: "Defter" })} title={t({ en: "Income and *spending*", tr: "Gelir ve *gider*" })} />
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <LedgerTable c={c} caption={t({ en: "Income, 2025", tr: "Gelir, 2025" })} rows={ledger.income} total={income} />
            <LedgerTable c={c} caption={t({ en: "Spending, 2025", tr: "Gider, 2025" })} rows={ledger.spending} total={spent} />
          </div>
          <p className="m-0 mt-6 max-w-[70ch] text-small text-fg-muted">
            {t({
              en: `Income ${lira(income)} minus spending ${lira(spent)} leaves ${lira(income - spent)}, of which ${lira(ledger.reserve)} is held as a reserve for the first quarter of 2026.`,
              tr: `${lira(income)} gelirden ${lira(spent)} gider düşüldüğünde ${lira(income - spent)} kalıyor; bunun ${lira(ledger.reserve)} kadarı 2026’nın ilk çeyreği için yedek olarak tutuluyor.`,
            })}
          </p>
        </Container>
      </Section>

      {/* Files */}
      <Section anchor="files" headingId="osf-files-title" theme={{ rhythm: "tight" }}>
        <Container>
          <div className="grid gap-10 border-t border-fg pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <SectionHeader headingId="osf-files-title" eyebrow={t({ en: "Check us", tr: "Bizi denetleyin" })} title={t({ en: "The full *paperwork*", tr: "Tüm *belgeler*" })} />
            <ul className="m-0 list-none p-0">
              {reportFiles.map((file) => (
                <li key={file.href} className="border-b border-line first:border-t">
                  <a href={file.href} className="group flex items-center gap-4 py-4 focus-ring">
                    <ArrowDownToLine aria-hidden className="size-5 shrink-0 text-accent-ink" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold underline decoration-line underline-offset-4 group-hover:decoration-fg">{t(file.name)}</span>
                      <span className="block text-small text-fg-muted">{t(file.meta)}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Board */}
      <Section anchor="board" headingId="osf-board-title" theme={{ rhythm: "tight" }}>
        <Container>
          <div className="grid gap-10 border-t border-fg pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <SectionHeader
              headingId="osf-board-title"
              eyebrow={t({ en: "Governance", tr: "Yönetişim" })}
              title={t({ en: "Board of *trustees*", tr: "Mütevelli *heyeti*" })}
              lead={t({ en: "Unpaid. Meets every second month; minutes are on request.", tr: "Ücretsiz görev yapar. İki ayda bir toplanır; tutanaklar talep üzerine paylaşılır." })}
            />
            <dl className="m-0 grid gap-0 sm:grid-cols-2">
              {board.map((b) => (
                <div key={b.name} className="border-t border-line py-4 sm:pe-6">
                  <dt className="font-semibold">{b.name}</dt>
                  <dd className="m-0 text-small text-fg-muted">{t(b.role)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      <Cta
        {...common}
        variant="band"
        theme={{ surface: "accent" }}
        title={t({ en: "Seen enough? *Stock a shelf.*", tr: "Yeterince gördünüz mü? *Bir rafı doldurun.*" })}
        lead={t({ en: "₺1,500 buys a box of 30 new picture books.", tr: "₺1.500 ile 30 yeni resimli kitaplık bir koli alınır." })}
        actions={[{ link: { href: sitePageHref("donate"), label: t({ en: "Donate", tr: "Bağış yap" }) }, style: "primary" }]}
      />
    </>
  );
}

function LedgerTable({ c, caption, rows, total }: { c: Copy; caption: string; rows: typeof ledger.income; total: number }) {
  const { t, f, lira } = c;
  return (
    <Table>
      <TableCaption side="top" className="pb-3 text-start font-display text-h3 text-fg">{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{t({ en: "Line", tr: "Kalem" })}</TableHead>
          <TableHead align="end">{t({ en: "Share", tr: "Pay" })}</TableHead>
          <TableHead align="end">{t({ en: "Amount", tr: "Tutar" })}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={t(r.label)}>
            <TableCell>{t(r.label)}</TableCell>
            <TableCell align="end" className="text-fg-muted tabular-nums">
              {f.percent(r.amount / total, { maximumFractionDigits: 0 })}
            </TableCell>
            <TableCell align="end" className="font-mono tabular-nums">
              {lira(r.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="font-semibold">
            {t({ en: "Total", tr: "Toplam" })} <Badge tone="outline" className="ms-2">2025</Badge>
          </TableCell>
          <TableCell />
          <TableCell align="end" className="font-mono font-semibold tabular-nums">
            {lira(total)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
