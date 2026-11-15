// Sample content for "The Harbour Ledger" / "Kıyı Gazetesi", a fictional daily of a fictional
// coastal city. Every human-readable field is `Localized` ({ en, tr }) and resolved with `pickLocale`.
// No real outlet, person or event: names, figures and quotes are invented.
import { pickLocale, sitePageHref, newsLabelsTr, site2LabelsTr, blockLabelsTr, type Localized, type NewsPost, type RichDoc } from "@vamos-ui/react/blocks";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

/** Ink-red accent; SiteShell contrast-checks it for light and dark. */
export const ACCENT = "#A3322B";
/** The demo's "today": fixed so the page renders the same everywhere. */
export const TODAY = "2026-11-15";

const unsplash = (id: string, w = 1600, h = 1067) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  return {
    t,
    intl: locale === "tr" ? "tr-TR" : "en-GB",
    brand: locale === "tr" ? "Kıyı Gazetesi" : "The Harbour Ledger",
    newsLabels: locale === "tr" ? newsLabelsTr : undefined,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site2LabelsTr } : undefined,
  };
}

// ---------------------------------------------------------------- sections

export type SectionId = "city" | "economy" | "science" | "culture" | "sport" | "tech" | "environment" | "opinion";

export const sections: Record<SectionId, { label: L; subs: { id: string; label: L }[] }> = {
  city: { label: { en: "City", tr: "Şehir" }, subs: [{ id: "transport", label: { en: "Transport", tr: "Ulaşım" } }, { id: "housing", label: { en: "Housing", tr: "Konut" } }, { id: "schools", label: { en: "Schools", tr: "Okullar" } }] },
  economy: { label: { en: "Economy", tr: "Ekonomi" }, subs: [{ id: "markets", label: { en: "Markets", tr: "Piyasalar" } }, { id: "work", label: { en: "Work", tr: "Çalışma hayatı" } }, { id: "port", label: { en: "The port", tr: "Liman" } }] },
  science: { label: { en: "Science", tr: "Bilim" }, subs: [{ id: "sea", label: { en: "Sea & coast", tr: "Deniz ve kıyı" } }, { id: "health", label: { en: "Health", tr: "Sağlık" } }] },
  culture: { label: { en: "Culture", tr: "Kültür" }, subs: [{ id: "music", label: { en: "Music", tr: "Müzik" } }, { id: "books", label: { en: "Books", tr: "Kitap" } }, { id: "stage", label: { en: "Stage", tr: "Sahne" } }] },
  sport: { label: { en: "Sport", tr: "Spor" }, subs: [{ id: "football", label: { en: "Football", tr: "Futbol" } }, { id: "running", label: { en: "Running", tr: "Koşu" } }] },
  tech: { label: { en: "Technology", tr: "Teknoloji" }, subs: [{ id: "startups", label: { en: "Start-ups", tr: "Girişimler" } }, { id: "industry", label: { en: "Industry", tr: "Sanayi" } }] },
  environment: { label: { en: "Environment", tr: "Çevre" }, subs: [] },
  opinion: { label: { en: "Opinion", tr: "Görüş" }, subs: [] },
};

export const sectionHref = (id: string) => sitePageHref("category", id);
export const ARTICLE_HREF = sitePageHref("article");

// ---------------------------------------------------------------- people

export const authors = {
  ayla: { name: "Ayla Durukan", role: { en: "City editor", tr: "Şehir editörü" } },
  jonas: { name: "Jonas Werth", role: { en: "Economics correspondent", tr: "Ekonomi muhabiri" } },
  ece: { name: "Ece Tamer", role: { en: "Science writer", tr: "Bilim yazarı" } },
  marco: { name: "Marco Lind", role: { en: "Culture critic", tr: "Kültür eleştirmeni" } },
  derin: { name: "Derin Asal", role: { en: "Sports reporter", tr: "Spor muhabiri" } },
  nil: { name: "Nil Karaca", role: { en: "Technology reporter", tr: "Teknoloji muhabiri" } },
} as const;
export type AuthorId = keyof typeof authors;

// ---------------------------------------------------------------- photos

