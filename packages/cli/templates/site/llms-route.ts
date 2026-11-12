// Written by `vamos-ui site essentials`. /llms.txt (llmstxt.org) built from vamos.site.json and SITE_ROUTES. Edit freely; it is never overwritten.
import { LEGAL_ROUTES, SITE_ADDRESS, SITE_ROUTES, SITE_URL, filled, site } from "__SITE_IMPORT__";

export const dynamic = "force-static";

const link = (href: string) => (/^https?:\/\//.test(href) ? href : `${SITE_URL}${href === "/" ? "" : href}`);
const title = (route: string) =>
  route === "/" ? "Home" : decodeURIComponent(route.split("/").pop() ?? route).replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase());

/** The llms.txt text: name, summary, services, contact, opening hours, FAQ, key pages and legal pages. */
export function llmsTxt(): string {
  const out: string[] = [`# ${filled(site.name) ?? "[name]"}`, ""];
  const description = filled(site.description);
  if (description) out.push(`> ${description}`, "");
  const section = (heading: string, items: (string | undefined | false)[]) => {
    const lines = items.filter((x): x is string => !!x);
    if (lines.length) out.push(`## ${heading}`, "", ...lines.map((l) => `- ${l}`), "");
  };

  section(
    "Services",
    (site.ai?.services ?? [])
      .filter((s) => filled(s.name))
      .map((s) => {
        const name = filled(s.url) ? `[${s.name}](${link(s.url!)})` : s.name;
        return filled(s.description) ? `${name}: ${s.description}` : name;
      }),
  );
  const whatsapp = filled(site.contact?.whatsapp)?.replace(/\D/g, "");
  section("Contact", [
    filled(site.contact?.phone) && `Phone: ${site.contact?.phone}`,
    whatsapp && `WhatsApp: https://wa.me/${whatsapp}`,
    filled(site.contact?.email) && `Email: ${site.contact?.email}`,
    filled(SITE_ADDRESS) && `Address: ${SITE_ADDRESS}`,
    ...(site.social ?? []).filter((u) => filled(u)).map((u) => `Profile: ${u}`),
  ]);
  section("Opening hours", (site.openingHours ?? []).filter((h) => filled(h)));
  section(
    "FAQ",
    (site.ai?.faq ?? []).filter((q) => filled(q.question) && filled(q.answer)).map((q) => `${q.question} ${q.answer}`),
  );
  section("Pages", SITE_ROUTES.filter((r) => !LEGAL_ROUTES.includes(r)).map((r) => `[${title(r)}](${link(r)})`));
  section("Legal", LEGAL_ROUTES.map((r) => `[${title(r)}](${link(r)})`));
  return `${out.join("\n").trim()}\n`;
}

export function GET() {
  if (site.ai?.llmsTxt === false) return new Response("Not found", { status: 404 });
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
