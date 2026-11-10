// Site blocks shared by the block-editor examples: defined once, rendered by the site and the editor.
import { Container, Section, SectionHeader, BlockLink, RichText, type BlockComponentProps, type RichDoc } from "@vamos-ui/react/blocks";
import { z, f, defineBlock, createRegistry, type VamosDoc } from "@vamos-ui/react/blocks/schema";

// ---------------------------------------------------------------- Hero

type HeroProps = BlockComponentProps<{
  eyebrow?: string;
  title: string;
  lead?: string;
  actions?: { link: { href: string; label: string; newTab?: boolean }; style: "primary" | "secondary" | "link" }[];
}>;

export function Hero({ id = "hero", variant, eyebrow, title, lead, actions, headingLevel = 2, theme, anchor, components, labels, editMode }: HeroProps) {
  const hid = `${id}-title`;
  return (
    <Section theme={theme} anchor={anchor} headingId={hid} blockId={id} blockType="hero" editMode={editMode} components={components}>
      <Container>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          lead={lead}
          size="l"
          align={variant === "split" ? "split" : "start"}
          headingLevel={headingLevel}
          headingId={hid}
          editMode={editMode}
          actions={actions?.map((a) => (
            <BlockLink key={a.link.href} href={a.link.href} newTab={a.link.newTab} appearance={a.style} components={components} labels={labels}>
              {a.link.label}
            </BlockLink>
          ))}
        />
      </Container>
    </Section>
  );
}

export const heroBlock = defineBlock({
  type: "hero",
  version: 1,
  title: "Hero",
  description: "Page title, lead and up to two actions.",
  category: "intro",
  icon: "layout-template",
  keywords: ["banner", "intro", "header"],
  variants: ["stacked", "split"],
  defaultVariant: "stacked",
  variantMeta: { stacked: { label: "Stacked" }, split: { label: "Split" } },
  supports: { pageTitle: true },
  schema: z.object({
    eyebrow: f.text({ max: 40, label: "Eyebrow" }).optional(),
    title: f.heading({ max: 90, label: "Title" }),
    lead: f.text({ max: 280, multiline: true, label: "Lead" }).optional(),
    actions: f.list(f.cta(), { max: 2, label: "Actions", itemLabel: "Action {n}" }).optional(),
  }),
  preview: {
    props: {
      eyebrow: "Scheduling for clinics",
      title: "Every chair, *booked*.",
      lead: "Harbor fills cancellations from your waitlist in minutes and sends reminders patients actually read.",
      actions: [{ link: { href: "/signup", label: "Start free trial" }, style: "primary" }, { link: { href: "/demo", label: "Book a demo" }, style: "link" }],
    },
  },
  component: Hero,
});

// ---------------------------------------------------------------- Pricing

type PricingProps = BlockComponentProps<{
  title: string;
  lead?: string;
  plans: { name: string; price: string; period?: string; features?: string[]; featured?: boolean }[];
}>;

