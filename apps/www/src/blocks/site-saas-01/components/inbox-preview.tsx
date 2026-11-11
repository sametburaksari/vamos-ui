import type * as React from "react";
import { Badge } from "@vamos-ui/react";
import type { Localized } from "@vamos-ui/react/blocks";

type T = (v: Localized<string>) => string;

/** The live product composition in the hero: a thread list beside one open conversation. Plain JSX. */
export function InboxPreview({ t }: { t: T }) {
  const threads = [
    { name: "Elif Kaya", channel: "WhatsApp", text: t({ en: "Table for 4 on Friday at 20:30?", tr: "Cuma 20:30 için 4 kişilik masa var mı?" }), time: "2m", unread: true },
    { name: "Can Demir", channel: "Instagram", text: t({ en: "Do you have a vegan menu?", tr: "Vegan menünüz var mı?" }), time: "14m", unread: true },
    { name: t({ en: "Website form", tr: "Web formu" }), channel: "Form", text: t({ en: "Birthday dinner, 12 people, 21 Nov", tr: "Doğum günü yemeği, 12 kişi, 21 Kasım" }), time: "1h" },
    { name: "Zeynep Aydın", channel: "WhatsApp", text: t({ en: "Thank you, see you tonight!", tr: "Teşekkürler, akşam görüşürüz!" }), time: "3h" },
  ];
  return (
    <div className="grid h-[30rem] grid-cols-1 bg-scene text-small @3xl:grid-cols-[17rem_1fr]">
      <ul className="hidden flex-col border-e border-line @3xl:flex" aria-label={t({ en: "Conversations", tr: "Konuşmalar" })}>
        {threads.map((thread, i) => (
          <li key={thread.channel + thread.time} className={`rl-thread flex flex-col gap-1 border-b border-line px-4 py-3 ${i === 0 ? "bg-selected" : ""}`} style={{ "--rl-i": i } as React.CSSProperties}>
            <span className="flex items-center justify-between gap-2">
              <span className={thread.unread ? "font-semibold text-fg" : "text-fg"}>{thread.name}</span>
              <span className="font-mono text-[11px] text-fg-muted">{thread.time}</span>
            </span>
            <span className="truncate text-fg-muted">{thread.text}</span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-muted">{thread.channel}</span>
          </li>
        ))}
      </ul>
      <div className="flex min-w-0 flex-col gap-3 p-5 @3xl:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-fg-muted">Elif Kaya · WhatsApp</p>
          <Badge tone="accent" className="rl-tag">{t({ en: "Booking", tr: "Rezervasyon" })}</Badge>
          <Badge tone="outline" className="rl-tag [--rl-i:1]">{t({ en: "Assigned to Deniz", tr: "Deniz’e atandı" })}</Badge>
        </div>
        <p className="rl-msg-in w-fit max-w-sm rounded-ui bg-surface-2 px-4 py-2.5 text-fg">
          {t({ en: "Hi! Table for 4 on Friday at 20:30? One of us is vegetarian.", tr: "Merhaba! Cuma 20:30 için 4 kişilik masa var mı? Birimiz vejetaryen." })}
        </p>
        <p className="rl-msg-out ms-auto w-fit max-w-sm rounded-ui bg-accent-soft px-4 py-2.5 text-fg">
          {t({ en: "Of course — Friday 20:30 for four, by the window. Most of our meze are vegetarian.", tr: "Elbette — cuma 20:30, dört kişi, pencere kenarı. Mezelerimizin çoğu vejetaryen." })}
        </p>
        <p className="rl-note ms-auto font-mono text-[11px] text-fg-muted">{t({ en: "Sent by Deniz · booking created", tr: "Deniz gönderdi · rezervasyon oluşturuldu" })}</p>
      </div>
    </div>
  );
}
