import * as React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModeToggle, modeToggleScript } from "./mode-toggle";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

afterEach(() => {
  document.documentElement.classList.remove("dark");
  window.localStorage.clear();
});

describe("ModeToggle", () => {
  it("toggles the dark class on the document and remembers the choice", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = renderWithProviders(<ModeToggle storageKey="test:mode" onValueChange={onValueChange} />);
    const button = screen.getByRole("button", { name: "Dark mode" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem("test:mode")).toBe("dark");
    expect(onValueChange).toHaveBeenCalledWith("dark", "dark");
    await user.keyboard("{Enter}");
    expect(document.documentElement).not.toHaveClass("dark");
    await expectNoA11yViolations(container);
  });

  it("starts from the stored choice, or from what the target already shows", () => {
    window.localStorage.setItem("test:mode", "dark");
    const { unmount } = renderWithProviders(<ModeToggle storageKey="test:mode" />);
    expect(screen.getByRole("button", { name: "Dark mode" })).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveClass("dark");
    unmount();
    window.localStorage.clear();
    const el = document.createElement("div");
    el.classList.add("dark");
    renderWithProviders(<ModeToggle target={el} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("segmented: one radio-like option per mode, system follows the OS", async () => {
    const user = userEvent.setup();
    const el = document.createElement("div");
    renderWithProviders(<ModeToggle variant="segmented" modes={["light", "dark", "system"]} target={el} defaultValue="light" />);
    const group = screen.getByRole("radiogroup", { name: "Color theme" });
    expect(group).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Dark" }));
    expect(el).toHaveClass("dark");
    await user.click(screen.getByRole("radio", { name: "System" }));
    expect(el).not.toHaveClass("dark"); // the test matchMedia reports light
  });

  it("three modes on a button cycle and name the current mode; target null only reports", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithProviders(<ModeToggle modes={["light", "dark", "system"]} defaultValue="light" target={null} onValueChange={onValueChange} />);
    const button = screen.getByRole("button", { name: "Theme: Light" });
    expect(button).not.toHaveAttribute("aria-pressed");
    await user.click(button);
    expect(screen.getByRole("button", { name: "Theme: Dark" })).toBeInTheDocument();
    await user.click(button);
    expect(onValueChange).toHaveBeenLastCalledWith("system", "light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("controlled value wins, and the head script applies a stored mode", () => {
    renderWithProviders(<ModeToggle value="dark" target={null} showLabel />);
    expect(screen.getByRole("button", { name: "Dark mode" })).toHaveTextContent("Dark mode");
    window.localStorage.setItem("k", "dark");
    new Function(modeToggleScript("k"))();
    expect(document.documentElement).toHaveClass("dark");
  });
});
