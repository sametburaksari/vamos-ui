import { Container, PageIntro, Section, SectionHeader } from "@vamos-ui/react/blocks";
import { clubs, CLUB, competitions, matches, SEASON, standings, teams, type Copy, type Match } from "./content";
import { FixturesBoard, type BoardLabels, type BoardMatch } from "./fixtures-board";
import { LeagueTable } from "./league-table";

const outcomeOf = (s: [number, number]) => (s[0] > s[1] ? "W" : s[0] === s[1] ? "D" : "L");

/** Server-side: resolve copy and format dates once, so the client board only filters. */
export function boardMatches(c: Copy, list: Match[] = matches): BoardMatch[] {
  const { t, f, time } = c;
  const comp = new Map(competitions.map((x) => [x.id, x]));
  const ticket = {
    "on-sale": { label: t({ en: "Tickets on sale", tr: "Biletler satışta" }), tone: "accent" as const },
    members: { label: t({ en: "Members’ window", tr: "Üye önceliği" }), tone: "neutral" as const },
    "sold-out": { label: t({ en: "Sold out", tr: "Tükendi" }), tone: "outline" as const },
    free: { label: t({ en: "Free entry", tr: "Ücretsiz giriş" }), tone: "success" as const },
  };
  return list.map((m) => {
    const opp = clubs[m.opponent]!;
    return {
      id: m.id,
      team: m.team,
      comp: m.comp,
      compName: t(comp.get(m.comp)!.name),
      compShort: t(comp.get(m.comp)!.short),
      round: m.round ? t(m.round) : undefined,
      date: m.date,
      weekday: f.date(m.date, { weekday: "short" }),
      dayMonth: f.date(m.date, { day: "numeric", month: "short" }),
      monthKey: m.date.slice(0, 7),
      monthLabel: f.date(m.date, { month: "long", year: "numeric" }),
      kickoff: m.kickoff,
      kickoffLabel: time(m.kickoff),
      home: m.home,
      opponent: opp.name,
      ground: m.home ? "The Quayside" : opp.ground,
      score: m.score,
      outcome: m.score ? outcomeOf(m.score) : undefined,
      scorers: m.scorers,
      tickets: m.tickets ? ticket[m.tickets] : undefined,
      stream: m.stream,
    };
  });
}

export function boardLabels(c: Copy): BoardLabels {
  const { t } = c;
  return {
    caption: t({ en: `Harbor City FC ${SEASON}`, tr: `Harbor City FC ${SEASON}` }),
    fixtures: t({ en: "Fixtures", tr: "Fikstür" }),
    results: t({ en: "Results", tr: "Sonuçlar" }),
    team: t({ en: "Team", tr: "Takım" }),
    competition: t({ en: "Competition", tr: "Turnuva" }),
    venue: t({ en: "Venue", tr: "Saha" }),
    all: t({ en: "All", tr: "Tümü" }),
    home: t({ en: "Home", tr: "İç saha" }),
    away: t({ en: "Away", tr: "Deplasman" }),
    homeShort: t({ en: "H", tr: "İ" }),
    awayShort: t({ en: "A", tr: "D" }),
    date: t({ en: "Date", tr: "Tarih" }),
    comp: t({ en: "Competition", tr: "Turnuva" }),
    match: t({ en: "Opponent", tr: "Rakip" }),
    kickoff: t({ en: "Kick-off", tr: "Başlama" }),
    score: t({ en: "Score", tr: "Skor" }),
    addToCalendar: t({ en: "Add {match} to your calendar", tr: "{match} maçını takviminize ekleyin" }),
    stream: t({ en: "Live on Pilots TV", tr: "Pilots TV’de canlı" }),
    next: t({ en: "Next", tr: "Sıradaki" }),
    noMatches: t({ en: "No matches for this filter. Turn a competition back on or pick another team.", tr: "Bu filtreye uyan maç yok. Bir turnuvayı yeniden açın ya da başka bir takım seçin." }),
    shown: t({ en: "{n} matches shown", tr: "{n} maç gösteriliyor" }),
    played: t({ en: "Played", tr: "Oynanan" }),
    won: t({ en: "Won", tr: "Galibiyet" }),
    drawn: t({ en: "Drawn", tr: "Beraberlik" }),
    lost: t({ en: "Lost", tr: "Mağlubiyet" }),
    goals: t({ en: "Goals", tr: "Goller" }),
    form: t({ en: "Form, last 5", tr: "Son 5 maç" }),
    outcome: { W: t({ en: "Win", tr: "Galibiyet" }), D: t({ en: "Draw", tr: "Beraberlik" }), L: t({ en: "Loss", tr: "Mağlubiyet" }) },
  };
}

