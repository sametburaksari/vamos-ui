/**
 * Requirement packs per legal regime (EU/EEA, Germany, Austria, France, UK, US federal and state,
 * Canada and Québec, Brazil, UAE, Saudi Arabia, Australia, Switzerland). Türkiye's rules live in
 * the base pack in ./requirements, unchanged.
 *
 * Every item is a check a QA agent can run against the site, with the law or the regulator's page
 * it comes from. They are not legal advice: items marked `counsel` depend on facts a template
 * cannot know (size thresholds, national transposition, scope) and need a lawyer's yes. Fewer,
 * sourced rules on purpose.
 */

import type { Text } from "./questions";
import type { Agent, Requirement, ResolvedContext } from "./requirements";

const t = (en: string, tr: string): Text => ({ en, tr });

interface Opts {
  check?: string;
  counsel?: boolean;
}
const r = (id: string, agent: Agent, text: Text, source: string, o: Opts = {}): Requirement => ({ id, agent, text, ...(o.check ? { check: o.check } : {}), source, ...(o.counsel ? { counsel: true } : {}) });

const VERIFY = "npx vamos-ui verify";
const AUDIT = "npx vamos-ui audit <preview-url>";

/** Official sources (laws and regulator guidance). */
export const SOURCES = {
  gdpr: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
  eprivacy: "https://eur-lex.europa.eu/eli/dir/2002/58/oj",
  edpbConsent: "https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en",
  crd: "https://eur-lex.europa.eu/eli/dir/2011/83/oj",
  withdrawalFunction: "https://eur-lex.europa.eu/eli/dir/2023/2673/oj",
  ecommerceDirective: "https://eur-lex.europa.eu/eli/dir/2000/31/oj",
  priceIndication: "https://eur-lex.europa.eu/eli/dir/1998/6/oj",
  odrRepeal: "https://eur-lex.europa.eu/eli/reg/2024/3228/oj",
  eaa: "https://eur-lex.europa.eu/eli/dir/2019/882/oj",
  ddg5: "https://www.gesetze-im-internet.de/ddg/__5.html",
  tdddg25: "https://www.gesetze-im-internet.de/ttdsg/__25.html",
  bgb312j: "https://www.gesetze-im-internet.de/bgb/__312j.html",
  egbgbAnlage1: "https://www.gesetze-im-internet.de/bgbeg/art_253anlage_1.html",
  vsbg36: "https://www.gesetze-im-internet.de/vsbg/__36.html",
  egbgbAnlage2: "https://www.gesetze-im-internet.de/bgbeg/art_253anlage_2.html",
  ecg5: "https://www.ris.bka.gv.at/Dokumente/Bundesnormen/NOR40025801/NOR40025801.html",
  medienG: "https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10000719",
  lcen: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000801164",
  cnilCookies: "https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies",
  frMediator: "https://www.economie.gouv.fr/mediation-conso",
  icoInformed: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-be-informed/",
  pecr6: "https://www.legislation.gov.uk/uksi/2003/2426/regulation/6",
  pecr22: "https://www.legislation.gov.uk/uksi/2003/2426/regulation/22",
  ukTradingDisclosures: "https://www.legislation.gov.uk/uksi/2015/17/regulation/25",
  ukEcommerceRegs: "https://www.legislation.gov.uk/uksi/2002/2013/regulation/6",
  ukConsumerContracts: "https://www.legislation.gov.uk/uksi/2013/3134/contents",
  icoFee: "https://ico.org.uk/for-organisations/data-protection-fee/",
  caloppa: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=22575",
  ccpaThresholds: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140",
  ccpaOptOut: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.135",
  ccpaRegs: "https://cppa.ca.gov/regulations/",
  ccpaMonetary: "https://cppa.ca.gov/regulations/cpi_adjustment.html",
  stateLaws: "https://iapp.org/resources/article/us-state-privacy-legislation-tracker/",
  canSpam: "https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business",
  coppa: "https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa",
  adaWeb: "https://www.ada.gov/resources/web-guidance/",
  mailOrderRule: "https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule",
  caAutoRenewal: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=17602",
  pipeda: "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/",
  casl: "https://crtc.gc.ca/eng/com500/faq500.htm",
  law25: "https://www.legisquebec.gouv.qc.ca/en/document/cs/P-39.1",
  cai: "https://www.cai.gouv.qc.ca/",
  quebecFrench: "https://www.legisquebec.gouv.qc.ca/en/document/cs/C-11",
  lgpd: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm",
  anpd: "https://www.gov.br/anpd/pt-br",
  brEcommerceDecree: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm",
  brCdc: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm",
  aePdpl: "https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws",
  saPdpl: "https://sdaia.gov.sa/en/SDAIA/about/Pages/RegulationsAndPolicies.aspx",
  auApp: "https://www.oaic.gov.au/privacy/australian-privacy-principles",
  auSpam: "https://www.acma.gov.au/avoid-sending-spam",
  auPrices: "https://www.accc.gov.au/business/pricing/displaying-prices",
  chFadp: "https://www.fedlex.admin.ch/eli/cc/2022/491/en",
  chUwg: "https://www.fedlex.admin.ch/eli/cc/1988/223_223_223/de",
  chTca: "https://www.fedlex.admin.ch/eli/cc/1997/2187_2187_2187/en",
} as const;

