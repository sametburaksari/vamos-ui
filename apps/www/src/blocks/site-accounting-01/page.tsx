import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { AccountingSite, accountingPages } from "./components/accounting-site";
import { LedgerType } from "./components/ledger-type";

/**
 * Chartered accountants, three pages: home (ledger-ruled hero with a month's closing entries, the
 * year in figures as a ledger, services, a fee preview by company type, the monthly calendar,
 * partners, switching mid-year, reviews, FAQ), services (price list + the fee estimate) and
 * contact (enquiry form, office map and hours). Signature: the fee estimate by company type —
 * payroll, invoice volume and extras become a printed fee statement with VAT and year-end lines.
 * Corporate serif (Literata · Source Sans 3 · Plex Mono), navy, solid, comfortable.
 */
export default function SiteAccounting01() {
  return (
    <SiteShell accent="#1E3A8A" material="solid" density="comfortable" pages={accountingPages} className="min-h-dvh bg-scene">
      <LedgerType>
        <SiteShellLocale code="en">
          <AccountingSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <AccountingSite locale="tr" />
        </SiteShellLocale>
      </LedgerType>
    </SiteShell>
  );
}
