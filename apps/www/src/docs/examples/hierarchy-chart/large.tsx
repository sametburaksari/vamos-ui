"use client";

import * as React from "react";
import { Button, HierarchyChart, HierarchyPersonNode, type HierarchyChartHandle } from "@vamos-ui/react";

interface Person {
  id: string;
  parentId: string | null;
  name: string;
  title: string;
}

const first = ["Ava", "Bilal", "Clara", "Deniz", "Elias", "Farah", "Gus", "Hana", "Ivan", "Jade", "Kaan", "Lina", "Mateo", "Nora", "Omar", "Pia"];
const last = ["Yılmaz", "Schmidt", "Rossi", "Haddad", "Kowalski", "Dubois", "Jensen", "Moreno", "Ito", "Byrne"];
const titles = ["Director", "Manager", "Team Lead", "Specialist"];

// 2,000 people, four levels below the CEO (1 → 8 → 64 → 384 → 1,543).
function makeOrg(): Person[] {
  const out: Person[] = [{ id: "n0", parentId: null, name: "Robin Achterberg", title: "Chief Executive Officer" }];
  let level = ["n0"];
  for (let depth = 0; depth < 4 && out.length < 2000; depth++) {
    const next: string[] = [];
    for (const parent of level) {
      const width = depth === 3 ? 4 : 8;
      for (let k = 0; k < width && out.length < 2000; k++) {
        const i = out.length;
        out.push({ id: `n${i}`, parentId: parent, name: `${first[i % first.length]} ${last[(i * 3) % last.length]}`, title: titles[depth]! });
        next.push(`n${i}`);
      }
    }
    level = next;
  }
  return out;
}

const org = makeOrg();

export default function HierarchyLarge() {
  const chart = React.useRef<HierarchyChartHandle>(null);
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="tabular text-fg-muted">{org.length.toLocaleString("en-US")} people · open a director to see their organization</span>
        <Button size="sm" className="ms-auto" onClick={() => chart.current?.focusNode(org[1500]!.id)}>
          Find {org[1500]!.name}
        </Button>
      </div>
      <HierarchyChart
        ref={chart}
        aria-label="Company directory"
        nodes={org}
        defaultCollapsed={{ depth: 1 }}
        nodeSize="compact"
        height="30rem"
        getLabel={(p) => p.name}
        getDescription={(p) => p.title}
        renderNode={(p) => <HierarchyPersonNode name={p.name} title={p.title} />}
      />
    </div>
  );
}
