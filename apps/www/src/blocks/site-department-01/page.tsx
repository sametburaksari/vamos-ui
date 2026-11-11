import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { DepartmentSite, departmentPages } from "./components/department-site";
import { DepartmentType } from "./components/department-type";
import { departmentMotion } from "./components/motion";

/**
 * University department, three pages: home (burgundy masthead with a drawn city plan and a
 * course search, admissions table, research groups, Wednesday seminars, faculty), programmes
 * (three degrees side by side, the course finder, how to apply) and the people directory.
 * Signature: the course finder — level, term, format and language filters, free-text search,
 * a free-seats switch, three sort orders and seat meters. Corporate serif (Lora + Source Sans 3),
 * burgundy accent, solid, comfortable.
 *
 * Motion (subtle — an institution, not a launch): the masthead rises in while the city plan is
 * surveyed on to the page line by line; the admissions table, research groups and seminars come in
 * one after another; places count up; links nudge their arrows; rows that a finder filter brings
 * in ease into place.
 */
export default function SiteDepartment01() {
  return (
    <SiteShell accent="#7F1D1D" material="solid" density="comfortable" motion="subtle" pages={departmentPages} className="min-h-dvh bg-scene">
      <style>{departmentMotion}</style>
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
