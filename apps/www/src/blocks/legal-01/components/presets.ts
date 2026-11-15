import type { LegalDoc, LegalKind, LegalLocale, LegalValues } from "./types";

/*
 * Template text for the legal pages a small-business website needs. Everything in [brackets] is a
 * fill-in field. These are starting points, not legal advice: the business (or its lawyer) has to
 * check every section against what the site really does before it is published.
 */

const privacyEn: LegalDoc = {
  kind: "privacy",
  title: "Privacy policy",
  summary: "How [Company name] collects, uses and protects personal data when you use [website address] or contact us.",
  updated: "[YYYY-MM-DD]",
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      body: [
        "This website is run by [Company legal name] ([Company name]), registered at [Registered address], company / tax number [Registration number]. We are the data controller for the personal data described here.",
        "Questions about this policy: [Privacy contact email] or by post to the address above.",
      ],
    },
    {
      id: "data-we-collect",
      title: "Data we collect",
      body: [
        "We only collect what we need for the purposes below:",
        {
          list: [
            "Contact details you give us in a form, by email, phone or messaging: name, email address, phone number and your message.",
            "Booking or order details: the service or product, date and time, delivery address and payment status (card details are handled by [Payment provider], never stored by us).",
            "Technical data when you visit the site: IP address, browser, pages viewed and referring site, collected through [Analytics tool] only if you accept analytics cookies.",
          ],
        },
      ],
    },
    {
      id: "why-we-use-it",
      title: "Why we use it and on what basis",
      body: [
        {
          list: [
            "To answer your message or request and to provide what you booked or ordered (contract, or steps before a contract).",
            "To keep accounting and tax records for the period the law requires (legal obligation).",
            "To understand how the site is used and improve it (your consent, which you can withdraw in Cookie settings).",
            "To send news or offers, only if you opted in (consent; every message has an unsubscribe link).",
          ],
        },
      ],
    },
    {
      id: "sharing",
      title: "Who we share it with",
      body: [
        "We do not sell personal data. We share it only with service providers that process it for us under contract: [Hosting provider] (hosting), [Email provider] (email), [Payment provider] (payments), [Analytics tool] (analytics, with consent). Some of them may store data outside [Country]; where they do, we rely on [Transfer safeguard, e.g. standard contractual clauses].",
        "We disclose data to public authorities only when the law requires it.",
      ],
    },
    {
      id: "retention",
      title: "How long we keep it",
      body: ["Enquiries: [12 months] after the last contact. Customer and invoice records: [10 years], as tax law requires. Newsletter: until you unsubscribe. Analytics data: [14 months]."],
    },
    {
      id: "your-rights",
      title: "Your rights",
      body: [
        "You can ask us for a copy of your data, to correct or delete it, to restrict or object to its use, and to receive it in a portable format. Where we rely on consent, you can withdraw it at any time.",
        "Write to [Privacy contact email]. We answer within [30 days]. You can also complain to the data protection authority: [Supervisory authority name and website].",
      ],
    },
    {
      id: "security",
      title: "Security",
      body: ["Data is sent over an encrypted connection (HTTPS) and access is limited to the staff who need it. [Describe any other measures, e.g. two-factor sign-in, backups.]"],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: ["When this policy changes we update the date at the top of the page. Material changes are announced on the site [and by email to customers]."],
    },
  ],
};

const privacyTr: LegalDoc = {
  kind: "privacy",
  title: "Gizlilik politikası",
  summary: "[Şirket adı], [web sitesi adresi] üzerinden veya bizimle iletişime geçtiğinizde kişisel verilerinizi nasıl topladığını, kullandığını ve koruduğunu açıklar.",
  updated: "[YYYY-AA-GG]",
  sections: [
    {
      id: "biz-kimiz",
      title: "Biz kimiz",
      body: [
        "Bu web sitesi [Şirket unvanı] ([Şirket adı]) tarafından işletilmektedir. Adres: [Adres], MERSİS / vergi no: [MERSİS no]. Burada anlatılan kişisel veriler için veri sorumlusu biziz.",
        "Bu politikayla ilgili sorularınız için: [KVKK iletişim e-postası] ya da yukarıdaki adrese posta yoluyla.",
      ],
    },
    {
      id: "topladigimiz-veriler",
      title: "Topladığımız veriler",
      body: [
        "Yalnızca aşağıdaki amaçlar için gereken verileri topluyoruz:",
        {
          list: [
            "Form, e-posta, telefon veya mesajlaşma ile ilettiğiniz iletişim bilgileri: ad soyad, e-posta adresi, telefon numarası ve mesajınız.",
            "Randevu veya sipariş bilgileri: hizmet ya da ürün, tarih ve saat, teslimat adresi ve ödeme durumu (kart bilgileri [Ödeme sağlayıcısı] tarafından işlenir, bizde saklanmaz).",
            "Siteyi ziyaret ettiğinizde teknik veriler: IP adresi, tarayıcı, görüntülenen sayfalar ve geldiğiniz site; yalnızca analiz çerezlerini kabul ederseniz [Analiz aracı] ile toplanır.",
          ],
        },
      ],
    },
    {
      id: "neden-kullaniyoruz",
      title: "Verileri neden ve hangi hukuki sebeple kullanıyoruz",
      body: [
        {
          list: [
            "Mesajınızı veya talebinizi yanıtlamak, randevu ya da siparişinizi yerine getirmek (sözleşmenin kurulması ve ifası).",
            "Muhasebe ve vergi kayıtlarını kanunun öngördüğü süre boyunca tutmak (hukuki yükümlülük).",
            "Sitenin nasıl kullanıldığını anlayıp geliştirmek (açık rızanız; Çerez ayarlarından geri alabilirsiniz).",
            "Yalnızca izin verdiyseniz haber ve kampanya göndermek (açık rıza; her iletide abonelikten çıkma bağlantısı vardır).",
          ],
        },
      ],
    },
    {
      id: "paylasim",
      title: "Verileri kimlerle paylaşıyoruz",
      body: [
        "Kişisel verileri satmıyoruz. Yalnızca bizim adımıza sözleşmeyle işleyen hizmet sağlayıcılarla paylaşıyoruz: [Barındırma sağlayıcısı] (barındırma), [E-posta sağlayıcısı] (e-posta), [Ödeme sağlayıcısı] (ödeme), [Analiz aracı] (analiz, rızanızla). Bazıları verileri yurt dışında saklayabilir; bu durumda [Aktarım güvencesi, ör. standart sözleşme] kullanılır.",
        "Verileri kamu kurumlarına yalnızca kanunen zorunlu olduğunda açıklarız.",
      ],
    },
    {
      id: "saklama-suresi",
      title: "Ne kadar süre saklıyoruz",
      body: ["Talepler: son iletişimden sonra [12 ay]. Müşteri ve fatura kayıtları: vergi mevzuatı gereği [10 yıl]. Bülten: abonelikten çıkana kadar. Analiz verileri: [14 ay]."],
    },
    {
      id: "haklariniz",
      title: "Haklarınız",
      body: [
        "Verilerinizin bir kopyasını isteyebilir, düzeltilmesini veya silinmesini, işlenmesinin kısıtlanmasını talep edebilir ya da itiraz edebilirsiniz. Rızaya dayanan işlemlerde rızanızı dilediğiniz zaman geri alabilirsiniz.",
        "Başvuru: [KVKK iletişim e-postası]. En geç [30 gün] içinde yanıt veririz. Kişisel Verileri Koruma Kurulu’na da şikâyette bulunabilirsiniz.",
      ],
    },
    {
      id: "guvenlik",
      title: "Güvenlik",
      body: ["Veriler şifreli bağlantı (HTTPS) üzerinden iletilir ve yalnızca ihtiyaç duyan çalışanlar erişebilir. [Varsa diğer önlemleri yazın, ör. iki adımlı giriş, yedekleme.]"],
    },
    {
      id: "degisiklikler",
      title: "Bu politikadaki değişiklikler",
      body: ["Politika değiştiğinde sayfanın başındaki tarihi güncelleriz. Önemli değişiklikleri sitede [ve müşterilerimize e-postayla] duyururuz."],
    },
  ],
};

