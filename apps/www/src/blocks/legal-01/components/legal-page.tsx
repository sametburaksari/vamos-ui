import { Alert, Prose } from "@vamos-ui/react";
import { Container, PageIntro, Section, blockLabelsTr, site1LabelsTr } from "@vamos-ui/react/blocks";
import type * as React from "react";
import type { LegalBlock, LegalDoc, LegalLocale } from "./types";

const copy = {
  en: {
    home: "Home",
    updated: "Last updated",
    toc: "On this page",
    noticeTitle: "Template text: review before publishing",
    notice: "Replace everything in [brackets] with the business’s real details and have the business owner or a lawyer check every section against what the site really does. Remove this notice afterwards.",
  },
  tr: {
    home: "Ana sayfa",
    updated: "Son güncelleme",
    toc: "Bu sayfada",
    noticeTitle: "Şablon metin: yayından önce gözden geçirin",
    notice: "Köşeli parantez içindeki her şeyi işletmenin gerçek bilgileriyle değiştirin; her bölümü işletme sahibine veya bir avukata, sitenin gerçekte yaptıklarıyla karşılaştırarak kontrol ettirin. Ardından bu uyarıyı kaldırın.",
  },
} as const;

/** Highlights [fill-in] fields so nothing ships half-edited. */
function Fill({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\[[^\]]+\]$/.test(part) ? (
          <mark key={i} className="rounded-ui-sm bg-warning/12 px-0.5 text-fg">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") {
    return (
      <p>
        <Fill text={block} />
      </p>
    );
  }
  if ("list" in block) {
    return (
      <ul>
        {block.list.map((item) => (
          <li key={item}>
            <Fill text={item} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <table>
      <caption>{block.table.caption}</caption>
      <thead>
        <tr>
          {block.table.head.map((h) => (
            <th key={h} scope="col">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {block.table.rows.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => (
              <td key={c}>
                <Fill text={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatUpdated(value: string, intl: string): React.ReactNode {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return <Fill text={value} />;
  const date = new Date(`${value}T12:00:00Z`);
  return <time dateTime={value}>{new Intl.DateTimeFormat(intl, { dateStyle: "long", timeZone: "UTC" }).format(date)}</time>;
}

export interface LegalPageProps {
  doc: LegalDoc;
  locale?: LegalLocale;
  /** Shows the "template text" notice. Set false only after the text has been reviewed. Default true. */
  notice?: boolean;
  /** Breadcrumb home link. Default "/". */
  homeHref?: string;
}

/**
 * One long-form legal page: breadcrumb and title with the last-updated date, the review notice,
 * a table of contents and numbered sections. Server component: plain props, no client code.
 */
export function LegalPage({ doc, locale = "en", notice = true, homeHref = "/" }: LegalPageProps) {
  const t = copy[locale];
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const labels = locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr } : undefined;

  return (
    <div className="vb-scope min-h-dvh bg-scene" lang={locale}>
      <main id="content">
        <PageIntro
          locale={intl}
          labels={labels}
          variant="ruled"
          theme={{ rhythm: "tight" }}
          breadcrumb={[{ label: t.home, href: homeHref }, { label: doc.title }]}
          title={doc.title}
          lead={doc.summary ? <Fill text={doc.summary} /> : undefined}
          meta={[{ label: t.updated, value: formatUpdated(doc.updated, intl) }]}
        />
        <Section theme={{ rhythm: "tight" }}>
          <Container size="content" className="grid gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
            <nav aria-labelledby="legal-toc" className="lg:sticky lg:top-6 lg:self-start">
              <p id="legal-toc" className="text-eyebrow text-fg-muted">
                {t.toc}
              </p>
              <ol className="mt-3 grid gap-1 text-small">
                {doc.sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="focus-ring inline-flex min-h-6 items-center gap-2 rounded-ui-sm text-fg-muted hover:text-fg">
                      <span className="font-mono text-fg-subtle">{i + 1}.</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="grid min-w-0 gap-8">
              {notice ? (
                <Alert tone="warning" title={t.noticeTitle}>
                  {t.notice}
                </Alert>
              ) : null}
              <Prose size="md">
                {doc.sections.map((s, i) => (
                  <section key={s.id} aria-labelledby={s.id}>
                    <h2 id={s.id} className="scroll-mt-6">
                      {i + 1}. {s.title}
                    </h2>
                    {s.body.map((block, b) => (
                      <Block key={b} block={block} />
                    ))}
                  </section>
                ))}
              </Prose>
            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
}
