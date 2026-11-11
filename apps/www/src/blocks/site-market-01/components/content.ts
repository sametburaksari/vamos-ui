// Sample content for "Makersrow", a fictional marketplace for independent makers in Türkiye.
// Every human-readable field is `Localized` ({ en, tr }). Prices are TRY. Sellers, people and
// reviews are fictional; photos are unbranded stock with matching alt text.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

/** Ocean blue; the shell derives fill, text-on-fill and ink at 4.5:1. */
export const OCEAN = "#0369A1";
export const PHONE = "+902160000000";
export const EMAIL = "help@makersrow.example.com";

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "TRY", timeZone: "Europe/Istanbul" });
  const lira = (v: number) => f.currency(String(v), "TRY", { currencyDisplay: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  /** 4.9 → "4.9" / "4,9". */
  const rating = (v: number) => f.number(v, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return {
    locale,
    t,
    f,
    lira,
    rating,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));

const photo = (id: string, w = 900, h = 1100) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });
const portrait = (id: string) => `https://images.unsplash.com/photo-${id}?w=160&h=160&q=70&auto=format&fit=crop&crop=faces`;

/* ------------------------------------------------------------------ */
/* Sellers                                                             */
/* ------------------------------------------------------------------ */

export interface Seller {
  id: string;
  name: string;
  maker: string;
  avatar: string;
  city: L;
  since: number;
  craft: L;
  bio: L;
  rating: number;
  reviews: number;
  /** Review counts for 5★ … 1★ (sums to `reviews`). */
  dist: [number, number, number, number, number];
  /** Share of orders dispatched on time, 0–1. */
  onTime: number;
  /** Typical first reply, in hours. */
  replyHours: number;
  sales: number;
}

