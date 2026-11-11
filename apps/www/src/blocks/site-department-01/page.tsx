import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { DepartmentSite, departmentPages } from "./components/department-site";
import { DepartmentType } from "./components/department-type";

/**
 * University department, three pages: home (burgundy masthead with a drawn city plan and a
 * course search, admissions table, research groups, Wednesday seminars, faculty), programmes
 * (three degrees side by side, the course finder, how to apply) and the people directory.
 * Signature: the course finder — level, term, format and language filters, free-text search,
 * a free-seats switch, three sort orders and seat meters. Corporate serif (Lora + Source Sans 3),
 * burgundy accent, solid, comfortable.
 */
export default function SiteDepartment01() {
  return (
    <SiteShell accent="#7F1D1D" material="solid" density="comfortable" pages={departmentPages} className="min-h-dvh bg-scene">
      <DepartmentType>
        <SiteShellLocale code="en">
          <LocaleProvider locale="en-GB">
            <DepartmentSite locale="en" />
          </LocaleProvider>
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <LocaleProvider locale="tr-TR" messages={tr}>
            <DepartmentSite locale="tr" />
          </LocaleProvider>
        </SiteShellLocale>
      </DepartmentType>
    </SiteShell>
  );
}
