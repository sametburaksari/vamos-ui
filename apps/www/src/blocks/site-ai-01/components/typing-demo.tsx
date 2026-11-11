"use client";

import * as React from "react";
import { Check, Copy, CornerDownLeft, Sparkles } from "lucide-react";
import { Badge, Button, Field, Kbd, Tabs, TabsList, TabsTrigger, Textarea, ToggleGroup, ToggleGroupItem, toast, useReducedMotion } from "@vamos-ui/react";
import { copyFor, hedges, scenarios, tones, type SiteLocale, type Tone } from "./content";

type Status = "idle" | "typing" | "done";

const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

function countHedges(text: string, locale: SiteLocale) {
  const lower = text.toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US");
  return hedges[locale].reduce((n, h) => {
    const re = new RegExp(`(^|[^\\p{L}])${h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[^\\p{L}]|$)`, "gu");
    return n + (lower.match(re)?.length ?? 0);
  }, 0);
}

/**
 * The signature of the Quill site: a scripted rewrite. Pick a situation and a tone, press
 * Rewrite (or ⌘/Ctrl + Enter) and the result types itself out, then lists what changed.
 * Word and hedge counts are computed from the real text. No network calls: the rewrites are
 * written in content.ts. Runs once by itself when it first scrolls into view.
 */
