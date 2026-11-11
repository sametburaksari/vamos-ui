import * as React from "react";
import { cn2 as cn } from "./shared/kit-2";
import { Section, Container } from "../section";
import { SectionHeader } from "../section-header";
import { RichText } from "../rich-text";
import type { BlockBaseProps } from "../types";
import type { AddressValue, OpeningHours } from "../schema/types";
import type { RichDoc } from "../schema/rich-doc";
import { labelTemplates, site2Text, type Site2BlockLabels, type Site2Text } from "./shared/labels-2";
import { addressLines, fieldAttr, prettyPhone, telHref, useBlockIds2 } from "./shared/kit-2";
import { contactFieldLabel, type ContactFieldConfig, type SiteFormAction, type SiteFormState } from "./shared/site-form";
import { ContactFormIsland } from "./shared/contact-form-island";
import { contactIslandLabelKeys } from "./shared/island-keys";
import { summarizeHours } from "./shared/opening-hours";

export type ContactFormVariant = "split" | "stacked" | "minimal";

export interface ContactInfo {
  address?: AddressValue | string;
  /** E.164 ("+902160000000"); shown large and used as the fallback on server errors. */
  phone?: string;
  email?: string;
  /** Opening hours (summarised "Mon–Fri 09:00–18:00") or a free text line. */
  hours?: OpeningHours | string;
}

export interface ContactFormProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * split: contact details as a typographic list beside the form. stacked: title + form in one
   * 42rem column. minimal: name, contact, message and the button in one row — under a CTA.
   */
  variant?: ContactFormVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  /** 2–8 fields. Default: name, email, message. */
  fields?: ContactFieldConfig[];
  /** The app's server action (`useActionState` signature), or a URL for a plain POST. */
  action?: SiteFormAction | string;
  submitLabel?: string;
  /** Replaces the form after success; focus moves to it. */
  successMessage?: React.ReactNode | RichDoc;
  /** Privacy notice (KVKK requires a linked notice). */
  privacyLink?: { href: string; label?: string };
  /** A required, never pre-checked "I have read the notice" checkbox. */
  privacyCheckbox?: boolean;
  /** A separate, optional marketing consent checkbox. */
  marketingConsent?: boolean;
  /** Contact details column (`split`). Default true when `info` is given. */
  showInfo?: boolean;
  info?: ContactInfo;
  /** Render a given state (docs, tests, a server-rendered result). */
  initialState?: SiteFormState;
  labels?: Site2BlockLabels;
}

const DEFAULT_FIELDS: ContactFieldConfig[] = [
  { name: "name", required: true },
  { name: "email", required: true },
  { name: "message", required: true },
];

const isRichDoc = (v: unknown): v is RichDoc => !!v && typeof v === "object" && (v as RichDoc).type === "doc";

/**
 * Contact and quote requests feeding whatever lead store the app uses. Server component around a
 * ~2 KB `useActionState` island: native constraints without JS, the same validation in the
 * browser and in the app's action (`validateContactForm`), honeypot + time trap, an error
 * summary linking to fields, KVKK/GDPR-correct consent boxes.
 *
 * ```tsx
 * <ContactForm variant="split" title="Tell us about the *project*" action={sendLead}
 *   fields={[{ name: "name", required: true }, { name: "email", required: true }, { name: "budget", options: ["< $5k", "$5–15k"] }, { name: "message", required: true }]}
 *   privacyLink={{ href: "/privacy" }} privacyCheckbox info={{ phone: "+902160000000", email: "hello@vamos.ist" }} />
 * ```
 */
