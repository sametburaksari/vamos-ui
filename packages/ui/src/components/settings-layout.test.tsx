import * as React from "react";
import { screen } from "@testing-library/react";
import { Input } from "./input";
import { Switch } from "./switch";
import { SettingsLayout, SettingsNav, SettingsRow, SettingsSaveBar, SettingsSection } from "./settings-layout";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

function SiteSettings({ onSave = () => {}, readOnly = false, error }: { onSave?: () => void; readOnly?: boolean; error?: React.ReactNode }) {
  const [name, setName] = React.useState("Northwind Journal");
  const dirty = name !== "Northwind Journal";
  return (
    <SettingsLayout
      readOnly={readOnly}
      stickyTop={0}
      nav={
        <SettingsNav
          scrollSpy={false}
          items={[
            { id: "general", label: "General" },
            { id: "danger", label: "Danger zone", tone: "danger" },
          ]}
        />
      }
    >
      <SettingsSection id="general" title="General" description="Basic information about the site.">
        <SettingsRow label="Site name" description="Shown in the browser tab.">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </SettingsRow>
        <SettingsRow label="Maintenance mode" layout="inline">
          <Switch />
        </SettingsRow>
      </SettingsSection>
      <SettingsSection id="danger" tone="danger" title="Danger zone">
        <SettingsRow label="Delete site">
          <button type="button">Delete</button>
        </SettingsRow>
      </SettingsSection>
      <SettingsSaveBar dirty={dirty} error={error} onSave={onSave} onReset={() => setName("Northwind Journal")} />
    </SettingsLayout>
  );
}

describe("SettingsLayout", () => {
  it("wires rows to controls, labels sections and passes axe", async () => {
    renderWithProviders(<SiteSettings />);
    const input = screen.getByRole("textbox", { name: "Site name" });
    expect(input).toHaveAccessibleDescription("Shown in the browser tab.");
    expect(screen.getByRole("switch", { name: "Maintenance mode" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "General" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Settings sections" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "General" })).toHaveAttribute("aria-current", "true");
    await expectNoA11yViolations();
  });

  it("nav click jumps to the section and focuses its heading", async () => {
    const { user } = renderWithProviders(<SiteSettings />);
    await user.click(screen.getByRole("link", { name: "Danger zone" }));
    expect(screen.getByRole("link", { name: "Danger zone" })).toHaveAttribute("aria-current", "true");
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Danger zone" }));
  });

  it("save bar rises when dirty, saves with mod+s, and discards", async () => {
    const onSave = vi.fn();
    const { user } = renderWithProviders(<SiteSettings onSave={onSave} />);
    expect(screen.queryByRole("region", { name: "Unsaved changes" })).not.toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Site name" }), " Weekly");
    expect(screen.getByRole("region", { name: "Unsaved changes" })).toHaveTextContent("You have unsaved changes");
    await expectNoA11yViolations();
    await user.keyboard("{Control>}s{/Control}");
    expect(onSave).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Discard" }));
    expect(screen.queryByRole("region", { name: "Unsaved changes" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Site name" })).toHaveValue("Northwind Journal");
  });

  it("error state is an alert; read-only disables controls", () => {
    const { rerender } = renderWithProviders(<SiteSettings error />);
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't save your changes");
    rerender(<SiteSettings readOnly />);
    expect(screen.getByRole("textbox", { name: "Site name" })).toBeDisabled();
    expect(screen.getByRole("switch", { name: "Maintenance mode" })).toBeDisabled();
  });
});
