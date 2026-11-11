import { LocaleProvider } from "@vamos-ui/react";
import { ContactForm, Cta, Faq, FeatureGrid, Footer, MapHours, MediaText, MenuList, Navbar, PageIntro, SiteShellPage, StatsBand, Steps, Team, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { FeeEstimator } from "./fee-estimator";
import { FeePreview, LedgerHero } from "./home-parts";
import { address, branches, companyTypes, copyFor, EMAIL, faqs, hours, money, PHONE, photos, reviews, team, type SiteLocale } from "./content";

export const accountingPages = ["home", "services", "contact"];

const home = (anchor?: string) => sitePageHref("home", anchor);
const services = (anchor?: string) => sitePageHref("services", anchor);
const contact = sitePageHref("contact");

/** One language version of Ledgerly Advisors: home, services (with the fee estimate) and contact. */
export function AccountingSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const from = t({ en: "from", tr: "başlangıç" });
  const perMonth = t({ en: "a month", tr: "aylık" });
  const once = t({ en: "one-off", tr: "tek sefer" });
  const office = branches(t);

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="inline-flex items-baseline gap-1.5 font-display text-[1.15rem] font-semibold tracking-[-0.01em]">
            Ledgerly
            <span aria-hidden className="inline-block h-[0.9em] w-[3px] translate-y-[0.1em] border-x border-accent" />
            <span className="font-sans text-xs font-normal uppercase tracking-[0.16em] text-fg-muted">Advisors</span>
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Services", tr: "Hizmetler" }), href: services() },
          { label: t({ en: "Fee estimate", tr: "Ücret tahmini" }), href: services("estimate") },
          { label: t({ en: "Team", tr: "Ekip" }), href: home("team") },
          { label: t({ en: "Contact", tr: "İletişim" }), href: contact },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: contact, label: t({ en: "Book a call", tr: "Görüşme ayarla" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Ledgerly Advisors — chartered accountants in Kadıköy", tr: "Ledgerly — Kadıköy’de mali müşavirlik" })}>
          <LedgerHero locale={locale} />
          <StatsBand
            {...common}
            variant="ledger"
            eyebrow={t({ en: "2025 in figures", tr: "Rakamlarla 2025" })}
            title={t({ en: "The numbers we *audit ourselves on*", tr: "Kendimizi *denetlediğimiz* rakamlar" })}
            items={[
              { value: 212, label: t({ en: "Companies on a monthly retainer", tr: "Aylık sözleşmeli şirket" }), source: t({ en: "Client register, 31 Dec 2025", tr: "Müşteri kaydı, 31 Ara 2025" }) },
              { value: 4318, label: t({ en: "Returns filed — every one before the deadline", tr: "Verilen beyanname — hepsi süresinden önce" }), source: t({ en: "GİB filing receipts, 2025", tr: "GİB onay belgeleri, 2025" }) },
              { value: 3.4, unit: t({ en: "h", tr: "sa" }), unitLabel: t({ en: "hours", tr: "saat" }), label: t({ en: "Median reply time on working days", tr: "İş günlerinde ortanca yanıt süresi" }), source: t({ en: "Client portal, Jan–Dec 2025", tr: "Müşteri portalı, Ocak–Aralık 2025" }) },
              { value: "₺0", label: t({ en: "Late-filing penalties paid by our clients since 2014", tr: "2014’ten beri müşterilerimizin ödediği gecikme cezası" }), source: t({ en: "Engagement letters, clause 7", tr: "Sözleşmeler, madde 7" }) },
            ]}
          />
          <FeatureGrid
            {...common}
            variant="list"
            anchor="services"
            eyebrow={t({ en: "What we do", tr: "Ne yapıyoruz" })}
            title={t({ en: "Off your desk, *on our calendar*", tr: "Masanızdan kalkar, *takvimimize* girer" })}
            actions={[{ link: { href: services(), label: t({ en: "Services and prices", tr: "Hizmetler ve fiyatlar" }) }, style: "secondary" }]}
            items={[
              { title: t({ en: "Bookkeeping", tr: "Defter tutma" }), text: t({ en: "Bank feeds, receipts by photo, a trial balance by the 5th of every month.", tr: "Banka hareketleri, fotoğrafla fiş, her ayın 5’inde mizan." }) },
              { title: t({ en: "Payroll & SGK", tr: "Bordro ve SGK" }), text: t({ en: "Payslips, hires and leavers, minimum-wage support and SGK notices, every month.", tr: "Bordro, işe giriş-çıkış, asgari ücret desteği ve SGK bildirgeleri, her ay." }) },
              { title: t({ en: "Tax returns", tr: "Beyannameler" }), text: t({ en: "VAT, withholding, provisional and corporate tax — prepared, checked and signed by a partner.", tr: "KDV, muhtasar, geçici ve kurumlar vergisi — hazırlanır, kontrol edilir, ortak imzalar." }) },
              { title: t({ en: "Company formation", tr: "Şirket kuruluşu" }), text: t({ en: "Ltd. or A.Ş. registered in eight working days, tax office and e-invoice set up.", tr: "Ltd. veya A.Ş. sekiz iş gününde tescil, vergi dairesi ve e-fatura kurulumu." }) },
              { title: t({ en: "Incentives", tr: "Teşvikler" }), text: t({ en: "Investment certificates, R&D deductions and SGK incentives you are already entitled to.", tr: "Yatırım teşvik belgesi, Ar-Ge indirimi ve zaten hak ettiğiniz SGK teşvikleri." }) },
              { title: t({ en: "Management accounts", tr: "Yönetim raporları" }), text: t({ en: "P&L, cash runway and margins in Turkish or English, with a 30-minute review call.", tr: "Türkçe veya İngilizce gelir tablosu, nakit ömrü ve marjlar; 30 dakikalık değerlendirme görüşmesi." }) },
            ]}
          />
          <FeePreview locale={locale} />
          <Steps
            {...common}
            variant="horizontal"
            eyebrow={t({ en: "Your month", tr: "Ayınız" })}
            title={t({ en: "Five dates, *no surprises*", tr: "Beş tarih, *sürpriz yok*" })}
            lead={t({ en: "The same calendar for every client. You send documents once; we chase the rest.", tr: "Her müşteri için aynı takvim. Belgeleri bir kez gönderirsiniz; gerisini biz takip ederiz." })}
            steps={[
              { title: t({ en: "Documents in", tr: "Belgeler gelir" }), text: t({ en: "Bank feeds sync; you snap receipts in the portal.", tr: "Banka senkronize olur; fişleri portala fotoğraflarsınız." }), duration: t({ en: "1st", tr: "1’i" }) },
              { title: t({ en: "Books closed", tr: "Defter kapanır" }), text: t({ en: "Trial balance and open questions in one email.", tr: "Mizan ve açık sorular tek e-postada." }), duration: t({ en: "5th", tr: "5’i" }) },
              { title: t({ en: "Report", tr: "Rapor" }), text: t({ en: "Management pack and a cash forecast for the quarter.", tr: "Yönetim raporu ve çeyrek nakit tahmini." }), duration: t({ en: "10th", tr: "10’u" }) },
              { title: t({ en: "Payroll filed", tr: "Bordro bildirilir" }), text: t({ en: "Withholding and SGK returns, payment slips sent to you.", tr: "Muhtasar ve SGK bildirgeleri, ödeme dekontları size iletilir." }), duration: t({ en: "26th", tr: "26’sı" }) },
              { title: t({ en: "VAT filed", tr: "KDV verilir" }), text: t({ en: "VAT return filed; you approve the payment in one tap.", tr: "KDV beyannamesi verilir; ödemeyi tek dokunuşla onaylarsınız." }), duration: t({ en: "28th", tr: "28’i" }) },
            ]}
          />
          <Team
            {...common}
            variant="portrait"
            anchor="team"
            eyebrow={t({ en: "People", tr: "Ekip" })}
            title={t({ en: "Two partners sign. *Two seniors* answer.", tr: "İki ortak imzalar. *İki kıdemli* yanıtlar." })}
            members={team.map((m) => ({ name: m.name, role: t(m.role), specialty: t(m.specialty), photo: { ...m.photo, alt: t(m.photo.alt) } }))}
          />
          <MediaText
            {...common}
            variant="side"
            theme={{ surface: "surface-2" }}
            mediaSide="end"
            eyebrow={t({ en: "Switching", tr: "Geçiş" })}
            title={t({ en: "Moving mid-year is *a nine-day job*", tr: "Yıl ortasında geçiş *dokuz günlük iş*" })}
            body={t({ en: "We request the books from your current accountant, reconcile every opening balance and file the next return ourselves. You sign one letter.", tr: "Defterleri mevcut muhasebecinizden talep eder, her açılış bakiyesini mutabık kılar ve sonraki beyannameyi kendimiz veririz. Siz tek bir yazı imzalarsınız." })}
            bullets={[
              t({ en: "Takeover fee: half of one month’s retainer", tr: "Devir ücreti: bir aylık ücretin yarısı" }),
              t({ en: "Opening balances checked against bank and SGK records", tr: "Açılış bakiyeleri banka ve SGK kayıtlarıyla kontrol edilir" }),
              t({ en: "No gap in e-ledger uploads", tr: "E-defter yüklemelerinde boşluk olmaz" }),
            ]}
            media={{ ...photos.signing, alt: t(photos.signing.alt) }}
            aspect="3:2"
          />
          <Testimonials
            {...common}
            variant="feature"
            eyebrow={t({ en: "Clients", tr: "Müşteriler" })}
            summary={{ rating: 4.9, count: 148, source: "google" }}
            items={reviews.map((r) => ({ quote: t(r.quote), author: r.author, role: t(r.role), rating: 5, source: "google" as const, date: r.date }))}
          />
          <Faq {...common} variant="split" eyebrow={t({ en: "FAQ", tr: "SSS" })} title={t({ en: "Before you *switch*", tr: "*Geçmeden* önce" })} items={faqs.map((f) => ({ q: t(f.q), a: t(f.a) }))} />
          <Cta
            {...common}
            variant="split"
            theme={{ surface: "accent" }}
            title={t({ en: "Twenty minutes, your last bank statement, a fixed fee.", tr: "Yirmi dakika, son banka ekstreniz, sabit bir ücret." })}
            lead={t({ en: "Video or at our Kozyatağı office. No obligation, no sales follow-up.", tr: "Görüntülü veya Kozyatağı ofisimizde. Bağlayıcı değil, satış takibi yok." })}
            actions={[
              { link: { href: contact, label: t({ en: "Book a call", tr: "Görüşme ayarla" }) }, style: "primary" },
              { link: { href: services("estimate"), label: t({ en: "Estimate my fee", tr: "Ücretimi hesapla" }) }, style: "secondary" },
            ]}
          />
        </SiteShellPage>

        <SiteShellPage id="services" title={t({ en: "Services and fees — Ledgerly Advisors", tr: "Hizmetler ve ücretler — Ledgerly" })}>
          <PageIntro
            {...common}
            variant="ruled"
            breadcrumb={[{ label: "Ledgerly", href: home() }, { label: t({ en: "Services", tr: "Hizmetler" }) }]}
            title={t({ en: "Services and *fees*", tr: "Hizmetler ve *ücretler*" })}
            lead={t({ en: "Monthly retainers by company type, one-off work at a fixed price. All fees exclude 20% VAT.", tr: "Şirket türüne göre aylık ücret, tek seferlik işler sabit fiyatla. Tüm ücretlere %20 KDV eklenir." })}
            meta={[
              { label: t({ en: "Retainers", tr: "Aylık ücret" }), value: t({ en: "from ₺4,750 a month", tr: "aylık 4.750 ₺’den" }) },
              { label: t({ en: "Licensed", tr: "Lisans" }), value: t({ en: "SMMM, İstanbul chamber, since 2009", tr: "SMMM, İstanbul odası, 2009’dan beri" }) },
              { label: t({ en: "Languages", tr: "Diller" }), value: t({ en: "Turkish and English", tr: "Türkçe ve İngilizce" }) },
            ]}
          />
          <MenuList
            {...common}
            variant="service-list"
            eyebrow={t({ en: "Price list", tr: "Fiyat listesi" })}
            title={t({ en: "What it *costs*", tr: "Ne *tutar*" })}
            priceNote={t({ en: "Prices exclude 20% VAT. Retainers are billed monthly in advance; one-off work half on signing, half on delivery.", tr: "Fiyatlara %20 KDV dahil değildir. Aylık ücretler peşin faturalanır; tek seferlik işler yarısı imzada, yarısı teslimde." })}
            bookHref={services("estimate")}
            showAllergens={false}
            categories={[
              {
                title: t({ en: "Monthly retainers", tr: "Aylık sözleşmeler" }),
                items: companyTypes.map((ct) => ({ name: t(ct.name), description: ct.included.map((x) => t(x)).join(" · "), duration: perMonth, prices: [{ label: from, amount: money(ct.base) }] })),
              },
              {
                title: t({ en: "One-off work", tr: "Tek seferlik işler" }),
                items: [
                  { name: t({ en: "Company formation (Ltd. or A.Ş.)", tr: "Şirket kuruluşu (Ltd. veya A.Ş.)" }), description: t({ en: "Articles, trade registry, tax office, e-invoice and bank account set up.", tr: "Ana sözleşme, ticaret sicili, vergi dairesi, e-fatura ve banka hesabı kurulumu." }), duration: t({ en: "8 working days", tr: "8 iş günü" }), prices: [{ label: once, amount: money(14000) }], bookHref: contact },
                  { name: t({ en: "Annual return for landlords and freelancers", tr: "Kira ve serbest meslek yıllık beyanı" }), description: t({ en: "Rental or professional income, deductions, filed in March.", tr: "Kira veya serbest meslek geliri, indirimler; mart ayında verilir." }), duration: t({ en: "1 meeting", tr: "1 görüşme" }), prices: [{ label: once, amount: money(3500) }], bookHref: contact },
                  { name: t({ en: "Investment incentive application", tr: "Yatırım teşvik başvurusu" }), description: t({ en: "Feasibility, certificate application and follow-up with the ministry.", tr: "Fizibilite, belge başvurusu ve bakanlık takibi." }), duration: t({ en: "4–6 weeks", tr: "4–6 hafta" }), prices: [{ label: once, amount: money(22000) }], bookHref: contact },
                  { name: t({ en: "Financial due diligence", tr: "Finansal durum tespiti" }), description: t({ en: "Three years of books reviewed before you invest or buy.", tr: "Yatırım veya satın alma öncesi üç yıllık defter incelemesi." }), duration: t({ en: "2–3 weeks", tr: "2–3 hafta" }), prices: [{ label: from, amount: money(45000) }], bookHref: contact },
                ],
              },
            ]}
          />
          <FeeEstimator locale={locale} />
          <Faq
            {...common}
            variant="stacked"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "About fees", tr: "Ücretler hakkında" })}
            title={t({ en: "How we *bill*", tr: "Nasıl *faturalıyoruz*" })}
            items={[
              { q: t({ en: "Does the fee change during the year?", tr: "Ücret yıl içinde değişir mi?" }), a: t({ en: "Once, in January, by the official revaluation rate — and only if your company type, payroll or invoice band changed.", tr: "Yılda bir, ocak ayında yeniden değerleme oranıyla — ve yalnızca şirket türünüz, bordronuz veya fatura bandınız değiştiyse." }) },
              { q: t({ en: "What is the year-end close?", tr: "Yıl sonu kapanış nedir?" }), a: t({ en: "Inventory count, depreciation, accruals and the corporate tax return. It is billed once, in March, at one month’s base retainer.", tr: "Sayım, amortisman, tahakkuklar ve kurumlar vergisi beyannamesi. Mart ayında bir kez, bir aylık temel ücret olarak faturalanır." }) },
              { q: t(faqs[0]!.q), a: t(faqs[0]!.a) },
            ]}
          />
        </SiteShellPage>

        <SiteShellPage id="contact" title={t({ en: "Contact — Ledgerly Advisors", tr: "İletişim — Ledgerly" })}>
          <PageIntro
            {...common}
            variant="simple"
            breadcrumb={[{ label: "Ledgerly", href: home() }, { label: t({ en: "Contact", tr: "İletişim" }) }]}
            title={t({ en: "Talk to a *partner*", tr: "Bir *ortakla* konuşun" })}
            lead={t({ en: "Tell us about the company and we call you back within one working day to book twenty minutes.", tr: "Şirketinizi anlatın; yirmi dakikalık bir görüşme için bir iş günü içinde sizi arayalım." })}
          />
          <ContactForm
            {...common}
            variant="split"
            eyebrow={t({ en: "Enquiry", tr: "Talep" })}
            title={t({ en: "About your *company*", tr: "Şirketiniz *hakkında*" })}
            lead={t({ en: "No documents yet, please. We ask for them after the call, through the client portal.", tr: "Lütfen henüz belge göndermeyin. Görüşmeden sonra müşteri portalı üzerinden isteriz." })}
            fields={[
              { name: "name", required: true },
              { name: "company", label: t({ en: "Company name", tr: "Şirket adı" }) },
              { name: "email", required: true },
              { name: "phone" },
              { name: "subject", required: true, label: t({ en: "Company type", tr: "Şirket türü" }), options: [...companyTypes.map((ct) => t(ct.name)), t({ en: "Not founded yet", tr: "Henüz kurulmadı" })] },
              { name: "message", required: true, label: t({ en: "What do you need help with?", tr: "Hangi konuda yardıma ihtiyacınız var?" }), max: 1200 },
            ]}
            submitLabel={t({ en: "Request a call", tr: "Arama talep et" })}
            successMessage={t({ en: "Thank you. Nesrin or Kerem will call you before 18:00 on the next working day.", tr: "Teşekkürler. Nesrin veya Kerem bir sonraki iş günü 18:00’e kadar sizi arayacak." })}
            privacyLink={{ href: "/kvkk", label: t({ en: "Privacy notice (KVKK)", tr: "KVKK aydınlatma metni" }) }}
            privacyCheckbox
            info={{ address, phone: PHONE, email: EMAIL, hours }}
          />
          <MapHours {...common} variant="map-split" theme={{ surface: "surface-2" }} eyebrow={t({ en: "Office", tr: "Ofis" })} title={t({ en: "Kozyatağı, *sixth floor*", tr: "Kozyatağı, *altıncı kat*" })} businessType="ProfessionalService" branches={office} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Ledgerly Advisors", href: home() }}
        about={t({ en: "Chartered accountants in Kadıköy since 2009. Bookkeeping, payroll and tax for companies across Türkiye.", tr: "2009’dan beri Kadıköy’de mali müşavirlik. Türkiye genelinde şirketlere defter, bordro ve vergi." })}
        columns={[
          { title: t({ en: "Services", tr: "Hizmetler" }), links: [{ href: services(), label: t({ en: "Price list", tr: "Fiyat listesi" }) }, { href: services("estimate"), label: t({ en: "Fee estimate", tr: "Ücret tahmini" }) }, { href: home("team"), label: t({ en: "Team", tr: "Ekip" }) }] },
          { title: t({ en: "Clients", tr: "Müşteriler" }), links: [{ href: "/portal", label: t({ en: "Client portal", tr: "Müşteri portalı" }) }, { href: contact, label: t({ en: "Contact", tr: "İletişim" }) }, { href: "/tax-calendar", label: t({ en: "Tax calendar 2026", tr: "2026 vergi takvimi" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address }}
        company={{ legalName: "Ledgerly Mali Müşavirlik Ltd. Şti.", registry: [{ label: t({ en: "Chamber no.", tr: "Oda sicil no." }), value: "34-000000" }] }}
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
