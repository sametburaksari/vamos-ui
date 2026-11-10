import { PricingTable, site2LabelsTr } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

const TRY = (amount: string) => ({ amount, currency: "TRY" });

// Agency packages as quote-like rows, in Turkish (₺ formatting and period suffix from Intl/labels).
export default function PricingRowsAgency() {
  return (
    <SiteFrame>
      <PricingTable
        variant="rows"
        locale="tr-TR"
        labels={site2LabelsTr}
        eyebrow="Paketler"
        title="Web sitesi ve *bakım*"
        billing="once"
        taxNote="Fiyatlara KDV dahil değildir"
        plans={[
          { name: "Tanıtım sitesi", description: "Tek sayfa, iki dil, rezervasyon ve harita.", price: { once: TRY("45000"), from: true }, features: [{ text: "Tasarım" }, { text: "Türkçe ve İngilizce metin" }, { text: "Google İşletme Profili kurulumu" }], cta: { link: { href: "/teklif?paket=tanitim", label: "Teklif al" }, style: "link" } },
          { name: "Kurumsal site", description: "20 sayfaya kadar, blog ve menü yönetimi.", price: { once: TRY("120000"), from: true }, highlight: "En çok tercih edilen", features: [{ text: "İçerik yönetimi" }, { text: "Blog" }, { text: "SEO denetimi" }, { text: "Eğitim" }], cta: { link: { href: "/teklif?paket=kurumsal", label: "Teklif al" }, style: "primary" } },
          { name: "Aylık bakım", description: "Güncelleme, yedekleme ve küçük değişiklikler.", price: { monthly: TRY("6500") }, features: [{ text: "Aylık 4 saat değişiklik" }, { text: "Günlük yedek" }, { text: "Uptime takibi" }], cta: { link: { href: "/teklif?paket=bakim", label: "Teklif al" }, style: "link" } },
        ]}
      />
    </SiteFrame>
  );
}
