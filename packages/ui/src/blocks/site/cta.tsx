import * as React from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "../../lib/cn";
import { Container, Section } from "../section";
import { BlockHeading } from "../block-heading";
import { BlockImage } from "../block-image";
import { BlockLink } from "../block-link";
import { RichText } from "../rich-text";
import type { BlockBaseProps } from "../types";
import type { RichDoc } from "../schema/rich-doc";
import { CtaBooking, type BookingField, type BookingWeekday } from "./cta-booking";
import { EmbedFacade } from "./embed-facade";
import { formatSitePhone } from "./navbar";
import { ArrowEnd, CtaList, field, siteTemplate, siteText, useBlockIds, type SiteBlockLabels, type SiteCta, type SiteImage } from "./_kit-1";
import { Reveal } from "../../motion/reveal";
import { headingLines } from "./shared/heading-lines";
import { columnSizes, SITE_SIZES } from "./shared/image-sizes";

export type CtaVariant = "band" | "split" | "minimal" | "newsletter" | "booking";

/** `https://wa.me/<digits>?text=<encoded>` from an E.164 number. */
export function waLink(e164: string, text?: string): string {
  const base = `https://wa.me/${e164.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export interface CtaBookingConfig {
  /** whatsapp: prefilled message · url: GET the fields to a booking page · phone: a call button · embed: calendar facade. */
  provider: "whatsapp" | "url" | "phone" | "embed";
  /** E.164 for whatsapp / phone. */
  whatsapp?: string;
  phone?: string;
  /** url: booking page; embed: Calendly (or other allowed) URL. */
  url?: string;
  fields?: BookingField[];
  services?: string[];
  times?: string[];
  maxGuests?: number;
  closedDays?: BookingWeekday[];
  timeZone?: string;
  /** "Hi, I'd like a table for {guests} on {date} at {time}." */
  messageTemplate?: string;
  /** embed: preview image shown before the calendar loads. `sizes`: `min(100vw, 76rem)`. */
  preview?: SiteImage;
}

export interface CtaProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * band: a full-width accent band; big title at the start, actions at the end, phone line below.
   * split: title + action on the start side, a cropped photo on the end side.
   * minimal: no background; a very large centred title and one huge underlined text link.
   * newsletter: title + text at the start, email field + button at the end, consent below.
   * booking: a thin bar — date · time · guests/service — ending with "Ask for availability".
   */
  variant?: CtaVariant;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** ≤ 2; one primary. In `minimal` only the first is used, as a large text link. */
  actions?: SiteCta[];
  /** split: the photo. `sizes`: `(min-width: 56rem) min(42vw, 32rem), 100vw`. */
  media?: SiteImage;
  /** band/split: mono contact line ("0216 000 00 00 · WhatsApp"). */
  contact?: { phone?: string; whatsapp?: string; whatsappText?: string };
  newsletter?: {
    /** Form action: a URL or a server action. */
    action?: string | ((formData: FormData) => void | Promise<void>);
    placeholder?: string;
    buttonLabel?: string;
    /** Consent text under the field (the app's legal copy). */
    consent?: RichDoc | string;
    /** Rendered result after a submit (the app passes it back). */
    status?: "idle" | "success" | "error";
    message?: React.ReactNode;
  };
  booking?: CtaBookingConfig;
  /** Small print under the block ("No card needed. Cancel any time."). */
  fineprint?: React.ReactNode;
  labels?: SiteBlockLabels;
}

/**
 * End-of-page call to action, newsletter signup or booking entry point. Server component;
 * newsletter is a plain form (works without JS), booking a small island, embeds a facade.
 *
 * ```tsx
 * <Cta title="Book the *long table*" actions={[{ link: { href: "/book", label: "Book a table" }, style: "primary" }]} contact={{ phone: "+902160000000" }} />
 * ```
 */
export function Cta(props: CtaProps) {
  const { variant = "band", id, theme, anchor, className, editMode, components, labels } = props;
  const { base, headingId } = useBlockIds(id, "cta");
  const sectionTheme = variant === "band" ? { surface: "accent" as const, ...theme } : theme;
  const inner = { ...props, headingId };
  return (
    <Section
      theme={sectionTheme}
      anchor={anchor}
      headingId={headingId}
      blockId={base}
      blockType="cta"
      editMode={editMode}
      components={components}
      labels={labels}
      data-variant={variant}
      className={cn("vb-cta", className)}
    >
      <Reveal disabled={editMode}>
        {variant === "split" ? <Split {...inner} /> : variant === "minimal" ? <Minimal {...inner} /> : variant === "newsletter" ? <Newsletter {...inner} /> : variant === "booking" ? <Booking {...inner} /> : <Band {...inner} />}
      </Reveal>
    </Section>
  );
}

type Inner = CtaProps & { headingId: string };

function Heading({ p, size = "display-l", className }: { p: Inner; size?: "display-l" | "display-m" | "h3"; className?: string }) {
  return <BlockHeading id={p.headingId} level={p.headingLevel ?? 2} size={size} text={headingLines(p.title)} editMode={p.editMode} field="props.title" labels={p.labels} locale={p.locale} className={className} />;
}

function Eyebrow({ p, className }: { p: Inner; className?: string }) {
  if (!p.eyebrow) return null;
  return (
    <p className={cn("font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted", className)} {...field(p.editMode, "eyebrow")}>
      {p.eyebrow}
    </p>
  );
}

function Lead({ p, className }: { p: Inner; className?: string }) {
  if (!p.lead) return null;
  return (
    <p className={cn("vb-lead max-w-[52ch] text-lead text-fg-muted", className)} {...field(p.editMode, "lead")}>
      {p.lead}
    </p>
  );
}

function Fineprint({ p, className }: { p: Inner; className?: string }) {
  if (!p.fineprint) return null;
  return (
    <p className={cn("text-small text-fg-subtle", className)} {...field(p.editMode, "fineprint")}>
      {p.fineprint}
    </p>
  );
}

function ContactLine({ p, className }: { p: Inner; className?: string }) {
  const c = p.contact;
  if (!c?.phone && !c?.whatsapp) return null;
  const t = siteText(p.labels, p.locale);
  const linkCls = "inline-flex min-h-6 items-center pointer-coarse:min-h-11 rounded-[2px] underline decoration-current/30 underline-offset-4 transition-[text-decoration-color] hover:decoration-current focus-ring";
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-small tabular text-fg-muted", className)} {...field(p.editMode, "contact")}>
      {c.phone ? (
        <a href={`tel:${c.phone}`} data-track="call" className={linkCls}>
          {formatSitePhone(c.phone, p.locale)}
        </a>
      ) : null}
      {c.phone && c.whatsapp ? <span aria-hidden>·</span> : null}
      {c.whatsapp ? (
        <a href={waLink(c.whatsapp, c.whatsappText)} target="_blank" rel="noopener noreferrer" data-track="whatsapp" className={linkCls}>
          WhatsApp<span className="sr-only"> {t("opensWhatsApp")}</span>
        </a>
      ) : null}
    </p>
  );
}

const actionsOf = (p: Inner, extra?: Partial<React.ComponentProps<typeof CtaList>>) => <CtaList actions={p.actions} components={p.components} labels={p.labels} locale={p.locale} editMode={p.editMode} {...extra} />;

/* band ------------------------------------------------------------------ */

function Band(p: Inner) {
  return (
    <Container className="grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12 @4xl:items-end">
      <div className="flex flex-col gap-6 @4xl:col-span-8">
        <Eyebrow p={p} />
        <Heading p={p} className="max-w-[16ch]" />
        <Lead p={p} />
      </div>
      <div className="flex flex-col gap-5 @4xl:col-span-4 @4xl:items-end">
        {actionsOf(p, { size: "xl", className: "@4xl:justify-end" })}
        <ContactLine p={p} />
      </div>
      <Fineprint p={p} className="@4xl:col-span-12" />
    </Container>
  );
}

/* split ----------------------------------------------------------------- */

function Split(p: Inner) {
  return (
    <Container className="grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12 @4xl:items-stretch">
      <div className="flex flex-col justify-between gap-10 @4xl:col-span-6 @4xl:py-4">
        <div className="flex flex-col gap-6">
          <Eyebrow p={p} />
          <Heading p={p} />
          <Lead p={p} />
        </div>
        <div className="flex flex-col gap-5">
          {actionsOf(p)}
          <ContactLine p={p} />
          <Fineprint p={p} />
        </div>
      </div>
      {p.media ? (
        <div className="@4xl:col-span-5 @4xl:col-start-8">
          <BlockImage {...p.media} aspect="4:5" sizes={columnSizes(5 / 12)} className="h-full rounded-ui" components={p.components} labels={p.labels} editMode={p.editMode} field="props.media" />
        </div>
      ) : null}
    </Container>
  );
}

/* minimal --------------------------------------------------------------- */

function Minimal(p: Inner) {
  const a = p.actions?.[0];
  return (
    <Container className="flex flex-col items-center gap-10 text-center">
      <Eyebrow p={p} />
      <Heading p={p} className="max-w-[18ch]" />
      <Lead p={p} className="mx-auto" />
      {a ? (
        <BlockLink
          href={a.link.href}
          newTab={a.link.newTab}
          components={p.components}
          labels={p.labels}
          locale={p.locale}
          editMode={p.editMode}
          field="props.actions.0"
          className="vb-cta-biglink group/big inline-flex items-center gap-[0.35em] rounded-[2px] font-display text-display-m text-fg underline decoration-1 decoration-accent underline-offset-[0.18em] transition-[text-decoration-thickness] hover:decoration-2 focus-ring"
        >
          {a.link.label}
          <ArrowEnd className="size-[0.8em] group-hover/big:translate-x-1 rtl:group-hover/big:-translate-x-1" />
        </BlockLink>
      ) : null}
      <ContactLine p={p} className="justify-center" />
      <Fineprint p={p} />
    </Container>
  );
}

/* newsletter ------------------------------------------------------------ */

function Newsletter(p: Inner) {
  const t = siteText(p.labels, p.locale);
  const n = p.newsletter ?? {};
  const { base } = useBlockIds(p.id, "newsletter");
  const inputId = `${base}-email`;
  const statusId = `${base}-status`;
  const consentId = `${base}-consent`;
  return (
    <Container className="grid gap-x-(--gutter) gap-y-8 @4xl:grid-cols-12 @4xl:items-end">
      <div className="flex flex-col gap-5 @4xl:col-span-6">
        <Eyebrow p={p} />
        <Heading p={p} size="display-m" />
        <Lead p={p} />
      </div>
      <div className="flex flex-col gap-3 @4xl:col-span-5 @4xl:col-start-8">
        {n.status === "success" ? (
          <p id={statusId} role="status" className="border-s-2 border-accent ps-4 text-body text-fg">
            {n.message ?? t("subscribed")}
          </p>
        ) : (
          <form action={n.action} method="post" className="flex flex-col gap-3" {...field(p.editMode, "newsletter")}>
            <label htmlFor={inputId} className="sr-only">
              {t("emailLabel")}
            </label>
            <div className="flex flex-col gap-2 @2xl:flex-row">
              <input
                id={inputId}
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder={n.placeholder ?? t("emailPlaceholder")}
                aria-invalid={n.status === "error" ? true : undefined}
                aria-describedby={[n.status === "error" ? statusId : null, n.consent ? consentId : null].filter(Boolean).join(" ") || undefined}
                className="h-12 min-w-0 flex-1 rounded-ui border border-field-border bg-field px-4 text-body text-fg outline-none transition-colors placeholder:text-fg-subtle hover:border-field-border-hover focus-visible:border-ring focus-ring"
              />
              {/* Honeypot: real visitors never see or fill it. */}
              <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden className="sr-only" />
              <button type="submit" className="vb-action-primary inline-flex h-12 shrink-0 items-center justify-center rounded-ui bg-accent px-6 text-[15px] font-semibold text-accent-fg transition-[filter] hover:brightness-[1.04] focus-ring">
                {n.buttonLabel ?? t("subscribe")}
              </button>
            </div>
            {n.status === "error" ? (
              <p id={statusId} role="alert" className="text-small text-danger">
                {n.message ?? t("subscribeError")}
              </p>
            ) : null}
            {n.consent ? (
              <div id={consentId}>
                <RichText doc={n.consent} size="sm" components={p.components} labels={p.labels} locale={p.locale} className="text-fg-subtle [&_a]:text-fg-muted" />
              </div>
            ) : null}
          </form>
        )}
        <Fineprint p={p} />
      </div>
    </Container>
  );
}

/* booking --------------------------------------------------------------- */

function Booking(p: Inner) {
  const t = siteText(p.labels, p.locale);
  const b: CtaBookingConfig = p.booking ?? { provider: "phone" };
  const locale = p.locale ?? "en-US";
  let control: React.ReactNode;
  if (b.provider === "embed" && b.url) {
    control = (
      <div className="relative aspect-[16/10] overflow-hidden rounded-ui border border-line @4xl:aspect-[21/9]">
        <EmbedFacade kind="iframe" src={b.url} title={typeof p.title === "string" ? p.title.replace(/\*/g, "") : t("openCalendar")} buttonLabel={t("openCalendar")}>
          {b.preview ? <BlockImage {...b.preview} decorative aspect="21:9" sizes={SITE_SIZES.container} className="absolute inset-0 h-full opacity-60" components={p.components} /> : null}
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[color-mix(in_oklch,var(--scene)_55%,transparent)] text-center">
            <span className="inline-flex h-12 items-center gap-2.5 rounded-ui bg-fg px-6 text-[15px] font-semibold text-scene">
              <CalendarDays aria-hidden strokeWidth={1.5} className="size-[18px]" />
              {t("openCalendar")}
            </span>
            <span className="text-small text-fg-muted">{t("loadsCalendar", { provider: new URL(b.url).hostname.replace(/^www\./, "") })}</span>
          </span>
        </EmbedFacade>
      </div>
    );
  } else if (b.provider === "phone") {
    control = (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {b.phone ? (
          <BlockLink href={`tel:${b.phone}`} appearance="primary" components={p.components} labels={p.labels} data-track="call">
            {formatSitePhone(b.phone, locale)}
          </BlockLink>
        ) : null}
        {actionsOf(p, { forceStyle: "link" })}
      </div>
    );
  } else {
    const fields = b.fields?.length ? b.fields : (["date", "time", "guests"] as BookingField[]);
    const target = b.provider === "whatsapp" ? (b.whatsapp ?? "") : (b.url ?? "");
    control = (
      <CtaBooking
        provider={b.provider === "whatsapp" ? "whatsapp" : "url"}
        target={target}
        fields={fields}
        services={b.services}
        times={b.times}
        maxGuests={b.maxGuests}
        closedDays={b.closedDays}
        timeZone={b.timeZone}
        locale={locale}
        fallbackMessage={t("bookingFallback")}
        strings={{
          date: t("date"),
          time: t("time"),
          guests: t("guests"),
          service: t("service"),
          guestsCount: siteTemplate(p.labels, "guestsCount"),
          submit: t("askAvailability"),
          opensWhatsApp: t("opensWhatsApp"),
          closedOn: siteTemplate(p.labels, "closedOn"),
          message: b.messageTemplate ?? siteTemplate(p.labels, "bookingMessage"),
          messageService: b.messageTemplate ?? siteTemplate(p.labels, "bookingMessageService"),
        }}
      />
    );
  }
  return (
    <Container className="grid gap-x-(--gutter) gap-y-5 @4xl:grid-cols-12 @4xl:items-end">
      <div className="flex flex-col gap-2 @4xl:col-span-4">
        <Eyebrow p={p} />
        <Heading p={p} size="h3" />
        <Lead p={p} className="text-body" />
      </div>
      <div className="flex flex-col gap-3 @4xl:col-span-8">
        {control}
        <Fineprint p={p} />
      </div>
    </Container>
  );
}
