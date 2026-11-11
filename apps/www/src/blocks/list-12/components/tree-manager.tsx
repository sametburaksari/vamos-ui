"use client";

import * as React from "react";
import { ChevronsDownUp, ChevronsUpDown, Lock, Plus, Search } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  Input,
  PageHeader,
  Select,
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  ToggleGroup,
  ToggleGroupItem,
  cn,
  toast,
} from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { SortableTree, moveTreeNode, type SortableTreeDropCheck, type SortableTreeMoveEvent } from "@vamos-ui/react/sortable";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { NodePanel } from "./node-panel";
import { addChild, catalogue, departments, findPath, removeNode, rollup, rollupOpen, slugify, updateNode, walk, type OrgNode, type TreeKind } from "./tree-data";

const MAX_DEPTH = 2; // 0-based: three levels.

function useWide() {
  const [wide, setWide] = React.useState(true);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

function Highlight({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLocaleLowerCase().indexOf(q.toLocaleLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[2px] bg-accent/30 text-fg">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

let seq = 1;

/** Category / department tree: drag (or Alt+arrows) to reorder and nest, counts roll up, edit in the side panel. */
export function TreeManager() {
  const { c, t, f } = useBlockFormat();
  const wide = useWide();
  const [kind, setKind] = React.useState<TreeKind>("catalogue");
  const [trees, setTrees] = React.useState<Record<TreeKind, OrgNode[]>>({ catalogue, departments });
  const [selected, setSelected] = React.useState<Record<TreeKind, string>>({ catalogue: "cat-tableware", departments: "dp-ops" });
  const [expanded, setExpanded] = React.useState<Record<TreeKind, string[]>>({
    catalogue: ["cat-ceramics", "cat-tableware", "cat-kitchen"],
    departments: ["dp-lead", "dp-ops", "dp-product"],
  });
  const [q, setQ] = React.useState("");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [adding, setAdding] = React.useState<{ parentId: string | null } | null>(null);
  const [deleting, setDeleting] = React.useState<OrgNode | null>(null);

  const nodes = trees[kind];
  const setNodes = (fn: (n: OrgNode[]) => OrgNode[]) => setTrees((all) => ({ ...all, [kind]: fn(all[kind]) }));
  const unit = kind === "catalogue" ? c("products", "ürün") : c("people", "kişi");

  // Search expands the ancestors of every match and highlights it, without hiding the structure.
  const matches = React.useMemo(() => {
    const out = new Set<string>();
    if (!q.trim()) return out;
    walk(nodes, (node) => {
      if (t(node.name).toLocaleLowerCase().includes(q.trim().toLocaleLowerCase())) out.add(node.id);
    });
    return out;
  }, [q, nodes, t]);

  const onSearch = (value: string) => {
    setQ(value);
    if (!value.trim()) return;
    const open = new Set(expanded[kind]);
    walk(nodes, (node, path) => {
      if (t(node.name).toLocaleLowerCase().includes(value.trim().toLocaleLowerCase())) path.forEach((p) => open.add(p.id));
    });
    setExpanded((e) => ({ ...e, [kind]: [...open] }));
  };

  const path = findPath(nodes, selected[kind]) ?? [nodes[0]!];
  const select = (id: string) => {
    setSelected((s) => ({ ...s, [kind]: id }));
    const p = findPath(nodes, id);
    if (p) setExpanded((e) => ({ ...e, [kind]: [...new Set([...e[kind], ...p.slice(0, -1).map((x) => x.id)])] }));
  };

  const onSelect = (n: OrgNode) => {
    select(n.id);
    if (!wide) setSheetOpen(true);
  };
  // Focus follows selection on wide screens; the row id is read from the marker inside the row.
  const idFromEvent = (target: EventTarget) => (target as HTMLElement).closest('[role="treeitem"]')?.querySelector<HTMLElement>("[data-node]")?.dataset.node;
  const onTreeFocus = (e: React.FocusEvent) => {
    const id = idFromEvent(e.target);
    if (id && wide) setSelected((s) => ({ ...s, [kind]: id }));
  };

  const onMove = (e: SortableTreeMoveEvent) => {
    const before = nodes;
    const node = findPath(nodes, e.id)!.at(-1)!;
    setNodes((n) => moveTreeNode(n, e.id, e.parentId, e.index));
    const parentName = e.parentId ? t(findPath(before, e.parentId)!.at(-1)!.name) : c("the top level", "en üst seviye");
    toast(c(`${t(node.name)} moved to ${parentName}`, `${t(node.name)} → ${parentName}`), {
      action: { label: c("Undo", "Geri al"), onClick: () => setTrees((all) => ({ ...all, [kind]: before })) },
    });
    // Simulated save round-trip: the tree shows "Saving" until it resolves.
    return new Promise<void>((r) => window.setTimeout(r, 450));
  };

  const canDrop = (check: SortableTreeDropCheck): true | string => {
    if (!check.parentId) return true;
    const parent = findPath(nodes, check.parentId)?.at(-1);
    if (parent?.hidden) return kind === "catalogue" ? c("Hidden categories can't hold others", "Gizli kategoriler başka kategori içeremez") : c("Archived departments can't hold teams", "Arşivdeki departman ekip içeremez");
    return true;
  };

  const onChange = (id: string, patch: Partial<OrgNode>) => {
    setNodes((n) => updateNode(n, id, (x) => ({ ...x, ...patch })));
    toast.success(c("Saved", "Kaydedildi"));
  };

  const confirmDelete = (node: OrgNode) => {
    const before = nodes;
    const p = findPath(nodes, node.id)!;
    const parent = p.at(-2);
    setNodes((n) => removeNode(n, node.id));
    setSelected((s) => ({ ...s, [kind]: parent?.id ?? nodes.find((x) => x.id !== node.id)!.id }));
    setSheetOpen(false);
    toast(c(`${t(node.name)} deleted`, `${t(node.name)} silindi`), {
      description: node.own || node.children?.length ? c(`Its contents moved to ${parent ? t(parent.name) : "the top level"}.`, `İçeriği ${parent ? t(parent.name) : "en üst seviyeye"} taşındı.`) : undefined,
      action: { label: c("Undo", "Geri al"), onClick: () => setTrees((all) => ({ ...all, [kind]: before })) },
    });
  };

  // Header numbers.
  let count = 0;
  let empty = 0;
  let hidden = 0;
  walk(nodes, (node) => {
    count += 1;
    if (rollup(node) === 0) empty += 1;
    if (node.hidden) hidden += 1;
  });
  const total = nodes.reduce((s, n) => s + rollup(n), 0);
  const open = nodes.reduce((s, n) => s + rollupOpen(n), 0);

  const allParents: string[] = [];
  walk(nodes, (node) => node.children?.length && allParents.push(node.id));
  const allOpen = allParents.every((id) => expanded[kind].includes(id));

  const panel = (
    <NodePanel
      kind={kind}
      path={path}
      onSelect={select}
      onChange={onChange}
      onAddChild={(parent) => setAdding({ parentId: parent.id })}
      onDelete={(node) => setDeleting(node)}
    />
  );

  const stats: Array<[string, number, string?]> =
    kind === "catalogue"
      ? [
          [c("Categories", "Kategori"), count],
          [c("Products", "Ürün"), total],
          [c("Empty", "Boş"), empty, empty ? "text-warning" : undefined],
          [c("Hidden", "Gizli"), hidden],
        ]
      : [
          [c("Departments", "Departman"), count],
          [c("People", "Kişi"), total],
          [c("Open roles", "Açık pozisyon"), open],
          [c("Archived", "Arşivde"), hidden],
        ];

  return (
    <div className="mx-auto w-full max-w-[1180px]">
      <PageHeader
        eyebrow={kind === "catalogue" ? c("Store", "Mağaza") : c("People", "İnsan kaynakları")}
        title={kind === "catalogue" ? c("Categories", "Kategoriler") : c("Departments", "Departmanlar")}
        description={c("Drag a row to reorder or nest it. Focus a row and use Alt + arrow keys, or its menu, to move it without a mouse.", "Sıralamak ya da iç içe koymak için satırı sürükleyin. Fare olmadan taşımak için satıra odaklanıp Alt + ok tuşlarını ya da menüsünü kullanın.")}
        actions={
          <Button variant="primary" onClick={() => setAdding({ parentId: null })}>
            <Plus /> {kind === "catalogue" ? c("New category", "Yeni kategori") : c("New department", "Yeni departman")}
          </Button>
        }
      />

      <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 border-y border-line py-4 sm:grid-cols-4">
        {stats.map(([label, value, tone]) => (
          <div key={label}>
            <dt className="text-[12px] text-fg-subtle">{label}</dt>
            <dd className={cn("tabular font-display text-[1.75rem] leading-tight text-fg", tone)}>
              <CountUp key={`${kind}-${label}`} value={value} duration={900} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ToggleGroup
          type="single"
          size="sm"
          value={kind}
          onValueChange={(v) => {
            if (!v) return;
            setKind(v as TreeKind);
            setQ("");
          }}
          aria-label={c("Tree", "Ağaç")}
        >
          <ToggleGroupItem value="catalogue">{c("Catalogue", "Katalog")}</ToggleGroupItem>
          <ToggleGroupItem value="departments">{c("Departments", "Departmanlar")}</ToggleGroupItem>
        </ToggleGroup>
        <div className="relative min-w-0 flex-1 sm:max-w-72">
          <Search aria-hidden className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <Input
            size="sm"
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={kind === "catalogue" ? c("Find a category", "Kategori bul") : c("Find a department", "Departman bul")}
            aria-label={c("Find in tree", "Ağaçta bul")}
            className="ps-8"
          />
        </div>
        {q.trim() ? (
          <span role="status" className="text-[12px] text-fg-subtle">
            {c(`${matches.size} found`, `${matches.size} sonuç`)}
          </span>
        ) : null}
        <Button size="sm" variant="ghost" className="ms-auto" onClick={() => setExpanded((e) => ({ ...e, [kind]: allOpen ? [] : allParents }))}>
          {allOpen ? <ChevronsDownUp /> : <ChevronsUpDown />}
          {allOpen ? c("Collapse all", "Tümünü daralt") : c("Expand all", "Tümünü aç")}
        </Button>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="surface min-w-0 self-start rounded-ui-lg p-1.5">
          <div className="flex items-center justify-between px-3 pb-1.5 pt-1 text-[11px] uppercase tracking-[0.08em] text-fg-subtle">
            <span>{kind === "catalogue" ? c("Category", "Kategori") : c("Department", "Departman")}</span>
            <span>{kind === "catalogue" ? c("Products", "Ürün") : c("People", "Kişi")}</span>
          </div>
          {/* Click / Enter select a row (kit onSelect); on wide screens focus selects too. */}
          <div onFocus={onTreeFocus}>
            <SortableTree
              key={kind}
              aria-label={kind === "catalogue" ? c("Catalogue categories", "Katalog kategorileri") : c("Departments", "Departmanlar")}
              nodes={nodes}
              getLabel={(n) => t(n.name)}
              maxDepth={MAX_DEPTH}
              canDrop={canDrop}
              disabled={(n) => !!n.locked}
              expanded={expanded[kind]}
              onExpandedChange={(ids) => setExpanded((e) => ({ ...e, [kind]: ids }))}
              onMove={onMove}
              selected={selected[kind]}
              onSelect={onSelect}
              indent={22}
              renderItem={(n, state) => {
                const isSel = n.id === selected[kind] && !state.overlay;
                const total = rollup(n);
                return (
                  <>
                    {isSel ? <span aria-hidden className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-accent" /> : null}
                    <span data-node={n.id} className={cn("min-w-0 truncate", isSel ? "font-medium text-fg" : "text-fg-muted", n.hidden && "text-fg-subtle")}>
                      <Highlight text={t(n.name)} q={matches.has(n.id) ? q.trim() : ""} />
                    </span>
                    {n.locked ? <Lock aria-label={c("Locked", "Kilitli")} className="size-3 shrink-0 text-fg-subtle" /> : null}
                    {n.hidden ? (
                      <Badge tone="outline" size="sm" className="shrink-0">
                        {kind === "catalogue" ? c("Hidden", "Gizli") : c("Archived", "Arşivde")}
                      </Badge>
                    ) : null}
                    {kind === "departments" && n.openRoles ? (
                      <Badge tone="accent" size="sm" className="shrink-0 max-sm:hidden">
                        {c(`${n.openRoles} open`, `${n.openRoles} açık`)}
                      </Badge>
                    ) : null}
                    <span className="ms-auto flex shrink-0 items-center gap-2">
                      {kind === "departments" && n.headId ? <Avatar name={person(n.headId).name} size="xs" className="max-sm:hidden" /> : null}
                      {total === 0 ? (
                        <span className="text-[12px] text-warning">{c("Empty", "Boş")}</span>
                      ) : (
                        <span className="tabular min-w-8 text-end text-[12px] text-fg-subtle" aria-label={`${f.number(total)} ${unit}`}>
                          {n.children?.length && !state.expanded ? <span className="text-fg-muted">{f.number(total)}</span> : f.number(total)}
                        </span>
                      )}
                    </span>
                  </>
                );
              }}
            />
          </div>
        </div>

        {wide ? (
          <aside aria-label={c("Selected item", "Seçili öğe")} className="surface rounded-ui-lg p-5 lg:sticky lg:top-[4.75rem] lg:self-start">
            {panel}
          </aside>
        ) : null}
      </div>

      {!wide ? (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom">
            <SheetHeader title={kind === "catalogue" ? c("Category details", "Kategori ayrıntıları") : c("Department details", "Departman ayrıntıları")} />
            <SheetBody>{panel}</SheetBody>
          </SheetContent>
        </Sheet>
      ) : null}

      <AddNodeDialog
        kind={kind}
        nodes={nodes}
        state={adding}
        onClose={() => setAdding(null)}
        onAdd={(parentId, name) => {
          const id = `new-${seq++}`;
          setNodes((n) => addChild(n, parentId, { id, name: { en: name, tr: name }, slug: slugify(name), own: 0, ...(kind === "departments" ? { headId: undefined } : {}) }));
          if (parentId) setExpanded((e) => ({ ...e, [kind]: [...new Set([...e[kind], parentId])] }));
          setSelected((s) => ({ ...s, [kind]: id }));
          setAdding(null);
          toast.success(c(`${name} added`, `${name} eklendi`));
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        tone="danger"
        title={deleting ? c(`Delete ${t(deleting.name)}?`, `${t(deleting.name)} silinsin mi?`) : ""}
        description={
          deleting
            ? deleting.own || deleting.children?.length
              ? c(
                  `Its ${f.number(deleting.own)} ${unit} and ${deleting.children?.length ?? 0} sub-items move up one level. Nothing is deleted with it.`,
                  `${f.number(deleting.own)} ${unit} ve ${deleting.children?.length ?? 0} alt öğe bir üst seviyeye taşınır. Hiçbiri silinmez.`,
                )
              : c("It's empty, so nothing else changes.", "Boş olduğu için başka bir şey değişmez.")
            : undefined
        }
        confirmLabel={c("Delete", "Sil")}
        cancelLabel={c("Cancel", "Vazgeç")}
        onResult={(ok: boolean) => {
          if (ok && deleting) confirmDelete(deleting);
          setDeleting(null);
        }}
      />
    </div>
  );
}

function AddNodeDialog({
  kind,
  nodes,
  state,
  onClose,
  onAdd,
}: {
  kind: TreeKind;
  nodes: OrgNode[];
  state: { parentId: string | null } | null;
  onClose: () => void;
  onAdd: (parentId: string | null, name: string) => void;
}) {
  const { c, t } = useBlockFormat();
  const [name, setName] = React.useState("");
  const [parent, setParent] = React.useState<string>("__root");
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (state) {
      setName("");
      setParent(state.parentId ?? "__root");
      setTried(false);
    }
  }, [state]);

  const options = [{ value: "__root", label: c("Top level", "En üst seviye") }];
  walk(nodes, (node, path) => {
    if (path.length < MAX_DEPTH) options.push({ value: node.id, label: `${"— ".repeat(path.length)}${t(node.name)}` });
  });
  const error = tried && !name.trim() ? c("Give it a name", "Bir ad verin") : undefined;

  return (
    <Dialog open={!!state} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="sm">
        <DialogHeader title={kind === "catalogue" ? c("New category", "Yeni kategori") : c("New department", "Yeni departman")} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (name.trim()) onAdd(parent === "__root" ? null : parent, name.trim());
          }}
        >
          <DialogBody className="grid gap-4">
            <Field label={c("Name", "Ad")} error={error} required>
              <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder={kind === "catalogue" ? c("e.g. Serving trays", "ör. Servis tepsileri") : c("e.g. Partnerships", "ör. İş ortaklıkları")} />
            </Field>
            <Field label={c("Inside", "Üst öğe")}>
              <Select value={parent} onValueChange={(v) => setParent(v ?? "__root")} items={options} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" onClick={onClose}>
              {c("Cancel", "Vazgeç")}
            </Button>
            <Button type="submit" variant="primary">
              {c("Add", "Ekle")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
