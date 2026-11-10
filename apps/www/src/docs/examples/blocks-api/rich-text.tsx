import { RichText, type RichDoc } from "@vamos-cms/ui/blocks";

// RichDoc → semantic HTML on the server. No editor code ships to the site.
const policy: RichDoc = {
  type: "doc",
  content: [
    { type: "heading", level: 2, anchor: "cancellations", content: [{ text: "Cancellations" }] },
    { type: "paragraph", content: [{ text: "Cancel up to " }, { text: "24 hours", marks: [{ type: "bold" }] }, { text: " before your treatment at no charge. Later than that, we keep " }, { text: "half the deposit", marks: [{ type: "italic" }] }, { text: "." }] },
    {
      type: "list",
      items: [
        { content: [{ type: "paragraph", content: [{ text: "Reschedule once for free, by phone or " }, { text: "online", marks: [{ type: "link", href: "/account/bookings" }] }, { text: "." }] }] },
        { content: [{ type: "paragraph", content: [{ text: "Gift vouchers stay valid for 12 months." }] }] },
      ],
    },
    { type: "blockquote", cite: "Selin A., front desk", content: [{ type: "paragraph", content: [{ text: "Running late? Call us — we would rather shorten the massage than lose the slot." }] }] },
    { type: "hr" },
    { type: "paragraph", content: [{ text: "Questions: " }, { text: "+90 216 807 29 07", marks: [{ type: "link", href: "tel:+902168072907" }] }] },
  ],
};

export default function BlocksApiRichText() {
  return (
    <div className="w-full rounded-ui border border-line bg-surface p-8">
      <RichText doc={policy} />
    </div>
  );
}
