// Sample content for "Ardent & Vale", a fictional business law firm in Istanbul.
// Every human-readable field is { en, tr } and resolved with `pickLocale`. Lawyers, matters,
// addresses and registry numbers are invented; photos are unbranded Unsplash images.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr } from "@vamos-ui/react/blocks";

export type SiteLocale = "en" | "tr";
/** A string in both languages. */
export type L = { en: string; tr: string };

export const PHONE = "+902160000000";
export const EMAIL = "office@example.com";

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  return {
    t,
    intl: locale === "tr" ? "tr-TR" : "en-GB",
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=72&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  library: { ...unsplash("1505664194779-8beaceb93744", 1200, 1500), alt: { en: "The firm’s library: tall shelves of law reports and two marble busts", tr: "Büronun kütüphanesi: hukuk dergileriyle dolu yüksek raflar ve iki mermer büst" } },
  signing: { ...unsplash("1450101499163-c8848c66ca85", 1600, 1067), alt: { en: "A lawyer signing a contract at a desk", tr: "Masada bir sözleşmeyi imzalayan avukat" } },
  office: { ...unsplash("1497366811353-6870744d04b2", 1600, 1067), alt: { en: "A quiet meeting room with long tables and tall windows", tr: "Uzun masaları ve yüksek pencereleri olan sakin bir toplantı odası" } },
  columns: { ...unsplash("1453945619913-79ec89a82c51", 1600, 1067), alt: { en: "Stone columns of a courthouse under a clear sky", tr: "Açık gökyüzü altında bir adliyenin taş sütunları" } },
};

export interface Lawyer {
  id: string;
  name: string;
  role: L;
  /** Bar admissions, newest last. */
  admissions: L;
  bio: L;
  photo?: { src: string; width: number; height: number };
  partner: boolean;
}

const portrait = (id: string) => unsplash(id, 800, 1000);

