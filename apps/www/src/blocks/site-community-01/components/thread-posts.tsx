"use client";

import * as React from "react";
import { Check, Heart, Link2, Reply } from "lucide-react";
import { Avatar, Badge, Button, Textarea, cn } from "@vamos-ui/react";
import { copyFor, member, thread, type Post, type SiteLocale } from "./content";

interface Draft {
  id: string;
  text: string;
}

/**
 * The posts of one thread: author card, relative time, quoted text, the accepted answer marked,
 * a like toggle per post and a reply box that appends your reply (kept in this tab only).
 */
export function ThreadPosts({ locale }: { locale: SiteLocale }) {
  const { t, f, ago } = copyFor(locale);
  const [liked, setLiked] = React.useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = React.useState<Draft[]>([]);
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const boxRef = React.useRef<HTMLTextAreaElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (value.length < 10) {
      setError(t({ en: "Write at least 10 characters — a sentence helps more than “+1”.", tr: "En az 10 karakter yazın — bir cümle “+1”den daha çok işe yarar." }));
      boxRef.current?.focus();
      return;
    }
    setDrafts((d) => [...d, { id: `you-${d.length + 1}`, text: value }]);
    setText("");
    setError(null);
  };

  const quote = (p: Post) => {
    const first = t(p.body[0]!).split(/(?<=[.?!])\s/)[0];
    setText((v) => `${v ? `${v}\n\n` : ""}> @${p.author}: ${first}\n\n`);
    boxRef.current?.focus();
  };

  return (
    <div>
      <ol className="m-0 list-none p-0">
        {thread.map((p, i) => {
          const m = member(p.author);
          const isOp = p.author === thread[0]!.author;
          const on = !!liked[p.id];
          return (
            <li key={p.id} id={p.id} className={cn("scroll-mt-28 border-b border-line py-5", p.accepted && "my-2 rounded-ui border border-[color-mix(in_oklch,var(--success)_45%,transparent)] bg-[color-mix(in_oklch,var(--success)_6%,transparent)] px-4")}>
              <article aria-labelledby={`${p.id}-by`} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3">
                <Avatar name={m.name} size="md" />
                <div className="min-w-0">
                  <header className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h3 id={`${p.id}-by`} className="m-0 text-small font-semibold">
                      {m.name} <span className="font-normal text-fg-muted">@{m.handle}</span>
                    </h3>
                    {isOp ? <Badge tone="outline">{t({ en: "Author", tr: "Konu sahibi" })}</Badge> : null}
                    {m.role ? <Badge tone="accent">{t(m.role)}</Badge> : null}
                    <span className="text-[0.8125rem] text-fg-muted">
                      · <time dateTime={p.at} title={f.dateTime(p.at)}>{ago(p.at)}</time>
                    </span>
                    <a href={`#${p.id}`} className="ms-auto inline-flex items-center gap-1 rounded-ui-sm px-1 text-[0.75rem] text-fg-muted tabular-nums hover:text-fg focus-ring">
                      <Link2 aria-hidden className="size-3" />#{i + 1}
                      <span className="sr-only">{t({ en: "Link to this post", tr: "Bu iletinin bağlantısı" })}</span>
                    </a>
                  </header>
                  {p.accepted ? (
                    <p className="m-0 mt-2 inline-flex items-center gap-1.5 text-small font-semibold text-fg">
                      <Check aria-hidden className="size-4 text-success" />
                      {t({ en: "Accepted answer", tr: "Kabul edilen yanıt" })}
                    </p>
                  ) : null}
                  {p.quote ? (
                    <blockquote className="m-0 mt-2 border-s-2 border-line ps-3 text-small text-fg-muted">
                      <span className="font-medium text-fg">@{p.quote.author}:</span> {t(p.quote.text)}
                    </blockquote>
                  ) : null}
                  <div className="mt-2 flex flex-col gap-3 text-body leading-relaxed">
                    {p.body.map((b) => (
                      <p key={b.en} className="m-0 whitespace-pre-line">
                        {t(b)}
                      </p>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    <Button variant="ghost" size="sm" aria-pressed={on} onClick={() => setLiked((l) => ({ ...l, [p.id]: !on }))} className={cn(on && "text-accent-ink")}>
                      <Heart aria-hidden className={cn("size-4", on && "fill-current")} />
                      <span className="tabular-nums">{p.likes + (on ? 1 : 0)}</span>
                      <span className="sr-only">{t({ en: "likes — like this post", tr: "beğeni — bu iletiyi beğen" })}</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => quote(p)}>
                      <Reply aria-hidden className="size-4" />
                      {t({ en: "Quote", tr: "Alıntıla" })}
                    </Button>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
        {drafts.map((d) => (
          <li key={d.id} id={d.id} className="border-b border-line py-5">
            <article aria-label={t({ en: "Your reply", tr: "Yanıtınız" })} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3">
              <Avatar name={t({ en: "You", tr: "Siz" })} size="md" />
              <div className="min-w-0">
                <p className="m-0 text-small font-semibold">
                  {t({ en: "You", tr: "Siz" })} <span className="font-normal text-fg-muted">· {t({ en: "just now", tr: "şimdi" })}</span>
                </p>
                <p className="m-0 mt-2 whitespace-pre-line text-body">{d.text}</p>
              </div>
            </article>
          </li>
        ))}
      </ol>

      <form onSubmit={submit} aria-labelledby="reply-title" className="mt-6 rounded-ui border border-line bg-surface p-4" noValidate>
        <h2 id="reply-title" className="m-0 text-body font-semibold">
          {t({ en: "Your reply", tr: "Yanıtınız" })}
        </h2>
        <label htmlFor="reply-body" className="sr-only">
          {t({ en: "Reply text", tr: "Yanıt metni" })}
        </label>
        <Textarea
          ref={boxRef}
          id="reply-body"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="mt-2"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "reply-error" : "reply-hint"}
          placeholder={t({ en: "Share what worked for you — measurements and photos help.", tr: "Sizin için neyin işe yaradığını paylaşın — ölçüler ve fotoğraflar yardımcı olur." })}
        />
        {error ? (
          <p id="reply-error" className="m-0 mt-2 text-small text-danger">
            {error}
          </p>
        ) : (
          <p id="reply-hint" className="m-0 mt-2 text-[0.8125rem] text-fg-muted">
            {t({ en: "Markdown works. Be kind; credit plans and photos that aren’t yours.", tr: "Markdown kullanılabilir. Nazik olun; size ait olmayan plan ve fotoğraflara atıf yapın." })}
          </p>
        )}
        <div className="mt-3 flex justify-end">
          <Button type="submit" variant="primary" size="sm">
            {t({ en: "Post reply", tr: "Yanıtı gönder" })}
          </Button>
        </div>
      </form>
    </div>
  );
}
