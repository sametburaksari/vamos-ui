// Sample content for "Kerte", a fictional architecture studio in Moda, Kadıköy.
// Every human-readable field is `{ en, tr }`. Areas are m², years are plain numbers.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Fictional contact details only. */
export const PHONE = "+902160000000";
export const EMAIL = "studio@kerte.example.com";
export const ADDRESS = "Şair Nefi Sk. 00, Moda, 34710 Kadıköy / İstanbul";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return {
    t,
    intl: intlOf(locale),
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

const unsplash = (id: string, w: number, h: number, focal?: { x: number; y: number }) => ({
  src: `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=72&auto=format&fit=crop`,
  width: w,
  height: h,
  ...(focal ? { focal } : null),
});

export interface Figure {
  kind: "photo" | "plan";
  src?: string;
  width?: number;
  height?: number;
  focal?: { x: number; y: number };
  alt: L;
  caption: L;
  credit?: string;
}

/** A plan drawn as rectangles on a 100 × 64 sheet: rooms with a label. */
export interface PlanRoom {
  x: number;
  y: number;
  w: number;
  h: number;
  label: L;
}

export type Typology = "residence" | "housing" | "civic" | "competition";
export const typologies: { id: Typology; label: L }[] = [
  { id: "residence", label: { en: "Residence", tr: "Konut" } },
  { id: "housing", label: { en: "Housing", tr: "Toplu konut" } },
  { id: "civic", label: { en: "Civic", tr: "Kamusal" } },
  { id: "competition", label: { en: "Competition", tr: "Yarışma" } },
];

export type Status = "built" | "site" | "design" | "unbuilt";
export const statuses: Record<Status, L> = {
  built: { en: "Completed", tr: "Tamamlandı" },
  site: { en: "On site", tr: "Şantiyede" },
  design: { en: "In design", tr: "Tasarımda" },
  unbuilt: { en: "Unbuilt", tr: "Uygulanmadı" },
};

export interface Project {
  id: string;
  no: string;
  name: L;
  place: L;
  typology: Typology;
  status: Status;
  year: number;
  /** Gross floor area, m². */
  area: number;
  client: L;
  team: string;
  photographer?: string;
  /** One line under the plate on the home page. */
  line: L;
  /** Has its own page. */
  page: boolean;
  intro?: L;
  /** Text and figures in reading order. */
  story?: ({ kind: "text"; title: L; body: L } | { kind: "figure"; fig: number })[];
  figures: Figure[];
  plan?: PlanRoom[];
}

const r = (x: number, y: number, w: number, h: number, en: string, tr: string): PlanRoom => ({ x, y, w, h, label: { en, tr } });

export const projects: Project[] = [
  {
    id: "taslik",
    no: "K-118",
    name: { en: "Taşlık House", tr: "Taşlık Evi" },
    place: { en: "Ayvalık, Balıkesir", tr: "Ayvalık, Balıkesir" },
    typology: "residence",
    status: "built",
    year: 2025,
    area: 240,
    client: { en: "Private client", tr: "Özel müşteri" },
    team: "Defne Arıtan, Jonas Lindqvist, Mert Yalaz",
    photographer: "Ece Sorgun",
    line: { en: "A white lime house set into an old olive terrace, built from the stone that came out of its own foundations.", tr: "Eski bir zeytin terasına oturan beyaz kireçli bir ev; kendi temelinden çıkan taşla yapıldı." },
    page: true,
    intro: {
      en: "The site was a stepped olive terrace above the Ayvalık straits, with two dry-stone walls and eleven trees older than the town hall. The house occupies the one terrace that had no trees. Everything we dug out — about 90 m³ of grey andesite — went back into the walls.",
      tr: "Arsa, Ayvalık boğazına bakan basamaklı bir zeytin terasıydı: iki kuru taş duvar ve belediye binasından yaşlı on bir ağaç. Ev, ağaç olmayan tek terasa yerleşiyor. Kazıdan çıkan her şey — yaklaşık 90 m³ gri andezit — duvarlara geri döndü.",
    },
    story: [
      { kind: "figure", fig: 0 },
      {
        kind: "text",
        title: { en: "One terrace, one roof", tr: "Bir teras, bir çatı" },
        body: {
          en: "The plan is a single bar, 6.2 metres deep, so every room gets the same morning light and the same cross-breeze off the water. Thick walls hold the night’s cool well into the afternoon; the house has no air conditioning and has not needed it through two Augusts.",
          tr: "Plan 6,2 metre derinliğinde tek bir çubuk; böylece her oda aynı sabah ışığını ve denizden gelen aynı çapraz esintiyi alıyor. Kalın duvarlar gecenin serinliğini öğleden sonraya kadar tutuyor; evde klima yok ve iki ağustos boyunca gerekmedi.",
        },
      },
      { kind: "figure", fig: 1 },
      {
        kind: "text",
        title: { en: "Lime, not paint", tr: "Boya değil, kireç" },
        body: {
          en: "The render is three coats of slaked lime from a kiln in Bergama, tinted with nothing. It will grey and patch over the years, and it is meant to; the client has a bucket and a brush for every spring.",
          tr: "Sıva, Bergama’daki bir ocaktan gelen üç kat söndürülmüş kireç; hiçbir şeyle renklendirilmedi. Yıllar içinde grileşip yamalanacak, öyle olması isteniyor; müşterinin her bahar için bir kovası ve fırçası var.",
        },
      },
      { kind: "figure", fig: 2 },
    ],
    figures: [
      { kind: "photo", ...unsplash("1523217582562-09d0def993a6", 1600, 1067, { x: 0.5, y: 0.55 }), alt: { en: "White cubic house with deep openings and a planted courtyard under a clear sky", tr: "Açık gökyüzü altında derin açıklıklı, bitkili avlulu beyaz kübik ev" }, caption: { en: "South elevation from the lower olive terrace, May 2025.", tr: "Alt zeytin terasından güney cephesi, Mayıs 2025." }, credit: "Ece Sorgun" },
      { kind: "plan", alt: { en: "Ground-floor plan: a single bar of rooms with a courtyard to the east", tr: "Zemin kat planı: doğuda avlusu olan tek sıra odalar" }, caption: { en: "Ground-floor plan, 1:200. One bar, 6.2 m deep; the courtyard keeps the existing wall.", tr: "Zemin kat planı, 1:200. Tek çubuk, 6,2 m derinlik; avlu mevcut duvarı koruyor." } },
      { kind: "photo", ...unsplash("1503594384566-461fe158e797", 1600, 1067, { x: 0.5, y: 0.35 }), alt: { en: "White-rendered gable wall and roof edge against a pale blue sky", tr: "Açık mavi gökyüzüne karşı beyaz sıvalı kalkan duvar ve çatı kenarı" }, caption: { en: "Lime render at the north-west corner, three months after completion.", tr: "Kuzeybatı köşesinde kireç sıva, bitişten üç ay sonra." }, credit: "Ece Sorgun" },
    ],
    plan: [r(4, 8, 22, 26, "Living", "Yaşama"), r(26, 8, 16, 26, "Kitchen", "Mutfak"), r(42, 8, 14, 26, "Bed", "Yatak"), r(56, 8, 14, 26, "Bed", "Yatak"), r(70, 8, 10, 26, "Bath", "Banyo"), r(4, 34, 76, 6, "Loggia", "Revak"), r(80, 8, 16, 48, "Courtyard", "Avlu")],
  },
  {
    id: "iskele",
    no: "K-104",
    name: { en: "Pier Reading Room", tr: "İskele Okuma Salonu" },
    place: { en: "Moda, Istanbul", tr: "Moda, İstanbul" },
    typology: "civic",
    status: "built",
    year: 2024,
    area: 610,
    client: { en: "Kadıköy district library service", tr: "Kadıköy ilçe kütüphane hizmeti" },
    team: "Jonas Lindqvist, Selin Koru, Bora Ünal",
    photographer: "Kaan Ateş",
    line: { en: "A neighbourhood library in a stacked set of white rooms, open until midnight in exam season.", tr: "Üst üste konmuş beyaz odalardan bir mahalle kütüphanesi; sınav döneminde gece yarısına kadar açık." },
    page: true,
    intro: {
      en: "The brief asked for 40 reading seats. The building has 112, because we stacked the reading rooms instead of spreading them, and gave the ground floor back to the street as a covered square.",
      tr: "Program 40 okuma koltuğu istiyordu. Binada 112 tane var; çünkü okuma odalarını yaymak yerine üst üste koyduk ve zemin katı kapalı bir meydan olarak sokağa geri verdik.",
    },
    story: [
      { kind: "figure", fig: 0 },
      {
        kind: "text",
        title: { en: "Rooms, not a hall", tr: "Salon değil, odalar" },
        body: {
          en: "Seven rooms of different sizes, each with one big window facing a different way. Students pick a room by the light they want; the loudest one, with the children’s books, is nearest the street.",
          tr: "Farklı boyutlarda yedi oda, her biri farklı yöne bakan tek bir büyük pencereyle. Öğrenciler istedikleri ışığa göre oda seçiyor; çocuk kitaplarının olduğu en gürültülüsü sokağa en yakın olanı.",
        },
      },
      { kind: "figure", fig: 1 },
      { kind: "figure", fig: 2 },
    ],
    figures: [
      { kind: "photo", ...unsplash("1479839672679-a46483c0e7c8", 1200, 1500, { x: 0.5, y: 0.4 }), alt: { en: "White modular building with projecting boxes and deep window reveals against the sky", tr: "Gökyüzüne karşı çıkıntılı kutuları ve derin pencere boşlukları olan beyaz modüler bina" }, caption: { en: "The stacked reading rooms from Mühürdar Caddesi.", tr: "Mühürdar Caddesi’nden üst üste okuma odaları." }, credit: "Kaan Ateş" },
      { kind: "photo", ...unsplash("1497366216548-37526070297c", 1600, 1067), alt: { en: "Long bright corridor with glass partitions and a polished concrete floor", tr: "Cam bölmeli, cilalı beton zeminli uzun aydınlık koridor" }, caption: { en: "Third-floor landing: glass to the stair, timber to the rooms.", tr: "Üçüncü kat sahanlığı: merdivene cam, odalara ahşap." }, credit: "Kaan Ateş" },
      { kind: "plan", alt: { en: "Typical floor plan: two reading rooms either side of a central stair", tr: "Normal kat planı: orta merdivenin iki yanında iki okuma odası" }, caption: { en: "Typical floor, 1:200. Two rooms, one stair, no corridor.", tr: "Normal kat, 1:200. İki oda, bir merdiven, koridor yok." } },
    ],
    plan: [r(6, 6, 34, 52, "Reading room", "Okuma odası"), r(40, 6, 14, 30, "Stair", "Merdiven"), r(40, 36, 14, 22, "WC", "WC"), r(54, 6, 40, 52, "Reading room", "Okuma odası")],
  },
  {
    id: "sedir",
    no: "K-122",
    name: { en: "Cedar Row Housing", tr: "Sedir Sıra Konutları" },
    place: { en: "Nilüfer, Bursa", tr: "Nilüfer, Bursa" },
    typology: "housing",
    status: "site",
    year: 2026,
    area: 4850,
    client: { en: "Nilüfer housing cooperative no. 4", tr: "Nilüfer 4 No’lu Konut Kooperatifi" },
    team: "Defne Arıtan, Selin Koru, Ali Rıza Demirel, Yuna Park",
    photographer: "Kaan Ateş",
    line: { en: "Forty-two co-op flats with deep balconies, every one dual-aspect. Topping out in December 2026.", tr: "Derin balkonlu kırk iki kooperatif dairesi, hepsi çift cepheli. Kaba inşaat Aralık 2026’da bitiyor." },
    page: true,
    intro: {
      en: "A cooperative of 42 households who wanted the same thing: a balcony you can eat on. Every flat runs through the block from street to garden, and every balcony is 2.4 metres deep — the width of a table with chairs on both sides.",
      tr: "Aynı şeyi isteyen 42 hanelik bir kooperatif: üzerinde yemek yenebilecek bir balkon. Her daire bloğu sokaktan bahçeye boydan boya kesiyor ve her balkon 2,4 metre derinliğinde — iki yanında sandalyeleri olan bir masanın genişliği.",
    },
    story: [
      { kind: "figure", fig: 0 },
      {
        kind: "text",
        title: { en: "Designed in the co-op’s meeting room", tr: "Kooperatifin toplantı odasında tasarlandı" },
        body: {
          en: "Eleven evening workshops between 2023 and 2024, one flat-plan option per household. The five layouts on site came out of those evenings; nobody got the plan they first drew, everybody got one they could explain.",
          tr: "2023 ile 2024 arasında on bir akşam atölyesi, her haneye bir daire planı seçeneği. Şantiyedeki beş plan tipi o akşamlardan çıktı; kimse ilk çizdiği planı almadı, herkes anlatabildiği bir plan aldı.",
        },
      },
      { kind: "figure", fig: 1 },
      { kind: "figure", fig: 2 },
    ],
    figures: [
      { kind: "photo", ...unsplash("1460317442991-0ec209397118", 1600, 1067, { x: 0.5, y: 0.5 }), alt: { en: "Grey apartment block with rows of recessed balconies", tr: "Sıra sıra içeri çekilmiş balkonları olan gri apartman bloğu" }, caption: { en: "Reference block visited with the co-op, autumn 2023: the balcony depth we argued about.", tr: "Kooperatifle gezilen referans blok, sonbahar 2023: üzerine tartıştığımız balkon derinliği." }, credit: "Kaan Ateş" },
      { kind: "plan", alt: { en: "Plan of a dual-aspect flat running from street to garden", tr: "Sokaktan bahçeye uzanan çift cepheli daire planı" }, caption: { en: "Type C flat, 1:100. Street side left, garden and balcony right.", tr: "C tipi daire, 1:100. Solda sokak, sağda bahçe ve balkon." } },
      { kind: "photo", ...unsplash("1515263487990-61b07816b324", 1200, 1500), alt: { en: "Dark brick and glass apartment façade seen from below", tr: "Aşağıdan görülen koyu tuğla ve cam apartman cephesi" }, caption: { en: "Façade mock-up panel on site, October 2026.", tr: "Şantiyede cephe numune paneli, Ekim 2026." }, credit: "Kaan Ateş" },
    ],
    plan: [r(4, 10, 20, 44, "Entry", "Giriş"), r(24, 10, 18, 22, "Bed", "Yatak"), r(24, 32, 18, 22, "Bath", "Banyo"), r(42, 10, 34, 44, "Living / kitchen", "Yaşama / mutfak"), r(76, 10, 20, 44, "Balcony", "Balkon")],
  },
  {
    id: "kara",
    no: "K-097",
    name: { en: "Black Pine House", tr: "Karaçam Evi" },
    place: { en: "Şile, Istanbul", tr: "Şile, İstanbul" },
    typology: "residence",
    status: "built",
    year: 2023,
    area: 185,
    client: { en: "Private client", tr: "Özel müşteri" },
    team: "Jonas Lindqvist, Mert Yalaz",
    photographer: "Ece Sorgun",
    line: { en: "Charred timber and a single sheltering roof, built around one Black Sea pine that stays.", tr: "Yakılmış ahşap ve tek bir koruyucu çatı; yerinde kalan bir karaçamın etrafında kuruldu." },
    page: true,
    intro: {
      en: "A weekend house for a family of four on a forest edge, ninety minutes from the city. The clients had one rule: the large pine in the middle of the plot stays. The plan bends around it, and the deck is cut so the trunk passes through.",
      tr: "Şehirden doksan dakika uzakta, orman kenarında dört kişilik bir aile için hafta sonu evi. Müşterilerin tek kuralı vardı: arsanın ortasındaki büyük çam kalacak. Plan onun etrafında kırılıyor; güverte, gövde içinden geçecek şekilde kesildi.",
    },
    story: [
      { kind: "figure", fig: 0 },
      {
        kind: "text",
        title: { en: "Burnt to last", tr: "Dayansın diye yakıldı" },
        body: {
          en: "The cladding is local larch, charred on site over two days in March. It needs no paint and no oil, and the salt air has so far done nothing to it.",
          tr: "Kaplama yerel karaçam; mart ayında iki gün boyunca şantiyede yakıldı. Boya da yağ da istemiyor; tuzlu hava şimdiye kadar ona hiçbir şey yapamadı.",
        },
      },
      { kind: "figure", fig: 1 },
      { kind: "figure", fig: 2 },
    ],
    figures: [
      { kind: "photo", ...unsplash("1600585154340-be6161a56a0c", 1600, 1067, { x: 0.5, y: 0.55 }), alt: { en: "Dark timber house with large glazed openings beside a tall tree, at dusk", tr: "Alacakaranlıkta uzun bir ağacın yanında büyük camlı açıklıkları olan koyu ahşap ev" }, caption: { en: "From the forest path at dusk; the pine is on the left.", tr: "Alacakaranlıkta orman yolundan; çam solda." }, credit: "Ece Sorgun" },
      { kind: "photo", ...unsplash("1600607687939-ce8a6c25118c", 1600, 1067), alt: { en: "Bright living room with a pale sofa, timber ceiling and full-height windows", tr: "Açık renk kanepe, ahşap tavan ve tam boy pencereli aydınlık oturma odası" }, caption: { en: "Living room under the single roof, looking north.", tr: "Tek çatının altındaki oturma odası, kuzeye bakış." }, credit: "Ece Sorgun" },
      { kind: "plan", alt: { en: "Plan bent around a tree, with a deck crossing it", tr: "Bir ağacın etrafında kırılan, güvertenin geçtiği plan" }, caption: { en: "Ground floor, 1:200. The deck opening around the pine is 1.8 m across.", tr: "Zemin kat, 1:200. Güvertede çam için açılan boşluk 1,8 m." } },
    ],
    plan: [r(4, 6, 30, 30, "Living", "Yaşama"), r(34, 6, 18, 30, "Kitchen", "Mutfak"), r(4, 36, 22, 22, "Bed", "Yatak"), r(26, 36, 16, 22, "Bed", "Yatak"), r(52, 6, 44, 52, "Deck", "Güverte")],
  },
  {
    id: "kordon",
    no: "K-089",
    name: { en: "Kordon Pavilion", tr: "Kordon Pavyonu" },
    place: { en: "Alsancak, İzmir", tr: "Alsancak, İzmir" },
    typology: "competition",
    status: "unbuilt",
    year: 2022,
    area: 1200,
    client: { en: "Open competition — second prize", tr: "Açık yarışma — ikinci ödül" },
    team: "Defne Arıtan, Jonas Lindqvist",
    line: { en: "A curved shade roof along the waterfront.", tr: "Kıyı boyunca kıvrılan bir gölge çatısı." },
    page: false,
    figures: [{ kind: "photo", ...unsplash("1518005020951-eccb494ad742", 1200, 1500), alt: { en: "Curving white façade bands against a blue sky", tr: "Mavi gökyüzüne karşı kıvrılan beyaz cephe bantları" }, caption: { en: "Competition model photograph.", tr: "Yarışma maketi fotoğrafı." } }],
  },
  {
    id: "yeldegirmeni",
    no: "K-125",
    name: { en: "Yeldeğirmeni Courtyard Flats", tr: "Yeldeğirmeni Avlulu Daireler" },
    place: { en: "Kadıköy, Istanbul", tr: "Kadıköy, İstanbul" },
    typology: "housing",
    status: "design",
    year: 2027,
    area: 1640,
    client: { en: "Private developer", tr: "Özel geliştirici" },
    team: "Selin Koru, Bora Ünal",
    line: { en: "Nine flats around a shared courtyard on a 1910 plot.", tr: "1910 tarihli bir parselde ortak avlu çevresinde dokuz daire." },
    page: false,
    figures: [],
  },
  {
    id: "assos",
    no: "K-081",
    name: { en: "Assos Olive Mill Survey", tr: "Assos Zeytinyağı Fabrikası Rölövesi" },
    place: { en: "Ayvacık, Çanakkale", tr: "Ayvacık, Çanakkale" },
    typology: "civic",
    status: "built",
    year: 2021,
    area: 900,
    client: { en: "Ayvacık municipality", tr: "Ayvacık Belediyesi" },
    team: "Mert Yalaz, Ali Rıza Demirel",
    line: { en: "Measured survey and restoration project for a 1906 olive-oil works.", tr: "1906 tarihli bir zeytinyağı fabrikasının rölöve ve restorasyon projesi." },
    page: false,
    figures: [],
  },
  {
    id: "ferry-school",
    no: "K-076",
    name: { en: "Burgaz Island School Annex", tr: "Burgazada Okul Ek Binası" },
    place: { en: "Adalar, Istanbul", tr: "Adalar, İstanbul" },
    typology: "civic",
    status: "built",
    year: 2020,
    area: 420,
    client: { en: "Parents’ association", tr: "Okul aile birliği" },
    team: "Defne Arıtan, Jonas Lindqvist",
    line: { en: "Four classrooms in timber, built in one summer holiday.", tr: "Ahşap dört derslik, tek bir yaz tatilinde yapıldı." },
    page: false,
    figures: [],
  },
];

export const projectPage = (id: string) => `project-${id}`;
export const pagedProjects = projects.filter((p) => p.page);

/** Awards and publications, newest first. */
export const recognition: { year: number; title: L; by: string }[] = [
  { year: 2026, title: { en: "Taşlık House — shortlisted, house of the year", tr: "Taşlık Evi — yılın evi kısa listesi" }, by: "Kıyı Architecture Prize" },
  { year: 2025, title: { en: "Pier Reading Room — public building award", tr: "İskele Okuma Salonu — kamu yapısı ödülü" }, by: "Marmara Civic Design Awards" },
  { year: 2025, title: { en: "“Building with what you dig” — essay, issue 41", tr: "“Kazdığınla yapmak” — deneme, sayı 41" }, by: "Yapı & Yer quarterly" },
  { year: 2024, title: { en: "Black Pine House — featured", tr: "Karaçam Evi — öne çıkan proje" }, by: "Northern Timber Review" },
  { year: 2022, title: { en: "Kordon Pavilion — second prize", tr: "Kordon Pavyonu — ikinci ödül" }, by: "İzmir waterfront competition" },
];

export const team: { name: string; role: L; specialty: L }[] = [
  { name: "Defne Arıtan", role: { en: "Founding partner", tr: "Kurucu ortak" }, specialty: { en: "Housing · cooperatives · lime and stone", tr: "Toplu konut · kooperatifler · kireç ve taş" } },
  { name: "Jonas Lindqvist", role: { en: "Founding partner", tr: "Kurucu ortak" }, specialty: { en: "Timber · civic buildings · teaching studio", tr: "Ahşap · kamu yapıları · tasarım stüdyosu dersi" } },
  { name: "Selin Koru", role: { en: "Associate", tr: "Yardımcı ortak" }, specialty: { en: "Project lead, Cedar Row and Yeldeğirmeni", tr: "Proje lideri, Sedir Sıra ve Yeldeğirmeni" } },
  { name: "Mert Yalaz", role: { en: "Architect", tr: "Mimar" }, specialty: { en: "Surveys and restoration · site supervision", tr: "Rölöve ve restorasyon · şantiye denetimi" } },
  { name: "Bora Ünal", role: { en: "Architect", tr: "Mimar" }, specialty: { en: "Permits and technical drawings", tr: "Ruhsat ve teknik çizimler" } },
  { name: "Yuna Park", role: { en: "Model maker", tr: "Maket ustası" }, specialty: { en: "1:50 models, every project", tr: "Her proje için 1:50 maket" } },
];

export const studioPhoto = {
  ...unsplash("1503387762-592deb58ef4e", 1600, 1067, { x: 0.5, y: 0.5 }),
  alt: { en: "Architect’s hands drawing on a large paper plan with pencil and scale rule", tr: "Kurşun kalem ve ölçekli cetvelle büyük bir kâğıt plan üzerinde çizen mimar elleri" },
};
