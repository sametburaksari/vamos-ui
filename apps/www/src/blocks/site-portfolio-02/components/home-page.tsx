import { Image } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { copyFor, pagedProjects, projectPage, projects, recognition, statuses, typologies, type SiteLocale } from "./content";
import { ProjectIndex } from "./project-index";
import { CountUp, Parallax, Reveal, Stagger } from "@vamos-ui/react/motion";

/**
 * Kerte draws slowly, and the site moves the same way: long, linear-feeling eases, nothing that
 * bounces. Signature: hairlines are ruled across each section head and plate caption, as on a
 * drawing sheet, before the text settles; the headline is drafted in from the margin. Plates wipe
 * up like a print leaving the plotter. The hero model is the one parallax.
 */
const kerteMotion = `
@keyframes kt-draft { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes kt-draft-rtl { from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0 0 0 0); } }
.kt-rule { position: relative; }
.kt-rule::before { content: ""; position: absolute; inset-inline: 0; inset-block-start: 0; height: 1px; background: var(--fg); transform-origin: left center; }
[dir="rtl"] .kt-rule::before { transform-origin: right center; }
@media screen and (prefers-reduced-motion: no-preference) {
  .kt-draw:where(:not([data-motion="off"] *)) { animation: kt-draft 1400ms var(--ease-in-out) 160ms backwards; }
  [dir="rtl"] .kt-draw:where(:not([data-motion="off"] *)) { animation-name: kt-draft-rtl; }
  .kt-rule[data-reveal-state]:where(:not([data-motion="off"] *))::before { transition: transform 1100ms var(--ease-in-out); }
  .kt-rule[data-reveal-state="pending"]:where(:not([data-motion="off"] *))::before { transform: scaleX(0); }
  .kt-rule[data-reveal-state="pending"]:where(:not([data-motion="off"] *)) { opacity: 1 !important; }
  .kt-rule[data-reveal-state="pending"]:where(:not([data-motion="off"] *)) > * { opacity: 0; }
  .kt-rule[data-reveal-state]:where(:not([data-motion="off"] *)) > * { transition: opacity 700ms linear 450ms; }
}
`;

