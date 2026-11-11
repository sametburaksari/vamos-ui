// Sample content for "Tempo Run", a fictional running-coach app. Every human-readable field is
// `Localized` ({ en, tr }) and resolved with `pickLocale`. Numbers stay numbers and are
// formatted per locale with the kit formatter (5.2 → "5,2" in Turkish).
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
type L = Localized<string>;

/** Fictional numbers and domains only. */
export const PHONE = "+902160000000";
export const EMAIL = "hello@temporun.example.com";

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-US";
  const f = createFormatter(intl, { currency: "USD", timeZone: "Europe/Istanbul" });
  return {
    t,
    f,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

/** "5:12" from seconds per km. */
export const pace = (secPerKm: number) => `${Math.floor(secPerKm / 60)}:${String(secPerKm % 60).padStart(2, "0")}`;

export const photos = {
  dawn: { ...unsplash("1476480862126-209bfaa8edc8", 1400, 1750), alt: { en: "A runner on an empty coastal road at dawn", tr: "Şafakta boş bir sahil yolunda koşan biri" } as L },
  track: { ...unsplash("1552674605-db6ffd4facb5", 1400, 1000), alt: { en: "Two runners side by side on a city street", tr: "Şehirde yan yana koşan iki kişi" } as L },
};

/* ------------------------------------------------------------------ */
/* The four chapters of the scroll-driven phone                         */
/* ------------------------------------------------------------------ */

export const chapters: { id: "live" | "plan" | "coach" | "recover"; kicker: L; title: L; text: L; points: L[] }[] = [
  {
    id: "live",
    kicker: { en: "During the run", tr: "Koşu sırasında" },
    title: { en: "Your pace, read like a dashboard", tr: "Temponuz, bir gösterge paneli gibi" },
    text: {
      en: "One glance: current pace, the target band for this rep and how far until it ends. The screen stays legible in direct sun and through a sweaty thumb.",
      tr: "Tek bakış: anlık tempo, bu tekrarın hedef aralığı ve bitimine kalan mesafe. Ekran doğrudan güneşte ve terli parmakla da okunur.",
    },
    points: [
      { en: "Target band turns amber 5 s before you drift out", tr: "Hedef aralıktan çıkmadan 5 sn önce kehribar rengine döner" },
      { en: "Lock screen widget with auto-lap", tr: "Otomatik turlu kilit ekranı widget’ı" },
    ],
  },
  {
    id: "plan",
    kicker: { en: "Every week", tr: "Her hafta" },
    title: { en: "A plan that moves when your week does", tr: "Haftanız değiştiğinde değişen bir plan" },
    text: {
      en: "Missed Tuesday’s intervals? Tempo slides the week instead of piling it up, and keeps the long run where you can actually do it.",
      tr: "Salı günkü interval kaçtı mı? Tempo yükü üst üste bindirmek yerine haftayı kaydırır ve uzun koşuyu gerçekten yapabileceğiniz güne koyar.",
    },
    points: [
      { en: "Drag a session to another day", tr: "Bir antrenmanı başka güne sürükleyin" },
      { en: "Calendar sync with your work week", tr: "İş takviminizle senkron" },
    ],
  },
  {
    id: "coach",
    kicker: { en: "In your ears", tr: "Kulağınızda" },
    title: { en: "A coach who talks only when it matters", tr: "Yalnızca gerektiğinde konuşan bir koç" },
    text: {
      en: "Short voice cues at the start of a rep, at halfway and when you’re fading — never over the chorus. Recorded by a real coach in English and Turkish.",
      tr: "Tekrarın başında, yarısında ve düştüğünüzde kısa sesli uyarılar — asla nakaratın üstüne değil. Gerçek bir koç tarafından İngilizce ve Türkçe seslendirildi.",
    },
    points: [
      { en: "Ducks your music instead of pausing it", tr: "Müziği durdurmaz, kısar" },
      { en: "Three voices, three levels of chatter", tr: "Üç ses, üç konuşkanlık seviyesi" },
    ],
  },
  {
    id: "recover",
    kicker: { en: "The morning after", tr: "Ertesi sabah" },
    title: { en: "Readiness before you lace up", tr: "Bağcıkları bağlamadan önce hazırlık" },
    text: {
      en: "Sleep, resting heart rate and last week’s load become one number. Below 60, today’s tempo becomes an easy run — and the plan explains why.",
      tr: "Uyku, dinlenik nabız ve geçen haftanın yükü tek bir sayıya dönüşür. 60’ın altında bugünkü tempo koşusu kolay koşuya döner — plan nedenini de açıklar.",
    },
    points: [
      { en: "Reads your watch’s sleep data", tr: "Saatinizin uyku verisini okur" },
      { en: "No streaks, no guilt badges", tr: "Seri yok, suçluluk rozeti yok" },
    ],
  },
];

/* Screen data */
export const liveRun = { paceSec: 312, targetLow: 305, targetHigh: 320, km: 7.42, elapsed: "38:36", heart: 162, zone: 3, rep: 4, reps: 6, repLeft: 340 };
export const week: { day: L; title: L; detail: L; state: "done" | "today" | "next" | "rest" }[] = [
  { day: { en: "Mon", tr: "Pzt" }, title: { en: "Easy", tr: "Kolay" }, detail: { en: "6 km · 6:10", tr: "6 km · 6:10" }, state: "done" },
  { day: { en: "Tue", tr: "Sal" }, title: { en: "Intervals", tr: "İnterval" }, detail: { en: "6 × 800 m", tr: "6 × 800 m" }, state: "done" },
  { day: { en: "Wed", tr: "Çar" }, title: { en: "Rest", tr: "Dinlenme" }, detail: { en: "Mobility 15 min", tr: "Mobilite 15 dk" }, state: "rest" },
  { day: { en: "Thu", tr: "Per" }, title: { en: "Tempo", tr: "Tempo" }, detail: { en: "8 km · 5:05", tr: "8 km · 5:05" }, state: "today" },
  { day: { en: "Fri", tr: "Cum" }, title: { en: "Easy", tr: "Kolay" }, detail: { en: "5 km", tr: "5 km" }, state: "next" },
  { day: { en: "Sun", tr: "Paz" }, title: { en: "Long run", tr: "Uzun koşu" }, detail: { en: "18 km · hilly", tr: "18 km · tepeli" }, state: "next" },
];
export const coachCues: { at: string; text: L }[] = [
  { at: "0:00", text: { en: "Rep four. Settle in at five-ten.", tr: "Dördüncü tekrar. Beş-on’a otur." } },
  { at: "1:32", text: { en: "Halfway. Shoulders down, you’re right on it.", tr: "Yarıladın. Omuzlar aşağı, tam hedeftesin." } },
  { at: "2:41", text: { en: "Last 200. Hold it, don’t sprint.", tr: "Son 200. Koru, depar atma." } },
];
export const recovery = { score: 82, sleep: { en: "7 h 40 min", tr: "7 sa 40 dk" } as L, rhr: 48, load: [42, 55, 0, 61, 38, 0, 74] };

/* ------------------------------------------------------------------ */
/* Training plans (the Tabs section)                                    */
/* ------------------------------------------------------------------ */

export const plans: { id: string; name: L; weeks: number; perWeek: L; peak: number; goal: L; blurb: L; phases: { name: L; weeks: number }[] }[] = [
  {
    id: "5k",
    name: { en: "First 5K", tr: "İlk 5K" },
    weeks: 8,
    perWeek: { en: "3 runs a week", tr: "Haftada 3 koşu" },
    peak: 18,
    goal: { en: "Run 5 km without stopping", tr: "5 km’yi durmadan koşmak" },
    blurb: { en: "Walk–run intervals that shrink every week. Most people finish week 8 surprised.", tr: "Her hafta kısalan yürü-koş aralıkları. Çoğu kişi 8. haftayı şaşırarak bitirir." },
    phases: [{ name: { en: "Walk–run", tr: "Yürü-koş" }, weeks: 4 }, { name: { en: "Continuous", tr: "Kesintisiz" }, weeks: 3 }, { name: { en: "Race week", tr: "Yarış haftası" }, weeks: 1 }],
  },
  {
    id: "10k",
    name: { en: "10K under 50", tr: "50 dk altı 10K" },
    weeks: 10,
    perWeek: { en: "4 runs a week", tr: "Haftada 4 koşu" },
    peak: 38,
    goal: { en: "10 km at 4:59 per km", tr: "Kilometre başı 4:59’la 10 km" },
    blurb: { en: "One interval day, one tempo day, everything else easy. Built for people with a desk job.", tr: "Bir interval günü, bir tempo günü, gerisi kolay. Masa başı çalışanlar için." },
    phases: [{ name: { en: "Base", tr: "Temel" }, weeks: 3 }, { name: { en: "Speed", tr: "Hız" }, weeks: 4 }, { name: { en: "Sharpen", tr: "Keskinleştirme" }, weeks: 2 }, { name: { en: "Taper", tr: "Azaltma" }, weeks: 1 }],
  },
  {
    id: "half",
    name: { en: "Half marathon", tr: "Yarı maraton" },
    weeks: 12,
    perWeek: { en: "4–5 runs a week", tr: "Haftada 4–5 koşu" },
    peak: 52,
    goal: { en: "21.1 km, strong in the last 5", tr: "21,1 km, son 5’te güçlü" },
    blurb: { en: "Long runs grow by 1.5 km at most, with a step-back week every fourth.", tr: "Uzun koşular en fazla 1,5 km artar; her dördüncü hafta yük azaltılır." },
    phases: [{ name: { en: "Base", tr: "Temel" }, weeks: 4 }, { name: { en: "Build", tr: "Gelişim" }, weeks: 5 }, { name: { en: "Peak", tr: "Zirve" }, weeks: 2 }, { name: { en: "Taper", tr: "Azaltma" }, weeks: 1 }],
  },
  {
    id: "marathon",
    name: { en: "Marathon", tr: "Maraton" },
    weeks: 18,
    perWeek: { en: "5 runs a week", tr: "Haftada 5 koşu" },
    peak: 78,
    goal: { en: "42.2 km with a fuelling plan", tr: "Beslenme planıyla 42,2 km" },
    blurb: { en: "Three 30+ km long runs, marathon-pace blocks from week 9 and a gel reminder every 35 minutes.", tr: "Üç adet 30+ km uzun koşu, 9. haftadan itibaren maraton temposu blokları ve her 35 dakikada bir jel hatırlatması." },
    phases: [{ name: { en: "Base", tr: "Temel" }, weeks: 6 }, { name: { en: "Build", tr: "Gelişim" }, weeks: 6 }, { name: { en: "Peak", tr: "Zirve" }, weeks: 3 }, { name: { en: "Taper", tr: "Azaltma" }, weeks: 3 }],
  },
];

/* ------------------------------------------------------------------ */
/* Voices                                                                */
/* ------------------------------------------------------------------ */

export const reviews: { quote: L; author: string; role: L; date: string; rating: number }[] = [
  { quote: { en: "First plan that survived a two-week work trip. It just moved everything and told me which run to skip.", tr: "İki haftalık iş seyahatinden sağ çıkan ilk plan. Her şeyi kaydırdı ve hangi koşuyu atlamam gerektiğini söyledi." }, author: "Elif Karaca", role: { en: "Half marathon, 1:52", tr: "Yarı maraton, 1:52" }, date: "2026-10-19", rating: 5 },
  { quote: { en: "The voice cues are the right amount. I hear the coach three times per rep, not every 30 seconds.", tr: "Sesli uyarılar tam kararında. Koçu her tekrarda üç kez duyuyorum, 30 saniyede bir değil." }, author: "Marco Bellini", role: { en: "10K, 47:20", tr: "10K, 47:20" }, date: "2026-09-28", rating: 5 },
  { quote: { en: "Readiness turned my Thursday tempo into an easy run twice. Annoying both times, right both times.", tr: "Hazırlık skoru perşembe tempomu iki kez kolay koşuya çevirdi. İkisinde de sinir oldum, ikisinde de haklıydı." }, author: "Selin Aydın", role: { en: "Marathon, first one", tr: "Maraton, ilki" }, date: "2026-10-02", rating: 4 },
  { quote: { en: "Our club of 22 runs on Crew. Everyone sees the Saturday route and I stopped sending PDFs.", tr: "22 kişilik kulübümüz Crew ile çalışıyor. Herkes cumartesi rotasını görüyor, PDF göndermeyi bıraktım." }, author: "Okan Demirtaş", role: { en: "Run club captain, Kadıköy", tr: "Koşu kulübü kaptanı, Kadıköy" }, date: "2026-08-14", rating: 5 },
  { quote: { en: "Week 8 of First 5K. I ran the whole thing. I am 44 and I did not think this was for me.", tr: "İlk 5K’nın 8. haftası. Baştan sona koştum. 44 yaşındayım ve bunun bana göre olduğunu düşünmüyordum." }, author: "Hande Yıldız", role: { en: "First 5K", tr: "İlk 5K" }, date: "2026-10-30", rating: 5 },
];

/* ------------------------------------------------------------------ */
/* Pricing                                                              */
/* ------------------------------------------------------------------ */

export const USD = (amount: string) => ({ amount, currency: "USD" });

export const faqPricing: { q: L; a: L }[] = [
  { q: { en: "Is the free plan really free?", tr: "Ücretsiz paket gerçekten ücretsiz mi?" }, a: { en: "Yes. Run tracking, the First 5K plan and basic stats never expire and never show ads.", tr: "Evet. Koşu kaydı, İlk 5K planı ve temel istatistikler hiç bitmez, reklam da göstermez." } },
  { q: { en: "How does the 14-day trial work?", tr: "14 günlük deneme nasıl işliyor?" }, a: { en: "Pro is unlocked for 14 days. We remind you 2 days before it ends; cancel in the App Store or Google Play and you won’t be charged.", tr: "Pro 14 gün boyunca açılır. Bitmeden 2 gün önce hatırlatırız; App Store ya da Google Play’den iptal ederseniz ücret alınmaz." } },
  { q: { en: "Can I switch from monthly to yearly?", tr: "Aylıktan yıllığa geçebilir miyim?" }, a: { en: "Any time. The store credits the unused part of your month toward the year.", tr: "İstediğiniz zaman. Mağaza ayın kullanılmayan kısmını yıllık ücrete sayar." } },
  { q: { en: "Do you have student prices?", tr: "Öğrenci fiyatı var mı?" }, a: { en: "Yes: 50% off Pro yearly with a university email. Write to us from that address.", tr: "Evet: üniversite e-postasıyla Pro yıllıkta %50 indirim. O adresten bize yazın." } },
];

export const faqDownload: { q: L; a: L }[] = [
  { q: { en: "Which phones are supported?", tr: "Hangi telefonlar destekleniyor?" }, a: { en: "iPhone with iOS 17 or later, and Android 10 or later with Google Play services.", tr: "iOS 17 ve üstü iPhone’lar ile Google Play hizmetleri olan Android 10 ve üstü telefonlar." } },
  { q: { en: "Does it work with my watch?", tr: "Saatimle çalışır mı?" }, a: { en: "Tempo reads runs from watchOS 10+ and Wear OS 4+ watches, and imports .fit files from other GPS watches.", tr: "Tempo, watchOS 10+ ve Wear OS 4+ saatlerden koşuları okur; diğer GPS saatlerden .fit dosyalarını içe aktarır." } },
  { q: { en: "Can I run without my phone?", tr: "Telefonsuz koşabilir miyim?" }, a: { en: "Yes, on a supported watch. The session syncs when your phone is back in range.", tr: "Evet, desteklenen bir saatle. Antrenman telefonunuz yakına gelince senkronize olur." } },
  { q: { en: "How much battery does a run use?", tr: "Bir koşu ne kadar pil harcar?" }, a: { en: "About 6% per hour on a two-year-old phone with GPS and voice cues on.", tr: "GPS ve sesli uyarılar açıkken iki yıllık bir telefonda saatte yaklaşık %6." } },
  { q: { en: "Where is my data stored?", tr: "Verilerim nerede saklanıyor?" }, a: { en: "In Frankfurt (EU). Export everything as .fit or .csv, or delete your account from Settings in one step.", tr: "Frankfurt’ta (AB). Her şeyi .fit ya da .csv olarak dışa aktarın veya hesabınızı Ayarlar’dan tek adımda silin." } },
];
