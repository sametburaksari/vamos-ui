"use client";

import * as React from "react";
import { Check, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button, Field, Textarea, ToggleGroup, ToggleGroupItem, toast } from "@vamos-ui/react";
import { copyFor, type L, type SiteLocale } from "./content";

const reasons: { id: string; label: L }[] = [
  { id: "steps", label: { en: "Steps don’t match my app", tr: "Adımlar uygulamamla uyuşmuyor" } },
  { id: "unclear", label: { en: "Hard to follow", tr: "Takip etmesi zor" } },
  { id: "missing", label: { en: "My question isn’t covered", tr: "Sorum yanıtlanmıyor" } },
];

/** "Was this helpful?" — yes thanks you; no asks what was missing (reasons + an optional note). */
export function Helpful({ locale, count }: { locale: SiteLocale; count: number }) {
  const { t, f } = copyFor(locale);
  const [vote, setVote] = React.useState<"yes" | "no" | null>(null);
  const [why, setWhy] = React.useState<string[]>([]);
  const [note, setNote] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const uid = React.useId();

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success(t({ en: "Thanks — we read every one of these", tr: "Teşekkürler — her birini okuyoruz" }));
  };

  return (
    <section aria-labelledby={`${uid}-q`} className="rounded-ui-lg border border-line p-5 sm:p-6" data-helpful={vote ?? "none"}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id={`${uid}-q`} className="m-0 text-base font-semibold text-fg">
          {t({ en: "Was this article helpful?", tr: "Bu makale işinize yaradı mı?" })}
        </h2>
        <div className="flex gap-2" role="group" aria-labelledby={`${uid}-q`}>
          <Button variant={vote === "yes" ? "primary" : "secondary"} aria-pressed={vote === "yes"} onClick={() => setVote("yes")} disabled={sent}>
            <ThumbsUp aria-hidden />
            {t({ en: "Yes", tr: "Evet" })}
          </Button>
          <Button variant={vote === "no" ? "primary" : "secondary"} aria-pressed={vote === "no"} onClick={() => setVote("no")} disabled={sent}>
            <ThumbsDown aria-hidden />
            {t({ en: "No", tr: "Hayır" })}
          </Button>
        </div>
      </div>

      <div aria-live="polite">
        {vote === "yes" ? (
          <p className="m-0 mt-4 flex items-center gap-2 text-sm text-fg-muted">
            <Check aria-hidden className="size-4 text-accent-ink" />
            {t({ en: `Glad it helped. You and ${f.number(count)} others said yes.`, tr: `Yardımcı olmasına sevindik. Siz ve ${f.number(count)} kişi daha evet dedi.` })}
          </p>
        ) : null}
        {vote === "no" && sent ? (
          <p className="m-0 mt-4 flex items-center gap-2 text-sm text-fg-muted">
            <Check aria-hidden className="size-4 text-accent-ink" />
            {t({ en: "Got it. We’ll rewrite this article — usually within a week.", tr: "Anlaşıldı. Bu makaleyi yeniden yazacağız — genellikle bir hafta içinde." })}
          </p>
        ) : null}
      </div>

      {vote === "no" && !sent ? (
        <form onSubmit={send} className="mt-5 flex flex-col gap-4 border-t border-line pt-5">
          <div className="flex flex-col gap-2">
            <span id={`${uid}-why`} className="text-sm font-medium text-fg">
              {t({ en: "What was wrong?", tr: "Sorun neydi?" })}
            </span>
            <ToggleGroup type="multiple" variant="outline" size="sm" value={why} onValueChange={setWhy} aria-labelledby={`${uid}-why`} orientation="vertical" className="w-full sm:w-fit [&>*]:justify-start">
              {reasons.map((r) => (
                <ToggleGroupItem key={r.id} value={r.id}>
                  {t(r.label)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <Field label={t({ en: "Anything else? (optional)", tr: "Eklemek istediğiniz? (isteğe bağlı)" })} hint={t({ en: "Don’t include passwords or card numbers.", tr: "Şifre ya da kart numarası yazmayın." })}>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} />
          </Field>
          <div>
            <Button type="submit" variant="primary" disabled={!why.length && !note.trim()}>
              {t({ en: "Send feedback", tr: "Geri bildirim gönder" })}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
