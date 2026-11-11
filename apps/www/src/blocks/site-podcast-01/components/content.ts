// Sample content for "Long Table", a fictional independent podcast about food culture, recorded
// at a kitchen table in Kadıköy. Every human-readable field is `Localized` ({ en, tr }).
// Times inside an episode are seconds from the start; dates are "YYYY-MM-DD".
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
type L = Localized<string>;

export const EMAIL = "kitchen@longtable.example.com";
export const PHONE = "+902160000000";
export const FEED_URL = "https://longtable.example.com/feed.xml";

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { timeZone: "Europe/Istanbul" });
  return { locale, t, f, intl, labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}
export type Copy = ReturnType<typeof copyFor>;

/** "52:40" / "1:02:05" — the same in every locale. */
export function clock(s: number): string {
  const v = Math.max(0, Math.floor(s));
  const h = Math.floor(v / 3600);
  const m = Math.floor((v % 3600) / 60);
  const sec = String(v % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

export const photos = {
  kitchen: { ...unsplash("1556910103-1c02745aae4d", 1600, 1100), alt: { en: "Two people cooking and talking at a kitchen counter", tr: "Mutfak tezgâhında yemek yapıp sohbet eden iki kişi" } as L },
  mic: { ...unsplash("1590602847861-f357a9332bbc", 1400, 1000), alt: { en: "A studio microphone on a boom arm against a dark wall", tr: "Koyu bir duvarın önünde, kollu standa takılı stüdyo mikrofonu" } as L },
  board: { ...unsplash("1466637574441-749b8f19452f", 1400, 1000), alt: { en: "Avocado, eggs, mushrooms and greens on a chopping board", tr: "Kesme tahtasında avokado, yumurta, mantar ve yeşillikler" } as L },
  table: { ...unsplash("1414235077428-338989a2e8c0", 1400, 1000), alt: { en: "A dinner table with plated food and wine glasses", tr: "Tabaklanmış yemekler ve kadehlerle bir akşam yemeği masası" } as L },
};

export const hosts = [
  {
    name: "Defne Kaya",
    role: { en: "Host · cook and former line chef", tr: "Sunucu · aşçı, eski mutfak şefi" } as L,
    bio: { en: "Twelve years on the hot line in Istanbul and Lyon, now writes about the people who never get their name on the menu.", tr: "İstanbul ve Lyon’da on iki yıl ocak başında; şimdi adı hiçbir menüde geçmeyen insanları yazıyor." } as L,
    photo: { ...unsplash("1607746882042-944635dfe10e", 640, 800), alt: { en: "Portrait of Defne Kaya", tr: "Defne Kaya’nın portresi" } as L },
  },
  {
    name: "Theo Marsh",
    role: { en: "Host · food historian", tr: "Sunucu · yemek tarihçisi" } as L,
    bio: { en: "Reads 19th-century cookbooks for fun and has strong opinions about who invented the meze plate (nobody).", tr: "Eğlence olsun diye 19. yüzyıl yemek kitapları okuyor; meze tabağını kimin icat ettiği konusunda kesin fikirleri var (kimse)." } as L,
    photo: { ...unsplash("1552058544-f2b08422138a", 640, 800), alt: { en: "Portrait of Theo Marsh", tr: "Theo Marsh’ın portresi" } as L },
  },
];

/* ------------------------------------------------------------------ */
/* Episodes                                                             */
/* ------------------------------------------------------------------ */

export type Topic = "history" | "home" | "trade" | "place";
export const topics: { id: Topic; name: L }[] = [
  { id: "history", name: { en: "History", tr: "Tarih" } },
  { id: "home", name: { en: "Home cooking", tr: "Ev yemeği" } },
  { id: "trade", name: { en: "The trade", tr: "Meslek" } },
  { id: "place", name: { en: "Places", tr: "Mekânlar" } },
];

export interface Episode {
  no: number;
  title: L;
  guest: string;
  guestRole: L;
  date: string;
  /** Seconds. */
  length: number;
  topic: Topic;
  summary: L;
}

export const episodes: Episode[] = [
  { no: 48, title: { en: "Who sets the table?", tr: "Sofrayı kim kurar?" }, guest: "Nermin Aydoğdu", guestRole: { en: "Food historian", tr: "Yemek tarihçisi" }, date: "2026-11-05", length: 3160, topic: "history", summary: { en: "Bread first, salt as a contract, and the mother-in-law’s serving spoon: what the order of a table says about who is in charge.", tr: "Önce ekmek, sözleşme olarak tuz ve kayınvalidenin servis kaşığı: sofranın düzeni kimin yönettiğini nasıl anlatır." } },
  { no: 47, title: { en: "The night shift at the bakery", tr: "Fırında gece vardiyası" }, guest: "Hasan Uçar", guestRole: { en: "Baker, 31 years", tr: "Fırıncı, 31 yıl" }, date: "2026-10-22", length: 2785, topic: "trade", summary: { en: "From 02:00 to 09:00 with a neighbourhood baker: sourdough that is older than his apprentice, and why simit prices are political.", tr: "Bir mahalle fırıncısıyla 02:00’den 09:00’a: çırağından yaşlı ekşi maya ve simit fiyatlarının neden siyasi olduğu." } },
  { no: 46, title: { en: "Pickles are a calendar", tr: "Turşu bir takvimdir" }, guest: "Selin Ova", guestRole: { en: "Fermenter and teacher", tr: "Fermantasyon ustası, eğitmen" }, date: "2026-10-08", length: 2410, topic: "home", summary: { en: "Jars as a record of the year: what goes in in September, what comes out in February, and the one rule nobody’s grandmother broke.", tr: "Yılın kaydı olarak kavanozlar: eylülde ne girer, şubatta ne çıkar ve hiçbir babaannenin çiğnemediği tek kural." } },
  { no: 45, title: { en: "A market that moves every day", tr: "Her gün yer değiştiren pazar" }, guest: "Mehmet Kılıç", guestRole: { en: "Market trader", tr: "Pazarcı" }, date: "2026-09-24", length: 3035, topic: "place", summary: { en: "Six districts in six days with a vegetable trader — and how a neighbourhood changes when its market moves.", tr: "Bir sebze pazarcısıyla altı günde altı ilçe — ve pazarı taşınınca bir mahallenin nasıl değiştiği." } },
  { no: 44, title: { en: "The recipe card that lied", tr: "Yalan söyleyen tarif kartı" }, guest: "Ayşe Gürel", guestRole: { en: "Cookbook editor", tr: "Yemek kitabı editörü" }, date: "2026-09-10", length: 2650, topic: "history", summary: { en: "Why old recipes leave out the important step, and the editor who spent a year testing a single börek.", tr: "Eski tarifler neden en önemli adımı atlar ve tek bir böreği bir yıl boyunca deneyen editör." } },
  { no: 43, title: { en: "Staff meal", tr: "Personel yemeği" }, guest: "Jonas Weller", guestRole: { en: "Sous chef", tr: "Sous chef" }, date: "2026-08-27", length: 2290, topic: "trade", summary: { en: "The best food in any restaurant is eaten at 16:30 standing up. A sous chef on feeding forty people with what is left.", tr: "Her restoranın en iyi yemeği 16:30’da ayakta yenir. Bir sous chef, eldekiyle kırk kişiyi doyurmayı anlatıyor." } },
  { no: 42, title: { en: "Dinner for one", tr: "Tek kişilik akşam yemeği" }, guest: "Lale Sezer", guestRole: { en: "Novelist", tr: "Romancı" }, date: "2026-08-13", length: 2510, topic: "home", summary: { en: "Cooking for yourself as an act of respect, not a compromise — with a novelist who sets a full table every night.", tr: "Kendine yemek yapmak bir taviz değil, bir saygı biçimi — her akşam tam bir sofra kuran bir romancıyla." } },
  { no: 41, title: { en: "Tea gardens", tr: "Çay bahçeleri" }, guest: "Okan Demir", guestRole: { en: "Urban historian", tr: "Kent tarihçisi" }, date: "2026-07-30", length: 2880, topic: "place", summary: { en: "The most democratic room in the city has no walls. A short history of the çay bahçesi and the people who run them.", tr: "Şehrin en demokratik odasının duvarı yok. Çay bahçesinin ve onları işletenlerin kısa tarihi." } },
];

/* ------------------------------------------------------------------ */
/* Episode 48: chapters and transcript                                  */
/* ------------------------------------------------------------------ */

export const chapters: { at: number; title: L }[] = [
  { at: 0, title: { en: "Cold open: the empty chair", tr: "Açılış: boş sandalye" } },
  { at: 135, title: { en: "Why bread comes first", tr: "Ekmek neden önce gelir" } },
  { at: 700, title: { en: "Salt as a contract", tr: "Sözleşme olarak tuz" } },
  { at: 1145, title: { en: "The mother-in-law’s spoon", tr: "Kayınvalidenin kaşığı" } },
  { at: 1710, title: { en: "Restaurants that pretend to be homes", tr: "Ev gibi davranan restoranlar" } },
  { at: 2290, title: { en: "Listener question: leftovers", tr: "Dinleyici sorusu: artıklar" } },
  { at: 2780, title: { en: "What we’re eating this week", tr: "Bu hafta ne yiyoruz" } },
];

type Who = "defne" | "theo" | "nermin";
export const speakers: Record<Who, string> = { defne: "Defne", theo: "Theo", nermin: "Nermin" };

export const transcript: { at: number; who: Who; text: L }[] = [
  { at: 0, who: "defne", text: { en: "There’s always one chair at my aunt’s table nobody sits in. Nobody told me why until I was thirty.", tr: "Teyzemin sofrasında kimsenin oturmadığı bir sandalye hep vardır. Otuz yaşıma kadar kimse nedenini söylemedi." } },
  { at: 22, who: "theo", text: { en: "And that is the whole episode, really. A table is a set of rules nobody writes down.", tr: "Aslında bölümün tamamı bu. Sofra, kimsenin yazmadığı bir kurallar bütünü." } },
  { at: 48, who: "defne", text: { en: "This is Long Table. I’m Defne.", tr: "Burası Long Table. Ben Defne." } },
  { at: 53, who: "theo", text: { en: "I’m Theo, and today we have someone who has read more household inventories than anyone alive.", tr: "Ben Theo; bugün konuğumuz, yaşayan herkesten daha çok ev envanteri okumuş biri." } },
  { at: 71, who: "nermin", text: { en: "That’s probably true, and it’s a very sad thing to be known for.", tr: "Muhtemelen doğru ve bununla tanınmak çok hüzünlü." } },
  { at: 135, who: "theo", text: { en: "Let’s start with bread. Why does it always come out before anything else?", tr: "Ekmekle başlayalım. Neden her zaman her şeyden önce gelir?" } },
  { at: 158, who: "nermin", text: { en: "Because it’s the promise. If the bread is on the table, the meal is coming — you can relax.", tr: "Çünkü o bir söz. Ekmek sofradaysa yemek geliyordur — rahatlayabilirsiniz." } },
  { at: 214, who: "nermin", text: { en: "In the probate records, bread is counted before the copper pots. That tells you the order of importance.", tr: "Tereke kayıtlarında ekmek, bakır tencerelerden önce sayılır. Bu, önem sırasını gösterir." } },
  { at: 302, who: "defne", text: { en: "In restaurant kitchens we used to say: bread buys you eleven minutes.", tr: "Restoran mutfaklarında derdik ki: ekmek sana on bir dakika kazandırır." } },
  { at: 700, who: "theo", text: { en: "Salt. You wrote that sharing salt was closer to a signature than a seasoning.", tr: "Tuz. Tuzu paylaşmanın bir çeşniden çok bir imzaya yakın olduğunu yazmıştınız." } },
  { at: 731, who: "nermin", text: { en: "‘We have eaten bread and salt together’ — you’ll still hear it in a business deal. It means: don’t betray me now.", tr: "‘Tuz ekmek hakkı’ — bunu bir iş anlaşmasında hâlâ duyarsınız. Anlamı: şimdi bana ihanet etme." } },
  { at: 820, who: "defne", text: { en: "My first head chef salted the staff meal himself. Nobody else was allowed to.", tr: "İlk şefim personel yemeğinin tuzunu kendisi atardı. Başkasına izin yoktu." } },
  { at: 1145, who: "theo", text: { en: "Now the spoon. Tell people about the spoon.", tr: "Şimdi kaşık. Dinleyicilere kaşığı anlatın." } },
  { at: 1170, who: "nermin", text: { en: "In a lot of houses there is one serving spoon, and whoever holds it decides who gets the meat.", tr: "Pek çok evde tek bir servis kaşığı vardır ve onu tutan, eti kimin alacağına karar verir." } },
  { at: 1262, who: "defne", text: { en: "That’s my grandmother. She handed the spoon over the day she couldn’t lift the pot any more.", tr: "Bu benim babaannem. Tencereyi kaldıramadığı gün kaşığı devretti." } },
  { at: 1388, who: "nermin", text: { en: "That handover is a bigger moment than most weddings. It just doesn’t have a photographer.", tr: "O devir teslim çoğu düğünden daha büyük bir an. Sadece fotoğrafçısı yok." } },
  { at: 1710, who: "theo", text: { en: "Then there are restaurants that sell you a grandmother.", tr: "Bir de size babaanne satan restoranlar var." } },
  { at: 1744, who: "defne", text: { en: "Mismatched plates, a handwritten menu, and a kitchen of twenty-two-year-olds. I’ve worked there.", tr: "Takımı tutmayan tabaklar, el yazısı menü ve yirmi iki yaşındakilerden oluşan bir mutfak. Orada çalıştım." } },
  { at: 1830, who: "nermin", text: { en: "It isn’t dishonest exactly. People are paying for the rules of a home without having to follow them.", tr: "Tam olarak sahtekârlık değil. İnsanlar bir evin kurallarına, onlara uymak zorunda kalmadan para ödüyor." } },
  { at: 2290, who: "defne", text: { en: "A question from Burak in İzmir: is it rude to take leftovers home from someone’s house?", tr: "İzmir’den Burak soruyor: birinin evinden artan yemeği eve götürmek kabalık mı?" } },
  { at: 2318, who: "nermin", text: { en: "It’s rude to refuse. The container is the host saying the evening isn’t over.", tr: "Reddetmek kabalık. O saklama kabı, ev sahibinin akşamın bitmediğini söyleme biçimi." } },
  { at: 2410, who: "theo", text: { en: "And you return the container full. That’s the rule my mother would add.", tr: "Ve kabı dolu iade edersiniz. Annem bu kuralı eklerdi." } },
  { at: 2780, who: "defne", text: { en: "What are we eating this week? I made tarhana from the bag my neighbour dried on her balcony.", tr: "Bu hafta ne yiyoruz? Komşumun balkonda kuruttuğu torbadan tarhana yaptım." } },
  { at: 2846, who: "nermin", text: { en: "Bread and salt, obviously. I’m not going to ruin my reputation now.", tr: "Ekmek ve tuz, tabii ki. İtibarımı şimdi mahvedecek değilim." } },
  { at: 2930, who: "theo", text: { en: "That’s Long Table for this week. Pull up a chair — any chair but that one.", tr: "Long Table bu haftalık bu kadar. Bir sandalye çekin — o hariç herhangi biri." } },
];

export const showNotes = {
  mentioned: [
    { title: { en: "Probate inventories of Üsküdar, 1680–1720", tr: "Üsküdar tereke defterleri, 1680–1720" } as L, note: { en: "The household lists Nermin works from — digitised by a university archive.", tr: "Nermin’in çalıştığı ev listeleri — bir üniversite arşivince dijitalleştirildi." } as L },
    { title: { en: "“Bread and Salt” — essay by Nermin Aydoğdu", tr: "“Tuz Ekmek” — Nermin Aydoğdu’nun denemesi" } as L, note: { en: "The 2024 essay the salt chapter comes from.", tr: "Tuz bölümünün dayandığı 2024 tarihli deneme." } as L },
  ],
  recipes: [
    { title: { en: "Defne’s balcony tarhana soup", tr: "Defne’nin balkon tarhana çorbası" } as L, body: { en: "2 tbsp butter, 1 tbsp tomato paste, 4 tbsp tarhana whisked into 1 litre of cold stock. Simmer 12 minutes, stirring. Finish with dried mint fried in butter.", tr: "2 yemek kaşığı tereyağı, 1 yemek kaşığı salça, 1 litre soğuk suya çırpılmış 4 yemek kaşığı tarhana. Karıştırarak 12 dakika pişirin. Tereyağında kızdırılmış kuru naneyle bitirin." } as L },
    { title: { en: "Nermin’s salt-crust bread", tr: "Nermin’in tuz kabuklu ekmeği" } as L, body: { en: "Brush a plain loaf with salted water three times during the last 10 minutes of baking. That’s the whole recipe; the rest is history.", tr: "Sade bir ekmeği pişmenin son 10 dakikasında üç kez tuzlu suyla fırçalayın. Tarifin tamamı bu; gerisi tarih." } as L },
  ],
  credits: [
    { role: { en: "Hosts", tr: "Sunucular" } as L, who: "Defne Kaya, Theo Marsh" },
    { role: { en: "Producer", tr: "Yapımcı" } as L, who: "Irmak Yalçın" },
    { role: { en: "Sound and mix", tr: "Ses ve miks" } as L, who: "Bora Tekin" },
    { role: { en: "Music", tr: "Müzik" } as L, who: "The Tuesday Quartet" },
    { role: { en: "Recorded", tr: "Kayıt" } as L, who: "Moda, Kadıköy — 21 October 2026" },
  ],
};
