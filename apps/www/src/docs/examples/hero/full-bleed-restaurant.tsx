import { Hero, Navbar } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos } from "../_site-1/assets";

// Restaurant, venue: full-screen photo (or muted MP4 via `video`, poster = media) under a
// bottom-up scrim, title bottom-start, today's hours + booking bottom-end. Always dark.
export default function HeroFullBleedRestaurant() {
  return (
    <SiteFrame>
      <Navbar
        overlay
        skipLink={false}
        wordmark="Kıyı"
        items={[
          { label: "Menu", href: "/menu" },
          { label: "Wine", href: "/wine" },
          { label: "Visit", href: "/visit" },
        ]}
        actions={[{ link: { href: "/reservations", label: "Book a table" }, style: "secondary" }]}
      />
      <Hero
        variant="full-bleed"
        eyebrow="Meyhane · Cevizli"
        title="Dinner, *slowly*."
        lead="Twenty-two cold meze and fish from the morning boats."
        actions={[{ link: { href: "/menu", label: "Tonight’s menu" }, style: "link" }]}
        media={photos.diningRoom}
        aside={{
          title: "Open today",
          body: "18:00 – 00:30 · kitchen until 23:00",
          cta: { link: { href: "/reservations", label: "Book a table" }, style: "primary" },
        }}
      />
    </SiteFrame>
  );
}
