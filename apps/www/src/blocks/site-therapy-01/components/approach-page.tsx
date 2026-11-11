import { Container, Cta, PageIntro, RichTextSection, Section, SectionHeader, sitePageHref, Steps } from "@vamos-ui/react/blocks";
import { approach, copyFor, photos, type SiteLocale } from "./content";

const c = {
  philosophyEyebrow: { en: "What we believe", tr: "İnandıklarımız" },
  philosophyTitle: { en: "The relationship *is* the work", tr: "İlişkinin *kendisi* iştir" },
  philosophy: {
    en: "We are integrative therapists. That means we don’t bend you to fit one method; we draw on psychodynamic, person-centred and cognitive ideas depending on what helps you, and we tell you which and why.\n\nMost of the work is talking, at a pace you set. Some weeks you will arrive with a lot to say, and some weeks with nothing at all. Both are fine. Silence in this room is not a test.\n\nWe will never promise that you will feel a certain way by a certain date. What we can promise is the same time, the same person and someone paying full attention for fifty minutes.",
    tr: "Bütünleyici terapistleriz. Yani sizi tek bir yönteme uydurmaya çalışmayız; size neyin iyi geldiğine göre psikodinamik, danışan odaklı ve bilişsel fikirlerden yararlanır, hangisini neden kullandığımızı da söyleriz.\n\nİşin çoğu konuşmaktır, sizin belirlediğiniz hızda. Bazı haftalar anlatacak çok şeyle, bazı haftalar hiçbir şeyle gelirsiniz. İkisi de olur. Bu odadaki sessizlik bir sınav değildir.\n\nBelli bir tarihte belli bir şekilde hissedeceğinize asla söz vermeyiz. Söz verebileceğimiz şey aynı saat, aynı kişi ve elli dakika boyunca tüm dikkatiyle sizi dinleyen biridir.",
  },
  stepsEyebrow: { en: "From first call to last session", tr: "İlk görüşmeden son seansa" },
  stepsTitle: { en: "What to *expect*", tr: "Neler *beklemeli*" },
  steps: [
    { title: { en: "A free 15-minute call", tr: "Ücretsiz 15 dakikalık görüşme" }, text: { en: "You tell us as much or as little as you like; we explain how we work and suggest who might suit you. No obligation.", tr: "İstediğiniz kadar az ya da çok anlatırsınız; nasıl çalıştığımızı anlatır, size kimin uygun olabileceğini öneririz. Hiçbir yükümlülük yok." }, duration: { en: "15 min", tr: "15 dk" } },
    { title: { en: "A first session", tr: "İlk seans" }, text: { en: "A longer conversation to see whether you and the therapist fit. You pay for it only if you decide to continue.", tr: "Terapistle uyumlu olup olmadığınızı görmek için daha uzun bir sohbet. Yalnızca devam etmeye karar verirseniz ücretini ödersiniz." }, duration: { en: "50 min", tr: "50 dk" } },
    { title: { en: "A regular time", tr: "Düzenli bir saat" }, text: { en: "The same slot each week or fortnight. It stays yours, including through holidays, unless you let it go.", tr: "Her hafta ya da iki haftada bir aynı saat. Siz bırakmadıkça tatillerde bile sizindir." }, duration: { en: "weekly", tr: "haftalık" } },
    { title: { en: "A review every sixth session", tr: "Her altıncı seansta bir değerlendirme" }, text: { en: "Ten minutes to ask: is this still useful, should anything change, is it time to space sessions out?", tr: "Şunu sormak için on dakika: Hâlâ işe yarıyor mu, bir şey değişmeli mi, seansları seyreltme zamanı mı?" }, duration: { en: "10 min", tr: "10 dk" } },
    { title: { en: "A planned ending", tr: "Planlı bir bitiş" }, text: { en: "We agree the last few sessions together, so therapy ends on purpose rather than fading out.", tr: "Son birkaç seansı birlikte planlarız; terapi kendiliğinden sönmez, bilinçli olarak biter." } },
  ],
  confEyebrow: { en: "Confidentiality", tr: "Gizlilik" },
  confTitle: { en: "Private — with *three* honest limits", tr: "Gizli — *üç* dürüst sınırla" },
  confLead: { en: "Nothing you say leaves the room, and we don’t confirm to anyone that you are a client. The law and our professional code make three exceptions, and we would always try to talk to you first.", tr: "Söylediğiniz hiçbir şey odadan çıkmaz ve kimseye danışanımız olduğunuzu doğrulamayız. Yasa ve mesleki kurallarımız üç istisna öngörür; her durumda önce sizinle konuşmaya çalışırız." },
  limits: [
    { title: { en: "A serious risk to your life", tr: "Hayatınız için ciddi bir risk" }, text: { en: "If we believe you are in immediate danger, we may contact emergency services or a person you have named.", tr: "Yakın bir tehlikede olduğunuzu düşünürsek acil servislere ya da adını verdiğiniz bir kişiye ulaşabiliriz." } },
    { title: { en: "A risk to someone else", tr: "Başka biri için risk" }, text: { en: "Including any child or vulnerable adult who may be harmed.", tr: "Zarar görebilecek bir çocuk ya da korunmaya muhtaç bir yetişkin dahil." } },
    { title: { en: "A court order", tr: "Mahkeme kararı" }, text: { en: "If a court requires notes, we share only what is ordered, and tell you unless we are forbidden to.", tr: "Mahkeme notları isterse yalnızca istenen kadarını paylaşır, yasaklanmadıkça size haber veririz." } },
  ],
  notesTitle: { en: "Our notes", tr: "Notlarımız" },
  notesText: { en: "Brief, kept on paper in a locked cabinet, never in the cloud, and destroyed six years after your last session. You may read them at any time.", tr: "Kısa tutulur, kilitli bir dolapta kâğıt üzerinde saklanır, asla buluta konmaz ve son seansınızdan altı yıl sonra imha edilir. İstediğiniz zaman okuyabilirsiniz." },
  ctaTitle: { en: "Start with a *free* 15-minute call", tr: "*Ücretsiz* 15 dakikalık görüşmeyle başlayın" },
  ctaLead: { en: "Use the private form — a first name and one way to reach you is enough.", tr: "Gizli formu kullanın — bir ilk ad ve size ulaşabileceğimiz bir yol yeterli." },
  ctaAction: { en: "Open the private form", tr: "Gizli formu aç" },
};

