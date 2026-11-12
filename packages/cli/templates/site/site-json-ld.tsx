// Written by `vamos-ui site essentials`. schema.org JSON-LD for the business (and FAQPage) from vamos.site.json. Edit freely; it is never overwritten.
import { SITE_URL, filled, site } from "./site";

type Node = Record<string, unknown>;

/** Drops empty strings, [fill-in] placeholders, empty lists and objects left with only "@type". */
function clean(value: unknown): unknown {
  if (typeof value === "string") return filled(value);
  if (Array.isArray(value)) {
    const items = value.map(clean).filter((v) => v !== undefined);
    return items.length ? items : undefined;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([k, v]) => [k, clean(v)] as const)
      .filter(([, v]) => v !== undefined);
    return entries.some(([k]) => k !== "@type") ? Object.fromEntries(entries) : undefined;
  }
  return value;
}

/** The business (its schema.org type from vamos.site.json) and, when ai.faq is set, an FAQPage. */
export function siteJsonLd(): Node {
  const a = site.address ?? {};
  const geo = typeof site.geo?.latitude === "number" && typeof site.geo?.longitude === "number" ? { "@type": "GeoCoordinates", latitude: site.geo.latitude, longitude: site.geo.longitude } : undefined;
  const services = (site.ai?.services ?? []).filter((s) => filled(s.name));
  const business = (clean({
    "@type": filled(site.type) ?? "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: SITE_URL,
    telephone: site.contact?.phone,
    email: site.contact?.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: filled(a.district) ?? a.city,
      addressRegion: filled(a.district) ? a.city : undefined,
      postalCode: a.postalCode,
      addressCountry: a.country,
    },
    geo,
    openingHours: site.openingHours,
    sameAs: site.social,
    taxID: site.legal?.taxNumber,
    hasOfferCatalog: services.length
      ? {
          "@type": "OfferCatalog",
          name: "Services",
          itemListElement: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, description: s.description } })),
        }
      : undefined,
  }) ?? {}) as Node;
  const graph: Node[] = [business];
  const faq = (site.ai?.faq ?? []).filter((q) => filled(q.question) && filled(q.answer));
  if (faq.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: faq.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

/** Safe inside <script>: no </script> break-out. */
const serialize = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

/** Render once inside <body> of the root layout. If the kit Footer is on the page too, pass it jsonLd={false}. */
export function SiteJsonLd() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(siteJsonLd()) }} />;
}
