import { ArrowDownLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Badge, Progress, Sparkline } from "@vamos-ui/react";
import { copyFor, type SiteLocale } from "./content";

const pane = "surface rounded-[calc(var(--radius)*1.6)] border border-surface-border shadow-(--surface-shadow)";

/**
 * The hero's product view: three panes of the app laid over each other in glass — the balance
 * with this month's interest, two pots with their goals, and the latest transactions. Static
 * markup, decorative to screen readers except for its summary.
 */
export function BalanceStack({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const money = (v: number) => f.currency(v, { currency: "TRY", display: "narrowSymbol" });
  const trend = [212, 214, 213, 219, 224, 223, 229, 233, 236, 235, 241, 248.7];

  return (
    <figure className="relative mx-auto w-full max-w-[30rem] @5xl:max-w-none">
      <figcaption className="sr-only">
        {t({
          en: "The Fernway app: a balance of ₺248,730 with ₺6,412 interest this month, two savings pots and the latest transactions.",
          tr: "Fernway uygulaması: bu ay 6.412 ₺ faizle 248.730 ₺ bakiye, iki birikim kumbarası ve son işlemler.",
        })}
      </figcaption>
      <div aria-hidden className="relative grid gap-4 @5xl:block @5xl:h-[33rem]">
        {/* Balance */}
        <div className={`${pane} flex flex-col gap-5 p-6 @5xl:absolute @5xl:end-0 @5xl:top-0 @5xl:w-[86%]`}>
          <div className="flex items-center justify-between text-small text-fg-muted">
            <span>{t({ en: "Total balance", tr: "Toplam bakiye" })}</span>
            <span className="inline-flex items-center gap-1.5 text-eyebrow">
              <ShieldCheck className="size-3.5 text-accent-ink" />
              {t({ en: "Safeguarded", tr: "Koruma altında" })}
            </span>
          </div>
          <p className="font-mono text-[2.25rem] font-medium leading-none tracking-[-0.04em] tabular">{money(248730.15)}</p>
          <Sparkline values={trend} variant="area" width="100%" height={56} color="accent" />
          <div className="flex items-center justify-between border-t border-line pt-4 text-small">
            <span className="text-fg-muted">{t({ en: "Interest in November", tr: "Kasım faizi" })}</span>
            <span className="font-mono font-medium text-success tabular">+{money(6412.4)}</span>
          </div>
        </div>

        {/* Pots */}
        <div className={`${pane} flex flex-col gap-4 p-5 @5xl:absolute @5xl:start-0 @5xl:top-[15.5rem] @5xl:w-[46%]`}>
          <p className="text-small font-medium">{t({ en: "Pots", tr: "Kumbaralar" })}</p>
          {[
            { name: t({ en: "Emergency fund", tr: "Acil durum fonu" }), have: 117_400, goal: 150_000 },
            { name: t({ en: "Summer in Kaş", tr: "Kaş’ta yaz" }), have: 36_900, goal: 90_000 },
          ].map((p) => (
            <div key={p.name} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-small">
                <span>{p.name}</span>
                <span className="font-mono text-eyebrow text-fg-muted tabular">
                  {f.compact(p.have)} / {f.compact(p.goal)}
                </span>
              </div>
              <Progress value={p.have} max={p.goal} size="xs" aria-label={p.name} />
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div className={`${pane} flex flex-col p-5 @5xl:absolute @5xl:end-0 @5xl:top-[18rem] @5xl:w-[56%]`}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-small font-medium">{t({ en: "Today", tr: "Bugün" })}</p>
            <Badge tone="accent" size="sm">
              {t({ en: "Rent set aside", tr: "Kira ayrıldı" })}
            </Badge>
          </div>
          {[
            { name: t({ en: "Salary", tr: "Maaş" }), amount: 86_000, in: true },
            { name: t({ en: "Rent → Bills pot", tr: "Kira → Fatura kumbarası" }), amount: -32_500 },
            { name: t({ en: "Neighbourhood market", tr: "Mahalle marketi" }), amount: -1_284.5 },
          ].map((tx) => (
            <div key={tx.name} className="flex items-center gap-3 border-t border-line py-2.5 text-small first-of-type:border-t-0">
              <span className="grid size-7 place-items-center rounded-full bg-surface-2 text-fg-muted">
                {tx.in ? <ArrowDownLeft className="size-3.5 text-success" /> : <ArrowUpRight className="size-3.5" />}
              </span>
              <span className="min-w-0 flex-1 truncate">{tx.name}</span>
              <span className={`font-mono tabular ${tx.in ? "text-success" : ""}`}>
                {tx.in ? "+" : "−"}
                {money(Math.abs(tx.amount))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
