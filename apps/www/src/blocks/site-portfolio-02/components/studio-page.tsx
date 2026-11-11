import { Image } from "@vamos-ui/react";
import { ContactForm, Container, PageIntro, Section, Steps, Team, sitePageHref } from "@vamos-ui/react/blocks";
import { ADDRESS, copyFor, EMAIL, PHONE, studioPhoto, team, type SiteLocale } from "./content";

/** Studio: who we are, the people, how a commission runs, and the enquiry form. */
export function StudioPage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[{ label: "Kerte", href: sitePageHref("home") }, { label: t({ en: "Studio", tr: "Stüdyo" }) }]}
        eyebrow={t({ en: "Studio", tr: "Stüdyo" })}
        title={t({ en: "Fourteen people, one long table", tr: "On dört kişi, bir uzun masa" })}
        lead={t({
          en: "Kerte was founded in 2011 by Defne Arıtan and Jonas Lindqvist in a former print shop in Moda. We still work at one table, and every project is drawn by hand before it is drawn on screen.",
          tr: "Kerte, 2011’de Defne Arıtan ve Jonas Lindqvist tarafından Moda’da eski bir matbaada kuruldu. Hâlâ tek bir masada çalışıyoruz; her proje ekrana geçmeden önce elle çizilir.",
        })}
      />

      <Section aria-label={t({ en: "The drawing table", tr: "Çizim masası" })} theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <figure className="grid gap-x-5 gap-y-2 @3xl:grid-cols-12">
            <Image src={studioPhoto.src} width={studioPhoto.width} height={studioPhoto.height} focal={studioPhoto.focal} alt={t(studioPhoto.alt)} aspect="21/9" sizes="(min-width: 1024px) 80vw, 100vw" className="@3xl:col-span-10" />
            <figcaption className="border-t border-fg pt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-fg-muted @3xl:col-span-2 @3xl:self-end">
              <span className="block text-fg">{t({ en: "Fig. 00", tr: "Şek. 00" })}</span>
              <span className="normal-case tracking-normal">{t({ en: "Sketch design for Cedar Row, type C flat, March 2024.", tr: "Sedir Sıra için eskiz tasarım, C tipi daire, Mart 2024." })}</span>
            </figcaption>
          </figure>
        </Container>
      </Section>

      <Team
        {...common}
        variant="list"
        eyebrow={t({ en: "People", tr: "Ekip" })}
        title={t({ en: "Who draws what", tr: "Kim neyi çiziyor" })}
        members={team.map((m) => ({ name: m.name, role: t(m.role), specialty: t(m.specialty) }))}
      />

      <Steps
        {...common}
        variant="horizontal"
        eyebrow={t({ en: "A commission", tr: "Bir iş" })}
        title={t({ en: "From the first walk to the keys", tr: "İlk yürüyüşten anahtara" })}
        lead={t({ en: "Typical for a house of 150–300 m². Fees are a fixed sum per stage, agreed before each one starts.", tr: "150–300 m²’lik bir ev için tipik süreç. Ücret, her aşama başlamadan önce anlaşılan sabit bir tutardır." })}
        steps={[
          { title: t({ en: "Site walk & survey", tr: "Arsa yürüyüşü ve rölöve" }), text: t({ en: "Two days on the land, a measured survey and a list of what must stay.", tr: "Arazide iki gün, ölçülü rölöve ve kalması gerekenlerin listesi." }), duration: t({ en: "2–3 weeks", tr: "2–3 hafta" }) },
          { title: t({ en: "Sketch design", tr: "Eskiz tasarım" }), text: t({ en: "Hand drawings and a 1:50 model, three options narrowed to one.", tr: "El çizimleri ve 1:50 maket; üç seçenek bire iner." }), duration: t({ en: "6–8 weeks", tr: "6–8 hafta" }) },
          { title: t({ en: "Permit set", tr: "Ruhsat projesi" }), text: t({ en: "Drawings for the municipality, structure and services coordinated.", tr: "Belediye için çizimler; statik ve tesisat koordinasyonu." }), duration: t({ en: "3–4 months", tr: "3–4 ay" }) },
          { title: t({ en: "On site", tr: "Şantiye" }), text: t({ en: "A site visit every week, a written report every visit.", tr: "Her hafta şantiye ziyareti, her ziyarette yazılı rapor." }), duration: t({ en: "9–14 months", tr: "9–14 ay" }) },
        ]}
      />

      <ContactForm
        {...common}
        variant="split"
        anchor="contact"
        eyebrow={t({ en: "Contact", tr: "İletişim" })}
        title={t({ en: "Tell us about the site", tr: "Bize arsayı anlatın" })}
        lead={t({ en: "Where it is, what is on it now, and roughly when you hope to start. We reply within a week, usually with a date for a site walk.", tr: "Nerede, şu an üzerinde ne var ve aşağı yukarı ne zaman başlamak istiyorsunuz. Bir hafta içinde, çoğunlukla bir arsa yürüyüşü tarihiyle yanıt veriyoruz." })}
        fields={[
          { name: "name", required: true },
          { name: "email", required: true },
          {
            name: "subject",
            label: t({ en: "Kind of project", tr: "Proje türü" }),
            options: [t({ en: "A house", tr: "Bir ev" }), t({ en: "Cooperative housing", tr: "Kooperatif konut" }), t({ en: "Public or civic building", tr: "Kamu yapısı" }), t({ en: "Survey or restoration", tr: "Rölöve ya da restorasyon" })],
          },
          { name: "message", required: true, placeholder: t({ en: "Location, plot size, what is there now…", tr: "Yer, arsa büyüklüğü, şu an üzerinde ne olduğu…" }) },
        ]}
        submitLabel={t({ en: "Send to the studio", tr: "Stüdyoya gönder" })}
        successMessage={t({ en: "Thank you — Selin will reply from studio@kerte.example.com within a week.", tr: "Teşekkürler — Selin bir hafta içinde studio@kerte.example.com adresinden yanıt verecek." })}
        privacyLink={{ href: "/privacy", label: t({ en: "Privacy notice", tr: "Aydınlatma metni" }) }}
        info={{ address: ADDRESS, phone: PHONE, email: EMAIL, hours: t({ en: "Mon–Fri 09:30–18:30", tr: "Pzt–Cum 09:30–18:30" }) }}
      />
    </>
  );
}
