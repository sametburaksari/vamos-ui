// Sample content for "Ember Atlas", a fictional game by the fictional two-room studio
// "Lowtide Games". Every human-readable field is `Localized` ({ en, tr }) and resolved with
// `pickLocale`. Photos are unbranded landscapes standing in for in-game mood frames; the
// trailer file is a license-safe stand-in (Sintel trailer, CC BY 3.0, Blender Foundation).
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
type L = Localized<string>;

export const STUDIO = "Lowtide Games";
export const GAME = "Ember Atlas";
export const DOMAIN = "emberatlas.example.com";
export const PRESS_EMAIL = "press@lowtide.example.com";
export const HELLO_EMAIL = "hello@lowtide.example.com";
export const PHONE = "+902160000000";
export const RELEASE = "2027-03-12";
/** Stand-in trailer (CC BY 3.0). Loaded only after a click. */
export const TRAILER_SRC = "https://download.blender.org/durian/trailer/sintel_trailer-480p.mp4";

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "EUR", timeZone: "Europe/Istanbul" });
  const eur = (n: number) => f.currency(n, "EUR");
  return {
    locale,
    t,
    f,
    eur,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

export type ShotId = "summit" | "cloudsea" | "tide" | "ridges" | "deep" | "lights";
export const shots: Record<ShotId, { src: string; width: number; height: number; alt: L; caption: L; region: L }> = {
  summit: { ...unsplash("1519681393784-d120267933ba", 1920, 1080), alt: { en: "Snow-capped peaks under a dense field of stars", tr: "Yoğun bir yıldız alanı altında karlı zirveler" }, caption: { en: "The Cinder Spine at night: the last fire is the brightest thing for forty kilometres.", tr: "Gece Kül Sırtı: son ateş, kırk kilometre boyunca en parlak şey." }, region: { en: "Cinder Spine", tr: "Kül Sırtı" } },
  cloudsea: { ...unsplash("1506905925346-21bda4d32df4", 1920, 1080), alt: { en: "Mountain ridges rising out of a sea of cloud at dusk", tr: "Alacakaranlıkta bulut denizinden yükselen dağ sırtları" }, caption: { en: "Above the drowned valleys, the map only exists where you have carried the flame.", tr: "Batık vadilerin üstünde harita yalnızca alevi taşıdığınız yerde var." }, region: { en: "The Overcloud", tr: "Bulutüstü" } },
  tide: { ...unsplash("1511300636408-a63a89df3482", 1920, 1080), alt: { en: "A dark mountain mirrored in still, shallow water under a violet sky", tr: "Mor gökyüzü altında durgun sığ suya yansıyan karanlık bir dağ" }, caption: { en: "Low tide at Basalt Hollow. You have about four minutes before the water comes back.", tr: "Bazalt Çukuru’nda cezir. Su geri gelmeden önce yaklaşık dört dakikanız var." }, region: { en: "Basalt Hollow", tr: "Bazalt Çukuru" } },
  ridges: { ...unsplash("1500534314209-a25ddb2bd429", 1920, 1080), alt: { en: "Layers of hazy green hills fading towards a pale horizon", tr: "Soluk ufka doğru silikleşen puslu yeşil tepe katmanları" }, caption: { en: "The Greywood ridges, where the map draws itself in smoke.", tr: "Haritanın kendini dumanla çizdiği Gri Orman sırtları." }, region: { en: "Greywood", tr: "Gri Orman" } },
  deep: { ...unsplash("1478760329108-5c3ed9d495a0", 1920, 1080), alt: { en: "Deep blue-black water with faint light from above", tr: "Yukarıdan gelen soluk ışıkla derin, mavi-siyah su" }, caption: { en: "The Sunken Archive. Fire does not belong down here, and it knows.", tr: "Batık Arşiv. Ateş buraya ait değil ve bunu biliyor." }, region: { en: "Sunken Archive", tr: "Batık Arşiv" } },
  lights: { ...unsplash("1501630834273-4b5604d2ee31", 1920, 1080), alt: { en: "Sunset light breaking through towering pink clouds", tr: "Yükselen pembe bulutların arasından sızan gün batımı ışığı" }, caption: { en: "Storm season over the Ashen Coast — the wind decides where your embers drift.", tr: "Küllü Kıyı’da fırtına mevsimi: közlerinizin nereye savrulacağına rüzgâr karar verir." }, region: { en: "Ashen Coast", tr: "Küllü Kıyı" } },
};

export const pillars: { title: L; text: L }[] = [
  { title: { en: "Carry the fire", tr: "Ateşi taşı" }, text: { en: "One flame, and it is your light, your map and your health. Shelter it from rain, feed it with what you find, and decide what is worth burning.", tr: "Tek bir alev: ışığınız, haritanız ve canınız. Onu yağmurdan koruyun, bulduklarınızla besleyin ve neyin yakılmaya değer olduğuna siz karar verin." } },
  { title: { en: "Draw the atlas", tr: "Atlası çiz" }, text: { en: "Nothing is mapped until you have stood there with the flame. Your atlas is hand-inked as you walk — and the tide erases what you leave behind.", tr: "Alevle orada durmadıkça hiçbir yer haritada yok. Atlasınız siz yürüdükçe elle mürekkeplenir; geride bıraktıklarınızı gelgit siler." } },
  { title: { en: "Leave embers behind", tr: "Geride köz bırak" }, text: { en: "Every ember you plant is a checkpoint, a light for other players and a little less fire for you. Plant too many and you walk in the dark.", tr: "Diktiğiniz her köz bir kayıt noktası, diğer oyuncular için bir ışık ve sizin için biraz daha az ateş. Çok dikerseniz karanlıkta yürürsünüz." } },
];

export const facts: { value: L; label: L }[] = [
  { value: { en: "9", tr: "9" }, label: { en: "drowned regions, hand-built", tr: "elle yapılmış batık bölge" } },
  { value: { en: "14–18 h", tr: "14–18 sa" }, label: { en: "for a first crossing", tr: "ilk geçiş için" } },
  { value: { en: "0", tr: "0" }, label: { en: "waypoints, quest markers or minimaps", tr: "yol işareti, görev imleci ya da mini harita" } },
  { value: { en: "1", tr: "1" }, label: { en: "flame. Don’t let it go out.", tr: "alev. Sönmesine izin verme." } },
];

export interface Trailer {
  id: string;
  title: L;
  /** Seconds. */
  duration: number;
  date: string;
  poster: ShotId;
  note: L;
}
export const trailers: Trailer[] = [
  { id: "reveal", title: { en: "Reveal trailer", tr: "Tanıtım fragmanı" }, duration: 134, date: "2026-06-09", poster: "summit", note: { en: "In-engine, no gameplay.", tr: "Oyun motorunda, oynanış içermez." } },
  { id: "gameplay", title: { en: "Twelve minutes on the Ashen Coast", tr: "Küllü Kıyı’da on iki dakika" }, duration: 734, date: "2026-10-14", poster: "lights", note: { en: "Uncut pre-alpha gameplay, narrated by the director.", tr: "Kesintisiz pre-alfa oynanış, yönetmen anlatımıyla." } },
  { id: "diary-3", title: { en: "Dev diary 3: drawing with fire", tr: "Geliştirici günlüğü 3: ateşle çizmek" }, duration: 665, date: "2026-11-04", poster: "ridges", note: { en: "How the atlas inks itself, with the art lead.", tr: "Atlasın kendini nasıl mürekkeplediği, sanat lideriyle." } },
];

export const diary: { title: L; excerpt: L; date: string; minutes: number; author: string }[] = [
  { title: { en: "Why there is no minimap", tr: "Neden mini harita yok" }, excerpt: { en: "Three prototypes, two playtests and the evening we deleted the compass.", tr: "Üç prototip, iki oyun testi ve pusulayı sildiğimiz akşam." }, date: "2026-11-04", minutes: 7, author: "Mira Kestane" },
  { title: { en: "Fire that behaves", tr: "Söz dinleyen ateş" }, excerpt: { en: "Simulating a flame that reacts to wind, rain and fear without melting a laptop.", tr: "Rüzgâra, yağmura ve korkuya tepki veren bir alevi dizüstünü eritmeden simüle etmek." }, date: "2026-10-21", minutes: 9, author: "Teo Arslan" },
  { title: { en: "Composing for a quiet game", tr: "Sessiz bir oyun için beste" }, excerpt: { en: "The score has 41 minutes of music and 14 hours of silence.", tr: "Müzikte 41 dakika beste ve 14 saat sessizlik var." }, date: "2026-09-30", minutes: 5, author: "Ines Halloran" },
];

export const team: { name: string; role: L }[] = [
  { name: "Mira Kestane", role: { en: "Director, design", tr: "Yönetmen, tasarım" } },
  { name: "Teo Arslan", role: { en: "Engineering, fire simulation", tr: "Mühendislik, ateş simülasyonu" } },
  { name: "Juno Varela", role: { en: "Art lead", tr: "Sanat lideri" } },
  { name: "Ines Halloran", role: { en: "Music and sound", tr: "Müzik ve ses" } },
];

export const awards: L[] = [
  { en: "Official selection — Northern Indie Showcase 2026", tr: "Resmî seçki — Kuzey Bağımsız Vitrini 2026" },
  { en: "Best Art Direction nominee — Harbour Game Awards 2026", tr: "En İyi Sanat Yönetimi adayı — Harbour Oyun Ödülleri 2026" },
];

export const quotes: { quote: L; source: string }[] = [
  { quote: { en: "The rare game where the map is the story.", tr: "Haritanın hikâyenin kendisi olduğu nadir oyunlardan." }, source: "Field Notes Weekly" },
  { quote: { en: "I stopped playing for a minute just to watch the flame in the rain.", tr: "Sırf yağmurdaki aleve bakmak için bir dakika oynamayı bıraktım." }, source: "Second Controller" },
];

export const description: L = {
  en: "Ember Atlas is a quiet exploration game about carrying the last fire across a drowned world. There are no waypoints: the map exists only where you have stood with the flame, and the tide erases what you leave behind. Plant embers to make checkpoints and light the way for other players — but every ember is fire you no longer carry.",
  tr: "Ember Atlas, batık bir dünyada son ateşi taşımak üzerine sakin bir keşif oyunu. Yol işareti yok: harita yalnızca alevle durduğunuz yerde var ve gelgit geride bıraktıklarınızı siler. Kayıt noktası yapmak ve diğer oyunculara yol göstermek için köz dikin; ama her köz artık taşımadığınız bir ateştir.",
};

export const boilerplate: L = {
  en: "Lowtide Games is an independent studio of six people working from two rooms above a ferry ticket office. Founded in 2021, it makes small, quiet games about places. Ember Atlas is its second game, after the 2023 puzzle game Salt Hours.",
  tr: "Lowtide Games, bir vapur gişesinin üstündeki iki odada çalışan altı kişilik bağımsız bir stüdyo. 2021’de kuruldu; mekânlar üzerine küçük, sakin oyunlar yapıyor. Ember Atlas, 2023’teki bulmaca oyunu Salt Hours’tan sonra stüdyonun ikinci oyunu.",
};

export const faqPress: { q: L; a: L }[] = [
  { q: { en: "When does the review embargo lift?", tr: "İnceleme ambargosu ne zaman kalkıyor?" }, a: { en: "Tuesday 9 March 2027, 16:00 CET — three days before release. Previews of the first two regions are allowed from 2 February.", tr: "9 Mart 2027 Salı, 16:00 CET — çıkıştan üç gün önce. İlk iki bölgenin önizlemelerine 2 Şubat’tan itibaren izin var." } },
  { q: { en: "Can I stream or monetise videos?", tr: "Yayın yapabilir ya da videolardan gelir elde edebilir miyim?" }, a: { en: "Yes, from the embargo onward. Please leave the final region (The Hearth) out of thumbnails and titles.", tr: "Evet, ambargodan sonra. Lütfen son bölgeyi (Ocak) küçük resim ve başlıklarda göstermeyin." } },
  { q: { en: "Can I use the assets in this kit?", tr: "Bu kitteki görselleri kullanabilir miyim?" }, a: { en: "Yes, for coverage of Ember Atlas. Don’t crop the logo or recolour the key art.", tr: "Evet, Ember Atlas haberleri için. Logoyu kırpmayın, ana görselin rengini değiştirmeyin." } },
];
