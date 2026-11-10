"use client";

import * as React from "react";
import { Field, Input, SlugInput } from "@vamos-cms/ui";

export default function SlugInputField() {
  const [name, setName] = React.useState("Enterprise onboarding");
  return (
    <div className="grid w-full max-w-lg gap-4">
      <Field label="Plan name">
        <Input value={name} onChange={(e) => setName(e.currentTarget.value)} />
      </Field>
      <Field label="URL" hint="Shows Auto while it follows the name. Edit it to lock it; the refresh button re-derives it.">
        <SlugInput source={name} prefix="vamos.ist/pricing/" name="slug" />
      </Field>
      <Field label="Saved page (starts locked)">
        <SlugInput source="About our studio" defaultValue="about" prefix="vamos.ist/" />
      </Field>
    </div>
  );
}
