// Sample content for "Quiet Harbour Counselling", a fictional counselling practice in Moda, Kadıköy.
// Every human-readable field is `{ en, tr }`. No clinical claims, no outcomes, no client testimonials —
// sessions, fees, people and how privacy is handled.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Muted blue from the plan; SiteShell derives the four accent variables (contrast-checked). */
export const ACCENT = "#3B82F6";

/** Fictional numbers only. */
export const PHONE = "+902160000000";
export const EMAIL = "hello@quietharbour.example.com";
/** Where "Leave this site" goes: a neutral page, replacing this one in the history. */
export const EXIT_URL = "https://www.example.com/";

/** en-GB and tr-TR both use the 24-hour clock. */
export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const tl = (value: string | number, locale: SiteLocale) => createFormatter(intlOf(locale), { currency: "TRY" }).currency(value, "TRY", { currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

// ---------------------------------------------------------------- photos

export const photos = {
  sea: { ...unsplash("1500375592092-40eb2168fd21", 1200, 1600), focal: { x: 0.5, y: 0.55 }, alt: { en: "A low wave folding over in pale evening light", tr: "Soluk akşam ışığında kıvrılan alçak bir dalga" } },
  room: { ...unsplash("1586023492125-27b2c045efd7", 1400, 1750), focal: { x: 0.45, y: 0.6 }, alt: { en: "A yellow armchair in a white room with a floor lamp and a framed print", tr: "Ayaklı lamba ve çerçeveli bir baskının olduğu beyaz odada sarı bir koltuk" } },
  door: { ...unsplash("1513694203232-719a280e022f", 1400, 934), focal: { x: 0.3, y: 0.55 }, alt: { en: "A quiet grey room with a dark sofa, a potted tree and a white door left open", tr: "Koyu bir kanepe, saksıda bir ağaç ve aralık bırakılmış beyaz bir kapının olduğu sakin gri bir oda" } },
  lounge: { ...unsplash("1524758631624-e2822e304c36", 1600, 1067), alt: { en: "A light waiting room with soft chairs and tall windows", tr: "Yumuşak koltuklu, yüksek pencereli aydınlık bir bekleme odası" } },
};

// ---------------------------------------------------------------- what people bring

export const concerns: { name: L; line: L }[] = [
  { name: { en: "Anxiety", tr: "Kaygı" }, line: { en: "The racing mind at 3 a.m., the dread before Monday.", tr: "Gece 3’te duramayan zihin, pazartesi öncesi o ağırlık." } },
  { name: { en: "Grief", tr: "Yas" }, line: { en: "A death, a diagnosis, a friendship that ended.", tr: "Bir ölüm, bir teşhis, biten bir dostluk." } },
  { name: { en: "Burnout", tr: "Tükenmişlik" }, line: { en: "When rest stopped working and work stopped meaning much.", tr: "Dinlenmenin işe yaramadığı, işin de anlamını yitirdiği zaman." } },
  { name: { en: "Relationships", tr: "İlişkiler" }, line: { en: "Partners, parents, the same argument on repeat.", tr: "Eşler, anne babalar, tekrar tekrar aynı tartışma." } },
  { name: { en: "Big changes", tr: "Büyük değişimler" }, line: { en: "A move, a new baby, a career you are leaving.", tr: "Bir taşınma, yeni bir bebek, bırakmakta olduğunuz bir kariyer." } },
  { name: { en: "Low mood", tr: "Çökkün ruh hâli" }, line: { en: "Grey weeks that have quietly become grey months.", tr: "Sessizce gri aylara dönüşmüş gri haftalar." } },
];

// ---------------------------------------------------------------- sessions & fees

export interface Session {
  id: string;
  name: L;
  minutes: number;
  fee: number;
  text: L;
}

export const sessions: Session[] = [
  { id: "individual", name: { en: "Individual session", tr: "Bireysel seans" }, minutes: 50, fee: 2400, text: { en: "Weekly or fortnightly, in Moda or online. Most people come for 12 to 20 sessions; some much longer.", tr: "Haftalık ya da iki haftada bir, Moda’da ya da çevrim içi. Çoğu kişi 12–20 seans gelir; bazıları çok daha uzun." } },
  { id: "couples", name: { en: "Couples session", tr: "Çift seansı" }, minutes: 80, fee: 3600, text: { en: "For two people who want to talk with a third in the room. Always in person, Tuesday to Saturday.", tr: "Odada üçüncü biriyle konuşmak isteyen iki kişi için. Her zaman yüz yüze, salıdan cumartesiye." } },
  { id: "online", name: { en: "Online session", tr: "Çevrim içi seans" }, minutes: 50, fee: 2200, text: { en: "By encrypted video, from anywhere in Türkiye. We send a link the morning of your session.", tr: "Şifreli görüntülü görüşmeyle, Türkiye’nin her yerinden. Bağlantıyı seans sabahı göndeririz." } },
  { id: "reduced", name: { en: "Reduced-fee place", tr: "İndirimli yer" }, minutes: 50, fee: 1200, text: { en: "Six places a week for students, people between jobs and anyone for whom the full fee is a barrier. No paperwork — just ask.", tr: "Öğrenciler, iş arayanlar ve tam ücretin engel olduğu herkes için haftada altı yer. Belge istemeyiz — sormanız yeter." } },
];

// ---------------------------------------------------------------- people

export interface Therapist {
  id: string;
  name: string;
  role: L;
  focus: L;
  bio: L;
  languages: L;
  photo: { src: string; width: number; height: number; alt: L };
}

export const team: Therapist[] = [
  {
    id: "aksoy",
    name: "Nil Aksoy",
    role: { en: "Psychotherapist, founder", tr: "Psikoterapist, kurucu" },
    focus: { en: "Grief · anxiety · adults over 40", tr: "Yas · kaygı · 40 yaş üstü yetişkinler" },
    bio: { en: "Trained in integrative psychotherapy and worked in hospital bereavement services for nine years before opening Quiet Harbour in 2017.", tr: "Bütünleyici psikoterapi eğitimi aldı; 2017’de Quiet Harbour’ı açmadan önce dokuz yıl hastane yas destek birimlerinde çalıştı." },
    languages: { en: "Turkish, English", tr: "Türkçe, İngilizce" },
    photo: { ...unsplash("1438761681033-6461ffad8d80", 800, 1000), alt: { en: "Nil Aksoy, auburn hair, by a lake", tr: "Kızıl saçlı Nil Aksoy, bir gölün kıyısında" } },
  },
  {
    id: "demirel",
    name: "Can Demirel",
    role: { en: "Counselling psychologist", tr: "Psikolojik danışman" },
    focus: { en: "Couples · men’s groups · burnout", tr: "Çiftler · erkek grupları · tükenmişlik" },
    bio: { en: "Works with couples and with people whose job has taken over. Runs the Thursday evening group. Former secondary-school teacher.", tr: "Çiftlerle ve işi hayatını ele geçirmiş kişilerle çalışır. Perşembe akşamı grubunu yürütür. Eski ortaokul öğretmeni." },
    languages: { en: "Turkish, English, German", tr: "Türkçe, İngilizce, Almanca" },
    photo: { ...unsplash("1500648767791-00dcc994a43e", 800, 1000), alt: { en: "Can Demirel, smiling, in a grey jumper", tr: "Gri kazaklı, gülümseyen Can Demirel" } },
  },
  {
    id: "ucar",
    name: "Ayla Uçar",
    role: { en: "Psychotherapist", tr: "Psikoterapist" },
    focus: { en: "Young adults · life changes · low mood", tr: "Genç yetişkinler · yaşam değişiklikleri · çökkün ruh hâli" },
    bio: { en: "Sees young adults and people in the middle of a big change. Holds most of the reduced-fee places and the online evening sessions.", tr: "Genç yetişkinlerle ve büyük bir değişimin ortasındaki kişilerle çalışır. İndirimli yerlerin ve akşam çevrim içi seansların çoğunu o üstlenir." },
    languages: { en: "Turkish, English", tr: "Türkçe, İngilizce" },
    photo: { ...unsplash("1573496359142-b8d87734a5a2", 800, 1000), alt: { en: "Ayla Uçar in a grey blazer, seated by a window", tr: "Gri ceketli Ayla Uçar, bir pencerenin yanında oturuyor" } },
  },
];

// ---------------------------------------------------------------- contact form (the signature)

export type Channel = "email" | "phone" | "text";
export const CHANNELS: Channel[] = ["email", "phone", "text"];
export const channelNames: Record<Channel, L> = {
  email: { en: "Email", tr: "E-posta" },
  phone: { en: "Phone call", tr: "Telefon araması" },
  text: { en: "Text message", tr: "Kısa mesaj" },
};

export const topics: { id: string; label: L }[] = [
  ...concerns.map((c, i) => ({ id: ["anxiety", "grief", "burnout", "relationships", "change", "mood"][i]!, label: c.name })),
  { id: "unsure", label: { en: "Not sure yet", tr: "Henüz emin değilim" } },
];

export const times: { id: string; label: L }[] = [
  { id: "weekday-day", label: { en: "Weekdays, before 17:00", tr: "Hafta içi, 17:00’den önce" } },
  { id: "weekday-evening", label: { en: "Weekday evenings", tr: "Hafta içi akşamları" } },
  { id: "saturday", label: { en: "Saturdays", tr: "Cumartesi" } },
];

/** Every string the contact page uses. */
export const form = {
  crumb: { en: "Contact", tr: "İletişim" },
  title: { en: "Tell us *only what you want to*", tr: "Yalnızca *istediğiniz kadarını* anlatın" },
  lead: {
    en: "Two things are needed: a name (any name) and one way to reach you. Everything else is optional, and the panel beside the form shows exactly what we will receive before you send it.",
    tr: "Yalnızca iki şey gerekli: bir ad (herhangi bir ad) ve size ulaşabileceğimiz bir yol. Gerisi isteğe bağlı; formun yanındaki panel, göndermeden önce tam olarak neyi alacağımızı gösterir.",
  },
  exit: { en: "Leave this site", tr: "Bu siteden çık" },
  exitHint: { en: "Opens a neutral page and replaces this one in your history.", tr: "Nötr bir sayfa açar ve bu sayfayı geçmişinizde onunla değiştirir." },
  s1: { en: "How should we reach you?", tr: "Size nasıl ulaşalım?" },
  s2: { en: "What should we call you?", tr: "Size nasıl hitap edelim?" },
  s3: { en: "Anything you would like to share", tr: "Paylaşmak istedikleriniz" },
  s3hint: { en: "All optional. You can say everything in person instead.", tr: "Hepsi isteğe bağlı. Her şeyi yüz yüze de anlatabilirsiniz." },
  channel: { en: "Contact by", tr: "İletişim yolu" },
  email: { en: "Email address", tr: "E-posta adresi" },
  phone: { en: "Phone number", tr: "Telefon numarası" },
  voicemail: { en: "We may leave a voicemail", tr: "Sesli mesaj bırakabiliriz" },
  voicemailHint: { en: "Off: we only speak to you directly and hang up on anyone else.", tr: "Kapalı: yalnızca sizinle konuşur, başkası açarsa kapatırız." },
  sayName: { en: "We may say “Quiet Harbour” when we get in touch", tr: "Ulaştığımızda “Quiet Harbour” adını söyleyebiliriz" },
  sayNameHint: { en: "Off: emails come from “N. Aksoy” with the subject “Your enquiry”, calls from a private number.", tr: "Kapalı: e-postalar “N. Aksoy” adıyla “Talebiniz” konusuyla, aramalar gizli numaradan gelir." },
  name: { en: "Name", tr: "Ad" },
  nameHint: { en: "A first name, a nickname or initials are fine.", tr: "İlk adınız, bir takma ad ya da baş harfleriniz yeterli." },
  topics: { en: "What would you like help with?", tr: "Ne konuda destek istersiniz?" },
  when: { en: "When could you come?", tr: "Ne zaman gelebilirsiniz?" },
  therapist: { en: "Who would you like to see?", tr: "Kiminle görüşmek istersiniz?" },
  anyone: { en: "Whoever is free first", tr: "İlk müsait olan" },
  inPerson: { en: "I would rather explain in person", tr: "Yüz yüze anlatmayı tercih ederim" },
  message: { en: "A few words, if you like", tr: "İsterseniz birkaç kelime" },
  messageHint: { en: "Please do not include medical history or other people’s names.", tr: "Lütfen tıbbi geçmiş ya da başkalarının adlarını yazmayın." },
  autofill: { en: "Autofill is off on this form, so nothing you type is saved in this browser.", tr: "Bu formda otomatik doldurma kapalı; yazdıklarınız bu tarayıcıda saklanmaz." },
  consent: { en: "Use these details to reply to me, then delete them after 30 days if I don’t start sessions.", tr: "Bu bilgileri bana yanıt vermek için kullanın; seanslara başlamazsam 30 gün sonra silin." },
  send: { en: "Send privately", tr: "Gizlice gönder" },
  required: { en: "Please fill this in.", tr: "Lütfen doldurun." },
  badEmail: { en: "That email address looks incomplete.", tr: "Bu e-posta adresi eksik görünüyor." },
  badPhone: { en: "Please enter a full phone number.", tr: "Lütfen tam bir telefon numarası girin." },
  needConsent: { en: "Please tick so we may reply.", tr: "Yanıt verebilmemiz için lütfen işaretleyin." },
  fix: { en: "Two things are needed before we can reply.", tr: "Yanıt verebilmemiz için iki şey gerekli." },
  // receipt panel
  rTitle: { en: "What we will receive", tr: "Bize ulaşacaklar" },
  rLead: { en: "Updated as you type. Nothing leaves this page until you press send.", tr: "Siz yazdıkça güncellenir. Gönder’e basana kadar hiçbir şey bu sayfadan çıkmaz." },
  sent: { en: "Sent", tr: "Gönderilir" },
  notSent: { en: "Not sent", tr: "Gönderilmez" },
  rName: { en: "Name", tr: "Ad" },
  rContact: { en: "Contact", tr: "İletişim" },
  rRules: { en: "How we contact you", tr: "Size nasıl ulaşırız" },
  rTopics: { en: "Topics", tr: "Konular" },
  rTimes: { en: "Times", tr: "Zamanlar" },
  rTherapist: { en: "Therapist", tr: "Terapist" },
  rMessage: { en: "Message", tr: "Mesaj" },
  chars: { en: "{n} characters", tr: "{n} karakter" },
  voiceYes: { en: "voicemail ok", tr: "sesli mesaj olur" },
  voiceNo: { en: "no voicemail", tr: "sesli mesaj yok" },
  nameYes: { en: "our name ok", tr: "adımız söylenebilir" },
  nameNo: { en: "discreet sender", tr: "gizli gönderici" },
  never: { en: "Never collected here", tr: "Burada hiç istenmez" },
  neverList: { en: "Surname · date of birth · address · ID number · diagnoses · medication", tr: "Soyadı · doğum tarihi · adres · kimlik numarası · teşhisler · ilaçlar" },
  readBy: { en: "Read only by Elif Sarp, our intake coordinator, Monday to Saturday. Stored in an encrypted mailbox in Türkiye and deleted after 30 days unless you start sessions.", tr: "Yalnızca kabul koordinatörümüz Elif Sarp tarafından, pazartesiden cumartesiye okunur. Türkiye’deki şifreli bir posta kutusunda saklanır; seanslara başlamazsanız 30 gün sonra silinir." },
  noTracking: { en: "No analytics, pixels or chat widgets run on this page.", tr: "Bu sayfada analiz aracı, piksel ya da sohbet balonu çalışmaz." },
  // done
  doneTitle: { en: "Received — thank you", tr: "Ulaştı — teşekkürler" },
  doneText: { en: "{name}, Elif will {how} within one working day, {rule}. Your reference is {ref}; you won’t need it, but it helps if you call.", tr: "{name}, Elif bir iş günü içinde {how}, {rule}. Referansınız {ref}; gerekmez ama ararsanız işe yarar." },
  howEmail: { en: "email you", tr: "size e-posta gönderecek" },
  howPhone: { en: "call you", tr: "sizi arayacak" },
  howText: { en: "text you", tr: "size mesaj atacak" },
  ruleDiscreet: { en: "without mentioning Quiet Harbour", tr: "Quiet Harbour adını anmadan" },
  ruleOpen: { en: "as Quiet Harbour", tr: "Quiet Harbour adıyla" },
  clear: { en: "Clear this page", tr: "Bu sayfayı temizle" },
  clearHint: { en: "Removes what you typed from the screen.", tr: "Yazdıklarınızı ekrandan kaldırır." },
  urgentTitle: { en: "If you are not safe right now", tr: "Şu an güvende değilseniz" },
  urgentText: { en: "We are not an emergency service and we read messages in working hours. Please call 112 or go to the nearest emergency department.", tr: "Acil servis değiliz ve mesajları mesai saatlerinde okuruz. Lütfen 112’yi arayın ya da en yakın acil servise gidin." },
  otherTitle: { en: "Other ways in", tr: "Diğer yollar" },
};

// ---------------------------------------------------------------- place

export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [{ open: "09:00", close: "21:00" }],
    tue: [{ open: "09:00", close: "21:00" }],
    wed: [{ open: "09:00", close: "21:00" }],
    thu: [{ open: "09:00", close: "21:00" }],
    fri: [{ open: "09:00", close: "19:00" }],
    sat: [{ open: "10:00", close: "16:00" }],
    sun: [],
  },
};

const streetSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f2f3f5'/>" +
  "<path d='M0 640 C220 600 420 700 640 660 S1000 560 1200 600 L1200 900 L0 900Z' fill='#dfe5ee'/>" +
  "<g fill='#e5e7eb'>" +
  Array.from({ length: 20 }, (_, i) => `<rect x='${(i % 5) * 230 + 30}' y='${Math.floor(i / 5) * 140 + 30}' width='196' height='112' rx='8'/>`).join("") +
  "</g><path d='M-20 590 C300 560 600 620 1220 540' fill='none' stroke='#ffffff' stroke-width='22' stroke-linecap='round'/>" +
  "<path d='M560 -20 C540 220 600 420 570 620' fill='none' stroke='#ffffff' stroke-width='16' stroke-linecap='round'/></svg>";
export const streetMap = { src: `data:image/svg+xml,${encodeURIComponent(streetSvg)}`, width: 1200, height: 900, alt: "" };

export function branch(t: (v: Localized<string>) => string): Branch {
  return {
    name: "Quiet Harbour Counselling",
    address: { line: "Yelken Sokak 7, Kat 2", district: "Moda", city: "Kadıköy", region: "İstanbul", postalCode: "34710", country: "TR", geo: { lat: 40.9819, lng: 29.0257 } },
    phone: PHONE,
    email: EMAIL,
    hours,
    mapImage: streetMap,
    notes: t({
      en: "Second floor, no sign on the street door — ring “QH”. Two rooms have their own exit so you never pass the waiting room after a session.",
      tr: "İkinci kat, sokak kapısında tabela yok — “QH” zilini çalın. İki odanın ayrı çıkışı var; seans sonrası bekleme odasından geçmezsiniz.",
    }),
  };
}

export const approach = {
  crumb: { en: "Approach", tr: "Yaklaşım" },
  title: { en: "How therapy works *here*", tr: "Burada terapi *nasıl işler*" },
  lead: {
    en: "No programme to follow and no homework unless you want it. Fifty minutes, the same room, the same person, at the same time each week — and a door you can close.",
    tr: "Uyulacak bir program yok; istemedikçe ödev de yok. Elli dakika, aynı oda, aynı kişi, her hafta aynı saat — ve kapatabileceğiniz bir kapı.",
  },
};
