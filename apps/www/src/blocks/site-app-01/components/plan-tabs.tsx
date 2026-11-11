import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vamos-ui/react";
import { plans, type Copy } from "./content";
import { PhoneFrame, PlanOverviewScreen } from "./phone";

/** Feature tabs with a synced phone screen: one tab per training plan. */
export function PlanTabs({ c }: { c: Copy }) {
  const { t, f } = c;
  return (
    <Tabs defaultValue={plans[1]!.id} className="gap-10">
      <div className="max-w-full overflow-x-auto scrollbar-none">
        <TabsList aria-label={t({ en: "Training plans", tr: "Antrenman planları" })}>
          {plans.map((p) => (
            <TabsTrigger key={p.id} value={p.id}>
              {t(p.name)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {plans.map((p) => (
        <TabsContent key={p.id} value={p.id} className="focus-ring rounded-ui">
          <div className="grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_auto] lg:gap-20">
            <div>
              <p className="m-0 font-mono text-xs tracking-[0.1em] text-fg-subtle uppercase">
                {f.number(p.weeks)} {t({ en: "weeks", tr: "hafta" })} · {t(p.perWeek)}
              </p>
              <h3 className="mt-4 font-display text-display-m text-fg">{t(p.goal)}</h3>
              <p className="mt-5 max-w-[48ch] text-lead text-fg-muted">{t(p.blurb)}</p>
              <dl className="mt-10 grid max-w-xl grid-cols-3 border-t border-line">
                {[
                  [t({ en: "Length", tr: "Süre" }), `${f.number(p.weeks)}`, t({ en: "weeks", tr: "hafta" })],
                  [t({ en: "Peak week", tr: "Zirve hafta" }), `${f.number(p.peak)}`, "km"],
                  [t({ en: "Phases", tr: "Evre" }), `${f.number(p.phases.length)}`, ""],
                ].map(([k, v, u]) => (
                  <div key={k} className="border-e border-line pt-4 pe-4 last:border-e-0 [&:not(:first-child)]:ps-4">
                    <dt className="font-mono text-[11px] tracking-[0.08em] text-fg-subtle uppercase">{k}</dt>
                    <dd className="m-0 mt-2 font-display text-4xl font-bold tracking-[-0.04em] text-fg tabular">
                      {v}
                      {u ? <span className="ms-1 font-mono text-xs font-normal tracking-normal text-fg-muted">{u}</span> : null}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div role="img" aria-label={t({ en: `Plan overview on the phone: ${t(p.name)}`, tr: `Telefonda plan özeti: ${t(p.name)}` })} className="justify-self-center">
              <PhoneFrame time="06:40">
                <div className="flex flex-1 flex-col" aria-hidden>
                  <PlanOverviewScreen c={c} planId={p.id} />
                </div>
              </PhoneFrame>
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