const S = SOURCES;

function eu(c: ResolvedContext): Requirement[] {
  const shop = c.siteType === "ecommerce";
  const business = c.legalEntity !== "person";
  const out: Requirement[] = [
    r(
      "eu-privacy-notice",
      "legal",
      t(
        "The privacy notice (GDPR Art. 13) names the controller and its contact, each purpose with its lawful basis, recipients, transfers outside the EEA and their safeguard, retention periods, the data subject rights and the right to complain to a supervisory authority.",
        "Gizlilik bildirimi (GDPR md. 13) veri sorumlusunu ve iletişimini, her amacı hukuki dayanağıyla, alıcıları, AEA dışına aktarımları ve güvencesini, saklama sürelerini, ilgili kişi haklarını ve denetim makamına şikâyet hakkını içerir.",
      ),
      S.gdpr,
    ),
    r(
      "eu-rights-contact",
      "legal",
      t(
        "A working email or form for data subject requests (access, rectification, erasure, objection, portability) is on the privacy page; requests are answered within one month (Art. 12(3)).",
        "Gizlilik sayfasında ilgili kişi talepleri (erişim, düzeltme, silme, itiraz, taşınabilirlik) için çalışan bir e-posta ya da form var; talepler bir ay içinde yanıtlanır (md. 12(3)).",
      ),
      S.gdpr,
    ),
    r(
      "eu-dpo",
      "legal",
      t("If the business has (or must appoint) a data protection officer, the DPO's contact is published in the privacy notice (Art. 37(7)).", "İşletmenin bir veri koruma görevlisi varsa (ya da atamak zorundaysa) iletişim bilgisi gizlilik bildiriminde yayımlanır (md. 37(7))."),
      S.gdpr,
      { counsel: true },
    ),
  ];
  if (business)
    out.push(
      r(
        "eu-provider-info",
        "legal",
        t(
          "The operator's name, geographic address, email, trade register and number and VAT number are easily, directly and permanently reachable (E-Commerce Directive Art. 5).",
          "İşletenin adı, açık adresi, e-postası, ticaret sicili ve numarası ile KDV numarası kolayca, doğrudan ve kalıcı olarak erişilebilir (E-Ticaret Direktifi md. 5).",
        ),
        S.ecommerceDirective,
        { check: AUDIT },
      ),
    );
  if (c.cookies)
    out.push(
      r(
        "eu-cookie-consent",
        "tracking",
        t(
          "Non-essential cookies and trackers are set only after prior consent (ePrivacy Art. 5(3)); Reject is on the first layer and as easy as Accept; no pre-ticked boxes; consent can be withdrawn as easily from a cookie settings link.",
          "Zorunlu olmayan çerez ve izleyiciler yalnızca önceden alınan onaydan sonra yazılır (ePrivacy md. 5(3)); Reddet ilk katmanda ve Kabul et kadar kolay; önceden işaretli kutu yok; onay bir çerez ayarları bağlantısından aynı kolaylıkla geri alınır.",
        ),
        S.edpbConsent,
        { check: VERIFY },
      ),
    );
  if (c.newsletter || c.forms)
    out.push(
      r(
        "eu-marketing-consent",
        "forms",
        t(
          "Marketing email goes only to people who opted in (or existing customers under the soft opt-in for similar products), and every message has a working unsubscribe link (ePrivacy Art. 13).",
          "Pazarlama e-postası yalnızca izin verenlere (ya da benzer ürünler için mevcut müşterilere) gider ve her iletide çalışan bir abonelikten çıkma bağlantısı vardır (ePrivacy md. 13).",
        ),
        S.eprivacy,
      ),
    );
  if (shop)
    out.push(
      r("eu-shop-identity", "legal", t("Before the order the shop shows the trader's identity, geographic address, phone and email (Consumer Rights Directive Art. 6(1)(b)–(c)).", "Siparişten önce mağaza satıcının kimliğini, açık adresini, telefonunu ve e-postasını gösterir (Tüketici Hakları Direktifi md. 6(1)(b)–(c))."), S.crd),
      r(
        "eu-shop-price",
        "content",
        t(
          "Prices are total prices including VAT; delivery and any other charges are shown before the order (CRD Art. 6(1)(e)). A price reduction shows the lowest price of the previous 30 days (Price Indication Directive Art. 6a).",
          "Fiyatlar KDV dahil toplam fiyattır; teslimat ve diğer ücretler siparişten önce gösterilir (THD md. 6(1)(e)). İndirim duyurusunda önceki 30 günün en düşük fiyatı gösterilir (Fiyat Gösterimi Direktifi md. 6a).",
        ),
        S.priceIndication,
      ),
      r("eu-shop-button", "build", t("The final order button says that ordering means paying (\"Order with obligation to pay\" or an equally clear label) (CRD Art. 8(2)).", "Son sipariş düğmesi siparişin ödeme yükümlülüğü doğurduğunu söyler (\"Ödeme yükümlülüğüyle sipariş ver\" ya da aynı açıklıkta bir etiket) (THD md. 8(2))."), S.crd),
      r(
        "eu-shop-withdrawal",
        "legal",
        t(
          "The 14-day right of withdrawal, its conditions and exceptions are explained before the order, with the model withdrawal form (CRD Art. 6(1)(h), Art. 9, Annex I).",
          "14 günlük cayma hakkı, koşulları ve istisnaları siparişten önce anlatılır; örnek cayma formu verilir (THD md. 6(1)(h), md. 9, Ek I).",
        ),
        S.crd,
      ),
      r(
        "eu-shop-withdrawal-function",
        "build",
        t(
          "Online contracts with a right of withdrawal offer an online withdrawal function (a clearly labelled \"withdraw from contract here\" button with a confirmation step), required from 19 June 2026 (CRD Art. 11a). National wording differs.",
          "Cayma hakkı olan çevrimiçi sözleşmelerde çevrimiçi cayma işlevi var (\"sözleşmeden burada cay\" gibi açık etiketli, onay adımlı bir düğme); 19 Haziran 2026'dan itibaren zorunlu (THD md. 11a). Ulusal metinler farklı olabilir.",
        ),
        S.withdrawalFunction,
        { counsel: true },
      ),
      r(
        "eu-no-odr-link",
        "legal",
        t(
          "No link to the EU ODR platform: it closed on 20 July 2025 and the obligation to link it ended (Regulation (EU) 2024/3228). Remove old ODR links from the footer and the terms.",
          "AB ODR platformuna bağlantı yok: platform 20 Temmuz 2025'te kapandı ve bağlantı verme yükümlülüğü sona erdi (Tüzük (AB) 2024/3228). Eski ODR bağlantılarını footer'dan ve koşullardan kaldırın.",
        ),
        S.odrRepeal,
      ),
      r(
        "eu-accessibility",
        "build",
        t(
          "E-commerce services must meet the European Accessibility Act from 28 June 2025 (WCAG 2.1 AA via EN 301 549) and publish an accessibility statement; microenterprises (under 10 staff and up to EUR 2 million turnover) are exempt.",
          "E-ticaret hizmetleri 28 Haziran 2025'ten itibaren Avrupa Erişilebilirlik Yasası'na uymalı (EN 301 549 üzerinden WCAG 2.1 AA) ve bir erişilebilirlik beyanı yayımlamalı; mikro işletmeler (10 kişiden az ve en çok 2 milyon avro ciro) muaftır.",
        ),
        S.eaa,
        { check: AUDIT, counsel: true },
      ),
    );
  return out;
}

