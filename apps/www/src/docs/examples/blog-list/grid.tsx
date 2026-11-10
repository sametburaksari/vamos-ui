import { BlogList } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos, more } from "../_site-2/data";

// Grid: three columns of 3:2 covers, no card frame — the image carries the radius. SaaS guides.
export default function BlogListGrid() {
  return (
    <SiteFrame>
      <BlogList
        variant="grid"
        eyebrow="Guides"
        title="Run a calmer *front desk*"
        posts={[
          { href: "/guides/no-shows", title: "Cut no-shows with deposits that don’t scare guests off", category: { label: "Bookings" }, cover: photos.spaRoom, publishedAt: "2026-11-04", readingMinutes: 7 },
          { href: "/guides/whatsapp-templates", title: "Five WhatsApp reminder templates Meta approves first time", category: { label: "Messaging" }, cover: more.laptop, publishedAt: "2026-10-21", readingMinutes: 5 },
          { href: "/guides/google-profile", title: "Your Google Business Profile, set up in an afternoon", category: { label: "Local SEO" }, cover: more.clinic, publishedAt: "2026-10-09", readingMinutes: 9 },
        ]}
      />
    </SiteFrame>
  );
}
