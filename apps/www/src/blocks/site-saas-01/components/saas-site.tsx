import { AnnouncementBar, Cta, Faq, FeatureGrid, Footer, Hero, LogoStrip, Navbar, PricingTable, StatsBand, Steps, Testimonials } from "@vamos-ui/react/blocks";
import { copyFor, customerLogos, photos, USD } from "./content";
import { InboxPreview } from "./inbox-preview";
import type { SiteLocale } from "./locale-switch";

/** One language version of the SaaS landing page. Server component: every block is plain props. */
export function SaasSite({ locale }: { locale: SiteLocale }) {
  const { t, img, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const tryFree = t({ en: "Try free for 14 days", tr: "14 gün ücretsiz deneyin" });

  return (
    <div className="vb-scope min-h-dvh bg-scene">
      <AnnouncementBar
        {...common}
        tone="accent"
        text={t({ en: "Relay 2.4: shared inboxes and Instagram replies for every plan.", tr: "Relay 2.4: tüm paketlerde ortak gelen kutusu ve Instagram yanıtları." })}
        link={{ href: "/changelog/2-4", label: t({ en: "What’s new", tr: "Yenilikler" }) }}
      />
      <Navbar
        {...common}
        variant="rail"
        sticky
        wordmark="Relay"
        homeHref="#top"
        items={[
          {
            label: t({ en: "Product", tr: "Ürün" }),
            href: "#features",
            children: [
              { label: t({ en: "Shared inbox", tr: "Ortak gelen kutusu" }), href: "#features", description: t({ en: "WhatsApp, Instagram and forms in one list", tr: "WhatsApp, Instagram ve formlar tek listede" }) },
              { label: t({ en: "Bookings", tr: "Rezervasyonlar" }), href: "#features", description: t({ en: "Turn a message into a booking in two clicks", tr: "Bir mesajı iki tıkla rezervasyona çevirin" }) },
              { label: t({ en: "Reports", tr: "Raporlar" }), href: "#numbers", description: t({ en: "Reply times per person and channel", tr: "Kişi ve kanal bazında yanıt süreleri" }) },
            ],
          },
          { label: t({ en: "Customers", tr: "Müşteriler" }), href: "#customers" },
          { label: t({ en: "Pricing", tr: "Fiyatlar" }), href: "#pricing" },
          { label: "FAQ", href: "#faq" },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[
          { link: { href: "/login", label: t({ en: "Sign in", tr: "Giriş yap" }) }, style: "secondary" },
          { link: { href: "/signup", label: t({ en: "Try free", tr: "Ücretsiz dene" }) }, style: "primary" },
        ]}
      />

      <main id="content">
        <Hero
          {...common}
          anchor="top"
          variant="product"
          release={{ tag: "v2.4", label: t({ en: "November — shared inboxes", tr: "Kasım — ortak gelen kutuları" }), href: "/changelog/2-4" }}
          title={t({ en: "Every booking request in *one* inbox.", tr: "Tüm rezervasyon talepleri *tek* kutuda." })}
          lead={t({ en: "WhatsApp, Instagram and your website form, answered by the whole front desk. Set up in an afternoon.", tr: "WhatsApp, Instagram ve web formunuz; tüm resepsiyon ekibi tarafından yanıtlanır. Bir öğleden sonrada kurulur." })}
          actions={[
            { link: { href: "/signup", label: tryFree }, style: "primary" },
            { link: { href: "/demo", label: t({ en: "Watch a 3-min demo", tr: "3 dakikalık demoyu izleyin" }) }, style: "secondary" },
          ]}
          meta={[
            { label: t({ en: "Teams", tr: "Ekip" }), value: "1,900+" },
            { label: t({ en: "Median reply", tr: "Ortanca yanıt" }), value: t({ en: "11 min", tr: "11 dk" }) },
          ]}
          visual={<InboxPreview t={t} />}
        />

        <LogoStrip {...common} anchor="customers" variant="marquee" theme={{ rhythm: "tight" }} caption={t({ en: "Used at front desks across Istanbul and Izmir", tr: "İstanbul ve İzmir’deki resepsiyonlarda kullanılıyor" })} logos={customerLogos} />

        <FeatureGrid
          {...common}
          anchor="features"
          variant="tabs"
          eyebrow={t({ en: "Product", tr: "Ürün" })}
          title={t({ en: "Built for the *front desk*, not the marketing team", tr: "Pazarlama ekibi için değil, *resepsiyon* için" })}
          items={[
            { title: t({ en: "One list for every channel", tr: "Her kanal için tek liste" }), text: t({ en: "WhatsApp Business, Instagram DMs and your site’s form land in the same inbox, newest first.", tr: "WhatsApp Business, Instagram mesajları ve site formunuz aynı kutuya, en yenisi üstte düşer." }), media: img(photos.laptop) },
            { title: t({ en: "Assign, don’t forward", tr: "İletmeyin, atayın" }), text: t({ en: "Give a conversation to a colleague; they see the whole thread and the guest sees one voice.", tr: "Bir konuşmayı bir arkadaşınıza verin; tüm geçmişi görür, misafir tek bir ses duyar." }), media: img(photos.team) },
            { title: t({ en: "Reply-time reports", tr: "Yanıt süresi raporları" }), text: t({ en: "Median and slowest replies per person, per channel, per hour of the day.", tr: "Kişi, kanal ve günün saatine göre ortanca ve en yavaş yanıtlar." }), media: img(photos.dashboard) },
            { title: t({ en: "Quiet hours", tr: "Sessiz saatler" }), text: t({ en: "Outside opening hours guests get an honest auto-reply with the time you’ll answer.", tr: "Çalışma saatleri dışında misafire ne zaman yanıt vereceğinizi söyleyen dürüst bir otomatik yanıt gider." }), media: img(photos.studio) },
          ]}
        />

        <StatsBand
          {...common}
          anchor="numbers"
          variant="inline"
          theme={{ surface: "surface-2" }}
          eyebrow={t({ en: "In numbers", tr: "Rakamlarla" })}
          items={[
            { value: 11, unit: t({ en: "min", tr: "dk" }), unitLabel: t({ en: "minutes", tr: "dakika" }), label: t({ en: "Median first reply", tr: "Ortanca ilk yanıt" }), source: t({ en: "All workspaces, Oct 2026", tr: "Tüm çalışma alanları, Ekim 2026" }) },
            { value: 38, unit: "%", label: t({ en: "Fewer missed booking requests", tr: "Daha az kaçan rezervasyon talebi" }), source: t({ en: "Customer survey, n = 214", tr: "Müşteri anketi, n = 214" }) },
            { value: 1.2, unit: "M", unitLabel: t({ en: "million", tr: "milyon" }), label: t({ en: "Messages answered last month", tr: "Geçen ay yanıtlanan mesaj" }), source: t({ en: "Relay logs, Oct 2026", tr: "Relay kayıtları, Ekim 2026" }) },
            { value: 4.9, label: t({ en: "Rating on Google Workspace Marketplace", tr: "Google Workspace Marketplace puanı" }), source: t({ en: "312 reviews", tr: "312 yorum" }) },
          ]}
        />

        <FeatureGrid
          {...common}
          variant="grid"
          columns={3}
          title={t({ en: "The boring parts, *done*", tr: "Sıkıcı kısımlar *hallolmuş*" })}
          items={[
            { icon: "calendar-check", title: t({ en: "Bookings from messages", tr: "Mesajdan rezervasyon" }), text: t({ en: "Date, time and party size picked out of the text.", tr: "Tarih, saat ve kişi sayısı metinden çıkarılır." }) },
            { icon: "users", title: t({ en: "Unlimited seats", tr: "Sınırsız kullanıcı" }), text: t({ en: "Seasonal staff join with a link and leave with a click.", tr: "Sezonluk personel bir bağlantıyla katılır, bir tıkla çıkar." }) },
            { icon: "shield-check", title: t({ en: "KVKK and GDPR", tr: "KVKK ve GDPR" }), text: t({ en: "Data stored in Frankfurt; a signed DPA on every plan.", tr: "Veriler Frankfurt’ta; her pakette imzalı veri işleme sözleşmesi." }) },
            { icon: "clock", title: t({ en: "Opening hours aware", tr: "Çalışma saatlerini bilir" }), text: t({ en: "Reports skip the hours you’re closed.", tr: "Raporlar kapalı olduğunuz saatleri saymaz." }) },
            { icon: "smartphone", title: t({ en: "iOS and Android apps", tr: "iOS ve Android uygulamaları" }), text: t({ en: "Reply from the floor; push only for assigned threads.", tr: "Salondan yanıtlayın; bildirim yalnızca size atananlar için." }) },
            { icon: "plug", title: t({ en: "Works with your POS", tr: "POS’unuzla çalışır" }), text: t({ en: "vRest, Adisyo and Google Calendar out of the box.", tr: "vRest, Adisyo ve Google Takvim hazır gelir." }) },
          ]}
        />

        <Steps
          {...common}
          variant="split"
          theme={{ surface: "surface-2" }}
          eyebrow={t({ en: "Setup", tr: "Kurulum" })}
          title={t({ en: "Live by *dinner* service", tr: "Akşam servisine *hazır*" })}
          steps={[
            { title: t({ en: "Connect WhatsApp and Instagram", tr: "WhatsApp ve Instagram’ı bağlayın" }), text: t({ en: "Scan one QR code and approve one Meta prompt.", tr: "Bir QR kod okutun, bir Meta onayı verin." }), duration: t({ en: "10 min", tr: "10 dk" }) },
            { title: t({ en: "Paste the form snippet", tr: "Form kodunu yapıştırın" }), text: t({ en: "Or keep your form and forward it to your Relay address.", tr: "Ya da formunuzu koruyup Relay adresinize yönlendirin." }), duration: t({ en: "5 min", tr: "5 dk" }) },
            { title: t({ en: "Invite the front desk", tr: "Resepsiyonu davet edin" }), text: t({ en: "Everyone signs in with their phone number.", tr: "Herkes telefon numarasıyla giriş yapar." }), duration: t({ en: "2 min", tr: "2 dk" }) },
          ]}
          actions={[{ link: { href: "/signup", label: tryFree }, style: "primary" }]}
        />

        <Testimonials
          {...common}
          variant="feature"
          items={[
            {
              quote: t({ en: "We used to lose two or three tables a weekend to unread Instagram messages. Since Relay, nobody leaves a thread unassigned — and Saturday nights are full.", tr: "Okunmamış Instagram mesajları yüzünden her hafta sonu iki üç masa kaybediyorduk. Relay’den beri hiçbir konuşma sahipsiz kalmıyor — cumartesi akşamları dolu." }),
              author: "Deniz Arslan",
              role: t({ en: "Co-owner", tr: "Ortak" }),
              company: "Kıyı Meyhane",
              logo: customerLogos[0]!.image,
            },
          ]}
        />

        <PricingTable
          {...common}
          anchor="pricing"
          theme={{ surface: "surface-2" }}
          eyebrow={t({ en: "Pricing", tr: "Fiyatlar" })}
          title={t({ en: "Priced per *location*, not per seat", tr: "Kullanıcı başına değil, *şube* başına" })}
          lead={t({ en: "Every plan includes unlimited seats, WhatsApp and Instagram. Change or cancel any month.", tr: "Tüm paketlerde sınırsız kullanıcı, WhatsApp ve Instagram vardır. Her ay değiştirin ya da iptal edin." })}
          billing="both"
          yearlySaving={t({ en: "2 months free", tr: "2 ay bedava" })}
          taxNote={t({ en: "Prices exclude 20% VAT", tr: "Fiyatlara %20 KDV dahil değildir" })}
          footnote={t({ en: "Yearly plans are billed once, up front. Cancel within 14 days for a full refund.", tr: "Yıllık paketler peşin faturalanır. 14 gün içinde iptalde ücretin tamamı iade edilir." })}
          plans={[
            {
              name: "Solo",
              description: t({ en: "One location, one WhatsApp number.", tr: "Tek şube, tek WhatsApp numarası." }),
              price: { monthly: USD("29"), yearly: USD("290") },
              features: [{ text: t({ en: "1 location", tr: "1 şube" }) }, { text: t({ en: "WhatsApp, Instagram, forms", tr: "WhatsApp, Instagram, formlar" }) }, { text: t({ en: "30-day history", tr: "30 günlük geçmiş" }) }, { text: t({ en: "Reply-time reports", tr: "Yanıt süresi raporları" }), included: false }],
              cta: { link: { href: "/signup?plan=solo", label: t({ en: "Start with Solo", tr: "Solo ile başla" }) }, style: "secondary" },
            },
            {
              name: "Team",
              description: t({ en: "A busy venue with a front desk.", tr: "Resepsiyonu olan yoğun bir mekân." }),
              price: { monthly: USD("79"), yearly: USD("790") },
              highlight: t({ en: "Most chosen", tr: "En çok tercih edilen" }),
              features: [{ text: t({ en: "Up to 3 locations", tr: "3 şubeye kadar" }) }, { text: t({ en: "Assignments and notes", tr: "Atama ve notlar" }) }, { text: t({ en: "Reply-time reports", tr: "Yanıt süresi raporları" }) }, { text: t({ en: "Unlimited history", tr: "Sınırsız geçmiş" }) }],
              cta: { link: { href: "/signup?plan=team", label: t({ en: "Start with Team", tr: "Team ile başla" }) }, style: "primary" },
            },
            {
              name: "Group",
              description: t({ en: "Several brands or many branches.", tr: "Birden çok marka ya da çok sayıda şube." }),
              custom: t({ en: "Custom", tr: "Özel" }),
              features: [{ text: t({ en: "Unlimited locations", tr: "Sınırsız şube" }) }, { text: t({ en: "SSO and audit log", tr: "SSO ve denetim kaydı" }) }, { text: t({ en: "A named account manager", tr: "Size özel müşteri temsilcisi" }) }],
              cta: { link: { href: "/contact?topic=group", label: t({ en: "Talk to sales", tr: "Satışla görüşün" }) }, style: "secondary" },
            },
          ]}
        />

        <Faq
          {...common}
          anchor="faq"
          variant="columns"
          eyebrow="FAQ"
          title={t({ en: "Questions we *hear* a lot", tr: "Sık *duyduğumuz* sorular" })}
          items={[
            { q: t({ en: "Do I need WhatsApp Business API?", tr: "WhatsApp Business API gerekli mi?" }), a: t({ en: "No. We connect your existing WhatsApp Business number; the API is handled on our side and included in the price.", tr: "Hayır. Mevcut WhatsApp Business numaranızı bağlarız; API tarafı bizde ve fiyata dahildir." }) },
            { q: t({ en: "What happens after the trial?", tr: "Deneme bitince ne olur?" }), a: t({ en: "Nothing, unless you add a card. Your inbox stays readable for 30 days.", tr: "Kart eklemezseniz hiçbir şey. Gelen kutunuz 30 gün okunabilir kalır." }) },
            { q: t({ en: "Can guests tell several people are replying?", tr: "Misafir birden fazla kişinin yanıtladığını anlar mı?" }), a: t({ en: "Only if you sign messages. By default every reply comes from the venue’s name.", tr: "Yalnızca mesajları imzalarsanız. Varsayılan olarak tüm yanıtlar mekânın adıyla gider." }) },
            { q: t({ en: "Where is our data stored?", tr: "Verilerimiz nerede saklanıyor?" }), a: t({ en: "In Frankfurt (EU). We sign a data processing agreement and a KVKK commitment with every customer.", tr: "Frankfurt’ta (AB). Her müşteriyle veri işleme sözleşmesi ve KVKK taahhütnamesi imzalarız." }) },
          ]}
          deepLink={false}
        />

        <Cta
          {...common}
          variant="band"
          theme={{ surface: "accent" }}
          title={t({ en: "Answer tonight’s messages from *one* place", tr: "Bu akşamın mesajlarını *tek* yerden yanıtlayın" })}
          actions={[
            { link: { href: "/signup", label: tryFree }, style: "primary" },
            { link: { href: "/demo", label: t({ en: "Book a demo", tr: "Demo talep edin" }) }, style: "secondary" },
          ]}
          contact={{ phone: "+902168072907", whatsapp: "+902168072907" }}
          fineprint={t({ en: "No card needed. Cancel any time.", tr: "Kart gerekmez. İstediğiniz zaman iptal edin." })}
        />
      </main>

      <Footer
        {...common}
        brand={{ name: "Relay", href: "#top" }}
        about={t({ en: "A shared inbox for restaurants, spas and clinics. Made in Istanbul.", tr: "Restoran, spa ve klinikler için ortak gelen kutusu. İstanbul’da yapıldı." })}
        columns={[
          { title: t({ en: "Product", tr: "Ürün" }), links: [{ href: "#features", label: t({ en: "Features", tr: "Özellikler" }) }, { href: "#pricing", label: t({ en: "Pricing", tr: "Fiyatlar" }) }, { href: "/changelog", label: t({ en: "Changelog", tr: "Sürüm notları" }) }] },
          { title: t({ en: "Company", tr: "Şirket" }), links: [{ href: "/about", label: t({ en: "About", tr: "Hakkımızda" }) }, { href: "/careers", label: t({ en: "Careers", tr: "Kariyer" }) }, { href: "/contact", label: t({ en: "Contact", tr: "İletişim" }) }] },
          { title: t({ en: "Help", tr: "Yardım" }), links: [{ href: "/docs", label: t({ en: "Guides", tr: "Rehberler" }) }, { href: "https://status.relay.example", label: t({ en: "Status", tr: "Durum" }), newTab: true }] },
        ]}
        contact={{ email: "hello@relay.example", phone: "+902168072907" }}
        social={[{ network: "linkedin", href: "https://linkedin.com/company/relay-inbox" }, { network: "instagram", href: "https://instagram.com/relay.inbox" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/terms", label: t({ en: "Terms", tr: "Koşullar" }) }, { href: "/dpa", label: "DPA" }]}
        year={2026}
      />
    </div>
  );
}