export const lawyers: Lawyer[] = [
  {
    id: "ardent",
    name: "Defne Ardent",
    role: { en: "Managing partner · Corporate & M&A", tr: "Yönetici ortak · Şirketler ve birleşme-devralma" },
    admissions: { en: "Istanbul Bar, 2004 · LL.M., 2007", tr: "İstanbul Barosu, 2004 · LL.M., 2007" },
    bio: {
      en: "Defne founded the firm in 2011 after nine years in transactional practice. She has led more than 60 acquisitions and joint ventures, most of them for family-owned groups selling to or partnering with foreign investors.",
      tr: "Defne, işlem odaklı avukatlıkta geçen dokuz yılın ardından büroyu 2011’de kurdu. Çoğu yabancı yatırımcıya satış yapan ya da onlarla ortaklık kuran aile şirketleri adına 60’tan fazla devralma ve ortak girişimi yönetti.",
    },
    photo: portrait("1544005313-94ddf0286df2"),
    partner: true,
  },
  {
    id: "vale",
    name: "Thomas Vale",
    role: { en: "Partner · Disputes & arbitration", tr: "Ortak · Uyuşmazlıklar ve tahkim" },
    admissions: { en: "Solicitor (England & Wales), 2006 · Registered foreign lawyer, Istanbul Bar, 2013", tr: "Solicitor (İngiltere ve Galler), 2006 · Kayıtlı yabancı avukat, İstanbul Barosu, 2013" },
    bio: {
      en: "Thomas acts as counsel in commercial arbitrations under ISTAC, ICC and LCIA rules and sits as arbitrator in construction and energy disputes. He co-founded the firm’s disputes group in 2013.",
      tr: "Thomas ISTAC, ICC ve LCIA kurallarına tabi ticari tahkimlerde vekil olarak görev alıyor; inşaat ve enerji uyuşmazlıklarında hakemlik yapıyor. Büronun uyuşmazlık grubunu 2013’te birlikte kurdu.",
    },
    photo: portrait("1472099645785-5658abf4ff4e"),
    partner: true,
  },
  {
    id: "sarigul",
    name: "Ece Sarıgül",
    role: { en: "Partner · Employment", tr: "Ortak · İş hukuku" },
    admissions: { en: "Istanbul Bar, 2009", tr: "İstanbul Barosu, 2009" },
    bio: {
      en: "Ece advises employers on restructurings, collective agreements and senior-executive exits, and defends them before labour courts. She mediates under the Labour Courts Act.",
      tr: "Ece işverenlere yeniden yapılanma, toplu sözleşme ve üst düzey yönetici ayrılıkları konusunda danışmanlık veriyor ve onları iş mahkemelerinde temsil ediyor. İş Mahkemeleri Kanunu kapsamında arabuluculuk yapıyor.",
    },
    photo: portrait("1494790108377-be9c29b29330"),
    partner: true,
  },
  {
    id: "aydin",
    name: "Kerem Aydın",
    role: { en: "Partner · Competition & regulatory", tr: "Ortak · Rekabet ve regülasyon" },
    admissions: { en: "Ankara Bar, 2008 · Istanbul Bar, 2015", tr: "Ankara Barosu, 2008 · İstanbul Barosu, 2015" },
    bio: {
      en: "Kerem spent six years at a regulator before joining the firm. He handles merger filings, dawn-raid response and compliance programmes for retail, logistics and payments companies.",
      tr: "Kerem büroya katılmadan önce altı yıl bir düzenleyici kurumda çalıştı. Perakende, lojistik ve ödeme şirketleri için birleşme bildirimleri, yerinde inceleme müdahalesi ve uyum programlarını yürütüyor.",
    },
    photo: portrait("1500648767791-00dcc994a43e"),
    partner: true,
  },
  {
    id: "okan",
    name: "Nil Okan",
    role: { en: "Counsel · Data protection & technology", tr: "Kıdemli danışman · Kişisel veriler ve teknoloji" },
    admissions: { en: "Istanbul Bar, 2012 · CIPP/E", tr: "İstanbul Barosu, 2012 · CIPP/E" },
    bio: {
      en: "Nil advises software and e-commerce companies on KVKK and GDPR, data transfers, and SaaS and licensing terms.",
      tr: "Nil yazılım ve e-ticaret şirketlerine KVKK ve GDPR, yurt dışına veri aktarımı, SaaS ve lisans koşulları konusunda danışmanlık veriyor.",
    },
    photo: portrait("1611432579699-484f7990b127"),
    partner: false,
  },
  {
    id: "yilmaz",
    name: "Baran Yılmaz",
    role: { en: "Senior associate · Commercial contracts", tr: "Kıdemli avukat · Ticari sözleşmeler" },
    admissions: { en: "Istanbul Bar, 2016", tr: "İstanbul Barosu, 2016" },
    bio: {
      en: "Baran drafts and negotiates distribution, agency and supply agreements, in Turkish and English.",
      tr: "Baran dağıtım, acentelik ve tedarik sözleşmelerini Türkçe ve İngilizce hazırlıyor ve müzakere ediyor.",
    },
    photo: portrait("1507003211169-0a1dd7228f2d"),
    partner: false,
  },
];

/** Associates shown as a typographic list on the team page. */
export const associates: { name: string; role: L; admissions: L }[] = [
  { name: "Zeynep Kılınç", role: { en: "Associate · Corporate & M&A", tr: "Avukat · Şirketler ve birleşme-devralma" }, admissions: { en: "Istanbul Bar, 2019", tr: "İstanbul Barosu, 2019" } },
  { name: "Arda Demirel", role: { en: "Associate · Disputes & arbitration", tr: "Avukat · Uyuşmazlıklar ve tahkim" }, admissions: { en: "Istanbul Bar, 2020", tr: "İstanbul Barosu, 2020" } },
  { name: "Melis Tunç", role: { en: "Associate · Employment", tr: "Avukat · İş hukuku" }, admissions: { en: "Istanbul Bar, 2021", tr: "İstanbul Barosu, 2021" } },
  { name: "Hugo Brenner", role: { en: "Associate · Competition", tr: "Avukat · Rekabet" }, admissions: { en: "Rechtsanwalt (Frankfurt), 2018 · registered foreign lawyer, 2023", tr: "Rechtsanwalt (Frankfurt), 2018 · kayıtlı yabancı avukat, 2023" } },
  { name: "Selin Ateş", role: { en: "Associate · Data protection", tr: "Avukat · Kişisel veriler" }, admissions: { en: "Istanbul Bar, 2022", tr: "İstanbul Barosu, 2022" } },
];