function de(c: ResolvedContext): Requirement[] {
  const out: Requirement[] = [
    r(
      "de-impressum",
      "legal",
      t(
        "An Impressum (DDG § 5) is one click from every page (footer link \"Impressum\"): name and address (legal form and authorised representative for companies), email plus a second fast contact, commercial register and number, VAT id (USt-IdNr.) or Wirtschafts-ID, supervisory authority and professional rules where they apply.",
        "Her sayfadan bir tıkla ulaşılan bir Impressum var (DDG § 5; footer'da \"Impressum\"): ad ve adres (şirketlerde hukuki biçim ve yetkili temsilci), e-posta ve ikinci bir hızlı iletişim yolu, ticaret sicili ve numarası, KDV numarası (USt-IdNr.) ya da Wirtschafts-ID, gerekiyorsa denetim makamı ve meslek kuralları.",
      ),
      S.ddg5,
      { check: AUDIT },
    ),
    r("de-datenschutz", "legal", t("A Datenschutzerklärung in German is linked from every page and covers GDPR Art. 13 (see eu-privacy-notice).", "Almanca bir Datenschutzerklärung her sayfadan bağlantılı ve GDPR md. 13'ü karşılar (bkz. eu-privacy-notice)."), S.gdpr, { check: AUDIT }),
  ];
  if (["ecommerce", "booking", "local-business", "saas", "event"].includes(c.siteType))
    out.push(
      r(
        "de-vsbg",
        "legal",
        t(
          "The site says whether the business is willing or obliged to take part in dispute resolution before a consumer arbitration board, and names the board if it is (VSBG § 36). Businesses with 10 or fewer employees on 31 December of the previous year need not state the willingness.",
          "Site, işletmenin bir tüketici tahkim kurulu önünde uyuşmazlık çözümüne katılmaya istekli ya da yükümlü olup olmadığını söyler; yükümlüyse kurulu belirtir (VSBG § 36). Önceki yılın 31 Aralık'ında 10 veya daha az çalışanı olanlar istekliliği belirtmek zorunda değildir.",
        ),
        S.vsbg36,
        { counsel: true },
      ),
    );
  if (c.cookies)
    out.push(
      r(
        "de-tdddg",
        "tracking",
        t("Storing or reading information on the device needs consent unless it is strictly necessary for the service the user asked for (TDDDG § 25).", "Cihaza bilgi yazmak ya da okumak, kullanıcının istediği hizmet için kesinlikle gerekli değilse onay gerektirir (TDDDG § 25)."),
        S.tdddg25,
        { check: VERIFY },
      ),
    );
  if (c.siteType === "ecommerce")
    out.push(
      r("de-button", "build", t("The order button reads \"zahlungspflichtig bestellen\" or an equally unambiguous wording; otherwise no contract is formed (BGB § 312j(3)).", "Sipariş düğmesinde \"zahlungspflichtig bestellen\" ya da aynı açıklıkta bir ifade yazar; aksi hâlde sözleşme kurulmaz (BGB § 312j(3))."), S.bgb312j),
      r(
        "de-widerruf",
        "legal",
        t(
          "A Widerrufsbelehrung following the statutory model (EGBGB Anlage 1) and the Muster-Widerrufsformular (Anlage 2) are on the site and sent with the order confirmation.",
          "Yasal örneğe (EGBGB Ek 1) uygun bir Widerrufsbelehrung ve Muster-Widerrufsformular (Ek 2) sitede var ve sipariş onayıyla gönderilir.",
        ),
        S.egbgbAnlage1,
      ),
    );
  return out;
}

