"use client";

import * as React from "react";
import { ChevronLeft, Layers as LayersIcon, Monitor, Plus, Redo2, SlidersHorizontal, Smartphone, Tablet, Undo2 } from "lucide-react";
import {
  Badge,
  Button,
  DialogTitle,
  IconButton,
  SaveStatus,
  Sheet,
  SheetContent,
  ToggleGroup,
  ToggleGroupItem,
  cn,
  toast,
  type SaveState,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { NOW_MS } from "../../_shared/time";
import { Canvas, type Device } from "./canvas";
import { initialSections, type Section } from "./data";
import { AddSectionDialog, Inspector, Layers } from "./panels";

interface History {
  past: Section[][];
  present: Section[];
  future: Section[][];
}

/**
 * Page builder shell: layers on the left, the live canvas in the middle, the inspector on the
 * right. Below 1280px the layers move into a sheet, below 1024px the inspector does too, and
 * phones get a bottom toolbar. Undo / redo with ⌘Z / ⇧⌘Z; edits autosave.
 */
export function PageBuilder() {
  const { t, c } = useBlockFormat();
  const [h, setH] = React.useState<History>({ past: [], present: initialSections, future: [] });
  const [selectedId, setSelectedId] = React.useState<string | null>("s-hero");
  const [device, setDevice] = React.useState<Device>("desktop");
  const [save, setSave] = React.useState<{ state: SaveState; at: number; fixed: boolean }>({ state: "saved", at: NOW_MS - 4 * 60_000, fixed: true });
  const [published, setPublished] = React.useState(true);
  const [sheet, setSheet] = React.useState<null | "layers" | "inspector">(null);
  const [adding, setAdding] = React.useState(false);
  const mergeKey = React.useRef<string | null>(null);
  const saveTimer = React.useRef<number | undefined>(undefined);

  const sections = h.present;
  const selected = sections.find((s) => s.id === selectedId) ?? null;

  const commit = (next: Section[], key: string | null = null) => {
    // Decide before queueing: React may run the updater later, after mergeKey has moved on.
    const merge = key !== null && key === mergeKey.current;
    mergeKey.current = key;
    setH((cur) => ({ past: merge ? cur.past : [...cur.past, cur.present].slice(-50), present: next, future: [] }));
    setPublished(false);
    setSave((s) => ({ ...s, state: "dirty" }));
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setSave((s) => ({ ...s, state: "saving" }));
      window.setTimeout(() => setSave({ state: "saved", at: Date.now(), fixed: false }), 700);
    }, 900);
  };

  const undo = React.useCallback(() => {
    mergeKey.current = null;
    setH((cur) => (cur.past.length ? { past: cur.past.slice(0, -1), present: cur.past.at(-1)!, future: [cur.present, ...cur.future] } : cur));
  }, []);
  const redo = React.useCallback(() => {
    mergeKey.current = null;
    setH((cur) => (cur.future.length ? { past: [...cur.past, cur.present], present: cur.future[0]!, future: cur.future.slice(1) } : cur));
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea")) return; // let fields keep their own undo
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  React.useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  const patch = (id: string, p: Partial<Section>, merge = false) => commit(sections.map((s) => (s.id === id ? { ...s, ...p } : s)), merge ? `${id}:${Object.keys(p).join(",")}` : null);

  const move = (id: string, dir: -1 | 1) => {
    const i = sections.findIndex((s) => s.id === id);
    const j = i + dir;
    if (j < 1 || j > sections.length - 2) return; // header and footer stay put
    const next = [...sections];
    [next[i], next[j]] = [next[j]!, next[i]!];
    commit(next);
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-section="${id}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  };

  const insert = (s: Omit<Section, "id">) => {
    const id = `s-${s.type}-${Date.now().toString(36)}`;
    // Below the selected section, or above the footer when nothing is selected.
    const sel = sections.findIndex((x) => x.id === selectedId);
    const at = sel < 0 ? sections.length - 1 : Math.min(Math.max(1, sel + 1), sections.length - 1);
    const next = [...sections];
    next.splice(at, 0, { ...s, id });
    commit(next);
    setSelectedId(id);
    setAdding(false);
    toast(c(`${t(s.name)} added`, `${t(s.name)} eklendi`), { action: { label: c("Undo", "Geri al"), onClick: undo } });
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-section="${id}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" }));
  };

  const remove = () => {
    if (!selected) return;
    const i = sections.findIndex((s) => s.id === selected.id);
    commit(sections.filter((s) => s.id !== selected.id));
    setSelectedId(sections[i - 1]?.id ?? null);
    toast(c(`${t(selected.name)} deleted`, `${t(selected.name)} silindi`), { action: { label: c("Undo", "Geri al"), onClick: undo } });
  };

  const duplicate = () => {
    if (!selected) return;
    const i = sections.findIndex((s) => s.id === selected.id);
    const copy = { ...selected, id: `${selected.id}-copy-${Date.now().toString(36)}`, name: { en: `${selected.name.en} copy`, tr: `${selected.name.tr} kopya` } };
    const next = [...sections];
    next.splice(i + 1, 0, copy);
    commit(next);
    setSelectedId(copy.id);
  };

  const publish = () =>
    toast.promise(new Promise((r) => window.setTimeout(r, 1100)), {
      loading: c("Publishing Home…", "Ana sayfa yayınlanıyor…"),
      success: () => {
        setPublished(true);
        return c("Home is live", "Ana sayfa yayında");
      },
      error: c("Couldn't publish", "Yayınlanamadı"),
    });

  const select = (id: string) => setSelectedId(id || null);

  const layers = (
    <Layers
      sections={sections}
      selectedId={selectedId}
      onSelect={(id) => { select(id); setSheet(null); document.querySelector<HTMLElement>(`[data-section="${id}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }}
      onMove={move}
      onToggleHidden={(id) => patch(id, { hidden: !sections.find((s) => s.id === id)?.hidden })}
      onAdd={() => { setSheet(null); setAdding(true); }}
      className="h-full"
    />
  );
  const inspector = <Inspector section={selected} onChange={(p, o) => selected && patch(selected.id, p, o?.merge)} onDuplicate={duplicate} onDelete={remove} className="h-full" />;

  const deviceSwitch = (
    <ToggleGroup type="single" size="xs" value={device} onValueChange={(v) => v && setDevice(v as Device)} aria-label={c("Preview width", "Önizleme genişliği")}>
      <ToggleGroupItem value="desktop" label={c("Desktop", "Masaüstü")}><Monitor /></ToggleGroupItem>
      <ToggleGroupItem value="tablet" label={c("Tablet", "Tablet")}><Tablet /></ToggleGroupItem>
      <ToggleGroupItem value="mobile" label={c("Phone", "Telefon")}><Smartphone /></ToggleGroupItem>
    </ToggleGroup>
  );

  return (
    <div className="relative z-10 flex h-dvh flex-col">
      <header className="flex h-13 shrink-0 items-center gap-2 border-b border-line bg-bar px-2 backdrop-blur md:gap-3 md:px-3">
        <Button variant="ghost" size="sm" className="max-md:px-2">
          <ChevronLeft className="rtl:rotate-180" />
          <span className="max-md:sr-only">{c("Pages", "Sayfalar")}</span>
        </Button>
        <span className="h-5 w-px bg-line max-md:hidden" aria-hidden />
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate text-[13.5px] font-semibold">
            {c("Home", "Ana sayfa")}
            <Badge tone={published ? "success" : "warning"} dot className="max-sm:hidden">
              {published ? c("Live", "Yayında") : c("Unpublished changes", "Yayınlanmamış değişiklik")}
            </Badge>
          </p>
          <p className="truncate font-mono text-[11px] text-fg-muted max-sm:hidden">kilnlinen.example.com/</p>
        </div>
        <div className="mx-auto hidden md:block">{deviceSwitch}</div>
        <div className="ms-auto flex items-center gap-1 md:ms-0">
          <SaveStatus className="me-2 max-lg:hidden" state={save.state} at={save.at} now={save.fixed ? NOW_MS : undefined} />
          <IconButton label={c("Undo", "Geri al")} shortcut="mod+z" size="sm" variant="ghost" disabled={!h.past.length} onClick={undo}><Undo2 /></IconButton>
          <IconButton label={c("Redo", "Yinele")} shortcut="mod+shift+z" size="sm" variant="ghost" disabled={!h.future.length} onClick={redo}><Redo2 /></IconButton>
          <IconButton label={c("Layers", "Katmanlar")} size="sm" variant="ghost" className="max-md:hidden xl:hidden" onClick={() => setSheet("layers")}><LayersIcon /></IconButton>
          <Button size="sm" variant="secondary" className="ms-1 max-sm:hidden" onClick={() => toast(c("Preview opens in a new tab", "Önizleme yeni sekmede açılır"))}>{c("Preview", "Önizle")}</Button>
          <Button size="sm" variant="primary" className="ms-1" disabled={published} onClick={publish}>{c("Publish", "Yayınla")}</Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[248px_minmax(0,1fr)_300px]">
        <aside aria-label={c("Layers", "Katmanlar")} className="hidden min-h-0 border-e border-line bg-surface xl:block">{layers}</aside>
        <main className="flex min-h-0 min-w-0 flex-col" aria-label={c("Canvas", "Tuval")}>
          <Canvas sections={sections} selectedId={selectedId} onSelect={select} device={device} />
        </main>
        <aside aria-label={c("Inspector", "Denetçi")} className="hidden min-h-0 border-s border-line bg-surface lg:block">{inspector}</aside>
      </div>

      {/* Phone / tablet toolbar */}
      <nav aria-label={c("Editor tools", "Editör araçları")} className="flex h-14 shrink-0 items-center gap-1 border-t border-line bg-bar px-2 backdrop-blur lg:hidden">
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSheet("layers")}><LayersIcon />{c("Layers", "Katmanlar")}</Button>
        <Button variant="ghost" size="sm" onClick={() => setAdding(true)}><Plus />{c("Add", "Ekle")}</Button>
        <div className="mx-auto md:hidden">{deviceSwitch}</div>
        <Button variant="ghost" size="sm" className="ms-auto md:ms-auto" disabled={!selected} onClick={() => setSheet("inspector")}><SlidersHorizontal />{c("Edit", "Düzenle")}</Button>
      </nav>

      <Sheet open={sheet !== null} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side={sheet === "layers" ? "start" : "end"} size="sm" className={cn("max-w-[88vw] p-0")}>
          <DialogTitle className="sr-only">{sheet === "layers" ? c("Layers", "Katmanlar") : c("Inspector", "Denetçi")}</DialogTitle>
          <div className="h-full pt-8">{sheet === "layers" ? layers : inspector}</div>
        </SheetContent>
      </Sheet>

      <AddSectionDialog open={adding} onOpenChange={setAdding} onPick={insert} />
    </div>
  );
}
