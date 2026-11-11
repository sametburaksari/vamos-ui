import { LocaleProvider } from "@vamos-ui/react";
import { Cta, Faq, Footer, MapHours, MediaText, Navbar, PricingTable, SiteShellPage, sitePageHref, Team } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { ApproachPage } from "./approach-page";
import { ContactPage } from "./contact-page";
import { approach, branch, copyFor, EMAIL, PHONE, photos, sessions, team, type SiteLocale } from "./content";
import { Concerns, TherapyHero } from "./home-parts";

const home = (anchor?: string) => sitePageHref("home", anchor);
const contact = sitePageHref("contact");

/** One language version of Quiet Harbour Counselling: navbar, three pages and the footer. */
export function TherapySite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const place = branch(t);

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark="Quiet Harbour"
        homeHref={home()}
        items={[
          { label: t(approach.crumb), href: sitePageHref("approach") },
          { label: t({ en: "Sessions & fees", tr: "Seanslar ve ücretler" }), href: home("fees") },
          { label: t({ en: "Therapists", tr: "Terapistler" }), href: home("therapists") },
          { label: t({ en: "Contact", tr: "İletişim" }), href: contact },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: contact, label: t({ en: "Free 15-min call", tr: "Ücretsiz ön görüşme" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Quiet Harbour Counselling — therapy in Moda, Kadıköy and online", tr: "Quiet Harbour Danışmanlık — Moda, Kadıköy’de ve çevrim içi terapi" })}>
          <TherapyHero locale={locale} />
          <Concerns locale={locale} />
          <PricingTable
            {...common}
            labels={{ ...labels, oneOff: t({ en: "per session", tr: "seans başı" }) }}
            anchor="fees"
            variant="rows"
            billing="once"
            eyebrow={t({ en: "Sessions & fees", tr: "Seanslar ve ücretler" })}
            title={t({ en: "One price list, *no packages*", tr: "Tek fiyat listesi, *paket yok*" })}
            lead={t({ en: "You pay per session, after it, by card or transfer. Cancel up to 48 hours before at no cost.", tr: "Her seansın ücretini seanstan sonra, kartla ya da havaleyle ödersiniz. 48 saat öncesine kadar ücretsiz iptal." })}
            plans={sessions.map((s) => ({
              name: t(s.name),
              description: t(s.text),
              price: { once: { amount: String(s.fee), currency: "TRY" } },
              features: [{ text: t({ en: `${s.minutes} minutes`, tr: `${s.minutes} dakika` }) }],
              highlight: s.id === "reduced" ? t({ en: "Ask, no paperwork", tr: "Sormanız yeter" }) : undefined,
              cta: { link: { href: contact, label: t({ en: "Ask about this", tr: "Bunu sorun" }) }, style: s.id === "individual" ? "primary" : "secondary" },
            }))}
            taxNote={t({ en: "Fees include VAT. Receipts are issued in the name you choose.", tr: "Ücretlere KDV dahildir. Fatura istediğiniz isme kesilir." })}
          />
          <MediaText
            {...common}
            variant="overlap"
            mediaSide="end"
            eyebrow={t({ en: "The rooms", tr: "Odalar" })}
            title={t({ en: "Designed so nobody *sees you leave*", tr: "Kimse *çıkarken görmesin* diye tasarlandı" })}
            body={t({
              en: "There is no sign on the street door and no receptionist at a desk. Appointments are spaced ten minutes apart, and two of our rooms open onto a back stair — you can leave without crossing the waiting room.",
              tr: "Sokak kapısında tabela, masada bir resepsiyonist yok. Randevular arasında on dakika bırakılır; odalarımızdan ikisi arka merdivene açılır — bekleme odasından geçmeden çıkabilirsiniz.",
            })}
            bullets={[
              t({ en: "Sound-proofed walls and a white-noise machine in the corridor", tr: "Ses yalıtımlı duvarlar ve koridorda beyaz gürültü cihazı" }),
              t({ en: "Tea, water and tissues — no clipboard in the waiting room", tr: "Çay, su ve mendil — bekleme odasında form yok" }),
              t({ en: "Step-free access by the lift at the back", tr: "Arkadaki asansörle basamaksız erişim" }),
            ]}
            media={{ ...photos.lounge, alt: t(photos.lounge.alt) }}
            aspect="3:2"
          />
          <Team
            {...common}
            anchor="therapists"
            variant="list"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Therapists", tr: "Terapistler" })}
            title={t({ en: "Three people, *one* way of working", tr: "Üç kişi, *tek* çalışma biçimi" })}
            lead={t({ en: "All three are in weekly practice, have monthly external supervision and see no more than 22 clients a week.", tr: "Üçü de haftalık pratik yapar, aylık dış süpervizyon alır ve haftada 22’den fazla danışan görmez." })}
            members={team.map((p) => ({ name: p.name, role: t(p.role), specialty: `${t(p.focus)} · ${t(p.languages)}`, bio: t(p.bio), photo: { ...p.photo, alt: t(p.photo.alt) } }))}
          />
          <Faq
            {...common}
            variant="stacked"
            eyebrow={t({ en: "Questions", tr: "Sorular" })}
            title={t({ en: "The things people *ask first*", tr: "İnsanların *ilk sordukları*" })}
            contact={{ link: { href: contact, label: t({ en: "Ask us privately", tr: "Bize gizlice sorun" }) }, style: "link" }}
            items={[
              { q: t({ en: "Do I need a referral or a diagnosis?", tr: "Sevk ya da teşhis gerekiyor mu?" }), a: t({ en: "No. You can contact us directly. We are not a medical service and don’t diagnose; if we think a doctor or psychiatrist could help alongside therapy, we will say so.", tr: "Hayır. Bize doğrudan ulaşabilirsiniz. Tıbbi bir hizmet değiliz ve teşhis koymayız; terapinin yanında bir hekim ya da psikiyatristin yardımcı olabileceğini düşünürsek söyleriz." }) },
              { q: t({ en: "How long will I need to come?", tr: "Ne kadar süre gelmem gerekecek?" }), a: t({ en: "There is no fixed length. Many people come for three to six months; some for a few sessions, some for years. We review together every sixth session.", tr: "Sabit bir süre yok. Pek çok kişi üç ila altı ay gelir; bazıları birkaç seans, bazıları yıllarca. Her altıncı seansta birlikte değerlendiririz." }) },
              { q: t({ en: "Is online as good as in person?", tr: "Çevrim içi, yüz yüze kadar iyi mi?" }), a: t({ en: "For many people it works well, and it is easier to keep up. We use an encrypted video service and ask you to find a room where you can’t be overheard.", tr: "Pek çok kişi için iyi işler ve sürdürmesi daha kolaydır. Şifreli bir görüntülü görüşme hizmeti kullanır, konuşulanları kimsenin duyamayacağı bir oda bulmanızı rica ederiz." }) },
              { q: t({ en: "Will my employer or insurer find out?", tr: "İşverenim ya da sigortam öğrenir mi?" }), a: t({ en: "Only if you tell them. Receipts can be issued in any name and say “consultation”. We never contact anyone on your behalf without written consent.", tr: "Yalnızca siz söylerseniz. Fatura herhangi bir isme ve “danışmanlık” olarak kesilebilir. Yazılı onayınız olmadan kimseyle sizin adınıza iletişime geçmeyiz." }) },
              { q: t({ en: "What if the therapist doesn’t feel right?", tr: "Terapistle uyumlu hissetmezsem?" }), a: t({ en: "Say so — it is common and nobody is offended. You can switch to a colleague at no cost, or we will suggest someone outside the practice.", tr: "Söyleyin — sık olur ve kimse alınmaz. Ücretsiz olarak bir meslektaşa geçebilirsiniz ya da size dışarıdan birini öneririz." }) },
            ]}
          />
          <MapHours
            {...common}
            anchor="find-us"
            variant="map-split"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Find us", tr: "Ulaşım" })}
            title={t({ en: "A side street *above* Moda pier", tr: "Moda iskelesinin *üstünde* bir ara sokak" })}
            businessType="LocalBusiness"
            branches={[place]}
          />
          <Cta
            {...common}
            variant="split"
            title={t({ en: "When you’re ready — and *not before*", tr: "Hazır olduğunuzda — *daha önce değil*" })}
            lead={t({ en: "The private form asks for a name and one way to reach you. Nothing else.", tr: "Gizli form bir ad ve size ulaşabileceğimiz bir yol ister. Başka bir şey değil." })}
            actions={[{ link: { href: contact, label: t({ en: "Open the private form", tr: "Gizli formu aç" }) }, style: "primary" }]}
            media={{ ...photos.door, alt: t(photos.door.alt) }}
          />
        </SiteShellPage>

        <SiteShellPage id="approach" title={t({ en: "Approach — Quiet Harbour Counselling", tr: "Yaklaşım — Quiet Harbour Danışmanlık" })}>
          <ApproachPage locale={locale} />
        </SiteShellPage>

        <SiteShellPage id="contact" title={t({ en: "Contact — Quiet Harbour Counselling", tr: "İletişim — Quiet Harbour Danışmanlık" })}>
          <ContactPage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "Quiet Harbour", href: home() }}
        about={t({ en: "Counselling and psychotherapy for adults and couples, in Moda and online, since 2017.", tr: "2017’den beri yetişkinler ve çiftler için Moda’da ve çevrim içi danışmanlık ve psikoterapi." })}
        columns={[
          { title: t({ en: "Practice", tr: "Merkez" }), links: [{ href: sitePageHref("approach"), label: t(approach.crumb) }, { href: home("fees"), label: t({ en: "Sessions & fees", tr: "Seanslar ve ücretler" }) }, { href: home("therapists"), label: t({ en: "Therapists", tr: "Terapistler" }) }] },
          { title: t({ en: "Privacy", tr: "Gizlilik" }), links: [{ href: contact, label: t({ en: "Private contact form", tr: "Gizli iletişim formu" }) }, { href: sitePageHref("approach", "confidentiality"), label: t({ en: "Confidentiality", tr: "Gizlilik ilkeleri" }) }, { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: place.address }}
        company={{ legalName: "Quiet Harbour Danışmanlık Ltd. Şti." }}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }]}
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
