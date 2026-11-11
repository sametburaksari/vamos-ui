// Sample content for "Builders Circle", a fictional forum for people who make things by hand.
// Every human-readable field is { en, tr } and resolved with `pickLocale`. Members, topics and
// numbers are invented. "Now" is fixed so server and client render the same relative times.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, sitePageHref } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

export const NOW = "2026-11-11T14:00:00+03:00";
export const EMAIL = "hello@example.com";

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "TRY", timeZone: "Europe/Istanbul" });
  const ago = (iso: string) => f.relative(iso, { now: NOW, style: "short" });
  return { locale, t, f, ago, intl, labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}
export type Copy = ReturnType<typeof copyFor>;

// ---------------------------------------------------------------- categories

export type CategoryId = "wood" | "electronics" | "renovation" | "fabrication" | "metal" | "show" | "meta";

/** Each category has a token colour for its marker (no raw colours). */
export const categories: { id: CategoryId; title: L; text: L; color: string; topics: number; week: number[] }[] = [
  { id: "wood", title: { en: "Woodworking", tr: "Ahşap işleri" }, text: { en: "Joinery, finishes, hand and power tools.", tr: "Birleştirme, cila, el ve elektrikli aletler." }, color: "var(--chart-1)", topics: 4182, week: [31, 28, 40, 36, 44, 29, 38] },
  { id: "electronics", title: { en: "Electronics", tr: "Elektronik" }, text: { en: "Circuits, microcontrollers, repair.", tr: "Devreler, mikrodenetleyiciler, tamir." }, color: "var(--chart-2)", topics: 3077, week: [22, 30, 26, 35, 41, 39, 33] },
  { id: "renovation", title: { en: "Home renovation", tr: "Ev tadilatı" }, text: { en: "Walls, floors, plumbing, damp.", tr: "Duvar, zemin, tesisat, nem." }, color: "var(--chart-3)", topics: 2540, week: [18, 21, 17, 24, 20, 31, 35] },
  { id: "fabrication", title: { en: "3D printing & CNC", tr: "3B baskı ve CNC" }, text: { en: "Slicers, feeds and speeds, jigs.", tr: "Dilimleyiciler, ilerleme ve devir, fikstürler." }, color: "var(--chart-4)", topics: 1968, week: [14, 19, 22, 16, 25, 23, 27] },
  { id: "metal", title: { en: "Metalwork", tr: "Metal işleri" }, text: { en: "Welding, forging, machining.", tr: "Kaynak, dövme, talaşlı imalat." }, color: "var(--chart-5)", topics: 1214, week: [8, 11, 9, 13, 10, 12, 15] },
  { id: "show", title: { en: "Show & tell", tr: "Göster ve anlat" }, text: { en: "Finished builds, with photos and the story.", tr: "Biten projeler, fotoğrafları ve hikâyesiyle." }, color: "var(--chart-6)", topics: 2311, week: [26, 24, 29, 33, 30, 45, 52] },
  { id: "meta", title: { en: "Circle meta", tr: "Topluluk" }, text: { en: "Meetups, guidelines, feedback.", tr: "Buluşmalar, kurallar, geri bildirim." }, color: "var(--fg-muted)", topics: 388, week: [3, 2, 5, 4, 6, 3, 4] },
];
export const categoryById = (id: CategoryId) => categories.find((c) => c.id === id)!;

// ---------------------------------------------------------------- members

export interface Member {
  handle: string;
  name: string;
  role?: L;
  since: string;
  posts: number;
}

export const members: Member[] = [
  { handle: "ozge.planes", name: "Özge Aydın", role: { en: "Moderator", tr: "Moderatör" }, since: "2019-03-02", posts: 3810 },
  { handle: "tomasz_k", name: "Tomasz Kowal", since: "2021-07-19", posts: 942 },
  { handle: "mira.solder", name: "Mira Halvorsen", role: { en: "Electronics lead", tr: "Elektronik sorumlusu" }, since: "2020-01-11", posts: 2215 },
  { handle: "baris.d", name: "Barış Demirel", since: "2023-05-30", posts: 318 },
  { handle: "nkechi", name: "Nkechi Obi", since: "2022-10-04", posts: 704 },
  { handle: "j.aldana", name: "Julián Aldana", since: "2024-02-14", posts: 129 },
  { handle: "selma_r", name: "Selma Reyhan", since: "2020-09-21", posts: 1588 },
  { handle: "hugo.w", name: "Hugo Weller", since: "2025-06-08", posts: 41 },
  { handle: "deniz.cnc", name: "Deniz Koç", since: "2021-12-01", posts: 1107 },
  { handle: "aiko", name: "Aiko Tanabe", since: "2023-08-17", posts: 452 },
  { handle: "ruth.m", name: "Ruth Mensah", since: "2026-10-29", posts: 3 },
  { handle: "emre.ahsap", name: "Emre Yıldız", since: "2022-04-12", posts: 860 },
];
export const member = (handle: string) => members.find((m) => m.handle === handle)!;

