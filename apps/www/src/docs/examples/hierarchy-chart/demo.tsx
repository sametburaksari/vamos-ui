"use client";

import * as React from "react";
import { HierarchyChart, HierarchyPersonNode } from "@vamos-ui/react";

interface Person {
  id: string;
  parentId: string | null;
  name: string;
  title: string;
  team?: string;
  vacant?: boolean;
}

const people: Person[] = [
  { id: "p1", parentId: null, name: "Leyla Aksoy", title: "Chief Executive Officer" },
  { id: "p2", parentId: "p1", name: "Marcus Lee", title: "Chief Technology Officer", team: "Engineering · 24" },
  { id: "p3", parentId: "p1", name: "Priya Raman", title: "Chief Financial Officer", team: "Finance · 6" },
  { id: "p4", parentId: "p1", name: "Hannah Weiss", title: "VP People", team: "People · 5" },
  { id: "p5", parentId: "p2", name: "Jonas Berg", title: "Engineering Manager, Platform" },
  { id: "p6", parentId: "p2", name: "Sofia Marino", title: "Engineering Manager, Apps" },
  { id: "p7", parentId: "p2", name: "Open role", title: "Head of Security", vacant: true },
  { id: "p8", parentId: "p3", name: "Daniel Okoye", title: "Financial Controller" },
  { id: "p9", parentId: "p4", name: "Mei Tanaka", title: "Talent Partner" },
  { id: "p10", parentId: "p4", name: "Carlos Mendes", title: "People Operations" },
  { id: "p11", parentId: "p5", name: "Aisha Bello", title: "Senior Engineer" },
  { id: "p12", parentId: "p5", name: "Erik Holm", title: "Site Reliability Engineer" },
  { id: "p13", parentId: "p6", name: "Zeynep Arslan", title: "Mobile Engineer" },
];

export default function HierarchyChartDemo() {
  const [selected, setSelected] = React.useState<string | null>("p2");
  const person = people.find((p) => p.id === selected);
  return (
    <div className="flex w-full flex-col gap-3">
      <HierarchyChart
        aria-label="Organization"
        nodes={people}
        height="30rem"
        selected={selected}
        onSelectedChange={setSelected}
        getLabel={(p) => p.name}
        getDescription={(p) => p.title}
        isPlaceholder={(p) => !!p.vacant}
        renderNode={(p) => <HierarchyPersonNode name={p.name} title={p.title} meta={p.team} vacant={p.vacant} />}
      />
      <p className="text-sm text-fg-muted" aria-live="polite">
        {person ? (
          <>
            Selected: <span className="font-medium text-fg">{person.name}</span>, {person.title}
          </>
        ) : (
          "Select a person to see their details."
        )}
      </p>
    </div>
  );
}
