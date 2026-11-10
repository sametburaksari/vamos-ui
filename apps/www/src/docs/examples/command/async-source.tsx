"use client";

import { Building2, Contact } from "lucide-react";
import { Button, CommandPalette, CommandProvider, useCommandPalette, type CommandSource } from "@vamos-ui/react";

const people = [
  { id: "c-1042", name: "Hannah Lindqvist", company: "Northwind Traders" },
  { id: "c-1043", name: "Mert Aydın", company: "Lena Spa" },
  { id: "c-1044", name: "Ece Demir", company: "Tuzla Play" },
  { id: "c-1045", name: "Jonas Becker", company: "Acme GmbH" },
  { id: "c-1046", name: "Janelle Ortiz", company: "Brightline Studio" },
];

const contacts: CommandSource = {
  id: "crm.contacts",
  group: "Contacts",
  minQuery: 2,
  debounce: 200,
  // Every keystroke aborts the previous request through `signal`.
  async search(query, { signal }) {
    await new Promise((resolve, reject) => {
      const t = setTimeout(resolve, 600);
      signal.addEventListener("abort", () => (clearTimeout(t), reject(signal.reason)));
    });
    const q = query.toLocaleLowerCase();
    return people
      .filter((p) => `${p.name} ${p.company}`.toLocaleLowerCase().includes(q))
      .map((p) => ({ id: `contact.${p.id}`, title: p.name, subtitle: p.company, icon: Contact, href: `/crm/contacts/${p.id}` }));
  },
};

function Open() {
  const palette = useCommandPalette();
  return <Button onClick={() => palette.open()}>Search contacts (try “ja”)</Button>;
}

export default function CommandAsyncSource() {
  return (
    <CommandProvider shortcut={false} sources={[contacts]} actions={[{ id: "nav.companies", title: "Companies", group: "Go to", icon: Building2 }]}>
      <Open />
      <CommandPalette />
    </CommandProvider>
  );
}
