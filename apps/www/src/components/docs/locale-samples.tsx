/** Real Intl output, rendered on the server, for the localization page. */
export function LocaleSamples() {
  const n = 1250.5;
  const d = new Date(Date.UTC(2026, 10, 14, 9, 0));
  const rows = (["en-US", "tr-TR"] as const).map((l) => ({
    locale: l,
    currency: new Intl.NumberFormat(l, { style: "currency", currency: "TRY" }).format(n),
    number: new Intl.NumberFormat(l).format(1234567.89),
    date: new Intl.DateTimeFormat(l, { dateStyle: "long", timeZone: "Europe/Istanbul" }).format(d),
    time: new Intl.DateTimeFormat(l, { timeStyle: "short", timeZone: "Europe/Istanbul" }).format(d),
    relative: new Intl.RelativeTimeFormat(l, { numeric: "auto" }).format(-1, "day"),
  }));
  return (
    <div className="overflow-x-auto rounded-ui border border-line">
      <table className="w-full text-[13px]">
        <thead className="bg-surface-2 text-[12px] text-fg-muted">
          <tr>{["Locale", "Currency (TRY)", "Number", "Date", "Time", "Relative"].map((h) => <th key={h} className="px-4 py-2.5 text-start font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.locale} className="border-t border-line font-mono text-[12.5px] text-fg">
              <td className="px-4 py-2.5">{r.locale}</td><td className="px-4 py-2.5">{r.currency}</td><td className="px-4 py-2.5">{r.number}</td>
              <td className="px-4 py-2.5">{r.date}</td><td className="px-4 py-2.5">{r.time}</td><td className="px-4 py-2.5">{r.relative}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
