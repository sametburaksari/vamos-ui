// Sample content for "The Slow Desk", a fictional fortnightly newsletter by the fictional writer
// Nil Arden, about doing careful work in a hurried world. Every human-readable field is
// `{ en, tr }`. Issues go out every second Sunday; dates are `YYYY-MM-DD`.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

export const EMAIL = "nil@slowdesk.example.com";
export const PHONE = "+902160000000";
/** Readers before this visitor subscribes. */
export const READERS = 14206;
export const TODAY = "2026-11-11";

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "USD", timeZone: "Europe/Istanbul" });
  const usd = (n: number) => f.currency(n, { currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return { t, f, usd, intl, labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}
export type Copy = ReturnType<typeof copyFor>;

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  desk: { ...unsplash("1455390582262-044cdead277a", 1400, 1750), alt: { en: "An open notebook and a fountain pen on a wooden desk", tr: "Ahşap bir masada açık bir defter ve dolma kalem" } as L },
};

export type TopicId = "attention" | "craft" | "tools" | "reading" | "rest";
export const topics: { id: TopicId; name: L }[] = [
  { id: "attention", name: { en: "Attention", tr: "Dikkat" } },
  { id: "craft", name: { en: "Craft", tr: "Zanaat" } },
  { id: "tools", name: { en: "Tools", tr: "Araçlar" } },
  { id: "reading", name: { en: "Reading", tr: "Okuma" } },
  { id: "rest", name: { en: "Rest", tr: "Dinlenme" } },
];

export interface Issue {
  n: number;
  date: string;
  minutes: number;
  topic: TopicId;
  title: L;
  dek: L;
  body: L[];
  /** A sentence pulled out in the issue page. */
  pull?: L;
}

export const issues: Issue[] = [
  {
    n: 112,
    date: "2026-11-08",
    minutes: 7,
    topic: "attention",
    title: { en: "The two-hour rule", tr: "İki saat kuralı" },
    dek: { en: "Why I stopped planning my days in thirty-minute boxes, and what I do with the mornings now.", tr: "Günlerimi neden otuz dakikalık kutularla planlamayı bıraktım ve sabahları artık ne yapıyorum." },
    pull: { en: "A morning is not a container. It is a direction.", tr: "Sabah bir kap değildir. Bir yöndür." },
    body: [
      { en: "For six years my calendar looked like a parking lot: neat rows of thirty-minute boxes, each one painted a different colour. I was proud of it. I could tell you at any moment what I was supposed to be doing, and I was almost never doing it.", tr: "Altı yıl boyunca takvimim bir otoparka benziyordu: her biri farklı renge boyanmış, otuz dakikalık düzgün kutu sıraları. Gurur duyuyordum. Herhangi bir anda ne yapmam gerektiğini söyleyebilirdim ve neredeyse hiçbir zaman onu yapmıyordum." },
      { en: "In March a bookbinder in Balat told me she never starts anything she cannot work on for two hours. Not because the work takes two hours, but because the first forty minutes are always wasted on getting the glue, the paper and her own head to the same temperature.", tr: "Mart ayında Balat’ta bir ciltçi bana iki saat çalışamayacağı hiçbir şeye başlamadığını söyledi. İş iki saat sürdüğü için değil; ilk kırk dakika her zaman tutkalı, kâğıdı ve kendi kafasını aynı sıcaklığa getirmekle geçtiği için." },
      { en: "So I tried it. Two hours, one thing, every morning from eight to ten. No email before, no phone in the room, and — this was the hard part — no plan for what the two hours should produce.", tr: "Ben de denedim. İki saat, tek iş, her sabah sekizden ona. Öncesinde e-posta yok, odada telefon yok ve — zor kısım buydu — iki saatin ne üretmesi gerektiğine dair bir plan yok." },
      { en: "The first week was terrible. The second was boring. In the third I wrote more than in the whole of February, and I noticed something else: the afternoons got easier. The small tasks I used to scatter across the day all fit after lunch, because nothing big was waiting behind them.", tr: "İlk hafta berbattı. İkincisi sıkıcıydı. Üçüncüde bütün şubattan fazlasını yazdım ve başka bir şey fark ettim: öğleden sonralar kolaylaştı. Eskiden güne serptiğim küçük işlerin hepsi öğle yemeğinden sonraya sığdı, çünkü arkalarında bekleyen büyük bir şey yoktu." },
      { en: "I don’t think the number matters. Ninety minutes might be your two hours. What matters is that the block is long enough to be boring, because boredom is the toll you pay to get to the interesting part.", tr: "Sayının önemli olduğunu sanmıyorum. Sizin iki saatiniz doksan dakika olabilir. Önemli olan bloğun sıkıcı olacak kadar uzun olması; çünkü sıkıntı, ilginç kısma geçmek için ödediğiniz geçiş ücretidir." },
      { en: "This fortnight’s homework, if you want it: pick one morning, guard two hours, and write down at ten o’clock what actually happened. Reply and tell me. I read every answer, slowly.", tr: "Bu iki haftanın ödevi, isterseniz: bir sabah seçin, iki saati koruyun ve saat onda gerçekte ne olduğunu yazın. Yanıtlayıp anlatın. Her yanıtı okurum, yavaşça." },
    ],
  },
  { n: 111, date: "2026-10-25", minutes: 6, topic: "tools", title: { en: "A notebook that refuses to sync", tr: "Senkronize olmayı reddeden bir defter" }, dek: { en: "Paper is not nostalgia. It is the only tool I own that cannot interrupt me.", tr: "Kâğıt nostalji değil. Sahip olduğum ve beni bölemeyen tek araç." }, body: [{ en: "I own four note-taking apps and one notebook. Only the notebook has never shown me a badge.", tr: "Dört not uygulamam ve bir defterim var. Bana hiç bildirim rozeti göstermeyen tek şey defter." }, { en: "This issue is about the boring virtues of tools that do one thing and then stop.", tr: "Bu sayı, tek bir şey yapıp sonra duran araçların sıkıcı erdemleri hakkında." }] },
  { n: 110, date: "2026-10-11", minutes: 8, topic: "craft", title: { en: "What the tile setter knew", tr: "Fayansçının bildiği" }, dek: { en: "On measuring twice, cutting once, and the joy of a straight grout line nobody will notice.", tr: "İki kez ölçüp bir kez kesmek ve kimsenin fark etmeyeceği düz bir derz çizgisinin keyfi üzerine." }, body: [{ en: "Our bathroom took eleven days. Nine of them were preparation.", tr: "Banyomuz on bir gün sürdü. Dokuzu hazırlıktı." }, { en: "The setter, Hasan Usta, spent a whole morning on the floor before a single tile went down.", tr: "Usta Hasan, tek bir fayans döşenmeden önce bütün bir sabahı zeminde geçirdi." }] },
  { n: 109, date: "2026-09-27", minutes: 5, topic: "rest", title: { en: "Sundays without a list", tr: "Listesiz pazarlar" }, dek: { en: "I tried a month of weekends with no to-do list. I lost nothing important.", tr: "Bir ay boyunca yapılacaklar listesi olmadan hafta sonu geçirdim. Önemli hiçbir şey kaybetmedim." }, body: [{ en: "The first Sunday I made a list of things not to put on a list.", tr: "İlk pazar, listeye yazmamam gereken şeylerin bir listesini yaptım." }, { en: "By the fourth I had stopped counting.", tr: "Dördüncüsünde saymayı bırakmıştım." }] },
  { n: 108, date: "2026-09-13", minutes: 9, topic: "reading", title: { en: "Reading one book for a whole season", tr: "Bir kitabı bütün bir mevsim okumak" }, dek: { en: "Ten pages a day, a pencil, and a summer with a single long novel.", tr: "Günde on sayfa, bir kurşun kalem ve tek bir uzun romanla bir yaz." }, body: [{ en: "I used to finish forty books a year and remember four.", tr: "Eskiden yılda kırk kitap bitirir, dördünü hatırlardım." }, { en: "This summer I read one, slowly, and I think I will remember it for good.", tr: "Bu yaz birini okudum, yavaşça, ve sanırım onu hep hatırlayacağım." }] },
  { n: 107, date: "2026-08-30", minutes: 6, topic: "attention", title: { en: "The tab I never close", tr: "Hiç kapatmadığım sekme" }, dek: { en: "Open loops, browser tabs and the quiet cost of keeping options alive.", tr: "Açık döngüler, tarayıcı sekmeleri ve seçenekleri canlı tutmanın sessiz bedeli." }, body: [{ en: "I counted 63 open tabs on a Tuesday. Each one was a small promise to my future self.", tr: "Bir salı 63 açık sekme saydım. Her biri gelecekteki kendime küçük bir sözdü." }, { en: "I closed them all and wrote down the three I missed a week later.", tr: "Hepsini kapattım ve bir hafta sonra özlediğim üçünü not ettim." }] },
  { n: 106, date: "2026-08-16", minutes: 7, topic: "craft", title: { en: "First drafts are allowed to be ugly", tr: "İlk taslakların çirkin olmasına izin var" }, dek: { en: "Why I write the first version by hand, badly, and on purpose.", tr: "İlk versiyonu neden elle, kötü ve bilerek yazıyorum." }, body: [{ en: "A first draft has one job: to exist.", tr: "İlk taslağın tek bir görevi vardır: var olmak." }, { en: "Everything else is the second draft’s problem.", tr: "Geri kalan her şey ikinci taslağın sorunu." }] },
  { n: 105, date: "2026-08-02", minutes: 4, topic: "rest", title: { en: "A short letter from the ferry", tr: "Vapurdan kısa bir mektup" }, dek: { en: "Written between Karaköy and Kadıköy, which is exactly as long as it needed to be.", tr: "Karaköy ile Kadıköy arasında yazıldı; tam olması gerektiği kadar uzun." }, body: [{ en: "Twenty minutes, one simit, no signal in the middle of the water.", tr: "Yirmi dakika, bir simit, suyun ortasında çekmeyen telefon." }, { en: "The best office I have ever had costs 30 lira.", tr: "Sahip olduğum en iyi ofis 30 lira." }] },
  { n: 104, date: "2026-07-19", minutes: 8, topic: "tools", title: { en: "One pen, three years", tr: "Bir kalem, üç yıl" }, dek: { en: "On buying fewer, better tools and learning them all the way down.", tr: "Daha az ama daha iyi araç almak ve onları sonuna kadar öğrenmek üzerine." }, body: [{ en: "My fountain pen cost more than my first phone and has outlived three of them.", tr: "Dolma kalemim ilk telefonumdan pahalıydı ve üç telefonu geride bıraktı." }, { en: "This is not an advertisement. It is a confession.", tr: "Bu bir reklam değil. Bir itiraf." }] },
  { n: 98, date: "2026-04-26", minutes: 6, topic: "attention", title: { en: "Notifications are a lease, not a gift", tr: "Bildirimler hediye değil, kiradır" }, dek: { en: "Every app that can interrupt you is renting a small piece of your day.", tr: "Sizi bölebilen her uygulama gününüzün küçük bir parçasını kiralıyor." }, body: [{ en: "I turned off every notification for a week, then let them back in one by one.", tr: "Bir hafta boyunca bütün bildirimleri kapattım, sonra tek tek geri açtım." }, { en: "Seven came back. Forty-one did not.", tr: "Yedisi geri geldi. Kırk biri gelmedi." }] },
  { n: 87, date: "2025-11-23", minutes: 7, topic: "reading", title: { en: "Margins", tr: "Kenar boşlukları" }, dek: { en: "Writing in books, and why the second reading is the real one.", tr: "Kitaplara yazmak ve neden asıl okumanın ikincisi olduğu." }, body: [{ en: "My copy of the novel has three colours of pencil in it, one per reading.", tr: "Romandaki nüshamda her okumaya bir tane olmak üzere üç renk kurşun kalem var." }, { en: "The third one argues with the first.", tr: "Üçüncüsü birincisiyle tartışıyor." }] },
  { n: 80, date: "2025-08-17", minutes: 5, topic: "craft", title: { en: "The desk, finally", tr: "Masa, sonunda" }, dek: { en: "The issue that gave this letter its name: one desk, one lamp, one thing at a time.", tr: "Bu mektuba adını veren sayı: bir masa, bir lamba, aynı anda tek iş." }, body: [{ en: "I built the desk from a door and two trestles in an afternoon.", tr: "Masayı bir öğleden sonra bir kapı ve iki sehpa ayağından yaptım." }, { en: "It is too small for two things, which is the point.", tr: "İki şey için fazla küçük; amaç da bu." }] },
];

export const quotes: { quote: L; author: string; role: L }[] = [
  { quote: { en: "The only email I read on paper. I print it on Sunday night and read it with Monday’s first coffee.", tr: "Kâğıtta okuduğum tek e-posta. Pazar akşamı yazdırıp pazartesinin ilk kahvesiyle okuyorum." }, author: "Ece K.", role: { en: "Architect, Izmir", tr: "Mimar, İzmir" } },
  { quote: { en: "I tried the two-hour mornings. Three weeks in, I finished a translation I had been avoiding since spring.", tr: "İki saatlik sabahları denedim. Üç hafta sonra bahardan beri kaçtığım bir çeviriyi bitirdim." }, author: "Jonas W.", role: { en: "Translator, Leipzig", tr: "Çevirmen, Leipzig" } },
  { quote: { en: "Short, kind and never selling me anything. I forward it to my team every other Monday.", tr: "Kısa, nazik ve bana hiçbir şey satmaya çalışmıyor. İki pazartesiden birinde ekibime iletiyorum." }, author: "Murat D.", role: { en: "Engineering manager, Istanbul", tr: "Mühendislik yöneticisi, İstanbul" } },
];

export const faq: { q: L; a: L }[] = [
  { q: { en: "How often will I hear from you?", tr: "Ne sıklıkla haber alacağım?" }, a: { en: "Every second Sunday at 07:00 Istanbul time. Choose the monthly digest instead and you get the two latest letters on the first Sunday of the month.", tr: "İki pazarda bir, İstanbul saatiyle 07.00’de. Bunun yerine aylık özeti seçerseniz son iki mektubu ayın ilk pazarı alırsınız." } },
  { q: { en: "Is it free?", tr: "Ücretsiz mi?" }, a: { en: "Yes, every letter is free and stays in the archive. Readers who want to support it can pay $5 a month or $50 a year; they get nothing extra except my thanks.", tr: "Evet, her mektup ücretsiz ve arşivde kalır. Desteklemek isteyenler ayda 5 $ ya da yılda 50 $ ödeyebilir; teşekkürüm dışında ek bir şey almazlar." } },
  { q: { en: "Do you track opens?", tr: "Açılmaları takip ediyor musunuz?" }, a: { en: "No. There are no tracking pixels and no link redirects. I only know you read it if you reply.", tr: "Hayır. İzleme pikseli ya da bağlantı yönlendirmesi yok. Okuduğunuzu yalnızca yanıtlarsanız bilirim." } },
  { q: { en: "Can I read it in Turkish?", tr: "Türkçe okuyabilir miyim?" }, a: { en: "Every letter is written in both English and Turkish. Pick your language on the confirmation page; you can switch any time.", tr: "Her mektup hem İngilizce hem Türkçe yazılır. Dilinizi onay sayfasında seçin; istediğiniz zaman değiştirebilirsiniz." } },
];
