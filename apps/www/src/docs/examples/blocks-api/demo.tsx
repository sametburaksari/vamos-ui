import { Section, Container, SectionHeader, BlockImage, BlockLink, RichText } from "@vamos-ui/react/blocks";

// A page section written as plain JSX — no CMS, no JSON, no schema.
export default function BlocksApiDemo() {
  return (
    <div className="w-full overflow-hidden rounded-ui border border-line">
      <Section theme={{ mode: "dark", rhythm: "tight" }} headingId="demo-title">
        <Container className="grid items-end gap-x-(--gutter) gap-y-10 @2xl:grid-cols-12">
          <SectionHeader
            className="@2xl:col-span-7"
            eyebrow="Meyhane · Cevizli"
            title="Dinner, *slowly*."
            lead="Twenty-two cold meze, fish from the morning boats and a raki list that runs to the back page."
            size="l"
            headingId="demo-title"
            actions={
              <>
                <BlockLink href="/reservations" appearance="primary">Book a table</BlockLink>
                <BlockLink href="/menu" appearance="link">See the menu</BlockLink>
              </>
            }
          />
          <BlockImage
            className="rounded-ui @2xl:col-span-5"
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=70&auto=format&fit=crop"
            alt="The dining room at dusk, candles on oak tables"
            width={900}
            height={600}
            aspect="4:5"
            focal={{ x: 0.55, y: 0.5 }}
            priority
          />
        </Container>
      </Section>
      <Section theme={{ rhythm: "tight" }} aria-label="About">
        <Container size="prose">
          <RichText
            doc={{
              type: "doc",
              content: [
                { type: "paragraph", content: [{ text: "We open at " }, { text: "6 pm", marks: [{ type: "bold" }] }, { text: ", Tuesday to Sunday. The bar takes walk-ins; tables are " }, { text: "booked online", marks: [{ type: "link", href: "/reservations" }] }, { text: "." }] },
              ],
            }}
          />
        </Container>
      </Section>
    </div>
  );
}
