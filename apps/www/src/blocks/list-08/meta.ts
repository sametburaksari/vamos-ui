import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Locations map",
  description:
    "Stores, pickup points and warehouses as a numbered list and a map that share one selection: search, kind and open-now filters, KPI count-ups, a detail panel with staff and a 14-day trend, close-for-today with a reason (optimistic, with undo) and an add-location dialog. Below 1024px the list and the map switch.",
  category: "List pages",
  order: 80,
  tags: ["ops", "site"],
  files: [
    "list-08/page.tsx",
    "list-08/components/locations-view.tsx",
    "list-08/components/location-list.tsx",
    "list-08/components/location-panel.tsx",
    "list-08/components/add-location-dialog.tsx",
    "list-08/components/locations-data.ts",
    "_shared/geo.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