export const sellers: Seller[] = [
  {
    id: "kokler",
    name: "Kökler Atölyesi",
    maker: "Emre Doğan",
    avatar: portrait("1507003211169-0a1dd7228f2d"),
    city: { en: "Eskişehir", tr: "Eskişehir" },
    since: 2019,
    craft: { en: "Oak and olive-wood furniture", tr: "Meşe ve zeytin ağacı mobilya" },
    bio: {
      en: "Emre left a joinery line in 2019 to build one piece at a time in a garage in Odunpazarı. Everything is oak or olive wood from sawmills within 200 km, finished with hard wax oil.",
      tr: "Emre 2019’da bir doğrama hattından ayrılıp Odunpazarı’nda bir garajda tek tek parça üretmeye başladı. Her şey 200 km içindeki kerestecilerden gelen meşe ya da zeytin ağacı, sert mum yağla bitirilir.",
    },
    rating: 4.9,
    reviews: 412,
    dist: [372, 31, 6, 2, 1],
    onTime: 0.98,
    replyHours: 2,
    sales: 1870,
  },
  {
    id: "saddle",
    name: "Saddle & Stitch",
    maker: "Selin Arat",
    avatar: portrait("1594824476967-48c8b964273f"),
    city: { en: "İzmir", tr: "İzmir" },
    since: 2016,
    craft: { en: "Vegetable-tanned leather goods", tr: "Bitkisel tabaklanmış deri ürünler" },
    bio: {
      en: "Saddle-stitched by hand with waxed linen thread, two needles at a time. Selin cuts every piece from Italian vegetable-tanned hides that darken with use.",
      tr: "Mumlu keten iplikle, iki iğneyle elde saraç dikişi. Selin her parçayı, kullandıkça koyulaşan İtalyan bitkisel tabaklanmış derilerden keser.",
    },
    rating: 4.8,
    reviews: 286,
    dist: [241, 33, 8, 3, 1],
    onTime: 0.96,
    replyHours: 4,
    sales: 2940,
  },
  {
    id: "kilkul",
    name: "Kil & Kül",
    maker: "Can Yurt",
    avatar: portrait("1472099645785-5658abf4ff4e"),
    city: { en: "Avanos, Nevşehir", tr: "Avanos, Nevşehir" },
    since: 2014,
    craft: { en: "Wheel-thrown stoneware", tr: "Tornada çekilmiş taşkil" },
    bio: {
      en: "Red Kızılırmak clay, thrown on a kick wheel and fired in a gas kiln every second Friday. Glazes are mixed in the workshop from ash and local feldspar.",
      tr: "Kızılırmak’ın kırmızı kili, ayak tornasında çekilir ve iki cumada bir gaz fırınında pişirilir. Sırlar atölyede kül ve yerel feldispattan karıştırılır.",
    },
    rating: 4.9,
    reviews: 523,
    dist: [478, 36, 6, 2, 1],
    onTime: 0.97,
    replyHours: 3,
    sales: 4120,
  },
  {
    id: "lamba",
    name: "Lamba Evi",
    maker: "Murat Ece",
    avatar: portrait("1500648767791-00dcc994a43e"),
    city: { en: "Karaköy, İstanbul", tr: "Karaköy, İstanbul" },
    since: 2020,
    craft: { en: "Spun-steel and enamel lighting", tr: "Sıvama çelik ve emaye aydınlatma" },
    bio: {
      en: "Shades are spun on a lathe from sheet steel in a Karaköy workshop and enamelled next door. Every lamp ships wired, tested and with a European plug.",
      tr: "Abajurlar Karaköy’deki bir atölyede sacdan torna sıvamayla yapılır, yan dükkânda emaye kaplanır. Her lamba kablolu, test edilmiş ve Avrupa fişiyle gönderilir.",
    },
    rating: 4.6,
    reviews: 138,
    dist: [104, 22, 7, 3, 2],
    onTime: 0.91,
    replyHours: 6,
    sales: 610,
  },
  {
    id: "yun",
    name: "Yün & İlmek",
    maker: "Deniz Ak",
    avatar: portrait("1580489944761-15a19d654956"),
    city: { en: "Kastamonu", tr: "Kastamonu" },
    since: 2018,
    craft: { en: "Hand-dyed wool and woven rugs", tr: "El boyaması yün ve dokuma kilim" },
    bio: {
      en: "Wool from three village flocks, dyed with walnut husk, madder and weld, then woven on a floor loom. Colours vary from batch to batch, which is the point.",
      tr: "Üç köy sürüsünden gelen yün; ceviz kabuğu, kökboya ve muhabbet çiçeğiyle boyanır, sonra yer tezgâhında dokunur. Renkler partiden partiye değişir; işin özü de bu.",
    },
    rating: 4.7,
    reviews: 201,
    dist: [158, 30, 8, 3, 2],
    onTime: 0.94,
    replyHours: 5,
    sales: 1330,
  },
  {
    id: "papermoth",
    name: "Paper Moth Press",
    maker: "Nil Karan",
    avatar: portrait("1438761681033-6461ffad8d80"),
    city: { en: "Ankara", tr: "Ankara" },
    since: 2021,
    craft: { en: "Prints, bound books and paper goods", tr: "Baskı, ciltli defter ve kâğıt ürünler" },
    bio: {
      en: "A risograph, a guillotine and a bookbinding press in a Kızılay basement. Prints are numbered editions of 100; sketchbooks are sewn by hand.",
      tr: "Kızılay’da bir bodrumda bir risograf, bir giyotin ve bir cilt presi. Baskılar 100 adetlik numaralı serilerdir; defterler elde dikilir.",
    },
    rating: 4.3,
    reviews: 94,
    dist: [58, 21, 8, 4, 3],
    onTime: 0.86,
    replyHours: 12,
    sales: 520,
  },
  {
    id: "mira",
    name: "Mira Metal",
    maker: "Ayşe Mira Tan",
    avatar: portrait("1544005313-94ddf0286df2"),
    city: { en: "Bodrum, Muğla", tr: "Bodrum, Muğla" },
    since: 2017,
    craft: { en: "Gold-fill and silver jewellery", tr: "Altın dolgu ve gümüş takı" },
    bio: {
      en: "Chains are assembled and soldered link by link at a bench above the harbour. Freshwater pearls are hand-picked and knotted on silk.",
      tr: "Zincirler, limana bakan bir tezgâhta halka halka birleştirilip lehimlenir. Tatlı su incileri elle seçilir ve ipeğe düğümlenir.",
    },
    rating: 4.5,
    reviews: 77,
    dist: [55, 14, 5, 2, 1],
    onTime: 0.93,
    replyHours: 8,
    sales: 340,
  },
];
export const sellerById = (id: string) => sellers.find((s) => s.id === id) ?? sellers[0]!;

