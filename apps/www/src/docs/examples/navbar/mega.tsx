import { Navbar } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Items with children get a disclosure dropdown (a ~1 KB island, only when needed):
// Enter/Space toggles, ArrowDown moves into the links, Escape closes and returns focus.
export default function NavbarMega() {
  return (
    <SiteFrame>
      <Navbar
        skipLink={false}
        wordmark="Defne Clinic"
        currentPath="/treatments/laser"
        items={[
          {
            label: "Treatments",
            href: "/treatments",
            children: [
              { label: "Laser hair removal", href: "/treatments/laser", description: "Diode laser, 6–8 sessions, from ₺1,200" },
              { label: "Skin care", href: "/treatments/skin", description: "Hydrafacial, peels and medical facials" },
              { label: "Injectables", href: "/treatments/injectables", description: "Botox and fillers by our two physicians" },
              { label: "Body contouring", href: "/treatments/body", description: "Cryolipolysis and radiofrequency" },
            ],
          },
          { label: "Prices", href: "/prices" },
          { label: "Doctors", href: "/doctors" },
          { label: "Contact", href: "/contact" },
        ]}
        phone="+902164441234"
        actions={[{ link: { href: "/appointment", label: "Book a consultation" }, style: "primary" }]}
      />
      <div className="h-72" />
    </SiteFrame>
  );
}
