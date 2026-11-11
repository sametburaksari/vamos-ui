"use client";

import * as React from "react";
import { AlignCenter, AlignLeft, ArrowDown, ArrowUp, Copy, Eye, EyeOff, LayoutTemplate, MousePointerClick, PanelBottom, PanelTop, Plus, Quote, ShoppingBag, Sparkles, Trash2, Rows3 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  Field,
  IconButton,
  Input,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { library, libraryHints, typeLabels, type Section, type SectionType } from "./data";

export const typeIcon: Record<SectionType, React.ReactNode> = {
  nav: <PanelTop />,
  hero: <LayoutTemplate />,
  features: <Rows3 />,
  products: <ShoppingBag />,
  quote: <Quote />,
  cta: <MousePointerClick />,
  footer: <PanelBottom />,
};

/* Layers ------------------------------------------------------------------ */

export interface LayersProps {
  sections: Section[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onToggleHidden: (id: string) => void;
  onAdd: () => void;
  className?: string;
}

/** Page outline. Alt+↑ / Alt+↓ move the focused section; header and footer stay pinned. */
export function Layers({ sections, selectedId, onSelect, onMove, onToggleHidden, onAdd, className }: LayersProps) {
  const { t, c } = useBlockFormat();
  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <h2 className="me-auto text-xs font-medium tracking-[0.08em] text-fg-muted uppercase">{c("Layers", "Katmanlar")}</h2>
        <span className="text-xs text-fg-subtle tabular">{sections.length}</span>
      </div>
      <ol className="min-h-0 flex-1 overflow-y-auto px-2 pb-2" aria-label={c("Page sections", "Sayfa bölümleri")}>
        {sections.map((s, i) => {
          const pinned = s.type === "nav" || s.type === "footer";
          const selected = s.id === selectedId;
          return (
            <li key={s.id} className={cn("group/layer flex items-center gap-1 rounded-ui-sm pe-1", selected ? "bg-selected" : "hover:bg-hover")}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                aria-current={selected ? "true" : undefined}
                onKeyDown={(e) => {
                  if (!e.altKey || pinned) return;
                  if (e.key === "ArrowUp") (e.preventDefault(), onMove(s.id, -1));
                  if (e.key === "ArrowDown") (e.preventDefault(), onMove(s.id, 1));
                }}
                aria-keyshortcuts={pinned ? undefined : "Alt+ArrowUp Alt+ArrowDown"}
                className={cn("flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-ui-sm px-2 text-start text-[13px] outline-none focus-ring [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-subtle", s.hidden && "text-fg-subtle")}
              >
                {typeIcon[s.type]}
                <span className="min-w-0 flex-1 truncate">{t(s.name)}</span>
              </button>
              {!pinned && (
                <span className={cn("flex items-center opacity-0 transition-opacity group-hover/layer:opacity-100 group-focus-within/layer:opacity-100", selected && "opacity-100")}>
                  <IconButton label={c("Move up", "Yukarı taşı")} size="xs" variant="ghost" disabled={i <= 1} onClick={() => onMove(s.id, -1)}><ArrowUp /></IconButton>
                  <IconButton label={c("Move down", "Aşağı taşı")} size="xs" variant="ghost" disabled={i >= sections.length - 2} onClick={() => onMove(s.id, 1)}><ArrowDown /></IconButton>
                </span>
              )}
              <IconButton label={s.hidden ? c(`Show ${t(s.name)}`, `${t(s.name)} göster`) : c(`Hide ${t(s.name)}`, `${t(s.name)} gizle`)} size="xs" variant="ghost" className={cn(!s.hidden && "opacity-0 group-hover/layer:opacity-100 focus-visible:opacity-100", selected && "opacity-100")} onClick={() => onToggleHidden(s.id)}>
                {s.hidden ? <EyeOff /> : <Eye />}
              </IconButton>
            </li>
          );
        })}
      </ol>
      <div className="border-t border-line p-3">
        <Button variant="secondary" size="sm" className="w-full" onClick={onAdd}>
          <Plus />
          {c("Add section", "Bölüm ekle")}
        </Button>
      </div>
    </div>
  );
}

/* Inspector --------------------------------------------------------------- */

export interface InspectorProps {
  section: Section | null;
  onChange: (patch: Partial<Section>, opts?: { merge?: boolean }) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  className?: string;
}

/** Settings for the selected section: content and style tabs. Typing edits the canvas live. */
export function Inspector({ section, onChange, onDuplicate, onDelete, className }: InspectorProps) {
  const { t, c, lang } = useBlockFormat();
  if (!section) {
    return (
      <div className={cn("grid place-items-center px-6 text-center text-[13px] text-fg-muted", className)}>
        <p>
          <Sparkles className="mx-auto mb-2 size-5 text-fg-subtle" aria-hidden />
          {c("Select a section on the canvas or in Layers to edit it.", "Düzenlemek için tuvalden veya Katmanlar'dan bir bölüm seçin.")}
        </p>
      </div>
    );
  }
  const pinned = section.type === "nav" || section.type === "footer";
  const text = (field: "heading" | "body" | "button" | "name", value: string) => onChange({ [field]: { ...(section[field] ?? { en: "", tr: "" }), [lang]: value } }, { merge: true });

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-3 [&>svg]:size-4 [&>svg]:text-fg-subtle">
        {typeIcon[section.type]}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">{t(section.name)}</p>
          <p className="text-xs text-fg-muted">{t(typeLabels[section.type])}</p>
        </div>
        {!pinned && (
          <>
            <IconButton label={c("Duplicate", "Çoğalt")} size="xs" variant="ghost" onClick={onDuplicate}><Copy /></IconButton>
            <IconButton label={c("Delete section", "Bölümü sil")} size="xs" variant="ghost" onClick={onDelete}><Trash2 /></IconButton>
          </>
        )}
      </div>
      <Tabs defaultValue="content" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="px-4" variant="underline">
          <TabsTrigger value="content">{c("Content", "İçerik")}</TabsTrigger>
          <TabsTrigger value="style">{c("Style", "Stil")}</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-4 p-4">
            <Field label={c("Layer name", "Katman adı")}>
              <Input size="sm" value={t(section.name)} onChange={(e) => text("name", e.target.value)} />
            </Field>
            <Field label={section.type === "quote" ? c("Quote", "Alıntı") : c("Heading", "Başlık")}>
              <Textarea value={t(section.heading)} onChange={(e) => text("heading", e.target.value)} rows={2} />
            </Field>
            <Field label={section.type === "quote" ? c("Attribution", "Kaynak") : c("Text", "Metin")} hint={section.type === "features" || section.type === "products" || section.type === "nav" ? c("Separate items with “ · ”", "Öğeleri “ · ” ile ayırın") : undefined}>
              <Textarea value={t(section.body)} onChange={(e) => text("body", e.target.value)} rows={3} />
            </Field>
            {section.button && (
              <Field label={c("Button label", "Buton metni")}>
                <Input size="sm" value={t(section.button)} onChange={(e) => text("button", e.target.value)} />
              </Field>
            )}
          </div>
        </TabsContent>
        <TabsContent value="style" className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-5 p-4">
            <div className="grid gap-1.5">
              <span className="text-[13px] font-medium" id="align-l">{c("Alignment", "Hizalama")}</span>
              <ToggleGroup type="single" size="sm" value={section.align} onValueChange={(v) => v && onChange({ align: v as Section["align"] })} aria-labelledby="align-l">
                <ToggleGroupItem value="start"><AlignLeft />{c("Start", "Başa")}</ToggleGroupItem>
                <ToggleGroupItem value="center"><AlignCenter />{c("Centre", "Orta")}</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="grid gap-1.5">
              <span className="text-[13px] font-medium" id="tone-l">{c("Background", "Arka plan")}</span>
              <ToggleGroup type="single" size="sm" value={section.tone} onValueChange={(v) => v && onChange({ tone: v as Section["tone"] })} aria-labelledby="tone-l">
                {(["plain", "inset", "inverse"] as const).map((tone) => (
                  <ToggleGroupItem key={tone} value={tone}>
                    <span aria-hidden className={cn("size-3 rounded-full border border-line", tone === "plain" ? "bg-surface" : tone === "inset" ? "bg-surface-2" : "bg-fg")} />
                    {tone === "plain" ? c("Plain", "Düz") : tone === "inset" ? c("Tinted", "Tonlu") : c("Inverse", "Ters")}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="grid gap-2">
              <span className="flex items-baseline justify-between text-[13px] font-medium" id="space-l">
                {c("Vertical spacing", "Dikey boşluk")}
                <span className="font-mono text-xs font-normal text-fg-muted tabular">{section.space}px</span>
              </span>
              <Slider value={[section.space]} min={16} max={128} step={8} onValueChange={([v]) => onChange({ space: v }, { merge: true })} aria-labelledby="space-l" thumbLabels={[c("Vertical spacing", "Dikey boşluk")]} />
            </div>
            <label className="flex items-center justify-between gap-3 text-[13px] font-medium">
              {c("Visible on the page", "Sayfada görünür")}
              <Switch checked={!section.hidden} onCheckedChange={(v) => onChange({ hidden: !v })} />
            </label>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* Add section ------------------------------------------------------------- */

export function AddSectionDialog({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (s: Omit<Section, "id">) => void }) {
  const { t, c } = useBlockFormat();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader title={c("Add a section", "Bölüm ekle")} description={c("It goes below the selected section.", "Seçili bölümün altına eklenir.")} />
        <DialogBody>
          <ul className="grid gap-2 sm:grid-cols-2">
            {library.map((s) => (
              <li key={s.type}>
                <button
                  type="button"
                  onClick={() => onPick(s)}
                  className="flex w-full items-start gap-3 rounded-ui border border-line bg-surface p-3 text-start outline-none transition-colors hover:border-field-border-hover hover:bg-hover focus-ring [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-fg-muted"
                >
                  {typeIcon[s.type]}
                  <span>
                    <span className="block text-[13.5px] font-medium">{t(typeLabels[s.type])}</span>
                    <span className="block text-xs text-fg-muted">{t(libraryHints[s.type])}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
