import { PageIntro } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Ruled: title at the start, up to three facts behind a vertical rule, a hairline below.
export default function PageIntroRuled() {
  return (
    <SiteFrame>
      <PageIntro
        variant="ruled"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Massage at home" }]}
        title="Massage at *home*"
        lead="A therapist, a folding table and warm towels at your door within the day."
        meta={[
          { label: "Service area", value: "Asian side, Kadıköy to Pendik" },
          { label: "From", value: "₺2,800 · 60 minutes" },
          { label: "Book by", value: "14:00 for the same evening" },
        ]}
      />
    </SiteFrame>
  );
}
