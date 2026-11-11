import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn2 as cn } from "./shared/kit-2";
import { Section, Container } from "../section";
import { SectionHeader } from "../section-header";
import { BlockLink } from "../block-link";
import { RichText } from "../rich-text";
import type { BlockBaseProps } from "../types";
import type { CtaStyle, MoneyValue } from "../schema/types";
import type { RichDoc } from "../schema/rich-doc";
import { site2Text, type Site2BlockLabels, type Site2Text } from "./shared/labels-2";
import { fieldAttr, formatMoney, formatMoneyLong, useBlockIds2, type SiteLink2 } from "./shared/kit-2";
import { Reveal, Stagger } from "../../motion/reveal";

export type PricingVariant = "columns" | "rows" | "single";
export type PricingBilling = "monthly" | "yearly" | "both" | "once";

export interface PricingFeature {
  text: React.ReactNode;
  /** Default true. Excluded features read "Not included" (muted, a dash — never a cross). */
  included?: boolean;
  /** Small text under the feature ("up to 5 GB"). */
  note?: React.ReactNode;
}

export interface PricingPlan {
  name: React.ReactNode;
  description?: React.ReactNode;
  price?: { monthly?: MoneyValue; yearly?: MoneyValue; once?: MoneyValue; /** "from $4,500". */ from?: boolean };
  /** Shown instead of a price ("Get a quote", "Custom"). */
  custom?: React.ReactNode;
  features?: PricingFeature[];
  cta?: { link: SiteLink2; style?: CtaStyle };
  /** Highlight label ("Most chosen"). Adds a 2px accent rule — no glow, no scale. */
  highlight?: React.ReactNode;
}

export interface PricingTableProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * columns: 2–4 plans separated by hairline rules, no cards. rows: agency packages as quote-like
   * rows. single: one package — big price beside a two-column inclusion list.
   */
  variant?: PricingVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  /** Which prices exist. `both` adds a monthly/yearly switch (radios + `:has()`, 0 JS). Default `"monthly"`. */
  billing?: PricingBilling;
  /** Selected period when `billing="both"`. Default `"monthly"`. */
  defaultPeriod?: "monthly" | "yearly";
  /** Next to "Yearly": "2 months free" (text, never a strikethrough). */
  yearlySaving?: React.ReactNode;
  plans: PricingPlan[];
  /** Required by D6-8: "VAT included", "Prices exclude 20% VAT". */
  taxNote?: React.ReactNode;
  /** Terms under the table (cancellation, payment). */
  footnote?: React.ReactNode | RichDoc;
  labels?: Site2BlockLabels;
}

/**
 * Plan pricing for SaaS subscriptions, agency packages and retainers. Money through `Intl` per
 * locale and currency, a period suffix, a mandatory tax note. Server component; the
 * monthly/yearly switch is plain radios (works without JS).
 *
 * ```tsx
 * <PricingTable billing="both" yearlySaving="2 months free" taxNote="Prices exclude VAT."
 *   plans={[{ name: "Studio", price: { monthly: { amount: "49", currency: "USD" }, yearly: { amount: "490", currency: "USD" } }, … }]} />
 * ```
 */
