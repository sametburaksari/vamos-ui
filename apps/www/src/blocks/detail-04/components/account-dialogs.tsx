"use client";

import * as React from "react";
import { Button, CurrencyInput, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Field, Input, Select, Textarea } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { dealStages, type DealStage } from "../../_shared/deals";
import { company, contacts } from "./data";

export interface CallLog {
  contactId: string;
  outcome: "connected" | "voicemail" | "no-answer";
  summary: string;
}

const outcomes = [
  { value: "connected", en: "Connected", tr: "Görüşüldü" },
  { value: "voicemail", en: "Left a voicemail", tr: "Sesli mesaj bırakıldı" },
  { value: "no-answer", en: "No answer", tr: "Cevap yok" },
] as const;

export function outcomeLabel(o: CallLog["outcome"]) {
  const row = outcomes.find((x) => x.value === o)!;
  return { en: row.en, tr: row.tr };
}

export function LogCallDialog({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; onSave: (log: CallLog) => void }) {
  const { c } = useBlockFormat();
  const [contactId, setContactId] = React.useState(contacts[0]!.id);
  const [outcome, setOutcome] = React.useState<CallLog["outcome"]>("connected");
  const [summary, setSummary] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setSummary("");
      setOutcome("connected");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader title={c("Log a call", "Görüşme kaydet")} description={company.name} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ contactId, outcome, summary: summary.trim() });
          }}
        >
          <DialogBody className="grid gap-4">
            <Field label={c("With", "Kiminle")}>
              <Select value={contactId} onValueChange={(v) => v && setContactId(v)} items={contacts.map((ct) => ({ value: ct.id, label: ct.name }))} />
            </Field>
            <Field label={c("Outcome", "Sonuç")}>
              <Select value={outcome} onValueChange={(v) => v && setOutcome(v as CallLog["outcome"])} items={outcomes.map((o) => ({ value: o.value, label: c(o.en, o.tr) }))} />
            </Field>
            <Field label={c("Summary", "Özet")} optional>
              <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={c("What was agreed, what happens next", "Ne konuşuldu, sırada ne var")} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {c("Cancel", "Vazgeç")}
            </Button>
            <Button type="submit" variant="primary">
              {c("Save call", "Görüşmeyi kaydet")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export interface NewDeal {
  title: string;
  amount: string;
  stage: DealStage;
}

export function NewDealDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (deal: NewDeal) => void }) {
  const { c, t } = useBlockFormat();
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState<string>("");
  const [stage, setStage] = React.useState<DealStage>("discovery");
  const [touched, setTouched] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setAmount("");
      setStage("discovery");
      setTouched(false);
    }
  }, [open]);

  const titleError = touched && !title.trim() ? c("Give the deal a name.", "Fırsata bir ad verin.") : undefined;
  const amountError = touched && !(Number(amount) > 0) ? c("Enter the expected value.", "Beklenen tutarı girin.") : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader title={c("New deal", "Yeni fırsat")} description={company.name} />
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (!title.trim() || !(Number(amount) > 0)) return;
            onCreate({ title: title.trim(), amount, stage });
          }}
        >
          <DialogBody className="grid gap-4">
            <Field label={c("Deal name", "Fırsat adı")} required error={titleError}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={c("Driver app rollout", "Sürücü uygulaması yaygınlaştırma")} />
            </Field>
            <Field label={c("Expected value", "Beklenen tutar")} required error={amountError}>
              <CurrencyInput currency="TRY" value={amount} onValueChange={(v: string | null) => setAmount(v ?? "")} />
            </Field>
            <Field label={c("Stage", "Aşama")}>
              <Select
                value={stage}
                onValueChange={(v) => v && setStage(v as DealStage)}
                items={dealStages.filter((s) => s.key !== "won" && s.key !== "lost").map((s) => ({ value: s.key, label: t(s.label) }))}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {c("Cancel", "Vazgeç")}
            </Button>
            <Button type="submit" variant="primary">
              {c("Create deal", "Fırsat oluştur")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
