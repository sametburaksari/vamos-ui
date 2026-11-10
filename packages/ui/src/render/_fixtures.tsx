// Test fixtures: two realistic blocks defined end to end (schema + component). Not exported.

import * as React from "react";
import { z } from "zod";
import { defineBlock, createRegistry } from "../blocks/schema/define-block";
import { f } from "../blocks/schema/fields";
import { Section, Container } from "../blocks/section";
import { SectionHeader } from "../blocks/section-header";
import { BlockLink } from "../blocks/block-link";
import { RichText } from "../blocks/rich-text";
import { BlockImage } from "../blocks/block-image";
import type { BlockComponentProps } from "../blocks/types";
import type { RichDoc } from "../blocks/schema/rich-doc";
import type { VamosDoc } from "../blocks/schema/types";

type IntroProps = BlockComponentProps<{
  eyebrow?: string;
  title: string;
  lead?: string;
  image?: { src: string; alt?: string; width: number; height: number };
  actions?: { link: { href: string; label: string; newTab?: boolean }; style: "primary" | "secondary" | "link" }[];
}>;

export function Intro({ eyebrow, title, lead, image, actions, headingLevel = 2, theme, anchor, id, components, labels, editMode }: IntroProps) {
  const hid = `${id ?? "intro"}-title`;
  return (
    <Section theme={theme} anchor={anchor} headingId={hid} blockId={id} editMode={editMode} components={components}>
      <Container className="grid gap-10 @4xl:grid-cols-12">
        <SectionHeader className="@4xl:col-span-7" eyebrow={eyebrow} title={title} lead={lead} headingLevel={headingLevel} headingId={hid} size="l"
          actions={actions?.map((a) => <BlockLink key={a.link.href} href={a.link.href} newTab={a.link.newTab} appearance={a.style} components={components} labels={labels}>{a.link.label}</BlockLink>)} />
        {image ? <BlockImage className="@4xl:col-span-5 rounded-ui" {...image} aspect="4:5" components={components} /> : null}
      </Container>
    </Section>
  );
}

export const introBlock = defineBlock({
  type: "intro",
  version: 2,
  title: "Page intro",
  category: "intro",
  variants: ["split", "plain"],
  supports: { pageTitle: true },
  schema: z.object({
    eyebrow: f.text({ max: 40 }).optional(),
    title: f.heading({ max: 90 }),
    lead: f.text({ multiline: true, max: 280 }).optional(),
    image: f.image({ aspect: "4:5" }).optional(),
    actions: f.list(f.cta(), { max: 2 }).optional(),
  }),
  migrate: { 1: (old: { heading?: string }) => ({ ...old, title: old.heading, heading: undefined }) },
  preview: { props: { eyebrow: "Cevizli, Istanbul", title: "Dinner, *slowly*.", lead: "Seasonal Aegean plates and a wine list that changes every Thursday." } },
  component: Intro,
});

type FaqProps = BlockComponentProps<{ title: string; items: { q: string; a: RichDoc }[] }>;

export function Faq({ title, items, headingLevel = 2, id, theme, anchor, components }: FaqProps) {
  const hid = `${id ?? "faq"}-title`;
  return (
    <Section theme={theme} anchor={anchor} headingId={hid}>
      <Container>
        <SectionHeader title={title} headingLevel={headingLevel} headingId={hid} />
        <dl className="mt-10 divide-y divide-line border-y border-line">
          {items.map((it) => (
            <div key={it.q} className="py-5">
              <dt className="text-h3 font-semibold">{it.q}</dt>
              <dd className="mt-2"><RichText doc={it.a} components={components} /></dd>
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
  category: "content",
  schema: z.object({
    title: f.heading(),
    items: f.list(f.group({ q: f.text({ max: 140 }), a: f.rich({ nodes: ["paragraph", "list"], marks: ["bold", "italic", "link"] }) }), { min: 1, max: 12 }),
  }),
  preview: {
    props: {
      title: "Before you *book*",
      items: [{ q: "Do you take walk-ins?", a: { type: "doc", content: [{ type: "paragraph", content: [{ text: "Yes, at the bar, from 6 pm." }] }] } }],
    },
  },
  jsonLd: (p) => ({
    "@type": "FAQPage",
    mainEntity: p.items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a.content.length } })),
  }),
  component: Faq,
});

type PostsProps = BlockComponentProps<{ title: string; query: unknown; posts?: { slug: string; title: string }[] }>;
export function PostList({ title, posts }: PostsProps) {
  return (
    <section aria-label={title}>
      {posts?.length ? <ul>{posts.map((p) => <li key={p.slug}>{p.title}</li>)}</ul> : <p>No posts yet.</p>}
    </section>
  );
}
export const postListBlock = defineBlock({
  type: "post-list",
  version: 1,
  title: "Blog list",
  category: "blog",
  schema: z.object({ title: f.heading(), query: f.query("posts") }),
  component: PostList,
});

export const testRegistry = createRegistry([introBlock, faqBlock, postListBlock]);

export const sampleDoc: VamosDoc = {
  version: 1,
  locales: ["en", "tr"],
  blocks: [
    {
      id: "b_intro1",
      type: "intro",
      v: 2,
      variant: "split",
      props: {
        eyebrow: { en: "Cevizli, Istanbul", tr: "Cevizli, İstanbul" },
        title: { en: "Dinner, *slowly*.", tr: "Akşam yemeği, *yavaşça*." },
        lead: { en: "Seasonal Aegean plates and a wine list that changes every Thursday." },
        actions: [{ link: { href: "/reservations", label: { en: "Book a table", tr: "Masa ayırtın" } }, style: "primary" }],
      },
    },
    { id: "b_para01", type: "paragraph", content: [{ text: "We open at " }, { text: "6 pm", marks: [{ type: "bold" }] }, { text: " from Tuesday to Sunday." }] },
    {
      id: "b_faq001",
      type: "faq",
      v: 1,
      theme: { surface: "surface-2" },
      anchor: "faq",
      props: {
        title: { en: "Before you *book*", tr: "Rezervasyondan *önce*" },
        items: [
          {
            q: { en: "Do you take walk-ins?", tr: "Rezervasyonsuz gelebilir miyim?" },
            a: { type: "doc", content: [{ type: "paragraph", content: [{ text: "Yes, at the bar from 6 pm. Tables are " }, { text: "booked online", marks: [{ type: "link", href: "/reservations" }] }, { text: "." }] }] },
          },
        ],
      },
    },
  ],
};