const photo = {
  dusk: unsplash("1477959858617-67f85cf4f1df", 2000, 1250),
  avenue: unsplash("1449824913935-59a10b8d2000"),
  canyon: unsplash("1519501025264-65ba15a82390"),
  river: unsplash("1513635269975-59663e0ac1ad"),
  rooftops: unsplash("1524231757912-21f4fe3a7200"),
  bridge: unsplash("1505761671935-60b3a7427bad"),
  fog: unsplash("1449157291145-7efd050a4d0e"),
  site: unsplash("1541888946425-d81bb19240f5"),
  cranes: unsplash("1565008447742-97f6f38c985c"),
  pit: unsplash("1517089596392-fb9a9033e05b"),
  floodlight: unsplash("1431324155629-1a6deb1dec8d"),
  stands: unsplash("1522778119026-d647f0596c20"),
  volley: unsplash("1560272564-c83b66b1ad12"),
  runner: unsplash("1476480862126-209bfaa8edc8"),
  runners: unsplash("1552674605-db6ffd4facb5"),
  crowd: unsplash("1501386761578-eac5c94b800a"),
  stage: unsplash("1516450360452-9312f5e86fc7"),
  guitar: unsplash("1484876065684-b683cf17d276"),
  lab: unsplash("1581091226825-a6a2a5aee158"),
  sparks: unsplash("1504917595217-d4dc5ebe6122"),
  pipes: unsplash("1513828583688-c52646db42da"),
  drawing: unsplash("1581092160562-40aa08e78837"),
  forms: unsplash("1554224155-6726b3ff858f"),
  chart: unsplash("1551288049-bebda4e38f71"),
  team: unsplash("1522071820081-009f0129c71c"),
  sketch: unsplash("1543286386-713bdd548da4"),
  students: unsplash("1522202176988-66273c2fd55f"),
  reading: unsplash("1524758631624-e2822e304c36"),
  notes: unsplash("1434030216411-0b793f4b4173"),
  produce: unsplash("1498837167922-ddd27525d352"),
  folded: unsplash("1487958449943-2429e8be8625"),
  timber: unsplash("1600585154340-be6161a56a0c"),
  flat: unsplash("1502672260266-1c1ef2d93688"),
  road: unsplash("1568605117036-5fe5e7bab0b7"),
  wheel: unsplash("1449965408869-eaa3f722e40d"),
};

// ---------------------------------------------------------------- stories

interface Story {
  id: string;
  section: SectionId;
  sub?: string;
  title: L;
  dek: L;
  photo: keyof typeof photo;
  alt: L;
  author: AuthorId;
  at: string;
  comments: number;
  minutes: number;
  format?: NewsPost["format"];
}

const s = (story: Story) => story;

