import { MenuList, site2LabelsTr } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

const TRY = (amount: string) => ({ amount, currency: "TRY" });

// Service list (spa): service · duration · price rows; several durations become small columns;
// each row ends in "Book". Turkish labels and ₺ formatting.
export default function MenuListServiceSpa() {
  return (
    <SiteFrame>
      <MenuList
        variant="service-list"
        locale="tr-TR"
        labels={site2LabelsTr}
        eyebrow="Fiyat listesi"
        title="Hamam ve *masaj*"
        bookHref="/randevu"
        categories={[
          { title: "Hamam", items: [
            { name: "Geleneksel hamam", description: "Kese ve köpük, sıcak mermer.", duration: "45 dk", prices: [{ amount: TRY("1800") }] },
            { name: "Sultan ritüeli", description: "Hamam, kil maskesi ve 30 dakika aromaterapi.", duration: "90 dk", prices: [{ amount: TRY("3600") }], tags: ["chef-pick"] },
          ] },
          { title: "Masaj", items: [
            { name: "İsveç masajı", description: "Orta basınç, tüm vücut.", prices: [{ label: "50 dk", amount: TRY("2100") }, { label: "80 dk", amount: TRY("2900") }] },
            { name: "Derin doku", description: "Sırt, boyun ve omuz odaklı.", prices: [{ label: "50 dk", amount: TRY("2400") }, { label: "80 dk", amount: TRY("3300") }] },
            { name: "Sıcak taş", duration: "70 dk", prices: [{ amount: TRY("2800") }], unavailable: true },
          ] },
        ]}
        priceNote="Fiyatlara KDV dahildir. Randevuya 15 dakika önce gelmenizi rica ederiz."
      />
    </SiteFrame>
  );
}