export function PricingTable({
  variant = "columns",
  eyebrow,
  title,
  lead,
  billing = "monthly",
  defaultPeriod = "monthly",
  yearlySaving,
  plans,
  taxNote,
  footnote,
  id,
  anchor,
  theme,
  headingLevel = 2,
  className,
  labels,
  locale = "en-US",
  components,
  editMode,
}: PricingTableProps) {
  const t = site2Text(labels, locale);
  const { base, headingId } = useBlockIds2(id, "pricing");
  const single = variant === "single" || plans.length === 1;
  const ctx: PlanCtx = { t, locale, billing, components, labels, editMode };
  // One primary per block: the highlighted plan, else the first plan asking for it.
  const primaryIndex = Math.max(0, plans.findIndex((p) => p.highlight) >= 0 ? plans.findIndex((p) => p.highlight) : plans.findIndex((p) => p.cta?.style === "primary"));

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={id} blockType="pricing" editMode={editMode} className={cn("vb-pricing", className)} data-billing={billing} data-variant={single ? "single" : variant}>
      <Container className="flex flex-col gap-12 @4xl:gap-16">
        {title || eyebrow || lead || billing === "both" ? (
          <div className="flex flex-col gap-8 @4xl:flex-row @4xl:items-end @4xl:justify-between">
            <SectionHeader eyebrow={eyebrow} title={title} lead={lead} headingId={headingId} headingLevel={headingLevel} editMode={editMode} labels={labels} locale={locale} />
            {billing === "both" ? <BillingToggle name={`${base}-period`} defaultPeriod={defaultPeriod} saving={yearlySaving} t={t} /> : null}
          </div>
        ) : null}

        {single ? (
          <Reveal disabled={editMode}>
            <SinglePlan plan={plans[0]!} ctx={ctx} />
          </Reveal>
        ) : variant === "rows" ? (
          <Stagger asChild effect="fade" disabled={editMode}>
            <ol className="flex flex-col border-b border-line">
              {plans.map((plan, i) => (
                <PlanRow key={i} plan={plan} index={i} ctx={ctx} primary={i === primaryIndex} />
              ))}
            </ol>
          </Stagger>
        ) : (
          <Stagger asChild disabled={editMode}>
            <ul className="vb-plan-grid grid" data-cols={Math.min(plans.length, 4)}>
              {plans.map((plan, i) => (
                <PlanColumn key={i} plan={plan} index={i} ctx={ctx} primary={i === primaryIndex} />
              ))}
            </ul>
          </Stagger>
        )}

        {taxNote || footnote ? (
          <div className="flex flex-col gap-2 border-t border-line pt-5 text-small text-fg-muted @2xl:flex-row @2xl:items-start @2xl:justify-between @2xl:gap-10">
            {taxNote ? (
              <p className="shrink-0 font-mono text-eyebrow uppercase tracking-[0.08em]" {...fieldAttr(editMode, "taxNote")}>
                {taxNote}
              </p>
            ) : null}
            {footnote ? (
              <div className="max-w-(--measure) @2xl:text-end" {...fieldAttr(editMode, "footnote")}>
                {isRichDoc(footnote) ? <RichText doc={footnote} size="sm" components={components} labels={labels} locale={locale} /> : footnote}
              </div>
            ) : null}
          </div>
        ) : null}
      </Container>
    </Section>
  );
}

const isRichDoc = (v: unknown): v is RichDoc => !!v && typeof v === "object" && (v as RichDoc).type === "doc" && Array.isArray((v as RichDoc).content);

interface PlanCtx {
  t: Site2Text;
  locale: string;
  billing: PricingBilling;
  components?: BlockBaseProps["components"];
  labels?: Site2BlockLabels;
  editMode?: boolean;
}