function at(): Requirement[] {
  return [
    r(
      "at-impressum",
      "legal",
      t(
        "An Impressum (ECG § 5) is one click from every page: name or company, address, contact with email, company register number and court, VAT id (UID), supervisory authority, chamber membership and professional rules where they apply.",
        "Her sayfadan bir tıkla ulaşılan bir Impressum var (ECG § 5): ad ya da unvan, adres, e-postalı iletişim, şirket sicil numarası ve mahkemesi, KDV numarası (UID), gerekiyorsa denetim makamı, oda üyeliği ve meslek kuralları.",
      ),
      S.ecg5,
      { check: AUDIT },
    ),
    r("at-offenlegung", "legal", t("The disclosure under the Media Act (MedienG § 25: owner, place of business, business purpose) is part of the Impressum.", "Medya Kanunu'na göre açıklama (MedienG § 25: sahibi, iş yeri, faaliyet konusu) Impressum'un parçasıdır."), S.medienG, { counsel: true }),
  ];
}

function fr(c: ResolvedContext): Requirement[] {
  const out: Requirement[] = [
    r(
      "fr-mentions-legales",
      "legal",
      t(
        "A \"Mentions légales\" page (LCEN art. 1-1, formerly art. 6-III) is linked from every page: company name, legal form, share capital and registered office (or the individual's name and address), RCS / RNE number, phone and email, the publication director, and the host's name, address and phone.",
        "Her sayfadan bağlantılı bir \"Mentions légales\" sayfası var (LCEN md. 1-1, eski md. 6-III): unvan, hukuki biçim, sermaye ve merkez (ya da kişinin adı ve adresi), RCS / RNE numarası, telefon ve e-posta, yayın sorumlusu ve barındırma sağlayıcısının adı, adresi ve telefonu.",
      ),
      S.lcen,
      { check: AUDIT },
    ),
  ];
  if (c.cookies)
    out.push(
      r(
        "fr-cnil-cookies",
        "tracking",
        t("The cookie banner offers \"Tout refuser\" on the first layer as visibly as \"Tout accepter\"; refusing is remembered; trackers wait for consent (CNIL guidelines).", "Çerez bandı ilk katmanda \"Tout refuser\"u \"Tout accepter\" kadar görünür sunar; ret hatırlanır; izleyiciler onayı bekler (CNIL kuralları)."),
        S.cnilCookies,
        { check: VERIFY },
      ),
    );
  if (c.siteType === "ecommerce")
    out.push(
      r("fr-mediator", "legal", t("The shop names the consumer mediator it adheres to (médiateur de la consommation) and how to reach it, in the terms and on the site.", "Mağaza bağlı olduğu tüketici arabulucusunu (médiateur de la consommation) ve ona nasıl ulaşılacağını koşullarda ve sitede belirtir."), S.frMediator, { counsel: true }),
    );
  return out;
}

