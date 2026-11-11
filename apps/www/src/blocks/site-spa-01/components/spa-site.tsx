import { AnnouncementBar, ContactDock, Cta, Faq, FeatureGrid, Footer, GallerySection, Hero, MapHours, MenuList, Navbar, Steps, Team, Testimonials } from "@vamos-ui/react/blocks";
import { branch, copyFor, enTime, hours, PHONE, photos, portraits, treatments, WHATSAPP } from "./content";
import type { SiteLocale } from "./locale-switch";

/** One language version of the spa site. Server component: every block is plain props. */
export function SpaSite({ locale }: { locale: SiteLocale }) {
  const { t, img, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const studio = branch(t);
  const book = t({ en: "Book a treatment", tr: "Randevu al" });

  return (
    <div className="vb-scope min-h-dvh bg-scene">
      <AnnouncementBar
        {...common}
        tone="neutral"
        text={t({ en: "Gift cards are delivered by email within minutes — valid for twelve months.", tr: "Hediye kartları dakikalar içinde e-postayla gelir — on iki ay geçerlidir." })}
        link={{ href: "/gift-cards", label: t({ en: "Send a gift card", tr: "Hediye kartı gönder" }) }}
      />
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark="Hamam Moda"
        homeHref="#top"
        items={[
          { label: t({ en: "Treatments", tr: "Bakımlar" }), href: "#prices" },
          { label: t({ en: "Your visit", tr: "Ziyaretiniz" }), href: "#visit" },
          { label: t({ en: "Team", tr: "Ekip" }), href: "#team" },
          { label: t({ en: "Find us", tr: "Ulaşım" }), href: "#find-us" },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: "#book", label: book }, style: "primary" }]}
      />

      <main id="content">
        <Hero
          {...common}
          anchor="top"
          variant="split-media"
          eyebrow={t({ en: "Hammam & spa · Moda, Kadıköy", tr: "Hamam ve spa · Moda, Kadıköy" })}
          title={t({ en: "Warm marble, *quiet* hands.", tr: "Sıcak mermer, *sakin* eller." })}
          lead={t({ en: "A 19th-century hammam restored stone by stone, with six treatment rooms upstairs. Come for an hour, leave a little slower.", tr: "Taş taş restore edilmiş 19. yüzyıl hamamı ve üst katta altı bakım odası. Bir saatliğine gelin, biraz daha yavaş çıkın." })}
          actions={[
            { link: { href: "#book", label: book }, style: "primary" },
            { link: { href: "#prices", label: t({ en: "See prices", tr: "Fiyatları gör" }) }, style: "secondary" },
          ]}
          media={img(photos.stones)}
          caption={t({ en: "Treatment room 3, second floor", tr: "3 numaralı bakım odası, ikinci kat" })}
          meta={[
            { label: t({ en: "Restored", tr: "Restorasyon" }), value: "2019" },
            { label: t({ en: "Therapists", tr: "Terapist" }), value: "11" },
            { label: t({ en: "Open daily", tr: "Her gün açık" }), value: t({ en: `from ${enTime("09:00")}`, tr: "09:00’dan itibaren" }) },
          ]}
        />

        <FeatureGrid
          {...common}
          variant="list"
          theme={{ rhythm: "tight" }}
          eyebrow={t({ en: "Why people come back", tr: "Neden geri geliyorlar" })}
          title={t({ en: "Small rooms, *long* hours", tr: "Küçük odalar, *uzun* saatler" })}
          items={[
            { title: t({ en: "One guest per therapist", tr: "Her terapiste bir misafir" }), text: t({ en: "No back-to-back bookings: every treatment has fifteen minutes of buffer before the next.", tr: "Arka arkaya randevu yok: her bakımdan sonra on beş dakika boşluk bırakılır." }) },
            { title: t({ en: "Marble heated from below", tr: "Alttan ısıtılan mermer" }), text: t({ en: "The göbektaşı is kept at 42 °C from opening to close, as it was in 1871.", tr: "Göbektaşı, 1871’de olduğu gibi açılıştan kapanışa 42 °C’de tutulur." }) },
            { title: t({ en: "Products from Ayvalık", tr: "Ayvalık’tan ürünler" }), text: t({ en: "Olive-oil soap and laurel oils from a family workshop, sold at the desk.", tr: "Bir aile atölyesinden zeytinyağlı sabun ve defne yağları, resepsiyonda satılır." }) },
            { title: t({ en: "Women’s mornings", tr: "Kadınlara özel sabahlar" }), text: t({ en: `Tuesdays ${enTime("10:00")}–${enTime("14:00")} the whole building is staffed and booked by women only.`, tr: "Salı 10:00–14:00 arası tüm bina yalnızca kadın personel ve misafirlerle çalışır." }) },
          ]}
        />

        <MenuList
          {...common}
          anchor="prices"
          variant="service-list"
          theme={{ surface: "surface-2" }}
          eyebrow={t({ en: "Price list", tr: "Fiyat listesi" })}
          title={t({ en: "Hammam, massage and *face*", tr: "Hamam, masaj ve *yüz*" })}
          bookHref="#book"
          categories={treatments(t)}
          priceNote={t({ en: "Prices in Turkish lira, VAT included. Please arrive fifteen minutes before your time.", tr: "Fiyatlar Türk lirasıdır, KDV dahildir. Randevunuzdan on beş dakika önce gelmenizi rica ederiz." })}
        />

        <Steps
          {...common}
          anchor="visit"
          variant="horizontal"
          eyebrow={t({ en: "Your visit", tr: "Ziyaretiniz" })}
          title={t({ en: "From the door to the *tea*", tr: "Kapıdan *çaya* kadar" })}
          steps={[
            { title: t({ en: "Arrive and change", tr: "Gelin ve hazırlanın" }), text: t({ en: "Lockers, peştemal and slippers are waiting at the desk.", tr: "Dolap, peştemal ve terlik resepsiyonda sizi bekler." }), duration: t({ en: "15 min", tr: "15 dk" }) },
            { title: t({ en: "Warm up on the marble", tr: "Mermerde ısının" }), text: t({ en: "Lie on the göbektaşı until your therapist calls you.", tr: "Terapistiniz çağırana kadar göbektaşına uzanın." }), duration: t({ en: "10 min", tr: "10 dk" }) },
            { title: t({ en: "Your treatment", tr: "Bakımınız" }), text: t({ en: "Kese, foam, massage — at the pressure you ask for.", tr: "Kese, köpük, masaj — istediğiniz basınçta." }) },
            { title: t({ en: "Rest upstairs", tr: "Üst katta dinlenin" }), text: t({ en: "Linden tea and dried figs in the rest room, for as long as you like.", tr: "Dinlenme odasında ıhlamur ve kuru incir, dilediğiniz kadar." }) },
          ]}
        />

        <GallerySection
          {...common}
          variant="filmstrip"
          theme={{ rhythm: "tight" }}
          eyebrow={t({ en: "The building", tr: "Bina" })}
          title={t({ en: "Inside *Hamam Moda*", tr: "*Hamam Moda*’nın içi" })}
          images={[
            { image: img(photos.room), caption: t({ en: "Room 3, prepared for a hot-stone massage.", tr: "Sıcak taş masajı için hazırlanmış 3 numaralı oda." }) },
            { image: img(photos.flowers), caption: t({ en: "Peonies at the desk, changed every Monday.", tr: "Resepsiyondaki şakayıklar, her pazartesi yenilenir." }) },
            { image: img(photos.rest), caption: t({ en: "The rest room under the dome.", tr: "Kubbenin altındaki dinlenme odası." }) },
            { image: img(photos.reception), caption: t({ en: "Reception and the shop.", tr: "Resepsiyon ve mağaza." }) },
            { image: img(photos.stones), caption: t({ en: "Basalt stones from Kula.", tr: "Kula’dan bazalt taşlar." }) },
          ]}
        />

        <Team
          {...common}
          anchor="team"
          variant="portrait"
          theme={{ surface: "surface-2" }}
          eyebrow={t({ en: "Therapists", tr: "Terapistler" })}
          title={t({ en: "Ask for them *by name*", tr: "*Adlarıyla* isteyin" })}
          members={[
            { name: "Elif Aydın", role: t({ en: "Head therapist", tr: "Baş terapist" }), specialty: t({ en: "Deep tissue · Pregnancy massage", tr: "Derin doku · Hamile masajı" }), photo: img(portraits.elif) },
            { name: "Mert Kaya", role: t({ en: "Hammam master", tr: "Tellak ustası" }), specialty: t({ en: "Kese · Foam", tr: "Kese · Köpük" }), photo: img(portraits.mert) },
            { name: "Deniz Uçar", role: t({ en: "Skin specialist", tr: "Cilt uzmanı" }), specialty: t({ en: "Facials · Lymphatic drainage", tr: "Yüz bakımı · Lenf drenajı" }), photo: img(portraits.deniz) },
          ]}
        />

        <Testimonials
          {...common}
          variant="wall"
          eyebrow={t({ en: "Guests", tr: "Misafirler" })}
          title={t({ en: "Written in the *guest book*", tr: "*Misafir defterinden*" })}
          items={[
            { quote: "Elif found the knot in my shoulder that three physios missed. I book her every month now.", author: "Ayşe K.", role: "Moda", rating: 5, source: "google", date: "2026-10-30" },
            { quote: "The ritual is worth the extra half hour. Tea upstairs afterwards is the best part.", author: "James W.", rating: 5, source: "google", date: "2026-10-21" },
            { quote: "Sakin, temiz ve özenli. Salı sabahı kadınlara özel saatler çok iyi düşünülmüş.", author: "Zeynep T.", rating: 5, source: "google", date: "2026-10-12" },
            { quote: "We came for the hammam for two on our anniversary. Quiet, warm, and nobody rushed us.", author: "Can & Melis", rating: 5, source: "direct" },
            { quote: "Prices are clear on the site and that’s exactly what we paid. Rare in Istanbul.", author: "Laura M.", rating: 4, source: "tripadvisor", date: "2026-09-28" },
          ]}
        />

        <Cta
          {...common}
          anchor="book"
          variant="booking"
          theme={{ surface: "surface-2", rhythm: "tight" }}
          eyebrow={t({ en: `Every day from ${enTime("09:00")}`, tr: "Her gün 09:00’dan itibaren" })}
          title={t({ en: "Find a time", tr: "Bir saat seçin" })}
          booking={{
            provider: "url",
            url: "https://hamammoda.example/book",
            fields: ["service", "date", "time"],
            services: [t({ en: "Traditional hammam · 45 min", tr: "Geleneksel hamam · 45 dk" }), t({ en: "Moda ritual · 90 min", tr: "Moda ritüeli · 90 dk" }), t({ en: "Swedish massage · 50 min", tr: "İsveç masajı · 50 dk" }), t({ en: "Peony facial · 50 min", tr: "Şakayık yüz bakımı · 50 dk" })],
            times: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"],
            timeZone: "Europe/Istanbul",
          }}
          fineprint={t({ en: "Free cancellation up to 24 hours before. Late cancellations are charged 50%.", tr: "24 saat öncesine kadar ücretsiz iptal. Geç iptallerde ücretin %50’si alınır." })}
        />

        <MapHours {...common} anchor="find-us" variant="info" eyebrow={t({ en: "Find us", tr: "Ulaşım" })} title={t({ en: "On *Moda Caddesi*", tr: "*Moda Caddesi*’nde" })} businessType="DaySpa" branches={[studio]} />

        <Faq
          {...common}
          variant="split"
          theme={{ rhythm: "tight" }}
          eyebrow="FAQ"
          title={t({ en: "Before your *first* visit", tr: "*İlk* ziyaretinizden önce" })}
          contact={{ link: { href: "https://wa.me/905324470912", label: t({ en: "Message us on WhatsApp", tr: "WhatsApp’tan yazın" }) }, style: "link" }}
          items={[
            { q: t({ en: "What should I bring?", tr: "Yanımda ne getirmeliyim?" }), a: t({ en: "Nothing. Peştemal, slippers, towels, shampoo and a hair dryer are provided. Bring swimwear if you prefer to wear it.", tr: "Hiçbir şey. Peştemal, terlik, havlu, şampuan ve saç kurutma makinesi bizden. İsterseniz mayo getirebilirsiniz." }) },
            { q: t({ en: "Is the hammam mixed?", tr: "Hamam karma mı?" }), a: t({ en: "Treatment rooms are private. The marble hall is mixed except on Tuesday mornings, which are for women only.", tr: "Bakım odaları özeldir. Mermer salon salı sabahları dışında karmadır; salı sabahları yalnızca kadınlara açıktır." }) },
            { q: t({ en: "Can I come while pregnant?", tr: "Hamileyken gelebilir miyim?" }), a: t({ en: "Yes, from the second trimester, for the pregnancy massage only. The hot marble is not recommended.", tr: "Evet, ikinci trimesterden itibaren, yalnızca hamile masajı için. Sıcak mermer önerilmez." }) },
            { q: t({ en: "Do you sell gift cards?", tr: "Hediye kartı satıyor musunuz?" }), a: t({ en: "Yes — for any amount or a specific treatment, delivered by email and valid for twelve months.", tr: "Evet — dilediğiniz tutarda ya da belirli bir bakım için; e-postayla gelir ve on iki ay geçerlidir." }) },
          ]}
          deepLink={false}
        />
      </main>

      <Footer
        {...common}
        variant="wordmark"
        theme={{ mode: "dark" }}
        brand={{ name: "Hamam Moda", href: "#top" }}
        about={t({ en: "Hammam, massage and skin care in Moda since 2019.", tr: "2019’dan beri Moda’da hamam, masaj ve cilt bakımı." })}
        columns={[
          { title: t({ en: "Treatments", tr: "Bakımlar" }), links: [{ href: "#prices", label: t({ en: "Hammam rituals", tr: "Hamam ritüelleri" }) }, { href: "#prices", label: t({ en: "Massage", tr: "Masaj" }) }, { href: "#prices", label: t({ en: "Facials", tr: "Yüz bakımı" }) }] },
          { title: t({ en: "Visit", tr: "Ziyaret" }), links: [{ href: "#book", label: book }, { href: "#find-us", label: t({ en: "Find us", tr: "Ulaşım" }) }, { href: "/gift-cards", label: t({ en: "Gift cards", tr: "Hediye kartı" }) }] },
        ]}
        contact={{ phone: PHONE, email: "rezervasyon@hamammoda.com", address: studio.address }}
        social={[{ network: "instagram", href: "https://instagram.com/hamammoda" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }]}
        year={2026}
      />

      <ContactDock {...common} variant="fab" whatsapp={WHATSAPP} message={t({ en: "Hi, I’d like to book a treatment.", tr: "Merhaba, randevu almak istiyorum." })} label={t({ en: "Message us", tr: "Bize yazın" })} hours={hours} offHours="label" />
    </div>
  );
}
