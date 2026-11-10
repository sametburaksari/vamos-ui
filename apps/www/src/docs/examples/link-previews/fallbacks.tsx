import { SearchPreview, SocialCardPreview } from "@vamos-cms/ui/media";

// Missing fields show greyed fallbacks; a wrong image ratio and noindex get warnings in words.
export default function LinkPreviewsFallbacks() {
  return (
    <div className="grid w-full gap-8 md:grid-cols-2">
      <SearchPreview data={{ url: "https://peradental.com/draft/implants-faq", title: "", noindex: true }} size="sm" />
      <div className="grid gap-6">
        <SocialCardPreview data={{ url: "https://peradental.com/implants", title: "Dental Implants in Şişli — Pera Dental", image: null }} platform="facebook" size="sm" />
        <SocialCardPreview
          data={{
            url: "https://peradental.com/team",
            title: "Meet the Pera Dental team",
            image: { id: "sq", kind: "image", mime: "image/jpeg", filename: "team-square.jpg", size: 98_000, url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop&crop=faces", width: 800, height: 800, alt: "", createdAt: "2026-11-01T00:00:00Z" },
          }}
          platform="linkedin"
          size="sm"
        />
      </div>
    </div>
  );
}