function uk(c: ResolvedContext): Requirement[] {
  const home = c.jurisdiction.home.includes("UK");
  const out: Requirement[] = [
    r(
      "uk-privacy-notice",
      "legal",
      t(
        "The privacy notice meets the UK GDPR right to be informed: who you are and how to contact you, purposes and lawful bases, recipients, international transfers, retention, rights and the right to complain to the ICO.",
        "Gizlilik bildirimi UK GDPR bilgilendirme hakkını karşılar: kim olduğunuz ve iletişim, amaçlar ve hukuki dayanaklar, alıcılar, uluslararası aktarımlar, saklama, haklar ve ICO'ya şikâyet hakkı.",
      ),
      S.icoInformed,
    ),
  ];
  if (c.cookies)
    out.push(
      r(
        "uk-pecr-cookies",
        "tracking",
        t(
          "Cookies that are not strictly necessary need consent before they are set (PECR reg. 6); Reject is as easy as Accept. The Data (Use and Access) Act 2025 adds narrow exemptions (e.g. some analytics); check before relying on them.",
          "Kesinlikle gerekli olmayan çerezler yazılmadan önce onay gerekir (PECR md. 6); Reddet Kabul et kadar kolay. 2025 tarihli Data (Use and Access) Act dar istisnalar ekler (örn. bazı analizler); bunlara dayanmadan önce kontrol edin.",
        ),
        S.pecr6,
        { check: VERIFY, counsel: true },
      ),
    );
  if (c.newsletter || c.forms)
    out.push(r("uk-pecr-marketing", "forms", t("Marketing email to individuals needs consent or the soft opt-in for existing customers, and every message has an unsubscribe link (PECR reg. 22).", "Bireylere pazarlama e-postası onay ya da mevcut müşteriler için yumuşak izin gerektirir; her iletide abonelikten çıkma bağlantısı vardır (PECR md. 22)."), S.pecr22));
  if (home && c.legalEntity !== "person")
    out.push(
      r(
        "uk-ecommerce-info",
        "legal",
        t("The site shows the business name, geographic address, email, register and registration number and VAT number (Electronic Commerce Regulations 2002, reg. 6).", "Site işletmenin adını, açık adresini, e-postasını, sicil ve kayıt numarasını ve KDV numarasını gösterir (Electronic Commerce Regulations 2002, md. 6)."),
        S.ukEcommerceRegs,
      ),
    );
  if (home && c.company)
    out.push(
      r(
        "uk-company-details",
        "legal",
        t("A company shows its registered name, registered number, registered office address and the part of the UK it is registered in on its website (SI 2015/17, regs. 24–25).", "Şirket web sitesinde kayıtlı unvanını, sicil numarasını, kayıtlı merkez adresini ve kayıtlı olduğu Birleşik Krallık bölgesini gösterir (SI 2015/17, md. 24–25)."),
        S.ukTradingDisclosures,
        { check: VERIFY },
      ),
    );
  if (home) out.push(r("uk-ico-fee", "legal", t("The business has paid the ICO data protection fee unless it is exempt.", "İşletme muaf değilse ICO veri koruma ücretini ödedi."), S.icoFee, { counsel: true }));
  if (c.siteType === "ecommerce")
    out.push(
      r(
        "uk-shop-cancellation",
        "legal",
        t("The 14-day right to cancel, its exceptions and a model cancellation form are given before the order (Consumer Contracts Regulations 2013).", "14 günlük iptal hakkı, istisnaları ve örnek iptal formu siparişten önce verilir (Consumer Contracts Regulations 2013)."),
        S.ukConsumerContracts,
      ),
    );
  return out;
}

function us(c: ResolvedContext): Requirement[] {
  const out: Requirement[] = [];
  if (c.newsletter)
    out.push(
      r(
        "us-can-spam",
        "forms",
        t("Commercial email has truthful headers and subject lines, the sender's valid postal address and a clear opt-out that is honoured within 10 business days (CAN-SPAM).", "Ticari e-postanın başlıkları ve konusu doğru, gönderenin geçerli posta adresi var ve açık bir çıkış yolu 10 iş günü içinde uygulanır (CAN-SPAM)."),
        S.canSpam,
      ),
    );
  if (c.children)
    out.push(
      r(
        "us-coppa",
        "legal",
        t("A site directed to children under 13 gets verifiable parental consent before collecting personal information and posts a COPPA privacy notice.", "13 yaş altı çocuklara yönelik bir site kişisel bilgi toplamadan önce doğrulanabilir ebeveyn onayı alır ve bir COPPA gizlilik bildirimi yayımlar."),
        S.coppa,
        { counsel: true },
      ),
    );
  out.push(
    r(
      "us-accessibility",
      "build",
      t("The site targets WCAG 2.1 AA: the ADA applies to businesses open to the public and courts have applied it to websites; there is no single federal web rule for private businesses.", "Site WCAG 2.1 AA'yı hedefler: ADA halka açık işletmelere uygulanır ve mahkemeler bunu web sitelerine de uygulamıştır; özel işletmeler için tek bir federal web kuralı yoktur."),
      S.adaWeb,
      { check: AUDIT, counsel: true },
    ),
  );
  if (c.siteType === "ecommerce")
    out.push(r("us-shipping-time", "content", t("Orders ship within the time the site states (or within 30 days if none is stated); buyers are told about delays and offered a refund (FTC Mail, Internet, or Telephone Order Merchandise Rule).", "Siparişler sitede yazan sürede (yazmıyorsa 30 gün içinde) gönderilir; gecikmeler alıcıya bildirilir ve iade önerilir (FTC Mail, Internet, or Telephone Order Merchandise Rule)."), S.mailOrderRule));
  return out;
}

