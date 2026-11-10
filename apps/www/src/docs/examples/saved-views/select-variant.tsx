"use client";

import * as React from "react";
import { SavedViews, createListState, toViewState, type SavedView } from "@vamos-ui/react/data-table";

const base = toViewState(createListState());
const views: SavedView[] = ["All partners", "EMEA resellers", "At risk", "Renewing in Q1", "Gold tier", "New this month"].map((name, i) => ({
  id: `p${i}`,
  name,
  scope: i % 2 ? "team" : "personal",
  state: base,
}));

// variant="select" for narrow headers (auto-switches under 420px); many tabs overflow into "More".
export default function SavedViewsSelectVariant() {
  const [a, setA] = React.useState<string | null>("p1");
  const [b, setB] = React.useState<string | null>("p0");
  return (
    <div className="grid w-full gap-5">
      <SavedViews variant="select" views={views} activeId={a} current={base} onSelect={setA} onReset={() => {}} showAll={false} onSave={() => {}} />
      <SavedViews variant="tabs" maxVisible={3} views={views} activeId={b} current={base} onSelect={setB} onReset={() => {}} showAll={false} size="sm" />
    </div>
  );
}
