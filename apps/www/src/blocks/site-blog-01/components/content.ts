// Sample content for "Field Notes Quarterly", a fictional magazine of essays on cities and design.
// Every human-readable field is `Localized` ({ en, tr }) and resolved with `pickLocale`.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized, type PostSummary } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

/** Fictional brand accent: ink blue. SiteShell turns it into contrast-checked accent variables. */
export const ACCENT = "#2B4C7E";

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { timeZone: "Europe/Istanbul" });
  return {
    t,
    intl,
    f,
    /** An image with a localized alt → the plain image data blocks take. */
    img: <I extends { alt: L }>(image: I) => ({ ...image, alt: t(image.alt) }),
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

export const ISSUE = {
  number: 14,
  season: { en: "Winter 2026", tr: "Kış 2026" },
  theme: { en: "The *ground floor*", tr: "Zemin *kat*" },
  dek: {
    en: "Eleven essays about the first four metres of a city: benches, shopfronts, stairs, bus shelters and the people who look after them.",
    tr: "Bir şehrin ilk dört metresi üzerine on bir deneme: banklar, vitrinler, merdivenler, otobüs durakları ve onlara bakan insanlar.",
  },
  published: "2026-11-02",
};

// ---------------------------------------------------------------- photos

export const photos = {
  galata: { ...unsplash("1524231757912-21f4fe3a7200", 1800, 1200), alt: { en: "Rooftops climbing the hill below a stone tower, in winter haze", tr: "Kış pusunda taş bir kulenin altında yokuşa tırmanan çatılar" } },
  avenue: { ...unsplash("1449824913935-59a10b8d2000", 1600, 1067), alt: { en: "A long avenue between towers, taxis waiting at a crossing", tr: "Kuleler arasında uzun bir cadde, geçitte bekleyen taksiler" } },
  angles: { ...unsplash("1487958449943-2429e8be8625", 1600, 1067), alt: { en: "A white building of folded planes against a pale sky", tr: "Soluk gökyüzüne karşı katlanmış düzlemlerden beyaz bir bina" } },
  river: { ...unsplash("1513635269975-59663e0ac1ad", 1600, 1067), alt: { en: "A river bending through a city at dusk, bridges lit", tr: "Alacakaranlıkta şehrin içinden kıvrılan bir nehir, ışıklı köprüler" } },
  canyon: { ...unsplash("1519501025264-65ba15a82390", 1600, 1067), alt: { en: "A street canyon at dusk, buses and tail lights", tr: "Alacakaranlıkta bir cadde, otobüsler ve stop lambaları" } },
  towers: { ...unsplash("1449157291145-7efd050a4d0e", 1600, 1067), alt: { en: "Looking straight up between glass towers into fog", tr: "Cam kuleler arasından sise doğru dimdik yukarı bakış" } },
  interior: { ...unsplash("1524758631624-e2822e304c36", 1600, 1067), alt: { en: "A bright reading room with low chairs and a floor lamp", tr: "Alçak koltuklar ve bir lambader bulunan aydınlık bir okuma odası" } },
  desk: { ...unsplash("1434030216411-0b793f4b4173", 1600, 1067), alt: { en: "A hand taking notes on paper beside a cup of coffee", tr: "Bir fincan kahvenin yanında kâğıda not alan bir el" } },
  bridge: { ...unsplash("1505761671935-60b3a7427bad", 1600, 1067), alt: { en: "A stone bridge and a clock tower under a cloudy sky", tr: "Bulutlu gökyüzü altında taş bir köprü ve saat kulesi" } },
};

// ---------------------------------------------------------------- people

export type AuthorId = "selin" | "teo" | "mira" | "jonah";

export const authors: Record<AuthorId, { name: string; role: L; bio: L; photo: { src: string; width: number; height: number } }> = {
  selin: {
    name: "Selin Okyar",
    role: { en: "Contributing editor", tr: "Katkıda bulunan editör" },
    bio: { en: "Writes about street furniture and the rules behind it. Counts benches on weekends.", tr: "Sokak mobilyaları ve arkalarındaki kurallar üzerine yazıyor. Hafta sonları bank sayıyor." },
    photo: unsplash("1554151228-14d9def656e4", 320, 320),
  },
  teo: {
    name: "Teo Vasić",
    role: { en: "Transit correspondent", tr: "Ulaşım muhabiri" },
    bio: { en: "Has ridden every night bus line in four cities and kept the tickets.", tr: "Dört şehirde her gece otobüsü hattına binmiş ve biletleri saklamış." },
    photo: unsplash("1506277886164-e25aa3f4ef7f", 320, 320),
  },
  mira: {
    name: "Mira Halloran",
    role: { en: "Editor", tr: "Editör" },
    bio: { en: "Founded the quarterly in 2023 after a decade of planning reports nobody read.", tr: "Kimsenin okumadığı planlama raporlarıyla geçen on yılın ardından dergiyi 2023’te kurdu." },
    photo: unsplash("1592621385612-4d7129426394", 320, 320),
  },
  jonah: {
    name: "Jonah Pell",
    role: { en: "Type and signage", tr: "Yazı ve tabela" },
    bio: { en: "Draws street-sign lettering and restores enamel plates in a shared workshop.", tr: "Sokak tabelası harfleri çiziyor, ortak bir atölyede emaye levhaları onarıyor." },
    photo: unsplash("1556157382-97eda2d62296", 320, 320),
  },
};

// ---------------------------------------------------------------- topics and posts

export type TopicId = "street" | "transit" | "housing" | "type" | "public";

export const topics: { id: TopicId; label: L }[] = [
  { id: "street", label: { en: "Street life", tr: "Sokak hayatı" } },
  { id: "transit", label: { en: "Transit", tr: "Ulaşım" } },
  { id: "housing", label: { en: "Housing", tr: "Konut" } },
  { id: "type", label: { en: "Type & signs", tr: "Yazı ve tabela" } },
  { id: "public", label: { en: "Public space", tr: "Kamusal alan" } },
];

export const topicLabel = (id: TopicId) => topics.find((x) => x.id === id)!.label;

export interface Post {
  slug: string;
  title: L;
  dek: L;
  topic: TopicId;
  author: AuthorId;
  date: string;
  minutes: number;
  photo: keyof typeof photos;
  /** Reads of the last 30 days (for the "Most read" list). */
  reads: number;
}

export const posts: Post[] = [
  { slug: "bench-is-a-policy", title: { en: "The bench is a policy", tr: "Bank bir politikadır" }, dek: { en: "Where a city lets you sit down says more about it than any master plan. A walk along one avenue, counting.", tr: "Bir şehrin sizi nerede oturttuğu, her türlü nazım plandan daha çok şey anlatır. Tek bir caddede sayarak yürüyüş." }, topic: "public", author: "selin", date: "2026-11-02", minutes: 9, photo: "galata", reads: 18420 },
  { slug: "night-bus", title: { en: "Night buses and the shape of a city", tr: "Gece otobüsleri ve şehrin biçimi" }, dek: { en: "After midnight the network map shrinks to the routes people actually need.", tr: "Gece yarısından sonra hat haritası, insanların gerçekten ihtiyaç duyduğu güzergâhlara iner." }, topic: "transit", author: "teo", date: "2026-10-28", minutes: 7, photo: "canyon", reads: 12310 },
  { slug: "corner-shop", title: { en: "What the corner shop knows", tr: "Köşe bakkalı ne bilir" }, dek: { en: "Spare keys, parcels and gossip: the unofficial civic infrastructure of a street.", tr: "Yedek anahtarlar, kargolar ve dedikodu: bir sokağın resmî olmayan kamu altyapısı." }, topic: "street", author: "mira", date: "2026-10-21", minutes: 6, photo: "avenue", reads: 9870 },
  { slug: "street-sign-type", title: { en: "The quiet typography of street signs", tr: "Sokak tabelalarının sessiz tipografisi" }, dek: { en: "Why the best signs are the ones you never notice, and the three that broke the rule.", tr: "En iyi tabelalar neden hiç fark etmedikleriniz ve kuralı bozan üç tabela." }, topic: "type", author: "jonah", date: "2026-10-14", minutes: 8, photo: "angles", reads: 11240 },
  { slug: "ground-floor-rent", title: { en: "Who pays for an empty ground floor?", tr: "Boş zemin katın bedelini kim öder?" }, dek: { en: "Shutters down at noon: how vacancy taxes changed three high streets in two years.", tr: "Öğlen inen kepenkler: boş mülk vergileri iki yılda üç ana caddeyi nasıl değiştirdi?" }, topic: "housing", author: "mira", date: "2026-10-07", minutes: 11, photo: "towers", reads: 7650 },
  { slug: "ferry-timetable", title: { en: "Every ferry timetable is a love letter", tr: "Her vapur tarifesi bir aşk mektubudur" }, dek: { en: "Printed, folded and wrong by Tuesday: a defence of the paper schedule.", tr: "Basılı, katlanmış ve salıya kadar yanlış: kâğıt tarifenin savunusu." }, topic: "transit", author: "teo", date: "2026-09-30", minutes: 5, photo: "river", reads: 14980 },
  { slug: "stairs-as-streets", title: { en: "Stairs as streets", tr: "Sokak olan merdivenler" }, dek: { en: "On hillside cities, the stair is the street. Notes from forty flights in one neighbourhood.", tr: "Yokuşlu şehirlerde merdiven sokaktır. Tek bir mahallede kırk kat merdivenden notlar." }, topic: "street", author: "selin", date: "2026-09-23", minutes: 8, photo: "bridge", reads: 8320 },
  { slug: "reading-rooms", title: { en: "Reading rooms nobody booked", tr: "Kimsenin rezerve etmediği okuma odaları" }, dek: { en: "Libraries that stopped asking why you came in, and filled up.", tr: "Neden geldiğinizi sormayı bırakan ve dolan kütüphaneler." }, topic: "public", author: "mira", date: "2026-09-16", minutes: 6, photo: "interior", reads: 6410 },
  { slug: "notes-on-measuring", title: { en: "Measuring a city in minutes", tr: "Şehri dakikayla ölçmek" }, dek: { en: "The fifteen-minute city, tested with a stopwatch and a bad knee.", tr: "On beş dakikalık şehir; bir kronometre ve ağrıyan bir dizle test edildi." }, topic: "street", author: "teo", date: "2026-09-09", minutes: 10, photo: "desk", reads: 10120 },
];

/** Every post opens the sample article page; a real site would route by `slug`. */
export const ARTICLE_HREF = "?page=article";
export const topicHref = (id: TopicId) => `?page=archive#topic-${id}`;
export const authorHref = (id: AuthorId) => `?page=archive#author-${id}`;

export function postSummary(post: Post, locale: SiteLocale, withCover = true): PostSummary {
  const { t, img } = copyFor(locale);
  return {
    href: ARTICLE_HREF,
    title: t(post.title),
    excerpt: t(post.dek),
    cover: withCover ? img(photos[post.photo]) : undefined,
    category: { label: t(topicLabel(post.topic)), href: topicHref(post.topic) },
    publishedAt: post.date,
    readingMinutes: post.minutes,
    author: { name: authors[post.author].name, avatar: { ...authors[post.author].photo, alt: authors[post.author].name } },
  };
}

// ---------------------------------------------------------------- the sample article

/** Body blocks. Footnote markers in text: `{1}` → note 1 (rendered as a side note on wide screens). */
export type ArticleBlock = { type: "p"; text: L } | { type: "h2"; text: L } | { type: "quote"; text: L } | { type: "figure"; photo: keyof typeof photos; caption: L };

export const article = {
  post: posts[0]!,
  blocks: [
    {
      type: "p",
      text: {
        en: "On the north side of the avenue there are forty-one places to sit between the tram stop and the old post office. On the south side, in the same 900 metres, there are six. Nobody planned the difference, exactly. It accumulated, one decision at a time, the way most of a city does.{1}",
        tr: "Caddenin kuzey yakasında, tramvay durağıyla eski postane arasında oturulacak kırk bir yer var. Güney yakasında, aynı 900 metrede, altı tane. Bu farkı tam olarak kimse planlamadı. Bir şehrin çoğu gibi, kararlar birer birer üst üste binerek oluştu.{1}",
      },
    },
    {
      type: "p",
      text: {
        en: "I spent three Saturdays in October counting them: benches, low walls, the steps of a bank that closed in 2019, the ledge outside a pharmacy that the owner has quietly padded with an old cushion. I counted anything a tired person could use, and I wrote down who was using it.",
        tr: "Ekim ayında üç cumartesiyi onları sayarak geçirdim: banklar, alçak duvarlar, 2019’da kapanan bir bankanın basamakları, sahibinin sessizce eski bir minderle döşediği eczane önündeki çıkıntı. Yorgun birinin kullanabileceği her şeyi saydım ve kimin kullandığını not ettim.",
      },
    },
    { type: "h2", text: { en: "A seat is a permission", tr: "Oturak bir izindir" } },
    {
      type: "p",
      text: {
        en: "A bench is the cheapest piece of public policy a city can buy. A good one costs less than a parking meter and outlasts three mayors. It also says, without a sign, who is welcome to stay. The south side of the avenue is not hostile: it is simply a place designed for walking past.{2}",
        tr: "Bank, bir şehrin satın alabileceği en ucuz kamu politikasıdır. İyisi bir parkmetreden ucuza gelir ve üç belediye başkanından uzun yaşar. Ayrıca hiçbir tabelaya gerek kalmadan kimin kalabileceğini söyler. Caddenin güney yakası düşmanca değil; yalnızca önünden geçip gitmek için tasarlanmış bir yer.{2}",
      },
    },
    {
      type: "p",
      text: {
        en: "The people on the north side benches were, in order of how often I saw them: older residents with shopping, parents waiting for the school gate to open, delivery riders between orders, and teenagers who had nowhere else to be after five. On the south side, the six seats were mostly taken by people waiting for someone inside a shop.",
        tr: "Kuzey yakasındaki banklarda gördüklerim, sıklık sırasıyla şunlardı: alışverişli yaşlı mahalleliler, okul kapısının açılmasını bekleyen ebeveynler, siparişler arasında mola veren kuryeler ve saat beşten sonra gidecek başka yeri olmayan gençler. Güney yakasındaki altı oturak ise çoğunlukla bir dükkânın içindeki birini bekleyenlerle doluydu.",
      },
    },
    { type: "quote", text: { en: "A good bench costs less than a parking meter and outlasts three mayors.", tr: "İyi bir bank bir parkmetreden ucuza gelir ve üç belediye başkanından uzun yaşar." } },
    { type: "h2", text: { en: "Armrests, and other arguments", tr: "Kolçaklar ve diğer argümanlar" } },
    {
      type: "p",
      text: {
        en: "Eleven of the forty-one north-side benches have a middle armrest. The maintenance department told me they were installed in 2021 “for accessibility”, which is half true: an armrest helps you stand up. It also makes it impossible to lie down, and everyone involved knows that.{3}",
        tr: "Kuzey yakasındaki kırk bir bankın on birinde orta kolçak var. Bakım birimi bana bunların 2021’de “erişilebilirlik için” takıldığını söyledi; bu yarı yarıya doğru: kolçak ayağa kalkmanıza yardım eder. Uzanmayı da imkânsız kılar ve işin içindeki herkes bunu bilir.",
      },
    },
    {
      type: "p",
      text: {
        en: "The honest version of the argument is not about armrests at all. It is about whether a city is willing to say out loud what it wants a street to be for, and then furnish it accordingly. Where it does, the benches are generous, shaded and close together. Where it does not, they appear one at a time, in front of whoever lobbied for them.",
        tr: "Tartışmanın dürüst hâli aslında kolçaklarla ilgili değil. Bir şehrin bir sokağın ne için olduğunu yüksek sesle söylemeye ve onu buna göre döşemeye razı olup olmadığıyla ilgili. Bunu yapan yerlerde banklar cömert, gölgeli ve birbirine yakın. Yapmayan yerlerde ise birer birer, kim lobi yaptıysa onun önünde beliriyorlar.",
      },
    },
    { type: "figure", photo: "avenue", caption: { en: "The south side at 17:40 on a Saturday: six seats, all taken.", tr: "Bir cumartesi 17:40’ta güney yakası: altı oturak, hepsi dolu." } },
    { type: "h2", text: { en: "What forty-one seats buy", tr: "Kırk bir oturak neyi satın alır" } },
    {
      type: "p",
      text: {
        en: "The shops on the north side are not busier because of the benches, at least not in any way I could measure. But they are open later, and the street feels watched in the good sense: someone is always sitting where they can see the crossing. The pharmacist with the cushion told me she had not called the police once in four years.{4}",
        tr: "Kuzey yakasındaki dükkânlar banklar yüzünden daha kalabalık değil, en azından ölçebildiğim bir şekilde. Ama daha geç saate kadar açıklar ve sokak iyi anlamda gözetleniyor: biri hep geçidi görebileceği bir yerde oturuyor. Minderli eczacı bana dört yılda bir kez bile polis çağırmadığını söyledi.{4}",
      },
    },
    {
      type: "p",
      text: {
        en: "If you want to know what a city thinks of you, do not read its strategy. Walk until you are tired, and see where it lets you sit down.{5}",
        tr: "Bir şehrin sizin hakkınızda ne düşündüğünü öğrenmek istiyorsanız stratejisini okumayın. Yorulana kadar yürüyün ve sizi nerede oturttuğuna bakın.{5}",
      },
    },
  ] satisfies ArticleBlock[] as ArticleBlock[],
  notes: [
    { en: "Counts made on 4, 11 and 18 October 2026 between 10:00 and 18:00. A “seat” is any surface between 40 and 60 cm high that you can sit on for ten minutes without being asked to move.", tr: "Sayımlar 4, 11 ve 18 Ekim 2026’da 10:00–18:00 arasında yapıldı. “Oturak”, 40–60 cm yüksekliğinde, kimse kalkmanızı istemeden on dakika oturabileceğiniz her yüzeydir." },
    { en: "The municipal catalogue lists a standard bench at 4,800 TL installed; a parking meter at 6,200 TL before its software licence.", tr: "Belediye kataloğunda standart bir bank montajlı 4.800 TL; bir parkmetre ise yazılım lisansı hariç 6.200 TL." },
    { en: "The 2021 order covers 312 benches citywide. Fifty-eight of them have since lost the armrest to wear, or to someone with a spanner.", tr: "2021 talimatı şehir genelinde 312 bankı kapsıyor. Bunların elli sekizi o günden bu yana kolçağını aşınmaya ya da İngiliz anahtarlı birine kaptırdı." },
    { en: "This is the “eyes on the street” argument, made famous in the 1960s. It still holds, but only where there is somewhere for the eyes to sit.", tr: "Bu, 1960’larda ünlenen “sokaktaki gözler” argümanı. Hâlâ geçerli; ama yalnızca o gözlerin oturabileceği bir yer varsa." },
    { en: "Full counts, photos and the map are in the issue’s data appendix, free to reuse with credit.", tr: "Tüm sayımlar, fotoğraflar ve harita sayının veri ekinde; kaynak gösterilerek serbestçe kullanılabilir." },
  ] as L[],
};

/** Splits `text{1} more` into text and note-number parts. */
export function splitNotes(text: string): (string | number)[] {
  return text.split(/\{(\d+)\}/).map((part, i) => (i % 2 === 1 ? Number(part) : part)).filter((p) => p !== "");
}
