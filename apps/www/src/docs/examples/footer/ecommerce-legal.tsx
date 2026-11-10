import { Footer } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { spaFooter } from "./_props";

// E-commerce legal: full company details (legal name, tax office, tax no., MERSİS, trade registry),
// distance-sales and KVKK links, and a newsletter sign-up through the app's action.
export default function FooterEcommerceLegal() {
  return (
    <SiteFrame>
      <Footer
        {...spaFooter}
        legalLinks={[
          { href: "/mesafeli-satis", label: "Distance sales agreement" },
          { href: "/iade", label: "Cancellation and refunds" },
          { href: "/kvkk", label: "KVKK notice" },
          { href: "/cerezler", label: "Cookie policy" },
        ]}
        company={{
          legalName: "Moda Hamam Turizm ve Sağlık Hizmetleri A.Ş.",
          registry: [
            { label: "Tax office", value: "Kadıköy" },
            { label: "Tax no.", value: "612 038 4471" },
            { label: "MERSİS", value: "0612 0384 4710 0011" },
            { label: "Trade reg.", value: "İstanbul 845512" },
          ],
        }}
        newsletter={{ title: "Seasonal offers", hint: "One email a month: new treatments and gift-card dates. No spam." }}
        credit={{ href: "https://vamos.ist", label: "Vamos", newTab: true }}
      />
    </SiteFrame>
  );
}
