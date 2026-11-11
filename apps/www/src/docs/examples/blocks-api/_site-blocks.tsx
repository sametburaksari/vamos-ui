// Two site blocks defined once (schema + component), shared by the blocks-api examples.
import { Container, Section, SectionHeader, BlockImage, BlockLink, RichText, type BlockComponentProps } from "@vamos-ui/react/blocks";
import { z, f, defineBlock, createRegistry, type VamosDoc } from "@vamos-ui/react/blocks/schema";

const IMG_DINING = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=70&auto=format&fit=crop";
const IMG_TABLE = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=70&auto=format&fit=crop";
export { IMG_DINING, IMG_TABLE };

// ---------------------------------------------------------------- Intro

type IntroProps = BlockComponentProps<{
  eyebrow?: string;
  title: string;
  lead?: string;
  image?: { src: string; alt?: string; width: number; height: number; focal?: { x: number; y: number } };
  actions?: { link: { href: string; label: string; newTab?: boolean }; style: "primary" | "secondary" | "link" }[];
}>;

export function Intro({ id = "intro", eyebrow, title, lead, image, actions, headingLevel = 2, theme, anchor, components, labels, editMode }: IntroProps) {
  const hid = `${id}-title`;
  return (
    <Section theme={theme} anchor={anchor} headingId={hid} blockId={id} blockType="intro" editMode={editMode} components={components}>
      <Container className="grid items-end gap-x-(--gutter) gap-y-10 @2xl:grid-cols-12">
        <SectionHeader
          className="@2xl:col-span-7"
          eyebrow={eyebrow}
          title={title}
          lead={lead}
          size="l"
          headingLevel={headingLevel}
          headingId={hid}
          editMode={editMode}
          actions={actions?.map((a) => (
            <BlockLink key={a.link.href} href={a.link.href} newTab={a.link.newTab} appearance={a.style} components={components} labels={labels}>
              {a.link.label}
            </BlockLink>
          ))}
        />
        {image ? <BlockImage {...image} aspect="4:5" priority={headingLevel === 1} sizes="(min-width: 64rem) 34vw, 100vw" className="rounded-ui @2xl:col-span-5" components={components} /> : null}
      </Container>
    </Section>
  );
}

export const introBlock = defineBlock({
  type: "intro",
  version: 1,
  title: "Intro",
  category: "intro",
  supports: { pageTitle: true },
  schema: z.object({
    eyebrow: f.text({ max: 40, label: "Eyebrow" }).optional(),
    title: f.heading({ max: 90, label: "Title" }),
    lead: f.text({ max: 280, multiline: true, label: "Lead" }).optional(),
    image: f.image({ aspect: "4:5", label: "Photo" }).optional(),
    actions: f.list(f.cta(), { max: 2, label: "Actions" }).optional(),
  }),
  preview: { props: { eyebrow: "Cevizli, Istanbul", title: "Dinner, *slowly*.", lead: "Seasonal Aegean plates and a wine list that changes every Thursday." } },
  component: Intro,
});

// ---------------------------------------------------------------- Visit (hours + notes)

type VisitProps = BlockComponentProps<{ title: string; body: import("@vamos-ui/react/blocks").RichDoc; hours: { days: string; time: string }[] }>;

