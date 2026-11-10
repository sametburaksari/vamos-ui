import { BlogList, Cta, FeatureGrid, Footer, Hero, LogoStrip, MediaText, Navbar, StatsBand, Steps, Team, Testimonials } from "@vamos-ui/react/blocks";
import { clientLogos, copyFor, journal, PHONE, photos, portraits } from "./content";
import type { SiteLocale } from "./locale-switch";

/** One language version of the agency site. Server component: every block is plain props. */
export function AgencySite({ locale }: { locale: SiteLocale }) {
  const { t, img, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  return (
    <div className="vb-scope min-h-dvh bg-scene">
      <Navbar
        {...common}
        variant="minimal"
        sticky
        wordmark="Oda Studio"
        homeHref="#top"
        items={[
          { label: t({ en: "Work", tr: "İşler" }), href: "#work" },
          { label: t({ en: "Services", tr: "Hizmetler" }), href: "#services" },
          { label: t({ en: "Studio", tr: "Stüdyo" }), href: "#studio" },
          { label: t({ en: "Journal", tr: "Yazılar" }), href: "#journal" },
          { label: t({ en: "Contact", tr: "İletişim" }), href: "#contact" },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: "#contact", label: t({ en: "Start a project", tr: "Proje başlatın" }) }, style: "primary" }]}
        panelMeta={[
          { label: t({ en: "Studio", tr: "Stüdyo" }), value: "Rıhtım Caddesi 21, Kadıköy" },
          { label: t({ en: "New projects", tr: "Yeni projeler" }), value: t({ en: "From January 2027", tr: "Ocak 2027’den itibaren" }) },
        ]}
      />

      <main id="content">
        <Hero
          {...common}
          anchor="top"
          variant="statement"
          eyebrow={t({ en: "Web studio · Kadıköy, Istanbul", tr: "Web stüdyosu · Kadıköy, İstanbul" })}
          title={t({ en: "Websites for places people *actually* visit.", tr: "İnsanların *gerçekten* gittiği yerler için web siteleri." })}
          lead={t({ en: "Twelve people building sites, booking flows and ad campaigns for restaurants, spas and clinics since 2014.", tr: "2014’ten beri restoran, spa ve klinikler için site, rezervasyon akışı ve reklam kampanyası kuran on iki kişi." })}
          services={[
            { label: t({ en: "Websites", tr: "Web siteleri" }), href: "#services" },
            { label: t({ en: "Booking systems", tr: "Rezervasyon sistemleri" }), href: "#services" },
            { label: "Google Ads", href: "#services" },
            { label: t({ en: "Photography", tr: "Fotoğraf" }), href: "#services" },
          ]}
        />

        <LogoStrip {...common} variant="grid" columns={5} theme={{ rhythm: "tight" }} caption={t({ en: "120+ businesses since 2014", tr: "2014’ten beri 120’den fazla işletme" })} logos={clientLogos} />

        <MediaText
          {...common}
          anchor="work"
          variant="overlap"
          eyebrow={t({ en: "Case study · Kıyı Meyhane", tr: "Vaka çalışması · Kıyı Meyhane" })}
          title={t({ en: "From a PDF menu to *full* Saturdays", tr: "PDF menüden *dolu* cumartesilere" })}
          body={t({
            en: "Kıyı had a beautiful room and a website that was a single PDF. We rebuilt it in six weeks: a menu that updates from the kitchen tablet, WhatsApp booking with closed days built in, and a Google profile that finally shows the right hours.",
            tr: "Kıyı’nın güzel bir salonu ve tek bir PDF’ten ibaret bir sitesi vardı. Altı haftada yeniden kurduk: mutfak tabletinden güncellenen bir menü, kapalı günleri bilen WhatsApp rezervasyonu ve sonunda doğru saatleri gösteren bir Google profili.",
          })}
          bullets={[
            t({ en: "Bookings via the site up 3.1× in four months", tr: "Siteden gelen rezervasyon dört ayda 3,1 kat arttı" }),
            t({ en: "Menu page loads in 0.9 s on a mid-range phone", tr: "Menü sayfası orta segment telefonda 0,9 sn’de açılıyor" }),
          ]}
          cta={{ link: { href: "/work/kiyi-meyhane", label: t({ en: "Read the case study", tr: "Vaka çalışmasını okuyun" }) }, style: "link" }}
          media={img(photos.diningRoom)}
          aspect="3:2"
        />

        <FeatureGrid
          {...common}
          anchor="services"
          variant="sticky-media"
          theme={{ surface: "surface-2" }}
          eyebrow={t({ en: "Services", tr: "Hizmetler" })}
          title={t({ en: "Four things, done *properly*", tr: "Dört iş, *düzgünce*" })}
          items={[
            { title: t({ en: "Websites", tr: "Web siteleri" }), text: t({ en: "Fast, bilingual sites you can edit yourself. Hosting, SSL and backups included for the first year.", tr: "Kendiniz düzenleyebileceğiniz hızlı, iki dilli siteler. İlk yıl barındırma, SSL ve yedekleme dahil." }), media: img(photos.laptop) },
            { title: t({ en: "Booking systems", tr: "Rezervasyon sistemleri" }), text: t({ en: "WhatsApp, deposit and calendar flows connected to the tools you already use.", tr: "Zaten kullandığınız araçlara bağlı WhatsApp, kapora ve takvim akışları." }), media: img(photos.clinic) },
            { title: "Google Ads", text: t({ en: "Local campaigns measured by calls and bookings — not clicks. Monthly report in plain language.", tr: "Tıklamayla değil, arama ve rezervasyonla ölçülen yerel kampanyalar. Sade dille aylık rapor." }), media: img(photos.dashboard) },
            { title: t({ en: "Photography", tr: "Fotoğraf" }), text: t({ en: "A half-day shoot of your real rooms, food and people. No stock photos, ever.", tr: "Gerçek mekânınızın, yemeklerinizin ve ekibinizin yarım günlük çekimi. Asla stok fotoğraf yok." }), media: img(photos.camera) },
          ]}
        />

        <StatsBand
          {...common}
          variant="ledger"
          eyebrow={t({ en: "2025 in figures", tr: "Rakamlarla 2025" })}
          title={t({ en: "The *annual* report, short version", tr: "Yıllık rapor, *kısa* hali" })}
          items={[
            { value: 34, label: t({ en: "Sites launched", tr: "Yayına alınan site" }), source: t({ en: "Studio project log", tr: "Stüdyo proje kaydı" }) },
            { value: 92, unit: "%", label: t({ en: "Clients still with us after a year", tr: "Bir yıl sonra hâlâ bizimle olan müşteri" }), source: t({ en: "Retainer contracts, Dec 2025", tr: "Hizmet sözleşmeleri, Aralık 2025" }) },
            { value: 1.4, unit: "s", unitLabel: t({ en: "seconds", tr: "saniye" }), label: t({ en: "Median page load on 4G", tr: "4G’de ortanca sayfa açılışı" }), source: "CrUX, p75" },
            { value: 11, label: t({ en: "Average days from brief to first design", tr: "Brief’ten ilk tasarıma ortalama gün" }), source: t({ en: "Studio project log", tr: "Stüdyo proje kaydı" }) },
          ]}
        />

        <Steps
          {...common}
          variant="vertical"
          theme={{ surface: "surface-2" }}
          eyebrow={t({ en: "How we work", tr: "Nasıl çalışıyoruz" })}
          title={t({ en: "Six weeks, *four* meetings", tr: "Altı hafta, *dört* toplantı" })}
          steps={[
            { title: t({ en: "A morning at your place", tr: "Mekânınızda bir sabah" }), text: t({ en: "We watch the front desk, read your reviews and ask what people call about.", tr: "Resepsiyonu izler, yorumlarınızı okur, insanların neden aradığını sorarız." }), duration: t({ en: "Week 1", tr: "1. hafta" }) },
            { title: t({ en: "Copy and structure", tr: "Metin ve yapı" }), text: t({ en: "Words first, in both languages. You approve a plain document, not a mock-up.", tr: "Önce kelimeler, iki dilde. Bir taslak değil, sade bir belge onaylarsınız." }), duration: t({ en: "Week 2", tr: "2. hafta" }) },
            { title: t({ en: "Design and shoot", tr: "Tasarım ve çekim" }), text: t({ en: "One design direction, refined twice; photographs taken on a weekday morning.", tr: "Tek tasarım yönü, iki kez rafine edilir; fotoğraflar bir hafta içi sabahı çekilir." }), duration: t({ en: "Weeks 3–4", tr: "3–4. hafta" }) },
            { title: t({ en: "Build and launch", tr: "Kurulum ve yayın" }), text: t({ en: "Bookings tested with your staff, Google profile updated, analytics in place.", tr: "Rezervasyonlar ekibinizle test edilir, Google profili güncellenir, ölçümleme kurulur." }), duration: t({ en: "Weeks 5–6", tr: "5–6. hafta" }) },
          ]}
        />

        <Team
          {...common}
          anchor="studio"
          variant="list"
          eyebrow={t({ en: "Studio", tr: "Stüdyo" })}
          title={t({ en: "The people you’ll *talk* to", tr: "*Konuşacağınız* kişiler" })}
          members={[
            { name: "Kerem Yıldız", role: t({ en: "Founder, strategy", tr: "Kurucu, strateji" }), specialty: t({ en: "Restaurants · Hotels", tr: "Restoranlar · Oteller" }), photo: portraits.kerem, links: [{ network: "linkedin", href: "https://linkedin.com/in/keremyildiz" }] },
            { name: "Elif Aydın", role: t({ en: "Design lead", tr: "Tasarım lideri" }), specialty: t({ en: "Type · Art direction", tr: "Tipografi · Sanat yönetimi" }), photo: portraits.elif },
            { name: "Selin Öztürk", role: t({ en: "Engineering", tr: "Yazılım" }), specialty: t({ en: "Booking flows · Performance", tr: "Rezervasyon akışları · Performans" }), photo: portraits.selin },
            { name: "Deniz Uçar", role: t({ en: "Paid search", tr: "Ücretli arama" }), specialty: t({ en: "Google Ads · Local SEO", tr: "Google Ads · Yerel SEO" }), photo: portraits.deniz },
          ]}
        />

        <Testimonials
          {...common}
          variant="carousel"
          theme={{ surface: "surface-2" }}
          eyebrow={t({ en: "Clients", tr: "Müşteriler" })}
          title={t({ en: "In their *words*", tr: "Kendi *sözleriyle*" })}
          items={[
            { quote: t({ en: "They spent a whole Saturday at the restaurant before drawing anything. The site reads like us.", tr: "Bir şey çizmeden önce bütün bir cumartesiyi restoranda geçirdiler. Site tam bizim gibi." }), author: "Deniz Arslan", role: t({ en: "Co-owner", tr: "Ortak" }), company: "Kıyı Meyhane", avatar: portraits.can },
            { quote: t({ en: "Our ads finally report bookings instead of clicks. We cut the budget by a third and got more appointments.", tr: "Reklamlarımız sonunda tıklama değil randevu raporluyor. Bütçeyi üçte bir azalttık, daha fazla randevu aldık." }), author: "Ayşe Korkmaz", role: t({ en: "Clinic manager", tr: "Klinik müdürü" }), company: "Lena Clinic", avatar: portraits.ayse },
            { quote: t({ en: "Six weeks, exactly as promised. The Turkish and English pages are equally good, which never happens.", tr: "Söz verildiği gibi tam altı hafta. Türkçe ve İngilizce sayfalar eşit derecede iyi; bu hiç olmaz." }), author: "Mert Kaya", role: t({ en: "Founder", tr: "Kurucu" }), company: "Hamam Moda" },
          ]}
        />

        <BlogList
          {...common}
          anchor="journal"
          variant="editorial"
          eyebrow={t({ en: "Journal", tr: "Yazılar" })}
          title={t({ en: "Notes from the *studio*", tr: "*Stüdyodan* notlar" })}
          allLink={{ href: "/journal", label: t({ en: "All posts", tr: "Tüm yazılar" }) }}
          posts={journal(t, img)}
        />

        <Cta
          {...common}
          anchor="contact"
          variant="minimal"
          eyebrow={t({ en: "Taking new projects from January", tr: "Ocak’tan itibaren yeni proje alıyoruz" })}
          title={t({ en: "Tell us about your *place*.", tr: "Bize mekânınızı *anlatın*." })}
          actions={[{ link: { href: "mailto:hello@odastudio.example", label: "hello@odastudio.example" }, style: "link" }]}
          fineprint={t({ en: "We reply within one working day. Or call 0216 330 04 12.", tr: "Bir iş günü içinde yanıtlarız. Ya da 0216 330 04 12’yi arayın." })}
        />
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "Oda Studio", href: "#top" }}
        about={t({ en: "A web studio for restaurants, spas and clinics. Kadıköy, since 2014.", tr: "Restoran, spa ve klinikler için bir web stüdyosu. 2014’ten beri Kadıköy’de." })}
        columns={[
          { title: t({ en: "Studio", tr: "Stüdyo" }), links: [{ href: "#work", label: t({ en: "Work", tr: "İşler" }) }, { href: "#services", label: t({ en: "Services", tr: "Hizmetler" }) }, { href: "#journal", label: t({ en: "Journal", tr: "Yazılar" }) }] },
          { title: t({ en: "Elsewhere", tr: "Diğer" }), links: [{ href: "/careers", label: t({ en: "Careers", tr: "Kariyer" }) }, { href: "/press", label: t({ en: "Press kit", tr: "Basın kiti" }) }] },
        ]}
        contact={{ phone: PHONE, email: "hello@odastudio.example", address: { line: "Rıhtım Caddesi 21", district: "Kadıköy", city: "İstanbul", postalCode: "34716", country: "TR" } }}
        social={[{ network: "instagram", href: "https://instagram.com/odastudio" }, { network: "linkedin", href: "https://linkedin.com/company/odastudio" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }]}
        year={2026}
      />
    </div>
  );
}
