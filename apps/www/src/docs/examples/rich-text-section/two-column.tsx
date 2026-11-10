import { RichTextSection } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Two columns: newspaper columns on wide containers only; a single column on phones.
// Plain text works too: a blank line starts a new paragraph.
export default function RichTextSectionTwoColumn() {
  return (
    <SiteFrame>
      <RichTextSection
        variant="two-column"
        eyebrow="How we work"
        title="Fewer *pages*, kept up to date"
        body={[
          "Most small-business sites fail the same way: they launch with twenty pages and nobody touches them again. The opening hours go stale, the menu PDF is from last winter, and the booking link points at a form nobody reads.",
          "We start from the other end. Which three questions do your guests ask on the phone every day? Those become the first three pages, written in your words, with the answer in the first line.",
          "Then we hand over the keys. Your staff edit the menu from a phone, the hours sync to Google, and a booking request lands in the WhatsApp you already answer. We check the site every Monday and fix what we find.",
          "It is not a lot of pages. It is the right ones, true on the day a guest reads them.",
        ].join("\n\n")}
      />
    </SiteFrame>
  );
}