export interface Practice {
  id: string;
  no: string;
  title: L;
  short: L;
  lead: L;
  /** Lawyer id. */
  head: string;
  facts: { team: number; languages: string; typical: L };
  scope: { title: L; text: L }[];
  matters: { year: string; text: L; value?: L }[];
  faq: { q: L; a: L }[];
}

export const practices: Practice[] = [
  {
    id: "corporate",
    no: "01",
    title: { en: "Corporate & M&A", tr: "Şirketler ve birleşme-devralma" },
    short: { en: "Acquisitions, joint ventures and shareholder agreements for founders, families and funds.", tr: "Kurucular, aileler ve fonlar için devralmalar, ortak girişimler ve pay sahipleri sözleşmeleri." },
    lead: {
      en: "We advise on the sale, purchase and restructuring of businesses — most often family-owned groups bringing in a foreign investor for the first time. One partner runs each deal from term sheet to closing.",
      tr: "İşletmelerin satışı, satın alınması ve yeniden yapılandırılması konusunda danışmanlık veriyoruz — çoğunlukla ilk kez yabancı yatırımcı alan aile şirketlerine. Her işlemi, ön protokolden kapanışa kadar tek bir ortak yürütür.",
    },
    head: "ardent",
    facts: { team: 8, languages: "TR · EN · DE", typical: { en: "12–20 weeks, signing to closing", tr: "İmzadan kapanışa 12–20 hafta" } },
    scope: [
      { title: { en: "Share and asset deals", tr: "Pay ve varlık devirleri" }, text: { en: "Due diligence, SPA negotiation, conditions precedent and closing mechanics.", tr: "Hukuki inceleme, pay devir sözleşmesi müzakeresi, ön koşullar ve kapanış mekanizması." } },
      { title: { en: "Joint ventures", tr: "Ortak girişimler" }, text: { en: "Structure, governance, deadlock and exit clauses that still work in year seven.", tr: "Yedinci yılda da işleyen yapı, yönetim, kilitlenme ve çıkış hükümleri." } },
      { title: { en: "Shareholder agreements", tr: "Pay sahipleri sözleşmeleri" }, text: { en: "Family constitutions, drag and tag rights, articles of association that match them.", tr: "Aile anayasaları, birlikte satış hakları ve bunlarla uyumlu esas sözleşmeler." } },
      { title: { en: "Venture rounds", tr: "Girişim sermayesi turları" }, text: { en: "Seed to Series B for Turkish companies with offshore holding structures.", tr: "Yurt dışı holding yapısı olan Türk şirketleri için tohum aşamasından B serisine." } },
    ],
    matters: [
      { year: "2026", text: { en: "Advised a family-owned logistics group on the sale of a 60% stake to a European infrastructure fund.", tr: "Aile şirketi olan bir lojistik grubuna, %60 payının bir Avrupa altyapı fonuna satışında danışmanlık verdik." }, value: { en: "€140 million", tr: "140 milyon €" } },
      { year: "2025", text: { en: "Acted for the founders of a payments start-up in a Series B round led by a Gulf investor.", tr: "Bir ödeme girişiminin kurucularını, bir Körfez yatırımcısının liderliğindeki B serisi turunda temsil ettik." }, value: { en: "$38 million", tr: "38 milyon $" } },
      { year: "2024", text: { en: "Structured a 50/50 joint venture between a Turkish textile maker and a Dutch retailer.", tr: "Bir Türk tekstil üreticisi ile Hollandalı bir perakendeci arasında 50/50 ortak girişim kurduk." } },
    ],
    faq: [
      { q: { en: "Do you work on a fixed fee?", tr: "Sabit ücretle çalışıyor musunuz?" }, a: { en: "For most transactions, yes: a fixed fee per phase (due diligence, negotiation, closing), agreed in the engagement letter before work starts.", tr: "İşlemlerin çoğunda evet: her aşama için (hukuki inceleme, müzakere, kapanış) iş başlamadan önce vekâlet sözleşmesinde belirlenen sabit bir ücret." } },
      { q: { en: "Can you act for the buyer and the seller?", tr: "Hem alıcıyı hem satıcıyı temsil edebilir misiniz?" }, a: { en: "No. We run a conflict check before the first substantive call and act for one side only.", tr: "Hayır. İlk esaslı görüşmeden önce çıkar çatışması kontrolü yapar ve yalnızca bir tarafı temsil ederiz." } },
    ],
  },
  {
    id: "disputes",
    no: "02",
    title: { en: "Disputes & arbitration", tr: "Uyuşmazlıklar ve tahkim" },
    short: { en: "Commercial litigation and international arbitration, from the first letter to enforcement.", tr: "İlk ihtarnameden icraya kadar ticari davalar ve uluslararası tahkim." },
    lead: {
      en: "Most disputes are won or lost in the first month: in the letters, the evidence that is kept and the deadlines that are met. We start with a written assessment of your chances and the likely cost, and update it at every stage.",
      tr: "Çoğu uyuşmazlık ilk ayda kazanılır ya da kaybedilir: yazışmalarda, saklanan delillerde ve kaçırılmayan sürelerde. İşe başarı şansınızın ve olası maliyetin yazılı bir değerlendirmesiyle başlar, her aşamada güncelleriz.",
    },
    head: "vale",
    facts: { team: 6, languages: "TR · EN", typical: { en: "Arbitration: 14–24 months to award", tr: "Tahkim: karara 14–24 ay" } },
    scope: [
      { title: { en: "International arbitration", tr: "Uluslararası tahkim" }, text: { en: "ISTAC, ICC and LCIA proceedings, as counsel or arbitrator.", tr: "ISTAC, ICC ve LCIA yargılamaları; vekil ya da hakem olarak." } },
      { title: { en: "Commercial courts", tr: "Ticaret mahkemeleri" }, text: { en: "Shareholder disputes, distribution terminations, construction claims.", tr: "Pay sahibi uyuşmazlıkları, dağıtım sözleşmesi feshi, inşaat alacakları." } },
      { title: { en: "Interim relief", tr: "İhtiyati tedbir" }, text: { en: "Injunctions and attachments, often within 48 hours.", tr: "İhtiyati tedbir ve haciz kararları; çoğu zaman 48 saat içinde." } },
      { title: { en: "Enforcement", tr: "Tanıma ve tenfiz" }, text: { en: "Recognition of foreign judgments and awards in Türkiye.", tr: "Yabancı mahkeme ve hakem kararlarının Türkiye’de tanınması." } },
    ],
    matters: [
      { year: "2026", text: { en: "Represented an energy contractor in an ICC arbitration over delay damages on a power plant.", tr: "Bir enerji yüklenicisini, bir santraldeki gecikme tazminatına ilişkin ICC tahkiminde temsil ettik." }, value: { en: "$62 million claim", tr: "62 milyon $ talep" } },
      { year: "2025", text: { en: "Obtained an attachment within 36 hours for a supplier against an insolvent distributor.", tr: "Bir tedarikçi için iflas eden distribütöre karşı 36 saat içinde haciz kararı aldık." } },
      { year: "2024", text: { en: "Enforced a London-seated award against assets of a Turkish counterparty.", tr: "Londra merkezli bir hakem kararını Türk karşı tarafın varlıkları üzerinde tenfiz ettirdik." }, value: { en: "£11 million", tr: "11 milyon £" } },
    ],
    faq: [
      { q: { en: "Do you take cases on a success fee?", tr: "Başarı ücretiyle dava alıyor musunuz?" }, a: { en: "Sometimes, within the limits of the Attorneys’ Act: a reduced hourly or fixed fee plus a share of what is recovered.", tr: "Bazen, Avukatlık Kanunu’nun sınırları içinde: indirimli saatlik ya da sabit ücret artı tahsil edilen tutardan bir pay." } },
      { q: { en: "How quickly can you start?", tr: "Ne kadar hızlı başlayabilirsiniz?" }, a: { en: "For interim relief, the same day. Send what you have; we will tell you within two hours what else we need.", tr: "İhtiyati tedbir için aynı gün. Elinizdekini gönderin; iki saat içinde başka neye ihtiyacımız olduğunu söyleriz." } },
    ],
  },
  {
    id: "employment",
    no: "03",
    title: { en: "Employment", tr: "İş hukuku" },
    short: { en: "Restructurings, senior exits, collective agreements and labour-court defence.", tr: "Yeniden yapılanmalar, üst düzey ayrılıklar, toplu sözleşmeler ve iş mahkemesi savunması." },
    lead: {
      en: "We advise employers only. The work ranges from one difficult exit to closing a plant with 400 people, and almost always starts before the first meeting with the employee.",
      tr: "Yalnızca işverenlere danışmanlık veriyoruz. İşler tek bir zor ayrılıktan 400 kişilik bir tesisin kapatılmasına kadar uzanıyor ve neredeyse her zaman çalışanla ilk görüşmeden önce başlıyor.",
    },
    head: "sarigul",
    facts: { team: 5, languages: "TR · EN", typical: { en: "Senior exit: 2–6 weeks", tr: "Üst düzey ayrılık: 2–6 hafta" } },
    scope: [
      { title: { en: "Restructurings", tr: "Yeniden yapılanmalar" }, text: { en: "Collective dismissals, transfers of undertaking, consultation timelines.", tr: "Toplu işten çıkarmalar, işyeri devirleri, bildirim ve görüşme takvimleri." } },
      { title: { en: "Senior executives", tr: "Üst düzey yöneticiler" }, text: { en: "Contracts, non-competes that hold up, settlement agreements.", tr: "Sözleşmeler, geçerli rekabet yasakları, ibraname ve sulh sözleşmeleri." } },
      { title: { en: "Collective labour", tr: "Toplu iş hukuku" }, text: { en: "Union recognition, collective bargaining, strikes and lockouts.", tr: "Sendika yetkisi, toplu pazarlık, grev ve lokavt." } },
      { title: { en: "Labour courts", tr: "İş mahkemeleri" }, text: { en: "Mandatory mediation and defence of reinstatement and severance claims.", tr: "Zorunlu arabuluculuk; işe iade ve kıdem tazminatı davalarında savunma." } },
    ],
    matters: [
      { year: "2026", text: { en: "Advised a manufacturer on the consolidation of two plants affecting 410 employees, with no reinstatement claims upheld.", tr: "Bir üreticiye 410 çalışanı etkileyen iki tesisin birleştirilmesinde danışmanlık verdik; kabul edilen işe iade davası olmadı." } },
      { year: "2025", text: { en: "Negotiated the exit of a regional CEO, including a 12-month non-compete.", tr: "Bir bölge CEO’sunun 12 aylık rekabet yasağı dahil ayrılığını müzakere ettik." } },
      { year: "2024", text: { en: "Concluded the first collective agreement at a logistics company with 1,200 drivers.", tr: "1.200 sürücüsü olan bir lojistik şirketinde ilk toplu iş sözleşmesini imzaladık." } },
    ],
    faq: [
      { q: { en: "Do you represent employees?", tr: "Çalışanları temsil ediyor musunuz?" }, a: { en: "No, only employers. We are happy to recommend colleagues who act for employees.", tr: "Hayır, yalnızca işverenleri. Çalışanları temsil eden meslektaşlarımızı memnuniyetle önerebiliriz." } },
      { q: { en: "Can you train our HR team?", tr: "İK ekibimize eğitim verebilir misiniz?" }, a: { en: "Yes. A half-day session on dismissals and documentation is included for clients on a retainer.", tr: "Evet. Sürekli danışmanlık müvekkillerimiz için işten çıkarma ve belgeleme üzerine yarım günlük bir oturum dahildir." } },
    ],
  },
  {
    id: "competition",
    no: "04",
    title: { en: "Competition & regulatory", tr: "Rekabet ve regülasyon" },
    short: { en: "Merger control, investigations, dawn raids and compliance programmes.", tr: "Birleşme kontrolü, soruşturmalar, yerinde incelemeler ve uyum programları." },
    lead: {
      en: "We file mergers, defend investigations and build compliance programmes that sales teams actually follow. Our 24-hour dawn-raid line is answered by a lawyer, not a switchboard.",
      tr: "Birleşme bildirimlerini yapıyor, soruşturmalarda savunma yürütüyor ve satış ekiplerinin gerçekten uyduğu uyum programları kuruyoruz. 24 saatlik yerinde inceleme hattımızı bir santral değil, bir avukat yanıtlar.",
    },
    head: "aydin",
    facts: { team: 4, languages: "TR · EN · DE", typical: { en: "Phase I clearance: 30 days from complete filing", tr: "I. aşama izin: tam bildirimden itibaren 30 gün" } },
    scope: [
      { title: { en: "Merger control", tr: "Birleşme kontrolü" }, text: { en: "Thresholds, filings and remedies, alongside the deal timetable.", tr: "Eşikler, bildirimler ve taahhütler; işlem takvimiyle birlikte." } },
      { title: { en: "Investigations", tr: "Soruşturmalar" }, text: { en: "Defence in cartel and abuse-of-dominance cases, settlement and commitments.", tr: "Kartel ve hâkim durumun kötüye kullanılması dosyalarında savunma, uzlaşma ve taahhüt." } },
      { title: { en: "Dawn raids", tr: "Yerinde incelemeler" }, text: { en: "On site within 90 minutes in Istanbul; mock raids for your team.", tr: "İstanbul’da 90 dakika içinde yerinde; ekibiniz için tatbikat." } },
      { title: { en: "Compliance", tr: "Uyum" }, text: { en: "Policies, training and pricing-communication reviews for sales teams.", tr: "Satış ekipleri için politikalar, eğitim ve fiyat iletişimi incelemeleri." } },
    ],
    matters: [
      { year: "2026", text: { en: "Cleared the acquisition of a regional grocery chain in Phase I with no remedies.", tr: "Bölgesel bir market zincirinin devralınmasına I. aşamada, taahhütsüz izin aldık." } },
      { year: "2025", text: { en: "Defended a payments company in an abuse-of-dominance investigation closed with commitments.", tr: "Bir ödeme şirketini, taahhütle kapanan hâkim durumun kötüye kullanılması soruşturmasında savunduk." } },
      { year: "2024", text: { en: "Responded to an unannounced inspection at a logistics company’s head office.", tr: "Bir lojistik şirketinin genel merkezindeki habersiz yerinde incelemeye müdahale ettik." } },
    ],
    faq: [
      { q: { en: "Does our deal need a filing?", tr: "İşlemimiz bildirim gerektirir mi?" }, a: { en: "Send us both parties’ Turkish and worldwide turnover for the last financial year; we answer within two working days, free of charge.", tr: "Tarafların son mali yıla ait Türkiye ve dünya cirolarını gönderin; iki iş günü içinde ücretsiz yanıt veririz." } },
      { q: { en: "What should reception do during a raid?", tr: "Yerinde inceleme sırasında resepsiyon ne yapmalı?" }, a: { en: "Let the officials in, call our line, and do not delete anything. We send every client a one-page card for the front desk.", tr: "Yetkilileri içeri alın, hattımızı arayın ve hiçbir şey silmeyin. Her müvekkile resepsiyon için tek sayfalık bir kart göndeririz." } },
    ],
  },
  {
    id: "data",
    no: "05",
    title: { en: "Data protection & technology", tr: "Kişisel veriler ve teknoloji" },
    short: { en: "KVKK and GDPR, data transfers, SaaS terms and incident response.", tr: "KVKK ve GDPR, veri aktarımları, SaaS koşulları ve ihlal müdahalesi." },
    lead: {
      en: "We help software and e-commerce companies use data lawfully without burying their product in consent screens: privacy notices people can read, transfer mechanisms that survive an audit, contracts that match how the product really works.",
      tr: "Yazılım ve e-ticaret şirketlerinin, ürünlerini onay ekranlarına gömmeden verileri hukuka uygun kullanmasına yardımcı oluyoruz: okunabilen aydınlatma metinleri, denetimden geçen aktarım mekanizmaları, ürünün gerçekte nasıl çalıştığıyla uyumlu sözleşmeler.",
    },
    head: "okan",
    facts: { team: 3, languages: "TR · EN", typical: { en: "Compliance review: 4–6 weeks", tr: "Uyum incelemesi: 4–6 hafta" } },
    scope: [
      { title: { en: "KVKK and GDPR programmes", tr: "KVKK ve GDPR programları" }, text: { en: "Records of processing, notices, VERBİS registration, retention policies.", tr: "İşleme envanteri, aydınlatma metinleri, VERBİS kaydı, saklama ve imha politikaları." } },
      { title: { en: "Data transfers", tr: "Veri aktarımları" }, text: { en: "Standard contracts and notifications for transfers abroad.", tr: "Yurt dışına aktarım için standart sözleşmeler ve bildirimler." } },
      { title: { en: "Technology contracts", tr: "Teknoloji sözleşmeleri" }, text: { en: "SaaS, licensing, development and data-processing agreements.", tr: "SaaS, lisans, yazılım geliştirme ve veri işleme sözleşmeleri." } },
      { title: { en: "Incidents", tr: "İhlaller" }, text: { en: "72-hour breach notifications and regulator correspondence.", tr: "72 saatlik ihlal bildirimleri ve kurulla yazışmalar." } },
    ],
    matters: [
      { year: "2026", text: { en: "Built the KVKK programme of a marketplace with 3 million users ahead of its Series C.", tr: "3 milyon kullanıcılı bir pazaryerinin KVKK programını C serisi turundan önce kurduk." } },
      { year: "2025", text: { en: "Handled the breach notification and regulator inquiry for a SaaS provider; closed with no fine.", tr: "Bir SaaS sağlayıcısının ihlal bildirimini ve kurul incelemesini yürüttük; idari para cezası olmadan kapandı." } },
      { year: "2024", text: { en: "Negotiated enterprise SaaS terms for a Turkish software company’s first EU bank client.", tr: "Bir Türk yazılım şirketinin ilk AB’li banka müşterisi için kurumsal SaaS koşullarını müzakere ettik." } },
    ],
    faq: [
      { q: { en: "Do we need a data protection officer?", tr: "Veri koruma görevlisine ihtiyacımız var mı?" }, a: { en: "Under KVKK there is no DPO requirement, but a contact person is required for VERBİS. Under GDPR it depends on your processing; we will tell you in the first call.", tr: "KVKK’da veri koruma görevlisi zorunluluğu yoktur, ancak VERBİS için irtibat kişisi gerekir. GDPR’da işleme faaliyetinize bağlıdır; ilk görüşmede söyleriz." } },
      { q: { en: "Can you review our cookie banner?", tr: "Çerez bildirimimizi inceleyebilir misiniz?" }, a: { en: "Yes — a fixed-fee review with a marked-up screenshot and wording in both languages.", tr: "Evet — işaretlenmiş ekran görüntüsü ve iki dilde metinle sabit ücretli bir inceleme." } },
    ],
  },
  {
    id: "commercial",
    no: "06",
    title: { en: "Commercial contracts", tr: "Ticari sözleşmeler" },
    short: { en: "Distribution, agency, supply and franchise agreements in Turkish and English.", tr: "Türkçe ve İngilizce dağıtım, acentelik, tedarik ve franchise sözleşmeleri." },
    lead: {
      en: "We draft the contracts a business runs on, and the templates its teams can use without calling us. Every template comes with a one-page guide to what can and cannot be negotiated.",
      tr: "Bir işletmenin üzerinde döndüğü sözleşmeleri ve ekiplerinin bizi aramadan kullanabileceği şablonları hazırlıyoruz. Her şablonla birlikte neyin müzakere edilebilip neyin edilemeyeceğini anlatan tek sayfalık bir kılavuz gelir.",
    },
    head: "yilmaz",
    facts: { team: 4, languages: "TR · EN", typical: { en: "New template set: 3–5 weeks", tr: "Yeni şablon seti: 3–5 hafta" } },
    scope: [
      { title: { en: "Distribution and agency", tr: "Dağıtım ve acentelik" }, text: { en: "Exclusivity, territories, termination and portfolio compensation.", tr: "Münhasırlık, bölgeler, fesih ve denkleştirme tazminatı." } },
      { title: { en: "Supply and manufacturing", tr: "Tedarik ve üretim" }, text: { en: "Price adjustment, quality, liability caps and force majeure.", tr: "Fiyat uyarlaması, kalite, sorumluluk sınırları ve mücbir sebep." } },
      { title: { en: "Franchise", tr: "Franchise" }, text: { en: "Franchise packages for Turkish brands expanding abroad, and the reverse.", tr: "Yurt dışına açılan Türk markaları için franchise paketleri ve tersi." } },
      { title: { en: "Templates", tr: "Şablonlar" }, text: { en: "Standard terms, NDAs and order forms with negotiation guides.", tr: "Müzakere kılavuzlu genel koşullar, gizlilik sözleşmeleri ve sipariş formları." } },
    ],
    matters: [
      { year: "2026", text: { en: "Rebuilt the distribution network contracts of a household-appliance brand across 14 countries.", tr: "Bir beyaz eşya markasının 14 ülkedeki dağıtım ağı sözleşmelerini yeniden kurduk." } },
      { year: "2025", text: { en: "Negotiated a five-year supply agreement between a packaging maker and a dairy group.", tr: "Bir ambalaj üreticisi ile bir süt ürünleri grubu arasında beş yıllık tedarik sözleşmesini müzakere ettik." } },
      { year: "2024", text: { en: "Wrote the franchise package for a coffee chain opening in Germany and the Netherlands.", tr: "Almanya ve Hollanda’da şube açan bir kahve zinciri için franchise paketini hazırladık." } },
    ],
    faq: [
      { q: { en: "Do you review contracts the other side sends?", tr: "Karşı tarafın gönderdiği sözleşmeleri inceliyor musunuz?" }, a: { en: "Yes. Most reviews come back within three working days with a marked-up draft and a short list of points worth fighting for.", tr: "Evet. İncelemelerin çoğu, işaretlenmiş bir taslak ve uğruna mücadele etmeye değer maddelerin kısa listesiyle üç iş günü içinde döner." } },
      { q: { en: "Which law should our contract choose?", tr: "Sözleşmemiz hangi hukuku seçmeli?" }, a: { en: "It depends on where you would enforce it. We explain the trade-off in a short note before drafting.", tr: "Nerede icra edeceğinize bağlı. Taslağa başlamadan önce kısa bir notla avantaj ve dezavantajları açıklarız." } },
    ],
  },
];

