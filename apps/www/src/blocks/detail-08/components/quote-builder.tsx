"use client";

import * as React from "react";
import { Eye, FilePenLine, MessageSquareQuote, PenLine, Send, ShieldQuestion, Split } from "lucide-react";
import {
  ActivityTimeline,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  DatePicker,
  Field,
  PageHeader,
  Select,
  Stepper,
  Textarea,
  arrayRecordSource,
  toast,
  type StepItem,
  type TimelineEntry,
} from "@vamos-ui/react";
import { LineItems, SignerStatus, computeLineTotals, trLineTaxPack, type LineDiscount, type LineItem, type Signer } from "@vamos-ui/react/business";
import { useBlockFormat } from "../../_shared/format";
import { NOW_MS, TODAY, day } from "../../_shared/time";
import {
  MIN_MARGIN,
  billingCycles,
  catalogue,
  catalogueById,
  champion,
  changeRequest,
  company,
  controller,
  financeManager,
  history,
  initialLines,
  paymentTerms,
  preparedBy,
  quote,
  salesManager,
  unitLabels,
  units,
  type CatalogueItem,
  type QuoteEvent,
} from "./data";
import { DealDesk, bandFor, type DeskFigures } from "./deal-desk";
import { SendDialog, type DraftSigner, type SendRequest } from "./send-dialog";

type Status = "draft" | "approval" | "sent" | "viewed" | "signed";
const taxPack = trLineTaxPack(TODAY);
const toNum = (s: string) => Number(s) || 0;

