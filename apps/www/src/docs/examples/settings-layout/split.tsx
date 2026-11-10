import { Input, Select, SettingsLayout, SettingsRow, SettingsSection, Switch } from "@vamos-ui/react";

// HR leave policies: split sections put the title and description in a start column.
export default function SettingsLayoutSplit() {
  return (
    <SettingsLayout width="lg" className="w-full">
      <SettingsSection layout="split" title="Annual leave" description="Applies to full-time employees in Türkiye. Part-time allowances are pro-rated.">
        <SettingsRow label="Days per year" description="Before seniority bonuses.">
          <Input defaultValue="14" addonEnd="days" className="max-w-40" />
        </SettingsRow>
        <SettingsRow label="Accrual">
          <Select
            defaultValue="monthly"
            items={[
              { value: "monthly", label: "Monthly" },
              { value: "start", label: "All at the start of the year" },
            ]}
          />
        </SettingsRow>
        <SettingsRow label="Carry over unused days" description="Up to 5 days into the next year." layout="inline">
          <Switch defaultChecked />
        </SettingsRow>
      </SettingsSection>
      <SettingsSection layout="split" title="Sick leave" description="Requests over 2 days need a doctor's note." footer="Changes apply to requests created from tomorrow.">
        <SettingsRow label="Require approval" layout="inline">
          <Switch />
        </SettingsRow>
      </SettingsSection>
    </SettingsLayout>
  );
}
