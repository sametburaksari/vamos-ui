import { Hero, Navbar } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos } from "../_site-1/assets";

// Minimal + overlay over a full-bleed hero. "Menu" opens a full-screen native popover
// (0 JS) with display-size links and the address at the bottom. Escape closes it.
export default function NavbarMinimalOverlay() {
  return (
    <SiteFrame>
      <Navbar
        variant="minimal"
        overlay
        skipLink={false}
        wordmark="Kıyı"
        items={[
          { label: "Menu", href: "/menu" },
          { label: "Wine list", href: "/wine" },
          { label: "Private dining", href: "/private-dining" },
          { label: "Visit us", href: "/visit" },
        ]}
        actions={[{ link: { href: "/reservations", label: "Book a table" }, style: "primary" }]}
        phone="+902160000000"
        panelMeta={[
          { label: "Address", value: "Rıhtım Caddesi 14, Cevizli, Maltepe" },
          { label: "Hours", value: "Tue–Sun, 18:00–00:30" },
        ]}
      />
      <Hero variant="full-bleed" headingLevel={2} eyebrow="Meyhane · Cevizli" title="Dinner, *slowly*." lead="Twenty-two cold meze and fish from the morning boats." media={photos.diningRoom} />
    </SiteFrame>
  );
}
