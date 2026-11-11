"use client";

import * as React from "react";
import { CreditCard, Pencil } from "lucide-react";
import {
  Badge, Button, Card, CardBody, CardHeader, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Field, IconButton, Input, TagInput, toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { billingProfile, cycle, overageCost, paymentMethod, plans, projected, usage, VAT_RATE, type Interval, type PlanId } from "./billing-data";
import { pricePerMonth } from "./plan-panel";

/** Next invoice, projected from today's pace. */
export function UpcomingInvoice({ planId, interval, limits }: { planId: PlanId; interval: Interval; limits: Record<string, number> }) {
  const { c, f, t } = useBlockFormat();
  const plan = plans.find((p) => p.id === planId)!;
  const lines = [
    { id: "plan", label: c(`${t(plan.name)} plan`, `${t(plan.name)} planı`), amount: interval === "year" ? 0 : pricePerMonth(plan, interval), note: interval === "year" ? c("Paid yearly", "Yıllık ödendi") : undefined },
    ...usage
      .filter((u) => u.overage)
      .map((u) => {
        const proj = projected(u.used);
        return { id: u.key, label: t(u.label), amount: overageCost(u.key, proj, limits[u.key] ?? u.limit), note: c("projected", "tahmini") };
      })
      .filter((l) => l.amount > 0),
  ];
  const net = lines.reduce((s, l) => s + l.amount, 0);
  const vat = net * VAT_RATE;
  return (
    <Card>
      <CardHeader
        titleAs="h2"
        title={c("Next invoice", "Sonraki fatura")}
        description={c(`Estimate for ${f.date(cycle.end, "long")}`, `${f.date(cycle.end, "long")} için tahmin`)}
      />
      <CardBody className="pt-0">
        <p className="font-mono text-[2rem] leading-none text-fg tabular">{f.currency(net + vat, { currency: "USD" })}</p>
        <dl className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-[13px]">
          {lines.map((l) => (
            <React.Fragment key={l.id}>
              <dt className="min-w-0 text-fg-muted">
                {l.label}
                {l.note ? <span className="text-fg-subtle"> · {l.note}</span> : null}
              </dt>
              <dd className="text-end font-mono text-fg tabular">{f.currency(l.amount, { currency: "USD" })}</dd>
            </React.Fragment>
          ))}
          <dt className="border-t border-line pt-2 text-fg-muted">{c("VAT 20%", "KDV %20")}</dt>
          <dd className="border-t border-line pt-2 text-end font-mono text-fg tabular">{f.currency(vat, { currency: "USD" })}</dd>
        </dl>
        {lines.length > 1 ? (
          <p className="mt-4 rounded-ui surface-2 px-3 py-2.5 text-xs text-pretty text-fg-muted">
            {c("Overage is billed in arrears. Set a spending cap under Usage alerts to stop surprises.", "Aşım dönem sonunda faturalanır. Sürpriz olmaması için Kullanım uyarılarından harcama sınırı belirleyin.")}
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}

const digits = (v: string) => v.replace(/\D/g, "");
const groupCard = (v: string) => digits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
function luhn(num: string) {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let d = Number(num[num.length - 1 - i]);
    if (i % 2) d = d * 2 > 9 ? d * 2 - 9 : d * 2;
    sum += d;
  }
  return num.length >= 13 && sum % 10 === 0;
}

/** Card on file + billing details, each with its own edit dialog. */
export function PaymentPanel() {
  const { c, f } = useBlockFormat();
  const [card, setCard] = React.useState(paymentMethod);
  const [profile, setProfile] = React.useState(billingProfile);
  const [cardOpen, setCardOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const expiry = new Date(Date.UTC(card.expYear, card.expMonth - 1, 1));
  const expiresSoon = card.expYear === 2026 && card.expMonth <= 12;

  return (
    <Card>
      <CardHeader titleAs="h2" title={c("Payment method", "Ödeme yöntemi")} />
      <CardBody className="grid gap-5 pt-0">
        {/* The card as a quiet plate: monogram, masked number, expiry. */}
        <div className="relative overflow-hidden rounded-ui-lg border border-line surface-2 p-4">
          <div className="flex items-start justify-between">
            <CreditCard aria-hidden className="size-5 text-fg-muted" />
            <span className="text-[11px] text-fg-subtle">{card.brand}</span>
          </div>
          <p className="mt-6 font-mono text-[15px] tracking-[0.18em] text-fg tabular" aria-label={c(`Card ending ${card.last4}`, `${card.last4} ile biten kart`)}>
            •••• •••• •••• {card.last4}
          </p>
          <div className="mt-3 flex items-end justify-between gap-3 text-[12px]">
            <span className="min-w-0 truncate text-fg-muted">{card.holder}</span>
            <span className="font-mono text-fg-muted tabular">
              {String(card.expMonth).padStart(2, "0")}/{String(card.expYear).slice(2)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-fg-subtle">
            {expiresSoon ? <Badge tone="warning">{c("Expires soon", "Yakında doluyor")}</Badge> : c(`Valid until ${f.date(expiry, { month: "long", year: "numeric" })}`, `${f.date(expiry, { month: "long", year: "numeric" })} tarihine kadar geçerli`)}
          </span>
          <Button size="sm" onClick={() => setCardOpen(true)}>
            {c("Replace card", "Kartı değiştir")}
          </Button>
        </div>

        <div className="border-t border-line pt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-medium text-fg">{c("Billing details", "Fatura bilgileri")}</h3>
            <IconButton label={c("Edit billing details", "Fatura bilgilerini düzenle")} size="sm" variant="ghost" onClick={() => setProfileOpen(true)}>
              <Pencil />
            </IconButton>
          </div>
          <dl className="mt-2 grid gap-2 text-[13px]">
            <div>
              <dt className="sr-only">{c("Legal name", "Ticari unvan")}</dt>
              <dd className="text-fg">{profile.legalName}</dd>
              <dd className="text-fg-muted">{profile.address}</dd>
            </div>
            <div>
              <dt className="text-xs text-fg-subtle">{c("Tax office · Tax ID", "Vergi dairesi · VKN")}</dt>
              <dd className="font-mono text-fg-muted tabular">
                {profile.taxOffice} · {profile.taxId}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-fg-subtle">{c("Invoice recipients", "Fatura alıcıları")}</dt>
              {profile.emails.map((e) => (
                <dd key={e} className="truncate text-fg-muted">
                  {e}
                </dd>
              ))}
            </div>
          </dl>
        </div>
      </CardBody>

      <CardDialog
        open={cardOpen}
        onOpenChange={setCardOpen}
        holder={card.holder}
        onSave={(next) => {
          const prev = card;
          setCard(next);
          setCardOpen(false);
          toast.success(c(`Card ending ${next.last4} saved`, `${next.last4} ile biten kart kaydedildi`), {
            description: c("Your next invoice will be charged to it.", "Sonraki fatura bu karttan alınacak."),
            action: { label: c("Undo", "Geri al"), onClick: () => setCard(prev) },
          });
        }}
      />
      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        value={profile}
        onSave={(next) => {
          setProfile(next);
          setProfileOpen(false);
          toast.success(c("Billing details updated", "Fatura bilgileri güncellendi"), { description: c("They print on invoices from the next cycle.", "Sonraki dönemden itibaren faturalarda görünür.") });
        }}
      />
    </Card>
  );
}

function CardDialog({ open, onOpenChange, holder, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; holder: string; onSave: (card: typeof paymentMethod) => void }) {
  const { c } = useBlockFormat();
  const [num, setNum] = React.useState("");
  const [exp, setExp] = React.useState("");
  const [cvc, setCvc] = React.useState("");
  const [name, setName] = React.useState(holder);
  const [tried, setTried] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      setNum("");
      setExp("");
      setCvc("");
      setName(holder);
      setTried(false);
      setBusy(false);
    }
  }, [open, holder]);

  const [mm, yy] = [Number(exp.slice(0, 2)), Number(exp.slice(3, 5))];
  const numError = luhn(digits(num)) ? undefined : c("Check the card number.", "Kart numarasını kontrol edin.");
  const expError = mm >= 1 && mm <= 12 && 2000 + yy * 1 >= 2026 && exp.length === 5 && !(yy === 26 && mm < 11) ? undefined : c("Use MM/YY, in the future.", "AA/YY biçiminde, ileri bir tarih.");
  const cvcError = /^\d{3,4}$/.test(cvc) ? undefined : c("3 or 4 digits.", "3 veya 4 hane.");
  const invalid = Boolean(numError || expError || cvcError || !name.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader title={c("Replace card", "Kartı değiştir")} description={c("We place a temporary $1 hold to verify it.", "Doğrulamak için geçici 1 $ provizyon alınır.")} />
        <form
          id="card-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (invalid) return;
            setBusy(true);
            window.setTimeout(() => onSave({ ...paymentMethod, holder: name.trim(), last4: digits(num).slice(-4), expMonth: mm, expYear: 2000 + yy }), 800);
          }}
        >
          <DialogBody className="grid gap-4">
            <Field label={c("Card number", "Kart numarası")} error={tried ? numError : undefined} hint={c("Test with 4242 4242 4242 4242", "4242 4242 4242 4242 ile deneyin")}>
              <Input inputMode="numeric" autoComplete="cc-number" value={num} onChange={(e) => setNum(groupCard(e.target.value))} placeholder="1234 5678 9012 3456" className="font-mono" data-autofocus />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={c("Expiry", "Son kullanma")} error={tried ? expError : undefined}>
                <Input
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder={c("MM/YY", "AA/YY")}
                  value={exp}
                  onChange={(e) => {
                    const d = digits(e.target.value).slice(0, 4);
                    setExp(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                  }}
                  className="font-mono"
                />
              </Field>
              <Field label="CVC" error={tried ? cvcError : undefined}>
                <Input inputMode="numeric" autoComplete="cc-csc" value={cvc} onChange={(e) => setCvc(digits(e.target.value).slice(0, 4))} className="font-mono" />
              </Field>
            </div>
            <Field label={c("Name on card", "Kart üzerindeki ad")} error={tried && !name.trim() ? c("Enter the name on the card.", "Kart üzerindeki adı girin.") : undefined}>
              <Input autoComplete="cc-name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
          </DialogBody>
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c("Cancel", "Vazgeç")}
          </Button>
          <Button variant="primary" type="submit" form="card-form" loading={busy}>
            {c("Save card", "Kartı kaydet")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileDialog({ open, onOpenChange, value, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; value: typeof billingProfile; onSave: (v: typeof billingProfile) => void }) {
  const { c } = useBlockFormat();
  const [form, setForm] = React.useState(value);
  React.useEffect(() => {
    if (open) setForm(value);
  }, [open, value]);
  const set = <K extends keyof typeof billingProfile>(k: K, v: (typeof billingProfile)[K]) => setForm((p) => ({ ...p, [k]: v }));
  const taxError = /^\d{10,11}$/.test(form.taxId) ? undefined : c("10 digits for a company, 11 for a person.", "Şirket için 10, şahıs için 11 hane.");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader title={c("Billing details", "Fatura bilgileri")} description={c("Printed on every invoice. Use the details on your tax registration.", "Her faturaya basılır. Vergi kaydınızdaki bilgileri kullanın.")} />
        <DialogBody className="grid gap-4">
          <Field label={c("Legal name", "Ticari unvan")} required>
            <Input value={form.legalName} onChange={(e) => set("legalName", e.target.value)} autoComplete="organization" />
          </Field>
          <Field label={c("Address", "Adres")}>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={c("Tax office", "Vergi dairesi")}>
              <Input value={form.taxOffice} onChange={(e) => set("taxOffice", e.target.value)} />
            </Field>
            <Field label={c("Tax ID", "Vergi kimlik no")} error={taxError}>
              <Input inputMode="numeric" value={form.taxId} onChange={(e) => set("taxId", e.target.value.replace(/\D/g, "").slice(0, 11))} className="font-mono" />
            </Field>
          </div>
          <Field label={c("Invoice recipients", "Fatura alıcıları")} hint={c("Press Enter after each address.", "Her adresten sonra Enter'a basın.")}>
            <TagInput
              value={form.emails}
              onValueChange={(v) => set("emails", v)}
              validate={(v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? true : c("Not an email address", "Geçerli bir e-posta değil"))}
              delimiters={["Enter", ",", " "]}
              addOnBlur
              placeholder="finance@company.com"
            />
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c("Cancel", "Vazgeç")}
          </Button>
          <Button variant="primary" disabled={Boolean(taxError) || !form.legalName.trim() || form.emails.length === 0} onClick={() => onSave(form)}>
            {c("Save details", "Bilgileri kaydet")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
