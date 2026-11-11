"use client";

import * as React from "react";
import { AlertTriangle, Check, Search, X } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  DescriptionList,
  Field,
  Input,
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { registrationStatusLabels } from "../../_shared/partners";
import { daysBetween, TODAY } from "../../_shared/time";
import type { Registration, RegStatus } from "./partner-data";

type Filter = "all" | "submitted" | "approved" | "closed";
const statusTone: Record<RegStatus, "warning" | "info" | "success" | "danger" | "neutral"> = {
  submitted: "warning",
  approved: "info",
  won: "success",
  rejected: "danger",
  expired: "neutral",
};

/** Deal registrations: filter, select, approve or reject in bulk, or review one in a sheet. */
export function RegistrationsPanel({ items, onDecide }: { items: Registration[]; onDecide: (ids: string[], status: "approved" | "rejected", reason?: string) => void }) {
  const { c, t, f, money, ago } = useBlockFormat();
  const [filter, setFilter] = React.useState<Filter>("submitted");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState("");
  const [reasonError, setReasonError] = React.useState(false);

  const q = query.trim().toLocaleLowerCase();
  const visible = items.filter(
    (r) =>
      (filter === "all" || (filter === "closed" ? ["won", "rejected", "expired"].includes(r.status) : r.status === filter)) &&
      (!q || `${r.prospect} ${r.contact}`.toLocaleLowerCase().includes(q)),
  );
  const count = (fl: Filter) => items.filter((r) => fl === "all" || (fl === "closed" ? ["won", "rejected", "expired"].includes(r.status) : r.status === fl)).length;
  const selectable = visible.filter((r) => r.status === "submitted");
  const chosen = selectable.filter((r) => selected.has(r.id));
  const allChecked = selectable.length > 0 && chosen.length === selectable.length ? true : chosen.length > 0 ? "indeterminate" : false;
  // Keep the last record while the sheet animates out.
  const lastOpen = React.useRef<Registration | null>(null);
  const current = items.find((r) => r.id === openId) ?? null;
  if (current) lastOpen.current = current;
  const open = current ?? lastOpen.current;

  const decide = (ids: string[], status: "approved" | "rejected", why?: string) => {
    onDecide(ids, status, why);
    setSelected((s) => {
      const next = new Set(s);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const openReview = (id: string) => {
    setReason("");
    setReasonError(false);
    setOpenId(id);
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup size="sm" value={filter} onValueChange={(v) => { setFilter(v as Filter); setSelected(new Set()); }} aria-label={c("Registration status", "Kayıt durumu")}>
          {(
            [
              ["submitted", c("To review", "İncelenecek")],
              ["approved", c("Protected", "Korumada")],
              ["closed", c("Closed", "Kapanan")],
              ["all", c("All", "Tümü")],
            ] as const
          ).map(([v, label]) => (
            <ToggleGroupItem key={v} value={v}>
              {label} <span className="text-fg-subtle tabular">{count(v)}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Input
          type="search"
          size="sm"
          aria-label={c("Search registrations", "Kayıtlarda ara")}
          placeholder={c("Prospect or contact…", "Aday firma veya kişi…")}
          leading={<Search />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:ms-auto sm:w-56"
        />
      </div>

      {chosen.length > 0 ? (
        <div className="ui-fade flex flex-wrap items-center gap-2 rounded-ui bg-selected px-3 py-2" role="region" aria-label={c("Bulk actions", "Toplu işlemler")}>
          <p className="me-auto text-[13px] text-fg">
            <span className="tabular">{chosen.length}</span> {c("selected", "seçili")} · <span className="tabular">{money({ amount: chosen.reduce((n, r) => n + Number(r.value.amount), 0).toFixed(2), currency: "USD" }, { whole: true })}</span>
          </p>
          <Button size="sm" onClick={() => decide(chosen.map((r) => r.id), "rejected", c("Rejected in bulk review", "Toplu incelemede reddedildi"))}>
            <X /> {c("Reject", "Reddet")}
          </Button>
          <Button size="sm" variant="solid" onClick={() => decide(chosen.map((r) => r.id), "approved")}>
            <Check /> {c("Approve", "Onayla")}
          </Button>
        </div>
      ) : null}

      <TableContainer className="surface rounded-ui-lg" aria-label={c("Deal registrations", "Fırsat kayıtları")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label={c("Select all awaiting review", "İnceleme bekleyenlerin tümünü seç")}
                  checked={allChecked}
                  disabled={selectable.length === 0}
                  onCheckedChange={(v) => setSelected(v === true ? new Set(selectable.map((r) => r.id)) : new Set())}
                />
              </TableHead>
              <TableHead>{c("Prospect", "Aday firma")}</TableHead>
              <TableHead className="max-md:hidden">{c("Status", "Durum")}</TableHead>
              <TableHead className="max-lg:hidden">{c("Protection", "Koruma")}</TableHead>
              <TableHead numeric>{c("Value", "Tutar")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableEmpty colSpan={5} title={filter === "submitted" ? c("Review queue is clear", "İnceleme kuyruğu boş") : c("No registrations match", "Eşleşen kayıt yok")} description={c("New registrations from Meridyen Digital land here.", "Meridyen Digital’in yeni kayıtları buraya düşer.")} />
            ) : (
              visible.map((r) => {
                const left = daysBetween(TODAY, r.expires);
                return (
                  <TableRow key={r.id} selected={selected.has(r.id)}>
                    <TableCell>
                      {r.status === "submitted" ? (
                        <Checkbox
                          aria-label={c(`Select ${r.prospect}`, `${r.prospect} seç`)}
                          checked={selected.has(r.id)}
                          onCheckedChange={(v) =>
                            setSelected((s) => {
                              const next = new Set(s);
                              if (v === true) next.add(r.id);
                              else next.delete(r.id);
                              return next;
                            })
                          }
                        />
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <button type="button" onClick={() => openReview(r.id)} className="focus-ring -mx-1 rounded-ui-sm px-1 text-start font-medium text-fg hover:underline">
                        {r.prospect}
                      </button>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-fg-muted">
                        <span>{r.contact} · {t(r.product)}</span>
                        <Badge tone={statusTone[r.status]} className="md:hidden">{t(registrationStatusLabels[r.status])}</Badge>
                        {r.conflict ? (
                          <span className="tone-warning inline-flex items-center gap-1 text-[color-mix(in_srgb,var(--tone)_70%,var(--fg))]">
                            <AlertTriangle className="size-3" aria-hidden /> {c("Channel conflict", "Kanal çakışması")}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="max-md:hidden">
                      <Badge tone={statusTone[r.status]} dot>{t(registrationStatusLabels[r.status])}</Badge>
                      <div className="mt-1 text-[12px] text-fg-subtle">{c("Submitted", "Gönderildi")} {ago(`${r.submitted}T09:00:00+03:00`)}</div>
                    </TableCell>
                    <TableCell className="max-lg:hidden">
                      {r.status === "approved" || r.status === "submitted" ? (
                        <span className={cn("text-[13px] tabular", left < 30 ? "text-fg" : "text-fg-muted")}>
                          {c(`${left} days left`, `${left} gün kaldı`)}
                          <span className="block text-[12px] text-fg-subtle">{f.date(r.expires, "medium")}</span>
                        </span>
                      ) : (
                        <span className="text-[13px] text-fg-subtle">—</span>
                      )}
                    </TableCell>
                    <TableCell numeric className="font-medium">{money(r.value, { whole: true })}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Sheet open={!!current} onOpenChange={(v) => !v && setOpenId(null)}>
        <SheetContent size="md">
          {open ? (
            <>
              <SheetHeader title={open.prospect} description={`${open.id.toUpperCase()} · ${t(registrationStatusLabels[open.status])}`} />
              <SheetBody className="grid content-start gap-5">
                {open.conflict ? (
                  <Alert tone="warning" title={c("Channel conflict", "Kanal çakışması")}>
                    {t(open.conflict)}
                  </Alert>
                ) : null}
                <DescriptionList
                  layout="vertical"
                  size="sm"
                  items={[
                    { key: "value", label: c("Estimated value", "Tahmini tutar"), value: money(open.value, { whole: true }) },
                    { key: "product", label: c("Product", "Ürün"), value: t(open.product) },
                    { key: "contact", label: c("Prospect contact", "Aday firma yetkilisi"), value: open.contact },
                    { key: "submitted", label: c("Submitted", "Gönderildi"), value: f.date(open.submitted, "long") },
                    { key: "expires", label: c("Protection ends", "Koruma bitişi"), value: f.date(open.expires, "long") },
                  ]}
                />
                {open.note ? <p className="text-[13px] text-fg-muted">{t(open.note)}</p> : null}
                {open.status === "submitted" ? (
                  <Field
                    label={c("Note to the partner", "Partnere not")}
                    hint={c("Required when you reject. The partner sees it in their portal.", "Reddederken zorunlu. Partner bunu portalında görür.")}
                    error={reasonError ? c("Tell the partner why it was rejected.", "Partnere neden reddedildiğini yazın.") : null}
                  >
                    <Textarea rows={3} value={reason} onChange={(e) => { setReason(e.target.value); setReasonError(false); }} />
                  </Field>
                ) : null}
              </SheetBody>
              {open.status === "submitted" ? (
                <SheetFooter>
                  <Button
                    onClick={() => {
                      if (!reason.trim()) return setReasonError(true);
                      decide([open.id], "rejected", reason.trim());
                      setOpenId(null);
                    }}
                  >
                    <X /> {c("Reject", "Reddet")}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      decide([open.id], "approved", reason.trim() || undefined);
                      setOpenId(null);
                    }}
                  >
                    <Check /> {c("Approve · protect 90 days", "Onayla · 90 gün koru")}
                  </Button>
                </SheetFooter>
              ) : null}
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
