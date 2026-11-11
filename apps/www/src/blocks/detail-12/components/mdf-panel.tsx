"use client";

import * as React from "react";
import { Check, Paperclip, Plus, X } from "lucide-react";
import {
  Badge,
  Button,
  CurrencyInput,
  DatePicker,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  Input,
  Select,
  cn,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { day, TODAY } from "../../_shared/time";
import { claimKindLabels, claimStatusLabels, partner, type ClaimStatus, type MdfClaim } from "./partner-data";

const claimTone: Record<ClaimStatus, "neutral" | "warning" | "info" | "success" | "danger"> = {
  draft: "neutral",
  submitted: "warning",
  approved: "info",
  paid: "success",
  rejected: "danger",
};

export function mdfTotals(claims: MdfClaim[]) {
  const total = (st: ClaimStatus[]) => claims.filter((x) => st.includes(x.status)).reduce((n, x) => n + Number(x.amount.amount), 0);
  const allocated = Number(partner.mdf.allocated.amount);
  const approved = total(["approved", "paid"]);
  const pending = total(["submitted"]);
  return { allocated, approved, pending, left: Math.max(0, allocated - approved - pending) };
}

/** Market development funds: the allocation as one bar, the claims, approve or reject, file a claim. */
export function MdfPanel({ claims, onDecide, onAdd }: { claims: MdfClaim[]; onDecide: (id: string, status: "approved" | "rejected") => void; onAdd: (claim: MdfClaim) => void }) {
  const { c, t, f, money } = useBlockFormat();
  const { allocated, approved, pending, left } = mdfTotals(claims);
  const [adding, setAdding] = React.useState(false);
  const usd = (n: number) => money({ amount: n.toFixed(2), currency: "USD" }, { whole: true });
  const pct = (n: number) => `${(n / allocated) * 100}%`;
  const useBy = day(43);

  const legend = [
    { label: c("Approved", "Onaylanan"), value: approved, swatch: "bg-fg" },
    { label: c("Awaiting review", "İnceleme bekleyen"), value: pending, swatch: "tone-warning bg-[var(--tone)]" },
    { label: c("Left to claim", "Talep edilebilir"), value: left, swatch: "bg-track border border-line" },
  ];

  return (
    <div className="grid gap-4">
      <section aria-labelledby="mdf-heading" className="surface rounded-ui-lg px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="mdf-heading" className="text-[13px] font-medium text-fg">
            {c("2026 allocation", "2026 bütçesi")} <span className="ms-1 font-display text-lg text-fg tabular">{usd(allocated)}</span>
          </h3>
          <p className="text-[12.5px] text-fg-muted">
            {c(`Use by ${f.date(useBy, "medium")} · unused funds do not roll over`, `Son kullanım ${f.date(useBy, "medium")} · kullanılmayan fon devretmez`)}
          </p>
        </div>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-track" role="img" aria-label={legend.map((l) => `${l.label} ${usd(l.value)}`).join(", ")}>
          <div className="bg-fg transition-[width] duration-500" style={{ width: pct(approved) }} />
          <div className="tone-warning bg-[var(--tone)] transition-[width] duration-500" style={{ width: pct(pending) }} />
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5">
          {legend.map((l) => (
            <li key={l.label} className="flex items-center gap-2 text-[12.5px] text-fg-muted">
              <span className={cn("size-2.5 rounded-[3px]", l.swatch)} aria-hidden />
              {l.label} <span className="font-medium text-fg tabular">{usd(l.value)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="claims-heading" className="surface rounded-ui-lg">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
          <h3 id="claims-heading" className="text-[13px] font-medium text-fg">{c("Claims", "Talepler")}</h3>
          <Button size="sm" onClick={() => setAdding(true)} disabled={left <= 0}>
            <Plus /> {c("New claim", "Yeni talep")}
          </Button>
        </header>
        <ul className="divide-y divide-line">
          {claims.map((x) => (
            <li key={x.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-5">
              <div className="min-w-0 flex-1 basis-56">
                <p className="text-[13.5px] font-medium text-fg">{t(x.activity)}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-fg-muted">
                  <span>{t(claimKindLabels[x.kind])}</span>·<span className="tabular">{f.date(x.date, "medium")}</span>
                  {x.leads ? <>·<span className="tabular">{c(`${x.leads} leads`, `${x.leads} potansiyel müşteri`)}</span></> : null}
                  {x.proof ? (
                    <span className="inline-flex items-center gap-1 text-fg-subtle"><Paperclip className="size-3" aria-hidden />{c("proof attached", "belge ekli")}</span>
                  ) : (
                    <span className="text-fg-subtle">{c("no proof yet", "belge yok")}</span>
                  )}
                </p>
              </div>
              <Badge tone={claimTone[x.status]}>{t(claimStatusLabels[x.status])}</Badge>
              <span className="w-20 text-end text-[13.5px] font-medium text-fg tabular">{money(x.amount, { whole: true })}</span>
              {x.status === "submitted" ? (
                <div className="flex gap-1.5">
                  <Button size="icon-sm" aria-label={c(`Reject ${t(x.activity)}`, `${t(x.activity)} reddet`)} onClick={() => onDecide(x.id, "rejected")}>
                    <X />
                  </Button>
                  <Button size="icon-sm" variant="solid" aria-label={c(`Approve ${t(x.activity)}`, `${t(x.activity)} onayla`)} onClick={() => onDecide(x.id, "approved")}>
                    <Check />
                  </Button>
                </div>
              ) : (
                <span className="hidden w-[68px] sm:block" aria-hidden />
              )}
            </li>
          ))}
        </ul>
      </section>

      <ClaimDialog open={adding} onOpenChange={setAdding} left={left} onSave={onAdd} />
    </div>
  );
}

function ClaimDialog({ open, onOpenChange, left, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; left: number; onSave: (c: MdfClaim) => void }) {
  const { c, t, money } = useBlockFormat();
  const [activity, setActivity] = React.useState("");
  const [kind, setKind] = React.useState<MdfClaim["kind"]>("digital");
  const [amount, setAmount] = React.useState<string | null>(null);
  const [date, setDate] = React.useState<string | null>(TODAY);
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setActivity("");
      setKind("digital");
      setAmount(null);
      setDate(TODAY);
      setTried(false);
    }
  }, [open]);

  const n = Number(amount ?? 0);
  const errors = {
    activity: !activity.trim() ? c("Describe the activity.", "Etkinliği açıklayın.") : null,
    amount: !amount || n <= 0 ? c("Enter the amount.", "Tutarı girin.") : n > left ? c(`Only ${money({ amount: left.toFixed(2), currency: "USD" }, { whole: true })} is left this year.`, `Bu yıl yalnızca ${money({ amount: left.toFixed(2), currency: "USD" }, { whole: true })} kaldı.`) : null,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (errors.activity || errors.amount) return;
    onSave({ id: `md-${Date.now()}`, activity: { en: activity.trim(), tr: activity.trim() }, kind, amount: { amount: n.toFixed(2), currency: "USD" }, date: date ?? TODAY, status: "submitted", proof: false });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <form onSubmit={submit} noValidate className="contents">
          <DialogHeader title={c("New MDF claim", "Yeni pazarlama fonu talebi")} description={c("Filed on behalf of Meridyen Digital. Attach proof of spend within 30 days.", "Meridyen Digital adına açılır. Harcama belgesini 30 gün içinde ekleyin.")} />
          <DialogBody className="grid gap-4">
            <Field label={c("Activity", "Etkinlik")} required error={tried ? errors.activity : null}>
              <Input value={activity} onChange={(e) => setActivity(e.target.value)} placeholder={c("Webinar: stock counts without the spreadsheet", "Webinar: tablosuz stok sayımı")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={c("Type", "Tür")}>
                <Select value={kind} onValueChange={(v) => v && setKind(v)} items={(Object.keys(claimKindLabels) as MdfClaim["kind"][]).map((k) => ({ value: k, label: t(claimKindLabels[k]) }))} />
              </Field>
              <Field label={c("Date", "Tarih")}>
                <DatePicker value={date} onValueChange={setDate} />
              </Field>
            </div>
            <Field label={c("Amount", "Tutar")} required error={tried ? errors.amount : null} hint={c(`Up to ${money({ amount: left.toFixed(2), currency: "USD" }, { whole: true })}`, `En fazla ${money({ amount: left.toFixed(2), currency: "USD" }, { whole: true })}`)}>
              <CurrencyInput currency="USD" value={amount} onValueChange={(v) => setAmount(v)} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">{c("Cancel", "Vazgeç")}</Button>
            </DialogClose>
            <Button type="submit" variant="primary">{c("File claim", "Talebi oluştur")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
