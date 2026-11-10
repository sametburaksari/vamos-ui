"use client";

import * as React from "react";
import { Building2, Store, Warehouse } from "lucide-react";
import { Badge, HierarchyChart, HierarchyNodeCard, useFormat } from "@vamos-cms/ui";

interface Partner {
  id: string;
  parentId: string | null;
  name: string;
  kind: "distributor" | "reseller" | "sub-reseller";
  tier: "Platinum" | "Gold" | "Silver";
  city: string;
  volume: number;
}

const partners: Partner[] = [
  { id: "d1", parentId: null, name: "Meridian Distribution", kind: "distributor", tier: "Platinum", city: "Rotterdam", volume: 4820000 },
  { id: "r1", parentId: "d1", name: "Northline IT", kind: "reseller", tier: "Gold", city: "Hamburg", volume: 1240000 },
  { id: "r2", parentId: "d1", name: "Brightpath Systems", kind: "reseller", tier: "Gold", city: "Lyon", volume: 980000 },
  { id: "r3", parentId: "d1", name: "Kestrel Retail Tech", kind: "reseller", tier: "Silver", city: "Milan", volume: 410000 },
  { id: "s1", parentId: "r1", name: "Hafen POS", kind: "sub-reseller", tier: "Silver", city: "Bremen", volume: 186000 },
  { id: "s2", parentId: "r1", name: "Elbe Kassensysteme", kind: "sub-reseller", tier: "Silver", city: "Kiel", volume: 142000 },
  { id: "s3", parentId: "r2", name: "Rhône Commerce", kind: "sub-reseller", tier: "Silver", city: "Grenoble", volume: 97000 },
];

const icon = { distributor: <Warehouse />, reseller: <Building2 />, "sub-reseller": <Store /> };
const tone = { Platinum: "accent", Gold: "warning", Silver: "neutral" } as const;

export default function HierarchyPartnerNetwork() {
  const format = useFormat();
  return (
    <HierarchyChart
      aria-label="Partner network"
      nodes={partners}
      defaultOrientation="horizontal"
      nodeSize={{ width: 250, height: 72 }}
      gap={{ x: 24, y: 64 }}
      height="26rem"
      getLabel={(p) => p.name}
      getDescription={(p) => `${p.tier} · ${p.city}`}
      renderNode={(p) => (
        <HierarchyNodeCard
          icon={icon[p.kind]}
          title={p.name}
          badge={<Badge tone={tone[p.tier]} size="sm">{p.tier}</Badge>}
          subtitle={p.city}
          meta={<span className="tabular">{format.currency(p.volume, "EUR", { notation: "compact" })} / yr</span>}
        />
      )}
    />
  );
}
