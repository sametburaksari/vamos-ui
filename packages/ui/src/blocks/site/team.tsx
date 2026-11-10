import * as React from "react";
import { cn2 as cn } from "./shared/kit-2";
import { Section, Container } from "../section";
import { SectionHeader } from "../section-header";
import { BlockImage } from "../block-image";
import { BlockLink } from "../block-link";
import type { BlockBaseProps } from "../types";
import type { SocialNetwork } from "../schema/types";
import { site2Text, type Site2BlockLabels, type Site2Text } from "./shared/labels-2";
import { fieldAttr, textOf, useBlockIds2, type SiteImage2 } from "./shared/kit-2";
import { BRAND_NAMES } from "./shared/brand-icons";

export type TeamVariant = "portrait" | "list" | "feature";

export interface TeamMember {
  name: React.ReactNode;
  /** Honorific kept apart from the name ("Dr.", "Op. Dr.") — order differs per locale. */
  title?: React.ReactNode;
  role: React.ReactNode;
  /** Specialty line in `list` ("Deep tissue · Sports massage"). */
  specialty?: React.ReactNode;
  /** 4:5 portrait. No photo = an empty inset area, never initials. */
  photo?: SiteImage2;
  bio?: React.ReactNode;
  /** Up to 3 profile links, rendered as short text links ("LinkedIn"). */
  links?: { network: SocialNetwork; href: string }[];
}

export interface TeamProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * portrait: 3–4 columns of 4:5 portraits, name + mono role below. list: a typographic list
   * (name · role · specialty) with a portrait revealed on hover. feature: one founder or lead
   * specialist, large portrait beside a long bio, the name set like a signature.
   */
  variant?: TeamVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  members: TeamMember[];
  labels?: Site2BlockLabels;
}

/**
 * Team and specialist introduction — spa therapists, clinic doctors, an agency team. Card-less
 * by default (D6-1). Server component; the hover portrait in `list` is CSS only.
 *
 * ```tsx
 * <Team title="The people behind your *treatment*" members={[{ name: "Elif Aydın", role: "Lead therapist", photo }]} />
 * ```
 */
export function Team({ variant: variantProp = "portrait", eyebrow, title, lead, members, id, anchor, theme, headingLevel = 2, className, labels, locale = "en-US", components, editMode }: TeamProps) {
  const t = site2Text(labels, locale);
  const { headingId } = useBlockIds2(id, "team");
  const variant: TeamVariant = members.length === 1 ? "feature" : variantProp;
  const ctx: MemberCtx = { t, locale, components, labels, editMode };
  const header = title || eyebrow || lead ? <SectionHeader eyebrow={eyebrow} title={title} lead={lead} headingId={headingId} headingLevel={headingLevel} editMode={editMode} labels={labels} locale={locale} align={variant === "portrait" ? "split" : "start"} /> : null;

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={id} blockType="team" editMode={editMode} className={cn("vb-team", className)} data-variant={variant}>
      <Container className="flex flex-col gap-12 @4xl:gap-16">
        {variant === "feature" ? (
          <FeatureMember member={members[0]!} header={header} ctx={ctx} />
        ) : (
          <>
            {header}
            {variant === "list" ? (
              <ul className="vb-team-list flex flex-col border-b border-line">
                {members.map((m, i) => (
                  <ListMember key={i} member={m} index={i} ctx={ctx} />
                ))}
              </ul>
            ) : (
              <ul className={cn("grid grid-cols-2 gap-x-(--gutter) gap-y-12", members.length % 4 === 0 || members.length > 6 ? "@4xl:grid-cols-4" : "@4xl:grid-cols-3")}>
                {members.map((m, i) => (
                  <PortraitMember key={i} member={m} index={i} ctx={ctx} />
                ))}
              </ul>
            )}
          </>
        )}
      </Container>
    </Section>
  );
}

interface MemberCtx {
  t: Site2Text;
  locale: string;
  components?: BlockBaseProps["components"];
  labels?: Site2BlockLabels;
  editMode?: boolean;
}

function DisplayName({ member }: { member: TeamMember }) {
  return (
    <>
      {member.title ? (
        <>
          <span className="text-fg-muted">{member.title}</span>{" "}
        </>
      ) : null}
      {member.name}
    </>
  );
}

