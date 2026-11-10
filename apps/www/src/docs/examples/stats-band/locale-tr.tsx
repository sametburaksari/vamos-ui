import { StatsBand, site1LabelsTr } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// The same figures in Turkish: Intl separators (4,8 · 1.240) and spoken units come from the locale.
export default function StatsBandLocaleTr() {
  return (
    <SiteFrame>
      <StatsBand
        locale="tr-TR"
        labels={site1LabelsTr}
        title="Rakamlarla *Kıyı*"
        items={[
          { value: 4.8, label: "Google puanı", source: "1.240 yorum · Kasım 2026" },
          { value: 1240, label: "Yorum" },
          { value: 63, unit: "%", label: "WhatsApp’tan gelen rezervasyon", source: "Ekim 2026" },
        ]}
      />
    </SiteFrame>
  );
}