/** "Top maker": rating 4.8+ and 95%+ on-time dispatch over the last 12 months. */
export const isTopMaker = (s: Seller) => s.rating >= 4.8 && s.onTime >= 0.95;

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export type Category = "furniture" | "leather" | "ceramics" | "lighting" | "textiles" | "paper" | "jewellery";
export const categories: { id: Category; label: L }[] = [
  { id: "furniture", label: { en: "Furniture & wood", tr: "Mobilya ve ahşap" } },
  { id: "leather", label: { en: "Leather", tr: "Deri" } },
  { id: "ceramics", label: { en: "Ceramics", tr: "Seramik" } },
  { id: "lighting", label: { en: "Lighting", tr: "Aydınlatma" } },
  { id: "textiles", label: { en: "Textiles & wool", tr: "Tekstil ve yün" } },
  { id: "paper", label: { en: "Prints & paper", tr: "Baskı ve kâğıt" } },
  { id: "jewellery", label: { en: "Jewellery", tr: "Takı" } },
];

export interface Product {
  id: string;
  seller: string;
  category: Category;
  name: L;
  price: number;
  /** Working days to dispatch. */
  ships: number;
  freeShipping?: boolean;
  /** Listed on (YYYY-MM-DD). */
  listed: string;
  photo: { src: string; width: number; height: number };
  alt: L;
}

