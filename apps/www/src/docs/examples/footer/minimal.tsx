import { Footer } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Minimal: one row for landing pages — logo, a few links, socials, ©.
export default function FooterMinimal() {
  return (
    <SiteFrame>
      <Footer
        variant="minimal"
        brand={{ name: "Ledgerly", href: "/" }}
        columns={[{ title: "Links", links: [{ href: "/pricing", label: "Pricing" }, { href: "/changelog", label: "Changelog" }, { href: "/privacy", label: "Privacy" }] }]}
        social={[{ network: "x", href: "https://x.com/ledgerly" }, { network: "linkedin", href: "https://linkedin.com/company/ledgerly" }]}
        year={2026}
      />
    </SiteFrame>
  );
}