function ProfileLinks({ member, ctx, className }: { member: TeamMember; ctx: MemberCtx; className?: string }) {
  if (!member.links?.length) return null;
  const name = textOf(member.name);
  return (
    <span className={cn("flex flex-wrap gap-x-3 gap-y-1", className)}>
      {member.links.slice(0, 3).map((l, i) => (
        <BlockLink
          key={i}
          href={l.href}
          newTab
          components={ctx.components}
          labels={ctx.labels}
          locale={ctx.locale}
          aria-label={name ? ctx.t("profileOf", { name, network: BRAND_NAMES[l.network] }) : undefined}
          className="relative z-10 text-small text-fg-muted underline decoration-line underline-offset-[0.25em] transition-colors hover:text-fg hover:decoration-current focus-ring rounded-[2px]"
        >
          {BRAND_NAMES[l.network]}
        </BlockLink>
      ))}
    </span>
  );
}

function Portrait({ photo, ctx, className, sizes }: { photo?: SiteImage2; ctx: MemberCtx; className?: string; sizes?: string }) {
  if (!photo?.src) return <span aria-hidden className={cn("block aspect-[4/5] rounded-ui bg-surface-2", className)} />;
  return <BlockImage {...photo} alt={photo.alt ?? ""} decorative={!photo.alt} aspect="4:5" sizes={sizes} className={cn("rounded-ui", className)} components={ctx.components} />;
}

function PortraitMember({ member, index, ctx }: { member: TeamMember; index: number; ctx: MemberCtx }) {
  return (
    <li className="flex flex-col gap-4">
      <Portrait photo={member.photo} ctx={ctx} sizes="(min-width: 56rem) 25vw, 50vw" />
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-h3 font-semibold tracking-[-0.012em] text-fg" {...fieldAttr(ctx.editMode, `members.${index}.name`)}>
            <DisplayName member={member} />
          </h3>
          <ProfileLinks member={member} ctx={ctx} />
        </div>
        <p className="font-mono text-eyebrow uppercase tracking-[0.06em] text-fg-muted">{member.role}</p>
        {member.bio ? <p className="mt-2 text-small text-fg-muted text-pretty">{member.bio}</p> : null}
      </div>
    </li>
  );
}

function ListMember({ member, index, ctx }: { member: TeamMember; index: number; ctx: MemberCtx }) {
  return (
    <li className="vb-team-row group/row relative grid grid-cols-[3.5rem_1fr] items-center gap-x-4 gap-y-1 border-t border-line py-6 @2xl:grid-cols-12 @2xl:gap-x-(--gutter)">
      {/* Small portrait leads each row on narrow containers. */}
      <span className="row-span-2 @2xl:hidden">
        <Portrait photo={member.photo} ctx={ctx} className="w-14 rounded-ui-sm" sizes="56px" />
      </span>
      <h3 className="text-h3 font-semibold tracking-[-0.012em] text-fg @2xl:col-span-4" {...fieldAttr(ctx.editMode, `members.${index}.name`)}>
        <DisplayName member={member} />
      </h3>
      <p className="font-mono text-eyebrow uppercase tracking-[0.06em] text-fg-muted @2xl:col-span-3">{member.role}</p>
      <div className="col-start-2 flex flex-wrap items-baseline gap-x-6 gap-y-1 @2xl:col-span-5 @2xl:col-start-auto @2xl:justify-between">
        {member.specialty ? <p className="text-small text-fg-muted">{member.specialty}</p> : <span />}
        <ProfileLinks member={member} ctx={ctx} />
      </div>
      {/* Hover portrait (decorative; the name is text). */}
      {member.photo?.src ? (
        <span aria-hidden className="vb-team-hover pointer-events-none absolute end-[22%] top-1/2 z-10 hidden w-40 -translate-y-1/2 @4xl:block">
          <BlockImage {...member.photo} decorative aspect="4:5" sizes="160px" className="rounded-ui" components={ctx.components} />
        </span>
      ) : null}
    </li>
  );
}

function FeatureMember({ member, header, ctx }: { member: TeamMember; header: React.ReactNode; ctx: MemberCtx }) {
  return (
    <div className="grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12 @4xl:items-start">
      <div className="@4xl:col-span-5">
        <Portrait photo={member.photo} ctx={ctx} sizes="(min-width: 56rem) 40vw, 100vw" />
      </div>
      <div className="flex flex-col gap-8 @4xl:col-span-6 @4xl:col-start-7 @4xl:pt-6">
        {header}
        {member.bio ? <div className="text-lead text-fg-muted text-pretty [&_p+p]:mt-4">{typeof member.bio === "string" ? member.bio.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>) : member.bio}</div> : null}
        <div className="flex flex-col gap-2 border-t border-line pt-6">
          <p className="vb-signature font-display text-display-m italic text-fg" {...fieldAttr(ctx.editMode, "members.0.name")}>
            <DisplayName member={member} />
          </p>
          <p className="font-mono text-eyebrow uppercase tracking-[0.06em] text-fg-muted">{member.role}</p>
          <ProfileLinks member={member} ctx={ctx} className="mt-2" />
        </div>
      </div>
    </div>
  );
}