/** Fixtures page: the full-season board, the league table and the matchday basics. */
export function FixturesPage({ c }: { c: Copy }) {
  const { t, f } = c;
  const common = { locale: c.intl, labels: c.labels };
  const played = matches.filter((m) => m.team === "men" && m.score).length;
  const left = matches.filter((m) => m.team === "men" && !m.score).length;
  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[{ label: t({ en: "Home", tr: "Ana sayfa" }), href: "?page=home" }, { label: t({ en: "Fixtures & results", tr: "Fikstür ve sonuçlar" }) }]}
        eyebrow={`${t({ en: "Season", tr: "Sezon" })} ${SEASON}`}
        title={t({ en: "Fixtures & *results*", tr: "Fikstür ve *sonuçlar*" })}
        lead={t({
          en: "Every game for the first team, the women’s side and the under-19s. Kick-off times are local and can move for live broadcasts — we confirm them ten days out.",
          tr: "A takım, kadın takımı ve U19’un tüm maçları. Saatler yereldir ve canlı yayın için değişebilir; maçtan on gün önce kesinleştiririz.",
        })}
        meta={[
          { label: t({ en: "First team", tr: "A takım" }), value: t({ en: `${played} played · ${left} to come`, tr: `${played} oynandı · ${left} kaldı` }) },
          { label: t({ en: "League position", tr: "Lig sırası" }), value: t({ en: "2nd · 21 points", tr: "2. · 21 puan" }) },
          { label: t({ en: "Updated", tr: "Güncelleme" }), value: f.date("2026-11-11", { day: "numeric", month: "long" }) },
        ]}
      />

      <Section anchor="board" headingId="hc-board-title" theme={{ rhythm: "tight" }}>
        <Container>
          <h2 id="hc-board-title" className="sr-only">
            {t({ en: "All matches", tr: "Tüm maçlar" })}
          </h2>
          <FixturesBoard
            matches={boardMatches(c)}
            teams={teams.map((x) => ({ id: x.id, name: t(x.name) }))}
            competitions={competitions.map((x) => ({ id: x.id, name: t(x.name) }))}
            club={CLUB}
            domain="harborcityfc.example.com"
            labels={boardLabels(c)}
          />
        </Container>
      </Section>

      <Section anchor="table" headingId="hc-table-title" theme={{ surface: "surface-2" }}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeader
                headingId="hc-table-title"
                eyebrow={t({ en: "Coastal League · after matchday 11", tr: "Sahil Ligi · 11. hafta sonrası" })}
                title={t({ en: "The *table*", tr: "Puan *durumu*" })}
                lead={t({
                  en: "Top two go up automatically; third to sixth play off in May. The bottom two drop into the regional league.",
                  tr: "İlk iki doğrudan yükselir; üç ile altı arası Mayıs’ta play-off oynar. Son iki takım bölgesel lige düşer.",
                })}
              />
              <ul className="m-0 mt-8 grid list-none gap-2 p-0 text-small text-fg-muted">
                <li className="flex items-center gap-3">
                  <span aria-hidden className="h-0.5 w-8 bg-accent" />
                  {t({ en: "Automatic promotion", tr: "Doğrudan yükselme" })}
                </li>
                <li className="flex items-center gap-3">
                  <span aria-hidden className="w-8 border-t-2 border-dashed border-fg-muted" />
                  {t({ en: "Relegation", tr: "Küme düşme" })}
                </li>
              </ul>
            </div>
            <div className="min-w-0 lg:col-span-8">
              <LeagueTable c={c} rows={standings} caption={t({ en: "Coastal League table after matchday 11", tr: "11. hafta sonunda Sahil Ligi puan durumu" })} />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
