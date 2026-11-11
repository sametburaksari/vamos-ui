// Sample content for "Ilse Marén", a fictional independent photographer (Rotterdam / Istanbul).
// Every human-readable field is `Localized` ({ en, tr }) and resolved with `pickLocale`.
// People, clients, galleries and addresses are invented; photos are unbranded Unsplash images.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr } from "@vamos-ui/react/blocks";

export type SiteLocale = "en" | "tr";
/** A string in both languages. */
export type L = { en: string; tr: string };
export type Discipline = "landscape" | "architecture" | "portrait" | "interiors";

/** Fictional numbers only. */
export const PHONE = "+902160000000";
export const EMAIL = "ilse@example.com";

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  return {
    t,
    intl: locale === "tr" ? "tr-TR" : "en-GB",
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

export interface Photo {
  src: string;
  width: number;
  height: number;
  alt: L;
}

const shot = (id: string, w: number, h: number, alt: L): Photo => ({
  src: `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=72&auto=format&fit=crop`,
  width: w,
  height: h,
  alt,
});

export const disciplines: { id: Discipline; label: L }[] = [
  { id: "landscape", label: { en: "Landscape", tr: "Peyzaj" } },
  { id: "architecture", label: { en: "Architecture", tr: "Mimari" } },
  { id: "portrait", label: { en: "Portrait", tr: "Portre" } },
  { id: "interiors", label: { en: "Interiors", tr: "İç mekân" } },
];

export interface Project {
  id: string;
  title: string;
  year: number;
  /** Kind of client, shown in the index. */
  clientType: L;
  client: string;
  discipline: Discipline;
  place: L;
  summary: L;
  brief: L;
  approach: L;
  result: L;
  credits: { label: L; value: L }[];
  /** First is the cover. 4–5 frames. */
  photos: Photo[];
  /** Which frames appear in the home grid. */
  featured: number[];
}

export const projects: Project[] = [
  {
    id: "salt-and-stone",
    title: "Salt & Stone",
    year: 2026,
    clientType: { en: "Travel magazine", tr: "Seyahat dergisi" },
    client: "Meridyen Quarterly",
    discipline: "landscape",
    place: { en: "Datça peninsula, Türkiye", tr: "Datça yarımadası, Türkiye" },
    summary: {
      en: "Twelve days on the Datça peninsula, shot for a 24-page autumn feature on the coast after the summer crowds have gone.",
      tr: "Yaz kalabalığı çekildikten sonra kıyıyı anlatan 24 sayfalık bir sonbahar dosyası için Datça yarımadasında on iki gün.",
    },
    brief: {
      en: "Meridyen wanted the coast without the postcards: no sunsets over bays, no boats at anchor. One rule from the editor — every frame had to be reachable on foot.",
      tr: "Meridyen kıyıyı kartpostalsız istedi: koy üstünde gün batımı yok, demirli tekne yok. Editörün tek kuralı vardı — her kareye yürüyerek ulaşılabilmeliydi.",
    },
    approach: {
      en: "I walked the old mule path from Mesudiye to Palamutbükü and shot only between 06:10 and 08:30, when the light is flat and the water is still grey. A drone was used for three frames, all from below 120 m.",
      tr: "Mesudiye’den Palamutbükü’ne eski katır yolunu yürüdüm ve yalnızca 06.10 ile 08.30 arasında, ışık düz ve su hâlâ griyken çektim. Üç kare için drone kullanıldı; hepsi 120 metrenin altından.",
    },
    result: {
      en: "Ran as the November cover story and the opening of the magazine’s first photo-only issue. Two frames were licensed for the regional tourism board’s winter campaign.",
      tr: "Kasım sayısının kapak dosyası ve derginin ilk yalnızca-fotoğraf sayısının açılışı oldu. İki kare bölgesel turizm kurulunun kış kampanyası için lisanslandı.",
    },
    credits: [
      { label: { en: "Editor", tr: "Editör" }, value: { en: "Selin Okur", tr: "Selin Okur" } },
      { label: { en: "Camera", tr: "Kamera" }, value: { en: "Medium format, 45 mm and 80 mm", tr: "Orta format, 45 mm ve 80 mm" } },
      { label: { en: "Published", tr: "Yayın" }, value: { en: "November 2026, 24 pages", tr: "Kasım 2026, 24 sayfa" } },
    ],
    photos: [
      shot("1505142468610-359e7d316be0", 1200, 1500, { en: "Surf breaking on pale sand, seen straight down from above", tr: "Yukarıdan dik bakışla açık renkli kuma vuran dalga" }),
      shot("1507525428034-b723cf961d3e", 1600, 1067, { en: "Low sun over a calm shoreline at first light", tr: "Şafakta sakin bir kıyı şeridinin üzerinde alçak güneş" }),
      shot("1475924156734-496f6cac6ec1", 1600, 1067, { en: "Rocks and a long exposure of the sea under a pink sky", tr: "Pembe gökyüzü altında kayalar ve uzun pozlamalı deniz" }),
      shot("1439066615861-d1af74d74000", 1200, 1500, { en: "A wooden jetty running into still blue water", tr: "Durgun mavi suya uzanan ahşap iskele" }),
    ],
    featured: [0, 3],
  },
  {
    id: "concrete-weather",
    title: "Concrete Weather",
    year: 2025,
    clientType: { en: "Architecture practice", tr: "Mimarlık ofisi" },
    client: "Okarr Architects",
    discipline: "architecture",
    place: { en: "Rotterdam, the Netherlands", tr: "Rotterdam, Hollanda" },
    summary: {
      en: "A year of the same four buildings in every kind of weather, for a practice’s 20th-anniversary monograph.",
      tr: "Bir mimarlık ofisinin 20. yıl monografisi için aynı dört binanın her türlü havada bir yılı.",
    },
    brief: {
      en: "Okarr had plenty of sunny, empty renders. They wanted proof that their buildings work on a wet Tuesday in February, with people in them.",
      tr: "Okarr’ın güneşli ve boş render’ı çoktu. Binalarının şubatta yağmurlu bir salı günü, içinde insanlarla da çalıştığının kanıtını istediler.",
    },
    approach: {
      en: "Fixed tripod positions, marked on the pavement with brass pins, revisited 31 times between January and December. Same lens, same height, only the weather and the people changing.",
      tr: "Kaldırıma pirinç çivilerle işaretlenmiş sabit tripod noktaları; ocak ile aralık arasında 31 kez yeniden ziyaret. Aynı objektif, aynı yükseklik; değişen yalnızca hava ve insanlar.",
    },
    result: {
      en: "A 196-page monograph and a show at the practice’s ground-floor gallery. The pin positions are still there; the office uses them for its own progress photos.",
      tr: "196 sayfalık bir monografi ve ofisin zemin kattaki galerisinde bir sergi. Çiviler hâlâ yerinde; ofis kendi ilerleme fotoğrafları için onları kullanıyor.",
    },
    credits: [
      { label: { en: "Client", tr: "Müşteri" }, value: { en: "Okarr Architects", tr: "Okarr Architects" } },
      { label: { en: "Book design", tr: "Kitap tasarımı" }, value: { en: "Studio Varga", tr: "Studio Varga" } },
      { label: { en: "Visits", tr: "Ziyaret" }, value: { en: "31 between January and December", tr: "Ocak–aralık arası 31" } },
    ],
    photos: [
      shot("1487958449943-2429e8be8625", 1200, 1500, { en: "White angular facade against a pale sky", tr: "Açık renkli gökyüzüne karşı beyaz, köşeli bir cephe" }),
      shot("1511818966892-d7d671e672a2", 1600, 1067, { en: "Glass towers seen from street level, looking up", tr: "Sokak seviyesinden yukarı bakınca cam kuleler" }),
      shot("1449824913935-59a10b8d2000", 1200, 1500, { en: "A straight avenue between tall office blocks", tr: "Yüksek ofis blokları arasında dümdüz bir cadde" }),
      shot("1480714378408-67cf0d13bc1b", 1600, 1067, { en: "Late sun cutting between apartment towers", tr: "Apartman kuleleri arasından süzülen akşamüstü güneşi" }),
    ],
    featured: [0, 1],
  },
  {
    id: "quiet-faces",
    title: "Quiet Faces",
    year: 2025,
    clientType: { en: "Cultural foundation", tr: "Kültür vakfı" },
    client: "Halde Foundation",
    discipline: "portrait",
    place: { en: "Istanbul and Rotterdam", tr: "İstanbul ve Rotterdam" },
    summary: {
      en: "Portraits of 40 people who keep a city running at night, for a foundation’s exhibition on invisible work.",
      tr: "Görünmeyen emek üzerine bir vakıf sergisi için şehri gece ayakta tutan 40 kişinin portresi.",
    },
    brief: {
      en: "Ferry crews, night nurses, bakers, the man who resets the tram signals. The foundation wanted them seen as people, not as job titles.",
      tr: "Vapur mürettebatı, gece hemşireleri, fırıncılar, tramvay sinyallerini sıfırlayan adam. Vakıf onların meslek adı olarak değil, insan olarak görülmesini istedi.",
    },
    approach: {
      en: "One light, one grey background, ten minutes per person at the end of their shift. Nobody was asked to smile; everybody chose their own clothes.",
      tr: "Tek ışık, tek gri fon, vardiya bitiminde kişi başı on dakika. Kimseden gülümsemesi istenmedi; herkes kendi kıyafetini seçti.",
    },
    result: {
      en: "Shown at two venues for six weeks each, with the sitters’ own words printed beside every portrait. 11,400 visitors.",
      tr: "Her biri altı hafta süren iki mekânda, her portrenin yanında kişinin kendi sözleriyle sergilendi. 11.400 ziyaretçi.",
    },
    credits: [
      { label: { en: "Curator", tr: "Küratör" }, value: { en: "Mira Halde", tr: "Mira Halde" } },
      { label: { en: "Sitters", tr: "Poz veren" }, value: { en: "40 people, 19 professions", tr: "40 kişi, 19 meslek" } },
      { label: { en: "Prints", tr: "Baskı" }, value: { en: "Pigment on cotton rag, 60 × 75 cm", tr: "Pamuk kâğıda pigment baskı, 60 × 75 cm" } },
    ],
    photos: [
      shot("1534528741775-53994a69daeb", 1200, 1500, { en: "A woman lit by cool blue light, looking straight at the camera", tr: "Soğuk mavi ışıkla aydınlanmış, doğrudan kameraya bakan bir kadın" }),
      shot("1524504388940-b1c1722653e1", 1200, 1500, { en: "A woman with long hair against a dark grey background", tr: "Koyu gri fon önünde uzun saçlı bir kadın" }),
      shot("1438761681033-6461ffad8d80", 1200, 1500, { en: "A young woman with short red hair beside a lake", tr: "Göl kenarında kısa kızıl saçlı genç bir kadın" }),
      shot("1503220317375-aaad61436b1b", 1600, 1067, { en: "A man with a backpack looking out over a mountain lake", tr: "Sırt çantalı bir adam dağ gölüne bakıyor" }),
    ],
    featured: [0, 2],
  },
  {
    id: "above-the-treeline",
    title: "Above the Treeline",
    year: 2024,
    clientType: { en: "Outdoor brand", tr: "Outdoor markası" },
    client: "Norrfjell Outfitters",
    discipline: "landscape",
    place: { en: "Dolomites and the Kaçkar Mountains", tr: "Dolomitler ve Kaçkar Dağları" },
    summary: {
      en: "A catalogue without a single product shot: the places the gear is for, photographed at the hours you would actually be there.",
      tr: "Tek bir ürün fotoğrafı olmayan bir katalog: ekipmanın götürüldüğü yerler, gerçekten orada olacağınız saatlerde.",
    },
    brief: {
      en: "Norrfjell’s customers know what a jacket looks like. The catalogue had to make them book the trip first.",
      tr: "Norrfjell’in müşterileri bir montun neye benzediğini biliyor. Katalog önce yolculuğu planlatmalıydı.",
    },
    approach: {
      en: "Two trips, nine days each, carrying everything. Camps above 2,400 m so the first frames were made before sunrise, not after a drive.",
      tr: "Her biri dokuz gün süren iki yolculuk, her şey sırtta. Kamplar 2.400 metrenin üzerinde; ilk kareler araba yolculuğundan sonra değil, gün doğmadan çekildi.",
    },
    result: {
      en: "A 64-page spring catalogue and the brand’s shop windows in six cities. Pre-orders for the hut-to-hut range sold out in nine days.",
      tr: "64 sayfalık bir ilkbahar kataloğu ve markanın altı şehirdeki vitrinleri. Kulübeden kulübeye serisinin ön siparişleri dokuz günde tükendi.",
    },
    credits: [
      { label: { en: "Art direction", tr: "Sanat yönetimi" }, value: { en: "Jonas Ekdahl", tr: "Jonas Ekdahl" } },
      { label: { en: "Guide", tr: "Rehber" }, value: { en: "Murat Kaya", tr: "Murat Kaya" } },
      { label: { en: "Days on foot", tr: "Yürüyüş günü" }, value: { en: "18", tr: "18" } },
    ],
    photos: [
      shot("1501785888041-af3ef285b470", 1600, 1067, { en: "A turquoise mountain lake with a single rowing boat", tr: "Tek bir kayığın olduğu turkuaz bir dağ gölü" }),
      shot("1506905925346-21bda4d32df4", 1600, 1067, { en: "Snow peaks rising above a sea of cloud at dawn", tr: "Şafakta bulut denizinin üzerinde yükselen karlı zirveler" }),
      shot("1493246507139-91e8fad9978e", 1200, 1500, { en: "Jagged peaks reflected in a still lake at sunrise", tr: "Gün doğumunda durgun göle yansıyan sivri zirveler" }),
      shot("1519681393784-d120267933ba", 1600, 1067, { en: "The Milky Way above snow-covered mountains", tr: "Karla kaplı dağların üzerinde Samanyolu" }),
    ],
    featured: [2, 1],
  },
  {
    id: "fog-studies",
    title: "Fog Studies",
    year: 2024,
    clientType: { en: "Personal work", tr: "Kişisel çalışma" },
    client: "Galeri Altı",
    discipline: "landscape",
    place: { en: "The Belgrad Forest, Istanbul", tr: "Belgrad Ormanı, İstanbul" },
    summary: {
      en: "Forty mornings in the same forest, waiting for fog. Twenty-two of them it came.",
      tr: "Aynı ormanda sis bekleyerek geçen kırk sabah. Yirmi ikisinde sis geldi.",
    },
    brief: {
      en: "No client, no deadline. A way to learn to see again after a year of commissions.",
      tr: "Müşteri yok, teslim tarihi yok. Bir yıl süren siparişlerden sonra yeniden görmeyi öğrenmenin yolu.",
    },
    approach: {
      en: "The same 3 km loop from the Neşet Suyu gate, starting 40 minutes before sunrise, between October and March. Only a 35 mm lens; nothing cropped afterwards.",
      tr: "Ekim ile mart arasında, gün doğumundan 40 dakika önce başlayan, Neşet Suyu girişinden aynı 3 km’lik tur. Yalnızca 35 mm objektif; sonradan kırpılan kare yok.",
    },
    result: {
      en: "A solo show of 22 prints and a hand-bound edition of 150 books, sold out before the opening.",
      tr: "22 baskılık bir kişisel sergi ve açılıştan önce tükenen 150 adetlik el ciltli bir kitap.",
    },
    credits: [
      { label: { en: "Exhibition", tr: "Sergi" }, value: { en: "Galeri Altı, Istanbul, 2 Mar – 14 Apr 2024", tr: "Galeri Altı, İstanbul, 2 Mart – 14 Nisan 2024" } },
      { label: { en: "Edition", tr: "Baskı adedi" }, value: { en: "150 hand-bound copies", tr: "150 el ciltli kopya" } },
      { label: { en: "Mornings", tr: "Sabah" }, value: { en: "40 walked, 22 with fog", tr: "40 yürüyüş, 22’sinde sis" } },
    ],
    photos: [
      shot("1418065460487-3e41a6c84dc5", 1600, 1067, { en: "A pine forest disappearing into white fog", tr: "Beyaz sisin içinde kaybolan bir çam ormanı" }),
      shot("1482192596544-9eb780fc7f66", 1200, 1500, { en: "Fog drifting through a forest seen from above", tr: "Yukarıdan görülen ormanın içinden süzülen sis" }),
      shot("1470071459604-3b5ec3a7fe05", 1600, 1067, { en: "Low cloud rolling over green hills", tr: "Yeşil tepelerin üzerinden yuvarlanan alçak bulut" }),
      shot("1441974231531-c6227db76b6e", 1200, 1500, { en: "Sunlight falling between tall, straight trunks", tr: "Uzun, düz gövdeler arasından düşen güneş ışığı" }),
      shot("1500534314209-a25ddb2bd429", 1600, 1067, { en: "Layers of hills fading into haze at dusk", tr: "Alacakaranlıkta puslu ufka doğru silikleşen tepe katmanları" }),
    ],
    featured: [1, 3],
  },
  {
    id: "night-shift",
    title: "Night Shift",
    year: 2023,
    clientType: { en: "Newspaper supplement", tr: "Gazete eki" },
    client: "Tessel Weekend",
    discipline: "architecture",
    place: { en: "Five cities, one night each", tr: "Beş şehir, her birinde bir gece" },
    summary: {
      en: "Five cities between 01:00 and 04:00, for a weekend supplement’s issue on what cities look like when they are not performing.",
      tr: "Bir hafta sonu ekinin, şehirlerin gösteri yapmadığı hâllerini anlatan sayısı için gece 01.00 ile 04.00 arasında beş şehir.",
    },
    brief: {
      en: "The editor asked for cities “after the people have gone home but before the cleaners arrive”.",
      tr: "Editör şehirleri “insanlar evine gittikten sonra ama temizlikçiler gelmeden önce” istedi.",
    },
    approach: {
      en: "Handheld, available light only, no tripod permits. Each city got one night and a 3-hour window; whatever was there, was the story.",
      tr: "Elde, yalnızca mevcut ışıkla, tripod izni olmadan. Her şehre tek gece ve 3 saatlik bir pencere; orada ne varsa hikâye oydu.",
    },
    result: {
      en: "A 16-page portfolio and the supplement’s most-shared issue of 2023.",
      tr: "16 sayfalık bir portfolyo ve ekin 2023’te en çok paylaşılan sayısı.",
    },
    credits: [
      { label: { en: "Picture editor", tr: "Fotoğraf editörü" }, value: { en: "Daan Verhoef", tr: "Daan Verhoef" } },
      { label: { en: "Window", tr: "Zaman aralığı" }, value: { en: "01:00–04:00, one night per city", tr: "01.00–04.00, şehir başına bir gece" } },
      { label: { en: "Published", tr: "Yayın" }, value: { en: "March 2023, 16 pages", tr: "Mart 2023, 16 sayfa" } },
    ],
    photos: [
      shot("1528360983277-13d401cdc186", 1200, 1500, { en: "A narrow alley at night lit by red paper lanterns", tr: "Kırmızı kâğıt fenerlerle aydınlanan dar bir gece sokağı" }),
      shot("1486325212027-8081e485255e", 1600, 1067, { en: "A city skyline at dusk with a tall tower", tr: "Alacakaranlıkta yüksek bir kulenin olduğu şehir silueti" }),
      shot("1477959858617-67f85cf4f1df", 1600, 1067, { en: "A dense waterfront city seen from high above", tr: "Yüksekten görülen sık yapılaşmış bir kıyı şehri" }),
      shot("1523906834658-6e24ef2386f9", 1600, 1067, { en: "An old stone bridge over a canal lined with palaces", tr: "Saraylarla çevrili bir kanalın üzerinde eski taş köprü" }),
    ],
    featured: [0],
  },
  {
    id: "rooms-in-order",
    title: "Rooms in Order",
    year: 2023,
    clientType: { en: "Furniture brand", tr: "Mobilya markası" },
    client: "Hale & Rune",
    discipline: "interiors",
    place: { en: "Three apartments in Kuzguncuk", tr: "Kuzguncuk’ta üç daire" },
    summary: {
      en: "Real homes instead of a studio set: a furniture lookbook shot in the apartments of three customers.",
      tr: "Stüdyo seti yerine gerçek evler: üç müşterinin dairesinde çekilen bir mobilya kataloğu.",
    },
    brief: {
      en: "Hale & Rune wanted their pieces next to things they did not make — books, radiators, a child’s drawing on the fridge.",
      tr: "Hale & Rune ürünlerinin kendi yapmadıkları şeylerin yanında görünmesini istedi — kitaplar, kaloriferler, buzdolabındaki bir çocuk resmi.",
    },
    approach: {
      en: "Daylight only, shot at the hour each room is used. Nothing moved more than an arm’s length; the owners approved every frame.",
      tr: "Yalnızca gün ışığı; her oda kullanıldığı saatte çekildi. Hiçbir şey bir kol boyundan fazla yerinden oynatılmadı; ev sahipleri her kareyi onayladı.",
    },
    result: {
      en: "A 40-page lookbook and the product pages of the autumn range. Return rate on the range fell from 9% to 4%.",
      tr: "40 sayfalık bir katalog ve sonbahar serisinin ürün sayfaları. Serideki iade oranı %9’dan %4’e düştü.",
    },
    credits: [
      { label: { en: "Styling", tr: "Stil" }, value: { en: "None — the owners’ own things", tr: "Yok — ev sahiplerinin kendi eşyaları" } },
      { label: { en: "Homes", tr: "Ev" }, value: { en: "3 apartments, 11 rooms", tr: "3 daire, 11 oda" } },
      { label: { en: "Published", tr: "Yayın" }, value: { en: "September 2023", tr: "Eylül 2023" } },
    ],
    photos: [
      shot("1493809842364-78817add7ffb", 1600, 1067, { en: "A living room with a blue sofa and tall windows", tr: "Mavi kanepesi ve yüksek pencereleri olan bir oturma odası" }),
      shot("1513694203232-719a280e022f", 1200, 1500, { en: "A quiet corner with a dark sofa, a plant and a floor lamp", tr: "Koyu renk kanepe, bitki ve lambaderle sakin bir köşe" }),
      shot("1481277542470-605612bd2d61", 1600, 1067, { en: "Open white double doors in an empty room", tr: "Boş bir odada açık beyaz çift kanatlı kapı" }),
      shot("1490481651871-ab68de25d43d", 1200, 1500, { en: "Linen clothes hanging on a simple rail", tr: "Basit bir askılıkta asılı keten giysiler" }),
    ],
    featured: [1, 0],
  },
];

export const cameraPhoto = shot("1452587925148-ce544e77e70d", 1200, 1500, { en: "A worn film camera and a few small prints on a wooden table", tr: "Ahşap masada eskimiş bir film kamerası ve birkaç küçük baskı" });

/** Client list on the about page: text only, by sector. */
export const clientGroups: { sector: L; names: string[] }[] = [
  { sector: { en: "Editorial", tr: "Yayın" }, names: ["Meridyen Quarterly", "Tessel Weekend", "Kıyı Review", "Northline Journal"] },
  { sector: { en: "Architecture", tr: "Mimarlık" }, names: ["Okarr Architects", "Atelier Brem", "Ova Yapı", "Studio Varga"] },
  { sector: { en: "Brands", tr: "Markalar" }, names: ["Norrfjell Outfitters", "Hale & Rune", "Kumru Ceramics", "Larsen Bikes"] },
  { sector: { en: "Culture", tr: "Kültür" }, names: ["Halde Foundation", "Galeri Altı", "Het Lage Huis", "Moda Film Days"] },
];

export const exhibitions: { year: string; title: L; place: L }[] = [
  { year: "2026", title: { en: "Salt & Stone (group)", tr: "Salt & Stone (karma)" }, place: { en: "Kıyı Photo Week, Izmir", tr: "Kıyı Fotoğraf Haftası, İzmir" } },
  { year: "2025", title: { en: "Quiet Faces", tr: "Quiet Faces" }, place: { en: "Halde Foundation, Istanbul and Rotterdam", tr: "Halde Vakfı, İstanbul ve Rotterdam" } },
  { year: "2025", title: { en: "Concrete Weather", tr: "Concrete Weather" }, place: { en: "Het Lage Huis, Rotterdam", tr: "Het Lage Huis, Rotterdam" } },
  { year: "2024", title: { en: "Fog Studies (solo)", tr: "Fog Studies (kişisel)" }, place: { en: "Galeri Altı, Istanbul", tr: "Galeri Altı, İstanbul" } },
];
