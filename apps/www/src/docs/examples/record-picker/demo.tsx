"use client";

import * as React from "react";
import { Field, RecordPicker, type RecordSource } from "@vamos-ui/react";

interface Company {
  id: string;
  name: string;
  domain: string;
  city: string;
}

const companies: Company[] = [
  { id: "cmp_01", name: "Northwind Traders", domain: "northwind.com", city: "Seattle" },
  { id: "cmp_02", name: "Bosphorus Dental", domain: "bosphorusdental.com.tr", city: "İstanbul" },
  { id: "cmp_03", name: "Kadıköy Roasters", domain: "kadikoyroasters.com", city: "İstanbul" },
  { id: "cmp_04", name: "Lumen Architects", domain: "lumen.studio", city: "Rotterdam" },
  { id: "cmp_05", name: "Fjord Freight", domain: "fjordfreight.no", city: "Bergen" },
  { id: "cmp_06", name: "Atlas Payroll", domain: "atlaspayroll.io", city: "Austin" },
  { id: "cmp_07", name: "Çamlıca Textiles", domain: "camlicatextiles.com", city: "Bursa" },
  { id: "cmp_08", name: "Harbor & Pine Legal", domain: "harborpine.law", city: "Portland" },
];

// A fake API: in your app, call fetch / tRPC / a server action here.
const companySource: RecordSource<Company> = {
  key: "companies",
  async search(query, { signal }) {
    await new Promise((r) => setTimeout(r, 350));
    signal.throwIfAborted();
    const q = query.toLocaleLowerCase("en");
    return { items: companies.filter((c) => `${c.name} ${c.domain} ${c.city}`.toLocaleLowerCase("en").includes(q)) };
  },
  async getByIds(ids) {
    return companies.filter((c) => ids.includes(c.id));
  },
  getId: (c) => c.id,
  getLabel: (c) => c.name,
  getDescription: (c) => `${c.domain} · ${c.city}`,
  getAvatar: (c) => ({ name: c.name, shape: "square" }),
};

export default function RecordPickerDemo() {
  const [companyId, setCompanyId] = React.useState<string | null>(null);
  return (
    <div className="w-full max-w-sm">
      <Field label="Company" hint="The account this contact belongs to.">
        <RecordPicker source={companySource} value={companyId} onValueChange={setCompanyId} placeholder="Link a company" searchPlaceholder="Search companies…" />
      </Field>
    </div>
  );
}
