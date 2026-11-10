"use client";

import * as React from "react";
import { Download, Image as ImageIcon } from "lucide-react";
import { Button, HierarchyChart, HierarchyNodeCard, type HierarchyChartHandle } from "@vamos-ui/react";

interface Branch {
  id: string;
  parentId: string | null;
  name: string;
  manager: string;
}

const branches: Branch[] = [
  { id: "hq", parentId: null, name: "Head office — Istanbul", manager: "Selim Kurt" },
  { id: "kadikoy", parentId: "hq", name: "Kadıköy branch", manager: "Ece Polat" },
  { id: "besiktas", parentId: "hq", name: "Beşiktaş branch", manager: "Arda Er" },
  { id: "izmir", parentId: "hq", name: "İzmir region", manager: "Defne Ak" },
  { id: "alsancak", parentId: "izmir", name: "Alsancak branch", manager: "Can Uslu" },
  { id: "bornova", parentId: "izmir", name: "Bornova branch", manager: "Sena Toprak" },
];

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function HierarchyExport() {
  const chart = React.useRef<HierarchyChartHandle>(null);
  const [busy, setBusy] = React.useState(false);
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex gap-2">
        <Button size="sm" onClick={() => download(new Blob([chart.current!.toSVG()], { type: "image/svg+xml" }), "branches.svg")}>
          <Download /> SVG
        </Button>
        <Button
          size="sm"
          loading={busy}
          onClick={async () => {
            setBusy(true);
            try {
              download(await chart.current!.toPNG(2), "branches.png");
            } finally {
              setBusy(false);
            }
          }}
        >
          <ImageIcon /> PNG
        </Button>
      </div>
      <HierarchyChart
        ref={chart}
        aria-label="Branch structure"
        nodes={branches}
        nodeSize="compact"
        height="22rem"
        getLabel={(b) => b.name}
        getDescription={(b) => b.manager}
        renderNode={(b) => <HierarchyNodeCard title={b.name} subtitle={b.manager} />}
      />
    </div>
  );
}
