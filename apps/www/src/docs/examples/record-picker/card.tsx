"use client";

import * as React from "react";
import { Card, RecordPicker, arrayRecordSource } from "@vamos-ui/react";

const contacts = [
  { id: "ct_31", name: "Selin Arslan", title: "Head of Operations", email: "selin@lumen.studio", photo: null },
  { id: "ct_32", name: "Marcus Lee", title: "Finance Director", email: "marcus@lumen.studio", photo: null },
  { id: "ct_33", name: "Ines Moreau", title: "Office Manager", email: "ines@lumen.studio", photo: null },
];

const contactSource = arrayRecordSource("lumen-contacts", contacts, {
  getId: (c) => c.id,
  getLabel: (c) => c.name,
  getDescription: (c) => `${c.title} · ${c.email}`,
  getAvatar: (c) => ({ name: c.name, src: c.photo }),
  href: (c) => `/docs/components/record-picker?contact=${c.id}`,
});

export default function RecordPickerCard() {
  const [primary, setPrimary] = React.useState<string | null>("ct_31");
  const [cc, setCc] = React.useState<string[]>(["ct_32"]);
  return (
    <Card className="grid w-full max-w-md gap-5 p-5">
      <div>
        <p className="text-xs text-fg-subtle">Deal · DL-2207</p>
        <h3 className="text-base font-semibold text-fg">Lumen Architects — Annual retainer</h3>
      </div>
      <section className="grid gap-2">
        <h4 id="primary-contact" className="text-[13px] font-medium text-fg-muted">Primary contact</h4>
        <RecordPicker aria-labelledby="primary-contact" display="card" source={contactSource} selectedRecords={contacts} value={primary} onValueChange={setPrimary} placeholder="Set contact" />
      </section>
      <section className="grid gap-2">
        <h4 id="cc-contacts" className="text-[13px] font-medium text-fg-muted">Also in the loop</h4>
        <RecordPicker aria-labelledby="cc-contacts" display="card" multiple source={contactSource} selectedRecords={contacts} value={cc} onValueChange={setCc} placeholder="Add contact" />
      </section>
    </Card>
  );
}
