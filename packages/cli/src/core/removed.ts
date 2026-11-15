/**
 * Registry items that were removed on purpose, so `vamos-ui add <name>` can say what to do
 * instead of "not in the registry". The example websites (site-*) were replaced by recipes: the
 * plan from `vamos-ui new` picks one from the interview and lists the kit components per section.
 */

/** Removed example website → the recipe that carries what it showed (null: no recipe for that sector). */
export const REMOVED_SITES: Readonly<Record<string, string | null>> = {
  "site-accounting-01": "professional-firm",
  "site-agency-02": "agency",
  "site-ai-01": "software-product",
  "site-app-01": "mobile-app",
  "site-app-02": "mobile-app",
  "site-artist-01": "musician",
  "site-autoservice-01": "home-services",
  "site-blog-01": "publication",
  "site-blog-02": "publication",
  "site-careers-01": "careers",
  "site-changelog-01": "product-support",
  "site-clinic-01": null,
  "site-clinic-02": null,
  "site-club-01": "sports-club",
  "site-community-01": "community-forum",
  "site-construction-01": "contractor",
  "site-course-01": "online-course",
  "site-cv-01": "personal-cv",
  "site-department-01": "academic-department",
  "site-devtool-01": "developer-tool",
  "site-dietitian-01": null,
  "site-digital-01": "digital-products",
  "site-driving-01": "school",
  "site-estate-02": "real-estate",
  "site-event-01": "conference",
  "site-factory-01": "b2b-supplier",
  "site-florist-01": "local-shop",
  "site-game-01": "game",
  "site-help-01": "product-support",
  "site-law-01": "professional-firm",
  "site-market-01": "marketplace",
  "site-movers-01": "home-services",
  "site-newsletter-01": "newsletter-writer",
  "site-nonprofit-01": "nonprofit",
  "site-physio-01": null,
  "site-podcast-01": "podcast",
  "site-portfolio-01": "portfolio-studio",
  "site-portfolio-02": "portfolio-studio",
  "site-preschool-01": "school",
  "site-public-01": "public-office",
  "site-restaurant-01": null,
  "site-saas-02": "software-product",
  "site-spa-01": null,
  "site-status-01": "product-support",
  "site-store-02": "online-store",
  "site-studio-01": "portfolio-studio",
  "site-subbox-01": "subscription-box",
  "site-therapy-01": null,
  "site-venue-01": "venue",
  "site-vet-01": null,
  "site-waitlist-01": "launch-waitlist",
  "site-wedding-01": "wedding",
  "site-wholesale-01": "b2b-supplier",
};

/** The hint for a removed item, or null when the name was never removed. */
export function removedItemHint(name: string): { message: string; hint: string } | null {
  if (!(name in REMOVED_SITES)) return null;
  const recipe = REMOVED_SITES[name];
  return {
    message: `"${name}" was an example website and has been removed from the registry.`,
    hint: recipe
      ? `Websites are now built from kit components following a recipe. Run \`npx vamos-ui new\`: the plan picks the "${recipe}" recipe for this kind of site and lists the components for every section (MCP: start_project).`
      : "Websites are now built from kit components. Run `npx vamos-ui new` (MCP: start_project) for a plan with the components for every page and section.",
  };
}
