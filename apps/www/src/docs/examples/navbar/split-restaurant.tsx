import { Navbar } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Restaurant / spa feel: the name dead centre, links on both sides, booking as a text link.
export default function NavbarSplitRestaurant() {
  return (
    <SiteFrame>
      <Navbar
        variant="split"
        skipLink={false}
        wordmark="Kıyı"
        items={[
          { label: "Menu", href: "/menu" },
          { label: "Wine", href: "/wine" },
          { label: "Private dining", href: "/private-dining" },
          { label: "Visit", href: "/visit" },
        ]}
        locales={[
          { code: "en", href: "/en" },
          { code: "tr", href: "/" },
        ]}
        actions={[{ link: { href: "/reservations", label: "Book a table" }, style: "primary" }]}
      />
      <div className="h-40" />
    </SiteFrame>
  );
}
