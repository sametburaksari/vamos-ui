import { MenuList, site2LabelsTr, type MenuCategory } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

const TRY = (amount: string) => ({ amount, currency: "TRY" });

const categories: MenuCategory[] = [
  { title: "Soğuk mezeler", note: "Her sabah hazırlanır.", items: [
    { name: "Haydari", description: "Süzme yoğurt, dereotu, közlenmiş sarımsak.", prices: [{ amount: TRY("180") }], tags: ["vegetarian", "gluten-free"], allergens: ["milk"] },
    { name: "Şakşuka", description: "Patlıcan, kabak, domates sosu.", prices: [{ amount: TRY("190") }], tags: ["vegan", "to-share"], allergens: ["celery"] },
    { name: "Lakerda", description: "Üç gün tuzlanmış palamut, kırmızı soğan.", prices: [{ amount: TRY("420") }], tags: ["chef-pick", "dairy-free"], allergens: ["fish"] },
  ] },
  { title: "Ara sıcaklar", items: [
    { name: "Kalamar tava", description: "Tarator sosla.", prices: [{ amount: TRY("390") }], allergens: ["molluscs", "gluten", "nuts"] },
    { name: "Karides güveç", description: "Tereyağı, kaşar, pul biber.", prices: [{ amount: TRY("460") }], tags: ["spicy"], allergens: ["crustaceans", "milk"] },
  ] },
  { title: "Közden", note: "Balık fiyatları günlüktür; tezgâha sorun.", items: [
    { name: "Günün balığı", description: "Kömür ateşinde bütün balık, roka, soğan.", prices: [{}], allergens: ["fish"] },
    { name: "Kuzu şiş", description: "Közlenmiş biber, sumaklı soğan.", prices: [{ label: "Yarım", amount: TRY("520") }, { label: "Tam", amount: TRY("890") }], tags: ["halal"] },
  ] },
  { title: "Tatlılar", items: [
    { name: "Kabak tatlısı", description: "Tahin ve ceviz ile.", prices: [{ amount: TRY("220") }], tags: ["seasonal", "dairy-free"], allergens: ["nuts", "sesame"] },
    { name: "Fırın sütlaç", prices: [{ amount: TRY("200") }], tags: ["vegetarian"], allergens: ["milk"], unavailable: true },
  ] },
  { title: "İçecekler", items: [
    { name: "Rakı", prices: [{ label: "20 cl", amount: TRY("950") }, { label: "35 cl", amount: TRY("1450") }, { label: "70 cl", amount: TRY("2600") }] },
    { name: "Şalgam", prices: [{ amount: TRY("80") }], tags: ["vegan", "spicy"] },
  ] },
];

// A whole menu page on the site itself — no link out to a third-party QR menu. headingLevel={1}
// makes the title the page h1, categories h2 and dishes h3; tags are words, the 14 allergens are
// localized and menuJsonLd() feeds the LocalBusiness `hasMenu`.
export default function MenuListFullPage() {
  return (
    <SiteFrame width={390}>
      <MenuList
        headingLevel={1}
        eyebrow="Kıyı Meyhane · Moda"
        title="Menü"
        lead="Mezeler her sabah, balık günün tezgâhından."
        locale="tr-TR"
        labels={site2LabelsTr}
        categories={categories}
        priceNote="Fiyatlara KDV dahildir; servis ücreti eklenmez. Alerjen bilgisi için ekibimize danışın."
      />
    </SiteFrame>
  );
}
