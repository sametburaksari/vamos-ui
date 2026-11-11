"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { jobs, type Job, type KindId, type PlaceId, type TeamId } from "./content";

export interface JobFilters {
  query: string;
  /** Empty = every team. */
  teams: TeamId[];
  place: PlaceId | "any";
  kind: KindId | "any";
}

export const emptyFilters: JobFilters = { query: "", teams: [], place: "any", kind: "any" };

/** Case- and diacritic-insensitive search text ("Mühendis" matches "muhendis"). */
export const fold = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i");

export function matchJob(job: Job, f: JobFilters) {
  if (f.teams.length && !f.teams.includes(job.team)) return false;
  if (f.place !== "any" && !job.places.includes(f.place)) return false;
  if (f.kind !== "any" && job.kind !== f.kind) return false;
  if (f.query.trim()) {
    const hay = fold([job.title.en, job.title.tr, job.ref, job.summary.en, job.summary.tr, job.level.en, job.level.tr].join(" "));
    return fold(f.query)
      .split(/\s+/)
      .filter(Boolean)
      .every((w) => hay.includes(w));
  }
  return true;
}

interface CareersContextValue {
  filters: JobFilters;
  setFilters: React.Dispatch<React.SetStateAction<JobFilters>>;
  results: Job[];
  /** The job shown on the "job" page. */
  job: Job;
  openJob: (id: string) => void;
  /** Home → jobs, pre-filtered to one team. */
  browseTeam: (team: TeamId | null) => void;
  /** Applications sent in this session, by job id → reference. */
  applied: Record<string, string>;
  markApplied: (id: string, ref: string) => void;
}

const CareersContext = React.createContext<CareersContextValue | null>(null);

export function useCareers() {
  const ctx = React.useContext(CareersContext);
  if (!ctx) throw new Error("useCareers must be used inside <CareersProvider>.");
  return ctx;
}

/**
 * Filter state, the opened job and sent applications for the Northpoint careers site. Sits above
 * the locale switch so a filter survives EN ⇄ TR.
 */
export function CareersProvider({ children }: { children: React.ReactNode }) {
  const { navigate } = useSiteShell();
  const [filters, setFilters] = React.useState<JobFilters>(emptyFilters);
  const [jobId, setJobId] = React.useState(jobs[0]!.id);
  const [applied, setApplied] = React.useState<Record<string, string>>({});

  const value = React.useMemo<CareersContextValue>(
    () => ({
      filters,
      setFilters,
      results: jobs.filter((j) => matchJob(j, filters)),
      job: jobs.find((j) => j.id === jobId) ?? jobs[0]!,
      openJob: (id) => {
        setJobId(id);
        navigate({ page: "job" });
      },
      browseTeam: (team) => {
        setFilters({ ...emptyFilters, teams: team ? [team] : [] });
        navigate({ page: "jobs" });
      },
      applied,
      markApplied: (id, ref) => setApplied((a) => ({ ...a, [id]: ref })),
    }),
    [filters, jobId, applied, navigate],
  );

  return <CareersContext.Provider value={value}>{children}</CareersContext.Provider>;
}
