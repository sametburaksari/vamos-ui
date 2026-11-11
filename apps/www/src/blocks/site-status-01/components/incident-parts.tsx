import type * as React from "react";
import { Badge, Timeline, TimelineContent, TimelineIndicator, TimelineItem } from "@vamos-ui/react";
import { components, copyFor, healthLabel, healthTone, phaseLabel, type Incident, type Phase, type SiteLocale } from "./content";

const phaseTone: Record<Phase, "warning" | "info" | "accent" | "success" | "neutral"> = {
  investigating: "warning",
  identified: "info",
  monitoring: "accent",
  resolved: "success",
  scheduled: "neutral",
  completed: "success",
};

/**
 * A status pill: the colour lives in the dot, the text stays full-contrast `fg` — status tokens
 * are not guaranteed 4.5:1 as small text on every surface.
 */
export function StatusPill({ fill, children }: { fill: string; children: React.ReactNode }) {
  return (
    <Badge tone="outline" size="sm" shape="square" className="gap-1.5 text-fg">
      <span aria-hidden className={`size-1.5 rounded-full ${fill}`} />
      {children}
    </Badge>
  );
}

/** Impact as a status pill. */
export function ImpactBadge({ impact, locale }: { impact: Incident["impact"]; locale: SiteLocale }) {
  const { t } = copyFor(locale);
  return <StatusPill fill={healthTone[impact].fill}>{t(healthLabel[impact])}</StatusPill>;
}

/** Names of the affected components, joined per locale. */
export function affected(incident: Incident, locale: SiteLocale) {
  const { t, f } = copyFor(locale);
  return f.list(incident.components.map((id) => t(components.find((c) => c.id === id)!.name)));
}

/** The updates of an incident, newest first, as a timeline. */
export function IncidentUpdates({ incident, locale, limit }: { incident: Incident; locale: SiteLocale; limit?: number }) {
  const { t, time, day } = copyFor(locale);
  const updates = limit ? incident.updates.slice(0, limit) : incident.updates;
  return (
    <Timeline>
      {updates.map((u) => (
        <TimelineItem key={u.at}>
          <TimelineIndicator tone={phaseTone[u.phase]} />
          <TimelineContent className="text-sm leading-6">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold text-fg">{t(phaseLabel[u.phase])}</span>
              <time dateTime={u.at} className="text-xs text-fg-muted tabular">
                {day(u.at)} · {time(u.at)} UTC
              </time>
            </div>
            <p className="m-0 mt-1 text-fg-muted">{t(u.text)}</p>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