export function ContactForm({
  variant = "split",
  eyebrow,
  title,
  lead,
  fields = DEFAULT_FIELDS,
  action,
  submitLabel,
  successMessage,
  privacyLink,
  privacyCheckbox,
  marketingConsent,
  showInfo,
  info,
  initialState,
  id,
  anchor,
  theme,
  headingLevel = 2,
  className,
  labels,
  locale = "en-US",
  components,
  editMode,
}: ContactFormProps) {
  const t = site2Text(labels, locale);
  const { base, headingId } = useBlockIds2(id, "contact");
  const resolved = fields.slice(0, 8).map((f) => ({ ...f, label: contactFieldLabel(f, labels) }));
  const minimal = variant === "minimal";
  const islandFields = minimal ? resolved.filter((f) => f.name === "name" || f.name === "email" || f.name === "phone" || f.name === "message").slice(0, 3) : resolved;
  const split = variant === "split" && (showInfo ?? !!info) && info;

  const form = (
    <ContactFormIsland
      action={action}
      fields={islandFields}
      labels={labelTemplates(labels, contactIslandLabelKeys)}
      locale={locale}
      layout={variant}
      submitLabel={submitLabel}
      successMessage={isRichDoc(successMessage) ? <RichText doc={successMessage} components={components} labels={labels} locale={locale} /> : successMessage}
      privacy={privacyLink ? { href: privacyLink.href, label: privacyLink.label, checkbox: privacyCheckbox } : undefined}
      marketingConsent={marketingConsent}
      fallbackPhone={info?.phone ? { href: telHref(info.phone), label: prettyPhone(info.phone) } : undefined}
      initialState={initialState}
      idBase={base}
    />
  );
  const header = title || eyebrow || lead ? <SectionHeader eyebrow={eyebrow} title={title} lead={lead} headingId={headingId} headingLevel={headingLevel} size={minimal ? "m" : "m"} editMode={editMode} labels={labels} locale={locale} /> : null;

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={id} blockType="contact-form" editMode={editMode} className={cn("vb-contact", className)} data-variant={variant}>
      {split ? (
        <Container className="grid gap-x-(--gutter) gap-y-14 @4xl:grid-cols-12">
          <div className="flex flex-col gap-10 @4xl:col-span-5">
            {header}
            <InfoList info={info!} t={t} locale={locale} editMode={editMode} />
          </div>
          <div className="@4xl:col-span-6 @4xl:col-start-7 @4xl:pt-2">{form}</div>
        </Container>
      ) : (
        <Container size={minimal ? "content" : "prose"} className={cn("flex flex-col", minimal ? "gap-8" : "gap-10")}>
          {header}
          {form}
        </Container>
      )}
    </Section>
  );
}

function InfoList({ info, t, locale, editMode }: { info: ContactInfo; t: Site2Text; locale: string; editMode?: boolean }) {
  const hours = typeof info.hours === "object" ? summarizeHours(info.hours, locale) : undefined;
  const linkClass = "inline-flex min-h-6 items-center text-fg underline decoration-line underline-offset-[0.25em] transition-colors hover:decoration-current focus-ring rounded-[2px]";
  return (
    <dl className="flex flex-col border-t border-line">
      {info.phone ? (
        <div className="flex flex-col gap-2 border-b border-line py-5">
          <dt className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{t("phone")}</dt>
          <dd {...fieldAttr(editMode, "info.phone")}>
            <a href={telHref(info.phone)} className="font-display text-display-m tabular text-fg transition-colors hover:text-accent-ink focus-ring rounded-[2px]" data-track="call">
              {prettyPhone(info.phone)}
            </a>
          </dd>
        </div>
      ) : null}
      {info.email ? (
        <div className="flex flex-col gap-2 border-b border-line py-5">
          <dt className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{t("email")}</dt>
          <dd>
            <a href={`mailto:${info.email}`} className={cn(linkClass, "text-lead")} data-track="email">
              {info.email}
            </a>
          </dd>
        </div>
      ) : null}
      {info.address ? (
        <div className="flex flex-col gap-2 border-b border-line py-5">
          <dt className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{t("address")}</dt>
          <dd className="not-italic text-fg">
            <address className="not-italic">
              {(typeof info.address === "string" ? info.address.split("\n") : addressLines(info.address, { locale })).map((l, i) => (
                <span key={i} className="block">
                  {l}
                </span>
              ))}
            </address>
          </dd>
        </div>
      ) : null}
      {info.hours ? (
        <div className="flex flex-col gap-2 border-b border-line py-5">
          <dt className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{t("hours")}</dt>
          <dd className="text-fg">
            {hours ? (
              <ul className="flex flex-col gap-1">
                {hours.map((h, i) => (
                  <li key={i} className="flex justify-between gap-6 tabular">
                    <span>{h.days}</span>
                    <span className={h.closed ? "text-fg-subtle" : undefined}>{h.closed ? t("closedDay") : h.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              info.hours as string
            )}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}
