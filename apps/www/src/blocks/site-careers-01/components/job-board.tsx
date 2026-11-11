"use client";

import * as React from "react";
import { Badge, Button, CheckboxGroup, EmptyState, Field, Input, Select, cn } from "@vamos-ui/react";
import { ArrowRight, Search } from "lucide-react";
import { Stagger } from "@vamos-ui/react/motion";
import { emptyFilters, useCareers, type JobFilters } from "./careers-provider";
import { copyFor, jobs as allJobs, kinds, places, teams, TODAY, type Job, type KindId, type PlaceId, type SiteLocale, type TeamId } from "./content";

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

/** One job row: ref, title + team, places, band, posted — all one link-like button. */
export function JobRow({ job, locale, compact = false, enter = false }: { job: Job; locale: SiteLocale; compact?: boolean; /** Rise in when mounted (rows appearing after a filter change). */ enter?: boolean }) {
  const { t, f, band } = copyFor(locale);
  const { openJob, applied } = useCareers();
  const team = teams.find((x) => x.id === job.team)!;
  const age = daysBetween(job.posted, TODAY);
  const fresh = age <= 7;
  return (
    <li className={cn("border-b border-line", enter && "vm-enter")}>
      <button
        type="button"
        onClick={() => openJob(job.id)}
        className="group grid w-full gap-x-6 gap-y-2 py-5 text-start focus-ring md:grid-cols-[minmax(0,1fr)_11rem_9rem_2rem] md:items-center"
      >
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-fg-muted uppercase">
            <span>{job.ref}</span>
            <span aria-hidden>·</span>
            <span>{t(team.name)}</span>
            {fresh ? (
              <Badge tone="accent" size="sm">
                {t({ en: "New", tr: "Yeni" })}
              </Badge>
            ) : null}
            {applied[job.id] ? (
              <Badge tone="success" size="sm">
                {t({ en: "Applied", tr: "Başvuruldu" })}
              </Badge>
            ) : null}
          </span>
          <span className="mt-1 block font-display text-[1.35rem] leading-tight text-fg group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{t(job.title)}</span>
          {!compact ? <span className="mt-1.5 line-clamp-2 block max-w-[68ch] text-small text-fg-muted">{t(job.summary)}</span> : null}
        </span>
        <span className="text-small text-fg">
          {job.places.map((p) => (
            <span key={p} className="block">
              {t(places[p].name)}
            </span>
          ))}
          <span className="block text-xs text-fg-muted">{t(kinds[job.kind])}</span>
        </span>
        <span className="text-small">
          <span className="block font-mono text-fg tabular">{job.salary[0] === job.salary[1] ? copyFor(locale).k(job.salary[0]) : band(job.salary)}</span>
          <span className="block text-xs text-fg-muted">
            {t({ en: "posted", tr: "yayın" })} {f.relative(job.posted, { now: `${TODAY}T12:00:00+03:00` })}
          </span>
        </span>
        <ArrowRight aria-hidden className="hidden size-5 text-fg-muted transition-transform group-hover:translate-x-1 group-hover:text-fg md:block rtl:rotate-180" />
      </button>
    </li>
  );
}

/**
 * The signature of the careers site: free-text search, team toggles, place and contract
 * filters, a live result count, results grouped by team and an empty state that offers to
 * widen the search. Filters live in the provider, so the home compass can pre-set them.
 */