function usCa(c: ResolvedContext): Requirement[] {
  const out: Requirement[] = [
    r(
      "us-ca-caloppa",
      "legal",
      t(
        "A conspicuously linked privacy policy lists the categories of personal information collected and the third parties it is shared with, how users review or change it, how the site responds to Do Not Track signals and its effective date (CalOPPA).",
        "Belirgin bağlantılı bir gizlilik politikası toplanan kişisel bilgi türlerini ve paylaşıldığı üçüncü tarafları, kullanıcıların bunu nasıl görüp değiştireceğini, sitenin Do Not Track sinyallerine nasıl yanıt verdiğini ve yürürlük tarihini listeler (CalOPPA).",
      ),
      S.caloppa,
    ),
    r(
      "us-ca-ccpa-scope",
      "legal",
      t(
        "Check whether the CCPA/CPRA applies: annual gross revenue over USD 26,625,000 (2025 figure, adjusted every odd year), or buying, selling or sharing personal information of 100,000+ California consumers or households, or 50%+ of revenue from selling or sharing it.",
        "CCPA/CPRA'nın uygulanıp uygulanmadığını kontrol edin: yıllık brüt gelir 26.625.000 USD üzeri (2025 rakamı, tek yıllarda güncellenir) ya da 100.000+ Kaliforniyalı tüketici veya hanenin kişisel bilgisini almak, satmak ya da paylaşmak, ya da gelirin %50+'sinin bunlardan gelmesi.",
      ),
      S.ccpaThresholds,
      { counsel: true },
    ),
  ];
  if (c.ads)
    out.push(
      r(
        "us-ca-do-not-sell",
        "legal",
        t(
          "Ad pixels used for cross-context behavioural advertising count as \"sharing\": when the CCPA applies, every page links \"Do Not Sell or Share My Personal Information\" (or \"Your Privacy Choices\" with the icon) to a page where the visitor can opt out (Civ. Code § 1798.135).",
          "Bağlamlar arası davranışsal reklam için kullanılan reklam pikselleri \"paylaşım\" sayılır: CCPA uygulanıyorsa her sayfa, ziyaretçinin vazgeçebileceği bir sayfaya \"Do Not Sell or Share My Personal Information\" (ya da simgesiyle \"Your Privacy Choices\") bağlantısı verir (Civ. Code § 1798.135).",
        ),
        S.ccpaOptOut,
        { check: AUDIT, counsel: true },
      ),
    );
  if (c.ads || c.cookies)
    out.push(
      r(
        "us-ca-gpc",
        "tracking",
        t("A Global Privacy Control signal (Sec-GPC: 1 / navigator.globalPrivacyControl) is treated as an opt-out of sale and sharing for that browser, and the site shows that it was honoured (11 CCR § 7025).", "Global Privacy Control sinyali (Sec-GPC: 1 / navigator.globalPrivacyControl) o tarayıcı için satış ve paylaşımdan vazgeçme sayılır ve site sinyalin uygulandığını gösterir (11 CCR § 7025)."),
        S.ccpaRegs,
        { counsel: true },
      ),
    );
  if (c.sensitive)
    out.push(
      r(
        "us-ca-limit-sensitive",
        "legal",
        t("If sensitive personal information is used beyond what the service needs, a \"Limit the Use of My Sensitive Personal Information\" link is offered (Civ. Code § 1798.121).", "Hassas kişisel bilgi hizmetin gerektirdiğinin ötesinde kullanılıyorsa \"Limit the Use of My Sensitive Personal Information\" bağlantısı sunulur (Civ. Code § 1798.121)."),
        S.ccpaOptOut,
        { counsel: true },
      ),
    );
  if (c.siteType === "saas")
    out.push(r("us-ca-auto-renewal", "content", t("Automatic renewal terms are shown clearly before sign-up, with affirmative consent and an online way to cancel (Cal. Bus. & Prof. Code § 17602).", "Otomatik yenileme koşulları kayıttan önce açıkça gösterilir; açık onay alınır ve çevrimiçi iptal yolu sunulur (Cal. Bus. & Prof. Code § 17602)."), S.caAutoRenewal, { counsel: true }));
  return out;
}

function usStates(): Requirement[] {
  return [
    r(
      "us-state-privacy",
      "legal",
      t(
        "Other state privacy laws (Colorado, Connecticut, Virginia, Texas, Oregon and more) have their own thresholds and opt-out rights; several require honouring universal opt-out signals such as GPC. Check which apply to the business.",
        "Diğer eyalet gizlilik yasalarının (Colorado, Connecticut, Virginia, Texas, Oregon ve diğerleri) kendi eşikleri ve vazgeçme hakları var; birçoğu GPC gibi evrensel vazgeçme sinyallerine uymayı şart koşar. İşletmeye hangilerinin uygulandığını kontrol edin.",
      ),
      S.stateLaws,
      { counsel: true },
    ),
  ];
}

