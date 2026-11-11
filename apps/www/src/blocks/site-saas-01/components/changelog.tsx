import { Cta, FeatureGrid, PageIntro, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, type SiteLocale } from "./content";

/** The release notes, newest first. Dates are `YYYY-MM-DD`; the page formats them per locale. */
const releases = [
  {
    version: "2.4",
    date: "2026-11-04",
    title: { en: "Shared inboxes for *every* plan", tr: "*Tüm* paketlere ortak gelen kutusu" },
    items: [
      { icon: "inbox", title: { en: "Shared inboxes on Solo", tr: "Solo’da ortak gelen kutusu" }, text: { en: "One location, several people: the Solo plan now has assignments and internal notes.", tr: "Tek şube, birkaç kişi: Solo paketinde artık atama ve iç notlar var." } },
      { icon: "message-circle", title: { en: "Instagram replies from the app", tr: "Uygulamadan Instagram yanıtları" }, text: { en: "Answer story replies and DMs from iOS and Android without opening Instagram.", tr: "Hikâye yanıtlarını ve mesajları Instagram’ı açmadan iOS ve Android’den yanıtlayın." } },
      { icon: "timer", title: { en: "Reply-time goals", tr: "Yanıt süresi hedefleri" }, text: { en: "Set a target per channel; the report marks every reply that missed it.", tr: "Kanal başına bir hedef belirleyin; rapor hedefi kaçıran her yanıtı işaretler." } },
    ],
  },
  {
    version: "2.3",
    date: "2026-10-07",
    title: { en: "Quiet hours, *honestly*", tr: "Sessiz saatler, *dürüstçe*" },
    items: [
      { icon: "moon", title: { en: "Quiet-hours auto-reply", tr: "Sessiz saat otomatik yanıtı" }, text: { en: "Outside opening hours guests learn when you’ll answer, in their language.", tr: "Çalışma saatleri dışında misafir ne zaman yanıt alacağını kendi dilinde öğrenir." } },
      { icon: "calendar-check", title: { en: "Bookings keep the thread", tr: "Rezervasyon konuşmayı korur" }, text: { en: "A booking created from a message links back to the whole conversation.", tr: "Mesajdan oluşturulan rezervasyon tüm konuşmaya bağlı kalır." } },
    ],
  },
  {
    version: "2.2",
    date: "2026-09-02",
    title: { en: "Reports that skip the *closed* hours", tr: "*Kapalı* saatleri saymayan raporlar" },
    items: [
      { icon: "chart-column", title: { en: "Opening-hours-aware reports", tr: "Çalışma saatlerini bilen raporlar" }, text: { en: "Median reply time now counts only the hours you are open.", tr: "Ortanca yanıt süresi artık yalnızca açık olduğunuz saatleri sayar." } },
      { icon: "file-down", title: { en: "CSV export", tr: "CSV dışa aktarma" }, text: { en: "Every report downloads as CSV for your accountant or your own sheet.", tr: "Her rapor muhasebeciniz ya da kendi tablonuz için CSV olarak iner." } },
    ],
  },
] as const;

/** The “What’s new” inner page: an h1 intro, one section per release, a closing CTA. */
export function Changelog({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const date = (iso: string) => new Intl.DateTimeFormat(intl, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
  const latest = releases[0];

  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[{ label: "Relay", href: sitePageHref("home") }, { label: t({ en: "What’s new", tr: "Yenilikler" }) }]}
        title={t({ en: "What’s *new* in Relay", tr: "Relay’de *neler yeni*" })}
        lead={t({ en: "A release on the first Tuesday of every month. Nothing is switched on for you without a note here first.", tr: "Her ayın ilk salısı bir sürüm. Burada önce yazmadan hiçbir şey sizin için açılmaz." })}
        meta={[
          { label: t({ en: "Latest", tr: "Son sürüm" }), value: `v${latest.version}` },
          { label: t({ en: "Released", tr: "Yayın" }), value: date(latest.date) },
          { label: t({ en: "Cadence", tr: "Sıklık" }), value: t({ en: "Monthly", tr: "Aylık" }) },
        ]}
      />

      {releases.map((r, i) => (
        <FeatureGrid
          {...common}
          key={r.version}
          anchor={`v${r.version.replace(".", "-")}`}
          variant="list"
          theme={i % 2 === 1 ? { surface: "surface-2" } : undefined}
          eyebrow={`v${r.version} · ${date(r.date)}`}
          title={t(r.title)}
          items={r.items.map((item) => ({ icon: item.icon, title: t(item.title), text: t(item.text) }))}
        />
      ))}

      <Cta
        {...common}
        variant="band"
        theme={{ surface: "accent" }}
        title={t({ en: "Every update, on *every* plan", tr: "Her güncelleme, *her* pakette" })}
        actions={[
          { link: { href: "/signup", label: t({ en: "Try free for 14 days", tr: "14 gün ücretsiz deneyin" }) }, style: "primary" },
          { link: { href: sitePageHref("home", "pricing"), label: t({ en: "See pricing", tr: "Fiyatları görün" }) }, style: "secondary" },
        ]}
        fineprint={t({ en: "No card needed. Cancel any time.", tr: "Kart gerekmez. İstediğiniz zaman iptal edin." })}
      />
    </>
  );
}
