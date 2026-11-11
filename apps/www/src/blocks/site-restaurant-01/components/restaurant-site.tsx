import { ContactDock, Cta, Faq, Footer, GallerySection, Hero, MapHours, MediaText, MenuList, Navbar, Testimonials } from "@vamos-ui/react/blocks";
import { branch, copyFor, enTime, hoursFor, menu, PHONE, photos, WHATSAPP } from "./content";
import type { SiteLocale } from "./locale-switch";

/** One language version of the restaurant site. Server component: every block is plain props. */
export function RestaurantSite({ locale }: { locale: SiteLocale }) {
  const { t, img, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const visit = branch(t);

  return (
    <div className="vb-scope min-h-dvh bg-scene">
      <Navbar
        {...common}
        variant="split"
        overlay
        sticky
        wordmark="Kıyı"
        homeHref="#top"
        items={[
          { label: t({ en: "Menu", tr: "Menü" }), href: "#menu" },
          { label: t({ en: "Story", tr: "Hikâye" }), href: "#story" },
          { label: t({ en: "Gallery", tr: "Galeri" }), href: "#gallery" },
          { label: t({ en: "Visit", tr: "Ziyaret" }), href: "#visit" },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: "#book", label: t({ en: "Book a table", tr: "Masa ayırt" }) }, style: "primary" }]}
        panelMeta={[
          { label: t({ en: "Address", tr: "Adres" }), value: "Bağdat Caddesi 412, Caddebostan" },
          { label: t({ en: "Tonight", tr: "Bu akşam" }), value: t({ en: `${enTime("17:00")} – ${enTime("23:30")}`, tr: "17:00 – 23:30" }) },
        ]}
      />

      <main id="content">
        <Hero
          {...common}
          anchor="top"
          variant="full-bleed"
          height="screen"
          eyebrow={t({ en: "Meyhane · Caddebostan, since 2014", tr: "Meyhane · Caddebostan, 2014’ten beri" })}
          title={t({ en: "Dinner, *slowly*.", tr: "Akşam yemeği, *yavaşça*." })}
          lead={t({ en: "Twenty-two cold meze, fish from the morning boats and a rakı list that takes a while to read.", tr: "Yirmi iki soğuk meze, sabah teknelerinden balık ve okuması zaman alan bir rakı listesi." })}
          actions={[{ link: { href: "#menu", label: t({ en: "Tonight’s menu", tr: "Bu akşamın menüsü" }) }, style: "link" }]}
          media={img(photos.diningRoom)}
          aside={{
            title: t({ en: "Open today", tr: "Bugün açığız" }),
            body: t({ en: `${enTime("17:00")} – ${enTime("23:30")} · kitchen until ${enTime("22:45")}`, tr: "17:00 – 23:30 · mutfak 22:45’e kadar" }),
            cta: { link: { href: "#book", label: t({ en: "Book a table", tr: "Masa ayırt" }) }, style: "primary" },
          }}
        />

        <MediaText
          {...common}
          anchor="story"
          variant="side"
          mediaSide="end"
          eyebrow={t({ en: "The house", tr: "Mekân" })}
          title={t({ en: "A meyhane run by *two* fishmongers’ sons", tr: "*İki* balıkçı oğlunun işlettiği bir meyhane" })}
          body={t({
            en: "Deniz and Emre Arslan grew up behind their father’s stall at Kumkapı. They still buy there at six every morning, and the board you see at night is whatever came in on the boats.\n\nThe cold meze are made by Nuran Hanım, who has been with us since the first night — the haydari recipe is hers and she is not sharing it.",
            tr: "Deniz ve Emre Arslan babalarının Kumkapı’daki tezgâhının arkasında büyüdü. Hâlâ her sabah altıda oradan alıyorlar; akşam gördüğünüz tahta, o sabah teknelerden ne geldiyse odur.\n\nSoğuk mezeleri ilk geceden beri bizimle olan Nuran Hanım yapıyor — haydarinin tarifi onun ve paylaşmıyor.",
          })}
          bullets={[
            t({ en: "Fish bought daily at Kumkapı, nothing farmed", tr: "Balık her gün Kumkapı’dan, çiftlik balığı yok" }),
            t({ en: "Forty rakıs, eleven by the glass", tr: "Kırk çeşit rakı, on biri kadehle" }),
            t({ en: "Private room upstairs for up to twelve", tr: "Üst katta on iki kişilik özel oda" }),
          ]}
          media={img(photos.mezeTable)}
          aspect="4:5"
        />

        <MenuList
          {...common}
          anchor="menu"
          theme={{ surface: "surface-2" }}
          eyebrow={t({ en: "Menu", tr: "Menü" })}
          title={t({ en: "Tonight at *Kıyı*", tr: "Bu akşam *Kıyı*’da" })}
          lead={t({ en: "The fish section changes daily and is chalked up at four. Everything else stays until the season turns.", tr: "Balık bölümü her gün değişir ve saat dörtte tahtaya yazılır. Geri kalanı mevsim dönene kadar aynıdır." })}
          categories={menu(t)}
          priceNote={t({ en: "Prices in Turkish lira, VAT included. No service charge is added to the bill.", tr: "Fiyatlar Türk lirasıdır, KDV dahildir. Hesaba servis ücreti eklenmez." })}
        />

        <GallerySection
          {...common}
          anchor="gallery"
          variant="mosaic"
          eyebrow={t({ en: "Gallery", tr: "Galeri" })}
          title={t({ en: "A table by the *window*", tr: "Pencere kenarında bir *masa*" })}
          images={[
            { image: img(photos.terrace), span: "big", caption: t({ en: "The terrace, May to October.", tr: "Teras, mayıstan ekime." }) },
            { image: img(photos.bar), span: "tall", caption: t({ en: "Forty rakıs behind the bar.", tr: "Barın arkasında kırk rakı." }) },
            { image: img(photos.meze), caption: t({ en: "The cold meze tray.", tr: "Soğuk meze tepsisi." }) },
            { image: img(photos.grill), caption: t({ en: "Bonito on oak charcoal.", tr: "Meşe kömüründe palamut." }) },
            { image: img(photos.bread), caption: t({ en: "Pide, baked at five.", tr: "Saat beşte pişen pide." }) },
          ]}
        />

        <Testimonials
          {...common}
          variant="reviews"
          eyebrow={t({ en: "Reviews", tr: "Yorumlar" })}
          title={t({ en: "What guests *say*", tr: "Misafirlerimiz *ne diyor*" })}
          summary={{ rating: 4.8, count: 1240, source: "google", link: { href: "https://g.page/r/kiyi-meyhane/review", label: t({ en: "Read all reviews", tr: "Tüm yorumları okuyun" }) } }}
          items={[
            { quote: "The lakerda alone is worth the booking. Ask for a table by the window around sunset.", author: "Murat Ç.", rating: 5, source: "google", date: "2026-11-02" },
            { quote: "Great fish, attentive service, slightly loud after ten on Saturdays.", author: "Elena R.", rating: 4, source: "google", date: "2026-10-27" },
            { quote: "Üst kattaki odayı on iki kişi için ayırttık. Fiks menü bol, iki alerjiyi sorunsuz hallettiler.", author: "Selin Y.", rating: 5, source: "google", date: "2026-10-19" },
            { quote: "Proper meyhane, proper prices. The rakı list is long; let them recommend.", author: "Thomas B.", rating: 5, source: "tripadvisor", date: "2026-10-05" },
          ]}
        />

        <Cta
          {...common}
          anchor="book"
          variant="booking"
          theme={{ surface: "surface-2", rhythm: "tight" }}
          eyebrow={t({ en: "Tuesday to Sunday", tr: "Salıdan pazara" })}
          title={t({ en: "Reserve a table", tr: "Masa ayırtın" })}
          booking={{
            provider: "whatsapp",
            whatsapp: WHATSAPP,
            fields: ["date", "time", "guests"],
            times: ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"],
            maxGuests: 10,
            closedDays: ["mon"],
            timeZone: "Europe/Istanbul",
          }}
          fineprint={t({ en: "Groups of eleven or more: call 0216 358 11 44.", tr: "On bir kişi ve üzeri gruplar için: 0216 358 11 44." })}
        />

        <MapHours
          {...common}
          anchor="visit"
          eyebrow={t({ en: "Visit", tr: "Ziyaret" })}
          title={t({ en: "Find *us*", tr: "Bizi *bulun*" })}
          businessType="Restaurant"
          branches={[visit]}
          directions={["google", "apple", "yandex"]}
        />

        <Faq
          {...common}
          variant="stacked"
          theme={{ rhythm: "tight" }}
          eyebrow={t({ en: "Before you come", tr: "Gelmeden önce" })}
          title={t({ en: "Good to *know*", tr: "Bilmekte *fayda var*" })}
          items={[
            { q: t({ en: "Do you take walk-ins?", tr: "Rezervasyonsuz geliyor muyuz?" }), a: t({ en: `Yes, at the bar and on the terrace. The dining room is usually fully booked on Fridays and Saturdays after ${enTime("19:30")}.`, tr: "Evet, bar ve terasta. Cuma ve cumartesi 19:30’dan sonra salon genellikle doludur." }) },
            { q: t({ en: "Is there a vegetarian menu?", tr: "Vejetaryen menü var mı?" }), a: t({ en: "Most of the cold meze are vegetarian and five are vegan. Tell us when you book and the kitchen will put a tray together.", tr: "Soğuk mezelerin çoğu vejetaryen, beşi vegan. Rezervasyonda belirtin, mutfak bir tepsi hazırlasın." }) },
            { q: t({ en: "Can we book the upstairs room?", tr: "Üst kattaki odayı ayırtabilir miyiz?" }), a: t({ en: "The private room seats up to twelve with a set menu from ₺2,400 per person. Write to masa@kiyimeyhane.com with your date.", tr: "Özel oda fiks menüyle on iki kişiye kadar, kişi başı ₺2.400’den başlar. Tarihinizle masa@kiyimeyhane.com adresine yazın." }) },
            { q: t({ en: "Where do we park?", tr: "Nereye park ederiz?" }), a: t({ en: `Valet parking is free from ${enTime("18:00")}. Street parking on Bağdat Caddesi is limited after seven.`, tr: "18:00’den itibaren vale ücretsizdir. Bağdat Caddesi’nde yedi’den sonra park yeri azdır." }) },
          ]}
          deepLink={false}
        />
      </main>

      <Footer
        {...common}
        theme={{ mode: "dark" }}
        brand={{ name: "Kıyı Meyhane", href: "#top" }}
        about={t({ en: "Meze, fish and rakı on Bağdat Caddesi since 2014.", tr: "2014’ten beri Bağdat Caddesi’nde meze, balık ve rakı." })}
        columns={[
          { title: t({ en: "Eat", tr: "Yemek" }), links: [{ href: "#menu", label: t({ en: "Tonight’s menu", tr: "Bu akşamın menüsü" }) }, { href: "#menu", label: t({ en: "Wine & rakı", tr: "Şarap ve rakı" }) }, { href: "#story", label: t({ en: "Private dining", tr: "Özel yemek" }) }] },
          { title: t({ en: "Visit", tr: "Ziyaret" }), links: [{ href: "#book", label: t({ en: "Book a table", tr: "Masa ayırt" }) }, { href: "#visit", label: t({ en: "Find us", tr: "Bizi bulun" }) }, { href: "/gift-cards", label: t({ en: "Gift cards", tr: "Hediye kartı" }) }] },
          { title: t({ en: "Help", tr: "Yardım" }), links: [{ href: "/contact", label: t({ en: "Contact", tr: "İletişim" }) }, { href: "/allergens", label: t({ en: "Allergens", tr: "Alerjenler" }) }] },
        ]}
        contact={{ phone: PHONE, email: "masa@kiyimeyhane.com", address: visit.address }}
        social={[{ network: "instagram", href: "https://instagram.com/kiyimeyhane" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }]}
        company={{ legalName: "Kıyı Gıda ve Turizm Ltd. Şti.", registry: [{ label: t({ en: "Tax office", tr: "Vergi dairesi" }), value: "Kozyatağı · 5840 219 337" }] }}
        year={2026}
      />

      <ContactDock
        {...common}
        variant="both"
        whatsapp={WHATSAPP}
        phone={PHONE}
        message={t({ en: "Hi, I’d like to book a table.", tr: "Merhaba, masa ayırtmak istiyorum." })}
        directionsHref="https://maps.app.goo.gl/kiyimeyhane"
        bookingHref="#book"
        actions={["call", "booking", "directions", "whatsapp"]}
        hours={hoursFor(t)}
        offHours="label"
      />
    </div>
  );
}
