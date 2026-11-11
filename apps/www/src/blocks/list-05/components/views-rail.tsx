"use client";

import * as React from "react";
import { Eye, Lock, Plus, RotateCcw, Star, Users } from "lucide-react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  IconButton,
  Input,
  RadioGroup,
  cn,
  toast,
} from "@vamos-ui/react";
import { applyFilters, useDataTable, viewStateEqual } from "@vamos-ui/react/data-table";
import { useBlockFormat } from "../../_shared/format";
import { me, person } from "../../_shared/people";
import type { CrmContact } from "./contacts-data";
import { audienceLabels, salesTeam, type Audience, type ContactView } from "./views-data";

type SetViews = React.Dispatch<React.SetStateAction<ContactView[]>>;

const audienceIcon: Record<Audience, typeof Lock> = { private: Lock, sales: Users, workspace: Eye };

/** Who can open a view, as avatars + text. */
export function useAudience() {
  const { c, t } = useBlockFormat();
  return (v: ContactView) => {
    const ids = v.audience === "private" ? [v.ownerId, ...(v.sharedWith ?? [])] : v.audience === "sales" ? [...new Set([v.ownerId, ...salesTeam, ...(v.sharedWith ?? [])])] : [];
    const text =
      v.audience === "workspace"
        ? t(audienceLabels.workspace)
        : v.audience === "sales"
          ? c(`Sales team · ${ids.length} people`, `Satış ekibi · ${ids.length} kişi`)
          : ids.length > 1
            ? c(`You and ${ids.length - 1} more`, `Siz ve ${ids.length - 1} kişi daha`)
            : t(audienceLabels.private);
    return { ids, text };
  };
}

