import { ArticleLayout } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Minimal: no cover, mono date above a large title — notes and announcements. `draft` adds the preview strip.
export default function ArticleMinimal() {
  return (
    <SiteFrame>
      <ArticleLayout
        variant="minimal"
        draft
        share={["copy"]}
        post={{
          title: "Closed 1–3 April for the *holiday*",
          dek: "We reopen Thursday at noon. Bookings for the weekend are open now.",
          publishedAt: "2026-03-20",
          body: {
            type: "doc",
            content: [
              { type: "paragraph", content: [{ text: "The whole team takes the Eid holiday off this year. The kitchen closes after service on " }, { text: "Tuesday 31 March", marks: [{ type: "bold" }] }, { text: " and we’re back on Thursday 2 April from 12:00." }] },
              { type: "paragraph", content: [{ text: "Deposits for bookings in those days are refunded automatically. Questions? " }, { text: "Message us on WhatsApp", marks: [{ type: "link", href: "https://wa.me/902160000000" }] }, { text: "." }] },
            ],
          },
        }}
      />
    </SiteFrame>
  );
}
