import { CheckCircle2, Eye, Heart, MessageSquare } from "lucide-react";
import { Avatar, Badge, Sparkline } from "@vamos-ui/react";
import { Container, sitePageHref } from "@vamos-ui/react/blocks";
import { categoryById, copyFor, member, thread, topicById, topicHref, topics, type SiteLocale } from "./content";
import { ThreadPosts } from "./thread-posts";

/** One thread: title and tags, the posts with the accepted answer, and a sidebar with its pulse. */
export function ThreadPage({ locale }: { locale: SiteLocale }) {
  const { t, f, ago } = copyFor(locale);
  const topic = topicById("workbench");
  const cat = categoryById(topic.category);
  const accepted = thread.find((p) => p.accepted);
  const related = topics.filter((x) => x.category === topic.category && x.id !== topic.id).concat(topics.filter((x) => x.id === "show-chair")).slice(0, 3);

  return (
    <div className="@container">
      <Container>
        <nav aria-label={t({ en: "Breadcrumb", tr: "Konum" })} className="pt-6 text-small text-fg-muted">
          <a href={sitePageHref("home")} className="hover:text-fg hover:underline focus-ring rounded-[2px]">
            Builders Circle
          </a>{" "}
          /{" "}
          <a href={sitePageHref("topics", `cat-${cat.id}`)} className="hover:text-fg hover:underline focus-ring rounded-[2px]">
            {t(cat.title)}
          </a>
        </nav>

        <header className="border-b border-line pt-3 pb-5">
          <h1 className="m-0 max-w-[40ch] font-display text-display-m">{t(topic.title)}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-small">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: cat.color }} />
              {t(cat.title)}
            </span>
            {topic.solved ? (
              <Badge tone="neutral" size="md" className="text-fg">
                <CheckCircle2 aria-hidden className="text-success" />
                {t({ en: "Solved", tr: "Çözüldü" })}
              </Badge>
            ) : null}
            {topic.tags.map((tag) => (
              <span key={tag} className="font-mono text-[0.75rem] text-fg-muted">
                #{tag}
              </span>
            ))}
          </div>
        </header>

        <div className="grid gap-8 pt-2 pb-14 @5xl:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0">
            {accepted ? (
              <p className="m-0 mt-4 rounded-ui-sm bg-surface-2 px-3 py-2 text-small">
                <CheckCircle2 aria-hidden className="me-1.5 inline size-4 -translate-y-px text-success" />
                {t({ en: "Solved by", tr: "Çözen" })} <span className="font-semibold">{member(accepted.author).name}</span> ·{" "}
                <a href={`#${accepted.id}`} className="font-medium text-accent-ink underline underline-offset-2 focus-ring rounded-[2px]">
                  {t({ en: "jump to the answer", tr: "yanıta git" })}
                </a>
              </p>
            ) : null}
            <ThreadPosts locale={locale} />
          </div>

          <aside aria-label={t({ en: "About this topic", tr: "Bu konu hakkında" })} className="flex flex-col gap-5 @5xl:sticky @5xl:top-[calc(var(--topbar-h,4rem)+1rem)] @5xl:self-start">
            <dl className="m-0 grid grid-cols-3 gap-2 rounded-ui border border-line bg-surface p-3 text-center">
              {[
                { icon: MessageSquare, k: { en: "Replies", tr: "Yanıt" }, v: f.number(topic.replies) },
                { icon: Eye, k: { en: "Views", tr: "Görüntü" }, v: f.compact(topic.views) },
                { icon: Heart, k: { en: "Likes", tr: "Beğeni" }, v: f.number(topic.likes) },
              ].map((s) => (
                <div key={s.k.en}>
                  <dt className="flex items-center justify-center gap-1 text-[0.75rem] text-fg-muted">
                    <s.icon aria-hidden className="size-3" />
                    {t(s.k)}
                  </dt>
                  <dd className="m-0 mt-0.5 font-semibold tabular-nums">{s.v}</dd>
                </div>
              ))}
            </dl>

            <section aria-labelledby="th-activity">
              <h2 id="th-activity" className="m-0 text-[0.8125rem] font-semibold">
                {t({ en: "Activity, last 14 days", tr: "Son 14 gün hareketi" })}
              </h2>
              <Sparkline className="mt-2" values={topic.activity} variant="bars" size="md" width="100%" color="accent-ink" label={t({ en: `Posts per day: ${topic.activity.join(", ")}`, tr: `Günlük ileti: ${topic.activity.join(", ")}` })} />
              <p className="m-0 mt-1 text-[0.75rem] text-fg-muted">
                {t({ en: "Started", tr: "Başlangıç" })} {ago(topic.created)} · {t({ en: "last post", tr: "son ileti" })} {ago(topic.last)}
              </p>
            </section>

            <section aria-labelledby="th-people">
              <h2 id="th-people" className="m-0 text-[0.8125rem] font-semibold">
                {t({ en: `${topic.participants.length} people in this thread`, tr: `Bu konuda ${topic.participants.length} kişi` })}
              </h2>
              <ul className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
                {topic.participants.map((h) => (
                  <li key={h}>
                    <Avatar name={member(h).name} size="sm" />
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="th-related">
              <h2 id="th-related" className="m-0 text-[0.8125rem] font-semibold">
                {t({ en: "Related", tr: "İlgili" })}
              </h2>
              <ul className="m-0 mt-1 list-none p-0">
                {related.map((r) => (
                  <li key={r.id} className="border-b border-line py-2 last:border-b-0">
                    <a href={topicHref(r)} className="text-small font-medium leading-snug text-fg hover:text-accent-ink hover:underline focus-ring rounded-[2px]">
                      {t(r.title)}
                    </a>
                    <p className="m-0 text-[0.75rem] text-fg-muted">{t({ en: `${r.replies} replies`, tr: `${r.replies} yanıt` })}</p>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </Container>
    </div>
  );
}
