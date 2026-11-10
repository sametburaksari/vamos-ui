"use client";

import * as React from "react";
import { Field, RecordPicker, type RecordSource } from "@vamos-cms/ui";

interface Project {
  id: string;
  name: string;
  client: string;
}

const db: Project[] = [
  { id: "prj_118", name: "Spring catalogue shoot", client: "Çamlıca Textiles" },
  { id: "prj_121", name: "Checkout redesign", client: "Northwind Traders" },
  { id: "prj_124", name: "Clinic booking site", client: "Bosphorus Dental" },
];

// The task record only stores ids. getByIds resolves labels (a skeleton shows meanwhile);
// "prj_099" was deleted, so it shows as an unknown record you can remove.
const projectSource: RecordSource<Project> = {
  key: "projects",
  async search(query) {
    const q = query.toLocaleLowerCase("en");
    return { items: db.filter((p) => `${p.name} ${p.client}`.toLocaleLowerCase("en").includes(q)) };
  },
  async getByIds(ids) {
    await new Promise((r) => setTimeout(r, 1200));
    return db.filter((p) => ids.includes(p.id));
  },
  getId: (p) => p.id,
  getLabel: (p) => p.name,
  getDescription: (p) => p.client,
};

export default function RecordPickerInitialValues() {
  const [ids, setIds] = React.useState(["prj_121", "prj_099"]);
  return (
    <div className="w-full max-w-md">
      <Field label="Linked projects" hint="Loaded from ids. One project was deleted.">
        <RecordPicker multiple source={projectSource} value={ids} onValueChange={setIds} placeholder="Link a project" />
      </Field>
    </div>
  );
}
