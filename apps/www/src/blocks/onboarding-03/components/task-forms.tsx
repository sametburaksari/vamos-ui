"use client";

import * as React from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import {
  Button, Field, IbanInput, Input, RadioGroup, Select, Switch, Table, TableBody, TableCaption, TableCell, TableContainer,
  TableHead, TableHeader, TableRow, TagInput, toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import type { L } from "../../_shared/l10n";
import { dnsRecords, roleOptions, sampleProducts, type LaunchTaskId } from "./data";

export interface TaskFormProps {
  /** Save the task with a one-line summary of what was set. */
  onDone: (result: L) => void;
  /** The task the checklist points at: its save button is the primary action. */
  current: boolean;
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** The inline form for one launch task. Each validates on save and reports a short summary. */
export function TaskForm({ id, ...props }: TaskFormProps & { id: LaunchTaskId }) {
  switch (id) {
    case "address":
      return <AddressForm {...props} />;
    case "tax":
      return <TaxForm {...props} />;
    case "payouts":
      return <PayoutForm {...props} />;
    case "domain":
      return <DomainForm {...props} />;
    case "products":
      return <ProductsForm {...props} />;
    case "team":
      return <TeamForm {...props} />;
    case "notify":
      return <NotifyForm {...props} />;
    default:
      return <DetailsForm {...props} />;
  }
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 flex flex-wrap items-center gap-2">{children}</div>;
}

function DetailsForm({ onDone, current }: TaskFormProps) {
  const { c } = useBlockFormat();
  const [name, setName] = React.useState("Kiln & Linen Ev Tekstili Ltd.");
  const [error, setError] = React.useState<string>();
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim().length < 3) return setError(c("Enter the registered company name.", "Kayıtlı şirket adını girin."));
        onDone({ en: `${name.trim()} · tax no. 4810 2266 93`, tr: `${name.trim()} · VKN 4810 2266 93` });
      }}
    >
      <Field label={c("Registered name", "Ticari unvan")} error={error} required>
        <Input value={name} onChange={(e) => { setName(e.target.value); setError(undefined); }} />
      </Field>
      <Actions>
        <Button type="submit" size="sm" variant={current ? "primary" : "secondary"}>{c("Save details", "Bilgileri kaydet")}</Button>
      </Actions>
    </form>
  );
}

function AddressForm({ onDone, current }: TaskFormProps) {
  const { c } = useBlockFormat();
  const [v, setV] = React.useState({ street: "", district: "Kadıköy", city: "İstanbul", postcode: "" });
  const [errors, setErrors] = React.useState<Partial<Record<keyof typeof v, string>>>({});
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setV((s) => ({ ...s, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: undefined }));
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (v.street.trim().length < 5) next.street = c("Enter the street and building number.", "Sokak ve bina numarasını girin.");
    if (!/^\d{5}$/.test(v.postcode)) next.postcode = c("Postcodes have 5 digits.", "Posta kodu 5 hanelidir.");
    if (!v.city.trim()) next.city = c("Enter a city.", "Bir şehir girin.");
    setErrors(next);
    if (Object.keys(next).length) return;
    onDone({ en: `${v.street.trim()}, ${v.district} / ${v.city} ${v.postcode}`, tr: `${v.street.trim()}, ${v.district} / ${v.city} ${v.postcode}` });
  };
  return (
    <form noValidate onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={c("Street address", "Açık adres")} error={errors.street} required className="sm:col-span-2">
          <Input value={v.street} onChange={set("street")} placeholder={c("Moda Cd. No: 18, Depo 2", "Moda Cd. No: 18, Depo 2")} autoComplete="street-address" />
        </Field>
        <Field label={c("District", "İlçe")}>
          <Input value={v.district} onChange={set("district")} />
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-3">
          <Field label={c("City", "Şehir")} error={errors.city} required>
            <Input value={v.city} onChange={set("city")} autoComplete="address-level1" />
          </Field>
          <Field label={c("Postcode", "Posta kodu")} error={errors.postcode} required>
            <Input value={v.postcode} onChange={set("postcode")} inputMode="numeric" maxLength={5} autoComplete="postal-code" className="font-mono" />
          </Field>
        </div>
      </div>
      <Actions>
        <Button type="submit" size="sm" variant={current ? "primary" : "secondary"}>{c("Save address", "Adresi kaydet")}</Button>
      </Actions>
    </form>
  );
}

