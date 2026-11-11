import { cn, Table, TableBody, TableCaption, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@vamos-ui/react";
import type { Copy, StandingRow } from "./content";
import { FormGuide } from "./form-guide";

/**
 * Coastal League standings. `compact` shows the top six plus Harbor City (if lower), the full
 * version adds won/drawn/lost, goals and the promotion / relegation lines.
 */
export function LeagueTable({ c, rows, compact = false, caption }: { c: Copy; rows: StandingRow[]; compact?: boolean; caption: string }) {
  const { t } = c;
  const outcome = { W: t({ en: "Win", tr: "Galibiyet" }), D: t({ en: "Draw", tr: "Beraberlik" }), L: t({ en: "Loss", tr: "Mağlubiyet" }) };
  const ranked = rows.map((r, i) => ({ ...r, pos: i + 1 }));
  const shown = compact ? ranked.filter((r) => r.pos <= 6 || r.us) : ranked;
  const n = c.f.number;
  return (
    <TableContainer>
      <Table className="text-sm" data-league-table={compact ? "compact" : "full"}>
        <TableCaption visuallyHidden>{caption}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" align="end">
              <abbr title={t({ en: "Position", tr: "Sıra" })} className="no-underline">
                #
              </abbr>
            </TableHead>
            <TableHead>{t({ en: "Club", tr: "Kulüp" })}</TableHead>
            <TableHead numeric>
              <abbr title={t({ en: "Played", tr: "Oynanan" })} className="no-underline">
                {t({ en: "P", tr: "O" })}
              </abbr>
            </TableHead>
            {compact ? null : (
              <>
                <TableHead numeric className="hidden sm:table-cell">
                  <abbr title={t({ en: "Won", tr: "Galibiyet" })} className="no-underline">
                    {t({ en: "W", tr: "G" })}
                  </abbr>
                </TableHead>
                <TableHead numeric className="hidden sm:table-cell">
                  <abbr title={t({ en: "Drawn", tr: "Beraberlik" })} className="no-underline">
                    {t({ en: "D", tr: "B" })}
                  </abbr>
                </TableHead>
                <TableHead numeric className="hidden sm:table-cell">
                  <abbr title={t({ en: "Lost", tr: "Mağlubiyet" })} className="no-underline">
                    {t({ en: "L", tr: "M" })}
                  </abbr>
                </TableHead>
                <TableHead numeric className="hidden md:table-cell">
                  {t({ en: "Goals", tr: "Goller" })}
                </TableHead>
              </>
            )}
            <TableHead numeric>
              <abbr title={t({ en: "Goal difference", tr: "Averaj" })} className="no-underline">
                {t({ en: "GD", tr: "Av" })}
              </abbr>
            </TableHead>
            <TableHead numeric>
              <abbr title={t({ en: "Points", tr: "Puan" })} className="no-underline">
                {t({ en: "Pts", tr: "P" })}
              </abbr>
            </TableHead>
            <TableHead className="hidden lg:table-cell">{t({ en: "Last 5", tr: "Son 5" })}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shown.map((r, i) => {
            const gd = r.gf - r.ga;
            const pts = r.w * 3 + r.d;
            const gap = compact && i > 0 && shown[i - 1]!.pos !== r.pos - 1;
            return (
              <TableRow
                key={r.club}
                data-us={r.us ? "" : undefined}
                aria-current={r.us ? "true" : undefined}
                className={cn(
                  r.us && "bg-accent-soft [&>*]:font-semibold",
                  gap && "[&>*]:border-t-2 [&>*]:border-dashed [&>*]:border-line",
                  !compact && r.pos === 2 && "[&>*]:border-b-2 [&>*]:border-b-accent",
                  !compact && r.pos === 10 && "[&>*]:border-b-2 [&>*]:border-dashed [&>*]:border-b-fg-muted",
                )}
              >
                <TableCell align="end" className="font-mono text-xs text-fg-muted tabular">
                  {r.pos}
                </TableCell>
                <TableCell rowHeader className={cn("font-display text-[17px] leading-tight", r.us ? "text-accent-ink" : "text-fg")}>
                  {r.club}
                </TableCell>
                <TableCell numeric>{r.p}</TableCell>
                {compact ? null : (
                  <>
                    <TableCell numeric className="hidden sm:table-cell">
                      {r.w}
                    </TableCell>
                    <TableCell numeric className="hidden sm:table-cell">
                      {r.d}
                    </TableCell>
                    <TableCell numeric className="hidden sm:table-cell">
                      {r.l}
                    </TableCell>
                    <TableCell numeric className="hidden md:table-cell">
                      {r.gf}:{r.ga}
                    </TableCell>
                  </>
                )}
                <TableCell numeric>{gd > 0 ? `+${n(gd)}` : n(gd)}</TableCell>
                <TableCell numeric className="font-display text-lg font-semibold text-fg">
                  {pts}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <FormGuide form={r.form} labels={outcome} size="sm" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