/** Drawing title block: the hero's "label" in the corner of the sheet. */
function TitleBlock({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 border border-fg text-small">
      {rows.map(([k, v], i) => (
        <div key={k} className={`flex flex-col gap-1 p-2.5 ${i % 2 === 1 ? "border-s border-fg" : ""} ${i > 1 ? "border-t border-fg" : ""}`}>
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">{k}</dt>
          <dd className="text-fg">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Section head on the grid: number in the first column, title across, a hairline above. */
function Head({ no, id, title, lead }: { no: string; id: string; title: string; lead?: string }) {
  return (
    <Reveal effect="fade" duration={1000} className="kt-rule mb-8 grid gap-x-5 gap-y-3 pt-3 @3xl:mb-12 @3xl:grid-cols-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted @3xl:col-span-2">{no}</p>
      <h2 id={id} className="font-display text-display-m @3xl:col-span-6">
        {title}
      </h2>
      {lead ? <p className="max-w-[44ch] text-pretty text-fg-muted @3xl:col-span-4">{lead}</p> : null}
    </Reveal>
  );
}

/** Plate layouts across the 12 columns, alternating so the page never settles into a card grid. */
const plates = [
  { img: "@3xl:col-span-8", cap: "@3xl:col-span-3 @3xl:col-start-10 @3xl:self-end" },
  { img: "@3xl:col-span-5 @3xl:col-start-6 @3xl:order-2", cap: "@3xl:col-span-3 @3xl:col-start-2 @3xl:order-1 @3xl:self-start" },
  { img: "@3xl:col-span-7 @3xl:col-start-3", cap: "@3xl:col-span-2 @3xl:col-start-11 @3xl:self-center" },
  { img: "@3xl:col-span-9 @3xl:col-start-4 @3xl:order-2", cap: "@3xl:col-span-3 @3xl:order-1 @3xl:self-end" },
];

export function HomePage({ locale }: { locale: SiteLocale }) {
  const { t, intl } = copyFor(locale);
  const nf = new Intl.NumberFormat(intl);
  const hero = projects.find((p) => p.id === "kordon")!.figures[0]!;
  const typeOf = (id: string) => t(typologies.find((x) => x.id === id)!.label);
  const built = projects.filter((p) => p.status === "built").length;

  return (
    <>
      <Section anchor="top" aria-labelledby="kt-h1" theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <div className="grid gap-x-5 gap-y-8 @3xl:grid-cols-12">
            <div className="@3xl:col-span-8">
              <style>{kerteMotion}</style>
              <p className="vm-enter font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">{t({ en: "Kerte Architects — Moda, Istanbul — since 2011", tr: "Kerte Mimarlık — Moda, İstanbul — 2011’den beri" })}</p>
              <h1 id="kt-h1" tabIndex={-1} className="kt-draw mt-6 max-w-[16ch] font-display text-display-xl text-balance outline-none">
                {t({ en: "We draw slowly, so buildings can age well.", tr: "Yavaş çiziyoruz ki binalar iyi yaşlansın." })}
              </h1>
            </div>
            <div className="vm-enter [--vm-i:4] flex flex-col justify-end gap-4 @3xl:col-span-4">
              <p className="text-pretty text-fg-muted">
                {t({
                  en: "Fourteen people designing houses, housing and small public buildings around the Marmara and the Aegean — in lime, stone and timber wherever we can.",
                  tr: "Marmara ve Ege çevresinde ev, toplu konut ve küçük kamu yapıları tasarlayan on dört kişi — elimizden geldiğince kireç, taş ve ahşapla.",
                })}
              </p>
              <TitleBlock
                rows={[
                  [t({ en: "Sheet", tr: "Pafta" }), "A-000"],
                  [t({ en: "Scale", tr: "Ölçek" }), "1:1"],
                  [t({ en: "Built", tr: "Uygulanan" }), String(built + 34)],
                  [t({ en: "On site", tr: "Şantiyede" }), t({ en: "Cedar Row, Bursa", tr: "Sedir Sıra, Bursa" })],
                ]}
              />
            </div>
          </div>
          <figure className="mt-10 @3xl:mt-14">
            {/* The one scroll-linked effect: the competition model drifts slower than the page. */}
            <Parallax shift={32} className="vm-enter vm-enter-media [--vm-i:3] aspect-[21/9]">
              <Image src={hero.src!} width={hero.width} height={hero.height} focal={hero.focal} alt={t(hero.alt)} aspect="auto" className="size-full" priority sizes="100vw" />
            </Parallax>
            <figcaption className="mt-2 grid gap-x-5 font-mono text-[11px] uppercase tracking-[0.12em] text-fg-muted @3xl:grid-cols-12">
              <span className="text-fg @3xl:col-span-2">{t({ en: "Fig. 00", tr: "Şek. 00" })}</span>
              <span className="normal-case tracking-normal @3xl:col-span-7">{t({ en: "Kordon Pavilion, İzmir — competition model, second prize, 2022.", tr: "Kordon Pavyonu, İzmir — yarışma maketi, ikinci ödül, 2022." })}</span>
              <span className="@3xl:col-span-3 @3xl:text-end">{t({ en: "Model", tr: "Maket" })}: Yuna Park</span>
            </figcaption>
          </figure>
        </Container>
      </Section>

      <Section anchor="work" aria-labelledby="kt-work">
        <Container size="wide">
          <Head
            no="01 / 04"
            id="kt-work"
            title={t({ en: "Selected work", tr: "Seçili işler" })}
            lead={t({ en: "Four projects from the last three years, each with its drawings and the story of the site.", tr: "Son üç yılın dört projesi; her biri çizimleri ve arsanın hikâyesiyle." })}
          />
          <ol className="flex flex-col gap-16 @3xl:gap-24">
            {pagedProjects.map((p, i) => {
              const f = p.figures.find((x) => x.kind === "photo")!;
              const lay = plates[i % plates.length]!;
              const href = sitePageHref(projectPage(p.id));
              return (
                <li key={p.id} className="grid gap-x-5 gap-y-4 @3xl:grid-cols-12">
                  <Reveal asChild effect="clip" duration={1200}>
                  <a href={href} tabIndex={-1} aria-hidden className={`group block overflow-hidden ${lay.img}`}>
                    <Image
                      src={f.src!}
                      width={f.width}
                      height={f.height}
                      focal={f.focal}
                      alt=""
                      aspect={i % 2 === 0 ? "3/2" : "4/5"}
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="transition-transform duration-[1200ms] ease-out group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </a>
                  </Reveal>
                  <Reveal effect="fade" delay={350} duration={1000} className={`kt-rule flex flex-col gap-3 pt-3 ${lay.cap}`}>
                    <p className="flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
                      <span className="text-accent-ink">{t({ en: "Fig.", tr: "Şek." })} {String(i + 1).padStart(2, "0")}</span>
                      <span>{p.no}</span>
                    </p>
                    <h3 className="font-display text-h3">
                      <a href={href} className="rounded-[2px] underline-offset-4 hover:underline focus-ring">
                        {t(p.name)}
                      </a>
                    </h3>
                    <p className="text-small text-pretty text-fg-muted">{t(p.line)}</p>
                    <dl className="grid grid-cols-2 gap-y-1 border-t border-line pt-2 font-mono text-[11px] uppercase tracking-[0.1em]">
                      <dt className="text-fg-subtle">{t({ en: "Place", tr: "Yer" })}</dt>
                      <dd className="text-fg">{t(p.place)}</dd>
                      <dt className="text-fg-subtle">{t({ en: "Type", tr: "Tür" })}</dt>
                      <dd className="text-fg">{typeOf(p.typology)}</dd>
                      <dt className="text-fg-subtle">{t({ en: "Area", tr: "Alan" })}</dt>
                      <dd className="tabular text-fg">{nf.format(p.area)} m²</dd>
                      <dt className="text-fg-subtle">{t({ en: "Status", tr: "Durum" })}</dt>
                      <dd className="text-fg">
                        {t(statuses[p.status])}, {p.year}
                      </dd>
                    </dl>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </Container>
      </Section>

      <Section anchor="index" aria-labelledby="kt-index">
        <Container size="wide">
          <Head
            no="02 / 04"
            id="kt-index"
            title={t({ en: "Index", tr: "Dizin" })}
            lead={t({ en: "Every project since 2020, built or not. Unbuilt work stays on the list — most of what we know came from it.", tr: "2020’den bu yana tüm projeler, uygulansın uygulanmasın. Uygulanmayan işler listede kalır — bildiklerimizin çoğu onlardan geldi." })}
          />
          <div className="@3xl:grid @3xl:grid-cols-12 @3xl:gap-x-5">
            <div className="@3xl:col-span-10 @3xl:col-start-3">
              <ProjectIndex locale={locale} />
            </div>
          </div>
        </Container>
      </Section>

      <Section anchor="practice" aria-labelledby="kt-practice">
        <Container size="wide">
          <Head no="03 / 04" id="kt-practice" title={t({ en: "Practice", tr: "Pratik" })} />
          <div className="grid gap-x-5 gap-y-10 @3xl:grid-cols-12">
            <dl className="grid grid-cols-2 gap-x-5 gap-y-6 @3xl:col-span-4 @3xl:col-start-3">
              {[
                ["2011", t({ en: "Founded in Moda", tr: "Moda’da kuruldu" })],
                [<CountUp key="n" value={14} duration={1600} />, t({ en: "People in the studio", tr: "Stüdyodaki kişi" })],
                [<CountUp key="n" value={built + 34} duration={1800} />, t({ en: "Buildings completed", tr: "Tamamlanan bina" })],
                ["1:50", t({ en: "A model of every project", tr: "Her projenin maketi" })],
              ].map(([v, k]) => (
                <div key={k as string} className="border-t border-line pt-2">
                  <dt className="text-small text-fg-muted">{k}</dt>
                  <dd className="tabular mt-1 font-display text-display-m">{v}</dd>
                </div>
              ))}
            </dl>
            <Stagger asChild effect="fade" step={120} duration={1000}>
            <ol className="@3xl:col-span-5 @3xl:col-start-8">
              {[
                [t({ en: "Architecture", tr: "Mimarlık" }), t({ en: "Houses, housing and civic buildings, from site visit to handover.", tr: "Ev, toplu konut ve kamu yapıları; arsa ziyaretinden teslime kadar." })],
                [t({ en: "Cooperative housing", tr: "Kooperatif konut" }), t({ en: "Workshops with residents, plan types, cost plans the co-op can read.", tr: "Sakinlerle atölyeler, plan tipleri, kooperatifin okuyabileceği maliyet planları." })],
                [t({ en: "Surveys & restoration", tr: "Rölöve ve restorasyon" }), t({ en: "Measured surveys and restoration projects for listed buildings.", tr: "Tescilli yapılar için rölöve ve restorasyon projeleri." })],
                [t({ en: "Competitions", tr: "Yarışmalar" }), t({ en: "Two open competitions a year, chosen by the whole studio.", tr: "Yılda iki açık yarışma; bütün stüdyo birlikte seçer." })],
              ].map(([k, v], i) => (
                <li key={k} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3 border-t border-line py-4 last:border-b">
                  <span className="font-mono text-[11px] text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-body font-medium text-fg">{k}</h3>
                    <p className="mt-1 text-small text-fg-muted">{v}</p>
                  </div>
                </li>
              ))}
            </ol>
            </Stagger>
          </div>
        </Container>
      </Section>

      <Section anchor="recognition" aria-labelledby="kt-rec">
        <Container size="wide">
          <Head no="04 / 04" id="kt-rec" title={t({ en: "Awards & publications", tr: "Ödüller ve yayınlar" })} />
          <Stagger asChild effect="fade" step={80} duration={900}>
          <ul className="@3xl:ps-[calc(100%/6)]">
            {recognition.map((r) => (
              <li key={r.title.en} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-5 border-t border-line py-3 last:border-b @3xl:grid-cols-[4rem_minmax(0,1fr)_minmax(0,16rem)]">
                <span className="tabular font-mono text-[12px] text-fg-muted">{r.year}</span>
                <span className="text-fg">{t(r.title)}</span>
                <span className="col-start-2 text-small text-fg-muted @3xl:col-start-3 @3xl:text-end">{r.by}</span>
              </li>
            ))}
          </ul>
          </Stagger>
          <div className="mt-16 grid gap-x-5 gap-y-4 border-t border-fg pt-6 @3xl:grid-cols-12">
            <p className="font-display text-display-m text-balance @3xl:col-span-7 @3xl:col-start-3">{t({ en: "Taking on new commissions from spring 2027.", tr: "2027 baharından itibaren yeni iş alıyoruz." })}</p>
            <a
              href={sitePageHref("studio", "contact")}
              className="vm-nudge inline-flex items-center gap-2 self-end justify-self-start rounded-[2px] border-b border-accent pb-1 text-fg hover:text-accent-ink focus-ring @3xl:col-span-3 @3xl:justify-self-end"
            >
              {t({ en: "Write to the studio", tr: "Stüdyoya yazın" })}
              <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}
