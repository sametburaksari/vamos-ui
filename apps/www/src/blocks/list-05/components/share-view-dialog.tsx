"use client";

import * as React from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Avatar, Badge, Button, Checkbox, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Field, Input, RadioGroup, toast } from "@vamos-ui/react";
import { FilterBar, serializeListState, useDataTable, viewStateEqual } from "@vamos-ui/react/data-table";
import { useBlockFormat } from "../../_shared/format";
import { me, person } from "../../_shared/people";
import type { CrmContact } from "./contacts-data";
import { useAudience } from "./views-rail";
import { audienceLabels, type Audience, type ContactView } from "./views-data";

const BASE = "https://crm.example.com/contacts";

interface ShareViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: ContactView | null;
  onAudienceChange: (id: string, audience: Audience) => void;
}

/** Share a view: who can open it, a link (optionally with your unsaved changes) and a read-only preview of what they get. */
export function ShareViewDialog({ open, onOpenChange, view, onAudienceChange }: ShareViewDialogProps) {
  const { c, t } = useBlockFormat();
  const { state, fields, columns, savedViewsBinding, total } = useDataTable<CrmContact>();
  const audience = useAudience();
  const [withChanges, setWithChanges] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const { current } = savedViewsBinding(view ? [view] : []);
  const dirty = view ? !viewStateEqual(current, view.state) : true;
  const mine = view?.ownerId === me.id;

  React.useEffect(() => {
    if (open) setCopied(false);
  }, [open]);

  const query = !view || (dirty && withChanges) ? serializeListState({ ...state, view: view?.id ?? null }) : `sv=${view.id}`;
  const url = `${BASE}${query ? `?${query}` : ""}`;
  const visible = columns.filter((col) => state.columns.visible[col.id] ?? col.defaultVisible ?? true);
  const a = view ? audience(view) : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard blocked (iframe, http): the field stays selectable */
    }
    setCopied(true);
    toast.success(c("Link copied", "Bağlantı kopyalandı"), { description: dirty && withChanges ? c("It opens with your unsaved changes.", "Kaydedilmemiş değişikliklerinizle açılır.") : undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader
          title={view ? c(`Share “${t(view.label)}”`, `“${t(view.label)}” görünümünü paylaş`) : c("Share this list", "Bu listeyi paylaş")}
          description={c("Anyone you share with sees the same filters, sort and columns. They only see contacts they already have access to.", "Paylaştığınız kişiler aynı filtreleri, sıralamayı ve sütunları görür. Yalnızca zaten erişebildikleri kişileri görürler.")}
        />
        <DialogBody className="grid gap-5">
          {view ? (
            <Field
              label={c("Who can open it", "Kimler açabilir")}
              hint={mine ? undefined : c(`Only ${person(view.ownerId).name} can change who sees this view.`, `Bu görünümü kimin göreceğini yalnızca ${person(view.ownerId).name} değiştirebilir.`)}
            >
              <RadioGroup
                variant="segmented"
                size="sm"
                value={view.audience}
                readOnly={!mine}
                onValueChange={(v) => {
                  onAudienceChange(view.id, v as Audience);
                  toast(c(`Now visible to: ${t(audienceLabels[v as Audience])}`, `Artık görebilenler: ${t(audienceLabels[v as Audience])}`));
                }}
                items={(Object.keys(audienceLabels) as Audience[]).map((k) => ({ value: k, label: k === "workspace" ? c("Workspace", "Herkes") : t(audienceLabels[k]) }))}
              />
            </Field>
          ) : null}
          {a && a.ids.length ? (
            <div className="grid gap-2">
              <p className="text-[12px] font-medium text-fg-muted">{a.text}</p>
              <ul className="flex flex-wrap gap-1.5">
                {a.ids.map((id) => (
                  <li key={id} className="inline-flex items-center gap-1.5 rounded-full border border-line py-0.5 ps-0.5 pe-2.5 text-[12px] text-fg">
                    <Avatar name={person(id).name} size="xs" />
                    {person(id).name}
                    {id === view?.ownerId ? <span className="text-fg-subtle">· {c("owner", "sahibi")}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Field label={c("Link", "Bağlantı")}>
            <div className="flex gap-2">
              <Input readOnly value={url} leading={<Link2 />} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 font-mono text-[12px]" />
              <Button onClick={copy} variant={copied ? "secondary" : "primary"}>
                {copied ? <Check /> : <Copy />}
                {copied ? c("Copied", "Kopyalandı") : c("Copy link", "Bağlantıyı kopyala")}
              </Button>
            </div>
          </Field>
          {view && dirty ? (
            <Checkbox
              checked={withChanges}
              onCheckedChange={(v) => setWithChanges(v === true)}
              label={c("Include my unsaved changes", "Kaydedilmemiş değişikliklerimi ekle")}
              description={c("Without it the link opens the saved version of the view.", "İşaretlenmezse bağlantı görünümün kayıtlı hâlini açar.")}
            />
          ) : null}

          <div className="grid gap-2.5 rounded-ui border border-line bg-surface-2 p-3.5">
            <p className="flex items-center justify-between gap-2 text-[12px] font-medium text-fg-muted">
              {c("They will see", "Görecekleri")}
              <Badge size="sm" tone="outline" className="tabular">
                {c(`${total} contacts for you`, `sizin için ${total} kişi`)}
              </Badge>
            </p>
            {state.filters.clauses.length ? (
              <FilterBar fields={fields} value={state.filters} readOnly size="sm" layout="inline" aria-label={c("Filters in this link", "Bu bağlantıdaki filtreler")} />
            ) : (
              <p className="text-[12.5px] text-fg-subtle">{c("No filters: every contact they can access.", "Filtre yok: erişebildikleri tüm kişiler.")}</p>
            )}
            <p className="text-[12px] text-fg-muted">
              <span className="text-fg-subtle">{c("Columns", "Sütunlar")}: </span>
              {visible.map((col) => col.header).join(" · ")}
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{c("Done", "Bitti")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
