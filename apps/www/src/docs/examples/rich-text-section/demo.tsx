import { RichTextSection } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Column: a 42rem column placed on grid columns 2–9 (not centred), with an editorial drop cap.
export default function RichTextSectionDemo() {
  return (
    <SiteFrame>
      <RichTextSection
        title="How we *started*"
        dropCap
        body={{
          type: "doc",
          content: [
            { type: "paragraph", content: [{ text: "Kıyı opened in 2011 as a six-table meyhane next to the Cevizli fish market. The menu was whatever the boats brought in, written on a slate by the door, and the rakı came from a cabinet behind the till." }] },
            { type: "paragraph", content: [{ text: "Fifteen years later the slate is still there. So is " }, { text: "Hüseyin Usta", marks: [{ type: "bold" }] }, { text: ", who has cleaned every sea bass we’ve served, and who still refuses to put bonito on the menu before the first cold week of October." }] },
            { type: "blockquote", content: [{ type: "paragraph", content: [{ text: "If the fish is good, you don’t need a sauce. If it isn’t, no sauce will save it." }] }], cite: "Hüseyin Usta" },
            { type: "paragraph", content: [{ text: "We now seat sixty, take bookings on WhatsApp and keep a " }, { text: "wine list", marks: [{ type: "link", href: "/wine" }] }, { text: " that changes every Thursday. The fish still decides the menu." }] },
          ],
        }}
      />
    </SiteFrame>
  );
}
