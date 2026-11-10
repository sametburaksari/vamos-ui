import { PageIntro } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Simple: breadcrumb, display-l title, the lead beside it on wide containers. The page's h1.
export default function PageIntroDemo() {
  return (
    <SiteFrame>
      <PageIntro
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Treatments", href: "/treatments" }, { label: "Hammam rituals" }]}
        title="Hammam rituals, *by the hour*"
        lead="Every ritual starts with twenty minutes on the warm stone. Prices include VAT and a pot of linden tea afterwards."
      />
    </SiteFrame>
  );
}
