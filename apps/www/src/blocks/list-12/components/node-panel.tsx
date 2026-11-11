"use client";

import * as React from "react";
import { ChevronRight, FolderPlus, Trash2 } from "lucide-react";
import { Avatar, Badge, Button, Field, Input, Switch, cn } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { rollup, rollupOpen, slugify, type OrgNode, type TreeKind } from "./tree-data";

interface NodePanelProps {
  kind: TreeKind;
  path: OrgNode[];
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<OrgNode>) => void;
  onAddChild: (parent: OrgNode) => void;
  onDelete: (node: OrgNode) => void;
  className?: string;
}

/** Details for the selected node: where it sits, what it holds, and its editable fields. */
export function NodePanel({ kind, path, onSelect, onChange, onAddChild, onDelete, className }: NodePanelProps) {
  const { c, t, f } = useBlockFormat();
  const node = path[path.length - 1]!;
  const total = rollup(node);
  const kids = node.children ?? [];
  const unit = kind === "catalogue" ? c("products", "ürün") : c("people", "kişi");
  const [name, setName] = React.useState(t(node.name));
  const [slug, setSlug] = React.useState(node.slug);
  React.useEffect(() => {
    setName(t(node.name));
    setSlug(node.slug);
    // Reset the form when another node is selected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id]);

  const commitName = () => {
    const v = name.trim();
    if (!v) return setName(t(node.name));
    if (v !== t(node.name)) onChange(node.id, { name: { en: v, tr: v } });
  };

  return (
    <div className={cn("grid content-start gap-5", className)}>
      <nav aria-label={c("Location in tree", "Ağaçtaki konum")}>
        <ol className="flex flex-wrap items-center gap-1 text-[12px] text-fg-subtle">
          <li>
            <span>{kind === "catalogue" ? c("Catalogue", "Katalog") : c("Company", "Şirket")}</span>
          </li>
          {path.map((p, i) => (
            <li key={p.id} className="flex items-center gap-1">
              <ChevronRight aria-hidden className="size-3 rtl:-scale-x-100" />
              {i === path.length - 1 ? (
                <span aria-current="location" className="text-fg-muted">
                  {t(p.name)}
                </span>
              ) : (
                <button type="button" className="focus-ring rounded-ui-sm hover:text-fg" onClick={() => onSelect(p.id)}>
                  {t(p.name)}
                </button>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-[1.5rem] leading-tight text-fg">{t(node.name)}</h2>
          {node.hidden ? <Badge tone="warning">{kind === "catalogue" ? c("Hidden", "Gizli") : c("Archived", "Arşivde")}</Badge> : null}
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-ui border border-line bg-line">
          <div className="bg-surface px-3 py-2.5">
            <dt className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">{c("Total", "Toplam")}</dt>
            <dd className="tabular mt-0.5 text-[1.25rem] font-medium text-fg">
              <CountUp key={node.id} value={total} duration={700} />
            </dd>
          </div>
          <div className="bg-surface px-3 py-2.5">
            <dt className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">{c("Directly", "Doğrudan")}</dt>
            <dd className="tabular mt-0.5 text-[1.25rem] font-medium text-fg">{f.number(node.own)}</dd>
          </div>
          <div className="bg-surface px-3 py-2.5">
            <dt className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">{kind === "catalogue" ? c("Children", "Alt öğe") : c("Open roles", "Açık rol")}</dt>
            <dd className="tabular mt-0.5 text-[1.25rem] font-medium text-fg">{kind === "catalogue" ? kids.length : rollupOpen(node)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-[12px] text-fg-subtle">
          {c(`${f.number(total)} ${unit} including everything below it.`, `Altındakilerle birlikte ${f.number(total)} ${unit}.`)}
        </p>
      </div>

      {kind === "departments" && node.headId ? (
        <div className="flex items-center gap-3 rounded-ui border border-line px-3 py-2.5">
          <Avatar name={person(node.headId).name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[13px] text-fg">{person(node.headId).name}</p>
            <p className="truncate text-[12px] text-fg-subtle">
              {c("Head of department", "Departman sorumlusu")} · {t(person(node.headId).title)}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4">
        <Field label={c("Name", "Ad")}>
          <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={commitName} onKeyDown={(e) => e.key === "Enter" && commitName()} />
        </Field>
        {kind === "catalogue" ? (
          <Field label={c("URL slug", "URL kısaltması")} hint={`/shop/${[...path.slice(0, -1).map((p) => p.slug), slug].join("/")}`}>
            <Input
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              onBlur={() => slug && slug !== node.slug && onChange(node.id, { slug })}
              className="font-mono"
            />
          </Field>
        ) : null}
        <Switch
          checked={!node.hidden}
          onCheckedChange={(v) => onChange(node.id, { hidden: !v })}
          label={kind === "catalogue" ? c("Visible in the store", "Mağazada görünür") : c("Active department", "Aktif departman")}
          description={
            kind === "catalogue"
              ? c("Hidden categories keep their products but drop out of menus and search.", "Gizli kategoriler ürünlerini korur ama menülerden ve aramadan çıkar.")
              : c("Archived departments stay in reports but take no new hires.", "Arşivlenen departmanlar raporlarda kalır, yeni alım yapılmaz.")
          }
        />
      </div>

      {kids.length ? (
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">{kind === "catalogue" ? c("Subcategories", "Alt kategoriler") : c("Teams", "Ekipler")}</p>
          <ul className="mt-2 grid">
            {kids.map((k) => (
              <li key={k.id}>
                <button type="button" onClick={() => onSelect(k.id)} className="focus-ring flex w-full items-center justify-between gap-2 rounded-ui-sm py-1.5 text-start text-[13px] text-fg-muted hover:text-fg">
                  <span className="truncate">{t(k.name)}</span>
                  <span className="tabular text-fg-subtle">{f.number(rollup(k))}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        <Button size="sm" onClick={() => onAddChild(node)} disabled={path.length >= 3}>
          <FolderPlus /> {kind === "catalogue" ? c("Add subcategory", "Alt kategori ekle") : c("Add team", "Ekip ekle")}
        </Button>
        <Button size="sm" variant="danger-ghost" onClick={() => onDelete(node)} disabled={node.locked}>
          <Trash2 /> {c("Delete", "Sil")}
        </Button>
      </div>
      {path.length >= 3 ? <p className="-mt-3 text-[12px] text-fg-subtle">{c("Three levels is the deepest this tree goes.", "Bu ağaç en fazla üç seviye derinliğe iner.")}</p> : null}
    </div>
  );
}
