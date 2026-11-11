"use client";

import * as React from "react";
import { Badge, buttonVariants, cn, Field, RadioGroup } from "@vamos-ui/react";
import { Container, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, Baby, Bike, Check, Leaf, Scale, Soup, Users, type LucideIcon } from "lucide-react";
import { fill, GOALS, goals, planFor, programmes, SUPPORTS, supportNames, tl, type GoalId, type Mode, type Support } from "./content";
import { usePlan } from "./plan-provider";

const GOAL_ICONS: Record<GoalId, LucideIcon> = { weight: Scale, sport: Bike, gut: Soup, pregnancy: Baby, plant: Leaf, family: Users };

export const pickerCopy = {
  eyebrow: { en: "Programme picker", tr: "Program seçici" },
  title: { en: "Start with what you *want*, not with a diet", tr: "Bir diyetle değil, *ne istediğinizle* başlayın" },
  lead: { en: "Three questions, one recommendation. Prices are totals for the whole programme, VAT included.", tr: "Üç soru, bir öneri. Fiyatlar tüm programın toplamıdır, KDV dahildir." },
  q1: { en: "1 · Your goal", tr: "1 · Hedefiniz" },
  q2: { en: "2 · How much support?", tr: "2 · Ne kadar destek?" },
  q3: { en: "3 · Where?", tr: "3 · Nerede?" },
  clinic: { en: "Ataşehir clinic", tr: "Ataşehir klinik" },
  online: { en: "Online (−10%)", tr: "Çevrim içi (−%10)" },
  recommended: { en: "Recommended for you", tr: "Size önerilen" },
  alternative: { en: "Also a fit", tr: "Bu da uygun" },
  yourPick: { en: "Your pick", tr: "Sizin seçiminiz" },
  weeks: { en: "weeks", tr: "hafta" },
  visits: { en: "visits", tr: "görüşme" },
  total: { en: "total", tr: "toplam" },
  perWeek: { en: "{price} a week", tr: "haftalık {price}" },
  timeline: { en: "Visits across {weeks} weeks", tr: "{weeks} haftaya yayılan görüşmeler" },
  week: { en: "Week {n}", tr: "{n}. hafta" },
  visitWeek: { en: "Week {n}: visit", tr: "{n}. hafta: görüşme" },
  book: { en: "Book this programme", tr: "Bu programla randevu al" },
  compare: { en: "Compare all programmes", tr: "Tüm programları karşılaştır" },
  switchTo: { en: "Show {name} instead", tr: "Bunun yerine {name} göster" },
  live: { en: "{name}: {weeks} weeks, {visits} visits, {price}.", tr: "{name}: {weeks} hafta, {visits} görüşme, {price}." },
};

/**
 * Signature element: goal → support → place, and a recommendation with its real length, visit
 * count, total and weekly price and a week strip showing when the visits fall. "Book this
 * programme" hands the result to the booking form.
 */
