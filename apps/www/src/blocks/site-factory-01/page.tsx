import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { FactorySite, factoryPages } from "./components/factory-site";
import { FactoryType } from "./components/factory-type";

/**
 * Precision-machining plant, three pages: home (the hero as a drawing sheet with zone markers
 * and a title block, figures, four product families drawn in section, capabilities, industries,
 * drawing-to-series steps, an RFQ form and the plant), products (catalogue with spec tables,
 * metric / imperial switch and a datasheet download) and quality (a live SPC chart, quality gates,
 * certificates, FAQ). Signature: the spec table + datasheet download. Corporate-industrial:
 * Saira Condensed · Commissioner · JetBrains Mono, steel accent with signal orange, solid, compact.
 */
export default function SiteFactory01() {
  return (
    <SiteShell accent="#475569" motion="subtle" material="solid" density="compact" pages={factoryPages} className="min-h-dvh bg-scene">
      <FactoryType>
        <SiteShellLocale code="en">
          <FactorySite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <FactorySite locale="tr" />
        </SiteShellLocale>
      </FactoryType>
    </SiteShell>
  );
}
