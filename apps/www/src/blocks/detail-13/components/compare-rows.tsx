"use client";

import * as React from "react";
import { cn } from "@vamos-ui/react";
import type { BlockFormat } from "../../_shared/format";
import { band, competencies, contractLabels, referenceLabels, workModelLabels, type Candidate, type Recommendation } from "./compare-data";

/** One line of the comparison. Numeric rows can be ranked and compared to a baseline. */
export interface CompareRow {
  id: string;
  group: string;
  label: string;
  hint?: string;
  render: (c: Candidate) => React.ReactNode;
  /** Plain value used to decide whether the row differs between candidates. */
  key: (c: Candidate) => string;
  /** Numeric rows: the number, which direction is better and how to print a delta. */
  num?: (c: Candidate) => number;
  better?: "high" | "low";
  delta?: (d: number) => string;
  /** Long text: aligned to the top, smaller type. */
  prose?: boolean;
}

export const overall = (c: Candidate) => Object.values(c.scores).reduce((n, v) => n + v, 0) / Object.values(c.scores).length;

const recWeight: Record<Recommendation, number> = { "strong-yes": 2, yes: 1, no: -1 };

/** Four-step meter for a 1–4 score: filled pips plus the number. */
function Pips({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-2" role="img" aria-label={label}>
      <span className="flex gap-[3px]" aria-hidden>
        {[1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, value - (i - 1)));
          return (
            <span key={i} className="relative h-2.5 w-3.5 overflow-hidden rounded-[2px] bg-track">
              <span className="absolute inset-y-0 start-0 bg-fg" style={{ width: `${fill * 100}%` }} />
            </span>
          );
        })}
      </span>
      <span className="text-[13px] text-fg tabular" aria-hidden>{value.toFixed(1)}</span>
    </span>
  );
}

