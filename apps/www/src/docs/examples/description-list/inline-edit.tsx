"use client";

import * as React from "react";
import { Card, CardBody, CardHeader, DescriptionList } from "@vamos-cms/ui";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function DescriptionListInlineEdit() {
  const [contact, setContact] = React.useState({
    email: "burak@kadikoybistro.com",
    phone: "+90 532 555 01 22",
    website: "kadikoybistro.com",
  });

  const save = async (key: string, value: string) => {
    await wait(600); // your API call
    if (key === "email" && !value.includes("@")) throw new Error("Invalid email");
    setContact((c) => ({ ...c, [key]: value }));
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader title="Burak Şen" description="Click a value to edit · Enter saves · Escape cancels" />
      <CardBody>
        <DescriptionList
          onEdit={save}
          items={[
            { key: "company", label: "Company", value: "Kadıköy Bistro" },
            { key: "email", label: "Email", value: contact.email, editable: true, inputType: "email" },
            { key: "phone", label: "Phone", value: contact.phone, editable: true, inputType: "tel" },
            { key: "website", label: "Website", value: contact.website, editable: true, inputType: "url" },
          ]}
        />
      </CardBody>
    </Card>
  );
}
