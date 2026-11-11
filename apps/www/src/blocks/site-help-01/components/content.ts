// Sample content for the help centre of "Loam", a fictional garden-planning app (the same brand
// as site-waitlist-01, after launch). Every human-readable field is `Localized` ({ en, tr }).
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

export const EMAIL = "help@loam.example.com";
export const PHONE = "+902160000000";

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "EUR", timeZone: "Europe/Istanbul" });
  return {
    locale,
    t,
    f,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

export type CategoryId = "start" | "plots" | "calendar" | "soil" | "household" | "account";

export interface Category {
  id: CategoryId;
  title: L;
  text: L;
}

export const categories: Category[] = [
  { id: "start", title: { en: "Getting started", tr: "Başlarken" }, text: { en: "Your first plot, location and importing old notes.", tr: "İlk parseliniz, konumunuz ve eski notları aktarma." } },
  { id: "plots", title: { en: "Plots and beds", tr: "Parseller ve yataklar" }, text: { en: "Drawing, sun hours, raised beds and containers.", tr: "Çizim, güneş saatleri, yükseltilmiş yataklar ve saksılar." } },
  { id: "calendar", title: { en: "Sowing calendar", tr: "Ekim takvimi" }, text: { en: "Reminders, frost dates and succession sowing.", tr: "Hatırlatmalar, don tarihleri ve ardışık ekim." } },
  { id: "soil", title: { en: "Soil and rotation", tr: "Toprak ve münavebe" }, text: { en: "Soil tests, compost and the four-year rotation.", tr: "Toprak testleri, kompost ve dört yıllık münavebe." } },
  { id: "household", title: { en: "Sharing and households", tr: "Paylaşım ve hane" }, text: { en: "Invite family or plot partners and set who edits what.", tr: "Aileyi ya da parsel ortaklarını davet edin, kimin neyi düzenleyeceğini belirleyin." } },
  { id: "account", title: { en: "Account and billing", tr: "Hesap ve ödeme" }, text: { en: "Loam Plus, invoices, exporting and deleting data.", tr: "Loam Plus, faturalar, verileri dışa aktarma ve silme." } },
];

export interface Article {
  id: string;
  category: CategoryId;
  title: L;
  summary: L;
  /** Extra search words (synonyms people type). */
  keywords: L;
  minutes: number;
  updated: string;
  /** How many readers pressed "Yes" on "Was this helpful?". */
  helpful: number;
  intro: L;
  steps: L[];
  tip: L;
}

export const articles: Article[] = [
  {
    id: "first-plot",
    category: "start",
    title: { en: "Draw your first plot in four minutes", tr: "İlk parselinizi dört dakikada çizin" },
    summary: { en: "Pace out the edges, enter three measurements and drag in beds.", tr: "Kenarları adımlayın, üç ölçü girin ve yatakları sürükleyin." },
    keywords: { en: "new garden map draw layout size measure", tr: "yeni bahçe harita çizim yerleşim ölçü boyut" },
    minutes: 3,
    updated: "2026-10-28",
    helpful: 412,
    intro: { en: "A rough plot is better than no plot: you can correct every measurement later without losing what you planted.", tr: "Kaba bir parsel hiç olmamasından iyidir: ektiklerinizi kaybetmeden her ölçüyü sonra düzeltebilirsiniz." },
    steps: [
      { en: "Tap New plot and choose Rectangle, L-shape or Free shape.", tr: "Yeni parsel’e dokunun ve Dikdörtgen, L şekli ya da Serbest şekil seçin." },
      { en: "Enter the length of two sides in metres. Paces work too: one adult pace is about 0.75 m.", tr: "İki kenarın uzunluğunu metre olarak girin. Adım da olur: bir yetişkin adımı yaklaşık 0,75 m’dir." },
      { en: "Set which edge faces north by turning the compass at the top right.", tr: "Sağ üstteki pusulayı çevirerek hangi kenarın kuzeye baktığını belirleyin." },
      { en: "Drag beds from the tray onto the plot and pull their corners to size.", tr: "Yatakları tepsiden parsele sürükleyin, köşelerinden çekerek boyutlandırın." },
    ],
    tip: { en: "On the web planner, hold Shift while dragging to snap beds to a 10 cm grid.", tr: "Web planlayıcıda sürüklerken Shift’e basılı tutarsanız yataklar 10 cm’lik ızgaraya oturur." },
  },
  {
    id: "location",
    category: "start",
    title: { en: "Set your location and climate zone", tr: "Konumunuzu ve iklim bölgenizi ayarlayın" },
    summary: { en: "Loam needs your town, not your address, to pick sowing dates.", tr: "Loam ekim tarihlerini seçmek için adresinizi değil ilçenizi bilmeli." },
    keywords: { en: "zone region town city weather hardiness", tr: "bölge şehir ilçe hava dayanıklılık konum" },
    minutes: 2,
    updated: "2026-09-14",
    helpful: 188,
    intro: { en: "Your climate zone decides every date in the calendar. We only store the town you pick, never GPS coordinates.", tr: "İklim bölgeniz takvimdeki her tarihi belirler. Yalnızca seçtiğiniz ilçeyi saklarız, GPS koordinatlarını asla." },
    steps: [
      { en: "Open Settings → Garden → Location.", tr: "Ayarlar → Bahçe → Konum’u açın." },
      { en: "Type your town and pick it from the list.", tr: "İlçenizi yazın ve listeden seçin." },
      { en: "Check the zone Loam suggests; change it if your plot sits on a hill or by the sea.", tr: "Loam’un önerdiği bölgeyi kontrol edin; parseliniz tepede ya da deniz kenarındaysa değiştirin." },
    ],
    tip: { en: "Coastal plots are often half a zone warmer than the town centre.", tr: "Kıyıdaki parseller genellikle şehir merkezinden yarım bölge daha sıcaktır." },
  },
  {
    id: "import",
    category: "start",
    title: { en: "Import last year’s notes from a spreadsheet", tr: "Geçen yılın notlarını tablodan aktarın" },
    summary: { en: "CSV or Excel with crop, bed and date columns.", tr: "Ürün, yatak ve tarih sütunlu CSV ya da Excel." },
    keywords: { en: "csv excel xlsx upload history migrate", tr: "csv excel xlsx yükleme geçmiş taşıma içe aktarma" },
    minutes: 4,
    updated: "2026-10-02",
    helpful: 97,
    intro: { en: "Importing history lets the rotation planner warn you before you plant tomatoes in last year’s tomato bed.", tr: "Geçmişi aktarmak, münavebe planlayıcısının sizi geçen yılın domates yatağına tekrar domates dikmeden önce uyarmasını sağlar." },
    steps: [
      { en: "On the web planner, open Plot → Import history.", tr: "Web planlayıcıda Parsel → Geçmişi içe aktar’ı açın." },
      { en: "Drop a .csv or .xlsx file. The first row must hold column names.", tr: "Bir .csv ya da .xlsx dosyası bırakın. İlk satır sütun adlarını içermeli." },
      { en: "Match your columns to Crop, Bed and Sown on. Extra columns become notes.", tr: "Sütunlarınızı Ürün, Yatak ve Ekim tarihi ile eşleştirin. Fazla sütunlar not olur." },
      { en: "Review the preview and press Import. Rows Loam can’t read are listed for you to fix.", tr: "Önizlemeyi kontrol edip İçe aktar’a basın. Loam’un okuyamadığı satırlar düzeltmeniz için listelenir." },
    ],
    tip: { en: "Crop names in Turkish and English are both recognised.", tr: "Ürün adları hem Türkçe hem İngilizce tanınır." },
  },
  {
    id: "sun-hours",
    category: "plots",
    title: { en: "Mark trees and walls so sun hours are right", tr: "Güneş saatleri doğru olsun diye ağaçları ve duvarları işaretleyin" },
    summary: { en: "Shade changes what Loam suggests for each bed.", tr: "Gölge, Loam’un her yatak için önerdiği ürünleri değiştirir." },
    keywords: { en: "shade shadow sun light fence hedge building", tr: "gölge güneş ışık çit duvar bina ağaç" },
    minutes: 3,
    updated: "2026-10-19",
    helpful: 254,
    intro: { en: "Loam estimates sun hours per bed from your compass direction and anything tall you mark around the plot.", tr: "Loam her yatağın güneş saatini pusula yönünüzden ve parselin çevresine işaretlediğiniz yüksek nesnelerden hesaplar." },
    steps: [
      { en: "Open the plot and tap the shade tool (the half-circle icon).", tr: "Parseli açın ve gölge aracına (yarım daire simgesi) dokunun." },
      { en: "Place a tree, wall or building and enter its rough height.", tr: "Bir ağaç, duvar ya da bina yerleştirin ve yaklaşık yüksekliğini girin." },
      { en: "Slide the date at the bottom to see shade in March, June and September.", tr: "Mart, Haziran ve Eylül’deki gölgeyi görmek için alttaki tarihi kaydırın." },
    ],
    tip: { en: "Leafy trees cast less shade before April — Loam accounts for that if you choose Deciduous.", tr: "Yapraklı ağaçlar Nisan’dan önce daha az gölge yapar — Yaprak döken’i seçerseniz Loam bunu hesaba katar." },
  },
  {
    id: "raised-beds",
    category: "plots",
    title: { en: "Add raised beds and containers", tr: "Yükseltilmiş yatak ve saksı ekleyin" },
    summary: { en: "Set depth so root crops are only suggested where they fit.", tr: "Kök bitkiler yalnızca sığdıkları yerde önerilsin diye derinliği ayarlayın." },
    keywords: { en: "pot planter container depth balcony", tr: "saksı kasa derinlik balkon teras" },
    minutes: 2,
    updated: "2026-08-30",
    helpful: 141,
    intro: { en: "Raised beds and containers are beds with a depth. Loam won’t suggest parsnips for a 20 cm box.", tr: "Yükseltilmiş yataklar ve saksılar derinliği olan yataklardır. Loam 20 cm’lik bir kasaya yaban havucu önermez." },
    steps: [
      { en: "Drag Raised bed or Container from the tray.", tr: "Tepsiden Yükseltilmiş yatak ya da Saksı’yı sürükleyin." },
      { en: "Enter the inside depth in centimetres.", tr: "İç derinliği santimetre olarak girin." },
      { en: "For containers, pick Indoor if it lives on a windowsill.", tr: "Saksı pencere kenarında duruyorsa İç mekân’ı seçin." },
    ],
    tip: { en: "Balcony gardeners: add the railing as a wall so wind exposure is counted.", tr: "Balkon bahçıvanları: rüzgâr etkisi hesaplansın diye korkuluğu duvar olarak ekleyin." },
  },
  {
    id: "move-bed",
    category: "plots",
    title: { en: "Resize or move a bed without losing plantings", tr: "Ekimleri kaybetmeden yatağı taşıyın ya da boyutlandırın" },
    summary: { en: "Plantings move with the bed; overlaps are flagged.", tr: "Ekimler yatakla birlikte taşınır; çakışmalar işaretlenir." },
    keywords: { en: "edit change drag resize relocate", tr: "düzenle değiştir sürükle taşı boyut" },
    minutes: 1,
    updated: "2026-07-11",
    helpful: 63,
    intro: { en: "Everything planted in a bed belongs to it, so moving the bed moves the plants.", tr: "Bir yatağa ekilen her şey ona aittir; yatağı taşımak bitkileri de taşır." },
    steps: [
      { en: "Long-press the bed until it lifts.", tr: "Yatak kalkana kadar uzun basın." },
      { en: "Drag it, or pull a corner to resize.", tr: "Sürükleyin ya da köşesinden çekerek boyutlandırın." },
      { en: "If plants no longer fit, Loam lists them so you can move them to another bed.", tr: "Bitkiler artık sığmıyorsa Loam onları listeler, başka bir yatağa taşıyabilirsiniz." },
    ],
    tip: { en: "Undo works for the last 20 changes, on phone and web.", tr: "Geri al, telefonda ve web’de son 20 değişiklik için çalışır." },
  },
  {
    id: "reminders",
    category: "calendar",
    title: { en: "Turn sowing reminders on or off", tr: "Ekim hatırlatmalarını açın ya da kapatın" },
    summary: { en: "Choose the day, the time and which crops remind you.", tr: "Günü, saati ve hangi ürünlerin hatırlatacağını seçin." },
    keywords: { en: "notification push alert email weekly digest", tr: "bildirim uyarı e-posta haftalık özet" },
    minutes: 2,
    updated: "2026-10-05",
    helpful: 176,
    intro: { en: "Reminders arrive once a week by default: what to sow, transplant and harvest in the next seven days.", tr: "Hatırlatmalar varsayılan olarak haftada bir gelir: önümüzdeki yedi günde neyin ekileceği, şaşırtılacağı ve hasat edileceği." },
    steps: [
      { en: "Open Settings → Reminders.", tr: "Ayarlar → Hatırlatmalar’ı açın." },
      { en: "Pick Weekly digest, Daily or Off.", tr: "Haftalık özet, Günlük ya da Kapalı’yı seçin." },
      { en: "Choose the day and time, for example Saturday 08:00.", tr: "Günü ve saati seçin, örneğin Cumartesi 08.00." },
      { en: "Under Crops, switch off the ones you don’t want reminders for.", tr: "Ürünler altında hatırlatma istemediklerinizi kapatın." },
    ],
    tip: { en: "Frost warnings are separate and always on while you have tender plants outside.", tr: "Don uyarıları ayrıdır ve dışarıda hassas bitkileriniz varken hep açıktır." },
  },
  {
    id: "frost-date",
    category: "calendar",
    title: { en: "Change your last frost date", tr: "Son don tarihinizi değiştirin" },
    summary: { en: "Every date in your calendar shifts with it.", tr: "Takviminizdeki her tarih onunla birlikte kayar." },
    keywords: { en: "frost cold spring date shift late early", tr: "don soğuk bahar tarih kaydır geç erken ayaz" },
    minutes: 2,
    updated: "2026-11-03",
    helpful: 529,
    intro: { en: "Loam guesses your last spring frost from 30 years of weather for your town. If you know your plot is colder, tell it.", tr: "Loam son bahar donunuzu ilçenizin 30 yıllık hava verisinden tahmin eder. Parselinizin daha soğuk olduğunu biliyorsanız söyleyin." },
    steps: [
      { en: "Open Calendar and tap the frost date at the top.", tr: "Takvim’i açın ve üstteki don tarihine dokunun." },
      { en: "Pick a new date, or move it by a number of days.", tr: "Yeni bir tarih seçin ya da gün sayısıyla kaydırın." },
      { en: "Check the preview: crops whose dates move are highlighted.", tr: "Önizlemeyi kontrol edin: tarihleri değişen ürünler vurgulanır." },
      { en: "Press Apply. Sowings you already logged stay where they are.", tr: "Uygula’ya basın. Kaydettiğiniz ekimler yerinde kalır." },
    ],
    tip: { en: "In a frost pocket or a valley, try two weeks later than the suggestion.", tr: "Don çukurunda ya da vadideyseniz öneriden iki hafta sonrasını deneyin." },
  },
  {
    id: "succession",
    category: "calendar",
    title: { en: "Plan succession sowing for lettuce and radish", tr: "Marul ve turp için ardışık ekim planlayın" },
    summary: { en: "Small sowings every two weeks instead of one glut.", tr: "Bir kerede bolluk yerine iki haftada bir küçük ekimler." },
    keywords: { en: "repeat interval continuous harvest salad", tr: "tekrar aralık sürekli hasat salata" },
    minutes: 3,
    updated: "2026-09-22",
    helpful: 133,
    intro: { en: "Succession sowing spreads a harvest out. Loam schedules the repeats and leaves room in the bed for each one.", tr: "Ardışık ekim hasadı zamana yayar. Loam tekrarları planlar ve her biri için yatakta yer bırakır." },
    steps: [
      { en: "Add the crop to a bed as usual.", tr: "Ürünü her zamanki gibi bir yatağa ekleyin." },
      { en: "Turn on Repeat and choose every 1, 2 or 3 weeks.", tr: "Tekrar’ı açın ve 1, 2 ya da 3 haftada bir seçin." },
      { en: "Set the last sowing date, or let Loam stop when it gets too hot.", tr: "Son ekim tarihini belirleyin ya da hava fazla ısınınca Loam’un durmasına izin verin." },
    ],
    tip: { en: "Two-week gaps suit most salad leaves; radish is happy with ten days.", tr: "Çoğu salata yaprağı için iki hafta uygundur; turp on günle yetinir." },
  },
  {
    id: "rotation",
    category: "soil",
    title: { en: "How the four-year rotation planner works", tr: "Dört yıllık münavebe planlayıcısı nasıl çalışır" },
    summary: { en: "Crop families move one bed along each year.", tr: "Ürün aileleri her yıl bir yatak ilerler." },
    keywords: { en: "rotate family brassica legume disease crop rotation", tr: "münavebe ekim nöbeti aile lahanagil baklagil hastalık" },
    minutes: 4,
    updated: "2026-10-12",
    helpful: 377,
    intro: { en: "Growing the same family in the same soil every year builds up pests and drains the same nutrients. The planner keeps families moving.", tr: "Aynı aileyi her yıl aynı toprakta yetiştirmek zararlıları biriktirir ve aynı besinleri tüketir. Planlayıcı aileleri hareket ettirir." },
    steps: [
      { en: "Open Soil → Rotation and choose 3 or 4 groups.", tr: "Toprak → Münavebe’yi açın ve 3 ya da 4 grup seçin." },
      { en: "Assign each bed to a group. Loam suggests a split by area.", tr: "Her yatağı bir gruba atayın. Loam alana göre bir bölüşüm önerir." },
      { en: "Next season, press Rotate: each group moves to the next bed.", tr: "Gelecek sezon Döndür’e basın: her grup bir sonraki yatağa geçer." },
      { en: "If you plant against the plan, the bed shows an amber warning with the reason.", tr: "Plana aykırı ekerseniz yatakta nedeniyle birlikte kehribar bir uyarı görünür." },
    ],
    tip: { en: "Perennials like asparagus and rhubarb sit outside the rotation — mark their beds Permanent.", tr: "Kuşkonmaz ve ravent gibi çok yıllıklar münavebe dışındadır — yataklarını Kalıcı olarak işaretleyin." },
  },
  {
    id: "soil-test",
    category: "soil",
    title: { en: "Log a soil test result", tr: "Toprak testi sonucu kaydedin" },
    summary: { en: "pH and N-P-K from a kit or a lab report.", tr: "Kitten ya da laboratuvar raporundan pH ve N-P-K." },
    keywords: { en: "ph nitrogen phosphorus potassium lab kit acid", tr: "ph azot fosfor potasyum laboratuvar kit asit" },
    minutes: 2,
    updated: "2026-06-18",
    helpful: 58,
    intro: { en: "A test per bed lets Loam flag crops that dislike your soil before you sow them.", tr: "Yatak başına bir test, Loam’un toprağınızı sevmeyen ürünleri ekmeden önce işaretlemesini sağlar." },
    steps: [
      { en: "Open the bed and choose Soil → Add test.", tr: "Yatağı açın ve Toprak → Test ekle’yi seçin." },
      { en: "Enter pH, and N, P and K as Low, Medium or High.", tr: "pH’ı, N, P ve K’yi Düşük, Orta ya da Yüksek olarak girin." },
      { en: "Add the date and, if you like, a photo of the report.", tr: "Tarihi ve isterseniz raporun fotoğrafını ekleyin." },
    ],
    tip: { en: "Test in autumn: there’s time to add lime or compost before spring.", tr: "Sonbaharda test edin: bahardan önce kireç ya da kompost eklemeye zaman olur." },
  },
  {
    id: "invite",
    category: "household",
    title: { en: "Invite someone to your household", tr: "Hanenize birini davet edin" },
    summary: { en: "Share plots, the calendar and the harvest log.", tr: "Parselleri, takvimi ve hasat günlüğünü paylaşın." },
    keywords: { en: "share family partner add member invite people", tr: "paylaş aile ortak üye ekle davet kişi" },
    minutes: 2,
    updated: "2026-10-24",
    helpful: 301,
    intro: { en: "A household shares plots, reminders and the harvest log. Everyone keeps their own account and settings.", tr: "Bir hane parselleri, hatırlatmaları ve hasat günlüğünü paylaşır. Herkes kendi hesabını ve ayarlarını korur." },
    steps: [
      { en: "Open Settings → Household → Invite.", tr: "Ayarlar → Hane → Davet et’i açın." },
      { en: "Enter their email or share the invite link (valid for 7 days).", tr: "E-postasını girin ya da davet bağlantısını paylaşın (7 gün geçerli)." },
      { en: "Choose Editor or Viewer. You can change it later.", tr: "Düzenleyici ya da İzleyici seçin. Sonra değiştirebilirsiniz." },
    ],
    tip: { en: "Free accounts can share one plot with up to 2 people; Plus has no limit.", tr: "Ücretsiz hesaplar bir parseli en fazla 2 kişiyle paylaşabilir; Plus’ta sınır yok." },
  },
  {
    id: "roles",
    category: "household",
    title: { en: "Who can edit what in a shared plot", tr: "Paylaşılan parselde kim neyi düzenleyebilir" },
    summary: { en: "Owner, Editor and Viewer, side by side.", tr: "Sahip, Düzenleyici ve İzleyici yan yana." },
    keywords: { en: "permission role owner editor viewer access", tr: "izin rol sahip düzenleyici izleyici erişim yetki" },
    minutes: 2,
    updated: "2026-08-07",
    helpful: 84,
    intro: { en: "Roles are per plot, so your allotment partner can edit the allotment without touching your balcony.", tr: "Roller parsel başınadır; hobi bahçesi ortağınız balkonunuza dokunmadan bahçeyi düzenleyebilir." },
    steps: [
      { en: "Owner: everything, including deleting the plot and changing roles.", tr: "Sahip: parseli silmek ve rolleri değiştirmek dahil her şey." },
      { en: "Editor: beds, plantings, notes and the harvest log.", tr: "Düzenleyici: yataklar, ekimler, notlar ve hasat günlüğü." },
      { en: "Viewer: sees everything and gets reminders, changes nothing.", tr: "İzleyici: her şeyi görür ve hatırlatma alır, hiçbir şeyi değiştirmez." },
    ],
    tip: { en: "Change roles from the plot’s menu → People.", tr: "Rolleri parselin menüsünden → Kişiler’den değiştirin." },
  },
  {
    id: "plus",
    category: "account",
    title: { en: "What Loam Plus adds, and how to cancel", tr: "Loam Plus neler ekler ve nasıl iptal edilir" },
    summary: { en: "€3 a month or €28 a year; cancel in two taps.", tr: "Ayda 3 € ya da yılda 28 €; iki dokunuşla iptal." },
    keywords: { en: "subscription price cancel refund upgrade plan premium invoice", tr: "abonelik fiyat iptal iade yükselt paket premium fatura" },
    minutes: 2,
    updated: "2026-11-01",
    helpful: 266,
    intro: { en: "Plus adds unlimited plots, households without limits, seed inventory and the rotation history beyond two years.", tr: "Plus sınırsız parsel, sınırsız hane, tohum envanteri ve iki yılı aşan münavebe geçmişi ekler." },
    steps: [
      { en: "Upgrade from Settings → Plan. Pay monthly (€3) or yearly (€28).", tr: "Ayarlar → Paket’ten yükseltin. Aylık (3 €) ya da yıllık (28 €) ödeyin." },
      { en: "To cancel, open Settings → Plan → Cancel Plus.", tr: "İptal için Ayarlar → Paket → Plus’ı iptal et’i açın." },
      { en: "Plus runs until the end of the period you paid for. Nothing is deleted after.", tr: "Plus ödediğiniz dönemin sonuna kadar sürer. Sonrasında hiçbir şey silinmez." },
    ],
    tip: { en: "Bought through your phone’s app store? Cancel there — we can’t reach those subscriptions.", tr: "Telefonunuzun uygulama mağazasından mı aldınız? Oradan iptal edin — o aboneliklere biz erişemiyoruz." },
  },
  {
    id: "export",
    category: "account",
    title: { en: "Export or delete all your data", tr: "Tüm verilerinizi dışa aktarın ya da silin" },
    summary: { en: "A ZIP of CSVs and photos, or a full deletion within 30 days.", tr: "CSV ve fotoğraflardan oluşan bir ZIP ya da 30 gün içinde tam silme." },
    keywords: { en: "download gdpr kvkk privacy remove account close", tr: "indir kvkk gizlilik kaldır hesap kapat sil" },
    minutes: 2,
    updated: "2026-09-30",
    helpful: 119,
    intro: { en: "Your plots and notes are yours. You can take them with you or remove them completely.", tr: "Parselleriniz ve notlarınız sizindir. Onları yanınızda götürebilir ya da tamamen silebilirsiniz." },
    steps: [
      { en: "Open Settings → Privacy → Export. We email a download link within an hour.", tr: "Ayarlar → Gizlilik → Dışa aktar’ı açın. Bir saat içinde indirme bağlantısı göndeririz." },
      { en: "To delete, choose Delete account and type DELETE to confirm.", tr: "Silmek için Hesabı sil’i seçin ve onaylamak için SİL yazın." },
      { en: "Everything is removed within 30 days, backups included.", tr: "Yedekler dahil her şey 30 gün içinde kaldırılır." },
    ],
    tip: { en: "Shared plots stay with the other household members unless you are the only owner.", tr: "Tek sahip siz değilseniz paylaşılan parseller diğer hane üyelerinde kalır." },
  },
];

export const popularIds = ["frost-date", "first-plot", "rotation", "invite", "plus"];

export const suggestions: L[] = [
  { en: "frost date", tr: "don tarihi" },
  { en: "invite", tr: "davet" },
  { en: "cancel Plus", tr: "Plus iptal" },
  { en: "raised bed", tr: "saksı" },
  { en: "export", tr: "dışa aktar" },
];

export const articleById = (id: string | null | undefined) => articles.find((a) => a.id === id);
export const categoryById = (id: string | null | undefined) => categories.find((c) => c.id === id);
export const articlesIn = (id: CategoryId) => articles.filter((a) => a.category === id);