export function buildRows({ c, t, f }: BlockFormat): CompareRow[] {
  const signed = (d: number, digits = 1) => `${d > 0 ? "+" : d < 0 ? "−" : "±"}${f.number(Math.abs(d), { maximumFractionDigits: digits, minimumFractionDigits: digits })}`;
  const tryMoney = (n: number) => f.currency(n, { currency: "TRY" }, { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  const g = { profile: c("Profile", "Profil"), score: c("Scorecard", "Puan kartı"), assess: c("Assessment", "Değerlendirme"), offer: c("Offer fit", "Teklif uyumu"), notes: c("Interview notes", "Mülakat notları") };

  return [
    { id: "current", group: g.profile, label: c("Current role", "Mevcut rol"), render: (x) => t(x.current), key: (x) => t(x.current) },
    { id: "location", group: g.profile, label: c("Location", "Konum"), render: (x) => `${x.location} · ${t(workModelLabels[x.workModel])}`, key: (x) => `${x.location}${x.workModel}` },
    {
      id: "years",
      group: g.profile,
      label: c("Experience", "Deneyim"),
      render: (x) => c(`${x.years} years`, `${x.years} yıl`),
      key: (x) => String(x.years),
      num: (x) => x.years,
      better: "high",
      delta: (d) => c(`${signed(d, 0)} yrs`, `${signed(d, 0)} yıl`),
    },
    { id: "english", group: g.profile, label: c("English", "İngilizce"), hint: c("Level from the English interview", "İngilizce mülakatındaki seviye"), render: (x) => x.english, key: (x) => x.english },
    { id: "languages", group: g.profile, label: c("Languages", "Diller"), render: (x) => f.list(x.languages), key: (x) => x.languages.join() },
    { id: "source", group: g.profile, label: c("Source", "Kaynak"), render: (x) => t(x.source), key: (x) => t(x.source) },

    ...competencies.map<CompareRow>((k) => ({
      id: `score-${k.key}`,
      group: g.score,
      label: t(k.label),
      render: (x) => <Pips value={x.scores[k.key]!} label={c(`${x.scores[k.key]!.toFixed(1)} out of 4`, `4 üzerinden ${x.scores[k.key]!.toFixed(1)}`)} />,
      key: (x) => x.scores[k.key]!.toFixed(1),
      num: (x) => x.scores[k.key]!,
      better: "high",
      delta: (d) => signed(d),
    })),
    {
      id: "overall",
      group: g.score,
      label: c("Average", "Ortalama"),
      hint: c("Mean of the five competencies", "Beş yetkinliğin ortalaması"),
      render: (x) => <span className="font-display text-[19px] leading-none text-fg tabular">{overall(x).toFixed(2)}</span>,
      key: (x) => overall(x).toFixed(2),
      num: overall,
      better: "high",
      delta: (d) => signed(d, 2),
    },

    {
      id: "takehome",
      group: g.assess,
      label: c("Take-home task", "Ev ödevi"),
      render: (x) => <span className="tabular">{x.takeHome}<span className="text-fg-subtle"> / 100</span></span>,
      key: (x) => String(x.takeHome),
      num: (x) => x.takeHome,
      better: "high",
      delta: (d) => signed(d, 0),
    },
    {
      id: "interviews",
      group: g.assess,
      label: c("Interviews done", "Tamamlanan mülakat"),
      render: (x) => <span className="tabular">{x.interviews} / 4</span>,
      key: (x) => String(x.interviews),
    },
    {
      id: "recs",
      group: g.assess,
      label: c("Recommendations", "Tavsiyeler"),
      render: (x) => (
        <span className="flex flex-wrap gap-1">
          {x.recommendations.map((r, i) => (
            <span
              key={i}
              className={cn(
                "rounded-ui-sm px-1.5 py-0.5 text-[11px] font-medium",
                r === "strong-yes" ? "bg-fg text-scene" : r === "yes" ? "bg-selected text-fg" : "tone-danger tone-soft",
              )}
            >
              {r === "strong-yes" ? c("Strong yes", "Kesin evet") : r === "yes" ? c("Yes", "Evet") : c("No", "Hayır")}
            </span>
          ))}
        </span>
      ),
      key: (x) => x.recommendations.join(),
      num: (x) => x.recommendations.reduce((n, r) => n + recWeight[r], 0) / x.recommendations.length,
      better: "high",
    },

    {
      id: "salary",
      group: g.offer,
      label: c("Salary expectation", "Maaş beklentisi"),
      hint: c(`Band ${tryMoney(band.min)}–${tryMoney(band.max)} gross a month`, `Bant aylık brüt ${tryMoney(band.min)}–${tryMoney(band.max)}`),
      render: (x) => (
        <span className="grid gap-1">
          <span className="tabular">{tryMoney(x.salary)}</span>
          <BandMeter value={x.salary} label={x.salary > band.max ? c("Above band", "Bandın üstünde") : x.salary < band.min ? c("Below band", "Bandın altında") : c("In band", "Bant içinde")} />
        </span>
      ),
      key: (x) => String(x.salary),
      num: (x) => x.salary,
      better: "low",
      delta: (d) => `${d > 0 ? "+" : d < 0 ? "−" : "±"}${tryMoney(Math.abs(d))}`,
    },
    {
      id: "notice",
      group: g.offer,
      label: c("Notice period", "İhbar süresi"),
      render: (x) => c(`${x.noticeWeeks} weeks`, `${x.noticeWeeks} hafta`),
      key: (x) => String(x.noticeWeeks),
      num: (x) => x.noticeWeeks,
      better: "low",
      delta: (d) => c(`${signed(d, 0)} wks`, `${signed(d, 0)} hf`),
    },
    { id: "contract", group: g.offer, label: c("Contract", "Sözleşme türü"), render: (x) => t(contractLabels[x.contract]), key: (x) => x.contract },
    { id: "oncall", group: g.offer, label: c("Joins the on-call rota", "Nöbet listesine katılır"), render: (x) => (x.onCall ? c("Yes", "Evet") : c("Not in year one", "İlk yıl hayır")), key: (x) => String(x.onCall) },
    {
      id: "references",
      group: g.offer,
      label: c("References", "Referanslar"),
      render: (x) => <span className={cn(x.references === "done" ? "text-fg" : "text-fg-muted")}>{t(referenceLabels[x.references])}</span>,
      key: (x) => x.references,
    },

    { id: "strengths", group: g.notes, label: c("Strengths", "Güçlü yanlar"), render: (x) => t(x.strengths), key: (x) => t(x.strengths), prose: true },
    { id: "concerns", group: g.notes, label: c("Concerns", "Çekinceler"), render: (x) => t(x.concerns), key: (x) => t(x.concerns), prose: true },
  ];
}

/** Where a salary sits against the band: a thin track with the band shaded. */
function BandMeter({ value, label }: { value: number; label: string }) {
  const lo = 130_000;
  const hi = 250_000;
  const p = (n: number) => `${((Math.min(hi, Math.max(lo, n)) - lo) / (hi - lo)) * 100}%`;
  const out = value > band.max || value < band.min;
  return (
    <span className="flex items-center gap-2">
      <span className="relative h-1.5 w-full max-w-24 rounded-full bg-track" aria-hidden>
        <span className="absolute inset-y-0 rounded-full bg-fg-subtle/40" style={{ insetInlineStart: p(band.min), width: `calc(${p(band.max)} - ${p(band.min)})` }} />
        <span className={cn("absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface rtl:translate-x-1/2", out ? "tone-warning bg-[var(--tone)]" : "bg-fg")} style={{ insetInlineStart: p(value) }} />
      </span>
      <span className={cn("whitespace-nowrap text-[11px]", out ? "tone-warning text-[color-mix(in_srgb,var(--tone)_75%,var(--fg))]" : "text-fg-subtle")}>{label}</span>
    </span>
  );
}
