"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Avatar, Badge, Button, Card, CardBody, CardHeader, ConfirmDialog, Field, Input, Switch, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { checkCidr, cidrSize, currentIp, inCidr, type AllowEntry } from "./data";

interface Props {
  entries: AllowEntry[];
  enforced: boolean;
  blocked: string[];
  onChange: (next: { entries?: AllowEntry[]; enforced?: boolean; blocked?: string[] }) => void;
}

/**
 * IP allow list with a lock-out guard: you can't turn it on, or remove a range, if that would
 * leave your own address outside the list.
 */
export function AllowListCard({ entries, enforced, blocked, onChange }: Props) {
  const { c, f } = useBlockFormat();
  const [cidr, setCidr] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [pendingRemove, setPendingRemove] = React.useState<AllowEntry | null>(null);

  const covered = entries.some((e) => inCidr(currentIp, e.cidr));
  const problem = cidr ? checkCidr(cidr) : "format";
  const duplicate = entries.some((e) => e.cidr === cidr.trim());
  const error = touched && cidr
    ? problem === "format"
      ? c("Use an IPv4 address like 198.51.100.8 or a range like 203.0.113.0/24.", "198.51.100.8 gibi bir IPv4 adresi ya da 203.0.113.0/24 gibi bir aralık girin.")
      : problem === "prefix"
        ? c("Ranges go from /8 to /32.", "Aralıklar /8 ile /32 arasında olmalı.")
        : duplicate
          ? c("That range is already on the list.", "Bu aralık zaten listede.")
          : undefined
    : undefined;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!cidr || problem || duplicate) return;
    onChange({ entries: [...entries, { id: `ip-${Date.now()}`, cidr: cidr.trim(), label: label.trim() || c("Unnamed range", "Adsız aralık"), addedBy: "p-defne" }] });
    toast.success(c(`${cidr.trim()} added`, `${cidr.trim()} eklendi`));
    setCidr("");
    setLabel("");
    setTouched(false);
  };

  const remove = (entry: AllowEntry) => {
    const rest = entries.filter((x) => x.id !== entry.id);
    const locksOut = enforced && !rest.some((x) => inCidr(currentIp, x.cidr));
    if (locksOut) return setPendingRemove(entry);
    onChange({ entries: rest });
    toast(c(`${entry.cidr} removed`, `${entry.cidr} kaldırıldı`), { action: { label: c("Undo", "Geri al"), onClick: () => onChange({ entries }) } });
  };

  return (
    <Card id="sec-ip" className="scroll-mt-24">
      <CardHeader
        titleAs="h2"
        title={c("IP allow list", "IP izin listesi")}
        description={c("When it's on, people can only sign in to this workspace from these addresses. Applies to everyone, owners included.", "Açıkken bu çalışma alanına yalnızca bu adreslerden girilebilir. Sahipler dahil herkes için geçerlidir.")}
        action={
          <Switch
            aria-label={c("Enforce the allow list", "İzin listesini uygula")}
            checked={enforced}
            onCheckedChange={(on) => {
              if (on && !covered) {
                toast.danger(c("That would lock you out", "Bu sizi dışarıda bırakır"), { description: c(`Add ${currentIp} or its range first.`, `Önce ${currentIp} adresini ya da aralığını ekleyin.`) });
                return;
              }
              onChange({ enforced: on });
              toast(on ? c("Allow list is on", "İzin listesi açık") : c("Allow list is off", "İzin listesi kapalı"), { description: on ? c("Sessions from other addresses end within a minute.", "Diğer adreslerden açılan oturumlar bir dakika içinde kapanır.") : undefined });
            }}
          />
        }
        divider
      />
      <CardBody className="grid grid-cols-[minmax(0,1fr)] gap-4">
        <p className="flex flex-wrap items-center gap-2 text-[13px] text-fg-muted">
          {c("You're signing in from", "Şu adresten bağlısınız")} <code className="rounded-ui-sm bg-surface-2 px-1.5 py-0.5 font-mono text-[12.5px] text-fg">{currentIp}</code>
          {covered ? <Badge tone="success" dot>{c("on the list", "listede")}</Badge> : <Badge tone="warning" dot>{c("not on the list", "listede değil")}</Badge>}
        </p>

        <ul className="divide-y divide-line rounded-ui border border-line">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center gap-3 px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-mono text-[13.5px] text-fg">{e.cidr}</span>
                  <span className="text-[13px] text-fg-muted">{e.label}</span>
                </p>
                <p className="tabular flex items-center gap-1.5 text-[12px] text-fg-subtle">
                  <Avatar size="xs" name={person(e.addedBy).name} />
                  {c(`${f.number(cidrSize(e.cidr))} ${cidrSize(e.cidr) === 1 ? "address" : "addresses"} · added by ${person(e.addedBy).name}`, `${f.number(cidrSize(e.cidr))} adres · ekleyen ${person(e.addedBy).name}`)}
                </p>
              </div>
              {inCidr(currentIp, e.cidr) ? <Badge tone="outline">{c("You", "Siz")}</Badge> : null}
              <Button size="icon-sm" variant="ghost" aria-label={c(`Remove ${e.cidr}`, `${e.cidr} kaldır`)} onClick={() => remove(e)}>
                <X />
              </Button>
            </li>
          ))}
          {entries.length === 0 ? <li className="px-3.5 py-6 text-center text-[13px] text-fg-muted">{c("No addresses yet.", "Henüz adres yok.")}</li> : null}
        </ul>

        <form onSubmit={add} noValidate className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start">
          <Field label={c("Address or range", "Adres veya aralık")} error={error}>
            <Input value={cidr} onChange={(e) => setCidr(e.target.value)} onBlur={() => setTouched(true)} placeholder="198.51.100.0/24" className="font-mono" spellCheck={false} inputMode="decimal" />
          </Field>
          <Field label={c("Label", "Etiket")} optional>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={c("Izmir showroom", "İzmir showroom")} />
          </Field>
          <Button type="submit" className="sm:mt-[calc(1.25rem+6px)]">
            <Plus /> {c("Add", "Ekle")}
          </Button>
        </form>

        {blocked.length > 0 ? (
          <div className="border-t border-line pt-4">
            <p className="mb-2 text-[13px] font-medium text-fg">{c("Blocked addresses", "Engellenen adresler")}</p>
            <ul className="flex flex-wrap gap-2">
              {blocked.map((ip) => (
                <li key={ip}>
                  <Badge tone="danger" size="md" onRemove={() => onChange({ blocked: blocked.filter((b) => b !== ip) })} removeLabel={c(`Unblock ${ip}`, `${ip} engelini kaldır`)}>
                    <span className="font-mono">{ip}</span>
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardBody>

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        tone="danger"
        title={c("Remove the range you're using?", "Kullandığınız aralık kaldırılsın mı?")}
        description={c(`${currentIp} is only covered by ${pendingRemove?.cidr}. Removing it turns the allow list off so you don't lock yourself out.`, `${currentIp} yalnızca ${pendingRemove?.cidr} ile kapsanıyor. Kaldırırsanız kendinizi dışarıda bırakmamanız için izin listesi kapanır.`)}
        confirmLabel={c("Remove and turn off", "Kaldır ve kapat")}
        onResult={(ok) => {
          const e = pendingRemove;
          setPendingRemove(null);
          if (!ok || !e) return;
          onChange({ entries: entries.filter((x) => x.id !== e.id), enforced: false });
          toast.warning(c("Allow list turned off", "İzin listesi kapatıldı"), { description: c(`${e.cidr} removed. Add your new range, then turn it back on.`, `${e.cidr} kaldırıldı. Yeni aralığınızı ekleyip tekrar açın.`) });
        }}
      />
    </Card>
  );
}
