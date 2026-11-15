import type { CapacityArrangement, CapacityOption } from "@vamos-ui/react";

export const arrangements: CapacityArrangement[] = [
  { id: "theatre", label: "Theatre", phrase: "theatre-style", hint: "Rows of chairs facing the front" },
  { id: "classroom", label: "Classroom", phrase: "classroom-style", hint: "Tables in rows" },
  { id: "boardroom", label: "Boardroom", phrase: "around one table" },
  { id: "standing", label: "Standing", phrase: "standing" },
];

export const rooms: CapacityOption[] = [
  { id: "atrium", name: "Atrium", meta: "Ground floor · 240 m²", capacities: { theatre: 180, classroom: 96, boardroom: null, standing: 260 } },
  { id: "north", name: "North Room", meta: "Floor 2 · 110 m²", capacities: { theatre: 90, classroom: 48, boardroom: 28, standing: 120 } },
  { id: "loft", name: "The Loft", meta: "Floor 3 · 70 m²", capacities: { theatre: 50, classroom: 24, boardroom: 18, standing: 70 } },
  { id: "studio", name: "Studio 4", meta: "Floor 3 · 32 m²", capacities: { theatre: 20, classroom: 12, boardroom: 10, standing: 25 } },
];
