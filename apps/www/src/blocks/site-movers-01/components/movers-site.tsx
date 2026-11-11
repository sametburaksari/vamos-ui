import { LocaleProvider } from "@vamos-ui/react";
import { Cta, Faq, Footer, MapHours, MediaText, MenuList, Navbar, SiteShellPage, StatsBand, Steps, Team, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { FaqPage } from "./faq-page";
import { MoversHero } from "./home-parts";
import { QuotePage } from "./quote-page";
import { branches, copyFor, crew, DEFAULT_QUOTE, EMAIL, faqs, PHONE, photos, quote, reviews, type HomeSize, type ServiceKind, type SiteLocale } from "./content";

const home = (anchor?: string) => sitePageHref("home", anchor);
const quoteHref = sitePageHref("quote");
const money = (amount: number) => ({ amount: String(amount), currency: "TRY" });
/** "From" prices come from the same model as the calculator: weekday, lifts at both ends, 14 km. */
const fromPrice = (kind: ServiceKind, size: HomeSize) => money(quote({ ...DEFAULT_QUOTE, kind, size, fromLift: true, toLift: true, km: 14 }).low);

/** One language version of Tidyframe Movers: home, the quote calculator and the FAQ. */
export function MoversSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const sites = branches(t);
  const from = t({ en: "from", tr: "başlangıç" });

  const site = (
    <>
      <Navbar
        {...common}
        variant="split"
        sticky
        wordmark={
          <span className="inline-flex items-center gap-2 font-display font-semibold tracking-[-0.01em]">
            <span aria-hidden className="size-4 border-2 border-accent [box-shadow:3px_3px_0_0_var(--accent)]" />
            Tidyframe
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Services", tr: "Hizmetler" }), href: home("services") },
          { label: t({ en: "Moving day", tr: "Taşınma günü" }), href: home("day") },
          { label: t({ en: "FAQ", tr: "SSS" }), href: sitePageHref("faq") },
          { label: t({ en: "Contact", tr: "İletişim" }), href: home("contact") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: quoteHref, label: t({ en: "Get a quote", tr: "Teklif al" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Tidyframe Movers — home moves and cleaning in İstanbul", tr: "Tidyframe — İstanbul’da ev taşıma ve temizlik" })}>
          <MoversHero />
          <StatsBand
            {...common}
            variant="inline"
            items={[
              { value: t({ en: "1,840", tr: "1.840" }), label: t({ en: "homes moved since 2017", tr: "2017’den beri taşınan ev" }) },
              { value: t({ en: "9 in 10", tr: "10’da 9" }), label: t({ en: "final bills inside the online range", tr: "son fatura çevrimiçi aralıkta" }) },
              { value: t({ en: "₺750k", tr: "750 bin ₺" }), label: t({ en: "goods-in-transit cover per move", tr: "taşınma başına nakliyat sigortası" }) },
            ]}
          />
          <MenuList
            {...common}
            anchor="services"
            variant="service-list"
            eyebrow={t({ en: "Services", tr: "Hizmetler" })}
            title={t({ en: "Priced like a *spec sheet*", tr: "*Teknik şartname* gibi fiyatlı" })}
            lead={t({ en: "Starting prices on a weekday with lifts at both ends. Your quote adds stairs, distance and extras line by line.", tr: "Hafta içi, iki uçta asansörle başlangıç fiyatları. Teklifiniz merdiveni, mesafeyi ve ekstraları satır satır ekler." })}
            priceNote={t({ en: "Prices include 20% VAT. A 10% deposit holds the date.", tr: "Fiyatlara %20 KDV dahildir. %10 kapora tarihi tutar." })}
            bookHref={quoteHref}
            showAllergens={false}
            categories={[
              {
                title: t({ en: "Moving", tr: "Taşınma" }),
                items: [
                  { name: t({ en: "Studio or 1+1 move", tr: "Stüdyo veya 1+1 taşınma" }), description: t({ en: "Two movers, a 3.5 t van, blankets and floor runners.", tr: "İki taşıyıcı, 3,5 t kamyonet, battaniye ve zemin koruması." }), duration: t({ en: "4–5 h", tr: "4–5 sa" }), prices: [{ label: from, amount: fromPrice("move", "studio") }] },
                  { name: t({ en: "2+1 move", tr: "2+1 taşınma" }), description: t({ en: "Three movers and a 7.5 t truck; beds taken apart and rebuilt.", tr: "Üç taşıyıcı ve 7,5 t kamyon; yataklar sökülüp kurulur." }), duration: t({ en: "6–7 h", tr: "6–7 sa" }), prices: [{ label: from, amount: fromPrice("move", "2+1") }] },
                  { name: t({ en: "3+1 and larger", tr: "3+1 ve üzeri" }), description: t({ en: "Four or five movers, a free home survey before we quote.", tr: "Dört-beş taşıyıcı; teklif öncesi ücretsiz keşif." }), duration: t({ en: "6–8 h", tr: "6–8 sa" }), prices: [{ label: from, amount: fromPrice("move", "3+1") }] },
                ],
              },
              {
                title: t({ en: "Cleaning", tr: "Temizlik" }),
                items: [
                  { name: t({ en: "End-of-tenancy clean", tr: "Taşınma temizliği" }), description: t({ en: "Empty home, landlord’s checklist, inside cupboards and appliances.", tr: "Boş ev, ev sahibinin kontrol listesi, dolap ve cihazların içi." }), duration: t({ en: "3–8 h", tr: "3–8 sa" }), prices: [{ label: from, amount: fromPrice("clean", "studio") }] },
                  { name: t({ en: "Move-in clean", tr: "Yerleşme öncesi temizlik" }), description: t({ en: "The new home cleaned the day before the truck arrives.", tr: "Kamyon gelmeden bir gün önce yeni ev temizlenir." }), duration: t({ en: "3–6 h", tr: "3–6 sa" }), prices: [{ label: from, amount: money(2900) }] },
                ],
              },
            ]}
          />
          <MediaText
            {...common}
            anchor="day"
            variant="overlap"
            theme={{ surface: "surface-2" }}
            mediaSide="start"
            eyebrow={t({ en: "Move + clean", tr: "Taşınma + temizlik" })}
            title={t({ en: "Keys handed back the *same evening*", tr: "Anahtar *aynı akşam* teslim" })}
            body={t({ en: "Book both and Ayşe’s team arrives as the last box leaves. They work to your landlord’s checklist, photograph every room and send you the pictures for the deposit.", tr: "İkisini birlikte alın; son koli çıkarken Ayşe’nin ekibi gelir. Ev sahibinizin listesine göre çalışır, her odayı fotoğraflar ve depozito için size gönderir." })}
            bullets={[
              t({ en: "Same crew chief from survey to unloading", tr: "Keşiften boşaltmaya aynı ekip şefi" }),
              t({ en: "Floors, door frames and lifts protected", tr: "Zemin, kapı kasası ve asansör korunur" }),
              t({ en: "Room-by-room photos for your deposit", tr: "Depozito için oda oda fotoğraf" }),
            ]}
            media={{ ...photos.kitchen, alt: t(photos.kitchen.alt) }}
            aspect="3:2"
          />
          <Steps
            {...common}
            variant="split"
            eyebrow={t({ en: "Moving day", tr: "Taşınma günü" })}
            title={t({ en: "One day, *five slots*", tr: "Bir gün, *beş dilim*" })}
            steps={[
              { title: t({ en: "Crew arrives", tr: "Ekip gelir" }), text: t({ en: "Floors and lift covered before the first box moves.", tr: "İlk koli kıpırdamadan zemin ve asansör kaplanır." }), duration: "08:00" },
              { title: t({ en: "Wrap & load", tr: "Sarma ve yükleme" }), text: t({ en: "Furniture blanket-wrapped; every box numbered to a room.", tr: "Mobilyalar battaniyeyle sarılır; her koli bir odaya numaralanır." }), duration: "08:30" },
              { title: t({ en: "On the road", tr: "Yolda" }), text: t({ en: "You get a live link to the truck.", tr: "Kamyonun canlı konum bağlantısı size gelir." }), duration: "11:30" },
              { title: t({ en: "Unload by room", tr: "Odaya göre boşaltma" }), text: t({ en: "Boxes go straight to the room on their label; beds rebuilt first.", tr: "Koliler etiketindeki odaya gider; önce yataklar kurulur." }), duration: "12:30" },
              { title: t({ en: "Walk-through", tr: "Son tur" }), text: t({ en: "We check every room with you and take the empty boxes away.", tr: "Her odayı birlikte kontrol eder, boş kolileri götürürüz." }), duration: "15:00" },
            ]}
          />
          <Team {...common} variant="portrait" eyebrow={t({ en: "People", tr: "Ekip" })} title={t({ en: "The three names on *your quote*", tr: "Teklifinizdeki *üç isim*" })} members={crew.map((m) => ({ name: m.name, role: t(m.role), specialty: t(m.specialty), photo: { ...m.photo, alt: t(m.photo.alt) } }))} />
          <Testimonials
            {...common}
            variant="feature"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Reviews", tr: "Yorumlar" })}
            summary={{ rating: 4.9, count: 386, source: "google" }}
            items={reviews.map((r) => ({ quote: t(r.quote), author: r.author, role: t(r.role), rating: 5, source: "google" as const, date: r.date }))}
          />
          <Faq
            {...common}
            variant="split"
            eyebrow={t({ en: "FAQ", tr: "SSS" })}
            title={t({ en: "Most asked", tr: "En çok sorulanlar" })}
            items={faqs.slice(0, 4).map((f) => ({ q: t(f.q), a: t(f.a) }))}
            contact={{ link: { href: sitePageHref("faq"), label: t({ en: "All 10 questions", tr: "10 sorunun tümü" }) }, style: "link" }}
          />
          <MapHours {...common} anchor="contact" variant="branches" eyebrow={t({ en: "Office & warehouse", tr: "Ofis ve depo" })} title={t({ en: "Two addresses in *Ümraniye*", tr: "*Ümraniye*’de iki adres" })} businessType="LocalBusiness" branches={sites} />
          <Cta
            {...common}
            variant="band"
            theme={{ surface: "accent" }}
            title={t({ en: "See your price before you call anyone", tr: "Kimseyi aramadan fiyatınızı görün" })}
            lead={t({ en: "Five questions, one minute, a range you can plan with.", tr: "Beş soru, bir dakika, plan yapabileceğiniz bir aralık." })}
            actions={[{ link: { href: quoteHref, label: t({ en: "Start my quote", tr: "Teklifimi başlat" }) }, style: "primary" }]}
          />
        </SiteShellPage>

        <SiteShellPage id="quote" title={t({ en: "Get a quote — Tidyframe Movers", tr: "Teklif al — Tidyframe" })}>
          <QuotePage />
        </SiteShellPage>

        <SiteShellPage id="faq" title={t({ en: "FAQ — Tidyframe Movers", tr: "SSS — Tidyframe" })}>
          <FaqPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Tidyframe Movers", href: home() }}
        about={t({ en: "Home moves and cleaning across İstanbul since 2017. Licensed carrier, fully insured.", tr: "2017’den beri İstanbul genelinde ev taşıma ve temizlik. Yetki belgeli taşıyıcı, tam sigortalı." })}
        columns={[
          { title: t({ en: "Services", tr: "Hizmetler" }), links: [{ href: home("services"), label: t({ en: "Moving", tr: "Taşınma" }) }, { href: home("services"), label: t({ en: "Cleaning", tr: "Temizlik" }) }, { href: quoteHref, label: t({ en: "Get a quote", tr: "Teklif al" }) }] },
          { title: t({ en: "Help", tr: "Yardım" }), links: [{ href: sitePageHref("faq"), label: t({ en: "FAQ", tr: "SSS" }) }, { href: home("contact"), label: t({ en: "Contact", tr: "İletişim" }) }, { href: "/insurance", label: t({ en: "Insurance terms", tr: "Sigorta koşulları" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: sites[0]!.address }}
        company={{ legalName: "Tidyframe Taşımacılık ve Temizlik A.Ş.", registry: [{ label: t({ en: "Carrier licence", tr: "Yetki belgesi" }), value: "K1-0000000" }] }}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }]}
        year={2026}
      />
    </>
  );

  return locale === "tr" ? (
    <LocaleProvider locale="tr-TR" messages={tr}>
      {site}
    </LocaleProvider>
  ) : (
    <LocaleProvider locale="en-GB">{site}</LocaleProvider>
  );
}
