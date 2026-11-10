import { Cta } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Minimal: no background change, a very large centred title and one huge text link. No buttons.
export default function CtaMinimal() {
  return (
    <SiteFrame>
      <Cta
        variant="minimal"
        title="Have a place people should *find*?"
        actions={[{ link: { href: "/contact", label: "Let’s talk about your project" }, style: "link" }]}
        fineprint="We reply within one working day. Studio Arda, Office Link, Cevizli."
      />
    </SiteFrame>
  );
}
