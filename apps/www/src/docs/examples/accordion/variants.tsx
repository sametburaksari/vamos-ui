import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@vamos-cms/ui";

const policies = [
  { id: "leave", title: "Annual leave", body: "20 working days per calendar year, plus public holidays. Up to 5 days carry over to the next year." },
  { id: "remote", title: "Remote work", body: "Work from anywhere in the country up to 3 days a week. Fully remote by agreement with your manager." },
  { id: "expenses", title: "Expenses", body: "Submit receipts within 30 days. Reimbursements are paid with the next payroll run." },
];

function Policies({ variant }: { variant: "plain" | "separated" | "card" }) {
  return (
    <Accordion type="multiple" variant={variant} defaultValue={["leave"]}>
      {policies.map((p) => (
        <AccordionItem key={p.id} value={p.id}>
          <AccordionTrigger>{p.title}</AccordionTrigger>
          <AccordionContent>{p.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default function AccordionVariants() {
  return (
    <div className="grid w-full gap-8 md:grid-cols-3">
      {(["plain", "separated", "card"] as const).map((v) => (
        <div key={v} className="flex flex-col gap-2">
          <p className="font-mono text-[11px] text-fg-subtle">{v}</p>
          <Policies variant={v} />
        </div>
      ))}
    </div>
  );
}