export function JobBoard({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const { filters, setFilters, results } = useCareers();
  const set = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => setFilters((f) => ({ ...f, [key]: value }));
  const active = filters.query.trim() !== "" || filters.teams.length > 0 || filters.place !== "any" || filters.kind !== "any";
  const grouped = teams.map((tm) => ({ team: tm, jobs: results.filter((j) => j.team === tm.id) })).filter((g) => g.jobs.length);

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
      <form role="search" aria-label={t({ en: "Filter open roles", tr: "Açık pozisyonları filtrele" })} onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        <Field label={t({ en: "Search", tr: "Ara" })}>
          <Input
            type="search"
            leading={<Search aria-hidden />}
            placeholder={t({ en: "Title, skill or NP-ref", tr: "Unvan, beceri ya da NP-ref" })}
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            clearable
            onClear={() => set("query", "")}
            inputClassName="[&::-webkit-search-cancel-button]:appearance-none"
          />
        </Field>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-fg">{t({ en: "Team", tr: "Ekip" })}</legend>
          <CheckboxGroup
            value={filters.teams}
            onValueChange={(v) => set("teams", v as TeamId[])}
            items={teams.map((tm) => ({ value: tm.id, label: <span className="flex w-full justify-between gap-3"><span>{t(tm.name)}</span><span className="font-mono text-xs text-fg-muted tabular">{allJobs.filter((j) => j.team === tm.id).length}</span></span> }))}
          />
        </fieldset>
        <Field label={t({ en: "Where", tr: "Nerede" })}>
          <Select<PlaceId | "any">
            value={filters.place}
            onValueChange={(v) => set("place", v ?? "any")}
            items={[{ value: "any", label: t({ en: "Anywhere", tr: "Her yerde" }) }, ...(Object.keys(places) as PlaceId[]).map((p) => ({ value: p, label: t(places[p].name) }))]}
          />
        </Field>
        <Field label={t({ en: "Contract", tr: "Sözleşme" })}>
          <Select<KindId | "any">
            value={filters.kind}
            onValueChange={(v) => set("kind", v ?? "any")}
            items={[{ value: "any", label: t({ en: "Any contract", tr: "Tüm sözleşmeler" }) }, ...(Object.keys(kinds) as KindId[]).map((k) => ({ value: k, label: t(kinds[k]) }))]}
          />
        </Field>
        {active ? (
          <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => setFilters(emptyFilters)}>
            {t({ en: "Clear all filters", tr: "Tüm filtreleri temizle" })}
          </Button>
        ) : null}
      </form>

      <div className="min-w-0">
        <p aria-live="polite" className="flex items-baseline justify-between gap-4 border-b-2 border-fg pb-3 font-mono text-xs tracking-[0.06em] text-fg-muted uppercase">
          <span data-testid="job-count">
            <span className="text-fg tabular">{results.length}</span> {t({ en: results.length === 1 ? "open role" : "open roles", tr: "açık pozisyon" })}
          </span>
          <span className="hidden sm:inline">{t({ en: "Bands: yearly gross, EUR", tr: "Bantlar: yıllık brüt, EUR" })}</span>
        </p>
        {grouped.length === 0 ? (
          <EmptyState
            className="mt-10"
            kind="no-results"
            title={t({ en: "No role matches all of that", tr: "Bunların hepsine uyan bir pozisyon yok" })}
            description={t({ en: "Try fewer filters — or send an open application and we will keep it for 12 months.", tr: "Daha az filtre deneyin — ya da açık başvuru gönderin, 12 ay saklayalım." })}
            actions={
              <Button type="button" variant="secondary" onClick={() => setFilters(emptyFilters)}>
                {t({ en: "Show all roles", tr: "Tüm pozisyonları göster" })}
              </Button>
            }
          />
        ) : (
          grouped.map(({ team, jobs }) => (
            <section key={team.id} aria-labelledby={`np-team-${team.id}`} className="mt-8 first:mt-6">
              <h2 id={`np-team-${team.id}`} className={cn("flex items-baseline gap-3 text-sm font-semibold text-fg")}>
                {t(team.name)}
                <span className="font-mono text-xs font-normal text-fg-muted tabular">{jobs.length}</span>
              </h2>
              <ul className="mt-1 border-t border-line">
                {jobs.map((j) => (
                  <JobRow key={j.id} job={j} locale={locale} enter />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

/** The four newest roles on the home page. */
export function LatestRoles({ locale }: { locale: SiteLocale }) {
  const latest = [...allJobs].sort((a, b) => b.posted.localeCompare(a.posted)).slice(0, 4);
  return (
    <Stagger asChild step={70}>
      <ul className="border-t-2 border-fg">
        {latest.map((j) => (
          <JobRow key={j.id} job={j} locale={locale} compact />
        ))}
      </ul>
    </Stagger>
  );
}
