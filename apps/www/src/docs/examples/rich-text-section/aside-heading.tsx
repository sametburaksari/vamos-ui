import { RichTextSection } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Aside heading: a sticky title on the start side, the text on the end side — legal texts.
// Body headings shift one level below the block title (h2 → h3).
export default function RichTextSectionAsideHeading() {
  return (
    <SiteFrame>
      <RichTextSection
        variant="aside-heading"
        eyebrow="Legal"
        title="Privacy notice"
        note="Last updated 4 November 2026"
        size="sm"
        body={{
          type: "doc",
          content: [
            { type: "heading", level: 2, content: [{ text: "Who we are" }] },
            { type: "paragraph", content: [{ text: "Lena Clinic (Lena Sağlık Hizmetleri Ltd. Şti.), Bağdat Cd. 312, Suadiye, Istanbul, is the data controller for the personal data you share with us through this website." }] },
            { type: "heading", level: 2, content: [{ text: "What we collect" }] },
            {
              type: "list",
              items: [
                { content: [{ type: "paragraph", content: [{ text: "Your name, phone number and preferred time when you request an appointment." }] }] },
                { content: [{ type: "paragraph", content: [{ text: "Health information you choose to write in the message field — only to prepare your consultation." }] }] },
                { content: [{ type: "paragraph", content: [{ text: "Analytics cookies, only after you accept them in the consent banner." }] }] },
              ],
            },
            { type: "heading", level: 2, content: [{ text: "Your rights" }] },
            { type: "paragraph", content: [{ text: "Under KVKK article 11 and the GDPR you can ask what we hold about you, correct it or have it deleted. Write to " }, { text: "kvkk@lena.example", marks: [{ type: "link", href: "mailto:kvkk@lena.example" }] }, { text: "; we reply within 30 days." }] },
          ],
        }}
      />
    </SiteFrame>
  );
}