const kvkkEn: LegalDoc = {
  kind: "kvkk",
  title: "Personal data notice (KVKK)",
  summary: "Information notice under Article 10 of the Turkish Personal Data Protection Law No. 6698 (KVKK), given by [Company legal name] as data controller.",
  updated: "[YYYY-MM-DD]",
  sections: [
    {
      id: "data-controller",
      title: "Data controller",
      body: ["[Company legal name], [Address], MERSIS no. [MERSIS number], [Tax office] tax no. [Tax number]. Contact: [KVKK contact email], [Phone number]."],
    },
    {
      id: "data-processed",
      title: "Personal data we process",
      body: [
        {
          list: [
            "Identity: name and surname.",
            "Contact: phone number, email address, [address].",
            "Customer transaction: request, booking or order details and correspondence.",
            "Transaction security: IP address and site logs.",
            "[Add or remove categories to match what the site really collects; health data is special-category data and needs explicit consent.]",
          ],
        },
      ],
    },
    {
      id: "purposes",
      title: "Purposes of processing",
      body: [
        {
          list: [
            "Answering requests and providing the products or services you asked for.",
            "Running bookings, orders, invoicing and after-sales support.",
            "Meeting legal obligations and answering requests from authorities.",
            "Keeping the website secure.",
            "Sending commercial electronic messages, only with your separate consent.",
          ],
        },
      ],
    },
    {
      id: "legal-grounds",
      title: "Method of collection and legal grounds",
      body: [
        "Data is collected electronically through the website forms, email, phone and messaging apps, and in person at [Business location].",
        "It is processed on the grounds in Article 5(2) KVKK: performance of a contract (c), compliance with a legal obligation (ç), legitimate interest (f); and on your explicit consent (Article 5(1)) where the law requires it.",
      ],
    },
    {
      id: "transfers",
      title: "Transfers",
      body: [
        "Data may be transferred to our service providers ([Hosting provider], [Email provider], [Accounting firm]), to authorised public bodies and, where necessary, to our legal advisers, within the purposes above.",
        "[If any provider stores data abroad, name it and state the Article 9 KVKK mechanism used; otherwise delete this paragraph.]",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights under Article 11",
      body: [
        "You may learn whether your data is processed, request information about it, learn the purpose and whether it is used accordingly, know the third parties it is transferred to, request correction or deletion, object to results arising solely from automated analysis, and claim compensation for damage caused by unlawful processing.",
        "Send your request in writing to [Address] or with a secure electronic signature / registered email (KEP) to [KEP address], or from the email address registered with us to [KVKK contact email]. We answer within 30 days at the latest.",
      ],
    },
  ],
};

const kvkkTr: LegalDoc = {
  kind: "kvkk",
  title: "KVKK aydınlatma metni",
  summary: "6698 sayılı Kişisel Verilerin Korunması Kanunu’nun 10. maddesi uyarınca, veri sorumlusu sıfatıyla [Şirket unvanı] tarafından hazırlanmıştır.",
  updated: "[YYYY-AA-GG]",
  sections: [
    {
      id: "veri-sorumlusu",
      title: "Veri sorumlusu",
      body: ["[Şirket unvanı], [Adres], MERSİS no: [MERSİS no], [Vergi dairesi] V.D. [Vergi no]. İletişim: [KVKK iletişim e-postası], [Telefon numarası]."],
    },
    {
      id: "islenen-veriler",
      title: "İşlenen kişisel veriler",
      body: [
        {
          list: [
            "Kimlik: ad soyad.",
            "İletişim: telefon numarası, e-posta adresi, [adres].",
            "Müşteri işlem: talep, randevu veya sipariş bilgileri ve yazışmalar.",
            "İşlem güvenliği: IP adresi ve site kayıtları.",
            "[Sitenin gerçekte topladığı verilere göre kategori ekleyin veya çıkarın; sağlık verisi özel nitelikli veridir ve açık rıza gerektirir.]",
          ],
        },
      ],
    },
    {
      id: "isleme-amaclari",
      title: "İşleme amaçları",
      body: [
        {
          list: [
            "Taleplerin yanıtlanması ve istenen ürün veya hizmetlerin sunulması.",
            "Randevu, sipariş, faturalama ve satış sonrası destek süreçlerinin yürütülmesi.",
            "Hukuki yükümlülüklerin yerine getirilmesi ve yetkili kurumların taleplerinin karşılanması.",
            "Web sitesinin güvenliğinin sağlanması.",
            "Ayrıca onay vermeniz hâlinde ticari elektronik ileti gönderilmesi.",
          ],
        },
      ],
    },
    {
      id: "toplama-yontemi",
      title: "Toplama yöntemi ve hukuki sebep",
      body: [
        "Veriler web sitesi formları, e-posta, telefon ve mesajlaşma uygulamaları aracılığıyla elektronik ortamda ve [İşletme adresi] adresinde yüz yüze toplanır.",
        "Veriler KVKK m. 5/2 kapsamında sözleşmenin kurulması ve ifası (c), hukuki yükümlülük (ç) ve meşru menfaat (f) sebeplerine; kanunun aradığı hâllerde ise açık rızanıza (m. 5/1) dayanılarak işlenir.",
      ],
    },
    {
      id: "aktarim",
      title: "Aktarım",
      body: [
        "Veriler yukarıdaki amaçlarla sınırlı olarak hizmet sağlayıcılarımıza ([Barındırma sağlayıcısı], [E-posta sağlayıcısı], [Muhasebe bürosu]), yetkili kamu kurumlarına ve gerektiğinde hukuk danışmanlarımıza aktarılabilir.",
        "[Yurt dışında veri saklayan bir sağlayıcı varsa adını ve KVKK m. 9 kapsamındaki aktarım mekanizmasını yazın; yoksa bu paragrafı silin.]",
      ],
    },
    {
      id: "haklariniz",
      title: "KVKK m. 11 kapsamındaki haklarınız",
      body: [
        "Kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini, silinmesini ya da yok edilmesini isteme, münhasıran otomatik sistemlerle analiz sonucu aleyhinize bir sonuca itiraz etme ve kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.",
        "Başvurunuzu [Adres] adresine yazılı olarak, güvenli elektronik imza ile ya da KEP üzerinden [KEP adresi] adresine veya sistemimizde kayıtlı e-posta adresinizden [KVKK iletişim e-postası] adresine iletebilirsiniz. Başvurular en geç 30 gün içinde sonuçlandırılır.",
      ],
    },
  ],
};

const cookiesEn: LegalDoc = {
  kind: "cookies",
  title: "Cookie policy",
  summary: "Which cookies [website address] uses, what they are for and how you can change your choice.",
  updated: "[YYYY-MM-DD]",
  sections: [
    {
      id: "what-are-cookies",
      title: "What cookies are",
      body: ["Cookies are small files a website stores in your browser. Some are needed for the site to work; others are used only if you allow them."],
    },
    {
      id: "cookies-we-use",
      title: "Cookies we use",
      body: [
        {
          table: {
            caption: "Cookies on this site",
            head: ["Name", "Purpose", "Category", "Duration"],
            rows: [
              ["vamos_consent", "Remembers your cookie choice", "Necessary", "12 months"],
              ["[Cookie name]", "[What it does]", "[Analytics / Marketing]", "[Duration]"],
              ["[Cookie name]", "[What it does]", "[Analytics / Marketing]", "[Duration]"],
            ],
          },
        },
        "[List every cookie the site sets, including those from embedded maps, videos and chat widgets. Remove rows that do not apply.]",
      ],
    },
    {
      id: "your-choice",
      title: "Your choice",
      body: [
        "Necessary cookies are always on. Analytics and marketing cookies are set only after you accept them in the banner. You can change your choice at any time with Cookie settings at the bottom of every page, or delete cookies in your browser settings.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      body: ["Questions about cookies: [Privacy contact email]. More about how we use personal data is in our privacy policy."],
    },
  ],
};

const cookiesTr: LegalDoc = {
  kind: "cookies",
  title: "Çerez politikası",
  summary: "[web sitesi adresi] sitesinin hangi çerezleri kullandığı, ne işe yaradıkları ve tercihinizi nasıl değiştirebileceğiniz.",
  updated: "[YYYY-AA-GG]",
  sections: [
    {
      id: "cerez-nedir",
      title: "Çerez nedir",
      body: ["Çerezler, bir web sitesinin tarayıcınıza kaydettiği küçük dosyalardır. Bazıları sitenin çalışması için gereklidir; diğerleri yalnızca izin verirseniz kullanılır."],
    },
    {
      id: "kullandigimiz-cerezler",
      title: "Kullandığımız çerezler",
      body: [
        {
          table: {
            caption: "Bu sitedeki çerezler",
            head: ["Ad", "Amaç", "Kategori", "Süre"],
            rows: [
              ["vamos_consent", "Çerez tercihinizi hatırlar", "Zorunlu", "12 ay"],
              ["[Çerez adı]", "[Ne işe yaradığı]", "[Analiz / Pazarlama]", "[Süre]"],
              ["[Çerez adı]", "[Ne işe yaradığı]", "[Analiz / Pazarlama]", "[Süre]"],
            ],
          },
        },
        "[Gömülü harita, video ve canlı destek araçlarınınkiler dahil sitenin kullandığı tüm çerezleri listeleyin. Geçerli olmayan satırları silin.]",
      ],
    },
    {
      id: "tercihiniz",
      title: "Tercihiniz",
      body: [
        "Zorunlu çerezler her zaman açıktır. Analiz ve pazarlama çerezleri yalnızca bildirimde kabul ettikten sonra kullanılır. Tercihinizi her sayfanın altındaki Çerez ayarları ile dilediğiniz zaman değiştirebilir veya çerezleri tarayıcı ayarlarınızdan silebilirsiniz.",
      ],
    },
    {
      id: "iletisim",
      title: "İletişim",
      body: ["Çerezlerle ilgili sorularınız için: [KVKK iletişim e-postası]. Kişisel verilerin kullanımı hakkında ayrıntılar gizlilik politikamızda yer alır."],
    },
  ],
};

const termsEn: LegalDoc = {
  kind: "terms",
  title: "Terms of use",
  summary: "The rules for using [website address], run by [Company legal name].",
  updated: "[YYYY-MM-DD]",
  sections: [
    {
      id: "about",
      title: "About these terms",
      body: ["By using this website you accept these terms. If you book, order or buy through the site, the [booking / sales terms] also apply and take precedence for that purchase."],
    },
    {
      id: "information",
      title: "Information on the site",
      body: ["We keep prices, opening hours and service descriptions up to date, but they can change. [Prices include VAT unless stated otherwise.] The information here is general and does not replace professional advice for your situation."],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      body: [
        "Do not use the site to break the law, send spam or harmful code, try to get into parts of the site that are not public, or collect other people’s data.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Content and trademarks",
      body: ["Texts, photos, logos and design on this site belong to [Company name] or are used with permission. You may share links, but you may not copy content for commercial use without written permission."],
    },
    {
      id: "liability",
      title: "Liability",
      body: ["We are not responsible for losses caused by temporary unavailability of the site or by third-party websites we link to. Nothing in these terms limits liability that cannot be limited by law."],
    },
    {
      id: "law",
      title: "Governing law and contact",
      body: ["These terms are governed by the laws of [Country]; the courts of [City] have jurisdiction. Contact: [Contact email], [Registered address]."],
    },
  ],
};

const termsTr: LegalDoc = {
  kind: "terms",
  title: "Kullanım koşulları",
  summary: "[Şirket unvanı] tarafından işletilen [web sitesi adresi] sitesinin kullanım kuralları.",
  updated: "[YYYY-AA-GG]",
  sections: [
    {
      id: "kosullar-hakkinda",
      title: "Bu koşullar hakkında",
      body: ["Bu web sitesini kullanarak bu koşulları kabul etmiş olursunuz. Site üzerinden randevu, sipariş veya satın alma yaparsanız o işlem için [mesafeli satış sözleşmesi / randevu koşulları] da geçerlidir ve önceliklidir."],
    },
    {
      id: "sitedeki-bilgiler",
      title: "Sitedeki bilgiler",
      body: ["Fiyatları, çalışma saatlerini ve hizmet açıklamalarını güncel tutarız; ancak değişebilirler. [Aksi belirtilmedikçe fiyatlara KDV dahildir.] Buradaki bilgiler geneldir, durumunuza özel profesyonel tavsiyenin yerini tutmaz."],
    },
    {
      id: "kullanim-kurallari",
      title: "Kullanım kuralları",
      body: ["Siteyi hukuka aykırı amaçlarla, istenmeyen ileti veya zararlı kod göndermek, herkese açık olmayan bölümlerine erişmeye çalışmak ya da başkalarının verilerini toplamak için kullanmayın."],
    },
    {
      id: "fikri-mulkiyet",
      title: "İçerik ve markalar",
      body: ["Bu sitedeki metinler, fotoğraflar, logolar ve tasarım [Şirket adı]’na aittir veya izinle kullanılmaktadır. Bağlantı paylaşabilirsiniz; ancak yazılı izin olmadan içerikleri ticari amaçla kopyalayamazsınız."],
    },
    {
      id: "sorumluluk",
      title: "Sorumluluk",
      body: ["Sitenin geçici olarak erişilemez olmasından veya bağlantı verdiğimiz üçüncü taraf sitelerden doğan zararlardan sorumlu değiliz. Bu koşullar, kanunen sınırlandırılamayan sorumluluğu sınırlamaz."],
    },
    {
      id: "uygulanacak-hukuk",
      title: "Uygulanacak hukuk ve iletişim",
      body: ["Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır; uyuşmazlıklarda [Şehir] mahkemeleri ve icra daireleri yetkilidir. Tüketici işlemlerinde tüketici hakem heyetleri ve tüketici mahkemelerine başvuru hakkınız saklıdır. İletişim: [İletişim e-postası], [Adres]."],
    },
  ],
};

const accessibilityEn: LegalDoc = {
  kind: "accessibility",
  title: "Accessibility statement",
  summary: "[Company name] wants everyone to be able to use [website address], including people who use assistive technology.",
  updated: "[YYYY-MM-DD]",
  sections: [
    {
      id: "standard",
      title: "Our target",
      body: ["We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. The site works with a keyboard alone, with screen readers, at 200% zoom, with reduced motion and in light and dark mode."],
    },
    {
      id: "status",
      title: "Current status",
      body: [
        "We last checked the site on [YYYY-MM-DD] using [method, e.g. a self-assessment with automated tools and manual keyboard and screen-reader tests].",
        "Known issues: [List anything that does not yet work well, e.g. older PDF menus are not tagged; or write ‘None known’].",
      ],
    },
    {
      id: "feedback",
      title: "Feedback and alternatives",
      body: ["If something on the site is hard to use, tell us at [Contact email] or [Phone number]. We reply within [5 working days] and can give you the information in another format, such as by phone or email."],
    },
  ],
};

const accessibilityTr: LegalDoc = {
  kind: "accessibility",
  title: "Erişilebilirlik beyanı",
  summary: "[Şirket adı], yardımcı teknoloji kullananlar dahil herkesin [web sitesi adresi] sitesini kullanabilmesini ister.",
  updated: "[YYYY-AA-GG]",
  sections: [
    {
      id: "hedef",
      title: "Hedefimiz",
      body: ["Web İçeriği Erişilebilirlik Yönergeleri (WCAG) 2.2 AA düzeyini karşılamayı hedefliyoruz. Site yalnızca klavyeyle, ekran okuyucularla, %200 yakınlaştırmada, azaltılmış hareket ayarıyla ve açık / koyu modda kullanılabilir."],
    },
    {
      id: "mevcut-durum",
      title: "Mevcut durum",
      body: [
        "Siteyi en son [YYYY-AA-GG] tarihinde [yöntem, ör. otomatik araçlar ve klavye / ekran okuyucu testleriyle öz değerlendirme] ile kontrol ettik.",
        "Bilinen sorunlar: [Henüz iyi çalışmayan şeyleri yazın, ör. eski PDF menüler etiketli değil; ya da ‘Bilinen sorun yok’ yazın].",
      ],
    },
    {
      id: "geri-bildirim",
      title: "Geri bildirim ve alternatifler",
      body: ["Sitede kullanması zor bir şey varsa bize [İletişim e-postası] veya [Telefon numarası] üzerinden bildirin. [5 iş günü] içinde yanıt verir, bilgiyi telefon veya e-posta gibi başka bir biçimde iletebiliriz."],
    },
  ],
};

const returnsEn: LegalDoc = {
  kind: "returns",
  title: "Returns and refund policy",
  summary: "How to return a product bought from [website address], when you can cancel an order and when [Company name] refunds you.",
  updated: "[YYYY-MM-DD]",
  sections: [
    {
      id: "right-to-cancel",
      title: "Your right to cancel",
      body: [
        "You can cancel an online order within [14 days] without giving a reason. For products the period starts on the day you (or someone you name, other than the carrier) receive the goods; for services it starts on the day the contract is made.",
        "[Check the statutory withdrawal period that applies where you sell; offer a longer period here if you want to.]",
      ],
    },
    {
      id: "exceptions",
      title: "What cannot be returned",
      body: [
        "The right to cancel does not apply to:",
        {
          list: [
            "Products made to your specifications or clearly personalised for you.",
            "Products that go off quickly or are past their use-by date.",
            "Sealed products that are not suitable for return for health or hygiene reasons once unsealed (e.g. [cosmetics, underwear]).",
            "Sealed audio, video or software, and digital content once the download or streaming has started with your consent.",
            "Services fully performed within the cancellation period with your prior agreement.",
            "[Add or remove items to match what the shop really sells.]",
          ],
        },
      ],
    },
    {
      id: "how-to-return",
      title: "How to return a product",
      body: [
        {
          list: [
            "Tell us within the period: write to [Returns email], use the form at [Returns page address] or call [Phone number]. Include your order number.",
            "Send the product back within [10 days] of telling us, with its invoice and, where possible, in its original packaging, to [Returns address].",
            "Use [Carrier name] with return code [Return code]; returns sent this way are free. [Or: you pay the cost of sending the product back.]",
          ],
        },
        "Normal opening and checking of the product does not affect your right; damage caused by use beyond that may be deducted from the refund.",
      ],
    },
    {
      id: "refunds",
      title: "Refunds",
      body: [
        "We refund the full amount paid, including standard delivery, within [14 days] of receiving your cancellation, to the payment method you used. [We may wait until the product reaches us.] Card refunds can take a few more days to appear, depending on your bank.",
      ],
    },
    {
      id: "faulty-products",
      title: "Faulty or wrong products",
      body: ["If a product is faulty, damaged in delivery or not what you ordered, tell us at [Returns email] within [period] with a photo. We will repair, replace or refund it at no cost to you, as consumer law requires. This is in addition to the right to cancel."],
    },
    {
      id: "contact",
      title: "Contact",
      body: ["[Company legal name], [Registered address]. Returns: [Returns email], [Phone number], [Customer service hours]."],
    },
  ],
};

const returnsTr: LegalDoc = {
  kind: "returns",
  title: "İade ve değişim politikası",
  summary: "[web sitesi adresi] üzerinden alınan ürünlerin iadesi, cayma hakkının nasıl kullanılacağı ve [Şirket adı]’nın ödemeyi ne zaman iade ettiği.",
  updated: "[YYYY-AA-GG]",
  sections: [
    {
      id: "cayma-hakki",
      title: "Cayma hakkı",
      body: [
        "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, internet üzerinden verdiğiniz siparişlerde 14 gün içinde herhangi bir gerekçe göstermeden ve cezai şart ödemeden sözleşmeden cayabilirsiniz.",
        "Süre, ürünlerde ürünün size veya belirttiğiniz kişiye (taşıyıcı hariç) teslim edildiği gün, hizmetlerde sözleşmenin kurulduğu gün başlar. [İsterseniz daha uzun bir iade süresi tanıyın ve burada belirtin.]",
      ],
    },
    {
      id: "istisnalar",
      title: "Cayma hakkının kullanılamadığı durumlar",
      body: [
        "Mesafeli Sözleşmeler Yönetmeliği’nde sayılan hâllerde cayma hakkı yoktur. Bunlardan başlıcaları:",
        {
          list: [
            "İsteğiniz veya kişisel ihtiyaçlarınız doğrultusunda hazırlanan, kişiye özel ürünler.",
            "Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler.",
            "Ambalajı açıldıktan sonra sağlık ve hijyen açısından iadesi uygun olmayan ürünler (ör. [kozmetik, iç giyim]).",
            "Ambalajı açılmış ses veya görüntü kayıtları, yazılım ve bilgisayar sarf malzemeleri; onayınızla anında ifasına başlanan dijital içerikler.",
            "Onayınızla cayma süresi dolmadan ifasına başlanan hizmetler.",
            "[Mağazanın gerçekte sattığı ürünlere göre madde ekleyin veya çıkarın.]",
          ],
        },
      ],
    },
    {
      id: "iade-nasil-yapilir",
      title: "İade nasıl yapılır",
      body: [
        {
          list: [
            "Cayma bildiriminizi süre içinde [İade e-postası] adresine, [İade sayfası adresi] üzerindeki formla veya [Telefon numarası] numaralı telefondan iletin; sipariş numaranızı yazın.",
            "Ürünü, bildiriminizden itibaren 10 gün içinde faturasıyla ve mümkünse orijinal ambalajıyla [İade adresi] adresine gönderin.",
            "[Kargo firması] ile [İade kodu] koduyla gönderilen iadelerin kargo ücretini biz öderiz. [Farklı bir taşıyıcı kullanılırsa ücretin kime ait olduğunu yazın.]",
          ],
        },
        "Ürünün olağan kullanımı dışında oluşan değer kayıplarından tüketici sorumludur; ürünü inceleyip denemeniz cayma hakkınızı etkilemez.",
      ],
    },
    {
      id: "odeme-iadesi",
      title: "Ödemenin iadesi",
      body: [
        "Cayma bildiriminiz bize ulaştıktan sonra en geç 14 gün içinde, teslimat ücreti dahil ödediğiniz tüm tutarı, ödemede kullandığınız yöntemle ve tek seferde iade ederiz. Kartınıza yansıma süresi bankanıza göre birkaç gün uzayabilir.",
      ],
    },
    {
      id: "degisim-ve-ayipli-urun",
      title: "Değişim ve ayıplı ürünler",
      body: [
        "Beden, renk veya model değişimi için [Değişim koşullarını yazın, ör. stok durumuna göre ücretsiz değişim].",
        "Ürün ayıplı, kargoda hasar görmüş veya siparişinizden farklıysa bunu [İade e-postası] adresine fotoğrafla bildirin. 6502 sayılı Kanun’daki seçimlik haklarınızı (ücretsiz onarım, ayıpsız misliyle değişim, bedel indirimi veya sözleşmeden dönme) kullanabilirsiniz; bu haklar cayma hakkından ayrıdır.",
      ],
    },
    {
      id: "basvuru-ve-iletisim",
      title: "Başvuru ve iletişim",
      body: [
        "[Şirket unvanı], [Adres]. İade: [İade e-postası], [Telefon numarası], [Müşteri hizmetleri saatleri].",
        "Şikâyetleriniz için, Ticaret Bakanlığı’nın her yıl belirlediği parasal sınırlar içinde tüketici hakem heyetlerine, bu sınırların üzerinde tüketici mahkemelerine başvurabilirsiniz.",
      ],
    },
  ],
};

const distanceSalesEn: LegalDoc = {
  kind: "distance-sales",
  title: "Distance sales agreement",
  summary: "The agreement between [Company legal name] and the buyer for an order placed on [website address]. It is confirmed electronically at checkout and a copy is sent to the buyer by email.",
  updated: "[YYYY-MM-DD]",
  sections: [
    {
      id: "parties",
      title: "Parties",
      body: [
        {
          list: [
            "Seller: [Company legal name], [Registered address], registration no. [Registration number], tax / VAT no. [Tax number], [Contact email], [Phone number].",
            "Buyer: the person whose name, delivery address, phone and email are given in the order ([filled in automatically at checkout]).",
          ],
        },
      ],
    },
    {
      id: "subject",
      title: "Subject",
      body: ["This agreement sets out the rights and obligations of the parties for the sale and delivery of the products or services below, ordered by the buyer on [website address], under the consumer protection law of [Country]."],
    },
    {
      id: "order",
      title: "Products, price and payment",
      body: [
        {
          table: {
            caption: "Order details",
            head: ["Product or service", "Quantity", "Unit price", "Total (incl. tax)"],
            rows: [
              ["[Product name]", "[1]", "[Price]", "[Total]"],
              ["Delivery", "", "", "[Delivery cost]"],
            ],
          },
        },
        "Payment method: [card / bank transfer / cash on delivery]. Order date: [Order date]. [The table is filled from the order; keep it in the copy emailed to the buyer.]",
      ],
    },
    {
      id: "delivery",
      title: "Delivery",
      body: ["Products are delivered to the address in the order within [delivery time] and at the latest within [30 days]. If a product cannot be delivered, the seller tells the buyer before the deadline and refunds any payment within [14 days]. The risk of loss passes to the buyer on delivery."],
    },
    {
      id: "cancellation",
      title: "Right to cancel",
      body: [
        "The buyer may cancel within [14 days] of delivery (for services, of the agreement) without giving a reason, by writing to [Returns email]. The return process, exceptions and refund timing are set out in the returns and refund policy at [Returns page address], which is part of this agreement.",
      ],
    },
    {
      id: "obligations",
      title: "Obligations of the parties",
      body: [
        {
          list: [
            "The seller delivers the product as described on the site, undamaged, with its invoice and any user guide or warranty documents.",
            "The seller is responsible for faulty products under consumer law and repairs, replaces or refunds them.",
            "The buyer checks the package on delivery and reports visible damage to the carrier.",
          ],
        },
      ],
    },
    {
      id: "disputes",
      title: "Disputes and entry into force",
      body: ["This agreement is governed by the laws of [Country]. The buyer may apply to [Consumer dispute body] or the competent courts. It comes into force when the buyer confirms the order, and the seller keeps a copy for [retention period]."],
    },
  ],
};

const distanceSalesTr: LegalDoc = {
  kind: "distance-sales",
  title: "Mesafeli satış sözleşmesi",
  summary: "[web sitesi adresi] üzerinden verilen siparişe ilişkin, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında [Şirket unvanı] ile alıcı arasında kurulan sözleşme. Ödeme adımında elektronik ortamda onaylanır ve bir kopyası alıcıya e-postayla gönderilir.",
  updated: "[YYYY-AA-GG]",
  sections: [
    {
      id: "taraflar",
      title: "Taraflar",
      body: [
        {
          list: [
            "Satıcı: [Şirket unvanı], [Adres], MERSİS no: [MERSİS no], [Vergi dairesi] V.D. [Vergi no], [İletişim e-postası], [Telefon numarası], KEP: [KEP adresi].",
            "Alıcı: siparişte adı soyadı, teslimat ve fatura adresi, telefonu ve e-postası yazılı kişi ([ödeme adımında otomatik doldurulur]).",
          ],
        },
      ],
    },
    {
      id: "konu",
      title: "Sözleşmenin konusu",
      body: ["Bu sözleşme, alıcının [web sitesi adresi] üzerinden elektronik ortamda sipariş verdiği aşağıdaki ürün veya hizmetlerin satışı ve teslimiyle ilgili olarak tarafların hak ve yükümlülüklerini düzenler."],
    },
    {
      id: "urun-ve-odeme",
      title: "Ürün, fiyat ve ödeme bilgileri",
      body: [
        {
          table: {
            caption: "Sipariş bilgileri",
            head: ["Ürün veya hizmet", "Adet", "Birim fiyat", "Toplam (KDV dahil)"],
            rows: [
              ["[Ürün adı]", "[1]", "[Fiyat]", "[Toplam]"],
              ["Kargo", "", "", "[Kargo ücreti]"],
            ],
          },
        },
        "Ödeme yöntemi: [kredi kartı / havale / kapıda ödeme]. Sipariş tarihi: [Sipariş tarihi]. [Tablo siparişten doldurulur; alıcıya gönderilen kopyada yer almalıdır.]",
      ],
    },
    {
      id: "teslimat",
      title: "Teslimat",
      body: ["Ürün, siparişte belirtilen adrese [Teslim süresi] içinde ve her durumda yasal 30 günlük süreyi aşmamak kaydıyla teslim edilir. Ürünün teslim edilemeyeceği anlaşılırsa satıcı bu süre dolmadan alıcıyı bilgilendirir ve ödenen tutarı en geç 14 gün içinde iade eder. Ürün, alıcıdan başka birine teslim edilecekse satıcı bu kişiye yapılan teslimden sorumlu değildir."],
    },
    {
      id: "cayma-hakki",
      title: "Cayma hakkı",
      body: [
        "Alıcı, ürünün teslim tarihinden (hizmetlerde sözleşmenin kurulduğu günden) itibaren 14 gün içinde gerekçe göstermeden ve cezai şart ödemeden sözleşmeden cayabilir. Bildirim [İade e-postası] adresine veya [İade sayfası adresi] üzerinden yapılır.",
        "İade süreci, cayma hakkının kullanılamadığı hâller ve ödemenin iadesi, bu sözleşmenin eki sayılan iade ve değişim politikasında ([İade sayfası adresi]) yer alır.",
      ],
    },
    {
      id: "yukumlulukler",
      title: "Tarafların yükümlülükleri",
      body: [
        {
          list: [
            "Satıcı, ürünü sitede tanıtılan niteliklere uygun, sağlam, faturası ve varsa kullanım kılavuzu ile garanti belgesiyle teslim eder.",
            "Satıcı, ayıplı üründen 6502 sayılı Kanun hükümlerine göre sorumludur.",
            "Alıcı, teslim sırasında paketi kontrol eder; hasarlı paketi teslim almaz ve kargo görevlisine tutanak tutturur.",
            "Ödeme kartının alıcı dışında biri tarafından haksız kullanıldığının anlaşılması hâlinde ürün teslim edilmez veya iade edilir.",
          ],
        },
      ],
    },
    {
      id: "uyusmazlik",
      title: "Uyuşmazlıklar ve yürürlük",
      body: [
        "Uyuşmazlıklarda, Ticaret Bakanlığı’nın her yıl belirlediği parasal sınırlar içinde alıcının veya satıcının yerleşim yerindeki tüketici hakem heyetleri, bu sınırların üzerinde tüketici mahkemeleri yetkilidir.",
        "Bu sözleşme alıcının siparişi elektronik ortamda onaylamasıyla kurulur. Satıcı sözleşmeyi [Saklama süresi, ör. 3 yıl] boyunca saklar ve alıcı istediğinde bir kopyasını iletir.",
      ],
    },
  ],
};

const preInformationEn: LegalDoc = {
  kind: "pre-information",
  title: "Pre-contract information",
  summary: "What the buyer needs to know before placing an order on [website address]: who the seller is, what is being bought, the total price, delivery and the right to cancel. Shown and confirmed at checkout, before payment.",
  updated: "[YYYY-MM-DD]",
  sections: [
    {
      id: "seller",
      title: "Seller",
      body: ["[Company legal name], [Registered address], registration no. [Registration number], tax / VAT no. [Tax number]. Contact: [Contact email], [Phone number], [Customer service hours]."],
    },
    {
      id: "product",
      title: "Main characteristics of the product or service",
      body: ["[Product name], [key features: size, colour, material, model], quantity [Quantity]. The full description is on the product page at [Product page address]."],
    },
    {
      id: "price",
      title: "Total price",
      body: [
        {
          list: [
            "Price including all taxes: [Price].",
            "Delivery: [Delivery cost] ([free above an order value of …]).",
            "Total payable: [Total]. Payment method: [card / bank transfer / cash on delivery].",
            "[If an offer is time-limited, state until when the price is valid.]",
          ],
        },
      ],
    },
    {
      id: "delivery",
      title: "Delivery",
      body: ["Delivered to the address you give by [Carrier name] within [delivery time], at the latest within [30 days] of the order."],
    },
    {
      id: "cancellation",
      title: "Right to cancel",
      body: [
        "You can cancel within [14 days] of delivery (for services, of the agreement) without giving a reason by writing to [Returns email]. [State who pays the return delivery cost.] We refund the full amount within [14 days] of receiving your cancellation.",
        "There is no right to cancel for [personalised products, perishable goods, unsealed hygiene products, digital content already started and other exceptions that apply]. Details: [Returns page address].",
      ],
    },
    {
      id: "complaints",
      title: "Complaints",
      body: ["Write to [Complaints email]. You may also apply to [Consumer dispute body] or the competent courts."],
    },
    {
      id: "confirmation",
      title: "Confirmation",
      body: ["By ticking the box at checkout the buyer confirms having read this information before placing the order. The information is also part of the distance sales agreement and a copy is sent by email."],
    },
  ],
};

const preInformationTr: LegalDoc = {
  kind: "pre-information",
  title: "Ön bilgilendirme formu",
  summary: "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, [web sitesi adresi] üzerinden sipariş vermeden önce alıcıya verilen bilgiler. Ödeme adımında, siparişten önce gösterilir ve onaylanır.",
  updated: "[YYYY-AA-GG]",
  sections: [
    {
      id: "satici",
      title: "Satıcı bilgileri",
      body: ["[Şirket unvanı], [Adres], MERSİS no: [MERSİS no], [Vergi dairesi] V.D. [Vergi no], KEP: [KEP adresi]. İletişim: [İletişim e-postası], [Telefon numarası], [Müşteri hizmetleri saatleri]."],
    },
    {
      id: "urun",
      title: "Ürün veya hizmetin temel nitelikleri",
      body: ["[Ürün adı], [temel nitelikler: beden, renk, malzeme, model], adet: [Adet]. Ürünün tüm özellikleri [Ürün sayfası adresi] sayfasında yer alır."],
    },
    {
      id: "fiyat",
      title: "Fiyat ve ödeme",
      body: [
        {
          list: [
            "Tüm vergiler dahil satış fiyatı: [Fiyat].",
            "Kargo ücreti: [Kargo ücreti] ([… TL ve üzeri siparişlerde ücretsiz]).",
            "Ödenecek toplam tutar: [Toplam]. Ödeme yöntemi: [kredi kartı / havale / kapıda ödeme].",
            "[Kampanyalı fiyat varsa geçerlilik süresini yazın.]",
          ],
        },
      ],
    },
    {
      id: "teslimat",
      title: "Teslimat",
      body: ["Ürün, [Kargo firması] ile belirttiğiniz adrese [Teslim süresi] içinde ve her durumda siparişten itibaren en geç 30 gün içinde teslim edilir."],
    },
    {
      id: "cayma-hakki",
      title: "Cayma hakkı",
      body: [
        "Ürünün teslim tarihinden (hizmetlerde sözleşmenin kurulduğu günden) itibaren 14 gün içinde gerekçe göstermeden ve cezai şart ödemeden cayabilirsiniz. Bildirimi [İade e-postası] adresine veya [İade sayfası adresi] üzerinden yapabilirsiniz. [İade kargo ücretinin kime ait olduğunu yazın.] Ödediğiniz tutar, bildiriminiz bize ulaştıktan sonra en geç 14 gün içinde iade edilir.",
        "Kişiye özel hazırlanan ürünler, çabuk bozulabilen ürünler, ambalajı açılmış hijyen ürünleri, ifasına başlanmış dijital içerik ve hizmetler gibi Mesafeli Sözleşmeler Yönetmeliği’nde sayılan hâllerde cayma hakkı yoktur. [Mağazaya uyan istisnaları bırakın.]",
      ],
    },
    {
      id: "sikayet",
      title: "Şikâyet ve itiraz",
      body: ["Şikâyetlerinizi [Şikâyet e-postası] adresine iletebilirsiniz. Ticaret Bakanlığı’nın her yıl belirlediği parasal sınırlar içinde tüketici hakem heyetlerine, bu sınırların üzerinde tüketici mahkemelerine başvurabilirsiniz."],
    },
    {
      id: "onay",
      title: "Onay",
      body: ["Alıcı, ödeme adımındaki kutuyu işaretleyerek bu formu siparişten önce okuduğunu ve elektronik ortamda onayladığını kabul eder. Bu form mesafeli satış sözleşmesinin ayrılmaz parçasıdır ve bir kopyası e-postayla gönderilir."],
    },
  ],
};

const legalNoticeEn: LegalDoc = {
  kind: "legal-notice",
  title: "Legal notice",
  summary: "Who runs [website address] and how to reach them, with the company details the law requires.",
  updated: "[YYYY-MM-DD]",
  sections: [
    {
      id: "operator",
      title: "Website operator",
      body: [
        {
          list: [
            "[Company legal name] ([Legal form])",
            "Registered address: [Registered address]",
            "Represented by: [Name of director or owner]",
          ],
        },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      body: ["Email: [Contact email]. Phone: [Phone number]. [Contact form address]."],
    },
    {
      id: "registration",
      title: "Registration and tax details",
      body: [
        {
          list: [
            "Commercial register: [Register court or registry], no. [Registration number]",
            "Tax / VAT number: [Tax number]",
            "[Professional body, licence or supervisory authority, if the business needs one; otherwise delete.]",
            "[Selling online in Turkey: ETBİS (Electronic Commerce Information System) registration, with the verification link or badge.]",
          ],
        },
      ],
    },
    {
      id: "content-responsibility",
      title: "Responsible for content",
      body: ["[Name], [Address]."],
    },
    {
      id: "disclaimer",
      title: "Disclaimer",
      body: [
        "We take care to keep the information on this site correct and up to date, but we cannot guarantee that it is complete or free of errors. It is general information and does not replace professional advice.",
        "This site links to other websites. We are not responsible for their content; if we learn that a linked page breaks the law, we remove the link.",
      ],
    },
    {
      id: "copyright",
      title: "Copyright",
      body: ["Texts, photos, logos and design on this site belong to [Company name] or are used with permission. Copying them for commercial use requires written permission. Photo credits: [Photographers or image sources]."],
    },
  ],
};

const legalNoticeTr: LegalDoc = {
  kind: "legal-notice",
  title: "Yasal uyarı",
  summary: "[web sitesi adresi] sitesini kimin işlettiği, iletişim bilgileri ve kanunen paylaşılması gereken şirket bilgileri.",
  updated: "[YYYY-AA-GG]",
  sections: [
    {
      id: "site-sahibi",
      title: "Siteyi işleten",
      body: [
        {
          list: [
            "[Şirket unvanı]",
            "Adres: [Adres]",
            "Yetkili: [Şirket yetkilisinin adı]",
          ],
        },
      ],
    },
    {
      id: "iletisim",
      title: "İletişim",
      body: ["E-posta: [İletişim e-postası]. Telefon: [Telefon numarası]. KEP: [KEP adresi]."],
    },
    {
      id: "sicil-ve-vergi",
      title: "Sicil ve vergi bilgileri",
      body: [
        {
          list: [
            "MERSİS no: [MERSİS no]",
            "Ticaret sicil: [Ticaret sicil müdürlüğü], sicil no [Ticaret sicil no]",
            "Vergi dairesi ve no: [Vergi dairesi] V.D. [Vergi no]",
            "Bağlı olunan oda: [Oda adı, ör. ticaret odası veya meslek odası]",
          ],
        },
      ],
    },
    {
      id: "etbis",
      title: "ETBİS kaydı",
      body: [
        "[Şirket unvanı], Ticaret Bakanlığı Elektronik Ticaret Bilgi Sistemi’ne (ETBİS) kayıtlıdır. Kayıt doğrulama: [ETBİS doğrulama bağlantısı veya karekodu].",
        "[Site üzerinden satış yapılmıyorsa ve kayıt gerekmiyorsa bu bölümü silin.]",
      ],
    },
    {
      id: "sorumluluk-reddi",
      title: "Sorumluluk reddi",
      body: [
        "Sitedeki bilgilerin doğru ve güncel olması için özen gösteririz; ancak eksiksiz ve hatasız olduklarını garanti edemeyiz. Buradaki bilgiler geneldir ve profesyonel tavsiyenin yerini tutmaz.",
        "Sitede başka web sitelerine bağlantılar bulunur. Bu sitelerin içeriğinden sorumlu değiliz; bağlantı verdiğimiz bir sayfanın hukuka aykırı olduğunu öğrenirsek bağlantıyı kaldırırız.",
      ],
    },
    {
      id: "telif-hakki",
      title: "Telif hakkı",
      body: ["Bu sitedeki metinler, fotoğraflar, logolar ve tasarım [Şirket adı]’na aittir veya izinle kullanılmaktadır; 5846 sayılı Fikir ve Sanat Eserleri Kanunu kapsamında korunur. Yazılı izin olmadan ticari amaçla kopyalanamaz. Görsel kaynakları: [Fotoğrafçılar veya görsel kaynakları]."],
    },
  ],
};

/*
 * German and French presets, and the pages some countries add: the EU right of withdrawal (with
 * the model withdrawal form) and the California "Do Not Sell or Share" page. The withdrawal texts
 * follow the statutory models (Directive 2011/83/EU Annex I; EGBGB Anlage 1 and 2; Code de la
 * consommation, annexe à l'article R221-1); the others are templates or, where marked
 * "[Structure only]", the required headings with the fields to fill. None of them is legal advice.
 */

const legalNoticeDe: LegalDoc = {
  kind: "legal-notice",
  title: "Impressum",
  summary: "Angaben zum Anbieter von [Website-Adresse] nach [Rechtsgrundlage: § 5 DDG (Deutschland) / § 5 ECG und § 25 MedienG (Österreich) / Art. 3 Abs. 1 lit. s UWG (Schweiz)].",
  updated: "[JJJJ-MM-TT]",
  sections: [
    {
      id: "anbieter",
      title: "Anbieter",
      body: [
        {
          list: [
            "[Vollständiger Name / Firma] ([Rechtsform])",
            "Anschrift: [Anschrift]",
            "Vertreten durch: [Vertretungsberechtigte Person]",
            "[Nur bei Kapitalangaben: Stamm- bzw. Grundkapital und ggf. ausstehende Einlagen. Sonst löschen.]",
          ],
        },
      ],
    },
    {
      id: "kontakt",
      title: "Kontakt",
      body: ["E-Mail: [E-Mail-Adresse]. Telefon: [Telefonnummer]. [Weitere schnelle Kontaktmöglichkeit, z. B. Kontaktformular.]"],
    },
    {
      id: "register",
      title: "Registereintrag und Umsatzsteuer",
      body: [
        {
          list: [
            "Registergericht und Registernummer: [Registergericht], [Handelsregisternummer]",
            "Umsatzsteuer-Identifikationsnummer: [USt-IdNr.] (bzw. Wirtschafts-Identifikationsnummer, falls vorhanden)",
            "[Bei zulassungspflichtiger Tätigkeit: zuständige Aufsichtsbehörde. Sonst löschen.]",
            "[Bei reglementierten Berufen: Kammer, gesetzliche Berufsbezeichnung und Staat der Verleihung, berufsrechtliche Regelungen und wo sie zugänglich sind. Sonst löschen.]",
            "[Bei Gesellschaften in Abwicklung oder Liquidation: Hinweis darauf. Sonst löschen.]",
          ],
        },
      ],
    },
    {
      id: "verbraucherstreitbeilegung",
      title: "Verbraucherstreitbeilegung",
      body: ["[Angabe, ob Sie bereit oder verpflichtet sind, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen, und ggf. Name, Anschrift und Website der zuständigen Stelle (§ 36 VSBG). Unternehmen mit höchstens zehn Beschäftigten müssen die Bereitschaft nicht angeben.]"],
    },
    {
      id: "inhaltlich-verantwortlich",
      title: "Verantwortlich für den Inhalt",
      body: ["[Nur bei journalistisch-redaktionellen Inhalten: Name und Anschrift der verantwortlichen Person (§ 18 Abs. 2 MStV). Österreich: Offenlegung nach § 25 MedienG (Medieninhaber, Sitz, Unternehmensgegenstand). Sonst löschen.]"],
    },
  ],
};

const privacyDe: LegalDoc = {
  kind: "privacy",
  title: "Datenschutzerklärung",
  summary: "Wie [Firmenname] personenbezogene Daten verarbeitet, wenn Sie [Website-Adresse] nutzen oder uns kontaktieren (Art. 13 DSGVO).",
  updated: "[JJJJ-MM-TT]",
  sections: [
    {
      id: "verantwortlicher",
      title: "Verantwortlicher",
      body: [
        "Verantwortlich für die Datenverarbeitung auf dieser Website ist [Vollständiger Name / Firma], [Anschrift], E-Mail: [Datenschutz-E-Mail], Telefon: [Telefonnummer].",
        "[Falls benannt: Kontaktdaten der/des Datenschutzbeauftragten. Sonst löschen.]",
      ],
    },
    {
      id: "verarbeitungen",
      title: "Welche Daten wir verarbeiten, wozu und auf welcher Rechtsgrundlage",
      body: [
        {
          list: [
            "Server-Logfiles (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser): für den sicheren Betrieb der Website; Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse); Speicherdauer [7 Tage].",
            "Kontaktformular, E-Mail, Telefon: Name, Kontaktdaten und Ihre Nachricht, um Ihre Anfrage zu beantworten; Art. 6 Abs. 1 lit. b DSGVO (Vertrag oder vorvertragliche Maßnahmen) bzw. lit. f; Speicherdauer [12 Monate nach dem letzten Kontakt].",
            "Bestellungen: Name, Anschrift, Bestell- und Zahlungsdaten zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) und zur Erfüllung handels- und steuerrechtlicher Aufbewahrungspflichten (Art. 6 Abs. 1 lit. c DSGVO); Kartendaten verarbeitet [Zahlungsdienstleister], nicht wir.",
            "Cookies und ähnliche Technologien: technisch notwendige nach § 25 Abs. 2 TDDDG; alle anderen (z. B. [Analyse-Tool]) nur mit Ihrer Einwilligung nach § 25 Abs. 1 TDDDG und Art. 6 Abs. 1 lit. a DSGVO. Details in der Cookie-Richtlinie.",
            "Newsletter: nur mit Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), jederzeit über den Abmeldelink widerrufbar. [Sonst löschen.]",
          ],
        },
      ],
    },
    {
      id: "empfaenger",
      title: "Empfänger",
      body: ["Wir geben Daten nur an Dienstleister weiter, die sie in unserem Auftrag verarbeiten (Art. 28 DSGVO): [Hosting-Anbieter] (Hosting), [E-Mail-Anbieter] (E-Mail), [Zahlungsdienstleister] (Zahlung), [Analyse-Tool] (Analyse, mit Einwilligung). Eine Weitergabe an Behörden erfolgt nur bei gesetzlicher Pflicht."],
    },
    {
      id: "drittlaender",
      title: "Übermittlung in Drittländer",
      body: ["[Falls Dienstleister Daten außerhalb des EWR verarbeiten: welche, in welches Land und auf welcher Grundlage (Angemessenheitsbeschluss, z. B. EU-U.S. Data Privacy Framework, oder Standardvertragsklauseln). Sonst: „Eine Übermittlung in Drittländer findet nicht statt.“]"],
    },
    {
      id: "speicherdauer",
      title: "Speicherdauer",
      body: ["Wir löschen Daten, sobald der Zweck entfällt und keine gesetzliche Aufbewahrungspflicht besteht (z. B. [6 bzw. 10 Jahre] für Handels- und Steuerunterlagen nach HGB und AO)."],
    },
    {
      id: "ihre-rechte",
      title: "Ihre Rechte",
      body: [
        "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21). Eine Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3).",
        "Schreiben Sie dazu an [Datenschutz-E-Mail]. Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO), z. B. bei [Zuständige Aufsichtsbehörde].",
      ],
    },
    {
      id: "pflicht",
      title: "Pflicht zur Bereitstellung, automatisierte Entscheidungen",
      body: ["Für eine Bestellung oder Anfrage benötigen wir die als Pflichtfelder markierten Angaben; ohne sie können wir den Vertrag nicht schließen bzw. nicht antworten. Eine automatisierte Entscheidungsfindung einschließlich Profiling (Art. 22 DSGVO) findet [nicht] statt."],
    },
  ],
};

const cookiesDe: LegalDoc = {
  kind: "cookies",
  title: "Cookie-Richtlinie",
  summary: "Welche Cookies und ähnlichen Technologien [Website-Adresse] verwendet und wie Sie Ihre Einwilligung verwalten.",
  updated: "[JJJJ-MM-TT]",
  sections: [
    {
      id: "was-sind-cookies",
      title: "Was sind Cookies?",
      body: ["Cookies sind kleine Dateien, die Ihr Browser speichert. Ähnliche Technologien (z. B. Local Storage, Pixel) behandeln wir genauso."],
    },
    {
      id: "notwendig",
      title: "Technisch notwendige Cookies",
      body: [
        "Ohne Einwilligung setzen wir nur, was für den von Ihnen gewünschten Dienst unbedingt erforderlich ist (§ 25 Abs. 2 Nr. 2 TDDDG), z. B. das Speichern Ihrer Cookie-Auswahl oder des Warenkorbs.",
        { table: { caption: "Notwendige Cookies", head: ["Name", "Anbieter", "Zweck", "Speicherdauer"], rows: [["[cookie_consent]", "[Firmenname]", "Speichert Ihre Cookie-Auswahl", "[6 Monate]"]] } },
      ],
    },
    {
      id: "einwilligung",
      title: "Cookies nur mit Einwilligung",
      body: [
        "Analyse- und Marketing-Cookies setzen wir erst, wenn Sie im Cookie-Banner zustimmen (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO). „Ablehnen“ ist dort genauso einfach wie „Akzeptieren“.",
        { table: { caption: "Einwilligungspflichtige Cookies", head: ["Name", "Anbieter", "Zweck", "Speicherdauer"], rows: [["[_ga]", "[Analyse-Tool]", "[Reichweitenmessung]", "[14 Monate]"]] } },
      ],
    },
    {
      id: "widerruf",
      title: "Einwilligung ändern oder widerrufen",
      body: ["Sie können Ihre Auswahl jederzeit über [Link „Cookie-Einstellungen“ im Footer] ändern oder widerrufen; der Widerruf ist so einfach wie die Einwilligung. Fragen: [Datenschutz-E-Mail]."],
    },
  ],
};

const termsDe: LegalDoc = {
  kind: "terms",
  title: "Allgemeine Geschäftsbedingungen (AGB)",
  summary: "[Structure only] Gliederung mit den Angaben, die AGB für einen Online-Shop üblicherweise enthalten. Lassen Sie den Text anwaltlich erstellen oder prüfen.",
  updated: "[JJJJ-MM-TT]",
  sections: [
    { id: "geltungsbereich", title: "Geltungsbereich", body: ["[Für welche Verträge die AGB gelten; Verbraucher und Unternehmer.]"] },
    { id: "vertragspartner", title: "Vertragspartner", body: ["Der Kaufvertrag kommt zustande mit [Vollständiger Name / Firma], [Anschrift]."] },
    { id: "vertragsschluss", title: "Vertragsschluss", body: ["[Ablauf der Bestellung, Korrekturmöglichkeiten, Bestellbutton „zahlungspflichtig bestellen“, Zeitpunkt des Vertragsschlusses, Bestätigung per E-Mail.]"] },
    { id: "vertragssprache", title: "Vertragssprache und Vertragstext", body: ["[Vertragssprache; ob und wo der Vertragstext gespeichert wird und zugänglich ist.]"] },
    { id: "preise", title: "Preise und Versandkosten", body: ["[Preise inklusive Umsatzsteuer; Versandkosten und Liefergebiete.]"] },
    { id: "zahlung", title: "Zahlung", body: ["[Angebotene Zahlungsarten und Fälligkeit.]"] },
    { id: "lieferung", title: "Lieferung", body: ["[Lieferzeiten und Lieferbeschränkungen.]"] },
    { id: "widerrufsrecht", title: "Widerrufsrecht", body: ["Verbrauchern steht ein Widerrufsrecht zu; Einzelheiten in der [Widerrufsbelehrung]."] },
    { id: "gewaehrleistung", title: "Mängelhaftung", body: ["[Es gilt das gesetzliche Mängelhaftungsrecht; ggf. Angaben zu Garantien.]"] },
    { id: "streitbeilegung", title: "Streitbeilegung", body: ["[Angabe nach § 36 VSBG zur Teilnahme an Verbraucherschlichtung.]"] },
  ],
};

const withdrawalEn: LegalDoc = {
  kind: "withdrawal",
  title: "Right of withdrawal",
  summary: "Your right to withdraw from an online purchase from [Company name] within 14 days, and the model withdrawal form (EU Consumer Rights Directive, Annex I).",
  updated: "[YYYY-MM-DD]",
  sections: [
    {
      id: "right-of-withdrawal",
      title: "Right of withdrawal",
      body: [
        "You have the right to withdraw from this contract within 14 days without giving any reason.",
        "The withdrawal period will expire after 14 days from [the day of the conclusion of the contract (services, digital content) / the day on which you acquire, or a third party other than the carrier and indicated by you acquires, physical possession of the goods (goods)].",
        "To exercise the right of withdrawal, you must inform us ([Company legal name], [Registered address], [Phone number], [Contact email]) of your decision to withdraw from this contract by an unequivocal statement (e.g. a letter sent by post or email). You may use the model withdrawal form below, but it is not obligatory.",
        "[If you offer an online withdrawal function: You can also withdraw online at [Address of the withdrawal function]. We will send you an acknowledgement of receipt on a durable medium (e.g. by email) without delay.]",
        "To meet the withdrawal deadline, it is sufficient for you to send your communication concerning your exercise of the right of withdrawal before the withdrawal period has expired.",
      ],
    },
    {
      id: "effects",
      title: "Effects of withdrawal",
      body: [
        "If you withdraw from this contract, we shall reimburse to you all payments received from you, including the costs of delivery (with the exception of the supplementary costs resulting from your choice of a type of delivery other than the least expensive type of standard delivery offered by us), without undue delay and in any event not later than 14 days from the day on which we are informed about your decision to withdraw from this contract. We will carry out such reimbursement using the same means of payment as you used for the initial transaction, unless you have expressly agreed otherwise; in any event, you will not incur any fees as a result of such reimbursement.",
        "[Goods: We may withhold reimbursement until we have received the goods back or you have supplied evidence of having sent back the goods, whichever is the earliest.]",
        "[Goods: You shall send back the goods or hand them over to us or [Name and address of the person authorised to receive the goods] without undue delay and in any event not later than 14 days from the day on which you communicate your withdrawal from this contract to us. The deadline is met if you send back the goods before the period of 14 days has expired.]",
        "[Who pays the return: We will bear the cost of returning the goods. / You will have to bear the direct cost of returning the goods.]",
        "[Goods: You are only liable for any diminished value of the goods resulting from the handling other than what is necessary to establish the nature, characteristics and functioning of the goods.]",
        "[Services started during the withdrawal period at your request: you shall pay us an amount which is in proportion to what has been provided until you have communicated your withdrawal.]",
      ],
    },
    {
      id: "exceptions",
      title: "Exceptions",
      body: ["[List the exceptions that apply to what you sell, e.g. goods made to the consumer's specifications, sealed goods unsealed after delivery for health or hygiene reasons, digital content supplied with the consumer's prior consent. Delete if none.]"],
    },
    {
      id: "model-form",
      title: "Model withdrawal form",
      body: [
        "(Complete and return this form only if you wish to withdraw from the contract.)",
        {
          list: [
            "To [Company legal name], [Registered address], [Contact email]:",
            "I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*)/for the provision of the following service (*),",
            "Ordered on (*)/received on (*),",
            "Name of consumer(s),",
            "Address of consumer(s),",
            "Signature of consumer(s) (only if this form is notified on paper),",
            "Date",
          ],
        },
        "(*) Delete as appropriate.",
      ],
    },
  ],
};

const withdrawalDe: LegalDoc = {
  kind: "withdrawal",
  title: "Widerrufsbelehrung",
  summary: "Ihr Widerrufsrecht bei Verträgen mit [Firmenname] und das Muster-Widerrufsformular (nach Anlage 1 und 2 zum EGBGB).",
  updated: "[JJJJ-MM-TT]",
  sections: [
    {
      id: "widerrufsrecht",
      title: "Widerrufsrecht",
      body: [
        "Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.",
        "Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag [des Vertragsabschlusses (Dienstleistungen, digitale Inhalte) / , an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat (Kaufvertrag)].",
        "Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ([Vollständiger Name / Firma], [Anschrift], [Telefonnummer], [E-Mail-Adresse]) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.",
        "[Wenn Sie eine Widerrufsfunktion bereitstellen müssen: Sie können Ihr Widerrufsrecht auch online unter [Adresse der Widerrufsfunktion] ausüben. Wenn Sie diese Online-Funktion nutzen, übermitteln wir Ihnen auf einem dauerhaften Datenträger (z. B. durch eine E-Mail) unverzüglich eine Eingangsbestätigung mit Informationen zum Inhalt der Widerrufserklärung sowie dem Datum und der Uhrzeit ihres Eingangs.]",
        "Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.",
      ],
    },
    {
      id: "folgen",
      title: "Folgen des Widerrufs",
      body: [
        "Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.",
        "[Kaufvertrag ohne Abholung: Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.]",
        "[Waren: Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.]",
        "[Rücksendekosten: Wir tragen die Kosten der Rücksendung der Waren. / Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.]",
        "[Waren: Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.]",
        "[Dienstleistungen, die auf Ihren Wunsch während der Widerrufsfrist beginnen: Gestaltungshinweis 6 der Anlage 1 EGBGB einfügen.]",
      ],
    },
    {
      id: "muster-widerrufsformular",
      title: "Muster-Widerrufsformular",
      body: [
        "(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)",
        {
          list: [
            "An [Vollständiger Name / Firma], [Anschrift], [E-Mail-Adresse]:",
            "Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)",
            "Bestellt am (*)/erhalten am (*)",
            "Name des/der Verbraucher(s)",
            "Anschrift des/der Verbraucher(s)",
            "Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)",
            "Datum",
          ],
        },
        "(*) Unzutreffendes streichen.",
      ],
    },
  ],
};

const legalNoticeFr: LegalDoc = {
  kind: "legal-notice",
  title: "Mentions légales",
  summary: "Informations sur l’éditeur et l’hébergeur de [Adresse du site] (article 1-1 de la loi n° 2004-575 du 21 juin 2004, LCEN).",
  updated: "[AAAA-MM-JJ]",
  sections: [
    {
      id: "editeur",
      title: "Éditeur du site",
      body: [
        {
          list: [
            "[Dénomination sociale] ([Forme juridique]), au capital de [Montant du capital social]",
            "Siège social : [Adresse du siège]",
            "Immatriculation : [Numéro RCS] (ou numéro au registre national des entreprises)",
            "Numéro de TVA intracommunautaire : [Numéro de TVA intracommunautaire]",
            "Téléphone : [Numéro de téléphone]. E-mail : [Adresse e-mail]",
            "[Personne physique : nom, prénom, domicile, téléphone et, le cas échéant, numéro d’immatriculation. Sinon supprimer.]",
            "[Activité réglementée : ordre professionnel ou autorité ayant délivré l’autorisation. Sinon supprimer.]",
          ],
        },
      ],
    },
    {
      id: "directeur-publication",
      title: "Directeur de la publication",
      body: ["[Directeur de la publication]"],
    },
    {
      id: "hebergeur",
      title: "Hébergeur",
      body: ["[Nom de l’hébergeur], [Adresse de l’hébergeur], [Téléphone de l’hébergeur]."],
    },
    {
      id: "propriete-intellectuelle",
      title: "Propriété intellectuelle",
      body: ["Les textes, images, logos et la présentation de ce site appartiennent à [Nom de l’entreprise] ou sont utilisés avec autorisation. Toute reproduction sans autorisation écrite est interdite."],
    },
    {
      id: "donnees-personnelles",
      title: "Données personnelles et cookies",
      body: ["Voir notre [Politique de confidentialité] et notre page [Gestion des cookies]."],
    },
  ],
};

const privacyFr: LegalDoc = {
  kind: "privacy",
  title: "Politique de confidentialité",
  summary: "[Structure only] Les informations à fournir au titre de l’article 13 du RGPD, à rédiger pour [Nom de l’entreprise] et à faire relire.",
  updated: "[AAAA-MM-JJ]",
  sections: [
    { id: "responsable", title: "Responsable du traitement", body: ["[Dénomination sociale], [Adresse du siège], [E-mail données personnelles]. [Délégué à la protection des données, s’il est désigné.]"] },
    { id: "donnees", title: "Données collectées", body: ["[Formulaire de contact, commandes, journaux du serveur, cookies : quelles données pour chacun.]"] },
    { id: "finalites", title: "Finalités et bases légales", body: ["[Pour chaque finalité, la base légale : contrat, obligation légale, intérêt légitime, consentement.]"] },
    { id: "destinataires", title: "Destinataires", body: ["[Sous-traitants : hébergeur, messagerie, paiement, mesure d’audience.]"] },
    { id: "transferts", title: "Transferts hors de l’Union européenne", body: ["[Pays et garanties (décision d’adéquation, clauses contractuelles types), ou « aucun transfert ».]"] },
    { id: "conservation", title: "Durées de conservation", body: ["[Durée par catégorie de données.]"] },
    {
      id: "droits",
      title: "Vos droits",
      body: ["Accès, rectification, effacement, limitation, portabilité, opposition et retrait du consentement : écrivez à [E-mail données personnelles]. [Directives relatives au sort des données après le décès.] Vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr)."],
    },
  ],
};

const cookiesFr: LegalDoc = {
  kind: "cookies",
  title: "Gestion des cookies",
  summary: "[Structure only] Les traceurs utilisés sur [Adresse du site] et la manière de gérer vos choix, selon les lignes directrices de la CNIL.",
  updated: "[AAAA-MM-JJ]",
  sections: [
    { id: "exemptes", title: "Traceurs exemptés de consentement", body: [{ table: { caption: "Traceurs nécessaires", head: ["Nom", "Éditeur", "Finalité", "Durée"], rows: [["[cookie_consent]", "[Nom de l’entreprise]", "Mémoriser vos choix", "[6 mois]"]] } }] },
    { id: "consentement", title: "Traceurs soumis à votre consentement", body: ["Ils ne sont déposés qu’après votre accord. Le bandeau propose « Tout refuser » aussi simplement que « Tout accepter ».", { table: { caption: "Traceurs soumis à consentement", head: ["Nom", "Éditeur", "Finalité", "Durée"], rows: [["[_ga]", "[Outil de mesure]", "[Mesure d’audience]", "[13 mois]"]] } }] },
    { id: "choix", title: "Modifier vos choix", body: ["[Lien « Gestion des cookies » en pied de page]. Contact : [E-mail données personnelles]."] },
  ],
};

const termsFr: LegalDoc = {
  kind: "terms",
  title: "Conditions générales de vente",
  summary: "[Structure only] Le plan des conditions générales de vente d’une boutique en ligne. À rédiger ou faire vérifier par un avocat.",
  updated: "[AAAA-MM-JJ]",
  sections: [
    { id: "objet", title: "Objet et champ d’application", body: ["[Contrats concernés, clients consommateurs.]"] },
    { id: "vendeur", title: "Identité du vendeur", body: ["[Dénomination sociale], [Adresse du siège], [Numéro RCS], [Adresse e-mail], [Numéro de téléphone]."] },
    { id: "prix", title: "Prix", body: ["[Prix TTC en euros, frais de livraison.]"] },
    { id: "commande", title: "Commande", body: ["[Étapes, correction des erreurs, confirmation.]"] },
    { id: "paiement", title: "Paiement", body: ["[Moyens de paiement.]"] },
    { id: "livraison", title: "Livraison", body: ["[Délais et zones de livraison.]"] },
    { id: "retractation", title: "Droit de rétractation", body: ["Le consommateur dispose d’un délai de quatorze jours pour se rétracter ; voir la page [Droit de rétractation]."] },
    { id: "garanties", title: "Garanties légales", body: ["[Garantie légale de conformité et garantie des vices cachés : textes et modalités.]"] },
    { id: "mediation", title: "Médiation de la consommation", body: ["[Nom, adresse et site du médiateur de la consommation dont relève le vendeur.]"] },
  ],
};

const withdrawalFr: LegalDoc = {
  kind: "withdrawal",
  title: "Droit de rétractation",
  summary: "Votre droit de vous rétracter d’un achat en ligne auprès de [Nom de l’entreprise] dans un délai de quatorze jours, et le formulaire type de rétractation.",
  updated: "[AAAA-MM-JJ]",
  sections: [
    {
      id: "droit",
      title: "Droit de rétractation",
      body: [
        "Vous avez le droit de vous rétracter du présent contrat sans donner de motif dans un délai de quatorze jours.",
        "Le délai de rétractation expire quatorze jours après [le jour de la conclusion du contrat (services, contenu numérique) / le jour où vous-même, ou un tiers autre que le transporteur et désigné par vous, prenez physiquement possession du bien (biens)].",
        "Pour exercer le droit de rétractation, vous devez nous notifier ([Dénomination sociale], [Adresse du siège], [Numéro de téléphone], [Adresse e-mail]) votre décision de rétractation du présent contrat au moyen d’une déclaration dénuée d’ambiguïté (par exemple, lettre envoyée par la poste ou courrier électronique). Vous pouvez utiliser le modèle de formulaire de rétractation ci-dessous, mais ce n’est pas obligatoire.",
        "[Si vous proposez une fonction de rétractation en ligne : son adresse et l’accusé de réception envoyé sur un support durable.]",
        "Pour que le délai de rétractation soit respecté, il suffit que vous transmettiez votre communication relative à l’exercice du droit de rétractation avant l’expiration du délai de rétractation.",
      ],
    },
    {
      id: "effets",
      title: "Effets de la rétractation",
      body: [
        "En cas de rétractation de votre part du présent contrat, nous vous rembourserons tous les paiements reçus de vous, y compris les frais de livraison (à l’exception des frais supplémentaires découlant du fait que vous avez choisi, le cas échéant, un mode de livraison autre que le mode moins coûteux de livraison standard proposé par nous) sans retard excessif et, en tout état de cause, au plus tard quatorze jours à compter du jour où nous sommes informés de votre décision de rétractation du présent contrat. Nous procéderons au remboursement en utilisant le même moyen de paiement que celui que vous aurez utilisé pour la transaction initiale, sauf si vous convenez expressément d’un moyen différent ; en tout état de cause, ce remboursement n’occasionnera pas de frais pour vous.",
        "[Biens : renvoi des biens dans les quatorze jours, prise en charge des frais de retour, responsabilité en cas de dépréciation.]",
      ],
    },
    {
      id: "formulaire",
      title: "Modèle de formulaire de rétractation",
      body: [
        "(Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat.)",
        {
          list: [
            "À l’attention de [Dénomination sociale], [Adresse du siège], [Adresse e-mail] :",
            "Je/Nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*)/pour la prestation de services (*) ci-dessous :",
            "Commandé le (*)/reçu le (*) :",
            "Nom du (des) consommateur(s) :",
            "Adresse du (des) consommateur(s) :",
            "Signature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :",
            "Date :",
          ],
        },
        "(*) Rayez la mention inutile.",
      ],
    },
  ],
};

const doNotSellEn: LegalDoc = {
  kind: "do-not-sell",
  title: "Do Not Sell or Share My Personal Information",
  summary: "How California residents can opt out of the sale or sharing of their personal information by [Company name] (California Consumer Privacy Act).",
  updated: "[YYYY-MM-DD]",
  sections: [
    {
      id: "your-right",
      title: "Your right to opt out",
      body: ["If you live in California, you have the right to tell us not to sell or share your personal information. \"Sharing\" includes making it available to others for cross-context behavioral advertising, for example through advertising cookies and pixels."],
    },
    {
      id: "what-we-share",
      title: "What we sell or share",
      body: [
        "[Describe what is sold or shared, or delete this page if nothing is. Example:] We share identifiers (such as cookie IDs and IP address) and internet activity (pages viewed, ads clicked) with [Advertising partners, e.g. Google Ads, Meta] to show you relevant ads on other websites. We do not sell personal information for money. We do not knowingly sell or share the personal information of consumers under 16.",
      ],
    },
    {
      id: "how-to-opt-out",
      title: "How to opt out",
      body: [
        {
          list: [
            "Use [Cookie settings] on this site and switch off advertising cookies. Your choice applies to this browser and device.",
            "Turn on Global Privacy Control (GPC) in your browser: we treat it as a request to opt out for that browser, and show that we received it.",
            "Or email [Privacy contact email] with the subject \"Do Not Sell or Share\".",
          ],
        },
        "You do not need an account to opt out. An authorized agent may submit the request on your behalf.",
      ],
    },
    {
      id: "sensitive",
      title: "Limit the use of my sensitive personal information",
      body: ["[Only if you use sensitive personal information beyond what is needed to provide the service: describe it and how to limit it. Otherwise delete this section.]"],
    },
    {
      id: "no-discrimination",
      title: "No discrimination",
      body: ["We will not deny you goods or services, charge a different price or give a different quality because you used your privacy rights."],
    },
    {
      id: "contact",
      title: "Contact",
      body: ["Questions about this page or our [Privacy policy]: [Privacy contact email], [Phone number]."],
    },
  ],
};

/**
 * Every preset by kind and language. English exists for every kind; Turkish for the Turkish
 * pages; German and French for the pages those countries require.
 */
export const legalPresets: Record<LegalKind, Partial<Record<LegalLocale, LegalDoc>> & { en: LegalDoc }> = {
  privacy: { en: privacyEn, tr: privacyTr, de: privacyDe, fr: privacyFr },
  kvkk: { en: kvkkEn, tr: kvkkTr },
  cookies: { en: cookiesEn, tr: cookiesTr, de: cookiesDe, fr: cookiesFr },
  terms: { en: termsEn, tr: termsTr, de: termsDe, fr: termsFr },
  accessibility: { en: accessibilityEn, tr: accessibilityTr },
  returns: { en: returnsEn, tr: returnsTr },
  "distance-sales": { en: distanceSalesEn, tr: distanceSalesTr },
  "pre-information": { en: preInformationEn, tr: preInformationTr },
  "legal-notice": { en: legalNoticeEn, tr: legalNoticeTr, de: legalNoticeDe, fr: legalNoticeFr },
  withdrawal: { en: withdrawalEn, de: withdrawalDe, fr: withdrawalFr },
  "do-not-sell": { en: doNotSellEn },
};

/** The preset for one page, e.g. `legalPreset("kvkk", "tr")`. Falls back to English when there is none in that language. */
export function legalPreset(kind: LegalKind, locale: LegalLocale = "en"): LegalDoc {
  return legalPresets[kind][locale] ?? legalPresets[kind].en;
}

/** Placeholder → the LegalValues field that fills it (English and Turkish presets). */
const fillIns: Record<string, keyof LegalValues> = {
  "[Company name]": "companyName",
  "[Şirket adı]": "companyName",
  "[Company legal name]": "legalName",
  "[Şirket unvanı]": "legalName",
  "[Registered address]": "address",
  "[Address]": "address",
  "[Adres]": "address",
  "[İşletme adresi]": "address",
  "[City]": "city",
  "[Şehir]": "city",
  "[Country]": "country",
  "[Contact email]": "email",
  "[İletişim e-postası]": "email",
  "[Privacy contact email]": "privacyEmail",
  "[KVKK contact email]": "privacyEmail",
  "[KVKK iletişim e-postası]": "privacyEmail",
  "[Returns email]": "returnsEmail",
  "[İade e-postası]": "returnsEmail",
  "[Complaints email]": "complaintsEmail",
  "[Şikâyet e-postası]": "complaintsEmail",
  "[Phone number]": "phone",
  "[Telefon numarası]": "phone",
  "[website address]": "website",
  "[web sitesi adresi]": "website",
  "[MERSIS number]": "mersis",
  "[MERSİS no]": "mersis",
  "[Tax office]": "taxOffice",
  "[Vergi dairesi]": "taxOffice",
  "[Tax number]": "taxNumber",
  "[Vergi no]": "taxNumber",
  "[Registration number]": "tradeRegistry",
  "[Ticaret sicil no]": "tradeRegistry",
  "[ETBİS doğrulama bağlantısı veya karekodu]": "etbis",
  "[KEP address]": "kep",
  "[KEP adresi]": "kep",
  // German
  "[Firmenname]": "companyName",
  "[Vollständiger Name / Firma]": "legalName",
  "[Anschrift]": "address",
  "[E-Mail-Adresse]": "email",
  "[Datenschutz-E-Mail]": "privacyEmail",
  "[Telefonnummer]": "phone",
  "[Website-Adresse]": "website",
  "[Handelsregisternummer]": "tradeRegistry",
  "[USt-IdNr.]": "vatId",
  "[Vertretungsberechtigte Person]": "representative",
  // French
  "[Nom de l’entreprise]": "companyName",
  "[Dénomination sociale]": "legalName",
  "[Adresse du siège]": "address",
  "[Adresse e-mail]": "email",
  "[E-mail données personnelles]": "privacyEmail",
  "[Numéro de téléphone]": "phone",
  "[Adresse du site]": "website",
  "[Numéro RCS]": "tradeRegistry",
  "[Numéro de TVA intracommunautaire]": "vatId",
  "[Directeur de la publication]": "representative",
  // English additions
  "[VAT number]": "vatId",
};

function fillText(text: string, values: LegalValues): string {
  return text.replace(/\[[^\]]+\]/g, (field) => {
    if (field.startsWith("[Selling online in Turkey: ETBİS") && values.etbis?.trim()) return `ETBİS registration: ${values.etbis.trim()}`;
    const key = fillIns[field];
    const value = key ? values[key]?.trim() : undefined;
    return value ? value : field;
  });
}

/**
 * Fills a document's [fill-in] fields from `values`. Placeholders without a value (and the
 * per-site ones like retention periods or providers) stay in brackets and stay highlighted.
 */
export function fillLegalDoc(doc: LegalDoc, values: LegalValues = {}): LegalDoc {
  const fill = (t: string) => fillText(t, values);
  const date = values.updated?.trim();
  return {
    ...doc,
    title: fill(doc.title),
    summary: doc.summary === undefined ? undefined : fill(doc.summary),
    updated: date && /^\d{4}-\d{2}-\d{2}$/.test(date) && !/^\d{4}-\d{2}-\d{2}$/.test(doc.updated) ? date : doc.updated,
    sections: doc.sections.map((s) => ({
      ...s,
      title: fill(s.title),
      body: s.body.map((b) =>
        typeof b === "string" ? fill(b) : "list" in b ? { list: b.list.map(fill) } : { table: { ...b.table, caption: fill(b.table.caption), head: b.table.head.map(fill), rows: b.table.rows.map((r) => r.map(fill)) } },
      ),
    })),
  };
}
