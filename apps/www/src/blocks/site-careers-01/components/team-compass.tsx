"use client";

import * as React from "react";
import { cn } from "@vamos-ui/react";
import { ArrowUpRight } from "lucide-react";
import { useCareers } from "./careers-provider";
import { copyFor, jobs, teams, type SiteLocale, type TeamId } from "./content";

const pad3 = (n: number) => String(n).padStart(3, "0");
/** Rounded so server and client print the same SVG numbers. */
const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * The Northpoint compass: every team sits at its own bearing on a dial, next to a ruled list of
 * teams with their open roles. Hovering or focusing a row swings the needle to that team;
 * choosing it opens the job board filtered to the team.
 */
export function TeamCompass({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const { browseTeam } = useCareers();
  const [active, setActive] = React.useState<TeamId | null>(null);
  const current = teams.find((x) => x.id === active);
  const bearing = current?.bearing ?? 0;
  const count = (id: TeamId) => jobs.filter((j) => j.team === id).length;

  return (
    <div className="grid items-center gap-8 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
      {/* Dial: decorative — the list is the accessible part. */}
      <svg aria-hidden viewBox="-124 -128 248 252" className="mx-auto w-full max-w-[14rem] text-fg">
        <circle r="104" fill="none" stroke="var(--line)" strokeWidth="1" />
        <circle r="78" fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="2 4" />
        {Array.from({ length: 72 }, (_, i) => {
          const major = i % 18 === 0;
          const a = (i * 5 * Math.PI) / 180;
          const r1 = major ? 88 : 96;
          return <line key={i} x1={r2(Math.sin(a) * r1)} y1={r2(-Math.cos(a) * r1)} x2={r2(Math.sin(a) * 104)} y2={r2(-Math.cos(a) * 104)} stroke={major ? "var(--fg)" : "var(--fg-subtle)"} strokeWidth={major ? 1.5 : 0.75} />;
        })}
        <text y="-110" textAnchor="middle" className="fill-fg font-mono text-[13px]" style={{ fontWeight: 700 }}>
          N
        </text>
        {teams.map((tm) => {
          const a = (tm.bearing * Math.PI) / 180;
          const on = tm.id === active;
          return <circle key={tm.id} cx={r2(Math.sin(a) * 78)} cy={r2(-Math.cos(a) * 78)} r={on ? 7 : 4} fill={on ? "var(--accent)" : "var(--fg)"} stroke={on ? "var(--fg)" : "none"} strokeWidth="1.5" className="transition-[r] duration-200 motion-reduce:transition-none" />;
        })}
        <g style={{ transform: `rotate(${bearing}deg)`, transition: "transform 600ms cubic-bezier(.2,.8,.2,1)" }} className="motion-reduce:[transition:none!important]">
          <path d="M0 -70 L7 0 L0 8 L-7 0 Z" fill="var(--fg)" />
          <path d="M0 70 L7 0 L0 -8 L-7 0 Z" fill="none" stroke="var(--fg)" strokeWidth="1.25" />
        </g>
        <circle r="4" fill="var(--scene)" stroke="var(--fg)" strokeWidth="1.5" />
      </svg>

      <ul className="border-t border-fg" onMouseLeave={() => setActive(null)}>
        {teams.map((tm) => {
          const n = count(tm.id);
          return (
            <li key={tm.id} className="border-b border-line">
              <button
                type="button"
                onMouseEnter={() => setActive(tm.id)}
                onFocus={() => setActive(tm.id)}
                onBlur={() => setActive(null)}
                onClick={() => browseTeam(tm.id)}
                className={cn("group grid w-full grid-cols-[3.25rem_minmax(0,1fr)_auto] items-baseline gap-3 py-3 text-start focus-ring", active === tm.id && "bg-hover")}
              >
                <span className="ps-1 font-mono text-xs text-fg-muted tabular">{pad3(tm.bearing)}°</span>
                <span className="min-w-0">
                  <span className="block font-medium text-fg">{t(tm.name)}</span>
                  <span className="block truncate text-xs text-fg-muted">{t({ en: `${tm.size} people · led by ${tm.lead}`, tr: `${tm.size} kişi · lider: ${tm.lead}` })}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 pe-1 font-mono text-xs text-fg">
                  <span className={cn("rounded-full px-2 py-0.5 tabular", n ? "bg-accent text-accent-fg" : "bg-selected text-fg-muted")}>{n}</span>
                  <span className="sr-only">{t({ en: n === 1 ? "open role" : "open roles", tr: "açık pozisyon" })}</span>
                  <ArrowUpRight aria-hidden className="size-3.5 text-fg-muted transition-transform group-hover:-translate-y-px group-hover:translate-x-px rtl:-scale-x-100" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
