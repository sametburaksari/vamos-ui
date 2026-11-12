import * as React from "react";
import { cn2 as cn } from "./shared/kit-2";
import { Section, Container } from "../section";
import { BlockImage } from "../block-image";
import { BlockLink } from "../block-link";
import { JsonLd, type JsonLdNode } from "../json-ld";
import type { BlockBaseProps } from "../types";
import type { AddressValue, SocialNetwork } from "../schema/types";
import { labelTemplates, site2Text, type Site2BlockLabels, type Site2Text } from "./shared/labels-2";
import { addressLines, fieldAttr, prettyPhone, telHref, useBlockIds2, type SiteImage2, type SiteLink2 } from "./shared/kit-2";
import { BrandIcon, BRAND_NAMES } from "./shared/brand-icons";
import { ConsentSettingsButton } from "./shared/consent-island";
import { ContactFormIsland } from "./shared/contact-form-island";
import { contactIslandLabelKeys } from "./shared/island-keys";
import type { SiteFormAction } from "./shared/site-form";
import { TAP } from "./shared/tap";

export type FooterVariant = "columns" | "wordmark" | "minimal";

export interface FooterProps extends Omit<BlockBaseProps, "variant" | "labels" | "headingLevel"> {
  /**
   * columns: brand, short text and contact at the start; up to four link columns at the end; one
   * legal line under a hairline. wordmark: details laid out across the top, the brand name at
   * container width at the very bottom. minimal: a single row for landing pages.
   */
  variant?: FooterVariant;
  brand: { name: string; /** An image logo renders 2rem tall (`sizes="12rem"`). */ logo?: React.ReactNode | SiteImage2; href?: string };
  /** ≤ 200 characters. */
  about?: React.ReactNode;
  columns?: { title: React.ReactNode; links: SiteLink2[] }[];
  contact?: { address?: AddressValue | string; phone?: string; email?: string };
  social?: { network: SocialNetwork; href: string }[];
  legalLinks?: SiteLink2[];
  /** Company details — legal name and registry numbers (tax office/number, MERSİS, trade registry). */
  company?: { legalName: string; registry?: { label: string; value: string }[] };
  /** "Site by …" credit. */
  credit?: SiteLink2;
  /** "Cookie settings" button that reopens the consent preferences. Default true. */
  cookieSettings?: boolean;
  /** Newsletter sign-up (email + button) through the app's action. */
  newsletter?: { action?: SiteFormAction | string; title?: React.ReactNode; hint?: React.ReactNode };
  /** © year. Default: the render year. */
  year?: number;
  /**
   * Organization JSON-LD built from brand, company, contact and social. Default true. Pass an
   * object to refine it (`{ "@type": "Dentist", url: "https://…" }`; a LocalBusiness subtype
   * suits a shop or clinic), or false when the page already emits its own.
   */
  jsonLd?: boolean | JsonLdNode;
  labels?: Site2BlockLabels;
}

