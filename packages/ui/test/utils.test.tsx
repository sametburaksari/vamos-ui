import { screen } from "@testing-library/react";
import { Button, Field, Input, useLocale } from "../src";
import { renderWithProviders, expectNoA11yViolations, keys, press, tabOrder, expectFocusRing } from "./utils";

function LocaleProbe() {
  const { locale, dir } = useLocale();
  return <output>{`${locale} ${dir}`}</output>;
}

describe("test utils", () => {
  it("wraps in LocaleProvider with the requested locale", () => {
    renderWithProviders(<LocaleProbe />, { locale: "tr-TR" });
    expect(screen.getByText("tr-TR ltr")).toBeInTheDocument();
  });

  it("applies theme axes", () => {
    const { container } = renderWithProviders(<span>x</span>, { theme: { dark: true, material: "glass" } });
    const scope = container.querySelector("[data-material]");
    expect(scope).toHaveAttribute("data-material", "glass");
  });

  it("keyboard helpers drive focus", async () => {
    const { user } = renderWithProviders(
      <>
        <Button>Cancel</Button>
        <Button>Save</Button>
      </>,
    );
    expect(await tabOrder(user, 2)).toEqual(["Cancel", "Save"]);
    expectFocusRing(screen.getByRole("button", { name: "Save" }));
    await press(user, keys.shiftTab);
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("expectNoA11yViolations passes on a labelled field", async () => {
    renderWithProviders(
      <Field label="Email">
        <Input type="email" />
      </Field>,
    );
    await expectNoA11yViolations();
  });
});
