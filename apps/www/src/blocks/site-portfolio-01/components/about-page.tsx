import { ContactForm, Container, MediaText, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { cameraPhoto, clientGroups, copyFor, EMAIL, exhibitions, PHONE, type SiteLocale } from "./content";

/** About + contact: bio beside a still life, client list (text only), exhibitions, rates, form. */
export function AboutPage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  return (
    <>
      <PageIntro
        {...common}
        variant="simple"
        breadcrumb={[{ label: "Ilse Marén", href: sitePageHref("home") }, { label: t({ en: "About", tr: "Hakkında" }) }]}
        title={t({ en: "Slow places, *patient* people", tr: "Yavaş yerler, *sabırlı* insanlar" })}
        lead={t({
          en: "Ilse Marén (b. 1989, Rotterdam) photographs landscapes, buildings and the people who look after them. She has lived between Rotterdam and Kuzguncuk, Istanbul, since 2019.",
          tr: "Ilse Marén (1989, Rotterdam) manzaraları, binaları ve onlara bakan insanları fotoğraflıyor. 2019’dan beri Rotterdam ile İstanbul Kuzguncuk arasında yaşıyor.",
        })}
      />

      <MediaText
        {...common}
        variant="side"
        mediaSide="start"
        aspect="4:5"
        media={{ ...cameraPhoto, alt: t(cameraPhoto.alt) }}
        title={t({ en: "Behind the camera, on purpose", tr: "Bilerek kameranın arkasında" })}
        body={t({
          en: "Most commissions start with a walk, not a shot list. I work alone or with one assistant, on medium format and 35 mm, and I return to the same place until it stops performing for the camera. Clients get a small edit, not a hard drive: usually 20 to 40 frames, each one I would hang on a wall.",
          tr: "Çoğu iş bir çekim listesiyle değil, bir yürüyüşle başlar. Tek başıma ya da bir asistanla, orta format ve 35 mm ile çalışırım; bir yer kamera için poz vermeyi bırakana kadar oraya geri dönerim. Müşteriler bir hard disk değil, küçük bir seçki alır: genellikle her biri duvara asacağım 20 ila 40 kare.",
        })}
        bullets={[
          t({ en: "Day rate from €1,800; editorial rates on request", tr: "Günlük ücret 1.800 €’dan başlar; yayın ücretleri talep üzerine" }),
          t({ en: "Licensing quoted per use, territory and term", tr: "Lisans; kullanım, bölge ve süreye göre fiyatlandırılır" }),
          t({ en: "Booking from January 2027", tr: "Ocak 2027’den itibaren rezervasyon" }),
        ]}
      />

      <Section theme={{ rhythm: "tight" }} aria-labelledby="pf-clients">
        <Container>
          <div className="grid gap-8 border-t border-fg pt-6 @3xl:grid-cols-12">
            <h2 id="pf-clients" className="font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted @3xl:col-span-3">
              {t({ en: "Selected clients", tr: "Seçili müşteriler" })}
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 @3xl:col-span-9 @3xl:grid-cols-4">
              {clientGroups.map((g) => (
                <div key={g.sector.en}>
                  <h3 className="mb-3 text-small text-accent-ink">{t(g.sector)}</h3>
                  <ul className="space-y-1.5 font-display text-h3 leading-tight">
                    {g.names.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section theme={{ rhythm: "tight" }} aria-labelledby="pf-shows">
        <Container>
          <div className="grid gap-8 border-t border-fg pt-6 @3xl:grid-cols-12">
            <h2 id="pf-shows" className="font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted @3xl:col-span-3">
              {t({ en: "Exhibitions", tr: "Sergiler" })}
            </h2>
            <ul className="@3xl:col-span-9">
              {exhibitions.map((e) => (
                <li key={e.year + e.title.en} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 border-b border-line py-3 @2xl:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1fr)]">
                  <span className="font-mono text-small tabular-nums text-fg-muted">{e.year}</span>
                  <span className="font-medium">{t(e.title)}</span>
                  <span className="col-start-2 text-fg-muted @2xl:col-start-auto">{t(e.place)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <ContactForm
        {...common}
        variant="split"
        anchor="contact"
        eyebrow={t({ en: "Contact", tr: "İletişim" })}
        title={t({ en: "Tell me about the *place*", tr: "Bana *yeri* anlatın" })}
        lead={t({ en: "Where, roughly when, and what the pictures are for. I answer within two working days.", tr: "Nerede, aşağı yukarı ne zaman ve fotoğraflar ne için. İki iş günü içinde yanıt veririm." })}
        fields={[
          { name: "name", required: true },
          { name: "email", required: true },
          {
            name: "subject",
            label: t({ en: "Kind of work", tr: "İş türü" }),
            options: [t({ en: "Commission", tr: "Sipariş çekim" }), t({ en: "Licensing an existing image", tr: "Mevcut bir görselin lisansı" }), t({ en: "Print sale", tr: "Baskı satışı" }), t({ en: "Something else", tr: "Başka bir şey" })],
          },
          { name: "message", required: true, placeholder: t({ en: "Location, dates, how the images will be used…", tr: "Yer, tarihler, görsellerin nasıl kullanılacağı…" }) },
        ]}
        submitLabel={t({ en: "Send enquiry", tr: "Talebi gönder" })}
        successMessage={t({ en: "Thank you — I’ll reply from ilse@example.com within two working days.", tr: "Teşekkürler — iki iş günü içinde ilse@example.com adresinden yanıt vereceğim." })}
        privacyLink={{ href: "/privacy", label: t({ en: "Privacy notice", tr: "Aydınlatma metni" }) }}
        info={{
          email: EMAIL,
          phone: PHONE,
          address: t({ en: "Studio visits by appointment — Kuzguncuk, Istanbul", tr: "Stüdyo ziyareti randevuyla — Kuzguncuk, İstanbul" }),
          hours: t({ en: "Replies Mon–Fri, 09:00–17:00 (GMT+3)", tr: "Yanıtlar Pzt–Cum, 09.00–17.00 (GMT+3)" }),
        }}
      />
    </>
  );
}
