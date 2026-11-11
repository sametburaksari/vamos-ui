import { BadgeCheck, CreditCard, EyeOff, Landmark, ShieldCheck } from "lucide-react";
import { copyFor, trust, type SiteLocale } from "./content";

const icons = { licence: BadgeCheck, safeguard: Landmark, iso: ShieldCheck, pci: CreditCard, kvkk: EyeOff };

/**
 * Trust badges as seals: a ringed icon with the claim and its proof underneath. Text-only —
 * no third-party logos — so each line has to stand on its own.
 */
export function TrustBadges({ locale, label }: { locale: SiteLocale; label: string }) {
  const { t } = copyFor(locale);
  return (
    <ul aria-label={label} className="grid grid-cols-1 gap-px overflow-hidden rounded-[calc(var(--radius)*1.6)] border border-surface-border bg-line @xl:grid-cols-2 @5xl:grid-cols-5">
      {trust.map((b) => {
        const Icon = icons[b.icon];
        return (
          <li key={b.icon} className="surface flex items-center gap-3.5 rounded-none border-0 px-5 py-4 shadow-none @5xl:flex-col @5xl:items-start @5xl:gap-3 @5xl:py-5">
            <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full border border-accent-ink/30 bg-accent-soft text-accent-ink outline outline-offset-2 outline-accent-ink/15">
              <Icon className="size-[1.125rem]" strokeWidth={1.75} />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-small font-semibold leading-snug">{t(b.title)}</span>
              <span className="text-eyebrow text-fg-muted">{t(b.text)}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
