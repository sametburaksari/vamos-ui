import { NewsTicker } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

// One headline at a time; hover, focus or the pause button stops it.
export default function NewsTickerDemo() {
  return (
    <SiteFrame>
      <div className="vb-container py-6">
        <NewsTicker
          items={[
            { title: "Swing bridge closes at 22:00 tonight for six weeks", href: "/city/bridge", category: "Traffic", breaking: true },
            ...stories.slice(0, 4).map((s) => ({ title: s.title, href: s.href, category: s.category?.label })),
          ]}
        />
      </div>
    </SiteFrame>
  );
}
