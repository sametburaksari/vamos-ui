"use client";

import * as React from "react";
import { Flame, Inbox, Trophy } from "lucide-react";
import { FilterBar, SavedViews, createListState, toViewState, viewStateEqual, type FilterFieldDef, type SavedView, type ViewState } from "@vamos-ui/react/data-table";
import { owners, stageOptions } from "../data-table/_data";

const fields: FilterFieldDef[] = [
  { field: "stage", label: "Stage", type: "enum", options: stageOptions },
  { field: "value", label: "Deal value", type: "currency" },
  { field: "owner", label: "Owner", type: "user", options: owners.map((o) => ({ value: o.id, label: o.name })) },
];
const all = toViewState(createListState());
const seed: SavedView[] = [
  { id: "open", name: "My open deals", icon: Inbox, scope: "personal", isDefault: true, state: { ...all, filters: { logic: "and", clauses: [{ id: "1", field: "owner", op: "in", value: ["$me"] }, { id: "2", field: "stage", op: "notIn", value: ["won", "lost"] }] } } },
  { id: "hot", name: "Hot leads", icon: Flame, scope: "team", state: { ...all, filters: { logic: "and", clauses: [{ id: "3", field: "stage", op: "in", value: ["qualified", "proposal"] }, { id: "4", field: "value", op: "gte", value: "25000" }] } } },
  { id: "won", name: "Won this quarter", icon: Trophy, scope: "team", system: true, state: { ...all, filters: { logic: "and", clauses: [{ id: "5", field: "stage", op: "in", value: ["won"] }] } } },
];

// Standalone: SavedViews works with any list — here a Filter bar's state stands in for the list.
export default function SavedViewsDemo() {
  const [views, setViews] = React.useState(seed);
  const [activeId, setActiveId] = React.useState<string | null>("open");
  const [current, setCurrent] = React.useState<ViewState>(seed[0]!.state);
  const active = views.find((v) => v.id === activeId);

  const select = (id: string | null) => {
    setActiveId(id);
    setCurrent(views.find((v) => v.id === id)?.state ?? all);
  };

  return (
    <div className="surface grid w-full gap-3 rounded-ui-lg p-4">
      <SavedViews
        views={views}
        activeId={activeId}
        current={current}
        isDirty={active ? !viewStateEqual(current, active.state) : false}
        onSelect={select}
        onReset={() => setCurrent(active?.state ?? all)}
        onSave={({ name, scope, state }) => {
          const view: SavedView = { id: `v_${Date.now().toString(36)}`, name, scope, state: state ?? current };
          setViews((v) => [...v, view]);
          return view;
        }}
        onUpdate={(id, state) => setViews((v) => v.map((x) => (x.id === id ? { ...x, state } : x)))}
        onRename={(id, name) => setViews((v) => v.map((x) => (x.id === id ? { ...x, name } : x)))}
        onDelete={(id) => setViews((v) => v.filter((x) => x.id !== id))}
        onSetDefault={(id) => setViews((v) => v.map((x) => ({ ...x, isDefault: x.id === id })))}
        permissions={{ canCreateTeam: true }}
      />
      <FilterBar fields={fields} value={current.filters} onChange={(filters) => setCurrent((c) => ({ ...c, filters }))} me={{ id: "u_ada", name: "Ada Park" }} />
    </div>
  );
}
