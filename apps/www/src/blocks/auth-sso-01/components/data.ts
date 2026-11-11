// SSO directory lookup. Organisations come from the shared account fixtures; slugs are added
// here so people can also type their organisation ID.
import { ssoOrganisations } from "../../_shared/account";

export interface SsoOrg {
  domain: string;
  name: string;
  provider: "SAML 2.0" | "OpenID Connect";
  slug: string;
  /** Shown on the redirect step. */
  idpHost: string;
}

export const orgs: SsoOrg[] = ssoOrganisations.map((o) => {
  const slug = o.domain.split(".")[0]!;
  return { ...o, slug, idpHost: `login.${o.domain}` };
});

/** Domains people use for personal mail — never matched to an organisation. */
export const personalDomains = ["mail.example.net", "inbox.example.net"];

export const findByEmail = (email: string): SsoOrg | null => {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  if (!domain) return null;
  return orgs.find((o) => o.domain === domain || domain.endsWith(`.${o.domain}`)) ?? null;
};

export const findBySlug = (slug: string): SsoOrg | null => orgs.find((o) => o.slug === slug.trim().toLowerCase()) ?? null;

/** Organisations this browser signed in to before (would come from a cookie). */
export const recent = [orgs[0]!, orgs[2]!];
