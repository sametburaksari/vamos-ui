import { SocialCardPreview, type LinkPreviewData, type SocialPlatform } from "@vamos-cms/ui/media";

const quote: LinkPreviewData = {
  url: "https://kalamisbistro.com/events/new-years-eve-2026",
  title: "New Year's Eve at Kalamış Bistro — Seven Courses by the Marina",
  description: "A seven-course tasting menu, live jazz trio and a midnight toast on the terrace. 64 seats, from ₺6,500 per guest.",
  siteName: "Kalamış Bistro",
  image: { id: "og_1", kind: "image", mime: "image/jpeg", filename: "nye-og.jpg", size: 182_000, url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=630&q=80&auto=format&fit=crop", width: 1200, height: 630, alt: "", createdAt: "2026-11-05T10:00:00Z" },
};

const platforms: SocialPlatform[] = ["facebook", "linkedin", "x", "whatsapp", "slack"];

export default function LinkPreviewsSocial() {
  return (
    <div className="grid w-full gap-8 md:grid-cols-2">
      {platforms.map((p) => (
        <div key={p} className="grid content-start gap-2">
          <p className="text-[12px] font-medium text-fg-muted capitalize">{p === "x" ? "X" : p}</p>
          <SocialCardPreview data={quote} platform={p} size="sm" />
        </div>
      ))}
    </div>
  );
}
