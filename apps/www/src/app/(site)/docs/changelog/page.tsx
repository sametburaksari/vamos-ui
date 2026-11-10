import { Badge } from "@vamos-cms/ui";
import { DocPage, H2 } from "@/components/docs/prose";

export const metadata = { title: "Changelog" };

type Kind = "Added" | "Changed" | "Fixed" | "Removed";
interface Release {
  version: string;
  date: string;
  unreleased?: boolean;
  changes: Partial<Record<Kind, string[]>>;
}

/** Newest first. Append new releases at the top. */
const releases: Release[] = [
  {
    version: "0.1.0",
    date: "2026-11-10",
    unreleased: true,
    changes: {
      Added: [
        "Design tokens with five axes: theme, material (glass/solid), accent, density and font.",
        "Components: Button, IconButton, Badge, Input, Textarea, Field, Card (with Header, Body, Footer, Inset).",
        "LocaleProvider, useMessages and useFormat with the built-in English dictionary.",
        "Docs site with live preview, code from the real example files, installation tabs and props tables.",
        "Multi-app admin shell demo: Site, CRM, People and Work share one sidebar and top bar.",
        "Plan for ~142 components across 13 groups.",
      ],
      Fixed: ["A light section inside a dark page now gets the light accent values and keeps the glass material."],
    },
  },
];

const tone: Record<Kind, "success" | "info" | "warning" | "danger"> = { Added: "success", Changed: "info", Fixed: "warning", Removed: "danger" };

export default function ChangelogPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="Changelog"
      description="Notable changes to Vamos UI. Follows Keep a Changelog and semantic versioning."
      toc={releases.map((r) => ({ id: `v${r.version}`, title: `v${r.version}` }))}
      prev={{ href: "/docs/license", title: "License" }}
    >
      {releases.map((r) => (
        <section key={r.version}>
          <H2 id={`v${r.version}`}>
            <span className="flex items-center gap-3">
              v{r.version}
              <span className="font-mono text-[13px] font-normal text-fg-subtle">{r.date}</span>
              {r.unreleased && <Badge tone="outline">Unreleased</Badge>}
            </span>
          </H2>
          <div className="mt-4 grid gap-5">
            {(Object.keys(r.changes) as Kind[]).map((k) => (
              <div key={k}>
                <Badge tone={tone[k]} size="md">{k}</Badge>
                <ul className="mt-2 grid list-disc gap-1.5 ps-5 marker:text-fg-subtle">
                  {r.changes[k]!.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </DocPage>
  );
}
