import { Faq } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Columns: no accordion — short answers always open in two columns (maximally indexable).
export default function FaqColumns() {
  return (
    <SiteFrame>
      <Faq
        variant="columns"
        title="Good to *know*"
        contact={{ link: { href: "/contact", label: "Ask us anything" }, style: "link" }}
        items={[
          { q: "How long is a session?", a: "Laser sessions take 20–45 minutes depending on the area." },
          { q: "How many sessions will I need?", a: "Six to eight, four to six weeks apart." },
          { q: "Does it hurt?", a: "It feels like a rubber band snap. We cool the skin throughout." },
          { q: "Can I go in the sun after?", a: "Avoid direct sun for two weeks and use SPF 50." },
        ]}
      />
    </SiteFrame>
  );
}