function BillingToggle({ name, defaultPeriod, saving, t }: { name: string; defaultPeriod: "monthly" | "yearly"; saving?: React.ReactNode; t: Site2Text }) {
  return (
    <fieldset className="vb-period flex shrink-0 flex-col gap-2">
      <legend className="sr-only">{t("billingPeriod")}</legend>
      <div className="inline-flex w-fit rounded-ui border border-line p-1">
        {(["monthly", "yearly"] as const).map((p) => (
          <label key={p} className="vb-period-option group relative inline-flex h-10 cursor-pointer items-center gap-2 rounded-ui-sm px-4 text-sm font-medium text-fg-muted transition-colors hover:text-fg has-checked:text-scene has-checked:hover:text-scene">
            <input type="radio" name={name} value={p} defaultChecked={p === defaultPeriod} className="vb-period-input peer sr-only" />
            <span>{t(p)}</span>
            {p === "yearly" && saving ? <span className="font-mono text-eyebrow uppercase tracking-[0.06em] text-accent-ink group-has-checked:text-[color-mix(in_oklch,var(--scene)_80%,var(--accent))]">{saving}</span> : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function PriceBlock({ plan, ctx, size = "m" }: { plan: PricingPlan; ctx: PlanCtx; size?: "m" | "l" }) {
  const { t, locale, billing } = ctx;
  const numberClass = cn("font-display tabular tracking-[-0.02em] text-fg", size === "l" ? "text-display-l" : "text-display-m");
  if (!plan.price || (!plan.price.monthly && !plan.price.yearly && !plan.price.once)) {
    return plan.custom ? (
      <p className={numberClass} data-price="custom">
        {plan.custom}
      </p>
    ) : null;
  }
  const one = (money: MoneyValue, suffix: string, period?: "monthly" | "yearly") =>
    Number(money.amount) === 0 ? (
      // A zero price reads as "Free", without a period suffix.
      <p key={period ?? "once"} data-period={billing === "both" ? period : undefined} data-price="free" className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className={numberClass}>{t("priceFree")}</span>
      </p>
    ) : (
    <p key={period ?? "once"} data-period={billing === "both" ? period : undefined} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      {plan.price!.from ? <span className="text-small text-fg-muted">{t("priceFrom")}</span> : null}
      <span className={numberClass} aria-hidden>
        {formatMoney(money, locale)}
      </span>
      <span className="sr-only">
        {plan.price!.from ? `${t("priceFrom")} ` : ""}
        {formatMoneyLong(money, locale)} {suffix}
      </span>
      <span aria-hidden className="text-small text-fg-muted">
        {suffix}
      </span>
    </p>
    );
  const p = plan.price;
  if (billing === "once" || (!p.monthly && !p.yearly)) return p.once ? one(p.once, t("oneOff")) : null;
  if (billing === "yearly") return p.yearly ? one(p.yearly, t("perYear"), "yearly") : p.monthly ? one(p.monthly, t("perMonth"), "monthly") : null;
  if (billing === "monthly") return p.monthly ? one(p.monthly, t("perMonth"), "monthly") : p.yearly ? one(p.yearly, t("perYear"), "yearly") : null;
  return (
    <>
      {p.monthly ? one(p.monthly, t("perMonth"), "monthly") : null}
      {p.yearly ? one(p.yearly, t("perYear"), "yearly") : null}
    </>
  );
}

function FeatureList({ features, ctx, columns }: { features: PricingFeature[]; ctx: PlanCtx; columns?: boolean }) {
  if (!features.length) return null;
  return (
    <ul className={cn("flex flex-col gap-3 text-small", columns && "@2xl:grid @2xl:grid-cols-2 @2xl:gap-x-8")}>
      {features.map((f, i) => {
        const included = f.included !== false;
        return (
          <li key={i} className={cn("flex gap-3", !included && "text-fg-subtle")}>
            {included ? <Check aria-hidden strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-fg-muted" /> : <Minus aria-hidden strokeWidth={1.5} className="mt-0.5 size-4 shrink-0" />}
            <span className="flex flex-col gap-0.5">
              <span className={included ? "text-fg" : undefined}>
                {!included ? <span className="sr-only">{ctx.t("notIncluded")}: </span> : null}
                {f.text}
              </span>
              {f.note ? <span className="text-xs text-fg-muted">{f.note}</span> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function PlanCta({ plan, ctx, primary, index, block }: { plan: PricingPlan; ctx: PlanCtx; primary: boolean; index: number; block?: boolean }) {
  if (!plan.cta) return null;
  let style: CtaStyle = plan.cta.style ?? "secondary";
  if (style === "primary" && !primary) style = "secondary";
  if (primary && style !== "link") style = "primary";
  return (
    <BlockLink
      href={plan.cta.link.href}
      newTab={plan.cta.link.newTab}
      appearance={style}
      size="lg"
      components={ctx.components}
      labels={ctx.labels}
      locale={ctx.locale}
      editMode={ctx.editMode}
      field={`props.plans.${index}.cta`}
      data-track={`pricing:${index}`}
      className={cn(block && style !== "link" && "w-full")}
    >
      {plan.cta.link.label}
    </BlockLink>
  );
}

function PlanColumn({ plan, index, ctx, primary }: { plan: PricingPlan; index: number; ctx: PlanCtx; primary: boolean }) {
  return (
    <li data-highlight={plan.highlight ? "" : undefined} className="vb-plan relative flex flex-col gap-7">
      {plan.highlight ? <span aria-hidden className="vb-plan-rule absolute -top-px end-0 h-0.5 bg-accent" /> : null}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-h3 font-semibold tracking-[-0.012em] text-fg" {...fieldAttr(ctx.editMode, `plans.${index}.name`)}>
            {plan.name}
          </h3>
          {plan.highlight ? <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-eyebrow uppercase tracking-[0.06em] text-accent-ink">{plan.highlight}</span> : null}
        </div>
        {plan.description ? <p className="max-w-[34ch] text-small text-fg-muted text-pretty">{plan.description}</p> : null}
      </div>
      <PriceBlock plan={plan} ctx={ctx} />
      <PlanCta plan={plan} ctx={ctx} primary={primary} index={index} block />
      {plan.features?.length ? (
        <div className="border-t border-line pt-6">
          <FeatureList features={plan.features} ctx={ctx} />
        </div>
      ) : null}
    </li>
  );
}

function PlanRow({ plan, index, ctx, primary }: { plan: PricingPlan; index: number; ctx: PlanCtx; primary: boolean }) {
  const included = (plan.features ?? []).filter((f) => f.included !== false);
  return (
    <li data-highlight={plan.highlight ? "" : undefined} className={cn("relative grid gap-x-(--gutter) gap-y-5 border-t border-line py-8 @4xl:grid-cols-12 @4xl:items-start", plan.highlight && "before:absolute before:-top-px before:start-0 before:h-0.5 before:w-16 before:bg-accent")}>
      <div className="flex flex-col gap-2 @4xl:col-span-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <span aria-hidden className="font-mono text-eyebrow tabular text-fg-subtle">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-h3 font-semibold tracking-[-0.012em] text-fg">{plan.name}</h3>
          {plan.highlight ? <span className="font-mono text-eyebrow uppercase tracking-[0.06em] text-accent-ink">{plan.highlight}</span> : null}
        </div>
        {plan.description ? <p className="text-small text-fg-muted text-pretty">{plan.description}</p> : null}
      </div>
      <p className="text-small text-fg-muted text-pretty @4xl:col-span-5">
        {included.map((f, i) => (
          <React.Fragment key={i}>
            {i > 0 ? ", " : null}
            <span className="text-fg">{f.text}</span>
          </React.Fragment>
        ))}
      </p>
      <div className="flex flex-col items-start gap-4 @4xl:col-span-3 @4xl:items-end @4xl:text-end">
        <PriceBlock plan={plan} ctx={ctx} />
        <PlanCta plan={plan} ctx={ctx} primary={primary} index={index} />
      </div>
    </li>
  );
}

function SinglePlan({ plan, ctx }: { plan: PricingPlan; ctx: PlanCtx }) {
  const features = plan.features ?? [];
  const included = features.filter((f) => f.included !== false);
  const excluded = features.filter((f) => f.included === false);
  return (
    <div className="surface grid gap-x-(--gutter) gap-y-10 rounded-ui-lg p-6 @2xl:p-10 @4xl:grid-cols-12">
      <div className="flex flex-col gap-6 @4xl:col-span-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-h3 font-semibold tracking-[-0.012em] text-fg">{plan.name}</h3>
            {plan.highlight ? <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-eyebrow uppercase tracking-[0.06em] text-accent-ink">{plan.highlight}</span> : null}
          </div>
          {plan.description ? <p className="text-small text-fg-muted text-pretty">{plan.description}</p> : null}
        </div>
        <PriceBlock plan={plan} ctx={ctx} size="l" />
        <PlanCta plan={plan} ctx={ctx} primary index={0} />
      </div>
      <div className="flex flex-col gap-6 @4xl:col-span-7 @4xl:border-s @4xl:border-line @4xl:ps-(--gutter)">
        <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{ctx.t("included")}</p>
        <FeatureList features={included} ctx={ctx} columns />
        {excluded.length ? (
          <p className="border-t border-line pt-4 text-small text-fg-muted">
            <span className="font-medium text-fg">{ctx.t("notIncluded")}: </span>
            {excluded.map((f, i) => (
              <React.Fragment key={i}>
                {i > 0 ? ", " : null}
                {f.text}
              </React.Fragment>
            ))}
          </p>
        ) : null}
      </div>
    </div>
  );
}
