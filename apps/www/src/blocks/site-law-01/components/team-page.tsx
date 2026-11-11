import { Cta, PageIntro, Team, sitePageHref } from "@vamos-ui/react/blocks";
import { associates, copyFor, EMAIL, lawyers, type SiteLocale } from "./content";

/** The team: the managing partner as a feature, partners and counsel with bar admissions, associates as a list. */
export function TeamPage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const [lead, ...rest] = lawyers;

  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[{ label: "Ardent & Vale", href: sitePageHref("home") }, { label: t({ en: "Team", tr: "Ekip" }) }]}
        title={t({ en: "Twenty-four lawyers, *one* standard", tr: "Yirmi dört avukat, *tek* standart" })}
        lead={t({ en: "Every matter has a named partner who answers the phone. Associates work on no more than three files at a time.", tr: "Her dosyanın telefonu bizzat açan, adı belli bir ortağı vardır. Avukatlarımız aynı anda en fazla üç dosyada çalışır." })}
        meta={[
          { label: t({ en: "Partners", tr: "Ortaklar" }), value: "4" },
          { label: t({ en: "Bar admissions", tr: "Baro kayıtları" }), value: t({ en: "Istanbul, Ankara, England & Wales, Frankfurt", tr: "İstanbul, Ankara, İngiltere ve Galler, Frankfurt" }) },
          { label: t({ en: "Languages", tr: "Diller" }), value: "TR · EN · DE" },
        ]}
      />

      <Team
        {...common}
        variant="feature"
        members={[{ name: lead!.name, role: t(lead!.role), specialty: t(lead!.admissions), bio: t(lead!.bio), photo: lead!.photo ? { ...lead!.photo, alt: lead!.name } : undefined, links: [{ network: "linkedin", href: "https://www.linkedin.com/in/example" }] }]}
      />

      <Team
        {...common}
        variant="portrait"
        theme={{ surface: "surface" }}
        eyebrow={t({ en: "Partners and counsel", tr: "Ortaklar ve kıdemli danışmanlar" })}
        title={t({ en: "The people you will *speak to*", tr: "*Görüşeceğiniz* kişiler" })}
        members={rest.map((l) => ({
          name: l.name,
          role: t(l.role),
          specialty: t(l.admissions),
          bio: t(l.bio),
          photo: l.photo ? { ...l.photo, alt: l.name } : undefined,
        }))}
      />

      <Team
        {...common}
        variant="list"
        eyebrow={t({ en: "Associates", tr: "Avukatlar" })}
        title={t({ en: "Associates", tr: "Avukatlar" })}
        members={associates.map((a) => ({ name: a.name, role: t(a.role), specialty: t(a.admissions) }))}
      />

      <Cta
        {...common}
        variant="split"
        title={t({ en: "Trainee and associate *positions*", tr: "Stajyer ve avukat *pozisyonları*" })}
        lead={t({ en: "We take two trainees each September. Applications for 2027 close on 31 March.", tr: "Her eylül iki stajyer alıyoruz. 2027 başvuruları 31 Mart’ta kapanıyor." })}
        actions={[{ link: { href: `mailto:${EMAIL}?subject=Careers`, label: t({ en: "Send your CV", tr: "Özgeçmişinizi gönderin" }) }, style: "secondary" }]}
      />
    </>
  );
}