export const stories: Story[] = [
  s({ id: "tram", section: "city", sub: "transport", title: { en: "The night tram returns: council votes to run the coast line until 2 a.m.", tr: "Gece tramvayı geri dönüyor: meclis sahil hattının 02.00’ye kadar çalışmasını onayladı" }, dek: { en: "A twelve-month trial starts in March. Shift workers at the hospital and the port pushed for it for three years.", tr: "On iki aylık deneme Mart’ta başlıyor. Hastane ve liman çalışanları üç yıldır bunun için uğraşıyordu." }, photo: "dusk", alt: { en: "The city at dusk seen from above, streets lit in a grid", tr: "Alacakaranlıkta yukarıdan şehir, ızgara gibi aydınlanan sokaklar" }, author: "ayla", at: "2026-11-15T07:40:00+03:00", comments: 48, minutes: 6 }),
  s({ id: "port-cranes", section: "economy", sub: "port", title: { en: "Port orders four electric cranes and a shore-power berth", tr: "Liman dört elektrikli vinç ve kıyı elektriği iskelesi sipariş etti" }, dek: { en: "The 61-million-euro package is the largest since the container terminal opened.", tr: "61 milyon avroluk paket, konteyner terminali açıldığından beri en büyüğü." }, photo: "cranes", alt: { en: "Two towers under construction with tower cranes against a blue sky", tr: "Mavi gökyüzüne karşı kule vinçleriyle inşa hâlindeki iki bina" }, author: "jonas", at: "2026-11-15T06:15:00+03:00", comments: 12, minutes: 5 }),
  s({ id: "seagrass", section: "science", sub: "sea", title: { en: "Seagrass meadows are back in the bay, divers count", tr: "Dalgıçlar saydı: deniz çayırları körfeze geri dönüyor" }, dek: { en: "Volunteer surveys find twice the cover of 2021 along the eastern shore.", tr: "Gönüllü taramalar doğu kıyısında 2021’in iki katı örtü buldu." }, photo: "river", alt: { en: "A river bending through the city at dusk, bridges lit", tr: "Alacakaranlıkta şehrin içinden kıvrılan nehir, ışıklı köprüler" }, author: "ece", at: "2026-11-14T18:20:00+03:00", comments: 9, minutes: 7, format: "gallery" }),
  s({ id: "derby", section: "sport", sub: "football", title: { en: "Late header settles the coast derby in front of a record crowd", tr: "Son dakika kafası, rekor seyirci önünde kıyı derbisini belirledi" }, dek: { en: "Liman Spor climb to second after a 2–1 win under the new floodlights.", tr: "Liman Spor yeni ışıklar altında 2–1 kazanarak ikinci sıraya yükseldi." }, photo: "floodlight", alt: { en: "A night game under a single floodlight", tr: "Tek bir projektör altında bir gece maçı" }, author: "derin", at: "2026-11-14T22:05:00+03:00", comments: 131, minutes: 4, format: "video" }),
  s({ id: "rents", section: "city", sub: "housing", title: { en: "Rents near the waterfront rose 31 per cent in a year. Who still lives there?", tr: "Sahil şeridinde kiralar bir yılda yüzde 31 arttı. Orada kim yaşıyor hâlâ?" }, dek: { en: "We knocked on 140 doors on three streets to find out.", tr: "Öğrenmek için üç sokakta 140 kapı çaldık." }, photo: "flat", alt: { en: "A living room with a grey sofa, plants and tall windows", tr: "Gri kanepeli, bitkili ve yüksek pencereli bir oturma odası" }, author: "ayla", at: "2026-11-14T09:00:00+03:00", comments: 76, minutes: 11 }),
  s({ id: "festival", section: "culture", sub: "music", title: { en: "The warehouse festival sells out in nine minutes", tr: "Antrepo festivalinin biletleri dokuz dakikada tükendi" }, dek: { en: "Organisers promise a second weekend and a ballot for residents.", tr: "Organizatörler ikinci bir hafta sonu ve mahalleli için kura sözü veriyor." }, photo: "crowd", alt: { en: "A packed crowd with hands up in front of a stage", tr: "Sahnenin önünde elleri havada kalabalık" }, author: "marco", at: "2026-11-13T16:30:00+03:00", comments: 22, minutes: 3 }),
  s({ id: "chips", section: "tech", sub: "industry", title: { en: "A sensor plant in the free zone will hire 400 engineers", tr: "Serbest bölgedeki sensör fabrikası 400 mühendis alacak" }, dek: { en: "Production of marine sensors starts in the spring; the university is adding a course.", tr: "Deniz sensörü üretimi baharda başlıyor; üniversite yeni bir ders açıyor." }, photo: "lab", alt: { en: "An engineer at a laptop beside an automated machining line", tr: "Otomatik tezgâh hattının yanında dizüstü başında bir mühendis" }, author: "nil", at: "2026-11-13T11:10:00+03:00", comments: 17, minutes: 5 }),
  s({ id: "schools", section: "city", sub: "schools", title: { en: "Six schools will open their yards to the neighbourhood at weekends", tr: "Altı okul hafta sonları bahçesini mahalleye açacak" }, dek: { en: "A pilot with caretakers on extra pay and a booking sheet for clubs.", tr: "Hizmetlilere ek ücret ve kulüpler için rezervasyon listesiyle bir pilot uygulama." }, photo: "students", alt: { en: "Three students comparing notes around a wooden table", tr: "Ahşap bir masa etrafında notlarını karşılaştıran üç öğrenci" }, author: "ayla", at: "2026-11-13T08:00:00+03:00", comments: 14, minutes: 4 }),
  s({ id: "inflation", section: "economy", sub: "markets", title: { en: "Shop prices in the city rose less than the national rate for a third month", tr: "Şehirde market fiyatları üçüncü ayda da ülke ortalamasının altında arttı" }, dek: { en: "Our basket of 40 goods, priced every Friday since 2023, explained.", tr: "2023’ten beri her cuma fiyatladığımız 40 ürünlük sepet, açıklamasıyla." }, photo: "produce", alt: { en: "Trays of chopped vegetables, beans and herbs", tr: "Doğranmış sebze, fasulye ve otlarla dolu tepsiler" }, author: "jonas", at: "2026-11-12T14:45:00+03:00", comments: 33, minutes: 6 }),
  s({ id: "unions", section: "economy", sub: "work", title: { en: "Dock workers and the port agree a four-day rota for night shifts", tr: "Liman işçileri ile işletme gece vardiyası için dört günlük düzende anlaştı" }, dek: { en: "The deal follows eleven weeks of talks and no strike.", tr: "Anlaşma on bir haftalık görüşmenin ardından grevsiz geldi." }, photo: "pipes", alt: { en: "Stainless pipework and a blower in a clean production hall", tr: "Temiz bir üretim salonunda paslanmaz borular ve bir fan" }, author: "jonas", at: "2026-11-12T10:20:00+03:00", comments: 41, minutes: 5 }),
  s({ id: "startup", section: "tech", sub: "startups", title: { en: "Three graduates built a tide app. Fishermen now pay for it", tr: "Üç mezun bir gelgit uygulaması yaptı. Balıkçılar artık para veriyor" }, dek: { en: "From a thesis project to 9,000 subscribers along the coast.", tr: "Bir tez projesinden kıyı boyunca 9.000 aboneye." }, photo: "team", alt: { en: "Four people reviewing a layout on a laptop", tr: "Bir dizüstünde taslağı inceleyen dört kişi" }, author: "nil", at: "2026-11-12T09:00:00+03:00", comments: 19, minutes: 6 }),
  s({ id: "library", section: "culture", sub: "books", title: { en: "The old customs house becomes a library with a reading room on the roof", tr: "Eski gümrük binası çatısında okuma salonu olan bir kütüphaneye dönüşüyor" }, dek: { en: "Architects kept the ledgers’ shelves and the clock.", tr: "Mimarlar defter raflarını ve saati korudu." }, photo: "reading", alt: { en: "A bright reading room with low chairs and a floor lamp", tr: "Alçak koltuklu ve lambaderli aydınlık bir okuma salonu" }, author: "marco", at: "2026-11-11T17:00:00+03:00", comments: 8, minutes: 5 }),
  s({ id: "marathon", section: "sport", sub: "running", title: { en: "Coast marathon moves its start to 7 a.m. to beat the heat", tr: "Sahil maratonu sıcaktan kaçmak için startı 07.00’ye çekti" }, dek: { en: "The course also loses its hardest climb.", tr: "Parkurdaki en zorlu yokuş da çıkarıldı." }, photo: "runner", alt: { en: "A runner on an empty coastal road at dawn", tr: "Şafakta boş bir sahil yolunda koşan biri" }, author: "derin", at: "2026-11-11T08:30:00+03:00", comments: 27, minutes: 3 }),
  s({ id: "heat", section: "environment", title: { en: "Hottest October on record: what the city’s 40 new trees are for", tr: "Kayıtların en sıcak ekimi: şehrin dikeceği 40 yeni ağaç ne işe yarayacak" }, dek: { en: "Shade maps show where a tree lowers the pavement by nine degrees.", tr: "Gölge haritaları bir ağacın kaldırımı dokuz derece serinlettiği yerleri gösteriyor." }, photo: "canyon", alt: { en: "A street canyon at dusk, buses and tail lights", tr: "Alacakaranlıkta bir cadde, otobüsler ve stop lambaları" }, author: "ece", at: "2026-11-10T12:00:00+03:00", comments: 52, minutes: 8 }),
  s({ id: "bridge", section: "city", sub: "transport", title: { en: "The swing bridge will close for six weeks. Here are the detours", tr: "Döner köprü altı hafta kapalı kalacak. İşte alternatif güzergâhlar" }, dek: { en: "Buses 4 and 11 change route; cyclists get a temporary lane.", tr: "4 ve 11 numaralı otobüslerin güzergâhı değişiyor; bisikletlilere geçici şerit." }, photo: "bridge", alt: { en: "A stone bridge and a clock tower under a cloudy sky", tr: "Bulutlu gökyüzü altında taş köprü ve saat kulesi" }, author: "ayla", at: "2026-11-10T07:30:00+03:00", comments: 64, minutes: 4 }),
  s({ id: "air-sensors", section: "science", sub: "health", title: { en: "Air sensors on 30 bus stops: the first month of readings", tr: "30 otobüs durağında hava sensörü: ilk ayın ölçümleri" }, dek: { en: "Mornings near the ring road are the worst; the seafront the cleanest.", tr: "En kötüsü çevre yolu yakınındaki sabahlar; en temizi sahil." }, photo: "fog", alt: { en: "Looking up between glass towers into fog", tr: "Cam kuleler arasından sise doğru yukarı bakış" }, author: "ece", at: "2026-11-09T15:00:00+03:00", comments: 11, minutes: 6 }),
  s({ id: "theatre", section: "culture", sub: "stage", title: { en: "Review: a two-hander about a lighthouse keeper is the best thing on stage this year", tr: "Eleştiri: bir fener bekçisini anlatan iki kişilik oyun yılın en iyisi" }, dek: { en: "Ninety minutes, one lamp, no interval.", tr: "Doksan dakika, tek lamba, ara yok." }, photo: "stage", alt: { en: "A stage washed in pink light", tr: "Pembe ışıkla yıkanan bir sahne" }, author: "marco", at: "2026-11-09T20:00:00+03:00", comments: 6, minutes: 4 }),
  s({ id: "stadium", section: "sport", sub: "football", title: { en: "Stadium roof gets solar panels before the derby season", tr: "Stadyum çatısına derbi sezonundan önce güneş paneli" }, dek: { en: "The club says the roof will cover a third of match-day power.", tr: "Kulübe göre çatı maç günü elektriğinin üçte birini karşılayacak." }, photo: "stands", alt: { en: "Full stands around a striped pitch before kick-off", tr: "Başlama vuruşundan önce çizgili saha etrafında dolu tribünler" }, author: "derin", at: "2026-11-08T13:00:00+03:00", comments: 15, minutes: 3 }),
  s({ id: "welding", section: "tech", sub: "industry", title: { en: "Shipyard apprentices: 120 places, 1,900 applications", tr: "Tersane çıraklığı: 120 kontenjan, 1.900 başvuru" }, dek: { en: "Welding is the most wanted trade on the coast again.", tr: "Kaynakçılık kıyıda yine en çok aranan meslek." }, photo: "sparks", alt: { en: "Sparks from a grinder held against a steel part", tr: "Çelik parçaya tutulan taşlamadan sıçrayan kıvılcımlar" }, author: "nil", at: "2026-11-08T09:40:00+03:00", comments: 23, minutes: 5 }),
  s({ id: "budget", section: "economy", sub: "markets", title: { en: "City budget 2027: where each lira goes, in one chart", tr: "2027 kent bütçesi: her liranın nereye gittiği tek grafikte" }, dek: { en: "Transport takes the largest share for the first time.", tr: "İlk kez en büyük payı ulaşım alıyor." }, photo: "chart", alt: { en: "A campaign report on a monitor", tr: "Ekranda bir rapor" }, author: "jonas", at: "2026-11-07T10:00:00+03:00", comments: 29, minutes: 7 }),
  s({ id: "housing-coop", section: "city", sub: "housing", title: { en: "A housing co-op of 48 flats breaks ground on the old rail yard", tr: "48 dairelik konut kooperatifi eski demiryolu sahasında temel attı" }, dek: { en: "Members pay 30 per cent below market and cannot sell for 15 years.", tr: "Üyeler piyasanın yüzde 30 altında ödüyor ve 15 yıl satamıyor." }, photo: "site", alt: { en: "A site crew in hi-vis jackets on a freshly poured slab", tr: "Yeni dökülmüş bir döşemede reflektif yelekli şantiye ekibi" }, author: "ayla", at: "2026-11-07T08:00:00+03:00", comments: 37, minutes: 6 }),
  s({ id: "museum", section: "culture", title: { en: "Museum night draws 22,000 visitors to 14 buildings", tr: "Müze gecesi 14 binaya 22.000 ziyaretçi çekti" }, dek: { en: "The longest queue: the lighthouse.", tr: "En uzun kuyruk: fener." }, photo: "folded", alt: { en: "A white building of folded planes against a pale sky", tr: "Soluk gökyüzüne karşı katlanmış düzlemlerden beyaz bir bina" }, author: "marco", at: "2026-11-06T22:00:00+03:00", comments: 4, minutes: 3, format: "gallery" }),
  s({ id: "driving", section: "city", sub: "transport", title: { en: "Speed limit on the coast road drops to 50", tr: "Sahil yolunda hız sınırı 50’ye iniyor" }, dek: { en: "Eight crossings get raised tables before summer.", tr: "Sekiz geçide yazdan önce yükseltilmiş platform yapılacak." }, photo: "road", alt: { en: "A car taking a long bend on an open road at sunset", tr: "Gün batımında açık yolda uzun bir virajı alan araba" }, author: "ayla", at: "2026-11-06T09:15:00+03:00", comments: 88, minutes: 4 }),
  s({ id: "op-ed", section: "opinion", title: { en: "Opinion: a city that closes its seafront at night has given up on half its people", tr: "Görüş: sahilini geceleri kapatan şehir, insanlarının yarısından vazgeçmiştir" }, dek: { en: "Lights, toilets and a bus: the seafront needs three things, not a fence.", tr: "Işık, tuvalet ve bir otobüs: sahilin ihtiyacı üç şey, çit değil." }, photo: "rooftops", alt: { en: "Rooftops climbing a hill below a stone tower", tr: "Taş bir kulenin altında yokuşa tırmanan çatılar" }, author: "marco", at: "2026-11-05T19:00:00+03:00", comments: 112, minutes: 5 }),
  s({ id: "exam", section: "city", sub: "schools", title: { en: "Free evening study rooms open in four libraries before exams", tr: "Sınav öncesi dört kütüphanede ücretsiz akşam etüt salonu açılıyor" }, dek: { en: "Open until 11 p.m., with a quiet floor and tutors on Thursdays.", tr: "23.00’e kadar açık; sessiz kat ve perşembeleri eğitmen var." }, photo: "notes", alt: { en: "A hand taking notes beside a cup", tr: "Bir fincanın yanında not alan bir el" }, author: "ayla", at: "2026-11-05T08:00:00+03:00", comments: 10, minutes: 3 }),
  s({ id: "wind", section: "environment", title: { en: "Offshore wind survey ship arrives for a 90-day study", tr: "Açık deniz rüzgârı için araştırma gemisi 90 günlük çalışmaya geldi" }, dek: { en: "Fishing groups want a say in where the turbines go.", tr: "Balıkçı örgütleri türbinlerin yeri konusunda söz istiyor." }, photo: "drawing", alt: { en: "A technical drawing on a bench, an engineer marking it up", tr: "Tezgâhta teknik bir çizim, üzerinde işaretleme yapan mühendis" }, author: "ece", at: "2026-11-04T11:00:00+03:00", comments: 21, minutes: 6 }),
  s({ id: "jazz", section: "culture", sub: "music", title: { en: "A jazz quartet records an album inside the cistern", tr: "Bir caz dörtlüsü sarnıcın içinde albüm kaydetti" }, dek: { en: "Eleven seconds of reverb, two microphones.", tr: "On bir saniye yankı, iki mikrofon." }, photo: "guitar", alt: { en: "A guitarist in silhouette against teal light", tr: "Turkuaz ışığa karşı silueti görünen gitarist" }, author: "marco", at: "2026-11-03T18:00:00+03:00", comments: 5, minutes: 4, format: "video" }),
  s({ id: "tax", section: "economy", sub: "work", title: { en: "Freelancers: the new monthly tax form, line by line", tr: "Serbest çalışanlar: yeni aylık vergi formu, satır satır" }, dek: { en: "What changes in January and what you can ignore.", tr: "Ocak’ta ne değişiyor, neyi boş verebilirsiniz." }, photo: "forms", alt: { en: "Tax forms, receipts and a calculator on a desk", tr: "Masada vergi formları, fişler ve hesap makinesi" }, author: "jonas", at: "2026-11-03T09:00:00+03:00", comments: 58, minutes: 9 }),
  s({ id: "relay", section: "sport", sub: "running", title: { en: "Schools relay returns after six years, with 64 teams", tr: "Okullar arası bayrak yarışı altı yıl sonra 64 takımla dönüyor" }, dek: { en: "Heats on the seafront track on Saturday morning.", tr: "Elemeler cumartesi sabahı sahil pistinde." }, photo: "runners", alt: { en: "Two runners side by side on a city street", tr: "Şehirde yan yana koşan iki kişi" }, author: "derin", at: "2026-11-02T10:00:00+03:00", comments: 3, minutes: 3 }),
  s({ id: "timber", section: "environment", title: { en: "The first timber-frame school in the region opens with half the carbon", tr: "Bölgenin ilk ahşap karkas okulu yarı karbonla açıldı" }, dek: { en: "Built in 14 months; pupils move in after the winter break.", tr: "14 ayda yapıldı; öğrenciler sömestr sonrası taşınıyor." }, photo: "timber", alt: { en: "A dark timber building with tall glazed openings", tr: "Yüksek camlı açıklıkları olan koyu ahşap bir bina" }, author: "ece", at: "2026-11-01T12:00:00+03:00", comments: 12, minutes: 5 }),
];

