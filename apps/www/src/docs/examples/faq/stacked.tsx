import { Faq } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Stacked: title above, accordion at a 42rem measure. Answers are RichDoc (links, lists, bold).
// exclusive={false} lets several answers stay open.
export default function FaqStacked() {
  return (
    <SiteFrame>
      <Faq
        variant="stacked"
        exclusive={false}
        title="Billing questions"
        lead="Ledgerly bills per workspace, monthly or yearly. Prices exclude VAT."
        items={[
          {
            q: "What happens when the trial ends?",
            a: { type: "doc", content: [{ type: "paragraph", content: [{ text: "Nothing is charged automatically. Pick a plan within 14 days or the workspace becomes " }, { text: "read-only", marks: [{ type: "bold" }] }, { text: " — your conversations stay." }] }] },
          },
          {
            q: "Can I pay by bank transfer?",
            a: {
              type: "doc",
              content: [
                { type: "paragraph", content: [{ text: "Yes, on yearly plans. We send an e-Arşiv invoice; transfer within 7 days to:" }] },
                { type: "list", items: [{ content: [{ type: "paragraph", content: [{ text: "Garanti BBVA, Kadıköy branch" }] }] }, { content: [{ type: "paragraph", content: [{ text: "Reference: your workspace id" }] }] }] },
              ],
            },
          },
          {
            q: "How do refunds work?",
            a: { type: "doc", content: [{ type: "paragraph", content: [{ text: "Unused months of a yearly plan are refunded pro rata. See the " }, { text: "terms", marks: [{ type: "link", href: "/terms#refunds" }] }, { text: "." }] }] },
          },
        ]}
      />
    </SiteFrame>
  );
}
