"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  Badge, Button, CurrencyInput, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Field, Input, Progress,
} from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { certifications, partners, registrationStatusLabels, tierLabels, type DealRegistration } from "../../_shared/partners";
import { person } from "../../_shared/people";
import { daysBetween, TODAY } from "../../_shared/time";

const statusTone = { submitted: "info", approved: "success", won: "success", rejected: "danger", expired: "neutral" } as const;

export interface PartnerPortalProps {
  partnerId: string;
  registrations: DealRegistration[];
  onRegister: (prospect: string, amount: string) => void;
}

/** What a partner sees: tier progress, marketing funds, their deal registrations and certifications. */
export function PartnerPortal({ partnerId, registrations, onRegister }: PartnerPortalProps) {
  const { c, t, f, money } = useBlockFormat();
  const pt = partners.find((p) => p.id === partnerId)!;
  const mine = registrations.filter((r) => r.partnerId === partnerId);
  const certs = certifications.filter((x) => x.partnerId === partnerId);
  const manager = person(pt.managerId);
  const [open, setOpen] = React.useState(false);
  const [prospect, setProspect] = React.useState("");
  const [amount, setAmount] = React.useState<string | null>(null);

  const toNext = pt.nextTierAt ? Number(pt.sourcedRevenue.amount) / Number(pt.nextTierAt.amount) : 1;

  return (
    <div className="mx-auto grid w-full max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-8">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <Badge tone="warning" size="md">{t(tierLabels[pt.tier])} {c("partner", "iş ortağı")}</Badge>
          <h1 className="mt-3 font-display text-[length:calc(32px*var(--display-scale,1))] leading-tight text-fg">{pt.name}</h1>
          <p className="mt-1 text-[13px] text-fg-muted">
            {c(`Partner since ${f.date(pt.since, "month-year")} · your partner manager is ${manager.name}`, `${f.date(pt.since, "month-year")} tarihinden beri iş ortağı · iş ortağı yöneticiniz ${manager.name}`)}
          </p>
          <div className="mt-6 max-w-lg">
            <Progress
              size="md"
              value={Math.round(toNext * 100)}
              label={<span className="text-[13px] text-fg">{c("Progress to Platinum", "Platin seviyesine ilerleme")}</span>}
              showValue={() => (
                <span className="tabular text-[12.5px] text-fg-muted">
                  {money(pt.sourcedRevenue, { compact: true })} / {pt.nextTierAt ? money(pt.nextTierAt, { compact: true }) : "—"}
                </span>
              )}
              hint={c("Partner-sourced revenue this year. Platinum unlocks 30% margin and a dedicated solutions engineer.", "Bu yılki iş ortağı kaynaklı gelir. Platin, %30 marj ve özel çözüm mühendisi sağlar.")}
            />
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-px self-start overflow-hidden rounded-ui border border-line bg-line text-center">
          {[
            [c("MDF allocated", "Ayrılan fon"), money(pt.mdf.allocated, { compact: true })],
            [c("Claimed", "Talep edilen"), money(pt.mdf.claimed, { compact: true })],
            [c("Certified staff", "Sertifikalı kişi"), <CountUp key="s" value={pt.certifiedStaff} />],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex flex-col-reverse bg-surface px-2 py-4">
              <dt className="mt-1.5 text-[11px] text-fg-subtle">{k}</dt>
              <dd className="tabular font-display text-[22px] leading-none text-fg">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section aria-labelledby="pp-regs">
        <div className="flex items-center gap-3">
          <h2 id="pp-regs" className="flex-1 text-[15px] font-semibold text-fg">{c("Your deal registrations", "Fırsat kayıtlarınız")}</h2>
          <Button size="sm" variant="primary" onClick={() => { setProspect(""); setAmount(null); setOpen(true); }}>
            <Plus aria-hidden /> {c("Register a deal", "Fırsat kaydet")}
          </Button>
        </div>
        <p className="mt-1 text-[12.5px] text-fg-subtle">{c("Approved registrations protect the deal for 90 days.", "Onaylanan kayıtlar fırsatı 90 gün korur.")}</p>
        <div className="mt-3 overflow-x-auto rounded-ui border border-line bg-surface">
          <table className="w-full min-w-[520px] text-[13px]">
            <caption className="sr-only">{c("Deal registrations", "Fırsat kayıtları")}</caption>
            <thead className="border-b border-line text-[11px] tracking-wide text-fg-subtle uppercase">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-start font-medium">{c("Prospect", "Aday müşteri")}</th>
                <th scope="col" className="px-4 py-2.5 text-end font-medium">{c("Value", "Değer")}</th>
                <th scope="col" className="px-4 py-2.5 text-start font-medium">{c("Protected until", "Koruma bitişi")}</th>
                <th scope="col" className="px-4 py-2.5 text-start font-medium">{c("Status", "Durum")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {mine.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-fg">{r.prospect}</td>
                  <td className="tabular px-4 py-3 text-end text-fg">{money(r.value, { whole: true })}</td>
                  <td className="tabular px-4 py-3 text-fg-muted">{f.date(r.expires, "medium")}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[r.status]} dot>{t(registrationStatusLabels[r.status])}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="pp-certs">
        <h2 id="pp-certs" className="text-[15px] font-semibold text-fg">{c("Certifications", "Sertifikalar")}</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {certs.map((x) => {
            const left = daysBetween(TODAY, x.expires);
            return (
              <li key={x.id} className="rounded-ui border border-line bg-surface p-4">
                <p className="text-[13.5px] text-fg">{x.holder}</p>
                <p className="text-[12px] text-fg-muted">{t(x.name)}</p>
                <p className={left < 0 ? "mt-2 text-[12px] text-danger" : left < 90 ? "mt-2 text-[12px] text-warning" : "mt-2 text-[12px] text-fg-subtle"}>
                  {left < 0 ? c(`Expired ${f.date(x.expires, "medium")}`, `${f.date(x.expires, "medium")} tarihinde doldu`) : c(`Valid until ${f.date(x.expires, "medium")}`, `${f.date(x.expires, "medium")} tarihine kadar geçerli`)}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader title={c("Register a deal", "Fırsat kaydet")} description={c("Your partner manager reviews it within two working days.", "İş ortağı yöneticiniz iki iş günü içinde inceler.")} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!prospect.trim() || !amount) return;
              onRegister(prospect.trim(), amount);
              setOpen(false);
            }}
          >
            <DialogBody className="grid gap-4">
              <Field label={c("Prospect company", "Aday şirket")} required>
                <Input value={prospect} onChange={(e) => setProspect(e.target.value)} autoFocus placeholder="Orchard & Oak Furniture" />
              </Field>
              <Field label={c("Estimated first-year value", "Tahmini ilk yıl değeri")} required>
                <CurrencyInput currency="USD" value={amount} onValueChange={setAmount} />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>{c("Cancel", "Vazgeç")}</Button>
              <Button variant="primary" type="submit" disabled={!prospect.trim() || !amount}>
                {c("Submit for review", "İncelemeye gönder")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
