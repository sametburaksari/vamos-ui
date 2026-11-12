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

/** Every preset by kind and language. English first, Turkish second. */
export const legalPresets: Record<LegalKind, Record<LegalLocale, LegalDoc>> = {
  privacy: { en: privacyEn, tr: privacyTr },
  kvkk: { en: kvkkEn, tr: kvkkTr },
  cookies: { en: cookiesEn, tr: cookiesTr },
  terms: { en: termsEn, tr: termsTr },
  accessibility: { en: accessibilityEn, tr: accessibilityTr },
  returns: { en: returnsEn, tr: returnsTr },
  "distance-sales": { en: distanceSalesEn, tr: distanceSalesTr },
  "pre-information": { en: preInformationEn, tr: preInformationTr },
  "legal-notice": { en: legalNoticeEn, tr: legalNoticeTr },
};

/** The preset for one page, e.g. `legalPreset("kvkk", "tr")`. */
export function legalPreset(kind: LegalKind, locale: LegalLocale = "en"): LegalDoc {
  return legalPresets[kind][locale];
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
