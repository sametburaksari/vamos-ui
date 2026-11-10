import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@vamos-cms/ui";

const faq = [
  { q: "Can I change plans in the middle of a billing cycle?", a: "Yes. Upgrades apply immediately and are prorated to the day; downgrades take effect at the next renewal." },
  { q: "How do refunds work?", a: "Annual plans can be refunded within 30 days. The amount goes back to the original card within 5–10 business days." },
  { q: "Do you offer discounts for non-profits?", a: "Registered non-profits get 40% off any plan. Send us your registration document from the billing page." },
  { q: "Where is my data stored?", a: "In Frankfurt (EU) by default. Enterprise workspaces can choose Istanbul or Virginia." },
];

export default function AccordionDemo() {
  return (
    <Accordion type="single" collapsible defaultValue="item-1" className="max-w-xl">
      {faq.map((f, i) => (
        <AccordionItem key={f.q} value={`item-${i}`}>
          <AccordionTrigger>{f.q}</AccordionTrigger>
          <AccordionContent>{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
