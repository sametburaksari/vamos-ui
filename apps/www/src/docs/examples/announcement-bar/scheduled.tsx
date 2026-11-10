import { AnnouncementBar } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Time-boxed: rendered only between `from` and `until` (exclusive). `now` pins the clock here;
// on statically cached pages, revalidate at the boundaries in your app.
export default function AnnouncementBarScheduled() {
  return (
    <SiteFrame>
      <div className="flex flex-col gap-px bg-line">
        <AnnouncementBar
          text="New year’s eve: one sitting at 20:00, set menu ₺4,800 per person."
          link={{ href: "/new-year", label: "Reserve" }}
          from="2026-12-01T00:00:00+03:00"
          until="2027-01-01T06:00:00+03:00"
          now="2026-12-15T12:00:00+03:00"
        />
        <AnnouncementBar
          text="This notice expired on 31 October and renders nothing."
          until="2026-10-31T23:59:00+03:00"
          now="2026-12-15T12:00:00+03:00"
        />
        <p className="bg-scene px-4 py-3 text-small text-fg-muted">The second bar is outside its schedule, so only one bar is shown.</p>
      </div>
    </SiteFrame>
  );
}
