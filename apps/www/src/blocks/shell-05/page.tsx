"use client";

import * as React from "react";
import { ExternalLink, Menu } from "lucide-react";
import { Badge, Button, DialogTitle, IconButton, Sheet, SheetContent, Toaster, toast } from "@vamos-ui/react";
import { NOW_MS } from "../_shared/time";
import { useBlockFormat } from "../_shared/format";
import { assets as initialAssets, folderName, folders, type Asset, type SectionId } from "./data";
import { FlyoutPanel, IconRail, type MediaView } from "./components/rail";
import { MediaLibrary, type KindFilter, type SortKey, type Upload } from "./components/media-library";
import { AssetInspector } from "./components/asset-inspector";
import { products, productPhoto } from "../_shared/products";

const WEEK = 7 * 86_400_000;

function useMedia(query: string) {
  const [match, setMatch] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

const inView = (a: Asset, view: MediaView) => {
  if (view === "all") return true;
  if (view === "recent") return NOW_MS - Date.parse(a.uploadedAt) < WEEK;
  if (view === "missing-alt") return a.kind !== "document" && !a.alt;
  if (view === "unused") return a.usedIn.length === 0;
  const parent = folders.find((f) => f.id === view);
  if (parent?.children) return parent.children.some((ch) => ch.id === a.folder);
  return a.folder === view;
};

/**
 * CMS shell with an icon rail and flyout panels. Each rail icon opens a panel with that
 * section's navigation; pin it to keep it beside the page, or let it float over the page and
 * close on Escape. Shown with the website's media library: folders, smart collections,
 * multi-select with move/delete, uploads and an inspector for alt text.
 */
export default function Shell05() {
  const { c, t } = useBlockFormat();
  const wide = useMedia("(min-width: 1280px)");

  const [section, setSection] = React.useState<SectionId>("media");
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [pinned, setPinned] = React.useState(true);
  const [mobileNav, setMobileNav] = React.useState(false);

  const [list, setList] = React.useState<Asset[]>(initialAssets);
  const [view, setView] = React.useState<MediaView>("all");
  const [query, setQuery] = React.useState("");
  const [kind, setKind] = React.useState<KindFilter>("all");
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [layout, setLayout] = React.useState<"grid" | "list">("grid");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [uploads, setUploads] = React.useState<Upload[]>([]);
  const floatingRef = React.useRef<HTMLDivElement>(null);

  // Narrow screens start with the panel floating and closed, so the library gets the room.
  React.useEffect(() => {
    if (window.innerWidth < 1100) {
      setPinned(false);
      setPanelOpen(false);
    }
  }, []);

  // Floating panel: Escape and outside clicks close it.
  const floating = panelOpen && !pinned;
  React.useEffect(() => {
    if (!floating) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanelOpen(false);
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (floatingRef.current?.contains(el) || el.closest("[aria-controls='shell05-panel']")) return;
      setPanelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [floating]);

  const selectSection = (id: SectionId) => {
    if (id === section) setPanelOpen((o) => !o);
    else {
      setSection(id);
      setPanelOpen(true);
    }
  };

  const changeView = (v: MediaView) => {
    setView(v);
    setSelected(new Set());
    if (!pinned) setPanelOpen(false);
    setMobileNav(false);
  };

  const counts = React.useMemo(() => {
    const out: Record<string, number> = {};
    for (const key of ["all", "recent", "missing-alt", "unused", ...folders.flatMap((f) => [f.id, ...(f.children?.map((x) => x.id) ?? [])])]) {
      out[key] = list.filter((a) => inView(a, key)).length;
    }
    return out;
  }, [list]);

  const inFolder = React.useMemo(() => list.filter((a) => inView(a, view)), [list, view]);
  const shown = React.useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const rows = inFolder.filter((a) => (kind === "all" || a.kind === kind) && (!q || a.name.includes(q) || a.alt.toLocaleLowerCase().includes(q)));
    return [...rows].sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : sort === "size" ? b.size - a.size : Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt)));
  }, [inFolder, query, kind, sort]);

  const title =
    view === "all" ? c("All media", "Tüm medya")
    : view === "recent" ? c("Added this week", "Bu hafta eklenenler")
    : view === "missing-alt" ? c("Missing alt text", "Alt metni eksik")
    : view === "unused" ? c("Not used anywhere", "Hiçbir yerde kullanılmıyor")
    : t(folderName(view) ?? { en: view, tr: view });

  const focused = list.find((a) => a.id === focusedId) ?? null;

  /* Actions --------------------------------------------------------------- */

  const remove = (ids: string[]) => {
    const before = list;
    setList((l) => l.filter((a) => !ids.includes(a.id)));
    setSelected(new Set());
    if (focusedId && ids.includes(focusedId)) setFocusedId(null);
    toast(c(`${ids.length} ${ids.length === 1 ? "file" : "files"} deleted`, `${ids.length} dosya silindi`), {
      action: { label: c("Undo", "Geri al"), onClick: () => setList(before) },
    });
  };

  const move = (ids: string[], folder: string) => {
    setList((l) => l.map((a) => (ids.includes(a.id) ? { ...a, folder } : a)));
    setSelected(new Set());
    toast.success(c(`Moved to ${t(folderName(folder)!)}`, `${t(folderName(folder)!)} klasörüne taşındı`));
  };

  // Optimistic: the library shows the new alt text at once; a failure would put the old one back.
  const saveAlt = async (id: string, alt: string) => {
    const prev = list.find((a) => a.id === id)?.alt ?? "";
    setList((l) => l.map((a) => (a.id === id ? { ...a, alt } : a)));
    try {
      await new Promise((r) => setTimeout(r, 500));
      toast.success(c("Alt text saved", "Alt metin kaydedildi"));
    } catch {
      setList((l) => l.map((a) => (a.id === id ? { ...a, alt: prev } : a)));
      toast.danger(c("Couldn't save alt text", "Alt metin kaydedilemedi"));
    }
  };

  const upload = () => {
    const stamp = Date.now();
    const target = folders.some((f) => f.id === view && !f.children) || folders.some((f) => f.children?.some((x) => x.id === view)) ? view : "lookbook";
    const batch: Upload[] = [
      { id: `up-${stamp}-1`, name: "aw26-lookbook-hallway.jpg", progress: 0 },
      { id: `up-${stamp}-2`, name: "aw26-lookbook-kitchen-shelf.jpg", progress: 0 },
    ];
    setUploads((u) => [...u, ...batch]);
    let tick = 0;
    const timer = setInterval(() => {
      tick += 1;
      setUploads((u) => u.map((x) => (batch.some((b) => b.id === x.id) ? { ...x, progress: Math.min(100, x.progress + (x.id.endsWith("1") ? 22 : 17)) } : x)));
      if (tick >= 6) {
        clearInterval(timer);
        setUploads((u) => u.filter((x) => !batch.some((b) => b.id === x.id)));
        const photos = [products[10]!, products[8]!];
        setList((l) => [
          ...batch.map<Asset>((b, i) => ({
            id: b.id, name: b.name, kind: "image", folder: target, thumb: productPhoto(photos[i]!, 360), width: 3600, height: 2400,
            size: 2_400_000 + i * 310_000, ext: "jpg", alt: "", uploadedBy: "p-defne", uploadedAt: new Date(NOW_MS).toISOString(), usedIn: [],
          })),
          ...l,
        ]);
        toast.success(c("2 files uploaded", "2 dosya yüklendi"), { description: c("Add alt text before you use them on a page.", "Bir sayfada kullanmadan önce alt metin ekleyin.") });
      }
    }, 380);
  };

  const panel = (extra?: { className?: string; hidePin?: boolean }) => (
    <FlyoutPanel
      section={section}
      pinned={pinned}
      onPinnedChange={(p) => {
        setPinned(p);
        setPanelOpen(true);
      }}
      onClose={() => (extra?.hidePin ? setMobileNav(false) : setPanelOpen(false))}
      view={view}
      onViewChange={changeView}
      counts={counts}
      hidePin={extra?.hidePin}
      className={extra?.className}
    />
  );

  const inspector = focused ? (
    <AssetInspector key={focused.id} asset={focused} onClose={() => setFocusedId(null)} onAltSave={saveAlt} onDelete={(id) => remove([id])} />
  ) : null;

  return (
    <div className="relative z-10 flex h-dvh overflow-hidden">
      <IconRail className="max-md:hidden" section={section} panelOpen={panelOpen} onSelect={selectSection} />
      {panelOpen && pinned ? panel({ className: "max-md:hidden" }) : null}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-4 md:px-8">
          <IconButton size="sm" label={c("Open menu", "Menüyü aç")} className="md:hidden" onClick={() => setMobileNav(true)}>
            <Menu />
          </IconButton>
          <span className="min-w-0 truncate text-[13px] text-fg-muted">
            <span className="font-medium text-fg">Kiln &amp; Linen</span> · {c("Website", "Web sitesi")}
          </span>
          <Badge tone="success" dot className="max-sm:hidden">
            {c("Live", "Yayında")}
          </Badge>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" asChild>
            <a href="https://kilnlinen.example.com" target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden /> <span className="max-sm:sr-only">{c("View site", "Siteyi gör")}</span>
            </a>
          </Button>
        </header>

        {floating ? (
          <div ref={floatingRef} className="absolute inset-y-0 start-0 z-30 flex shadow-2xl max-md:hidden">
            {panel()}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto">
            <MediaLibrary
              title={title}
              assets={shown}
              totalInView={inFolder.length}
              query={query}
              onQueryChange={setQuery}
              kind={kind}
              onKindChange={setKind}
              sort={sort}
              onSortChange={setSort}
              layout={layout}
              onLayoutChange={setLayout}
              selected={selected}
              onSelectedChange={setSelected}
              focusedId={focusedId}
              onOpen={setFocusedId}
              uploads={uploads}
              onUpload={upload}
              onMove={move}
              onDelete={remove}
            />
          </main>
          {wide && inspector ? <aside aria-label={c("File details", "Dosya ayrıntıları")} className="w-[340px] shrink-0 border-s border-line bg-surface">{inspector}</aside> : null}
        </div>
      </div>

      {/* Phones: rail + panel in a sheet. */}
      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="start" size="sm" hideClose className="max-w-[92vw] border-0 p-0">
          <DialogTitle className="sr-only">{c("Navigation", "Gezinme")}</DialogTitle>
          <div className="flex h-full">
            <IconRail section={section} panelOpen onSelect={(id) => setSection(id)} />
            {panel({ className: "min-w-0 flex-1 w-auto", hidePin: true })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Below 1280px the inspector is a sheet. */}
      <Sheet open={!wide && !!focused} onOpenChange={(o) => !o && setFocusedId(null)}>
        <SheetContent side="end" size="sm" hideClose className="p-0">
          <DialogTitle className="sr-only">{focused?.name ?? c("File details", "Dosya ayrıntıları")}</DialogTitle>
          {!wide ? inspector : null}
        </SheetContent>
      </Sheet>

      <Toaster />
    </div>
  );
}