/** Quote builder: the document on the left, the deal desk, signatures and history on the right. */
export function QuoteBuilder() {
  const { f, t, c, lang } = useBlockFormat();
  const [status, setStatus] = React.useState<Status>("draft");
  const [revision, setRevision] = React.useState(quote.revision);
  const [lines, setLines] = React.useState<LineItem[]>(() => initialLines(lang));
  const [docDiscount, setDocDiscount] = React.useState<LineDiscount | undefined>(undefined);
  const [approvedAt, setApprovedAt] = React.useState<number | null>(null);
  const [terms, setTerms] = React.useState<string>("split");
  const [billing, setBilling] = React.useState<string>("annual");
  const [validUntil, setValidUntil] = React.useState<string | null>(quote.validUntil);
  const [note, setNote] = React.useState(
    c(
      "Prices cover all six properties on one master agreement. Licences start on the go-live date of the first hotel.",
      "Fiyatlar altı oteli tek bir çerçeve sözleşme altında kapsar. Lisanslar ilk otelin canlıya geçiş tarihinde başlar.",
    ),
  );
  const [requestOpen, setRequestOpen] = React.useState(true);
  const [sendOpen, setSendOpen] = React.useState(false);
  const [signers, setSigners] = React.useState<Signer[]>([]);
  const [events, setEvents] = React.useState<QuoteEvent[]>(history);
  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const locked = status !== "draft";
  const totals = React.useMemo(() => computeLineTotals(lines, { taxPack, documentDiscount: docDiscount }), [lines, docDiscount]);
  const figures = React.useMemo<DeskFigures>(() => {
    const sub = toNum(totals.subtotal);
    const net = toNum(totals.net);
    const discountPct = sub > 0 ? (toNum(totals.discount) / sub) * 100 : 0;
    let cost = 0;
    let recurring = 0;
    for (const row of lines) {
      const item = row.itemId ? catalogueById[row.itemId] : undefined;
      const res = totals.lines.find((l) => l.id === row.id);
      if (item) cost += toNum(item.cost) * toNum(row.quantity);
      if (item?.recurring && res) recurring += toNum(res.net);
    }
    const marginPct = net > 0 ? ((net - cost) / net) * 100 : 0;
    const band = bandFor(discountPct);
    const approver = marginPct < MIN_MARGIN ? financeManager : band.approver;
    return { totals, discountPct, marginPct, recurring, oneOff: net - recurring, approver, approved: approvedAt != null };
  }, [totals, lines, approvedAt]);

  // Any price change after an approval needs a fresh one.
  const editLines = (rows: LineItem[]) => {
    setLines(rows);
    if (approvedAt != null) setApprovedAt(null);
  };
  const editDiscount = (d: LineDiscount | undefined) => {
    setDocDiscount(d);
    if (approvedAt != null) setApprovedAt(null);
  };

  const log = (kind: QuoteEvent["kind"], who: string, text: { en: string; tr: string }) =>
    setEvents((all) => [...all, { id: `e${all.length + 1}-${kind}`, at: new Date(NOW_MS + all.length * 60_000).toISOString(), who, kind, text }]);

  const needsApproval = figures.approver != null && !figures.approved;
  const money = (v: string | number) => f.currency(v, quote.currency, { maximumFractionDigits: 0, minimumFractionDigits: 0 });

  const requestApproval = () => {
    const approver = figures.approver!;
    setStatus("approval");
    log("approval", preparedBy.name, { en: `asked ${approver.name} to approve ${f.percent(figures.discountPct / 100, { maximumFractionDigits: 1 })} off`, tr: `${approver.name} kişisinden %${figures.discountPct.toFixed(1)} indirim onayı istedi` });
    toast(c(`Approval requested from ${approver.name}`, `${approver.name} kişisinden onay istendi`), { description: c("You'll get a notification when they decide.", "Karar verildiğinde bildirim alacaksınız.") });
    later(2200, () => {
      setStatus("draft");
      setApprovedAt(NOW_MS);
      log("approved", approver.name, { en: "approved the discount", tr: "indirimi onayladı" });
      toast.success(c(`${approver.name} approved the discount`, `${approver.name} indirimi onayladı`), { description: c("“Fine for a six-hotel commitment.”", "“Altı otel taahhüdü için uygun.”") });
    });
  };

  const draftSigners: DraftSigner[] = React.useMemo(
    () => [
      { id: champion.id, name: champion.name, email: champion.email, role: t(champion.title) },
      { id: controller.id, name: controller.name, email: controller.email, role: t(controller.title) },
      { id: salesManager.id, name: salesManager.name, email: salesManager.email, role: c("Countersigns for us", "Bizim adımıza karşı imza") },
    ],
    [t, c],
  );

  const send = (req: SendRequest) => {
    setSendOpen(false);
    setStatus("sent");
    const list: Signer[] = req.signers.map((s, i) => ({ id: s.id, name: s.name, email: s.email, role: s.role, status: i === 0 ? "sent" : "waiting", at: i === 0 ? new Date(NOW_MS).toISOString() : undefined }));
    setSigners(list);
    log("sent", preparedBy.name, { en: `sent revision ${revision} to ${req.signers[0]!.name}`, tr: `${revision}. revizyonu ${req.signers[0]!.name} kişisine gönderdi` });
    toast.success(c(`Quote ${quote.number} sent`, `${quote.number} teklifi gönderildi`), { description: c(`${req.signers[0]!.name} signs first${req.attachPdf ? " · PDF attached" : ""}`, `İlk imza: ${req.signers[0]!.name}${req.attachPdf ? " · PDF ekli" : ""}`) });
    later(3200, () => {
      setStatus("viewed");
      setSigners((all) => all.map((s, i) => (i === 0 ? { ...s, status: "viewed", at: new Date(NOW_MS + 3 * 60_000).toISOString() } : s)));
      log("viewed", req.signers[0]!.name, { en: `opened revision ${revision}`, tr: `${revision}. revizyonu açtı` });
    });
  };

  const revise = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    setStatus("draft");
    setRevision((r) => r + 1);
    setSigners([]);
    setApprovedAt(null);
    log("edited", preparedBy.name, { en: `started revision ${revision + 1}`, tr: `${revision + 1}. revizyonu başlattı` });
    toast(c(`Revision ${revision + 1} started`, `${revision + 1}. revizyon başlatıldı`), { description: c("The sent revision was revoked; signers get a note.", "Gönderilen revizyon geri çekildi; imzacılara bilgi gider.") });
  };

  const splitOnboarding = () => {
    const row = lines.find((l) => l.itemId === "onb-pkg");
    if (!row) return;
    const half = (toNum(row.unitPrice) * toNum(row.quantity)) / 2;
    const base = t(catalogueById["onb-pkg"]!.name);
    const before = lines;
    editLines(
      lines.flatMap((l) =>
        l.id === row.id
          ? [
              { ...l, id: `${l.id}-a`, quantity: "1", unitPrice: half.toFixed(2), description: `${base} · ${c("instalment 1 of 2, on signature", "1/2 taksit, imzada")}` },
              { ...l, id: `${l.id}-b`, quantity: "1", unitPrice: half.toFixed(2), description: `${base} · ${c("instalment 2 of 2, at go-live", "2/2 taksit, canlıya geçişte")}` },
            ]
          : [l],
      ),
    );
    toast.success(c("Onboarding split into two invoices", "Kurulum iki faturaya bölündü"), { action: { label: c("Undo", "Geri al"), onClick: () => setLines(before) } });
  };

  const stepIndex = { draft: 0, approval: 1, sent: 2, viewed: 3, signed: 4 }[status];
  const steps: StepItem[] = [
    { id: "draft", title: c("Draft", "Taslak"), description: c(`Revision ${revision}`, `Revizyon ${revision}`) },
    {
      id: "approval",
      title: c("Approval", "Onay"),
      description: figures.approver ? (figures.approved ? c("Approved", "Onaylandı") : figures.approver.name) : c("Not needed", "Gerekmiyor"),
      status: !figures.approver && stepIndex <= 1 ? "skipped" : figures.approved && status === "draft" ? "complete" : undefined,
    },
    { id: "sent", title: c("Sent", "Gönderildi") },
    { id: "viewed", title: c("Viewed", "Görüntülendi") },
    { id: "signed", title: c("Signed", "İmzalandı") },
  ];

  const source = React.useMemo(
    () =>
      arrayRecordSource<CatalogueItem>("quote-catalogue", catalogue, {
        getId: (i) => i.id,
        getLabel: (i) => t(i.name),
        getDescription: (i) => `${i.code} · ${f.currency(i.price, quote.currency, { maximumFractionDigits: 0 })} / ${t(unitLabels[i.unit]!)}`,
        getKeywords: (i) => [i.code, i.name.en, i.name.tr],
      }),
    [t, f],
  );

  const statusBadge = {
    draft: <Badge tone="neutral" dot>{c("Draft", "Taslak")}</Badge>,
    approval: <Badge tone="warning" dot>{c("Awaiting approval", "Onay bekliyor")}</Badge>,
    sent: <Badge tone="info" dot>{c("Out for signature", "İmzada")}</Badge>,
    viewed: <Badge tone="info" dot>{c("Viewed by customer", "Müşteri görüntüledi")}</Badge>,
    signed: <Badge tone="success" dot>{c("Signed", "İmzalandı")}</Badge>,
  }[status];

  const primary =
    status === "draft" ? (
      needsApproval ? (
        <Button variant="primary" onClick={requestApproval}>
          <ShieldQuestion aria-hidden />
          {c("Request approval", "Onay iste")}
        </Button>
      ) : (
        <Button variant="primary" onClick={() => setSendOpen(true)} disabled={totals.invalidCount > 0}>
          <Send aria-hidden />
          {c("Send for signature", "İmzaya gönder")}
        </Button>
      )
    ) : status === "approval" ? (
      <Button variant="primary" loading disabled>
        {c(`Waiting for ${figures.approver?.name.split(" ")[0] ?? ""}`, `${figures.approver?.name.split(" ")[0] ?? ""} bekleniyor`)}
      </Button>
    ) : (
      <Button variant="secondary" onClick={revise}>
        <FilePenLine aria-hidden />
        {c("Revise quote", "Teklifi revize et")}
      </Button>
    );

  const timeline: TimelineEntry[] = events.map((e) => ({
    id: e.id,
    at: e.at,
    avatar: { name: e.who },
    actor: e.who,
    title: t(e.text),
    tone: e.kind === "changes" ? "warning" : e.kind === "approved" ? "success" : undefined,
  }));

  return (
    <div className="mx-auto max-w-[1360px]">
      <PageHeader
        size="sm"
        back={{ href: "/crm/quotes", label: c("Quotes", "Teklifler") }}
        eyebrow={<span className="font-mono tabular">{quote.number} · R{revision}</span>}
        title={`${company.name} — ${t(quote.title)}`}
        meta={statusBadge}
        actions={
          <>
            <Button variant="ghost" onClick={() => toast(c("Opening the customer view", "Müşteri görünümü açılıyor"), { description: c("Exactly what signers will see, with your costs hidden.", "İmzacıların göreceği hâli, maliyetler gizli.") })}>
              <Eye aria-hidden />
              {c("Preview", "Önizle")}
            </Button>
            {primary}
          </>
        }
        menu={[
          { id: "dup", label: c("Duplicate quote", "Teklifi kopyala"), onSelect: () => toast.success(c("Copied as Q-2026-0431", "Q-2026-0431 olarak kopyalandı")) },
          { id: "pdf", label: c("Download PDF", "PDF indir"), onSelect: () => toast(`${quote.number}-R${revision}.pdf`) },
          { type: "separator", id: "sep" },
          { id: "lost", label: c("Mark deal as lost", "Fırsatı kaybedildi işaretle"), tone: "danger", onSelect: () => toast(c("Not in a demo — this deal is still alive", "Demoda değil — bu fırsat hâlâ canlı")) },
        ]}
      />

      <Card variant="outline" className="mb-(--gap) px-4 py-3.5">
        <Stepper value={stepIndex} steps={steps} size="sm" aria-label={c("Quote progress", "Teklif durumu")} />
      </Card>

      <div className="grid gap-(--gap) xl:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)]">
        <div className="grid min-w-0 content-start gap-(--gap)">
          {requestOpen && status === "draft" ? (
            <Alert
              tone="info"
              icon={<MessageSquareQuote aria-hidden />}
              title={c(`${changeRequest.by.name} asked for changes on revision ${changeRequest.revision}`, `${changeRequest.by.name}, ${changeRequest.revision}. revizyonda değişiklik istedi`)}
              onDismiss={() => setRequestOpen(false)}
              dismissLabel={c("Hide request", "Talebi gizle")}
              actions={
                <Button size="sm" variant="secondary" onClick={splitOnboarding} disabled={!lines.some((l) => l.itemId === "onb-pkg")}>
                  <Split aria-hidden />
                  {c("Split onboarding in two", "Kurulumu ikiye böl")}
                </Button>
              }
            >
              <q className="text-fg-muted">{t(changeRequest.body)}</q>
            </Alert>
          ) : null}
          {status !== "draft" && status !== "approval" ? (
            <Alert tone="info" icon={<PenLine aria-hidden />} title={c(`Revision ${revision} is out for signature`, `${revision}. revizyon imzada`)}>
              {c("Prices are locked. Revising revokes the signing link and starts a new revision.", "Fiyatlar kilitli. Revize etmek imza bağlantısını iptal eder ve yeni bir revizyon başlatır.")}
            </Alert>
          ) : null}

          <Card as="section" aria-labelledby="doc-title" className="overflow-hidden">
            {/* Letterhead: who it's for and the dates that go on the PDF */}
            <div className="grid gap-5 border-b border-line px-(--card-p) py-5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="flex min-w-0 gap-3">
                <Avatar name={company.name} shape="square" size="lg" />
                <div className="min-w-0">
                  <p className="text-xs text-fg-subtle">{c("Prepared for", "Hazırlanan")}</p>
                  <h2 id="doc-title" className="truncate font-display text-lg text-fg">{company.name}</h2>
                  <p className="truncate text-sm text-fg-muted">{champion.name} · {t(champion.title)}</p>
                  <p className="truncate text-xs text-fg-subtle">{company.city} · {company.domain}</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-xs text-fg-subtle">{c("Quote", "Teklif")}</dt>
                  <dd className="font-mono text-fg tabular">{quote.number}</dd>
                </div>
                <div>
                  <dt className="text-xs text-fg-subtle">{c("Issued", "Düzenleme")}</dt>
                  <dd className="text-fg">{f.date(quote.createdAt, "medium")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-fg-subtle">{c("Prepared by", "Hazırlayan")}</dt>
                  <dd className="truncate text-fg">{preparedBy.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-fg-subtle">{c("Currency", "Para birimi")}</dt>
                  <dd className="text-fg">TRY · KDV 20%</dd>
                </div>
              </dl>
            </div>

            <div className="grid gap-4 border-b border-line px-(--card-p) py-4 sm:grid-cols-3">
              <Field label={c("Valid until", "Geçerlilik")} hint={validUntil ? c(`${daysLeft(validUntil)} days from today`, `bugünden ${daysLeft(validUntil)} gün`) : undefined}>
                <DatePicker value={validUntil} onValueChange={setValidUntil} min={day(1)} disabled={locked} />
              </Field>
              <Field label={c("Payment terms", "Ödeme koşulu")}>
                <Select value={terms} onValueChange={(v) => v && setTerms(v)} items={paymentTerms.map((p) => ({ value: p.value, label: t(p.label) }))} disabled={locked} />
              </Field>
              <Field label={c("Licence billing", "Lisans faturası")}>
                <Select value={billing} onValueChange={(v) => v && setBilling(v)} items={billingCycles.map((p) => ({ value: p.value, label: t(p.label) }))} disabled={locked} />
              </Field>
            </div>

            <div className="px-(--card-p) py-4">
              <LineItems
                aria-label={c("Quote lines", "Teklif kalemleri")}
                value={lines}
                onValueChange={(rows) => editLines(rows)}
                currency={quote.currency}
                taxPack={taxPack}
                units={units}
                itemSource={source}
                onItemPick={(i: CatalogueItem) => ({ description: t(i.name), unitPrice: i.price, unit: i.unit, taxRate: "20" })}
                columns={locked ? ["description", "quantity", "unit", "unitPrice", "discount", "total"] : ["item", "description", "quantity", "unitPrice", "discount", "total"]}
                documentDiscount={docDiscount}
                onDocumentDiscountChange={editDiscount}
                newRow={() => ({ quantity: "1", taxRate: "20" })}
                readOnly={locked}
              />
            </div>

            <div className="border-t border-line px-(--card-p) py-4">
              <Field label={c("Note to the customer", "Müşteriye not")} hint={c("Printed under the totals.", "Toplamların altına basılır.")}>
                <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} readOnly={locked} />
              </Field>
            </div>
          </Card>
        </div>

        <aside className="grid min-w-0 content-start gap-(--gap) md:grid-cols-2 xl:sticky xl:top-20 xl:grid-cols-1 xl:self-start" aria-label={c("Quote summary", "Teklif özeti")}>
          <DealDesk figures={figures} currency={quote.currency} />
          <div className="grid min-w-0 content-start gap-(--gap)">

          <Card as="section" aria-labelledby="sign-title" padding="md">
            {signers.length ? (
              <SignerStatus
                sequential
                signers={signers}
                now={NOW_MS + 4 * 60_000}
                title={<span id="sign-title">{c("Signatures", "İmzalar")}</span>}
                labels={lang === "tr" ? { title: "İmzalar", summary: "{signed}/{total} imzalandı", complete: "Tamamen imzalandı", waiting: "Sırada", sent: "Gönderildi", viewed: "Görüntülendi", signed: "İmzaladı", declined: "Reddetti", remind: "Hatırlat", remindName: "{name} kişisine hatırlatma gönder", reminded: "Hatırlatma gönderildi", order: "{position}. imza", declinedSummary: "{name} reddetti" } : undefined}
                onRemind={(s) =>
                  new Promise<void>((resolve) => {
                    later(700, () => {
                      resolve();
                      toast.success(c(`Reminder sent to ${s.name}`, `${s.name} kişisine hatırlatma gönderildi`));
                    });
                  })
                }
              />
            ) : (
              <div>
                <h2 id="sign-title" className="text-sm font-medium text-fg">{c("Signatures", "İmzalar")}</h2>
                <ol className="mt-3 grid gap-2.5">
                  {draftSigners.map((s, i) => (
                    <li key={s.id} className="flex min-w-0 items-center gap-2.5 text-sm">
                      <span className="grid size-5 place-items-center rounded-full border border-line font-mono text-[10px] text-fg-subtle tabular">{i + 1}</span>
                      <span className="shrink-0 text-fg">{s.name}</span>
                      <span className="ms-auto min-w-0 truncate text-xs text-fg-subtle">{s.role}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-xs text-fg-subtle">{c("Signing starts when you send the quote.", "İmza süreci teklif gönderilince başlar.")}</p>
              </div>
            )}
          </Card>
          </div>

          <Card as="section" aria-labelledby="hist-title" className="overflow-hidden md:col-span-2 xl:col-span-1">
            <CardHeader titleId="hist-title" titleAs="h2" title={c("History", "Geçmiş")} description={c(`${money(totals.total)} in revision ${revision}`, `${revision}. revizyonda ${money(totals.total)}`)} />
            <div tabIndex={0} role="region" aria-label={c("Quote history", "Teklif geçmişi")} className="max-h-[22rem] overflow-y-auto px-(--card-p) pb-(--card-p) focus-ring">
              <ActivityTimeline items={timeline} now={NOW_MS + events.length * 60_000} timeZone="Europe/Istanbul" />
            </div>
          </Card>
        </aside>
      </div>

      <SendDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        signers={draftSigners}
        defaultSubject={c(`Quote ${quote.number} · ${company.name}`, `${quote.number} numaralı teklif · ${company.name}`)}
        defaultMessage={c(
          `Hi Kaan, here is revision ${revision} with onboarding over two invoices and the rollout fee for six hotels. Happy to walk Pınar through it.`,
          `Merhaba Kaan, kurulum iki faturaya bölünmüş ve altı otel kurulum ücretini içeren ${revision}. revizyon ekte. Pınar Hanım'a da anlatmaktan memnuniyet duyarım.`,
        )}
        onSend={send}
      />
    </div>
  );
}

function daysLeft(date: string) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${TODAY}T00:00:00Z`)) / 86_400_000);
}