// ---------------------------------------------------------------- topics

export interface Topic {
  id: string;
  category: CategoryId;
  title: L;
  excerpt: L;
  tags: string[];
  author: string;
  participants: string[];
  replies: number;
  views: number;
  likes: number;
  created: string;
  last: string;
  /** Posts per day, the last 14 days (oldest first). */
  activity: number[];
  pinned?: boolean;
  solved?: boolean;
  /** Has its own page in this demo. */
  page?: boolean;
}

export const topics: Topic[] = [
  { id: "guidelines", category: "meta", pinned: true, title: { en: "Read first: how we ask, answer and share builds here", tr: "Önce okuyun: burada nasıl sorar, yanıtlar ve proje paylaşırız" }, excerpt: { en: "Photos before theory, measurements in mm, and credit the plans you used.", tr: "Teoriden önce fotoğraf, ölçüler mm cinsinden ve kullandığınız planlara atıf." }, tags: ["guidelines"], author: "ozge.planes", participants: ["ozge.planes", "mira.solder", "selma_r"], replies: 48, views: 21904, likes: 612, created: "2024-01-08T10:00:00+03:00", last: "2026-11-02T09:12:00+03:00", activity: [0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0] },
  { id: "workbench", category: "wood", page: true, solved: true, title: { en: "Workbench top: laminated beech or two layers of birch plywood?", tr: "Tezgâh tablası: lamine kayın mı, iki kat huş kontrplak mı?" }, excerpt: { en: "1,800 × 600 mm, mostly hand-tool work, a leg vice. Budget around ₺9,000.", tr: "1.800 × 600 mm, çoğunlukla el aletleri, bir bacak mengenesi. Bütçe 9.000 ₺ civarı." }, tags: ["workbench", "plywood", "beech"], author: "baris.d", participants: ["baris.d", "emre.ahsap", "ozge.planes", "tomasz_k", "nkechi", "hugo.w"], replies: 23, views: 1842, likes: 64, created: "2026-11-08T21:40:00+03:00", last: "2026-11-11T13:22:00+03:00", activity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 8, 4, 5] },
  { id: "esp-sleep", category: "electronics", title: { en: "Wi-Fi microcontroller draws 4 mA in deep sleep instead of 10 µA — what am I missing?", tr: "Wi-Fi mikrodenetleyici derin uykuda 10 µA yerine 4 mA çekiyor — neyi atlıyorum?" }, excerpt: { en: "Bare module on a custom board with a cheap 1 A LDO. Measured with a bench meter on the µA range.", tr: "Özel kartta çıplak modül, ucuz bir 1 A LDO ile. Masa multimetresinin µA kademesinde ölçtüm." }, tags: ["mcu", "low-power"], author: "j.aldana", participants: ["j.aldana", "mira.solder", "aiko"], replies: 11, views: 960, likes: 22, created: "2026-11-10T19:05:00+03:00", last: "2026-11-11T12:48:00+03:00", activity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 5] },
  { id: "damp", category: "renovation", title: { en: "Black mould behind a wardrobe on an outside wall (1970s flat)", tr: "Dış duvardaki dolabın arkasında siyah küf (1970’ler dairesi)" }, excerpt: { en: "Ground floor, north side. Is it condensation or rising damp?", tr: "Zemin kat, kuzey cephe. Yoğuşma mı, kılcal nem mi?" }, tags: ["damp", "insulation"], author: "nkechi", participants: ["nkechi", "selma_r", "tomasz_k", "ruth.m"], replies: 17, views: 1311, likes: 30, created: "2026-11-06T08:30:00+03:00", last: "2026-11-11T11:05:00+03:00", activity: [0, 0, 0, 0, 0, 0, 0, 4, 3, 2, 1, 2, 3, 3] },
  { id: "show-chair", category: "show", title: { en: "Finished: a ladder-back chair from one ash log, green woodworking", tr: "Bitti: tek bir dişbudak kütüğünden merdiven sırtlı sandalye, yaş ağaç işçiliği" }, excerpt: { en: "Rived, shaved on a horse, rush seat. 41 hours over six weekends.", tr: "Yarılarak ayrıldı, sistire tezgâhında yontuldu, hasır oturak. Altı hafta sonunda 41 saat." }, tags: ["green-wood", "chair"], author: "emre.ahsap", participants: ["emre.ahsap", "ozge.planes", "aiko", "baris.d", "selma_r", "hugo.w", "nkechi", "deniz.cnc"], replies: 36, views: 4207, likes: 288, created: "2026-11-04T17:15:00+03:00", last: "2026-11-11T10:31:00+03:00", activity: [0, 0, 0, 0, 0, 0, 9, 7, 5, 4, 3, 2, 3, 3] },
  { id: "cnc-chatter", category: "fabrication", title: { en: "Chatter on a 6 mm end mill in aluminium — feeds and speeds check", tr: "Alüminyumda 6 mm parmak frezede titreşim — ilerleme ve devir kontrolü" }, excerpt: { en: "Router spindle at 18,000 rpm, 2 flutes, 0.5 mm depth of cut.", tr: "Freze motoru 18.000 dev/dk, 2 ağızlı, 0,5 mm talaş derinliği." }, tags: ["cnc", "aluminium"], author: "deniz.cnc", participants: ["deniz.cnc", "tomasz_k"], replies: 4, views: 388, likes: 9, created: "2026-11-09T22:10:00+03:00", last: "2026-11-11T09:02:00+03:00", activity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2] },
  { id: "first-weld", category: "metal", title: { en: "First MIG welds on 3 mm steel — be honest", tr: "3 mm saca ilk MIG kaynaklarım — dürüst olun" }, excerpt: { en: "Gasless wire, 140 A machine. Photos of six beads attached.", tr: "Gazsız tel, 140 A makine. Altı dikişin fotoğrafı ekte." }, tags: ["mig", "beginner"], author: "hugo.w", participants: ["hugo.w"], replies: 0, views: 74, likes: 2, created: "2026-11-11T08:44:00+03:00", last: "2026-11-11T08:44:00+03:00", activity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] },
  { id: "flux", category: "electronics", solved: true, title: { en: "Which no-clean flux leaves the least residue for hand rework?", tr: "Elle yeniden lehimde en az kalıntı bırakan temizleme gerektirmeyen flux hangisi?" }, excerpt: { en: "Comparing four gel fluxes on 0402 parts, with photos under 20× loupe.", tr: "0402 parçalarda dört jel flux’ı 20× lup altında fotoğraflarla karşılaştırıyorum." }, tags: ["soldering", "flux"], author: "mira.solder", participants: ["mira.solder", "aiko", "j.aldana", "deniz.cnc"], replies: 19, views: 2655, likes: 97, created: "2026-10-29T12:00:00+03:00", last: "2026-11-10T22:15:00+03:00", activity: [2, 3, 1, 2, 0, 1, 1, 0, 2, 1, 0, 1, 0, 2] },
  { id: "tile", category: "renovation", title: { en: "Leveling clips or a straightedge for 60 × 120 cm porcelain tiles?", tr: "60 × 120 cm porselen karo için seviye klipsi mi, mastar mı?" }, excerpt: { en: "Bathroom floor, 4.2 m², first time with large format tiles.", tr: "Banyo zemini, 4,2 m², ilk kez büyük ebat karo." }, tags: ["tiling", "bathroom"], author: "ruth.m", participants: ["ruth.m", "selma_r"], replies: 3, views: 211, likes: 4, created: "2026-11-10T16:20:00+03:00", last: "2026-11-10T20:41:00+03:00", activity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0] },
  { id: "dovetails", category: "wood", title: { en: "Half-blind dovetails: saw the tails first or the pins first?", tr: "Yarım gizli kırlangıç: önce dişi mi, erkeği mi kesmeli?" }, excerpt: { en: "Practising on poplar for a tool chest. Both camps welcome.", tr: "Bir alet sandığı için kavakta pratik yapıyorum. İki taraf da buyursun." }, tags: ["joinery", "hand-tools"], author: "aiko", participants: ["aiko", "emre.ahsap", "ozge.planes", "baris.d", "tomasz_k"], replies: 28, views: 3120, likes: 71, created: "2026-10-30T09:00:00+03:00", last: "2026-11-10T18:03:00+03:00", activity: [3, 4, 2, 2, 3, 1, 2, 3, 1, 0, 2, 1, 1, 3] },
  { id: "printer-enclosure", category: "fabrication", title: { en: "Enclosure for printing ABS: how warm is warm enough?", tr: "ABS baskı için kapalı kabin: ne kadar sıcak yeterli?" }, excerpt: { en: "Flat-pack cabinet, 38 °C inside after an hour. Corners still lift.", tr: "Dolap tipi kabin, bir saat sonra içerisi 38 °C. Köşeler yine kalkıyor." }, tags: ["abs", "warping"], author: "tomasz_k", participants: ["tomasz_k", "deniz.cnc", "j.aldana"], replies: 9, views: 702, likes: 12, created: "2026-11-05T11:30:00+03:00", last: "2026-11-09T23:40:00+03:00", activity: [0, 0, 0, 0, 0, 0, 0, 3, 2, 1, 1, 2, 0, 0] },
  { id: "build-night", category: "meta", title: { en: "Build night #47: Kadıköy, Thursday 20 November, 19:00", tr: "Yapım gecesi #47: Kadıköy, 20 Kasım perşembe, 19.00" }, excerpt: { en: "Bring a project, a problem or just your hands. 24 places, 17 taken.", tr: "Bir proje, bir sorun ya da sadece ellerinizi getirin. 24 yer, 17’si dolu." }, tags: ["meetup"], author: "ozge.planes", participants: ["ozge.planes", "selma_r", "emre.ahsap", "nkechi", "aiko"], replies: 14, views: 980, likes: 40, created: "2026-11-03T10:00:00+03:00", last: "2026-11-09T19:55:00+03:00", activity: [0, 0, 0, 0, 0, 0, 2, 1, 3, 2, 1, 2, 1, 0] },
  { id: "plaster", category: "renovation", title: { en: "Lime plaster over old cement patches — will it bond?", tr: "Eski çimento yamaların üstüne kireç sıva — tutar mı?" }, excerpt: { en: "Stone house, 1920s, someone patched it with cement in the 90s.", tr: "1920’lerden taş ev, 90’larda biri çimentoyla yamamış." }, tags: ["lime", "plaster"], author: "selma_r", participants: ["selma_r"], replies: 0, views: 96, likes: 3, created: "2026-11-09T14:12:00+03:00", last: "2026-11-09T14:12:00+03:00", activity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0] },
  { id: "lathe", category: "metal", title: { en: "Restoring a 1968 bench lathe: what to check before buying", tr: "1968 model tezgâh tornasını restore etmek: almadan önce neye bakmalı" }, excerpt: { en: "Seller wants ₺22,500. Bed wear, headstock bearings, missing gears?", tr: "Satıcı 22.500 ₺ istiyor. Kızak aşınması, fener mili rulmanları, eksik dişliler?" }, tags: ["lathe", "restoration"], author: "tomasz_k", participants: ["tomasz_k", "deniz.cnc", "hugo.w"], replies: 12, views: 1490, likes: 38, created: "2026-10-27T20:00:00+03:00", last: "2026-11-08T12:10:00+03:00", activity: [1, 2, 3, 1, 1, 0, 2, 1, 0, 1, 0, 0, 0, 0] },
];
export const topicById = (id: string) => topics.find((t) => t.id === id)!;
/** The demo has one thread page; other topics point at the (fictional) live forum. */
export const topicHref = (t: Topic) => (t.page ? sitePageHref("thread") : `https://forum.example.com/t/${t.id}`);