export function Visit({ id = "visit", title, body, hours, headingLevel = 2, theme, anchor, components, editMode }: VisitProps) {
  const hid = `${id}-title`;
  return (
    <Section theme={theme} anchor={anchor} headingId={hid} blockId={id} blockType="visit" editMode={editMode}>
      <Container className="grid gap-x-(--gutter) gap-y-10 @2xl:grid-cols-12">
        <div className="flex flex-col gap-6 @2xl:col-span-7">
          <SectionHeader title={title} headingLevel={headingLevel} headingId={hid} editMode={editMode} />
          <RichText doc={body} components={components} />
        </div>
        <dl className="self-end border-t border-line @2xl:col-span-4 @2xl:col-start-9">
          {hours.map((h) => (
            <div key={h.days} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
              <dt className="text-small text-fg-muted">{h.days}</dt>
              <dd className="tabular font-mono text-small text-fg">{h.time}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}

export const visitBlock = defineBlock({
  type: "visit",
  version: 1,
  title: "Visit",
  category: "local",
  schema: z.object({
    title: f.heading({ max: 60 }),
    body: f.rich({ nodes: ["paragraph", "list"], marks: ["bold", "italic", "link"] }),
    hours: f.list(f.group({ days: f.text({ max: 24 }), time: f.text({ max: 24, localized: false }) }), { min: 1, max: 7 }),
  }),
  component: Visit,
});

export const siteBlocks = createRegistry([introBlock, visitBlock]);

// ---------------------------------------------------------------- A page as JSON (en + tr)

export const kiyiPage: VamosDoc = {
  version: 1,
  locales: ["en", "tr"],
  seo: { title: { en: "Kıyı Meyhane — Cevizli", tr: "Kıyı Meyhane — Cevizli" } },
  blocks: [
    {
      id: "b_intro01",
      type: "intro",
      v: 1,
      theme: { mode: "dark", rhythm: "tight" },
      props: {
        eyebrow: { en: "Meyhane · Cevizli", tr: "Meyhane · Cevizli" },
        title: { en: "Dinner, *slowly*.", tr: "Akşam yemeği, *ağır ağır*." },
        lead: {
          en: "Twenty-two cold meze, fish from the morning boats and a raki list that runs to the back page.",
          tr: "Yirmi iki soğuk meze, sabah teknelerinden balık ve arka sayfaya uzanan bir rakı listesi.",
        },
        image: { src: IMG_DINING, width: 1200, height: 800, focal: { x: 0.55, y: 0.5 }, alt: { en: "The dining room at dusk, candles on oak tables", tr: "Akşam üstü yemek salonu, meşe masalarda mumlar" } },
        actions: [
          { link: { href: { en: "/en/reservations", tr: "/rezervasyon" }, label: { en: "Book a table", tr: "Masa ayırtın" } }, style: "primary" },
          { link: { href: "/menu", label: { en: "See the menu", tr: "Menüyü görün" } }, style: "link" },
        ],
      },
    },
    {
      id: "b_visit01",
      type: "visit",
      v: 1,
      anchor: "visit",
      theme: { rhythm: "tight" },
      props: {
        title: { en: "Find *us*", tr: "Bize *ulaşın*" },
        body: {
          en: {
            type: "doc",
            content: [
              { type: "paragraph", content: [{ text: "Rıhtım Caddesi 14, Cevizli. Five minutes from " }, { text: "Cevizli metro", marks: [{ type: "bold" }] }, { text: ", valet from 6 pm." }] },
              { type: "paragraph", content: [{ text: "Groups of eight or more: " }, { text: "write to us", marks: [{ type: "link", href: "mailto:masa@kiyi.example" }] }, { text: " a day ahead." }] },
            ],
          },
          tr: {
            type: "doc",
            content: [
              { type: "paragraph", content: [{ text: "Rıhtım Caddesi 14, Cevizli. " }, { text: "Cevizli metrosuna", marks: [{ type: "bold" }] }, { text: " beş dakika, 18.00’den sonra vale." }] },
              { type: "paragraph", content: [{ text: "Sekiz kişi ve üzeri gruplar bir gün önceden " }, { text: "bize yazsın", marks: [{ type: "link", href: "mailto:masa@kiyi.example" }] }, { text: "." }] },
            ],
          },
        },
        hours: [
          { days: { en: "Tue – Thu", tr: "Sal – Per" }, time: "18:00–00:00" },
          { days: { en: "Fri – Sat", tr: "Cum – Cmt" }, time: "18:00–02:00" },
          { days: { en: "Sun", tr: "Paz" }, time: "13:00–23:00" },
        ],
      },
    },
  ],
};
