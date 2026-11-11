import { LocaleProvider } from "@vamos-ui/react";
import { ContactForm, Cta, Faq, FeatureGrid, Footer, MapHours, MediaText, Navbar, PageIntro, SiteShellPage, StatsBand, Steps, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { Catalogue } from "./catalogue";
import { FamilyGrid, SheetHero } from "./home-parts";
import { CertificateList, SpcPanel } from "./quality-parts";
import { address, branches, copyFor, EMAIL, families, hours, PHONE, photos, type SiteLocale } from "./content";

export const factoryPages = ["home", "products", "quality"];

const home = (anchor?: string) => sitePageHref("home", anchor);
const productsHref = sitePageHref("products");
const qualityHref = sitePageHref("quality");

/** One language version of Ostrand Components: home, the product catalogue and quality. */
export function FactorySite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const plant = branches(t);

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="inline-flex items-center gap-2 font-display text-[1.2rem] font-bold uppercase tracking-[0.06em]">
            <span aria-hidden className="relative grid size-5 place-items-center rounded-full border-2 border-fg">
              <span className="size-1.5 rounded-full bg-warning" />
            </span>
            Ostrand
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Products", tr: "Ürünler" }), href: productsHref },
          { label: t({ en: "Quality", tr: "Kalite" }), href: qualityHref },
          { label: t({ en: "Capabilities", tr: "Kabiliyetler" }), href: home("capabilities") },
          { label: t({ en: "Plant", tr: "Fabrika" }), href: home("plant") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: home("rfq"), label: t({ en: "Request a quote", tr: "Teklif iste" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Ostrand Components — precision flanges, housings, fittings and shafts", tr: "Ostrand Components — hassas flanş, yatak, rakor ve mil" })}>
          <SheetHero locale={locale} />
          <StatsBand
            {...common}
            variant="inline"
            items={[
              { value: 64, label: t({ en: "CNC machining centres and lathes", tr: "CNC işleme merkezi ve torna" }) },
              { value: 3.2, unit: t({ en: "M", tr: "M" }), unitLabel: t({ en: "million", tr: "milyon" }), label: t({ en: "parts shipped in 2025", tr: "2025’te sevk edilen parça" }) },
              { value: 38, unit: "ppm", unitLabel: t({ en: "parts per million", tr: "milyonda parça" }), label: t({ en: "customer rejects, 2025", tr: "müşteri reddi, 2025" }), source: t({ en: "Customer scorecards", tr: "Müşteri karneleri" }) },
              { value: 97.4, unit: "%", label: t({ en: "delivered on or before the confirmed date", tr: "onaylı tarihte veya önce teslim" }), source: t({ en: "ERP, Jan–Oct 2026", tr: "ERP, Ocak–Ekim 2026" }) },
            ]}
          />
          <FamilyGrid locale={locale} />
          <MediaText
            {...common}
            variant="bleed"
            anchor="capabilities"
            theme={{ surface: "surface-2" }}
            mediaSide="start"
            eyebrow={t({ en: "Capabilities", tr: "Kabiliyetler" })}
            title={t({ en: "One hall, *raw bar to packed box*", tr: "Tek hol, *çubuktan kutuya*" })}
            body={t({ en: "Sawing, forging partners within 40 km, turning, five-axis milling, induction hardening, cylindrical grinding and zinc-nickel plating under one roof in Gebze. Lights-out cells run the fittings overnight.", tr: "Testere kesim, 40 km içindeki dövme ortakları, tornalama, beş eksen frezeleme, indüksiyon sertleştirme, silindirik taşlama ve çinko-nikel kaplama Gebze’de tek çatı altında. Rakorlar gece insansız hücrelerde işlenir." })}
            bullets={[
              t({ en: "Turning Ø4–Ø420 mm, milling up to 1,600 × 800 mm", tr: "Tornalama Ø4–Ø420 mm, frezeleme 1.600 × 800 mm’ye kadar" }),
              t({ en: "Tolerances to IT6, roundness 2 µm on ground diameters", tr: "IT6’ya kadar tolerans, taşlanmış çaplarda 2 µm dairesellik" }),
              t({ en: "Batch sizes from 10 to 200,000", tr: "10’dan 200.000’e parti büyüklüğü" }),
            ]}
            media={{ ...photos.sparks, alt: t(photos.sparks.alt) }}
            aspect="3:2"
          />
          <FeatureGrid
            {...common}
            variant="grid"
            eyebrow={t({ en: "Who we supply", tr: "Kimlere üretiyoruz" })}
            title={t({ en: "Machines that *cannot stop*", tr: "*Duramayan* makineler" })}
            columns={4}
            items={[
              { title: t({ en: "Mobile hydraulics", tr: "Mobil hidrolik" }), text: t({ en: "Excavators, cranes and forklifts — fittings and manifolds at 400 bar.", tr: "Ekskavatör, vinç ve forklift — 400 bar rakor ve manifoldlar." }) },
              { title: t({ en: "Agricultural machinery", tr: "Tarım makineleri" }), text: t({ en: "Flanged bearing units and shafts for balers and seed drills.", tr: "Balya ve mibzer makineleri için flanşlı yatak ve miller." }) },
              { title: t({ en: "Process plants", tr: "Proses tesisleri" }), text: t({ en: "Pressure flanges with 3.1 certificates for water and steam lines.", tr: "Su ve buhar hatları için 3.1 sertifikalı basınç flanşları." }) },
              { title: t({ en: "Rail", tr: "Raylı sistemler" }), text: t({ en: "Bogie brackets and ground pins, batch-traceable to the heat.", tr: "Boji braketleri ve taşlanmış pimler, döküm partisine kadar izlenebilir." }) },
            ]}
          />
          <Steps
            {...common}
            variant="horizontal"
            eyebrow={t({ en: "Custom parts", tr: "Özel parçalar" })}
            title={t({ en: "From drawing to *series*", tr: "Resimden *seriye*" })}
            steps={[
              { title: t({ en: "RFQ", tr: "Teklif talebi" }), text: t({ en: "Send a STEP file and a drawing; we quote in two working days.", tr: "STEP dosyası ve resim gönderin; iki iş gününde teklif veririz." }), duration: t({ en: "Day 0–2", tr: "0–2. gün" }) },
              { title: t({ en: "DFM review", tr: "Üretilebilirlik" }), text: t({ en: "An engineer marks tolerances that cost money and suggests changes.", tr: "Bir mühendis maliyet yaratan toleransları işaretler, değişiklik önerir." }), duration: t({ en: "Day 3–5", tr: "3–5. gün" }) },
              { title: t({ en: "First article", tr: "İlk numune" }), text: t({ en: "Ten parts with a full CMM report and PPAP level 3 if you need it.", tr: "Tam ölçüm raporuyla on parça; gerekirse PPAP seviye 3." }), duration: t({ en: "Week 3–4", tr: "3–4. hafta" }) },
              { title: t({ en: "Series", tr: "Seri üretim" }), text: t({ en: "Call-offs from a blanket order; stock held for you in Gebze.", tr: "Çerçeve siparişten çekiliş; stok sizin için Gebze’de tutulur." }), duration: t({ en: "Week 6+", tr: "6. hafta+" }) },
            ]}
          />
          <ContactForm
            {...common}
            variant="split"
            anchor="rfq"
            eyebrow={t({ en: "Request a quote", tr: "Teklif talebi" })}
            title={t({ en: "Send us the *part*", tr: "Parçayı *gönderin*" })}
            lead={t({ en: "Catalogue part numbers or a short description of a custom part. Our sales engineers reply within two working days; attach drawings when they write back.", tr: "Katalog parça numaraları veya özel parçanın kısa tarifi. Satış mühendislerimiz iki iş günü içinde yanıtlar; resimleri o yanıta ekleyin." })}
            fields={[
              { name: "name", required: true },
              { name: "company", required: true, label: t({ en: "Company", tr: "Firma" }) },
              { name: "email", required: true },
              { name: "phone" },
              { name: "subject", required: true, label: t({ en: "Product family", tr: "Ürün ailesi" }), options: [...families.map((f) => t(f.name)), t({ en: "Custom part to drawing", tr: "Resme göre özel parça" })] },
              { name: "budget", label: t({ en: "Annual quantity", tr: "Yıllık adet" }), options: ["< 500", "500–5,000", "5,000–50,000", "> 50,000"] },
              { name: "message", required: true, label: t({ en: "Part numbers, sizes, material, delivery", tr: "Parça numaraları, ölçüler, malzeme, teslimat" }), max: 1500 },
            ]}
            submitLabel={t({ en: "Send request", tr: "Talebi gönder" })}
            successMessage={t({ en: "Thank you. Your request is logged as RFQ-26-1184; a sales engineer replies within two working days.", tr: "Teşekkürler. Talebiniz RFQ-26-1184 olarak kaydedildi; bir satış mühendisi iki iş günü içinde yanıtlayacak." })}
            privacyLink={{ href: "/kvkk", label: t({ en: "Privacy notice (KVKK)", tr: "KVKK aydınlatma metni" }) }}
            privacyCheckbox
            info={{ address, phone: PHONE, email: EMAIL, hours }}
          />
          <MapHours {...common} variant="map-split" anchor="plant" theme={{ surface: "surface-2" }} eyebrow={t({ en: "Plant", tr: "Fabrika" })} title={t({ en: "Gebze OSB, *gate 2*", tr: "Gebze OSB, *2 numaralı kapı*" })} businessType="LocalBusiness" branches={plant} />
        </SiteShellPage>

        <SiteShellPage id="products" title={t({ en: "Product catalogue — Ostrand Components", tr: "Ürün kataloğu — Ostrand Components" })}>
          <PageIntro
            {...common}
            variant="ruled"
            breadcrumb={[{ label: "Ostrand", href: home() }, { label: t({ en: "Products", tr: "Ürünler" }) }]}
            title={t({ en: "Product *catalogue*", tr: "Ürün *kataloğu*" })}
            lead={t({ en: "Pick a product and a size. Switch to imperial units, then download the datasheet for your ERP or your drawing.", tr: "Bir ürün ve ölçü seçin. İnç birimlerine geçin, ardından teknik föyü ERP’niz veya resminiz için indirin." })}
            meta={[
              { label: t({ en: "Datasheets", tr: "Teknik föy" }), value: t({ en: "CSV, metric or imperial", tr: "CSV, metrik veya inç" }) },
              { label: t({ en: "Certificates", tr: "Sertifika" }), value: t({ en: "EN 10204 3.1 with every lot", tr: "Her partide EN 10204 3.1" }) },
              { label: t({ en: "Stock parts", tr: "Stok parça" }), value: t({ en: "Dispatched in 48 hours", tr: "48 saatte sevk" }) },
            ]}
          />
          <Catalogue locale={locale} />
          <Cta
            {...common}
            variant="split"
            theme={{ surface: "surface-2" }}
            title={t({ en: "Not in the catalogue? We machine to your drawing.", tr: "Katalogda yok mu? Resminize göre işleriz." })}
            lead={t({ en: "Quotes in two working days, first articles in three to four weeks.", tr: "İki iş gününde teklif, üç-dört haftada ilk numune." })}
            actions={[{ link: { href: home("rfq"), label: t({ en: "Request a quote", tr: "Teklif iste" }) }, style: "primary" }]}
          />
        </SiteShellPage>

        <SiteShellPage id="quality" title={t({ en: "Quality — Ostrand Components", tr: "Kalite — Ostrand Components" })}>
          <PageIntro
            {...common}
            variant="ruled"
            breadcrumb={[{ label: "Ostrand", href: home() }, { label: t({ en: "Quality", tr: "Kalite" }) }]}
            title={t({ en: "Measured, *then* shipped", tr: "Önce ölçülür, *sonra* gönderilir" })}
            lead={t({ en: "A temperature-controlled measuring room next to the machines, statistical process control on every critical dimension and a report you can open before the truck arrives.", tr: "Tezgâhların yanında sıcaklık kontrollü ölçüm odası, her kritik ölçüde istatistiksel proses kontrolü ve kamyon gelmeden açabileceğiniz bir rapor." })}
            meta={[
              { label: t({ en: "Measuring room", tr: "Ölçüm odası" }), value: "20 ± 1 °C" },
              { label: t({ en: "Customer PPM 2025", tr: "Müşteri PPM 2025" }), value: "38" },
              { label: t({ en: "PPAP", tr: "PPAP" }), value: t({ en: "Levels 1–5", tr: "Seviye 1–5" }) },
            ]}
          />
          <SpcPanel locale={locale} />
          <Steps
            {...common}
            variant="split"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Quality gates", tr: "Kalite kapıları" })}
            title={t({ en: "Four checks *every lot passes*", tr: "*Her partinin geçtiği* dört kontrol" })}
            steps={[
              { title: t({ en: "Incoming material", tr: "Giriş malzemesi" }), text: t({ en: "Spectrometer check of every heat against its 3.1 certificate before the bar is cut.", tr: "Çubuk kesilmeden önce her döküm 3.1 sertifikasına karşı spektrometreyle kontrol edilir." }), duration: t({ en: "Every heat", tr: "Her döküm" }) },
              { title: t({ en: "First-off approval", tr: "İlk parça onayı" }), text: t({ en: "The first part of every set-up is measured in full and signed off before the run continues.", tr: "Her bağlamanın ilk parçası tam ölçülür ve onaylanmadan üretim devam etmez." }), duration: t({ en: "Every set-up", tr: "Her bağlama" }) },
              { title: t({ en: "In-process SPC", tr: "Proses içi SPC" }), text: t({ en: "Critical dimensions charted at the machine; an out-of-control point stops the cell.", tr: "Kritik ölçüler tezgâhta grafiğe işlenir; kontrol dışı bir nokta hücreyi durdurur." }), duration: t({ en: "Every 40 min", tr: "Her 40 dk" }) },
              { title: t({ en: "Final inspection", tr: "Son kontrol" }), text: t({ en: "AQL 0.65 sampling, visual check of plating, labels scanned against the order.", tr: "AQL 0,65 örnekleme, kaplamanın gözle kontrolü, etiketler siparişe karşı okutulur." }), duration: t({ en: "Every lot", tr: "Her parti" }) },
            ]}
          />
          <CertificateList locale={locale} />
          <Faq
            {...common}
            variant="split"
            eyebrow={t({ en: "Quality FAQ", tr: "Kalite SSS" })}
            title={t({ en: "What buyers *ask first*", tr: "Satın almacıların *ilk sorduğu*" })}
            items={[
              { q: t({ en: "Do you supply PPAP documentation?", tr: "PPAP dokümantasyonu veriyor musunuz?" }), a: t({ en: "Yes, levels 1 to 5, including PSW, control plan, PFMEA and capability studies. Level 3 is included in the first-article price.", tr: "Evet, 1’den 5’e kadar; PSW, kontrol planı, PFMEA ve yeterlilik çalışmaları dahil. Seviye 3 ilk numune fiyatına dahildir." }) },
              { q: t({ en: "Can I audit the plant?", tr: "Fabrikayı denetleyebilir miyim?" }), a: t({ en: "Customer audits are welcome with two weeks’ notice. We host about 30 a year.", tr: "İki hafta önceden haber vererek müşteri denetimi yapabilirsiniz. Yılda yaklaşık 30 denetim ağırlıyoruz." }) },
              { q: t({ en: "How is a part traced?", tr: "Bir parça nasıl izlenir?" }), a: t({ en: "Each box label carries the lot number, which links to the heat, the machine, the operator and the SPC data for that run.", tr: "Her kutu etiketinde parti numarası vardır; bu numara dökümü, tezgâhı, operatörü ve o üretimin SPC verisini bağlar." }) },
              { q: t({ en: "What happens with a reject?", tr: "Bir ret durumunda ne olur?" }), a: t({ en: "Containment within 24 hours, an 8D report within ten working days, and we sort or replace at our cost.", tr: "24 saat içinde sınırlama, on iş günü içinde 8D raporu; ayıklama veya değişim bizim maliyetimizdedir." }) },
            ]}
          />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Ostrand Components", href: home() }}
        about={t({ en: "Precision flanges, bearing housings, hydraulic fittings and shafts, made in Gebze since 1987.", tr: "1987’den beri Gebze’de üretilen hassas flanş, rulman yatağı, hidrolik bağlantı ve miller." })}
        columns={[
          { title: t({ en: "Products", tr: "Ürünler" }), links: families.map((f) => ({ href: sitePageHref("products", f.id), label: t(f.name) })) },
          { title: t({ en: "Company", tr: "Şirket" }), links: [{ href: qualityHref, label: t({ en: "Quality", tr: "Kalite" }) }, { href: home("capabilities"), label: t({ en: "Capabilities", tr: "Kabiliyetler" }) }, { href: home("rfq"), label: t({ en: "Request a quote", tr: "Teklif iste" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address }}
        company={{ legalName: "Ostrand Makina Parçaları San. ve Tic. A.Ş.", registry: [{ label: t({ en: "Trade registry", tr: "Ticaret sicil" }), value: "Gebze 00000" }] }}
        legalLinks={[{ href: "/terms-of-sale", label: t({ en: "Terms of sale", tr: "Satış koşulları" }) }, { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }]}
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