export function TypingDemo({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const reduced = useReducedMotion();
  const uid = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);

  const [scenarioId, setScenarioId] = React.useState(scenarios[0]!.id);
  const [tone, setTone] = React.useState<Tone>("plain");
  const [drafts, setDrafts] = React.useState<Record<string, string>>(() => Object.fromEntries(scenarios.map((s) => [s.id, t(s.draft)])));
  const [status, setStatus] = React.useState<Status>("idle");
  const [result, setResult] = React.useState<{ text: string; tone: Tone; scenario: string } | null>(null);
  const [shown, setShown] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const startedAt = React.useRef(0);

  const scenario = scenarios.find((s) => s.id === scenarioId)!;
  const draft = drafts[scenarioId] ?? "";
  const chars = React.useMemo(() => Array.from(result?.text ?? ""), [result]);

  const rewrite = React.useCallback(
    (nextTone: Tone = tone, nextScenario: string = scenarioId) => {
      const s = scenarios.find((x) => x.id === nextScenario)!;
      const text = t(s.out[nextTone]);
      startedAt.current = performance.now();
      setResult({ text, tone: nextTone, scenario: nextScenario });
      if (reduced) {
        setShown(Array.from(text).length);
        setElapsed(0);
        setStatus("done");
      } else {
        setShown(0);
        setStatus("typing");
      }
    },
    [tone, scenarioId, t, reduced],
  );

  // Type the result out, a few characters per tick (faster on spaces, a beat on punctuation).
  React.useEffect(() => {
    if (status !== "typing") return;
    if (shown >= chars.length) {
      setElapsed(performance.now() - startedAt.current);
      setStatus("done");
      return;
    }
    const ch = chars[shown] ?? "";
    const delay = /[.,;:—?!]/.test(ch) ? 90 : ch === " " ? 8 : 16;
    const id = window.setTimeout(() => setShown((n) => Math.min(chars.length, n + (ch === " " ? 1 : 2))), delay);
    return () => window.clearTimeout(id);
  }, [status, shown, chars]);

  // Run once when the demo first comes into view.
  const autoRan = React.useRef(false);
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || autoRan.current) return;
    if (typeof IntersectionObserver === "undefined") {
      autoRan.current = true;
      rewrite();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !autoRan.current) {
          autoRan.current = true;
          window.setTimeout(() => rewrite(), 500);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rewrite]);

  const onScenario = (id: string) => {
    setScenarioId(id);
    setResult(null);
    setStatus("idle");
    setShown(0);
  };
  const onTone = (v: string) => {
    if (!v) return;
    setTone(v as Tone);
    if (result) rewrite(v as Tone);
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      toast.success(t({ en: "Rewrite copied", tr: "Yeniden yazım kopyalandı" }));
    } catch {
      toast.danger(t({ en: "Couldn’t reach the clipboard — select the text instead", tr: "Panoya erişilemedi — metni seçerek kopyalayın" }));
    }
  };

  const done = status === "done" && result;
  const visible = chars.slice(0, shown).join("");
  const before = countWords(draft);
  const after = result ? countWords(result.text) : 0;
  const hedgesBefore = countHedges(draft, locale);
  const hedgesAfter = result ? countHedges(result.text, locale) : 0;
  const notes = result ? scenarios.find((s) => s.id === result.scenario)!.notes[result.tone] : [];
  const draftId = `${uid}-draft`;

  return (
    <div ref={rootRef} className="surface relative overflow-hidden rounded-ui-lg" data-demo-status={status}>
      {/* Situation picker */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line px-4 py-3 sm:px-6">
        <p className="m-0 flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-fg-muted uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {t({ en: "Live demo · scripted, runs in your browser", tr: "Canlı demo · senaryolu, tarayıcınızda çalışır" })}
        </p>
        <Tabs value={scenarioId} onValueChange={onScenario} className="min-w-0 max-w-full">
          <TabsList variant="pill" size="sm" aria-label={t({ en: "Situation", tr: "Durum" })}>
            {scenarios.map((s) => (
              <TabsTrigger key={s.id} value={s.id}>
                {t(s.label)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid lg:grid-cols-2">
        {/* Draft */}
        <div className="flex flex-col gap-5 p-4 sm:p-6 lg:border-e lg:border-line">
          <p className="m-0 font-mono text-xs text-fg-subtle">{t(scenario.to)}</p>
          <Field label={t({ en: "Your draft", tr: "Taslağınız" })} hint={t({ en: "Edit it if you like — the demo’s rewrites are pre-written.", tr: "İsterseniz düzenleyin — demodaki yeniden yazımlar önceden hazırlandı." })}>
            <Textarea
              id={draftId}
              rows={7}
              value={draft}
              onChange={(e) => setDrafts((d) => ({ ...d, [scenarioId]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  rewrite();
                }
              }}
              className="text-[15px] leading-relaxed"
            />
          </Field>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span id={`${uid}-tone`} className="text-xs font-medium text-fg-muted">
                {t({ en: "Tone", tr: "Ton" })}
              </span>
              <ToggleGroup type="single" value={tone} onValueChange={onTone} aria-labelledby={`${uid}-tone`} size="sm">
                {tones.map((x) => (
                  <ToggleGroupItem key={x.id} value={x.id} title={t(x.hint)}>
                    {t(x.label)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <Button variant="primary" size="lg" onClick={() => rewrite()} loading={status === "typing"} loadingText={t({ en: "Rewriting…", tr: "Yazılıyor…" })}>
              <Sparkles aria-hidden />
              {t({ en: "Rewrite", tr: "Yeniden yaz" })}
              <span className="ms-1 hidden items-center gap-0.5 opacity-70 sm:inline-flex" aria-hidden>
                <Kbd size="sm" keyName="mod" />
                <CornerDownLeft className="size-3.5" />
              </span>
            </Button>
          </div>
        </div>

        {/* Rewrite */}
        <div className="flex min-h-[22rem] flex-col gap-5 border-t border-line bg-[color-mix(in_oklch,var(--accent)_5%,transparent)] p-4 sm:p-6 lg:border-t-0">
          <div className="flex items-center justify-between gap-3">
            <p className="m-0 font-mono text-xs text-fg-subtle">{t({ en: "Quill’s rewrite", tr: "Quill’in yazdığı" })}</p>
            {status === "typing" ? (
              <Badge tone="accent">{t({ en: "Writing", tr: "Yazıyor" })}</Badge>
            ) : done ? (
              <Badge tone="success">
                <Check aria-hidden />
                {t({ en: "Done in", tr: "Bitti:" })} {f.number(Math.max(0.4, elapsed / 1000), { maximumFractionDigits: 1, minimumFractionDigits: 1 })} {t({ en: "s", tr: "sn" })}
              </Badge>
            ) : (
              <Badge tone="outline">{t({ en: "Waiting", tr: "Bekliyor" })}</Badge>
            )}
          </div>

          <div aria-busy={status === "typing"} aria-label={t({ en: "Rewritten text", tr: "Yeniden yazılan metin" })} role="region" className="flex-1">
            {result ? (
              <p className="m-0 font-display text-[clamp(1.25rem,1.05rem+0.7cqi,1.6rem)] leading-[1.35] text-fg">
                {visible}
                {status === "typing" ? <span aria-hidden className="ms-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-accent motion-safe:animate-pulse" /> : null}
              </p>
            ) : (
              <p className="m-0 max-w-[36ch] text-fg-muted">
                {t({ en: "Pick a tone and press Rewrite. The new version appears here with a list of what changed.", tr: "Bir ton seçip Yeniden yaz’a basın. Yeni sürüm, nelerin değiştiği listesiyle burada görünür." })}
              </p>
            )}
          </div>

          {done ? (
            <div data-state="open" className="ui-fade flex flex-col gap-4 border-t border-line pt-4">
              <dl className="m-0 grid grid-cols-3 gap-3">
                {[
                  [t({ en: "Words", tr: "Kelime" }), `${f.number(before)} → ${f.number(after)}`],
                  [t({ en: "Hedges", tr: "Kaçamak" }), `${f.number(hedgesBefore)} → ${f.number(hedgesAfter)}`],
                  [t({ en: "Read time", tr: "Okuma" }), `${f.number(Math.max(1, Math.round((after / 238) * 60)))} ${t({ en: "s", tr: "sn" })}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-mono text-[10px] tracking-[0.1em] text-fg-subtle uppercase">{k}</dt>
                    <dd className="m-0 mt-1 text-sm font-semibold text-fg tabular">{v}</dd>
                  </div>
                ))}
              </dl>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {notes.map((n) => (
                  <li key={t(n)} className="flex gap-2 text-sm text-fg-muted">
                    <span aria-hidden className="mt-[0.55em] h-px w-3 shrink-0 bg-accent" />
                    {t(n)}
                  </li>
                ))}
              </ul>
              <div>
                <Button variant="ghost" size="sm" onClick={copy}>
                  <Copy aria-hidden />
                  {t({ en: "Copy rewrite", tr: "Kopyala" })}
                </Button>
              </div>
            </div>
          ) : null}

          <p className="sr-only" aria-live="polite">
            {done ? t({ en: `Rewrite ready: ${after} words, down from ${before}.`, tr: `Yeniden yazım hazır: ${before} kelimeden ${after} kelimeye.` }) : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