// ---------------------------------------------------------------- the thread (inner page)

export interface Post {
  id: string;
  author: string;
  at: string;
  body: L[];
  likes: number;
  accepted?: boolean;
  quote?: { author: string; text: L };
}

export const thread: Post[] = [
  {
    id: "p1",
    author: "baris.d",
    at: "2026-11-08T21:40:00+03:00",
    likes: 12,
    body: [
      { en: "I’m building my first proper bench: 1,800 × 600 mm, mostly hand-tool work (planing, chopping mortises), with a leg vice on the left. Two options from the local yard:", tr: "İlk düzgün tezgâhımı yapıyorum: 1.800 × 600 mm, çoğunlukla el aletleri (rendeleme, zıvana açma), solda bir bacak mengenesi. Yakındaki keresteciden iki seçenek:" },
      { en: "A) Beech, laminated from 45 mm strips into a 90 mm top — about ₺8,600, and two weekends of glue-ups.\nB) Two sheets of 30 mm birch plywood, glued and screwed, beech edging — about ₺5,900.", tr: "A) 45 mm şeritlerden 90 mm tablaya lamine edilmiş kayın — yaklaşık 8.600 ₺ ve iki hafta sonu tutkallama.\nB) Tutkallanıp vidalanmış iki adet 30 mm huş kontrplak, kayın kenar bandı — yaklaşık 5.900 ₺." },
      { en: "Is the plywood top going to feel dead when I chop? And will the beech move too much in a flat with radiators?", tr: "Zıvana açarken kontrplak tabla ölü mü hissettirir? Kaloriferli bir dairede kayın çok mu çalışır?" },
    ],
  },
  {
    id: "p2",
    author: "emre.ahsap",
    at: "2026-11-09T08:12:00+03:00",
    likes: 41,
    accepted: true,
    body: [
      { en: "Mass is what makes chopping feel solid, not the species. 60 mm of birch ply on a 1.8 m top is around 45 kg; 90 mm of beech is around 70 kg. Both are fine if the base is rigid.", tr: "Zıvana açarken sağlamlık hissini veren tür değil, kütledir. 1,8 m tablada 60 mm huş kontrplak yaklaşık 45 kg; 90 mm kayın yaklaşık 70 kg. Taban rijitse ikisi de iş görür." },
      { en: "What decides it for me: dog holes and the vice. Ply holds 19 mm dog holes well but the edge needs a hardwood strip for the leg vice chop. If you go plywood, make the front 100 mm a solid beech apron, 90 mm deep — that’s where all the work happens anyway.", tr: "Benim için belirleyici olan: tezgâh köpeği delikleri ve mengene. Kontrplak 19 mm delikleri iyi tutar ama bacak mengenesinin çenesi için kenara masif bir şerit gerekir. Kontrplak seçerseniz, öndeki 100 mm’yi 90 mm derinliğinde masif kayın bir alın yapın — zaten bütün iş orada yapılıyor." },
    ],
  },
  {
    id: "p3",
    author: "tomasz_k",
    at: "2026-11-09T10:47:00+03:00",
    likes: 9,
    quote: { author: "baris.d", text: { en: "will the beech move too much in a flat with radiators?", tr: "kaloriferli bir dairede kayın çok mu çalışır?" } },
    body: [{ en: "Beech is one of the most movement-prone hardwoods. Let the strips sit in the room for three weeks before the glue-up, and flatten again after the first winter. Mine cupped 2 mm across 600 mm the first January.", tr: "Kayın, en çok çalışan sert ağaçlardan biridir. Tutkallamadan önce şeritleri üç hafta odada bekletin, ilk kıştan sonra tekrar düzleyin. Benimki ilk ocakta 600 mm’de 2 mm çanaklaştı." }],
  },
  {
    id: "p4",
    author: "ozge.planes",
    at: "2026-11-09T12:30:00+03:00",
    likes: 17,
    body: [{ en: "Moderator note: I moved this from Show & tell to Woodworking. Barış, please post photos when it’s done — a plywood-and-beech hybrid would be a good reference for the wiki.", tr: "Moderatör notu: Bu konuyu Göster ve anlat’tan Ahşap işleri’ne taşıdım. Barış, bitince lütfen fotoğraf paylaş — kontrplak-kayın karışımı viki için iyi bir örnek olur." }],
  },
  {
    id: "p5",
    author: "nkechi",
    at: "2026-11-10T19:02:00+03:00",
    likes: 6,
    body: [{ en: "Counterpoint: I built B two years ago and wish I had laminated. The screw holes telegraphed through after flattening, and I hit one with a plane iron. If you screw, countersink deep and use brass.", tr: "Karşı görüş: İki yıl önce B’yi yaptım ve keşke lamine etseydim diyorum. Düzlemeden sonra vida delikleri yüzeye yansıdı ve birine rende demiriyle çarptım. Vidalayacaksanız derin havşa açın ve pirinç vida kullanın." }],
  },
  {
    id: "p6",
    author: "baris.d",
    at: "2026-11-11T13:22:00+03:00",
    likes: 3,
    body: [{ en: "Thank you all. Going with Emre’s hybrid: plywood core, a 100 mm solid beech front, no screws — just glue and cauls. Strips are acclimatising in the living room as of today. Photos in three weeks.", tr: "Hepinize teşekkürler. Emre’nin karma önerisiyle gidiyorum: kontrplak gövde, önde 100 mm masif kayın, vida yok — sadece tutkal ve baskı latası. Şeritler bugünden itibaren salonda ortama alışıyor. Üç hafta sonra fotoğraflar." }],
  },
];

export const meetups = [
  { date: "2026-11-20T19:00:00+03:00", title: { en: "Build night #47", tr: "Yapım gecesi #47" }, place: "Kadıköy Makerspace", left: 7 },
  { date: "2026-11-29T11:00:00+03:00", title: { en: "Sharpening clinic", tr: "Bileme atölyesi" }, place: "Online", left: 40 },
  { date: "2026-12-06T10:00:00+03:00", title: { en: "Tool swap & flea market", tr: "Alet takası ve bit pazarı" }, place: "Moda Hall", left: 0 },
];
