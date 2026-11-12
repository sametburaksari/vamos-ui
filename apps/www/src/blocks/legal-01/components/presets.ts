import type { LegalDoc, LegalKind, LegalLocale } from "./types";

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

/** Every preset by kind and language. English first, Turkish second. */
export const legalPresets: Record<LegalKind, Record<LegalLocale, LegalDoc>> = {
  privacy: { en: privacyEn, tr: privacyTr },
  kvkk: { en: kvkkEn, tr: kvkkTr },
  cookies: { en: cookiesEn, tr: cookiesTr },
  terms: { en: termsEn, tr: termsTr },
  accessibility: { en: accessibilityEn, tr: accessibilityTr },
};

/** The preset for one page, e.g. `legalPreset("kvkk", "tr")`. */
export function legalPreset(kind: LegalKind, locale: LegalLocale = "en"): LegalDoc {
  return legalPresets[kind][locale];
}