export const insights: { title: L; excerpt: L; date: string; minutes: number; category: L; href: string }[] = [
  {
    title: { en: "The new merger-control thresholds: what changes for 2027 deals", tr: "Yeni birleşme kontrolü eşikleri: 2027 işlemleri için neler değişiyor" },
    excerpt: { en: "Higher turnover thresholds will take many mid-size deals out of the filing regime — but not technology targets.", tr: "Yükselen ciro eşikleri birçok orta ölçekli işlemi bildirim rejiminin dışına çıkaracak — ama teknoloji şirketlerini değil." },
    date: "2026-10-28",
    minutes: 6,
    category: { en: "Competition", tr: "Rekabet" },
    href: "https://example.com/insights/merger-thresholds-2027",
  },
  {
    title: { en: "Non-competes after the 2026 Court of Cassation rulings", tr: "2026 Yargıtay kararlarından sonra rekabet yasakları" },
    excerpt: { en: "Three rulings narrowed what a reasonable restriction looks like. A checklist for contracts signed this year.", tr: "Üç karar makul bir sınırlamanın kapsamını daralttı. Bu yıl imzalanan sözleşmeler için bir kontrol listesi." },
    date: "2026-09-15",
    minutes: 8,
    category: { en: "Employment", tr: "İş hukuku" },
    href: "https://example.com/insights/non-competes-2026",
  },
  {
    title: { en: "Transfers abroad under KVKK, one year on", tr: "KVKK’da yurt dışına aktarım, bir yıl sonra" },
    excerpt: { en: "What the regulator has asked for in standard-contract notifications, and the mistakes we see most.", tr: "Kurulun standart sözleşme bildirimlerinde neler istediği ve en sık gördüğümüz hatalar." },
    date: "2026-07-02",
    minutes: 5,
    category: { en: "Data protection", tr: "Kişisel veriler" },
    href: "https://example.com/insights/kvkk-transfers",
  },
  {
    title: { en: "Choosing ISTAC: a practical guide for foreign counterparties", tr: "ISTAC’ı seçmek: yabancı karşı taraflar için pratik rehber" },
    excerpt: { en: "Costs, timelines and the clauses that make an Istanbul-seated arbitration work.", tr: "Maliyetler, süreler ve İstanbul merkezli bir tahkimi işler kılan hükümler." },
    date: "2026-05-19",
    minutes: 10,
    category: { en: "Arbitration", tr: "Tahkim" },
    href: "https://example.com/insights/choosing-istac",
  },
];

export const office = {
  address: { en: "Example Plaza, Floor 14, Levent, 34330 Beşiktaş, Istanbul", tr: "Example Plaza, Kat 14, Levent, 34330 Beşiktaş, İstanbul" },
  hours: { en: "Mon–Fri 09:00–18:30 · dawn-raid line 24/7", tr: "Pzt–Cum 09.00–18.30 · yerinde inceleme hattı 7/24" },
};
