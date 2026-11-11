import { Container, GallerySection, PageIntro, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { shots, TRAILER_SRC, trailers, type Copy, type ShotId } from "./content";
import { clock, TrailerFacade } from "./trailer";

/** Media page: all trailers as facades (the newest one large), then the screenshot mosaic. */
export function MediaPage({ c }: { c: Copy }) {
  const { t, f } = c;
  const common = { locale: c.intl, labels: c.labels };
  const play = t({ en: "Play trailer", tr: "Fragmanı oynat" });
  const ordered = [...trailers].sort((a, b) => b.date.localeCompare(a.date));
  const [featured, ...rest] = ordered;
  const shot = (id: ShotId) => ({ src: shots[id].src, width: shots[id].width, height: shots[id].height, alt: t(shots[id].alt) });
  const total = trailers.reduce((n, x) => n + x.duration, 0);

  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[{ label: "Ember Atlas", href: sitePageHref("home") }, { label: t({ en: "Media", tr: "Medya" }) }]}
        eyebrow={t({ en: "Trailers & screenshots", tr: "Fragmanlar ve görseller" })}
        title={t({ en: "Watch the *fire* move", tr: "Ateşin *hareketini* izleyin" })}
        lead={t({
          en: "Videos load only when you press play — nothing is fetched from a video host before that. Screenshots open full screen; press kit downloads are on the next page.",
          tr: "Videolar yalnızca oynata bastığınızda yüklenir; öncesinde hiçbir video sunucusuna istek gitmez. Görseller tam ekran açılır; basın kiti indirmeleri bir sonraki sayfada.",
        })}
        meta={[
          { label: t({ en: "Trailers", tr: "Fragman" }), value: t({ en: `${trailers.length} · ${clock(total)} in total`, tr: `${trailers.length} · toplam ${clock(total)}` }) },
          { label: t({ en: "Screenshots", tr: "Görsel" }), value: t({ en: "6 · 1920 × 1080", tr: "6 · 1920 × 1080" }) },
        ]}
      />

      <Section anchor="trailers" headingId="ea-trailers-title" theme={{ rhythm: "tight" }}>
        <Container>
          <SectionHeader headingId="ea-trailers-title" eyebrow={t({ en: "Trailers", tr: "Fragmanlar" })} title={t({ en: "Latest first", tr: "En yeni önce" })} />
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <article className="lg:col-span-8" data-trailer-card={featured!.id}>
              <TrailerFacade src={TRAILER_SRC} title={t(featured!.title)} playLabel={play} duration={featured!.duration} poster={shot(featured!.poster)} />
              <p className="m-0 mt-3 flex flex-wrap gap-x-3 text-small text-fg-muted">
                <time dateTime={featured!.date} className="font-mono text-xs">
                  {f.date(featured!.date, "long")}
                </time>
                <span>{t(featured!.note)}</span>
              </p>
            </article>
            <div className="grid content-start gap-6 lg:col-span-4">
              {rest.map((x) => (
                <article key={x.id} data-trailer-card={x.id}>
                  <TrailerFacade size="sm" src={TRAILER_SRC} title={t(x.title)} playLabel={play} duration={x.duration} poster={shot(x.poster)} />
                  <p className="m-0 mt-2 text-xs text-fg-muted">
                    <time dateTime={x.date} className="font-mono">
                      {f.date(x.date, "long")}
                    </time>{" "}
                    · {t(x.note)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <GallerySection
        {...common}
        anchor="screenshots"
        variant="mosaic"
        eyebrow={t({ en: "Screenshots", tr: "Ekran görüntüleri" })}
        title={t({ en: "Six *regions*", tr: "Altı *bölge*" })}
        lead={t({ en: "Pre-alpha mood frames. Click any frame to open it full screen; arrow keys move between them.", tr: "Pre-alfa atmosfer kareleri. Tam ekran açmak için bir kareye tıklayın; ok tuşlarıyla aralarında gezinin." })}
        images={(
          [
            ["summit", "big"],
            ["tide", "1"],
            ["deep", "1"],
            ["lights", "1"],
            ["cloudsea", "1"],
            ["ridges", "1"],
          ] as [ShotId, "big" | "1" | "wide"][]
        ).map(([id, span]) => ({ image: shot(id), caption: `${t(shots[id].region)} — ${t(shots[id].caption)}`, span }))}
      />
    </>
  );
}
