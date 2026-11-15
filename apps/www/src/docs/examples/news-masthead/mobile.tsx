"use client";

import { NewsHeader, NewsTopBar, newsLabelsTr } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

// Phone width, Turkish: the masthead row hides, the section bar keeps the wordmark, the menu
// button opens the drawer with every section and sub-section.
export default function NewsMastheadMobile() {
  return (
    <SiteFrame width={390}>
      <div className="min-h-[20rem]">
        <NewsTopBar date="2026-11-15" weather={{ temp: 14, place: "Kıyıkent", condition: "partly-cloudy" }} auth={{ joinHref: "/uye-ol" }} locale="tr-TR" labels={newsLabelsTr} />
        <NewsHeader
          brand="Kıyı Gazetesi"
          locale="tr-TR"
          labels={newsLabelsTr}
          sticky={false}
          nav={[
            { label: "Şehir", href: "/sehir", mega: [{ id: "all", label: "Tümü", href: "/sehir", posts: stories.slice(0, 4) }, { id: "ulasim", label: "Ulaşım", href: "/sehir/ulasim", posts: stories.slice(0, 2) }] },
            { label: "Ekonomi", href: "/ekonomi" },
            { label: "Görüş", href: "/gorus" },
          ]}
          more={[{ label: "Bulmaca", href: "/bulmaca" }]}
        />
      </div>
    </SiteFrame>
  );
}
