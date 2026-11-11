import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { DAYS, rooms, sessions, speakers, tracks, type Copy } from "./content";
import { ScheduleBoard, type BoardSession } from "./schedule-board";

/** Resolve the schedule data into plain strings for the client board. */
export function boardData(c: Copy) {
  const { t, f, time } = c;
  const people = new Map(speakers.map((s) => [s.id, s]));
  const list: BoardSession[] = sessions.map((s) => {
    const p = s.speaker ? people.get(s.speaker) : undefined;
    return {
      id: s.id,
      day: s.day,
      start: s.start,
      end: s.end,
      startLabel: time(s.start),
      endLabel: time(s.end),
      track: s.track,
      kind: s.kind,
      title: t(s.title),
      speaker: p?.name,
      speakerRole: p ? `${t(p.role)}, ${p.company}` : undefined,
      room: t(rooms[s.room]),
    };
  });
  return {
    sessions: list,
    tracks: tracks.map((x) => ({ id: x.id, name: t(x.name), shape: x.shape })),
    labels: {
      days: DAYS.map((d) => f.date(d, { weekday: "short", day: "numeric", month: "short" })),
      daysLabel: t({ en: "Conference day", tr: "Konferans günü" }),
      tracksLabel: t({ en: "Tracks", tr: "Kulvarlar" }),
      onlyMine: t({ en: "Only my agenda", tr: "Yalnızca ajandam" }),
      add: t({ en: "Add to my agenda", tr: "Ajandama ekle" }),
      added: t({ en: "In my agenda", tr: "Ajandamda" }),
      remove: t({ en: "Remove from my agenda", tr: "Ajandamdan çıkar" }),
      agendaTitle: t({ en: "My agenda", tr: "Ajandam" }),
      agendaEmpty: t({ en: "Nothing yet. Press “Add to my agenda” on a session — it stays in this browser.", tr: "Henüz bir şey yok. Bir oturumda “Ajandama ekle”ye basın — bu tarayıcıda saklanır." }),
      agendaCount: t({ en: "{n} saved", tr: "{n} kayıtlı" }),
      clash: t({ en: "Clashes with “{title}”", tr: "“{title}” ile çakışıyor" }),
      clear: t({ en: "Clear my agenda", tr: "Ajandamı temizle" }),
      noTrack: t({ en: "Pick at least one track to see sessions.", tr: "Oturumları görmek için en az bir kulvar seçin." }),
      nothingSaved: t({ en: "Nothing saved on this day for these tracks yet.", tr: "Bu gün ve kulvarlar için henüz kayıt yok." }),
      everyone: t({ en: "Everyone", tr: "Herkes" }),
      keynote: t({ en: "Keynote", tr: "Ana konuşma" }),
      addedMsg: t({ en: "Added to your agenda: {title}", tr: "Ajandanıza eklendi: {title}" }),
      removedMsg: t({ en: "Removed from your agenda: {title}", tr: "Ajandanızdan çıkarıldı: {title}" }),
    },
  };
}

/** Schedule: intro, then the board with day tabs, track filter and the personal agenda. */
export function SchedulePage({ c }: { c: Copy }) {
  const { t, intl, labels } = c;
  const data = boardData(c);
  return (
    <>
      <PageIntro
        locale={intl}
        labels={labels}
        variant="ruled"
        headingLevel={1}
        breadcrumb={[{ label: "Interface Days", href: sitePageHref("home") }, { label: t({ en: "Schedule", tr: "Program" }) }]}
        eyebrow={t({ en: "Schedule", tr: "Program" })}
        title={t({ en: "Two days, *three* tracks", tr: "İki gün, *üç* kulvar" })}
        lead={t({ en: "Filter by track, save sessions to your agenda and spot clashes before you’re standing between two rooms.", tr: "Kulvara göre filtreleyin, oturumları ajandanıza kaydedin ve iki salonun arasında kalmadan çakışmaları görün." })}
        meta={[
          { label: t({ en: "Time zone", tr: "Saat dilimi" }), value: t({ en: "Istanbul, GMT+3", tr: "İstanbul, GMT+3" }) },
          { label: t({ en: "Rooms", tr: "Salonlar" }), value: t({ en: "Dock A · Studio B · Loft", tr: "Dok A · Stüdyo B · Atölye Katı" }) },
          { label: t({ en: "Updated", tr: "Güncellendi" }), value: c.f.date("2026-11-04", "long") },
        ]}
      />
      <Section anchor="programme" theme={{ rhythm: "tight" }} aria-label={t({ en: "Programme", tr: "Program" })}>
        <Container size="wide">
          <ScheduleBoard {...data} />
        </Container>
      </Section>
    </>
  );
}