function ca(c: ResolvedContext): Requirement[] {
  const out: Requirement[] = [
    r(
      "ca-pipeda",
      "legal",
      t("The privacy policy states the purposes of collection, how consent is obtained and withdrawn, and the name or title and contact of the person accountable for privacy (PIPEDA fair information principles).", "Gizlilik politikası toplama amaçlarını, onayın nasıl alınıp geri çekildiğini ve gizlilikten sorumlu kişinin adını ya da unvanını ve iletişimini belirtir (PIPEDA adil bilgi ilkeleri)."),
      S.pipeda,
    ),
  ];
  if (c.newsletter || c.forms)
    out.push(
      r(
        "ca-casl",
        "forms",
        t("Commercial electronic messages need express or implied consent, identify the sender with contact details and carry an unsubscribe that works within 10 business days (CASL).", "Ticari elektronik iletiler açık ya da örtülü onay gerektirir, göndereni iletişim bilgileriyle tanıtır ve 10 iş günü içinde işleyen bir abonelikten çıkma yolu taşır (CASL)."),
        S.casl,
      ),
    );
  return out;
}

function caQc(c: ResolvedContext): Requirement[] {
  return [
    r(
      "ca-qc-law25",
      "legal",
      t(
        "For personal information of people in Québec (Law 25): the privacy policy is published on the site in clear terms, the title and contact of the person in charge of the protection of personal information are published, and any technology that identifies, locates or profiles a person is off by default.",
        "Québec'teki kişilerin bilgileri için (Law 25): gizlilik politikası sitede açık bir dille yayımlanır, kişisel bilgilerin korunmasından sorumlu kişinin unvanı ve iletişimi yayımlanır, kişiyi tanımlayan, konumlayan ya da profilleyen her teknoloji varsayılan olarak kapalıdır.",
      ),
      S.law25,
      { counsel: true },
    ),
    ...(c.jurisdiction.home.includes("CA-QC") || c.jurisdiction.home.includes("CA")
      ? [r("ca-qc-french", "content", t("A business in Québec offers its commercial website in French (Charter of the French Language).", "Québec'teki bir işletme ticari web sitesini Fransızca sunar (Fransız Dili Şartı)."), S.quebecFrench, { counsel: true })]
      : []),
  ];
}

function br(c: ResolvedContext): Requirement[] {
  const out: Requirement[] = [
    r(
      "br-lgpd-notice",
      "legal",
      t("The privacy notice states the purpose, form and duration of processing, the controller's identity and contact, sharing and its purpose, and the data subject rights of LGPD art. 18 (art. 9).", "Gizlilik bildirimi işlemenin amacını, biçimini ve süresini, veri sorumlusunun kimliğini ve iletişimini, paylaşımı ve amacını ve LGPD md. 18'deki hakları belirtir (md. 9)."),
      S.lgpd,
    ),
    r(
      "br-encarregado",
      "legal",
      t("The identity and contact of the encarregado (DPO) are published clearly, preferably on the website (LGPD art. 41 §1). Small processing agents may be exempt but must still offer a communication channel (ANPD).", "Encarregado'nun (veri koruma görevlisi) kimliği ve iletişimi açıkça, tercihen web sitesinde yayımlanır (LGPD md. 41 §1). Küçük işleyiciler muaf olabilir ama yine de bir iletişim kanalı sunmalıdır (ANPD)."),
      S.lgpd,
      { counsel: true },
    ),
  ];
  if (c.cookies) out.push(r("br-cookies", "tracking", t("Non-essential cookies rest on consent or another LGPD legal basis, and the banner lets the visitor refuse them (ANPD cookie guidance).", "Zorunlu olmayan çerezler onaya ya da başka bir LGPD hukuki dayanağına dayanır ve bant ziyaretçinin bunları reddetmesine izin verir (ANPD çerez rehberi)."), S.anpd, { check: VERIFY, counsel: true }));
  if (c.siteType === "ecommerce")
    out.push(
      r("br-shop-identity", "legal", t("The shop shows the business name, CNPJ (or CPF), physical and electronic address prominently (Decree 7.962/2013 art. 2).", "Mağaza işletme adını, CNPJ'yi (ya da CPF), fiziksel ve elektronik adresini belirgin biçimde gösterir (7.962/2013 sayılı Kararname md. 2)."), S.brEcommerceDecree),
      r(
        "br-shop-arrependimento",
        "legal",
        t("The 7-day right of withdrawal (direito de arrependimento) for purchases outside the store is explained with how to use it (CDC art. 49; Decree 7.962/2013 art. 5).", "Mağaza dışı alımlarda 7 günlük cayma hakkı (direito de arrependimento) nasıl kullanılacağıyla birlikte anlatılır (CDC md. 49; 7.962/2013 sayılı Kararname md. 5)."),
        S.brCdc,
      ),
    );
  return out;
}

