"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@vamos-cms/ui";

const KEY = "deal-panel-sections";

// Remember which sections are open: control `value` and store it yourself.
export default function AccordionPersisted() {
  const [open, setOpen] = React.useState<string[]>(["contact"]);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setOpen(JSON.parse(saved));
    } catch {}
  }, []);

  const change = (next: string[]) => {
    setOpen(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  return (
    <Accordion type="multiple" variant="separated" value={open} onValueChange={change} className="max-w-md">
      <AccordionItem value="contact">
        <AccordionTrigger meta="Laura Callahan">Primary contact</AccordionTrigger>
        <AccordionContent>laura.callahan@northwind.example · +44 20 7946 0958</AccordionContent>
      </AccordionItem>
      <AccordionItem value="terms">
        <AccordionTrigger meta="Net 30">Payment terms</AccordionTrigger>
        <AccordionContent>Invoices due 30 days after issue. 2% early payment discount within 10 days.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="notes">
        <AccordionTrigger>Internal notes</AccordionTrigger>
        <AccordionContent>Renewal decision expected after their board meeting on Dec 3.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
