import { Mail } from "lucide-react";
import { Avatar, Badge } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, groups, people, ranks, type SiteLocale } from "./content";

const slug = (name: string) =>
  name
    .replace(/^(Prof\.|Assoc\. Prof\.|Dr\.)\s+/g, "")
    .toLocaleLowerCase("en")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z]+/g, ".");

/** People: the directory grouped by rank — title, research interests, group, office and hours. */
export function PeoplePage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const groupName = (id?: string) => groups.find((g) => g.id === id);

  return (
    <>
      <PageIntro
        locale={intl}
        labels={labels}
        variant="ruled"
        breadcrumb={[{ label: t({ en: "Urban Studies", tr: "Kentsel Çalışmalar" }), href: sitePageHref("home") }, { label: t({ en: "People", tr: "Kadro" }) }]}
        eyebrow={t({ en: "Directory", tr: "Rehber" })}
        title={t({ en: "People", tr: "Kadro" })}
        lead={t({ en: "Office hours run in teaching weeks only. Outside them, write first — everyone answers within two working days.", tr: "Ofis saatleri yalnızca ders haftalarında geçerlidir. Bunların dışında önce yazın — herkes iki iş günü içinde yanıt verir." })}
        meta={ranks.map((r) => ({ label: t(r.title), value: String(people.filter((p) => p.rank === r.id).length) }))}
      />
      <Section aria-label={t({ en: "Staff directory", tr: "Personel rehberi" })} theme={{ rhythm: "tight" }} className="pt-0">
        <Container>
          {ranks.map((r) => {
            const list = people.filter((p) => p.rank === r.id);
            return (
              <section key={r.id} aria-labelledby={`rank-${r.id}`} className="mt-10 first:mt-0">
                <h2 id={`rank-${r.id}`} className="m-0 border-b-2 border-accent pb-2 font-display text-h3">
                  {t(r.title)}
                </h2>
                <ul className="m-0 list-none p-0">
                  {list.map((p) => {
                    const g = groupName(p.group);
                    return (
                      <li key={p.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-line py-5 @3xl:grid-cols-[4rem_minmax(0,1.3fr)_minmax(0,1fr)_12rem] @3xl:items-start">
                        <Avatar name={p.name.replace(/^(Prof\.|Assoc\. Prof\.|Dr\.)\s+/, "")} src={p.photo ? p.photo.src.replace(/w=\d+&h=\d+/, "w=128&h=128") : undefined} size="lg" />
                        <div className="min-w-0">
                          <h3 className="m-0 font-display text-[1.1875rem] leading-snug">{p.name}</h3>
                          <p className="m-0 mt-0.5 text-small text-fg-muted">{t(p.title)}</p>
                          {p.role ? (
                            <Badge tone="accent" className="mt-2">
                              {t(p.role)}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="col-start-2 min-w-0 text-small @3xl:col-start-auto">
                          <p className="m-0">{t(p.interests)}</p>
                          {g ? <p className="m-0 mt-1 text-fg-muted">{t({ en: "Group:", tr: "Grup:" })} {t(g.title)}</p> : null}
                        </div>
                        <dl className="col-start-2 m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-small @3xl:col-start-auto">
                          <dt className="text-fg-muted">{t({ en: "Office", tr: "Ofis" })}</dt>
                          <dd className="m-0 font-mono">{p.office}</dd>
                          <dt className="text-fg-muted">{t({ en: "Hours", tr: "Saatler" })}</dt>
                          <dd className="m-0">{t(p.hours)}</dd>
                          <dt className="sr-only">{t({ en: "E-mail", tr: "E-posta" })}</dt>
                          <dd className="col-span-2 m-0">
                            <a href={`mailto:${slug(p.name)}@example.com`} className="inline-flex items-center gap-1.5 font-semibold text-accent-ink underline decoration-1 underline-offset-[0.25em] focus-ring rounded-[2px]">
                              <Mail aria-hidden className="size-3.5" />
                              {t({ en: "Write", tr: "Yazın" })}
                              <span className="sr-only"> {p.name}</span>
                            </a>
                          </dd>
                        </dl>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </Container>
      </Section>
    </>
  );
}