function TaxForm({ onDone, current }: TaskFormProps) {
  const { c } = useBlockFormat();
  const [rate, setRate] = React.useState<"20" | "10" | "1">("20");
  const [inclusive, setInclusive] = React.useState(true);
  return (
    <div>
      <RadioGroup<"20" | "10" | "1">
        aria-label={c("Default VAT rate", "Varsayılan KDV oranı")}
        variant="card"
        size="sm"
        value={rate}
        onValueChange={setRate}
        className="grid gap-2 sm:grid-cols-3"
        items={[
          { value: "20", label: c("20% standard", "%20 genel"), description: c("Most homeware and textiles", "Çoğu ev eşyası ve tekstil") },
          { value: "10", label: c("10% reduced", "%10 indirimli"), description: c("Selected food and books", "Bazı gıda ve kitaplar") },
          { value: "1", label: c("1% basic", "%1 temel"), description: c("Basic foodstuffs", "Temel gıda") },
        ]}
      />
      <div className="mt-4">
        <Switch checked={inclusive} onCheckedChange={setInclusive} label={c("Prices include VAT", "Fiyatlara KDV dahil")} description={c("Shoppers see the final price on product pages.", "Müşteriler ürün sayfasında son fiyatı görür.")} />
      </div>
      <Actions>
        <Button
          size="sm"
          variant={current ? "primary" : "secondary"}
          onClick={() =>
            onDone({
              en: `${rate}% by default · prices ${inclusive ? "include" : "exclude"} VAT`,
              tr: `Varsayılan %${rate} · fiyatlara KDV ${inclusive ? "dahil" : "hariç"}`,
            })
          }
        >
          {c("Save tax settings", "Vergi ayarlarını kaydet")}
        </Button>
      </Actions>
    </div>
  );
}

function PayoutForm({ onDone, current }: TaskFormProps) {
  const { c } = useBlockFormat();
  const [holder, setHolder] = React.useState("Kiln & Linen Ev Tekstili Ltd.");
  const [iban, setIban] = React.useState<string | null>(null);
  const [valid, setValid] = React.useState(false);
  const [error, setError] = React.useState<string>();
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!iban || !valid) return setError(c("Enter a valid Turkish IBAN (TR + 24 digits).", "Geçerli bir IBAN girin (TR + 24 hane)."));
        onDone({ en: `${holder} · IBAN ending ${iban.slice(-4)}`, tr: `${holder} · IBAN son 4 hane ${iban.slice(-4)}` });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={c("Account holder", "Hesap sahibi")}>
          <Input value={holder} onChange={(e) => setHolder(e.target.value)} />
        </Field>
        <Field label="IBAN" error={error} hint={c("Must be in the company's name.", "Şirket adına olmalı.")} required>
          <IbanInput
            countries={["TR"]}
            value={iban}
            onValueChange={(v, meta) => {
              setIban(v);
              setValid(meta.valid && !!v);
              setError(undefined);
            }}
            onValidate={(r) => setError(r.valid ? undefined : r.message)}
          />
        </Field>
      </div>
      <Actions>
        <Button type="submit" size="sm" variant={current ? "primary" : "secondary"}>{c("Save payout account", "Ödeme hesabını kaydet")}</Button>
        <span className="text-xs text-fg-subtle">{c("Verified with a 0.01 TL test deposit.", "0,01 TL'lik test ödemesiyle doğrulanır.")}</span>
      </Actions>
    </form>
  );
}