/** `Organization` JSON-LD from the footer's details (absolute brand href becomes `url`). */
export function footerJsonLd(props: Pick<FooterProps, "brand" | "company" | "contact" | "social">): JsonLdNode {
  const { brand, company, contact, social = [] } = props;
  const address = contact?.address;
  return {
    "@type": "Organization",
    name: brand.name,
    ...(company?.legalName && company.legalName !== brand.name ? { legalName: company.legalName } : null),
    ...(brand.href && /^https?:\/\//.test(brand.href) ? { url: brand.href } : null),
    ...(contact?.phone ? { telephone: contact.phone } : null),
    ...(contact?.email ? { email: contact.email } : null),
    ...(address
      ? {
          address:
            typeof address === "string"
              ? address.replace(/\n/g, ", ")
              : { "@type": "PostalAddress", streetAddress: address.line, addressLocality: address.district ? `${address.district}, ${address.city}` : address.city, ...(address.region ? { addressRegion: address.region } : null), ...(address.postalCode ? { postalCode: address.postalCode } : null), addressCountry: address.country },
        }
      : null),
    ...(social.length ? { sameAs: social.map((s) => s.href) } : null),
  };
}

const isImage = (v: unknown): v is SiteImage2 => !!v && typeof v === "object" && "src" in (v as object) && !React.isValidElement(v);

/**
 * Site footer: navigation, contact, socials, legal links and the company details e-commerce law
 * requires in many countries. `footer` landmark with labelled inner navs; social links are named
 * by network; "Cookie settings" is a button. Server component.
 *
 * ```tsx
 * <Footer theme={{ mode: "dark" }} brand={{ name: "Vamos" }} columns={[{ title: "Studio", links: [{ href: "/work", label: "Work" }] }]}
 *   company={{ legalName: "Vamos Dijital Ajans Ltd. Şti.", registry: [{ label: "Tax no.", value: "923 145 6780" }] }} />
 * ```
 */
export function Footer({
  variant = "columns",
  brand,
  about,
  columns = [],
  contact,
  social = [],
  legalLinks = [],
  company,
  credit,
  cookieSettings = true,
  newsletter,
  year,
  jsonLd = true,
  id,
  anchor,
  theme,
  className,
  labels,
  locale = "en-US",
  components,
  editMode,
}: FooterProps) {
  const t = site2Text(labels, locale);
  const { base } = useBlockIds2(id, "footer");
  const y = String(year ?? new Date().getFullYear());
  const ctx: Ctx = { t, locale, components, labels, editMode };
  const copyright = t("copyright", { year: y, name: company?.legalName ?? brand.name });
  // The edit canvas skips it; the document renderer collects the definition's JSON-LD instead.
  const structured =
    jsonLd && !editMode ? <JsonLd data={{ ...footerJsonLd({ brand, company, contact, social }), ...(typeof jsonLd === "object" ? jsonLd : null) }} /> : null;

  const legalLine = (
    <div className="flex flex-col gap-3 text-small text-fg-muted @4xl:flex-row @4xl:items-center @4xl:justify-between @4xl:gap-8">
      <p>{copyright}</p>
      <nav aria-label={t("legal")}>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pointer-coarse:gap-y-0">
          {legalLinks.map((l, i) => (
            <li key={i}>
              <BlockLink href={l.href} newTab={l.newTab} components={components} labels={labels} locale={locale} className={cn(TAP, "rounded-[2px] text-fg-muted underline-offset-[0.25em] transition-colors hover:text-fg hover:underline focus-ring")}>
                {l.label}
              </BlockLink>
            </li>
          ))}
          {cookieSettings ? (
            <li>
              <ConsentSettingsButton className={cn(TAP, "text-fg-muted transition-colors hover:text-fg")}>{t("cookieSettings")}</ConsentSettingsButton>
            </li>
          ) : null}
          {credit ? (
            <li>
              <BlockLink href={credit.href} newTab={credit.newTab} components={components} labels={labels} locale={locale} className={cn(TAP, "rounded-[2px] text-fg-muted underline-offset-[0.25em] hover:text-fg hover:underline focus-ring")}>
                {t("madeBy", { name: typeof credit.label === "string" ? credit.label : "" })}
              </BlockLink>
            </li>
          ) : null}
        </ul>
      </nav>
    </div>
  );

  // The legal name already sits in the © line; the company row only earns its place with registry data.
  const companyLine = company?.registry?.length ? (
    <div className="flex flex-col gap-1.5 @4xl:flex-row @4xl:items-baseline @4xl:gap-6" {...fieldAttr(editMode, "company")}>
      <p className="text-small text-fg-muted">{company.legalName}</p>
      {company.registry?.length ? (
        <dl className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-eyebrow uppercase tracking-[0.06em] text-fg-muted">
          {company.registry.map((r, i) => (
            <div key={i} className="flex gap-2">
              <dt>{r.label}</dt>
              <dd className="tabular text-fg-muted">{r.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  ) : null;

  if (variant === "minimal") {
    return (
      <Section as="footer" theme={{ rhythm: "tight", ...theme }} anchor={anchor} blockId={id} blockType="footer" editMode={editMode} className={cn("vb-footer", className)} data-variant="minimal" aria-label={t("footer")}>
        {structured}
        <Container className="flex flex-col gap-6 @4xl:flex-row @4xl:items-center @4xl:justify-between">
          <BrandMark brand={brand} ctx={ctx} />
          {columns[0]?.links.length ? (
            <nav aria-label={t("footerNav")}>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-small">
                {columns.flatMap((c) => c.links).slice(0, 5).map((l, i) => (
                  <li key={i}>
                    <FooterLink link={l} ctx={ctx} />
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <SocialList social={social} ctx={ctx} />
            <p className="text-small text-fg-muted">{copyright}</p>
          </div>
        </Container>
      </Section>
    );
  }

  const linkColumns = columns.slice(0, 4).map((c, i) => (
    <nav key={i} aria-labelledby={`${base}-col-${i}`} className="flex flex-col gap-4">
      <p id={`${base}-col-${i}`} className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">
        {c.title}
      </p>
      <ul className="flex flex-col gap-2.5 pointer-coarse:gap-0">
        {c.links.slice(0, 8).map((l, j) => (
          <li key={j}>
            <FooterLink link={l} ctx={ctx} />
          </li>
        ))}
      </ul>
    </nav>
  ));

  const contactBlock = contact ? (
    <div className="flex flex-col gap-2 text-small text-fg-muted">
      {contact.address ? (
        <address className="not-italic">
          {(typeof contact.address === "string" ? contact.address.split("\n") : addressLines(contact.address, { locale })).map((l, i) => (
            <span key={i} className="block">
              {l}
            </span>
          ))}
        </address>
      ) : null}
      {contact.phone ? (
        <a href={telHref(contact.phone)} className={cn(TAP, "self-start text-fg tabular underline decoration-line underline-offset-[0.25em] hover:decoration-current focus-ring rounded-[2px]")} data-track="call">
          {prettyPhone(contact.phone)}
        </a>
      ) : null}
      {contact.email ? (
        <a href={`mailto:${contact.email}`} className={cn(TAP, "self-start text-fg underline decoration-line underline-offset-[0.25em] hover:decoration-current focus-ring rounded-[2px]")} data-track="email">
          {contact.email}
        </a>
      ) : null}
    </div>
  ) : null;

  const newsletterBlock = newsletter ? (
    <div className="flex flex-col gap-3">
      <p className="text-body font-medium text-fg">{newsletter.title ?? t("newsletter")}</p>
      <p className="text-small text-fg-muted">{newsletter.hint ?? t("newsletterHint")}</p>
      <ContactFormIsland
        action={newsletter.action}
        fields={[{ name: "email", required: true, label: t("emailAddress") }]}
        labels={{ ...labelTemplates(labels, contactIslandLabelKeys), send: t("subscribe"), sent: t("subscribed") }}
        locale={locale}
        layout="minimal"
        idBase={`${base}-nl`}
        className="vb-footer-newsletter"
      />
    </div>
  ) : null;

  if (variant === "wordmark") {
    return (
      <Section as="footer" theme={theme} anchor={anchor} blockId={id} blockType="footer" editMode={editMode} className={cn("vb-footer overflow-hidden pb-0!", className)} data-variant="wordmark" aria-label={t("footer")}>
        {structured}
        <Container className="flex flex-col gap-12">
          <div className="grid gap-x-(--gutter) gap-y-10 @2xl:grid-cols-2 @4xl:grid-cols-12">
            <div className="flex flex-col gap-5 @4xl:col-span-4">
              {about ? <p className="max-w-[40ch] text-fg-muted text-pretty">{about}</p> : null}
              {contactBlock}
              <SocialList social={social} ctx={ctx} />
            </div>
            <div className="grid grid-cols-2 gap-x-(--gutter) gap-y-10 @2xl:col-span-1 @4xl:col-span-8 @4xl:grid-cols-4">{linkColumns}</div>
          </div>
          {newsletterBlock ? <div className="max-w-xl">{newsletterBlock}</div> : null}
          <div className="flex flex-col gap-4 border-t border-line pt-6">
            {companyLine}
            {legalLine}
          </div>
        </Container>
        <p
          aria-hidden
          className="vb-wordmark select-none whitespace-nowrap px-(--gutter) font-display text-display-2xl leading-[0.78] text-fg"
          // Fill the width: a short name at the fixed display size reads as an accidental crop. The
          // size never goes above what fits, so a long name is not cut at the side; wide display
          // faces (Syne 800 and the like) set `--vb-wordmark-em` (average glyph width, default 0.58em).
          style={typeof brand.name === "string" ? { fontSize: `min(calc((100cqi - 2 * var(--gutter, 1.5rem)) / (${Math.max(4, [...brand.name].length)} * var(--vb-wordmark-em, 0.58))), 22rem)` } : undefined}
        >
          {brand.name}
        </p>
      </Section>
    );
  }

  return (
    <Section as="footer" theme={theme} anchor={anchor} blockId={id} blockType="footer" editMode={editMode} className={cn("vb-footer", className)} data-variant="columns" aria-label={t("footer")}>
      {structured}
      <Container className="flex flex-col gap-14">
        <div className="grid gap-x-(--gutter) gap-y-12 @4xl:grid-cols-12">
          <div className="flex flex-col gap-6 @4xl:col-span-4">
            <BrandMark brand={brand} ctx={ctx} />
            {about ? (
              <p className="max-w-[40ch] text-small text-fg-muted text-pretty" {...fieldAttr(editMode, "about")}>
                {about}
              </p>
            ) : null}
            {contactBlock}
            <SocialList social={social} ctx={ctx} />
          </div>
          <div className={cn("grid grid-cols-2 gap-x-(--gutter) gap-y-10 @4xl:col-span-7 @4xl:col-start-6", columns.length >= 3 && "@2xl:grid-cols-3", columns.length >= 4 && "@6xl:grid-cols-4")}>{linkColumns}</div>
        </div>
        {newsletterBlock ? <div className="max-w-xl border-t border-line pt-10">{newsletterBlock}</div> : null}
        <div className="flex flex-col gap-4 border-t border-line pt-6">
          {companyLine}
          {legalLine}
        </div>
      </Container>
    </Section>
  );
}

interface Ctx {
  t: Site2Text;
  locale: string;
  components?: BlockBaseProps["components"];
  labels?: Site2BlockLabels;
  editMode?: boolean;
}

function BrandMark({ brand, ctx }: { brand: FooterProps["brand"]; ctx: Ctx }) {
  const mark = isImage(brand.logo) ? (
    <BlockImage {...brand.logo} alt={brand.logo.alt ?? brand.name} fit="contain" sizes="12rem" className="h-8 w-auto bg-transparent" components={ctx.components} />
  ) : (
    (brand.logo ?? <span className="font-display text-display-m leading-none text-fg">{brand.name}</span>)
  );
  if (!brand.href) return <div className="self-start">{mark}</div>;
  return (
    <BlockLink href={brand.href} components={ctx.components} labels={ctx.labels} locale={ctx.locale} aria-label={brand.name} className="inline-flex min-h-6 items-center self-start rounded-[2px] focus-ring pointer-coarse:min-h-11">
      {mark}
    </BlockLink>
  );
}

function FooterLink({ link, ctx }: { link: SiteLink2; ctx: Ctx }) {
  return (
    <BlockLink href={link.href} newTab={link.newTab} components={ctx.components} labels={ctx.labels} locale={ctx.locale} className={cn(TAP, "rounded-[2px] text-small text-fg underline-offset-[0.25em] transition-colors hover:text-accent-ink hover:underline focus-ring")}>
      {link.label}
    </BlockLink>
  );
}

function SocialList({ social, ctx }: { social: FooterProps["social"]; ctx: Ctx }) {
  if (!social?.length) return null;
  return (
    <ul className="flex flex-wrap items-center gap-1 pointer-coarse:-ms-1" aria-label={ctx.t("social")}>
      {social.slice(0, 6).map((s, i) => (
        <li key={i}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${BRAND_NAMES[s.network]} ${ctx.t("opensInNewTab")}`}
            className="inline-flex size-10 items-center justify-center rounded-ui-sm text-fg-muted transition-colors hover:bg-hover hover:text-fg focus-ring pointer-coarse:size-11"
            data-track={`social:${s.network}`}
          >
            <BrandIcon name={s.network} className="size-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
