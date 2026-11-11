"use client";

import * as React from "react";
import { BellRing, ClipboardCheck, Mail, Plus, Trash2 } from "lucide-react";
import { Alert, Button, DescriptionList, EntityCard, RecordAsideSection, Switch, cn } from "@vamos-ui/react";
import { SignerStatus, type Signer } from "@vamos-ui/react/business";
import { useBlockFormat } from "../../_shared/format";
import { day, daysBetween, NOW_MS, TODAY } from "../../_shared/time";
import { anchorLabels, channelLabels, contract, noticeDeadline, type Reminder } from "./contract-data";

export function SignersSection({ signers, pending, onRemind }: { signers: Signer[]; pending: number; onRemind: (s: Signer) => Promise<void> }) {
  const { c } = useBlockFormat();
  return (
    <RecordAsideSection title={c("Signatures", "İmzalar")}>
      {pending > 0 ? (
        <Alert tone="warning" className="mb-3 text-[12.5px]">
          {c(
            `${pending} ${pending === 1 ? "proposal needs" : "proposals need"} a decision before the next signer can sign.`,
            `Sıradaki kişinin imzalayabilmesi için ${pending} öneri karar bekliyor.`,
          )}
        </Alert>
      ) : null}
      <SignerStatus
        sequential
        title={null}
        signers={signers}
        now={NOW_MS}
        onRemind={onRemind}
        labels={{
          summary: c("{signed} of {total} signed", "{total} kişiden {signed} imzaladı"),
          complete: c("Fully signed", "Tüm imzalar tamam"),
          waiting: c("Waiting", "Sırada"),
          sent: c("Sent", "Gönderildi"),
          viewed: c("Viewed", "Görüntülendi"),
          signed: c("Signed", "İmzaladı"),
          declined: c("Declined", "Reddetti"),
          remind: c("Remind", "Hatırlat"),
          remindName: c("Remind {name}", "{name} kişisine hatırlat"),
          reminded: c("Reminder sent", "Hatırlatma gönderildi"),
          order: c("Signs {position}", "{position}. sırada imzalar"),
        }}
      />
    </RecordAsideSection>
  );
}

export function TermsSection() {
  const { c, t, money, f } = useBlockFormat();
  return (
    <RecordAsideSection title={c("Key terms", "Temel şartlar")} collapsible>
      <DescriptionList
        layout="vertical"
        size="sm"
        items={[
          { key: "value", label: c("Annual value (v4)", "Yıllık bedel (v4)"), value: <span className="tabular">{money(contract.proposedAnnualValue, { whole: true })} <span className="text-fg-subtle">· {c("was", "önce")} {money(contract.annualValue, { whole: true })}</span></span> },
          { key: "payment", label: c("Payment", "Ödeme"), value: t(contract.paymentTerms) },
          { key: "notice", label: c("Notice period", "Bildirim süresi"), value: c(`${contract.noticeDays} days · by ${f.date(noticeDeadline, "medium")}`, `${contract.noticeDays} gün · en geç ${f.date(noticeDeadline, "medium")}`) },
          { key: "law", label: c("Governing law", "Uygulanacak hukuk"), value: t(contract.governingLaw) },
          { key: "id", label: c("Contract ID", "Sözleşme no"), value: <span className="font-mono text-[12.5px]">{contract.id}</span>, copyable: true },
        ]}
      />
    </RecordAsideSection>
  );
}

export function CustomerSection() {
  const { c, money } = useBlockFormat();
  const co = contract.customer;
  return (
    <RecordAsideSection title={c("Customer", "Müşteri")} collapsible>
      <EntityCard
        kind="organization"
        variant="compact"
        name={co.name}
        subtitle={c(`Enterprise plan · ${co.city}`, `Kurumsal paket · ${co.city}`)}
        href="#tidewell-logistics"
        stats={[
          { label: c("MRR", "Aylık gelir"), value: money(co.mrr, { whole: true }) },
          { label: c("Health", "Sağlık"), value: co.health },
        ]}
      />
    </RecordAsideSection>
  );
}

/** Renewal reminders: switch each on/off (optimistic), remove, add a new one. */
export function RemindersSection({
  reminders,
  autoRenew,
  onAutoRenew,
  onToggle,
  onRemove,
  onAdd,
}: {
  reminders: Reminder[];
  autoRenew: boolean;
  onAutoRenew: (on: boolean) => void;
  onToggle: (id: string, on: boolean) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  const { c, t, f } = useBlockFormat();
  const anchorDate = (r: Reminder) => {
    const base = r.anchor === "notice" ? noticeDeadline : contract.end;
    return day(daysBetween(TODAY, base) - r.daysBefore);
  };
  const sorted = [...reminders].sort((a, b) => anchorDate(a).localeCompare(anchorDate(b)));

  return (
    <RecordAsideSection
      title={c("Renewal", "Yenileme")}
      action={
        <Button size="xs" variant="ghost" onClick={onAdd}>
          <Plus /> {c("Reminder", "Hatırlatıcı")}
        </Button>
      }
    >
      <Switch
        label={c("Renew automatically", "Otomatik yenile")}
        description={c(`${contract.renewalMonths} months at a time`, `Her seferinde ${contract.renewalMonths} ay`)}
        labelPosition="start"
        checked={autoRenew}
        onCheckedChange={onAutoRenew}
        className="mb-3"
      />
      <ul className="flex flex-col gap-1.5" aria-label={c("Reminders", "Hatırlatıcılar")}>
        {sorted.map((r) => {
          const when = anchorDate(r);
          const past = when < TODAY;
          const Icon = r.channel === "email" ? Mail : ClipboardCheck;
          return (
            <li key={r.id} className={cn("group flex min-w-0 items-start gap-2.5 rounded-ui border border-line px-3 py-2.5 transition-opacity", !r.on && "opacity-60")}>
              <Icon className="mt-0.5 size-3.5 shrink-0 text-fg-subtle" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-fg">
                  <span className="tabular">{r.daysBefore}</span> {c("days", "gün")} {t(anchorLabels[r.anchor])}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-fg-muted">
                  <span className="tabular">{f.date(when, "medium")}</span>
                  {past ? ` · ${c("sent", "gönderildi")}` : ""} · {t(channelLabels[r.channel])} · {f.list(r.recipients)}
                </p>
              </div>
              <Button size="icon-xs" variant="ghost" aria-label={c(`Remove ${r.daysBefore}-day reminder`, `${r.daysBefore} günlük hatırlatıcıyı sil`)} onClick={() => onRemove(r.id)} className="text-fg-subtle">
                <Trash2 />
              </Button>
              <Switch size="sm" checked={r.on} onCheckedChange={(on) => onToggle(r.id, on)} aria-label={c(`${r.daysBefore} days ${t(anchorLabels[r.anchor])}`, `${r.daysBefore} gün ${t(anchorLabels[r.anchor])}`)} />
            </li>
          );
        })}
        {sorted.length === 0 ? (
          <li className="flex items-center gap-2 rounded-ui border border-dashed border-line px-3 py-3 text-[12.5px] text-fg-muted">
            <BellRing className="size-3.5" aria-hidden /> {c("No reminders. The notice deadline can pass unnoticed.", "Hatırlatıcı yok. Bildirim son günü fark edilmeden geçebilir.")}
          </li>
        ) : null}
      </ul>
    </RecordAsideSection>
  );
}