export const products: Product[] = [
  { id: "oak-side", seller: "kokler", category: "furniture", name: { en: "Oak record side table", tr: "Meşe plak sehpası" }, price: 6400, ships: 7, freeShipping: true, listed: "2026-10-30", photo: photo("1611486212557-88be5ff6f941"), alt: { en: "A small oak side table with a shelf of records underneath", tr: "Altında plak rafı olan küçük meşe sehpa" } },
  { id: "oak-chair", seller: "kokler", category: "furniture", name: { en: "Dining chair, oak legs", tr: "Meşe ayaklı yemek sandalyesi" }, price: 4850, ships: 10, listed: "2026-09-18", photo: photo("1592078615290-033ee584e267"), alt: { en: "A black moulded seat on four oak legs against a sage wall", tr: "Adaçayı rengi duvar önünde dört meşe ayak üzerinde siyah oturak" } },
  { id: "olive-boards", seller: "kokler", category: "furniture", name: { en: "Olive-wood boards, set of 3", tr: "Zeytin ağacı tahta, 3’lü set" }, price: 1250, ships: 2, listed: "2026-11-06", photo: photo("1610701596061-2ecf227e85b2"), alt: { en: "Wooden boards, cups and bowls arranged on an open kitchen shelf", tr: "Açık bir mutfak rafında ahşap tahtalar, fincanlar ve kâseler" } },
  { id: "bifold", seller: "saddle", category: "leather", name: { en: "Bifold wallet, vegetable-tanned", tr: "Katlanır cüzdan, bitkisel tabaklı" }, price: 1450, ships: 1, freeShipping: true, listed: "2026-08-12", photo: photo("1627123424574-724758594e93"), alt: { en: "A brown leather bifold wallet, half open", tr: "Yarı açık kahverengi deri katlanır cüzdan" } },
  { id: "rolltop", seller: "saddle", category: "leather", name: { en: "Roll-top backpack, chestnut", tr: "Rulo kapaklı sırt çantası, kestane" }, price: 5900, ships: 5, freeShipping: true, listed: "2026-10-02", photo: photo("1622560480605-d83c853bc5c3"), alt: { en: "A chestnut leather backpack with a front pocket", tr: "Ön cepli kestane rengi deri sırt çantası" } },
  { id: "wicker-bag", seller: "saddle", category: "leather", name: { en: "Wicker and leather handbag", tr: "Hasır ve deri el çantası" }, price: 3700, ships: 3, listed: "2026-11-01", photo: photo("1590874103328-eac38a683ce7"), alt: { en: "A tan leather handbag with a woven wicker body", tr: "Hasır gövdeli taba deri el çantası" } },
  { id: "bud-vases", seller: "kilkul", category: "ceramics", name: { en: "Bud vase pair, milk glaze", tr: "İkili tomurcuk vazo, süt sırrı" }, price: 980, ships: 2, listed: "2026-10-21", photo: photo("1490312278390-ab64016e0aa9"), alt: { en: "Two milk-white bud vases holding blossom branches", tr: "Çiçekli dallar taşıyan iki süt beyazı tomurcuk vazo" } },
  { id: "clay-cups", seller: "kilkul", category: "ceramics", name: { en: "Clay-foot cups, set of 2", tr: "Sırsız tabanlı fincan, 2’li" }, price: 760, ships: 2, freeShipping: true, listed: "2026-11-08", photo: photo("1610701596007-11502861dcfa"), alt: { en: "Cream cups with raw terracotta feet in a row", tr: "Sırsız kiremit tabanlı krem fincanlar, sıra hâlinde" } },
  { id: "planter", seller: "kilkul", category: "ceramics", name: { en: "Mint planter with drainage", tr: "Delikli nane yeşili saksı" }, price: 540, ships: 2, listed: "2026-09-04", photo: photo("1485955900006-10f4d324d411"), alt: { en: "A succulent in a mint-green ceramic planter", tr: "Nane yeşili seramik saksıda bir sukulent" } },
  { id: "task-lamp", seller: "lamba", category: "lighting", name: { en: "Steel task lamp, graphite", tr: "Çelik çalışma lambası, grafit" }, price: 3300, ships: 4, listed: "2026-10-15", photo: photo("1507473885765-e6ed057f782c"), alt: { en: "A graphite steel desk lamp with a domed shade", tr: "Kubbe abajurlu grafit renkli çelik masa lambası" } },
  { id: "pendant", seller: "lamba", category: "lighting", name: { en: "Enamel pendant, chalk white", tr: "Emaye sarkıt, tebeşir beyazı" }, price: 2650, ships: 6, freeShipping: true, listed: "2026-11-03", photo: photo("1513506003901-1e6a229e2d15"), alt: { en: "A white enamel pendant lamp against a teal wall", tr: "Petrol mavisi duvar önünde beyaz emaye sarkıt lamba" } },
  { id: "yarn", seller: "yun", category: "textiles", name: { en: "Hand-dyed wool, 5-skein bundle", tr: "El boyaması yün, 5 çile" }, price: 890, ships: 1, listed: "2026-10-26", photo: photo("1584992236310-6edddc08acff"), alt: { en: "Balls of wool in blue, rust and grey with knitting needles", tr: "Örgü şişleriyle mavi, kiremit ve gri yün yumakları" } },
  { id: "runner", seller: "yun", category: "textiles", name: { en: "Woven runner rug, 70 × 200 cm", tr: "Dokuma yolluk kilim, 70 × 200 cm" }, price: 5200, ships: 8, freeShipping: true, listed: "2026-09-22", photo: photo("1600166898405-da9535204843"), alt: { en: "A rolled patterned runner rug with fringed ends", tr: "Saçaklı uçlarıyla rulo hâlinde desenli yolluk" } },
  { id: "botanical", seller: "papermoth", category: "paper", name: { en: "Botanical print set, A4 × 4", tr: "Botanik baskı seti, A4 × 4" }, price: 720, ships: 3, listed: "2026-10-09", photo: photo("1513519245088-0e12902e5a38"), alt: { en: "Framed prints of plants and birds on a white shelf", tr: "Beyaz bir rafta bitki ve kuş baskıları, çerçeveli" } },
  { id: "stilllife", seller: "papermoth", category: "paper", name: { en: "Still-life giclée, 30 × 40 cm", tr: "Natürmort giclée baskı, 30 × 40 cm" }, price: 1150, ships: 4, listed: "2026-11-05", photo: photo("1579783902614-a3fb3927b6a5"), alt: { en: "A dark still-life painting of tulips and roses", tr: "Laleler ve güllerden oluşan koyu zeminli natürmort" } },
  { id: "sketchbook", seller: "papermoth", category: "paper", name: { en: "Hand-bound sketchbook, A5", tr: "El ciltli eskiz defteri, A5" }, price: 420, ships: 2, listed: "2026-08-28", photo: photo("1531346878377-a5be20888e57"), alt: { en: "A spiral sketchbook open on a white desk beside a pen", tr: "Beyaz masada kalemin yanında açık spiral eskiz defteri" } },
  { id: "chain", seller: "mira", category: "jewellery", name: { en: "Gold-fill chain bracelet", tr: "Altın dolgu zincir bileklik" }, price: 1900, ships: 2, listed: "2026-10-18", photo: photo("1606760227091-3dd870d97f1d"), alt: { en: "Gold and silver chains spread on a pale surface", tr: "Açık renk bir yüzeye serilmiş altın ve gümüş zincirler" } },
  { id: "pearls", seller: "mira", category: "jewellery", name: { en: "Freshwater pearl necklace", tr: "Tatlı su incisi kolye" }, price: 3450, ships: 3, freeShipping: true, listed: "2026-09-30", photo: photo("1515562141207-7a88fb7ce338"), alt: { en: "A pearl necklace in an open red box", tr: "Açık kırmızı bir kutuda inci kolye" } },
];
export const productsOf = (sellerId: string) => products.filter((p) => p.seller === sellerId);

