"use client";

import * as React from "react";
import { SavedViews, createListState, toViewState, type SavedView, type ViewState } from "@vamos-ui/react/data-table";

const base = toViewState(createListState());
const views: SavedView[] = [
  { id: "mine", name: "My drafts", scope: "personal", ownerId: "me", state: base },
  { id: "editorial", name: "Editorial calendar", scope: "team", ownerId: "u_ines", state: base },
  { id: "seo", name: "Needs SEO review", scope: "team", ownerId: "u_omar", state: base },
];
const modified: ViewState = { ...base, sort: [{ id: "updatedAt", desc: true }] };

// A team view owned by someone else: Save is disabled with the reason; Save as new still works.
export default function SavedViewsTeamScope() {
  const [activeId, setActiveId] = React.useState<string | null>("editorial");
  return (
    <SavedViews
      views={views}
      activeId={activeId}
      current={modified}
      onSelect={setActiveId}
      onReset={() => {}}
      onUpdate={() => {}}
      onSave={() => {}}
      onDelete={() => {}}
      showAll={false}
      permissions={{ canCreateTeam: false, canEdit: (v) => v.ownerId === "me" }}
      className="w-full"
    />
  );
}