export function postOf(story: Story, locale: SiteLocale): NewsPost {
  const t = (v: L) => pickLocale(v, locale) ?? "";
  const sub = sections[story.section].subs.find((x) => x.id === story.sub);
  return {
    id: story.id,
    href: ARTICLE_HREF,
    title: t(story.title),
    excerpt: t(story.dek),
    cover: { ...photo[story.photo], alt: t(story.alt) },
    category: { label: t(sub?.label ?? sections[story.section].label), href: sectionHref(story.sub ?? story.section) },
    publishedAt: story.at,
    author: { name: authors[story.author].name },
    commentCount: story.comments,
    readingMinutes: story.minutes,
    format: story.format,
  };
}

export const byId = (id: string) => stories.find((x) => x.id === id)!;
export const inSection = (id: SectionId) => stories.filter((x) => x.section === id);
export const inSub = (sub: string) => stories.filter((x) => x.sub === sub);

/** The article page's body (EN / TR). */
export const articleBody: Record<SiteLocale, RichDoc> = {
  en: {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ text: "From March, the coast tram will keep running until two in the morning on every day of the week. The council approved a twelve-month trial on Thursday by 31 votes to 9, after a debate that ran past midnight — fittingly, some members noted, after the last tram had gone." }] },
      { type: "paragraph", content: [{ text: "The trial adds eleven departures in each direction between 23:30 and 02:00, one every fifteen minutes, on the full 14-kilometre line from the ferry terminal to the hospital. The transport authority puts the cost at 38 million lira a year, most of it drivers’ night pay." }] },
      { type: "heading", level: 2, content: [{ text: "Who asked for it" }] },
      { type: "paragraph", content: [{ text: "The push came from the people who finish work when the city has gone to bed. Nurses at the coast hospital, cleaners in the office towers and dock workers on the late shift gathered 14,000 signatures in 2024 and came back with 22,000 a year later." }] },
      { type: "blockquote", cite: "Selma Ordu, ward nurse", content: [{ type: "paragraph", content: [{ text: "We were paying for taxis out of wages that don’t cover taxis. Now I can get home on the same ticket I came in on." }] }] },
      { type: "paragraph", content: [{ text: "Ward nurse Selma Ordu, who spoke in the public gallery, said the last tram at 23:20 forced her to leave before handover or walk forty minutes along the ring road." }] },
      { type: "heading", level: 2, content: [{ text: "What the trial will measure" }] },
      { type: "paragraph", content: [{ text: "Ridership is only one test. The authority will also count late-night taxi trips from the hospital rank, noise complaints along the line and the number of drivers who volunteer for the night rota before it has to be assigned." }] },
      { type: "list", ordered: false, items: [{ content: [{ type: "paragraph", content: [{ text: "Eleven extra departures each way, 23:30–02:00" }] }] }, { content: [{ type: "paragraph", content: [{ text: "Same fares; night tickets valid on the 4 and 11 buses" }] }] }, { content: [{ type: "paragraph", content: [{ text: "A review at six months, published in full" }] }] }] },
      { type: "heading", level: 2, content: [{ text: "The objections" }] },
      { type: "paragraph", content: [{ text: "Residents on Fener Street, where the line runs a metre from bedroom windows, asked for quieter wheels and a slower limit after midnight. Both were added to the motion as amendments. Opposition members argued the money would do more on the bus network, where three routes stop at 22:00." }] },
      { type: "paragraph", content: [{ text: "The council’s answer was the review: if fewer than 900 people a night use the late trams by September, the money moves to buses." }] },
    ],
  },
  tr: {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ text: "Sahil tramvayı mart ayından itibaren haftanın her günü gece ikiye kadar çalışacak. Meclis on iki aylık denemeyi perşembe günü 9’a karşı 31 oyla kabul etti; tartışma gece yarısını geçti — bazı üyelerin belirttiği gibi, son tramvay çoktan gitmişken." }] },
      { type: "paragraph", content: [{ text: "Deneme, feribot iskelesinden hastaneye uzanan 14 kilometrelik hatta her iki yönde 23.30 ile 02.00 arasında on beş dakikada bir, toplam on bir sefer ekliyor. Ulaşım idaresi maliyeti yılda 38 milyon lira olarak hesaplıyor; büyük kısmı vatmanların gece ücreti." }] },
      { type: "heading", level: 2, content: [{ text: "Kim istedi" }] },
      { type: "paragraph", content: [{ text: "Talep, şehir uyuduğunda işten çıkanlardan geldi. Sahil hastanesindeki hemşireler, ofis kulelerindeki temizlik çalışanları ve gece vardiyasındaki liman işçileri 2024’te 14.000 imza topladı, bir yıl sonra 22.000 imzayla geri geldi." }] },
      { type: "blockquote", cite: "Selma Ordu, servis hemşiresi", content: [{ type: "paragraph", content: [{ text: "Taksiye yetmeyen maaşlardan taksi parası ödüyorduk. Artık geldiğim biletle eve dönebileceğim." }] }] },
      { type: "paragraph", content: [{ text: "Galeride söz alan servis hemşiresi Selma Ordu, 23.20’deki son tramvay yüzünden ya nöbet devrinden önce çıkmak ya da çevre yolu boyunca kırk dakika yürümek zorunda kaldığını anlattı." }] },
      { type: "heading", level: 2, content: [{ text: "Deneme neyi ölçecek" }] },
      { type: "paragraph", content: [{ text: "Yolcu sayısı tek ölçüt değil. İdare, hastane taksi durağından yapılan gece yolculuklarını, hat boyunca gelen gürültü şikâyetlerini ve gece vardiyasına gönüllü olan vatman sayısını da sayacak." }] },
      { type: "list", ordered: false, items: [{ content: [{ type: "paragraph", content: [{ text: "Her yönde on bir ek sefer, 23.30–02.00" }] }] }, { content: [{ type: "paragraph", content: [{ text: "Aynı ücret; gece biletleri 4 ve 11 numaralı otobüslerde de geçerli" }] }] }, { content: [{ type: "paragraph", content: [{ text: "Altıncı ayda, tamamı yayımlanacak bir değerlendirme" }] }] }] },
      { type: "heading", level: 2, content: [{ text: "İtirazlar" }] },
      { type: "paragraph", content: [{ text: "Hattın yatak odası pencerelerinden bir metre uzaktan geçtiği Fener Sokağı sakinleri daha sessiz tekerlek ve gece yarısından sonra daha düşük hız istedi. İkisi de önergeye eklendi. Muhalefet üyeleri ise üç hattın 22.00’de durduğu otobüs ağına harcanacak paranın daha çok iş göreceğini savundu." }] },
      { type: "paragraph", content: [{ text: "Meclisin cevabı değerlendirme oldu: eylüle kadar gece tramvaylarını her gece 900’den az kişi kullanırsa para otobüslere aktarılacak." }] },
    ],
  },
};