export function ProgrammePicker({ anchor = "picker", surface }: { anchor?: string; surface?: "surface-2" }) {
  const { t, locale, goal, setGoal, support, setSupport, mode, setMode, programme, setProgramme } = usePlan();
  const c = pickerCopy;
  const plan = planFor(programme, support, mode);
  const [first, second] = goals[goal].programmes;
  const other = programme === first ? second : first;
  const otherPlan = planFor(other, support, mode);
  const isRecommended = programme === first;
  const fits = programme === first || programme === second;
  const visitSet = new Set(plan.weeksWithVisit);

  return (
    <Section anchor={anchor} theme={surface ? { surface } : undefined} headingId={`gp-${anchor}-h`}>
      <Container>
        <SectionHeader eyebrow={t(c.eyebrow)} title={t(c.title)} lead={t(c.lead)} align="split" headingId={`gp-${anchor}-h`} className="mb-10" />
        <div className="grid gap-8 @4xl:grid-cols-12 @4xl:gap-10">
          <div className="flex flex-col gap-8 @4xl:col-span-6">
            <Field label={t(c.q1)}>
              <RadioGroup
                name={`${anchor}-goal`}
                variant="card"
                value={goal}
                onValueChange={(v) => setGoal(v as GoalId)}
                className="grid gap-2.5 @md:grid-cols-2"
                items={GOALS.map((g) => {
                  const Icon = GOAL_ICONS[g];
                  return { value: g, label: t(goals[g].label), description: t(goals[g].hint), icon: <Icon aria-hidden className="size-5" /> };
                })}
              />
            </Field>
            <div className="grid gap-6 @xl:grid-cols-2">
              <Field label={t(c.q2)} hint={t(supportNames[support].hint)}>
                <RadioGroup name={`${anchor}-support`} variant="segmented" value={support} onValueChange={(v) => setSupport(v as Support)} items={SUPPORTS.map((s) => ({ value: s, label: t(supportNames[s].label) }))} />
              </Field>
              <Field label={t(c.q3)}>
                <RadioGroup
                  name={`${anchor}-mode`}
                  variant="segmented"
                  value={mode}
                  onValueChange={(v) => setMode(v as Mode)}
                  items={[
                    { value: "clinic", label: t(c.clinic) },
                    { value: "online", label: t(c.online) },
                  ]}
                />
              </Field>
            </div>
          </div>

          <div className="@4xl:col-span-6">
            <article aria-labelledby={`gp-${anchor}-result`} className="surface flex flex-col gap-6 rounded-[calc(var(--radius)*2)] p-5 @md:p-8 @4xl:sticky @4xl:top-[calc(var(--topbar-h,4rem)+1.5rem)]" data-gp-result={programme}>
              <p className="sr-only" aria-live="polite">
                {fill(t(c.live), { name: t(plan.programme.name), weeks: plan.weeks, visits: plan.sessions, price: tl(plan.price, locale) })}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge tone={isRecommended ? "accent" : "outline"} size="md">
                  {isRecommended ? t(c.recommended) : fits ? t(c.alternative) : t(c.yourPick)}
                </Badge>
                <span className="text-small text-fg-muted">{t(goals[goal].label)}</span>
              </div>
              <div key={`${programme}-${support}-${mode}`} className="flex animate-[ui-rise_320ms_cubic-bezier(0.2,0.8,0.2,1)] flex-col gap-2 motion-reduce:animate-none">
                <h3 id={`gp-${anchor}-result`} className="font-display text-display-l text-fg">
                  {t(plan.programme.name)}
                </h3>
                <p className="max-w-[48ch] text-fg-muted">{t(plan.programme.summary)}</p>
              </div>

              <dl className="grid grid-cols-3 divide-x divide-line rounded-[var(--radius)] border border-line rtl:divide-x-reverse">
                {[
                  { v: String(plan.weeks), l: t(c.weeks) },
                  { v: String(plan.sessions), l: t(c.visits) },
                  { v: tl(plan.price, locale), l: t(c.total) },
                ].map((s) => (
                  <div key={s.l} className="flex flex-col gap-0.5 p-3 @md:p-4">
                    <dt className="order-2 text-xs text-fg-muted">{s.l}</dt>
                    <dd className="order-1 font-display text-h3 font-bold text-fg tabular">{s.v}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3 text-small">
                  <span className="font-medium text-fg">{fill(t(c.timeline), { weeks: plan.weeks })}</span>
                  <span className="text-fg-muted tabular">{fill(t(c.perWeek), { price: tl(plan.perWeek, locale) })}</span>
                </div>
                <ol className="flex h-9 items-stretch gap-[2px]" aria-label={fill(t(c.timeline), { weeks: plan.weeks })}>
                  {Array.from({ length: plan.weeks }, (_, i) => {
                    const n = i + 1;
                    const visit = visitSet.has(n);
                    return (
                      <li
                        key={n}
                        className={cn("min-w-0 flex-1 rounded-[2px]", visit ? "bg-accent" : "bg-line")}
                        aria-label={visit ? fill(t(c.visitWeek), { n }) : undefined}
                        aria-hidden={visit ? undefined : true}
                      />
                    );
                  })}
                </ol>
                <div aria-hidden className="flex justify-between font-mono text-[11px] text-fg-subtle">
                  <span>{fill(t(c.week), { n: 1 })}</span>
                  <span>{fill(t(c.week), { n: plan.weeks })}</span>
                </div>
              </div>

              <ul className="flex flex-col gap-2">
                {plan.programme.includes.map((inc, i) => (
                  <li key={i} className="flex gap-2.5 text-small text-fg">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
                    {t(inc)}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
                <a href={sitePageHref("booking")} className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
                  {t(c.book)}
                  <ArrowRight aria-hidden className="rtl:rotate-180" />
                </a>
                <a href={sitePageHref("programmes")} className="focus-ring rounded-sm text-small font-medium text-fg underline-offset-4 hover:underline">
                  {t(c.compare)}
                </a>
              </div>
              <button
                type="button"
                onClick={() => setProgramme(other)}
                className="focus-ring flex items-center justify-between gap-4 rounded-[var(--radius)] border border-dashed border-line p-3.5 text-start transition-colors hover:border-accent-ink hover:bg-accent-soft motion-reduce:transition-none"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-xs text-fg-muted">{isRecommended ? t(c.alternative) : t(c.recommended)}</span>
                  <span className="font-medium text-fg">
                    {t(programmes[other].name)} · {otherPlan.weeks} {t(c.weeks)} · {otherPlan.sessions} {t(c.visits)} · <span className="tabular">{tl(otherPlan.price, locale)}</span>
                  </span>
                </span>
                <span className="sr-only">{fill(t(c.switchTo), { name: t(programmes[other].name) })}</span>
                <ArrowRight aria-hidden className="size-4 shrink-0 text-fg-muted rtl:rotate-180" />
              </button>
            </article>
          </div>
        </div>
      </Container>
    </Section>
  );
}