/** The views list beside the table (lg and up). Counts are live: each view's filters run on the current rows. */
export function ViewsRail({ views, setViews, className }: { views: ContactView[]; setViews: SetViews; className?: string }) {
  const { c, t, f } = useBlockFormat();
  const { savedViewsBinding, fields, props } = useDataTable<CrmContact>();
  const { activeId, current, onSelect, onReset } = savedViewsBinding(views);
  const [saving, setSaving] = React.useState(false);
  const active = views.find((v) => v.id === activeId) ?? null;
  const dirty = active ? !viewStateEqual(current, active.state) : current.filters.clauses.length > 0 || Boolean(current.q);
  const canEdit = active ? active.ownerId === me.id && !active.system : false;

  const count = (v: ContactView | null) => applyFilters(props.data, v ? v.state.filters : { logic: "and", clauses: [] }, fields, { me: me.id }).length;

  const sections: Array<{ key: string; title: string; items: ContactView[] }> = [
    { key: "yours", title: c("Your views", "Görünümleriniz"), items: views.filter((v) => v.ownerId === me.id) },
    { key: "shared", title: c("Shared with you", "Sizinle paylaşılan"), items: views.filter((v) => v.ownerId !== me.id && v.sharedWith?.includes(me.id)) },
    { key: "team", title: c("Team views", "Ekip görünümleri"), items: views.filter((v) => v.ownerId !== me.id && !v.sharedWith?.includes(me.id)) },
  ];

  const renderItem = (v: ContactView | null) => {
    const on = (v?.id ?? null) === activeId;
    const Icon = v ? audienceIcon[v.audience] : null;
    return (
      <li key={v?.id ?? "all"}>
        <button
          type="button"
          aria-current={on ? "true" : undefined}
          onClick={() => onSelect(v?.id ?? null)}
          className={cn(
            "focus-ring group relative flex w-full items-center gap-2.5 rounded-ui-sm px-2.5 py-1.5 text-start text-[13px] transition-colors",
            on ? "bg-selected font-medium text-fg" : "text-fg-muted hover:bg-hover hover:text-fg",
          )}
        >
          {on ? <span aria-hidden className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-accent" /> : null}
          <span className="min-w-0 flex-1 truncate">{v ? t(v.label) : c("All contacts", "Tüm kişiler")}</span>
          {v?.isDefault ? <Star aria-label={c("Default view", "Varsayılan görünüm")} className="size-3 shrink-0 fill-current text-fg-subtle" /> : null}
          {Icon ? <Icon aria-hidden className="size-3 shrink-0 text-fg-subtle" /> : null}
          <span className="tabular min-w-6 text-end text-[12px] text-fg-subtle">{f.number(count(v))}</span>
        </button>
        {on && dirty ? (
          <div className="ui-fade mt-1 mb-1.5 ms-2.5 grid gap-1.5 rounded-ui-sm border border-dashed border-line px-2.5 py-2">
            <p className="text-[12px] text-fg-muted">{c("Unsaved changes", "Kaydedilmemiş değişiklikler")}</p>
            <div className="flex flex-wrap gap-1.5">
              {canEdit ? (
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => {
                    setViews((all) => all.map((x) => (x.id === active!.id ? { ...x, state: current } : x)));
                    toast.success(c(`“${t(active!.label)}” saved`, `“${t(active!.label)}” kaydedildi`));
                  }}
                >
                  {c("Save", "Kaydet")}
                </Button>
              ) : null}
              <Button size="xs" variant={canEdit ? "secondary" : "primary"} onClick={() => setSaving(true)}>
                {c("Save as new", "Yeni olarak kaydet")}
              </Button>
              <IconButton size="xs" variant="ghost" label={c("Discard changes", "Değişiklikleri at")} onClick={onReset}>
                <RotateCcw />
              </IconButton>
            </div>
          </div>
        ) : null}
      </li>
    );
  };

  return (
    <nav aria-label={c("Saved views", "Kayıtlı görünümler")} className={cn("grid content-start gap-5 self-start lg:sticky lg:top-[calc(var(--topbar-h,3.5rem)+1rem)]", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-medium tracking-[0.08em] text-fg-subtle uppercase">{c("Views", "Görünümler")}</h2>
        <IconButton size="xs" variant="ghost" label={c("Save current view", "Bu görünümü kaydet")} onClick={() => setSaving(true)}>
          <Plus />
        </IconButton>
      </div>
      <ul className="-mt-3 grid gap-0.5">
        {renderItem(null)}
      </ul>
      {sections.map((s) =>
        s.items.length ? (
          <div key={s.key} className="grid gap-1.5">
            <h3 className="px-2.5 text-[11.5px] font-medium text-fg-subtle">{s.title}</h3>
            <ul className="grid gap-0.5">
              {s.items.map((v) => renderItem(v))}
            </ul>
          </div>
        ) : null,
      )}
      <SaveViewDialog
        open={saving}
        onOpenChange={setSaving}
        suggested={active ? c(`${t(active.label)} (copy)`, `${t(active.label)} (kopya)`) : ""}
        onSave={(name, audience) => {
          const id = `v-${Date.now().toString(36)}`;
          setViews((all) => [
            ...all,
            { id, name, label: { en: name, tr: name }, description: { en: "Saved from the current filters.", tr: "Mevcut filtrelerden kaydedildi." }, scope: audience === "private" ? "personal" : "team", audience, ownerId: me.id, state: current },
          ]);
          onSelect(id);
          toast.success(c(`View “${name}” saved`, `“${name}” görünümü kaydedildi`));
        }}
      />
    </nav>
  );
}

function SaveViewDialog({ open, onOpenChange, suggested, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; suggested: string; onSave: (name: string, audience: Audience) => void }) {
  const { c, t } = useBlockFormat();
  const [name, setName] = React.useState("");
  const [audience, setAudience] = React.useState<Audience>("private");
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      setName(suggested);
      setTried(false);
    }
  }, [open, suggested]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader title={c("Save view", "Görünümü kaydet")} description={c("Keeps the current filters, sort and columns.", "Mevcut filtreleri, sıralamayı ve sütunları saklar.")} />
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (!name.trim()) return;
            onSave(name.trim(), audience);
            onOpenChange(false);
          }}
        >
          <DialogBody className="grid gap-4">
            <Field label={c("Name", "Ad")} required error={tried && !name.trim() ? c("Give the view a name.", "Görünüme bir ad verin.") : undefined}>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={c("e.g. Inbound this week", "ör. Bu haftaki gelenler")} data-autofocus />
            </Field>
            <Field label={c("Who can open it", "Kimler açabilir")}>
              <RadioGroup value={audience} onValueChange={(v) => setAudience(v as Audience)} items={(Object.keys(audienceLabels) as Audience[]).map((k) => ({ value: k, label: t(audienceLabels[k]) }))} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" onClick={() => onOpenChange(false)}>
              {c("Cancel", "Vazgeç")}
            </Button>
            <Button type="submit" variant="primary">
              {c("Save view", "Görünümü kaydet")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Title strip above the table: the active view, who made it and who can see it. */
export function ViewHeader({ view, actions }: { view: ContactView | null; actions?: React.ReactNode }) {
  const { c, t } = useBlockFormat();
  const { total } = useDataTable<CrmContact>();
  const audience = useAudience();
  const a = view ? audience(view) : null;
  const owner = view ? person(view.ownerId) : null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-(--cell-px) py-3.5">
      <div className="grid min-w-0 flex-1 gap-0.5">
        <h2 className="flex flex-wrap items-center gap-2 font-display text-[17px] leading-tight text-fg">
          {view ? t(view.label) : c("All contacts", "Tüm kişiler")}
          <Badge tone="outline" size="sm" className="tabular">
            {total}
          </Badge>
          {view?.system ? (
            <Badge size="sm" tone="neutral">
              {c("Built in", "Yerleşik")}
            </Badge>
          ) : null}
        </h2>
        <p className="line-clamp-2 text-[12.5px] text-fg-muted">
          {view ? t(view.description) : c("Every contact in the workspace, no filters.", "Çalışma alanındaki tüm kişiler, filtresiz.")}
        </p>
      </div>
      {view && owner && a ? (
        <div className="flex items-center gap-2.5 text-[12px] text-fg-muted">
          {a.ids.length ? (
            <AvatarGroup size="xs" max={4} aria-hidden>
              {a.ids.map((id) => (
                <Avatar key={id} name={person(id).name} size="xs" />
              ))}
            </AvatarGroup>
          ) : (
            <Eye aria-hidden className="size-3.5" />
          )}
          <span className="grid leading-tight">
            <span>{a.text}</span>
            <span className="text-fg-subtle">{owner.id === me.id ? c("Made by you", "Sizin oluşturduğunuz") : c(`By ${owner.name}`, `${owner.name} oluşturdu`)}</span>
          </span>
        </div>
      ) : null}
      {actions}
    </div>
  );
}
