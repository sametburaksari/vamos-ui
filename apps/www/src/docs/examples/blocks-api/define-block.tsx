import { Section, Container, SectionHeader, BlockHeading, RichText, type BlockComponentProps, type RichDoc } from "@vamos-cms/ui/blocks";
import { z, f, defineBlock, createRegistry } from "@vamos-cms/ui/blocks/schema";
import { renderDoc } from "@vamos-cms/ui/render";

// 1. The component: plain props, server-rendered, themed by tokens.
type TreatmentsProps = BlockComponentProps<{ title: string; items: { name: string; minutes: number; note: RichDoc }[] }>;

function Treatments({ id = "treatments", title, items, headingLevel = 2, theme, anchor, components }: TreatmentsProps) {
  return (
    <Section theme={theme} anchor={anchor} headingId={`${id}-t`}>
      <Container>
        <SectionHeader title={title} headingLevel={headingLevel} headingId={`${id}-t`} />
        <ol className="mt-10 border-t border-line">
          {items.map((it, i) => (
            <li key={it.name} className="grid gap-x-6 gap-y-2 border-b border-line py-6 @2xl:grid-cols-[3rem_1fr_6rem]">
              <span className="tabular font-mono text-eyebrow text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex flex-col gap-2">
                <BlockHeading level={3} size="h3" text={it.name} />
                <RichText doc={it.note} size="sm" components={components} />
              </div>
              <span className="tabular text-small text-fg-muted @2xl:text-end">{it.minutes} min</span>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

// 2. The definition: schema (validation + editor fields + JSON Schema), version, preview.
const treatmentsBlock = defineBlock({
  type: "treatments",
  version: 1,
  title: "Treatments",
  category: "content",
  schema: z.object({
    title: f.heading({ max: 60 }),
    items: f.list(f.group({ name: f.text({ max: 60 }), minutes: f.number({ min: 15, max: 240, int: true }), note: f.rich({ nodes: ["paragraph"], marks: ["bold", "italic"] }) }), { min: 1, max: 12, itemLabel: "Treatment {n}" }),
  }),
  component: Treatments,
});

// 3. Stored content → page.
const note = (text: string): RichDoc => ({ type: "doc", content: [{ type: "paragraph", content: [{ text }] }] });

export default function BlocksApiDefineBlock() {
  return (
    <div className="w-full overflow-hidden rounded-ui border border-line">
      {renderDoc(
        {
          version: 1,
          blocks: [
            {
              id: "b_treat01",
              type: "treatments",
              v: 1,
              theme: { rhythm: "tight" },
              props: {
                title: "Three rituals, *no rush*",
                items: [
                  { name: "Hammam & kese", minutes: 50, note: note("Warm marble, a black-soap scrub and a cold rinse to close.") },
                  { name: "Deep-tissue massage", minutes: 75, note: note("For desk shoulders. Tell us where it hurts; we skip the rest.") },
                  { name: "Facial with clay mask", minutes: 45, note: note("Gentle enough for the day before an event.") },
                ],
              },
            },
          ],
        },
        { registry: createRegistry([treatmentsBlock]) },
      )}
    </div>
  );
}
