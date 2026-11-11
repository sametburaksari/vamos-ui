"use client";

import * as React from "react";
import { Badge, cn, Select, ThemeScope, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Monitor, Moon, Smartphone, Sun, Tablet } from "lucide-react";
import { ACCENTS, accentNames, DEVICE_HEIGHT, DEVICE_WIDTH, fill, FONTS, fontNames, type Device, type PreviewAccent, type PreviewFont, type Template } from "./content";
import { useShop } from "./shop-provider";
import { TemplateScreen } from "./template-screens";

const copy = {
  page: { en: "Page", tr: "Sayfa" },
  device: { en: "Device", tr: "Cihaz" },
  desktop: { en: "Desktop, 1280 px", tr: "Masaüstü, 1280 px" },
  tablet: { en: "Tablet, 820 px", tr: "Tablet, 820 px" },
  mobile: { en: "Phone, 390 px", tr: "Telefon, 390 px" },
  mode: { en: "Colour mode", tr: "Renk modu" },
  light: { en: "Light", tr: "Açık" },
  dark: { en: "Dark", tr: "Koyu" },
  accent: { en: "Accent", tr: "Vurgu" },
  font: { en: "Type pairing", tr: "Yazı tipi eşleşmesi" },
  live: { en: "Live", tr: "Canlı" },
  region: { en: "Live preview of {name}: {page}, {device}, {mode}, {accent} accent. Scroll inside to see the whole page.", tr: "{name} canlı önizlemesi: {page}, {device}, {mode}, {accent} vurgu. Sayfanın tamamı için içeride kaydırın." },
  hint: { en: "This is the template running, not a screenshot. Change anything — the code does the same.", tr: "Bu bir ekran görüntüsü değil, çalışan şablonun kendisi. Neyi değiştirirseniz kod da aynısını yapar." },
};

export interface PreviewState {
  page: string;
  device: Device;
  dark: boolean;
  accent: PreviewAccent;
  font: PreviewFont;
}

export const initialPreview = (tpl: Template): PreviewState => ({ page: tpl.pages[0]!.id, device: "desktop", dark: !!tpl.dark, accent: tpl.accent, font: tpl.font });

/** Width of an element, live. */
function useWidth<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/**
 * The signature: a template rendered live at a simulated device width and scaled to fit, inside
 * its own theme scope. Page, device, colour mode, accent and type pairing all switch the real
 * components; inside, the page scrolls. `variant="thumb"` is the same render, frozen, for cards.
 */