export function Pricing({ id = "pricing", title, lead, plans, headingLevel = 2, theme, anchor, editMode }: PricingProps) {
  const hid = `${id}-title`;
  return (
    <Section theme={theme} anchor={anchor} headingId={hid} blockId={id} blockType="pricing" editMode={editMode}>
      <Container className="flex flex-col gap-10">
        <SectionHeader title={title} lead={lead} headingLevel={headingLevel} headingId={hid} editMode={editMode} />
        <ul className="grid gap-px overflow-hidden rounded-ui border border-line bg-line @2xl:grid-cols-3">
          {plans.map((p) => (
            <li key={p.name} className="flex flex-col gap-4 bg-scene p-6" data-featured={p.featured ? "" : undefined}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-h3 font-semibold text-fg">{p.name}</h3>
                {p.featured ? <span className="font-mono text-eyebrow uppercase tracking-[0.08em] text-accent-ink">Most chosen</span> : null}
              </div>
              <p className="tabular text-display-m font-display text-fg">
                {p.price}
                {p.period ? <span className="ms-1 text-small text-fg-muted">/ {p.period}</span> : null}
              </p>
              {p.features?.length ? (
                <ul className="flex flex-col gap-2 border-t border-line pt-4 text-small text-fg-muted">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export const pricingBlock = defineBlock({
  type: "pricing",
  version: 1,
  title: "Pricing table",
  description: "Two to four plans side by side.",
  category: "conversion",
  icon: "tag",
  keywords: ["plans", "price", "tiers"],
  schema: z.object({
    title: f.heading({ max: 70, label: "Title" }),
    lead: f.text({ max: 200, multiline: true, label: "Lead" }).optional(),
    plans: f.list(
      f.group({
        name: f.text({ max: 30, label: "Plan name" }),
        price: f.text({ max: 16, localized: false, label: "Price" }),
        period: f.text({ max: 16, label: "Period" }).optional(),
        features: f.list(f.text({ max: 60, localized: false }), { max: 6, label: "Features", itemLabel: "Feature {n}" }).optional(),
        featured: f.toggle({ label: "Highlight this plan" }).optional(),
      }),
      { min: 1, max: 4, label: "Plans", itemLabel: "Plan {n}" },
    ),
  }),
  preview: {
    props: {
      title: "Simple *pricing*",
      plans: [
        { name: "Solo", price: "$29", period: "month", features: ["1 practitioner", "SMS reminders"] },
        { name: "Clinic", price: "$89", period: "month", features: ["Up to 8 chairs", "Waitlist autofill", "Online payments"], featured: true },
        { name: "Group", price: "$240", period: "month", features: ["Unlimited locations", "SSO and audit log"] },
      ],
    },
  },
  component: Pricing,
});

// ---------------------------------------------------------------- FAQ

type FaqProps = BlockComponentProps<{ title: string; items: { q: string; a: RichDoc }[] }>;

export function Faq({ id = "faq", title, items, headingLevel = 2, theme, anchor, components, editMode }: FaqProps) {
  const hid = `${id}-title`;
  return (
    <Section theme={theme} anchor={anchor} headingId={hid} blockId={id} blockType="faq" editMode={editMode}>
      <Container size="prose">
        <SectionHeader title={title} headingLevel={headingLevel} headingId={hid} editMode={editMode} />
        <dl className="mt-8 divide-y divide-line border-y border-line">
          {items.map((it) => (
            <div key={it.q} className="py-5">
              <dt className="text-h3 font-semibold text-fg">{it.q}</dt>
              <dd className="mt-2 text-fg-muted">
                <RichText doc={it.a} components={components} />
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}

export const faqBlock = defineBlock({
  type: "faq",
  version: 1,
  title: "FAQ",
  description: "Questions with rich-text answers.",
  category: "content",
  icon: "help-circle",
  keywords: ["questions", "answers", "help"],
  schema: z.object({
    title: f.heading({ max: 70, label: "Title" }),
    items: f.list(f.group({ q: f.text({ max: 140, label: "Question" }), a: f.rich({ nodes: ["paragraph", "list"], marks: ["bold", "italic", "link"], label: "Answer" }) }), { min: 1, max: 12, label: "Questions", itemLabel: "Question {n}" }),
  }),
  preview: {
    props: {
      title: "Before you *switch*",
      items: [
        { q: "Can we import our patient list?", a: { type: "doc", content: [{ type: "paragraph", content: [{ text: "Yes. Upload a CSV or connect your current system and we map the fields with you." }] }] } },
        { q: "Is there a contract?", a: { type: "doc", content: [{ type: "paragraph", content: [{ text: "No. Plans are monthly and you can cancel from settings at any time." }] }] } },
      ],
    },
  },
  component: Faq,
});

export const siteBlocks = createRegistry([heroBlock, pricingBlock, faqBlock]);

// ---------------------------------------------------------------- A landing page draft

export const landingDraft: VamosDoc = {
  version: 1,
  lang: "en",
  blocks: [
    { id: "b_hero01", type: "hero", v: 1, variant: "stacked", props: heroBlock.sample() as Record<string, unknown> },
    { id: "b_h2why1", type: "heading", props: { level: 2 }, anchor: "why-harbor", content: [{ text: "Why clinics " }, { text: "switch", marks: [{ type: "italic" }] }] },
    {
      id: "b_p_why1",
      type: "paragraph",
      content: [
        { text: "A dental chair that sits empty for an hour costs a practice about " },
        { text: "$180", marks: [{ type: "bold" }] },
        { text: ". Harbor watches your calendar and offers freed slots to the " },
        { text: "waitlist", marks: [{ type: "link", href: "/features/waitlist" }] },
        { text: " the moment a patient cancels." },
      ],
    },
    {
      id: "b_list01",
      type: "list",
      slots: {
        items: [
          { id: "b_li0001", type: "list-item", content: [{ text: "Two-way SMS reminders in 14 languages" }] },
          { id: "b_li0002", type: "list-item", content: [{ text: "Deposits for long treatments, refunded automatically" }] },
          { id: "b_li0003", type: "list-item", content: [{ text: "Works with the calendar your front desk already uses" }] },
        ],
      },
    },
    { id: "b_quote1", type: "quote", props: { cite: "Dr. Selin Arslan, Moda Dental" }, content: [{ text: "We filled 31 cancelled slots in the first month without making a single phone call." }] },
    { id: "b_price1", type: "pricing", v: 1, anchor: "pricing", props: pricingBlock.sample() as Record<string, unknown> },
    { id: "b_faq001", type: "faq", v: 1, props: faqBlock.sample() as Record<string, unknown> },
  ],
};
