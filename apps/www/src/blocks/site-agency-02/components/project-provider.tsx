"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { copyFor, projects, type ProjectId, type SiteLocale } from "./content";

interface ProjectContextValue {
  /** The project the case page shows (and the index highlights). */
  project: ProjectId;
  setProject: (id: ProjectId) => void;
}

const ProjectContext = React.createContext<ProjectContextValue | null>(null);

/** Holds the chosen project above the locale switch, so EN ↔ TR keeps it. */
export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = React.useState<ProjectId>("sarnic");
  const value = React.useMemo(() => ({ project, setProject }), [project]);
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const ctx = React.useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used inside <ProjectProvider>.");
  return ctx;
}

/** Locale-resolved copy helpers for client islands. */
export function useCopy() {
  const { locale } = useSiteShell();
  return { ...copyFor(locale as SiteLocale), locale: locale as SiteLocale };
}

/** The next project in the list, wrapping around. */
export const nextProject = (id: ProjectId, step = 1) => {
  const i = projects.findIndex((p) => p.id === id);
  return projects[(i + step + projects.length) % projects.length]!.id;
};
