"use client";

import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { Card, CardHeader } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { enps, headcountTrend } from "./data";

const themes = [
  { up: true, en: "Flexible hours", tr: "Esnek çalışma saatleri", n: 31 },
  { up: true, en: "My manager listens", tr: "Yöneticim dinliyor", n: 22 },
  { up: false, en: "Unclear career paths", tr: "Belirsiz kariyer yolu", n: 17 },
  { up: false, en: "Too many meetings", tr: "Çok fazla toplantı", n: 9 },
];

/** Employee NPS: the score, its change, the promoter/passive/detractor split and what people wrote. */
export function EnpsCard() {
  const { f, c } = useBlockFormat();
  const change = enps.score - enps.previous;
  const responseRate = enps.responses / headcountTrend.at(-1)!.headcount;

  return (
    <Card className="ui-rise flex min-w-0 flex-col" style={{ animationDelay: "120ms" }}>
      <CardHeader titleAs="h2" eyebrow={c("Autumn pulse survey", "Sonbahar nabız anketi")} title="eNPS" description={c(`${enps.responses} answers · ${f.percent(responseRate, { maximumFractionDigits: 0 })} response rate`, `${enps.responses} yanıt · katılım ${f.percent(responseRate, { maximumFractionDigits: 0 })}`)} />
      <div className="flex flex-1 flex-col gap-5 px-(--card-p) pb-(--card-p)">
        <div className="flex items-end gap-3">
          <p className="font-display text-display-xl leading-none text-fg">
            <CountUp value={enps.score} />
          </p>
          <p className="mb-1.5 inline-flex items-center gap-1 rounded-ui-sm bg-surface-2 px-2 py-1 font-mono text-xs text-success tabular">
            <ArrowUpRight className="size-3.5" aria-hidden />
            {c(`+${change} since spring`, `bahardan beri +${change}`)}
          </p>
        </div>

        <div>
          <div
            role="img"
            aria-label={c(`Detractors ${enps.detractors}%, passives ${enps.passives}%, promoters ${enps.promoters}%`, `Kötüleyen %${enps.detractors}, pasif %${enps.passives}, destekleyen %${enps.promoters}`)}
            className="flex h-3 gap-0.5 overflow-hidden rounded-full"
          >
            <span className="h-full bg-danger" style={{ width: `${enps.detractors}%` }} />
            <span className="h-full bg-track" style={{ width: `${enps.passives}%` }} />
            <span className="h-full bg-success" style={{ width: `${enps.promoters}%` }} />
          </div>
          <dl className="mt-2 grid grid-cols-3 text-xs">
            <div>
              <dt className="text-fg-subtle">{c("Detractors 0–6", "Kötüleyen 0–6")}</dt>
              <dd className="font-mono text-fg tabular">{enps.detractors}%</dd>
            </div>
            <div className="text-center">
              <dt className="text-fg-subtle">{c("Passives 7–8", "Pasif 7–8")}</dt>
              <dd className="font-mono text-fg tabular">{enps.passives}%</dd>
            </div>
            <div className="text-end">
              <dt className="text-fg-subtle">{c("Promoters 9–10", "Destekleyen 9–10")}</dt>
              <dd className="font-mono text-fg tabular">{enps.promoters}%</dd>
            </div>
          </dl>
        </div>

        <div className="mt-auto border-t border-line pt-4">
          <h3 className="mb-2 text-xs font-medium text-fg-subtle">{c("What people wrote about", "Yorumlarda öne çıkanlar")}</h3>
          <ul className="space-y-1.5 text-[13px]">
            {themes.map((th) => (
              <li key={th.en} className="flex items-center gap-2">
                <span className={`grid size-4 shrink-0 place-items-center rounded-full ${th.up ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
                  {th.up ? <Plus className="size-3" aria-label={c("Positive", "Olumlu")} /> : <Minus className="size-3" aria-label={c("Negative", "Olumsuz")} />}
                </span>
                <span className="min-w-0 flex-1 truncate text-fg-muted">{c(th.en, th.tr)}</span>
                <span className="font-mono text-xs text-fg-subtle tabular">{th.n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
