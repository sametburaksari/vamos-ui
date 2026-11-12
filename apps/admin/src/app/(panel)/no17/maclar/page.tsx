"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader, Card, CardHeader, CardBody, Badge } from "@vamos-cms/ui";
import { FIXTURE, MEMBERS } from "@/lib/no17-data";
import { matchSubtitle } from "@/lib/no17-helpers";
import { useAttendance } from "@/lib/no17-store";

const TABS = [
  { key: "", label: "Tümü", href: "/no17/maclar" },
  { key: "ic", label: "İç saha", href: "/no17/maclar?saha=ic" },
  { key: "dep", label: "Deplasman", href: "/no17/maclar?saha=dep" },
] as const;

export default function No17Matches() {
  const { countFor } = useAttendance();
  const saha = useSearchParams().get("saha") ?? "";
  const total = MEMBERS.length;

  const fixtures = FIXTURE.filter((f) => (saha === "ic" ? f.ha === "İç" : saha === "dep" ? f.ha === "Dep" : true));

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow="NO:17"
        title="Maçlar"
        description="Kasım – Aralık 2026 fikstürü ve maç başına katılım."
        actions={
          <div className="flex rounded-ui-sm border border-field-border p-0.5 text-sm">
            {TABS.map((t) => {
              const active = t.key === saha;
              return (
                <Link
                  key={t.key}
                  href={t.href}
                  className={`rounded-[6px] px-3 py-1 transition-colors ${active ? "bg-selected font-medium text-fg" : "text-fg-muted hover:text-fg"}`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        }
      />

      <div className="grid gap-(--gap) sm:grid-cols-2 lg:grid-cols-3">
        {fixtures.map((f) => {
          const c = countFor(f.id);
          const pct = total ? Math.round((c / total) * 100) : 0;
          return (
            <Link key={f.id} href={`/no17/maclar/${f.id}`} className="group block focus:outline-none">
              <Card className="ui-rise h-full transition-colors group-hover:border-field-border">
                <CardHeader
                  title={f.opp}
                  description={matchSubtitle(f)}
                  action={<Badge tone={f.ha === "İç" ? "success" : "warning"}>{f.ha === "İç" ? "İç saha" : "Deplasman"}</Badge>}
                />
                <CardBody>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-semibold tabular-nums">{c}</div>
                      <div className="text-xs text-fg-muted">{total} kişiden · %{pct}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm text-accent-ink opacity-0 transition-opacity group-hover:opacity-100">
                      Katılım <ArrowRight className="size-4" />
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-field">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
