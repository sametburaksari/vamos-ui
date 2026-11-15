import { NewsTicker, newsLabelsTr } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// A continuous crawl (the kit Marquee), Turkish labels, ink tag.
export default function NewsTickerMarquee() {
  return (
    <SiteFrame>
      <div className="vb-container py-6">
        <NewsTicker
          mode="marquee"
          tone="ink"
          locale="tr-TR"
          labels={newsLabelsTr}
          items={[
            { title: "Gece tramvayı geri dönüyor", href: "/sehir/tramvay" },
            { title: "Liman dört elektrikli vinç sipariş etti", href: "/ekonomi/vinc" },
            { title: "Deniz çayırları körfeze geri dönüyor", href: "/bilim/deniz-cayiri" },
            { title: "Sahil maratonu startı 07.00’ye çekti", href: "/spor/maraton" },
          ]}
        />
      </div>
    </SiteFrame>
  );
}
