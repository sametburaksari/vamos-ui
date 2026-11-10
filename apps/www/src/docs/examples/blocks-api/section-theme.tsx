import { Section, Container, SectionHeader, BlockLink } from "@vamos-ui/react/blocks";

const photo = { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=70&auto=format&fit=crop", width: 1600, height: 1067, focal: { x: 0.5, y: 0.6 } };

// Theme per section: tokens cascade, block code knows nothing about colours.
export default function BlocksApiSectionTheme() {
  return (
    <div className="w-full overflow-hidden rounded-ui border border-line">
      <Section theme={{ surface: "media", background: photo, rhythm: "loose" }} headingId="t-media">
        <Container>
          <SectionHeader eyebrow="Media surface" title="Fish from the *morning* boats" lead="A photo under a scrim; the section is forced dark so text stays readable." headingId="t-media" />
        </Container>
      </Section>
      <Section theme={{ mode: "light", surface: "surface-2", rhythm: "tight" }} headingId="t-light">
        <Container>
          <SectionHeader eyebrow="Light · surface-2" title="Lunch on *weekends*" lead="A light section keeps its own accent ink, even inside a dark page." headingId="t-light" actions={<BlockLink href="/brunch" appearance="secondary">Brunch menu</BlockLink>} />
        </Container>
      </Section>
      <Section theme={{ surface: "accent", accent: "ember", rhythm: "tight" }} headingId="t-accent">
        <Container>
          <SectionHeader eyebrow="Accent · ember" title="Private room for *twelve*" headingId="t-accent" actions={<BlockLink href="/events" appearance="primary">Plan an evening</BlockLink>} />
        </Container>
      </Section>
      <Section theme={{ mode: "dark", accent: "oklch(0.8 0.12 190)", rhythm: "tight" }} headingId="t-custom">
        <Container>
          <SectionHeader eyebrow="Dark · custom oklch accent" title="The raki *list*" lead="Custom accents derive their ink and foreground automatically." headingId="t-custom" actions={<BlockLink href="/drinks" appearance="primary">Drinks</BlockLink>} />
        </Container>
      </Section>
    </div>
  );
}
