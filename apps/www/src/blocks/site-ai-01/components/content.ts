// Sample content for "Quill", a fictional writing assistant for teams. Every human-readable field
// is `Localized` ({ en, tr }) and resolved with `pickLocale`. Numbers stay numbers and are
// formatted per locale with the kit formatter. Brand, people, numbers and domains are fictional.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

export const ACCENT = "#FB7185";
export const PHONE = "+902160000000";
export const EMAIL = "hello@quill.example.com";
export const SECURITY_EMAIL = "security@quill.example.com";

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-US";
  const f = createFormatter(intl, { currency: "USD", timeZone: "Europe/Istanbul" });
  return {
    locale,
    t,
    f,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

export const USD = (amount: string) => ({ amount, currency: "USD" });

/* ------------------------------------------------------------------ */
/* Signature: the scripted typing demo                                  */
/* ------------------------------------------------------------------ */

export type Tone = "plain" | "warm" | "brief";
export const tones: { id: Tone; label: L; hint: L }[] = [
  { id: "plain", label: { en: "Plain", tr: "Sade" }, hint: { en: "Facts first, no filler", tr: "Önce bilgi, dolgu yok" } },
  { id: "warm", label: { en: "Warm", tr: "Sıcak" }, hint: { en: "Same facts, kinder edges", tr: "Aynı bilgi, daha nazik" } },
  { id: "brief", label: { en: "Brief", tr: "Kısa" }, hint: { en: "Fits in a chat message", tr: "Tek mesaja sığar" } },
];

export interface DemoScenario {
  id: string;
  label: L;
  /** Who it goes to — shown above the draft. */
  to: L;
  draft: L;
  out: Record<Tone, L>;
  /** What Quill changed, per tone. */
  notes: Record<Tone, L[]>;
}

export const scenarios: DemoScenario[] = [
  {
    id: "scope",
    label: { en: "Say no to a client", tr: "Müşteriye hayır demek" },
    to: { en: "To: Mara Lindqvist, client", tr: "Kime: Defne Aral, müşteri" },
    draft: {
      en: "Hi Mara, I just wanted to quickly follow up on the call. I think maybe we could possibly look at adding the export feature, but it’s kind of a big change and honestly I’m not totally sure it fits in the current sprint. Let me know what you think, sorry for the back and forth!",
      tr: "Merhaba Defne Hanım, görüşmeyle ilgili kısaca dönmek istedim. Sanırım dışa aktarma özelliğini belki eklemeye bakabiliriz ama aslında biraz büyük bir değişiklik ve açıkçası bu sprint’e sığar mı tam emin değilim. Ne düşündüğünüzü bana iletirseniz sevinirim, gidip gelmeler için kusura bakmayın!",
    },
    out: {
      plain: {
        en: "Hi Mara — we can’t add the export feature to this sprint. It touches billing and reporting, which is about two weeks of work. Two options: ship it in sprint 14 (starts 2 December), or swap it for the bulk-edit screen. Which do you prefer?",
        tr: "Merhaba Defne Hanım, dışa aktarma özelliğini bu sprint’e ekleyemiyoruz. Faturalama ve raporlamaya dokunuyor; yaklaşık iki haftalık iş. İki seçenek var: 14. sprint’te (2 Aralık’ta başlıyor) çıkaralım ya da toplu düzenleme ekranıyla yer değiştirelim. Hangisini tercih edersiniz?",
      },
      warm: {
        en: "Hi Mara, thanks for the call — the export idea is a good one. It won’t fit this sprint without pushing the launch, so I’d suggest we plan it for sprint 14, starting 2 December. If it can’t wait, we could swap it for bulk edit. Happy to talk it through on Thursday.",
        tr: "Merhaba Defne Hanım, görüşme için teşekkürler — dışa aktarma fikri gerçekten iyi. Lansmanı kaydırmadan bu sprint’e sığmıyor; bu yüzden 2 Aralık’ta başlayan 14. sprint’e almayı öneririm. Bekleyemiyorsa toplu düzenlemeyle yer değiştirebiliriz. Perşembe konuşmaktan memnuniyet duyarım.",
      },
      brief: {
        en: "Mara — export won’t fit this sprint (about two weeks of work). Sprint 14 from 2 December, or swap it for bulk edit? Your call.",
        tr: "Defne Hanım, dışa aktarma bu sprint’e sığmıyor (yaklaşık iki hafta). 2 Aralık’taki 14. sprint mi, yoksa toplu düzenlemeyle takas mı? Karar sizin.",
      },
    },
    notes: {
      plain: [
        { en: "The answer moved to the first sentence", tr: "Cevap ilk cümleye taşındı" },
        { en: "“Big change” became “two weeks of work”", tr: "“Büyük değişiklik” → “iki haftalık iş”" },
        { en: "Ends with one question she can answer", tr: "Cevaplanabilir tek bir soruyla bitiyor" },
      ],
      warm: [
        { en: "Opens with thanks, keeps the no", tr: "Teşekkürle açılıyor, “hayır” korunuyor" },
        { en: "Apology removed — nothing to apologise for", tr: "Özür çıkarıldı — özür gerektiren bir şey yok" },
        { en: "Offers a time to talk", tr: "Konuşmak için zaman öneriyor" },
      ],
      brief: [
        { en: "Two options, one line each", tr: "İki seçenek, her biri tek satır" },
        { en: "Greeting cut for a chat thread", tr: "Sohbet için selamlama kısaltıldı" },
      ],
    },
  },
  {
    id: "incident",
    label: { en: "Post an incident update", tr: "Kesinti bildirimi yazmak" },
    to: { en: "To: #customers-status", tr: "Kime: #musteri-durum" },
    draft: {
      en: "So basically the sync thing was down for a while this morning, we’re not 100% sure why yet but it seems like maybe the queue got stuck? Anyway it’s working again now I think. We’ll probably look into it more and maybe send something later.",
      tr: "Yani aslında senkron olayı bu sabah bir süre çalışmadı, nedenini henüz tam bilmiyoruz ama galiba kuyruk takıldı gibi? Neyse, sanırım şimdi tekrar çalışıyor. Muhtemelen biraz daha inceleyip belki sonra bir şey göndeririz.",
    },
    out: {
      plain: {
        en: "Calendar sync was down from 07:12 to 08:04 (52 minutes). A stuck job queue stopped new events from syncing; no data was lost. Sync is working again and the 3,140 delayed events have been delivered. We’ll publish the root cause by Friday, 15 November.",
        tr: "Takvim senkronu 07.12 ile 08.04 arasında (52 dakika) çalışmadı. Takılan bir iş kuyruğu yeni etkinliklerin senkronunu durdurdu; veri kaybı yok. Senkron yeniden çalışıyor ve geciken 3.140 etkinlik iletildi. Kök nedeni 15 Kasım Cuma’ya kadar yayımlayacağız.",
      },
      warm: {
        en: "Sorry — calendar sync was down this morning, 07:12–08:04. A stuck job queue held back new events; nothing was lost, and all 3,140 delayed events have now arrived. We know this broke a few morning plans. The full write-up follows by Friday.",
        tr: "Özür dileriz — takvim senkronu bu sabah 07.12–08.04 arasında çalışmadı. Takılan bir iş kuyruğu yeni etkinlikleri bekletti; hiçbir şey kaybolmadı ve geciken 3.140 etkinliğin tamamı ulaştı. Bunun bazı sabah planlarını bozduğunu biliyoruz. Ayrıntılı rapor Cuma’ya kadar gelecek.",
      },
      brief: {
        en: "Sync outage 07:12–08:04, stuck queue. No data lost; 3,140 delayed events delivered. Root cause by Fri 15 Nov.",
        tr: "Senkron kesintisi 07.12–08.04, kuyruk takıldı. Veri kaybı yok; geciken 3.140 etkinlik iletildi. Kök neden 15 Kasım Cuma.",
      },
    },
    notes: {
      plain: [
        { en: "Exact times from the incident log", tr: "Kesinti kaydından kesin saatler" },
        { en: "4 hedges removed (“I think”, “maybe”…)", tr: "4 kaçamak ifade çıkarıldı (“sanırım”, “belki”…)" },
        { en: "A date for the follow-up, not “later”", tr: "“Sonra” yerine net bir tarih" },
      ],
      warm: [
        { en: "Apologises once, at the start", tr: "Bir kez, en başta özür diliyor" },
        { en: "Names the impact on people", tr: "İnsanlara etkisini söylüyor" },
        { en: "Keeps every number from the plain version", tr: "Sade sürümdeki tüm sayıları koruyor" },
      ],
      brief: [
        { en: "Status-page length: under 25 words", tr: "Durum sayfası uzunluğu: 25 kelimenin altında" },
        { en: "Facts only, in the order people ask", tr: "Yalnızca bilgi, sorulma sırasıyla" },
      ],
    },
  },
  {
    id: "release",
    label: { en: "Write a release note", tr: "Sürüm notu yazmak" },
    to: { en: "To: changelog, v4.2", tr: "Kime: değişiklik günlüğü, v4.2" },
    draft: {
      en: "We made a bunch of improvements to search!! It’s way faster now and also you can search in comments which a lot of people asked for. Also fixed some bugs. Hope you like it :)",
      tr: "Aramada bir sürü iyileştirme yaptık!! Artık çok daha hızlı ve ayrıca birçok kişinin istediği gibi yorumlarda da arama yapabiliyorsunuz. Bir de bazı hataları düzelttik. Umarız beğenirsiniz :)",
    },
    out: {
      plain: {
        en: "Search is faster and now covers comments. Results load in about 120 ms, down from 900 ms, and comment text is indexed from today. We also fixed 6 bugs, including filters resetting when you went back.",
        tr: "Arama daha hızlı ve artık yorumları da kapsıyor. Sonuçlar 900 ms yerine yaklaşık 120 ms’de geliyor; yorum metinleri bugünden itibaren dizinleniyor. Geri dönünce filtrelerin sıfırlanması dahil 6 hatayı da düzelttik.",
      },
      warm: {
        en: "You asked, so search now looks inside comments too — and it got quicker while we were at it: results in about 120 ms instead of 900. Six small bugs are gone as well, including filters resetting when you went back.",
        tr: "Siz istediniz, arama artık yorumların içine de bakıyor — bu arada hızlandı da: sonuçlar 900 yerine yaklaşık 120 ms’de. Geri dönünce filtrelerin sıfırlanması dahil altı küçük hata da gitti.",
      },
      brief: {
        en: "Search: about 7× faster (120 ms) and now includes comments. Plus 6 bug fixes.",
        tr: "Arama: yaklaşık 7 kat hızlı (120 ms) ve artık yorumları da içeriyor. Ayrıca 6 hata düzeltmesi.",
      },
    },
    notes: {
      plain: [
        { en: "“Way faster” became a number", tr: "“Çok daha hızlı” bir sayıya dönüştü" },
        { en: "“Some bugs” became “6 bugs”, with one example", tr: "“Bazı hatalar” → “6 hata”, bir örnekle" },
        { en: "Exclamation marks and emoticon dropped", tr: "Ünlemler ve ifade simgesi kaldırıldı" },
      ],
      warm: [
        { en: "Credits the people who asked", tr: "İsteyenlere hakkını veriyor" },
        { en: "Numbers kept, tone softened", tr: "Sayılar korundu, ton yumuşadı" },
      ],
      brief: [
        { en: "Fits a push notification", tr: "Bir bildirime sığıyor" },
        { en: "Headline first, details after the colon", tr: "Önce başlık, iki noktadan sonra ayrıntı" },
      ],
    },
  },
];

/** Hedge words Quill counts in the demo (case-insensitive, whole words). */
export const hedges: Record<SiteLocale, string[]> = {
  en: ["just", "maybe", "i think", "possibly", "kind of", "sort of", "basically", "probably", "honestly", "anyway", "seems like", "a bunch", "way"],
  tr: ["sanırım", "belki", "aslında", "galiba", "biraz", "muhtemelen", "açıkçası", "neyse", "yani", "gibi", "bir sürü"],
};

/* ------------------------------------------------------------------ */
/* Use cases: one sentence before and after                             */
/* ------------------------------------------------------------------ */

export const useCases: { team: L; before: L; after: L; stat: L }[] = [
  {
    team: { en: "Support", tr: "Destek" },
    before: { en: "We apologise for any inconvenience this may have caused.", tr: "Yaşanmış olabilecek herhangi bir aksaklıktan dolayı özür dileriz." },
    after: { en: "Your refund of $48.00 went out today; it shows within 3 working days.", tr: "48,00 $ iadeniz bugün gönderildi; 3 iş günü içinde görünür." },
    stat: { en: "First replies 31% shorter", tr: "İlk yanıtlar %31 daha kısa" },
  },
  {
    team: { en: "Engineering", tr: "Mühendislik" },
    before: { en: "This PR does some refactoring and also fixes the thing from yesterday.", tr: "Bu PR biraz yeniden düzenleme yapıyor ve dünkü sorunu da düzeltiyor." },
    after: { en: "Fixes the double charge on retried payments (#2214). Moves retry logic into one module.", tr: "Yeniden denenen ödemelerdeki çift tahsilatı düzeltir (#2214). Yeniden deneme mantığını tek modüle taşır." },
    stat: { en: "Review comments down 22%", tr: "İnceleme yorumları %22 azaldı" },
  },
  {
    team: { en: "Sales", tr: "Satış" },
    before: { en: "Just circling back to see if you had a chance to look at my last email?", tr: "Son e-postama bakma fırsatınız oldu mu diye tekrar yazmak istedim?" },
    after: { en: "The pilot price of $9 per seat holds until 30 November. Shall I send the order form?", tr: "Koltuk başına 9 $ pilot fiyatı 30 Kasım’a kadar geçerli. Sipariş formunu göndereyim mi?" },
    stat: { en: "Reply rate up from 11% to 17%", tr: "Yanıt oranı %11’den %17’ye" },
  },
  {
    team: { en: "People ops", tr: "İK" },
    before: { en: "Please be advised that the policy has been updated effective immediately.", tr: "Politikanın derhal geçerli olmak üzere güncellendiğini bilgilerinize sunarız." },
    after: { en: "From 1 December you can work abroad for up to 30 days a year. Here’s how to ask.", tr: "1 Aralık’tan itibaren yılda 30 güne kadar yurt dışından çalışabilirsiniz. Nasıl talep edeceğiniz burada." },
    stat: { en: "Policy questions to HR halved", tr: "İK’ya gelen politika soruları yarıya indi" },
  },
];

/* ------------------------------------------------------------------ */
/* Integrations (generic, unbranded)                                    */
/* ------------------------------------------------------------------ */

export const integrations: { id: string; name: L; how: L }[] = [
  { id: "mail", name: { en: "Desktop and web mail", tr: "Masaüstü ve web e-posta" }, how: { en: "Add-in", tr: "Eklenti" } },
  { id: "docs", name: { en: "Document editors", tr: "Belge düzenleyiciler" }, how: { en: "Side panel", tr: "Yan panel" } },
  { id: "chat", name: { en: "Team chat", tr: "Ekip sohbeti" }, how: { en: "Slash command", tr: "Eğik çizgi komutu" } },
  { id: "desk", name: { en: "Help desks", tr: "Destek masaları" }, how: { en: "Reply macro", tr: "Yanıt makrosu" } },
  { id: "code", name: { en: "Code review", tr: "Kod incelemesi" }, how: { en: "PR description bot", tr: "PR açıklama botu" } },
  { id: "web", name: { en: "Any text field", tr: "Her metin alanı" }, how: { en: "Browser extension", tr: "Tarayıcı eklentisi" } },
  { id: "wiki", name: { en: "Wikis and handbooks", tr: "Wiki ve el kitapları" }, how: { en: "Style check on publish", tr: "Yayında üslup kontrolü" } },
  { id: "api", name: { en: "Your own tools", tr: "Kendi araçlarınız" }, how: { en: "REST API", tr: "REST API" } },
];

/* ------------------------------------------------------------------ */
/* FAQ                                                                  */
/* ------------------------------------------------------------------ */

export const faqHome: { q: L; a: L }[] = [
  {
    q: { en: "Does Quill write for me?", tr: "Quill benim yerime mi yazıyor?" },
    a: {
      en: "No. You write the draft; Quill rewrites it in the tone you pick and shows what it changed. Nothing is sent until you press send in your own app.",
      tr: "Hayır. Taslağı siz yazarsınız; Quill seçtiğiniz tonda yeniden yazar ve neyi değiştirdiğini gösterir. Kendi uygulamanızda gönder’e basana kadar hiçbir şey gitmez.",
    },
  },
  {
    q: { en: "Is my text used to train models?", tr: "Metinlerim model eğitiminde kullanılıyor mu?" },
    a: {
      en: "Never, on any plan. Text is processed in memory and discarded when the rewrite is returned, unless your admin turns on history (kept up to 30 days).",
      tr: "Hiçbir pakette, asla. Metin bellekte işlenir ve yeniden yazım döndüğünde silinir; yöneticiniz geçmişi açarsa en fazla 30 gün tutulur.",
    },
  },
  {
    q: { en: "Which languages does it handle?", tr: "Hangi dilleri destekliyor?" },
    a: {
      en: "English, Turkish, German, French, Spanish, Dutch and Portuguese — including rewriting from one into another while keeping your house style.",
      tr: "İngilizce, Türkçe, Almanca, Fransızca, İspanyolca, Felemenkçe ve Portekizce — kurum üslubunuzu koruyarak birinden diğerine yeniden yazım dahil.",
    },
  },
  {
    q: { en: "Can we teach it our house style?", tr: "Kendi kurum üslubumuzu öğretebilir miyiz?" },
    a: {
      en: "On Team and Organisation plans you upload a style guide and a list of banned phrases. Quill flags them in every draft and explains the rule.",
      tr: "Ekip ve Kurum paketlerinde bir üslup kılavuzu ve yasaklı ifadeler listesi yüklersiniz. Quill bunları her taslakta işaretler ve kuralı açıklar.",
    },
  },
  {
    q: { en: "What happens when the trial ends?", tr: "Deneme bitince ne oluyor?" },
    a: {
      en: "You drop to the free Draft plan: 40 rewrites a month, no card needed. Nothing is deleted and your style guide stays in place.",
      tr: "Ücretsiz Taslak paketine geçersiniz: ayda 40 yeniden yazım, kart gerekmez. Hiçbir şey silinmez, üslup kılavuzunuz yerinde kalır.",
    },
  },
];

export const faqPricing: { q: L; a: L }[] = [
  {
    q: { en: "What counts as a rewrite?", tr: "Bir yeniden yazım neyi kapsar?" },
    a: {
      en: "One press of Rewrite on up to 1,500 words. Switching the tone of the same draft within 10 minutes is free.",
      tr: "1.500 kelimeye kadar bir metinde Yeniden yaz’a bir kez basmak. Aynı taslağın tonunu 10 dakika içinde değiştirmek ücretsizdir.",
    },
  },
  {
    q: { en: "Do you charge for inactive seats?", tr: "Pasif koltuklar ücretlendiriliyor mu?" },
    a: {
      en: "No. On Team, seats with no rewrites in a billing month are credited on the next invoice automatically.",
      tr: "Hayır. Ekip paketinde, bir fatura ayında hiç yeniden yazım yapmayan koltuklar bir sonraki faturada otomatik olarak düşülür.",
    },
  },
  {
    q: { en: "Can we pay by invoice in TRY?", tr: "TL fatura ile ödeyebilir miyiz?" },
    a: {
      en: "Yes, on Organisation plans: yearly invoice in TRY, EUR or USD, 30-day terms, e-Arşiv invoices for Turkish companies.",
      tr: "Evet, Kurum paketinde: TL, EUR ya da USD cinsinden yıllık fatura, 30 gün vade, Türkiye’deki şirketler için e-Arşiv fatura.",
    },
  },
  {
    q: { en: "Is there a discount for non-profits and schools?", tr: "Dernekler ve okullar için indirim var mı?" },
    a: {
      en: "50% off Team for registered non-profits and accredited schools. Email us with your registration number.",
      tr: "Kayıtlı dernekler ve akredite okullar için Ekip paketinde %50 indirim. Sicil numaranızla bize yazın.",
    },
  },
];

export const faqSecurity: { q: L; a: L }[] = [
  {
    q: { en: "Where is our text processed?", tr: "Metinlerimiz nerede işleniyor?" },
    a: {
      en: "In the region your admin picks: Frankfurt (EU) or Virginia (US). Text never leaves that region, including for support.",
      tr: "Yöneticinizin seçtiği bölgede: Frankfurt (AB) ya da Virginia (ABD). Metin, destek için bile olsa o bölgenin dışına çıkmaz.",
    },
  },
  {
    q: { en: "Can Quill staff read our drafts?", tr: "Quill çalışanları taslaklarımızı okuyabilir mi?" },
    a: {
      en: "No. With retention at zero there is nothing stored to read. With history on, access needs your written approval per ticket and is logged in your audit log.",
      tr: "Hayır. Saklama sıfırdayken okunacak bir şey yoktur. Geçmiş açıksa erişim, her talep için yazılı onayınızı gerektirir ve denetim kaydınıza düşer.",
    },
  },
  {
    q: { en: "Do you sign a DPA?", tr: "Veri işleme sözleşmesi imzalıyor musunuz?" },
    a: {
      en: "Yes. Our standard DPA (with EU SCCs and a KVKK annex) is signed in-app on Team; Organisation customers can send their own paper.",
      tr: "Evet. Standart sözleşmemiz (AB SCC’leri ve KVKK eki ile) Ekip paketinde uygulama içinden imzalanır; Kurum müşterileri kendi metinlerini gönderebilir.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Security page data                                                   */
/* ------------------------------------------------------------------ */

export const retention: { what: L; draft: L; team: L; org: L }[] = [
  { what: { en: "Draft and rewrite text", tr: "Taslak ve yeniden yazım metni" }, draft: { en: "Not stored", tr: "Saklanmaz" }, team: { en: "0–30 days, admin sets", tr: "0–30 gün, yönetici belirler" }, org: { en: "0–30 days or your own bucket", tr: "0–30 gün ya da kendi depolamanız" } },
  { what: { en: "Style guide and phrase lists", tr: "Üslup kılavuzu ve ifade listeleri" }, draft: { en: "—", tr: "—" }, team: { en: "Until you delete them", tr: "Siz silene kadar" }, org: { en: "Until you delete them", tr: "Siz silene kadar" } },
  { what: { en: "Usage counts (no text)", tr: "Kullanım sayıları (metinsiz)" }, draft: { en: "13 months", tr: "13 ay" }, team: { en: "13 months", tr: "13 ay" }, org: { en: "13 months", tr: "13 ay" } },
  { what: { en: "Audit log", tr: "Denetim kaydı" }, draft: { en: "—", tr: "—" }, team: { en: "1 year", tr: "1 yıl" }, org: { en: "Up to 7 years", tr: "7 yıla kadar" } },
];

export const subprocessors: { name: string; role: L; region: L }[] = [
  { name: "Lindenfeld Cloud GmbH", role: { en: "Hosting and inference (EU)", tr: "Barındırma ve çıkarım (AB)" }, region: { en: "Frankfurt, DE", tr: "Frankfurt, DE" } },
  { name: "Harbor Compute Inc.", role: { en: "Hosting and inference (US)", tr: "Barındırma ve çıkarım (ABD)" }, region: { en: "Virginia, US", tr: "Virginia, ABD" } },
  { name: "Postbox Mail Ltd.", role: { en: "Account email only, no draft text", tr: "Yalnızca hesap e-postaları, taslak metni yok" }, region: { en: "Dublin, IE", tr: "Dublin, IE" } },
  { name: "Kestrel Billing BV", role: { en: "Card payments and invoices", tr: "Kart ödemeleri ve faturalar" }, region: { en: "Amsterdam, NL", tr: "Amsterdam, NL" } },
];

export const policyJson = `{
  "region": "eu-central",
  "retention": {
    "drafts_days": 0,
    "audit_log_days": 365
  },
  "train_on_text": false,
  "sso": {
    "provider": "saml",
    "enforce": true
  },
  "blocked": [
    "personal-mail",
    "public-paste"
  ]
}`;