function ae(): Requirement[] {
  return [
    r(
      "ae-pdpl",
      "legal",
      t(
        "The privacy notice covers the UAE Personal Data Protection Law (Federal Decree-Law 45/2021): purposes, consent where it is the basis, and how to exercise the rights. Businesses in DIFC or ADGM follow those free zones' own data protection laws instead.",
        "Gizlilik bildirimi BAE Kişisel Verilerin Korunması Kanunu'nu (45/2021 sayılı Federal Kanun Hükmünde Kararname) karşılar: amaçlar, dayanak onaysa onay ve hakların nasıl kullanılacağı. DIFC ya da ADGM'deki işletmeler o serbest bölgelerin kendi veri koruma yasalarına tabidir.",
      ),
      S.aePdpl,
      { counsel: true },
    ),
  ];
}

function sa(): Requirement[] {
  return [
    r(
      "sa-pdpl",
      "legal",
      t("A privacy policy is available before personal data is collected and states the purpose, the data collected, how it is processed and stored, and the data subject rights (Saudi PDPL, art. 12).", "Kişisel veri toplanmadan önce bir gizlilik politikası sunulur; amaç, toplanan veri, işlenme ve saklanma biçimi ve ilgili kişi haklarını belirtir (Suudi PDPL md. 12)."),
      S.saPdpl,
      { counsel: true },
    ),
  ];
}

function au(c: ResolvedContext): Requirement[] {
  const out: Requirement[] = [
    r(
      "au-app-policy",
      "legal",
      t(
        "An APP privacy policy says what personal information is collected and held, how and why, how to access and correct it, how to complain and whether it goes overseas (APP 1). Businesses with A$3 million turnover or less are often exempt; check the exceptions.",
        "APP gizlilik politikası hangi kişisel bilgilerin nasıl ve neden toplanıp tutulduğunu, nasıl erişilip düzeltileceğini, nasıl şikâyet edileceğini ve yurt dışına gidip gitmediğini söyler (APP 1). Cirosu 3 milyon AUD ve altı işletmeler çoğunlukla muaftır; istisnaları kontrol edin.",
      ),
      S.auApp,
      { counsel: true },
    ),
  ];
  if (c.newsletter || c.forms) out.push(r("au-spam", "forms", t("Commercial email needs consent, identifies the sender and has a functional unsubscribe honoured within 5 business days (Spam Act 2003).", "Ticari e-posta onay gerektirir, göndereni tanıtır ve 5 iş günü içinde uygulanan çalışan bir abonelikten çıkma yolu içerir (Spam Act 2003)."), S.auSpam));
  if (c.siteType === "ecommerce") out.push(r("au-total-price", "content", t("The total price including GST and any compulsory charges is shown prominently (Australian Consumer Law).", "GST ve zorunlu tüm ücretler dahil toplam fiyat belirgin biçimde gösterilir (Australian Consumer Law)."), S.auPrices));
  return out;
}

function ch(c: ResolvedContext): Requirement[] {
  const out: Requirement[] = [
    r(
      "ch-fadp",
      "legal",
      t("The privacy notice names the controller and its contact, the purposes, the recipients and the countries data goes to with their safeguards (revFADP art. 19).", "Gizlilik bildirimi veri sorumlusunu ve iletişimini, amaçları, alıcıları ve verinin gittiği ülkeleri güvenceleriyle belirtir (revFADP md. 19)."),
      S.chFadp,
    ),
  ];
  if (c.cookies) out.push(r("ch-cookies", "tracking", t("Visitors are told about cookies and how to refuse them (Telecommunications Act art. 45c); if the site targets EU visitors, use EU-style prior consent.", "Ziyaretçiler çerezler ve bunları nasıl reddedecekleri hakkında bilgilendirilir (Telekomünikasyon Kanunu md. 45c); site AB ziyaretçilerini hedefliyorsa AB usulü önceden onay kullanın."), S.chTca, { counsel: true }));
  if (c.siteType === "ecommerce") out.push(r("ch-impressum", "legal", t("Online offers state the seller's identity and a contact address including email (UWG art. 3(1)(s)).", "Çevrimiçi teklifler satıcının kimliğini ve e-posta dahil iletişim adresini belirtir (UWG md. 3(1)(s))."), S.chUwg, { check: AUDIT }));
  return out;
}

/** Every regime's items for the site, in regime order. */
export function regimeRequirements(c: ResolvedContext): Requirement[] {
  const has = (x: string) => c.jurisdiction.regimes.includes(x as never);
  const home = (x: string) => c.jurisdiction.home.includes(x as never);
  const out: Requirement[] = [];
  if (has("EU")) out.push(...eu(c));
  if (home("DE")) out.push(...de(c));
  if (home("AT")) out.push(...at());
  if (home("FR")) out.push(...fr(c));
  if (has("UK")) out.push(...uk(c));
  if (has("US")) out.push(...us(c));
  if (has("US-CA")) out.push(...usCa(c));
  if (has("US-STATES")) out.push(...usStates());
  if (has("CA")) out.push(...ca(c));
  if (has("CA-QC")) out.push(...caQc(c));
  if (has("BR")) out.push(...br(c));
  if (has("AE")) out.push(...ae());
  if (has("SA")) out.push(...sa());
  if (has("AU")) out.push(...au(c));
  if (has("CH")) out.push(...ch(c));
  return out;
}
