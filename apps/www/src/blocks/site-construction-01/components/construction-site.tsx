import { LocaleProvider } from "@vamos-ui/react";
import { ContactForm, Faq, FeatureGrid, Footer, MapHours, MediaText, Navbar, SiteShellPage, StatsBand, Steps, Team, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { BuildHero, FeaturedProjects } from "./home-parts";
import { ProjectPage } from "./project-page";
import { ProjectsPage } from "./projects-page";
import { address, branches, copyFor, EMAIL, hours, PHONE, photos, projects, team, type SiteLocale } from "./content";

export const constructionPages = ["home", "projects", ...projects.map((p) => `project-${p.slug}`)];

const home = (anchor?: string) => sitePageHref("home", anchor);
const projectsHref = sitePageHref("projects");

/** One language version of Stonebridge Build: home, projects and one page per project. */
export function ConstructionSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const offices = branches(t);

  const site = (
    <>
      <Navbar
        {...common}
        variant="split"
        sticky
        wordmark={
          <span className="inline-flex items-center gap-2 font-display text-[1.35rem] font-semibold uppercase leading-none tracking-[0.02em]">
            <span aria-hidden className="grid h-5 w-5 grid-rows-2 gap-[2px]">
              <span className="bg-fg" />
              <span className="bg-accent" />
            </span>
            Stonebridge
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Projects", tr: "Projeler" }), href: projectsHref },
          { label: t({ en: "Services", tr: "Hizmetler" }), href: home("services") },
          { label: t({ en: "People", tr: "Ekip" }), href: home("people") },
          { label: t({ en: "Contact", tr: "İletişim" }), href: home("contact") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: home("contact"), label: t({ en: "Tender enquiry", tr: "İhale talebi" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Stonebridge Build — contractor and developer", tr: "Stonebridge Build — yüklenici ve geliştirici" })}>
          <BuildHero locale={locale} />
          <StatsBand
            {...common}
            variant="inline"
            items={[
              { value: 61, label: t({ en: "buildings handed over since 1994", tr: "1994’ten beri teslim edilen bina" }) },
              { value: 87, unit: "%", label: t({ en: "handed over on or before the contract date", tr: "sözleşme tarihinde veya önce teslim" }), source: t({ en: "Last 30 projects", tr: "Son 30 proje" }) },
              { value: 1.2, unit: "M", unitLabel: t({ en: "million", tr: "milyon" }), label: t({ en: "hours without a lost-time injury", tr: "iş günü kayıplı kazasız saat" }), source: t({ en: "Safety log, Nov 2026", tr: "İSG kaydı, Kas 2026" }) },
            ]}
          />
          <FeaturedProjects locale={locale} />
          <FeatureGrid
            {...common}
            variant="list"
            anchor="services"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Services", tr: "Hizmetler" })}
            title={t({ en: "From empty plot to *keys*", tr: "Boş arsadan *anahtara*" })}
            items={[
              { title: t({ en: "General contracting", tr: "Genel yüklenicilik" }), text: t({ en: "Your design, our site: programme, trades, safety and quality under one contract.", tr: "Sizin tasarımınız, bizim şantiyemiz: program, taşeronlar, İSG ve kalite tek sözleşmede." }) },
              { title: t({ en: "Design & build", tr: "Tasarla-yap" }), text: t({ en: "One fixed price from concept to handover, with architects we have built with for years.", tr: "Yıllardır birlikte inşa ettiğimiz mimarlarla, konseptten teslime tek sabit fiyat." }) },
              { title: t({ en: "Development", tr: "Geliştirme" }), text: t({ en: "We buy land and build our own homes — small schemes, built to last.", tr: "Arsa alır, kendi konutlarımızı yaparız — küçük ölçekli, kalıcı projeler." }) },
              { title: t({ en: "Restoration & reuse", tr: "Restorasyon ve yeniden kullanım" }), text: t({ en: "Registered buildings repaired and given new uses, with heritage-board approvals handled.", tr: "Tescilli yapılar onarılır ve yeni işlevler kazanır; kurul onayları bizden." }) },
              { title: t({ en: "Seismic retrofit", tr: "Deprem güçlendirmesi" }), text: t({ en: "Assessment, jacketing and base isolation for buildings that must stay open.", tr: "Açık kalması gereken binalar için tespit, mantolama ve sismik izolasyon." }) },
              { title: t({ en: "Pre-construction", tr: "Yapım öncesi" }), text: t({ en: "Cost plans, buildability reviews and a programme before you commit.", tr: "Karar vermeden önce maliyet planı, yapılabilirlik incelemesi ve program." }) },
            ]}
          />
          <MediaText
            {...common}
            variant="overlap"
            mediaSide="end"
            eyebrow={t({ en: "Safety", tr: "İş güvenliği" })}
            title={t({ en: "Nobody gets hurt *building a building*", tr: "*Bina yaparken* kimse yaralanmaz" })}
            body={t({ en: "Every morning starts with a ten-minute briefing at the gate. Every trade signs the same rules, and anyone on site can stop work — no questions asked.", tr: "Her sabah kapıda on dakikalık bir brifingle başlar. Her taşeron aynı kuralları imzalar ve şantiyedeki herkes işi durdurabilir — soru sorulmaz." })}
            bullets={[
              t({ en: "Full-time safety engineer on every site", tr: "Her şantiyede tam zamanlı İSG mühendisi" }),
              t({ en: "Edge protection before any slab is poured", tr: "Döşeme dökülmeden önce kenar koruması" }),
              t({ en: "Monthly safety figures published with the diary", tr: "Aylık İSG verileri günlükle birlikte yayımlanır" }),
            ]}
            media={{ ...photos.columns, alt: t(photos.columns.alt) }}
            aspect="4:5"
          />
          <Steps
            {...common}
            variant="split"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "How we run a site", tr: "Şantiyeyi nasıl yönetiyoruz" })}
            title={t({ en: "Four *promises*", tr: "Dört *söz*" })}
            steps={[
              { title: t({ en: "A programme you can read", tr: "Okunabilir bir program" }), text: t({ en: "Phases and dates on one page, updated on the first Monday of every month.", tr: "Aşamalar ve tarihler tek sayfada; her ayın ilk pazartesi güncellenir." }), duration: t({ en: "Monthly", tr: "Aylık" }) },
              { title: t({ en: "One person to call", tr: "Aranacak tek kişi" }), text: t({ en: "Your project director answers the phone from groundbreaking to handover.", tr: "Proje direktörünüz temelden teslime telefona kendisi bakar." }), duration: t({ en: "Always", tr: "Her zaman" }) },
              { title: t({ en: "Open-book costs", tr: "Açık defter maliyet" }), text: t({ en: "Every variation priced in writing before work starts, with the trade quote attached.", tr: "Her değişiklik iş başlamadan yazılı fiyatlanır, taşeron teklifi eklenir." }), duration: t({ en: "Per change", tr: "Her değişiklikte" }) },
              { title: t({ en: "Snags closed in 30 days", tr: "Eksikler 30 günde kapanır" }), text: t({ en: "After handover, every listed defect is fixed within a month, or we pay for someone else to.", tr: "Teslimden sonra listedeki her kusur bir ay içinde giderilir; yoksa başkasına yaptırmanın bedelini biz öderiz." }), duration: t({ en: "After handover", tr: "Teslimden sonra" }) },
            ]}
          />
          <Team
            {...common}
            variant="portrait"
            anchor="people"
            eyebrow={t({ en: "People", tr: "Ekip" })}
            title={t({ en: "The names *on the board*", tr: "*Panodaki* isimler" })}
            members={team.map((m) => ({ name: m.name, role: t(m.role), specialty: t(m.specialty), photo: { ...m.photo, alt: t(m.photo.alt) } }))}
          />
          <Testimonials
            {...common}
            variant="feature"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Clients", tr: "İşverenler" })}
            items={[
              {
                quote: t({ en: "We read the diary every month like everyone else. When the August heat cost them a week, it was in there before I had to ask.", tr: "Herkes gibi biz de günlüğü her ay okuyoruz. Ağustos sıcağı onlara bir haftaya mal olduğunda, ben sormadan oraya yazılmıştı." }),
                author: "Sevgi Karaca",
                role: t({ en: "Chair, Kuzey Yaka Housing Co-operative", tr: "Başkan, Kuzey Yaka Konut Kooperatifi" }),
              },
              {
                quote: t({ en: "Nine days early on a registered building, with every brick matched. I did not think that was possible.", tr: "Tescilli bir binada dokuz gün erken, her tuğla eşleşmiş. Bunun mümkün olduğunu düşünmezdim." }),
                author: "Orhan Bilgen",
                role: t({ en: "Owner, Değirmen Workshops", tr: "Mülk sahibi, Değirmen Atölyeleri" }),
              },
            ]}
          />
          <Faq
            {...common}
            variant="split"
            eyebrow={t({ en: "FAQ", tr: "SSS" })}
            title={t({ en: "Before you *tender*", tr: "*İhaleden* önce" })}
            items={[
              { q: t({ en: "What size of project do you take on?", tr: "Hangi büyüklükte projeler alıyorsunuz?" }), a: t({ en: "From about ₺150 million to ₺2.5 billion, in İstanbul and the İzmir region. Smaller restorations if the building deserves it.", tr: "İstanbul ve İzmir bölgesinde yaklaşık 150 milyon ₺ ile 2,5 milyar ₺ arası. Bina hak ediyorsa daha küçük restorasyonlar." }) },
              { q: t({ en: "Do you work on public tenders?", tr: "Kamu ihalelerine giriyor musunuz?" }), a: t({ en: "Yes — about a third of our work is civic, under open tender. Our work-experience certificates are available on request.", tr: "Evet — işimizin yaklaşık üçte biri açık ihaleyle kamu projeleri. İş deneyim belgelerimizi talep üzerine paylaşırız." }) },
              { q: t({ en: "Can I visit a live site?", tr: "Süren bir şantiyeyi ziyaret edebilir miyim?" }), a: t({ en: "Every second Friday we host a site walk at Kuzey Yaka for prospective clients. Boots on, helmet provided.", tr: "İki haftada bir cuma, aday işverenler için Kuzey Yaka’da şantiye turu düzenliyoruz. Ayakkabınızı giyin, bareti biz veririz." }) },
              { q: t({ en: "How are variations priced?", tr: "Değişiklikler nasıl fiyatlanır?" }), a: t({ en: "In writing, before the work, from the trade’s own quote plus our agreed margin. Nothing is built on a verbal instruction.", tr: "İşten önce yazılı olarak; taşeronun kendi teklifi artı anlaşılan kâr payıyla. Sözlü talimatla hiçbir şey yapılmaz." }) },
            ]}
          />
          <ContactForm
            {...common}
            variant="split"
            anchor="contact"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Contact", tr: "İletişim" })}
            title={t({ en: "Tell us about *the site*", tr: "*Arsanızdan* bahsedin" })}
            lead={t({ en: "Location, size, rough budget and when you want to start. A project director calls back within two working days.", tr: "Konum, büyüklük, yaklaşık bütçe ve ne zaman başlamak istediğiniz. Bir proje direktörü iki iş günü içinde sizi arar." })}
            fields={[
              { name: "name", required: true },
              { name: "company", label: t({ en: "Organisation", tr: "Kurum" }) },
              { name: "email", required: true },
              { name: "phone" },
              { name: "subject", required: true, label: t({ en: "Project type", tr: "Proje türü" }), options: [t({ en: "Residential", tr: "Konut" }), t({ en: "Civic or public tender", tr: "Kamu veya kamu ihalesi" }), t({ en: "Commercial", tr: "Ticari" }), t({ en: "Restoration or retrofit", tr: "Restorasyon veya güçlendirme" })] },
              { name: "budget", label: t({ en: "Budget", tr: "Bütçe" }), options: ["< ₺150 m", "₺150–500 m", "₺500 m–1 bn", "> ₺1 bn"] },
              { name: "message", required: true, label: t({ en: "Site, size and timing", tr: "Arsa, büyüklük ve zamanlama" }), max: 1500 },
            ]}
            submitLabel={t({ en: "Send enquiry", tr: "Talebi gönder" })}
            successMessage={t({ en: "Thank you. Cem or Haluk will call you within two working days.", tr: "Teşekkürler. Cem veya Haluk iki iş günü içinde sizi arayacak." })}
            privacyLink={{ href: "/kvkk", label: t({ en: "Privacy notice (KVKK)", tr: "KVKK aydınlatma metni" }) }}
            privacyCheckbox
            info={{ address, phone: PHONE, email: EMAIL, hours }}
          />
          <MapHours {...common} variant="branches" eyebrow={t({ en: "Offices", tr: "Ofisler" })} title={t({ en: "Kartal and *Bornova*", tr: "Kartal ve *Bornova*" })} businessType="LocalBusiness" branches={offices} />
        </SiteShellPage>

        <SiteShellPage id="projects" title={t({ en: "Projects — Stonebridge Build", tr: "Projeler — Stonebridge Build" })}>
          <ProjectsPage locale={locale} />
        </SiteShellPage>

        {projects.map((p) => (
          <SiteShellPage key={p.slug} id={`project-${p.slug}`} title={`${p.name} — Stonebridge Build`}>
            <ProjectPage locale={locale} slug={p.slug} />
          </SiteShellPage>
        ))}
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "Stonebridge", href: home() }}
        about={t({ en: "Contractor and developer in İstanbul and İzmir since 1994. Grade A contractor licence.", tr: "1994’ten beri İstanbul ve İzmir’de yüklenici ve geliştirici. A grubu müteahhitlik belgesi." })}
        columns={[
          { title: t({ en: "Projects", tr: "Projeler" }), links: projects.map((p) => ({ href: sitePageHref(`project-${p.slug}`), label: p.name })) },
          { title: t({ en: "Company", tr: "Şirket" }), links: [{ href: home("services"), label: t({ en: "Services", tr: "Hizmetler" }) }, { href: home("people"), label: t({ en: "People", tr: "Ekip" }) }, { href: "/careers", label: t({ en: "Careers on site", tr: "Şantiyede kariyer" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address }}
        company={{ legalName: "Stonebridge Yapı İnşaat A.Ş.", registry: [{ label: t({ en: "Contractor no.", tr: "Yetki belge no." }), value: "A-00000" }] }}
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