function DomainForm({ onDone, current }: TaskFormProps) {
  const { c } = useBlockFormat();
  const [checking, setChecking] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const [status, setStatus] = React.useState<string>("");
  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* the value stays selectable */
    }
    toast.success(c("Copied", "Kopyalandı"));
  };
  const check = () => {
    setChecking(true);
    setStatus(c("Checking DNS…", "DNS kontrol ediliyor…"));
    window.setTimeout(() => {
      setChecking(false);
      const n = attempts + 1;
      setAttempts(n);
      // The first check finds only the CNAME, like a slow TXT propagation; the second passes.
      if (n === 1) setStatus(c("CNAME found. TXT record not visible yet — DNS can take a few minutes.", "CNAME bulundu. TXT kaydı henüz görünmüyor — DNS birkaç dakika sürebilir."));
      else onDone({ en: "shop.kilnlinen.example.com · SSL issued", tr: "shop.kilnlinen.example.com · SSL hazır" });
    }, 900);
  };
  return (
    <div>
      <TableContainer>
        <Table density="compact" hover={false}>
          <TableCaption visuallyHidden>{c("DNS records to add", "Eklenecek DNS kayıtları")}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "5rem" }}>{c("Type", "Tür")}</TableHead>
              <TableHead>{c("Host", "Ad")}</TableHead>
              <TableHead>{c("Value", "Değer")}</TableHead>
              <TableHead style={{ width: "3rem" }}><span className="sr-only">{c("Copy", "Kopyala")}</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dnsRecords.map((r, i) => (
              <TableRow key={r.type}>
                <TableCell className="font-mono text-[12px]">{r.type}</TableCell>
                <TableCell className="font-mono text-[12px] [overflow-wrap:anywhere]">{r.host}</TableCell>
                <TableCell className="font-mono text-[12px] [overflow-wrap:anywhere]">
                  {r.value}
                  {attempts >= 1 ? (
                    <span className={i === 0 ? "ms-2 text-success" : "ms-2 text-warning"}>{i === 0 ? c("found", "bulundu") : c("pending", "bekleniyor")}</span>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Button size="icon-sm" variant="ghost" aria-label={c(`Copy ${r.type} value`, `${r.type} değerini kopyala`)} onClick={() => void copy(r.value)}>
                    <Copy />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Actions>
        <Button size="sm" variant={current ? "primary" : "secondary"} loading={checking} onClick={check}>
          <RefreshCw /> {attempts ? c("Check again", "Tekrar kontrol et") : c("Check DNS", "DNS'i kontrol et")}
        </Button>
        <span className="text-xs text-fg-muted" role="status">{status}</span>
      </Actions>
    </div>
  );
}

function ProductsForm({ onDone, current }: TaskFormProps) {
  const { c, t } = useBlockFormat();
  const [picked, setPicked] = React.useState<number[]>([0, 1]);
  return (
    <div>
      <p className="mb-2 text-[13px] text-fg-muted">{c("Start from your own drafts — publish them now, the rest can wait.", "Kendi taslaklarınızdan başlayın — şimdi yayınlayın, gerisi bekleyebilir.")}</p>
      <ul className="m-0 grid list-none gap-1.5 p-0" aria-label={c("Draft products", "Taslak ürünler")}>
        {sampleProducts.map((p, i) => {
          const on = picked.includes(i);
          return (
            <li key={i}>
              <Switch
                size="sm"
                checked={on}
                onCheckedChange={(v) => setPicked((s) => (v ? [...s, i] : s.filter((x) => x !== i)))}
                label={t(p)}
                labelPosition="start"
                className="w-full justify-between rounded-ui surface-2 px-3 py-2"
              />
            </li>
          );
        })}
      </ul>
      <Actions>
        <Button
          size="sm"
          variant={current ? "primary" : "secondary"}
          disabled={!picked.length}
          onClick={() => onDone({ en: `${picked.length} products published`, tr: `${picked.length} ürün yayında` })}
        >
          <Check /> {c(`Publish ${picked.length}`, `${picked.length} ürünü yayınla`)}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => toast(c("The importer opens in a new tab in your app.", "İçe aktarıcı uygulamanızda yeni sekmede açılır."))}>
          {c("Import a CSV instead", "Bunun yerine CSV içe aktar")}
        </Button>
      </Actions>
    </div>
  );
}

function TeamForm({ onDone, current }: TaskFormProps) {
  const { c, t } = useBlockFormat();
  const [emails, setEmails] = React.useState<string[]>(["selin@kilnlinen.example.com"]);
  const [role, setRole] = React.useState<string>("staff");
  const [error, setError] = React.useState<string>();
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!emails.length) return setError(c("Add at least one email address.", "En az bir e-posta adresi ekleyin."));
        if (emails.some((x) => !isEmail(x))) return setError(c("Fix or remove the addresses marked red.", "Kırmızı işaretli adresleri düzeltin veya kaldırın."));
        onDone({ en: `${emails.length} invited`, tr: `${emails.length} kişi davet edildi` });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <Field label={c("Email addresses", "E-posta adresleri")} error={error} hint={c("Press Enter after each address.", "Her adresten sonra Enter'a basın.")}>
          <TagInput
            value={emails}
            onValueChange={(v) => { setEmails(v); setError(undefined); }}
            validate={(x) => (isEmail(x) ? true : c("Not an email address", "E-posta adresi değil"))}
            addOnBlur
            placeholder="name@kilnlinen.example.com"
          />
        </Field>
        <Field label={c("Role", "Rol")}>
          <Select value={role} onValueChange={(v) => v && setRole(v)} items={roleOptions.map((r) => ({ value: r.value, label: t(r.label) }))} />
        </Field>
      </div>
      <Actions>
        <Button type="submit" size="sm" variant={current ? "primary" : "secondary"}>{c("Send invites", "Davetleri gönder")}</Button>
      </Actions>
    </form>
  );
}

function NotifyForm({ onDone, current }: TaskFormProps) {
  const { c } = useBlockFormat();
  const [v, setV] = React.useState({ orders: true, returns: true, stock: false });
  const rows: { k: keyof typeof v; label: string; hint: string }[] = [
    { k: "orders", label: c("New orders", "Yeni siparişler"), hint: c("Email to orders@kilnlinen.example.com", "orders@kilnlinen.example.com adresine e-posta") },
    { k: "returns", label: c("Return requests", "İade talepleri"), hint: c("Email and a badge in Orders", "E-posta ve Siparişler'de rozet") },
    { k: "stock", label: c("Low stock", "Düşük stok"), hint: c("When an item drops under its reorder point", "Ürün yeniden sipariş seviyesinin altına düştüğünde") },
  ];
  const on = Object.values(v).filter(Boolean).length;
  return (
    <div>
      <div className="grid gap-3">
        {rows.map((r) => (
          <Switch key={r.k} checked={v[r.k]} onCheckedChange={(x) => setV((s) => ({ ...s, [r.k]: x }))} label={r.label} description={r.hint} />
        ))}
      </div>
      <Actions>
        <Button size="sm" variant={current ? "primary" : "secondary"} onClick={() => onDone({ en: `${on} of 3 alerts on`, tr: `3 bildirimden ${on} tanesi açık` })}>
          {c("Save notifications", "Bildirimleri kaydet")}
        </Button>
      </Actions>
    </div>
  );
}
