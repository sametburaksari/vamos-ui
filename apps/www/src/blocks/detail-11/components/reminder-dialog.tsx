"use client";

import * as React from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  Input,
  Select,
  ToggleGroup,
  ToggleGroupItem,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { anchorLabels, channelLabels, reminderPeople, type Reminder, type ReminderChannel } from "./contract-data";

/** New renewal reminder: how many days before which date, how, and to whom. */
export function ReminderDialog({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; onSave: (r: Omit<Reminder, "id" | "on">) => void }) {
  const { c, t } = useBlockFormat();
  const [days, setDays] = React.useState("45");
  const [anchor, setAnchor] = React.useState<Reminder["anchor"]>("notice");
  const [channel, setChannel] = React.useState<ReminderChannel>("email");
  const [recipients, setRecipients] = React.useState<string[]>([reminderPeople[0]!.name]);
  const [tried, setTried] = React.useState(false);

  const n = Number(days);
  const daysError = !Number.isInteger(n) || n < 1 || n > 365 ? c("Enter a whole number from 1 to 365.", "1 ile 365 arasında tam sayı girin.") : null;
  const recipientsError = recipients.length === 0 ? c("Pick at least one person.", "En az bir kişi seçin.") : null;

  React.useEffect(() => {
    if (open) {
      setDays("45");
      setAnchor("notice");
      setChannel("email");
      setRecipients([reminderPeople[0]!.name]);
      setTried(false);
    }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (daysError || recipientsError) return;
    onSave({ daysBefore: n, anchor, channel, recipients });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <form onSubmit={submit} noValidate className="contents">
          <DialogHeader title={c("New renewal reminder", "Yeni yenileme hatırlatıcısı")} description={c("Reminders go out at 09:00 Istanbul time.", "Hatırlatıcılar İstanbul saatiyle 09:00’da gönderilir.")} />
          <DialogBody className="grid gap-4">
            <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3">
              <Field label={c("Days", "Gün")} error={tried ? daysError : null} required>
                <Input inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value.replace(/[^\d]/g, ""))} className="tabular" />
              </Field>
              <Field label={c("Before", "Şundan önce")}>
                <Select
                  value={anchor}
                  onValueChange={(v) => v && setAnchor(v)}
                  items={(Object.keys(anchorLabels) as Reminder["anchor"][]).map((k) => ({ value: k, label: t(anchorLabels[k]) }))}
                />
              </Field>
            </div>
            <Field label={c("Send as", "Gönderim şekli")}>
              <ToggleGroup value={channel} onValueChange={(v) => setChannel(v as ReminderChannel)} aria-label={c("Send as", "Gönderim şekli")} size="sm">
                {(Object.keys(channelLabels) as ReminderChannel[]).map((k) => (
                  <ToggleGroupItem key={k} value={k}>{t(channelLabels[k])}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-[13px] font-medium text-fg">{c("Who gets it", "Kime gidecek")}</legend>
              {reminderPeople.map((p) => (
                <Checkbox
                  key={p.id}
                  label={p.name}
                  description={t(p.title)}
                  checked={recipients.includes(p.name)}
                  onCheckedChange={(v) => setRecipients((all) => (v ? [...all, p.name] : all.filter((x) => x !== p.name)))}
                />
              ))}
              {tried && recipientsError ? <p role="alert" className="text-[12.5px] text-danger">{recipientsError}</p> : null}
            </fieldset>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">{c("Cancel", "Vazgeç")}</Button>
            </DialogClose>
            <Button type="submit" variant="primary">{c("Add reminder", "Hatırlatıcı ekle")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