export const workshop = { ...photo("1493106641515-6b5631de4bb9", 1600, 900), alt: { en: "Clay-covered hands shaping a pot on the wheel", tr: "Tornada bir çömleği biçimlendiren killi eller" } };

/* ------------------------------------------------------------------ */
/* Reviews (the seller page)                                          */
/* ------------------------------------------------------------------ */

export interface Review {
  seller: string;
  stars: 1 | 2 | 3 | 4 | 5;
  author: string;
  city: string;
  date: string;
  product: string;
  text: L;
  reply?: L;
}

export const reviews: Review[] = [
  { seller: "kokler", stars: 5, author: "Zeynep A.", city: "Ankara", date: "2026-11-04", product: "oak-side", text: { en: "Heavier than it looks and the wax finish smells of honey. Emre sent a photo before wrapping it.", tr: "Göründüğünden ağır, mum cilası bal gibi kokuyor. Emre paketlemeden önce fotoğraf gönderdi." } },
  { seller: "kokler", stars: 5, author: "Jonas B.", city: "Berlin", date: "2026-10-22", product: "olive-boards", text: { en: "Arrived in four days to Germany. The grain on the largest board is beautiful.", tr: "Almanya’ya dört günde geldi. En büyük tahtanın damarı çok güzel." } },
  { seller: "kokler", stars: 4, author: "Merve K.", city: "İzmir", date: "2026-10-09", product: "oak-chair", text: { en: "Lovely chair. Took twelve working days instead of ten, but he told me in advance.", tr: "Çok güzel sandalye. On yerine on iki iş günü sürdü ama önceden haber verdi." }, reply: { en: "Thank you Merve — the oak batch was late from the mill. Enjoy it.", tr: "Teşekkürler Merve — meşe partisi keresteciden geç geldi. Güle güle kullanın." } },
  { seller: "kokler", stars: 3, author: "Ali R.", city: "Bursa", date: "2026-09-14", product: "olive-boards", text: { en: "Good boards but one had a small crack along the edge. Replacement came quickly.", tr: "Tahtalar iyi ama birinin kenarında küçük bir çatlak vardı. Yenisi hızlı geldi." } },
  { seller: "saddle", stars: 5, author: "Elif S.", city: "İstanbul", date: "2026-11-02", product: "bifold", text: { en: "Third wallet from Selin — the first one is eight years old and still perfect.", tr: "Selin’den üçüncü cüzdanım — ilki sekiz yaşında ve hâlâ kusursuz." } },
  { seller: "saddle", stars: 5, author: "Kaan T.", city: "Eskişehir", date: "2026-10-17", product: "rolltop", text: { en: "Stitching is immaculate. It fits a 14-inch laptop with room to spare.", tr: "Dikişler kusursuz. 14 inç dizüstü rahatça sığıyor." } },
  { seller: "saddle", stars: 4, author: "Hannah W.", city: "London", date: "2026-09-29", product: "wicker-bag", text: { en: "Gorgeous bag; the strap was a little long for me, and Selin shortened it for free.", tr: "Harika çanta; askısı bana biraz uzundu, Selin ücretsiz kısalttı." } },
  { seller: "kilkul", stars: 5, author: "Burcu N.", city: "Kayseri", date: "2026-11-06", product: "clay-cups", text: { en: "The milk glaze pools beautifully at the foot. Packed in a mountain of paper.", tr: "Süt sırrı tabana doğru çok güzel toplanıyor. Bir dağ kâğıtla paketlenmişti." } },
  { seller: "kilkul", stars: 5, author: "Oğuz D.", city: "İstanbul", date: "2026-10-12", product: "bud-vases", text: { en: "Bought as a wedding gift and then bought a second pair for myself.", tr: "Düğün hediyesi olarak aldım, sonra kendime ikinci bir çift aldım." } },
  { seller: "kilkul", stars: 4, author: "Sara L.", city: "Lyon", date: "2026-09-21", product: "planter", text: { en: "Exactly as pictured. Shipping to France was slow at customs, not the seller’s fault.", tr: "Fotoğraftaki gibi. Fransa’ya gönderim gümrükte yavaşladı, satıcının suçu değil." } },
  { seller: "lamba", stars: 5, author: "Deniz Y.", city: "İzmir", date: "2026-10-30", product: "pendant", text: { en: "The enamel has a soft sheen you only see in person. Wiring is very tidy.", tr: "Emayenin ancak yakından görülen yumuşak bir parlaklığı var. Kablolama çok düzgün." } },
  { seller: "lamba", stars: 4, author: "Pelin G.", city: "Ankara", date: "2026-10-04", product: "task-lamp", text: { en: "Solid lamp. Took six days to ship rather than four.", tr: "Sağlam lamba. Dört yerine altı günde kargolandı." } },
  { seller: "lamba", stars: 2, author: "Mark H.", city: "Dublin", date: "2026-09-02", product: "pendant", text: { en: "Shade arrived dented. Murat sent a new one but it took three weeks.", tr: "Abajur ezik geldi. Murat yenisini gönderdi ama üç hafta sürdü." }, reply: { en: "Sorry Mark — we now ship shades in double-wall boxes.", tr: "Özür dileriz Mark — artık abajurları çift oluklu kolilerle gönderiyoruz." } },
  { seller: "yun", stars: 5, author: "Gül E.", city: "Samsun", date: "2026-11-01", product: "yarn", text: { en: "The walnut brown is deeper than any shop yarn. Already ordered again.", tr: "Ceviz kahvesi, mağazadaki hiçbir ipte olmayan kadar derin. Tekrar sipariş verdim bile." } },
  { seller: "yun", stars: 4, author: "Leyla F.", city: "İstanbul", date: "2026-10-03", product: "runner", text: { en: "Beautiful rug, slightly narrower than listed — 67 cm. Still love it.", tr: "Güzel kilim, ilandakinden biraz dar — 67 cm. Yine de çok seviyorum." } },
  { seller: "papermoth", stars: 5, author: "Ece P.", city: "Ankara", date: "2026-10-27", product: "botanical", text: { en: "Risograph colours are vivid and the paper is thick. Numbered and signed.", tr: "Risograf renkleri canlı, kâğıt kalın. Numaralı ve imzalı." } },
  { seller: "papermoth", stars: 3, author: "Tolga U.", city: "Konya", date: "2026-09-19", product: "stilllife", text: { en: "Nice print but it shipped a week late and the tube was crushed at one end.", tr: "Güzel baskı ama bir hafta geç kargolandı ve tüpün bir ucu ezikti." } },
  { seller: "mira", stars: 5, author: "Nur K.", city: "Muğla", date: "2026-10-20", product: "pearls", text: { en: "Each pearl is knotted, so nothing rubs. Came in a linen pouch.", tr: "Her inci düğümlü, hiçbiri sürtünmüyor. Keten bir kesede geldi." } },
  { seller: "mira", stars: 4, author: "Asya T.", city: "İstanbul", date: "2026-09-08", product: "chain", text: { en: "Delicate and well made. I wish there were a half-size option.", tr: "Zarif ve iyi yapılmış. Keşke yarım beden seçeneği olsaydı." } },
];
export const reviewsOf = (sellerId: string) => reviews.filter((r) => r.seller === sellerId);

export const popularSearches: L[] = [
  { en: "olive wood", tr: "zeytin ağacı" },
  { en: "leather wallet", tr: "deri cüzdan" },
  { en: "pendant lamp", tr: "sarkıt lamba" },
  { en: "hand-dyed wool", tr: "el boyaması yün" },
];
export const productById = (id: string) => products.find((p) => p.id === id) ?? products[0]!;
