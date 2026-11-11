import { Container, Faq, PageIntro, Section, sitePageHref, Steps } from "@vamos-ui/react/blocks";
import type { Copy } from "./content";
import { DonateForm } from "./donate-form";
import { GiftBuilder } from "./gift-builder";
import { CampaignMeter } from "./campaign-meter";

/** Donate: the gift builder as step 1, the donor's details as step 2, then what happens next. */
export function DonatePage({ c }: { c: Copy }) {
  const { t, intl, labels } = c;
  const common = { locale: intl, labels };
  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        headingLevel={1}
        breadcrumb={[{ label: t({ en: "Home", tr: "Ana sayfa" }), href: sitePageHref("home") }, { label: t({ en: "Donate", tr: "Bağış yap" }) }]}
        eyebrow={t({ en: "Winter Reading Drive", tr: "Kış Okuma Kampanyası" })}
        title={t({ en: "Put a book *in a child’s hands*", tr: "Bir çocuğun *eline* bir kitap verin" })}
        lead={t({ en: "Two short steps. You will see what your gift becomes before you pay.", tr: "İki kısa adım. Ödemeden önce bağışınızın neye dönüştüğünü görürsünüz." })}
        meta={[
          { label: t({ en: "Receipt", tr: "Makbuz" }), value: t({ en: "Tax receipt by email", tr: "E-postayla vergi makbuzu" }) },
          { label: t({ en: "Payment", tr: "Ödeme" }), value: t({ en: "Card or bank transfer, 3-D Secure", tr: "Kart ya da havale, 3-D Secure" }) },
          { label: t({ en: "Overheads", tr: "Genel gider" }), value: t({ en: "8% — see the report", tr: "%8 — rapora bakın" }) },
        ]}
      />

      <Section headingId="osf-step1" theme={{ rhythm: "tight" }}>
        <Container>
          <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
            <h2 id="osf-step1" className="m-0 flex items-baseline gap-4 font-display text-display-m">
              <span className="font-mono text-sm text-accent-ink">01</span>
              {t({ en: "Choose your gift", tr: "Bağışınızı seçin" })}
            </h2>
            <CampaignMeter c={c} compact />
          </div>
          <GiftBuilder locale={c.locale} variant="donate" headingId="osf-donate-gift" />
        </Container>
      </Section>

      <Section headingId="osf-step2" theme={{ rhythm: "tight" }}>
        <Container>
          <div className="grid gap-8 border-t border-fg pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
            <div>
              <h2 id="osf-step2" className="m-0 flex items-baseline gap-4 font-display text-display-m">
                <span className="font-mono text-sm text-accent-ink">02</span>
                {t({ en: "Your details", tr: "Bilgileriniz" })}
              </h2>
              <p className="m-0 mt-4 max-w-[40ch] text-fg-muted">
                {t({ en: "Only what the receipt needs. We never sell or swap donor lists, and we write at most four times a year.", tr: "Yalnızca makbuz için gerekenler. Bağışçı listelerini asla satmaz ya da paylaşmayız; yılda en fazla dört kez yazarız." })}
              </p>
            </div>
            <DonateForm locale={c.locale} />
          </div>
        </Container>
      </Section>

      <Steps
        {...common}
        variant="vertical"
        theme={{ surface: "surface-2" }}
        eyebrow={t({ en: "After you give", tr: "Bağıştan sonra" })}
        title={t({ en: "What happens *next*", tr: "Sonra ne *olur*" })}
        steps={[
          { title: t({ en: "Receipt", tr: "Makbuz" }), text: t({ en: "A tax receipt in your inbox within a minute, in your name or the name you give.", tr: "Bir dakika içinde, sizin ya da belirttiğiniz kişinin adına vergi makbuzu." }), duration: t({ en: "Same minute", tr: "Aynı dakika" }) },
          { title: t({ en: "Your shelf", tr: "Rafınız" }), text: t({ en: "We tell you which shelf your gift stocked, with a photo from the day the books arrived.", tr: "Bağışınızın hangi rafı doldurduğunu, kitapların geldiği günün fotoğrafıyla bildiririz." }), duration: t({ en: "Within 3 weeks", tr: "3 hafta içinde" }) },
          { title: t({ en: "Its numbers", tr: "Rakamları" }), text: t({ en: "Each quarter: how many books that shelf lent and which ones came back dog-eared.", tr: "Her çeyrek: o rafın kaç kitap ödünç verdiği ve hangilerinin yıpranarak döndüğü." }), duration: t({ en: "Quarterly", tr: "Üç ayda bir" }) },
        ]}
      />

      <Faq
        {...common}
        variant="split"
        eyebrow={t({ en: "Questions", tr: "Sorular" })}
        title={t({ en: "Before you *give*", tr: "Bağış yapmadan *önce*" })}
        items={[
          { q: t({ en: "Can I stop a monthly gift?", tr: "Aylık bağışı durdurabilir miyim?" }), a: t({ en: "Yes — every receipt has a link to pause, change or stop it. No call, no form.", tr: "Evet — her makbuzda duraklatma, değiştirme ya da durdurma bağlantısı var. Telefon yok, form yok." }) },
          { q: t({ en: "Is my gift tax-deductible?", tr: "Bağışım vergiden düşülebilir mi?" }), a: t({ en: "Open Shelf is a registered foundation; gifts are deductible within the legal limits for individuals and companies. The receipt has what your accountant needs.", tr: "Open Shelf tescilli bir vakıftır; bağışlar bireyler ve şirketler için yasal sınırlar içinde indirilebilir. Makbuzda muhasebecinizin ihtiyaç duyduğu her şey var." }) },
          { q: t({ en: "Can I give books instead of money?", tr: "Para yerine kitap bağışlayabilir miyim?" }), a: t({ en: "New picture books, yes — drop them at the Karaköy office on weekdays 10:00–17:00. We can’t take used books; shelves fill up with the wrong ones.", tr: "Yeni resimli kitaplar, evet — hafta içi 10:00–17:00 Karaköy ofisine bırakabilirsiniz. Kullanılmış kitap alamıyoruz; raflar yanlış kitaplarla doluyor." }) },
          { q: t({ en: "Why do you show prices for everything?", tr: "Neden her şeyin fiyatını gösteriyorsunuz?" }), a: t({ en: "Because you should be able to check us. The prices come from last year’s audited accounts and are updated each January.", tr: "Çünkü bizi denetleyebilmelisiniz. Fiyatlar geçen yılın denetlenmiş hesaplarından gelir ve her ocak güncellenir." }) },
        ]}
        contact={{ link: { href: "mailto:hello@openshelf.example.com", label: t({ en: "Write to us", tr: "Bize yazın" }) }, style: "link" }}
      />
    </>
  );
}