/** Approach: what therapy is like here, the steps, and the limits of confidentiality stated plainly. */
export function ApproachPage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  return (
    <>
      <PageIntro
        {...common}
        variant="with-media"
        breadcrumb={[{ label: "Quiet Harbour", href: sitePageHref("home") }, { label: t(approach.crumb) }]}
        title={t(approach.title)}
        lead={t(approach.lead)}
        media={{ ...photos.room, alt: t(photos.room.alt) }}
      />
      <RichTextSection {...common} variant="aside-heading" eyebrow={t(c.philosophyEyebrow)} title={t(c.philosophyTitle)} body={t(c.philosophy)} size="lg" />
      <Steps
        {...common}
        variant="split"
        theme={{ surface: "surface-2" }}
        eyebrow={t(c.stepsEyebrow)}
        title={t(c.stepsTitle)}
        steps={c.steps.map((s) => ({ title: t(s.title), text: t(s.text), duration: "duration" in s && s.duration ? t(s.duration) : undefined }))}
      />
      <Section anchor="confidentiality" headingId="qh-conf-h">
        <Container>
          <SectionHeader eyebrow={t(c.confEyebrow)} title={t(c.confTitle)} lead={t(c.confLead)} headingId="qh-conf-h" className="mb-12" />
          <ol className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line @3xl:grid-cols-3">
            {c.limits.map((l, i) => (
              <li key={i} className="flex flex-col gap-3 bg-surface p-6">
                <span aria-hidden className="font-display text-display-m text-accent-ink tabular">
                  {i + 1}
                </span>
                <h3 className="text-body font-semibold text-fg">{t(l.title)}</h3>
                <p className="text-small text-fg-muted">{t(l.text)}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 grid gap-2 border-s-2 border-accent ps-5 @3xl:max-w-[60ch]">
            <h3 className="font-display text-h3 text-fg">{t(c.notesTitle)}</h3>
            <p className="text-fg-muted">{t(c.notesText)}</p>
          </div>
        </Container>
      </Section>
      <Cta {...common} variant="minimal" title={t(c.ctaTitle)} lead={t(c.ctaLead)} actions={[{ link: { href: sitePageHref("contact"), label: t(c.ctaAction) }, style: "primary" }]} />
    </>
  );
}