export function LivePreview({
  template,
  state,
  onStateChange,
  variant = "full",
  maxHeight,
  className,
}: {
  template: Template;
  state: PreviewState;
  onStateChange?: (next: PreviewState) => void;
  variant?: "full" | "thumb";
  /** Cap for the scaled frame height (px). */
  maxHeight?: number;
  className?: string;
}) {
  const { c } = useShop();
  const { t, f } = c;
  const [ref, width] = useWidth<HTMLDivElement>();
  const deviceW = DEVICE_WIDTH[state.device];
  const deviceH = variant === "thumb" ? 760 : DEVICE_HEIGHT[state.device];
  const scale = width ? Math.min(1, width / deviceW) : 0;
  const frameH = Math.min(deviceH * (scale || 1), maxHeight ?? Infinity);
  const set = (patch: Partial<PreviewState>) => onStateChange?.({ ...state, ...patch });
  const pageMeta = template.pages.find((p) => p.id === state.page) ?? template.pages[0]!;
  const fmt = React.useMemo(() => ({ money: (v: number) => f.currency(v, "USD", { maximumFractionDigits: 0 }), num: (v: number) => f.number(v) }), [f]);

  // Mode and accent sit on an inner element: a `.light` / `.dark` element below the solid scope
  // gets the right surface and accent-ink values whatever the page around it uses.
  const screen = (
    <ThemeScope font={state.font} material="solid" density="comfortable" portal={false} className="flex min-h-full flex-1 flex-col">
      <div className={cn(state.dark ? "dark" : "light", "@container flex flex-1 flex-col bg-scene font-sans text-fg *:flex-1")} data-accent={state.accent}>
        <TemplateScreen template={template} page={pageMeta.id} t={t} fmt={fmt} />
      </div>
    </ThemeScope>
  );

  if (variant === "thumb") {
    return (
      <div ref={ref} aria-hidden className={cn("relative overflow-hidden bg-surface-2", className)} style={{ height: scale ? deviceH * scale * 0.62 : undefined, aspectRatio: scale ? undefined : "16 / 10" }}>
        {scale ? (
          <div inert className="pointer-events-none absolute start-0 top-0 flex origin-top-left flex-col" style={{ width: deviceW, height: deviceH, transform: `scale(${scale})` }}>
            {screen}
          </div>
        ) : null}
      </div>
    );
  }

  const deviceLabel = { desktop: t(copy.desktop), tablet: t(copy.tablet), mobile: t(copy.mobile) }[state.device];
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      {onStateChange ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <ToggleGroup type="single" size="sm" value={state.page} onValueChange={(v) => v && set({ page: v })} aria-label={t(copy.page)}>
            {template.pages.map((p) => (
              <ToggleGroupItem key={p.id} value={p.id}>
                {t(p.label)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup type="single" size="sm" value={state.device} onValueChange={(v) => v && set({ device: v as Device })} aria-label={t(copy.device)}>
            <ToggleGroupItem value="desktop" label={t(copy.desktop)}>
              <Monitor aria-hidden />
            </ToggleGroupItem>
            <ToggleGroupItem value="tablet" label={t(copy.tablet)}>
              <Tablet aria-hidden />
            </ToggleGroupItem>
            <ToggleGroupItem value="mobile" label={t(copy.mobile)}>
              <Smartphone aria-hidden />
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" size="sm" value={state.dark ? "dark" : "light"} onValueChange={(v) => v && set({ dark: v === "dark" })} aria-label={t(copy.mode)}>
            <ToggleGroupItem value="light" label={t(copy.light)}>
              <Sun aria-hidden />
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" label={t(copy.dark)}>
              <Moon aria-hidden />
            </ToggleGroupItem>
          </ToggleGroup>
          <AccentPicker value={state.accent} onChange={(accent) => set({ accent })} label={t(copy.accent)} />
          <Select<PreviewFont>
            size="sm"
            value={state.font}
            onValueChange={(v) => v && set({ font: v })}
            aria-label={t(copy.font)}
            items={FONTS.map((x) => ({ value: x, label: t(fontNames[x]) }))}
            className="w-52"
          />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-ui-lg border border-line bg-surface shadow-[0_1px_0_var(--color-line),0_24px_48px_-28px_color-mix(in_oklch,var(--color-fg)_35%,transparent)]">
        <div className="flex items-center gap-3 border-b border-line px-3 py-2">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-line" />
            <span className="size-2.5 rounded-full bg-line" />
            <span className="size-2.5 rounded-full bg-line" />
          </span>
          <span className="tabular min-w-0 flex-1 truncate rounded-ui-sm bg-surface-2 px-3 py-1 font-mono text-[11.5px] text-fg-muted">
            {template.domain}
            <span className="text-fg">{pageMeta.path === "/" ? "" : pageMeta.path}</span>
          </span>
          <Badge tone="accent" size="sm" className="shrink-0">
            <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
            {t(copy.live)}
          </Badge>
        </div>
        <div ref={ref} className="relative bg-surface-2 [background-image:radial-gradient(var(--color-line)_1px,transparent_1px)] [background-size:16px_16px]" style={{ height: scale ? frameH : 420 }}>
          {scale ? (
            <div className="mx-auto origin-top" style={{ width: deviceW * scale, height: frameH }}>
              <div
                role="region"
                tabIndex={0}
                aria-label={fill(t(copy.region), { name: template.name, page: t(pageMeta.label), device: deviceLabel, mode: state.dark ? t(copy.dark) : t(copy.light), accent: t(accentNames[state.accent]) })}
                className={cn("origin-top-left overflow-y-auto overscroll-contain focus-ring", state.device !== "desktop" && "border-x border-line")}
                style={{ width: deviceW, height: frameH / scale, transform: `scale(${scale})` }}
              >
                <div inert className="flex min-h-full flex-col">
                  {screen}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {onStateChange ? <p className="text-small text-fg-muted">{t(copy.hint)}</p> : null}
    </div>
  );
}

/** Five built-in accents as swatches; each swatch is drawn by its own accent scope. */
function AccentPicker({ value, onChange, label }: { value: PreviewAccent; onChange: (a: PreviewAccent) => void; label: string }) {
  const { c } = useShop();
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-1 rounded-ui border border-line bg-selected p-[3px]">
      {ACCENTS.map((a, i) => (
        <button
          key={a}
          type="button"
          role="radio"
          aria-checked={a === value}
          aria-label={c.t(accentNames[a])}
          title={c.t(accentNames[a])}
          tabIndex={a === value ? 0 : -1}
          onClick={() => onChange(a)}
          onKeyDown={(e) => {
            const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
            if (!d) return;
            e.preventDefault();
            const next = (i + d + ACCENTS.length) % ACCENTS.length;
            onChange(ACCENTS[next]!);
            (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
          }}
          className={cn("grid size-7 place-items-center rounded-[calc(var(--radius)-2px)] focus-ring", a === value ? "bg-surface shadow-sm" : "hover:bg-hover")}
        >
          <ThemeScope accent={a} portal={false} asChild>
            <span aria-hidden className="size-4 rounded-full bg-accent shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--color-fg)_18%,transparent)]" />
          </ThemeScope>
        </button>
      ))}
    </div>
  );
}
